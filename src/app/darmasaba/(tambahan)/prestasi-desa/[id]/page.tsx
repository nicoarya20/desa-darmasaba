/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import prestasiState from '@/app/admin/(dashboard)/_state/landing-page/prestasi-desa';
import BackButton from '@/app/darmasaba/(pages)/pemerintahan/layanan/_com/BackButto';
import { PrestasiJuara } from '@/app/darmasaba/_com/main-page/prestasi/PrestasiJuara';
import colors from '@/con/colors';
import { ActionIcon, Box, Container, Divider, Flex, Image, Skeleton, Stack, Text } from '@mantine/core';
import { IconBrandFacebook, IconBrandInstagram, IconBrandTwitter, IconBrandWhatsapp } from '@tabler/icons-react';
import { useParams, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';


function Page() {
  const params = useParams();
  const pathname = usePathname();
  const [baseUrl, setBaseUrl] = useState('');
  const state = useProxy(prestasiState.prestasiDesa);
  
  // Get base URL for sharing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
  }, []);
  useEffect(() => {
    prestasiState.kategoriPrestasi.findMany.load()
    const loadData = async () => {
      try {
        await state.findMany.load();
      } catch (error) {
        console.error('Error loading data:', error);
      }
    }
    loadData();
  }, [])

  useEffect(() => {
    state.findUnique.load(params?.id as string);
  }, [params?.id]);

  if (!state.findUnique.data) {
    return (
      <Stack py={10} px={{ base: "md", md: 100 }}>
        <Skeleton h={40} />
        <Skeleton h={300} mt="md" />
      </Stack>
    );
  }

  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"} px={{ base: "md", md: 0 }}>
      <Box px={{ base: "md", md: 100 }}><BackButton /></Box>
      <Container w={{ base: "100%", md: "50%" }}>
        {state.findUnique.data && (
          <>
            <Box pb={20} key={state.findUnique.data.id}>
              <Text 
                ta={"center"} 
                fz={{ base: "1.6rem", md: "2rem", lg: "2.25rem" }} 
                c={colors["blue-button"]} 
                fw={"bold"}
              >
                {state.findUnique.data.name}
              </Text>
              <Text ta={"center"} fw={"bold"} fz={"1.5rem"}>
                {state.findUnique.data.kategori?.name}
              </Text>
              <PrestasiJuara juara={state.findUnique.data.juara} />
            </Box>
            {state.findUnique.data.image?.link && (
              <Image 
                src={state.findUnique.data.image.link} 
                alt={state.findUnique.data.name || 'Prestasi'} 
                w={"100%"} 
                style={{ maxHeight: '500px', objectFit: 'cover' }}
                loading="lazy"
              />
            )}
            <Box mt="md">
              <Text style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: state.findUnique.data.deskripsi || '' }} />
              <Text mt="md" c="dimmed" size="sm">
                Dibuat pada: {new Date(state.findUnique.data.createdAt).toLocaleDateString('id-ID')}
              </Text>
            </Box>
          </>
        )}
      </Container>
      <Box px={{ base: "md", md: 100 }}>
        <Divider color={colors["blue-button"]} />
        <Flex justify={"space-between"} py={20}>
          <Text fz="md">
            Dibuat pada: {state.findUnique.data?.createdAt ? new Date(state.findUnique.data.createdAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            }) : '-'}
          </Text>
          <Box>
            <Flex gap={"lg"}>
              <ActionIcon 
                variant="transparent" 
                component="a"
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${baseUrl}${pathname}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on Facebook"
              >
                <IconBrandFacebook color={colors["blue-button"]} size={30} />
              </ActionIcon>
              <ActionIcon 
                variant="transparent"
                component="a"
                href={`https://www.instagram.com/?url=${encodeURIComponent(`${baseUrl}${pathname}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on Instagram"
              >
                <IconBrandInstagram color={colors["blue-button"]} size={30} />
              </ActionIcon>
              <ActionIcon 
                variant="transparent"
                component="a"
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`${baseUrl}${pathname}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on Twitter"
              >
                <IconBrandTwitter color={colors["blue-button"]} size={30} />
              </ActionIcon>
              <ActionIcon 
                variant="transparent"
                component="a"
                href={`https://wa.me/?text=${encodeURIComponent(`${baseUrl}${pathname}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on WhatsApp"
              >
                <IconBrandWhatsapp color={colors["blue-button"]} size={30} />
              </ActionIcon>
            </Flex>
          </Box>
        </Flex>
        <Divider color={colors["blue-button"]} pb={50} />
      </Box>
    </Stack>
  );
}

export default Page;
