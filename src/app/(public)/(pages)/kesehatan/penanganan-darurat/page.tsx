'use client'
import penangananDarurat from '@/app/admin/(dashboard)/_state/kesehatan/penanganan-darurat/penangananDarurat'
import { daftarMuat } from '@/app/(public)/(pages)/kesehatan/_com/daftar-muat.logic';
import dm from '@/app/(public)/(pages)/kesehatan/_com/daftar-muat.module.css';
import t from '@/app/(public)/(pages)/kesehatan/_com/kesehatan-tema.module.css';
import { KabarListPagination } from '@/app/(public)/_com/kabar-list/KabarListPagination';
import rt from '@/app/(public)/_com/rich-text/rich-text.module.css';
import { SearchField } from '@/app/(public)/_com/search-field/SearchField';
import {
  Box,
  Button,
  Center,
  Grid,
  GridCol,
  Image,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  Title,
  Tooltip
} from '@mantine/core'
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks'
import { useState } from 'react'
import { useProxy } from 'valtio/utils'
import BackButton from '../../pemerintahan/layanan/_com/BackButto'

/** Entri per halaman daftar publik. */
const PAGE_LIMIT = 3

const TEXT = {
  searchLabel: 'Cari penanganan darurat',
  searchPlaceholder: 'Cari penanganan darurat...',
  paginationLabel: 'Halaman daftar penanganan darurat',
} as const

function Page() {
  const state = useProxy(penangananDarurat)
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebouncedValue(search, 1000)
  const { data, page, totalPages, loading, load } = state.findMany

  const muat = daftarMuat(data, loading)

  // Kata kunci baru → halaman 1 (halaman lama bisa di luar jangkauan hasil baru). Paging memuat sendiri lewat onChange.
  useShallowEffect(() => {
    load(1, PAGE_LIMIT, debouncedSearch)
  }, [debouncedSearch])

  // Kerangka penuh hanya saat muatan pertama; muat ulang menahan kepala, kolom cari, dan daftar lama.
  if (muat.skeleton || !data) {
    return (
      <Box py="xl" px={{ base: 'md', md: 100 }}>
        <Skeleton h={500} radius="lg" />
      </Box>
    )
  }

  return (
    <Stack className={t.tema} bg="var(--c-hero-bg)" py="xl" gap="xl" pos="relative">
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>

      <Grid align="center" px={{ base: 'md', md: 100 }} mb="lg">
        <GridCol span={{ base: 12, md: 9 }}>
          <Title 
            order={1}
            c="var(--c-brand)" 
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
          {/* Pembungkus div: Tooltip butuh anak yang menerima ref. */}
          <Tooltip label="Ketik kata kunci untuk mencari penanganan darurat">
            <div>
              <SearchField
                fullWidth
                label={TEXT.searchLabel}
                placeholder={TEXT.searchPlaceholder}
                value={search}
                onChange={setSearch}
              />
            </div>
          </Tooltip>
        </GridCol>
      </Grid>

      <Box px={{ base: 'md', md: 100 }} className={dm.list} aria-busy={muat.busy}>
        {data.length === 0 ? (
          <Center py={100}>
            <Stack align="center" gap="xs">
              <Title order={2} fw={600} c="var(--c-brand)">
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
                bg="var(--kt-glass)"
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
                      c="var(--c-brand)"
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
                        className={rt.root} dangerouslySetInnerHTML={{ __html: v.deskripsi }}
                        style={{ wordBreak: "break-word", whiteSpace: "normal" }}
                      />
                    </Box>
                    <Button
                      radius="xl"
                      size="md"
                      component="a"
                      href={`/kesehatan/penanganan-darurat/${v.id}`}
                      bg="var(--c-brand-fill)"
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

      <KabarListPagination
        total={totalPages}
        value={page}
        label={TEXT.paginationLabel}
        onChange={(newPage) => load(newPage, PAGE_LIMIT, debouncedSearch)}
      />
    </Stack>
  )
}

export default Page