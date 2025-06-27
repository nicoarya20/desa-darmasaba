'use client'
import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';
import artikelKesehatanState from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/artikelKesehatan';
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';


function CreateArtikelKesehatan() {
  const stateArtikelKesehatan = useProxy(artikelKesehatanState)
  const router = useRouter();


  const resetForm = () => {
    stateArtikelKesehatan.create.form = {
      title: "",
      content: "",
      introduction: {
        content: "",
      },
      symptom: {
        title: "",
        content: "",
      },
      prevention: {
        title: "",
        content: "",
      },
      firstAid: {
        title: "",
        content: "",
      },
      mythVsFact: {
        title: "",
        mitos: "",
        fakta: "",
      },
      doctorSign: {
        content: ""
      }
    };
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await stateArtikelKesehatan.create.submit();

    toast.success("Data berhasil disimpan");
    resetForm();
    // After successful submission, redirect to the list page
    router.push('/admin/kesehatan/data-kesehatan-warga/artikel_kesehatan');
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Box mb={10}>
        <Button variant="subtle" onClick={() => router.back()}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>

      <Paper bg={colors['white-1']} p="md" w={{ base: '100%', md: '50%' }}>
        <Stack gap="xs">
          <Title order={3}>Create Artikel Kesehatan</Title>
          <TextInput
            label={<Text fz="sm" fw="bold">Judul</Text>}
            placeholder="masukkan judul"
            value={stateArtikelKesehatan.create.form.title}
            onChange={(e) => {
              stateArtikelKesehatan.create.form.title = e.target.value;
            }}
          />
          <TextInput
            label={<Text fz="sm" fw="bold">Deskripsi</Text>}
            placeholder="masukkan deskripsi"
            value={stateArtikelKesehatan.create.form.content}
            onChange={(e) => {
              stateArtikelKesehatan.create.form.content = e.target.value;
            }}
          />
          <TextInput
            label={<Text fz="sm" fw="bold">Pendahuluan</Text>}
            placeholder="masukkan pendahuluan"
            value={stateArtikelKesehatan.create.form.introduction.content}
            onChange={(e) => {
              stateArtikelKesehatan.create.form.introduction.content = e.target.value;
            }}
          />
          <Box>
          <Text fz="md" fw="bold">Gejala</Text>
            <Stack gap="xs">
              <TextInput
                label={<Text fz="sm" fw="bold">Judul</Text>}
                placeholder="masukkan judul gejala penyakit"
                value={stateArtikelKesehatan.create.form.symptom.title}
                onChange={(e) => {
                  stateArtikelKesehatan.create.form.symptom.title = e.target.value;
                }}
              />
              <Box>
                <Text fz="sm" fw="bold">Deskripsi Gejala</Text>
                <CreateEditor
                  value={stateArtikelKesehatan.create.form.symptom.content}
                  onChange={(e) => {
                    stateArtikelKesehatan.create.form.symptom.content = e;
                  }}
                />
              </Box>
            </Stack>
          </Box>

          <Box>
            <Text fz="md" fw="bold">Pencegahan</Text>
            <TextInput
              label={<Text fz="sm" fw="bold">Judul</Text>}
              placeholder="masukkan judul"
              value={stateArtikelKesehatan.create.form.prevention.title}
              onChange={(e) => {
                stateArtikelKesehatan.create.form.prevention.title = e.target.value;
              }}
            />
            <CreateEditor
              value={stateArtikelKesehatan.create.form.prevention.content}
              onChange={(e) => {
                stateArtikelKesehatan.create.form.prevention.content = e;
              }}
            />
          </Box>
          <Box>
            <Text fz="md" fw="bold">Pertolongan Pertama</Text>
            <TextInput
              label={<Text fz="sm" fw="bold">Judul</Text>}
              placeholder="masukkan judul"
              value={stateArtikelKesehatan.create.form.firstAid.title}
              onChange={(e) => {
                stateArtikelKesehatan.create.form.firstAid.title = e.target.value;
              }}
            />
            <CreateEditor
              value={stateArtikelKesehatan.create.form.firstAid.content}
              onChange={(e) => {
                stateArtikelKesehatan.create.form.firstAid.content = e;
              }}
            />
          </Box>
          <Box>
            <Text fz="md" fw="bold">Mitos dan Fakta</Text>
            <TextInput
              label={<Text fz="sm" fw="bold">Judul</Text>}
              placeholder="masukkan judul"
              value={stateArtikelKesehatan.create.form.mythVsFact.title}
              onChange={(e) => {
                stateArtikelKesehatan.create.form.mythVsFact.title = e.target.value;
              }}
            />
            <Box>
              <Text>
                Mitos
              </Text>
              <CreateEditor
                value={stateArtikelKesehatan.create.form.mythVsFact.mitos}
                onChange={(e) => {
                  stateArtikelKesehatan.create.form.mythVsFact.mitos = e;
                }}
              />
            </Box>
            <Box>
              <Text>
                Fakta
              </Text>
              <CreateEditor
                value={stateArtikelKesehatan.create.form.mythVsFact.fakta}
                onChange={(e) => {
                  stateArtikelKesehatan.create.form.mythVsFact.fakta = e;
                }}
              />
            </Box>
          </Box>
          <Box>
            <Text fz="md" fw="bold">Kapan Harus Ke Dokter</Text>
            <CreateEditor
              value={stateArtikelKesehatan.create.form.doctorSign.content}
              onChange={(e) => {
                stateArtikelKesehatan.create.form.doctorSign.content = e;
              }}
            />
          </Box>

          <Button onClick={handleSubmit} bg={colors['blue-button']}>
            Simpan
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default CreateArtikelKesehatan;
