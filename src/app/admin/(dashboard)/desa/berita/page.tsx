/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import colors from '@/con/colors';
import ApiFetch from '@/lib/api-fetch';
import { ActionIcon, Box, Button, Center, FileInput, Flex, Image, Paper, Select, SimpleGrid, Skeleton, Stack, Text, TextInput, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { Prisma } from '@prisma/client';
import { IconEdit, IconImageInPicture, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import stateDashboardBerita from '../../_state/desa/berita';
import { BeritaEditor } from './_com/BeritaEditor';

function Page() {
  return (
    <Box>
      <Title order={3}>Berita</Title>
      <BeritaCreate />
      <BeritaList />
    </Box>
  );
}

// function BeritaCreate() {
//   const beritaState = useProxy(stateDashboardBerita);
//   const [previewImage, setPreviewImage] = useState<string | null>(null);
//   const [file, setFile] = useState<File | null>(null);
//   const [editorInstance, setEditorInstance] = useState<any>(null);



//   const handleSubmit = async () => {
//     if (!file) {
//       return toast.warn("Pilih file gambar terlebih dahulu");
//     }
//     if (!editorInstance) return toast.error("Editor belum siap");

//     const htmlContent = editorInstance.getHTML();
//     if (!htmlContent || htmlContent === '<p></p>') return toast.warn("Konten tidak boleh kosong");

//     beritaState.berita.create.form.content = htmlContent;
//     console.log(beritaState.berita.create.form)
//     // Upload gambar dulu
//     const res = await ApiFetch.api.fileStorage.create.post({
//       file,
//       name: file.name,
//     });

//     const uploaded = res.data?.data;
//     if (!uploaded?.id) {
//       return toast.error("Gagal upload gambar");
//     }

//     // Simpan ID gambar ke form
//     beritaState.berita.create.form.imageId = uploaded.id;

//     // Submit data berita
//     await beritaState.berita.create.create();
//   };

//   return (
//     <Box py={10}>
//       <Paper bg={colors["white-1"]} p={"md"}>
//         <Stack gap={"xs"}>
//           <SelectCategory
//             onChange={(val) => {
//               beritaState.berita.create.form.kategoriBeritaId = val.id;
//             }}
//           />
//           <TextInput
//             onChange={(val) => {
//               beritaState.berita.create.form.judul = val.target.value;
//             }}
//             label={"Judul"}
//             placeholder="masukkan judul"
//           />
//           <TextInput
//             onChange={(val) => {
//               beritaState.berita.create.form.deskripsi = val.target.value;
//             }}
//             label={"Deskripsi"}
//             placeholder="masukkan deskripsi"
//           />

//           <FileInput
//             label="Upload Gambar"
//             onChange={async (e) => {
//               if (!e) return;
//               setFile(e);
//               const base64 = await e.arrayBuffer().then((buf) =>
//                 "data:image/png;base64," + Buffer.from(buf).toString("base64")
//               );
//               setPreviewImage(base64);
//             }}
//           />
//           {previewImage ? (
//             <Image alt="" src={previewImage} w={200} h={200} />
//           ) : (
//             <Center w={200} h={200} bg={"gray"}>
//               <IconImageInPicture />
//             </Center>
//           )}

//           <BeritaEditor
//             showSubmit={false}
//             onEditorReady={(ed) => setEditorInstance(ed)}
//           />


//           <Button onClick={handleSubmit}>Simpan Berita</Button>
//         </Stack>
//       </Paper>
//     </Box>
//   );
// }

function BeritaCreate() {
  const beritaState = useProxy(stateDashboardBerita);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [editorInstance, setEditorInstance] = useState<any>(null);

  const resetForm = () => {
    // Reset state di valtio
    beritaState.berita.create.form = {
      judul: "",
      deskripsi: "",
      kategoriBeritaId: "",
      imageId: "",
      content: "",
    };

    // Reset state lokal
    setPreviewImage(null);
    setFile(null);
    if (editorInstance) {
      editorInstance.commands.setContent(""); // Kosongkan editor
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      return toast.warn("Pilih file gambar terlebih dahulu");
    }
    if (!editorInstance) return toast.error("Editor belum siap");

    const htmlContent = editorInstance.getHTML();
    if (!htmlContent || htmlContent === "<p></p>") return toast.warn("Konten tidak boleh kosong");

    beritaState.berita.create.form.content = htmlContent;

    // Upload gambar dulu
    const res = await ApiFetch.api.fileStorage.create.post({
      file,
      name: file.name,
    });

    const uploaded = res.data?.data;
    if (!uploaded?.id) {
      return toast.error("Gagal upload gambar");
    }

    // Simpan ID gambar ke form
    beritaState.berita.create.form.imageId = uploaded.id;

    // Submit data berita
    await beritaState.berita.create.create();

    toast.success("Berita berhasil disimpan!");

    // Reset form setelah submit
    resetForm();
  };

  return (
    <Box py={10}>
      <Paper bg={colors["white-1"]} p={"md"} w={{ base: "100%", md: "50%" }}>
        <Stack gap={"xs"}>
          <TextInput
            value={beritaState.berita.create.form.judul}
            onChange={(val) => {
              beritaState.berita.create.form.judul = val.target.value;
            }}
            label={<Text fz={"sm"} fw={"bold"}>Judul</Text>}
            placeholder="masukkan judul"
          />
          <SelectCategory
            onChange={(val) => {
              beritaState.berita.create.form.kategoriBeritaId = val.id;
            }}
          />
          <TextInput
            value={beritaState.berita.create.form.deskripsi}
            onChange={(val) => {
              beritaState.berita.create.form.deskripsi = val.target.value;
            }}
            label={<Text fz={"sm"} fw={"bold"}>Deskripsi</Text>}
            placeholder="masukkan deskripsi"
          />

          <FileInput
            label={<Text fz={"sm"} fw={"bold"}>Upload Gambar</Text>}
            value={file}
            onChange={async (e) => {
              if (!e) return;
              setFile(e);
              const base64 = await e.arrayBuffer().then((buf) =>
                "data:image/png;base64," + Buffer.from(buf).toString("base64")
              );
              setPreviewImage(base64);
            }}
          />
          {previewImage ? (
            <Image alt="" src={previewImage} w={200} h={200} />
          ) : (
            <Center w={200} h={200} bg={"gray"}>
              <IconImageInPicture />
            </Center>
          )}
          <Box>
            <Text fz={"sm"} fw={"bold"}>Konten</Text>
            <BeritaEditor
              showSubmit={false}
              onEditorReady={(ed) => setEditorInstance(ed)}
            />
          </Box>
          <Button onClick={handleSubmit}>Simpan Berita</Button>
        </Stack>
      </Paper>
    </Box>
  );
}




function BeritaList() {
  const beritaState = useProxy(stateDashboardBerita)
  useShallowEffect(() => {
    beritaState.berita.findMany.load()
  }, [])



  const router = useRouter()

  if (!beritaState.berita.findMany.data) return <Stack py={10}>
    {Array.from({ length: 10 }).map((v, k) => <Skeleton key={k} h={40} />)}
  </Stack>
  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <Stack>
          <Text fz={"xl"} fw={"bold"}>List Berita</Text>
          <SimpleGrid cols={{ base: 1, md: 4 }}>
            {beritaState.berita.findMany.data?.map((item) => (
              <Paper key={item.id} bg={colors['BG-trans']} p={'md'}>
                <Box >
                  <Flex justify="flex-end" mt={10}>
                    <ActionIcon
                      onClick={() => beritaState.berita.delete.byId(item.id)}
                      disabled={beritaState.berita.delete.loading}
                      color={colors['blue-button']} variant='transparent'>
                      <IconX size={20} />
                    </ActionIcon>
                    <ActionIcon onClick={() => {
                      router.push("/desa/berita/edit");
                    }} color={colors['blue-button']} variant='transparent'>
                      <IconEdit size={20} />
                    </ActionIcon>
                  </Flex>
                  <Text fw={"bold"} fz={"sm"}>
                    Kategori
                  </Text>
                  <Text>{item.kategoriBerita?.name}</Text>
                  <Text fw={"bold"} fz={"sm"}>
                    Judul
                  </Text>
                  <Text>{item.judul}</Text>
                  <Text lineClamp={1} fw={"bold"} fz={"sm"}>
                    Deskripsi
                  </Text>
                  <Text size='sm' lineClamp={2}>{item.deskripsi}</Text>
                  <Text fw={"bold"} fz={"sm"}>
                    Gambar
                  </Text>
                  <Image w={{ base: 100, md: 150 }} src={item.image?.link} alt="gambar" />
                </Box>
              </Paper>
            ))}
          </SimpleGrid>
        </Stack>
      </Paper>
    </Box>
  )
}

function SelectCategory({
  onChange,
}: {
  onChange: (value: Prisma.KategoriBeritaGetPayload<{
    select: {
      name: true;
      id: true;
    };
  }>) => void;
}) {
  const categoryState = useProxy(stateDashboardBerita.category);

  useShallowEffect(() => {
    categoryState.findMany.load();
  }, []);

  if (!categoryState.findMany.data) {
    return <Skeleton height={38} />;
  }

  return (
    <Select
      label={<Text fz={"sm"} fw={"bold"}>Kategori</Text>}
      placeholder="Pilih kategori"
      data={categoryState.findMany.data.map((item) => ({
        label: item.name,
        value: item.id,
      }))}
      onChange={(val) => {
        const selected = categoryState.findMany.data?.find((item) => item.id === val);
        if (selected) {
          onChange(selected);
        }
      }}
      searchable
      nothingFoundMessage="Tidak ditemukan"
    />
  );
}


// function SelectCategory({ onChange }: {
//   onChange: (value: Prisma.KategoriBeritaGetPayload<{
//     select: {
//       name: true,
//       id: true
//     }
//   }>) => void
// }) {
//   const beritaState = useProxy(stateDashboardBerita)
//   useShallowEffect(() => {
//     beritaState.category.findMany.load()
//   }, [])

//   if (!beritaState.category.findMany.data) return <Skeleton h={40} />
//   return <Group>
//     <Select placeholder='pilih kategori' label={<Text fz={"sm"} fw={"bold"}>Pilih Kategori</Text>} data={beritaState.category.findMany.data.map((item) => ({
//       value: item.id,
//       label: item.name
//     }))} onChange={(v) => {
//       const data = beritaState.category.findMany.data?.find((item) => item.id === v)
//       if (!data) return
//       onChange(data)
//     }} />
//   </Group>
// }

export default Page;
