/* eslint-disable @typescript-eslint/no-unused-expressions */
'use client'
import { apiFetchRegister } from '@/app/admin/auth/_lib/api_fetch_auth';
import BackButton from '@/app/darmasaba/(pages)/desa/layanan/_com/BackButto';
import colors from '@/con/colors';
import { Box, Button, Center, Checkbox, Image, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { toast } from 'react-toastify';

function Registrasi() {
  const [phone, setPhone] = useState("")
  const router = useRouter()
  const [value, setValue] = useState("")
  const [isValue, setIsValue] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onRegistarsi() {
    if (value.length < 5) {
      toast.error("Username minimal 5 karakter!");
      return;
    }
  
    if (value.includes(" ")) {
      toast.error("Username tidak boleh ada spasi!");
      return;
    }
  
    if (!phone) {
      toast.error("Nomor telepon wajib diisi!");
      return;
    }
    
    try {
      setLoading(true);
      const respone = await apiFetchRegister({ nomor: phone, username: value });

      if (respone.success) {
        router.push("/login", { scroll: false });
        toast.success(respone.message);

      } else {
        setLoading(false);
        toast.error(respone.message);
      }
    } catch (error) {
      setLoading(false);
      console.log("Error Registrasi", error);
    }
  }
  return (
    <Stack pos={"relative"} bg={colors.Bg} gap={"22"} py={"xl"} h={"100vh"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box px={{ base: 'md', md: 100 }}>
        <Stack justify='center' align='center' h={"80vh"}>
          <Paper p={'xl'} radius={'md'} bg={colors['white-trans-1']}>
            <Stack align='center'>
              <Title order={2} fw={'bold'} c={colors['blue-button']}>
                Registrasi
              </Title>
              <Center>
                <Image loading="lazy" src={"/darmasaba-icon.png"} alt="" w={80} />
              </Center>
              <Box>
                <TextInput placeholder='Username'
                  label='Username'
                  maxLength={50}

                  error={
                    value.length > 0 && value.length < 5
                      ? "Minimal 5 karakter !"
                      : value.includes(" ")
                      ? "Tidak boleh ada spasi"
                      : isValue
                      ? "Masukan username anda"
                      : ""
                  }
                  onChange={(val) => {
                    val.currentTarget.value.length > 0 ? setIsValue(false) : "";
                    setValue(val.currentTarget.value);
                  }}
                  required

                />
                <Box py={10}>
                  <Text fz={"sm"} >Nomor Telepon</Text>
                  <PhoneInput
                    countrySelectorStyleProps={{
                      buttonStyle: {
                        backgroundColor: colors['blue-button'],
                      },
                    }}
                    inputStyle={{ width: "100%" }}
                    defaultCountry="id"
                    onChange={(val) => {
                      setPhone(val);
                    }}
                  />
                </Box>
                <Box pb={10}>
                  <Checkbox
                    label="Saya menyetujui syarat dan ketentuan yang berlaku"
                  />
                </Box>
                <Box pb={20} >
                  <Button fullWidth bg={colors['blue-button']} radius={'xl'} onClick={onRegistarsi} loading={loading ? true : false}>Daftar</Button>
                </Box>
              </Box>
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </Stack>
  );
}

export default Registrasi;
