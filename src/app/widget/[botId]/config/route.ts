import { handleApi } from "@/lib/api";
export async function GET(
  request: Request,
  context: { params: Promise<{ botId: string }> },
) {
  return handleApi(request, ["public", "config", (await context.params).botId]);
}
export async function OPTIONS(request: Request) {
  return handleApi(request, ["public"]);
}
