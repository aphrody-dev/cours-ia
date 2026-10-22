export type Diapo = {
  titre: string;
  points?: string[];
  code?: string;
  narration: string;
};

export type Module = {
  id: string;
  titre: string;
  objectif: string;
  diapos: Diapo[];
  exercice: string;
};

export const COURS = {
  titre: "Automatiser son travail avec l'IA",
  sousTitre: "Claude Code, Ollama, GitHub et n8n",
  verifieLe: "2026-10-22",
};

export const MODULES: Module[] = [
  {
    id: "00-introduction",
    titre: "Introduction",
    objectif: "Comprendre le rôle de chaque outil et le projet final.",
    exercice:
      "Créer un compte GitHub et noter ce que vous voulez automatiser dans votre travail.",
    diapos: [
      {
        titre: "Automatiser son travail avec l'IA",
        points: ["Claude Code", "Ollama", "GitHub", "n8n"],
        narration:
          "Bienvenue dans ce cours. Nous allons apprendre à utiliser quatre outils qui se complètent : Claude Code, Ollama, GitHub et n8n. À la fin, vous aurez construit une chaîne d'automatisation complète.",
      },
      {
        titre: "Quatre outils, quatre rôles",
        points: [
          "Claude Code : un agent de code dans le terminal",
          "Ollama : des modèles d'IA en local, sur votre machine",
          "GitHub : héberger le code, collaborer, automatiser avec Actions",
          "n8n : relier des services par des workflows visuels",
        ],
        narration:
          "Chaque outil a un rôle précis. Claude Code lit et modifie votre code depuis le terminal. Ollama fait tourner des modèles d'intelligence artificielle directement sur votre ordinateur. GitHub héberge votre code et automatise vos tests. Et n8n relie des services entre eux grâce à des workflows visuels.",
      },
      {
        titre: "Le projet final",
        points: [
          "Une issue est ouverte sur GitHub",
          "n8n reçoit l'événement par webhook",
          "Ollama résume et classe l'issue en local",
          "n8n publie un commentaire, Claude Code corrige le code",
        ],
        narration:
          "Le fil rouge du cours est un assistant de dépôt. Quand quelqu'un ouvre une issue sur GitHub, n8n reçoit l'événement, demande à un modèle Ollama de la résumer et de la classer, puis publie un commentaire. Ensuite, Claude Code s'occupe de la correction dans le code.",
      },
      {
        titre: "Prérequis",
        points: [
          "Un ordinateur Windows, macOS ou Linux",
          "8 Go de RAM minimum, 16 Go conseillés pour Ollama",
          "Git installé, un compte GitHub",
          "Docker (conseillé pour n8n), un abonnement Claude ou une clé API",
        ],
        narration:
          "Côté matériel, prévoyez au moins huit gigaoctets de mémoire vive, seize si possible pour les modèles locaux. Il vous faut Git, un compte GitHub, Docker de préférence pour n8n, et un abonnement Claude ou une clé d'API Anthropic pour Claude Code.",
      },
    ],
  },
  {
    id: "01-github",
    titre: "GitHub et Git",
    objectif:
      "Versionner un projet, travailler en branches et ouvrir une pull request.",
    exercice:
      "Créer un dépôt cours-ia, y pousser un README, ouvrir une branche, modifier le README et fusionner la pull request avec gh.",
    diapos: [
      {
        titre: "Git et GitHub",
        points: [
          "Git : l'historique local de votre code",
          "GitHub : le dépôt distant partagé",
          "Commit : une photo de vos fichiers à un instant donné",
          "Branche : une ligne de travail isolée",
        ],
        narration:
          "Git enregistre l'historique de votre code sur votre machine. GitHub héberge une copie distante de cet historique pour la partager. Un commit est une photo de vos fichiers à un instant donné, et une branche est une ligne de travail isolée, qui ne casse pas la version principale.",
      },
      {
        titre: "Premier dépôt",
        code: `git init
git add README.md
git commit -m "Premier commit"
gh repo create cours-ia --private --source . --push`,
        narration:
          "Créez un dossier, puis initialisez Git avec git init. Ajoutez un fichier avec git add, enregistrez-le avec git commit. Enfin, la commande gh repo create crée le dépôt sur GitHub et y pousse votre code en une seule étape.",
      },
      {
        titre: "Branches et pull requests",
        code: `git switch -c correction-readme
# ... modifications ...
git commit -am "Corrige le README"
git push -u origin correction-readme
gh pr create --fill
gh pr merge --squash`,
        narration:
          "Pour chaque changement, créez une branche avec git switch tiret c. Faites vos commits, poussez la branche, puis ouvrez une pull request avec gh pr create. La pull request permet de relire le changement avant de le fusionner dans la branche principale.",
      },
      {
        titre: "Issues",
        points: [
          "Une issue décrit un bug ou une demande",
          "Labels : bug, amélioration, question",
          "Mentionner « Fixes #12 » dans une PR ferme l'issue à la fusion",
          "gh issue create, gh issue list",
        ],
        narration:
          "Les issues servent à décrire un bug ou une demande. On les classe avec des labels. Si une pull request contient la mention Fixes suivie du numéro de l'issue, celle-ci se ferme automatiquement lors de la fusion. Le projet final s'appuiera sur ces issues.",
      },
      {
        titre: "GitHub Actions",
        code: `# .github/workflows/tests.yml
name: tests
on: [push, pull_request]
jobs:
  tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - run: bun test`,
        narration:
          "GitHub Actions exécute des tâches automatiquement à chaque push ou pull request. Un workflow est un fichier YAML placé dans le dossier point github slash workflows. Ici, on récupère le code, on installe Bun, puis on lance les tests. Une pull request rouge signale un problème avant la fusion.",
      },
      {
        titre: "Secrets et webhooks",
        points: [
          "Settings → Secrets : stocker les clés d'API, jamais dans le code",
          "Settings → Webhooks : prévenir un service externe d'un événement",
          "Un token personnel (fine-grained) pour les outils comme n8n",
        ],
        narration:
          "Ne mettez jamais une clé d'API dans votre code. Rangez-la dans les secrets du dépôt. Les webhooks, eux, préviennent un service externe à chaque événement, par exemple l'ouverture d'une issue. Pour n8n, créez un token personnel à droits limités.",
      },
    ],
  },
  {
    id: "02-claude-code",
    titre: "Claude Code",
    objectif:
      "Installer Claude Code, le configurer pour un projet et lui déléguer des tâches.",
    exercice:
      "Dans votre dépôt cours-ia, lancer /init, demander à Claude Code d'écrire une fonction et ses tests, puis de créer la pull request.",
    diapos: [
      {
        titre: "Qu'est-ce que Claude Code ?",
        points: [
          "Un agent qui lit, modifie et exécute dans votre projet",
          "Disponible en terminal, IDE, application de bureau et web",
          "Il demande la permission avant d'agir, selon le mode choisi",
        ],
        narration:
          "Claude Code est un agent de code. Il lit vos fichiers, les modifie et lance des commandes dans votre projet. Il fonctionne dans le terminal, mais aussi dans votre éditeur, dans une application de bureau et sur le web. Par défaut, il demande votre permission avant chaque action sensible.",
      },
      {
        titre: "Installation",
        code: `# macOS, Linux, WSL
curl -fsSL https://claude.ai/install.sh | bash

# Windows PowerShell
irm https://claude.ai/install.ps1 | iex

cd mon-projet
claude`,
        narration:
          "L'installation tient en une commande, avec le script officiel pour macOS et Linux, ou son équivalent PowerShell sous Windows. Placez-vous ensuite dans votre projet et tapez claude. Au premier lancement, connectez-vous avec votre compte Claude ou une clé d'API.",
      },
      {
        titre: "Le fichier CLAUDE.md",
        points: [
          "/init génère un CLAUDE.md à partir du projet",
          "Commandes de build et de test, conventions, pièges",
          "Chargé automatiquement à chaque session",
          "Versionné avec le code, partagé avec l'équipe",
        ],
        narration:
          "La commande slash init analyse votre projet et génère un fichier CLAUDE point md. Ce fichier contient les commandes de build et de test, vos conventions et les pièges à éviter. Claude Code le lit à chaque session. Versionnez-le : toute l'équipe en profite.",
      },
      {
        titre: "Commandes essentielles",
        points: [
          "/help : l'aide · /model : choisir le modèle",
          "/clear : repartir de zéro · /compact : résumer le contexte",
          "Maj+Tab : changer de mode (plan, édition automatique…)",
          "Échap : interrompre · @fichier : citer un fichier",
        ],
        narration:
          "Quelques commandes à connaître. Slash help affiche l'aide, slash model change de modèle. Slash clear repart d'une conversation vide, slash compact résume la conversation pour libérer du contexte. Majuscule tabulation fait défiler les modes, dont le mode plan, qui propose un plan avant de toucher au code. Échap interrompt l'agent.",
      },
      {
        titre: "Bien formuler une demande",
        points: [
          "Donner l'objectif et le critère de réussite",
          "Citer les fichiers concernés avec @",
          "Demander de lancer les tests et de corriger",
          "Pour un gros changement : d'abord le mode plan",
        ],
        narration:
          "Une bonne demande donne l'objectif et le critère de réussite. Par exemple : ajoute la validation des e-mails dans le formulaire, avec des tests, et vérifie que tous les tests passent. Citez les fichiers avec arobase. Pour un gros changement, commencez par le mode plan et relisez le plan.",
      },
      {
        titre: "MCP : brancher des outils",
        code: `claude mcp add --transport http github https://api.githubcopilot.com/mcp/
claude mcp list`,
        narration:
          "Le protocole MCP permet de brancher des outils externes sur Claude Code : GitHub, une base de données, un navigateur. La commande claude mcp add ajoute un serveur, claude mcp list les affiche. Claude peut alors lire vos issues ou interroger vos données directement.",
      },
      {
        titre: "Aller plus loin",
        points: [
          "Hooks : lancer une commande avant ou après une action",
          "Sous-agents : .claude/agents/ pour des tâches spécialisées",
          "Skills et commandes slash personnalisées",
          'claude -p "…" : mode non interactif, pour les scripts et la CI',
        ],
        narration:
          "Pour aller plus loin : les hooks lancent une commande automatiquement, par exemple le formatage après chaque modification. Les sous-agents, définis dans le dossier point claude slash agents, traitent des tâches spécialisées. Et claude tiret p exécute une demande sans interface, idéal pour un script ou une intégration continue.",
      },
      {
        titre: "Claude Code sur GitHub",
        points: [
          "/install-github-app installe l'application et le workflow",
          "Mentionner @claude dans une issue ou une PR",
          "Claude ouvre une branche et propose une pull request",
        ],
        narration:
          "Claude Code s'intègre aussi à GitHub. La commande slash install-github-app installe l'application et le workflow GitHub Actions. Il suffit ensuite de mentionner arobase claude dans une issue ou une pull request pour qu'il travaille et propose une pull request.",
      },
    ],
  },
  {
    id: "03-ollama",
    titre: "Ollama",
    objectif: "Faire tourner un modèle en local et l'appeler par API.",
    exercice:
      "Télécharger un petit modèle, créer un Modelfile « résumeur d'issues » en français et l'appeler avec une requête HTTP.",
    diapos: [
      {
        titre: "Pourquoi un modèle local ?",
        points: [
          "Vos données ne quittent pas votre machine",
          "Aucun coût par requête",
          "Fonctionne hors ligne",
          "Moins puissant qu'un grand modèle hébergé : choisir la tâche",
        ],
        narration:
          "Un modèle local présente trois avantages : vos données restent chez vous, chaque requête est gratuite, et tout fonctionne hors ligne. En contrepartie, il est moins puissant qu'un grand modèle hébergé. On le réserve donc à des tâches ciblées, comme résumer ou classer un texte.",
      },
      {
        titre: "Installation et premier modèle",
        code: `# Windows / macOS : installeur sur ollama.com
# Linux
curl -fsSL https://ollama.com/install.sh | sh

ollama pull llama3.2
ollama run llama3.2 "Résume Git en une phrase"`,
        narration:
          "Téléchargez l'installeur sur ollama point com, ou utilisez le script sous Linux. La commande ollama pull télécharge un modèle, ollama run l'interroge directement. Commencez par un petit modèle de trois milliards de paramètres, qui tourne sur la plupart des ordinateurs.",
      },
      {
        titre: "Gérer ses modèles",
        points: [
          "ollama list : modèles téléchargés",
          "ollama ps : modèles chargés en mémoire",
          "ollama rm <modèle> : libérer de la place",
          "Choisir la taille selon la RAM ou la VRAM disponible",
        ],
        narration:
          "Ollama list affiche vos modèles, ollama ps ceux qui sont chargés en mémoire, et ollama rm supprime un modèle. Règle simple : la taille du modèle doit tenir dans votre mémoire vive, ou mieux, dans la mémoire de votre carte graphique.",
      },
      {
        titre: "L'API locale",
        code: `curl http://localhost:11434/api/chat -d '{
  "model": "llama3.2",
  "messages": [{"role": "user", "content": "Bonjour"}],
  "stream": false
}'`,
        narration:
          "Ollama expose une API sur le port onze mille quatre cent trente-quatre. Le point d'entrée api slash chat reçoit un modèle et une liste de messages, et renvoie la réponse. C'est cette API que n8n appellera. Ollama propose aussi une API compatible OpenAI sous slash v1.",
      },
      {
        titre: "Personnaliser avec un Modelfile",
        code: `FROM llama3.2
PARAMETER temperature 0.2
SYSTEM """Tu résumes des issues GitHub en français,
en trois lignes, puis tu proposes un label :
bug, amélioration ou question."""

# ollama create resumeur -f Modelfile`,
        narration:
          "Un Modelfile crée un modèle personnalisé à partir d'un modèle existant. On fixe une température basse pour des réponses stables, et un message système qui décrit la tâche. Ici, notre résumeur d'issues. La commande ollama create l'enregistre sous un nouveau nom.",
      },
      {
        titre: "Ollama et Claude Code",
        points: [
          "Les versions récentes d'Ollama exposent une API compatible Anthropic",
          "ANTHROPIC_BASE_URL=http://localhost:11434 pour viser Ollama",
          "Utile hors ligne ; qualité dépendante du modèle local",
        ],
        narration:
          "Les versions récentes d'Ollama exposent aussi une API compatible avec celle d'Anthropic. En pointant la variable ANTHROPIC BASE URL vers Ollama, on peut faire tourner Claude Code avec un modèle local. C'est pratique hors ligne, mais la qualité dépend fortement du modèle choisi.",
      },
    ],
  },
  {
    id: "04-n8n",
    titre: "n8n",
    objectif:
      "Construire des workflows qui relient GitHub, Ollama et d'autres services.",
    exercice:
      "Créer un workflow Webhook → Ollama → réponse, et le tester avec une requête HTTP.",
    diapos: [
      {
        titre: "Qu'est-ce que n8n ?",
        points: [
          "Un outil d'automatisation par workflows visuels",
          "Des centaines de nœuds : GitHub, Gmail, Slack, HTTP, bases…",
          "Auto-hébergeable, code source disponible",
          "Nœuds IA : agent, modèles, mémoire, outils",
        ],
        narration:
          "n8n est un outil d'automatisation. On y construit des workflows en reliant des nœuds : GitHub, la messagerie, une requête HTTP, une base de données. Vous pouvez l'héberger vous-même. Il propose aussi des nœuds d'intelligence artificielle, compatibles avec Ollama.",
      },
      {
        titre: "Lancer n8n",
        code: `docker volume create n8n_data
docker run -it --rm --name n8n -p 5678:5678 \\
  -v n8n_data:/home/node/.n8n \\
  docker.n8n.io/n8nio/n8n

# puis ouvrir http://localhost:5678`,
        narration:
          "Le plus simple est Docker. Créez un volume pour conserver vos données, puis lancez le conteneur officiel en exposant le port cinq mille six cent soixante-dix-huit. Ouvrez ensuite localhost deux points cinq mille six cent soixante-dix-huit dans votre navigateur et créez votre compte.",
      },
      {
        titre: "Anatomie d'un workflow",
        points: [
          "Déclencheur : Webhook, planification, événement d'une app",
          "Nœuds d'action : transformer, appeler, décider",
          "Les données circulent en JSON, élément par élément",
          "Expressions : {{ $json.issue.title }}",
        ],
        narration:
          "Un workflow commence par un déclencheur : un webhook, une planification ou un événement d'application. Suivent des nœuds d'action. Les données passent d'un nœud à l'autre en JSON. Pour réutiliser une valeur, on écrit une expression entre doubles accolades, par exemple le titre de l'issue.",
      },
      {
        titre: "Identifiants",
        points: [
          "Credentials : stockés chiffrés dans n8n",
          "GitHub : token personnel à droits limités",
          "Ollama : URL de base http://host.docker.internal:11434",
          "Ne jamais coller une clé dans un champ texte",
        ],
        narration:
          "Les identifiants sont enregistrés à part, et chiffrés. Pour GitHub, utilisez un token à droits limités. Pour Ollama, si n8n tourne dans Docker, l'adresse localhost désigne le conteneur : utilisez host point docker point internal, port onze mille quatre cent trente-quatre.",
      },
      {
        titre: "Les nœuds IA",
        points: [
          "AI Agent : un agent qui choisit ses outils",
          "Ollama Chat Model : le modèle local branché à l'agent",
          "Memory : garder le fil d'une conversation",
          "Tools : HTTP, GitHub, code… à disposition de l'agent",
        ],
        narration:
          "Le nœud AI Agent construit un agent. On lui branche un modèle, ici Ollama Chat Model, éventuellement une mémoire pour garder le fil, et des outils qu'il peut appeler seul, comme une requête HTTP ou GitHub. Pour une tâche simple et prévisible, un seul appel au modèle suffit.",
      },
      {
        titre: "Tester et déboguer",
        points: [
          "Exécuter un nœud seul et voir son entrée et sa sortie",
          "Épingler des données pour ne pas rappeler un service",
          "Onglet Executions : l'historique de chaque exécution",
          "Activer le workflow pour passer en production",
        ],
        narration:
          "Chaque nœud s'exécute seul, et vous voyez ses données d'entrée et de sortie. Épinglez un résultat pour ne pas rappeler un service à chaque essai. L'onglet Executions garde l'historique, très utile pour comprendre une erreur. Enfin, activez le workflow pour qu'il tourne en continu.",
      },
    ],
  },
  {
    id: "05-projet-final",
    titre: "Projet final : l'assistant de dépôt",
    objectif:
      "Assembler GitHub, n8n, Ollama et Claude Code dans une chaîne complète.",
    exercice:
      "Réaliser la chaîne complète, ouvrir trois issues de test et vérifier les commentaires, puis faire corriger l'une d'elles par Claude Code.",
    diapos: [
      {
        titre: "Architecture",
        points: [
          "GitHub (issue ouverte) → webhook",
          "n8n : Webhook → Ollama → GitHub (commentaire + label)",
          "Claude Code : corrige l'issue et ouvre la PR",
          "GitHub Actions : vérifie les tests",
        ],
        narration:
          "Voici l'architecture. GitHub envoie un webhook à l'ouverture d'une issue. n8n le reçoit, interroge Ollama, puis publie un commentaire et ajoute un label. Claude Code prend l'issue en charge et ouvre une pull request, que GitHub Actions vérifie.",
      },
      {
        titre: "Étape 1 : le webhook",
        points: [
          "n8n : nœud Webhook, méthode POST, copier l'URL de production",
          "GitHub : Settings → Webhooks → Add webhook",
          "Content type : application/json · événement : Issues",
          "En local : exposer n8n avec un tunnel (ex. Cloudflare Tunnel)",
        ],
        narration:
          "Dans n8n, ajoutez un nœud Webhook en méthode POST et copiez son URL de production. Dans GitHub, ajoutez un webhook avec cette URL, au format JSON, pour l'événement Issues. Si n8n tourne sur votre machine, GitHub ne peut pas l'atteindre : exposez-le avec un tunnel.",
      },
      {
        titre: "Étape 2 : résumer avec Ollama",
        code: `POST http://host.docker.internal:11434/api/chat
{
  "model": "resumeur",
  "stream": false,
  "messages": [{
    "role": "user",
    "content": "{{ $json.body.issue.title }}\\n{{ $json.body.issue.body }}"
  }]
}`,
        narration:
          "Ajoutez un nœud If pour ne garder que l'action opened. Puis un nœud HTTP Request vers l'API chat d'Ollama, avec notre modèle résumeur. Le contenu du message reprend le titre et le corps de l'issue grâce aux expressions.",
      },
      {
        titre: "Étape 3 : répondre sur GitHub",
        points: [
          "Nœud GitHub → Issue → Create Comment",
          "Texte : {{ $json.message.content }}",
          "Nœud GitHub → Issue → Edit : ajouter le label proposé",
          "Activer le workflow, ouvrir une issue de test",
        ],
        narration:
          "Ajoutez un nœud GitHub qui crée un commentaire sur l'issue, avec la réponse du modèle. Un second nœud ajoute le label proposé. Activez le workflow, ouvrez une issue de test, et vérifiez qu'un commentaire apparaît en quelques secondes.",
      },
      {
        titre: "Étape 4 : corriger avec Claude Code",
        code: `claude "Lis l'issue #3 avec gh issue view 3,
corrige le bug, ajoute un test, lance bun test,
puis ouvre une PR qui contient Fixes #3"`,
        narration:
          "Dernière étape : demandez à Claude Code de lire l'issue, de corriger le bug, d'ajouter un test et de lancer les tests, puis d'ouvrir une pull request qui mentionne Fixes et le numéro. GitHub Actions vérifie la pull request, et l'issue se ferme à la fusion.",
      },
      {
        titre: "Bonnes pratiques",
        points: [
          "Garder un humain pour relire et fusionner les PR",
          "Secrets dans les credentials, jamais dans le workflow",
          "Vérifier la signature des webhooks (secret partagé)",
          "Journaliser les exécutions, surveiller les erreurs",
        ],
        narration:
          "Quelques règles pour finir. Relisez toujours les pull requests avant de les fusionner. Gardez vos secrets dans les credentials. Définissez un secret sur le webhook pour vérifier que les requêtes viennent bien de GitHub. Et surveillez l'historique des exécutions.",
      },
      {
        titre: "Félicitations !",
        points: [
          "Vous savez versionner et collaborer avec GitHub",
          "Déléguer du code à Claude Code",
          "Faire tourner l'IA en local avec Ollama",
          "Tout relier avec n8n",
        ],
        narration:
          "Félicitations, vous êtes arrivé au bout du cours. Vous savez versionner et collaborer avec GitHub, déléguer du code à Claude Code, faire tourner l'intelligence artificielle en local avec Ollama, et relier le tout avec n8n. À vous de jouer.",
      },
    ],
  },
];
