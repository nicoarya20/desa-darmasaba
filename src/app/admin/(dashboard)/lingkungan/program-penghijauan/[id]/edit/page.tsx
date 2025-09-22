/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import SelectIconProgramEdit from '@/app/admin/(dashboard)/_com/selectIconEdit';
import programPenghijauanState from '@/app/admin/(dashboard)/_state/lingkungan/program-penghijauan';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
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

  const [formData, setFormData] = useState<FormProgramPenghijauan>({
    name: '',
    deskripsi: '',
    judul: '',
    icon: '',
  });

  useEffect(() => {
    const loadProgramPenghijauan = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await stateProgramPenghijauan.update.load(id);
        if (data) {
          stateProgramPenghijauan.update.id = id;

          stateProgramPenghijauan.update.form = {
            name: data.name,
            judul: data.judul,
            deskripsi: data.deskripsi,
            icon: data.icon,
          };

          setFormData({
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

    loadProgramPenghijauan();
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
      stateProgramPenghijauan.update.form = {
        ...stateProgramPenghijauan.update.form,
        name: formData.name.trim(),
        deskripsi: formData.deskripsi.trim(),
        judul: formData.judul.trim(),
        icon: formData.icon.trim(),
      };
      await stateProgramPenghijauan.update.submit();
      router.push('/admin/lingkungan/program-penghijauan');
    } catch (error) {
      console.error('Error updating program penghijauan:', error);
      toast.error('Gagal memperbarui program penghijauan');
    }
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      {/* Header dengan back button */}
      <Group mb="md">
        <Tooltip label="Kembali ke halaman sebelumnya" withArrow>
          <Button
            variant="subtle"
            onClick={() => router.back()}
            p="xs"
            radius="md"
          >
            <IconArrowBack color={colors['blue-button']} size={24} />
          </Button>
        </Tooltip>
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
            onChange={(val) =>
              setFormData({
                ...formData,
                name: val.target.value,
              })
            }
            required
          />

          <TextInput
            value={formData.judul}
            label="Judul Deskripsi Program Penghijauan"
            placeholder="Masukkan judul deskripsi program penghijauan"
            onChange={(val) =>
              setFormData({
                ...formData,
                judul: val.target.value,
              })
            }
            required
          />

          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Deskripsi
            </Text>
            <EditEditor
              value={formData.deskripsi}
              onChange={(htmlContent) => {
                setFormData((prev) => ({ ...prev, deskripsi: htmlContent }));
                stateProgramPenghijauan.update.form.deskripsi = htmlContent;
              }}
            />
          </Box>

          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Ikon Program Penghijauan
            </Text>
            <SelectIconProgramEdit
              value={formData.icon as IconKey}
              onChange={(value) => {
                setFormData((prev) => ({ ...prev, icon: value }));
                stateProgramPenghijauan.update.form.icon = value;
              }}
            />
          </Box>

          {/* Tombol simpan */}
          <Group justify="flex-end">
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

export default EditProgramPenghijauan;
