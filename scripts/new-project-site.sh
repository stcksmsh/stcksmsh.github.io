#!/usr/bin/env bash
# scripts/new-project-site.sh <path-to-local-clone-of-project-repo> [base-path]
#
# Creates an orphan `website` branch in a LOCAL clone of a project repository,
# populated from docs/project-repo-example/website/ (Level 3, independent
# publication — see AGENTS.md). Commits locally only; never pushes.
#
# The branch is built with git plumbing (temporary index + commit-tree), so
# the clone's checkout, working tree and current branch are never touched.
#
# base-path defaults to "/<Repo>/" (GitHub Pages project URL). Pass "/" for a
# site that will be served from its own hostname.
set -euo pipefail

die() { echo "error: $*" >&2; exit 1; }

[ $# -ge 1 ] && [ $# -le 2 ] || die "usage: $0 <path-to-local-clone> [base-path]"
clone=$1
base=${2:-}
template="$(cd "$(dirname "$0")/.." && pwd)/docs/project-repo-example/website"
[ -d "$template" ] || die "template not found at $template"

git -C "$clone" rev-parse --git-dir >/dev/null 2>&1 || die "$clone is not a git repository"
[ "$(git -C "$clone" rev-parse --is-bare-repository)" = false ] || die "$clone is a bare repository"
clone=$(git -C "$clone" rev-parse --show-toplevel)

if git -C "$clone" show-ref --verify --quiet refs/heads/website; then
  die "a local 'website' branch already exists in $clone — refusing to overwrite it"
fi
if [ -n "$(git -C "$clone" for-each-ref --format='%(refname)' 'refs/remotes/*/website')" ]; then
  die "a remote 'website' branch already exists ($(git -C "$clone" for-each-ref --format='%(refname:short)' 'refs/remotes/*/website' | tr '\n' ' ')) — refusing"
fi

# Repo name and owner from origin (https or ssh GitHub URL), else the directory name.
remote=$(git -C "$clone" remote get-url origin 2>/dev/null || true)
repo=$(basename "${remote:-$clone}" .git)
owner=stcksmsh
if [[ $remote =~ github\.com[:/]([^/]+)/ ]]; then owner=${BASH_REMATCH[1]}; fi
[[ $repo =~ ^[A-Za-z0-9._-]+$ ]] || die "unexpected repository name '$repo'"
[[ $owner =~ ^[A-Za-z0-9-]+$ ]] || die "unexpected owner '$owner'"

# Normalise base path to "/…/" and validate it (it is substituted into files).
[ -n "$base" ] || base="/$repo/"
[[ $base == /* ]] || base="/$base"
[[ $base == */ ]] || base="$base/"
[[ $base =~ ^/([A-Za-z0-9._-]+/)*$ ]] || die "invalid base path '$base'"

if [ "$base" = "/" ]; then
  site_url="https://example.invalid/"
  url_note="  !! publication.json url is a placeholder (base path '/'): set it to the real hostname before pushing."
else
  site_url="https://$owner.github.io$base"
  url_note=""
fi

stage=$(mktemp -d)
trap 'rm -rf "$stage"' EXIT
mkdir "$stage/tree"
cp -R "$template/." "$stage/tree/"
rm -rf "$stage/tree/node_modules" "$stage/tree/dist"
grep -rlZ -e __REPO_NAME__ -e __BASE_PATH__ -e __SITE_URL__ "$stage/tree" | xargs -0 -r sed -i \
  -e "s|__REPO_NAME__|$repo|g" -e "s|__BASE_PATH__|$base|g" -e "s|__SITE_URL__|$site_url|g"

export GIT_INDEX_FILE="$stage/index"
git -C "$clone" --work-tree="$stage/tree" add -A .
tree=$(git -C "$clone" write-tree)
unset GIT_INDEX_FILE
commit=$(git -C "$clone" commit-tree "$tree" -m "Add independent project website (website branch)

Generated from stcksmsh.github.io docs/project-repo-example/website/.
Base path: $base")
# Empty old-value: fails if the branch appeared in the meantime.
git -C "$clone" update-ref refs/heads/website "$commit" ""

cat <<EOF
Created branch 'website' in $clone (commit ${commit:0:7}); nothing was pushed.
  repo: $owner/$repo   base path: $base   url: $site_url
$url_note
Next steps:
  1. Optional local check:
       git -C "$clone" worktree add /tmp/$repo-website website
       cd /tmp/$repo-website && npm install && npm run build   # dist/ uses base $base
  2. Push the branch:
       git -C "$clone" push -u origin website
  3. In the $owner/$repo repository: Settings -> Pages -> Build and deployment
     -> Source: "GitHub Actions". The deploy-website workflow then publishes it.
     Optional: add the SITE_DISPATCH_TOKEN secret so deploys rebuild the root site.
  4. In stcksmsh.github.io's projects.manifest.json, add "website": true to the
     $owner/$repo entry (only once the site is live), then rebuild the root site.
EOF
