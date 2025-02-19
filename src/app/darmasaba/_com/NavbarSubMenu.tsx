"use client";

import stateNav from "@/state/state-nav";
import { Button, Container, Stack } from "@mantine/core";
import _ from "lodash";
import { motion } from "motion/react";
import { MenuItem } from "../../../../types/menu-item";
import { useTransitionRouter } from 'next-view-transitions'

export function NavbarSubMenu({ item }: { item: MenuItem[] | null }) {
  const router = useTransitionRouter()
  return (
    <motion.div
      key={_.uniqueId()}
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <Container
        key={stateNav.item?.[0]?.id}
        onMouseLeave={() => {
          stateNav.item = null;
          stateNav.isSearch = false;
        }}
        w={{
          base: "100%",
          md: "80%",
        }}
        fluid
      >
        <Stack gap={0} align="start" py={"xl"}>
          {item &&
            item.map((item, k) => {
              return (
                <Button
                  key={k}
                  fz={"lg"}
                  color="dark.9"
                  variant="transparent"
                  onClick={() => {
                    router.push(item.href)
                    stateNav.item = null
                    stateNav.isSearch = false
                  }}
                >
                  {item.name}
                </Button>
              );
            })}
        </Stack>
      </Container>
    </motion.div>
  );
}
