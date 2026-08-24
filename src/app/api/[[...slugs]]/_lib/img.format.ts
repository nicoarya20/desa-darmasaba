/** Pure helper — no I/O, deterministically testable. */
export function pickImageFormat(ext: string, accept: string | undefined) {
  const wantsWebp = (accept ?? "").includes("image/webp");
  const isWebp = ext === ".webp";
  const transcodeToJpeg = isWebp && !wantsWebp;
  return {
    transcodeToJpeg,
    contentType: transcodeToJpeg ? "image/jpeg" : undefined,
  };
}
