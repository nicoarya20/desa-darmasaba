'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, PinInput, Stack, Text, Title } from '@mantine/core';
import { useRouter } from 'next/navigation';

function Validasi() {
  const router = useRouter()
  return (
    <Stack pos={"relative"} bg={colors.Bg}>
      <Box px={{ base: 'md', md: 100 }} pb={50}>
        <Stack align='center' justify='center' h={"100vh"}>
          <Paper p={'xl'} radius={'md'} bg={colors['white-trans-1']}>
            <Stack align='center' gap={"lg"}>
              <Box>
                <Title ta={"center"} order={2} fw={'bold'} c={colors['blue-button']}>
                  Kode Verifikasi
                </Title>
              </Box>
              <Box>
                <Box mb={10}>
                  <Text c={colors['blue-button']} ta={"center"} fz={"sm"} fw={'bold'}>Masukkan Kode Verifikasi</Text>
                  <PinInput type={/^[0-9]*$/} inputType="tel" inputMode="numeric" />
                </Box>
                <Box py={20} >
                  <Button onClick={() => router.push("/admin/landing-page/profile/program-inovasi")}>
                    Page
                  </Button>
                </Box>
              </Box>
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </Stack>
  );
}

export default Validasi;
