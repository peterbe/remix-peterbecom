import axios from "axios";
import axiosRetry from "axios-retry";

import { API_BASE } from "./_constants";

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
    maxRedirects: followRedirect ? 10 : 0,
    validateStatus: function (status) {
      if (throwHttpErrors) return status >= 200 && status < 300; // default
      return true;
    },
  });
  const t1 = new Date();
  console.log(`Fetch ${uri} took ${t1.getTime() - t0.getTime()} ms`);
  return response;
}
