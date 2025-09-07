# OpenCode Setup Guide for Linux

This guide helps you set up MCP-SearXNG with OpenCode on Linux.

## Prerequisites
- Node.js 18+ (Ubuntu/Debian: `sudo apt update && sudo apt install nodejs npm`; CentOS/RHEL: `sudo yum install nodejs npm`)
- Docker (Ubuntu/Debian: `sudo apt install docker.io`; CentOS/RHEL: `sudo yum install docker`)
- OpenCode installed

## Step 1: Clone and Setup MCP-SearXNG
```bash
git clone https://github.com/vanfleet-dev/mcp-searxng.git
cd mcp-searxng
./scripts/setup-opencode.sh
```

## Step 2: Set Up SearXNG
1. Copy the example Docker Compose file:
   ```bash
   cp templates/docker-compose.yml.example docker-compose.yml
   cp templates/searxng-settings.yml.example searxng-settings.yml
   ```
2. Edit `searxng-settings.yml` if needed (e.g., change secret_key).
3. Start SearXNG:
   ```bash
   sudo docker-compose up -d
   ```
4. Verify: Open http://localhost:8080 in your browser.

## Step 3: Configure OpenCode
1. Create or edit `~/.config/opencode/opencode.json`:
   ```json
   {
     "mcpServers": {
       "searxng": {
         "command": "node",
         "args": ["/path/to/your/mcp-searxng/dist/index.js"],
         "env": {
           "SEARXNG_URL": "http://localhost:8080"
         }
       }
     }
   }
   ```
   Replace `/path/to/your/mcp-searxng` with the actual path.
2. Validate config:
   ```bash
   ./scripts/validate-config.sh
   ```

## Step 4: Test
Restart OpenCode and try a search query. The MCP server should work.

## Troubleshooting
- If 403 errors: Ensure SearXNG settings disable limiter and botdetection.
- If connection fails: Check SEARXNG_URL and that Docker is running.
- If permission issues: Run Docker commands with sudo or add user to docker group.