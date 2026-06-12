# Stop on error
$ErrorActionPreference = "Stop"

Write-Host "=== Building Jekyll site ==="
try {
    bundle exec jekyll build
} catch {
    Write-Host "❌ Jekyll build failed. Make sure Ruby, Bundler, and Jekyll are installed."
    exit 1
}

$sitePath = Join-Path (Get-Location) "_site"
if (-not (Test-Path $sitePath)) {
    Write-Host "❌ _site folder not found at $sitePath"
    exit 1
}

# Ensure .nojekyll exists
$nojekyll = Join-Path $sitePath ".nojekyll"
if (-not (Test-Path $nojekyll)) {
    New-Item $nojekyll -ItemType File | Out-Null
}

# 1️⃣ Ensure gh-pages branch exists
$branchExists = git show-ref refs/heads/gh-pages 2>$null
if (-not $branchExists) {
    Write-Host "gh-pages branch does not exist. Creating orphan branch..."
    git checkout --orphan gh-pages
    git rm -rf * --ignore-unmatch
    git commit --allow-empty -m "Init gh-pages branch"
    git push origin gh-pages
    git checkout main
}

# 2️⃣ Use a worktree for gh-pages
$DeployPath = Join-Path (Get-Location) "_ghpages_worktree"

if (Test-Path $DeployPath) { Remove-Item $DeployPath -Recurse -Force }

Write-Host "=== Adding gh-pages worktree ==="
git worktree add $DeployPath gh-pages

# 3️⃣ Clear old files in worktree
Write-Host "=== Cleaning gh-pages worktree ==="
Get-ChildItem $DeployPath -Force |
    Where-Object { $_.Name -ne ".git" } |
    Remove-Item -Recurse -Force

# 4️⃣ Copy _site into worktree
Write-Host "=== Copying _site contents ==="
Copy-Item "$sitePath\*" $DeployPath -Recurse -Force

# 5️⃣ Commit & push from worktree
Set-Location $DeployPath
git add .
try {
    git commit -m "Deploy static site"
} catch {
    Write-Host "Nothing to commit (no changes)"
}
git push origin gh-pages

# 6️⃣ Clean up
Set-Location ".."
git worktree remove $DeployPath -f

Write-Host "✅ Deployment complete!"
