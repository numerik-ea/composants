# Nom du fichier : telecharger-page.ps1

# Demander l'URL à l'utilisateur
$url = Read-Host "Entrez l'URL de la page à télécharger (ex: https://exemple.com/page.html)"

if (-not ($url -match "https?://([^/]+)")) {
    Write-Host "URL invalide"
    exit
}

# Demander le dossier de sauvegarde
$saveDir = Read-Host "Entrez le chemin du dossier où sauvegarder le contenu (ex: C:\Users\MonDossier)"

# Vérifier si le dossier existe, sinon le créer
if (-not (Test-Path $saveDir)) {
    Write-Host "Le dossier n'existe pas. Création du dossier..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $saveDir | Out-Null
    Write-Host "Dossier créé avec succès." -ForegroundColor Green
}

# Créer une commande wget avec les bons paramètres
$wgetCommand = @(
    "wget",
    "--page-requisites",
    "--convert-links",
    "--span-hosts",
    "--adjust-extension",
    "--no-parent",
    "--restrict-file-names=windows",
    "--level=1",
    "--no-check-certificate",
    "--directory-prefix=`"$saveDir`"",
    $url
) -join " "

# Afficher la commande pour vérification
Write-Host "Exécution de la commande suivante :" -ForegroundColor Cyan
Write-Host $wgetCommand -ForegroundColor Yellow

# Exécuter la commande
Invoke-Expression $wgetCommand
