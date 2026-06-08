import prisma from "@/lib/prisma";
import cors, { HTTPMethod } from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";
import { Elysia, t } from "elysia";
import fs from "fs/promises";
import path from "path";
import Desa from "./_lib/desa";
import getPotensi from "./_lib/get-potensi";
import img from "./_lib/img";
import imgDel from "./_lib/img-del";
import imgs from "./_lib/imgs";
import Kesehatan from "./_lib/kesehatan";
import PPID from "./_lib/ppid";
import uplCsv from "./_lib/upl-csv";
import { uplCsvSingle } from "./_lib/upl-csv-single";
import uplImg from "./_lib/upl-img";
import { uplImgSingle } from "./_lib/upl-img-single";
import FileStorage from "./_lib/fileStorage";
import Keamanan from "./_lib/keamanan";
import Ekonomi from "./_lib/ekonomi";
import Inovasi from "./_lib/inovasi";
import Lingkungan from "./_lib/lingkungan";
import LandingPage from "./_lib/landing_page";
import Pendidikan from "./_lib/pendidikan";
import Kependudukan from "./_lib/kependudukan";
import User from "./_lib/user";
import Role from "./_lib/user/role";
import Search from "./_lib/search";

const ROOT = process.cwd();

const corsConfig = {
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://cld-dkr-desa-darmasaba-stg.wibudev.com",
    "https://cld-dkr-staging-desa-darmasaba.wibudev.com",
    "https://desa-darmasaba-stg.wibudev.com",
  ],
  methods: ["GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS"] as HTTPMethod[],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  maxAge: 86400,
  credentials: true,
};

async function layanan() {
  const data = await prisma.layanan.findMany();
  return { data };
}

const Utils = new Elysia({
  prefix: "/utils",
  tags: ["Utils"],
}).get("/version", async () => {
  const packageJson = await fs.readFile(
    path.join(ROOT, "package.json"),
    "utf-8",
  );
  const version = JSON.parse(packageJson).version;
  return { version };
});

const ApiServer = new Elysia()
  .use(cors(corsConfig))
  .use(
    swagger({
      path: "/api/docs",
      documentation: {
        info: {
          title: "Desa Darmasaba API Documentation",
          version: "1.0.0",
        },
      },
      scalarConfig: {
        spec: { url: "/api/docs/json" },
      },
    }),
  )
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
      .use(Utils)
      .get("/version", async () => {
        const packageJson = await fs.readFile(
          path.join(ROOT, "package.json"),
          "utf-8",
        );
        return { version: JSON.parse(packageJson).version };
      })
      .use(FileStorage)
      .use(LandingPage)
      .use(PPID)
      .use(Desa)
      .use(Kesehatan)
      .use(Keamanan)
      .use(Ekonomi)
      .use(Inovasi)
      .use(Lingkungan)
      .use(Pendidikan)
      .use(Kependudukan)
      .use(User)
      .use(Role)
      .use(Search)
      .get("/layanan", layanan)
      .get("/potensi", getPotensi)
      .get(
        "/img/:name",
        ({ params, query }) => {
          return img({
            name: params.name,
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
            }),
          ),
        },
      )
      .delete(
        "/img/:name",
        ({ params }) => {
          return imgDel({
            name: params.name,
          });
        },
        {
          params: t.Object({
            name: t.String(),
          }),
        },
      )
      .get(
        "/imgs",
        ({ query }) => {
          return imgs({
            search: query.search,
            page: query.page,
            count: query.count,
          });
        },
        {
          query: t.Optional(
            t.Object({
              page: t.Number({ default: 1 }),
              count: t.Number({ default: 10 }),
              search: t.String({ default: "" }),
            }),
          ),
        },
      )
      .post(
        "/upl-img",
        ({ body }) => {
          console.log(body.title);
          return uplImg({ files: body.files });
        },
        {
          body: t.Object({
            title: t.String(),
            files: t.Files({ multiple: true }),
          }),
        },
      )
      .post(
        "/upl-img-single",
        ({ body }) => {
          return uplImgSingle({
            fileName: body.name,
            file: body.file,
          });
        },
        {
          body: t.Object({
            name: t.String(),
            file: t.File(),
          }),
        },
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
        },
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
        },
      ),
  );

export const GET = ApiServer.handle;
export const POST = ApiServer.handle;
export const PATCH = ApiServer.handle;
export const DELETE = ApiServer.handle;
export const PUT = ApiServer.handle;

export type AppServer = typeof ApiServer;
