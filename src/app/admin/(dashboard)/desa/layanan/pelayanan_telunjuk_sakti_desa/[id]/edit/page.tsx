'use client'
/* eslint-disable react-hooks/exhaustive-deps */
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import stateLayananDesa from '@/app/admin/(dashboard)/_state/desa/layananDesa';
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function EditPelayananTelunjukSakti() {
  const stateTelunjukDesa = useProxy(stateLayananDesa.pelayananTelunjukSaktiDesa)
  const router = useRouter()
  const params = useParams()
  const [formData, setFormData] = useState({
    name: stateTelunjukDesa.edit.form.name,
    deskripsi: stateTelunjukDesa.edit.form.deskripsi,
    link: stateTelunjukDesa.edit.form.link,
  })

  useEffect(() => {
    const loadPelayananTelunjukSakti = async () => {
      const id = params?.id as string;
      if (!id) return;
      try {
        const data = await stateTelunjukDesa.edit.load(id);
        if (data) {
          setFormData({
            name: data.name,
            deskripsi: data.deskripsi,
            link: data.link,
          });
        }
      } catch (error) {
        console.error("Error loading pelayanan telunjuk sakti:", error);
        toast.error("Gagal memuat data pelayanan telunjuk sakti");
      }
    };
    loadPelayananTelunjukSakti();
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
      stateTelunjukDesa.edit.form = {
        ...stateTelunjukDesa.edit.form,
        name: formData.name,
        deskripsi: formData.deskripsi,
        link: formData.link,
      }
      await stateTelunjukDesa.edit.update()
      toast.success("Pelayanan telunjuk sakti berhasil diperbarui!")
      router.push("/admin/desa/layanan/pelayanan_telunjuk_sakti_desa")
    } catch (error) {
      console.error("Error updating pelayanan telunjuk sakti:", error);
      toast.error("Terjadi kesalahan saat memperbarui pelayanan telunjuk sakti");
    }
  }

  return (
    <Box>
          <Box mb={10}>
            <Button variant="subtle" onClick={() => router.back()}>
              <IconArrowBack color={colors['blue-button']} size={25} />
            </Button>
          </Box>
          <Paper bg={colors["white-1"]} p={"md"} w={{ base: "100%", md: "50%" }}>
            <Stack gap={"xs"}>
              <Title order={3}>Edit Surat Keterangan</Title>
              <TextInput
                value={formData.name}
                onChange={(val) => {
                  setFormData({ ...formData, name: val.target.value });
                }}
                label={<Text fz={"sm"} fw={"bold"}>Nama Surat Keterangan</Text>}
                placeholder="masukkan nama surat keterangan"
              />
              <TextInput
                value={formData.link}
                onChange={(val) => {
                  setFormData({ ...formData, link: val.target.value });
                }}
                label={<Text fz={"sm"} fw={"bold"}>Link</Text>}
                placeholder="masukkan link"
              />
              <Box>
                <Text fz={"sm"} fw={"bold"}>Konten</Text>
                <EditEditor
                  value={formData.deskripsi}
                  onChange={(htmlContent) => {
                    setFormData({ ...formData, deskripsi: htmlContent });
                  }}
                />
              </Box>
              <Button bg={colors['blue-button']} onClick={handleSubmit}>Simpan</Button>
            </Stack>
          </Paper>
        </Box>
  );
}

export default EditPelayananTelunjukSakti;
