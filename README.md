# SearXNG MCP Server

An [MCP server](https://modelcontextprotocol.io/introduction) implementation that integrates the [SearXNG](https://docs.searxng.org) API, providing web search capabilities.

[![https://nodei.co/npm/mcp-searxng.png?downloads=true&downloadRank=true&stars=true](https://nodei.co/npm/mcp-searxng.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/mcp-searxng)

[![https://badgen.net/docker/pulls/isokoliuk/mcp-searxng](https://badgen.net/docker/pulls/isokoliuk/mcp-searxng)](https://hub.docker.com/r/isokoliuk/mcp-searxng)

<a href="https://glama.ai/mcp/servers/0j7jjyt7m9"><img width="380" height="200" src="https://glama.ai/mcp/servers/0j7jjyt7m9/badge" alt="SearXNG Server MCP server" /></a>

## Features

- **Web Search**: General queries, news, articles, with pagination.
- **Pagination**: Control which page of results to retrieve.
- **Time Filtering**: Filter results by time range (day, month, year).
- **Language Selection**: Filter results by preferred language.
- **Safe Search**: Control content filtering level for search results.

## Tools

- **searxng_web_search**
  - Execute web searches with pagination
  - Inputs:
    - `query` (string): The search query. This string is passed to external search services.
    - `pageno` (number, optional): Search page number, starts at 1 (default 1)
    - `time_range` (string, optional): Filter results by time range - one of: "day", "month", "year" (default: none)
    - `language` (string, optional): Language code for results (e.g., "en", "fr", "de") or "all" (default: "all")
    - `safesearch` (number, optional): Safe search filter level (0: None, 1: Moderate, 2: Strict) (default: instance setting)

- **web_url_read**
  - Read and convert the content from a URL to markdown
  - Inputs:
    - `url` (string): The URL to fetch and process

## Configuration

### Setting the SEARXNG_URL

The `SEARXNG_URL` environment variable defines which SearxNG instance to connect to.

#### Environment Variable Format
```bash
SEARXNG_URL=<protocol>://<hostname>[:<port>]
```

#### Examples
```bash
# Local development (default)
SEARXNG_URL=http://localhost:8080

# Public instance
SEARXNG_URL=https://search.example.com

# Custom port
SEARXNG_URL=http://my-searxng.local:3000
```

#### Setup Instructions
1. Choose a SearxNG instance from the [list of public instances](https://searx.space/) or use your local environment
2. Set the `SEARXNG_URL` environment variable to the complete instance URL
3. If not specified, the default value `http://localhost:8080` will be used

### Using Authentication (Optional)

If you are using a password protected SearxNG instance you can set a username and password for HTTP Basic Auth:

- Set the `AUTH_USERNAME` environment variable to your username
- Set the `AUTH_PASSWORD` environment variable to your password

**Note:** Authentication is only required for password-protected SearxNG instances. See the usage examples below for how to configure authentication with different installation methods.

### Proxy Support (Optional)

The server supports HTTP and HTTPS proxies through environment variables. This is useful when running behind corporate firewalls or when you need to route traffic through a specific proxy server.

#### Proxy Environment Variables

Set one or more of these environment variables to configure proxy support:

- `HTTP_PROXY`: Proxy URL for HTTP requests
- `HTTPS_PROXY`: Proxy URL for HTTPS requests  
- `http_proxy`: Alternative lowercase version for HTTP requests
- `https_proxy`: Alternative lowercase version for HTTPS requests

#### Proxy URL Formats

The proxy URL can be in any of these formats:

```bash
# Basic proxy
export HTTP_PROXY=http://proxy.company.com:8080
export HTTPS_PROXY=http://proxy.company.com:8080

# Proxy with authentication
export HTTP_PROXY=http://username:password@proxy.company.com:8080
export HTTPS_PROXY=http://username:password@proxy.company.com:8080
```

**Note:** If no proxy environment variables are set, the server will make direct connections as normal. See the usage examples below for how to configure proxy settings with different installation methods.

## OpenCode Integration

This branch (`opencode-integration`) provides enhanced support for integrating MCP-SearXNG with OpenCode. It includes templates, scripts, and documentation specifically for OpenCode users.

### Quick Start for OpenCode

1. **Clone this branch:**
   ```bash
   git clone -b opencode-integration https://github.com/vanfleet-dev/mcp-searxng.git
   cd mcp-searxng
   ```

2. **Run setup script:**
   ```bash
   ./scripts/setup-opencode.sh
   ```

3. **Set up SearXNG:**
   ```bash
   cp templates/docker-compose.yml.example docker-compose.yml
   cp templates/searxng-settings.yml.example searxng-settings.yml
   docker-compose up -d
   ```

4. **Configure OpenCode:**
   ```bash
   cp templates/opencode.json.example ~/.config/opencode/opencode.json
   # Edit the path in opencode.json to point to your mcp-searxng/dist/index.js
   ./scripts/validate-config.sh
   ```

5. **Restart OpenCode** and test with a search query.

### Resources
- **macOS Setup Guide:** [docs/opencode-setup-macos.md](docs/opencode-setup-macos.md)
- **Linux Setup Guide:** [docs/opencode-setup-linux.md](docs/opencode-setup-linux.md)
- **Troubleshooting:** [docs/troubleshooting.md](docs/troubleshooting.md)
- **Templates:** [templates/](templates/) - Example configs for OpenCode, Docker, and SearXNG
- **Scripts:** [scripts/](scripts/) - Setup and validation scripts

### Key Features for OpenCode
- Pre-configured templates with working headers to avoid 403 errors
- Simple validation scripts for config files
- Platform-specific documentation (macOS/Linux)
- Modular design - opt-in enhancements without affecting core functionality

### [NPX](https://www.npmjs.com/package/mcp-searxng)

#### Basic Configuration
```json
{
  "mcpServers": {
    "searxng": {
      "command": "npx",
      "args": ["-y", "mcp-searxng"],
      "env": {
        "SEARXNG_URL": "YOUR_SEARXNG_INSTANCE_URL"
      }
    }
  }
}
```

#### With Authentication
```json
{
  "mcpServers": {
    "searxng": {
      "command": "npx",
      "args": ["-y", "mcp-searxng"],
      "env": {
        "SEARXNG_URL": "YOUR_SEARXNG_INSTANCE_URL",
        "AUTH_USERNAME": "your_username",
        "AUTH_PASSWORD": "your_password"
      }
    }
  }
}
```

#### With Proxy Support
```json
{
  "mcpServers": {
    "searxng": {
      "command": "npx",
      "args": ["-y", "mcp-searxng"],
      "env": {
        "SEARXNG_URL": "YOUR_SEARXNG_INSTANCE_URL",
        "HTTP_PROXY": "http://proxy.company.com:8080",
        "HTTPS_PROXY": "http://proxy.company.com:8080"
      }
    }
  }
}
```

#### With Authentication and Proxy Support
```json
{
  "mcpServers": {
    "searxng": {
      "command": "npx",
      "args": ["-y", "mcp-searxng"],
      "env": {
        "SEARXNG_URL": "YOUR_SEARXNG_INSTANCE_URL",
        "AUTH_USERNAME": "your_username",
        "AUTH_PASSWORD": "your_password",
        "HTTP_PROXY": "http://proxy.company.com:8080",
        "HTTPS_PROXY": "http://proxy.company.com:8080"
      }
    }
  }
}
```

### [NPM](https://www.npmjs.com/package/mcp-searxng)

```bash
npm install -g mcp-searxng
```

#### Basic Configuration
```json
{
  "mcpServers": {
    "searxng": {
      "command": "mcp-searxng",
      "env": {
        "SEARXNG_URL": "YOUR_SEARXNG_INSTANCE_URL"
      }
    }
  }
}
```

#### With Authentication
```json
{
  "mcpServers": {
    "searxng": {
      "command": "mcp-searxng",
      "env": {
        "SEARXNG_URL": "YOUR_SEARXNG_INSTANCE_URL",
        "AUTH_USERNAME": "your_username",
        "AUTH_PASSWORD": "your_password"
      }
    }
  }
}
```

#### With Proxy Support
```json
{
  "mcpServers": {
    "searxng": {
      "command": "mcp-searxng",
      "env": {
        "SEARXNG_URL": "YOUR_SEARXNG_INSTANCE_URL",
        "HTTP_PROXY": "http://proxy.company.com:8080",
        "HTTPS_PROXY": "http://proxy.company.com:8080"
      }
    }
  }
}
```

#### With Authentication and Proxy Support
```json
{
  "mcpServers": {
    "searxng": {
      "command": "mcp-searxng",
      "env": {
        "SEARXNG_URL": "YOUR_SEARXNG_INSTANCE_URL",
        "AUTH_USERNAME": "your_username",
        "AUTH_PASSWORD": "your_password",
        "HTTP_PROXY": "http://proxy.company.com:8080",
        "HTTPS_PROXY": "http://proxy.company.com:8080"
      }
    }
  }
}
```

### Docker

#### Using [Pre-built Image from Docker Hub](https://hub.docker.com/r/isokoliuk/mcp-searxng)

```bash
docker pull isokoliuk/mcp-searxng:latest
```

##### Basic Configuration
```json
{
  "mcpServers": {
    "searxng": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm",
        "-e", "SEARXNG_URL",
        "isokoliuk/mcp-searxng:latest"
      ],
      "env": {
        "SEARXNG_URL": "YOUR_SEARXNG_INSTANCE_URL"
      }
    }
  }
}
```

##### With Authentication
```json
{
  "mcpServers": {
    "searxng": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm",
        "-e", "SEARXNG_URL",
        "-e", "AUTH_USERNAME",
        "-e", "AUTH_PASSWORD",
        "isokoliuk/mcp-searxng:latest"
      ],
      "env": {
        "SEARXNG_URL": "YOUR_SEARXNG_INSTANCE_URL",
        "AUTH_USERNAME": "your_username",
        "AUTH_PASSWORD": "your_password"
      }
    }
  }
}
```

##### With Proxy Support
```json
{
  "mcpServers": {
    "searxng": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm",
        "-e", "SEARXNG_URL",
        "-e", "HTTP_PROXY",
        "-e", "HTTPS_PROXY",
        "isokoliuk/mcp-searxng:latest"
      ],
      "env": {
        "SEARXNG_URL": "YOUR_SEARXNG_INSTANCE_URL",
        "HTTP_PROXY": "http://proxy.company.com:8080",
        "HTTPS_PROXY": "http://proxy.company.com:8080"
      }
    }
  }
}
```

##### With Authentication and Proxy Support
```json
{
  "mcpServers": {
    "searxng": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm",
        "-e", "SEARXNG_URL",
        "-e", "AUTH_USERNAME",
        "-e", "AUTH_PASSWORD",
        "-e", "HTTP_PROXY",
        "-e", "HTTPS_PROXY",
        "isokoliuk/mcp-searxng:latest"
      ],
      "env": {
        "SEARXNG_URL": "YOUR_SEARXNG_INSTANCE_URL",
        "AUTH_USERNAME": "your_username",
        "AUTH_PASSWORD": "your_password",
        "HTTP_PROXY": "http://proxy.company.com:8080",
        "HTTPS_PROXY": "http://proxy.company.com:8080"
      }
    }
  }
}
```

#### Build Locally

```bash
docker build -t mcp-searxng:latest -f Dockerfile .
```

##### Basic Configuration
```json
{
  "mcpServers": {
    "searxng": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm",
        "-e", "SEARXNG_URL",
        "mcp-searxng:latest"
      ],
      "env": {
        "SEARXNG_URL": "YOUR_SEARXNG_INSTANCE_URL"
      }
    }
  }
}
```

##### With Authentication
```json
{
  "mcpServers": {
    "searxng": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm",
        "-e", "SEARXNG_URL",
        "-e", "AUTH_USERNAME",
        "-e", "AUTH_PASSWORD",
        "mcp-searxng:latest"
      ],
      "env": {
        "SEARXNG_URL": "YOUR_SEARXNG_INSTANCE_URL",
        "AUTH_USERNAME": "your_username",
        "AUTH_PASSWORD": "your_password"
      }
    }
  }
}
```

##### With Proxy Support
```json
{
  "mcpServers": {
    "searxng": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm",
        "-e", "SEARXNG_URL",
        "-e", "HTTP_PROXY",
        "-e", "HTTPS_PROXY",
        "mcp-searxng:latest"
      ],
      "env": {
        "SEARXNG_URL": "YOUR_SEARXNG_INSTANCE_URL",
        "HTTP_PROXY": "http://proxy.company.com:8080",
        "HTTPS_PROXY": "http://proxy.company.com:8080"
      }
    }
  }
}
```

##### With Authentication and Proxy Support
```json
{
  "mcpServers": {
    "searxng": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm",
        "-e", "SEARXNG_URL",
        "-e", "AUTH_USERNAME",
        "-e", "AUTH_PASSWORD",
        "-e", "HTTP_PROXY",
        "-e", "HTTPS_PROXY",
        "mcp-searxng:latest"
      ],
      "env": {
        "SEARXNG_URL": "YOUR_SEARXNG_INSTANCE_URL",
        "AUTH_USERNAME": "your_username",
        "AUTH_PASSWORD": "your_password",
        "HTTP_PROXY": "http://proxy.company.com:8080",
        "HTTPS_PROXY": "http://proxy.company.com:8080"
      }
    }
  }
}
```

### HTTP Transport (Optional)

The server supports both STDIO (default) and HTTP transports:

#### STDIO Transport (Default)
- **Best for**: Claude Desktop and most MCP clients
- **Usage**: Automatic - no additional configuration needed

#### HTTP Transport  
- **Best for**: Web-based applications and remote MCP clients
- **Usage**: Set the `MCP_HTTP_PORT` environment variable

##### Basic HTTP Server Configuration
```json
{
  "mcpServers": {
    "searxng-http": {
      "command": "mcp-searxng",
      "env": {
        "SEARXNG_URL": "YOUR_SEARXNG_INSTANCE_URL",
        "MCP_HTTP_PORT": "3000"
      }
    }
  }
}
```

##### HTTP Server with Authentication
```json
{
  "mcpServers": {
    "searxng-http": {
      "command": "mcp-searxng",
      "env": {
        "SEARXNG_URL": "YOUR_SEARXNG_INSTANCE_URL",
        "MCP_HTTP_PORT": "3000",
        "AUTH_USERNAME": "your_username",
        "AUTH_PASSWORD": "your_password"
      }
    }
  }
}
```

##### HTTP Server with Proxy Support
```json
{
  "mcpServers": {
    "searxng-http": {
      "command": "mcp-searxng",
      "env": {
        "SEARXNG_URL": "YOUR_SEARXNG_INSTANCE_URL",
        "MCP_HTTP_PORT": "3000",
        "HTTP_PROXY": "http://proxy.company.com:8080",
        "HTTPS_PROXY": "http://proxy.company.com:8080"
      }
    }
  }
}
```

##### HTTP Server with Authentication and Proxy Support
```json
{
  "mcpServers": {
    "searxng-http": {
      "command": "mcp-searxng",
      "env": {
        "SEARXNG_URL": "YOUR_SEARXNG_INSTANCE_URL",
        "MCP_HTTP_PORT": "3000",
        "AUTH_USERNAME": "your_username",
        "AUTH_PASSWORD": "your_password",
        "HTTP_PROXY": "http://proxy.company.com:8080",
        "HTTPS_PROXY": "http://proxy.company.com:8080"
      }
    }
  }
}
```

**HTTP Endpoints:**
- **MCP Protocol**: `POST/GET/DELETE /mcp` 
- **Health Check**: `GET /health`
- **CORS**: Enabled for web clients

**Testing HTTP Server:**
```bash
# Start HTTP server
MCP_HTTP_PORT=3000 SEARXNG_URL=http://localhost:8080 mcp-searxng

# Check health
curl http://localhost:3000/health
```

## Running evals

The evals package loads an mcp client that then runs the src/index.ts file, so there is no need to rebuild between tests. You can see the full documentation [here](https://www.mcpevals.io/docs).

```bash
SEARXNG_URL=SEARXNG_URL OPENAI_API_KEY=your-key npx mcp-eval evals.ts src/index.ts
```

## For Developers

### Contributing to the Project

We welcome contributions! Here's how to get started:

#### 0. Coding Guidelines

- Use TypeScript for type safety
- Follow existing error handling patterns
- Keep error messages concise but informative
- Write unit tests for new functionality
- Ensure all tests pass before submitting PRs
- Maintain test coverage above 90%
- Test changes with the MCP inspector
- Run evals before submitting PRs

#### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/mcp-searxng.git
cd mcp-searxng

# Add the original repository as upstream
git remote add upstream https://github.com/ihor-sokoliuk/mcp-searxng.git
```

#### 2. Development Setup

```bash
# Install dependencies
npm install

# Start development with file watching
npm run watch
```

#### 3. Development Workflow

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** in `src/` directory
   - Main server logic: `src/index.ts`
   - Error handling: `src/error-handler.ts`

3. **Build and test:**
   ```bash
   npm run build               # Build the project
   npm test                     # Run unit tests
   npm run test:coverage       # Run tests with coverage report
   npm run inspector            # Run MCP inspector
   ```

4. **Run evals to ensure functionality:**
   ```bash
   SEARXNG_URL=http://localhost:8080 OPENAI_API_KEY=your-key npx mcp-eval evals.ts src/index.ts
   ```

#### 4. Submitting Changes

```bash
# Commit your changes
git add .
git commit -m "feat: description of your changes"

# Push to your fork
git push origin feature/your-feature-name

# Create a Pull Request on GitHub
```

### Testing

The project includes comprehensive unit tests with excellent coverage.

#### Running Tests

```bash
# Run all tests
npm test

# Run with coverage reporting
npm run test:coverage

# Watch mode for development
npm run test:watch
```

#### Test Statistics
- **Unit tests** covering all core modules
- **100% success rate** with dynamic coverage reporting via c8
- **HTML coverage reports** generated in `coverage/` directory

#### What's Tested
- Error handling (network, server, configuration errors)
- Type validation and schema guards
- Proxy configurations and environment variables
- Resource generation and logging functionality
- All module imports and function availability

## License

This MCP server is licensed under the MIT License. This means you are free to use, modify, and distribute the software, subject to the terms and conditions of the MIT License. For more details, please see the LICENSE file in the project repository.
