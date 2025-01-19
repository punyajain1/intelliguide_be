import * as crypto from "crypto";

export const URL_gen_contest = (userHandle: string): string => {

  const baseUrl = `https://codeforces.com/api/user.status`;
  const apiKey = "f388d3cb24c5a211a4b093bc9205b75b8f8c15e8";
  const secret = "b32f5b316693f71eb0dc15c375eba4629e1073d7";

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