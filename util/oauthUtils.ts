import { clientId, POPUP_HEIGHT, POPUP_WIDTH } from '../oauthConsts';

export function formatUrl(state: string) {
  return `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&state=${state}&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback&scope=email`;
}
