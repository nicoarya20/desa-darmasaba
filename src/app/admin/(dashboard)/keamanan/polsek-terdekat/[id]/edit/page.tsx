/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import colors from '@/con/colors';
import { Box, Button, Card, Group, Modal, Paper, Select, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import polsekTerdekat from '@/app/admin/(dashboard)/_state/keamanan/polsek-terdekat';

function CreatePolsekTerdekat() {
  const polsekState = useProxy(polsekTerdekat)
  const params = useParams();
  const router = useRouter();
  const [layananOptions, setLayananOptions] = useState<{ value: string; label: string }[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalUpdateOpen, setModalUpdateOpen] = useState(false);
  const [namaLayananBaru, setNamaLayananBaru] = useState("");
  const [selectedLayananId, setSelectedLayananId] = useState<string | null>(null);
  const [namaLayananUpdate, setNamaLayananUpdate] = useState("");
  const [formData, setFormData] = useState({
    nama: "",
    jarakKeDesa: "",
    alamat: "",
    nomorTelepon: "",
    jamOperasional: "",
    embedMapUrl: "",
    namaTempatMaps: "",
    alamatMaps: "",
    linkPetunjukArah: "",
    layananPolsekId: "",
  })

  useEffect(() => {
    const loadPolsekTerdekat = async () => {
      const id = params?.id as string;
      if (!id) return;

      try {
        const data = await polsekState.edit.load(id);
        if (data) {
          setFormData({
            nama: data.nama || '',
            jarakKeDesa: data.jarakKeDesa || '',
            alamat: data.alamat || '',
            nomorTelepon: data.nomorTelepon || '',
            jamOperasional: data.jamOperasional || '',
            embedMapUrl: data.embedMapUrl || '',
            namaTempatMaps: data.namaTempatMaps || '',
            alamatMaps: data.alamatMaps || '',
            linkPetunjukArah: data.linkPetunjukArah || '',
            layananPolsekId: data.layananPolsekId || '',
          });
        }
      } catch (error) {
        console.error("Error loading polsek terdekat:", error);
        toast.error("Gagal memuat data polsek terdekat");
      }
    };

    loadPolsekTerdekat();
  }, [params?.id]);


  const handleSubmit = async () => {
    try {
      polsekState.edit.form = {
        ...polsekState.edit.form,
        nama: formData.nama,
        jarakKeDesa: formData.jarakKeDesa,
        alamat: formData.alamat,
        nomorTelepon: formData.nomorTelepon,
        jamOperasional: formData.jamOperasional,
        embedMapUrl: formData.embedMapUrl,
        namaTempatMaps: formData.namaTempatMaps,
        alamatMaps: formData.alamatMaps,
        linkPetunjukArah: formData.linkPetunjukArah,
        layananPolsekId: formData.layananPolsekId,
      }
      await polsekState.edit.update()
      toast.success("Polsek terdekat berhasil diperbarui!")
      router.push("/admin/keamanan/polsek-terdekat")
    } catch (error) {
      console.error("Error updating polsek terdekat:", error);
      toast.error("Gagal memuat data polsek terdekat");
    }
  }

  const fetchLayanan = async () => {
    try {
      const res = await fetch("/api/keamanan/layanan-polsek/find-many")
      const data = await res.json()

      if (data.success) {
        const options = data.data.map((item: any) => {
          return {
            value: item.id,
            label: item.nama
          }
        })
        setLayananOptions(options)
      }
    } catch {
      toast.error("Gagal memuat layanan polsek")
    }
  }


  const handleTambahLayanan = async () => {
    if (!namaLayananBaru.trim()) return toast.warn("Nama layanan tidak boleh kosong");

    try {
      const res = await fetch("/api/keamanan/layanan-polsek/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama: namaLayananBaru }),
      });
      const data = await res.json();
      console.log("data setelah create:", data);

      if (data.success) {
        const newLayanan = {
          value: data.data.id,
          label: data.data.nama,
        };
        setLayananOptions((prev) => [...prev, newLayanan]);
        await fetchLayanan();
        polsekState.create.form.layananPolsekId = data.data.id;
        toast.success("Layanan baru ditambahkan!");
        setModalOpen(false);
        setNamaLayananBaru("");
      } else {
        toast.error(data.message || "Gagal menambah layanan");
      }
    } catch {
      toast.error("Error menambah layanan");
    }
  };

  const handleUpdateLayanan = async (id: string, namaBaru: string) => {
    if (!namaBaru.trim()) return toast.warn("Nama layanan tidak boleh kosong");

    try {
      const res = await fetch(`/api/keamanan/layanan-polsek/update/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama: namaBaru }),
      });
      const data = await res.json();
      console.log("data setelah update:", data);

      if (data.success) {
        await fetchLayanan(); // Refresh list
        toast.success("Layanan berhasil diupdate!");
        setModalUpdateOpen(false);
        setNamaLayananUpdate("");
      } else {
        toast.error(data.message || "Gagal mengupdate layanan");
      }
    } catch {
      toast.error("Error mengupdate layanan");
    }
  };

  const handleDeleteLayanan = async (id: string) => {
    const confirmDelete = confirm("Yakin ingin menghapus layanan ini?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/keamanan/layanan-polsek/del/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      console.log("data setelah delete:", data);

      if (data.success) {
        await fetchLayanan(); // Refresh list
        setLayananOptions((prev) => prev.filter((layanan) => layanan.value !== id));
        toast.success("Layanan berhasil dihapus!");
      } else {
        toast.error(data.message || "Gagal menghapus layanan");
      }
    } catch {
      toast.error("Error menghapus layanan");
    }
  };


  useEffect(() => {
    fetchLayanan();
  }, []);

  return (
    <Box>
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Tambah Layanan Polsek"
        centered
      >
        <Stack>
          <TextInput
            label="Nama Layanan"
            placeholder="Masukkan nama layanan"
            value={namaLayananBaru}
            onChange={(e) => setNamaLayananBaru(e.currentTarget.value)}
          />
          <Button onClick={handleTambahLayanan}>Simpan</Button>
        </Stack>
      </Modal>

      <Modal
        opened={modalUpdateOpen}
        onClose={() => setModalUpdateOpen(false)}
        title="Tambah Layanan Polsek"
        centered
      >
        <Stack>
          <TextInput
            label="Nama Layanan"
            placeholder="Masukkan nama layanan"
            value={namaLayananUpdate}
            onChange={(e) => setNamaLayananUpdate(e.currentTarget.value)}
          />
          <Button onClick={() => {
            if (!selectedLayananId) return toast.warn("ID layanan tidak ditemukan");
            handleUpdateLayanan(selectedLayananId, namaLayananUpdate);
          }}>Simpan</Button>
        </Stack>
      </Modal>

      <Box mb={10}>
        <Button onClick={() => router.back()} variant='subtle' color={'blue'}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>

      <Paper w={{ base: '100%', md: '50%' }} bg={colors['white-1']} p={'md'}>
        <Stack gap={"xs"}>
          <Title order={4}>Create Polsek Terdekat</Title>
          <TextInput
            value={formData.nama}
            onChange={(val) => {
              formData.nama = val.target.value
            }}
            label={<Text fw={"bold"} fz={"sm"}>Nama Polsek Terdekat</Text>}
            placeholder='Masukkan nama Polsek Terdekat'
          />
          <TextInput
            value={formData.jarakKeDesa}
            onChange={(val) => {
              formData.jarakKeDesa = val.target.value
            }}
            label={<Text fw={"bold"} fz={"sm"}>Jarak Polsek Terdekat</Text>}
            placeholder='Masukkan jarak Polsek Terdekat'
          />
          <TextInput
            value={formData.alamat}
            onChange={(val) => {
              formData.alamat = val.target.value
            }}
            label={<Text fw={"bold"} fz={"sm"}>Alamat Polsek Terdekat</Text>}
            placeholder='Masukkan alamat Polsek Terdekat'
          />
          <TextInput
            value={formData.nomorTelepon}
            onChange={(val) => {
              formData.nomorTelepon = val.target.value
            }}
            label={<Text fw={"bold"} fz={"sm"}>Nomor Telepon Polsek Terdekat</Text>}
            placeholder='Masukkan nomor telepon Polsek Terdekat'
          />
          <TextInput
            value={formData.jamOperasional}
            onChange={(val) => {
              formData.jamOperasional = val.target.value
            }}
            label={<Text fw={"bold"} fz={"sm"}>Jam Operasional Polsek Terdekat</Text>}
            placeholder='Masukkan jam operasional Polsek Terdekat'
          />
          <TextInput
            value={formData.embedMapUrl}
            onChange={(val) => {
              formData.embedMapUrl = val.target.value
            }}
            label={<Text fw={"bold"} fz={"sm"}>Embed Map URL Polsek Terdekat</Text>}
            placeholder='Masukkan embed map url Polsek Terdekat'
          />
          <TextInput
            value={formData.namaTempatMaps}
            onChange={(val) => {
              formData.namaTempatMaps = val.target.value
            }}
            label={<Text fw={"bold"} fz={"sm"}>Nama Tempat Maps Polsek Terdekat</Text>}
            placeholder='Masukkan nama tempat maps Polsek Terdekat'
          />
          <TextInput
            value={formData.alamatMaps}
            onChange={(val) => {
              formData.alamatMaps = val.target.value
            }}
            label={<Text fw={"bold"} fz={"sm"}>Alamat Maps Polsek Terdekat</Text>}
            placeholder='Masukkan alamat maps Polsek Terdekat'
          />
          <TextInput
            value={formData.linkPetunjukArah}
            onChange={(val) => {
              formData.linkPetunjukArah = val.target.value
            }}
            label={<Text fw={"bold"} fz={"sm"}>Link Petunjuk Arah Polsek Terdekat</Text>}
            placeholder='Masukkan link petunjuk arah Polsek Terdekat'
          />
          {/* Tambah Dropdown Select */}
          <Select

            label="Layanan Polsek"
            placeholder="Pilih layanan polsek"
            data={layananOptions}

            value={polsekState.create.form.layananPolsekId}
            onChange={(val) => {
              polsekState.create.form.layananPolsekId = val || "";
            }}
          />
          <Button variant="light" size="xs" onClick={() => setModalOpen(true)}>
            + Tambah Layanan Baru
          </Button>

          <Text>Daftar Layanan Polsek</Text>
          {layananOptions.map((item) => (
            <Card style={{border: '1px solid #ccc'}} bg={colors['white-1']} p={'md'} key={item.value}>
              <Group>
              <Text>{item.label}</Text>
              <Button
                variant="light"
                size="xs"
                onClick={() => {
                  setSelectedLayananId(item.value);
                  setNamaLayananUpdate(item.label);
                  setModalUpdateOpen(true);
                }}
              >
                Edit
              </Button>
              <Button
                variant="outline"
                color="red"
                size="xs"
                onClick={() => handleDeleteLayanan(item.value)}
              >
                Hapus
              </Button>
            </Group>
            </Card>
          ))}


          {/* Tambah field lainnya di sini... */}
          <Group>
            <Button onClick={handleSubmit} bg={colors['blue-button']}>Submit</Button>
          </Group>
        </Stack>
      </Paper>
    </Box >
  );

}

export default CreatePolsekTerdekat;
