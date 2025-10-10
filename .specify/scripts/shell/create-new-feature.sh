#!/usr/bin/env bash
# Create a new feature
set -euo pipefail

# Parse arguments
JSON_OUTPUT=false
FEATURE_DESC=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --json|-Json)
      JSON_OUTPUT=true
      shift
      ;;
    *)
      FEATURE_DESC="$FEATURE_DESC $1"
      shift
      ;;
  esac
done

FEATURE_DESC=$(echo "$FEATURE_DESC" | xargs)

if [[ -z "$FEATURE_DESC" ]]; then
  echo "Usage: ./create-new-feature.sh [--json] <feature description>" >&2
  exit 1
fi

# Find repository root
find_repo_root() {
  local current="$PWD"
  while [[ "$current" != "/" ]]; do
    if [[ -d "$current/.git" ]] || [[ -d "$current/.specify" ]]; then
      echo "$current"
      return 0
    fi
    current=$(dirname "$current")
  done
  return 1
}

REPO_ROOT=$(find_repo_root)
if [[ -z "$REPO_ROOT" ]]; then
  echo "Error: Could not determine repository root. Please run this script from within the repository." >&2
  exit 1
fi

cd "$REPO_ROOT"

# Check if git is available
HAS_GIT=false
if command -v git &> /dev/null && git rev-parse --is-inside-work-tree &> /dev/null; then
  HAS_GIT=true
fi

# Create specs directory
SPECS_DIR="$REPO_ROOT/specs"
mkdir -p "$SPECS_DIR"

# Find highest feature number
HIGHEST=0
if [[ -d "$SPECS_DIR" ]]; then
  for dir in "$SPECS_DIR"/*; do
    if [[ -d "$dir" ]]; then
      basename=$(basename "$dir")
      if [[ $basename =~ ^([0-9]{3}) ]]; then
        num=${BASH_REMATCH[1]}
        num=$((10#$num))  # Force base 10 interpretation
        if [[ $num -gt $HIGHEST ]]; then
          HIGHEST=$num
        fi
      fi
    fi
  done
fi

NEXT=$((HIGHEST + 1))
FEATURE_NUM=$(printf "%03d" $NEXT)

# Generate branch name from feature description
BRANCH_NAME=$(echo "$FEATURE_DESC" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/-\+/-/g' | sed 's/^-//;s/-$//')
WORDS=($(echo "$BRANCH_NAME" | tr '-' ' '))
BRANCH_NAME="$FEATURE_NUM"
for i in {0..2}; do
  if [[ -n "${WORDS[$i]:-}" ]]; then
    BRANCH_NAME="$BRANCH_NAME-${WORDS[$i]}"
  fi
done

# Create git branch if git is available
if [[ "$HAS_GIT" == "true" ]]; then
  if git checkout -b "$BRANCH_NAME" 2>/dev/null; then
    : # Branch created successfully
  else
    echo "Warning: Failed to create git branch: $BRANCH_NAME" >&2
  fi
else
  echo "Warning: Git repository not detected; skipped branch creation for $BRANCH_NAME" >&2
fi

# Create feature directory
FEATURE_DIR="$SPECS_DIR/$BRANCH_NAME"
mkdir -p "$FEATURE_DIR"

# Copy template
TEMPLATE="$REPO_ROOT/.specify/templates/spec-template.md"
SPEC_FILE="$FEATURE_DIR/spec.md"
if [[ -f "$TEMPLATE" ]]; then
  cp "$TEMPLATE" "$SPEC_FILE"
else
  touch "$SPEC_FILE"
fi

# Set environment variable
export SPECIFY_FEATURE="$BRANCH_NAME"

# Output results
if [[ "$JSON_OUTPUT" == "true" ]]; then
  echo "{\"BRANCH_NAME\":\"$BRANCH_NAME\",\"SPEC_FILE\":\"$SPEC_FILE\",\"FEATURE_NUM\":\"$FEATURE_NUM\",\"HAS_GIT\":$HAS_GIT}"
else
  echo "BRANCH_NAME: $BRANCH_NAME"
  echo "SPEC_FILE: $SPEC_FILE"
  echo "FEATURE_NUM: $FEATURE_NUM"
  echo "HAS_GIT: $HAS_GIT"
  echo "SPECIFY_FEATURE environment variable set to: $BRANCH_NAME"
fi
