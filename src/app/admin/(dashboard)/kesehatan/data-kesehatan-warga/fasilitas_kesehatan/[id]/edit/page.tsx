/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import fasilitasKesehatanState from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/fasilitasKesehatan';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Title
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

interface FasilitasKesehatanFormBase {
  name: string;
  informasiUmum: {
    fasilitas: string;
    alamat: string;
    jamOperasional: string;
  };
  layananUnggulan: { content: string };
  dokterdanTenagaMedis: {
    name: string;
    specialist: string;
    jadwal: string;
  };
  fasilitasPendukung: { content: string };
  prosedurPendaftaran: { content: string };
  tarifDanLayanan: {
    layanan: string;
    tarif: string;
  };
}

function EditFasilitasKesehatan() {
  const state = useProxy(fasilitasKesehatanState.fasilitasKesehatan);
  const router = useRouter();
  const params = useParams();

  const [formData, setFormData] = useState<FasilitasKesehatanFormBase>({
    name: '',
    informasiUmum: { fasilitas: '', alamat: '', jamOperasional: '' },
    layananUnggulan: { content: '' },
    dokterdanTenagaMedis: { name: '', specialist: '', jadwal: '' },
    fasilitasPendukung: { content: '' },
    prosedurPendaftaran: { content: '' },
    tarifDanLayanan: { layanan: '', tarif: '' },
  });

  // Helper untuk update nested state
  const updateForm = <K extends keyof FasilitasKesehatanFormBase>(
    key: K,
    value: FasilitasKesehatanFormBase[K]
  ) => setFormData(prev => ({ ...prev, [key]: value }));

  const updateNested = <
    K extends keyof FasilitasKesehatanFormBase,
    N extends keyof FasilitasKesehatanFormBase[K]
  >(key: K, nestedKey: N, value: FasilitasKesehatanFormBase[K][N]) =>
    setFormData(prev => ({
      ...prev,
      [key]: { ...prev[key] as object, [nestedKey]: value },
    }));

  // Load data
  useEffect(() => {
    const load = async () => {
      const id = params?.id as string;
      if (!id) return;
      try {
        await state.edit.load(id);
        const form = state.edit.form;
        if (form) setFormData(form as FasilitasKesehatanFormBase);
      } catch (err) {
        console.error(err);
        toast.error('Gagal memuat data fasilitas kesehatan');
      }
    };
    load();
  }, [params?.id]);

  // Submit
  const handleSubmit = async () => {
    try {
      state.edit.form = { ...state.edit.form, ...formData };
      const success = await state.edit.submit();
      if (success) {
        toast.success('Fasilitas kesehatan berhasil diperbarui!');
        router.push('/admin/kesehatan/data-kesehatan-warga/fasilitas_kesehatan');
      }
    } catch (err) {
      console.error(err);
      toast.error('Terjadi kesalahan saat memperbarui data fasilitas kesehatan');
    }
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      {/* Header */}
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Edit Fasilitas Kesehatan
        </Title>
      </Group>

      {/* Form */}
      <Paper
        w={{ base: '100%', md: '50%' }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
        style={{ border: '1px solid #e0e0e0' }}
      >
        <Stack gap="md">
          <TextInput
            label="Nama Fasilitas Kesehatan"
            placeholder="Masukkan nama fasilitas kesehatan"
            value={formData.name}
            onChange={(e) => updateForm('name', e.target.value)}
            required
          />

          {/* Informasi Umum */}
          <Box>
            <Text fw="bold" mb={5}>
              Informasi Umum
            </Text>
            <TextInput
              label="Fasilitas"
              value={formData.informasiUmum.fasilitas}
              onChange={(e) => updateNested('informasiUmum', 'fasilitas', e.target.value)}
            />
            <TextInput
              label="Alamat"
              value={formData.informasiUmum.alamat}
              onChange={(e) => updateNested('informasiUmum', 'alamat', e.target.value)}
            />
            <TextInput
              label="Jam Operasional"
              value={formData.informasiUmum.jamOperasional}
              onChange={(e) => updateNested('informasiUmum', 'jamOperasional', e.target.value)}
            />
          </Box>

          {/* Layanan Unggulan */}
          <Box>
            <Text fw="bold" mb={5}>
              Layanan Unggulan
            </Text>
            <EditEditor
              value={formData.layananUnggulan.content}
              onChange={(v) => updateNested('layananUnggulan', 'content', v)}
            />
          </Box>

          {/* Dokter dan Tenaga Medis */}
          <Box>
            <Text fw="bold" mb={5}>
              Dokter dan Tenaga Medis
            </Text>
            <TextInput
              label="Nama Dokter"
              value={formData.dokterdanTenagaMedis.name}
              onChange={(e) => updateNested('dokterdanTenagaMedis', 'name', e.target.value)}
            />
            <TextInput
              label="Specialist"
              value={formData.dokterdanTenagaMedis.specialist}
              onChange={(e) =>
                updateNested('dokterdanTenagaMedis', 'specialist', e.target.value)
              }
            />
            <TextInput
              label="Jadwal"
              value={formData.dokterdanTenagaMedis.jadwal}
              onChange={(e) => updateNested('dokterdanTenagaMedis', 'jadwal', e.target.value)}
            />
          </Box>

          {/* Fasilitas Pendukung */}
          <Box>
            <Text fw="bold" mb={5}>
              Fasilitas Pendukung
            </Text>
            <EditEditor
              value={formData.fasilitasPendukung.content}
              onChange={(v) => updateNested('fasilitasPendukung', 'content', v)}
            />
          </Box>

          {/* Prosedur Pendaftaran */}
          <Box>
            <Text fw="bold" mb={5}>
              Prosedur Pendaftaran
            </Text>
            <EditEditor
              value={formData.prosedurPendaftaran.content}
              onChange={(v) => updateNested('prosedurPendaftaran', 'content', v)}
            />
          </Box>

          {/* Tarif dan Layanan */}
          <Box>
            <Text fw="bold" mb={5}>
              Tarif dan Layanan
            </Text>
            <TextInput
              label="Tarif"
              value={formData.tarifDanLayanan.tarif}
              onChange={(e) => updateNested('tarifDanLayanan', 'tarif', e.target.value)}
            />
            <TextInput
              label="Layanan"
              value={formData.tarifDanLayanan.layanan}
              onChange={(e) => updateNested('tarifDanLayanan', 'layanan', e.target.value)}
            />
          </Box>

          {/* Tombol Simpan */}
          <Group justify="flex-end">
            <Button
              onClick={handleSubmit}
              radius="md"
              size="md"
              loading={state.edit.loading}
              style={{
                background: `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
                color: '#fff',
                boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)',
              }}
            >
              Simpan
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditFasilitasKesehatan;
