import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { NodeHtmlMarkdown } from "node-html-markdown";
import { createProxyAgent } from "./proxy.js";
import { logMessage } from "./logging.js";
import {
  createURLFormatError,
  createNetworkError,
  createServerError,
  createContentError,
  createConversionError,
  createTimeoutError,
  createEmptyContentWarning,
  createUnexpectedError,
  type ErrorContext
} from "./error-handler.js";

export async function fetchAndConvertToMarkdown(
  server: Server,
  url: string,
  timeoutMs: number = 10000
) {
  const startTime = Date.now();
  logMessage(server, "info", `Fetching URL: ${url}`);
  
  // Validate URL format
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch (error) {
    logMessage(server, "error", `Invalid URL format: ${url}`);
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
      logMessage(server, "warning", `Empty content after conversion: ${url}`);
      return createEmptyContentWarning(url, htmlContent.length, htmlContent);
    }

    const duration = Date.now() - startTime;
    logMessage(server, "info", `Successfully fetched and converted URL: ${url} (${markdownContent.length} chars in ${duration}ms)`);
    return markdownContent;
  } catch (error: any) {
    if (error.name === "AbortError") {
      logMessage(server, "error", `Timeout fetching URL: ${url} (${timeoutMs}ms)`);
      throw createTimeoutError(timeoutMs, url);
    }
    // Re-throw our enhanced errors
    if (error.name === 'MCPSearXNGError') {
      logMessage(server, "error", `Error fetching URL: ${url} - ${error.message}`);
      throw error;
    }
    
    // Catch any unexpected errors
    logMessage(server, "error", `Unexpected error fetching URL: ${url}`, error);
    const context: ErrorContext = { url };
    throw createUnexpectedError(error, context);
  } finally {
    // Clean up the timeout to prevent memory leaks
    clearTimeout(timeoutId);
  }
}
