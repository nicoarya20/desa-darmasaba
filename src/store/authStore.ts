import { proxy } from 'valtio';

export type User = {
  id: string;
  name: string;
  roleId: number; // 0, 1, 2, 3
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