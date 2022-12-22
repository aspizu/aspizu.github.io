#!/bin/bash
set -e

function ExtractFileName {
  BASE=$(basename $1)
  echo "${BASE%.*}"
}

rm -rf built
mkdir -p built

mkdir -p built/js
for i in src/js/*.js; do
  jixen $i built/js/$(ExtractFileName $i).js
done

mkdir -p built/css
for i in src/css/*.scss; do
  sass $i:built/css/$(ExtractFileName $i).css
done

python sitemap.py > built/sitemap.html
