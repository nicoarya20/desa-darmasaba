/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import kontakDarurat from '@/app/admin/(dashboard)/_state/kesehatan/kontak-darurat/kontakDarurat';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { Box, Button, Group, Image, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';



function EditKontakDarurat() {
  const kontakDaruratState = useProxy(kontakDarurat)
  const router = useRouter();
  const params = useParams()

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: kontakDaruratState.edit.form.name || '',
    deskripsi: kontakDaruratState.edit.form.deskripsi || '',
    imageId: kontakDaruratState.edit.form.imageId || '',
  })

  useEffect(() => {
    const loadProgramKesehatan = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await kontakDaruratState.edit.load(id);
        if (data) {
          setFormData({
            name: data.name || '',
            deskripsi: data.deskripsi || '',
            imageId: data.imageId || '',
          });

          if (data?.image?.link) {
            setPreviewImage(data.image.link);
          }
        }
      } catch (error) {
        console.error("Error loading program kesehatan:", error);
        toast.error("Gagal memuat data program kesehatan");
      }
    };

    loadProgramKesehatan();
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
      kontakDaruratState.edit.form = {
        ...kontakDaruratState.edit.form,
        name: formData.name,
        deskripsi: formData.deskripsi,
        imageId: formData.imageId,
      };

      if (file) {
        const res = await ApiFetch.api.fileStorage.create.post({ file, name: file.name });
        const uploaded = res.data?.data;

        if (!uploaded?.id) {
          return toast.error("Gagal upload gambar");
        }

        kontakDaruratState.edit.form.imageId = uploaded.id;
      }

      await kontakDaruratState.edit.update();
      toast.success("Kontak darurat berhasil diperbarui!");
      router.push("/admin/kesehatan/kontak-darurat");
    } catch (error) {
      console.error("Error updating kontak darurat:", error);
      toast.error("Gagal memuat data kontak darurat");
    }
  }
  return (
    <Box>
      <Box mb={10}>
        <Button variant="subtle" onClick={() => router.back()}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>
      <Stack gap={"xs"}>
        <Paper bg={colors['white-1']} p="md" w={{ base: '100%', md: '50%' }}>
          <Stack gap="xs">
            <Title order={3}>Edit Kontak Darurat</Title>
            <TextInput
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              label={<Text fz="sm" fw="bold">Judul</Text>}
              placeholder="masukkan judul"
            />
            <Box>
              <Text fz="sm" fw="bold">Deskripsi</Text>
              <EditEditor
                value={formData.deskripsi}
                onChange={(val) => setFormData({ ...formData, deskripsi: val })}
              />
            </Box>
            <Box>
              <Text fz={"md"} fw={"bold"}>Gambar</Text>
              <Box>
                <Dropzone
                  onDrop={(files) => {
                    const selectedFile = files[0]; // Ambil file pertama
                    if (selectedFile) {
                      setFile(selectedFile);
                      setPreviewImage(URL.createObjectURL(selectedFile)); // Buat preview
                    }
                  }}
                  onReject={() => toast.error('File tidak valid.')}
                  maxSize={5 * 1024 ** 2} // Maks 5MB
                  accept={{ 'image/*': [] }}
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

                {/* Tampilkan preview kalau ada */}
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
                    />
                  </Box>
                )}
              </Box>
            </Box>
            <Button onClick={handleSubmit} bg={colors['blue-button']}>
              Simpan
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </Box >
  );
}

export default EditKontakDarurat;
