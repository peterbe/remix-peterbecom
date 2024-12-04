import * as v from "valibot";

export function formatDateBasic(date: string) {
  return new Date(date).toLocaleDateString("en-us", {
    year: "numeric",
    month: "long",
    day: "numeric",
    // This is important. This way, when it "rounds" the date,
    // it does it in a conistent way.
    timeZone: "UTC",
  });
}

export function postURL(oid: string) {
  return `/plog/${oid}`;
}

export function categoryURL(name: string) {
  return `/oc-${name.replaceAll(" ", "+")}`;
}

export function absoluteURL(uri: string) {
  if (!uri.includes("://")) {
    return `https://www.peterbe.com${uri}`;
  }
  return uri;
}

function handleValiError(error: unknown) {
  if (v.isValiError(error)) {
    error.issues.forEach((issue, i) => {
      if (issue.path)
        console.error(
          `#${i + 1} Validation issue in ${issue.path.map((p) => p.key).join(".")}`,
        );
    });
  }
}

export function newValiError(error: unknown) {
  if (v.isValiError(error)) {
    handleValiError(error);
    throw new Error(error.message);
  }
  return error;
}
