import { Client } from "minio";

const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT ?? "localhost",
  accessKey: process.env.MINIO_ACCESS_KEY ?? "",
  secretKey: process.env.MINIO_SECRET_KEY ?? "",
  useSSL: process.env.MINIO_USE_SSL === "true",
});

export const MINIO_BUCKET = process.env.MINIO_BUCKET ?? "";

export default minioClient;
