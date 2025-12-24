/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import { IconKey } from '@/app/admin/(dashboard)/_com/iconMap';
import programKreatifState from '@/app/admin/(dashboard)/_state/inovasi/program-kreatif';
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
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import SelectIconProgramEdit from '../../../../_com/selectIconEdit';

interface FormProgramKreatif {
  name: string;
  deskripsi: string;
  slug: string;
  icon: string;
}

function EditProgramKreatifDesa() {
  const stateProgramKreatif = useProxy(programKreatifState);
  const params = useParams();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormProgramKreatif>({
    name: '',
    deskripsi: '',
    slug: '',
    icon: '',
  });

  const [originalData, setOriginalData] = useState<FormProgramKreatif>({
    name: '',
    deskripsi: '',
    slug: '',
    icon: '',
  });

  const [isDataChanged, setIsDataChanged] = useState(false);

  // Load data hanya sekali berdasarkan params.id
  useEffect(() => {
    const loadProgramKreatif = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await stateProgramKreatif.update.load(id);
        if (data) {
          stateProgramKreatif.update.id = id;
          const loadedData = {
            name: data.name || '',
            slug: data.slug || '',
            deskripsi: data.deskripsi || '',
            icon: data.icon || '',
          };
          setFormData(loadedData);
          setOriginalData(loadedData);
        }
      } catch (error) {
        console.error('Error loading program kreatif:', error);
        toast.error('Gagal memuat data program kreatif');
      }
    };

    loadProgramKreatif();
  }, [params?.id]);

  // Deteksi perubahan data
  useEffect(() => {
    const hasChanged = 
      formData.name !== originalData.name ||
      formData.slug !== originalData.slug ||
      formData.deskripsi !== originalData.deskripsi ||
      formData.icon !== originalData.icon;
    
    setIsDataChanged(hasChanged);
  }, [formData, originalData]);

  // Prevent browser back/refresh jika ada perubahan
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDataChanged) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDataChanged]);

  const handleChange =
    (field: keyof FormProgramKreatif) =>
    (value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    };

  const handleBackClick = () => {
    if (isDataChanged) {
      const confirmed = window.confirm(
        'Anda memiliki perubahan yang belum disimpan. Apakah Anda yakin ingin keluar dari halaman ini? Semua perubahan akan hilang.'
      );
      if (confirmed) {
        router.back();
      }
    } else {
      router.back();
    }
  };

  const handleResetForm = () => {
    setFormData({
      name: originalData.name,
      slug: originalData.slug,
      deskripsi: originalData.deskripsi,
      icon: originalData.icon,
    });
    setOriginalData({
      ...originalData,
    });
    toast.info("Form dikembalikan ke data awal");
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      stateProgramKreatif.update.form = {
        name: formData.name.trim(),
        deskripsi: formData.deskripsi.trim(),
        slug: formData.slug.trim(),
        icon: formData.icon.trim(),
      };
      await stateProgramKreatif.update.submit();
      
      // Reset isDataChanged agar tidak muncul konfirmasi setelah save
      setOriginalData(formData);
      setIsDataChanged(false);
      
      router.push('/admin/inovasi/program-kreatif-desa');
    } catch (error) {
      console.error('Error updating program kreatif:', error);
      toast.error('Gagal menyimpan program kreatif');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      <Group mb="md">
        <Button
          variant="subtle"
          onClick={handleBackClick}
          p="xs"
          radius="md"
        >
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Edit Program Kreatif Desa
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
            label="Nama Program Kreatif Desa"
            placeholder="Masukkan nama program kreatif desa"
            value={formData.name}
            onChange={(e) => handleChange('name')(e.target.value)}
            required
          />

          <TextInput
            label="Deskripsi Singkat Program Kreatif Desa"
            placeholder="Masukkan deskripsi singkat program kreatif desa"
            value={formData.slug}
            onChange={(e) => handleChange('slug')(e.target.value)}
            required
          />

          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Deskripsi
            </Text>
            <EditEditor
              value={formData.deskripsi}
              onChange={handleChange('deskripsi')}
            />
          </Box>

          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Ikon Program Kreatif Desa
            </Text>
            <SelectIconProgramEdit
              value={formData.icon as IconKey}
              onChange={handleChange('icon')}
            />
          </Box>

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

export default EditProgramKreatifDesa;