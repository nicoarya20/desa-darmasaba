/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import EditEditor from '@/app/admin/(dashboard)/_com/editEditor';
import stateGallery from '@/app/admin/(dashboard)/_state/desa/gallery';
import colors from '@/con/colors';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useProxy } from 'valtio/utils';
import { convertYoutubeUrlToEmbed } from '../../../lib/youtube-utils';



function EditVideo() {
  const router = useRouter();
  const [embedLink, setEmbedLink] = useState("");
  const videoState = useProxy(stateGallery.video)
  const params = useParams()
  const [formData, setFormData] = useState({
    name: videoState.findUnique.data?.name || '',
    deskripsi: videoState.findUnique.data?.deskripsi || '',
    linkVideo: videoState.findUnique.data?.linkVideo || '',
  })

  useEffect(() => {
    const loadVideo = async () => {
      const id = params?.id as string;
      if (!id) return;
      try {
        const data = await videoState.update.load(id);
        if (data) {
          setFormData({
            name: data.name || '',    
            deskripsi: data.deskripsi || '',
            linkVideo: data.linkVideo || '',
          });
          const embed = convertYoutubeUrlToEmbed(data.linkVideo);
          setEmbedLink(embed || "");
        }
      } catch (error) {
        console.error('Error loading video:', error);
        toast.error('Gagal memuat data video');
      }
    };
    loadVideo();
  }, [params?.id]);

  const handleSubmit = async () => {
    try {
      videoState.update.form = {
        ...videoState.update.form,
        name: formData.name,
        deskripsi: formData.deskripsi,
        linkVideo: formData.linkVideo,
      };
      const converted = convertYoutubeUrlToEmbed(formData.linkVideo);
      if (!converted) {
        toast.error("Link YouTube tidak valid. Pastikan formatnya benar.");
        return;
      }
      await videoState.update.update();
      toast.success('Video berhasil diperbarui!');
      router.push('/admin/desa/gallery/video');
    } catch (error) {
      console.error('Error updating video:', error);
      toast.error('Terjadi kesalahan saat memperbarui video');
    }
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
          <Title order={4}>Edit Video</Title>
          <TextInput
            label={<Text fw={"bold"} fz={"sm"}>Judul Video</Text>}
            placeholder='Masukkan judul video'
            value={formData.name}
            onChange={(val) => {
              setFormData({
                ...formData,
                name: val.target.value,
              })
            }}
          />
          <Box>
            <TextInput
              label="Link Video YouTube"
              placeholder="https://www.youtube.com/watch?v=abc123"
              value={formData.linkVideo}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  linkVideo: e.currentTarget.value,
                })
                const embed = convertYoutubeUrlToEmbed(e.currentTarget.value);
                setEmbedLink(embed || "");
              }}
              required
            />

            {embedLink && (
              <iframe
                className="rounded"
                width="100%"
                height="200"
                src={embedLink}
                title="Preview Video"
                allowFullScreen
              ></iframe>
            )}
          </Box>
          <Box>
            <Text fw={"bold"} fz={"sm"}>Deskripsi Video</Text>
            <EditEditor
              value={formData.deskripsi}
              onChange={(val) => {
                setFormData({
                  ...formData,
                  deskripsi: val,
                })
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

export default EditVideo;
