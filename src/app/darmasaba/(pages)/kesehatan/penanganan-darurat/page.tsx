'use client'
import penangananDarurat from '@/app/admin/(dashboard)/_state/kesehatan/penanganan-darurat/penangananDarurat'
import colors from '@/con/colors'
import {
  Box,
  Button,
  Center,
  Grid,
  GridCol,
  Image,
  Pagination,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip
} from '@mantine/core'
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks'
import { IconSearch } from '@tabler/icons-react'
import { useState } from 'react'
import { useProxy } from 'valtio/utils'
import BackButton from '../../desa/layanan/_com/BackButto'

function Page() {
  const state = useProxy(penangananDarurat)
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebouncedValue(search, 1000)
  const { data, page, totalPages, loading, load } = state.findMany

  useShallowEffect(() => {
    load(page, 3, debouncedSearch)
  }, [page, debouncedSearch])

  if (loading || !data) {
    return (
      <Box py="xl" px={{ base: 'md', md: 100 }}>
        <Skeleton h={500} radius="lg" />
      </Box>
    )
  }

  return (
    <Stack bg={colors.Bg} py="xl" gap="xl" pos="relative">
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>

      <Grid align="center" px={{ base: 'md', md: 100 }} mb="lg">
        <GridCol span={{ base: 12, md: 9 }}>
          <Title 
            order={1}
            c={colors['blue-button']} 
            fw={800} 
            lh={{ base: 1.3, md: 1.2 }}
          >
            Penanganan Darurat
          </Title>
          <Text 
            fz={{ base: 'sm', md: 'md' }} 
            mt={4}
            lh={{ base: 1.5, md: 1.5 }}
          >
            Informasi cepat dan jelas untuk situasi darurat kesehatan
          </Text>
        </GridCol>
        <GridCol span={{ base: 12, md: 3 }}>
          <Tooltip label="Ketik kata kunci untuk mencari penanganan darurat">
            <TextInput
              radius="lg"
              placeholder="Cari penanganan darurat..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftSection={<IconSearch size={20} />}
              w="100%"
            />
          </Tooltip>
        </GridCol>
      </Grid>

      <Box px={{ base: 'md', md: 100 }}>
        {data.length === 0 ? (
          <Center py={100}>
            <Stack align="center" gap="xs">
              <Title order={2} fw={600} c={colors['blue-button']}>
                Tidak ada data ditemukan
              </Title>
              <Text fz={{ base: 'xs', md: 'sm' }}>
                Coba gunakan kata kunci lain
              </Text>
            </Stack>
          </Center>
        ) : (
          <SimpleGrid
            cols={{ base: 1, sm: 2, md: 3 }}
            spacing="xl"
            verticalSpacing="xl"
            pb={20}
          >
            {data.map((v, k) => (
              <Paper
                key={k}
                radius="xl"
                p="md"
                shadow="sm"
                withBorder
                bg={colors['white-trans-1']}
                style={{
                  transition: 'all 0.3s ease',
                  transform: 'translateY(0)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-5px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <Stack align="center" gap="md">
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
                      src={v.image?.link ?? "/no-image.jpg"}
                      alt={v.name}
                      fit="cover"
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        transition: 'transform 0.4s ease',
                      }}
                    />
                  </Box>

                  <Stack gap={4} w="100%">
                    <Title
                      order={3}
                      fw={700}
                      c={colors['blue-button']}
                      ta="center"
                      lineClamp={2}
                      fz={{ base: 'sm', md: 'lg' }}
                      lh={{ base: 1.4, md: 1.4 }}
                    >
                      {v.name}
                    </Title>
                    <Box>
                      <Text
                        fz={{ base: 'xs', md: 'md' }}
                        lh={{ base: 1.5, md: 1.5 }}
                        lineClamp={3}
                        dangerouslySetInnerHTML={{ __html: v.deskripsi }}
                        style={{ wordBreak: "break-word", whiteSpace: "normal" }}
                      />
                    </Box>
                    <Button
                      radius="xl"
                      size="md"
                      component="a"
                      href={`/darmasaba/kesehatan/penanganan-darurat/${v.id}`}
                      bg={colors['blue-button']}
                      c="white"
                    >
                      Lihat Detail
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </SimpleGrid>
        )}
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
              transition: 'all 0.3s ease',
              '&:hover': { backgroundColor: colors['blue-button'], color: 'white' },
            },
          }}
        />
      </Center>
    </Stack>
  )
}

export default Page