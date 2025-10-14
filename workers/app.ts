import { createRequestHandler } from "react-router";

declare global {
  interface Env {
    ASSETS: Fetcher;
  }

  interface CloudflareEnvironment extends Env {}
}

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: CloudflareEnvironment;
      ctx: ExecutionContext;
    };
  }
}

const SECONDS_PER_DAY = 60 * 60 * 24;
const ONE_WEEK_SECONDS = SECONDS_PER_DAY * 7;
const ONE_YEAR_SECONDS = SECONDS_PER_DAY * 365;
const IMMUTABLE_CACHE_CONTROL = `public, max-age=${ONE_YEAR_SECONDS}, immutable`;
const SHORT_CACHE_CONTROL = `public, max-age=${ONE_WEEK_SECONDS}`;
const HAS_HASH = /-[a-f0-9]{8,}\.(?:js|css|map|svg|png|jpg|jpeg|webp|ico|woff2?)$/i;

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE
);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const isAssetRequest = url.pathname.startsWith("/assets/");

    if (isAssetRequest && (request.method === "GET" || request.method === "HEAD")) {
      const cache = (caches as unknown as CacheStorage & { default: Cache }).default;
      const cacheKey = new Request(url.toString(), {
        headers: request.headers,
        method: "GET",
      });

      const cachedResponse = await cache.match(cacheKey);
      if (cachedResponse) {
        return cachedResponse;
      }

      const assetResponse = await env.ASSETS.fetch(request);

      if (!assetResponse.ok || assetResponse.status === 304) {
        return assetResponse;
      }

      const headers = new Headers(assetResponse.headers);
      headers.set(
        "Cache-Control",
        HAS_HASH.test(url.pathname) ? IMMUTABLE_CACHE_CONTROL : SHORT_CACHE_CONTROL
      );

      const response = new Response(assetResponse.body, {
        status: assetResponse.status,
        statusText: assetResponse.statusText,
        headers,
      });

      if (request.method === "GET") {
        ctx.waitUntil(cache.put(cacheKey, response.clone()));
      }

      return response;
    }

    return requestHandler(request, {
      cloudflare: { env, ctx },
    });
  },
} satisfies ExportedHandler<CloudflareEnvironment>;
