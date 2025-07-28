/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import indeksKepuasanState from '@/app/admin/(dashboard)/_state/landing-page/indeks-kepuasan-masyarakat';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Select, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useProxy } from 'valtio/utils';



function CreateListGenderStat() {
  const router = useRouter();
  const stateCreate = useProxy(indeksKepuasanState.genderStatState)


  useEffect(() => {
    stateCreate.findMany.load();
    indeksKepuasanState.monthlyStatState.findMany.load();
  }, []);

  const resetForm = () => {
    stateCreate.create.form = {
      laki: 0,
      perempuan: 0,
      monthlyStatId: "",
      total: 0,
      percentLaki: 0,
      percentPerempuan: 0,
    };
  };
  const handleSubmit = async () => {
    await stateCreate.create.create();
    resetForm();
    router.push("/admin/landing-page/indeks-kepuasan-masyarakat/list-gender-stat")
  }
  return (
    <Box>
      <Box mb={10}>
        <Button onClick={() => router.back()} variant='subtle' color={'blue'}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>

      <Paper w={{ base: '100%', md: '50%' }} bg={colors['white-1']} p={'md'}>
        <Stack gap={"xs"}>
          <Title order={4}>Create List Gender Stat</Title>
          <TextInput
            value={stateCreate.create.form.laki}
            onChange={(val) => {
              stateCreate.create.form.laki = Number(val.target.value);
            }}
            label={<Text fw={"bold"} fz={"sm"}>Laki Laki</Text>}
            placeholder='Masukkan laki laki'
          />
          <TextInput
            value={stateCreate.create.form.perempuan}
            onChange={(val) => {
              stateCreate.create.form.perempuan = Number(val.target.value);
            }}
            label={<Text fw={"bold"} fz={"sm"}>Perempuan</Text>}
            placeholder='Masukkan perempuan'
          />
          <TextInput
            value={stateCreate.create.form.total}
            label={<Text fw="bold" fz="sm">Total</Text>}
            disabled
          />
          <TextInput
            value={stateCreate.create.form.percentLaki}
            label={<Text fw="bold" fz="sm">Persentase Laki Laki</Text>}
            disabled
          />
          <TextInput
            value={stateCreate.create.form.percentPerempuan}
            label={<Text fw="bold" fz="sm">Persentase Perempuan</Text>}
            disabled
          />
          <Select
            label={<Text fw="bold" fz="sm">Pilih Bulan</Text>}
            placeholder="Pilih bulanan"
            value={stateCreate.create.form.monthlyStatId}
            onChange={(value) => {
              if (value) stateCreate.create.form.monthlyStatId = value;
            }}
            data={
              indeksKepuasanState.monthlyStatState.findMany.data?.map((monthlyStat) => ({
                value: monthlyStat.id,
                label: `${monthlyStat.month} (${monthlyStat.respondentsCount} responden)`,
              })) || []
            }
          />
          <Group>
            <Button bg={colors['blue-button']} onClick={handleSubmit}>Submit</Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default CreateListGenderStat;
