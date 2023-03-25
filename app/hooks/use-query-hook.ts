import { useSearchParams } from "@remix-run/react";

export function useQueryString(name: string) {
  const [searchParams] = useSearchParams();
  return searchParams.get(name);
}

export function useQueryBoolean(name: string) {
  const v = useQueryString(name);
  return v === "true" || v === "1";
}
