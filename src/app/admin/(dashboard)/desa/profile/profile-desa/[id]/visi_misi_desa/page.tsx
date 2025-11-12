'use client';

import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import stateProfileDesa from '@/app/admin/(dashboard)/_state/desa/profile';
import colors from '@/con/colors';
import {
  Alert,
  Box,
  Button,
  Center,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconAlertCircle, IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

// 🔹 Types
interface FormData {
  visi: string;
  misi: string;
}

// 🔹 Main Component
function Page() {
  const router = useRouter();
  const params = useParams();
  const [formData, setFormData] = useState<FormData>({ visi: '', misi: '' });
  const [originalData, setOriginalData] = useState<FormData>({ visi: '', misi: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // 🧭 Load Data
  useEffect(() => {
    const loadData = async () => {
      const id = params?.id as string;
      if (!id) {
        toast.error('ID tidak valid');
        router.push('/admin/desa/profile/profile-desa');
        return;
      }

      setIsLoading(true);
      setLoadError(null);

      try {
        const data = await stateProfileDesa.visiMisiDesa.findUnique.load(id);
        if (data) {
          const initialData: FormData = {
            visi: data.visi || '',
            misi: data.misi || '',
          };
          setFormData(initialData);
          setOriginalData(initialData);

          // set id ke state agar submit pakai endpoint benar
          stateProfileDesa.visiMisiDesa.update.initialize(data);
        } else {
          setLoadError('Data tidak ditemukan');
        }
      } catch (error) {
        console.error('Error load visi misi:', error);
        setLoadError('Gagal memuat data visi misi desa');
        toast.error('Gagal memuat data visi misi desa');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    return () => {
      stateProfileDesa.visiMisiDesa.update.reset();
      stateProfileDesa.visiMisiDesa.findUnique.reset();
    };
  }, [params?.id, router]);

  // 🔄 Reset Form
  const handleResetForm = () => {
    setFormData(originalData);
    toast.info('Form dikembalikan ke data awal');
  };

  // 💾 Submit
  const handleSubmit = async () => {
    if (!formData.visi.trim()) {
      toast.error('Visi wajib diisi');
      return;
    }

    setIsSubmitting(true);
    try {
      const originalState = stateProfileDesa.visiMisiDesa;

      // update data form ke state sebelum submit
      originalState.update.form.visi = formData.visi;
      originalState.update.form.misi = formData.misi;

      const success = await originalState.update.submit();

      if (success) {
        toast.success('Data berhasil disimpan');
        router.push('/admin/desa/profile/profile-desa');
      } else {
        toast.error('Gagal menyimpan data');
      }
    } catch (error) {
      console.error('Error update visi misi desa:', error);
      toast.error('Terjadi kesalahan saat update visi misi desa');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🧭 Field handlers
  const handleVisiChange = (html: string) => setFormData(prev => ({ ...prev, visi: html }));
  const handleMisiChange = (html: string) => setFormData(prev => ({ ...prev, misi: html }));
  const handleBack = () => router.back();

  // ⏳ Loading
  if (isLoading) {
    return (
      <Box>
        <Center h={400}>
          <Stack align="center" gap="md">
            <Loader size="lg" color={colors['blue-button']} />
            <Text size="lg" fw={500} c="dimmed">
              Memuat data...
            </Text>
          </Stack>
        </Center>
      </Box>
    );
  }

  // ❌ Error
  if (loadError) {
    return (
      <Box px={{ base: 'sm', md: 'lg' }} py="md">
        <Stack gap="md">
          <Button variant="subtle" onClick={handleBack} p="xs" radius="md">
            <IconArrowBack color={colors['blue-button']} size={24} />
          </Button>
          <Alert
            icon={<IconAlertCircle size={20} />}
            color="red"
            title="Terjadi Kesalahan"
            radius="md"
          >
            {loadError}
          </Alert>
          <Button
            onClick={() => router.push('/admin/desa/profile/profile-desa')}
            variant="outline"
          >
            Kembali ke Halaman Utama
          </Button>
        </Stack>
      </Box>
    );
  }

  // ✅ UI
  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      <Stack gap="md">
        {/* Header */}
        <Group mb="sm">
          <Button variant="subtle" onClick={handleBack} p="xs" radius="md">
            <IconArrowBack color={colors['blue-button']} size={24} />
          </Button>
          <Title order={4} ml="sm" c="dark">
            Edit Visi & Misi Desa
          </Title>
        </Group>

        {/* Form */}
        <Paper
          w={{ base: '100%', md: '60%' }}
          bg={colors['white-1']}
          p="xl"
          radius="md"
          shadow="sm"
          style={{ border: '1px solid #e0e0e0' }}
        >
          <Stack gap="lg">
            <Box>
              <Title order={3} mb={4}>
                Informasi Visi & Misi Desa
              </Title>
            </Box>

            {/* Visi */}
            <Box>
              <Text fw="bold" size="sm" mb={8}>
                Visi
              </Text>
              <EditEditor value={formData.visi} onChange={handleVisiChange} />
            </Box>

            {/* Misi */}
            <Box>
              <Text fw="bold" size="sm" mb={8}>
                Misi
              </Text>
              <EditEditor value={formData.misi} onChange={handleMisiChange} />
            </Box>

            {/* Actions */}
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
                style={{
                  background: `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
                  color: '#fff',
                  boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)',
                }}
                loading={isSubmitting}
              >
                Simpan
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}

export default Page;
