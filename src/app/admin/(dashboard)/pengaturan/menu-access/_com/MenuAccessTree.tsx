'use client'

import type { NavItem } from '@/app/admin/_com/nav/domains'
import { Checkbox, Stack } from '@mantine/core'
import { sectionState, toggleLeaf, toggleSection, type Selection } from '../_lib/menu-tree.logic'

type Props = {
  tree: readonly NavItem[]
  selected: Selection
  onChange: (next: Selection) => void
}

/** Checkbox pohon Menu Access: section = induk (indeterminate bila sebagian), submenu = anak. */
export function MenuAccessTree({ tree, selected, onChange }: Props) {
  return (
    <Stack gap="sm">
      {tree.map((section) => {
        const state = sectionState(section, selected)
        return (
          <Stack key={section.id} gap={6}>
            <Checkbox
              label={section.name}
              fw={500}
              checked={state === 'checked'}
              indeterminate={state === 'indeterminate'}
              onChange={() => onChange(toggleSection(section, selected))}
            />
            {section.children && section.children.length > 0 && (
              <Stack gap={4} pl="xl">
                {section.children.map((child) => (
                  <Checkbox
                    key={child.id}
                    size="sm"
                    label={child.name}
                    checked={selected.has(child.id)}
                    onChange={() => onChange(toggleLeaf(child.id, selected))}
                  />
                ))}
              </Stack>
            )}
          </Stack>
        )
      })}
    </Stack>
  )
}
