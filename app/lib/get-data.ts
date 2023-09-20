// import got from "got";
import axios from "axios";
import axiosRetry from "axios-retry";

import { API_BASE } from "./_constants";

// // The way `got` does retries:
// //
// //   sleep = 1000 * Math.pow(2, retry - 1) + Math.random() * 100
// //
// // So, it means:
// //
// //   1. ~1000ms
// //   2. ~2000ms
// //   3. ~4000ms
// //
// // ...if the limit we set is 3.
// // Our own timeout, in ./middleware/timeout.js defaults to 10 seconds.
// // So there's no point in trying more attempts than 3 because it would
// // just timeout on the 10s. (i.e. 1000 + 2000 + 4000 + 8000 > 10,000)
// const retryConfiguration = {
//   limit: 4,
// };
// const timeoutConfiguration = {
//   request: 2000,
// };

const RETRIES = 3;
const TIMEOUT = 1000;

axiosRetry(axios, {
  retries: RETRIES,
  retryDelay: (retryCount) => {
    return retryCount * 1000;
  },
});

export async function get<T>(
  uri: string,
  { throwHttpErrors = false, followRedirect = true, timeout = TIMEOUT } = {},
) {
  if (!uri.startsWith("/")) {
    throw new Error(`uri parameter should start with / (not: ${uri})`);
  }
  const t0 = new Date();
  const response = await axios.get<T>(API_BASE + uri, {
    timeout,
    // const response = await got<T>(API_BASE + uri, {
    // responseType: "json",
    // throwHttpErrors,
    maxRedirects: followRedirect ? 10 : 0,
    // retry: retryConfiguration,
    // timeout: timeoutConfiguration,
  });
  const t1 = new Date();
  console.log(`Fetch ${uri} took ${t1.getTime() - t0.getTime()} ms`);

  // if (response.retryCount) {
  //   console.warn(`Fetch had to retry on ${uri} ${response.retryCount} times`);
  // }
  return response;
}
