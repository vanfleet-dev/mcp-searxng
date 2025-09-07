#!/bin/bash

# Simple setup script for MCP-SearXNG with OpenCode
# Run this from the mcp-searxng directory

set -e

echo "Setting up MCP-SearXNG for OpenCode..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js (version 18+) and try again."
    echo "macOS: brew install node"
    echo "Linux: Use your package manager (e.g., apt install nodejs npm)"
    exit 1
fi

echo "Installing dependencies..."
npm install

echo "Building the project..."
npm run build

echo "Setup complete! The built server is in dist/index.js"
echo "Next: Configure OpenCode by adding the MCP server to ~/.config/opencode/opencode.json"
echo "See templates/opencode.json.example for an example."