import { chromium } from "playwright-core";
import { $ } from "bun";
import { COURS, MODULES, type Diapo, type Module } from "./cours";

const RACINE = new URL("..", import.meta.url).pathname.replace(
  /^\/([A-Za-z]:)/,
  "$1",
);
const SORTIE = `${RACINE}sortie`;
const FFMPEG =
  Bun.env.FFMPEG ??
  `${Bun.env.LOCALAPPDATA}/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe`;
const CHROME =
  Bun.env.CHROME ??
  `${Bun.env.LOCALAPPDATA}/ms-playwright/chromium-1248/chrome-win64/chrome.exe`;
const VOIX = Bun.env.VOIX ?? "Microsoft Hortense Desktop";
const COULEURS: Record<string, string> = {
  "00-introduction": "#7c9cff",
  "01-github": "#a3e635",
  "02-claude-code": "#f59e66",
  "03-ollama": "#e5e7eb",
  "04-n8n": "#ff6d8a",
  "05-projet-final": "#5eead4",
};

const echap = (s: string) =>
  s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

function html(m: Module, d: Diapo, n: number, total: number): string {
  const accent = COULEURS[m.id] ?? "#7c9cff";
  const corps = d.code
    ? `<pre>${echap(d.code)}</pre>`
    : `<ul>${(d.points ?? []).map((p) => `<li>${echap(p)}</li>`).join("")}</ul>`;
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0}
body{width:1920px;height:1080px;background:#0f1117;color:#f3f4f6;font-family:"Segoe UI",system-ui,sans-serif;
padding:110px 140px;display:flex;flex-direction:column;position:relative;overflow:hidden}
body::before{content:"";position:absolute;inset:0 auto 0 0;width:18px;background:${accent}}
.module{font-size:34px;letter-spacing:.08em;text-transform:uppercase;color:${accent};font-weight:600}
h1{font-size:${d.titre.length > 32 ? 76 : 92}px;line-height:1.1;margin:28px 0 56px;font-weight:700}
ul{list-style:none;display:flex;flex-direction:column;gap:34px}
li{font-size:46px;line-height:1.3;padding-left:56px;position:relative;color:#d1d5db}
li::before{content:"";position:absolute;left:0;top:22px;width:22px;height:22px;border-radius:6px;background:${accent}}
pre{font-family:"Cascadia Code",Consolas,monospace;font-size:${(d.code?.split("\n").length ?? 0) > 9 ? 32 : 40}px;
line-height:1.5;background:#1a1d27;border:2px solid #2a2f3d;border-radius:20px;padding:40px 56px;white-space:pre-wrap;color:#e5e7eb}
footer{position:absolute;left:140px;right:140px;bottom:60px;display:flex;justify-content:space-between;font-size:28px;color:#6b7280}
</style></head><body>
<div class="module">${echap(m.titre)}</div><h1>${echap(d.titre)}</h1>${corps}
<footer><span>${echap(COURS.titre)}</span><span>${n} / ${total}</span></footer>
<script>
const pre = document.querySelector("pre");
const limite = document.querySelector("footer").offsetTop - 40;
let taille = pre ? parseFloat(getComputedStyle(pre).fontSize) : 0;
while (pre && taille > 22 && pre.offsetTop + pre.offsetHeight > limite) pre.style.fontSize = (taille -= 2) + "px";
</script>
</body></html>`;
}

async function diapos() {
  const navigateur = await chromium.launch({ executablePath: CHROME });
  const page = await navigateur.newPage({
    viewport: { width: 1920, height: 1080 },
  });
  for (const m of MODULES) {
    for (const [i, d] of m.diapos.entries()) {
      await page.setContent(html(m, d, i + 1, m.diapos.length));
      await page.screenshot({ path: `${SORTIE}/${m.id}/${i}.png` });
    }
  }
  await navigateur.close();
}

async function narrations() {
  const taches = MODULES.flatMap((m) =>
    m.diapos.map((d, i) => ({
      texte: d.narration,
      wav: `${SORTIE}/${m.id}/${i}.wav`.replaceAll("/", "\\"),
    })),
  );
  const json = `${SORTIE}/narrations.json`;
  await Bun.write(json, JSON.stringify(taches));
  const script = `
Add-Type -AssemblyName System.Speech
$s = New-Object System.Speech.Synthesis.SpeechSynthesizer
$s.SelectVoice('${VOIX}')
$s.Rate = 0
foreach ($t in (Get-Content -Raw -Encoding utf8 '${json}' | ConvertFrom-Json)) {
  $s.SetOutputToWaveFile($t.wav)
  $s.Speak($t.texte)
}
$s.SetOutputToNull()`;
  await $`powershell -NoProfile -Command ${script}`;
}

async function videos() {
  const modules: string[] = [];
  for (const m of MODULES) {
    const dossier = `${SORTIE}/${m.id}`;
    const segments: string[] = [];
    for (const i of m.diapos.keys()) {
      const seg = `${dossier}/${i}.mp4`;
      await $`${FFMPEG} -y -hide_banner -loglevel error -loop 1 -framerate 30 -i ${dossier}/${i}.png -i ${dossier}/${i}.wav -af apad=pad_dur=1 -c:v libx264 -tune stillimage -preset veryfast -pix_fmt yuv420p -c:a aac -ar 48000 -ac 2 -b:a 160k -shortest ${seg}`;
      segments.push(seg);
    }
    const liste = `${dossier}/liste.txt`;
    await Bun.write(liste, segments.map((s) => `file '${s}'`).join("\n"));
    const video = `${SORTIE}/${m.id}.mp4`;
    await $`${FFMPEG} -y -hide_banner -loglevel error -f concat -safe 0 -i ${liste} -c copy -movflags +faststart ${video}`;
    modules.push(video);
  }
  await Bun.write(
    `${SORTIE}/liste.txt`,
    modules.map((s) => `file '${s}'`).join("\n"),
  );
  await $`${FFMPEG} -y -hide_banner -loglevel error -f concat -safe 0 -i ${SORTIE}/liste.txt -c copy -movflags +faststart ${SORTIE}/cours-complet.mp4`;
  return [...modules, `${SORTIE}/cours-complet.mp4`];
}

async function verifier(fichiers: string[]) {
  if (!Bun.Video.available) throw new Error("Bun.Video indisponible");
  const lignes: string[] = [];
  for (const f of fichiers) {
    const video = new Bun.Video(f);
    const meta = await video.metadata();
    await video
      .frame(2)
      .resize(640)
      .jpeg({ quality: 85 })
      .write(f.replace(/\.mp4$/, ".jpg"));
    lignes.push(`${f.split("/").pop()}\t${JSON.stringify(meta)}`);
  }
  await Bun.write(`${SORTIE}/metadonnees.tsv`, lignes.join("\n") + "\n");
  console.log(lignes.join("\n"));
}

function markdown(): string {
  const parties = [
    `# ${COURS.titre}\n\n${COURS.sousTitre}. Contenu vérifié le ${COURS.verifieLe}.\n`,
    "Vidéos : `bun run build` génère `sortie/<module>.mp4` et `sortie/cours-complet.mp4`.\n",
    "## Sommaire\n\n" +
      MODULES.map((m) => `- [${m.titre}](#${m.id})`).join("\n") +
      "\n",
  ];
  for (const m of MODULES) {
    parties.push(
      `<a id="${m.id}"></a>\n\n## ${m.titre}\n\n**Objectif :** ${m.objectif}\n`,
    );
    for (const d of m.diapos) {
      let s = `### ${d.titre}\n\n${d.narration}\n`;
      if (d.points) s += "\n" + d.points.map((p) => `- ${p}`).join("\n") + "\n";
      if (d.code) s += "\n```\n" + d.code + "\n```\n";
      parties.push(s);
    }
    parties.push(`**Exercice :** ${m.exercice}\n`);
  }
  return parties.join("\n");
}

await Bun.write(`${RACINE}COURS.md`, markdown());
if (!Bun.argv.includes("--texte")) {
  for (const m of MODULES) await $`mkdir -p ${SORTIE}/${m.id}`;
  await diapos();
  await narrations();
  await verifier(await videos());
}
