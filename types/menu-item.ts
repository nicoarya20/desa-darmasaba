export type MenuItem = {
    id: string;
    name: string;
    href?: string;
    children?: MenuItem[];
    /** DEFAULT tersembunyi dari menu publik & halamannya 404; bisa ditimpa di admin Pengaturan › Visibilitas Menu (tabel MenuVisibility). */
    hidden?: boolean;
    /** Prefix path yang menandai submenu ini aktif di navbar (mis. halaman detail di luar `href`); bawaan = `href`. Tidak mempengaruhi visibilitas/404. */
    activePrefix?: string;
} & (
    { href: string; children?: MenuItem[] } | 
    { children: MenuItem[] }
)