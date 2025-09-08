/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import jadwalKegiatanState from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/jadwalKegiatan';
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

interface JadwalKegiatanFormBase {
  content: string;
  informasiJadwalKegiatan: {
    name: string;
    tanggal: string;
    waktu: string;
    lokasi: string;
  };
  deskripsiJadwalKegiatan: {
    deskripsi: string;
  };
  layananJadwalKegiatan: {
    content: string;
  };
  syaratKetentuanJadwalKegiatan: {
    content: string;
  };
  dokumenJadwalKegiatan: {
    content: string;
  };
  pendaftaranJadwalKegiatan: {
    name: string;
    tanggal: string;
    namaOrangtua: string;
    nomor: string;
    alamat: string;
    catatan: string;
  };
}

function EditJadwalKegiatan() {
  const stateJadwalKegiatan = useProxy(jadwalKegiatanState);
  const router = useRouter();
  const params = useParams();

  const [formData, setFormData] = useState<JadwalKegiatanFormBase>({
    content: stateJadwalKegiatan.edit.form.content || '',
    informasiJadwalKegiatan: {
      name: stateJadwalKegiatan.edit.form.informasiJadwalKegiatan?.name || '',
      tanggal: stateJadwalKegiatan.edit.form.informasiJadwalKegiatan?.tanggal || '',
      waktu: stateJadwalKegiatan.edit.form.informasiJadwalKegiatan?.waktu || '',
      lokasi: stateJadwalKegiatan.edit.form.informasiJadwalKegiatan?.lokasi || '',
    },
    deskripsiJadwalKegiatan: {
      deskripsi: stateJadwalKegiatan.edit.form.deskripsiJadwalKegiatan?.deskripsi || '',
    },
    layananJadwalKegiatan: {
      content: stateJadwalKegiatan.edit.form.layananJadwalKegiatan?.content || '',
    },
    syaratKetentuanJadwalKegiatan: {
      content: stateJadwalKegiatan.edit.form.syaratKetentuanJadwalKegiatan?.content || '',
    },
    dokumenJadwalKegiatan: {
      content: stateJadwalKegiatan.edit.form.dokumenJadwalKegiatan?.content || '',
    },
    pendaftaranJadwalKegiatan: {
      name: stateJadwalKegiatan.edit.form.pendaftaranJadwalKegiatan?.name || '',
      tanggal: stateJadwalKegiatan.edit.form.pendaftaranJadwalKegiatan?.tanggal || '',
      namaOrangtua: stateJadwalKegiatan.edit.form.pendaftaranJadwalKegiatan?.namaOrangtua || '',
      nomor: stateJadwalKegiatan.edit.form.pendaftaranJadwalKegiatan?.nomor || '',
      alamat: stateJadwalKegiatan.edit.form.pendaftaranJadwalKegiatan?.alamat || '',
      catatan: stateJadwalKegiatan.edit.form.pendaftaranJadwalKegiatan?.catatan || '',
    },
  });

  useEffect(() => {
    const loadJadwalKegiatan = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        await stateJadwalKegiatan.edit.load(id);
        const { form } = stateJadwalKegiatan.edit;
        if (form) {
          setFormData({
            content: form.content,
            informasiJadwalKegiatan: {
              name: form.informasiJadwalKegiatan?.name || '',
              tanggal: form.informasiJadwalKegiatan?.tanggal || '',
              waktu: form.informasiJadwalKegiatan?.waktu || '',
              lokasi: form.informasiJadwalKegiatan?.lokasi || '',
            },
            deskripsiJadwalKegiatan: {
              deskripsi: form.deskripsiJadwalKegiatan?.deskripsi || '',
            },
            layananJadwalKegiatan: {
              content: form.layananJadwalKegiatan?.content || '',
            },
            syaratKetentuanJadwalKegiatan: {
              content: form.syaratKetentuanJadwalKegiatan?.content || '',
            },
            dokumenJadwalKegiatan: {
              content: form.dokumenJadwalKegiatan?.content || '',
            },
            pendaftaranJadwalKegiatan: {
              name: form.pendaftaranJadwalKegiatan?.name || '',
              tanggal: form.pendaftaranJadwalKegiatan?.tanggal || '',
              namaOrangtua: form.pendaftaranJadwalKegiatan?.namaOrangtua || '',
              nomor: form.pendaftaranJadwalKegiatan?.nomor || '',
              alamat: form.pendaftaranJadwalKegiatan?.alamat || '',
              catatan: form.pendaftaranJadwalKegiatan?.catatan || '',
            },
          });
        }
      } catch (error) {
        console.error("Error loading jadwal kegiatan:", error);
        toast.error("Gagal memuat data jadwal kegiatan");
      }
    };
    loadJadwalKegiatan();
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
      stateJadwalKegiatan.edit.form = {
        ...stateJadwalKegiatan.edit.form,
        content: formData.content,
        informasiJadwalKegiatan: { ...formData.informasiJadwalKegiatan },
        deskripsiJadwalKegiatan: { ...formData.deskripsiJadwalKegiatan },
        layananJadwalKegiatan: { ...formData.layananJadwalKegiatan },
        syaratKetentuanJadwalKegiatan: { ...formData.syaratKetentuanJadwalKegiatan },
        dokumenJadwalKegiatan: { ...formData.dokumenJadwalKegiatan },
        pendaftaranJadwalKegiatan: { ...formData.pendaftaranJadwalKegiatan },
      };

      const success = await stateJadwalKegiatan.edit.submit();
      if (success) {
        toast.success("Jadwal kegiatan berhasil diperbarui!");
        router.push("/admin/kesehatan/data-kesehatan-warga/jadwal_kegiatan");
      }
    } catch (error) {
      console.error("Error updating jadwal kegiatan:", error);
      toast.error(error instanceof Error ? error.message : "Gagal memperbarui data jadwal kegiatan");
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
          Edit Jadwal Kegiatan
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
          {/* Nama Jadwal */}
          <TextInput
            label="Nama Jadwal Kegiatan"
            placeholder="Masukkan nama jadwal kegiatan"
            value={formData.content}
            onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
          />

          {/* Deskripsi */}
          <Box>
            <Text fz="sm" fw="bold">Deskripsi Jadwal Kegiatan</Text>
            <EditEditor
              value={formData.deskripsiJadwalKegiatan.deskripsi}
              onChange={(val) => setFormData((prev) => ({
                ...prev,
                deskripsiJadwalKegiatan: { deskripsi: val }
              }))}
            />
          </Box>

          {/* Informasi Jadwal */}
          <Box>
            <Text fz="md" fw="bold">Informasi Jadwal Kegiatan</Text>
            <TextInput label="Nama" value={formData.informasiJadwalKegiatan.name}
              onChange={(e) => setFormData((prev) => ({
                ...prev, informasiJadwalKegiatan: { ...prev.informasiJadwalKegiatan, name: e.target.value }
              }))}
            />
            <TextInput type="date" label="Tanggal" value={formData.informasiJadwalKegiatan.tanggal}
              onChange={(e) => setFormData((prev) => ({
                ...prev, informasiJadwalKegiatan: { ...prev.informasiJadwalKegiatan, tanggal: e.target.value }
              }))}
            />
            <TextInput label="Waktu" value={formData.informasiJadwalKegiatan.waktu}
              onChange={(e) => setFormData((prev) => ({
                ...prev, informasiJadwalKegiatan: { ...prev.informasiJadwalKegiatan, waktu: e.target.value }
              }))}
            />
            <TextInput label="Lokasi" value={formData.informasiJadwalKegiatan.lokasi}
              onChange={(e) => setFormData((prev) => ({
                ...prev, informasiJadwalKegiatan: { ...prev.informasiJadwalKegiatan, lokasi: e.target.value }
              }))}
            />
          </Box>

          {/* Layanan */}
          <Box>
            <Text fz="md" fw="bold">Layanan Jadwal Kegiatan</Text>
            <EditEditor
              value={formData.layananJadwalKegiatan.content}
              onChange={(val) => setFormData((prev) => ({
                ...prev,
                layananJadwalKegiatan: { content: val }
              }))}
            />
          </Box>

          {/* Syarat */}
          <Box>
            <Text fz="md" fw="bold">Syarat dan Ketentuan</Text>
            <EditEditor
              value={formData.syaratKetentuanJadwalKegiatan.content}
              onChange={(val) => setFormData((prev) => ({
                ...prev,
                syaratKetentuanJadwalKegiatan: { content: val }
              }))}
            />
          </Box>

          {/* Dokumen */}
          <Box>
            <Text fz="md" fw="bold">Dokumen Jadwal Kegiatan</Text>
            <EditEditor
              value={formData.dokumenJadwalKegiatan.content}
              onChange={(val) => setFormData((prev) => ({
                ...prev,
                dokumenJadwalKegiatan: { content: val }
              }))}
            />
          </Box>

          {/* Pendaftaran */}
          <Box>
            <Text fz="md" fw="bold">Pendaftaran Jadwal Kegiatan</Text>
            <TextInput label="Nama" value={formData.pendaftaranJadwalKegiatan.name}
              onChange={(e) => setFormData((prev) => ({
                ...prev, pendaftaranJadwalKegiatan: { ...prev.pendaftaranJadwalKegiatan, name: e.target.value }
              }))}
            />
            <TextInput type="date" label="Tanggal" value={formData.pendaftaranJadwalKegiatan.tanggal}
              onChange={(e) => setFormData((prev) => ({
                ...prev, pendaftaranJadwalKegiatan: { ...prev.pendaftaranJadwalKegiatan, tanggal: e.target.value }
              }))}
            />
            <TextInput label="Nama Orangtua" value={formData.pendaftaranJadwalKegiatan.namaOrangtua}
              onChange={(e) => setFormData((prev) => ({
                ...prev, pendaftaranJadwalKegiatan: { ...prev.pendaftaranJadwalKegiatan, namaOrangtua: e.target.value }
              }))}
            />
            <TextInput label="Nomor" value={formData.pendaftaranJadwalKegiatan.nomor}
              onChange={(e) => setFormData((prev) => ({
                ...prev, pendaftaranJadwalKegiatan: { ...prev.pendaftaranJadwalKegiatan, nomor: e.target.value }
              }))}
            />
            <TextInput label="Alamat" value={formData.pendaftaranJadwalKegiatan.alamat}
              onChange={(e) => setFormData((prev) => ({
                ...prev, pendaftaranJadwalKegiatan: { ...prev.pendaftaranJadwalKegiatan, alamat: e.target.value }
              }))}
            />
            <TextInput label="Catatan" value={formData.pendaftaranJadwalKegiatan.catatan}
              onChange={(e) => setFormData((prev) => ({
                ...prev, pendaftaranJadwalKegiatan: { ...prev.pendaftaranJadwalKegiatan, catatan: e.target.value }
              }))}
            />
          </Box>

          {/* Submit */}
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

export default EditJadwalKegiatan;
