# Troubleshooting OpenCode + MCP-SearXNG

## Common Issues

### 403 Forbidden from SearXNG
- **Cause**: Bot detection or limiter enabled.
- **Fix**: In `searxng-settings.yml`, set `limiter: false` and disable `botdetection` sections. Restart Docker container.

### Connection Refused
- **Cause**: SearXNG not running or wrong URL.
- **Fix**: Check `docker-compose ps`. Ensure SEARXNG_URL is `http://localhost:8080`. Test with curl: `curl http://localhost:8080/search?q=test&format=json`.

### OpenCode Config Errors
- **Cause**: Invalid JSON or missing fields.
- **Fix**: Run `./scripts/validate-config.sh`. Ensure paths are absolute and correct.

### Build Fails
- **Cause**: Node.js version too old.
- **Fix**: Update to Node 18+. Run `node --version`.

### Docker Issues
- **macOS**: Ensure Docker Desktop is running.
- **Linux**: If permission denied, run `sudo usermod -aG docker $USER` and reboot.

### MCP Server Not Loading
- **Cause**: Wrong path in `opencode.json`.
- **Fix**: Verify `dist/index.js` exists. Use absolute paths.

## Logs
- SearXNG logs: `docker-compose logs searxng`
- OpenCode logs: Check OpenCode console or logs.

## Getting Help
- Check GitHub issues for similar problems.
- Ensure you're on the `opencode-integration` branch for latest fixes.