export function parseSafeJson<T = unknown>(
  json: string | null,
  defaultValue: T,
): T {
  if (!json) return defaultValue;

  try {
    return JSON.parse(json) as T;
  } catch {
    return defaultValue;
  }
}
