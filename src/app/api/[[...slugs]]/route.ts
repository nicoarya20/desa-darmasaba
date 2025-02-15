import prisma from "@/lib/prisma";
import cors, { HTTPMethod } from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";
import getPotensi from "./_lib/get-potensi";

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
    .group("/api", app => app
        .get("/layanan", layanan)
        .get("/potensi", getPotensi)
    )



export const GET = ApiServer.handle;
export const POST = ApiServer.handle;
export const PATCH = ApiServer.handle;
export const DELETE = ApiServer.handle;
export const PUT = ApiServer.handle;

export type AppServer = typeof ApiServer

