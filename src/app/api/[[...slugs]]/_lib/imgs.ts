import minio, { MINIO_BUCKET } from "@/lib/minio";

async function imgs({
  search = "",
  page = 1,
  count = 20,
}: {
  search?: string;
  page?: number;
  count?: number;
}) {
  const objects: { name: string; url: string }[] = [];

  const stream = minio.listObjects(MINIO_BUCKET, "image/", true);

  for await (const obj of stream) {
    if (!obj.name) continue;
    const fileName = obj.name.replace("image/", "");
    if (!fileName) continue;
    if (search && !fileName.includes(search)) continue;
    objects.push({ name: fileName, url: `/api/img/${fileName}` });
  }

  const total = objects.length;
  return objects
    .slice((page - 1) * count, page * count)
    .map((o) => ({ ...o, total }));
}

export default imgs;
