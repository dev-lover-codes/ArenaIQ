#!/bin/bash

echo "�� Starting Master Workspace Setup..."

echo -e "\n--- Installing Global Tools ---"
npm install -g firebase-tools vercel @_davideast/stitch-mcp --yes
npm install supabase --save-dev --yes

echo -e "\n--- 1. FIREBASE PROJECTS ---"
firebase projects:list || echo "⚠️ Firebase not authenticated. Run 'firebase login --reauth --no-localhost' later."

echo -e "\n--- 2. VERCEL PROJECTS ---"
VERCEL_ACCESS_TOKEN=YOUR_VERCEL_ACCESS_TOKEN_HERE vercel project ls || true

echo -e "\n--- 3. SUPABASE PROJECTS ---"
SUPABASE_ACCESS_TOKEN=YOUR_SUPABASE_ACCESS_TOKEN_HERE npx supabase projects list || true

echo -e "\n--- 4. STITCH PROJECTS (Auto-closing in 3 seconds) ---"
STITCH_API_KEY=YOUR_STITCH_API_KEY_HERE timeout 3s npx @_davideast/stitch-mcp view --projects || true

echo -e "\n--- 5. AI TOOLS & EXTENSIONS ---"
echo "Installing Cline..."
echo Y | npx -y @21st-dev/cli@latest install cline --api-key YOUR_21ST_DEV_API_KEY_HERE || true

echo "Installing Gemini CLI..."
npm install -g @google/gemini-cli

echo "Installing Gemini Extensions..."
gemini extensions install https://github.com/gemini-cli-extensions/ralph --consent || true
gemini extensions install https://github.com/gemini-cli-extensions/stitch --consent || true
gemini extensions install https://github.com/supabase-community/gemini-extension --consent || true
gemini extensions install https://github.com/firebase/agent-skills --consent || true
gemini extensions install https://github.com/ZhanZiyuan/vercel-mcp --consent || true
gemini extensions install https://github.com/netlify/context-and-tools --consent || true

echo "Installing and Configuring Get-Shit-Done (GSD)..."
npm install -g get-shit-done-cc
npx get-shit-done-cc --gemini --global --consent || true
npx get-shit-done-cc --antigravity --global --consent || true

echo -e "\n--- 6. ANTIGRAVITY CLI ---"
echo "Downloading and bypassing permissions for Antigravity..."
curl -fsSL https://antigravity.google/cli/install.sh | bash
~/.local/bin/agy --dangerously-skip-permissions

echo -e "\n✅ Setup Complete! Your environment is ready."
