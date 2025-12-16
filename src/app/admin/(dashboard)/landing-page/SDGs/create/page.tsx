/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { Box, Button, Group, Image, Paper, Stack, Text, TextInput, Title, Loader, ActionIcon } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import sdgsDesa from '../../../_state/landing-page/sdgs-desa';


function CreateSDGsDesa() {
  const router = useRouter();
  const stateSDGSDesa = useProxy(sdgsDesa)
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    stateSDGSDesa.findMany.load();
  }, []);

  const resetForm = () => {
    stateSDGSDesa.create.form = {
      name: "",
      jumlah: "",
      imageId: "",
    };
    setFile(null);
    setPreviewImage(null);
  };
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      if (!file) {
        return toast.warn("Pilih file image terlebih dahulu");
      }

      const res = await ApiFetch.api.fileStorage.create.post({
        file,
        name: file.name,
      })

      const uploaded = res.data?.data;

      if (!uploaded?.id) {
        return toast.error("Gagal mengupload file");
      }

      stateSDGSDesa.create.form.imageId = uploaded.id;

      await stateSDGSDesa.create.create();

      resetForm();
      router.push("/admin/landing-page/SDGs")
    } catch (error) {
      console.error(error);
      toast.error("Gagal menambahkan sdgs desa")
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
     <Box px={{ base: 0, md: 'lg' }} py="xs">
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Tambah Sdgs Desa
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
          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Gambar Program Inovasi
            </Text>
            <Dropzone
              onDrop={(files) => {
                const selectedFile = files[0];
                if (selectedFile) {
                  setFile(selectedFile);
                  setPreviewImage(URL.createObjectURL(selectedFile));
                }
              }}
              onReject={() => toast.error('File tidak valid, gunakan format gambar')}
              maxSize={5 * 1024 ** 2}
              accept={{ 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] }}
              radius="md"
              p="xl"
            >
              <Group justify="center" gap="xl" mih={180}>
                <Dropzone.Accept>
                  <IconUpload size={48} color={colors['blue-button']} stroke={1.5} />
                </Dropzone.Accept>
                <Dropzone.Reject>
                  <IconX size={48} color="red" stroke={1.5} />
                </Dropzone.Reject>
                <Dropzone.Idle>
                  <IconPhoto size={48} color="#868e96" stroke={1.5} />
                </Dropzone.Idle>
                <Stack gap="xs" align="center">
                  <Text size="md" fw={500}>
                    Seret gambar atau klik untuk memilih file
                  </Text>
                  <Text size="sm" c="dimmed">
                  Maksimal 5MB, format gambar .png, .jpg, .jpeg, webp
                  </Text>
                </Stack>
              </Group>
            </Dropzone>

            {/* ✅ Preview gambar + tombol X */}
            {previewImage && (
              <Box mt="sm" pos="relative" style={{ textAlign: 'center' }}>
                <Image
                  src={previewImage}
                  alt="Preview Gambar"
                  radius="md"
                  style={{
                    maxHeight: 200,
                    objectFit: 'contain',
                    border: '1px solid #ddd',
                  }}
                  loading="lazy"
                />

                {/* Tombol hapus (pojok kanan atas) */}
                <ActionIcon
                  variant="filled"
                  color="red"
                  radius="xl"
                  size="sm"
                  pos="absolute"
                  top={5}
                  right={5}
                  onClick={() => {
                    setPreviewImage(null);
                    setFile(null);
                  }}
                  style={{
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  }}
                >
                  <IconX size={14} />
                </ActionIcon>
              </Box>
            )}
          </Box>
          <TextInput
            label="Nama Sdgs Desa"
            placeholder="Masukkan nama Sdgs Desa"
            value={stateSDGSDesa.create.form.name}
            onChange={(e) => {
              stateSDGSDesa.create.form.name = e.currentTarget.value;
            }}
            required
          />

          <TextInput
            type="number"
            label={
              <Text fw="bold" fz="sm" mb={4}>
                Jumlah
              </Text>
            }
            placeholder="Masukkan jumlah"
            value={stateSDGSDesa.create.form.jumlah}
            onChange={(val) => {
              stateSDGSDesa.create.form.jumlah = val.target.value;
            }}
            required
            min={0}
            radius="md"
          />
          <Group justify="right">
            {/* Tombol Batal */}
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

export default CreateSDGsDesa;
