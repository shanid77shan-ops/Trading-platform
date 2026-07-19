import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let queryClient: NeonQueryFunction<false, false> | null = null;

function getQueryClient() {
  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? "";
  if (!url) {
    throw new Error("DATABASE_URL is not configured");
  }
  if (!queryClient) {
    queryClient = neon(url);
  }
  return queryClient;
}

export function sql<T = Record<string, unknown>>(
  strings: TemplateStringsArray,
  ...values: unknown[]
) {
  return getQueryClient()(strings, ...values) as Promise<T[]>;
}
