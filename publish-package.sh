#!/bin/bash
# publish-package.sh - Publishes a package in a pnpm monorepo, handling workspace dependencies

set -e # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Root directory of the monorepo
MONOREPO_ROOT=$(pwd)

# Check if package name is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Package name is required${NC}"
    echo -e "Usage: ${CYAN}./publish-package.sh package-name [--skip-build] [--dry-run]${NC}"
    echo -e "   or: ${CYAN}pnpm publish:pkg package-name [--skip-build] [--dry-run]${NC}"
    echo
    echo -e "Available packages:"
    find packages -maxdepth 1 -type d | grep -v "^packages$" | sort | sed 's|packages/||' | xargs -I{} echo -e "  ${CYAN}{}${NC}"
    exit 1
fi

PACKAGE_NAME="$1"
SKIP_BUILD=false
DRY_RUN=false

# Parse additional arguments
shift
while [[ $# -gt 0 ]]; do
    case "$1" in
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        *)
            echo -e "${RED}Error: Unknown option $1${NC}"
            exit 1
            ;;
    esac
done

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${RED}Error: jq is required but not installed. Please install jq first.${NC}"
    echo "You can install it with:"
    echo "  brew install jq    # on macOS"
    echo "  apt install jq     # on Ubuntu/Debian"
    exit 1
fi

# Check if the package exists
PACKAGE_DIR="$MONOREPO_ROOT/packages/$PACKAGE_NAME"
PACKAGE_JSON="$PACKAGE_DIR/package.json"

if [ ! -d "$PACKAGE_DIR" ]; then
    echo -e "${RED}Error: Package directory not found: $PACKAGE_DIR${NC}"
    exit 1
fi

if [ ! -f "$PACKAGE_JSON" ]; then
    echo -e "${RED}Error: package.json not found: $PACKAGE_JSON${NC}"
    exit 1
fi

# Get full package name and version from package.json
FULL_PACKAGE_NAME=$(jq -r '.name' "$PACKAGE_JSON")
PACKAGE_VERSION=$(jq -r '.version' "$PACKAGE_JSON")

echo -e "${BLUE}=== Publishing Package: ${CYAN}$FULL_PACKAGE_NAME@$PACKAGE_VERSION${BLUE} ===${NC}"

# Create temp files
TEMP_DIR=$(mktemp -d)
TEMP_PKG_JSON="$TEMP_DIR/package.json"
BACKUP_PKG_JSON="$PACKAGE_DIR/package.json.bak"
DEPS_FILE="$TEMP_DIR/deps.txt"
BUNDLE_DEPS_FILE="$TEMP_DIR/bundle_deps.txt"

# Create a backup of the original package.json
cp "$PACKAGE_JSON" "$BACKUP_PKG_JSON"
echo -e "${GREEN}Created backup of package.json${NC}"

# Extract workspace dependencies
jq -r '.dependencies | to_entries[] | select(.value | type=="string" and startswith("workspace:")) | .key' "$PACKAGE_JSON" > "$DEPS_FILE"

# Extract dependencies from publishConfig if it exists
if jq -e '.publishConfig.dependencies' "$PACKAGE_JSON" > /dev/null; then
    jq -r '.publishConfig.dependencies | keys[]' "$PACKAGE_JSON" > "$TEMP_DIR/published_deps.txt"
else
    touch "$TEMP_DIR/published_deps.txt"
fi

# Find dependencies to bundle (in deps but not in publishConfig)
grep -v -f "$TEMP_DIR/published_deps.txt" "$DEPS_FILE" > "$BUNDLE_DEPS_FILE" || true

# Display workspace dependencies
echo -e "${YELLOW}Workspace dependencies:${NC}"
if [ ! -s "$DEPS_FILE" ]; then
    echo -e "  ${YELLOW}None${NC}"
else
    while read -r dep; do
        if grep -q "^$dep$" "$BUNDLE_DEPS_FILE"; then
            echo -e "  - ${CYAN}$dep${NC} (will be bundled)"
        else
            echo -e "  - ${CYAN}$dep${NC} (external dependency)"
        fi
    done < "$DEPS_FILE"
fi

# Create a modified package.json for publishing
if [ ! -s "$BUNDLE_DEPS_FILE" ]; then
    echo -e "${YELLOW}No dependencies to bundle. Using original package.json${NC}"
    cp "$PACKAGE_JSON" "$TEMP_PKG_JSON"
else
    echo -e "${YELLOW}Creating modified package.json without bundled dependencies${NC}"
    
    # Build a temporary jq filter
    FILTER=".dependencies"
    while read -r dep; do
        FILTER="$FILTER | del(.\"$dep\")"
    done < "$BUNDLE_DEPS_FILE"
    
    # Apply the filter to create the new package.json
    jq "$FILTER" "$PACKAGE_JSON" > "$TEMP_DIR/temp1.json"
    jq -s '.[0] * {"dependencies": .[1]}' "$PACKAGE_JSON" "$TEMP_DIR/temp1.json" > "$TEMP_PKG_JSON"
    
    echo -e "${GREEN}Removed these dependencies (they'll be bundled):${NC}"
    while read -r dep; do
        echo -e "  - ${CYAN}$dep${NC}"
    done < "$BUNDLE_DEPS_FILE"
fi

# Apply the modified package.json
cp "$TEMP_PKG_JSON" "$PACKAGE_JSON"

# Build the package if not skipped
if [ "$SKIP_BUILD" = false ]; then
    echo -e "\n${BLUE}Building package...${NC}"
    cd "$PACKAGE_DIR"
    if [ -f "package.json" ] && jq -e '.scripts.build' package.json > /dev/null; then
        pnpm run build
    else
        echo -e "${YELLOW}No build script found in package.json. Skipping build.${NC}"
    fi
    cd "$MONOREPO_ROOT"
else
    echo -e "\n${YELLOW}Skipping build as requested${NC}"
fi

# Publish the package
if [ "$DRY_RUN" = true ]; then
    echo -e "\n${BLUE}DRY RUN: Would publish package with:${NC}"
    echo -e "  ${CYAN}cd $PACKAGE_DIR && pnpm publish --access public --no-git-checks --dry-run${NC}"
    
    echo -e "\n${BLUE}Modified package.json:${NC}"
    jq '.' "$PACKAGE_JSON"
else
    echo -e "\n${BLUE}Publishing package...${NC}"
    cd "$PACKAGE_DIR"
    pnpm publish --access public --no-git-checks
    cd "$MONOREPO_ROOT"
    
    echo -e "\n${GREEN}Package published successfully!${NC}"
fi

# Restore the original package.json
echo -e "\n${BLUE}Restoring original package.json...${NC}"
cp "$BACKUP_PKG_JSON" "$PACKAGE_JSON"
rm -f "$BACKUP_PKG_JSON"
rm -rf "$TEMP_DIR"

if [ "$DRY_RUN" = true ]; then
    echo -e "\n${YELLOW}This was a dry run. The package was NOT actually published.${NC}"
else
    echo -e "\n${GREEN}Done! Package $FULL_PACKAGE_NAME@$PACKAGE_VERSION has been published.${NC}"
fi