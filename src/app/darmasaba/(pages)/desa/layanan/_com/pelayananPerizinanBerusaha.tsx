/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import stateLayananDesa from '@/app/admin/(dashboard)/_state/desa/layananDesa';
import { Box, Button, Center, Group, Skeleton, Stepper, StepperCompleted, StepperStep, Text } from '@mantine/core';
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
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData()
  }, [])

  const data = state.pelayananPerizinanBerusaha.findById.data;
  
  if (!data) {
    return (
      <Center>
        <Text>Data tidak tersedia</Text>
      </Center>
    );
  }

  return (
    <Box>
      {loading ? (
        <Center>
          <Skeleton h={250} />
        </Center>
      ) : (
        <Box>
          <Box py={15}>
            <Text fz={{ base: "h4", md: 'h2' }} fw={"bold"}>Pelayanan Perizinan Berusaha Berbasis Risiko Melalui Sistem ONLINE SINGLE SUBMISSION (OSS)</Text>
          </Box>
          <Text 
            py={10} 
            ta={"justify"} 
            fz={{ base: "sm", md: 'h3' }} 
            dangerouslySetInnerHTML={{ __html: data.deskripsi || '' }} 
          />
          <Text py={10} fz={{ base: "sm", md: 'h3' }}>Proses pendaftaran NIB melalui OSS mencakup beberapa langkah umum, seperti:</Text>
          <Box p={"xl"} w={{ base: "100%", md: "100%" }}>
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
              <Button variant="default" onClick={prevStep}>Back</Button>
              <Button onClick={nextStep}>Next step</Button>
            </Group>
            <Text py={35} ta={"justify"} fz={{ base: "sm", md: 'h3' }}>
              Penting untuk diingat bahwa prosedur dan persyaratan dapat berubah
              seiring waktu. Untuk informasi yang lebih akurat dan terkini, saya sarankan untuk mengunjungi situs
              resmi OSS <a href="https://oss.go.id/" target="_blank" rel="noopener noreferrer">(https://oss.go.id/)</a> atau menghubungi instansi terkait di pemerintah Indonesia yang bertanggung jawab atas urusan perizinan usaha.
            </Text>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default PelayananPerizinanBerusaha;
