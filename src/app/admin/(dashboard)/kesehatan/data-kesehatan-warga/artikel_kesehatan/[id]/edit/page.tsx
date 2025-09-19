/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import artikelKesehatanState from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/artikelKesehatan';
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
  Tooltip
} from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconArrowBack, IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

interface ArtikelKesehatanFormBase {
  title: string;
  content: string;
  imageId: string;
  introduction: { content: string };
  symptom: { title: string; content: string };
  prevention: { title: string; content: string };
  firstAid: { title: string; content: string };
  mythVsFact: { title: string; mitos: string; fakta: string };
  doctorSign: { content: string };
}

function EditArtikelKesehatan() {
  const stateArtikelKesehatan = useProxy(artikelKesehatanState);
  const router = useRouter();
  const params = useParams();

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<ArtikelKesehatanFormBase>({
    title: stateArtikelKesehatan.edit.form.title,
    content: stateArtikelKesehatan.edit.form.content,
    imageId: stateArtikelKesehatan.edit.form.imageId,
    introduction: { content: stateArtikelKesehatan.edit.form.introduction?.content },
    symptom: {
      title: stateArtikelKesehatan.edit.form.symptom?.title,
      content: stateArtikelKesehatan.edit.form.symptom?.content
    },
    prevention: {
      title: stateArtikelKesehatan.edit.form.prevention?.title,
      content: stateArtikelKesehatan.edit.form.prevention?.content
    },
    firstAid: {
      title: stateArtikelKesehatan.edit.form.firstAid?.title,
      content: stateArtikelKesehatan.edit.form.firstAid?.content
    },
    mythVsFact: {
      title: stateArtikelKesehatan.edit.form.mythVsFact?.title,
      mitos: stateArtikelKesehatan.edit.form.mythVsFact?.mitos,
      fakta: stateArtikelKesehatan.edit.form.mythVsFact?.fakta
    },
    doctorSign: {
      content: stateArtikelKesehatan.edit.form.doctorSign?.content
    }
  });

  useEffect(() => {
    const loadArtikelKesehatan = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        await stateArtikelKesehatan.edit.load(id);
        const { form } = stateArtikelKesehatan.edit;
        if (form) {
          setFormData({
            title: form.title,
            content: form.content,
            introduction: { content: form.introduction?.content || '' },
            imageId: form.imageId,
            symptom: {
              title: form.symptom?.title || '',
              content: form.symptom?.content || ''
            },
            prevention: {
              title: form.prevention?.title || '',
              content: form.prevention?.content || ''
            },
            firstAid: {
              title: form.firstAid?.title || '',
              content: form.firstAid?.content || ''
            },
            mythVsFact: {
              title: form.mythVsFact?.title || '',
              mitos: form.mythVsFact?.mitos || '',
              fakta: form.mythVsFact?.fakta || ''
            },
            doctorSign: {
              content: form.doctorSign?.content || ''
            }
          });

          if (form?.imageId) {
            setPreviewImage(`${process.env.NEXT_PUBLIC_API_URL}/file/${form.imageId}`);
          }          
        }
      } catch (error) {
        console.error("Error loading artikel kesehatan:", error);
        toast.error("Gagal memuat data artikel kesehatan");
      }
    };
    loadArtikelKesehatan();
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
      stateArtikelKesehatan.edit.form = { ...formData };
      if (file) {
        const res = await ApiFetch.api.fileStorage.create.post({
          file,
          name: file.name,
        });
        const uploaded = res.data?.data;

        if (!uploaded?.id) {
          return toast.error("Gagal upload gambar");
        }

        stateArtikelKesehatan.edit.form.imageId = uploaded.id;
      }

      const success = await stateArtikelKesehatan.edit.submit();
      if (success) {
        toast.success("Artikel kesehatan berhasil diperbarui!");
        router.push("/admin/kesehatan/data-kesehatan-warga/artikel_kesehatan");
      }
    } catch (error) {
      console.error("Error updating artikel kesehatan:", error);
      toast.error(error instanceof Error ? error.message : "Gagal memperbarui data artikel kesehatan");
    }
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      {/* Header */}
      <Group mb="md">
        <Tooltip label="Kembali ke halaman sebelumnya" withArrow>
          <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
            <IconArrowBack color={colors['blue-button']} size={24} />
          </Button>
        </Tooltip>
        <Title order={4} ml="sm" c="dark">
          Edit Artikel Kesehatan
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
            label="Judul"
            placeholder="Masukkan judul artikel"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required
          />
          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Gambar Berita
            </Text>
            <Dropzone
              onDrop={(files) => {
                const selectedFile = files[0];
                if (selectedFile) {
                  setFile(selectedFile);
                  setPreviewImage(URL.createObjectURL(selectedFile));
                }
              }}
              onReject={() => toast.error("File tidak valid, gunakan format gambar")}
              maxSize={5 * 1024 ** 2}
              accept={{ "image/*": [] }}
              radius="md"
              p="xl"
            >
              <Group justify="center" gap="xl" mih={180}>
                <Dropzone.Accept>
                  <IconUpload size={48} color={colors["blue-button"]} stroke={1.5} />
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
              <Box mt="sm" style={{ display: "flex", justifyContent: "center" }}>
                <Image
                  src={previewImage}
                  alt="Preview Gambar"
                  radius="md"
                  style={{
                    maxHeight: 220,
                    objectFit: "contain",
                    border: `1px solid ${colors["blue-button"]}`,
                  }}
                  loading="lazy"
                />
              </Box>
            )}
          </Box>
          <TextInput
            label="Deskripsi"
            placeholder="Masukkan deskripsi artikel"
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            required
          />
          <TextInput
            label="Pendahuluan"
            placeholder="Masukkan pendahuluan"
            value={formData.introduction.content}
            onChange={(e) =>
              setFormData(prev => ({
                ...prev,
                introduction: { ...prev.introduction, content: e.target.value }
              }))
            }
          />

          {/* Gejala */}
          <Box>
            <Text fw="bold">Gejala</Text>
            <Stack gap="xs">
              <TextInput
                label="Judul Gejala"
                placeholder="Masukkan judul gejala"
                value={formData.symptom.title}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    symptom: { ...prev.symptom, title: e.target.value }
                  }))
                }
              />
              <EditEditor
                value={formData.symptom.content}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    symptom: { ...prev.symptom, content: e }
                  }))
                }
              />
            </Stack>
          </Box>

          {/* Pencegahan */}
          <Box>
            <Text fw="bold">Pencegahan</Text>
            <TextInput
              label="Judul"
              value={formData.prevention.title}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  prevention: { ...prev.prevention, title: e.target.value }
                }))
              }
            />
            <EditEditor
              value={formData.prevention.content}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  prevention: { ...prev.prevention, content: e }
                }))
              }
            />
          </Box>

          {/* Pertolongan Pertama */}
          <Box>
            <Text fw="bold">Pertolongan Pertama</Text>
            <TextInput
              label="Judul"
              value={formData.firstAid.title}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  firstAid: { ...prev.firstAid, title: e.target.value }
                }))
              }
            />
            <EditEditor
              value={formData.firstAid.content}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  firstAid: { ...prev.firstAid, content: e }
                }))
              }
            />
          </Box>

          {/* Mitos vs Fakta */}
          <Box>
            <Text fw="bold">Mitos vs Fakta</Text>
            <TextInput
              label="Judul"
              value={formData.mythVsFact.title}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  mythVsFact: { ...prev.mythVsFact, title: e.target.value }
                }))
              }
            />
            <Text fw="500">Mitos</Text>
            <EditEditor
              value={formData.mythVsFact.mitos}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  mythVsFact: { ...prev.mythVsFact, mitos: e }
                }))
              }
            />
            <Text fw="500">Fakta</Text>
            <EditEditor
              value={formData.mythVsFact.fakta}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  mythVsFact: { ...prev.mythVsFact, fakta: e }
                }))
              }
            />
          </Box>

          {/* Kapan harus ke dokter */}
          <Box>
            <Text fw="bold">Kapan Harus Ke Dokter</Text>
            <EditEditor
              value={formData.doctorSign.content}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  doctorSign: { ...prev.doctorSign, content: e }
                }))
              }
            />
          </Box>

          {/* Save button */}
          <Group justify="right">
            <Button
              onClick={handleSubmit}
              radius="md"
              size="md"
              style={{
                background: `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
                color: '#fff',
                boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)'
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

export default EditArtikelKesehatan;
