# Check if platform argument is provided
param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("mac", "windows")]
    [string]$platform
)

# Remove existing Gemfile.lock if it exists
if (Test-Path "Gemfile.lock") {
    Remove-Item "Gemfile.lock"
}

# Copy the appropriate platform-specific Gemfile.lock
switch ($platform) {
    "mac" {
        Copy-Item "Gemfile.lock.mac" "Gemfile.lock"
        Write-Host "Passage au Gemfile.lock pour Mac"
    }
    "windows" {
        Copy-Item "Gemfile.lock.windows" "Gemfile.lock"
        Write-Host "Passage au Gemfile.lock pour Windows"
    }
}

# Run bundle install to ensure everything is in sync
bundle install 