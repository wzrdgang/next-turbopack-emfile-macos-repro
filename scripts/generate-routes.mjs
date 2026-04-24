import fs from "fs/promises";
import path from "path";

const appDir = path.join(process.cwd(), "app");

const staticPageRoutes = [
  "contact",
  "explore",
  "explore/size",
  "explore/source",
  "explore/stress-band",
  "profiles",
  "research",
  "states",
  "track",
  "trusted-news",
  "watchlists",
];

const stateSlugs = Array.from({ length: 24 }, (_, index) => `state-${String(index + 1).padStart(2, "0")}`);
const pageRoutes = [
  ...staticPageRoutes,
  ...stateSlugs.flatMap((stateSlug) => [
    `states/${stateSlug}`,
    `states/${stateSlug}/size`,
    `states/${stateSlug}/size/small`,
    `states/${stateSlug}/size/mid-size`,
    `states/${stateSlug}/size/large`,
    `states/${stateSlug}/source`,
    `states/${stateSlug}/source/ground-water`,
    `states/${stateSlug}/source/surface-water`,
    `states/${stateSlug}/stress-band`,
    `states/${stateSlug}/stress-band/watch`,
    `states/${stateSlug}/stress-band/fragile`,
    `states/${stateSlug}/stress-band/high-stress`,
    `states/${stateSlug}/track`,
  ]),
  ...Array.from({ length: 18 }, (_, index) => `profiles/market-${String(index + 1).padStart(2, "0")}`),
  ...Array.from({ length: 12 }, (_, index) => `research/article-${String(index + 1).padStart(2, "0")}`),
];

const routeHandlerRoutes = [
  "api/feature-flags",
  "api/track/market-options",
  "api/track/projects",
  "api/track/projects/export",
  "api/zip-lookup",
  "internal/admin-api",
  "internal/profile-api",
  "internal/telemetry/trusted-news",
  "internal/track-api",
  "internal/user-api",
];

async function ensureFile(routePath, filename, source) {
  const fullDir = path.join(appDir, routePath);
  await fs.mkdir(fullDir, { recursive: true });
  await fs.writeFile(path.join(fullDir, filename), source, "utf8");
}

function pageSource(routePath) {
  return `export default function GeneratedPage() {
  return (
    <main>
      <h1>${routePath}</h1>
      <p>Generated to stress Turbopack's directory watcher behavior on macOS.</p>
    </main>
  );
}
`;
}

function routeSource(routePath) {
  return `export async function GET() {
  return Response.json({ ok: true, route: ${JSON.stringify(routePath)} });
}
`;
}

await Promise.all(pageRoutes.map((routePath) => ensureFile(routePath, "page.js", pageSource(routePath))));
await Promise.all(
  routeHandlerRoutes.map((routePath) => ensureFile(routePath, "route.js", routeSource(routePath))),
);

