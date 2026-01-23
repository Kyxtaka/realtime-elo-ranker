Get-ChildItem -Path . -Filter "node_modules" -Recurse -Directory | Remove-Item -Recurse -Force

Get-ChildItem -Path . -Include "pnpm-lock.yaml", "package-lock.json", "yarn.lock" -Recurse | Remove-Item -Force

Get-ChildItem -Path . -Filter "dist" -Recurse -Directory | Remove-Item -Recurse -Force

Write-Host "Nettoyage terminé ! Relancez 'pnpm install'." -ForegroundColor Green
Write-Host "Prune des paquets inutilisés dans le store pnpm..." -ForegroundColor Green
pnpm store prune
Write-Host "Prune terminé !" -ForegroundColor Green
Write-Host "Installation des dépendances..." -ForegroundColor Green
pnpm install
Write-Host "Installation terminée !" -ForegroundColor Green
Write-Host "Build de better-sqlite3 via son script postinstall..." -ForegroundColor Yellow
pnpm run postinstall:better-sqlite3
Write-Host "Build terminé !" -ForegroundColor Green
Write-Host "Toutes les opérations sont terminées !" -ForegroundColor Green