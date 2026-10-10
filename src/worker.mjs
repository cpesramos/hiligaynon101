const canonicalHost = "hiligaynon101.com";
const productionHosts = new Set([canonicalHost, `www.${canonicalHost}`]);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (productionHosts.has(url.hostname) && (url.protocol !== "https:" || url.hostname !== canonicalHost)) {
      url.protocol = "https:";
      url.hostname = canonicalHost;
      url.port = "";
      return Response.redirect(url.href, 308);
    }
    return env.ASSETS.fetch(request);
  }
};
