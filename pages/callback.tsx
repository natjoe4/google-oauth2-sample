import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { OAUTH_RESPONSE, OAUTH_STATE_KEY } from '../oauthConsts';

function OAuthPopup() {
  const { query } = useRouter();
  const checkState = (receivedState: string) => {
    const state = sessionStorage.getItem(OAUTH_STATE_KEY);
    return state === receivedState;
  };
  useEffect(() => {
    if (query.state || query.error) {
      const state = query.state as string;
      const error = query.error as string;
      if (!window.opener) {
        throw new Error('No window opener');
      }
      if (error) {
        window.opener.postMessage(
          {
            type: OAUTH_RESPONSE,
            error: error || 'OAuth error: An error has occurred.'
          },
          '*'
        );
      } else if (state && checkState(state)) {
        window.opener.postMessage(
          {
            type: OAUTH_RESPONSE,
            query
          },
          '*'
        );
      } else {
        window.opener.postMessage(
          {
            type: OAUTH_RESPONSE,
            error: 'OAuth error: State mismatch.'
          },
          '*'
        );
      }
    }
  }, [query]);

  return <></>;
}

export default OAuthPopup;
