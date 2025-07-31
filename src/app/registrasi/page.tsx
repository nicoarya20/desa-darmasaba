'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Checkbox, Group, Image, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import BackButton from '../darmasaba/(pages)/desa/layanan/_com/BackButto';
import { useRouter } from 'next/navigation';
import { useSnapshot } from 'valtio';
import userState from '../admin/(dashboard)/_state/user/user-state';



function Page() {
  const router = useRouter()
  const registrerState = useSnapshot(userState.userState)
  const handleSubmit = async () => {
    router.push("/login")
    await registrerState.register.submit()
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
            Silahkan lengkapi data diri anda untuk mengakses e-book desa
          </Text>
        </Box>
      </Box>
      <Box px={{ base: 'md', md: 100 }} pb={50}>
        <Group justify='center'>
          <Paper p={'xl'} radius={'md'} bg={colors['white-trans-1']}>
            <Stack align='center'>
              <Title order={2} fw={'bold'} c={colors['blue-button']}>
                Registrasi
              </Title>
              <Box>
                <TextInput placeholder='Nama Lengkap'
                  label='Nama Lengkap'
                  value={registrerState.register.form.nama}
                  onChange={(e) => {
                    userState.userState.register.form.nama = e.target.value
                  }}
                  required

                />
                <TextInput py={10} placeholder='Email'
                  label='Email'
                  value={registrerState.register.form.email}
                  onChange={(e) => {
                    userState.userState.register.form.email = e.target.value
                  }}
                  required
                />
                <TextInput pb={10} placeholder='Password'
                type='password'
                  label='Password'
                  value={registrerState.register.form.password}
                  onChange={(e) => {
                    userState.userState.register.form.password = e.target.value
                  }}
                  required
                />
                <Box pb={10}>
                  <Checkbox
                    label="Saya menyetujui syarat dan ketentuan yang berlaku"
                  />
                </Box>
                <Box pb={20} >
                  <Button onClick={handleSubmit} fullWidth bg={colors['blue-button']} radius={'xl'}>Daftar</Button>
                </Box>
              </Box>
            </Stack>
          </Paper>
        </Group>
      </Box>
    </Stack>
  );
}

export default Page;
