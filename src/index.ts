#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { NodeHtmlMarkdown } from "node-html-markdown";
import { HttpsProxyAgent } from "https-proxy-agent";
import { HttpProxyAgent } from "http-proxy-agent";
import {
  createConfigurationError,
  createNetworkError,
  createServerError,
  createJSONError,
  createDataError,
  createNoResultsMessage,
  createURLFormatError,
  createContentError,
  createConversionError,
  createTimeoutError,
  createEmptyContentWarning,
  createUnexpectedError,
  validateEnvironment as validateEnv,
  type ErrorContext
} from "./error-handler.js";

// Use a static version string that will be updated by the version script
const packageVersion = "0.6.0";

const WEB_SEARCH_TOOL: Tool = {
  name: "searxng_web_search",
  description:
    "Performs a web search using the SearXNG API, ideal for general queries, news, articles, and online content. " +
    "Use this for broad information gathering, recent events, or when you need diverse web sources.",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description:
          "The search query. This is the main input for the web search",
      },
      pageno: {
        type: "number",
        description: "Search page number (starts at 1)",
        default: 1,
      },
      time_range: {
        type: "string",
        description: "Time range of search (day, month, year)",
        enum: ["day", "month", "year"],
      },
      language: {
        type: "string",
        description:
          "Language code for search results (e.g., 'en', 'fr', 'de'). Default is instance-dependent.",
        default: "all",
      },
      safesearch: {
        type: "string",
        description:
          "Safe search filter level (0: None, 1: Moderate, 2: Strict)",
        enum: ["0", "1", "2"],
        default: "0",
      },
    },
    required: ["query"],
  },
};

const READ_URL_TOOL: Tool = {
  name: "web_url_read",
  description:
    "Read the content from an URL. " +
    "Use this for further information retrieving to understand the content of each URL.",
  inputSchema: {
    type: "object",
    properties: {
      url: {
        type: "string",
        description: "URL",
      },
    },
    required: ["url"],
  },
};

// Server implementation
const server = new Server(
  {
    name: "ihor-sokoliuk/mcp-searxng",
    version: packageVersion,
  },
  {
    capabilities: {
      resources: {},
      tools: {
        searxng_web_search: {
          description: WEB_SEARCH_TOOL.description,
          schema: WEB_SEARCH_TOOL.inputSchema,
        },
        web_url_read: {
          description: READ_URL_TOOL.description,
          schema: READ_URL_TOOL.inputSchema,
        },
      },
    },
  }
);

interface SearXNGWeb {
  results: Array<{
    title: string;
    content: string;
    url: string;
    score: number;
  }>;
}

function isSearXNGWebSearchArgs(args: unknown): args is {
  query: string;
  pageno?: number;
  time_range?: string;
  language?: string;
  safesearch?: string;
} {
  return (
    typeof args === "object" &&
    args !== null &&
    "query" in args &&
    typeof (args as { query: string }).query === "string"
  );
}

function createProxyAgent(targetUrl: string) {
  const proxyUrl = process.env.HTTP_PROXY || process.env.HTTPS_PROXY || process.env.http_proxy || process.env.https_proxy;

  if (!proxyUrl) {
    return undefined;
  }

  // Validate and normalize proxy URL
  let parsedProxyUrl: URL;
  try {
    parsedProxyUrl = new URL(proxyUrl);
  } catch (error) {
    throw new Error(
      `Invalid proxy URL: ${proxyUrl}. ` +
      "Please provide a valid URL (e.g., http://proxy:8080 or http://user:pass@proxy:8080)"
    );
  }

  // Ensure proxy protocol is supported
  if (!['http:', 'https:'].includes(parsedProxyUrl.protocol)) {
    throw new Error(
      `Unsupported proxy protocol: ${parsedProxyUrl.protocol}. ` +
      "Only HTTP and HTTPS proxies are supported."
    );
  }

  // Reconstruct base proxy URL preserving credentials but removing any path
  const auth = parsedProxyUrl.username ? 
    (parsedProxyUrl.password ? `${parsedProxyUrl.username}:${parsedProxyUrl.password}@` : `${parsedProxyUrl.username}@`) : 
    '';
  const normalizedProxyUrl = `${parsedProxyUrl.protocol}//${auth}${parsedProxyUrl.host}`;

  // Determine if target URL is HTTPS
  const isHttps = targetUrl.startsWith('https:');

  // Create appropriate agent based on target protocol
  return isHttps
    ? new HttpsProxyAgent(normalizedProxyUrl)
    : new HttpProxyAgent(normalizedProxyUrl);
}

