import axios, { AxiosError } from "axios";
import axiosRetry from "axios-retry";
import Rollbar from "rollbar";

import { API_BASE } from "./_constants";

const RETRIES = process.env.NODE_ENV === "development" ? 1 : 4;
const TIMEOUT = 1000;

axiosRetry(axios, {
  retries: RETRIES,
  retryDelay: (retryCount, error) => {
    console.log(
      `get:Retry ${retryCount} for ${error.request?._currentUrl || "unknown"} msg: ${error}`,
    );
    return retryCount * 1000;
  },
  retryCondition(error) {
    if (error.response) {
      // Retry on 5xx
      return error.response.status >= 500;
    }
    // any other network errors
    return true;
  },
});

export async function get<T>(
  uri: string,
  {
    throwHttpErrors = false,
    followRedirect = true,
    timeout = TIMEOUT,
    reportToRollbar = true,
  } = {},
) {
  if (!uri.startsWith("/")) {
    throw new Error(`uri parameter should start with / (not: ${uri})`);
  }
  const t0 = new Date();
  try {
    const response = await axios.get<T>(API_BASE + uri, {
      maxRedirects: followRedirect ? 10 : 0,
      // Can't set `timeout` and `validateStatus` here because axios-retry
    });
    const t1 = new Date();
    if (response.status === 200) {
      console.log(`Fetch ${uri} took ${t1.getTime() - t0.getTime()} ms`);
    }

    return response;
  } catch (error) {
    // This weirdness is to be able to return a response, whose
    // status might be 400, but at the same time get all the benefits
    // of axios-retry retrying on 5xx errors and network errors.
    if (
      error instanceof AxiosError &&
      error.response &&
      error.response.status < 500
    ) {
      return error.response;
    }

    if (
      reportToRollbar &&
      error instanceof Error &&
      typeof process === "object" &&
      process.env.ROLLBAR_ACCESS_TOKEN
    ) {
      const rollbar = new Rollbar({
        accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
      });
      console.log("get: Sending error to Rollbar");
      const { uuid } = rollbar.error(error, {
        context: {
          uri,
          throwHttpErrors,
          followRedirect,
          timeout,
        },
      });
      if (uuid)
        console.log(
          `get: Sent Rollbar error https://rollbar.com/occurrence/uuid/?uuid=${uuid}`,
        );
    }

    throw error;
  }
}
