'use client';
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import kontakDarurat from '@/app/admin/(dashboard)/_state/kesehatan/kontak-darurat/kontakDarurat';
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
  Title
} from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function EditKontakDarurat() {
  const kontakDaruratState = useProxy(kontakDarurat);
  const router = useRouter();
  const params = useParams();

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    deskripsi: '',
    imageId: '',
    whatsapp: '',
  });
  const [loading, setLoading] = useState(true);

  // Load data sekali saat mount
  useEffect(() => {
    const loadKontakDarurat = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await kontakDaruratState.edit.load(id);
        if (data) {
          setFormData({
            name: data.name || '',
            deskripsi: data.deskripsi || '',
            imageId: data.imageId || '',
            whatsapp: data.whatsapp || '',
          });
          if (data?.image?.link) setPreviewImage(data.image.link);
        }
      } catch (error) {
        console.error("Error loading kontak darurat:", error);
        toast.error("Gagal memuat data kontak darurat");
      } finally {
        setLoading(false);
      }
    };

    loadKontakDarurat();
  }, [params?.id, kontakDaruratState.edit]);

  const handleSubmit = async () => {
    try {
      let imageId = formData.imageId;

      // Upload file baru jika ada
      if (file) {
        const res = await ApiFetch.api.fileStorage.create.post({ file, name: file.name });
        const uploaded = res.data?.data;
        if (!uploaded?.id) return toast.error("Gagal upload gambar");
        imageId = uploaded.id;
      }

      // Update global state sekaligus submit
      kontakDaruratState.edit.form = {
        ...kontakDaruratState.edit.form,
        ...formData,
        imageId,
      };

      await kontakDaruratState.edit.update();
      toast.success("Kontak darurat berhasil diperbarui!");
      router.push("/admin/kesehatan/kontak-darurat");
    } catch (error) {
      console.error("Error updating kontak darurat:", error);
      toast.error("Terjadi kesalahan saat memperbarui kontak darurat");
    }
  };

  if (loading) return <Text>Loading...</Text>;

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Edit Kontak Darurat
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
          {/* Controlled Input */}
          <TextInput
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            label="Judul"
            placeholder="Masukkan judul"
            required
          />

          <TextInput
            value={formData.whatsapp}
            onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
            label="Whatsapp"
            placeholder="Masukkan whatsapp"
            required
          />

          <Box>
            <Text fz="sm" fw="bold">Deskripsi</Text>
            <EditEditor
              value={formData.deskripsi}
              onChange={(val) => setFormData(prev => ({ ...prev, deskripsi: val }))}
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
              accept={{ 'image/*': [] }}
            >
              <Group justify="center" gap="xl" mih={200} style={{ pointerEvents: 'none' }}>
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
                  <Text size="lg" fw={500}>Drag gambar ke sini atau klik untuk pilih file</Text>
                  <Text size="sm" c="dimmed" mt={5}>Maksimal 5MB dan format gambar</Text>
                </div>
              </Group>
            </Dropzone>

            {previewImage && (
              <Box mt="sm">
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
              </Box>
            )}
          </Box>

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

export default EditKontakDarurat;
