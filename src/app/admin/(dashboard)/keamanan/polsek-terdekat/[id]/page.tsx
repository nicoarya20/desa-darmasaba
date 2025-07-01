'use client'
import colors from '@/con/colors';
import { Box, Button, Flex, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconX } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import polsekTerdekat from '../../../_state/keamanan/polsek-terdekat';
// import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';

function DetailPolsekTerdekat() {
  const router = useRouter();
  const polsekState = useProxy(polsekTerdekat)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [modalHapus, setModalHapus] = useState(false)
  const params = useParams()

  useShallowEffect(() => {
    polsekState.findUnique.load(params?.id as string)
  }, [])

  const handleHapus = () => {
    if (selectedId) {
      polsekState.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
      router.push("/admin/keamanan/polsek-terdekat")
    }
  }

  if (!polsekState.findUnique.data) {
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
          <Text fz={"xl"} fw={"bold"}>Detail Polsek Terdekat</Text>

          <Paper bg={colors['BG-trans']} p={'md'}>
            <Stack gap={"xs"}>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Nama Polsek Terdekat</Text>
                <Text fz={"lg"}>{polsekState.findUnique.data?.nama}</Text>
              </Box>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Jarak Polsek Ke Desa</Text>
                <Text fz={"lg"}>{polsekState.findUnique.data?.jarakKeDesa}</Text>
              </Box>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Alamat Polsek </Text>
                <Text fz={"lg"}>{polsekState.findUnique.data?.alamat}</Text>
              </Box>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Nomor Polsek</Text>
                <Text fz={"lg"}>{polsekState.findUnique.data?.nomorTelepon}</Text>
              </Box>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Jam Operasional</Text>
                <Text fz={"lg"}>{polsekState.findUnique.data?.jamOperasional}</Text>
              </Box>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Google Maps</Text>
                {polsekState.findUnique.data?.embedMapUrl ? (
                  <Box style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
                    <iframe
                      src={polsekState.findUnique.data.embedMapUrl}
                      width="100%"
                      height="100%"
                      style={{
                        border: 0,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                      }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </Box>
                ) : (
                  <Text c="dimmed" fz="sm">Tidak ada maps</Text>
                )}
              </Box>

              <Box>
                <Text fz={"lg"} fw={"bold"}>Nama Tempat Maps</Text>
                <Text fz={"lg"}>{polsekState.findUnique.data?.namaTempatMaps}</Text>
              </Box>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Alamat Maps</Text>
                <Text fz={"lg"}>{polsekState.findUnique.data?.alamatMaps}</Text>
              </Box>
              <Box>
                <Text fz={"lg"} fw={"bold"}>Link Petunjuk Arah</Text>
                <Text>
                  <a
                    href={polsekState.findUnique.data?.linkPetunjukArah || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'black', textDecoration: 'underline' }}
                  >
                    {polsekState.findUnique.data?.linkPetunjukArah || "Tidak ada link"}
                  </a>
                </Text>
              </Box>

              <Box>
                <Text fz={"lg"} fw={"bold"}>Layanan Polsek</Text>
                <Text fz={"lg"}>{polsekState.findUnique.data?.layananPolsek?.nama}</Text>
              </Box>
              <Box>
                <Flex gap={"xs"}>
                  <Button
                    onClick={() => {
                      if (polsekState.findUnique.data) {
                        setSelectedId(polsekState.findUnique.data.id);
                        setModalHapus(true);
                      }
                    }}
                    disabled={polsekState.delete.loading || !polsekState.findUnique.data}
                    color="red">
                    <IconX size={20} />
                  </Button>
                  <Button onClick={() => router.push(`/admin/keamanan/polsek-terdekat/${polsekState.findUnique.data?.id}/edit`)} color="green">
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
        text="Apakah anda yakin ingin menghapus polsek terdekat ini?"
      />
    </Box>
  );
}

export default DetailPolsekTerdekat;
