'use client'
import colors from '@/con/colors';
import {
  Box,
  Button,
  Center,
  Divider,
  Grid,
  GridCol,
  Group,
  Paper,
  Skeleton,
  Stack,
  Stepper,
  StepperCompleted,
  StepperStep,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { IconEdit } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import stateLayananDesa from '../../../_state/desa/layananDesa';
import { useProxy } from 'valtio/utils';
import { useShallowEffect } from '@mantine/hooks';

function PerizinanBerusaha() {
  const router = useRouter();
  const pelayananPerizinanBerusaha = useProxy(
    stateLayananDesa.pelayananPerizinanBerusaha
  );
  const [active, setActive] = useState(1);
  const nextStep = () =>
    setActive((current) => (current < 6 ? current + 1 : current));
  const prevStep = () =>
    setActive((current) => (current > 0 ? current - 1 : current));

  useShallowEffect(() => {
    pelayananPerizinanBerusaha.findById.load('1');
  }, []);

  if (!pelayananPerizinanBerusaha.findById.data) {
    return (
      <Stack align="center" justify="center" py="xl">
        <Skeleton radius="md" height={800} />
      </Stack>
    );
  }

  const data = pelayananPerizinanBerusaha.findById.data;

  return (
    <Paper bg={colors['white-1']} p="lg" radius="md" shadow="sm">
      <Stack gap="md">
        {/* Header */}
        <Grid align="center">
          <GridCol span={{ base: 12, md: 11 }}>
            <Title order={3} c={colors['blue-button']}>
              Preview Pelayanan Perizinan Berusaha
            </Title>
          </GridCol>
          <GridCol span={{ base: 12, md: 1 }}>
            <Tooltip label="Edit Data Perizinan" withArrow>
              <Button
                c="green"
                variant="light"
                leftSection={<IconEdit size={18} stroke={2} />}
                radius="md"
                onClick={() =>
                  router.push(
                    '/admin/desa/layanan/pelayanan_perizinan_berusaha/edit'
                  )
                }
              >
                Edit
              </Button>
            </Tooltip>
          </GridCol>
        </Grid>

        {/* Content */}
        <Paper p="xl" bg={'white'} withBorder radius="md" shadow="xs">
          <Box px={{ base: 0, md: 50 }} pb="xl">
            <Center>
              <Text
                ta="center"
                fz={{ base: '1.2rem', md: '1.8rem' }}
                fw="bold"
                c={colors['blue-button']}
              >
                {data.name}
              </Text>
            </Center>

            <Divider my="md" color={colors['blue-button']} />

            <Box mt="lg">
              <Text
                py={10}
                ta="justify"
                fz={{ base: '1rem', md: '1.2rem' }}
                dangerouslySetInnerHTML={{ __html: data.deskripsi }}
                style={{wordBreak: "break-word", whiteSpace: "normal"}}
              />

              <Text
                py={10}
                fz={{ base: '1rem', md: '1.2rem' }}
                fw="bold"
                c={colors['blue-button']}
              >
                Proses pendaftaran NIB melalui OSS mencakup beberapa langkah
                umum:
              </Text>

              <Box p="xl" w="100%">
                <Stepper
                  active={active}
                  onStepClick={setActive}
                  orientation="vertical"
                  styles={{
                    separator: { marginLeft: 25 },
                    step: { padding: '12px 0' },
                  }}
                >
                  <StepperStep label="Langkah Pertama" description="Pendaftaran Akun">
                    Pendaftaran akun pada portal OSS
                  </StepperStep>
                  <StepperStep label="Langkah Kedua" description="Pengisian Data Perusahaan">
                    Mengisi informasi perusahaan, termasuk data pemegang saham, alamat perusahaan, dan lainnya
                  </StepperStep>
                  <StepperStep label="Langkah Ketiga" description="Pemilihan KBLI">
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
                  <StepperCompleted>
                    Selesai, anda telah mengikuti proses pendaftaran NIB melalui OSS
                  </StepperCompleted>
                </Stepper>

                <Group justify="center" mt="xl">
                  <Button variant="default" onClick={prevStep}>
                    Back
                  </Button>
                  <Button onClick={nextStep}>Next step</Button>
                </Group>
              </Box>

              <Text
                py={35}
                ta="justify"
                fz={{ base: '1rem', md: '1.2rem' }}
              >
                Penting untuk diingat bahwa prosedur dan persyaratan dapat
                berubah seiring waktu. Untuk informasi yang lebih akurat dan
                terkini, silakan kunjungi situs resmi OSS{' '}
                <a
                  href={data.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: colors['blue-button'] }}
                >
                  {data.link}
                </a>{' '}
                atau hubungi instansi terkait di pemerintah Indonesia yang
                bertanggung jawab atas urusan perizinan usaha.
              </Text>
            </Box>
          </Box>
        </Paper>
      </Stack>
    </Paper>
  );
}

export default PerizinanBerusaha;
