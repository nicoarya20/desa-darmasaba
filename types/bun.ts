declare module "bun" {
    interface Env {
        PORT: string;
        NEXT_PUBLIC_WIBU_URL: string;
        DATABASE_URL: string;
        WIBU_UPLOAD_DIR: string;
        WIBU_CACHE_DIR: string;
    }
}