# cours-ia

Cours vidéo en français : Claude Code, Ollama, GitHub et n8n (6 modules, environ 13 minutes).

- Contenu : `src/cours.ts` ; texte complet : `COURS.md`.
- `bun run build` : diapos 1920×1080 (Chromium headless), narration (voix Windows `Microsoft Hortense Desktop`), MP4 H.264/AAC par module et `sortie/cours-complet.mp4` (FFmpeg), contrôle des métadonnées et vignettes avec `Bun.Video`.
- `bun run texte` : régénère seulement `COURS.md`.
- Variables : `FFMPEG`, `CHROME`, `VOIX`.
