'use client'
import colors from "@/con/colors";
import { ActionIcon, AppShell, AppShellHeader, AppShellMain, AppShellNavbar, Burger, Group, Image, NavLink, ScrollArea, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";
import { useState } from "react";
import { navBar } from "./_com/list_PageAdmin";



export default function Layout({ children }: { children: React.ReactNode }) {
  const [opened, { toggle }] = useDisclosure();
  const [active, setActive] = useState(navBar[0]?.id || 0);
  const isClient = typeof window !== 'undefined';
  return (
    <Stack h={"100%"}>
      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: 300, breakpoint: 'sm', collapsed: { mobile: !opened }
        }}
        padding={'md'}
      >
        <AppShellHeader bg={colors["white-trans-1"]}>
          <Group px={10} align="center">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size={'sm'} />
            <ActionIcon w={50} h={50}  variant="transparent" component={Link} href="/admin">
            <Image py={5} src={'/assets/images/darmasaba-icon.png'} alt="" width={50} height={50} />
            </ActionIcon>
            <Text fw={'bold'} c={colors["blue-button"]} fz={'lg'}>Dashboard Admin</Text>
          </Group>
        </AppShellHeader>
        <AppShellNavbar
          c={colors["blue-button"]}
          component={ScrollArea}
        >
          {navBar.map((v,k) => {
            return (
              <NavLink
                c={colors["blue-button"]}
                key={k}
                active={isClient && k === active}
                onClick={() => setActive(k)}
                label={<Text>{v.name}</Text>}
              >
                {v.children.map((child) => {
                  return (
                    <NavLink
                      href={child.path}
                      key={child.id}
                      active={isClient && Number(child.id) === active}
                      onClick={() => setActive(Number(child.id))}
                      label={<Text>{child.name}</Text>}
                    />
                  )
                })}
              </NavLink>
            )
          })}
        </AppShellNavbar>
        <AppShellMain bg={colors.Bg}>
          {children}
        </AppShellMain>
      </AppShell>
    </Stack>
  );
}