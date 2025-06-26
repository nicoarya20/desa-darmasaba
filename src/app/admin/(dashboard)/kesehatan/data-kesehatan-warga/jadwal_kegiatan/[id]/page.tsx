'use client'
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import jadwalKegiatanState from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/jadwalKegiatan';
import colors from '@/con/colors';
import { Box, Button, Flex, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';

function DetailJadwalKegiatan() {
  const params = useParams()
  const router = useRouter();
  const stateJadwalKegiatan = useProxy(jadwalKegiatanState)
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useShallowEffect(() => {
    stateJadwalKegiatan.findUnique.load(params?.id as string)
  }, [])

  const handleHapus = () => {
    if (selectedId) {
      stateJadwalKegiatan.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      router.push("/admin/kesehatan/data-kesehatan-warga/jadwal_kegiatan")
    }
  }

  if (!stateJadwalKegiatan.findUnique.data) {
    return (
      <Stack py={10}>
        <Skeleton h={500} />
      </Stack>
    )
  }


  return (
    <Box>
      <Box mb={10}>
        <Button variant="subtle" onClick={() => router.back()}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>
      <Paper w={{ base: "100%", md: "50%" }} bg={colors['white-1']} p={'md'}>
        <Stack>
          <Text fz={"xl"} fw={"bold"}>Detail Jadwal Kegiatan</Text>
          {stateJadwalKegiatan.findUnique.data ? (
            <Paper bg={colors['BG-trans']} p={'md'}>
              <Stack gap={"xs"}>
                <Box>
                  <Text fz={"lg"} fw={"bold"}>Nama Kegiatan</Text>
                  <Text fz={"md"}>{stateJadwalKegiatan.findUnique.data.content}</Text>
                </Box>
                <Box>
                  <Text fz={"lg"} fw={"bold"}>Informasi</Text>
                  <Text fz={"md"} fw={"bold"}>Nama</Text>
                  <Text fz={"md"}>{stateJadwalKegiatan.findUnique.data.informasijadwalkegiatan.name}</Text>
                  <Text fz={"md"} fw={"bold"}>Tanggal</Text>
                  <Text fz={"md"}>{stateJadwalKegiatan.findUnique.data.informasijadwalkegiatan.tanggal}</Text>
                  <Text fz={"md"} fw={"bold"}>Waktu</Text>
                  <Text fz={"md"}>{stateJadwalKegiatan.findUnique.data.informasijadwalkegiatan.waktu}</Text>
                  <Text fz={"md"} fw={"bold"}>Lokasi</Text>
                  <Text fz={"md"}>{stateJadwalKegiatan.findUnique.data.informasijadwalkegiatan.lokasi}</Text>
                </Box>
                <Box>
                  <Text fz={"lg"} fw={"bold"}>Deskripsi</Text>
                  <Text fz={"md"} dangerouslySetInnerHTML={{ __html: stateJadwalKegiatan.findUnique.data.deskripsijadwalkegiatan.deskripsi }} />
                </Box>
                <Box>
                  <Text fz={"lg"} fw={"bold"}>Layanan</Text>
                  <Text fz={"md"} dangerouslySetInnerHTML={{ __html: stateJadwalKegiatan.findUnique.data.layananjadwalkegiatan.content }} />
                </Box>
                <Box>
                  <Text fz={"lg"} fw={"bold"}>Syarat Ketentuan</Text>
                  <Text fz={"md"} dangerouslySetInnerHTML={{ __html: stateJadwalKegiatan.findUnique.data.syaratketentuanjadwalkegiatan.content}} />
                </Box>
                <Box>
                  <Text fz={"lg"} fw={"bold"}>Dokumen</Text>
                  <Text fz={"md"} dangerouslySetInnerHTML={{ __html: stateJadwalKegiatan.findUnique.data.dokumenjadwalkegiatan.content }} />
                </Box>
                <Box>
                  <Text fz={"lg"} fw={"bold"}>Prosedur Pendaftaran</Text>
                  <Text fz={"md"}>{stateJadwalKegiatan.findUnique.data.pendaftaranjadwalkegiatan.name}</Text>
                  <Text fz={"md"}>{stateJadwalKegiatan.findUnique.data.pendaftaranjadwalkegiatan.tanggal}</Text>
                  <Text fz={"md"}>{stateJadwalKegiatan.findUnique.data.pendaftaranjadwalkegiatan.namaOrangtua}</Text>
                  <Text fz={"md"}>{stateJadwalKegiatan.findUnique.data.pendaftaranjadwalkegiatan.nomor}</Text>
                  <Text fz={"md"}>{stateJadwalKegiatan.findUnique.data.pendaftaranjadwalkegiatan.alamat}</Text>
                  <Text fz={"md"} dangerouslySetInnerHTML={{ __html: stateJadwalKegiatan.findUnique.data.pendaftaranjadwalkegiatan.catatan }} />
                </Box>
                <Box>
                  <Flex gap={"xs"}>
                    <Button color="red" onClick={() => {
                      if (stateJadwalKegiatan.findUnique.data) {
                        setSelectedId(stateJadwalKegiatan.findUnique.data.id)
                        setModalHapus(true)
                      }
                    }}>
                      <IconX size={20} />
                    </Button>
                    <Button onClick={() => router.push(`/admin/kesehatan/data-kesehatan-warga/jadwal_kegiatan/${stateJadwalKegiatan.findUnique.data?.id}/edit`)} color="green">
                      <IconEdit size={20} />
                    </Button>
                  </Flex>
                </Box>
              </Stack>
            </Paper>
          ) : null}
        </Stack>
      </Paper>

      {/* Modal Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text="Apakah anda yakin ingin menghapus jadwal kegiatan ini?"
      />
    </Box>
  );
}

export default DetailJadwalKegiatan;
