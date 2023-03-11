const express = require('express');
const session = require('express-session');
const querystring = require('querystring');


const app = express();

const CLIENT_ID = '954133755902181416';
const CLIENT_SECRET = 'g9zz0vtY5MgDcgj2a2PE9hU3wMa9mqlq';
const REDIRECT_URI = 'https://szablonypolska.pl/callback';
const SCOPES = 'identify email';
const SESSION_SECRET = 'my-secret-key';

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));

app.get('/', (req, res) => {
  const params = {
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPES,
  };
  const url = `https://discord.com/api/oauth2/authorize?${querystring.stringify(params)}`;
  res.redirect(url);
});

app.get('/callback', async (req, res) => {
  const code = req.query.code;
  const tokenParams = {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
  };
  const { default: fetch } = await import('node-fetch');
  const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: querystring.stringify(tokenParams),
  });
  const tokenData = await tokenResponse.json();

  const userResponse = await fetch('https://discord.com/api/users/@me', {
    headers: {
      authorization: `${tokenData.token_type} ${tokenData.access_token}`,
    },
  });
  const userData = await userResponse.json();

  res.send(`Witaj, ${userData.username}#${userData.discriminator}! Panel w trakcie tworzenia`);
});

app.listen(3000, () => {
  console.log('Serwer smiga na porcie 3000');
});