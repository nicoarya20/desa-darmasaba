export default async function fetchWithRetry(
  url: string,
  retries = 3,
  timeoutMs = 20000
) {
  if (!url || url.trim() === "") {
    throw new Error("fetchWithRetry called with empty URL");
  }
  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, { signal: controller.signal });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }

      return res;
    } catch (err) {
      console.warn(`⚠️ Download attempt ${attempt} failed`);

      if (attempt === retries) {
        throw err;
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new Error("Unreachable");
}
