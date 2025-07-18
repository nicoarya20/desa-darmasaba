/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import pengelolaanSampahState from '@/app/admin/(dashboard)/_state/lingkungan/pengelolaan-sampah';
import colors from '@/con/colors';
import { Box, Button, Flex, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { IconArrowBack, IconEdit, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';

import dynamic from 'next/dynamic'

const LeafletMap = dynamic(() => import('@/app/admin/(dashboard)/_com/leafletMapCreate'), {
  ssr: false
})


function DetailKeteranganBankSampahTerdekat() {
  const router = useRouter();
  const keteranganState = useProxy(pengelolaanSampahState.keteranganSampah)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [modalHapus, setModalHapus] = useState(false)
  const params = useParams()

  useEffect(() => {
    keteranganState.findUnique.load(params?.id as string)
  }, [])

  const handleHapus = () => {
    if (selectedId) {
      keteranganState.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      router.push("/admin/lingkungan/pengelolaan-sampah-bank-sampah/keterangan-bank-sampah-terdekat")
    }
  }

  if (!keteranganState.findUnique.data) {
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
          <Text fz={"xl"} fw={"bold"}>Detail Keterangan Bank Sampah Terdekat</Text>

          <Paper bg={colors['BG-trans']} p={'md'}>
            <Stack gap={"xs"}>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Nama Bank Sampah Terdekat</Text>
                <Text fz={"lg"}>{keteranganState.findUnique.data?.name}</Text>
              </Box>

              <Box>
                <Text fz={"lg"} fw={"bold"}>Alamat</Text>
                <Text fz={"lg"}>{keteranganState.findUnique.data?.alamat}</Text>
              </Box>

              <Box>
                <Text fz={"lg"} fw={"bold"}>Nama Tempat Maps</Text>
                <Text fz={"lg"}>{keteranganState.findUnique.data?.namaTempatMaps}</Text>
              </Box>

              <Box>
                <Text fz={"lg"} fw={"bold"}>Peta Lokasi</Text>
                {keteranganState.findUnique.data?.lat && keteranganState.findUnique.data?.lng ? (
                  <Box
                    style={{
                      height: "300px",
                    }}
                  >
                    <LeafletMap
                      defaultCenter={{ lat: keteranganState.findUnique.data.lat, lng: keteranganState.findUnique.data.lng }}
                      readOnly
                    />
                  </Box>
                ) : (
                  <Text c="dimmed" fz="sm">Koordinat belum tersedia</Text>
                )}
              </Box>


              <Box>
                <Text fz={"lg"} fw={"bold"}>Link Petunjuk Arah</Text>
                {keteranganState.findUnique.data?.lat && keteranganState.findUnique.data?.lng ? (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${keteranganState.findUnique.data.lat},${keteranganState.findUnique.data.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'black', textDecoration: 'underline' }}
                  >
                    Buka Petunjuk Arah di Google Maps
                  </a>
                ) : (
                  <Text c="dimmed" fz="sm">Koordinat belum tersedia</Text>
                )}
              </Box>

              <Box>
                <Flex gap={"xs"}>
                  <Button
                    onClick={() => {
                      if (keteranganState.findUnique.data) {
                        setSelectedId(keteranganState.findUnique.data.id);
                        setModalHapus(true);
                      }
                    }}
                    disabled={!keteranganState.findUnique.data}
                    color="red"
                  >
                    <IconX size={20} />
                  </Button>
                  <Button
                    onClick={() => router.push(`/admin/lingkungan/pengelolaan-sampah-bank-sampah/keterangan-bank-sampah-terdekat/${keteranganState.findUnique.data?.id}/edit`)}
                    color="green"
                  >
                    <IconEdit size={20} />
                  </Button>
                </Flex>
              </Box>
            </Stack>
          </Paper>
        </Stack>
      </Paper>

      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text="Apakah anda yakin ingin menghapus keterangan bank sampah terdekat ini?"
      />
    </Box>

  );
}

export default DetailKeteranganBankSampahTerdekat;
