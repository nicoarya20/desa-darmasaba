'use client'
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import fasilitasKesehatanState from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/fasilitasKesehatan';
import colors from '@/con/colors';
import { Box, Button, Flex, Grid, GridCol, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';

function DetailFasilitasKesehatan() {
  const params = useParams()
  const router = useRouter();
  const stateFasilitasKesehatan = useProxy(fasilitasKesehatanState.fasilitasKesehatan)
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useShallowEffect(() => {
    stateFasilitasKesehatan.findUnique.load(params?.id as string)
  }, [])

  const handleHapus = () => {
    if (selectedId) {
      stateFasilitasKesehatan.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      router.push("/admin/kesehatan/data-kesehatan-warga/fasilitas_kesehatan")
    }
  }

  if (!stateFasilitasKesehatan.findUnique.data) {
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
      <Paper bg={colors['white-1']} p={'md'}>
        <Stack>
          <Grid>
            <GridCol span={12}>
            <Text fz={"xl"} fw={"bold"}>Detail Fasilitas Kesehatan</Text>
            </GridCol>
            {/* <GridCol span={12}>
              <Flex gap={"xs"}>
                <Button color={colors['blue-button']} onClick={() => router.push(`/admin/kesehatan/data-kesehatan-warga/fasilitas_kesehatan/${params?.id}/dokter-tenaga-medis`)}>
                  Tambah Dokter
                </Button>
                <Button color={colors['blue-button']} onClick={() => router.push(`/admin/kesehatan/data-kesehatan-warga/fasilitas_kesehatan/${params?.id}/layanan-unggulan/create`)}>
                  Tambah Layanan
                </Button>
              </Flex>
            </GridCol> */}
          </Grid>
          {stateFasilitasKesehatan.findUnique.data ? (
            <Paper bg={colors['BG-trans']} p={'md'}>
              <Stack gap={"xs"}>
                <Box>
                  <Text fz={"lg"} fw={"bold"}>Nama Fasilitas Kesehatan</Text>
                  <Text fz={"md"}>{stateFasilitasKesehatan.findUnique.data.name}</Text>
                </Box>
                <Box>
                  <Text fz={"lg"} fw={"bold"}>Informasi Umum</Text>
                  <Text fz={"md"} fw={"bold"}>Fasilitas</Text>
                  <Text fz={"md"}>{stateFasilitasKesehatan.findUnique.data.informasiumum.fasilitas}</Text>
                  <Text fz={"md"} fw={"bold"}>Alamat</Text>
                  <Text fz={"md"}>{stateFasilitasKesehatan.findUnique.data.informasiumum.alamat}</Text>
                  <Text fz={"md"} fw={"bold"}>Jam Operasional</Text>
                  <Text fz={"md"}>{stateFasilitasKesehatan.findUnique.data.informasiumum.jamOperasional}</Text>
                </Box>
                <Box>
                  <Text fz={"md"} fw={"bold"}>Layanan Unggulan</Text>
                  <Text fz={"md"} dangerouslySetInnerHTML={{ __html: stateFasilitasKesehatan.findUnique.data.layananunggulan.content }} />
                </Box>
                <Box>
                  <Text fz={"lg"} fw={"bold"}>Fasilitas Pendukung</Text>
                  <Text fz={"md"} dangerouslySetInnerHTML={{ __html: stateFasilitasKesehatan.findUnique.data.fasilitaspendukung.content }} />
                </Box>
                <Box>
                  <Text fz={"lg"} fw={"bold"}>Prosedur Pendaftaran</Text>
                  <Text fz={"md"} dangerouslySetInnerHTML={{ __html: stateFasilitasKesehatan.findUnique.data.prosedurpendaftaran.content }} />
                </Box>
                <Box>
                  <Text fz={"md"} fw={"bold"}>Dokter dan Tenaga Medis</Text>
                  <Text fz={"md"} fw={"bold"}>Nama Dokter</Text>
                  <Text fz={"md"}>{stateFasilitasKesehatan.findUnique.data.dokterdantenagamedis.name}</Text>
                  <Text fz={"md"} fw={"bold"}>Specialist</Text>
                  <Text fz={"md"}>{stateFasilitasKesehatan.findUnique.data.dokterdantenagamedis.specialist}</Text>
                  <Text fz={"md"} fw={"bold"}>Jadwal</Text>
                  <Text fz={"md"}>{stateFasilitasKesehatan.findUnique.data.dokterdantenagamedis.jadwal}</Text>
                </Box>
                <Box>
                  <Text fz={"lg"} fw={"bold"}>Tarif dan Layanan</Text>
                  <Text fz={"md"} fw={"bold"}>Layanan</Text>
                  <Text fz={"md"}>{stateFasilitasKesehatan.findUnique.data.tarifdanlayanan.layanan}</Text>
                  <Text fz={"md"} fw={"bold"}>Tarif</Text>
                  <Text fz={"md"}>{stateFasilitasKesehatan.findUnique.data.tarifdanlayanan.tarif}</Text>
                </Box>
                <Box>
                  <Flex gap={"xs"}>
                    <Button color="red" onClick={() => {
                      if (stateFasilitasKesehatan.findUnique.data) {
                        setSelectedId(stateFasilitasKesehatan.findUnique.data.id)
                        setModalHapus(true)
                      }
                    }}>
                      <IconX size={20} />
                    </Button>
                    <Button onClick={() => router.push(`/admin/kesehatan/data-kesehatan-warga/fasilitas_kesehatan/${stateFasilitasKesehatan.findUnique.data?.id}/edit`)} color="green">
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
        text="Apakah anda yakin ingin menghapus fasilitas kesehatan ini?"
      />
    </Box>
  );
}

export default DetailFasilitasKesehatan;
