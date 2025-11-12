/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import SelectIconProgramEdit from '@/app/admin/(dashboard)/_com/selectIconEdit';
import programPenghijauanState from '@/app/admin/(dashboard)/_state/lingkungan/program-penghijauan';
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

interface FormProgramPenghijauan {
  name: string;
  deskripsi: string;
  judul: string;
  icon: string;
}

type IconKey =
  | 'ekowisata'
  | 'kompetisi'
  | 'wisata'
  | 'ekonomi'
  | 'sampah'
  | 'truck'
  | 'scale'
  | 'clipboard'
  | 'trash'
  | 'lingkunganSehat'
  | 'sumberOksigen'
  | 'ekonomiBerkelanjutan'
  | 'mencegahBencana';

function EditProgramPenghijauan() {
  const stateProgramPenghijauan = useProxy(programPenghijauanState);
  const params = useParams();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormProgramPenghijauan>({
    name: '',
    judul: '',
    deskripsi: '',
    icon: '',
  });

  const [originalData, setOriginalData] = useState<FormProgramPenghijauan>({
    name: '',
    judul: '',
    deskripsi: '',
    icon: '',
  });

  // Load data program penghijauan
  useEffect(() => {
    const loadProgram = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await stateProgramPenghijauan.update.load(id);
        if (data) {
          stateProgramPenghijauan.update.id = id;
          setFormData({
            name: data.name,
            judul: data.judul,
            deskripsi: data.deskripsi,
            icon: data.icon,
          });
          setOriginalData({
            name: data.name,
            judul: data.judul,
            deskripsi: data.deskripsi,
            icon: data.icon,
          });
        }
      } catch (error) {
        console.error('Error loading program penghijauan:', error);
        toast.error('Gagal memuat data program penghijauan');
      }
    };

    loadProgram();
  }, [params?.id]);

  const handleResetForm = () => {
    setFormData({
      name: originalData.name,
      judul: originalData.judul,
      deskripsi: originalData.deskripsi,
      icon: originalData.icon,
    });
    toast.info('Form dikembalikan ke data awal');
  };

  // Hanya update global state saat submit
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      stateProgramPenghijauan.update.form = {
        name: formData.name.trim(),
        judul: formData.judul.trim(),
        deskripsi: formData.deskripsi.trim(),
        icon: formData.icon.trim(),
      };

      await stateProgramPenghijauan.update.submit();
      toast.success('Program penghijauan berhasil diperbarui');
      router.push('/admin/lingkungan/program-penghijauan');
    } catch (error) {
      console.error('Error updating program penghijauan:', error);
      toast.error('Gagal memperbarui program penghijauan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
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
          Edit Program Penghijauan
        </Title>
      </Group>

      {/* Card utama */}
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
            value={formData.name}
            label="Nama Program Penghijauan"
            placeholder="Masukkan nama program penghijauan"
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            required
          />

          <TextInput
            value={formData.judul}
            label="Judul Deskripsi Program Penghijauan"
            placeholder="Masukkan judul deskripsi program penghijauan"
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, judul: e.target.value }))
            }
            required
          />

          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Deskripsi
            </Text>
            <EditEditor
              value={formData.deskripsi}
              onChange={(htmlContent) =>
                setFormData((prev) => ({ ...prev, deskripsi: htmlContent }))
              }
            />
          </Box>

          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Ikon Program Penghijauan
            </Text>
            <SelectIconProgramEdit
              value={formData.icon as IconKey}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, icon: value }))
              }
            />
          </Box>

          {/* Tombol simpan */}
          <Group justify="flex-end">
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

export default EditProgramPenghijauan;
