'use client'
import kontakDarurat from '@/app/admin/(dashboard)/_state/keamanan/kontak-darurat-keamanan';
import colors from '@/con/colors';
import { Avatar, Box, Center, Flex, Group, Pagination, Paper, SimpleGrid, Skeleton, Stack, Text, TextInput, Title } from '@mantine/core';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconPhoneCall, IconSearch } from '@tabler/icons-react';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../desa/layanan/_com/BackButto';
import { IconKey, IconMapper } from '@/app/admin/(dashboard)/_com/iconMap';

function Page() {
  const kontakState = useProxy(kontakDarurat.kontakDaruratKeamananState);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 1000);
  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = kontakState.findMany;

  useShallowEffect(() => {
    load(page, 4, debouncedSearch);
    kontakDarurat.kontakDaruratItem.findMany.load();
  }, [page, debouncedSearch]);

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={600} radius="md" />
      </Stack>
    );
  }

  if (data.length === 0) {
    return (
      <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
        <Box px={{ base: 'md', md: 100 }}>
          <BackButton />
        </Box>
        <Group px={{ base: 'md', md: 100 }} justify={'space-between'} align='center'>
          <Box>
            <Title order={1} c={colors["blue-button"]} style={{ lineHeight: 1.15 }}>
              Kontak Darurat
            </Title>
            <Text fz={{ base: 'sm', md: 'md' }} lh={1.5} c={colors['blue-button-2']} style={{ color: colors['blue-button-2'] }}>
              Desa Darmasaba, Kecamatan Abiansemal, Kabupaten Badung.
            </Text>
          </Box>
          <TextInput
            radius={"lg"}
            placeholder='Cari Kontak Darurat'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftSection={<IconSearch size={20} />}
            w={{ base: "100%", md: "25%" }}
          />
        </Group>
        <Box px={{ base: "md", md: 100 }}>
          <Stack gap={'lg'}>
            <Paper p={"xl"} bg={colors['white-trans-1']} w={{ base: "100%", md: "100%" }}>
              <Flex justify={'center'} gap={'lg'} align={'center'}>
                <Avatar radius={"xl"} size={'lg'} bg={colors['BG-trans']}>
                  <IconPhoneCall size={30} color={colors["blue-button"]} />
                </Avatar>
                <Box>
                  <Text ta={'center'} c={colors['blue-button']} py={10} fz={{ base: "sm", md: "md" }} fw={"bold"} lh={1.3} >
                    Nomor Darurat Utama
                  </Text>
                  <Title order={2} ta={'center'} c={colors["blue-button"]} style={{ lineHeight: 1.15 }}>
                    112
                  </Title>
                </Box>
              </Flex>
            </Paper>
          </Stack>
        </Box>
        <Center>
          <Title order={2} c={colors["blue-button"]} style={{ lineHeight: 1.15 }}>
            Tidak ada kontak darurat yang ditemukan
          </Title>
        </Center>
      </Stack>
    );
  }

  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Group px={{ base: 'md', md: 100 }} justify={'space-between'} align='center'>
        <Box>
          <Title order={1} c={colors["blue-button"]} style={{ lineHeight: 1.15 }}>
            Kontak Darurat
          </Title>
          <Text fz={{ base: 'sm', md: 'md' }} lh={1.5} c={colors['blue-button-2']}>
            Desa Darmasaba, Kecamatan Abiansemal, Kabupaten Badung.
          </Text>
        </Box>
        <TextInput
          radius={"lg"}
          placeholder='Cari Kontak Darurat'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftSection={<IconSearch size={20} />}
          w={{ base: "50%", md: "100%" }}
        />
      </Group>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={'lg'}>
          <Paper p={"xl"} bg={colors['white-trans-1']} w={{ base: "100%", md: "100%" }}>
            <Flex justify={'center'} gap={'lg'} align={'center'}>
              <Avatar radius={"xl"} size={'lg'} bg={colors['BG-trans']}>
                <IconPhoneCall size={30} color={colors["blue-button"]} />
              </Avatar>
              <Box>
                <Text ta={'center'} c={colors['blue-button']} py={10} fz={{ base: "sm", md: "md" }} fw={"bold"} lh={1.3} >
                  Nomor Darurat Utama
                </Text>
                <Title order={2} ta={'center'} c={colors["blue-button"]} style={{ lineHeight: 1.15 }}>
                  112
                </Title>
              </Box>
            </Flex>
          </Paper>
        </Stack>
      </Box>
      <Box px={{ base: "md", md: 100 }}>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl" style={{ alignItems: 'flex-start' }}>
          {data.map((item) => (
            <a
              key={item.id}
              href={`tel:${item.kontakItems[0]?.kontakItem?.nomorTelepon || '112'}`}
              style={{ textDecoration: 'none' }}
            >
              <Paper p="lg" radius="md" bg={colors['white-trans-1']}>
                <Group pb="md" align="center">
                  <Avatar radius="xl" size="lg" bg={colors['BG-trans']}>
                    {item.icon && (
                      <IconMapper
                        name={item.icon as IconKey}
                        size={32}
                        color={colors['blue-button']}
                      />
                    )}
                  </Avatar>
                  <Title order={3} c={colors["blue-button"]} style={{ lineHeight: 1.2 }}>
                    {item.nama}
                  </Title>
                </Group>

                {item.kontakItems && item.kontakItems.length > 0 ? (
                  <Stack gap="sm">
                    {item.kontakItems.map((kontak) => (
                      <Paper
                        key={kontak.id}
                        p="lg"
                        bg={colors['BG-trans']}
                        radius="md"
                        shadow="xs"
                      >
                        <Group align="center" justify="space-between">
                          <Group align="center">
                            {kontak.kontakItem?.icon && (
                              <IconMapper
                                name={kontak.kontakItem.icon as IconKey}
                                size={24}
                                color={colors['blue-button']}
                              />
                            )}
                            <Text fw="bold" fz={{ base: "xs", md: "sm" }} c={colors["blue-button"]} lh={1.45}>
                              {kontak.kontakItem?.nama}
                            </Text>
                          </Group>
                          <Text fw="bold" fz={{ base: "xs", md: "sm" }} c={colors["blue-button"]} lh={1.45}>
                            {kontak.kontakItem?.nomorTelepon}
                          </Text>
                        </Group>
                      </Paper>
                    ))}
                  </Stack>
                ) : (
                  <Paper p="lg" bg={colors['BG-trans']} radius="md" shadow="xs">
                    <Text ta="center" fz={{ base: "xs", md: "sm" }} c="dimmed" lh={1.45}>
                      Belum ada kontak tersedia
                    </Text>
                  </Paper>
                )}
              </Paper>
            </a>
          ))}
        </SimpleGrid>
        <Center>
          <Pagination
            value={page}
            onChange={(newPage) => {
              load(newPage, 4, search);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            total={totalPages}
            mt="md"
            mb="md"
            color="blue"
            radius="md"
          />
        </Center>
      </Box>
    </Stack>
  );
}

export default Page;