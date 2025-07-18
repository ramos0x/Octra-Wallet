// Fallback handler for any API routes not caught by proxy.js
export default function handler(req, res) {
  // Redirect all API requests to the proxy
  const targetPath = req.url.replace('/api', '');
  const proxyUrl = `/api/proxy.js?path=${encodeURIComponent(targetPath)}`;
  
  res.redirect(307, proxyUrl);
}