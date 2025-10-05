#!/usr/bin/env bash
set -euo pipefail

# === CONFIG ===
APP_NAME="docs"
VERCEL_PROJECT="honolytics-docs"
VERCEL_ORG="remcostoeten"
PACKAGE_MANAGER="bun" # or yarn / pnpm
BUILD_CMD="$PACKAGE_MANAGER run build"

# === DEFAULT PROJECT PATH ===
# Set your default project path here (can be overridden with --path argument)
DEFAULT_PROJECT_PATH="/home/remco-stoeten/projects/honolytics/apps/docs"
PROJECT_PATH="$DEFAULT_PROJECT_PATH"

# === FLAGS (default false) ===
RUN_PRETTIER=true
RUN_LINT=true
RUN_TYPECHECK=false
RUN_TESTS=false
RUN_NOTIFY=true

# === HELP ===
function help() {
  echo "Usage: $0 [options]"
  echo ""
  echo "Options:"
  echo "  --path <path>  Specify project path to deploy from (default: $DEFAULT_PROJECT_PATH)"
  echo "  --prettier     Run Prettier check before build"
  echo "  --lint         Run ESLint before build"
  echo "  --typecheck    Run TypeScript typecheck before build"
  echo "  --tests        Run tests before build"
  echo "  --all          Run all pre-deploy checks"
  echo "  --notify       Show system notifications (Ubuntu only)"
  echo "  -h, --help     Show this help"
  echo ""
  echo "Examples:"
  echo "  $0 --path /home/user/my-project --all"
  echo "  $0 --path ../other-project --lint --typecheck"
  exit 0
}

# === PARSE FLAGS ===
while [[ $# -gt 0 ]]; do
  case $1 in
  --path)
    PROJECT_PATH="$2"
    shift 2
    ;;
  --prettier)
    RUN_PRETTIER=true
    shift
    ;;
  --lint)
    RUN_LINT=true
    shift
    ;;
  --typecheck)
    RUN_TYPECHECK=true
    shift
    ;;
  --tests)
    RUN_TESTS=true
    shift
    ;;
  --all)
    RUN_PRETTIER=true
    RUN_LINT=true
    RUN_TYPECHECK=true
    RUN_TESTS=true
    shift
    ;;
  --notify)
    RUN_NOTIFY=true
    shift
    ;;
  -h | --help)
    help
    ;;
  *)
    echo "Unknown option: $1"
    echo "Use -h or --help for usage information"
    exit 1
    ;;
  esac
done

# === PROJECT PATH VALIDATION ===
ORIGINAL_DIR=$(pwd)

# Always use the PROJECT_PATH (either default or from --path argument)
if [ "$PROJECT_PATH" != "$(pwd)" ]; then
  echo "📁 Changing to project directory: $PROJECT_PATH"

  if [ ! -d "$PROJECT_PATH" ]; then
    echo "❌ Error: Project path '$PROJECT_PATH' does not exist"
    exit 1
  fi

  cd "$PROJECT_PATH" || {
    echo "❌ Error: Failed to change to directory '$PROJECT_PATH'"
    exit 1
  }

  if [ ! -f "package.json" ]; then
    echo "❌ Error: No package.json found in '$PROJECT_PATH'. Not a valid project directory."
    cd "$ORIGINAL_DIR"
    exit 1
  fi

  echo "✅ Working from: $(pwd)"
else
  echo "📁 Working from current directory: $(pwd)"
fi

# === NOTIFY FUNCTION (Ubuntu only) ===
function notify() {
  if [ "$RUN_NOTIFY" = true ] && command -v notify-send &>/dev/null; then
    notify-send "$1" "$2"
  fi
}

# === PRE-DEPLOY TASKS ===
function run_prettier() {
  echo "🎨 Running Prettier..."
  $PACKAGE_MANAGER run format:check
}

function run_lint() {
  echo "🔍 Running ESLint..."
  $PACKAGE_MANAGER run lint
}

function run_typecheck() {
  echo "🛠 Running TypeScript typecheck..."
  $PACKAGE_MANAGER run typecheck
}

function run_tests() {
  echo "🧪 Running tests..."
  $PACKAGE_MANAGER run test
}

# Run based on flags
if [ "$RUN_PRETTIER" = true ]; then run_prettier; fi
if [ "$RUN_LINT" = true ]; then run_lint; fi
if [ "$RUN_TYPECHECK" = true ]; then run_typecheck; fi
if [ "$RUN_TESTS" = true ]; then run_tests; fi

notify "Pre-checks complete ✅" "$APP_NAME ready to build."
echo "✅ Pre-deploy checks complete!"

# === DEPLOY SCRIPT ===
echo "🚀 Deploying $APP_NAME to Vercel..."
notify "Deploy Started 🚀" "Deploying $APP_NAME to Vercel..."

if ! command -v vercel &>/dev/null; then
  echo "❌ vercel CLI not found. Install with: $PACKAGE_MANAGER i -g vercel"
  exit 1
fi

echo "📦 Building project..."
$BUILD_CMD
notify "Build Complete 📦" "$APP_NAME build finished."

if [ ! -f ".vercel/project.json" ]; then
  echo "🔗 Linking to Vercel project..."
  vercel link --project $VERCEL_PROJECT --org $VERCEL_ORG --confirm
fi

echo "🌍 Deploying to production..."
vercel deploy --prebuilt --prod --confirm
notify "Deploy Successful ✅" "$APP_NAME is live!"

echo "✅ Deployment complete!"

# === CLEANUP ===
if [ "$PROJECT_PATH" != "$ORIGINAL_DIR" ]; then
  echo "📁 Returning to original directory: $ORIGINAL_DIR"
  cd "$ORIGINAL_DIR"
fi
