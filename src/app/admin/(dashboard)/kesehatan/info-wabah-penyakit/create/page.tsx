'use client'
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Image,
  Loader,
  Paper,
  Stack,
  Text,
  TextInput,
  Title
} from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import CreateEditor from '../../../_com/createEditor';
import infoWabahPenyakit from '../../../_state/kesehatan/info-wabah-penyakit/infoWabahPenyakit';

function CreateInfoWabahPenyakit() {
  const router = useRouter();
  const infoWabahPenyakitState = useProxy(infoWabahPenyakit)
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    infoWabahPenyakitState.create.form = {
      name: "",
      deskripsiSingkat: "",
      deskripsiLengkap: "",
      imageId: "",
    };
    setPreviewImage(null);
    setFile(null);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      if (!file) {
        return toast.warn("Pilih file gambar terlebih dahulu");
      }

      const res = await ApiFetch.api.fileStorage.create.post({
        file,
        name: file.name,
      });

      const uploaded = res.data?.data;
      if (!uploaded?.id) {
        return toast.error("Gagal upload gambar");
      }

      infoWabahPenyakitState.create.form.imageId = uploaded.id;
      await infoWabahPenyakitState.create.create();

      resetForm();
      router.push("/admin/kesehatan/info-wabah-penyakit")
    } catch (error) {
      console.error("Error creating info wabah penyakit:", error);
      toast.error("Gagal menambahkan info wabah penyakit");
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
          Tambah Info Wabah Penyakit
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
            value={infoWabahPenyakitState.create.form.name}
            onChange={(val) => {
              infoWabahPenyakitState.create.form.name = val.target.value;
            }}
            label={<Text fz="sm" fw="bold">Judul</Text>}
            placeholder="Masukkan judul"
            required
          />

          <Box>
            <Text fz="sm" fw="bold">Deskripsi Singkat</Text>
            <CreateEditor
              value={infoWabahPenyakitState.create.form.deskripsiSingkat}
              onChange={(val) => {
                infoWabahPenyakitState.create.form.deskripsiSingkat = val;
              }}
            />
          </Box>

          <Box>
            <Text fz="sm" fw="bold">Deskripsi</Text>
            <CreateEditor
              value={infoWabahPenyakitState.create.form.deskripsiLengkap}
              onChange={(val) => {
                infoWabahPenyakitState.create.form.deskripsiLengkap = val;
              }}
            />
          </Box>

          <Box>
            <Text fz="sm" fw="bold">Gambar</Text>
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
            >
              <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: 'none' }}>
                <Dropzone.Accept>
                  <IconUpload size={52} color="var(--mantine-color-blue-6)" stroke={1.5} />
                </Dropzone.Accept>
                <Dropzone.Reject>
                  <IconX size={52} color="var(--mantine-color-red-6)" stroke={1.5} />
                </Dropzone.Reject>
                <Dropzone.Idle>
                  <IconPhoto size={52} color="var(--mantine-color-dimmed)" stroke={1.5} />
                </Dropzone.Idle>

                <div>
                  <Text size="xl" inline>
                    Drag gambar ke sini atau klik untuk pilih file
                  </Text>
                  <Text size="sm" c="dimmed" inline mt={7}>
                    Maksimal 5MB dan harus format gambar
                  </Text>
                </div>
              </Group>
            </Dropzone>

            {previewImage && (
              <Box mt="sm" pos={"relative"}>
                <Image
                  src={previewImage}
                  alt="Preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '200px',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                  }}
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

export default CreateInfoWabahPenyakit;
