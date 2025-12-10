'use client'
import { ActionIcon, Box, Flex, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import { motion } from 'framer-motion';
import { IconSparkles } from '@tabler/icons-react';
import colors from '@/con/colors';

const dataText = [
  {
    id: 1,
    title: "Santun",
    description: "Pelayanan ramah, penuh empati, sopan, dan beretika."
  },
  {
    id: 2,
    title: "Adaptif",
    description: "Cepat menyesuaikan diri terhadap perubahan dan selalu proaktif."
  },
  {
    id: 3,
    title: "Inovatif",
    description: "Berani menciptakan pembaruan dan ide-ide kreatif."
  },
  {
    id: 4,
    title: "Profesional",
    description: "Berpengetahuan luas, terampil, dan bertanggung jawab."
  },
  {
    id: 5,
    title: "Gesit",
    description: "Cekatan, sigap, dan penuh inisiatif dalam bekerja."
  },
];

const letters = ["S", "I", "G", "A", "P"];

function MotoDesa() {
  return (
    <Box px={{ base: "md", md: "xl" }}>
      <Stack align="center" gap="lg">
        <Box>
          <Text
            ta="center"
            fw={800}
            fz={{ base: "2rem", md: "2.8rem" }}
            style={{
              background: "linear-gradient(90deg, #0D5594FF, #094678FF)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Moto Desa Darmasaba
          </Text>
        </Box>

        <Flex gap={30} pb={40} pt={10} wrap="wrap" justify="center">
          {letters.map((letter, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.15, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <ActionIcon
                radius="xl"
                size={90}
                variant="gradient"
                gradient={{ from: "blue", to: "cyan" }}
                style={{
                  boxShadow: `0 0 18px ${colors['blue-button']}`,
                  backdropFilter: "blur(6px)",
                }}
              >
                <Text c="white" fw={800} fz="xl">
                  {letter}
                </Text>
              </ActionIcon>
            </motion.div>
          ))}
        </Flex>

        <Paper
          radius="lg"
          p="xl"
          withBorder
          style={{
            background: "linear-gradient(145deg, #ffffffcc, #f5faffcc)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          }}
        >
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
            {dataText.map((v) => (
              <motion.div
                key={v.id}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Stack gap={4}>
                  <Flex align="center" gap="sm">
                    <IconSparkles size={20} color={colors['blue-button']} />
                    <Text fw={700} fz={{ base: "lg", md: "xl" }} c={colors['blue-button']}>
                      {v.title}
                    </Text>
                  </Flex>
                  <Text fz={{ base: "sm", md: "md" }} c="gray.7">
                    {v.description}
                  </Text>
                </Stack>
              </motion.div>
            ))}
          </SimpleGrid>
        </Paper>

        <Text
          ta="center"
          fw={700}
          fz={{ base: "md", md: "xl" }}
          c="blue.8"
          mt="md"
          style={{
            maxWidth: 720,
            lineHeight: 1.6,
          }}
        >
          &quot;Berkomitmen menghadirkan pelayanan terbaik dengan semangat{" "}
          <Text span fw={800} c="cyan.6">
            SIGAP
          </Text>{" "}
          untuk masyarakat Desa Darmasaba.&quot;
        </Text>
      </Stack>
    </Box>
  );
}

export default MotoDesa;
