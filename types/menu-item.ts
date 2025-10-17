export type MenuItem = {
    id: string;
    name: string;
    href?: string;
    children?: MenuItem[];
} & (
    { href: string; children?: MenuItem[] } | 
    { children: MenuItem[] }
)