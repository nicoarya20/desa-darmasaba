'use client'

import { DarkModeToggle } from "@/components/admin/DarkModeToggle";
import { useDarkMode } from "@/state/darkModeStore";
import { authStore } from "@/store/authStore";
import { themeTokens } from "@/utils/themeTokens";
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
  const { isDark } = useDarkMode();
  const tokens = themeTokens(isDark);
  
  const [mounted, setMounted] = useState(false);
  const [opened, { toggle, close }] = useDisclosure();
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const router = useRouter();
  const segments = useSelectedLayoutSegments().map((s) => _.lowerCase(s));

  // Ensure component is mounted on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          credentials: 'include'
        });
        const data = await res.json();

        if (data.user) {
          if (!data.user.isActive) {
            authStore.setUser(null);
            router.replace('/waiting-room');
            return;
          }

          const menuRes = await fetch(`/api/admin/user-menu-access?userId=${data.user.id}`, {
            credentials: 'include'
          });
          const menuData = await menuRes.json();

          const menuIds = menuData.success && Array.isArray(menuData.menuIds)
            ? [...menuData.menuIds]
            : null;

          authStore.setUser({
            id: data.user.id,
            name: data.user.name,
            roleId: Number(data.user.roleId),
            menuIds,
            isActive: data.user.isActive
          });

          const currentPath = window.location.pathname;

          if (currentPath === '/admin') {
            const expectedPath = getRedirectPath(Number(data.user.roleId));
            console.log('🔄 Redirecting from /admin to:', expectedPath);
            router.replace(expectedPath);
          }

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
  }, [router]);

  const getRedirectPath = (roleId: number): string => {
    switch (roleId) {
      case 0:
      case 1:
      case 2:
        return '/admin/landing-page/profil/program-inovasi';
      case 3:
        return '/admin/kesehatan/posyandu';
      case 4:
        return '/admin/pendidikan/info-sekolah/jenjang-pendidikan';
      default:
        return '/admin';
    }
  };

  if (loading || !mounted) {
    return (
      <AppShell>
        <AppShellMain>
          <Center h="100vh" bg="#f6f9fc">
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
        credentials: 'include'
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

  const handleNavClick = (path: string) => {
    router.push(path);
    close();
  };

  return (
    <AppShell
      suppressHydrationWarning
      header={{ height: { base: 56, sm: 64 } }}
      navbar={{
        width: { base: 280, sm: 280, lg: 300 },
        breakpoint: 'sm',
        collapsed: {
          mobile: !opened,
          desktop: !desktopOpened,
        },
      }}
      padding={{ base: 'xs', sm: 'md' }}
    >
      {/*
        HEADER / TOPBAR
        Spec: Background gradient, border bawah wajib
      */}
      <AppShellHeader
        style={{
          background: mounted ? tokens.colors.bg.header : 'linear-gradient(90deg, #ffffff, #f9fbff)',
          borderBottom: `1px solid ${mounted ? tokens.colors.border.soft : '#e9ecef'}`,
          padding: '0 12px',
          transition: 'background 0.3s ease, border-color 0.3s ease',
        }}
        px={{ base: 'xs', sm: 'md' }}
        py={{ base: '4px', sm: 'sm' }}
      >
        <Group w="100%" h="100%" justify="space-between" wrap="nowrap">
          <Flex align="center" gap={{ base: 'xs', sm: 'sm' }}>
            <Burger opened={opened} onClick={toggle} visibleFrom="sm" size="sm" color={mounted ? tokens.colors.text.brand : '#0A4E78'} />
            <Image
              src="/assets/images/darmasaba-icon.png"
              alt="Logo Darmasaba"
              w={{ base: 28, sm: 40 }}
              h={{ base: 28, sm: 40 }}
              radius="md"
              loading="lazy"
              style={{ minWidth: '28px', height: 'auto' }}
            />
            <Text fw={700} c={mounted ? tokens.colors.text.brand : '#0A4E78'} fz={{ base: 'sm', sm: 'xl' }} lineClamp={1}>
              <span className="hidden sm:inline">Admin Darmasaba</span>
            </Text>
          </Flex>

          <Group gap="xs" wrap="nowrap">
            {/* Mobile: Show menu button */}
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" color={mounted ? tokens.colors.text.brand : '#0A4E78'} />

            {/* Desktop: Show collapse button */}
            {!desktopOpened && (
              <Tooltip label="Buka Navigasi" position="bottom" withArrow>
                <ActionIcon variant="light" radius="xl" size="lg" onClick={toggleDesktop} color={mounted ? tokens.colors.primary : '#3B82F6'} visibleFrom="sm">
                  <IconChevronRight />
                </ActionIcon>
              </Tooltip>
            )}

            {/* Dark Mode Toggle - smaller on mobile */}
            <DarkModeToggle variant="light" size="md" showTooltip tooltipPosition="bottom" />

            {/* Home Button - hide on very small screens */}
            <Tooltip label="Kembali ke Website Desa" position="bottom" withArrow>
              <ActionIcon
                onClick={() => router.push("/darmasaba")}
                color={mounted ? tokens.colors.primary : '#3B82F6'}
                radius="xl"
                size="md"
                variant="gradient"
                gradient={mounted ? tokens.colors.gradient : { from: '#3B82F6', to: '#60A5FA' }}
                visibleFrom="xs"
              >
                <Image src="/assets/images/darmasaba-icon.png" alt="Logo Darmasaba" w={18} h={18} radius="md" loading="lazy" style={{ minWidth: '18px', height: 'auto' }} />
              </ActionIcon>
            </Tooltip>

            {/* Logout Button */}
            <Tooltip label="Keluar" position="bottom" withArrow>
              <ActionIcon
                onClick={handleLogout}
                color={mounted ? tokens.colors.primary : '#3B82F6'}
                radius="xl"
                size="md"
                variant="gradient"
                gradient={mounted ? tokens.colors.gradient : { from: '#3B82F6', to: '#60A5FA' }}
                loading={isLoggingOut}
                disabled={isLoggingOut}
              >
                <IconLogout2 size={18} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </AppShellHeader>

      {/*
        SIDEBAR / NAVBAR
        Spec: Background --bg-app, active state dengan accent bar
      */}
      <AppShellNavbar
        component={ScrollArea}
        style={{
          background: mounted ? tokens.colors.bg.app : '#ffffff',
          borderRight: `1px solid ${mounted ? tokens.colors.border.soft : '#e9ecef'}`,
          transition: 'background 0.3s ease, border-color 0.3s ease',
        }}
        p={{ base: 'xs', sm: 'sm' }}
      >
        <AppShell.Section p={{ base: 'xs', sm: 'sm' }}>
          {currentNav.map((v, k) => {
            const isParentActive = segments.includes(_.lowerCase(v.name));
            return (
              <NavLink
                key={k}
                defaultOpened={isParentActive}
                c={mounted && isParentActive ? tokens.colors.primary : mounted && isDark ? '#E5E7EB' : tokens.colors.text.secondary}
                label={
                  <Text
                    fw={isParentActive ? 600 : 400}
                    fz={{ base: 'xs', sm: 'sm' }}
                    style={{
                      color: mounted && isDark ? '#E5E7EB' : 'inherit',
                      transition: 'color 150ms ease',
                    }}
                  >
                    {v.name}
                  </Text>
                }
                style={{
                  borderRadius: rem(10),
                  marginBottom: rem(4),
                  transition: "background 150ms ease",
                  ...(mounted && isParentActive && !isDark && {
                    borderLeft: `3px solid ${tokens.colors.primary}`,
                  }),
                }}
                styles={{
                  root: {
                    '&:hover': {
                      backgroundColor: mounted && isDark ? '#1E293B' : tokens.colors.bg.hover,
                    },
                    ...(mounted && isParentActive && isDark && {
                      backgroundColor: 'rgba(59,130,246,0.25)',
                      borderLeft: `3px solid ${tokens.colors.primary}`,
                    }),
                  }
                }}
                variant="light"
                active={isParentActive}
                onClick={(e) => {
                  e.preventDefault();
                  if (v.path) handleNavClick(v.path);
                }}
                href={v.path || undefined}
              >
                {v.children?.map((child, key) => {
                  const isChildActive = segments.includes(_.lowerCase(child.name));
                  return (
                    <NavLink
                      key={key}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavClick(child.path);
                      }}
                      href={child.path}
                      c={mounted && isChildActive ? tokens.colors.primary : mounted && isDark ? '#E5E7EB' : tokens.colors.text.secondary}
                      label={
                        <Text
                          fw={isChildActive ? 600 : 400}
                          fz={{ base: 'xs', sm: 'sm' }}
                          style={{
                            color: mounted && isDark ? '#E5E7EB' : 'inherit',
                            transition: 'color 150ms ease',
                          }}
                        >
                          {child.name}
                        </Text>
                      }
                      styles={{
                        root: {
                          borderRadius: rem(8),
                          marginBottom: rem(2),
                          transition: 'background 150ms ease',
                          padding: '6px 12px',
                          '&:hover': {
                            backgroundColor: mounted && isDark ? 'rgba(255, 255, 255, 0.05)' : tokens.colors.bg.hover,
                          },
                          ...(mounted && isChildActive && isDark && {
                            backgroundColor: 'rgba(59,130,246,0.15)',
                            borderLeft: `2px solid ${tokens.colors.primary}`,
                          }),
                          ...(mounted && isChildActive && !isDark && {
                            backgroundColor: 'rgba(25, 113, 194, 0.1)',
                            borderLeft: `2px solid ${tokens.colors.primary}`,
                          }),
                        }
                      }}
                      active={isChildActive}
                      variant="subtle"
                      component={Link}
                    />
                  );
                })}
              </NavLink>
            );
          })}
        </AppShell.Section>

        <AppShell.Section py={{ base: 'sm', sm: 'md' }} visibleFrom="sm">
          <Group justify="end" pr="sm">
            <Tooltip label={desktopOpened ? "Tutup Navigasi" : "Buka Navigasi"} position="top" withArrow>
              <ActionIcon variant="light" radius="xl" size="lg" onClick={toggleDesktop} color={mounted ? tokens.colors.primary : '#3B82F6'}>
                <IconChevronLeft />
              </ActionIcon>
            </Tooltip>
          </Group>
        </AppShell.Section>
      </AppShellNavbar>

      {/*
        MAIN CONTENT
        Spec: Background --bg-base
      */}
      <AppShellMain
        style={{
          background: mounted ? tokens.colors.bg.base : '#f6f9fc',
          minHeight: "100vh",
          transition: 'background 0.3s ease',
        }}
      >
        {children}
      </AppShellMain>
    </AppShell>
  );
}