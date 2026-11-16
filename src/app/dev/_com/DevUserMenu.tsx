'use client';
import { Avatar, Group, Menu, Text, UnstyledButton } from '@mantine/core';
import { IconChevronDown, IconLayoutDashboard, IconLogout2, IconWorld } from '@tabler/icons-react';
import Link from 'next/link';
import { useState } from 'react';
import { ADMIN_HOME_PATH } from '@/lib/auth-policy';
import { logoutAndRedirect } from '@/lib/client-logout';
import type { ThemeTokens } from '@/utils/themeTokens';
import css from './dev-console.module.css';
import type { DevSessionUser } from './useDeveloperSession';

type Props = {
  user: DevSessionUser;
  tokens: ThemeTokens;
  /** Dipanggil saat link internal diklik (penjaga draf belum disimpan). */
  onLinkClick: (e: React.MouseEvent, href: string) => void;
};

export function DevUserMenu({ user, tokens, onLinkClick }: Props) {
  const [loggingOut, setLoggingOut] = useState(false);
  const displayName = user.name || 'Developer';

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutAndRedirect();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <Menu
      position="bottom-end"
      width={220}
      shadow="md"
      classNames={{ item: css.menuItem }}
      styles={{
        dropdown: {
          background: tokens.colors.bg.card,
          borderColor: tokens.colors.border.soft,
          ['--dev-hover' as string]: tokens.colors.bg.hover,
        },
        item: { color: tokens.colors.text.primary },
        label: { color: tokens.colors.text.muted },
        divider: { borderColor: tokens.colors.border.soft },
      }}
    >
      <Menu.Target>
        <UnstyledButton aria-label="Menu akun" style={{ borderRadius: 999, padding: 4 }}>
          <Group gap={8} wrap="nowrap">
            <Avatar name={displayName} color="initials" size={32} radius="xl" />
            <Text size="sm" fw={500} c={tokens.colors.text.primary} visibleFrom="sm" maw={160} truncate>
              {displayName}
            </Text>
            <IconChevronDown size={14} color={tokens.colors.text.secondary} />
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>
          <Text size="sm" fw={600} c={tokens.colors.text.primary} truncate>
            {displayName}
          </Text>
          {user.email && (
            <Text size="xs" c={tokens.colors.text.muted} truncate>
              {user.email}
            </Text>
          )}
        </Menu.Label>
        <Menu.Divider />
        <Menu.Item
          component={Link}
          href={ADMIN_HOME_PATH}
          leftSection={<IconLayoutDashboard size={16} />}
          onClick={(e) => onLinkClick(e, ADMIN_HOME_PATH)}
        >
          Buka Admin
        </Menu.Item>
        <Menu.Item
          component={Link}
          href="/"
          leftSection={<IconWorld size={16} />}
          onClick={(e) => onLinkClick(e, '/')}
        >
          Website Desa
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          color="red"
          leftSection={<IconLogout2 size={16} />}
          onClick={handleLogout}
          disabled={loggingOut}
          closeMenuOnClick={false}
        >
          {loggingOut ? 'Keluar…' : 'Keluar'}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
