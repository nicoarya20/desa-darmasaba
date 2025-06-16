'use client'
import CreateEditor from '@/app/admin/(dashboard)/_com/createEditor';
import stateGallery from '@/app/admin/(dashboard)/_state/desa/gallery';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import { convertYoutubeUrlToEmbed } from '../../lib/youtube-utils';



function CreateVideo() {
  const videoState = useProxy(stateGallery.video)
  const router = useRouter();
  const [link, setLink] = useState("");
  const [embedLink, setEmbedLink] = useState("");

  const resetForm = () => {
    videoState.create.form = {
      name: "",
      deskripsi: "",
      linkVideo: "",
    };
  };
  const handleSubmit = async () => {
    const converted = convertYoutubeUrlToEmbed(videoState.create.form.linkVideo);
    if (!converted) {
      toast.error("Link YouTube tidak valid. Pastikan formatnya benar.");
      return;
    }
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
            <Stack gap={"xs"}>
              <TextInput
                label="Link Video YouTube"
                placeholder="https://www.youtube.com/watch?v=abc123"
                value={link}
                onChange={(e) => {
                  setLink(e.currentTarget.value);
                  const embed = convertYoutubeUrlToEmbed(e.currentTarget.value);
                  setEmbedLink(embed || "");
                }}
                required
              />

              {embedLink && (
                <iframe
                  style={{ borderRadius: 10, width: "100%", height: 400 }}
                  src={embedLink}
                  title="Preview Video"
                  allowFullScreen
                ></iframe>
              )}
            </Stack>
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
    </Box>
  );
}

export default CreateVideo;
