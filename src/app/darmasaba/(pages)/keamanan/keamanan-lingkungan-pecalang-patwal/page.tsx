'use client'
import keamananLingkunganState from '@/app/admin/(dashboard)/_state/keamanan/keamanan-lingkungan';
import colors from '@/con/colors';
import { Box, Button, Center, Grid, GridCol, Image, Pagination, Paper, SimpleGrid, Skeleton, Stack, Text, TextInput, Title } from '@mantine/core';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../desa/layanan/_com/BackButto';
import { useRouter } from 'next/navigation';

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
  const state = useProxy(keamananLingkunganState)
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebouncedValue(search, 1000);
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
            <Title order={1} c={colors["blue-button"]} lh={1.15}>
              Keamanan Lingkungan (Pecalang / Patwal)
            </Title>
          </GridCol>
          <GridCol span={{ base: 12, md: 3 }}>
            <TextInput
              radius={"lg"}
              placeholder='Cari Keamanan Lingkungan'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftSection={<IconSearch size={20} />}
              w={"100%"}
            />
          </GridCol>
        </Grid>
        <Text
          px={{ base: 'md', md: 100 }}
          pt={20}
          ta={"justify"}
          fz={{ base: 'sm', md: 'md' }}
          lh={1.55}
          mt={4}
          c={'black'}
        >
          Pecalang dan Patwal (Patroli Pengawal) bertugas memastikan desa tetap aman, tertib, dan kondusif bagi seluruh warga.
        </Text>
      </Box>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap={'lg'}>
          <SimpleGrid
            cols={{ base: 1, sm: 2, md: 3 }}
            spacing="xl"
            mt="lg"
          >
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
                  // JANGAN pasang height: '100%' + justify space-between di sini.
                  // Paper ini grid item dengan row height `auto`, containing
                  // block-nya indefinite. Blink me-resolve persentase itu jadi
                  // `auto`; WebKit me-resolve-nya ke tinggi grid container
                  // (termasuk gap + hasil stretch), sehingga kartu jadi lebih
                  // tinggi dari barisnya dan tombol Detail terdorong keluar.
                  // Grid sudah align-items: stretch default -> tinggi seragam.
                  minHeight: 0,
                }}
                onClick={() => router.push(`/darmasaba/keamanan/keamanan-lingkungan-pecalang-patwal/${v.id}`)}
              >
                {/* flexBasis 'auto', bukan `flex: 1` (= flex-basis 0%) yang
                    perhitungan free space-nya sering meleset di WebKit. */}
                <Stack align="center" gap="sm" style={{ flexGrow: 1, flexBasis: 'auto', minHeight: 0 }}>
                  <Box
                    style={{
                      width: '100%',
                      aspectRatio: '16/9',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      position: 'relative',
                      flexShrink: 0,
                    }}
                  >
                    {/* Dipancang absolut. Tinggi induk berasal dari
                        aspect-ratio, dan Safari lama menganggap itu indefinite
                        -- height: '100%' jatuh ke `auto` dan gambar pakai
                        tinggi intrinsiknya. */}
                    <Image
                      src={v.image?.link}
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
                  <Title order={2} ta="center" c={colors['blue-button']} lh={1.2} lineClamp={2}>
                    {v.name}
                  </Title>
                  {/* dangerouslySetInnerHTML + truncate dihapus: tag blok bikin
                      lineClamp gagal di WebKit, truncate menambah nowrap yang
                      bentrok. Deskripsi diratakan lewat toPlainText dulu. */}
                  <Text
                    fz={{ base: 'xs', md: 'sm' }}
                    ta="justify"
                    lineClamp={3}
                    lh={1.55}
                    style={{ minHeight: '4.8em', wordBreak: 'break-word' }}
                    c={'black'}
                  >
                    {toPlainText(v.deskripsi)}
                  </Text>
                </Stack>
                {/* paddingTop, bukan mt="md". Inline marginTop: 'auto' menimpa
                    class mt Mantine, jadi jaraknya hilang. */}
                <Center style={{ marginTop: 'auto', paddingTop: 'var(--mantine-spacing-md)' }}>
                  <Button
                    variant="light"
                    onClick={(e) => {
                      e.stopPropagation()
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
