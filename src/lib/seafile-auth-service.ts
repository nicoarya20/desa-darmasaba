import { Mutex } from 'async-mutex';

// Store the token and its expiration time
let authToken: string | null = null;
let tokenExpirationTime: number | null = null;

// Mutex to prevent multiple simultaneous token refresh attempts
const mutex = new Mutex();

// Function to authenticate with Seafile and get a new token
async function authenticateWithSeafile(): Promise<{token: string, expirationTime: number}> {
  // First, check if we have a static token as fallback
  const staticToken = process.env.SEAFILE_TOKEN;
  if (staticToken) {
    console.log("Using static SEAFILE_TOKEN from environment variables");
    // For static tokens, we'll set a conservative expiration (e.g., 6 days) to force periodic refresh attempts
    const conservativeExpiration = Date.now() + (6 * 24 * 60 * 60 * 1000); // 6 days from now
    return {
      token: staticToken,
      expirationTime: conservativeExpiration
    };
  }

  // Otherwise, use username/password to get a new token
  const username = process.env.SEAFILE_USERNAME;
  const password = process.env.SEAFILE_PASSWORD;
  const baseUrl = process.env.SEAFILE_URL;

  if (!username || !password || !baseUrl) {
    throw new Error('Missing required Seafile environment variables (either SEAFILE_TOKEN or SEAFILE_USERNAME/SEAFILE_PASSWORD/SEAFILE_URL)');
  }

  const response = await fetch(`${baseUrl}/api2/auth-token/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      username,
      password,
      // Note: Seafile tokens typically last 7 days by default, but we'll refresh earlier
    }).toString(),
  });

  if (!response.ok) {
    throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  // Calculate expiration time (set to refresh 1 hour before actual expiration)
  // Seafile tokens typically last 7 days (604800 seconds), so we refresh after 6 days and 23 hours (601200 seconds)
  const refreshTokenThreshold = 601200; // 6 days and 23 hours in seconds
  const expirationTime = Date.now() + (refreshTokenThreshold * 1000);

  return {
    token: data.token,
    expirationTime
  };
}

// Function to get a valid authentication token
export async function getValidAuthToken(): Promise<string> {
  // Check if we have a valid token that hasn't expired
  if (authToken && tokenExpirationTime && Date.now() < tokenExpirationTime) {
    return authToken;
  }

  // Acquire lock to prevent multiple simultaneous refresh attempts
  return mutex.runExclusive(async () => {
    // Double-check after acquiring the lock
    if (authToken && tokenExpirationTime && Date.now() < tokenExpirationTime) {
      return authToken;
    }

    // Get a new token
    const { token, expirationTime } = await authenticateWithSeafile();
    
    // Update the stored token and expiration time
    authToken = token;
    tokenExpirationTime = expirationTime;

    console.log('New Seafile token acquired and cached');

    return token;
  });
}

// Function to force refresh the token (useful for manual refresh or testing)
export async function refreshAuthToken(): Promise<string> {
  return mutex.runExclusive(async () => {
    const { token, expirationTime } = await authenticateWithSeafile();
    
    // Update the stored token and expiration time
    authToken = token;
    tokenExpirationTime = expirationTime;

    console.log('Seafile token refreshed');

    return token;
  });
}

// Function to check if the token is still valid
export function isTokenValid(): boolean {
  return authToken !== null && 
         tokenExpirationTime !== null && 
         Date.now() < tokenExpirationTime;
}