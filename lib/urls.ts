const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "frandora.cl";

export const ROOT_URL = `https://${ROOT_DOMAIN}`;
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? `https://app.${ROOT_DOMAIN}`;
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? `https://api.${ROOT_DOMAIN}`;

export const SIGN_IN_URL = `${APP_URL}/sign-in`;
export const SIGN_UP_URL = `${APP_URL}/sign-up`;

export function businessUrl(slug: string, path = "") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `https://${slug}.${ROOT_DOMAIN}${path ? normalizedPath : ""}`;
}

export function businessWidgetUrl(slug: string) {
  return businessUrl(slug, `/widget/${slug}`);
}
