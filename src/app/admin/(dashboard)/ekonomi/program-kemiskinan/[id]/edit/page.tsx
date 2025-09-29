/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import { IconKey } from '@/app/admin/(dashboard)/_com/iconMap';
import SelectIconProgramEdit from '@/app/admin/(dashboard)/_com/selectIconEdit';
import programKemiskinanState from '@/app/admin/(dashboard)/_state/ekonomi/program-kemiskinan';
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
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useProxy } from 'valtio/utils';
import { toast } from 'react-toastify';

function EditProgramKemiskinan() {
  const router = useRouter();
  const params = useParams() as { id: string };
  const stateProgram = useProxy(programKemiskinanState);
  const id = params.id;

  useEffect(() => {
    if (id) {
      stateProgram.findUnique.load(id).then(() => {
        const data = stateProgram.findUnique.data;
        if (data) {
          stateProgram.update.form = {
            nama: data.nama || '',
            deskripsi: data.deskripsi || '',
            icon: data.icon || '',
            statistik: {
              tahun: data.statistik?.tahun?.toString() || '',
              jumlah: data.statistik?.jumlah?.toString() || '',
            },
          };
        }
      }).catch((err) => {
        console.error("Error load data:", err);
        toast.error("Gagal mengambil data program");
      });
    }
  }, [id]);

  const handleSubmit = async () => {
    try {
      stateProgram.update.id = id;
      await stateProgram.update.update();
      toast.success("Program berhasil diperbarui!");
      router.push('/admin/ekonomi/program-kemiskinan');
    } catch (error) {
      console.error("Error update program:", error);
      toast.error("Terjadi kesalahan saat memperbarui program");
    }
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      {/* Header dengan tombol kembali */}
      <Group mb="md">
        <Tooltip label="Kembali ke halaman sebelumnya" withArrow>
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
          Edit Program Kemiskinan
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
            defaultValue={stateProgram.update.form.nama}
            onChange={(e) => {
              stateProgram.update.form.nama = e.target.value;
            }}
            label={<Text fw="bold" fz="sm">Judul Program</Text>}
            placeholder="Masukkan judul program"
            required
          />

          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Deskripsi
            </Text>
            <EditEditor
              value={stateProgram.update.form.deskripsi}
              onChange={(val) => {
                stateProgram.update.form.deskripsi = val;
              }}
            />
          </Box>

          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Ikon Program Kreatif Desa
            </Text>
            <SelectIconProgramEdit
              value={stateProgram.update.form.icon as IconKey}
              onChange={(value) => {
                stateProgram.update.form.icon = value;
              }}
            />
          </Box>

          <Box>
            <Text fw="bold" fz="sm" mb={6}>
              Statistik Jumlah Masyarakat Miskin
            </Text>
            <TextInput
              type="number"
              defaultValue={stateProgram.update.form.statistik.jumlah}
              onChange={(e) => {
                stateProgram.update.form.statistik.jumlah = e.target.value;
              }}
              label="Jumlah Masyarakat Miskin"
              placeholder="Masukkan jumlah masyarakat miskin"
              required
            />

            <TextInput
              type="number"
              defaultValue={stateProgram.update.form.statistik.tahun}
              onChange={(e) => {
                stateProgram.update.form.statistik.tahun = e.target.value;
              }}
              label="Tahun"
              placeholder="Masukkan tahun"
              required
              mt="sm"
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

export default EditProgramKemiskinan;
