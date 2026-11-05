/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import stateLayananDesa from '@/app/admin/(dashboard)/_state/desa/layananDesa';
import colors from '@/con/colors';
import { ActionIcon, Box, Divider, Flex, Group, Skeleton, Stack, Text, Title, Tooltip } from '@mantine/core';
import { IconBrandFacebook, IconBrandInstagram, IconBrandTwitter, IconBrandWhatsapp } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import classes from './pelayananPendudukNonPermanent.module.css';

function PelayananPendudukNonPermanent() {
  const state = useProxy(stateLayananDesa);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await state.pelayananPendudukNonPermanen.findById.load('edit');
      } catch (error) {
        console.error('Gagal memuat data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const data = state.pelayananPendudukNonPermanen.findById.data;

  return (
    <Box py="lg">
      {loading ? (
        <Stack gap="lg">
          <Skeleton height={40} radius="md" />
          <Skeleton height={200} radius="md" />
          <Skeleton height={30} radius="md" />
        </Stack>
      ) : (
        <Stack gap="xl">
          <Box>
            <Title
              order={1}
              fz={{ base: 'lg', md: 'xl' }}
              fw={700}
              lh={{ base: 1.3, md: 1.3 }}
              c="dark"
            >
              {data?.name || "Judul belum tersedia"}
            </Title>
          </Box>

          <Box>
            {data?.deskripsi ? (
              <Text
                component="div"
                className={classes.richText}
                fz={{ base: 'sm', md: 'md' }}
                lh={1.5}
                ta="justify"
                c="black"
                dangerouslySetInnerHTML={{ __html: data?.deskripsi }}
                style={{ wordBreak: "break-word", whiteSpace: "normal" }}
              />
            ) : (
              <Text fz="xs" c="gray">
                Deskripsi belum tersedia.
              </Text>
            )}
          </Box>

          <Divider color={colors["blue-button"]} size="sm" />

          <Flex justify="space-between" align="center" wrap="wrap" gap="md">
            <Text fz={{ base: 'xs', md: 'sm' }} lh={{ base: 1.4, md: 1.5 }} c="black">
              25 Mei 2021 • Darmasaba
            </Text>
            <Group gap="md">
              <Tooltip label="Bagikan ke Facebook" withArrow>
                <ActionIcon size="lg" radius="xl" variant="subtle" color="blue">
                  <IconBrandFacebook size={24} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Bagikan ke Instagram" withArrow>
                <ActionIcon size="lg" radius="xl" variant="subtle" color="pink">
                  <IconBrandInstagram size={24} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Bagikan ke Twitter" withArrow>
                <ActionIcon size="lg" radius="xl" variant="subtle" color="blue">
                  <IconBrandTwitter size={24} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Bagikan ke WhatsApp" withArrow>
                <ActionIcon size="lg" radius="xl" variant="subtle" color="green">
                  <IconBrandWhatsapp size={24} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Flex>

          <Divider color={colors["blue-button"]} size="sm" />
        </Stack>
      )}
    </Box>
  );
}

export default PelayananPendudukNonPermanent;