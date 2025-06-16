'use client'
import colors from '@/con/colors';
import { Box, Button, Grid, GridCol, Group, Paper, Skeleton, Stack, Stepper, StepperCompleted, StepperStep, Text } from '@mantine/core';
import { IconEdit } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import stateLayananDesa from '../../../_state/desa/layananDesa';
import { useProxy } from 'valtio/utils';
import { useShallowEffect } from '@mantine/hooks';

function PerizinanBerusaha() {
  const router = useRouter()
  const pelayananPerizinanBerusaha = useProxy(stateLayananDesa.pelayananPerizinanBerusaha)
  const [active, setActive] = useState(1);
  const nextStep = () => setActive((current) => (current < 6 ? current + 1 : current));
  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));
  useShallowEffect(() => {
    pelayananPerizinanBerusaha.findById.load('1')
  }, [])

  if(!pelayananPerizinanBerusaha.findById.data) {
    return (
      <Stack>
        <Skeleton radius={10} h={800} />
      </Stack>
    )
  }
  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <Paper bg={colors['BG-trans']} p={'md'}>
          <Box py={15}>
            <Stack gap={"xs"}>
              <Grid>
                <GridCol span={{ base: 12, md: 11 }}>
                  <Text fz={"h4"} fw={"bold"}>Preview Pelayanan Perizinan Berusaha</Text>
                </GridCol>
                <GridCol span={{ base: 12, md: 1 }}>
                  <Button bg={colors['blue-button']} onClick={() => router.push('/admin/desa/layanan/pelayanan_perizinan_berusaha/edit')}>
                    <IconEdit size={16} />
                  </Button>
                </GridCol>
              </Grid>
            </Stack>
          </Box>
            <Text fz={{ base: "h4", md: 'h2' }} fw={"bold"}>{pelayananPerizinanBerusaha.findById.data.name}</Text>
          <Text py={10} ta={"justify"} fz={{ base: "sm", md: 'h3' }} dangerouslySetInnerHTML={{__html: pelayananPerizinanBerusaha.findById.data.deskripsi}} />
          <Text py={10} fz={{ base: "sm", md: 'h3' }}>Proses pendaftaran NIB melalui OSS mencakup beberapa langkah umum, seperti:</Text>
          <Box p={"xl"} w={{ base: "100%", md: "100%" }} >
            <Stepper active={active} onStepClick={setActive} orientation="vertical"
              styles={{
                separator: {
                  marginLeft: 25
                },

                step: {
                  padding: '12px 0'
                }
              }}>
              <StepperStep label="Langkah Pertama" description="Pendaftaran Akun">
                Pendaftaran akun pada portal OSS
              </StepperStep>
              <StepperStep label="Langkah Kedua" description="Pengisian Data Perusahaan">
                Mengisi informasi perusahaan, termasuk data pemegang saham, alamat perusahaan, dan lainnya
              </StepperStep>
              <StepperStep label="Langkah Ketiga" description="Pemilihan KBLI ">
                Memilih KBLI dengan jenis usaha yang akan didaftarkan
              </StepperStep>
              <StepperStep label="Langkah Keempat" description="Pengunggahan Dokumen">
                Mengunggah dokumen-dokumen yang diperlukan, seperti akta pendirian perusahaan, surat izin usaha, dan dokumen lainnya sesuai dengan ketentuan yang berlaku
              </StepperStep>
              <StepperStep label="Langkah Kelima" description="Verifikasi dan Persetujuan">
                Proses verifikasi dan persetujuan oleh instansi terkait
              </StepperStep>
              <StepperStep label="Langkah Keenam" description="Penerimaan NIB">
                Jika proses sebelumnya berhasil, perusahaan akan menerima NIB sebagai identitas resmi usaha anda
              </StepperStep>
              <StepperCompleted >
                Selesai, anda telah mengikuti proses pendaftaran NIB melalui OSS
              </StepperCompleted>
            </Stepper>

            <Group justify="center" mt="xl">
              <Button variant="default" onClick={prevStep}>Back</Button>
              <Button onClick={nextStep}>Next step</Button>
            </Group>
            <Text py={35} ta={"justify"} fz={{ base: "sm", md: 'h3' }}>Penting untuk diingat bahwa prosedur dan persyaratan dapat berubah
              seiring waktu. Untuk informasi yang lebih akurat dan terkini, saya sarankan untuk mengunjungi situs
              resmi OSS <a href={pelayananPerizinanBerusaha.findById.data.link}>{pelayananPerizinanBerusaha.findById.data.link}</a> atau menghubungi instansi terkait di pemerintah Indonesia yang bertanggung jawab atas urusan perizinan usaha.</Text>
          </Box>
        </Paper>
      </Paper>
    </Box>
  );
}

export default PerizinanBerusaha;
