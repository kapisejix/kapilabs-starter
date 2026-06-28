param(
  [Parameter(Mandatory=$true)]
  [string]$ProjectPath,

  [string]$RepoUrl = "https://github.com/kapisejix/kapilabs-astro-framework.git",

  [string]$Branch = "master",

  [string]$SourcePath = "",

  [switch]$Seed
)

$ErrorActionPreference = "Stop"

$OwnedTemp = $false

if ($SourcePath -and (Test-Path $SourcePath)) {
  $TempPath = $SourcePath
} else {
  $TempPath = Join-Path $env:TEMP ("kapilabs-framework-" + [guid]::NewGuid())
  Write-Host "Cloning KapiLabs framework..."
  git clone --depth 1 --branch $Branch $RepoUrl $TempPath
  $OwnedTemp = $true
}

if (!(Test-Path $ProjectPath)) {
  New-Item -ItemType Directory -Force $ProjectPath | Out-Null
}

$Folders = @("src/core", "src/pages", "src/plugins", "public", "studio", "starter-content", "scripts", "plugins", "packages")

foreach ($Folder in $Folders) {
  $Source = Join-Path $TempPath $Folder
  $Destination = Join-Path $ProjectPath $Folder

  if (Test-Path $Source) {
    if (!(Test-Path $Destination)) {
      New-Item -ItemType Directory -Force $Destination | Out-Null
    }
    Copy-Item -Recurse -Force "$Source\*" $Destination
  }
}

# Create src/theme/ if not exists (user customization layer - never overwrite)
$ThemePath = Join-Path $ProjectPath "src/theme"
if (!(Test-Path $ThemePath)) {
  New-Item -ItemType Directory -Force $ThemePath | Out-Null
  Write-Host "Created src/theme/ - add your customizations here."
}

$Files = @("package.json", "astro.config.mjs", "tsconfig.json", "pnpm-workspace.yaml", ".env.example", "README.md")

foreach ($File in $Files) {
  $Source = Join-Path $TempPath $File
  $Destination = Join-Path $ProjectPath $File

  if (Test-Path $Source) {
    Copy-Item -Force $Source $Destination
  }
}

Write-Host "Installing Astro dependencies..."
Set-Location $ProjectPath
pnpm install

$StudioPath = Join-Path $ProjectPath "studio"
if (Test-Path $StudioPath) {
  Write-Host "Installing Studio dependencies..."
  Set-Location $StudioPath
  pnpm install
  Set-Location $ProjectPath

  $StudioEnvFile = Join-Path $StudioPath ".env"
  if (!(Test-Path $StudioEnvFile)) {
    $StudioEnvExample = Join-Path $StudioPath ".env.example"
    if (Test-Path $StudioEnvExample) {
      Copy-Item $StudioEnvExample $StudioEnvFile
      Write-Host "Created studio/.env from .env.example - fill in SANITY_STUDIO_PROJECT_ID before running Studio."
    }
  }
}

$EnvFile = Join-Path $ProjectPath ".env"
if (!(Test-Path $EnvFile)) {
  $EnvExample = Join-Path $ProjectPath ".env.example"
  if (Test-Path $EnvExample) {
    Copy-Item $EnvExample $EnvFile
    Write-Host "Created .env from .env.example - fill in PUBLIC_SANITY_PROJECT_ID and SANITY_TOKEN before running."
  }
}

if ($OwnedTemp) { Remove-Item -Recurse -Force $TempPath }

if ($Seed) {
  $EnvContent = Get-Content (Join-Path $ProjectPath ".env") -Raw -ErrorAction SilentlyContinue
  $HasToken = $EnvContent -match "SANITY_TOKEN=sk"
  if ($HasToken) {
    Write-Host "Running seed script..."
    Set-Location $ProjectPath
    pnpm seed
  } else {
    Write-Host "Skipping seed: SANITY_TOKEN not set in .env. Run 'pnpm seed' manually after filling in the token."
  }
}

Write-Host ""
Write-Host "=========================================="
Write-Host " KapiLabs Astro Framework - Setup Complete"
Write-Host "=========================================="
Write-Host ""
Write-Host "Project: $ProjectPath"
Write-Host ""
Write-Host "NEXT STEPS:"
Write-Host "  1. Create a Sanity project at https://sanity.io/manage (free)"
Write-Host "  2. Edit .env         - set PUBLIC_SANITY_PROJECT_ID, SANITY_TOKEN, SITE_URL"
Write-Host "  3. Edit studio/.env  - set SANITY_STUDIO_PROJECT_ID (same project ID)"
Write-Host "  4. pnpm seed         - seed starter content into Sanity"
Write-Host "  5. pnpm dev          - start Astro site at http://localhost:4321"
Write-Host "  6. cd studio && npx sanity dev  - start Studio at http://localhost:3333"
Write-Host ""
Write-Host "GUIDE (open in browser):"
Write-Host "  $ProjectPath\starter-content\guide.html"
Write-Host ""
Write-Host "DRY-RUN (test seed without Sanity credentials):"
Write-Host "  node scripts/seed-sanity.mjs --dry-run"
Write-Host ""
Write-Host "LOCALHOST QUICK SETUP (use local source instead of cloning):"
Write-Host "  .\scripts\setup-kapilabs-project.ps1 -ProjectPath C:\Sites\my-site -SourcePath $ProjectPath"
Write-Host ""
Write-Host "Optional Astro integrations (run from project root):"
Write-Host "  npx astro add react      - React.js components"
Write-Host "  npx astro add vue        - Vue.js components"
Write-Host "  npx astro add svelte     - Svelte components"
Write-Host "  npx astro add mdx        - MDX content"
Write-Host "  npx astro add sitemap    - Auto-generate sitemap.xml"
Write-Host "  npx astro add image      - Optimized image handling"
Write-Host ""
Write-Host "  Each command will auto-configure astro.config.mjs and install packages."
