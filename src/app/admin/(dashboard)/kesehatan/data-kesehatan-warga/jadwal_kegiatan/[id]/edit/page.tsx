/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import jadwalKegiatanState from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/jadwalKegiatan';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

interface JadwalKegiatanFormBase {
  content: string;
  informasiJadwalKegiatan: {
    name: string;
    tanggal: string;
    waktu: string;
    lokasi: string;
  };
  deskripsiJadwalKegiatan: { deskripsi: string };
  layananJadwalKegiatan: { content: string };
  syaratKetentuanJadwalKegiatan: { content: string };
  dokumenJadwalKegiatan: { content: string };
}

const emptyForm = (): JadwalKegiatanFormBase => ({
  content: '',
  informasiJadwalKegiatan: { name: '', tanggal: '', waktu: '', lokasi: '' },
  deskripsiJadwalKegiatan: { deskripsi: '' },
  layananJadwalKegiatan: { content: '' },
  syaratKetentuanJadwalKegiatan: { content: '' },
  dokumenJadwalKegiatan: { content: '' },
});

function EditJadwalKegiatan() {
  const stateJadwalKegiatan = useProxy(jadwalKegiatanState);
  const router = useRouter();
  const params = useParams();

  const [formData, setFormData] = useState<JadwalKegiatanFormBase>(emptyForm());

  // Helper untuk update nested state
  const updateNested = <
    K extends keyof JadwalKegiatanFormBase,
    N extends keyof JadwalKegiatanFormBase[K]
  >(
    key: K,
    subKey: N,
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [key]: {
        ...(prev[key] as Record<string, unknown>),
        [subKey]: value
      }
    }));
  };

  const updateSimple = (key: keyof JadwalKegiatanFormBase, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    const loadJadwalKegiatan = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        await stateJadwalKegiatan.edit.load(id);
        const { form } = stateJadwalKegiatan.edit;
        if (form) {
          setFormData({
            content: form.content || '',
            informasiJadwalKegiatan: {
              name: form.informasiJadwalKegiatan?.name || '',
              tanggal: form.informasiJadwalKegiatan?.tanggal || '',
              waktu: form.informasiJadwalKegiatan?.waktu || '',
              lokasi: form.informasiJadwalKegiatan?.lokasi || '',
            },
            deskripsiJadwalKegiatan: { deskripsi: form.deskripsiJadwalKegiatan?.deskripsi || '' },
            layananJadwalKegiatan: { content: form.layananJadwalKegiatan?.content || '' },
            syaratKetentuanJadwalKegiatan: { content: form.syaratKetentuanJadwalKegiatan?.content || '' },
            dokumenJadwalKegiatan: { content: form.dokumenJadwalKegiatan?.content || '' },
          });
        }
      } catch (error) {
        console.error("Error loading jadwal kegiatan:", error);
        toast.error("Gagal memuat data jadwal kegiatan");
      }
    };
    loadJadwalKegiatan();
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
      stateJadwalKegiatan.edit.form = { ...stateJadwalKegiatan.edit.form, ...formData };
      const success = await stateJadwalKegiatan.edit.submit();
      if (success) {
        toast.success("Jadwal kegiatan berhasil diperbarui!");
        router.push("/admin/kesehatan/data-kesehatan-warga/jadwal_kegiatan");
      }
    } catch (error) {
      console.error("Error updating jadwal kegiatan:", error);
      toast.error(error instanceof Error ? error.message : "Gagal memperbarui data jadwal kegiatan");
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
          Edit Jadwal Kegiatan
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
          {/* Nama Jadwal */}
          <TextInput
            label="Nama Jadwal Kegiatan"
            placeholder="Masukkan nama jadwal kegiatan"
            value={formData.content}
            onChange={(e) => updateSimple('content', e.target.value)}
          />

          {/* Deskripsi */}
          <Box>
            <Text fz="sm" fw="bold">Deskripsi Jadwal Kegiatan</Text>
            <EditEditor
              value={formData.deskripsiJadwalKegiatan.deskripsi}
              onChange={(val) => updateNested('deskripsiJadwalKegiatan', 'deskripsi', val)}
            />
          </Box>

          {/* Informasi Jadwal */}
          <Box>
            <Text fz="md" fw="bold">Informasi Jadwal Kegiatan</Text>
            {(['name', 'tanggal', 'waktu', 'lokasi'] as const).map((field) => (
              <TextInput
                key={field}
                label={field === 'name' ? 'Nama' : field.charAt(0).toUpperCase() + field.slice(1)}
                type={field === 'tanggal' ? 'date' : 'text'}
                value={formData.informasiJadwalKegiatan[field]}
                onChange={(e) => updateNested('informasiJadwalKegiatan', field, e.target.value)}
              />
            ))}
          </Box>

          {/* Layanan */}
          <Box>
            <Text fz="md" fw="bold">Layanan Jadwal Kegiatan</Text>
            <EditEditor
              value={formData.layananJadwalKegiatan.content}
              onChange={(val) => updateNested('layananJadwalKegiatan', 'content', val)}
            />
          </Box>

          {/* Syarat */}
          <Box>
            <Text fz="md" fw="bold">Syarat dan Ketentuan</Text>
            <EditEditor
              value={formData.syaratKetentuanJadwalKegiatan.content}
              onChange={(val) => updateNested('syaratKetentuanJadwalKegiatan', 'content', val)}
            />
          </Box>

          {/* Dokumen */}
          <Box>
            <Text fz="md" fw="bold">Dokumen Yang Perlu Dibawa</Text>
            <EditEditor
              value={formData.dokumenJadwalKegiatan.content}
              onChange={(val) => updateNested('dokumenJadwalKegiatan', 'content', val)}
            />
          </Box>

          {/* Submit */}
          <Group justify="right">
            <Button
              onClick={handleSubmit}
              radius="md"
              size="md"
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

export default EditJadwalKegiatan;
