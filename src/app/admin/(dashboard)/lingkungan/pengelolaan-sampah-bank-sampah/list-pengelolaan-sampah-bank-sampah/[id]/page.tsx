/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import pengelolaanSampahState from '@/app/admin/(dashboard)/_state/lingkungan/pengelolaan-sampah';
import SelectIconProgramEdit from '@/app/admin/(dashboard)/_com/selectIconEdit';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title, Tooltip } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

interface FormProgramKreatif {
  name: string;
  icon: string;
}

type IconKey = 'ekowisata' | 'kompetisi' | 'wisata' | 'ekonomi' | 'sampah' | 'truck' | 'scale' | 'clipboard' | 'trash';

function EditProgramKreatifDesa() {
  const stateSampah = useProxy(pengelolaanSampahState.pengelolaanSampah)
  const params = useParams()
  const router = useRouter();

  // State lokal untuk form controlled
  const [formData, setFormData] = useState<FormProgramKreatif>({
    name: '',
    icon: '',
  });

  useEffect(() => {
    const loadProgramKreatif = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await stateSampah.update.load(id);
        if (data) {
          stateSampah.update.id = id; // simpan id di global state
          setFormData({
            name: data.name,
            icon: data.icon,
          });
        }
      } catch (error) {
        console.error("Error loading pengelolaan sampah:", error);
        toast.error("Gagal memuat data pengelolaan sampah");
      }
    };

    loadProgramKreatif();
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
      // Update global state HANYA saat submit
      stateSampah.update.form = {
        name: formData.name.trim(),
        icon: formData.icon.trim(),
      };

      await stateSampah.update.submit();
      toast.success('Data pengelolaan sampah berhasil diperbarui!');
      router.push("/admin/lingkungan/pengelolaan-sampah-bank-sampah/list-pengelolaan-sampah-bank-sampah");
    } catch (error) {
      console.error("Error updating pengelolaan sampah:", error);
      toast.error(error instanceof Error ? error.message : "Gagal memperbarui data pengelolaan sampah");
    }
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      <Group mb="md">
        <Tooltip label="Kembali ke halaman sebelumnya" withArrow>
          <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
            <IconArrowBack color={colors['blue-button']} size={24} />
          </Button>
        </Tooltip>
        <Title order={4} ml="sm" c="dark">
          Edit Pengelolaan Sampah Bank Sampah
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
            label="Nama Pengelolaan Sampah"
            placeholder="Masukkan nama pengelolaan sampah"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />

          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Pilih Ikon
            </Text>
            <SelectIconProgramEdit
              value={formData.icon as IconKey}
              onChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}
            />
          </Box>

          <Group justify="right" mt="md">
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

export default EditProgramKreatifDesa;
