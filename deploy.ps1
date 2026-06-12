# Stop on error
$ErrorActionPreference = "Stop"

Write-Host "=== Building Jekyll site ==="
$sitePath = Join-Path (Get-Location) "_site"

# Remove any stale build so a failed build can never deploy old content
if (Test-Path $sitePath) { Remove-Item $sitePath -Recurse -Force }

bundle exec jekyll build
# try/catch cannot detect native command failures; check the exit code instead
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Jekyll build failed (exit code $LASTEXITCODE). Aborting deploy."
    exit 1
}

if (-not (Test-Path $sitePath)) {
    Write-Host "❌ _site folder not found at $sitePath"
    exit 1
}

# pages/ is excluded from the Jekyll build (paths exceed the Windows 260-char
# limit); robocopy supports long paths, so copy it into _site directly
Write-Host "=== Copying pages/ (excluded from Jekyll) ==="
robocopy "pages" (Join-Path $sitePath "pages") /E /NFL /NDL /NJH /NJS | Out-Null
if ($LASTEXITCODE -ge 8) {
    Write-Host "❌ robocopy failed (exit code $LASTEXITCODE). Aborting deploy."
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

# 3️⃣ Mirror _site into worktree (robocopy is long-path safe; /MIR also removes old files)
# The worktree's .git is a FILE, not a directory: /XF keeps /MIR from deleting it
Write-Host "=== Syncing _site into gh-pages worktree ==="
robocopy $sitePath $DeployPath /MIR /XF .git /XD .git /NFL /NDL /NJH /NJS | Out-Null
if ($LASTEXITCODE -ge 8) {
    Write-Host "❌ robocopy failed (exit code $LASTEXITCODE). Aborting deploy."
    exit 1
}

# Without its .git file, git commands in the worktree would target the main repo
if (-not (Test-Path (Join-Path $DeployPath ".git"))) {
    Write-Host "❌ Worktree .git file was lost during sync. Aborting deploy."
    exit 1
}

# 5️⃣ Commit & push from worktree
Set-Location $DeployPath
git add .
git commit -m "Deploy static site"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Nothing to commit (no changes)"
}
git push origin gh-pages

# 6️⃣ Clean up
Set-Location ".."
git worktree remove $DeployPath -f

Write-Host "✅ Deployment complete!"
