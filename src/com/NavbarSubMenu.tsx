"use client";

import stateNav from "@/state/state-nav";
import { Button, Container, Stack } from "@mantine/core";
import { motion } from "motion/react";
import Link from "next/link";
import { MenuItem } from "../../types/menu-item";
import _ from "lodash";

export function NavbarSubMenu({ item }: { item: MenuItem[] | null }) {
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
                  fz={"lg"}
                  color="dark.9"
                  variant="transparent"
                  component={Link}
                  href={item.href}
                  key={k}
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
