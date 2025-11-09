/**
 * Default OAuth credentials for Sparky
 * Users don't need to provide these - they just authorize access to their data
 * 
 * IMPORTANT: Replace these with your actual Google Cloud project credentials
 * These credentials identify YOUR app to Google (not individual users)
 * It's safe to hardcode these here - they'll be bundled with the app
 */

export const DEFAULT_GOOGLE_OAUTH = {
  // For local development: uses GOOGLE_CLIENT_ID from .env
  // For production: uses hardcoded values below (replace with your actual credentials)
  clientId: process.env.GOOGLE_CLIENT_ID || '920507098453-i9pj4f66v32uj2tfo3stuc3h20s2pupa.apps.googleusercontent.com',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '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',
};

/**
 * Check if default OAuth credentials are configured
 */
export function hasDefaultOAuthCredentials(): boolean {
  return (
    DEFAULT_GOOGLE_OAUTH.clientId !== 'your-client-id.apps.googleusercontent.com' &&
    DEFAULT_GOOGLE_OAUTH.clientSecret !== 'GOCSPX-your-client-secret'
  );
}
