export async function GET() {
  return Response.json({ ok: true, route: "internal/user-api" });
}
