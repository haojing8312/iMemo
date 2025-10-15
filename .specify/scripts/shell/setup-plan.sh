#!/usr/bin/env bash
# Setup implementation plan for a feature

set -e

# Parse arguments
JSON_OUTPUT=false
SHOW_HELP=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --json)
            JSON_OUTPUT=true
            shift
            ;;
        --help|-h)
            SHOW_HELP=true
            shift
            ;;
        *)
            echo "Unknown option: $1" >&2
            exit 1
            ;;
    esac
done

# Show help if requested
if [ "$SHOW_HELP" = true ]; then
    echo "Usage: ./setup-plan.sh [--json] [--help]"
    echo "  --json    Output results in JSON format"
    echo "  --help    Show this help message"
    exit 0
fi

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Load common functions
source "$SCRIPT_DIR/common.sh"

# Get all paths and variables from common functions
PATHS_JSON=$(get_feature_paths_env)

# Parse JSON using grep and sed (portable approach)
REPO_ROOT=$(echo "$PATHS_JSON" | grep '"REPO_ROOT"' | sed 's/.*: "\(.*\)".*/\1/')
CURRENT_BRANCH=$(echo "$PATHS_JSON" | grep '"CURRENT_BRANCH"' | sed 's/.*: "\(.*\)".*/\1/')
HAS_GIT=$(echo "$PATHS_JSON" | grep '"HAS_GIT"' | sed 's/.*: \(.*\).*/\1/' | tr -d ',')
FEATURE_DIR=$(echo "$PATHS_JSON" | grep '"FEATURE_DIR"' | sed 's/.*: "\(.*\)".*/\1/')
FEATURE_SPEC=$(echo "$PATHS_JSON" | grep '"FEATURE_SPEC"' | sed 's/.*: "\(.*\)".*/\1/')
IMPL_PLAN=$(echo "$PATHS_JSON" | grep '"IMPL_PLAN"' | sed 's/.*: "\(.*\)".*/\1/')

# Check if we're on a proper feature branch (only for git repos)
if ! test_feature_branch "$CURRENT_BRANCH" "$HAS_GIT"; then
    exit 1
fi

# Ensure the feature directory exists
mkdir -p "$FEATURE_DIR"

# Copy plan template if it exists, otherwise note it or create empty file
TEMPLATE="$REPO_ROOT/.specify/templates/plan-template.md"
if [ -f "$TEMPLATE" ]; then
    cp "$TEMPLATE" "$IMPL_PLAN"
    echo "Copied plan template to $IMPL_PLAN" >&2
else
    echo "Warning: Plan template not found at $TEMPLATE" >&2
    # Create a basic plan file if template doesn't exist
    touch "$IMPL_PLAN"
fi

# Output results
if [ "$JSON_OUTPUT" = true ]; then
    echo "$PATHS_JSON"
else
    echo "FEATURE_SPEC: $FEATURE_SPEC"
    echo "IMPL_PLAN: $IMPL_PLAN"
    echo "SPECS_DIR: $FEATURE_DIR"
    echo "BRANCH: $CURRENT_BRANCH"
    echo "HAS_GIT: $HAS_GIT"
fi
