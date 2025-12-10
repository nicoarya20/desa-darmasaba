'use client'
import stateVisiMisiPPID from '@/app/admin/(dashboard)/_state/ppid/visi_misi_ppid/visimisiPPID';
import colors from '@/con/colors';
import {
  Box,
  Center,
  Image,
  Paper,
  Skeleton,
  Stack,
  Text,
  Divider,
  Transition,
  Title
} from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { useProxy } from 'valtio/utils';
import { IconSparkles } from '@tabler/icons-react';
import BackButton from '../../desa/layanan/_com/BackButto';

function Page() {
  const allList = useProxy(stateVisiMisiPPID);

  useShallowEffect(() => {
    allList.findById.load("1");
  }, []);

  if (!allList.findById.data) {
    return (
      <Stack p="xl" gap="sm">
        {Array.from({ length: 6 }).map((_, k) => (
          <Skeleton key={k} h={60} radius="lg" />
        ))}
      </Stack>
    );
  }

  const dataArray = Array.isArray(allList.findById.data)
    ? allList.findById.data
    : [allList.findById.data];

  return (
    <Stack bg={colors.Bg} py="xl" gap={40}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>

      {dataArray.map((item) => (
        <Box key={item.id} px={{ base: 'md', md: 100 }}>
          <Transition mounted transition="fade" duration={500} timingFunction="ease">
            {(styles) => (
              <Paper
                style={styles}
                p={{ base: 'lg', md: 'xl' }}
                radius="2xl"
                shadow="xl"
                bg={colors['white-trans-1']}
                withBorder
              >
                <Stack gap="xl">

                  {/* ==== MOTTO SECTION ==== */}
                  <Box>
                    <Center mb="md">
                      <Image
                        src="/darmasaba-icon.png"
                        w={{ base: 80, md: 130 }}
                        alt="Logo Desa Darmasaba"
                        loading="lazy"
                      />
                    </Center>

                    <Title
                      order={2}
                      ta="center"
                      fz={{ base: 26, md: 34 }}
                      lh={1.2}
                      c={colors['blue-button']}
                    >
                      Moto PPID Desa Darmasaba
                    </Title>

                    <Text
                      ta="center"
                      fz={{ base: 15, md: 18 }}
                      lh={1.5}
                      c={"black"}
                      mt="xs"
                    >
                      Memberikan informasi yang cepat, mudah, tepat, dan transparan
                    </Text>
                  </Box>

                  <Divider
                    my="sm"
                    labelPosition="center"
                    label={<IconSparkles size={18} />}
                  />

                  {/* ==== VISI SECTION ==== */}
                  <Box>
                    <Title
                      order={3}
                      ta="center"
                      fz={{ base: 22, md: 28 }}
                      lh={1.2}
                      c={colors['blue-button']}
                      mb="sm"
                    >
                      Visi PPID
                    </Title>

                    <Text
                      ta="center"
                      fz={{ base: 15, md: 18 }}
                      lh={1.7}
                      dangerouslySetInnerHTML={{ __html: item.visi }}
                      style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
                    />
                  </Box>

                  <Divider my="sm" />

                  {/* ==== MISI SECTION ==== */}
                  <Box>
                    <Title
                      order={3}
                      ta="center"
                      fz={{ base: 22, md: 28 }}
                      lh={1.2}
                      c={colors['blue-button']}
                      mb="sm"
                    >
                      Misi PPID
                    </Title>

                    <Box px={{ base: 'md', md: 100 }}>
                      <Text
                        ta="justify"
                        fz={{ base: 15, md: 18 }}
                        lh={1.7}
                        dangerouslySetInnerHTML={{ __html: item.misi }}
                        style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
                      />
                    </Box>
                  </Box>

                </Stack>
              </Paper>
            )}
          </Transition>
        </Box>
      ))}
    </Stack>
  );
}

export default Page;
