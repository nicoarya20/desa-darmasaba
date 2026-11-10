export type MenuItem = {
    id: string;
    name: string;
    href?: string;
    children?: MenuItem[];
    /** DEFAULT tersembunyi dari menu publik & halamannya 404; bisa ditimpa di admin Pengaturan › Visibilitas Menu (tabel MenuVisibility). */
    hidden?: boolean;
} & (
    { href: string; children?: MenuItem[] } | 
    { children: MenuItem[] }
)