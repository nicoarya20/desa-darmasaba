/* eslint-disable react-hooks/exhaustive-deps */
import stateLayananDesa from '@/app/admin/(dashboard)/_state/desa/layananDesa';
import colors from '@/con/colors';
import { ActionIcon, Box, Divider, Flex, Skeleton, Text } from '@mantine/core';
import { IconBrandFacebook, IconBrandInstagram, IconBrandTwitter, IconBrandWhatsapp } from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';

function PelayananPendudukNonPermanent() {
  const state = useProxy(stateLayananDesa)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        await state.pelayananPendudukNonPermanen.findById.load('1')
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const data = state.pelayananPendudukNonPermanen.findById.data
  return (
    <Box>
      {loading ? (
        <Skeleton h={500} />
      ) : (
        <Box>
          <Box py={15}>
            <Text fz={{ base: "h4", md: "h3" }} fw={"bold"}>{data?.name}</Text>
          </Box>
          <Text pb={20} fz={{ base: "sm", md: 'h3' }} ta={"justify"} dangerouslySetInnerHTML={{__html: data?.deskripsi || ''}} />
          <Divider color={colors["blue-button"]} />
          <Flex justify={"space-between"} py={20}>
            <Text fz={{ base: "sm", md: 'h3' }}>25 May 2021 . Darmasaba</Text>
            <Box>
              <Flex gap={"lg"}>
                <ActionIcon variant='transparent'>
                  <IconBrandFacebook color={colors["blue-button"]} size={"30"} />
                </ActionIcon>
                <ActionIcon variant='transparent'>
                  <IconBrandInstagram color={colors["blue-button"]} size={"30"} />
                </ActionIcon>
                <ActionIcon variant='transparent'>
                  <IconBrandTwitter color={colors["blue-button"]} size={"30"} />
                </ActionIcon>
                <ActionIcon variant='transparent'>
                  <IconBrandWhatsapp color={colors["blue-button"]} size={"30"} />
                </ActionIcon>
              </Flex>
            </Box>
          </Flex>
          <Divider color={colors["blue-button"]} pb={50} />
        </Box>
      )}
    </Box>
  );
}

export default PelayananPendudukNonPermanent;
