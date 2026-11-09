'use client'
import kontakDarurat from '@/app/admin/(dashboard)/_state/kesehatan/kontak-darurat/kontakDarurat';
import colors from '@/con/colors';
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
} from '@mantine/core';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';
import { useTransitionRouter } from 'next-view-transitions';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../pemerintahan/layanan/_com/BackButto';

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
  const state = useProxy(kontakDarurat);
  const router = useTransitionRouter()
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 1000)
  const { data, page, totalPages, loading, load } = state.findMany;

  useShallowEffect(() => {
    load(page, 3, debouncedSearch);
  }, [page, debouncedSearch]);

  if (loading || !data) {
    return (
      <Box py="xl" px={{ base: 'md', md: 100 }}>
        <Skeleton height={500} radius="lg" />
      </Box>
    );
  }

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="lg">
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>

      <Grid align="center" px={{ base: 'md', md: 100 }} gap="lg">
        <GridCol span={{ base: 12, md: 8 }}>
          <Title
            order={1}
            c={colors['blue-button']}
            fw={800}
            fz={{ base: '28px', md: '32px' }}
            lh={{ base: 1.2, md: 1.25 }}
          >
            Kontak Darurat
          </Title>
          <Text
            fz={{ base: 'sm', md: 'md' }}
            lh={{ base: 1.5, md: 1.6 }}
            mt={4}
            c="dark.9"
          >
            Hubungi layanan penting dengan cepat dan mudah
          </Text>
        </GridCol>
        <GridCol span={{ base: 12, md: 4 }}>
          <Tooltip label="Cari berdasarkan nama atau deskripsi" withArrow>
            <TextInput
              radius="xl"
              size="md"
              placeholder="Cari kontak darurat..."
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
          <Center mih={300}>
            <Stack align="center" gap="xs">
              <IconSearch size={50} color={colors['blue-button']} />
              <Title
                order={2}
                fw={600}
                c={colors['blue-button']}
                fz={{ base: '20px', md: '24px' }}
                lh={{ base: 1.3, md: 1.35 }}
              >
                Tidak ada kontak ditemukan
              </Title>
              <Text
                fz={{ base: 'xs', md: 'sm' }}
                lh={{ base: 1.4, md: 1.5 }}
                c="dark.7"
              >
                Coba kata kunci lain untuk pencarian
              </Text>
            </Stack>
          </Center>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl" mt="lg">
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
                  // Paper ini grid item dengan row height `auto`; WebKit
                  // me-resolve persentase itu ke tinggi grid container (termasuk
                  // gap + stretch), kartu jadi lebih tinggi dari barisnya dan
                  // tombol Detail terdorong keluar. Grid sudah stretch default.
                  minHeight: 0,
                }}
                onClick={() => router.push(`/darmasaba/kesehatan/kontak-darurat/${v.id}`)}
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
                      src={v.image?.link ?? "/no-image.jpg"}
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

                  <Text ta="center" fw={700} fz={{ base: '18px', md: '20px' }} lh={1.3} c={colors['blue-button']} lineClamp={2}>
                    {v.name}
                  </Text>

                  {/* dangerouslySetInnerHTML dihapus: tag blok bikin lineClamp
                      gagal di WebKit. Deskripsi diratakan via toPlainText. */}
                  <Text
                    fz={{ base: 'xs', md: 'sm' }}
                    ta="center"
                    lineClamp={3}
                    lh={{ base: 1.5, md: 1.6 }}
                    style={{ minHeight: '4.8em', wordBreak: 'break-word' }}
                  >
                    {toPlainText(v.deskripsi)}
                  </Text>
                </Stack>

                {/* paddingTop, bukan mt="md". Inline marginTop: 'auto' menimpa
                    class mt Mantine, jadi jaraknya hilang. */}
                <Center style={{ marginTop: 'auto', paddingTop: 'var(--mantine-spacing-md)' }}>
                  <Button
                    bg={colors['blue-button']}
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/darmasaba/kesehatan/kontak-darurat/${v.id}`)
                    }}
                  >
                    Detail
                  </Button>
                </Center>
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
            },
          }}
        />
      </Center>
    </Stack>
  );
}

export default Page;
