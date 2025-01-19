import * as crypto from "crypto";

export const URL_gen_programingLang = (userHandle: string): string => {

  const baseUrl = `https://codeforces.com/api/user.status`;
  const apiKey = "0ab20eec357f715b53d44e2b033322904b84ac35"; 
  const secret = "5ad66eb3140f5d127ae5a9b8c52af668cf1f25b2";

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
