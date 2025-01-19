import * as crypto from "crypto";

export const URL_gen_rating = (userHandle: string): string => {
  const baseUrl = `https://codeforces.com/api/user.rating`;
  const apiKey = "bf17dd3bc5c9541f51ec8743c3f0befcd2c8be3a";
  const secret = "313741245dadfdc64c5d755143037ead4354462d";
  const randomString = Math.random().toString(36).substring(2, 8);
  const time = Math.floor(Date.now() / 1000);

  const queryParams = {
    handle: userHandle,
    apiKey,
    time: time.toString(),
  };

  const sortedParams = Object.entries(queryParams)
    .sort(([keyA, valueA], [keyB, valueB]) =>
      keyA === keyB ? valueA.localeCompare(valueB) : keyA.localeCompare(keyB)
    )
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  const toHash = `${randomString}/user.rating?${sortedParams}#${secret}`;
  const apiSigHash = crypto.createHash("sha512").update(toHash).digest("hex");
  const apiSig = `${randomString}${apiSigHash}`;

  return `${baseUrl}?${sortedParams}&apiSig=${apiSig}`;

};
