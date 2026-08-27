'use client'
import { Box, Button, Group, Paper, Skeleton, Stack, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconEdit } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import stateKonservasiAdatBali from '../../../_state/lingkungan/konservasi-adat-bali';

/**
 * lineClamp Mantine memakai `display: -webkit-box`. Di WebKit (Safari/iOS),
 * clamp gagal kalau isinya mengandung tag blok (<p>, <div>, <ul>, <h1-6>)
 * -- teks tampil penuh dan overlap dengan elemen di bawahnya, tapi hanya
 * di Safari (mis. iPhone X). Deskripsi rich-text sering berisi tag blok,
 * jadi harus diratakan jadi plain text dulu sebelum di-clamp.
 *
 * Regex dipakai (bukan DOMParser) supaya tetap aman saat SSR. Pola sama
 * dengan fix di src/app/admin/(dashboard)/landing-page/profil/program-inovasi/page.tsx
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
  const router = useRouter();
  const listFilosofi = useProxy(stateKonservasiAdatBali.stateFilosofiTriHita);

  useShallowEffect(() => {
    listFilosofi.findById.load('edit');
  }, []);

  if (!listFilosofi.findById.data) {
    return (
      <Stack py={20}>
        <Skeleton radius="md" height={600} />
      </Stack>
    );
  }

  return (
    <Box p="md">
      <Paper withBorder p={{ base: 'md', md: 'lg' }} radius="md">
        <Group justify="space-between" align="center" mb={{ base: 'md', md: 'lg' }}>
          <Title order={3} fw={600}>
            Preview Filosofi Tri Hita Karana
          </Title>
          <Button
            size="sm"
            variant="light"
            color="green"
            radius="md"
            leftSection={<IconEdit size={16} />}
            onClick={() =>
              router.push(
                '/admin/lingkungan/konservasi-adat-bali/filosofi-tri-hita-karana/edit'
              )
            }
          >
            Edit
          </Button>
        </Group>

        <Stack gap="md">
          <Paper p={{ base: 'md', md: 'xl' }} bg="#ECEEF8" radius="md">
            <Box mb="md" px={{ base: 0, md: 20 }}>
              <Text
                fz={{ base: 'xl', md: '2xl' }}
                fw={600}
                c="black"
                dangerouslySetInnerHTML={{ __html: listFilosofi.findById.data.judul }}
                style={{ wordBreak: "break-word", whiteSpace: "normal" }}
              />
            </Box>
            <Box px={{ base: 0, md: 20 }}>
              <Text
                fz={{ base: 'md', md: 'lg' }}
                ta="justify"
                c="dimmed"
                lineClamp={10}
                style={{ wordBreak: "break-word", whiteSpace: "normal" }}>{toPlainText(listFilosofi.findById.data.deskripsi) || '-'}</Text>
            </Box>
          </Paper>
        </Stack>
      </Paper>
    </Box>
  );
}

export default Page;
