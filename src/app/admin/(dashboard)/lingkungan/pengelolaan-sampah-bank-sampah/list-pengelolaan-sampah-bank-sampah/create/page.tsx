'use client';
import pengelolaanSampahState from '@/app/admin/(dashboard)/_state/lingkungan/pengelolaan-sampah';
import SelectIconProgram from '@/app/admin/(dashboard)/_com/selectIcon';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title, Tooltip } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';




function CreatePengelolaanSampahBankSampah() {
  const stateCreate = useProxy(pengelolaanSampahState.pengelolaanSampah);
  const router = useRouter();

  const resetForm = () => {
    stateCreate.create.form = {
      name: "",
      icon: "",
    };
  };

  const handleSubmit = async () => {
    try {
      await stateCreate.create.create();
      resetForm();
      router.push("/admin/lingkungan/pengelolaan-sampah-bank-sampah/list-pengelolaan-sampah-bank-sampah");
    } catch (error) {
      console.error('Error creating pengelolaan sampah:', error);
    }
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      <Group mb="md">
        <Tooltip label="Kembali ke halaman sebelumnya" color="blue" position="bottom">
          <Button 
            variant="subtle" 
            onClick={() => router.back()} 
            p="xs" 
            radius="md"
          >
            <IconArrowBack color={colors['blue-button']} size={24} />
          </Button>
        </Tooltip>
        <Title order={4} ml="sm" c="dark">
          Tambah Pengelolaan Sampah Bank Sampah
        </Title>
      </Group>

      <Paper
        w={{ base: '100%', md: '50%' }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
        style={{ border: '1px solid #e0e0e0' }}
      >
        <Stack gap="md">
          <TextInput
            label="Nama Pengelolaan Sampah"
            placeholder="Masukkan nama pengelolaan sampah"
            value={stateCreate.create.form.name || ''}
            onChange={(e) => (stateCreate.create.form.name = e.target.value)}
            required
          />

          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Pilih Ikon
            </Text>
            <SelectIconProgram 
              onChange={(value) => (stateCreate.create.form.icon = value)}
            />
          </Box>

          <Group justify="right" mt="md">
            <Button
              onClick={handleSubmit}
              radius="md"
              size="md"
              style={{
                background: `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
                color: '#fff',
                boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)',
              }}
            >
              Simpan
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default CreatePengelolaanSampahBankSampah;
