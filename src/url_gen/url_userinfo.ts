import * as crypto from 'crypto';

export const URL_gen_userinfo = (userHandle: string): string => {
  const baseUrl = `https://codeforces.com/api/user.info`;
  const apiKey = '186e9bde490f0b1a63390ba311f081d213162e7e';
  const secret = '13dfa0d7f9dc6c0dcedd54dcc94d1795831dfcae';
  const randomString = Math.random().toString(36).substring(2, 8);
  const time = Math.floor(Date.now() / 1000);

  const queryParams = {
    handles: userHandle,
    apiKey,
    time: time.toString(),
  };

  const sortedParams = Object.entries(queryParams)
    .sort(([keyA, valueA], [keyB, valueB]) =>
      keyA === keyB ? valueA.localeCompare(valueB) : keyA.localeCompare(keyB)
    )
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  const toHash = `${randomString}/user.info?${sortedParams}#${secret}`;
  const apiSigHash = crypto.createHash('sha512').update(toHash).digest('hex');
  const apiSig = `${randomString}${apiSigHash}`;

  return `${baseUrl}?${sortedParams}&apiSig=${apiSig}`;
};

