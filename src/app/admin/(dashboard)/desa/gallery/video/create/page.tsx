'use client'
import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';
import stateGallery from '@/app/admin/(dashboard)/_state/desa/gallery';
import colors from '@/con/colors';
import { ActionIcon, Box, Button, Flex, Group, Image, Modal, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';



function CreateVideo() {
  const videoState = useProxy(stateGallery.video)
  const router = useRouter();
  const [modalHapus, setModalHapus] = useState(false);

  const resetForm = () => {
    videoState.create.form = {
      name: "",
      deskripsi: "",
      linkVideo: "",
    };
  };

  const handleSubmit = async () => {
    await videoState.create.create();
    resetForm();
    router.push("/admin/desa/gallery/video")
  };

  return (
    <Box>
      <Box mb={10}>
        <Button onClick={() => router.back()} variant='subtle' color={'blue'}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>

      <Paper w={{ base: '100%', md: '50%' }} bg={colors['white-1']} p={'md'}>
        <Stack gap={"xs"}>
          <Title order={4}>Create Video</Title>
          <TextInput
            label={<Text fw={"bold"} fz={"sm"}>Judul Video</Text>}
            placeholder='Masukkan judul video'
            value={videoState.create.form.name}
            onChange={(val) => {
              videoState.create.form.name = val.target.value;
            }}
          />
          <Box>
            <TextInput
              label={<Text fw={"bold"} fz={"sm"}>Link Video Youtube <Text span c="red" inherit>*</Text></Text>}
              placeholder='Masukkan link video youtube'
              value={videoState.create.form.linkVideo}
              onChange={(val) => {
                videoState.create.form.linkVideo = val.target.value;
              }}
            />
            <Flex pt={5} align={"center"} gap={"xs"}>
              <Text c={"dimmed"} fw={"bold"} fz={"xs"}>Cara mendapatkan link video youtube</Text>
              <ActionIcon size={"xs"} radius={"xl"} color='black' variant='filled' onClick={() => setModalHapus(true)}>
                <Text fw={"bold"} fz={"xs"} c="white">?</Text>
              </ActionIcon>
            </Flex>
          </Box>
          <Box>
            <Text fw={"bold"} fz={"sm"}>Deskripsi Video</Text>
            <CreateEditor
              value={videoState.create.form.deskripsi}
              onChange={(val) => {
                videoState.create.form.deskripsi = val;
              }}
            />
          </Box>
          <Group>
            <Button onClick={handleSubmit} bg={colors['blue-button']}>Submit</Button>
          </Group>
        </Stack>
      </Paper>

      {/* Modal Konfirmasi Hapus */}
      <Modal
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        title={<Text fw={"bold"} fz={"xl"}>Cara mendapatkan link video youtube</Text>}
      >
        <Stack gap={"xs"}>
          <Box>
          <Text fw={"bold"} fz={"lg"}>Langkah 1</Text>
          <Text fz={"sm"}>Buka video youtube yang ingin Anda bagikan lalu klik icon titik tiga</Text>
          <Image src="/video.png" w={300} alt="" />
          </Box>
          <Box>
          <Text fw={"bold"} fz={"lg"}>Langkah 2</Text>
          <Text fz={"sm"}>Klik bagikan</Text>
          <Image src="/Share.png" w={300} alt="" />
          </Box>
          <Box>
          <Text fw={"bold"} fz={"lg"}>Langkah 3</Text>
          <Text fz={"sm"}>Klik dibagian sematkan</Text>
          <Image src="/bagikanPostingan.png" w={300} alt="" />
          </Box>
          <Box>
          <Text fw={"bold"} fz={"lg"}>Langkah 4</Text>
          <Text fz={"sm"}>Lalu copy pada bagaian srcnya aja</Text>
          <Image src="/sematkan.png" w={300} alt="" />
          </Box>
        </Stack>
      </Modal>
    </Box>
  );
}

export default CreateVideo;
