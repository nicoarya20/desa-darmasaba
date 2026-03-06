'use client'

import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import { IconKey } from '@/app/admin/(dashboard)/_com/iconMap';
import SelectIconProgramEdit from '@/app/admin/(dashboard)/_com/selectIconEdit';
import programKemiskinanState from '@/app/admin/(dashboard)/_state/ekonomi/program-kemiskinan';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  TextInput,
  Title
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

type Statistik = {
  tahun: string;
  jumlah: string;
};

type FormData = {
  nama: string;
  deskripsi: string;
  icon: string;
  statistik: Statistik;
};

const initialForm: FormData = {
  nama: '',
  deskripsi: '',
  icon: '',
  statistik: {
    tahun: '',
    jumlah: '',
  },
};

function EditProgramKemiskinan() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const stateProgram = useProxy(programKemiskinanState);

  const [formData, setFormData] = useState<FormData>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalData, setOriginalData] = useState<FormData>(initialForm);

  // Helper function to check if HTML content is empty
  const isHtmlEmpty = (html: string) => {
    // Remove all HTML tags and check if there's any text content
    const textContent = html.replace(/<[^>]*>/g, '').trim();
    return textContent === '';
  };

  // Check if form is valid
  const isFormValid = () => {
    return (
      formData.nama?.trim() !== '' &&
      formData.icon?.trim() !== '' &&
      !isHtmlEmpty(formData.deskripsi) &&
      formData.statistik.jumlah?.trim() !== '' &&
      formData.statistik.tahun?.trim() !== ''
    );
  };

  // Load data 1x dari global state → isi local state
  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        await stateProgram.findUnique.load(id);
        const data = stateProgram.findUnique.data;
        if (data) {
          setFormData({
            nama: data.nama ?? '',
            deskripsi: data.deskripsi ?? '',
            icon: data.icon ?? '',
            statistik: {
              tahun: data.statistik?.tahun?.toString() ?? '',
              jumlah: data.statistik?.jumlah?.toString() ?? '',
            },
          });
          setOriginalData({
            nama: data.nama ?? '',
            deskripsi: data.deskripsi ?? '',
            icon: data.icon ?? '',
            statistik: {
              tahun: data.statistik?.tahun?.toString() ?? '',
              jumlah: data.statistik?.jumlah?.toString() ?? '',
            },
          });
        }
      } catch (err) {
        console.error('Error load data:', err);
        toast.error('Gagal mengambil data program');
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]); // ✅ hanya trigger saat id berubah


  // generic handler untuk field top-level
  const handleChange = useCallback(
    (field: keyof FormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // khusus nested statistik
  const handleStatistikChange = useCallback(
    (field: keyof Statistik, value: string) => {
      setFormData((prev) => ({
        ...prev,
        statistik: { ...prev.statistik, [field]: value },
      }));
    },
    []
  );

  const handleResetForm = () => {
    setFormData({
      nama: originalData.nama,
      deskripsi: originalData.deskripsi,
      icon: originalData.icon,
      statistik: {
        tahun: originalData.statistik.tahun,
        jumlah: originalData.statistik.jumlah,
      },
    });
    toast.info('Form dikembalikan ke data awal');
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      stateProgram.update.id = id;
      stateProgram.update.form = formData;
      await stateProgram.update.update();

      toast.success('Program berhasil diperbarui!');
      router.push('/admin/ekonomi/program-kemiskinan');
    } catch (error) {
      console.error('Error update program:', error);
      toast.error('Terjadi kesalahan saat memperbarui program');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
   <Box px={{ base: 0, md: 'lg' }} py="xs">
      {/* Header */}
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
          Edit Program Kemiskinan
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
            value={formData.nama}
            onChange={(e) => handleChange('nama', e.target.value)}
            label={<Text fw="bold" fz="sm">Judul Program</Text>}
            placeholder="Masukkan judul program"
            required
          />

          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Deskripsi
            </Text>
            <EditEditor
              value={formData.deskripsi}
              onChange={(val) => handleChange('deskripsi', val)}
            />
          </Box>

          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Ikon Program Kreatif Desa
            </Text>
            <SelectIconProgramEdit
              value={formData.icon as IconKey}
              onChange={(val) => handleChange('icon', val)}
            />
          </Box>

          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Statistik Jumlah Masyarakat Miskin
            </Text>
            <TextInput
              type="number"
              value={formData.statistik.jumlah}
              onChange={(e) => handleStatistikChange('jumlah', e.target.value)}
              label="Jumlah Masyarakat Miskin"
              placeholder="Masukkan jumlah masyarakat miskin"
              required
            />

            <TextInput
              type="number"
              value={formData.statistik.tahun}
              onChange={(e) => handleStatistikChange('tahun', e.target.value)}
              label="Tahun"
              placeholder="Masukkan tahun"
              required
              mt="sm"
            />
          </Box>

          <Group justify="right" mt="md">
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

export default EditProgramKemiskinan;
