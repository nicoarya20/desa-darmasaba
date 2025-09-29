'use client'
/* eslint-disable react-hooks/exhaustive-deps */
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import stateLayananDesa from '@/app/admin/(dashboard)/_state/desa/layananDesa';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, TextInput, Title, Tooltip } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function EditPelayananPerizinanBerusaha() {
  const router = useRouter();
  const params = useParams()
  const statePerizinanBerusaha = useProxy(stateLayananDesa.pelayananPerizinanBerusaha)

  const [formData, setFormData] = useState({
    name: statePerizinanBerusaha.findById.data?.name || '',
    deskripsi: statePerizinanBerusaha.findById.data?.deskripsi || '',
    link: statePerizinanBerusaha.findById.data?.link || '',
  })

  useEffect(() => {
    const loadPelayananPerizinan = async () => {
      const id = params?.id as string;
      if (!id) return;
      try {
        const data = await statePerizinanBerusaha.update.load(id);
        if (data) {
          setFormData({
            name: data.name || '',
            deskripsi: data.deskripsi || '',
            link: data.link || '',
          });
        }
      } catch (error) {
        console.error("Error loading pelayanan perizinan berusaha:", error);
        toast.error("Gagal memuat data pelayanan perizinan berusaha");
      }
    };
    loadPelayananPerizinan();
  }, [params?.id]);

  const handleSubmit = async () => {
    if (statePerizinanBerusaha.findById.data) {
      statePerizinanBerusaha.findById.data.name = formData.name;
      statePerizinanBerusaha.findById.data.deskripsi = formData.deskripsi;
      statePerizinanBerusaha.findById.data.link = formData.link;
      statePerizinanBerusaha.update.update(statePerizinanBerusaha.findById.data)
    }
    router.push('/admin/desa/layanan/pelayanan_perizinan_berusaha')
  }

  return (
    <Box>
      <Stack gap="xs">
        {/* Header Section */}
        <Group mb="md">
          <Tooltip label="Kembali ke halaman sebelumnya" withArrow>
            <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
              <IconArrowBack color={colors['blue-button']} size={24} />
            </Button>
          </Tooltip>
          <Title order={4} ml="sm" c="dark">
            Edit Pelayanan Perizinan Berusaha
          </Title>
        </Group>

        {/* Form Section */}
        <Paper
          w={{ base: "100%", md: "50%" }}
          bg={colors['white-1']}
          p="md"
          radius="md"
          shadow="sm"
          style={{ border: '1px solid #e0e0e0' }}
        >
          <Stack gap="xs">
            <Title order={3}>Edit Pelayanan Perizinan Berusaha</Title>

            {/* Nama Field */}
            <TextInput
              label="Judul"
              placeholder="Masukkan judul"
              defaultValue={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            {/* Link Field */}
            <TextInput
              label="Link"
              placeholder="Masukkan link terkait"
              defaultValue={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            />

            {/* Deskripsi Field */}
            <Box>
              <Title order={6}>Deskripsi</Title>
              <EditEditor
                value={formData.deskripsi}
                onChange={(val) => setFormData({ ...formData, deskripsi: val })}
              />
            </Box>

            {/* Action Buttons */}
            <Group>
              <Button
                bg={colors['blue-button']}
                onClick={handleSubmit}
                loading={statePerizinanBerusaha.update.loading}
                disabled={!formData.name}
              >
                {statePerizinanBerusaha.update.loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>

              <Button
                variant="outline"
                onClick={() => router.back()}
                disabled={statePerizinanBerusaha.update.loading}
              >
                Batal
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}

export default EditPelayananPerizinanBerusaha;
