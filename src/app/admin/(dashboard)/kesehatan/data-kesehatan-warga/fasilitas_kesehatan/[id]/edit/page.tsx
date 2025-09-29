/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import fasilitasKesehatanState from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/fasilitasKesehatan';
import colors from '@/con/colors';
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
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

interface FasilitasKesehatanFormBase {
  name: string;
  informasiUmum: {
    fasilitas: string;
    alamat: string;
    jamOperasional: string;
  };
  layananUnggulan: { content: string };
  dokterdanTenagaMedis: {
    name: string;
    specialist: string;
    jadwal: string;
  };
  fasilitasPendukung: { content: string };
  prosedurPendaftaran: { content: string };
  tarifDanLayanan: {
    layanan: string;
    tarif: string;
  };
}

function EditFasilitasKesehatan() {
  const stateFasilitasKesehatan = useProxy(fasilitasKesehatanState.fasilitasKesehatan);
  const router = useRouter();
  const params = useParams();

  const [formData, setFormData] = useState<FasilitasKesehatanFormBase>({
    name: stateFasilitasKesehatan.edit.form.name || '',
    informasiUmum: {
      fasilitas: stateFasilitasKesehatan.edit.form.informasiUmum?.fasilitas || '',
      alamat: stateFasilitasKesehatan.edit.form.informasiUmum?.alamat || '',
      jamOperasional: stateFasilitasKesehatan.edit.form.informasiUmum?.jamOperasional || '',
    },
    layananUnggulan: {
      content: stateFasilitasKesehatan.edit.form.layananUnggulan?.content || '',
    },
    dokterdanTenagaMedis: {
      name: stateFasilitasKesehatan.edit.form.dokterdanTenagaMedis?.name || '',
      specialist: stateFasilitasKesehatan.edit.form.dokterdanTenagaMedis?.specialist || '',
      jadwal: stateFasilitasKesehatan.edit.form.dokterdanTenagaMedis?.jadwal || '',
    },
    fasilitasPendukung: {
      content: stateFasilitasKesehatan.edit.form.fasilitasPendukung?.content || '',
    },
    prosedurPendaftaran: {
      content: stateFasilitasKesehatan.edit.form.prosedurPendaftaran?.content || '',
    },
    tarifDanLayanan: {
      layanan: stateFasilitasKesehatan.edit.form.tarifDanLayanan?.layanan || '',
      tarif: stateFasilitasKesehatan.edit.form.tarifDanLayanan?.tarif || '',
    },
  });

  useEffect(() => {
    const loadFasilitasKesehatan = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        await stateFasilitasKesehatan.edit.load(id);
        const { form } = stateFasilitasKesehatan.edit;
        if (form) {
          setFormData({
            name: form.name,
            informasiUmum: {
              fasilitas: form.informasiUmum?.fasilitas || '',
              alamat: form.informasiUmum?.alamat || '',
              jamOperasional: form.informasiUmum?.jamOperasional || '',
            },
            layananUnggulan: { content: form.layananUnggulan?.content || '' },
            dokterdanTenagaMedis: {
              name: form.dokterdanTenagaMedis?.name || '',
              specialist: form.dokterdanTenagaMedis?.specialist || '',
              jadwal: form.dokterdanTenagaMedis?.jadwal || '',
            },
            fasilitasPendukung: { content: form.fasilitasPendukung?.content || '' },
            prosedurPendaftaran: { content: form.prosedurPendaftaran?.content || '' },
            tarifDanLayanan: {
              layanan: form.tarifDanLayanan?.layanan || '',
              tarif: form.tarifDanLayanan?.tarif || '',
            },
          });
        }
      } catch (error) {
        console.error("Error loading fasilitas kesehatan:", error);
        toast.error("Gagal memuat data fasilitas kesehatan");
      }
    };
    loadFasilitasKesehatan();
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
      stateFasilitasKesehatan.edit.form = {
        ...stateFasilitasKesehatan.edit.form,
        ...formData,
      };
      const success = await stateFasilitasKesehatan.edit.submit();
      if (success) {
        toast.success("Fasilitas kesehatan berhasil diperbarui!");
        router.push("/admin/kesehatan/data-kesehatan-warga/fasilitas_kesehatan");
      }
    } catch (error) {
      console.error("Error updating fasilitas kesehatan:", error);
      toast.error("Terjadi kesalahan saat memperbarui data fasilitas kesehatan");
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
          Edit Fasilitas Kesehatan
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
            label="Nama Fasilitas Kesehatan"
            placeholder="Masukkan nama fasilitas kesehatan"
            defaultValue={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />

          {/* Informasi Umum */}
          <Box>
            <Text fw="bold" mb={5}>Informasi Umum</Text>
            <TextInput
              label="Fasilitas"
              defaultValue={formData.informasiUmum.fasilitas}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  informasiUmum: { ...prev.informasiUmum, fasilitas: e.target.value },
                }))
              }
            />
            <TextInput
              label="Alamat"
              defaultValue={formData.informasiUmum.alamat}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  informasiUmum: { ...prev.informasiUmum, alamat: e.target.value },
                }))
              }
            />
            <TextInput
              label="Jam Operasional"
              defaultValue={formData.informasiUmum.jamOperasional}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  informasiUmum: { ...prev.informasiUmum, jamOperasional: e.target.value },
                }))
              }
            />
          </Box>

          {/* Layanan Unggulan */}
          <Box>
            <Text fw="bold" mb={5}>Layanan Unggulan</Text>
            <EditEditor
              value={formData.layananUnggulan.content}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  layananUnggulan: { content: e },
                }))
              }
            />
          </Box>

          {/* Dokter dan Tenaga Medis */}
          <Box>
            <Text fw="bold" mb={5}>Dokter dan Tenaga Medis</Text>
            <TextInput
              label="Nama Dokter"
              defaultValue={formData.dokterdanTenagaMedis.name}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  dokterdanTenagaMedis: { ...prev.dokterdanTenagaMedis, name: e.target.value },
                }))
              }
            />
            <TextInput
              label="Specialist"
              defaultValue={formData.dokterdanTenagaMedis.specialist}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  dokterdanTenagaMedis: { ...prev.dokterdanTenagaMedis, specialist: e.target.value },
                }))
              }
            />
            <TextInput
              label="Jadwal"
              defaultValue={formData.dokterdanTenagaMedis.jadwal}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  dokterdanTenagaMedis: { ...prev.dokterdanTenagaMedis, jadwal: e.target.value },
                }))
              }
            />
          </Box>

          {/* Fasilitas Pendukung */}
          <Box>
            <Text fw="bold" mb={5}>Fasilitas Pendukung</Text>
            <EditEditor
              value={formData.fasilitasPendukung.content}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  fasilitasPendukung: { content: e },
                }))
              }
            />
          </Box>

          {/* Prosedur Pendaftaran */}
          <Box>
            <Text fw="bold" mb={5}>Prosedur Pendaftaran</Text>
            <EditEditor
              value={formData.prosedurPendaftaran.content}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  prosedurPendaftaran: { content: e },
                }))
              }
            />
          </Box>

          {/* Tarif dan Layanan */}
          <Box>
            <Text fw="bold" mb={5}>Tarif dan Layanan</Text>
            <TextInput
              label="Tarif"
              defaultValue={formData.tarifDanLayanan.tarif}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  tarifDanLayanan: { ...prev.tarifDanLayanan, tarif: e.target.value },
                }))
              }
            />
            <TextInput
              label="Layanan"
              defaultValue={formData.tarifDanLayanan.layanan}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  tarifDanLayanan: { ...prev.tarifDanLayanan, layanan: e.target.value },
                }))
              }
            />
          </Box>

          {/* Tombol Simpan */}
          <Group justify="flex-end">
            <Button
              onClick={handleSubmit}
              radius="md"
              size="md"
              loading={stateFasilitasKesehatan.edit.loading}
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

export default EditFasilitasKesehatan;
