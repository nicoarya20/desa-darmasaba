"use client";
import colors from "@/con/colors";
import navbarListMenu from "@/con/navbar-list-menu";
import stateNav from "@/state/state-nav";
import { ActionIcon, Box, Burger, Group, Image, Paper, ScrollArea, Stack, Text, Tooltip } from "@mantine/core";
import { IconSquareArrowRight } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useSnapshot } from "valtio";
import { MenuItem } from "../../../../types/menu-item";
import { NavbarMainMenu } from "./NavbarMainMenu";

export function Navbar() {
  const { item, isSearch, mobileOpen } = useSnapshot(stateNav);
  const router = useRouter();

  return (
    <Box>
      <Paper
        radius="0"
        className="glass2"
        w="100vw"
        pos="fixed"
        top={0}
        style={{ zIndex: 100 }}
      >
        {/* Desktop navbar (muncul mulai 992px ke atas) */}
        <Box visibleFrom="md">
          <NavbarMainMenu listNavbar={navbarListMenu} />
        </Box>

        {/* Mobile navbar (muncul di bawah 992px, termasuk iPad Mini) */}
        <Box hiddenFrom="md" bg={colors.grey[2]} px="md" py="sm">
          <Group justify="space-between" wrap="nowrap">
            <ActionIcon
              variant="transparent"
              size="xl"
              radius="xl"
              onClick={() => {
                router.push("/darmasaba");
                stateNav.mobileOpen = false;
              }}
            >
              <Tooltip label="Go to homepage" position="bottom" withArrow>
                <Image
                  src="/darmasaba-icon.png"
                  alt="Village Logo"
                  width={48}
                  height={48}
                  loading="lazy"
                />
              </Tooltip>
            </ActionIcon>

            <Tooltip
              label={mobileOpen ? "Close menu" : "Open menu"}
              position="bottom"
              withArrow
            >
              <Burger
                opened={mobileOpen}
                color={colors["blue-button"]}
                onClick={() => (stateNav.mobileOpen = !stateNav.mobileOpen)}
                size="sm"
              />
            </Tooltip>
          </Group>

          {mobileOpen && (
            <Paper
              component={motion.div}
              bg="white"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.2 }}
              pos="absolute"
              left={0}
              right={0}
              top="100%"
              m={0}
              radius={0}
              shadow="md"
            >
              <NavbarMobile listNavbar={navbarListMenu} />
            </Paper>
          )}
        </Box>
      </Paper>

      {(item || isSearch) && <Box className="glass" />}
    </Box>
  );
}

function NavbarMobile({ listNavbar }: { listNavbar: MenuItem[] }) {
  const router = useRouter();
  const pathname = usePathname(); // 👈 untuk cek path aktif

  // fungsi bantu: cek apakah path sekarang sama dengan menu / sub-menu
  const isActive = (href?: string) => href && pathname.startsWith(href);

  return (
    <ScrollArea.Autosize
      mah="calc(100dvh - 80px)"
      type="auto"
      offsetScrollbars
    >
      <Stack p="sm" gap="xs">
        {listNavbar.map((item, k) => {
          const active = isActive(item.href);
          return (
            <Box key={k}>
              <Paper
                shadow={active ? "sm" : "xs"}
                radius="md"
                p="sm"
                withBorder
                bg={active ? "blue.0" : "gray.0"}
                onClick={() => {
                  if (item.href) {
                    router.push(item.href);
                    stateNav.mobileOpen = false;
                  }
                }}
                style={{
                  cursor: item.href ? "pointer" : "default",
                  transition: "background 0.15s ease",
                  borderLeft: active ? "4px solid #1e66f5" : "4px solid transparent",
                }}
              >
                <Group justify="space-between" align="center" wrap="nowrap">
                  <Text
                    fw={active ? 700 : 600}
                    fz="md"
                    c={active ? "blue.7" : "dark.9"}
                  >
                    {item.name}
                  </Text>
                  {item.href && (
                    <IconSquareArrowRight
                      size={18}
                      color={active ? "#1e66f5" : "inherit"}
                    />
                  )}
                </Group>
              </Paper>

              {/* Submenu */}
              {item.children && (
                <Box pl="md" mt={4}>
                  {item.children.map((child, j) => {
                    const childActive = isActive(child.href);
                    return (
                      <Group
                        key={j}
                        justify="space-between"
                        align="center"
                        p="xs"
                        onClick={() => {
                          if (child.href) {
                            router.push(child.href);
                            stateNav.mobileOpen = false;
                          }
                        }}
                        style={{
                          cursor: child.href ? "pointer" : "default",
                          opacity: child.href ? 1 : 0.8,
                          borderRadius: "0.5rem",
                          backgroundColor: childActive ? "#e7f0ff" : "transparent",
                          borderLeft: childActive ? "3px solid #1e66f5" : "3px solid transparent",
                          transition: "background 0.15s ease",
                        }}
                      >
                        <Text
                          fz="sm"
                          fw={childActive ? 600 : 400}
                          c={childActive ? "blue.7" : "dark.8"}
                        >
                          {child.name}
                        </Text>
                        <IconSquareArrowRight
                          size={14}
                          color={childActive ? "#1e66f5" : "inherit"}
                        />
                      </Group>
                    );
                  })}
                </Box>
              )}
            </Box>
          );
        })}
      </Stack>
    </ScrollArea.Autosize>
  );
}


