import { HttpsProxyAgent } from "https-proxy-agent";
import { HttpProxyAgent } from "http-proxy-agent";

export function createProxyAgent(targetUrl: string) {
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
