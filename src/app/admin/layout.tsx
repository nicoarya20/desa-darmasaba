'use client'

import colors from "@/con/colors";
import { authStore } from "@/store/authStore";
import {
  ActionIcon,
  AppShell,
  AppShellHeader,
  AppShellMain,
  AppShellNavbar,
  Burger,
  Center,
  Flex,
  Group,
  Image,
  Loader,
  NavLink,
  ScrollArea,
  Text,
  Tooltip,
  rem
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconChevronLeft,
  IconChevronRight,
  IconLogout2
} from "@tabler/icons-react";
import _ from "lodash";
import Link from "next/link";
import { useRouter, useSelectedLayoutSegments } from "next/navigation";
import { useEffect, useState } from "react";
import { getNavbar } from "./(dashboard)/user&role/_com/dynamicNavbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [opened, { toggle }] = useDisclosure();
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const router = useRouter();
  const segments = useSelectedLayoutSegments().map((s) => _.lowerCase(s));
  

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          credentials: 'include' // ✅ ADD credentials
        });
        const data = await res.json();

        if (data.user) {
          // ✅ Check if user is NOT active → redirect to waiting room
          if (!data.user.isActive) {
            authStore.setUser(null);
            router.replace('/waiting-room');
            return;
          }

          // ✅ Fetch menuIds
          const menuRes = await fetch(`/api/admin/user-menu-access?userId=${data.user.id}`, {
            credentials: 'include' // ✅ ADD credentials
          });
          const menuData = await menuRes.json();

          const menuIds = menuData.success && Array.isArray(menuData.menuIds)
            ? [...menuData.menuIds]
            : null;

          // ✅ Set user dengan menuIds yang fresh
          authStore.setUser({
            id: data.user.id,
            name: data.user.name,
            roleId: Number(data.user.roleId),
            menuIds,
            isActive: data.user.isActive
          });

          // ✅ IMPROVED: Redirect ONLY if di root /admin
          const currentPath = window.location.pathname;
          
          if (currentPath === '/admin') {
            const expectedPath = getRedirectPath(Number(data.user.roleId));
            console.log('🔄 Redirecting from /admin to:', expectedPath);
            router.replace(expectedPath);
          }
          // ✅ Jangan redirect jika user sudah di path yang valid

        } else {
          authStore.setUser(null);
          router.replace('/login');
        }
      } catch (error) {
        console.error('Gagal memuat data pengguna:', error);
        authStore.setUser(null);
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]); // ✅ Only depend on router

  const getRedirectPath = (roleId: number): string => {
    switch (roleId) {
      case 0: // DEVELOPER
      case 1: // SUPERADMIN
      case 2: // ADMIN_DESA
        return '/admin/landing-page/profil/program-inovasi';
      case 3: // ADMIN_KESEHATAN
        return '/admin/kesehatan/posyandu';
      case 4: // ADMIN_PENDIDIKAN
        return '/admin/pendidikan/info-sekolah/jenjang-pendidikan';
      default:
        return '/admin';
    }
  };

  if (loading) {
    return (
      <AppShell>
        <AppShellMain>
          <Center h="100vh">
            <Loader />
          </Center>
        </AppShellMain>
      </AppShell>
    );
  }

  const currentNav = authStore.user
    ? getNavbar({ roleId: authStore.user.roleId, menuIds: authStore.user.menuIds })
    : [];

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      const response = await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include' // ✅ ADD credentials
      });
      const result = await response.json();

      if (result.success) {
        authStore.setUser(null);
        localStorage.removeItem('auth_nomor');
        localStorage.removeItem('auth_kodeId');
        localStorage.removeItem('auth_username');
        window.location.href = '/login';
      } else {
        console.error('Logout failed:', result.message);
        authStore.setUser(null);
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error during logout:', error);
      authStore.setUser(null);
      window.location.href = '/login';
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <AppShell
      suppressHydrationWarning
      header={{ height: 64 }}
      navbar={{
        width: { base: 260, sm: 280, lg: 300 },
        breakpoint: 'sm',
        collapsed: {
          mobile: !opened,
          desktop: !desktopOpened,
        },
      }}
      padding="md"
    >
      {/* ... rest of your JSX (Header, Navbar, Main) sama seperti sebelumnya ... */}
      <AppShellHeader
        style={{
          background: "linear-gradient(90deg, #ffffff, #f9fbff)",
          borderBottom: `1px solid ${colors["blue-button"]}20`,
          padding: '0 16px',
        }}
        px={{ base: 'sm', sm: 'md' }}
        py={{ base: 'xs', sm: 'sm' }}
      >
        <Group w="100%" h="100%" justify="space-between" wrap="nowrap">
          <Flex align="center" gap="sm">
            <Image
              src="/assets/images/darmasaba-icon.png"
              alt="Logo Darmasaba"
              w={{ base: 32, sm: 40 }}
              h={{ base: 32, sm: 40 }}
              radius="md"
              loading="lazy"
              style={{ minWidth: '32px', height: 'auto' }}
            />
            <Text fw={700} c={colors["blue-button"]} fz={{ base: 'md', sm: 'xl' }}>
              Admin Darmasaba
            </Text>
          </Flex>

          <Group gap="xs">
            {!desktopOpened && (
              <Tooltip label="Buka Navigasi" position="bottom" withArrow>
                <ActionIcon variant="light" radius="xl" size="lg" onClick={toggleDesktop} color={colors["blue-button"]}>
                  <IconChevronRight />
                </ActionIcon>
              </Tooltip>
            )}

            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="md" color={colors["blue-button"]} mr="xs" />

            <Tooltip label="Kembali ke Website Desa" position="bottom" withArrow>
              <ActionIcon onClick={() => router.push("/darmasaba")} color={colors["blue-button"]} radius="xl" size="lg" variant="gradient" gradient={{ from: colors["blue-button"], to: "#228be6" }}>
                <Image src="/assets/images/darmasaba-icon.png" alt="Logo Darmasaba" w={20} h={20} radius="md" loading="lazy" style={{ minWidth: '20px', height: 'auto' }} />
              </ActionIcon>
            </Tooltip>

            <Tooltip label="Keluar" position="bottom" withArrow>
              <ActionIcon onClick={handleLogout} color={colors["blue-button"]} radius="xl" size="lg" variant="gradient" gradient={{ from: colors["blue-button"], to: "#228be6" }} loading={isLoggingOut} disabled={isLoggingOut}>
                <IconLogout2 size={22} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </AppShellHeader>

      <AppShellNavbar component={ScrollArea} style={{ background: "#ffffff", borderRight: `1px solid ${colors["blue-button"]}20` }} p={{ base: 'xs', sm: 'sm' }}>
        {/* ... Navbar content sama seperti sebelumnya ... */}
        <AppShell.Section p="sm">
          {currentNav.map((v, k) => {
            const isParentActive = segments.includes(_.lowerCase(v.name));
            return (
              <NavLink key={k} defaultOpened={isParentActive} c={isParentActive ? colors["blue-button"] : "gray"} label={<Text fw={isParentActive ? 600 : 400} fz="sm">{v.name}</Text>} style={{ borderRadius: rem(10), marginBottom: rem(4), transition: "background 150ms ease" }} styles={{ root: { '&:hover': { backgroundColor: 'rgba(25, 113, 194, 0.05)' } } }} variant="light" active={isParentActive}>
                {v.children.map((child, key) => {
                  const isChildActive = segments.includes(_.lowerCase(child.name));
                  return (
                    <NavLink key={key} href={child.path} c={isChildActive ? colors["blue-button"] : "gray"} label={<Text fw={isChildActive ? 600 : 400} fz="sm">{child.name}</Text>} styles={{ root: { borderRadius: rem(8), marginBottom: rem(2), transition: 'background 150ms ease', padding: '6px 12px', '&:hover': { backgroundColor: isChildActive ? 'rgba(25, 113, 194, 0.15)' : 'rgba(25, 113, 194, 0.05)' }, ...(isChildActive && { backgroundColor: 'rgba(25, 113, 194, 0.1)' }) } }} active={isChildActive} component={Link} />
                  );
                })}
              </NavLink>
            );
          })}
        </AppShell.Section>

        <AppShell.Section py="md">
          <Group justify="end" pr="sm">
            <Tooltip label={desktopOpened ? "Tutup Navigasi" : "Buka Navigasi"} position="top" withArrow>
              <ActionIcon variant="light" radius="xl" size="lg" onClick={toggleDesktop} color={colors["blue-button"]}>
                <IconChevronLeft />
              </ActionIcon>
            </Tooltip>
          </Group>
        </AppShell.Section>
      </AppShellNavbar>

      <AppShellMain style={{ background: "linear-gradient(180deg, #fdfdfd, #f6f9fc)", minHeight: "100vh" }}>
        {children}
      </AppShellMain>
    </AppShell>
  );
}