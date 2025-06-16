'use client'
/* eslint-disable react-hooks/exhaustive-deps */
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import stateLayananDesa from '@/app/admin/(dashboard)/_state/desa/layananDesa';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
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
      <Stack gap={'xs'}>
        <Box>
          <Button
            variant={'subtle'}
            onClick={() => router.back()}
          >
            <IconArrowBack color={colors['blue-button']} size={20} />
          </Button>
        </Box>
        <Box>
          <Paper bg={colors['white-1']} p={'md'} radius={10} w={{ base: '100%', md: '50%' }}>
            <Stack gap={'xs'}>
              <Title order={3}>Edit Pelayanan Perizinan Berusaha</Title>
              <Text fw={"bold"}>Judul</Text>
              <TextInput
                value={formData.name}
                onChange={(val) => {
                  setFormData({
                    ...formData,
                    name: val.target.value,
                  })
                }}
              />
              <Text fw={"bold"}>Link</Text>
              <TextInput
                value={formData.link}
                onChange={(val) => {
                  setFormData({
                    ...formData,
                    link: val.target.value,
                  })
                }}
              />
              <Text fw={"bold"}>Deskripsi</Text>
              <EditEditor
                value={formData.deskripsi}
                onChange={(val) => {
                  setFormData({
                    ...formData,
                    deskripsi: val,
                  })
                }}
              />
              
              <Group>
                <Button
                  bg={colors['blue-button']}
                  onClick={handleSubmit}
                  loading={statePerizinanBerusaha.update.loading}
                >
                  Submit
                </Button>
              </Group>
            </Stack>
          </Paper>
        </Box>
      </Stack>
    </Box>
  );
}

export default EditPelayananPerizinanBerusaha;
