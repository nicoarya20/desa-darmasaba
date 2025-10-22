'use client'

import colors from "@/con/colors"
import stateNav from "@/state/state-nav"
import { ActionIcon, Button, Container, Flex, Image, Menu, MenuTarget, Stack, Tooltip } from "@mantine/core"
import { IconSearch, IconUser } from "@tabler/icons-react"
import { useTransitionRouter } from 'next-view-transitions'
import { usePathname, useRouter } from "next/navigation"
import { useSnapshot } from "valtio"
import { MenuItem } from "../../../../types/menu-item"
import { NavbarSearch } from "./NavBarSearch"
import { NavbarSubMenu } from "./NavbarSubMenu"

// contoh state auth (dummy aja dulu, bisa diganti sesuai sistem auth kamu)
const stateAuth = {
  role: "admin", // coba ubah ke "user" buat test
}

export function NavbarMainMenu({ listNavbar }: { listNavbar: MenuItem[] }) {
  const { item, isSearch } = useSnapshot(stateNav)
  const router = useTransitionRouter()
  const next = useRouter()
  const pathname = usePathname();

  return (
    <Stack gap={0} visibleFrom="sm" bg={colors["white-trans-1"]}>
      <Container pos="relative" w={{ base: '100%', md: '80%' }} fluid>
        <Flex align="center" justify="space-between" wrap={{ base: "wrap", md: "nowrap" }}>
          <Tooltip label="Kembali ke Beranda" position="bottom" withArrow>
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
            <MenuItemCom 
            key={k} 
            item={item}
            isActive={item.href && pathname.startsWith(item.href) || 
              (item.children?.some(child => child.href && pathname.startsWith(child.href)))}
            />
          ))}

          <Tooltip label="Cari Konten" position="bottom" withArrow>
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
            <Tooltip label="Profil Saya" position="bottom" withArrow>
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

function MenuItemCom({ item, isActive = false }: { item: MenuItem, isActive?: boolean }) {
  const router = useTransitionRouter()

  return (
    <Menu
      trigger="hover"
      position="bottom-start"
      offset={20}
      width={300}
      shadow="md"
      withinPortal
      onOpen={() => {
        stateNav.item = item.children || null;
        stateNav.isSearch = false;
      }}
    >
      <MenuTarget>
        <Button
          variant="subtle"
          color={isActive ? 'blue' : 'gray'}
          onClick={() => {
            if (item.href) {
              router.push(item.href);
              stateNav.clear();
            }
          }}
          styles={{
            root: {
              fontWeight: isActive ? 600 : 400,
              borderBottom: isActive ? `2px solid ${colors['blue-button']}` : 'none',
              '&:hover': {
                backgroundColor: 'transparent',
              }
            }
          }}
        >
          {item.name}
        </Button>
      </MenuTarget>
    </Menu>
  )
}
