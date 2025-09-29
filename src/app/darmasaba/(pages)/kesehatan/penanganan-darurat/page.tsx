'use client'
import penangananDarurat from '@/app/admin/(dashboard)/_state/kesehatan/penanganan-darurat/penangananDarurat'
import colors from '@/con/colors'
import {
  Badge,
  Box,
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
  Tooltip
} from '@mantine/core'
import { useShallowEffect } from '@mantine/hooks'
import { IconSearch } from '@tabler/icons-react'
import { useState } from 'react'
import { useProxy } from 'valtio/utils'
import BackButton from '../../desa/layanan/_com/BackButto'

function Page() {
  const state = useProxy(penangananDarurat)
  const [search, setSearch] = useState('')

  const { data, page, totalPages, loading, load } = state.findMany

  useShallowEffect(() => {
    load(page, 6, search)
  }, [page, search])

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
          <Text fz={{ base: 30, md: 40 }} c={colors['blue-button']} fw={800} lh={1.2}>
            Penanganan Darurat
          </Text>
          <Text fz="md" c="dimmed" mt={4}>
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
              <Text fz="lg" fw={600} c={colors['blue-button']}>
                Tidak ada data ditemukan
              </Text>
              <Text fz="sm" c="dimmed">
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
                style={{ transition: 'all 0.3s ease' }}
              >
                <Stack align="center" gap="md">
                  <Center>
                    <Image
                      src={v.image.link}
                      alt={v.name}
                      w={160}
                      h={160}
                      fit="contain"
                      radius="md"
                      loading="lazy"
                    />
                  </Center>
                  <Stack gap={4} w="100%">
                    <Text
                      fz="lg"
                      fw={700}
                      c={colors['blue-button']}
                      ta="center"
                      lineClamp={2}
                    >
                      {v.name}
                    </Text>
                    <Box>
                      <Text
                        fz="sm"
                        c="dimmed"
                        lineClamp={4}
                        dangerouslySetInnerHTML={{ __html: v.deskripsi }}
                        style={{wordBreak: "break-word", whiteSpace: "normal"}}
                      />
                    </Box>
                  </Stack>
                  <Badge radius="md" color="blue" variant="light" mt="sm">
                    Darurat
                  </Badge>
                </Stack>
              </Paper>
            ))}
          </SimpleGrid>
        )}
      </Box>

      {totalPages > 1 && (
        <Center mt="xl">
          <Pagination
            value={page}
            onChange={(newPage) => load(newPage, 6, search)}
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
      )}
    </Stack>
  )
}

export default Page
