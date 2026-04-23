import minio, { MINIO_BUCKET } from "@/lib/minio";

async function imgDel({ name }: { name: string }) {
  try {
    await minio.removeObject(MINIO_BUCKET, `image/${name}`);
    return "ok";
  } catch (error) {
    console.log(error);
    return "error";
  }
}

export default imgDel;
