export const NATIONBUILDER_CONFIG = {
  clientId: process.env.NATIONBUILDER_CLIENT_ID!,
  clientSecret: process.env.NATIONBUILDER_CLIENT_SECRET!,
  redirectUri: process.env.OAUTH_REDIRECT_URI || 'https://check.bikeeasy.org/api/auth/callback',
  authorizationUrl: `https://bikeeasy.nationbuilder.com/oauth/authorize`,
  tokenUrl: `https://bikeeasy.nationbuilder.com/oauth/token`,
  scope: '',
  nationSlug: 'bikeeasy',
}