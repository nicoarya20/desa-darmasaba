import colors from '@/con/colors';
import { Box, Button, Center, Checkbox, Group, Image, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import Link from 'next/link';
import BackButton from '../darmasaba/(pages)/desa/layanan/_com/BackButto';


function Page() {
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
                />
                <TextInput py={10} placeholder='Email'
                  label='Email'
                />
                <TextInput placeholder='day / month / year'
                  label='Tanggal Lahir'
                />
                <TextInput py={10} placeholder='08xx-xxxx-xxxx'
                  label='Nomor Telepon'
                />
                <TextInput pb={10} placeholder='Password'
                  label='Password'
                />
                <Box pb={10}>
                  <Checkbox
                    
                    label="Saya menyetujui syarat dan ketentuan yang berlaku"
                  />
                </Box>
                <Box pb={20} >
                  <Button component={Link} href={'/darmasaba/pendidikan/perpustakaan-digital'} fullWidth bg={colors['blue-button']} radius={'xl'}>Daftar</Button>
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
