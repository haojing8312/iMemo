#!/usr/bin/env bash
# Common shell functions for speckit

get_repo_root() {
    if git rev-parse --show-toplevel >/dev/null 2>&1; then
        git rev-parse --show-toplevel
    else
        # Fall back to script location for non-git repos
        cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd
    fi
}

get_current_branch() {
    # First check if SPECIFY_FEATURE environment variable is set
    if [ -n "$SPECIFY_FEATURE" ]; then
        echo "$SPECIFY_FEATURE"
        return
    fi

    # Then check git if available
    if git rev-parse --abbrev-ref HEAD >/dev/null 2>&1; then
        git rev-parse --abbrev-ref HEAD
        return
    fi

    # For non-git repos, try to find the latest feature directory
    local repo_root
    repo_root=$(get_repo_root)
    local specs_dir="$repo_root/specs"

    if [ -d "$specs_dir" ]; then
        local latest_feature=""
        local highest=0

        for dir in "$specs_dir"/*; do
            if [ -d "$dir" ]; then
                local basename
                basename=$(basename "$dir")
                if [[ "$basename" =~ ^([0-9]{3})- ]]; then
                    local num="${BASH_REMATCH[1]}"
                    # Remove leading zeros for comparison
                    num=$((10#$num))
                    if [ "$num" -gt "$highest" ]; then
                        highest=$num
                        latest_feature="$basename"
                    fi
                fi
            fi
        done

        if [ -n "$latest_feature" ]; then
            echo "$latest_feature"
            return
        fi
    fi

    # Final fallback
    echo "main"
}

test_has_git() {
    git rev-parse --show-toplevel >/dev/null 2>&1
    return $?
}

test_feature_branch() {
    local branch="$1"
    local has_git="$2"

    # For non-git repos, we can't enforce branch naming but still provide output
    if [ "$has_git" != "true" ]; then
        echo "[specify] Warning: Git repository not detected; skipped branch validation" >&2
        return 0
    fi

    if ! [[ "$branch" =~ ^[0-9]{3}- ]]; then
        echo "ERROR: Not on a feature branch. Current branch: $branch" >&2
        echo "Feature branches should be named like: 001-feature-name" >&2
        return 1
    fi
    return 0
}

get_feature_dir() {
    local repo_root="$1"
    local branch="$2"
    echo "$repo_root/specs/$branch"
}

get_feature_paths_env() {
    local repo_root
    repo_root=$(get_repo_root)

    local current_branch
    current_branch=$(get_current_branch)

    local has_git="false"
    if test_has_git; then
        has_git="true"
    fi

    local feature_dir
    feature_dir=$(get_feature_dir "$repo_root" "$current_branch")

    # Export as JSON
    cat <<EOF
{
  "REPO_ROOT": "$repo_root",
  "CURRENT_BRANCH": "$current_branch",
  "HAS_GIT": $has_git,
  "FEATURE_DIR": "$feature_dir",
  "FEATURE_SPEC": "$feature_dir/spec.md",
  "IMPL_PLAN": "$feature_dir/plan.md",
  "TASKS": "$feature_dir/tasks.md",
  "RESEARCH": "$feature_dir/research.md",
  "DATA_MODEL": "$feature_dir/data-model.md",
  "QUICKSTART": "$feature_dir/quickstart.md",
  "CONTRACTS_DIR": "$feature_dir/contracts"
}
EOF
}

test_file_exists() {
    local path="$1"
    local description="$2"
    if [ -f "$path" ]; then
        echo "  ✓ $description"
        return 0
    else
        echo "  ✗ $description"
        return 1
    fi
}

test_dir_has_files() {
    local path="$1"
    local description="$2"
    if [ -d "$path" ] && [ -n "$(find "$path" -maxdepth 1 -type f -print -quit)" ]; then
        echo "  ✓ $description"
        return 0
    else
        echo "  ✗ $description"
        return 1
    fi
}
