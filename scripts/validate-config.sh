#!/bin/bash

# Simple validation script for OpenCode config
# Checks if opencode.json has the searxng MCP server configured

CONFIG_FILE="$HOME/.config/opencode/opencode.json"

if [ ! -f "$CONFIG_FILE" ]; then
    echo "Error: $CONFIG_FILE not found. Please create it."
    exit 1
fi

# Check if searxng is in mcpServers
if grep -q '"searxng"' "$CONFIG_FILE"; then
    echo "✓ SearXNG MCP server found in config."
else
    echo "✗ SearXNG MCP server not found in $CONFIG_FILE."
    echo "Add it using the example in templates/opencode.json.example"
    exit 1
fi

# Check if SEARXNG_URL is set in env
if grep -q '"SEARXNG_URL"' "$CONFIG_FILE"; then
    echo "✓ SEARXNG_URL environment variable found."
else
    echo "✗ SEARXNG_URL not set. Add it to the env section."
    exit 1
fi

echo "Config validation passed!"