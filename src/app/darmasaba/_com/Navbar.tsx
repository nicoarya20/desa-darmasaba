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

        <Stack hiddenFrom="sm" bg={colors.grey[2]} px="md" py="sm">
          <Group justify="space-between">
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
                <Image src="/darmasaba-icon.png" alt="Village Logo" width={48} height={48} />
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
            <motion.div
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              transition={{ duration: 0.2 }}
              style={{ height: "100vh" }}
            >
              <NavbarMobile listNavbar={navbarListMenu} />
            </motion.div>
          )}
        </Stack>
      </Paper>
      {(item || isSearch) && <Box className="glass" />}
    </Box>
  );
}

function NavbarMobile({ listNavbar }: { listNavbar: MenuItem[] }) {
  const router = useRouter();
  return (
    <ScrollArea h="100vh" offsetScrollbars>
      <Stack p="lg" gap="md" style={{ backgroundColor: "rgba(255, 255, 255, 0.25)" }}>
        {listNavbar.map((item, k) => (
          <Stack key={k} gap={4}>
            <Group
              justify="space-between"
              align="center"
              onClick={() => {
                router.push(item.href);
                stateNav.mobileOpen = false;
              }}
              style={{ cursor: "pointer" }}
            >
              <Text c="dark.9" fw={600} fz="lg">
                {item.name}
              </Text>
              <IconSquareArrowRight size={20} />
            </Group>
            {item.children && <NavbarMobile listNavbar={item.children} />}
          </Stack>
        ))}
      </Stack>
    </ScrollArea>
  );
}
