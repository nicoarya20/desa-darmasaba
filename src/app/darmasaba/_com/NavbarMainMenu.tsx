'use client'

import colors from "@/con/colors"
import stateNav from "@/state/state-nav"
import { ActionIcon, Button, Container, Flex, Image, Stack, Tooltip } from "@mantine/core"
import { useHover } from "@mantine/hooks"
import { IconSearch, IconUser } from "@tabler/icons-react"
import { useTransitionRouter } from 'next-view-transitions'
import { useSnapshot } from "valtio"
import { MenuItem } from "../../../../types/menu-item"
import { NavbarSearch } from "./NavBarSearch"
import { NavbarSubMenu } from "./NavbarSubMenu"
import { useRouter } from "next/navigation"

// contoh state auth (dummy aja dulu, bisa diganti sesuai sistem auth kamu)
const stateAuth = {
  role: "admin", // coba ubah ke "user" buat test
}

export function NavbarMainMenu({ listNavbar }: { listNavbar: MenuItem[] }) {
  const { item, isSearch } = useSnapshot(stateNav)
  const router = useTransitionRouter()
  const next = useRouter()

  return (
    <Stack gap={0} visibleFrom="sm" bg={colors["white-trans-1"]}>
      <Container pos="relative" w={{ base: '100%', md: '80%' }} fluid>
        <Flex align="center" justify="space-between" wrap={{ base: "wrap", md: "nowrap" }}>
          <Tooltip label="Go to Homepage" position="bottom" withArrow>
            <ActionIcon
              radius="xl"
              variant="transparent"
              onClick={() => {
                router.push("/darmasaba")
                stateNav.clear()
              }}
            >
              <Image
                radius="xl"
                src="/assets/images/darmasaba-icon.png"
                alt="Darmasaba Logo"
                w={28}
                h={28}
                loading="lazy"
              />
            </ActionIcon>
          </Tooltip>

          {listNavbar.map((item, k) => (
            <MenuItemCom key={k} item={item} />
          ))}

          <Tooltip label="Search content" position="bottom" withArrow>
            <ActionIcon
              variant="transparent"
              c={isSearch ? 'gray' : colors["blue-button"]}
              onClick={() => {
                stateNav.item = null
                stateNav.isSearch = !stateNav.isSearch
              }}
              radius="xl"
            >
              <IconSearch size="1.5rem" />
            </ActionIcon>
          </Tooltip>

          {/* hanya tampil kalau role = admin */}
          {stateAuth.role === "admin" && (
            <Tooltip label="My Profile" position="bottom" withArrow>
              <ActionIcon
                onClick={() => {
                  next.push("/admin/landing-page/profile/program-inovasi")
                }}
                color={colors["blue-button"]}
                radius="xl"
                variant="light"
              >
                <IconUser size={22} />
              </ActionIcon>
            </Tooltip>
          )}
        </Flex>
      </Container>

      {item && <NavbarSubMenu item={item as MenuItem[]} />}
      {isSearch && <NavbarSearch />}
    </Stack>
  )
}

function MenuItemCom({ item }: { item: MenuItem }) {
  const { ref, hovered } = useHover()
  const router = useTransitionRouter()

  return (
    <Button
      ref={ref}
      color={hovered ? "gray" : colors["blue-button"]}
      onMouseEnter={() => {
        stateNav.item = item.children || null
        stateNav.isSearch = false
      }}
      variant="subtle"
      radius="xl"
      onClick={() => {
        router.push(item.href)
        stateNav.clear()
      }}
      fw={500}
    >
      {item.name}
    </Button>
  )
}
