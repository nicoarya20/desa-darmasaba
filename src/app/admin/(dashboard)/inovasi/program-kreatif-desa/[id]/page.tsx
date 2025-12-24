'use client'
import colors from '@/con/colors';
import { Box, Button, Flex, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconTrash } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import { IconKey, IconMapper } from '../../../_com/iconMap';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import programKreatifState from '../../../_state/inovasi/program-kreatif';

function DetailProgramKreatifDesa() {
  const [modalHapus, setModalHapus] = useState(false)
  const stateProgramKreatif = useProxy(programKreatifState)
  const router = useRouter()
  const params = useParams()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useShallowEffect(() => {
    stateProgramKreatif.findUnique.load(params?.id as string)
  }, [params?.id])

  const handleHapus = () => {
    if (selectedId) {
      stateProgramKreatif.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      router.push("/admin/inovasi/program-kreatif-desa")
    }
  }

  if (!stateProgramKreatif.findUnique.data) {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    )
  }

  const data = stateProgramKreatif.findUnique.data

  return (
   <Box px={{ base: 0, md: 'lg' }} py="xs">
      <Button
        variant="subtle"
        onClick={() => router.back()}
        leftSection={<IconArrowBack size={24} color={colors['blue-button']} />}
        mb={15}
      >
        Kembali
      </Button>

      <Paper
        withBorder
        w={{ base: "100%", md: "70%" }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
      >
        <Stack gap="md">
          <Text fz="2xl" fw="bold" c={colors['blue-button']}>
            Detail Program Kreatif Desa
          </Text>

          <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
            <Stack gap="sm">
              <Box>
                <Text fz="lg" fw="bold">Nama Program Kreatif Desa</Text>
                <Text fz="md" c="dimmed">{data?.name || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Ikon Program Kreatif Desa</Text>
                {data?.icon ? (
                  <IconMapper
                    name={data.icon as IconKey}
                    size={32}
                    color={colors['blue-button']}
                  />
                ) : (
                  <Text fz="sm" c="dimmed">Tidak ada ikon</Text>
                )}
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Deskripsi Singkat</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }}>{data?.slug || '-'}</Text>
              </Box>

              <Box>
                <Text fz="lg" fw="bold">Deskripsi</Text>
                <Text fz="md" c="dimmed" style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: data?.deskripsi || '-' }} />
              </Box>

              <Flex gap="sm" mt={10}>
                <Button
                  color="red"
                  onClick={() => {
                    if (data) {
                      setSelectedId(data.id);
                      setModalHapus(true);
                    }
                  }}
                  disabled={stateProgramKreatif.delete.loading || !data}
                  variant="light"
                  radius="md"
                  size="md"
                >
                  <IconTrash size={20} />
                </Button>

                <Button
                  color="green"
                  onClick={() => {
                    if (data) {
                      router.push(`/admin/inovasi/program-kreatif-desa/${data.id}/edit`);
                    }
                  }}
                  disabled={!data}
                  variant="light"
                  radius="md"
                  size="md"
                >
                  <IconEdit size={20} />
                </Button>
              </Flex>
            </Stack>
          </Paper>
        </Stack>
      </Paper>

      {/* Modal Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text="Apakah Anda yakin ingin menghapus program kreatif desa ini?"
      />
    </Box>
  );
}

export default DetailProgramKreatifDesa;
