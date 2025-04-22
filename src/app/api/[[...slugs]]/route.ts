import prisma from "@/lib/prisma";
import cors, { HTTPMethod } from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";
import { Elysia, t } from "elysia";
import fs from "fs/promises";
import path from "path";
import getPotensi from "./_lib/get-potensi";
import img from "./_lib/img";
import imgDel from "./_lib/img-del";
import imgs from "./_lib/imgs";
import uplCsv from "./_lib/upl-csv";
import { uplCsvSingle } from "./_lib/upl-csv-single";
import uplImg from "./_lib/upl-img";
import { uplImgSingle } from "./_lib/upl-img-single";
import Desa from "./_lib/desa";
const ROOT = process.cwd();

if (!process.env.WIBU_UPLOAD_DIR)
  throw new Error("WIBU_UPLOAD_DIR is not defined");

const UPLOAD_DIR = path.join(ROOT, process.env.WIBU_UPLOAD_DIR);
const UPLOAD_DIR_IMAGE = path.join(UPLOAD_DIR, "image");

// create uploads dir
fs.mkdir(UPLOAD_DIR, {
  recursive: true,
}).catch(() => {});

// create image uploads dir
fs.mkdir(UPLOAD_DIR_IMAGE, {
  recursive: true,
}).catch(() => {});

const corsConfig = {
  origin: "*",
  methods: ["GET", "POST", "PATCH", "DELETE", "PUT"] as HTTPMethod[],
  allowedHeaders: "*",
  exposedHeaders: "*",
  maxAge: 5,
  credentials: true,
};

async function layanan() {
  const data = await prisma.layanan.findMany();
  return { data };
}
const ApiServer = new Elysia()
  .use(swagger({ path: "/api/docs" }))
  .use(cors(corsConfig))
  .use(Desa)
  .onError(({ code }) => {
    if (code === "NOT_FOUND") {
      return {
        status: 404,
        body: "Route not found :(",
      };
    }
  })
  .group("/api", (app) =>
    app
      .get("/layanan", layanan)
      .get("/potensi", getPotensi)
      .get(
        "/img/:name",
        ({ params, query }) => {
          return img({
            name: params.name,
            UPLOAD_DIR_IMAGE,
            ROOT,
            size: query.size,
          });
        },
        {
          params: t.Object({
            name: t.String(),
          }),
          query: t.Optional(
            t.Object({
              size: t.Optional(t.Number()),
            })
          ),
        }
      )
      .delete(
        "/img/:name",
        ({ params }) => {
          return imgDel({
            name: params.name,
            UPLOAD_DIR_IMAGE,
          });
        },
        {
          params: t.Object({
            name: t.String(),
          }),
        }
      )
      .get(
        "/imgs",
        ({ query }) => {
          return imgs({
            search: query.search,
            page: query.page,
            count: query.count,
            UPLOAD_DIR_IMAGE,
          });
        },
        {
          query: t.Optional(
            t.Object({
              page: t.Number({ default: 1 }),
              count: t.Number({ default: 10 }),
              search: t.String({ default: "" }),
            })
          ),
        }
      )
      .post(
        "/upl-img",
        ({ body }) => {
          console.log(body.title);
          return uplImg({ files: body.files, UPLOAD_DIR_IMAGE });
        },
        {
          body: t.Object({
            title: t.String(),
            files: t.Files({ multiple: true }),
          }),
        }
      )
      .post(
        "/upl-img-single",
        ({ body }) => {
          return uplImgSingle({
            fileName: body.name,
            file: body.file,
            UPLOAD_DIR_IMAGE,
          });
        },
        {
          body: t.Object({
            name: t.String(),
            file: t.File(),
          }),
        }
      )
      .post(
        "/upl-csv-single",
        ({ body }) => {
          return uplCsvSingle({ fileName: body.name, file: body.file });
        },
        {
          body: t.Object({
            name: t.String(),
            file: t.File(),
          }),
        }
      )
      .post(
        "/upl-csv",
        ({ body }) => {
          return uplCsv({ files: body.files });
        },
        {
          body: t.Object({
            files: t.Files(),
          }),
        }
      )
  );

export const GET = ApiServer.handle;
export const POST = ApiServer.handle;
export const PATCH = ApiServer.handle;
export const DELETE = ApiServer.handle;
export const PUT = ApiServer.handle;

export type AppServer = typeof ApiServer;
