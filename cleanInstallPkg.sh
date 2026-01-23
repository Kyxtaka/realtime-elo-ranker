#!/bin/bash

echo -e "\e[32mSuppression des dossiers node_modules...\e[0m"
# Cherche et supprime tous les dossiers node_modules récursivement
find . -name "node_modules" -type d -prune -exec rm -rf '{}' +

echo -e "\e[32mSuppression des fichiers lock...\e[0m"
# Supprime les fichiers lock (pnpm, npm, yarn)
find . -name "pnpm-lock.yaml" -delete
find . -name "package-lock.json" -delete
find . -name "yarn.lock" -delete

echo -e "\e[32mSuppression des dossiers de build (dist)...\e[0m"
# Cherche et supprime tous les dossiers dist récursivement
find . -name "dist" -type d -prune -exec rm -rf '{}' +

echo -e "\e[32mNettoyage terminé !\e[0m"

echo -e "\e[32mPrune des paquets inutilisés dans le store pnpm...\e[0m"
pnpm store prune

echo -e "\e[32mPrune terminé !\e[0m"

echo -e "\e[32mInstallation des dépendances...\e[0m"
pnpm install

echo -e "\e[32mInstallation terminée !\e[0m"

echo -e "\e[33mBuild de better-sqlite3 via son script postinstall...\e[0m"
pnpm run postinstall:better-sqlite3

echo -e "\e[32mBuild terminé !\e[0m"

echo -e "\e[32mToutes les opérations sont terminées !\e[0m"