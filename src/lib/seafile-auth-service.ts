// Function to get the static authentication token from environment variables
export async function getValidAuthToken(): Promise<string> {
  const staticToken = process.env.SEAFILE_TOKEN;

  if (!staticToken) {
    throw new Error('SEAFILE_TOKEN environment variable is not set');
  }

  console.log("Using static SEAFILE_TOKEN from environment variables");

  return staticToken;
}

// Function to check if the token is set (always true since we're using static token)
export function isTokenValid(): boolean {
  return !!process.env.SEAFILE_TOKEN;
}