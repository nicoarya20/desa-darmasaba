/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import profileLandingPageState from '@/app/admin/(dashboard)/_state/landing-page/profile';
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
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function EditProgramInovasi() {
  const stateProgramInovasi = useProxy(profileLandingPageState.programInovasi)
  const router = useRouter();
  const params = useParams();

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: stateProgramInovasi.update.form.name || "",
    description: stateProgramInovasi.update.form.description || "",
    imageId: stateProgramInovasi.update.form.imageId || "",
    link: stateProgramInovasi.update.form.link || "",
  })

  useEffect(() => {
    const id = params?.id as string;
    if (!id) return;

    const loadProgramInovasi = async () => {
      try {
        const data = await stateProgramInovasi.update.load(id);
        if (data) {
          setFormData({
            name: data.name || "",
            description: data.description || "",
            imageId: data.imageId || "",
            link: data.link || ""
          });
          // Tampilkan preview gambar
          if (data.image?.link) {
            setPreviewImage(data.image.link);
          }
        }
      } catch (error) {
        console.error("Error loading program inovasi:", error);
        toast.error(
          error instanceof Error ? error.message : "Gagal mengambil data program inovasi"
        );
      }
    }

    loadProgramInovasi();
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
      stateProgramInovasi.update.form = {
        ...stateProgramInovasi.update.form,
        name: formData.name,
        description: formData.description,
        imageId: formData.imageId,
        link: formData.link,
      }
      if (file) {
        const res = await ApiFetch.api.fileStorage.create.post({ file, name: file.name });
        const uploaded = res.data?.data;

        if (!uploaded?.id) {
          return toast.error("Gagal upload gambar");
        }

        // Update imageId in global state
        stateProgramInovasi.update.form.imageId = uploaded.id;
      }

      await stateProgramInovasi.update.update();
      toast.success("Program Inovasi berhasil diperbarui!");
      router.push("/admin/landing-page/profile/program-inovasi");
    } catch (error) {
      console.error("Error updating program inovasi:", error);
      toast.error("Terjadi kesalahan saat memperbarui program inovasi");
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
          Edit Program Inovasi
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
              accept={{ 'image/*': [] }}
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
                    Maksimal 5MB, format gambar wajib
                  </Text>
                </Stack>
              </Group>
            </Dropzone>

            {previewImage && (
              <Box mt="sm" style={{ display: 'flex', justifyContent: 'center' }}>
                <Image
                  src={previewImage}
                  alt="Preview Gambar"
                  radius="md"
                  style={{ maxHeight: 220, objectFit: 'contain', border: `1px solid ${colors['blue-button']}` }}
                  loading="lazy"
                />
              </Box>
            )}
          </Box>
          <TextInput
            label="Nama Program Inovasi"
            placeholder="Masukkan nama program inovasi"
            defaultValue={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Box>
            <Text fz={"sm"} fw={"bold"}>Deskripsi</Text>
            <EditEditor
              value={formData.description}
              onChange={(htmlContent) => {
                setFormData((prev) => ({ ...prev, description: htmlContent }));
                stateProgramInovasi.update.form.description = htmlContent;
              }}
            />
          </Box>

          <TextInput
            label="Link Program Inovasi"
            placeholder="Masukkan link program inovasi (opsional)"
            defaultValue={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
          />

          <Group justify="right">
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

export default EditProgramInovasi;
