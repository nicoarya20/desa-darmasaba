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
  TextInput,
  Title
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import infoSekolahPaud from '../../../../_state/pendidikan/info-sekolah-paud';

function CreateJenjangPendidikan() {
  const router = useRouter();
  const stateJenjang = useProxy(infoSekolahPaud.jenjangPendidikan);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    stateJenjang.findMany.load();
  }, []);

  const resetForm = () => {
    stateJenjang.create.form = {
      nama: '',
    };
  };

  const handleSubmit = async () => {
    try {
      if (!stateJenjang.create.form.nama) {
        return toast.warn('Nama jenjang pendidikan tidak boleh kosong');
      }

      setIsSubmitting(true);
      await stateJenjang.create.create();
      resetForm();
      router.push('/admin/pendidikan/info-sekolah/jenjang-pendidikan');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      {/* Back button + Title */}
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
          Tambah Jenjang Pendidikan
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
            label="Nama Jenjang Pendidikan"
            placeholder="Masukkan nama jenjang pendidikan"
            value={stateJenjang.create.form.nama || ''}
            onChange={(e) => (stateJenjang.create.form.nama = e.target.value)}
            required
          />

          <Group justify="right">
            <Button
              variant="outline"
              color="gray"
              radius="md"
              size="md"
              onClick={resetForm}
            >
              Reset
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

export default CreateJenjangPendidikan;
