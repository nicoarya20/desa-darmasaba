'use client'
import stateVisiMisiPPID from '@/app/admin/(dashboard)/_state/ppid/visi_misi_ppid/visimisiPPID';
import colors from '@/con/colors';
import { Box, Center, Image, Paper, Skeleton, Stack, Text, Divider, Transition } from '@mantine/core';
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
          <Transition mounted={true} transition="fade" duration={500} timingFunction="ease">
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
                  <Box>
                    <Center mb="md">
                      <Image src="/darmasaba-icon.png" w={{ base: 80, md: 130 }} alt="Logo Desa Darmasaba" loading='lazy' />
                    </Center>
                    <Text
                      ta="center"
                      fz={{ base: 28, md: 36 }}
                      fw={800}
                      c={colors['blue-button']}
                    >
                      Moto PPID Desa Darmasaba
                    </Text>
                    <Text ta="center" fz={{ base: 16, md: 20 }} mt="xs">
                      Memberikan informasi yang cepat, mudah, tepat, dan transparan
                    </Text>
                  </Box>

                  <Divider my="sm" labelPosition="center" label={<IconSparkles size={18} />} />

                  <Box>
                    <Text ta="center" fz={{ base: 24, md: 30 }} fw={800}
                      c={colors['blue-button']} mb="sm">
                      Visi PPID
                    </Text>
                    <Text
                      fz={{ base: 'md', md: 'lg' }}
                      lh={1.7}
                      ta="center"
                      dangerouslySetInnerHTML={{ __html: item.visi }}
                      style={{wordBreak: "break-word", whiteSpace: "normal"}}
                    />
                  </Box>

                  <Divider my="sm" />

                  <Box>
                    <Text ta="center" fz={{ base: 24, md: 30 }} fw={800}
                      c={colors['blue-button']} mb="sm">
                      Misi PPID
                    </Text>
                    <Text
                      fz={{ base: 'md', md: 'lg' }}
                      lh={1.7}
                      dangerouslySetInnerHTML={{ __html: item.misi }}
                      style={{wordBreak: "break-word", whiteSpace: "normal"}}
                    />
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
