'use client'
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import strukturorganisasiState from '@/app/admin/(dashboard)/_state/ekonomi/struktur-organisasi/struktur-organisasi';
import colors from '@/con/colors';
import { Box, Button, Flex, Image, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';

function DetailPegawai() {
  const statePegawai = useProxy(strukturorganisasiState.pegawai)
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const params = useParams()
  const router = useRouter();

  useShallowEffect(() => {
    statePegawai.findUnique.load(params?.id as string)
  }, [])

  const handleHapus = () => {
    if (selectedId) {
      statePegawai.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      router.push("/admin/ekonomi/Struktur-Organisasi-dan-SK-Pengurus-BUMDesa/pegawai")
    }
  }

  if (!statePegawai.findUnique.data) {
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
          <Text fz={"xl"} fw={"bold"}>Detail Pegawai</Text>
          <Paper bg={colors['BG-trans']} p={'md'}>
            <Stack gap={"xs"}>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Nama Lengkap</Text>
                <Text fz={"lg"}>{statePegawai.findUnique.data?.namaLengkap}</Text>
              </Box>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Gelar Akademik</Text>
                <Text fz={"lg"}>{statePegawai.findUnique.data?.gelarAkademik}</Text>
              </Box>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Image</Text>
                {statePegawai.findUnique.data?.image?.link ? (
                  <Image src={statePegawai.findUnique.data?.image?.link} alt='' />
                ) : (
                  <Text fz={"md"} c="dimmed">Tidak ada gambar</Text>
                )}
              </Box>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Tanggal Masuk</Text>
                <Text fz={"lg"}>
                  {statePegawai.findUnique.data?.tanggalMasuk
                    ? new Date(statePegawai.findUnique.data.tanggalMasuk).toLocaleDateString()
                    : "-"}
                </Text>
              </Box>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Email</Text>
                <Text fz={"lg"}>{statePegawai.findUnique.data?.email}</Text>
              </Box>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Telepon</Text>
                <Text fz={"lg"}>{statePegawai.findUnique.data?.telepon}</Text>
              </Box>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Alamat</Text>
                <Text fz={"lg"}>{statePegawai.findUnique.data?.alamat}</Text>
              </Box>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Posisi</Text>
                <Stack gap={4}>
                  {statePegawai.findUnique.data?.posisi ? (
                    <Text fz={"lg"}>
                     {statePegawai.findUnique.data.posisi.nama}
                    </Text>
                  ) : (
                    <Text fz={"lg"} c="dimmed">
                      Tidak ada posisi
                    </Text>
                  )}
                </Stack>
              </Box>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Aktif</Text>
                <Text fz={"lg"}>{statePegawai.findUnique.data?.isActive ? "Ya" : "Tidak"}</Text>
              </Box>

              <Box>
                <Flex gap={"xs"}>
                  <Button
                    onClick={() => {
                      if (statePegawai.findUnique.data) {
                        setSelectedId(statePegawai.findUnique.data.id);
                        setModalHapus(true);
                      }
                    }}
                    disabled={!statePegawai.findUnique.data}
                    color="red">
                    <IconX size={20} />
                  </Button>
                  <Button
                    onClick={() => {
                      if (statePegawai.findUnique.data) {
                        router.push(`/admin/ekonomi/Struktur-Organisasi-dan-SK-Pengurus-BUMDesa/pegawai/${statePegawai.findUnique.data.id}/edit`);
                      }
                    }}
                    disabled={!statePegawai.findUnique.data}
                    color="green">
                    <IconEdit size={20} />
                  </Button>
                </Flex>
              </Box>
            </Stack>
          </Paper>
        </Stack>
      </Paper>

      {/* Modal Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text="Apakah anda yakin ingin menghapus produk ini?"
      />
    </Box>
  );
}

export default DetailPegawai;
