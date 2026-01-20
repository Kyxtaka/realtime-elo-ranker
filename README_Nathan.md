# TP dév avance Nathan Randriantsoa
## Requirement

- node : v24.11.1 (node 24)
- npm : v10.8.3 (npm 8)
- pnpm : v10.25.0 (pnpm 10
)
## Init du projet nest
### conflit de compilation de module et resolution de module

problème : depiuis les version recente de node, le nest cli creer des projet typeScript moderne avec de la relosution de module 
`esm`, `nodenext` pour une creation d'un projet moderne. Nest JS à été initialement concu en mode `commonJS` que se soit pour le declaration et compilation de module ainsi que la résolution de module. Ce qui entraine par conséquent (avec vs code et quelque configuration de node) des erreur de resolution de module node et donc de compilation. 

Pour resoudre ce problème, et offrir un environnement stable qui marcherai sur n'importe quelle machine. J'ai modifier le fichier .ts pour utilise `commonJS` pour la résolution de module.

### Probleme avec TypeORM, driver sqlite, pnpm 
TypeORM gère mal la resolution de dépendence pour les driver sqlite et bettersql. Cela est du au fait que typeorm/sqlite ne comprend pas la gestion des dépendence par lien symbolique avec pnpm, il cherche le module natif mais ne le trouve pas du coup.

### Solution : Utiliser pnpm pour le client, npm pour l'api

#### S'assurer que les node_module sont supprimer 

```bash
# a la racine du projet
## sur linux
rm -rf node_modules
rm -rf apps/realtime-elo-ranker-server/node_modules
rm pnpm-lock.yaml
rm  apps/realtime-elo-ranker-server/package-lock.json

## sur windows
Remove-Item -Force pnpm-lock.yaml
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force apps/realtime-elo-ranker-server/node_modules
Remove-Item -Force  apps/realtime-elo-ranker-server/package-lock.json
```

#### Si ce n'est pas fait modier pnpm-workspace.yml

Au debut du fichier remplacer les première ligne (partie package) par : 
```yml
packages:
  - apps/realtime-elo-ranker-client
  - apps/realtime-elo-ranker-api-mock
  - libs/*
  - docs/*
```

#### Installation des dépendance 

```bash 
# a la racine du monorepo
pnpm install
pnpm run libs:ui:build

# pnpm add typeorm better-sqlite3 mysql2 class-validator class-transformer @nestjs/event-emitter --filter ./apps/realtime-elo-ranker-server

pnpm add -D @types/node -w # pour vscode (pour ne plus avoir les erreur tu tsconfig)

# installation des dépendance pour l'api (NPM)

cd ./apps/realtime-elo-ranker-server
npm install
npm install --save-dev @types/node # pour vscode (pour ne plus avoir les erreur tu tsconfig)
```

*Si le package.json est pas présent* `non nécessaire normalement`
```bash
npm install typeorm sqlite3 better-sqlite3 mysql2 class-validator class-transformer @nestjs/event-emitter
npm install --save-dev @types/node
```

### Lancement client et api 
lancement du client
```bash
# sur un nouveau terminal a la racine du projet
pnpm run apps:client:dev

# pour l api choisir
pnpm run apps:server:start

#ou
npm run apps:server:start 
```

```bash
# cd ./apps/realtime-elo-ranker-server
npm run start
```





#### note (A skip) 
Comme 
Ajout des dependance au projet (fonctionne pas car typeORM ne trouve pas sqlite)
Si les fichier package.json est pas la 
```bash
pnpm add typeorm better-sqlite3 mysql2 class-validator class-transformer @nestjs/event-emitter --filter ./apps/realtime-elo-ranker-server

pnpm add -D @types/node --filter ./apps/realtime-elo-ranker-server
```

SI present 
```bash
pnpm install
pnpm rebuild better-sqlite3 --filter ./apps/realtime-elo-ranker-server
```