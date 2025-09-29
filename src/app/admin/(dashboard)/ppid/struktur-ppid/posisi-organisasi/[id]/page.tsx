/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import stateStrukturPPID from '@/app/admin/(dashboard)/_state/ppid/struktur_ppid/struktur_PPID';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title, Tooltip } from '@mantine/core';
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
    nama: "",
    deskripsi: "",
    hierarki: 0,
  });

  useEffect(() => {
    const loadPosisiOrganisasi = async () => {
      if (!id) return;

      try {
        const data = await stateOrganisasi.edit.load(id);

        if (data) {
          // pastikan id-nya masuk ke state edit
          stateOrganisasi.edit.id = id;
          setFormData({
            nama: data.nama || '',
            deskripsi: data.deskripsi || '',
            hierarki: data.hierarki || 0,
          });
        }
      } catch (error) {
        console.error("Error loading posisi organisasi:", error);
        toast.error("Gagal memuat data posisi organisasi");
      }
    };

    loadPosisiOrganisasi();
  }, [id]);

  const handleSubmit = async () => {
    try {
      if (!formData.nama.trim()) {
        toast.error('Nama posisi organisasi tidak boleh kosong');
        return;
      }

      stateOrganisasi.edit.form = {
        nama: formData.nama.trim(),
        deskripsi: formData.deskripsi.trim(),
        hierarki: formData.hierarki,
      };

      // Safety check tambahan: pastikan ID tidak kosong
      if (!stateOrganisasi.edit.id) {
        stateOrganisasi.edit.id = id; // fallback
      }

      const success = await stateOrganisasi.edit.update();

      if (success) {
        router.push("/admin/ppid/struktur-ppid/posisi-organisasi");
      }
    } catch (error) {
      console.error("Error updating posisi organisasi:", error);
      // toast akan ditampilkan dari fungsi update
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
            defaultValue={formData.nama}
            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
            required
          />
          
          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Deskripsi
            </Text>
            <EditEditor
              value={formData.deskripsi}
              onChange={(htmlContent) => {
                setFormData({ ...formData, deskripsi: htmlContent });
              }}
            />
          </Box>
          
          <TextInput
            label="Hierarki"
            type="number"
            min={0}
            placeholder="Contoh: 1 (Angka semakin kecil, posisi semakin tinggi)"
            defaultValue={formData.hierarki}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              setFormData({ ...formData, hierarki: isNaN(value) ? 0 : value });
            }}
            required
          />

          <Group justify="flex-end" mt="md">
            <Button
              onClick={handleSubmit}
              loading={stateOrganisasi.edit.loading}
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

export default EditPosisiOrganisasiPPID;
