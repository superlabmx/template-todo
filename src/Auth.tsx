import querystring from 'querystring';

// Generate AuthUrl to Request Access Code
export async function requestAccessCode(authorizer_url: string, client_id: string, redirect_uri: string) {
    const codeVerifier = generateRandomString(128);
    const hash = await sha256(codeVerifier);
    const codeChallenge = btoa(String.fromCharCode(...hash)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    // Store Code Verifier in Local Storage
    localStorage.setItem('code_verifier', codeVerifier);
    // Set Query Params
    const queryParams = {
        response_type: 'code',
        client_id: client_id,
        redirect_uri: redirect_uri,
        scope: 'openid email',
        code_challenge: codeChallenge,
        code_challenge_method: 'S256'
    };
    const authUrl = `${authorizer_url}/login?${new URLSearchParams(queryParams).toString()}`;
    window.location.href = authUrl;
};

export async function requestToken(code: string, authorizer_url: string, authorizer_client_id: string, authorizer_redirect_url: string) {
    const requestBody = {
        grant_type: 'authorization_code',
        client_id: authorizer_client_id,
        redirect_uri: authorizer_redirect_url,
        code: code,
        code_verifier: localStorage.getItem('code_verifier')
    };
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: querystring.stringify(requestBody)
    };
    try {
        let response = await fetch(`${authorizer_url}/oauth2/token`, requestOptions);
        const { access_token, refresh_token, id_token } = await response.json();
        localStorage.removeItem('code_verifier');
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        localStorage.setItem('id_token', id_token);
    } catch (error) {
        console.error('Error:', error);
    }
};

const sha256 = async (input: string) => {
    const encodedInput = new TextEncoder().encode(input);
    const hashBuffer = await crypto.subtle.digest("SHA-256", encodedInput);
    return new Uint8Array(hashBuffer);
}

const generateRandomString = (length: number) => {
    return [...Array(length)].map(() => "-._~ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".charAt(Math.floor(Math.random() * 64))).join('');
}