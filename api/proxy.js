// Proxy API for Village App - Vercel API Route
// This proxies requests to Google Apps Script to avoid CORS issues

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx1hvx36P4YuSvVUbLgXK99pHH-AVZzdiQ4KWBQzQ_Vo0W9szE4UTrx4iMCWhcFif8d/exec';

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        // Build the target URL with query parameters
        const targetUrl = new URL(GOOGLE_SCRIPT_URL);

        // Copy all query parameters from the request
        Object.keys(req.query).forEach(key => {
            targetUrl.searchParams.append(key, req.query[key]);
        });

        console.log('🔗 Proxying request to:', targetUrl.toString());
        console.log('📤 Request method:', req.method);

        // Prepare the request options
        const requestOptions = {
            method: req.method,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Village-App-Proxy/1.0'
            }
        };

        // For POST requests, forward the body
        if (req.method === 'POST' && req.body) {
            requestOptions.body = JSON.stringify(req.body);
            console.log('📋 Request body:', req.body);
        }

        // Make the request to Google Apps Script
        const response = await fetch(targetUrl.toString(), requestOptions);

        console.log('📡 Google Script response status:', response.status);

        // Get the response data
        const responseData = await response.json();
        console.log('📋 Google Script response:', responseData);

        // Return the response with the same status code
        res.status(response.status).json(responseData);

    } catch (error) {
        console.error('❌ Proxy error:', error);

        // Return error response
        res.status(500).json({
            success: false,
            error: 'Proxy server error',
            message: error.message
        });
    }
}