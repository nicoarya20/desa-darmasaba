declare namespace NodeJS {
  interface ProcessEnv {
    // Database
    DATABASE_URL?: string;

    // Seafile Configuration
    SEAFILE_TOKEN?: string;
    SEAFILE_REPO_ID?: string;
    SEAFILE_BASE_URL?: string;
    SEAFILE_PUBLIC_SHARE_TOKEN?: string;
    SEAFILE_URL?: string;

    // Upload/Download Directories
    WIBU_UPLOAD_DIR?: string;
    WIBU_DOWNLOAD_DIR?: string;

    // Email Configuration
    EMAIL_USER?: string;
    EMAIL_PASS?: string;

    // Application URLs
    NEXT_PUBLIC_BASE_URL?: string;

    // Authentication
    NEXTAUTH_SECRET?: string;
    NEXTAUTH_URL?: string;
    BASE_SESSION_KEY?: string;
    BASE_TOKEN_KEY?: string;
    NEXT_PUBLIC_BASE_SESSION_KEY?: string;
    NEXT_PUBLIC_BASE_TOKEN_KEY?: string;

    // API Keys
    ELEVENLABS_API_KEY?: string;

    // Environment
    NODE_ENV?: 'development' | 'production' | 'test';
  }
}
