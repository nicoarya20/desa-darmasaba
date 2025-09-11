/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import kontakDarurat from '@/app/admin/(dashboard)/_state/keamanan/kontak-darurat-keamanan';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { Box, Button, Group, Image, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';


function EditKontakItem() {
  const router = useRouter();
  const kontakState = useProxy(kontakDarurat.kontakDaruratItem)
  const params = useParams()

  const [previewUtama, setPreviewUtama] = useState<string | null>(null);
  const [fileUtama, setFileUtama] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: kontakState.update.form.nama || '',
    imageId: kontakState.update.form.imageId || '',
    nomorTelepon: kontakState.update.form.nomorTelepon || '',
  })

  useEffect(() => {
    const loadKontakDarurat = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await kontakState.update.load(id);
        if (data) {
          setFormData({
            name: data.nama || '',
            imageId: data.imageId || '',
            nomorTelepon: data.nomorTelepon || '',
          });

          if (data?.image?.link) {
            setPreviewUtama(data.image.link);
          }
        }
      } catch (error) {
        console.error("Error loading kontak darurat:", error);
        toast.error("Gagal memuat data kontak darurat");
      }
    };

    loadKontakDarurat();
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
      kontakState.update.form = {
        ...kontakState.update.form,
        nama: formData.name,
        imageId: formData.imageId,
        nomorTelepon: formData.nomorTelepon,
      }

      if (fileUtama) {
        const res = await ApiFetch.api.fileStorage.create.post({ file: fileUtama, name: fileUtama.name });
        const uploaded = res.data?.data;

        if (!uploaded?.id) {
          return toast.error("Gagal upload gambar");
        }

        kontakState.update.form.imageId = uploaded.id;
      }

      await kontakState.update.update();
      toast.success("Kontak Darurat berhasil diperbarui!");
      router.push("/admin/keamanan/kontak-darurat/kontak-darurat-item");
    } catch (error) {
      console.error("Error updating kontak darurat:", error);
      toast.error("Terjadi kesalahan saat memperbarui kontak darurat");
    }
  }

  return (
    <Box>
      <Box mb={10}>
        <Button onClick={() => router.back()} variant='subtle' color={'blue'}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>

      <Paper w={{ base: '100%', md: '50%' }} bg={colors['white-1']} p={'md'}>
        <Stack gap={"xs"}>
          <Title order={4}>Edit Kontak Darurat</Title>
          <TextInput
            value={formData.name}
            onChange={(val) => {
              setFormData({ ...formData, name: val.target.value });
            }}
            label={<Text fw={"bold"} fz={"sm"}>Nama Kontak</Text>}
            placeholder='Masukkan nama Kontak'
          />
          <TextInput
            value={formData.nomorTelepon}
            onChange={(val) => {
              setFormData({ ...formData, nomorTelepon: val.target.value });
            }}
            label={<Text fw={"bold"} fz={"sm"}>Nomor Telepon</Text>}
            placeholder='Masukkan nomor telepon'
          />
          <Box>
            <Text fz={"md"} fw={"bold"}>Gambar</Text>
            <Box>
              <Dropzone
                onDrop={(files) => {
                  const selectedFile = files[0]; // Ambil file pertama
                  if (selectedFile) {
                    setFileUtama(selectedFile);
                    setPreviewUtama(URL.createObjectURL(selectedFile)); // Buat preview
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
              {previewUtama && (
                <Box mt="sm">
                  <Image
                    src={previewUtama}
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
          <Group>
            <Button bg={colors['blue-button']} onClick={handleSubmit}>Submit</Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditKontakItem;
