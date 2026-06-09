import { compactText } from "./html.mjs";

export const siteOrigin = (site) => compactText(site.url).replace(/\/+$/, "");

export const absoluteUrl = (site, route = "") =>
  `${siteOrigin(site)}${route.startsWith("/") ? route : `/${route}`}`.replace(/\/$/, "/");

export const isExternalUrl = (value = "") => /^https?:\/\//.test(value);

export const absoluteAssetUrl = (site, assetPath) =>
  isExternalUrl(assetPath) ? assetPath : `${siteOrigin(site)}${assetPath.startsWith("/") ? assetPath : `/${assetPath}`}`;
