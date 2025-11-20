// src/app/(admin)/_com/navigationByRole.ts
import { navBar, role1, role2, role3 } from './list_PageAdmin';

export const navigationByRole = {
  0: navBar,     // SUPERADMIN
  1: role1,      // ADMIN DESA
  2: role2,      // ADMIN KESEHATAN
  3: role3,      // ADMIN PENDIDIKAN
} as const;