'use client';
import { AppShell, Badge, Box, Burger, Center, Group, Loader, NavLink, Text, ThemeIcon } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconLayoutDashboard, IconTerminal2, IconWorld } from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ADMIN_HOME_PATH } from '@/lib/auth-policy';
import { useDarkMode } from '@/state/darkModeStore';
import { themeTokens, type ThemeTokens } from '@/utils/themeTokens';
import { NODE_ENV_LABEL } from '../ringkasan/system.logic';
import css from './dev-console.module.css';
import { DEV_NAV, isDevNavActive } from './dev-nav';
import { DevUserMenu } from './DevUserMenu';
import { useDeveloperSession } from './useDeveloperSession';

type Props = { version: string; nodeEnv: string; children: React.ReactNode };

const ENV_BADGE_COLOR: Record<string, string> = { production: 'orange', development: 'teal' };

export function DevConsoleShell({ version, nodeEnv, children }: Props) {
  const user = useDeveloperSession();
  const { isDark } = useDarkMode();
  const tokens = themeTokens(isDark);
  const pathname = usePathname();
  const [opened, { toggle, close }] = useDisclosure();

  // Sampai sesi DEVELOPER terkonfirmasi: tanpa children (halaman & fetch API-nya tidak jalan).
  // Loader tanpa warna tema supaya markup SSR = render pertama klien (tema dibaca dari localStorage).
  if (!user) {
    return (
      <Center h="100vh" role="status" aria-label="Memuat sesi">
        <Loader />
      </Center>
    );
  }

  const navLink = (label: string, href: string, icon: React.ReactNode, active = false) => (
    <NavLink
      key={href}
      component={Link}
      href={href}
      label={label}
      leftSection={icon}
      active={active}
      variant="light"
      color={tokens.colors.primary}
      c={active ? undefined : tokens.colors.text.secondary}
      fw={active ? 600 : 500}
      className={css.navLink}
      onClick={close}
    />
  );

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: { base: 240, lg: 260 }, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header style={{ background: tokens.colors.bg.app, borderColor: tokens.colors.border.soft }}>
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
              color={tokens.colors.text.primary}
              aria-label="Buka navigasi"
            />
            <ThemeIcon variant="light" color={tokens.colors.primary} size={34} radius="md">
              <IconTerminal2 size={20} />
            </ThemeIcon>
            <Box style={{ minWidth: 0 }}>
              <Text fw={700} lh={1.2} c={tokens.colors.text.primary} truncate>
                Developer Console
              </Text>
              <Text size="xs" c={tokens.colors.text.secondary} visibleFrom="xs">
                Desa Darmasaba
              </Text>
            </Box>
          </Group>
          <Group gap="xs" wrap="nowrap">
            <EnvBadges nodeEnv={nodeEnv} version={version} tokens={tokens} />
            <DevUserMenu user={user} tokens={tokens} />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar
        p="sm"
        aria-label="Navigasi Developer Console"
        style={{
          background: tokens.colors.bg.app,
          borderColor: tokens.colors.border.soft,
          ['--dev-hover' as string]: tokens.colors.bg.hover,
        }}
      >
        <AppShell.Section grow>
          {DEV_NAV.map(({ label, href, icon: Icon }) =>
            navLink(label, href, <Icon size={18} stroke={1.6} />, isDevNavActive(pathname, href)),
          )}
        </AppShell.Section>
        <AppShell.Section pt="sm" style={{ borderTop: `1px solid ${tokens.colors.border.soft}` }}>
          {navLink('Buka Admin', ADMIN_HOME_PATH, <IconLayoutDashboard size={18} stroke={1.6} />)}
          {navLink('Website Desa', '/', <IconWorld size={18} stroke={1.6} />)}
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main style={{ background: tokens.colors.bg.base, minHeight: '100vh' }}>
        <Box maw={1280} mx="auto">
          {children}
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}

function EnvBadges({ nodeEnv, version, tokens }: { nodeEnv: string; version: string; tokens: ThemeTokens }) {
  return (
    <>
      <Badge variant="light" color={ENV_BADGE_COLOR[nodeEnv] ?? 'gray'} visibleFrom="xs">
        {NODE_ENV_LABEL[nodeEnv] ?? nodeEnv}
      </Badge>
      <Badge
        variant="outline"
        color={tokens.colors.text.secondary}
        visibleFrom="sm"
        style={{ textTransform: 'none' }}
      >
        v{version}
      </Badge>
    </>
  );
}
