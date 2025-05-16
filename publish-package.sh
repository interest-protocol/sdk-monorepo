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

# Create a backup of the original package.json
cp "$PACKAGE_JSON" "$BACKUP_PKG_JSON"
echo -e "${GREEN}Created backup of package.json${NC}"

# Find workspace dependencies (those with "workspace:" prefix)
WORKSPACE_DEPS=$(jq -r '.dependencies | to_entries[] | select(.value | tostring | startswith("workspace:")) | .key' "$PACKAGE_JSON")

# Find which ones are in publishConfig.dependencies
if jq -e '.publishConfig.dependencies' "$PACKAGE_JSON" > /dev/null; then
    PUBLISHED_DEPS=$(jq -r '.publishConfig.dependencies | keys[]' "$PACKAGE_JSON")
else
    PUBLISHED_DEPS=""
fi

# Calculate which workspace deps should be bundled (not in publishConfig)
BUNDLED_DEPS=()
for dep in $WORKSPACE_DEPS; do
    if ! echo "$PUBLISHED_DEPS" | grep -qFx "$dep"; then
        BUNDLED_DEPS+=("$dep")
    fi
done

echo -e "${YELLOW}Workspace dependencies:${NC}"
if [ -z "$WORKSPACE_DEPS" ]; then
    echo -e "  ${YELLOW}None${NC}"
else
    for dep in $WORKSPACE_DEPS; do
        if [[ " ${BUNDLED_DEPS[@]} " =~ " ${dep} " ]]; then
            echo -e "  - ${CYAN}$dep${NC} (will be bundled)"
        else
            echo -e "  - ${CYAN}$dep${NC} (external dependency)"
        fi
    done
fi

# Create a clean version of package.json for publishing
if [ ${#BUNDLED_DEPS[@]} -eq 0 ]; then
    echo -e "${YELLOW}No dependencies to bundle. Using original package.json${NC}"
    cp "$PACKAGE_JSON" "$TEMP_PKG_JSON"
else
    echo -e "${YELLOW}Creating modified package.json without bundled dependencies${NC}"
    
    # Create a temporary package.json without the bundled dependencies
    jq -r '.dependencies' "$PACKAGE_JSON" > "$TEMP_DIR/all_deps.json"
    
    # Remove the bundled dependencies
    for dep in "${BUNDLED_DEPS[@]}"; do
        jq "del(.\"$dep\")" "$TEMP_DIR/all_deps.json" > "$TEMP_DIR/temp.json"
        mv "$TEMP_DIR/temp.json" "$TEMP_DIR/all_deps.json"
    done
    
    # Create a new package.json with the modified dependencies
    jq --argjson deps "$(cat $TEMP_DIR/all_deps.json)" '.dependencies = $deps' "$PACKAGE_JSON" > "$TEMP_PKG_JSON"
    
    echo -e "${GREEN}Removed these dependencies (they'll be bundled):${NC}"
    for dep in "${BUNDLED_DEPS[@]}"; do
        echo -e "  - ${CYAN}$dep${NC}"
    done
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

# Verify the build
cd "$PACKAGE_DIR"
echo -e "\n${BLUE}Verifying build...${NC}"
if [ -d "dist" ]; then
    echo -e "${GREEN}✓ dist directory exists${NC}"
    
    # Check for specific bundled dependencies in the output
    for dep in "${BUNDLED_DEPS[@]}"; do
        if grep -q "require('$dep')" dist/index.js || grep -q "from '$dep'" dist/index.mjs; then
            echo -e "${RED}✗ Found direct import of $dep in build output!${NC}"
            echo -e "${RED}The dependency is not properly bundled. Build again with the updated rollup config.${NC}"
            
            # Restore the original package.json
            cp "$BACKUP_PKG_JSON" "$PACKAGE_JSON"
            rm -f "$BACKUP_PKG_JSON"
            rm -rf "$TEMP_DIR"
            exit 1
        else
            echo -e "${GREEN}✓ No direct imports of $dep found in build output${NC}"
        fi
    done
else
    echo -e "${RED}✗ dist directory not found! Build seems to have failed.${NC}"
    
    # Restore the original package.json
    cp "$BACKUP_PKG_JSON" "$PACKAGE_JSON"
    rm -f "$BACKUP_PKG_JSON"
    rm -rf "$TEMP_DIR"
    exit 1
fi
cd "$MONOREPO_ROOT"

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
