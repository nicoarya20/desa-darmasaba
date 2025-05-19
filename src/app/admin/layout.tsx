'use client'

import colors from "@/con/colors";
import {
  ActionIcon,
  AppShell,
  AppShellHeader,
  AppShellMain,
  AppShellNavbar,
  Burger,
  Group,
  Image,
  NavLink,
  ScrollArea,
  Text
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import _ from 'lodash';
import Link from "next/link";
import { useSelectedLayoutSegments } from "next/navigation";
import { navBar } from "./_com/list_PageAdmin";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [opened, { toggle }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  // Normalisasi semua segmen jadi lowercase
  const segments = useSelectedLayoutSegments().map(s => _.lowerCase(s));

  return (
    <AppShell
      suppressHydrationWarning
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: {
          mobile: !opened,
          desktop: !desktopOpened,
        },
      }}
      padding={'md'}
    >
      <AppShellHeader bg={colors["white-trans-1"]}>
        <Group px={10} align="center">
          {!desktopOpened && (
            <ActionIcon variant="light" onClick={toggleDesktop}>
              <IconChevronRight />
            </ActionIcon>
          )}
          <Burger
            opened={opened}
            onClick={toggle}
            hiddenFrom="sm"
            size={'sm'}
          />
          <ActionIcon
            w={50}
            h={50}
            variant="transparent"
            component={Link}
            href="/admin"
          >
            <Image
              py={5}
              src={'/assets/images/darmasaba-icon.png'}
              alt=""
              width={50}
              height={50}
            />
          </ActionIcon>
          <Text fw={'bold'} c={colors["blue-button"]} fz={'lg'}>
            Dashboard Admin
          </Text>
        </Group>
      </AppShellHeader>

      <AppShellNavbar c={colors["blue-button"]} component={ScrollArea}>
        <AppShell.Section>
          {navBar.map((v, k) => {
            const isParentActive = segments.includes(_.lowerCase(v.name));

            return (
              <NavLink
                key={k}
                defaultOpened={isParentActive}
                c={isParentActive ? colors["blue-button"] : "grey"}
                label={
                  <Text style={{ fontWeight: isParentActive ? "bold" : "normal" }}>
                    {v.name}
                  </Text>
                }
              >
                {v.children.map((child, key) => {
                  const isChildActive = segments.includes(_.lowerCase(child.name));

                  return (
                    <NavLink
                      key={key}
                      href={child.path}
                      c={isChildActive ? colors["blue-button"] : "grey"}
                      label={
                        <Text style={{ fontWeight: isChildActive ? "bold" : "normal" }}>
                          {child.name}
                        </Text>
                      }
                    />
                  );
                })}
              </NavLink>
            );
          })}
        </AppShell.Section>

        <AppShell.Section py={20}>
          <Group justify="end">
            <ActionIcon variant="light" onClick={toggleDesktop}>
              <IconChevronLeft />
            </ActionIcon>
          </Group>
        </AppShell.Section>
      </AppShellNavbar>

      <AppShellMain bg={colors.Bg}>{children}</AppShellMain>
    </AppShell>
  );
}
