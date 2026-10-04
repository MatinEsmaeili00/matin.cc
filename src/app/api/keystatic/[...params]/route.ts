import { makeRouteHandler } from "@keystatic/next/route-handler";
import { cmsMode } from "@/lib/cms";
import config from "../../../../../keystatic.config";

/**
 * Keystatic's API (reads/writes content). Guarded by cmsMode(): in local mode
 * Keystatic itself would accept file writes from anyone, so outside
 * development (or a configured GitHub mode) this route doesn't exist.
 */
const handler = cmsMode() ? makeRouteHandler({ config }) : null;

const notFound = () => new Response("Not found", { status: 404 });

export function GET(request: Request) {
  return handler ? handler.GET(request) : notFound();
}

export function POST(request: Request) {
  return handler ? handler.POST(request) : notFound();
}
