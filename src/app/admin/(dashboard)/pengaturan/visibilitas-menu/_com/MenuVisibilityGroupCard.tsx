'use client';
import { Badge, Group, Paper, Stack, Switch, Text, Title } from '@mantine/core';
import type { MenuVisibilityGroup, MenuVisibilityItem } from '@/app/darmasaba/_com/menu-visibility.logic';

type Props = {
  group: MenuVisibilityGroup;
  savingKey: string | null;
  onToggle: (item: MenuVisibilityItem, visible: boolean) => void;
};

/** Satu menu utama publik beserta Switch tampil/sembunyi per submenu. */
export function MenuVisibilityGroupCard({ group, savingKey, onToggle }: Props) {
  const allHidden = group.items.every((item) => !item.isVisible);
  return (
    <Paper withBorder radius="md" p="md">
      <Stack gap="sm">
        <Group justify="space-between">
          <Title order={4}>{group.name}</Title>
          {allHidden && (
            <Badge color="gray" variant="light">
              Menu utama ikut tersembunyi
            </Badge>
          )}
        </Group>
        {group.items.map((item) => (
          <Group key={item.menuKey} justify="space-between" wrap="nowrap" gap="sm">
            <Stack gap={2} style={{ minWidth: 0 }}>
              <Group gap={6}>
                <Text fw={500} fz="sm">
                  {item.name}
                </Text>
                <Badge size="xs" variant="outline" color={item.defaultVisible ? 'teal' : 'gray'}>
                  Default: {item.defaultVisible ? 'Tampil' : 'Sembunyi'}
                </Badge>
                {item.overridden && (
                  <Badge size="xs" color="orange" variant="light">
                    Diubah
                  </Badge>
                )}
              </Group>
              <Text fz="xs" c="dimmed" truncate>
                {item.menuKey}
              </Text>
            </Stack>
            <Switch
              aria-label={`Tampilkan ${group.name} › ${item.name}`}
              checked={item.isVisible}
              disabled={savingKey !== null}
              onChange={(e) => onToggle(item, e.currentTarget.checked)}
              label={item.isVisible ? 'Tampil' : 'Sembunyi'}
            />
          </Group>
        ))}
      </Stack>
    </Paper>
  );
}
