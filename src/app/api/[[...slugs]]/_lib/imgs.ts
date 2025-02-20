import fs from "fs/promises";

async function imgs({
  search = "",
  page = 1,
  count = 20,
  UPLOAD_DIR_IMAGE,
}: {
  search?: string;
  page?: number;
  count?: number;
  UPLOAD_DIR_IMAGE: string;
}) {
  const files = await fs.readdir(UPLOAD_DIR_IMAGE);

  return files
    .filter(
      (file) =>
        file.endsWith(".jpg") || file.endsWith(".png") || file.endsWith(".jpeg")
    )
    .filter((file) => file.includes(search))
    .slice((page - 1) * count, page * count)
    .map((file) => ({
      name: file,
      url: `/api/img/${file}`,
      total: files.length,
    }));
}

export default imgs;
