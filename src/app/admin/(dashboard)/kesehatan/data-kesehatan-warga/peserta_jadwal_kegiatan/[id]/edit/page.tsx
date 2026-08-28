/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Loader,
  Paper,
  Stack,
  Textarea,
  TextInput,
  Title
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import pendaftaranJadwalKegiatanState from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/pendafataranJadwalKegiatan';

const defaultForm = {
  name: '',
  tanggal: '',
  namaOrangtua: '',
  nomor: '',
  alamat: '',
  catatan: '',
};

function EditPesertaJadwalKegiatan() {
  const router = useRouter();
  const params = useParams();
  const state = useProxy(pendaftaranJadwalKegiatanState);
  const id = params?.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({ ...defaultForm });
  const [originalData, setOriginalData] = useState({ ...defaultForm });

  useEffect(() => {
    const loadPeserta = async () => {
      if (!id) return;
      const data = await state.edit.load(id);
      if (data) {
        const loaded = {
          name: data.name ?? '',
          tanggal: data.tanggal ?? '',
          namaOrangtua: data.namaOrangtua ?? '',
          nomor: data.nomor ?? '',
          alamat: data.alamat ?? '',
          catatan: data.catatan ?? '',
        };
        setFormData(loaded);
        setOriginalData(loaded);
      }
    };

    loadPeserta();
  }, [id]);

  const isFormValid = () => {
    return (
      formData.name.trim() !== '' &&
      formData.tanggal.trim() !== '' &&
      formData.namaOrangtua.trim() !== '' &&
      formData.nomor.trim() !== '' &&
      formData.alamat.trim() !== ''
    );
  };

  const handleChange =
    (field: keyof typeof formData) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      };

  const handleResetForm = () => {
    setFormData({ ...originalData });
    toast.info('Form dikembalikan ke data awal');
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      state.edit.form = { ...formData };
      state.edit.id = id;

      const success = await state.edit.update();
      if (success) {
        router.push(`/admin/kesehatan/data-kesehatan-warga/peserta_jadwal_kegiatan/${id}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 0, md: 'xs' }} py="xs">
      <Group mb="md">
        <Button
          variant="subtle"
          onClick={() => router.back()}
          p="xs"
          radius="md"
        >
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Edit Peserta Kegiatan
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
          <TextInput
            label="Nama Peserta"
            placeholder="Masukkan nama peserta"
            value={formData.name}
            onChange={handleChange('name')}
            required
          />
          <TextInput
            type="date"
            label="Tanggal Lahir"
            value={formData.tanggal}
            onChange={handleChange('tanggal')}
            required
          />
          <TextInput
            label="Nama Orang Tua/Wali"
            placeholder="Masukkan nama orang tua/wali"
            value={formData.namaOrangtua}
            onChange={handleChange('namaOrangtua')}
            required
          />
          <TextInput
            label="Nomor Telepon"
            placeholder="Masukkan nomor telepon"
            inputMode="numeric"
            maxLength={13}
            value={formData.nomor}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                nomor: e.target.value.replace(/\D/g, '').slice(0, 13),
              }))
            }
            required
          />
          <TextInput
            label="Alamat"
            placeholder="Masukkan alamat lengkap"
            value={formData.alamat}
            onChange={handleChange('alamat')}
            required
          />
          <Textarea
            label="Catatan Khusus (Opsional)"
            placeholder="Masukkan catatan jika ada"
            value={formData.catatan}
            onChange={handleChange('catatan')}
          />

          <Group justify="right">
            <Button
              variant="outline"
              color="gray"
              radius="md"
              size="md"
              onClick={handleResetForm}
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              radius="md"
              size="md"
              disabled={!isFormValid() || isSubmitting}
              style={{
                background: !isFormValid() || isSubmitting
                  ? 'linear-gradient(135deg, #cccccc, #eeeeee)'
                  : `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
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

export default EditPesertaJadwalKegiatan;
