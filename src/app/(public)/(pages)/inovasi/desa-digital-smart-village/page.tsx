'use client'
import colors from '@/con/colors';
import { Stack, Box, Text, Paper, SimpleGrid, Image, Skeleton, Center, Pagination, Grid, GridCol, TextInput, Button } from '@mantine/core';
import React, { useState } from 'react';
import BackButton from '../../pemerintahan/layanan/_com/BackButto';
import { useProxy } from 'valtio/utils';
import desaDigitalState from '@/app/admin/(dashboard)/_state/inovasi/desa-digital';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

const PAGE_SIZE = 3;

/**
 * lineClamp Mantine memakai `display: -webkit-box`. Di WebKit, clamp gagal
 * kalau isinya mengandung tag blok (<p>, <div>, <ul>) -- teks tampil penuh
 * dan tinggi kartu meledak, tapi hanya di Safari. Jadi deskripsi HTML
 * diratakan jadi plain text dulu sebelum di-clamp.
 *
 * Regex dipakai (bukan DOMParser) supaya tetap aman saat SSR.
 */
function toPlainText(html?: string | null) {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function Page() {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 500);
  const state = useProxy(desaDigitalState);
  const router = useRouter();

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = state.findMany;

  useShallowEffect(() => {
    load(page, PAGE_SIZE, debouncedSearch);
  }, [page, debouncedSearch]);

  // Kata kunci berubah -> balik ke halaman 1, kalau tidak hasil pencarian
  // baru dibuka di halaman 2 dan sering tampil kosong.
  useShallowEffect(() => {
    if (state.findMany.page !== 1) state.findMany.page = 1;
  }, [debouncedSearch]);

  const items = data ?? [];
  const isEmpty = !loading && items.length === 0;

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="22">
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>

      {/* Header dan kolom cari selalu ter-mount. Kalau seluruh halaman
          diganti Skeleton saat loading, TextInput ikut unmount dan fokus
          keyboard hilang tiap kali debounce selesai. */}
      <Box px={{ base: 'md', md: 100 }}>
        <Grid align="center">
          <GridCol span={{ base: 12, md: 9 }}>
            <Text fz={{ base: 'h1', md: '2.5rem' }} c={colors['blue-button']} fw="bold">
              Desa Digital / Smart Village
            </Text>
          </GridCol>
          <GridCol span={{ base: 12, md: 3 }}>
            <TextInput
              radius="lg"
              placeholder="Cari Produk"
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              leftSection={<IconSearch size={20} />}
              w="100%"
            />
          </GridCol>
        </Grid>
        <Text pt={20} fz="md">Menjadikan Desa Darmasaba pusat inovasi digital untuk pemberdayaan masyarakat</Text>
        <Text fz="md">dan peningkatan ekonomi berbasis teknologi.</Text>
      </Box>

      <Box px={{ base: 'md', md: 100 }}>
        <SimpleGrid pb={10} cols={{ base: 1, md: 3 }}>
          {loading
            ? Array.from({ length: PAGE_SIZE }).map((_, k) => (
              <Skeleton key={k} h={420} radius="xl" />
            ))
            : items.map((v) => (
              <Paper
                key={v.id}
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
                  // JANGAN pasang height: '100%' di sini.
                  // Paper ini grid item dengan row height `auto`, jadi
                  // containing block-nya indefinite. Blink me-resolve
                  // persentase itu jadi `auto`; WebKit me-resolve-nya ke
                  // tinggi grid container (sudah termasuk gap + hasil
                  // stretch), sehingga kartu jadi lebih tinggi dari
                  // barisnya sendiri dan tombol Detail terdorong keluar.
                  // Grid sudah align-items: stretch secara default, jadi
                  // tinggi kartu tetap seragam tanpa height: 100%.
                  minHeight: 0,
                }}
                onClick={() => router.push(`/inovasi/desa-digital-smart-village/${v.id}`)}
              >
                {/* flexBasis 'auto', bukan shorthand `flex: 1`.
                    `flex: 1` = flex-basis 0%, artinya tinggi dasar dianggap
                    nol lalu di-grow -- perhitungan free space yang sering
                    meleset di WebKit saat tinggi induk tidak definitif. */}
                <Stack gap="xs" style={{ flexGrow: 1, flexBasis: 'auto', minHeight: 0 }}>
                  <Box
                    style={{
                      width: '100%',
                      aspectRatio: '16 / 9',
                      borderRadius: 12,
                      overflow: 'hidden',
                      position: 'relative',
                      flexShrink: 0,
                    }}
                  >
                    {/* Dipancang absolut. Tinggi induk berasal dari
                        aspect-ratio, dan Safari lama menganggap itu
                        indefinite -- height: '100%' jatuh ke `auto`
                        dan gambar pakai tinggi intrinsiknya. */}
                    <Image
                      src={v.image?.link || '/no-image.jpg'}
                      alt={v.name}
                      loading="lazy"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.4s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    />
                  </Box>

                  <Text fz="h3" fw="bold" c={colors['blue-button']} lineClamp={2}>
                    {v.name}
                  </Text>

                  {/* truncate="end" dihapus: dia menambah white-space: nowrap
                      yang bentrok dengan lineClamp. */}
                  <Text
                    fz="md"
                    lineClamp={3}
                    style={{ wordBreak: 'break-word' }}
                  >
                    {toPlainText(v.deskripsi)}
                  </Text>
                </Stack>

                {/* paddingTop, bukan mt="md". Inline marginTop: 'auto'
                    menimpa class mt Mantine, jadi jaraknya hilang. */}
                <Center style={{ marginTop: 'auto', paddingTop: 'var(--mantine-spacing-md)' }}>
                  <Button
                    bg={colors['blue-button']}
                    radius="lg"
                    w="100%"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/inovasi/desa-digital-smart-village/${v.id}`);
                    }}
                  >
                    Detail
                  </Button>
                </Center>
              </Paper>
            ))}
        </SimpleGrid>

        {isEmpty && (
          <Center py={60}>
            <Stack gap="xs" align="center">
              <Text fz="h4" fw="bold" c={colors['blue-button']}>
                {debouncedSearch ? 'Produk tidak ditemukan' : 'Belum ada produk'}
              </Text>
              <Text fz="sm" c="dimmed" ta="center">
                {debouncedSearch
                  ? `Tidak ada hasil untuk "${debouncedSearch}". Coba kata kunci lain.`
                  : 'Produk inovasi desa akan tampil di sini setelah ditambahkan.'}
              </Text>
              {debouncedSearch && (
                <Button variant="subtle" mt="xs" onClick={() => setSearch('')}>
                  Hapus pencarian
                </Button>
              )}
            </Stack>
          </Center>
        )}
      </Box>

      {totalPages > 1 && (
        <Center>
          {/* Cukup ubah page; useShallowEffect di atas yang memanggil load
              dengan limit + kata kunci yang benar. Memanggil load(newPage)
              langsung akan menjatuhkan limit dan search, sekaligus memicu
              fetch ganda karena `page` juga jadi dependency effect. */}
          <Pagination
            value={page}
            onChange={(newPage) => { state.findMany.page = newPage; }}
            total={totalPages}
            mt="md"
            mb="md"
            disabled={loading}
          />
        </Center>
      )}
    </Stack>
  );
}

export default Page;