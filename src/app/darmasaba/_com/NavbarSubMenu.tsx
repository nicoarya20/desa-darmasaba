"use client";

import stateNav from "@/state/state-nav";
import { Button, Container, Stack, Text } from "@mantine/core";
import { motion } from "motion/react";
import { IconArrowRight } from "@tabler/icons-react";
import { MenuItem } from "../../../../types/menu-item";
import { useTransitionRouter } from "next-view-transitions";
import colors from "@/con/colors";

export function NavbarSubMenu({ item }: { item: MenuItem[] | null }) {
  const router = useTransitionRouter();

  return (
    <motion.div
      key={Math.random().toString(36).slice(2)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Container
        key={stateNav.item?.[0]?.id}
        onMouseLeave={() => {
          stateNav.item = null;
          stateNav.isSearch = false;
        }}
        w={{ base: "100%", md: "80%" }}
        fluid
        py="xl"
      >
        {item && item.length > 0 ? (
          <Stack gap="xs" align="stretch">
            {item.map((link, index) => (
              <Button
                key={index}
                variant="subtle"
                justify="space-between"
                size="lg"
                radius="md"
                color="gray.0"
                onClick={() => {
                  router.push(link.href);
                  stateNav.item = null;
                  stateNav.isSearch = false;
                }}
                rightSection={<IconArrowRight size={18} />}
                styles={(theme) => ({
                  root: {
                    background: "transparent",
                    color: colors['blue-button'],
                    fontWeight: 500,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      background: theme.colors.gray[8],
                      boxShadow: `0 0 12px ${theme.colors.blue[6]}55`,
                    },
                  },
                })}
              >
                {link.name}
              </Button>
            ))}
          </Stack>
        ) : (
          <Stack align="center" py="xl">
            <Text c="dimmed" size="sm">
              No submenu available
            </Text>
          </Stack>
        )}
      </Container>
    </motion.div>
  );
}
