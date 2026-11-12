// src/store/authStore.ts
import { proxy } from 'valtio';

export type User = {
  id: string;
  name: string;
  roleId: number;
  menuIds?: string[] | null; // ✅ Pastikan pakai `string[]`
  publicMenuIds?: string[] | null; // menu admin "Publik" (terbuka untuk semua admin)
  isActive?: boolean;
};

export const authStore = proxy<{
  user: User | null;
  setUser: (user: User | null) => void;
}>({
  user: null,
  setUser(user) {
    authStore.user = user;
  },
});