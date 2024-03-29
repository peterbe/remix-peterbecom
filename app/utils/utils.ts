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

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-us", {
    year: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

export function postURL(oid: string) {
  return `/plog/${oid}`;
}

export function categoryURL(name: string) {
  return `/oc-${name.replace(" ", "+")}`;
}

export function absoluteURL(uri: string) {
  if (!uri.includes("://")) {
    return `https://www.peterbe.com${uri}`;
  }
  return uri;
}

export function searchURL(query: string) {
  return `/search?q=${encodeURIComponent(query)}`;
}
