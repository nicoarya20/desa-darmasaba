export type MenuItem = {
    id: string;
    name: string;
    href?: string;
    children?: MenuItem[];
    /** Disembunyikan dari menu publik (navbar & pencarian); halaman tetap bisa diakses via URL. */
    hidden?: boolean;
} & (
    { href: string; children?: MenuItem[] } | 
    { children: MenuItem[] }
)