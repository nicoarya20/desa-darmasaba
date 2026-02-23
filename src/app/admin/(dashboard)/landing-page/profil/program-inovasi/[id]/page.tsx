'use client'
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import profileLandingPageState from '@/app/admin/(dashboard)/_state/landing-page/profile';
import colors from '@/con/colors';
import { Box, Button, Group, Image, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconTrash } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import DOMPurify from 'dompurify';

function DetailProgramInovasi() {
  const stateProgramInovasi = useProxy(profileLandingPageState.programInovasi)
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const params = useParams()
  const router = useRouter();

  useShallowEffect(() => {
    stateProgramInovasi.findUnique.load(params?.id as string)
  }, [])

  const handleHapus = () => {
    if (selectedId) {
      stateProgramInovasi.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      router.push("/admin/landing-page/profil/program-inovasi")
    }
  }

  if (!stateProgramInovasi.findUnique.data) {
    return (
      <Stack py={12}>
        <Skeleton height={520} radius="md" />
      </Stack>
    )
  }

  const data = stateProgramInovasi.findUnique.data

  return (
    <Box px={{ base: 0, md: 'xs' }} py="xs">
      <Box pb="20">
        <Button variant="subtle" onClick={() => router.back()} leftSection={<IconArrowBack size={22} color={colors['blue-button']} />}>
          Kembali
        </Button>
      </Box>

      <Paper
        w={{ base: "100%", md: "70%" }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
        withBorder
      >
        <Stack gap="md">
          <Text fz="2xl" fw="bold" c={colors['blue-button']}>
            Detail Program Inovasi
          </Text>

          <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
            <Stack gap="sm">
              <Box>
                <Text fz="lg" fw="bold">Nama Program Inovasi</Text>
                <Text fz="md" c="dimmed">{data.name || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Gambar</Text>
                {data.image?.link ? (
                  <Image
                    src={data.image.link}
                    alt="Gambar Program"
                    radius="md"
                    style={{ maxWidth: '100%', maxHeight: 300, objectFit: 'contain' }}
                    loading="lazy"
                  />
                ) : (
                  <Text fz="md" c="dimmed">-</Text>
                )}
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Deskripsi</Text>
               <Box pl={5}>
                 <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(data.description || '-') }}></Text>
               </Box>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Link</Text>
                {data.link ? (
                  <a
                    href={data.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: colors['blue-button'],
                      textDecoration: 'underline',
                      wordBreak: 'break-word',
                    }}
                  >
                    {data.link}
                  </a>
                ) : (
                  <Text fz="md" c="dimmed">-</Text>
                )}
              </Box>

              <Group gap="sm">
                <Button
                  color="red"
                  onClick={() => {
                    setSelectedId(data.id);
                    setModalHapus(true);
                  }}
                  variant="light"
                  radius="md"
                  size="md"
                >
                  <IconTrash size={20} />
                </Button>

                <Button
                  color="green"
                  onClick={() => router.push(`/admin/landing-page/profil/program-inovasi/${data.id}/edit`)}
                  variant="light"
                  radius="md"
                  size="md"
                >
                  <IconEdit size={20} />
                </Button>
              </Group>
            </Stack>
          </Paper>
        </Stack>
      </Paper>

      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text="Apakah Anda yakin ingin menghapus program inovasi ini?"
      />
    </Box>
  );
}

export default DetailProgramInovasi;
