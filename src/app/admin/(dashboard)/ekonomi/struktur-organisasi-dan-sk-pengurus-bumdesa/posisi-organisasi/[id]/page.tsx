/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import strukturorganisasiState from '@/app/admin/(dashboard)/_state/ekonomi/struktur-organisasi/struktur-organisasi';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function EditPosisiOrganisasi() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const stateOrganisasi = useProxy(strukturorganisasiState.posisiOrganisasi);

  const [formData, setFormData] = useState({
    nama: "",
    deskripsi: "",
    hierarki: 0,
  });

  useEffect(() => {
    const loadPosisiOrganisasi = async () => {
      if (!id) return;

      try {
        const data = await stateOrganisasi.edit.load(id);

        if (data) {
          // pastikan id-nya masuk ke state edit
          stateOrganisasi.edit.id = id;
          setFormData({
            nama: data.nama || '',
            deskripsi: data.deskripsi || '',
            hierarki: data.hierarki || 0,
          });
        }
      } catch (error) {
        console.error("Error loading posisi organisasi:", error);
        toast.error("Gagal memuat data posisi organisasi");
      }
    };

    loadPosisiOrganisasi();
  }, [id]);

  const handleSubmit = async () => {
    try {
      if (!formData.nama.trim()) {
        toast.error('Nama posisi organisasi tidak boleh kosong');
        return;
      }

      stateOrganisasi.edit.form = {
        nama: formData.nama.trim(),
        deskripsi: formData.deskripsi.trim(),
        hierarki: formData.hierarki,
      };

      // Safety check tambahan: pastikan ID tidak kosong
      if (!stateOrganisasi.edit.id) {
        stateOrganisasi.edit.id = id; // fallback
      }

      const success = await stateOrganisasi.edit.update();

      if (success) {
        router.push("/admin/ekonomi/struktur-organisasi-dan-sk-pengurus-bumdesa/posisi-organisasi");
      }
    } catch (error) {
      console.error("Error updating posisi organisasi:", error);
      // toast akan ditampilkan dari fungsi update
    }
  };

  return (
    <Box>
      <Box mb={10}>
        <Button onClick={() => router.back()} variant='subtle' color={'blue'}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>

      <Paper w={{ base: '100%', md: '50%' }} bg={colors['white-1']} p={'md'}>
        <Stack gap={"xs"}>
          <Title order={4}>Edit Posisi Organisasi</Title>
          <TextInput
            value={formData.nama}
            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
            label={<Text fw={"bold"} fz={"sm"}>Nama Posisi Organisasi</Text>}
            placeholder='Masukkan nama posisi organisasi'
          />
          <EditEditor
            value={formData.deskripsi}
            onChange={(htmlContent) => {
              setFormData({ ...formData, deskripsi: htmlContent });
            }}
          />
          <TextInput
            value={formData.hierarki}
            onChange={(e) => setFormData({ ...formData, hierarki: parseInt(e.target.value) })}
            label={<Text fw={"bold"} fz={"sm"}>Hierarki</Text>}
            placeholder='Masukkan hierarki'
          />
          <Group>
            <Button bg={colors['blue-button']} onClick={handleSubmit}>Submit</Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditPosisiOrganisasi;
