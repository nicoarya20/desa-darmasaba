'use client'
import { apiFetchLogin } from '@/app/admin/auth/_lib/api_fetch_auth';
import colors from '@/con/colors';
import { Box, Button, Center, Flex, Image, Paper, Stack, Text, Title } from '@mantine/core';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { toast } from 'react-toastify';



function Login() {
  const router = useRouter()
  const [phone, setPhone] = useState("")
  const [isError, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  async function onLogin() {
    const nomor = phone.substring(1);
    if (nomor.length <= 4) return setError(true)


    try {
      setLoading(true);
      const response = await apiFetchLogin({ nomor: nomor })
      if (response && response.success) {
        localStorage.setItem("hipmi_auth_code_id", response.kodeId);
        toast.success(response.message);
        router.push("/validasi", { scroll: false });
      } else {
        setLoading(false);
        toast.error(response?.message);
      }
    } catch (error) {
      setLoading(false)
      console.log("Error Login", error)
      toast.error("Terjadi kesalahan saat login")
    }
  }

  return (
    <Stack pos={"relative"} bg={colors.Bg}>
      <Box px={{ base: 'md', md: 100 }} pb={50}>
        <Stack align='center' justify='center' h={"100vh"}>
          <Paper p={'xl'} radius={'md'} bg={colors['white-trans-1']}>
            <Stack align='center' gap={"lg"}>
              <Box>
                <Title ta={"center"} order={2} fw={'bold'} c={colors['blue-button']}>
                  Login
                </Title>
                <Center>
                  <Image src={"/darmasaba-icon.png"} alt="" w={80} />
                </Center>
              </Box>
              <Box>
              {/* <Box mb={10}>
                <Text c={colors['blue-button']} ta={"center"} fz={"sm"} fw={'bold'}>Masuk Untuk Akses Admin</Text>
                <TextInput
                  label='Username'
                  placeholder='Username'
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </Box> */}
                <PhoneInput
                  countrySelectorStyleProps={{
                    buttonStyle: {
                      backgroundColor: colors['blue-button'],
                    },
                  }}
                  inputStyle={{ width: "100%"}}
                  defaultCountry="id"
                  onChange={(val) => {
                    setPhone(val);
                  }}
                />

                {isError ? (
                  toast.error("Masukan nomor telepon anda")
                ) : (
                  ""
                )}
                <Box py={20} >
                  <Button
                    fullWidth
                    bg={colors['blue-button']}
                    radius={'xl'}
                    onClick={onLogin}
                    loading={loading ? true : false}
                  >Masuk
                  </Button>
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
        </Stack>
      </Box>
    </Stack>
  );
}

export default Login;
