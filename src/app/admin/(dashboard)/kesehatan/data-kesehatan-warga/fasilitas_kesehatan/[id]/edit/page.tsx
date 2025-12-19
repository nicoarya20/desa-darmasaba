'use client';

import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import fasilitasKesehatanState from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/fasilitasKesehatan';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Loader,
  MultiSelect,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

// Tipe form yang SESUAI dengan logika relasi (array ID)
interface EditFasilitasKesehatanForm {
  name: string;
  informasiUmum: {
    fasilitas: string;
    alamat: string;
    jamOperasional: string;
  };
  layananUnggulan: { content: string };
  dokterdanTenagaMedis: string[]; // ← ARRAY ID
  fasilitasPendukung: { content: string };
  prosedurPendaftaran: { content: string };
  tarifDanLayanan: string[]; // ← ARRAY ID
}

function EditFasilitasKesehatan() {
  const state = useProxy(fasilitasKesehatanState.fasilitasKesehatan);
  const dokterState = useProxy(fasilitasKesehatanState.dokter);
  const tarifState = useProxy(fasilitasKesehatanState.tarif);
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<EditFasilitasKesehatanForm>({
    name: '',
    informasiUmum: { fasilitas: '', alamat: '', jamOperasional: '' },
    layananUnggulan: { content: '' },
    dokterdanTenagaMedis: [],
    fasilitasPendukung: { content: '' },
    prosedurPendaftaran: { content: '' },
    tarifDanLayanan: [],
  });

  // Load data fasilitas & daftar dokter/tarif
  useShallowEffect(() => {
    const loadAll = async () => {
      const id = params?.id;
      if (!id) return;

      // Load dokter & tarif (untuk opsi MultiSelect)
      await Promise.all([
        dokterState.findMany.load(),
        tarifState.findMany.load(),
      ]);

      // Load data fasilitas
      await state.edit.load(id);
      const loaded = state.edit.form;
      if (loaded) {
        setFormData({
          name: loaded.name,
          informasiUmum: loaded.informasiUmum,
          layananUnggulan: loaded.layananUnggulan,
          dokterdanTenagaMedis: loaded.dokterdanTenagaMedis || [],
          fasilitasPendukung: loaded.fasilitasPendukung,
          prosedurPendaftaran: loaded.prosedurPendaftaran,
          tarifDanLayanan: loaded.tarifDanLayanan || [],
        });
      }
    };

    loadAll();
  }, [params?.id]);

  const updateForm = <K extends keyof EditFasilitasKesehatanForm>(
    field: K,
    value: EditFasilitasKesehatanForm[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    const loaded = state.edit.form;
    if (loaded) {
      setFormData({
        name: loaded.name,
        informasiUmum: loaded.informasiUmum,
        layananUnggulan: loaded.layananUnggulan,
        dokterdanTenagaMedis: loaded.dokterdanTenagaMedis || [],
        fasilitasPendukung: loaded.fasilitasPendukung,
        prosedurPendaftaran: loaded.prosedurPendaftaran,
        tarifDanLayanan: loaded.tarifDanLayanan || [],
      });
      toast.info('Form dikembalikan ke data awal');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      // Update state Valtio
      state.edit.form = { ...formData };

      const success = await state.edit.submit();
      if (success) {
        toast.success('Fasilitas kesehatan berhasil diperbarui!');
        router.push('/admin/kesehatan/data-kesehatan-warga/fasilitas_kesehatan');
      }
    } catch (err) {
      console.error(err);
      toast.error('Gagal memperbarui data');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 0, md: 'xs' }} py="xs" component="form" onSubmit={handleSubmit}>
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
            placeholder="Masukkan nama"
            value={formData.name}
            onChange={(e) => updateForm('name', e.target.value)}
            required
          />

          {/* Informasi Umum */}
          <Box>
            <Text fw="bold" mb={5}>Informasi Umum</Text>
            <TextInput
              label="Fasilitas"
              value={formData.informasiUmum.fasilitas}
              onChange={(e) =>
                updateForm('informasiUmum', {
                  ...formData.informasiUmum,
                  fasilitas: e.target.value,
                })
              }
            />
            <TextInput
              label="Alamat"
              value={formData.informasiUmum.alamat}
              onChange={(e) =>
                updateForm('informasiUmum', {
                  ...formData.informasiUmum,
                  alamat: e.target.value,
                })
              }
            />
            <TextInput
              label="Jam Operasional"
              value={formData.informasiUmum.jamOperasional}
              onChange={(e) =>
                updateForm('informasiUmum', {
                  ...formData.informasiUmum,
                  jamOperasional: e.target.value,
                })
              }
            />
          </Box>

          {/* Layanan Unggulan */}
          <Box>
            <Text fw="bold" mb={5}>Layanan Unggulan</Text>
            <EditEditor
              value={formData.layananUnggulan.content}
              onChange={(v) => updateForm('layananUnggulan', { content: v })}
            />
          </Box>

          {/* Dokter & Tenaga Medis — MultiSelect */}
          <MultiSelect
            label="Dokter & Tenaga Medis"
            placeholder="Pilih dokter/tenaga medis"
            data={
              dokterState.findMany.data?.map((d) => ({
                value: d.id,
                label: `${d.name} (${d.specialist})`,
              })) || []
            }
            value={formData.dokterdanTenagaMedis}
            onChange={(val) => updateForm('dokterdanTenagaMedis', val)}
            searchable
            clearable
            required
          />

          {/* Fasilitas Pendukung */}
          <Box>
            <Text fw="bold" mb={5}>Fasilitas Pendukung</Text>
            <EditEditor
              value={formData.fasilitasPendukung.content}
              onChange={(v) => updateForm('fasilitasPendukung', { content: v })}
            />
          </Box>

          {/* Prosedur Pendaftaran */}
          <Box>
            <Text fw="bold" mb={5}>Prosedur Pendaftaran</Text>
            <EditEditor
              value={formData.prosedurPendaftaran.content}
              onChange={(v) => updateForm('prosedurPendaftaran', { content: v })}
            />
          </Box>

          {/* Tarif & Layanan — MultiSelect */}
          <MultiSelect
            label="Tarif & Layanan"
            placeholder="Pilih layanan"
            data={
              tarifState.findMany.data?.map((t) => ({
                value: t.id,
                label: `${t.layanan} - ${t.tarif}`,
              })) || []
            }
            value={formData.tarifDanLayanan}
            onChange={(val) => updateForm('tarifDanLayanan', val)}
            searchable
            clearable
            required
          />

          {/* Aksi */}
          <Group justify="right">
            <Button variant="outline" color="gray" radius="md" onClick={handleReset}>
              Batal
            </Button>
            <Button
              type="submit"
              radius="md"
              style={{
                background: `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
                color: '#fff',
                boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)',
              }}
            >
              {isSubmitting ? <Loader size="sm" color="white" /> : 'Simpan'}
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditFasilitasKesehatan;