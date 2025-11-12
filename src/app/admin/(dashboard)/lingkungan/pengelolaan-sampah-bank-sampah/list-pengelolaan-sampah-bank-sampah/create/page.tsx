'use client';
import SelectIconProgram from '@/app/admin/(dashboard)/_com/selectIcon';
import pengelolaanSampahState from '@/app/admin/(dashboard)/_state/lingkungan/pengelolaan-sampah';
import colors from '@/con/colors';
import { Box, Button, Group, Loader, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';

function CreatePengelolaanSampahBankSampah() {
  const stateCreate = useProxy(pengelolaanSampahState.pengelolaanSampah);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    stateCreate.create.form = {
      name: "",
      icon: "",
    };
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await stateCreate.create.create();
      resetForm();
      router.push("/admin/lingkungan/pengelolaan-sampah-bank-sampah/list-pengelolaan-sampah-bank-sampah");
    } catch (error) {
      console.error('Error creating pengelolaan sampah:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      <Group mb="md">
          <Button 
            variant="subtle" 
            onClick={() => router.back()} 
            p="xs" 
            radius="md"
          >
            <IconArrowBack color={colors['blue-button']} size={24} />
          </Button>
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
              variant="outline"
              color="gray"
              radius="md"
              size="md"
              onClick={resetForm}
            >
              Reset
            </Button>

            {/* Tombol Simpan */}
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
              {isSubmitting ? <Loader size="sm" color="white" /> : 'Simpan'}
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default CreatePengelolaanSampahBankSampah;
