import * as crypto from "crypto";

export const URL_gen_accuracy=(userHandle: string): string => {

  const baseUrl = `https://codeforces.com/api/user.status`;
  const apiKey = "340f1bbb9c00518756f7a88117c9e40af4c7d275";
  const secret = "31124957d84d3d30d181315e16e28ccaf229030e";

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