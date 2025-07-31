'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Flex, Group, Image, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconUserFilled } from '@tabler/icons-react';
import Link from 'next/link';
import BackButton from '../darmasaba/(pages)/desa/layanan/_com/BackButto';
import { useSnapshot } from 'valtio';
import userState from '../admin/(dashboard)/_state/user/user-state';
import { useRouter } from 'next/navigation';

function Page() {
  const router = useRouter()
  const snap = useSnapshot(userState.userState)
  const handleSubmit = async () => {
    router.push("/darmasaba/pendidikan/perpustakaan-digital")
    await snap.login.submit()
  }
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box px={{ base: 'md', md: 100 }} >
        <Center>
          <Image src={"/darmasaba-icon.png"} alt="" w={80} />
        </Center>
        <Box>
          <Title ta={'center'} order={1} fw={'bold'} c={colors['blue-button']}>
            E-Book Desa Darmasaba
          </Title>
          <Text ta={'center'} fz={'h4'} fw={'bold'} c={colors['blue-button']}>
            Silahkan masukkan akun anda untuk menjelajahi berbagai macam buku di perpustakaan digital
          </Text>
        </Box>
      </Box>
      <Box px={{ base: 'md', md: 100 }} pb={50}>
        <Group justify='center'>
          <Paper p={'xl'} radius={'md'} bg={colors['white-trans-1']}>
            <Stack align='center'>
              <Title order={2} fw={'bold'} c={colors['blue-button']}>
                Login
              </Title>
              <IconUserFilled size={80} color={colors['blue-button']} />
              <Box>
                <Text c={colors['blue-button']} fw={'bold'}>Masuk Untuk Akses Lebih Banyak Buku</Text>
                <TextInput
                  type='email'
                  label='Email'
                  placeholder='Email'
                  value={snap.login.form.email}
                  onChange={(e) => {
                    userState.userState.login.form.email = e.target.value
                  }}
                  required
                />
                <TextInput py={20}
                  type='password'
                  label='Password'
                  placeholder='Password'
                  value={snap.login.form.password}
                  onChange={(e) => {
                    userState.userState.login.form.password = e.target.value
                  }}
                />
                <Box pb={20} >
                  <Button onClick={handleSubmit} fullWidth bg={colors['blue-button']} radius={'xl'}>Masuk</Button>
                </Box>
                <Flex justify={'center'} align={'center'}>
                  <Text>Belum punya akun? </Text>
                  <Button variant='transparent' component={Link} href={'/registrasi'}>
                    <Text c={colors['blue-button']} fw={'bold'}>Registrasi</Text>
                  </Button>
                </Flex>
              </Box>
            </Stack>
          </Paper>
        </Group>
      </Box>
    </Stack>
  );
}

export default Page;
