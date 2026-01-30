declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL?: string;
    SEAFILE_TOKEN?: string;
    SEAFILE_REPO_ID?: string;
    WIBU_UPLOAD_DIR?: string;
    WIBU_DOWNLOAD_DIR?: string;
    EMAIL_USER?: string;
    EMAIL_PASS?: string;
    NEXT_PUBLIC_BASE_URL?: string;
    NEXTAUTH_SECRET?: string;
    NEXTAUTH_URL?: string;
    SEAFILE_URL?: string;
  }
}
