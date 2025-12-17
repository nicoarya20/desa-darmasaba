/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import stateStrukturPPID from '@/app/admin/(dashboard)/_state/ppid/struktur_ppid/struktur_PPID';
import colors from '@/con/colors';
import { Loader, Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function EditPosisiOrganisasiPPID() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const stateOrganisasi = useProxy(stateStrukturPPID.posisiOrganisasi);

  const [formData, setFormData] = useState({
    nama: '',
    deskripsi: '',
    hierarki: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [originalData, setOriginalData] = useState({
    nama: "",
    deskripsi: "",
    hierarki: 0,
  });

  // Fungsi generik untuk update formData
  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (!id) return;

    const loadPosisiOrganisasi = async () => {
      try {
        const data = await stateOrganisasi.edit.load(id);
        if (data) {
          stateOrganisasi.edit.id = id;
          setFormData({
            nama: data.nama || '',
            deskripsi: data.deskripsi || '',
            hierarki: data.hierarki || 0,
          });
          setOriginalData({
            nama: data.nama || '',
            deskripsi: data.deskripsi || '',
            hierarki: data.hierarki || 0,
          });
        }
      } catch (err) {
        console.error('Error loading posisi organisasi:', err);
        toast.error('Gagal memuat data posisi organisasi');
      }
    };

    loadPosisiOrganisasi();
  }, [id]);

  const handleResetForm = () => {
    setFormData({
      nama: originalData.nama,
      deskripsi: originalData.deskripsi,
      hierarki: originalData.hierarki,
    });
    toast.info("Form dikembalikan ke data awal");
  };

  const handleSubmit = async () => {
    if (!formData.nama.trim()) {
      toast.error('Nama posisi organisasi tidak boleh kosong');
      return;
    }

    try {
      setIsSubmitting(true);
      // Update global state hanya saat submit
      stateOrganisasi.edit.form = {
        nama: formData.nama.trim(),
        deskripsi: formData.deskripsi.trim(),
        hierarki: formData.hierarki,
      };

      if (!stateOrganisasi.edit.id) {
        stateOrganisasi.edit.id = id;
      }

      const success = await stateOrganisasi.edit.update();

      if (success) {
        router.push('/admin/ppid/struktur-ppid/posisi-organisasi');
      }
    } catch (err) {
      console.error('Error updating posisi organisasi:', err);
      // toast error biasanya sudah ada di update
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
          Edit Posisi Organisasi PPID
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
            label="Nama Posisi Organisasi"
            placeholder="Masukkan nama posisi organisasi"
            value={formData.nama}
            onChange={(e) => handleChange('nama', e.target.value)}
            required
          />

          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Deskripsi
            </Text>
            <EditEditor
              value={formData.deskripsi}
              onChange={(html) => handleChange('deskripsi', html)}
            />
          </Box>

          <TextInput
            label="Hierarki"
            type="number"
            min={0}
            placeholder="Contoh: 1 (Angka semakin kecil, posisi semakin tinggi)"
            value={formData.hierarki}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              handleChange('hierarki', isNaN(value) ? 0 : value);
            }}
            required
          />

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

export default EditPosisiOrganisasiPPID;
