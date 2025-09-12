/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import sdgsDesa from "@/app/admin/(dashboard)/_state/landing-page/sdgs-desa";
import colors from "@/con/colors";
import ApiFetch from "@/lib/api-fetch";
import {
  Box,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
  Image
} from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import { IconArrowBack, IconDeviceFloppy, IconPhoto, IconUpload, IconX } from "@tabler/icons-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useProxy } from "valtio/utils";

function EditKolaborasiInovasi() {
  const sdgsState = useProxy(sdgsDesa);
  const router = useRouter();
  const params = useParams();

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: sdgsState.edit.form.name || '',
    jumlah: sdgsState.edit.form.jumlah || '',
    imageId: sdgsState.edit.form.imageId || ''
  });

  // Load sdgs desa by id saat pertama kali
  useEffect(() => {
    const loadKolaborasi = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await sdgsState.edit.load(id); // akses langsung, bukan dari proxy
        if (data) {
          setFormData({
            name: data.name || '',
            jumlah: data.jumlah || '',
            imageId: data.imageId || '',
          });
          if (data.image) {
            if (data?.image?.link) {
              setPreviewImage(data.image.link);
            }
          }
        }
      } catch (error) {
        console.error("Error loading sdgs desa:", error);
        toast.error("Gagal memuat data sdgs desa");
      }
    };

    loadKolaborasi();
  }, [params?.id]);

  const handleSubmit = async () => {

    try {
      // edit global state with form data
      sdgsState.edit.form = {
        ...sdgsState.edit.form,
        name: formData.name,
        jumlah: formData.jumlah,
        imageId: formData.imageId // Keep existing imageId if not changed
      };

      // Jika ada file baru, upload
      if (file) {
        const res = await ApiFetch.api.fileStorage.create.post({ file, name: file.name });
        const uploaded = res.data?.data;

        if (!uploaded?.id) {
          return toast.error("Gagal upload gambar");
        }

        // edit imageId in global state
        sdgsState.edit.form.imageId = uploaded.id;
      }

      await sdgsState.edit.update();
      toast.success("sdgs desa berhasil diperbarui!");
      router.push("/admin/landing-page/sdgs-desa");
    } catch (error) {
      console.error("Error updating sdgs desa:", error);
      toast.error("Terjadi kesalahan saat memperbarui sdgs desa");
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
          Edit Sdgs Desa
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
              Gambar Sdgs Desa
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
                />
              </Box>
            )}
          </Box>

          <TextInput
            label="Nama Sdgs Desa"
            placeholder="Masukkan nama Sdgs Desa"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <TextInput
            label="Jumlah"
            placeholder="Masukkan jumlah"
            value={formData.jumlah}
            onChange={(e) => setFormData({ ...formData, jumlah: e.target.value })}
            required
            type="number"
          />

          <Group justify="right">
            <Button
              onClick={handleSubmit}
              leftSection={<IconDeviceFloppy size={20} />}
              loading={sdgsState.edit.loading}
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

export default EditKolaborasiInovasi;
