/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import stateLayananDesa from '@/app/admin/(dashboard)/_state/desa/layananDesa';
import { Box, Button, Center, Group, Loader, Stack, Stepper, StepperCompleted, StepperStep, Text, Title } from '@mantine/core';
import { IconArrowLeft, IconArrowRight, IconCheck } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';

function PelayananPerizinanBerusaha() {
  const state = useProxy(stateLayananDesa)
  const [loading, setLoading] = useState(false)
  const [active, setActive] = useState(1);
  const nextStep = () => setActive((current) => (current < 6 ? current + 1 : current));
  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await state.pelayananPerizinanBerusaha.findById.load('1')
      } catch (error) {
        console.error('Gagal memuat data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData()
  }, [])

  const data = state.pelayananPerizinanBerusaha.findById.data;
  
  if (!data && !loading) {
    return (
      <Center mih={300}>
        <Stack align="center" gap="sm">
          <Text fz="lg" fw={500} c="dimmed">Belum ada informasi layanan yang tersedia</Text>
          <Button component="a" href="https://oss.go.id" target="_blank" radius="xl">Kunjungi OSS</Button>
        </Stack>
      </Center>
    );
  }

  return (
    <Box px={{ base: 'md', md: 'xl' }} py="lg">
      {loading ? (
        <Center mih={300}>
          <Loader size="lg" color="blue" />
        </Center>
      ) : (
          <Stack gap="lg">
            <Box>
              <Title order={2} fw={700} fz={{ base: 22, md: 32 }} mb="sm">
                Perizinan Berusaha Berbasis Risiko melalui OSS
              </Title>
              <Text fz={{ base: 'sm', md: 'md' }} c="dimmed">
                Sistem Online Single Submission (OSS) untuk pendaftaran NIB
              </Text>
            </Box>

            <Text fz={{ base: 'sm', md: 'md' }} ta="justify" style={{wordBreak: "break-word", whiteSpace: "normal"}} dangerouslySetInnerHTML={{ __html: data?.deskripsi || '' }} />

            <Box>
              <Text fw={600} mb="sm" fz={{ base: 'sm', md: 'lg' }}>Alur pendaftaran NIB:</Text>
              <Stepper active={active} onStepClick={setActive} orientation="vertical" color="blue" radius="md"
                styles={{
                  step: { padding: '14px 0' },
                  stepBody: { marginLeft: 8 }
                }}
              >
                <StepperStep label="Langkah 1" description="Daftar Akun">
                  <Text fz="sm">Membuat akun di portal OSS</Text>
                </StepperStep>
                <StepperStep label="Langkah 2" description="Isi Data Perusahaan">
                  <Text fz="sm">Lengkapi informasi perusahaan, data pemegang saham, dan alamat</Text>
                </StepperStep>
                <StepperStep label="Langkah 3" description="Pilih KBLI">
                  <Text fz="sm">Menentukan kode KBLI sesuai jenis usaha</Text>
                </StepperStep>
                <StepperStep label="Langkah 4" description="Unggah Dokumen">
                  <Text fz="sm">Unggah akta pendirian, surat izin, dan dokumen wajib lainnya</Text>
                </StepperStep>
                <StepperStep label="Langkah 5" description="Verifikasi Instansi">
                  <Text fz="sm">Menunggu verifikasi dan persetujuan dari pihak berwenang</Text>
                </StepperStep>
                <StepperStep label="Langkah 6" description="Terbit NIB">
                  <Text fz="sm">Menerima NIB sebagai identitas resmi usaha</Text>
                </StepperStep>
                <StepperCompleted>
                  <Center>
                    <Stack align="center" gap="xs">
                      <IconCheck size={40} color="green" />
                      <Text fz="sm" fw={500}>Proses pendaftaran selesai</Text>
                    </Stack>
                  </Center>
                </StepperCompleted>
              </Stepper>

              <Group justify="center" mt="lg">
                <Button variant="light" leftSection={<IconArrowLeft size={18} />} onClick={prevStep} disabled={active === 0}>
                  Kembali
                </Button>
                <Button rightSection={<IconArrowRight size={18} />} onClick={nextStep}>
                  Lanjut
                </Button>
              </Group>
            </Box>

            <Text fz="sm" ta="justify" c="dimmed" mt="md">
              Catatan: Persyaratan dan prosedur dapat berubah sewaktu-waktu. Untuk informasi resmi terbaru, silakan kunjungi situs{" "}
              <a href="https://oss.go.id/" target="_blank" rel="noopener noreferrer">oss.go.id</a> atau hubungi instansi pemerintah terkait.
            </Text>
          </Stack>
      )}
    </Box>
  );
}

export default PelayananPerizinanBerusaha;
