#!/bin/bash

# Build your gem posts
bun run ./gemini/index.ts

# Change to the directory to sync
cd ./gemini/dist/

scp -r ./* aspizu@tilde.club:/home/aspizu/public_gemini
