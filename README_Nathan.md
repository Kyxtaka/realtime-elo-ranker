# TP dév avance Nathan Randriantsoa
## Travail réalisé

- Implementation api : realtime-elo-ranker-server
  - mise en place test (api)
  - création service singleton (scope.DEFAUT)
  - séparation logique entity, model, service, controller, dto
  - implementation de toute les route
  - implementation système de notrification event (route sse)
  - ceration d'une bs sqlite (persistance des données)
- implementation simulateur (demandé en bonus)
  - envoie de requete à intervalle régulier pour déclarer des match

## Requirement

- node : v24.11.1 (node 24)
- npm : v10.8.3 (npm 10)
- pnpm : v10.25.0 (pnpm 10)
- outils de build c++ 

<!-- ## Init du projet nest -->



<!-- ### conflit de compilation de module et resolution de module

problème : depiuis les version recente de node, le nest cli creer des projet typeScript moderne avec de la relosution de module 
`esm`, `nodenext` pour une creation d'un projet moderne. Nest JS à été initialement concu en mode `commonJS` que se soit pour le declaration et compilation de module ainsi que la résolution de module. Ce qui entraine par conséquent (avec vs code et quelque configuration de node) des erreur de resolution de module node et donc de compilation. 

Pour resoudre ce problème, et offrir un environnement stable qui marcherai sur n'importe quelle machine. J'ai modifier le fichier .ts pour utilise `commonJS` pour la résolution de module.

### Probleme avec TypeORM, driver sqlite, pnpm 
TypeORM gère mal la resolution de dépendence pour les driver sqlite et bettersql. Cela est du au fait que typeorm/sqlite ne comprend pas la gestion des dépendence par lien symbolique avec pnpm, il cherche le module natif mais ne le trouve pas du coup. -->

## Set-up et lancement

### Si necessaire uniquement installation de pnpm
```bash
## Windows 
iwr https://get.pnpm.io/install.ps1 -useb | iex

#Linux 
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

### Installation des outils de build c# et c++ pour les addons sqlite

```bash
#linux
sudo apt update
sudo apt install build-essential

#bash windows
npm install --global windows-build-tools 
```

### Installation rapide - install normal + resolution build better-sqlite3
a la racine du monorepo
```bash
## sur linux
./cleanInstallPkg.sh
pnpm run libs:ui:build

## sur windows
# s'assurer que la politique d'execution de script permet l execution de script powershell
./cleanInstallPkg.ps1
pnpm run libs:ui:build
```

### Installation des dépendance manuellement - si install rapide skipped

```bash 
# a la racine du monorepo
pnpm install
pnpm run libs:ui:build
pnpm run postinstall:better-sqlite3
```

### Lancement client, api et simulateur de match pour l'api 

```bash
# sur un nouveau terminal a la racine du projet
pnpm run apps:client:dev

# pour l'api 
pnpm run apps:server:start

# Pour lancer le simulateur 
pnpm run apps:simulator:start
```

## Tests API
pour lancer les tests de l'API
```bash
# Tous les tests
pnpm run apps:server:test

# E2E uniquement
pnpm run apps:server:test:e2e

# Avec couverture
pnpm run apps:server:test:cov
```