async function performWebSearch(
  query: string,
  pageno: number = 1,
  time_range?: string,
  language: string = "all",
  safesearch?: string
) {
  const searxngUrl = process.env.SEARXNG_URL;

  if (!searxngUrl) {
    throw createConfigurationError(
      "SEARXNG_URL not set. Set it to your SearXNG instance (e.g., http://localhost:8080 or https://search.example.com)"
    );
  }

  // Validate that searxngUrl is a valid URL
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(searxngUrl);
  } catch (error) {
    throw createConfigurationError(
      `Invalid SEARXNG_URL format: ${searxngUrl}. Use format: http://localhost:8080`
    );
  }

  // Construct the search URL
  const baseUrl = parsedUrl.origin;
  const url = new URL(`${baseUrl}/search`);

  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("pageno", pageno.toString());

  if (
    time_range !== undefined &&
    ["day", "month", "year"].includes(time_range)
  ) {
    url.searchParams.set("time_range", time_range);
  }

  if (language && language !== "all") {
    url.searchParams.set("language", language);
  }

  if (safesearch !== undefined && ["0", "1", "2"].includes(safesearch)) {
    url.searchParams.set("safesearch", safesearch);
  }

  // Prepare request options with headers
  const requestOptions: RequestInit = {
    method: "GET"
  };

  // Add proxy agent if proxy is configured
  const proxyAgent = createProxyAgent(url.toString());
  if (proxyAgent) {
    (requestOptions as any).agent = proxyAgent;
  }

  // Add basic authentication if credentials are provided
  const username = process.env.AUTH_USERNAME;
  const password = process.env.AUTH_PASSWORD;

  if (username && password) {
    const base64Auth = Buffer.from(`${username}:${password}`).toString('base64');
    requestOptions.headers = {
      ...requestOptions.headers,
      'Authorization': `Basic ${base64Auth}`
    };
  }

  // Fetch with enhanced error handling
  let response: Response;
  try {
    response = await fetch(url.toString(), requestOptions);
  } catch (error: any) {
    const context: ErrorContext = {
      url: url.toString(),
      searxngUrl,
      proxyAgent: !!proxyAgent,
      username
    };
    throw createNetworkError(error, context);
  }

  if (!response.ok) {
    let responseBody: string;
    try {
      responseBody = await response.text();
    } catch {
      responseBody = '[Could not read response body]';
    }

    const context: ErrorContext = {
      url: url.toString(),
      searxngUrl
    };
    throw createServerError(response.status, response.statusText, responseBody, context);
  }

  // Parse JSON response
  let data: SearXNGWeb;
  try {
    data = (await response.json()) as SearXNGWeb;
  } catch (error: any) {
    let responseText: string;
    try {
      responseText = await response.text();
    } catch {
      responseText = '[Could not read response text]';
    }

    const context: ErrorContext = { url: url.toString() };
    throw createJSONError(responseText, context);
  }

  if (!data.results) {
    const context: ErrorContext = { url: url.toString(), query };
    throw createDataError(data, context);
  }

  const results = data.results.map((result) => ({
    title: result.title || "",
    content: result.content || "",
    url: result.url || "",
    score: result.score || 0,
  }));

  if (results.length === 0) {
    return createNoResultsMessage(query);
  }

  return results
    .map((r) => `Title: ${r.title}\nDescription: ${r.content}\nURL: ${r.url}\nRelevance Score: ${r.score.toFixed(3)}`)
    .join("\n\n");
}

async function fetchAndConvertToMarkdown(
  url: string,
  timeoutMs: number = 10000
) {
  // Validate URL format
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch (error) {
    throw createURLFormatError(url);
  }

  // Create an AbortController instance
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // Prepare request options with proxy support
    const requestOptions: RequestInit = {
      signal: controller.signal,
    };

    // Add proxy agent if proxy is configured
    const proxyAgent = createProxyAgent(url);
    if (proxyAgent) {
      (requestOptions as any).agent = proxyAgent;
    }

    let response: Response;
    try {
      // Fetch the URL with the abort signal
      response = await fetch(url, requestOptions);
    } catch (error: any) {
      const context: ErrorContext = {
        url,
        proxyAgent: !!proxyAgent,
        timeout: timeoutMs
      };
      throw createNetworkError(error, context);
    }

    if (!response.ok) {
      let responseBody: string;
      try {
        responseBody = await response.text();
      } catch {
        responseBody = '[Could not read response body]';
      }

      const context: ErrorContext = { url };
      throw createServerError(response.status, response.statusText, responseBody, context);
    }

    // Retrieve HTML content
    let htmlContent: string;
    try {
      htmlContent = await response.text();
    } catch (error: any) {
      throw createContentError(
        `Failed to read website content: ${error.message || 'Unknown error reading content'}`,
        url
      );
    }

    if (!htmlContent || htmlContent.trim().length === 0) {
      throw createContentError("Website returned empty content.", url);
    }

    // Convert HTML to Markdown
    let markdownContent: string;
    try {
      markdownContent = NodeHtmlMarkdown.translate(htmlContent);
    } catch (error: any) {
      throw createConversionError(error, url, htmlContent);
    }

    if (!markdownContent || markdownContent.trim().length === 0) {
      return createEmptyContentWarning(url, htmlContent.length, htmlContent);
    }

    return markdownContent;
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw createTimeoutError(timeoutMs, url);
    }
    // Re-throw our enhanced errors
    if (error.name === 'MCPSearXNGError') {
      throw error;
    }
    
    // Catch any unexpected errors
    const context: ErrorContext = { url };
    throw createUnexpectedError(error, context);
  } finally {
    // Clean up the timeout to prevent memory leaks
    clearTimeout(timeoutId);
  }
}
// Tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [WEB_SEARCH_TOOL, READ_URL_TOOL],
}));

server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
  try {
    const { name, arguments: args } = request.params;

    if (!args) {
      throw new Error("No arguments provided");
    }

    if (name === "searxng_web_search") {
      if (!isSearXNGWebSearchArgs(args)) {
        throw new Error("Invalid arguments for searxng_web_search");
      }
      const {
        query,
        pageno = 1,
        time_range,
        language = "all",
        safesearch,
      } = args;
      const results = await performWebSearch(
        query,
        pageno,
        time_range,
        language,
        safesearch
      );
      return {
        content: [{ type: "text", text: results }],
        isError: false,
      };
    }

    if (name === "web_url_read") {
      const { url } = args;
      const result = await fetchAndConvertToMarkdown(url as string);
      return {
        content: [{ type: "text", text: result }],
        isError: false,
      };
    }

    return {
      content: [{ type: "text", text: `Unknown tool: ${name}` }],
      isError: true,
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)
            }`,
        },
      ],
      isError: true,
    };
  }
});

async function runServer() {
  // Brief environment check on startup
  const envValidation = validateEnv();
  if (envValidation) {
    console.error(`⚠️  ${envValidation}`);
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
