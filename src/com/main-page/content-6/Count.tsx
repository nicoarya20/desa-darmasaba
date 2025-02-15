"use client";

import { Stack } from "@mantine/core";
import { useShallowEffect } from "@mantine/hooks";
import { animate, motion, useMotionValue, useTransform } from "motion/react";

export default function Count() {
  const count = useMotionValue(0);
  const rounded = useTransform(() => Math.round(count.get()));

  useShallowEffect(() => {
    const controls = animate(count, 100, { duration: 5 });
    return () => controls.stop();
  }, []);

  return (
    <Stack>
        <motion.pre style={text}>{rounded}</motion.pre>
    </Stack>
  );
}

/**
 * ==============   Styles   ================
 */

const text = {
  fontSize: 64,
  color: "#4ff0b7",
};
