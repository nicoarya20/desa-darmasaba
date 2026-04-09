"use client";

import stateNav from "@/state/state-nav";
import { Button, Container, Stack, Text } from "@mantine/core";
import { motion } from "motion/react";
import { IconArrowRight } from "@tabler/icons-react";
import type { MenuItem } from "../../../../types/menu-item";
import { useTransitionRouter } from "next-view-transitions";
import colors from "@/con/colors";
import { usePathname } from "next/navigation";

export function NavbarSubMenu({ item }: { item: MenuItem[] | null }) {
  const router = useTransitionRouter();
  const pathname = usePathname();
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
              color={link.href && pathname.startsWith(link.href) ? 'blue' : 'gray'}
              onClick={() => {
                if (link.href) {
                  router.push(link.href);
                  stateNav.item = null;
                  stateNav.isSearch = false;
                }
              }}
              rightSection={<IconArrowRight size={18} />}
              styles={(theme) => ({
                root: {
                  background: link.href && pathname.startsWith(link.href) ? colors['blue-button-2'] : 'transparent',
                  color: link.href && pathname.startsWith(link.href) ? colors['blue-button'] : 'gray',
                  fontWeight: link.href && pathname.startsWith(link.href) ? 600 : 500,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    background: link.href && pathname.startsWith(link.href) ? colors['blue-button-2'] : theme.colors.gray[0],
                  }
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
