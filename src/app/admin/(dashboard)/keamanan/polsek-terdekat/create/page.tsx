/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import colors from '@/con/colors';
import { Box, Button, Group, Modal, Paper, Select, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import polsekTerdekat from '../../../_state/keamanan/polsek-terdekat';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

function CreatePolsekTerdekat() {
  const polsekState = useProxy(polsekTerdekat)
  const router = useRouter();
  const [layananOptions, setLayananOptions] = useState<{ value: string; label: string }[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [namaLayananBaru, setNamaLayananBaru] = useState("");

  const resetForm = () => {
    polsekState.create.form = {
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
    }
  }

  const handleSubmit = async () => {
    await polsekState.create.create()
    resetForm()
    router.push("/admin/keamanan/polsek-terdekat")
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
    } catch  {
      toast.error("Error menambah layanan");
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

      <Box mb={10}>
        <Button onClick={() => router.back()} variant='subtle' color={'blue'}>
          <IconArrowBack color={colors['blue-button']} size={25}/>
        </Button>
      </Box>

      <Paper w={{base: '100%', md: '50%'}} bg={colors['white-1']} p={'md'}>
        <Stack gap={"xs"}>
          <Title order={4}>Create Polsek Terdekat</Title>
          <TextInput
          value={polsekState.create.form.nama}
          onChange={(val) => {
            polsekState.create.form.nama = val.target.value
          }}
          label={<Text fw={"bold"} fz={"sm"}>Nama Polsek Terdekat</Text>}
          placeholder='Masukkan nama Polsek Terdekat'
          />
          <TextInput
          value={polsekState.create.form.jarakKeDesa}
          onChange={(val) => {
            polsekState.create.form.jarakKeDesa = val.target.value
          }}
          label={<Text fw={"bold"} fz={"sm"}>Jarak Polsek Terdekat</Text>}
          placeholder='Masukkan jarak Polsek Terdekat'
          />
           <TextInput
          value={polsekState.create.form.alamat}
          onChange={(val) => {
            polsekState.create.form.alamat = val.target.value
          }}
          label={<Text fw={"bold"} fz={"sm"}>Alamat Polsek Terdekat</Text>}
          placeholder='Masukkan alamat Polsek Terdekat'
          />
           <TextInput
          value={polsekState.create.form.nomorTelepon}
          onChange={(val) => {
            polsekState.create.form.nomorTelepon = val.target.value
          }}
          label={<Text fw={"bold"} fz={"sm"}>Nomor Telepon Polsek Terdekat</Text>}
          placeholder='Masukkan nomor telepon Polsek Terdekat'
          />
           <TextInput
          value={polsekState.create.form.jamOperasional}
          onChange={(val) => {
            polsekState.create.form.jamOperasional = val.target.value
          }}
          label={<Text fw={"bold"} fz={"sm"}>Jam Operasional Polsek Terdekat</Text>}
          placeholder='Masukkan jam operasional Polsek Terdekat'
          />
          <TextInput
          value={polsekState.create.form.embedMapUrl}
          onChange={(val) => {
            polsekState.create.form.embedMapUrl = val.target.value
          }}
          label={<Text fw={"bold"} fz={"sm"}>Embed Map URL Polsek Terdekat</Text>}
          placeholder='Masukkan embed map url Polsek Terdekat'
          />
          <TextInput
          value={polsekState.create.form.namaTempatMaps}
          onChange={(val) => {
            polsekState.create.form.namaTempatMaps = val.target.value
          }}
          label={<Text fw={"bold"} fz={"sm"}>Nama Tempat Maps Polsek Terdekat</Text>}
          placeholder='Masukkan nama tempat maps Polsek Terdekat'
          />
          <TextInput
          value={polsekState.create.form.alamatMaps}
          onChange={(val) => {
            polsekState.create.form.alamatMaps = val.target.value
          }}
          label={<Text fw={"bold"} fz={"sm"}>Alamat Maps Polsek Terdekat</Text>}
          placeholder='Masukkan alamat maps Polsek Terdekat'
          />
          <TextInput
          value={polsekState.create.form.linkPetunjukArah}
          onChange={(val) => {
            polsekState.create.form.linkPetunjukArah = val.target.value
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

          {/* Tambah field lainnya di sini... */}
          <Group>
            <Button onClick={handleSubmit} bg={colors['blue-button']}>Submit</Button>
          </Group>
       </Stack>
      </Paper>
   </Box>
  );

}

export default CreatePolsekTerdekat;
