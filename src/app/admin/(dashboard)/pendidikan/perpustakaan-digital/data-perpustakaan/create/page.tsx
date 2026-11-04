'use client'
import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';
import perpustakaanDigitalState from '@/app/admin/(dashboard)/_state/pendidikan/perpustakaan-digital';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { ActionIcon, Box, Button, Group, Image, Loader, Paper, Select, Stack, Text, TextInput, Title } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function CreateDataPerpustakaan() {
  const createState = useProxy(perpustakaanDigitalState.dataPerpustakaan)
  // Snapshot cabang kategoriBuku agar Select re-render saat findManyAll.load()
  // async selesai — JSX sebelumnya baca raw proxy (race intermiten, STG).
  const kategoriState = useProxy(perpustakaanDigitalState.kategoriBuku)
  const router = useRouter();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to check if HTML content is empty
  const isHtmlEmpty = (html: string) => {
    // Remove all HTML tags and check if there's any text content
    const textContent = html.replace(/<[^>]*>/g, '').trim();
    return textContent === '';
  };

  // Check if form is valid
  const isFormValid = () => {
    return (
      createState.create.form.judul?.trim() !== '' &&
      !isHtmlEmpty(createState.create.form.deskripsi) &&
      createState.create.form.kategoriId?.trim() !== '' &&
      file !== null
    );
  };

  useEffect(() => {
    perpustakaanDigitalState.kategoriBuku.findManyAll.load();
  }, []);

  const resetForm = () => {
    createState.create.form = {
      judul: "",
      deskripsi: "",
      imageId: "",
      kategoriId: "",
    };
    setPreviewImage(null)
    setFile(null)
  };

  const handleSubmit = async () => {
    try {
      if (!file) {
        return toast.warn("Pilih file gambar terlebih dahulu");
      }

      setIsSubmitting(true);
      const res = await ApiFetch.api.fileStorage.create.post({
        file,
        name: file.name,
      });

      const uploaded = res.data?.data;
      if (!uploaded?.id) {
        return toast.error("Gagal upload gambar");
      }

      createState.create.form.imageId = uploaded.id;
      await createState.create.create();
      resetForm();
      router.push("/admin/pendidikan/perpustakaan-digital/data-perpustakaan")
    } catch (error) {
      console.error("Error creating data perpustakaan:", error);
      toast.error("Gagal menambahkan data perpustakaan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      {/* Tombol Kembali */}
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Tambah Data Perpustakaan
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
          {/* Judul */}
          <TextInput
            label={<Text fw="bold" fz="sm">Judul</Text>}
            placeholder='Masukkan judul'
            value={createState.create.form.judul}
            onChange={(val) => {
              createState.create.form.judul = val.target.value;
            }}
            required
          />

          {/* Deskripsi */}
          <Box>
            <Text fw="bold" fz="sm" mb={6}>Deskripsi</Text>
            <CreateEditor
              value={createState.create.form.deskripsi}
              onChange={(val) => { createState.create.form.deskripsi = val; }}
            />
          </Box>

          {/* Kategori */}
          <Select
            label={<Text fw="bold" fz="sm">Kategori</Text>}
            placeholder='Pilih kategori'
            value={createState.create.form.kategoriId || ""}
            onChange={(val) => { createState.create.form.kategoriId = val ?? ""; }}
            data={kategoriState.findManyAll.data?.map((item) => ({
              value: item.id,
              label: item.name,
            }))}
          />

          {/* Gambar */}
          <Box>
            <Text fw="bold" fz="sm" mb={6}>Gambar</Text>
            <Dropzone
              onDrop={(files) => {
                const selectedFile = files[0];
                if (selectedFile) {
                  setFile(selectedFile);
                  setPreviewImage(URL.createObjectURL(selectedFile));
                }
              }}
              onReject={() => toast.error('File tidak valid.')}
              maxSize={5 * 1024 ** 2}
              accept={{ 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] }}
              radius="md"
              p="xl"
            >
              <Group justify="center" gap="xl" mih={180}>
                <Dropzone.Accept>
                  <IconUpload size={48} color="var(--mantine-color-blue-6)" stroke={1.5} />
                </Dropzone.Accept>
                <Dropzone.Reject>
                  <IconX size={48} color="var(--mantine-color-red-6)" stroke={1.5} />
                </Dropzone.Reject>
                <Dropzone.Idle>
                  <IconPhoto size={48} color="var(--mantine-color-dimmed)" stroke={1.5} />
                </Dropzone.Idle>
              </Group>
              <Text ta="center" mt="sm" size="sm" c="dimmed">
                Drag gambar ke sini atau klik untuk pilih file (maks 5MB)
              </Text>
            </Dropzone>

            {previewImage && (
              <Box pos={"relative"} mt="sm" style={{ textAlign: 'center' }}>
                <Image
                  src={previewImage}
                  alt="Preview"
                  radius="md"
                  style={{ maxHeight: 200, objectFit: 'contain', border: '1px solid #ddd' }}
                  loading="lazy"
                />
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

          {/* Submit Button */}
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
              disabled={!isFormValid() || isSubmitting}
              style={{
                background: !isFormValid() || isSubmitting
                  ? `linear-gradient(135deg, #cccccc, #eeeeee)`
                  : `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
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

export default CreateDataPerpustakaan;
