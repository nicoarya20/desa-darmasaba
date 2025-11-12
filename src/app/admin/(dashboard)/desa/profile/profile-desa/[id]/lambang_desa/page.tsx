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
  TextInput,
  Title,
} from '@mantine/core';
import { IconAlertCircle, IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

// 🧩 Type untuk form
interface FormData {
  judul: string;
  deskripsi: string;
}

// 🧩 Main Component
function Page() {
  const router = useRouter();
  const params = useParams();

  const [formData, setFormData] = useState<FormData>({ judul: '', deskripsi: '' });
  const [originalData, setOriginalData] = useState<FormData>({ judul: '', deskripsi: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // 🧭 Load data awal
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
        const data = await stateProfileDesa.lambangDesa.findUnique.load(id);

        if (data) {
          const initial: FormData = {
            judul: data.judul || '',
            deskripsi: data.deskripsi || '',
          };
          setFormData(initial);
          setOriginalData(initial);

          // Penting untuk isi id di state sebelum submit
          stateProfileDesa.lambangDesa.update.initialize(data);
        } else {
          setLoadError('Data tidak ditemukan');
        }
      } catch (error) {
        console.error('Error loading lambang:', error);
        setLoadError('Gagal memuat data lambang desa');
        toast.error('Gagal memuat data lambang desa');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    return () => {
      stateProfileDesa.lambangDesa.update.reset();
      stateProfileDesa.lambangDesa.findUnique.reset();
    };
  }, [params?.id, router]);

  // 🔁 Reset form
  const handleResetForm = () => {
    setFormData(originalData);
    toast.info('Form dikembalikan ke data awal');
  };

  // 💾 Submit handler
  const handleSubmit = async () => {
    if (!formData.judul.trim()) {
      toast.error('Judul wajib diisi');
      return;
    }

    setIsSubmitting(true);
    try {
      const state = stateProfileDesa.lambangDesa;
      state.update.form.judul = formData.judul;
      state.update.form.deskripsi = formData.deskripsi;

      const success = await state.update.submit();

      if (success) {
        toast.success('Data berhasil disimpan');
        router.push('/admin/desa/profile/profile-desa');
      } else {
        toast.error('Gagal menyimpan data');
      }
    } catch (error) {
      console.error('Error update lambang desa:', error);
      toast.error('Terjadi kesalahan saat update lambang desa');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 📝 Handlers
  const handleJudulChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, judul: e.target.value }));
  };

  const handleDeskripsiChange = (html: string) => {
    setFormData(prev => ({ ...prev, deskripsi: html }));
  };

  const handleBack = () => router.back();

  // 🔄 Loading
  if (isLoading) {
    return (
      <Box>
        <Center h={400}>
          <Stack align="center" gap="md">
            <Loader size="lg" color={colors['blue-button']} />
            <Text size="lg" fw={500} c="dimmed">
              Memuat data lambang desa...
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
          <Alert icon={<IconAlertCircle size={20} />} color="red" title="Terjadi Kesalahan" radius="md">
            {loadError}
          </Alert>
          <Button onClick={() => router.push('/admin/desa/profile/profile-desa')} variant="outline">
            Kembali ke Halaman Utama
          </Button>
        </Stack>
      </Box>
    );
  }

  // 🧱 UI utama
  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      <Stack gap="md">
        {/* Header */}
        <Group mb="sm">
          <Button variant="subtle" onClick={handleBack} p="xs" radius="md">
            <IconArrowBack color={colors['blue-button']} size={24} />
          </Button>
          <Title order={4} ml="sm" c="dark">
            Edit Lambang Desa
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
            {/* Judul */}
            <TextInput
              label={<Text fw="bold" size="sm">Judul</Text>}
              placeholder="Masukkan judul lambang desa"
              value={formData.judul}
              onChange={handleJudulChange}
              error={!formData.judul.trim() && 'Judul wajib diisi'}
              required
              size="md"
              radius="md"
            />

            {/* Deskripsi */}
            <Box>
              <Text fw="bold" size="sm" mb={8}>
                Deskripsi
              </Text>
              <EditEditor value={formData.deskripsi} onChange={handleDeskripsiChange} />
            </Box>

            {/* Tombol Aksi */}
            <Group justify="right">
              <Button
                variant="outline"
                color="gray"
                radius="md"
                size="md"
                onClick={handleResetForm}
                disabled={isSubmitting}
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
