'use client'
/* eslint-disable react-hooks/exhaustive-deps */
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import stateProfileDesa from '@/app/admin/(dashboard)/_state/desa/profile';
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { Box, Button, Center, Group, Image, Paper, Stack, Text, Title } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function ProfilePerbekel() {
  const perbekelState = useProxy(stateProfileDesa.profilPerbekel)
  const router = useRouter()
  const params = useParams()
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const id = params?.id as string;
      if (!id) {
        toast.error("ID tidak valid");
        router.push("/admin/desa/profile/profile-perbekel");
        return;
      }

      const data = await perbekelState.findUnique.load(id);
      if (data) {
        perbekelState.edit.initialize(data);
      }
      if (data?.image?.link) {
        setPreviewImage(data.image.link);
      }
    };

    loadData();

    return () => {
      perbekelState.edit.reset();
      perbekelState.findUnique.reset(); // opsional: reset juga data lama
    };
  }, [params?.id, router]);


  const handleSubmit = async () => {
    if (isSubmitting || !perbekelState.edit.form.biodata.trim()) {
      toast.error("Biodata wajib diisi");
      return;
    }
    setIsSubmitting(true)
    try {
      if (file) {
        const uploadResponse = await ApiFetch.api.fileStorage.create.post({ file, name: file.name });
        const uploaded = uploadResponse.data?.data;

        if (!uploaded?.id) {
          toast.error("Gagal upload gambar");
          return;
        }

        perbekelState.edit.form.imageId = uploaded.id;
      }
      const success = await perbekelState.edit.submit()
      if (success) {
        toast.success("Data berhasil disimpan");
        router.push("/admin/desa/profile/profile-perbekel");
      }
    } catch (error) {
      console.error("Error update sejarah desa:", error);
      toast.error("Terjadi kesalahan saat update sejarah desa");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleBack = () => {
    router.back()
  }

  if (
    perbekelState.findUnique.loading ||
    !perbekelState.findUnique.data ||
    perbekelState.edit.loading
  ) {
    return (
      <Box>
        <Center h={400}>
          <Text>Memuat data...</Text>
        </Center>
      </Box>
    );
  }

  return (
    <Box py={10}>
      <Stack gap={'xs'}>
        <Group>
          <Button variant="subtle" onClick={handleBack}>
            <IconArrowBack color={colors['blue-button']} size={20} />
          </Button>
        </Group>
        <Paper bg={colors['white-1']} p={'xs'} w={{ base: '100%', md: '50%' }}>
          <Stack gap={'xs'}>
            <Box>
              <Box>
                <Stack>
                  <Title order={3}>Edit Profil Perbekel</Title>
                  <Text fz={"md"} fw={"bold"}>Biodata</Text>
                  <EditEditor
                    value={perbekelState.edit.form.biodata}
                    onChange={(val) => perbekelState.edit.form.biodata = val}
                  />
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

                  <Box>
                    <Text fz={"md"} fw={"bold"}>Pengalaman</Text>
                    <EditEditor
                      value={perbekelState.edit.form.pengalaman}
                      onChange={(val) => perbekelState.edit.form.pengalaman = val}
                    />
                  </Box>
                  <Box>
                    <Text fz={"md"} fw={"bold"}>Pengalaman Organisasi</Text>
                    <EditEditor
                      value={perbekelState.edit.form.pengalamanOrganisasi}
                      onChange={(val) => perbekelState.edit.form.pengalamanOrganisasi = val}
                    />
                  </Box>
                  <Box>
                    <Text fz={"md"} fw={"bold"}>Program Unggulan</Text>
                    <EditEditor
                      value={perbekelState.edit.form.programUnggulan}
                      onChange={(val) => perbekelState.edit.form.programUnggulan = val}
                    />
                  </Box>
                  <Group>
                    <Button
                      onClick={handleSubmit}
                      bg={colors['blue-button']}
                    >
                      Submit
                    </Button>
                  </Group>
                </Stack>
              </Box>
            </Box>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}

export default ProfilePerbekel;
