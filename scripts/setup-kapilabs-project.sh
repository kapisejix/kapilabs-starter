#!/usr/bin/env bash
set -e

PROJECT_PATH=""
REPO_URL="https://github.com/kapisejix/kapilabs-astro-framework.git"
BRANCH="master"
SOURCE_PATH=""
RUN_SEED=false

while [[ $# -gt 0 ]]; do
  case $1 in
    -ProjectPath) PROJECT_PATH="$2"; shift 2 ;;
    -RepoUrl) REPO_URL="$2"; shift 2 ;;
    -Branch) BRANCH="$2"; shift 2 ;;
    -SourcePath) SOURCE_PATH="$2"; shift 2 ;;
    -Seed) RUN_SEED=true; shift ;;
    *) echo "Unknown parameter: $1"; exit 1 ;;
  esac
done

if [[ -z "$PROJECT_PATH" ]]; then
  echo "Error: -ProjectPath is required"
  echo "Usage: bash setup-kapilabs-project.sh -ProjectPath /path/to/my-site"
  exit 1
fi

OWNED_TEMP=false

if [[ -n "$SOURCE_PATH" && -d "$SOURCE_PATH" ]]; then
  TEMP_PATH="$SOURCE_PATH"
else
  TEMP_PATH="$(mktemp -d)/kapilabs-framework"
  echo "Cloning KapiLabs framework..."
  git clone --depth 1 --branch "$BRANCH" "$REPO_URL" "$TEMP_PATH"
  OWNED_TEMP=true
fi

mkdir -p "$PROJECT_PATH"

for FOLDER in src/core src/pages src/plugins public studio starter-content scripts plugins packages; do
  SOURCE="$TEMP_PATH/$FOLDER"
  DEST="$PROJECT_PATH/$FOLDER"
  if [[ -d "$SOURCE" ]]; then
    mkdir -p "$DEST"
    cp -r "$SOURCE/." "$DEST/"
  fi
done

# Create src/theme/ if not exists (user customization layer - never overwrite)
THEME_PATH="$PROJECT_PATH/src/theme"
if [[ ! -d "$THEME_PATH" ]]; then
  mkdir -p "$THEME_PATH"
  touch "$THEME_PATH/.gitkeep"
  echo "Created src/theme/ - add your customizations here."
fi

for FILE in package.json astro.config.mjs tsconfig.json pnpm-workspace.yaml .env.example README.md; do
  SOURCE="$TEMP_PATH/$FILE"
  DEST="$PROJECT_PATH/$FILE"
  if [[ -f "$SOURCE" ]]; then
    cp "$SOURCE" "$DEST"
  fi
done

echo "Installing Astro dependencies..."
cd "$PROJECT_PATH"
pnpm install

STUDIO_PATH="$PROJECT_PATH/studio"
if [[ -d "$STUDIO_PATH" ]]; then
  echo "Installing Studio dependencies..."
  cd "$STUDIO_PATH"
  pnpm install
  cd "$PROJECT_PATH"

  STUDIO_ENV_FILE="$STUDIO_PATH/.env"
  if [[ ! -f "$STUDIO_ENV_FILE" ]]; then
    STUDIO_ENV_EXAMPLE="$STUDIO_PATH/.env.example"
    if [[ -f "$STUDIO_ENV_EXAMPLE" ]]; then
      cp "$STUDIO_ENV_EXAMPLE" "$STUDIO_ENV_FILE"
      echo "Created studio/.env from .env.example - fill in SANITY_STUDIO_PROJECT_ID before running Studio."
    fi
  fi
fi

ENV_FILE="$PROJECT_PATH/.env"
if [[ ! -f "$ENV_FILE" ]]; then
  ENV_EXAMPLE="$PROJECT_PATH/.env.example"
  if [[ -f "$ENV_EXAMPLE" ]]; then
    cp "$ENV_EXAMPLE" "$ENV_FILE"
    echo "Created .env from .env.example - fill in PUBLIC_SANITY_PROJECT_ID and SANITY_TOKEN before running."
  fi
fi

if [[ "$OWNED_TEMP" == "true" ]]; then
  rm -rf "$TEMP_PATH"
fi

if [[ "$RUN_SEED" == "true" ]]; then
  if grep -q "SANITY_TOKEN=sk" "$PROJECT_PATH/.env" 2>/dev/null; then
    echo "Running seed script..."
    cd "$PROJECT_PATH"
    pnpm seed
  else
    echo "Skipping seed: SANITY_TOKEN not set in .env. Run 'pnpm seed' manually after filling in the token."
  fi
fi

echo ""
echo "=========================================="
echo " KapiLabs Astro Framework - Setup Complete"
echo "=========================================="
echo ""
echo "Project: $PROJECT_PATH"
echo ""
echo "NEXT STEPS:"
echo "  1. Create a Sanity project at https://sanity.io/manage (free)"
echo "  2. Edit .env         - set PUBLIC_SANITY_PROJECT_ID, SANITY_TOKEN, SITE_URL"
echo "  3. Edit studio/.env  - set SANITY_STUDIO_PROJECT_ID (same project ID)"
echo "  4. pnpm seed         - seed starter content into Sanity"
echo "  5. pnpm dev          - start Astro site at http://localhost:4321"
echo "  6. cd studio && npx sanity dev  - start Studio at http://localhost:3333"
echo ""
echo "GUIDE (open in browser):"
echo "  $PROJECT_PATH/starter-content/guide.html"
echo ""
echo "DRY-RUN (test seed without Sanity credentials):"
echo "  node scripts/seed-sanity.mjs --dry-run"
echo ""
echo "LOCALHOST QUICK SETUP (use local source instead of cloning):"
echo "  bash scripts/setup-kapilabs-project.sh -ProjectPath /path/to/my-site -SourcePath $PROJECT_PATH"
echo ""
echo "Optional Astro integrations (run from project root):"
echo "  npx astro add react      - React.js components"
echo "  npx astro add vue        - Vue.js components"
echo "  npx astro add svelte     - Svelte components"
echo "  npx astro add mdx        - MDX content"
echo "  npx astro add sitemap    - Auto-generate sitemap.xml"
echo "  npx astro add image      - Optimized image handling"
echo ""
echo "  Each command will auto-configure astro.config.mjs and install packages."
