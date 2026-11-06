'use client'
/* eslint-disable react-hooks/exhaustive-deps */
import stateLayananDesa from '@/app/admin/(dashboard)/_state/desa/layananDesa';
import LayananWaktuBiayaFields from '@/components/admin/LayananWaktuBiayaFields';
import colors from '@/con/colors';
import { toWaktuBiayaForm, validateWaktuBiayaForm } from '@/lib/pelayanan-waktu-biaya';
import {
  Box,
  Button,
  Group,
  Loader,
  Paper,
  Stack,
  TextInput,
  Title
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function EditPelayananTelunjukSakti() {
  const stateTelunjukDesa = useProxy(stateLayananDesa.pelayananTelunjukSaktiDesa);
  const router = useRouter();
  const params = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if form is valid
  const isFormValid = () => {
    return (
      formData.name?.trim() !== '' &&
      formData.deskripsi?.trim() !== '' &&
      formData.link?.trim() !== ''
    );
  };

  const [formData, setFormData] = useState({
    name: '',
    deskripsi: '',
    link: '',
    estimasiWaktu: '',
    biaya: '',
  });

  const [originalData, setOriginalData] = useState({
    name: '',
    deskripsi: '',
    link: '',
    estimasiWaktu: '',
    biaya: '',
  });

  // Load data awal hanya sekali (pas ada id)
  useEffect(() => {
    const loadData = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await stateTelunjukDesa.edit.load(id);
        if (data) {
          setFormData({
            name: data.name ?? '',
            deskripsi: data.deskripsi ?? '',
            link: data.link ?? '',
            ...toWaktuBiayaForm(data),
          });
          setOriginalData({
            name: data.name ?? '',
            deskripsi: data.deskripsi ?? '',
            link: data.link ?? '',
            ...toWaktuBiayaForm(data),
          });
        }
      } catch (error) {
        console.error('Error loading pelayanan telunjuk sakti:', error);
        toast.error('Gagal memuat data pelayanan telunjuk sakti');
      }
    };

    loadData();
  }, [params?.id]);

  // Handler input controlled
  const handleChange = useCallback(
    (field: keyof typeof formData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleResetForm = () => {
    setFormData({
      name: originalData.name,
      deskripsi: originalData.deskripsi,
      link: originalData.link,
      estimasiWaktu: originalData.estimasiWaktu,
      biaya: originalData.biaya,
    });
    toast.info("Form dikembalikan ke data awal");
  };

  // Submit: update global state hanya saat simpan
  const handleSubmit = async () => {
    if (!formData.name?.trim()) {
      toast.error('Nama pelayanan wajib diisi');
      return;
    }

    if (!formData.deskripsi?.trim()) {
      toast.error('Judul link wajib diisi');
      return;
    }

    if (!formData.link?.trim()) {
      toast.error('Link wajib diisi');
      return;
    }

    const waktuBiayaError = validateWaktuBiayaForm(formData);
    if (waktuBiayaError) {
      toast.error(waktuBiayaError);
      return;
    }

    try {
      setIsSubmitting(true);
      stateTelunjukDesa.edit.form = {
        ...stateTelunjukDesa.edit.form,
        ...formData,
      };
      await stateTelunjukDesa.edit.update();
      toast.success('Pelayanan telunjuk sakti berhasil diperbarui!');
      router.push('/admin/desa/layanan/pelayanan_telunjuk_sakti_desa');
    } catch (error) {
      console.error('Error updating pelayanan telunjuk sakti:', error);
      toast.error('Terjadi kesalahan saat memperbarui pelayanan telunjuk sakti');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      {/* Back Button + Title */}
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Edit Pelayanan Telunjuk Sakti Desa
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
          {/* Nama */}
          <TextInput
            label="Nama Pelayanan"
            placeholder="Masukkan nama pelayanan"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
          />

          {/* Deskripsi */}
          <TextInput
            value={formData.deskripsi}
            onChange={(e) => handleChange('deskripsi', e.target.value)}
            label="Judul Link"
            placeholder="Masukkan judul link"
            required
          />

          {/* Link */}
          <TextInput
            label="Link"
            placeholder="Masukkan alamat link"
            value={formData.link}
            onChange={(e) => handleChange('link', e.target.value)}
          />

          <LayananWaktuBiayaFields
            estimasiWaktu={formData.estimasiWaktu}
            biaya={formData.biaya}
            onEstimasiWaktuChange={(v) => handleChange('estimasiWaktu', v)}
            onBiayaChange={(v) => handleChange('biaya', v)}
          />

          {/* Tombol Simpan */}
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

            {/* Tombol Simpan */}
            <Button
              onClick={handleSubmit}
              radius="md"
              size="md"
              disabled={!isFormValid() || isSubmitting}
              style={{
                background: !isFormValid() || isSubmitting
                  ? `linear-gradient(135deg, #cccccc, #eeeeee)`
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

export default EditPelayananTelunjukSakti;
