'use client'
import keamananLingkunganState from '@/app/admin/(dashboard)/_state/keamanan/keamanan-lingkungan';
import colors from '@/con/colors';
import { Box, Button, Center, Grid, GridCol, Image, Pagination, Paper, SimpleGrid, Skeleton, Stack, Text, TextInput } from '@mantine/core';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../desa/layanan/_com/BackButto';
import { useRouter } from 'next/navigation';


function Page() {
  const state = useProxy(keamananLingkunganState)
  const router = useRouter()  
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebouncedValue(search, 1000); // 500ms delay
  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = state.findMany;

  useShallowEffect(() => {
    load(page, 3, debouncedSearch)
  }, [page, debouncedSearch])

  if (loading || !data) {
    return (
      <Box py={10}>
        <Skeleton h={500} />
      </Box>
    )
  }

  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box>
        <Grid align='center' px={{ base: 'md', md: 100 }}>
          <GridCol span={{ base: 12, md: 9 }}>
            <Text fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
              Keamanan Lingkungan (Pecalang / Patwal)
            </Text>
          </GridCol>
          <GridCol span={{ base: 12, md: 3 }}>
            <TextInput
              radius={"lg"}
              placeholder='Cari Keamanan Lingkungan'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftSection={<IconSearch size={20} />}
              w={{ base: "50%", md: "100%" }}
            />
          </GridCol>
        </Grid>
        <Text px={{ base: 'md', md: 100 }} ta={"justify"} fz="md" mt={4} >
          Pecalang dan Patwal (Patroli Pengawal) bertugas memastikan desa tetap aman, tertib, dan kondusif bagi seluruh warga.
        </Text>
      </Box>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={'lg'}>
          <SimpleGrid
            cols={{ base: 1, sm: 2, md: 3 }} spacing="xl" mt="lg">
            {data.map((v, k) => (
              <Paper
                key={k}
                radius="xl"
                shadow="md"
                withBorder
                p="lg"
                bg={colors['white-trans-1']}
                style={{
                  transition: 'all 200ms ease',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%',
                }}
              >
                <Stack align="center" gap="sm" style={{ flexGrow: 1 }}>
                  <Box
                    style={{
                      width: '100%',
                      aspectRatio: '16/9',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    <Image
                      src={v.image?.link}
                      alt={v.name}
                      fit="cover"
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        transition: 'transform 0.4s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    />
                  </Box>
                  <Text ta="center" fw={700} fz="lg" c={colors['blue-button']}>
                    {v.name}
                  </Text>
                  <Text
                    fz="sm"
                    ta="justify"
                    lineClamp={3}
                    lh={1.6}
                    style={{
                      minHeight: '4.8em',
                    }}
                  >
                    <span
                      style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
                      dangerouslySetInnerHTML={{ __html: v.deskripsi }}
                    />
                  </Text>
                </Stack>
                <Center mt="md">
                  <Button
                    variant="light"
                    onClick={() => {
                      router.push(`/darmasaba/keamanan/keamanan-lingkungan-pecalang-patwal/${v.id}`)
                    }}
                  >
                    Detail
                  </Button>
                </Center>
              </Paper>
            ))}
          </SimpleGrid>
        </Stack>
      </Box>

      <Center mt="xl">
        <Pagination
          value={page}
          onChange={(newPage) => load(newPage, 3, search)}
          total={totalPages}
          size="lg"
          radius="xl"
          styles={{
            control: {
              border: `1px solid ${colors['blue-button']}`,
            },
          }}
        />
      </Center>
    </Stack>
  );
}

export default Page;
