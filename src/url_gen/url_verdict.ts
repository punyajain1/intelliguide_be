import * as crypto from "crypto";

export const URL_gen_verdict = (userHandle: string): string => {

  const baseUrl = `https://codeforces.com/api/user.status`;
  const apiKey = "e1fd2bff4e29449b2a13cade68ecefb8503df232"; 
  const secret = "fb0b3feb8273be2b91db2f16f8feb4dfb0dec09a";

  const randomString = Math.random().toString(36).substring(2, 8);
  const time = Math.floor(Date.now() / 1000);

  const queryParams = {handle: userHandle,apiKey,time: time.toString(),};

  const sortedParams = Object.entries(queryParams)
    .sort(([keyA, valueA], [keyB, valueB]) =>
      keyA === keyB ? valueA.localeCompare(valueB) : keyA.localeCompare(keyB)
    )
    .map(([key, value]) => `${key}=${value}`)
    .join("&");


  const toHash = `${randomString}/user.status?${sortedParams}#${secret}`;
  const apiSigHash = crypto.createHash("sha512").update(toHash).digest("hex");
  const apiSig = `${randomString}${apiSigHash}`;

  return `${baseUrl}?${sortedParams}&apiSig=${apiSig}`;
};