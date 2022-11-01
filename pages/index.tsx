import { v4 } from 'uuid';
import React, { useEffect, useState, useRef } from 'react';
import { formatUrl } from '../util/oauthUtils';
import { Button, Center } from '@mantine/core';
import {
  clientId,
  clientSecret,
  OAUTH_RESPONSE,
  OAUTH_STATE_KEY,
  POPUP_HEIGHT,
  POPUP_WIDTH,
  redirectUri,
  tokenURL
} from '../oauthConsts';

export default function Home() {
  const [accessToken, setAccessToken] = useState<string>('');
  const [apiCode, setApiCode] = useState<string>('');
  const [loggingIn, setLoggingIn] = useState(false);
  const popupRef = useRef<Window | null>(null);

  async function handleMessageListener(message: any) {
    try {
      const type = message?.data?.type;
      if (type === OAUTH_RESPONSE) {
        popupRef.current?.close();
        const errorMaybe = message?.data?.error;
        if (errorMaybe) {
          console.error(errorMaybe);
        } else {
          const code = message?.data?.query?.code;
          if (code) {
            setApiCode(code);
          } else {
            console.error('no api code received');
          }
        }
      }
    } catch (genericError) {
      console.error(genericError);
    }
  }

  useEffect(() => {
    if (loggingIn) {
      const top = window.outerHeight / 2 + window.screenY - POPUP_HEIGHT / 2;
      const left = window.outerWidth / 2 + window.screenX - POPUP_WIDTH / 2;
      const state = v4();
      sessionStorage.setItem(OAUTH_STATE_KEY, state);
      const url = formatUrl(state);
      popupRef.current = window.open(
        url,
        'Popup Window',
        `_blank,height=${POPUP_HEIGHT},width=${POPUP_WIDTH},top=${top},left=${left}`
      );
      window.addEventListener('message', handleMessageListener);
    }
  }, [loggingIn]);

  useEffect(() => {
    if (apiCode) {
      fetch(
        `${tokenURL}?grant_type=authorization_code&client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${redirectUri}&code=${apiCode}`,
        {
          method: 'POST'
        }
      )
        .then(data => data.json())
        .then(json => {
          console.log(json.access_token);
          setAccessToken(json.access_token);
        });
    }
  }, [apiCode]);

  // TODO figure out how google apis work
  async function queryGoogle() {
    return fetch('https://www.googleapis.com/auth/userinfo.email', {
      method: 'GET',
      headers: new Headers({ Authorization: `Bearer ${accessToken}` })
    })
      .then(data => data.json())
      .then(json => console.log(json));
  }

  return (
    <>
      <div style={{ width: '100%', paddingTop: '20%' }}>
        <Center>
          <div style={{ width: 200, display: 'flex', justifyContent: 'space-evenly' }}>
            <Button onClick={() => setLoggingIn(true)}>Login</Button>
            <Button disabled={!apiCode} onClick={queryGoogle}>
              Who am I?
            </Button>
          </div>
        </Center>
      </div>
    </>
  );
}
