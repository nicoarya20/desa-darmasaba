'use client'
import colors from '@/con/colors';
import { ActionIcon, Box, Button, Center, Flex, Group, Image, Paper, SimpleGrid, Skeleton, Spoiler, Stack, Text, TextInput } from '@mantine/core';
import { IconSearch, IconUser } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import BackButton from '../../desa/layanan/_com/BackButto';
import Link from 'next/link';
import { useProxy } from 'valtio/utils';
import perpustakaanDigitalState from '@/app/admin/(dashboard)/_state/pendidikan/perpustakaan-digital';
import { useShallowEffect } from '@mantine/hooks';
import { useState } from 'react';

function Page() {
  const state = useProxy(perpustakaanDigitalState)
  const [expandedId, setExpandedId] = useState<string | null>(null);
  useShallowEffect(() => {
    state.dataPerpustakaan.findMany.load()
  }, [])

  if (!state.dataPerpustakaan.findMany.load)
    return (
      <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
        <Box px={{ base: 'md', md: 100 }}>
          <BackButton />
        </Box>
        <Box px={{ base: 'md', md: 100 }} pb={50}>
          <Skeleton h={60} radius="xl" />
          <Skeleton h={200} mt="lg" radius="md" />
        </Box>
      </Stack>
    )
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <Flex justify={'space-between'} align={'center'}>
          <BackButton />
          <ActionIcon variant='transparent' component={Link} href={'/login'}>
            <IconUser color={colors["blue-button"]} size={30} />
          </ActionIcon>
        </Flex>
      </Box>
      <Box px={{ base: 'md', md: 100 }} pb={20}>
        <Text ta={"center"} fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
          E-Book Desa Darmasaba
        </Text>
        <Group justify='center' pb={20}>
          <TextInput
            w={{ base: "50%", md: "70%" }}
            placeholder='Cari Buku...'
            rightSection={
              <Button
                size="xs"
                style={{ height: '80%', marginRight: '5px' }}
                bg={colors["blue-button"]}
              >
                Cari
              </Button>
            }
            rightSectionWidth={70}
            leftSection={<IconSearch size={20} />}
          />
        </Group>
        <Group mb={20} gap="md" justify='center' wrap="wrap">
          <Paper bg={colors['blue-button']} radius="xl" py={5} px={20}>
            <Text c={colors['white-1']} size="sm">
              Semua
            </Text>
          </Paper>
          {['Non Fiksi', 'Sejarah', 'Edukasi', 'Fiksi'].map((kategori) => (
            <Paper key={kategori} bg={'gray'} radius="xl" py={5} px={20}>
              <Text c={colors['white-1']} size="sm">
                {kategori}
              </Text>
            </Paper>
          ))}
        </Group>
        <SimpleGrid
          cols={{
            base: 1,
            md: 3
          }}
          style={{
            alignItems: 'stretch'
          }}
        >
          {state.dataPerpustakaan.findMany.data.map((v, k) => {
            return (
              <Box key={k} style={{ height: '100%' }}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  style={{ width: '100%', height: '100%' }}
                >
                  <Paper 
                    p={"xl"} 
                    bg={colors['white-trans-1']} 
                    w={{ base: "100%", md: "100%" }}
                    style={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <Stack style={{ flex: 1 }}>
                      <Center>
                        <Image src={v.image.link} alt='' w={{ base: 390, md: 1000 }} />
                      </Center>
                      <Text c={colors["blue-button"]} ta={'center'} fw={'bold'} fz={{ base: "h2", md: "h1" }}>{v.judul}</Text>
                      <Spoiler
                        showLabel={
                          <Text fw="bold" fz="sm" c={colors['blue-button']}>
                            Show more
                          </Text>
                        }
                        hideLabel={
                          <Text fw="bold" fz="sm" c={colors['blue-button']}>
                            Hide details
                          </Text>
                        }
                        expanded={expandedId === v.id}
                        onExpandedChange={(isExpanded) => 
                          setExpandedId(isExpanded ? v.id : null)
                        }
                      >
                        <Text
                          ta="justify"
                          fz="sm"
                          dangerouslySetInnerHTML={{ __html: v.deskripsi }}
                        />
                      </Spoiler>
                    </Stack>
                  </Paper>
                </motion.div>
              </Box>
            )
          })}
        </SimpleGrid>
      </Box>
    </Stack>
  );
}

export default Page;
