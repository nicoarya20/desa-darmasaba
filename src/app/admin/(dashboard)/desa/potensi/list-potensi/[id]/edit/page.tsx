/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import EditEditor from "@/app/admin/(dashboard)/_com/editEditor";
import potensiDesaState from "@/app/admin/(dashboard)/_state/desa/potensi";
import colors from "@/con/colors";
import ApiFetch from "@/lib/api-fetch";
import { Box, Button, Group, Image, Paper, Select, Stack, Text, TextInput, Title } from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import { IconArrowBack, IconPhoto, IconUpload, IconX } from "@tabler/icons-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useProxy } from "valtio/utils";



function EditPotensi() {
  const potensiState = useProxy(potensiDesaState.potensiDesa)
  const router = useRouter()
  const params = useParams()

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    deskripsi: '',
    kategoriId: '',
    content: '',
    imageId: ''
  });

  useEffect(() => {
    potensiDesaState.kategoriPotensi.findMany.load()
    const loadPotensi = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await potensiState.edit.load(id); // ambil data dari API
        if (data) {
          setFormData({
            name: data.name || '',
            deskripsi: data.deskripsi || '',
            kategoriId: data.kategoriId || '',
            content: data.content || '',
            imageId: data.imageId || '',
          });

          if (data?.image?.link) {
            setPreviewImage(data.image.link);
          }
        }
      } catch (error) {
        console.error("Error loading potensi:", error);
        toast.error("Gagal memuat data potensi");
      }
    };

    loadPotensi();
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
      // Sinkronkan semua data dari formData ke state global
      potensiState.edit.form = {
        ...potensiState.edit.form,
        name: formData.name,
        deskripsi: formData.deskripsi,
        kategoriId: formData.kategoriId,
        content: formData.content,
      };

      if (file) {
        const res = await ApiFetch.api.fileStorage.create.post({ file, name: file.name });
        const uploaded = res.data?.data;

        if (!uploaded?.id) {
          return toast.error("Gagal upload gambar");
        }

        potensiState.edit.form.imageId = uploaded.id;
      }

      await potensiState.edit.update();
      toast.success("Potensi berhasil diperbarui!");
      router.push("/admin/desa/potensi/list-potensi");
    } catch (error) {
      console.error("Error updating potensi:", error);
      toast.error("Terjadi kesalahan saat memperbarui potensi");
    }
  };

  return (
    <Box>
      <Box mb={10}>
        <Button variant="subtle" onClick={() => router.back()}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>
      <Paper bg={colors["white-1"]} p={"md"} w={{ base: "100%", md: "50%" }}>
        <Stack gap={"xs"}>
          <Title order={3}>Edit Potensi</Title>
          <TextInput
            value={formData.name}
            onChange={(e) => {
              const val = e.target.value;
              setFormData((prev) => ({ ...prev, name: val }));
              potensiState.edit.form.name = val;
            }}
            label={<Text fz={"sm"} fw={"bold"}>Judul</Text>}
            placeholder="masukkan judul"
          />
          <TextInput
            value={formData.deskripsi}
            onChange={(e) => {
              const val = e.target.value;
              setFormData((prev) => ({ ...prev, deskripsi: val }));
              potensiState.edit.form.deskripsi = val;
            }}
            label={<Text fz={"sm"} fw={"bold"}>Deskripsi</Text>}
            placeholder="masukkan deskripsi"
          />
          <Select
            value={formData.kategoriId}
            onChange={(val) => setFormData({ ...formData, kategoriId: val || "" })}
            label={<Text fw={"bold"} fz={"sm"}>Kategori</Text>}
            placeholder='Pilih kategori'
            data={
              potensiDesaState.kategoriPotensi.findMany.data?.map((v) => ({
                value: v.id,
                label: v.nama
              })) || []
            }
            clearable
            searchable
            required
            error={!formData.kategoriId ? "Pilih kategori" : undefined}
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
            <Text fz={"sm"} fw={"bold"}>Konten</Text>
            <EditEditor
              value={formData.content}
              onChange={(htmlContent) => {
                setFormData((prev) => ({ ...prev, content: htmlContent }));
                potensiState.edit.form.content = htmlContent;
              }}
            />
          </Box>
          <Button bg={colors['blue-button']} onClick={handleSubmit}>Edit Potensi</Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditPotensi;