/* eslint-disable react-hooks/exhaustive-deps */
"use client";


import apbdes from "@/app/admin/(dashboard)/_state/landing-page/apbdes";
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
  Title
} from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import { IconArrowBack, IconFile, IconImageInPicture, IconUpload, IconX } from "@tabler/icons-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useProxy } from "valtio/utils";

function EditAPBDes() {
  const apbdesState = useProxy(apbdes);
  const router = useRouter();
  const params = useParams();

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: apbdesState.edit.form.name || '',
    jumlah: apbdesState.edit.form.jumlah || '',
    imageId: apbdesState.edit.form.imageId || '',
    fileId: apbdesState.edit.form.fileId || ''
  });

  // Load sdgs desa by id saat pertama kali
  useEffect(() => {
    const loadKolaborasi = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await apbdesState.edit.load(id); // akses langsung, bukan dari proxy
        if (data) {
          setFormData({
            name: data.name || '',
            jumlah: data.jumlah || '',
            imageId: data.imageId || '',
            fileId: data.fileId || ''
          });
          if (data.image) {
            if (data?.image?.link) {
              setPreviewImage(data.image.link);
            }
          }
          if (data.file) {
            if (data?.file?.link) {
              setPreviewDoc(data.file.link);
            }
          }
        }
      } catch (error) {
        console.error("Error loading apbdes:", error);
        toast.error("Gagal memuat data apbdes");
      }
    };

    loadKolaborasi();
  }, [params?.id]);

  const handleSubmit = async () => {

    try {
      // edit global state with form data
      apbdesState.edit.form = {
        ...apbdesState.edit.form,
        name: formData.name,
        jumlah: formData.jumlah,
        imageId: formData.imageId // Keep existing imageId if not changed
      };

      // Jika ada file image baru, upload
      if (imageFile) {
        const res = await ApiFetch.api.fileStorage.create.post({ file: imageFile, name: imageFile.name });
        const uploaded = res.data?.data;

        if (!uploaded?.id) {
          return toast.error("Gagal upload gambar");
        }

        // edit imageId in global state
        apbdesState.edit.form.imageId = uploaded.id;
      }

      // Jika ada file doc baru, upload
      if (docFile) {
        const res = await ApiFetch.api.fileStorage.create.post({ file: docFile, name: docFile.name });
        const uploaded = res.data?.data;

        if (!uploaded?.id) {
          return toast.error("Gagal upload doc");
        }

        // edit fileId in global state
        apbdesState.edit.form.fileId = uploaded.id;
      }

      await apbdesState.edit.update();
      toast.success("apbdes berhasil diperbarui!");
      router.push("/admin/landing-page/APBDes");
    } catch (error) {
      console.error("Error updating apbdes:", error);
      toast.error("Terjadi kesalahan saat memperbarui apbdes");
    }
  };

  return (
    <Box>
      <Box mb={10}>
        <Button variant="subtle" onClick={() => router.back()}>
          <IconArrowBack color={colors["blue-button"]} size={30} />
        </Button>
      </Box>
      <Paper bg={"white"} p={"md"} w={{ base: "100%", md: "50%" }}>
        <Stack gap={"xs"}>
          <Title order={3}>Edit APBDes</Title>
          <TextInput
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            label={<Text fz={"sm"} fw={"bold"}>Nama</Text>}
            placeholder="masukkan nama"
          />

          <TextInput
            value={formData.jumlah}
            onChange={(e) => setFormData({ ...formData, jumlah: e.target.value })}
            label={<Text fz={"sm"} fw={"bold"}>Jumlah</Text>}
            placeholder="masukkan jumlah"
          />
          <Box>
            <Text fz={"md"} fw={"bold"}>File Image</Text>
            <Box>
              <Dropzone
                onDrop={(files) => {
                  const selectedFile = files[0]; // Ambil file pertama
                  if (selectedFile) {
                    setImageFile(selectedFile);
                    setPreviewImage(URL.createObjectURL(selectedFile)); // Buat preview
                  }
                }}
                onReject={() => toast.error('File tidak valid.')}
                maxSize={5 * 1024 ** 2} // Maks 5MB
                accept={{
                  'application/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.svg'],
                }}
              >
                <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: 'none' }}>
                  <Dropzone.Accept>
                    <IconUpload size={52} color="var(--mantine-color-blue-6)" stroke={1.5} />
                  </Dropzone.Accept>
                  <Dropzone.Reject>
                    <IconX size={52} color="var(--mantine-color-red-6)" stroke={1.5} />
                  </Dropzone.Reject>
                  <Dropzone.Idle>
                    <IconImageInPicture size={52} color="var(--mantine-color-dimmed)" stroke={1.5} />
                  </Dropzone.Idle>

                  <div>
                    <Text size="xl" inline>
                      Drag file ke sini atau klik untuk pilih image
                    </Text>
                    <Text size="sm" c="dimmed" inline mt={7}>
                      Maksimal 5MB dan harus format image
                    </Text>
                  </div>
                </Group>
              </Dropzone>
              <Box>
                <Text fw={"bold"} fz={"lg"}>Image</Text>
                {previewImage ? (
                  <iframe
                    src={previewImage}
                    width="100%"
                    height="500px"
                    style={{ border: "1px solid #ccc", borderRadius: "8px" }}
                  />
                ) : (
                  <Text>Tidak ada image tersedia</Text>
                )}
              </Box>
            </Box>
          </Box>
          <Box>
            <Text fz={"md"} fw={"bold"}>File Doc</Text>
            <Box>
              <Dropzone
                onDrop={(files) => {
                  const selectedFile = files[0]; // Ambil file pertama
                  if (selectedFile) {
                    setDocFile(selectedFile);
                    setPreviewDoc(URL.createObjectURL(selectedFile)); // Buat preview
                  }
                }}
                onReject={() => toast.error('File tidak valid.')}
                maxSize={5 * 1024 ** 2} // Maks 5MB
                accept={{
                  'application/*': ['.pdf', '.doc', '.docx'],
                }}
              >
                <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: 'none' }}>
                  <Dropzone.Accept>
                    <IconUpload size={52} color="var(--mantine-color-blue-6)" stroke={1.5} />
                  </Dropzone.Accept>
                  <Dropzone.Reject>
                    <IconX size={52} color="var(--mantine-color-red-6)" stroke={1.5} />
                  </Dropzone.Reject>
                  <Dropzone.Idle>
                    <IconFile size={52} color="var(--mantine-color-dimmed)" stroke={1.5} />
                  </Dropzone.Idle>

                  <div>
                    <Text size="xl" inline>
                      Drag file ke sini atau klik untuk pilih file
                    </Text>
                    <Text size="sm" c="dimmed" inline mt={7}>
                      Maksimal 5MB dan harus format doc
                    </Text>
                  </div>
                </Group>
              </Dropzone>
              <Box>
                <Text fw={"bold"} fz={"lg"}>Dokumen</Text>
                {previewDoc ? (
                  <iframe
                    src={previewDoc}
                    width="100%"
                    height="500px"
                    style={{ border: "1px solid #ccc", borderRadius: "8px" }}
                  />
                ) : (
                  <Text>Tidak ada doc tersedia</Text>
                )}
              </Box>
            </Box>
          </Box>
          <Button onClick={handleSubmit}>Simpan</Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditAPBDes;
