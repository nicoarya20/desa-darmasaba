"use client";
import colors from "@/con/colors";
import navbarListMenu from "@/con/navbar-list-menu";
import stateNav from "@/state/state-nav";
import { ActionIcon, Box, Burger, Group, Image, Paper, ScrollArea, Stack, Text, Tooltip } from "@mantine/core";
import { IconSquareArrowRight } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
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
        w="100%"
        pos="fixed"
        top={0}
        style={{ zIndex: 100 }}
      >
        <NavbarMainMenu listNavbar={navbarListMenu} />

        <Box hiddenFrom="sm" bg={colors.grey[2]} px="md" py="sm">
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
                <Image src="/darmasaba-icon.png" alt="Village Logo" width={48} height={48} loading="lazy"/>
              </Tooltip>
            </ActionIcon>
            <Tooltip label={mobileOpen ? "Close menu" : "Open menu"} position="bottom" withArrow>
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
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.2 }}
              pos="absolute"
              left={0}
              right={0}
              top="100%"
              m={0}
              radius={0}
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
  return (
    <ScrollArea.Autosize mah="calc(100vh - 80px)" offsetScrollbars>
      <Stack p="md" gap="xs">
        {listNavbar.map((item, k) => (
          <Box key={k}>
            <Group
              justify="space-between"
              align="center"
              p="xs"
              onClick={() => {
                router.push(item.href);
                stateNav.mobileOpen = false;
              }}
              style={{ cursor: "pointer" }}
            >
              <Text c="dark.9" fw={600} fz="md">
                {item.name}
              </Text>
              <IconSquareArrowRight size={18} />
            </Group>
            {item.children && (
              <Box pl="md">
                <NavbarMobile listNavbar={item.children} />
              </Box>
            )}
          </Box>
        ))}
      </Stack>
    </ScrollArea.Autosize>
  );
}

