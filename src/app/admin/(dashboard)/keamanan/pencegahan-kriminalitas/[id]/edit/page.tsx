/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import pencegahanKriminalitasState from '@/app/admin/(dashboard)/_state/keamanan/pencegahan-kriminalitas';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';


function EditPencegahanKriminalitas() {
  const router = useRouter();
  const params = useParams()
  const kriminalitasState = useProxy(pencegahanKriminalitasState)
  const [formData, setFormData] = useState({
    pencegahanKriminalitas: {
      programKeamanan: {
        nama: kriminalitasState.update.form.pencegahanKriminalitas.programKeamanan.nama,
        deskripsi: kriminalitasState.update.form.pencegahanKriminalitas.programKeamanan.deskripsi,
        slug: kriminalitasState.update.form.pencegahanKriminalitas.programKeamanan.slug,
      },
      tipsKeamanan: {
        judul: kriminalitasState.update.form.pencegahanKriminalitas.tipsKeamanan.judul,
        konten: kriminalitasState.update.form.pencegahanKriminalitas.tipsKeamanan.konten,
        slug: kriminalitasState.update.form.pencegahanKriminalitas.tipsKeamanan.slug,
      },
      videoKeamanan: {
        judul: kriminalitasState.update.form.pencegahanKriminalitas.videoKeamanan.judul,
        deskripsi: kriminalitasState.update.form.pencegahanKriminalitas.videoKeamanan.deskripsi,
        videoUrl: kriminalitasState.update.form.pencegahanKriminalitas.videoKeamanan.videoUrl,
        slug: kriminalitasState.update.form.pencegahanKriminalitas.videoKeamanan.slug,
      },
    },
  })

  useEffect(() => {
    const loadKriminalitas = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await kriminalitasState.update.load(id);
        if (data && data.pencegahanKriminalitas) {
          const { programKeamanan, tipsKeamanan, videoKeamanan } = data.pencegahanKriminalitas;
        
          setFormData({
            pencegahanKriminalitas: {
              programKeamanan: {
                nama: programKeamanan?.nama || "",
                deskripsi: programKeamanan?.deskripsi || "",
                slug: programKeamanan?.slug || "",
              },
              tipsKeamanan: {
                judul: tipsKeamanan?.judul || "",
                konten: tipsKeamanan?.konten || "",
                slug: tipsKeamanan?.slug || "",
              },
              videoKeamanan: {
                judul: videoKeamanan?.judul || "",
                deskripsi: videoKeamanan?.deskripsi || "",
                videoUrl: videoKeamanan?.videoUrl || "",
                slug: videoKeamanan?.slug || "",
              },
            },
          });
        }
        
      } catch (error) {
        console.error("Error loading pencegahan kriminalitas:", error);
        toast.error("Gagal memuat data pencegahan kriminalitas");
      }
    }

    loadKriminalitas();
  }, [params.id]);

  const handleSubmit = async () => {
    try {
      kriminalitasState.update.form = {
        ...kriminalitasState.update.form,
        pencegahanKriminalitas: {
          programKeamanan: {
            nama: formData.pencegahanKriminalitas.programKeamanan.nama,
            deskripsi: formData.pencegahanKriminalitas.programKeamanan.deskripsi,
            slug: formData.pencegahanKriminalitas.programKeamanan.slug,
          },
          tipsKeamanan: {
            judul: formData.pencegahanKriminalitas.tipsKeamanan.judul,
            konten: formData.pencegahanKriminalitas.tipsKeamanan.konten,
            slug: formData.pencegahanKriminalitas.tipsKeamanan.slug,
          },
          videoKeamanan: {
            judul: formData.pencegahanKriminalitas.videoKeamanan.judul,
            deskripsi: formData.pencegahanKriminalitas.videoKeamanan.deskripsi,
            videoUrl: formData.pencegahanKriminalitas.videoKeamanan.videoUrl,
            slug: formData.pencegahanKriminalitas.videoKeamanan.slug,
          },
        },
      }
      await kriminalitasState.update.update();
      toast.success("Pencegahan Kriminalitas berhasil diperbarui!");
      router.push("/admin/keamanan/pencegahan-kriminalitas");
    } catch (error) {
      console.error("Error updating pencegahan kriminalitas:", error);
      toast.error("Gagal memuat data pencegahan kriminalitas");
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
          <Title order={4}>Edit Pencegahan Kriminalitas</Title>
          <TextInput
            value={formData.pencegahanKriminalitas.programKeamanan.nama}
            onChange={(val) => {
              formData.pencegahanKriminalitas.programKeamanan.nama = val.target.value;
            }}
            label={<Text fw={"bold"} fz={"sm"}>Judul Program Keamanan</Text>}
            placeholder='Masukkan judul Program Keamanan'
          />
          <TextInput
            value={formData.pencegahanKriminalitas.programKeamanan.slug}
            onChange={(val) => {
              formData.pencegahanKriminalitas.programKeamanan.slug = val.target.value;
            }}
            label={<Text fw={"bold"} fz={"sm"}>Slug Program Keamanan</Text>}
            placeholder='Masukkan slug Program Keamanan'
          />
          <Box>
            <Text fw={"bold"} fz={"sm"}>Deskripsi Program Keamanan</Text>
            <EditEditor
              value={formData.pencegahanKriminalitas.programKeamanan.deskripsi}
              onChange={(val) => {
                formData.pencegahanKriminalitas.programKeamanan.deskripsi = val;
              }}
            />
          </Box>
          <TextInput
            value={formData.pencegahanKriminalitas.tipsKeamanan.judul}
            onChange={(val) => {
              formData.pencegahanKriminalitas.tipsKeamanan.judul = val.target.value;
            }}
            label={<Text fw={"bold"} fz={"sm"}>Judul Tips Keamanan</Text>}
            placeholder='Masukkan judul Tips Keamanan'
          />
          <TextInput
            value={formData.pencegahanKriminalitas.tipsKeamanan.slug}
            onChange={(val) => {
              formData.pencegahanKriminalitas.tipsKeamanan.slug = val.target.value;
            }}
            label={<Text fw={"bold"} fz={"sm"}>Slug Tips Keamanan</Text>}
            placeholder='Masukkan slug Tips Keamanan'
          />
          <Box>
            <Text fw={"bold"} fz={"sm"}>Deskripsi Tips Keamanan</Text>
            <EditEditor
              value={formData.pencegahanKriminalitas.tipsKeamanan.konten}
              onChange={(val) => {
                formData.pencegahanKriminalitas.tipsKeamanan.konten = val;
              }}
            />
          </Box>
          <TextInput
            value={formData.pencegahanKriminalitas.videoKeamanan.judul}
            onChange={(val) => {
              formData.pencegahanKriminalitas.videoKeamanan.judul = val.target.value;
            }}
            label={<Text fw={"bold"} fz={"sm"}>Judul Video Keamanan</Text>}
            placeholder='Masukkan judul Video Keamanan'
          />
          <TextInput
            value={formData.pencegahanKriminalitas.videoKeamanan.slug}
            onChange={(val) => {
              formData.pencegahanKriminalitas.videoKeamanan.slug = val.target.value;
            }}
            label={<Text fw={"bold"} fz={"sm"}>Slug Video Keamanan</Text>}
            placeholder='Masukkan slug Video Keamanan'
          />
          <Box>
            <Text fw={"bold"} fz={"sm"}>Deskripsi Tips Keamanan</Text>
            <EditEditor
              value={formData.pencegahanKriminalitas.videoKeamanan.deskripsi}
              onChange={(val) => {
                formData.pencegahanKriminalitas.videoKeamanan.deskripsi = val;
              }}
            />
          </Box>
          <TextInput
            value={formData.pencegahanKriminalitas.videoKeamanan.videoUrl}
            onChange={(val) => {
              formData.pencegahanKriminalitas.videoKeamanan.videoUrl = val.target.value;
            }}
            label={<Text fw={"bold"} fz={"sm"}>Video URL</Text>}
            placeholder='Masukkan video URL'
          />
          <Group>
            <Button bg={colors['blue-button']} onClick={handleSubmit}>Submit</Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditPencegahanKriminalitas;
