'use client';
import { AppShell, Badge, Box, Burger, Center, Group, Loader, NavLink, Text, ThemeIcon } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconLayoutDashboard, IconTerminal2, IconWorld } from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useSnapshot } from 'valtio';
import { ADMIN_HOME_PATH } from '@/lib/auth-policy';
import { useDarkMode } from '@/state/darkModeStore';
import { themeTokens, type ThemeTokens } from '@/utils/themeTokens';
import jennaState from '../_state/jenna-state';
import { NODE_ENV_LABEL } from '../ringkasan/system.logic';
import { ConfirmModal } from './ConfirmModal';
import css from './dev-console.module.css';
import { DEV_NAV, isDevNavActive, isDevNavGroup, isDevNavGroupActive, openActiveGroups } from './dev-nav';
import { DevUserMenu } from './DevUserMenu';
import { hasDirtySection } from './leave-guard.logic';
import { useDeveloperSession } from './useDeveloperSession';
import { useLeaveGuard } from './useLeaveGuard';

type Props = { version: string; nodeEnv: string; children: React.ReactNode };

const ENV_BADGE_COLOR: Record<string, string> = { production: 'orange', development: 'teal' };

export function DevConsoleShell({ version, nodeEnv, children }: Props) {
  const user = useDeveloperSession();
  const { isDark } = useDarkMode();
  const tokens = themeTokens(isDark);
  const pathname = usePathname();
  const [opened, { toggle, close }] = useDisclosure();
  const { dirty } = useSnapshot(jennaState);
  const leave = useLeaveGuard(hasDirtySection(dirty));
  const [groups, setGroups] = useState(() => ({ pathname, open: openActiveGroups({}, pathname) }));
  if (groups.pathname !== pathname) setGroups({ pathname, open: openActiveGroups(groups.open, pathname) });

  // Sampai sesi DEVELOPER terkonfirmasi: tanpa children (halaman & fetch API-nya tidak jalan).
  // Loader tanpa warna tema supaya markup SSR = render pertama klien (tema dibaca dari localStorage).
  if (!user) {
    return (
      <Center h="100vh" role="status" aria-label="Memuat sesi">
        <Loader />
      </Center>
    );
  }

  const handleLinkClick = (e: React.MouseEvent, href: string) => {
    if (!leave.guardClick(e, href)) close();
  };

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
      onClick={(e) => handleLinkClick(e, href)}
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
            <DevUserMenu user={user} tokens={tokens} onLinkClick={handleLinkClick} />
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
          {DEV_NAV.map((entry) => {
            const { label, icon: Icon } = entry;
            if (!isDevNavGroup(entry)) {
              return navLink(label, entry.href, <Icon size={18} stroke={1.6} />, isDevNavActive(pathname, entry));
            }
            const groupOpened = groups.open[entry.basePath] ?? false;
            const groupActive = isDevNavGroupActive(pathname, entry);
            return (
              <NavLink
                key={entry.basePath}
                label={label}
                leftSection={<Icon size={18} stroke={1.6} />}
                opened={groupOpened}
                onChange={(next) => setGroups((g) => ({ ...g, open: { ...g.open, [entry.basePath]: next } }))}
                active={groupActive && !groupOpened}
                variant="light"
                color={tokens.colors.primary}
                c={groupActive ? tokens.colors.text.primary : tokens.colors.text.secondary}
                fw={groupActive ? 600 : 500}
                className={css.navLink}
                childrenOffset={28}
              >
                {entry.children.map((child) => {
                  const ChildIcon = child.icon;
                  return navLink(
                    child.label,
                    child.href,
                    <ChildIcon size={16} stroke={1.6} />,
                    isDevNavActive(pathname, child),
                  );
                })}
              </NavLink>
            );
          })}
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

      <ConfirmModal
        opened={leave.pendingHref !== null}
        title="Buang perubahan?"
        message="Ada perubahan yang belum disimpan di halaman ini. Pindah halaman akan membuang perubahan tersebut."
        confirmLabel="Buang & lanjutkan"
        confirmColor="red"
        onConfirm={() => {
          close();
          leave.confirmLeave();
        }}
        onClose={leave.cancelLeave}
      />
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
