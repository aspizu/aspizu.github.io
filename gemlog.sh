#!/bin/bash

# Ensure a title is provided
if [[ -z "$1" ]]; then
  echo "Usage: $0 \"Post Title\""
  exit 1
fi

# Convert title to lowercase and replace spaces with hyphens
title=$(echo "$1" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')

# Define post file path
p="./gemini/posts/$title.gmi"

# Create the post file with front matter
{
  echo "---"
  echo "date: $(date +"%Y-%m-%d")"
  echo "---"
} > "$p"

# Open the file in the editor
code "$p"
