'use client'
import colors from '@/con/colors';
import {
  Box,
  Button,
  Card,
  Center,
  Group,
  Image,
  Modal,
  Paper,
  Skeleton,
  Stack,
  Text,
  Title
} from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconTrash } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import stateDashboardMusik from '../../_state/desa/musik';

export default function DetailMusik() {
  const musikState = useProxy(stateDashboardMusik);
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, loading, load } = musikState.musik.findUnique;

  useShallowEffect(() => {
    if (id) {
      load(id);
    }
  }, [id]);

  if (loading || !data) {
    return (
      <Box px={{ base: 0, md: 'lg' }} py="xs">
        <Stack>
          <Skeleton height={50} radius="md" />
          <Skeleton height={400} radius="md" />
        </Stack>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box px={{ base: 0, md: 'lg' }} py="xl">
        <Center>
          <Text c="dimmed">Musik tidak ditemukan</Text>
        </Center>
      </Box>
    );
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await musikState.musik.delete.byId(id);
      setShowDeleteModal(false);
      router.push('/admin/musik');
    } catch (error) {
      console.error('Error deleting musik:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      {/* Header dengan tombol kembali */}
      <Group mb="md">
        <Button
          variant="subtle"
          onClick={() => router.push('/admin/musik')}
          p="xs"
          radius="md"
        >
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Detail Musik
        </Title>
      </Group>

      <Paper
        w={{ base: '100%', md: '50%' }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
        style={{ border: '1px solid #e0e0e0' }}
      >
        <Stack gap="md">
          {/* Cover Image */}
          {data.coverImage && (
            <Box
              style={{
                width: '100%',
                maxWidth: 400,
                margin: '0 auto',
              }}
            >
              <Image
                src={data.coverImage.link}
                alt={data.judul}
                radius="md"
                style={{
                  width: '100%',
                  aspectRatio: '1/1',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </Box>
          )}

          {/* Info Section */}
          <Stack gap="sm">
            <Box>
              <Text fz="sm" fw={600} c="dimmed">
                Judul
              </Text>
              <Text fz="md" fw={600}>
                {data.judul}
              </Text>
            </Box>

            <Box>
              <Text fz="sm" fw={600} c="dimmed">
                Artis
              </Text>
              <Text fz="md" fw={500}>
                {data.artis}
              </Text>
            </Box>

            {data.deskripsi && (
              <Box>
                <Text fz="sm" fw={600} c="dimmed">
                  Deskripsi
                </Text>
                <Text fz="sm" fw={500} dangerouslySetInnerHTML={{ __html: data.deskripsi }} />
              </Box>
            )}

            <Group gap="xl">
              <Box>
                <Text fz="sm" fw={600} c="dimmed">
                  Durasi
                </Text>
                <Text fz="md" fw={500}>
                  {data.durasi}
                </Text>
              </Box>

              {data.genre && (
                <Box>
                  <Text fz="sm" fw={600} c="dimmed">
                    Genre
                  </Text>
                  <Text fz="md" fw={500}>
                    {data.genre}
                  </Text>
                </Box>
              )}

              {data.tahunRilis && (
                <Box>
                  <Text fz="sm" fw={600} c="dimmed">
                    Tahun Rilis
                  </Text>
                  <Text fz="md" fw={500}>
                    {data.tahunRilis}
                  </Text>
                </Box>
              )}
            </Group>

            {/* Audio File */}
            {data.audioFile && (
              <Box>
                <Text fz="sm" fw={600} c="dimmed">
                  File Audio
                </Text>
                <Card mt="xs" p="sm" withBorder>
                  <Group gap="sm">
                    <Text fz="sm" truncate style={{ flex: 1 }}>
                      {data.audioFile.realName}
                    </Text>
                    <Button
                      component="a"
                      href={data.audioFile.link}
                      target="_blank"
                      variant="light"
                      size="sm"
                    >
                      Putar
                    </Button>
                  </Group>
                </Card>
              </Box>
            )}
          </Stack>

          {/* Action Buttons */}
          <Group justify="right" mt="md">
            <Button
              variant="outline"
              color="red"
              radius="md"
              size="md"
              leftSection={<IconTrash size={18} />}
              onClick={() => setShowDeleteModal(true)}
            >
              Hapus
            </Button>
            <Button
              variant="filled"
              color="blue"
              radius="md"
              size="md"
              leftSection={<IconEdit size={18} />}
              onClick={() => router.push(`/admin/musik/${id}/edit`)}
            >
              Edit
            </Button>
          </Group>
        </Stack>
      </Paper>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Konfirmasi Hapus"
        centered
      >
        <Stack gap="md">
          <Text>
            Apakah Anda yakin ingin menghapus musik &quot;{data.judul}&quot;?
          </Text>
          <Text c="red" fz="sm">
            Tindakan ini tidak dapat dibatalkan.
          </Text>
          <Group justify="right" mt="md">
            <Button
              variant="outline"
              color="gray"
              onClick={() => setShowDeleteModal(false)}
            >
              Batal
            </Button>
            <Button
              color="red"
              onClick={handleDelete}
              loading={isDeleting}
            >
              Hapus
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}
