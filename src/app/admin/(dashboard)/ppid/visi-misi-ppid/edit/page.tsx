'use client';
import colors from '@/con/colors';
import { Loader, Box, Button, Group, Paper, Stack, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import stateVisiMisiPPID from '../../../_state/ppid/visi_misi_ppid/visimisiPPID';
import MisiPPID from '../misiPPID/misi-PPID';
import VisiPPID from '../visiPPID/visi-PPID';
import { toast } from 'react-toastify';

function VisiMisiPPIDEdit() {
  const router = useRouter();
  const visiMisi = useProxy(stateVisiMisiPPID);

  // Gabung state lokal menjadi satu object
  const [formData, setFormData] = useState({ visi: '', misi: '' });
  const [originalData, setOriginalData] = useState({ visi: '', misi: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize global data ke state lokal saat pertama load
  useShallowEffect(() => {
    if (!visiMisi.findById.data) {
      visiMisi.findById.initialize();
    }
  }, []);

  useEffect(() => {
    if (visiMisi.findById.data) {
      setFormData({
        visi: visiMisi.findById.data.visi ?? '',
        misi: visiMisi.findById.data.misi ?? '',
      });
      setOriginalData({
        visi: visiMisi.findById.data.visi ?? '',
        misi: visiMisi.findById.data.misi ?? '',
      });
    }
  }, [visiMisi.findById.data]);

  const handleChange = (key: 'visi' | 'misi', value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleResetForm = () => {
    setFormData({
      visi: originalData.visi,
      misi: originalData.misi,
    });
    toast.info('Form dikembalikan ke data awal');
  };

  const submit = () => {
    try {
      setIsSubmitting(true);
      if (visiMisi.findById.data) {
        // update nilai global hanya saat submit
        visiMisi.findById.data.visi = formData.visi;
        visiMisi.findById.data.misi = formData.misi;
        visiMisi.update.save(visiMisi.findById.data);
      }
      router.push('/admin/ppid/visi-misi-ppid');
    } catch (error) {
      console.error("Error updating visi misi:", error);
      toast.error("Terjadi kesalahan saat memperbarui visi misi");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
        <Box px={{ base: 0, md: 'lg' }} py="xs">
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Edit Visi Misi PPID
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
        <Stack gap="xl">
          <Box>
            <VisiPPID value={formData.visi} onChange={value => handleChange('visi', value)} />
          </Box>

          <Box>
            <MisiPPID value={formData.misi} onChange={value => handleChange('misi', value)} />
          </Box>

          {/* ======= Tombol Aksi ======= */}
          <Group justify="right">
            {/* Tombol Batal */}
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
              onClick={submit}
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

export default VisiMisiPPIDEdit;
