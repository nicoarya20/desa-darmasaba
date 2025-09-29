'use client'
import prestasiState from '@/app/admin/(dashboard)/_state/landing-page/prestasi-desa';
import colors from '@/con/colors';
import { BackgroundImage, Box, Button, Center, Group, Pagination, Paper, SimpleGrid, Skeleton, Stack, Text, TextInput } from '@mantine/core';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import BackButton from '../../(pages)/desa/layanan/_com/BackButto';
import { IconSearch } from '@tabler/icons-react';
import { useState } from 'react';

function Page() {
  const state = useProxy(prestasiState.prestasiDesa);
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 500); // 500ms delay

  const { data, page, totalPages, loading, load } = state.findMany;

  useShallowEffect(() => {
    load(page, 3, debouncedSearch)
  }, [page, debouncedSearch])

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={600} radius="md" />
      </Stack>
    )
  }

  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"} >
      <Box px={{ base: "md", md: 100 }}><BackButton /></Box>
      <Group justify='space-between' px={{ base: "md", md: 100 }}>
        <Box>
          <Text fz={"2.4rem"} c={colors["blue-button"]} fw={"bold"}>
            Prestasi Desa
          </Text>
          <Text py={10}>
            Temukan berbagai prestasi dan keunggulan yang dimiliki Desa Darmasaba.
          </Text>
        </Box>
        <Box>
          <TextInput
            radius="xl"
            placeholder="Cari prestasi atau kategori prestasi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftSection={<IconSearch size={20} />}
            w={300}
            size="md"
          />
        </Box>
      </Group>
      <SimpleGrid
        px={{ base: "md", md: 100 }}
        pb={20}
        cols={{
          base: 1,
          md: 3,
        }}
      >
        {data.length === 0 ? (
          <Text fz={"1.4rem"}>Tidak ada prestasi yang ditemukan</Text>
        ) : (
          data.map((v, k) => {
            return (
              <BackgroundImage
                key={k}
                src={v.image?.link || ''}

                radius={16}
                pos={"relative"}
              >
                <Box
                  style={{
                    borderRadius: 16,
                    zIndex: 0
                  }}
                  pos={"absolute"}
                  w={"100%"}
                  h={"100%"}
                  bg={colors.trans.dark[2]}
                />
                <Stack justify='space-between' h={"100%"} gap={0} p={"lg"} pos={"relative"}>
                  <Group>
                    <Paper radius={"lg"} py={7} px={10}>
                      <Text>{v.kategori?.name}</Text>
                    </Paper>
                  </Group>
                  <Box p={"lg"}>
                    <Text
                      fw={"bold"}
                      c={"white"}
                      size={"1.8rem"}
                      style={{
                        textAlign: "center",
                        lineHeight: 1.4,
                        minHeight: '5.4rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        wordBreak: "break-word", 
                        whiteSpace: "normal"
                      }}
                      lineClamp={3}
                      dangerouslySetInnerHTML={{ __html: v.deskripsi }}
                    />
                  </Box>
                  <Group justify="center">
                    <Button px={20} radius={"100"} size="md" bg={colors["blue-button"]}
                      onClick={() => router.push(`/darmasaba/prestasi-desa/${v.id}`)}>
                      Detail
                    </Button>
                  </Group>
                </Stack>
              </BackgroundImage>
            )
          })
        )}
      </SimpleGrid>
      <Center>
        <Pagination
          value={page}
          onChange={(newPage) => {
            load(newPage, 10)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          total={totalPages}
          mt="md"
          mb="md"
          color="blue"
          radius="md"
        />
      </Center>
    </Stack>
  );
}

export default Page;
