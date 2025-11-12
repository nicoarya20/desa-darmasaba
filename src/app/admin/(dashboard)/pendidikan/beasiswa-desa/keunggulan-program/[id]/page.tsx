/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import beasiswaDesaState from '@/app/admin/(dashboard)/_state/pendidikan/beasiswa-desa';
import colors from '@/con/colors';
import { Box, Button, Group, Loader, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function EditProgramKreatifDesa() {
  const state = useProxy(beasiswaDesaState.keunggulanProgram)
  const params = useParams()
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    judul: '',
    deskripsi: '',
  })
  const [originalData, setOriginalData] = useState({
    judul: '',
    deskripsi: '',
  })

  useEffect(() => {
    const loadProgramKreatif = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await state.update.load(id);
        if (data) {
          // ⬇️ FIX PENTING: tambahkan ini
          state.update.id = id;

          state.update.form = {
            judul: data.judul,
            deskripsi: data.deskripsi,
          };

          setFormData({
            judul: data.judul,
            deskripsi: data.deskripsi,
          });
          setOriginalData({
            judul: data.judul,
            deskripsi: data.deskripsi,
          });
        }
      } catch (error) {
        console.error("Error loading pengelolaan sampah:", error);
        toast.error("Gagal memuat data pengelolaan sampah");
      }
    }

    loadProgramKreatif();
  }, [params?.id]);

  const handleResetForm = () => {
    const resetData = {
      judul: originalData.judul,
      deskripsi: originalData.deskripsi,
    };
  
    setFormData(resetData);
  
    // ⬇️ tambahkan sinkronisasi ke state global
    state.update.form = { ...resetData };
  
    toast.info("Form dikembalikan ke data awal");
  };
  

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      state.update.form = {
        ...state.update.form,
        judul: formData.judul.trim(),
        deskripsi: formData.deskripsi.trim(),
      };

      await state.update.update();
      toast.success('Data keunggulan program berhasil diperbarui!');
      router.push("/admin/pendidikan/beasiswa-desa/keunggulan-program");
    } catch (error) {
      console.error("Error updating keunggulan program:", error);
      toast.error(error instanceof Error ? error.message : "Gagal memperbarui data keunggulan program");
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
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
          Edit Keunggulan Program
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
            label="Judul"
            placeholder="Masukkan judul"
            value={formData.judul}
            onChange={(e) => {
              const value = e.target.value;
              setFormData(prev => ({
                ...prev,
                judul: value
              }));
              state.update.form.judul = value;
            }}
            required
          />

          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Deskripsi
            </Text>
            <EditEditor
              value={state.update.form.deskripsi}
              onChange={(htmlContent) => {
                state.update.form.deskripsi = htmlContent;
              }}
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