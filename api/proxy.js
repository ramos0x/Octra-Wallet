export default async (req, res) => {
    // Ambil custom RPC URL dari header, fallback ke default
    const rpcUrl = req.headers['x-rpc-url'] || 'https://octra.network';
    
    try {
      const targetUrl = new URL(req.url.replace(/^\/api/, ''), rpcUrl).href;
  
      const response = await fetch(targetUrl, {
        method: req.method,
        headers: {
          ...req.headers,
          host: new URL(rpcUrl).host, // Pastikan host sesuai RPC
        },
        body: req.method !== 'GET' && req.method !== 'HEAD' ? req : undefined,
      });
  
      // Forward response
      res.status(response.status);
      response.headers.forEach((value, key) => res.setHeader(key, value));
      response.body.pipe(res);
    } catch (error) {
      res.status(500).json({ error: 'Proxy failed', details: error.message });
    }
  };
  