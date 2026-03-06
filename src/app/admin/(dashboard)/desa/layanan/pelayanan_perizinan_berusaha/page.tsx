/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import {
  Box,
  Button,
  Center,
  Divider,
  Group,
  Paper,
  Skeleton,
  Stack,
  Stepper,
  StepperCompleted,
  StepperStep,
  Text,
  Title
} from '@mantine/core';
import { IconEdit } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import stateLayananDesa from '../../../_state/desa/layananDesa';

function PerizinanBerusaha() {
  const router = useRouter();
  const pelayananPerizinanBerusaha = useProxy(
    stateLayananDesa.pelayananPerizinanBerusaha
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [active, setActive] = useState(1);
  const nextStep = () =>
    setActive((current) => (current < 6 ? current + 1 : current));
  const prevStep = () =>
    setActive((current) => (current > 0 ? current - 1 : current));

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const id = 'edit';
        await pelayananPerizinanBerusaha.findById.load(id);
      } catch (err) {
        setError('Gagal memuat data');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <Stack align="center" justify="center" py="xl">
        <Skeleton height={800} radius="md" />
      </Stack>
    );
  }

  if (error || !pelayananPerizinanBerusaha.findById.data) {
    return (
      <Center h={200}>
        <Text c="dimmed">{error || 'Data tidak ditemukan'}</Text>
      </Center>
    );
  }

  const data = pelayananPerizinanBerusaha.findById.data;

  return (
    <Paper bg={colors['white-1']} p="lg" radius="md" shadow="sm">
      <Stack gap="md">
        {/* Header */}
        <Group justify='space-between' align="center">
          <Title order={3} c={colors['blue-button']} lh={1.2}>
            Preview Pelayanan Perizinan Berusaha
          </Title>
          <Button
            c="green"
            variant="light"
            leftSection={<IconEdit size={18} stroke={2} />}
            radius="md"
            onClick={() =>
              router.push(
                `/admin/desa/layanan/pelayanan_perizinan_berusaha/${data.id}`
              )
            }
          >
            Edit
          </Button>
        </Group>

        {/* Content */}
        <Paper p="xl" bg={'white'} withBorder radius="md" shadow="xs">
          <Box px={{ base: 0, md: 50 }} pb="xl">
            <Center>
              <Title
                order={3}
                ta="center"
                c={colors['blue-button']}
                lh={1.15}
              >
                {data.name}
              </Title>
            </Center>

            <Divider my="md" color={colors['blue-button']} />

            <Box mt="lg">
              <Text
                py="xs"
                ta={{ base: "left", md: "justify" }}
                fz={{ base: 'sm', md: 'md' }}
                lh={1.55}
                style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
                dangerouslySetInnerHTML={{ __html: data.deskripsi }}
              />

              <Text
                py="xs"
                fz={{ base: 'sm', md: 'md' }}
                fw={700}
                c={colors['blue-button']}
                lh={1.5}
              >
                Proses pendaftaran NIB melalui OSS mencakup beberapa langkah
                umum:
              </Text>

              <Box p="xl" w="100%" visibleFrom='md'>
                <Stepper
                  active={active}
                  onStepClick={setActive}
                  orientation="vertical"
                  styles={{
                    separator: { marginLeft: 25 },
                    step: { padding: '12px 0' },
                    stepLabel: {
                      fontSize: 'var(--mantine-font-size-sm)',
                      fontWeight: 700,
                      lineHeight: 1.4,
                    },
                    stepDescription: {
                      fontSize: 'var(--mantine-font-size-xs)',
                      lineHeight: 1.4,
                    },
                  }}
                >
                  <StepperStep label="Langkah Pertama" description="Pendaftaran Akun">
                    <Text fz="sm" lh={1.5}>
                      Pendaftaran akun pada portal OSS
                    </Text>
                  </StepperStep>
                  <StepperStep label="Langkah Kedua" description="Pengisian Data Perusahaan">
                    <Text fz="sm" lh={1.5}>
                      Mengisi informasi perusahaan, termasuk data pemegang saham, alamat perusahaan, dan lainnya
                    </Text>
                  </StepperStep>
                  <StepperStep label="Langkah Ketiga" description="Pemilihan KBLI">
                    <Text fz="sm" lh={1.5}>
                      Memilih KBLI dengan jenis usaha yang akan didaftarkan
                    </Text>
                  </StepperStep>
                  <StepperStep label="Langkah Keempat" description="Pengunggahan Dokumen">
                    <Text fz="sm" lh={1.5}>
                      Mengunggah dokumen-dokumen yang diperlukan, seperti akta pendirian perusahaan, surat izin usaha, dan dokumen lainnya sesuai dengan ketentuan yang berlaku
                    </Text>
                  </StepperStep>
                  <StepperStep label="Langkah Kelima" description="Verifikasi dan Persetujuan">
                    <Text fz="sm" lh={1.5}>
                      Proses verifikasi dan persetujuan oleh instansi terkait
                    </Text>
                  </StepperStep>
                  <StepperStep label="Langkah Keenam" description="Penerimaan NIB">
                    <Text fz="sm" lh={1.5}>
                      Jika proses sebelumnya berhasil, perusahaan akan menerima NIB sebagai identitas resmi usaha anda
                    </Text>
                  </StepperStep>
                  <StepperCompleted>
                    <Text fz="sm" lh={1.5}>
                      Selesai, anda telah mengikuti proses pendaftaran NIB melalui OSS
                    </Text>
                  </StepperCompleted>
                </Stepper>

                <Group justify="center" mt="xl">
                  <Button variant="default" onClick={prevStep}>
                    Back
                  </Button>
                  <Button onClick={nextStep}>Next step</Button>
                </Group>
              </Box>

              <Box p="xl" w="100%" hiddenFrom='md'>
                <Stepper
                  active={active}
                  onStepClick={setActive}
                  orientation="vertical"
                  styles={{
                    separator: { marginLeft: 25 },
                    step: { padding: '12px 0' },
                    stepLabel: {
                      fontSize: 'var(--mantine-font-size-sm)',
                      fontWeight: 700,
                      lineHeight: 1.4,
                    },
                    stepDescription: {
                      fontSize: 'var(--mantine-font-size-xs)',
                      lineHeight: 1.4,
                    },
                  }}
                >
                  <StepperStep label="Langkah Pertama" description="Pendaftaran Akun">
                    <Text fz="sm" lh={1.5}>

                    </Text>
                  </StepperStep>
                  <StepperStep label="Langkah Kedua" description="Pengisian Data Perusahaan">
                    <Text fz="sm" lh={1.5}>

                    </Text>
                  </StepperStep>
                  <StepperStep label="Langkah Ketiga" description="Pemilihan KBLI">
                    <Text fz="sm" lh={1.5}>

                    </Text>
                  </StepperStep>
                  <StepperStep label="Langkah Keempat" description="Pengunggahan Dokumen">
                    <Text fz="sm" lh={1.5}>

                    </Text>
                  </StepperStep>
                  <StepperStep label="Langkah Kelima" description="Verifikasi dan Persetujuan">
                    <Text fz="sm" lh={1.5}>

                    </Text>
                  </StepperStep>
                  <StepperStep label="Langkah Keenam" description="Penerimaan NIB">
                    <Text fz="sm" lh={1.5}>

                    </Text>
                  </StepperStep>
                  <StepperCompleted>
                    <Text fz="sm" lh={1.5}>

                    </Text>
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
                py="md"
                ta={{ base: "left", md: "justify" }}
                fz={{ base: 'sm', md: 'md' }}
                lh={1.55}
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