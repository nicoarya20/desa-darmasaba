'use client'
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  TextInput,
  Title
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import CreateEditor from '../../../_com/createEditor';
import SelectIconProgram from '../../../_com/selectIcon';
import programKreatifState from '../../../_state/inovasi/program-kreatif';
import { useState } from 'react';
import { toast } from 'react-toastify';

function CreateProgramKreatifDesa() {
  const stateCreate = useProxy(programKreatifState);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to check if HTML content is empty
  const isHtmlEmpty = (html: string) => {
    // Remove all HTML tags and check if there's any text content
    const textContent = html.replace(/<[^>]*>/g, '').trim();
    return textContent === '';
  };

  // Check if form is valid
  const isFormValid = () => {
    return (
      stateCreate.create.form.name?.trim() !== '' &&
      stateCreate.create.form.icon?.trim() !== '' &&
      stateCreate.create.form.slug?.trim() !== '' &&
      !isHtmlEmpty(stateCreate.create.form.deskripsi)
    );
  };

  const resetForm = () => {
    stateCreate.create.form = {
      name: "",
      slug: "",
      deskripsi: "",
      icon: "",
    };
  };

  const handleSubmit = async () => {
    try {
      const success = await stateCreate.create.create();

      if (success) {
        resetForm();
        router.push("/admin/inovasi/program-kreatif-desa");
      }
    } catch (error) {
      console.error("Error creating program kreatif desa:", error);
      toast.error("Gagal menambahkan program kreatif desa");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      {/* Tombol kembali */}
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
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
            value={stateCreate.create.form.name || ""}
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
            value={stateCreate.create.form.slug || ""}
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
              disabled={!isFormValid() || isSubmitting}
              style={{
                background: !isFormValid() || isSubmitting
                  ? `linear-gradient(135deg, #cccccc, #eeeeee)`
                  : `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
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

export default CreateProgramKreatifDesa;
