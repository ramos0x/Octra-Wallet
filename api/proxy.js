export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Private-Key, X-RPC-URL');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Get custom RPC URL from header, fallback to default
    const rpcUrl = req.headers['x-rpc-url'] || 'https://octra.network';
    
    // Construct the target URL
    const targetPath = req.url.replace(/^\/api/, '');
    const targetUrl = `${rpcUrl}${targetPath}`;
    
    console.log(`Proxying request: ${req.method} ${targetUrl}`);
    
    // Prepare headers for the target request
    const targetHeaders = {
      'Content-Type': 'application/json',
      'User-Agent': 'Octra-Web-Wallet/1.0',
    };
    
    // Forward specific headers
    if (req.headers['x-private-key']) {
      targetHeaders['X-Private-Key'] = req.headers['x-private-key'];
    }
    
    // Prepare request options
    const requestOptions = {
      method: req.method,
      headers: targetHeaders,
    };
    
    // Add body for POST/PUT requests
    if (req.method === 'POST' || req.method === 'PUT') {
      if (req.body) {
        requestOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      }
    }
    
    // Make the request to the target API
    const response = await fetch(targetUrl, requestOptions);
    
    // Get response data
    const responseText = await response.text();
    
    // Set response status
    res.status(response.status);
    
    // Forward response headers (excluding CORS headers that we set ourselves)
    response.headers.forEach((value, key) => {
      if (!key.toLowerCase().startsWith('access-control-')) {
        res.setHeader(key, value);
      }
    });
    
    // Send the response
    res.send(responseText);
    
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Proxy failed', 
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
}