/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import {
  Box,
  Button,
  Group,
  Image,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconFile, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import apbdes from '../../../_state/landing-page/apbdes';


function CreateAPBDes() {
  const router = useRouter();
  const stateAPBDes = useProxy(apbdes)
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [docFile, setDocFile] = useState<File | null>(null);
  


  useEffect(() => {
    stateAPBDes.findMany.load();
  }, []);

  const resetForm = () => {
    stateAPBDes.create.form = {
      name: "",
      jumlah: "",
      imageId: "",
      fileId: "",
    };
    setImageFile(null);
    setDocFile(null);
    setPreviewImage(null);
  };
  const handleSubmit = async () => {
    if (!imageFile || !docFile) {
      return toast.warn("Pilih gambar dan dokumen terlebih dahulu");
    }
  
    try {
      const [uploadImageRes, uploadDocRes] = await Promise.all([
        ApiFetch.api.fileStorage.create.post({ file: imageFile, name: imageFile.name }),
        ApiFetch.api.fileStorage.create.post({ file: docFile, name: docFile.name }),
      ]);
  
      const imageId = uploadImageRes?.data?.data?.id;
      const fileId = uploadDocRes?.data?.data?.id;
  
      if (!imageId || !fileId) {
        return toast.error("Gagal mengupload file");
      }
  
      stateAPBDes.create.form.imageId = imageId;
      stateAPBDes.create.form.fileId = fileId;
  
      await stateAPBDes.create.create();
  
      toast.success("Berhasil menambahkan APBDes");
      resetForm();
      router.push("/admin/landing-page/apbdes");
    } catch (error) {
      console.error("Gagal submit:", error);
      toast.error("Gagal menyimpan data");
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
          Tambah APBDes
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
          {/* Gambar APBDes */}
          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Gambar APBDes
            </Text>
            <Dropzone
              onDrop={(files) => {
                const selectedFile = files[0];
                if (selectedFile) {
                  setImageFile(selectedFile);
                  setPreviewImage(URL.createObjectURL(selectedFile));
                }
              }}
              onReject={() => toast.error('File tidak valid, gunakan format gambar')}
              maxSize={5 * 1024 ** 2}
              accept={{ 'image/*': [] }}
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
                <Box>
                  <Text size="xl" inline>
                    Seret gambar atau klik untuk memilih file
                  </Text>
                  <Text size="sm" c="dimmed" inline display="block" mt={7}>
                    Maksimal 5MB (format: JPEG, JPG, PNG, GIF, WEBP, SVG)
                  </Text>
                </Box>
              </Group>
            </Dropzone>

            {previewImage && (
              <Box mt="md" style={{ textAlign: 'center' }}>
                <Image
                  src={previewImage}
                  alt="Preview Gambar"
                  radius="md"
                  style={{ maxHeight: 200, objectFit: 'contain', border: '1px solid #ddd' }}
                  loading="lazy"
                />
              </Box>
            )}
          </Box>

          {/* Dokumen APBDes */}
          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Dokumen APBDes
            </Text>
            <Dropzone
              onDrop={(files) => {
                const selectedFile = files[0];
                if (selectedFile) {
                  setDocFile(selectedFile);
                  setPreviewDoc(URL.createObjectURL(selectedFile));
                }
              }}
              onReject={() => toast.error('File tidak valid, gunakan format PDF, DOC, atau DOCX')}
              maxSize={5 * 1024 ** 2}
              accept={{
                'application/pdf': ['.pdf'],
                'application/msword': ['.doc'],
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
              }}
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
                  <IconFile size={48} color="var(--mantine-color-dimmed)" stroke={1.5} />
                </Dropzone.Idle>
                <Box>
                  <Text size="xl" inline>
                    Seret dokumen atau klik untuk memilih file
                  </Text>
                  <Text size="sm" c="dimmed" inline display="block" mt={7}>
                    Maksimal 5MB (format: PDF, DOC, DOCX)
                  </Text>
                </Box>
              </Group>
            </Dropzone>

            {previewDoc && (
              <Box mt="md">
                <Text fw="bold" fz="sm" mb={6}>
                  Pratinjau Dokumen
                </Text>
                <iframe
                  src={previewDoc}
                  width="100%"
                  height="500px"
                  style={{ border: '1px solid #ddd', borderRadius: '8px' }}
                />
              </Box>
            )}
          </Box>

          {/* Form Input */}
          <TextInput
            label="Nama APBDes"
            placeholder="Masukkan nama APBDes"
            value={stateAPBDes.create.form.name || ''}
            onChange={(e) => (stateAPBDes.create.form.name = e.target.value)}
            required
          />
          <TextInput
            label="Jumlah Anggaran"
            placeholder="Masukkan jumlah anggaran"
            value={stateAPBDes.create.form.jumlah || ''}
            onChange={(e) => (stateAPBDes.create.form.jumlah = e.target.value)}
            required
          />

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
              disabled={!imageFile || !docFile || !stateAPBDes.create.form.name || !stateAPBDes.create.form.jumlah}
            >
              Simpan
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default CreateAPBDes;
