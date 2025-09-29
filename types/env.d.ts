declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL?: string;
    WIBU_UPLOAD_DIR?: string;
    NEXT_PUBLIC_BASE_URL?: string;
    NEXTAUTH_SECRET?: string;
    NEXTAUTH_URL?: string;
    WIBU_DOWNLOAD_DIR?: string;
  }
}
