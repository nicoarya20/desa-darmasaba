'use client'
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import CreateEditor from '../../../_com/createEditor';
import programKreatifState from '../../../_state/inovasi/program-kreatif';
import SelectIconProgram from '../../../_com/selectIcon';

function CreateProgramKreatifDesa() {
  const stateCreate = useProxy(programKreatifState);
  const router = useRouter();

  const resetForm = () => {
    stateCreate.create.form = {
      name: "",
      slug: "",
      deskripsi: "",
      icon: "",
    };
  };

  const handleSubmit = async () => {
    await stateCreate.create.create();
    resetForm();
    router.push("/admin/inovasi/program-kreatif-desa");
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      {/* Tombol kembali */}
      <Group mb="md">
        <Tooltip label="Kembali ke halaman sebelumnya" withArrow>
          <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
            <IconArrowBack color={colors['blue-button']} size={24} />
          </Button>
        </Tooltip>
        <Title order={4} ml="sm" c="dark">
          Tambah Program Kreatif Desa
        </Title>
      </Group>

      {/* Card Form */}
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
            label={<Text fw="bold" fz="sm">Nama Program Kreatif Desa</Text>}
            placeholder="Masukkan nama program kreatif desa"
            defaultValue={stateCreate.create.form.name || ""}
            onChange={(e) => (stateCreate.create.form.name = e.currentTarget.value)}
            required
          />

          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Ikon Program Kreatif Desa
            </Text>
            <SelectIconProgram
              onChange={(value) => (stateCreate.create.form.icon = value)}
            />
          </Box>

          <TextInput
            label={<Text fw="bold" fz="sm">Deskripsi Singkat Program Kreatif Desa</Text>}
            placeholder="Masukkan deskripsi singkat program kreatif desa"
            defaultValue={stateCreate.create.form.slug || ""}
            onChange={(e) => (stateCreate.create.form.slug = e.currentTarget.value)}
            required
          />

          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Deskripsi Program Kreatif Desa
            </Text>
            <CreateEditor
              value={stateCreate.create.form.deskripsi}
              onChange={(htmlContent) =>
                (stateCreate.create.form.deskripsi = htmlContent)
              }
            />
          </Box>

          {/* Tombol Submit */}
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

export default CreateProgramKreatifDesa;
