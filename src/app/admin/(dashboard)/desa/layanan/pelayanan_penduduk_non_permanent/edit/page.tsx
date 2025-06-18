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

function EditPelayananPendudukNonPermanent() {
  const router = useRouter();
  const params = useParams()
  const statePendudukNonPermanent = useProxy(stateLayananDesa.pelayananPendudukNonPermanen)
  const [formData, setFormData] = useState({
    name: statePendudukNonPermanent.findById.data?.name || '',
    deskripsi: statePendudukNonPermanent.findById.data?.deskripsi || '',
  })

  useEffect(() => {
    const loadPelayananPerizinan = async () => {
      const id = params?.id as string;
      if (!id) return;
      try {
        const data = await statePendudukNonPermanent.update.load(id);
        if (data) {
          setFormData({
            name: data.name || '',
            deskripsi: data.deskripsi || '',
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
    if (statePendudukNonPermanent.findById.data) {
      statePendudukNonPermanent.findById.data.name = formData.name;
      statePendudukNonPermanent.findById.data.deskripsi = formData.deskripsi;
      statePendudukNonPermanent.update.update(statePendudukNonPermanent.findById.data)
    }
    router.push('/admin/desa/layanan/pelayanan_penduduk_non_permanent')
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
              <Title order={3}>Edit Pelayanan Penduduk Non Permanent</Title>
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
                  loading={statePendudukNonPermanent.update.loading}
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

export default EditPelayananPendudukNonPermanent;
