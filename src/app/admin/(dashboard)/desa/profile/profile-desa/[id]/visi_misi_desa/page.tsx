/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import stateProfileDesa from '@/app/admin/(dashboard)/_state/desa/profile';
import colors from '@/con/colors';
import { Box, Button, Center, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';

function Page() {
  const visiMisiState = useProxy(stateProfileDesa.visiMisiDesa)
  const router = useRouter()
  const params = useParams()
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const id = params?.id as string;
      if (!id) {
        toast.error("ID tidak valid");
        router.push("/admin/desa/profile/profile-desa");
        return;
      }

      const data = await visiMisiState.findUnique.load(id);
      if (data) {
        visiMisiState.update.initialize(data);
      }
    };

    loadData();

    return () => {
      visiMisiState.update.reset();
      visiMisiState.findUnique.reset(); // opsional: reset juga data lama
    };
  }, [params?.id, router]);


  const handleSubmit = async () => {
    if (isSubmitting || !visiMisiState.update.form.visi.trim()) {
      toast.error("Visi wajib diisi");
      return;
    }
    setIsSubmitting(true)
    try {
      const success = await visiMisiState.update.submit()
      if (success) {
        toast.success("Data berhasil disimpan");
        router.push("/admin/desa/profile/profile-desa");
      }
    } catch (error) {
      console.error("Error update sejarah desa:", error);
      toast.error("Terjadi kesalahan saat update sejarah desa");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleBack = () => {
    router.back()
  }

  if (
    visiMisiState.findUnique.loading ||
    !visiMisiState.findUnique.data ||
    visiMisiState.update.loading
  ) {
    return (
      <Box>
        <Center h={400}>
          <Text>Memuat data...</Text>
        </Center>
      </Box>
    );
  }
  return (
    <Box>
      <Stack gap={'xs'}>
        <Group>
          <Button variant="subtle" onClick={handleBack}>
            <IconArrowBack color={colors['blue-button']} size={20} />
          </Button>
        </Group>
        <Paper bg={colors['white-1']} p={'xs'} w={{ base: '100%', md: '50%' }}>
          <Stack gap={'xs'}>
            <Box>
              <Box>
                <Stack>
                  <Title order={4}>Edit Visi Misi Desa</Title>
                  <Text fz={"md"} fw={"bold"}>Visi</Text>
                  <EditEditor
                    value={visiMisiState.update.form.visi}
                    onChange={(val) => visiMisiState.update.form.visi = val}
                  />
                  <Box>
                    <Text fz={"md"} fw={"bold"}>Misi</Text>
                    <EditEditor
                      value={visiMisiState.update.form.misi}
                      onChange={(val) => visiMisiState.update.form.misi = val}
                    />
                  </Box>
                  <Group>
                    <Button
                      onClick={handleSubmit}
                      bg={colors['blue-button']}
                    >
                      Submit
                    </Button>
                  </Group>
                </Stack>
              </Box>
            </Box>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}

export default Page;
