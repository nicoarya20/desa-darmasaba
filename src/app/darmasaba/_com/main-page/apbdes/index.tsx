/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import apbdesState from '@/app/admin/(dashboard)/_state/landing-page/apbdes'
import colors from '@/con/colors'
import {
  Box,
  Button,
  Divider,
  Group,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Title,
  LoadingOverlay,
  Transition,
} from '@mantine/core'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useProxy } from 'valtio/utils'

import { ApbdesMainSkeleton } from './components/apbdesSkeleton'
import ComparisonChart from './lib/comparisonChart'
import GrafikRealisasi from './lib/grafikRealisasi'
import PaguTable from './lib/paguTable'
import RealisasiTable from './lib/realisasiTable'

const MotionStack = motion.create(Stack)

function Apbdes() {
  const state = useProxy(apbdesState)
  const [selectedYear, setSelectedYear] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isChangingYear, setIsChangingYear] = useState(false)

  const textHeading = {
    title: 'APBDes',
    des: 'Transparansi APBDes Darmasaba adalah langkah nyata menuju tata kelola desa yang bersih, terbuka, dan bertanggung jawab.',
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        await state.findMany.load()
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const dataAPBDes = state.findMany.data || []

  const years = Array.from(
    new Set(
      dataAPBDes
        .map((item: any) => item?.tahun)
        .filter((tahun): tahun is number => typeof tahun === 'number')
    )
  )
    .sort((a, b) => b - a)
    .map((year) => ({
      value: year.toString(),
      label: `Tahun ${year}`,
    }))

  useEffect(() => {
    if (years.length > 0 && !selectedYear) {
      setSelectedYear(years[0].value)
    }
  }, [years])

  const currentApbdes = dataAPBDes.length > 0
    ? (dataAPBDes.find((item: any) => item?.tahun?.toString() === selectedYear) || dataAPBDes[0])
    : null

  const handleYearChange = (value: string | null) => {
    if (value !== selectedYear) {
      setIsChangingYear(true)
      setSelectedYear(value)
      setTimeout(() => setIsChangingYear(false), 500)
    }
  }

  return (
    <Stack p="sm" gap="xl" bg={colors.Bg} pos="relative">
      <LoadingOverlay
        visible={isLoading}
        zIndex={1000}
        overlayProps={{ radius: 'sm', blur: 2 }}
        loaderProps={{ color: colors['blue-button'], type: 'dots' }}
      />
      
      <Transition mounted={!isLoading} transition="fade" duration={600}>
        {(styles) => (
          <MotionStack
            style={styles}
            gap="xl"
          >
            <Divider c="gray.3" size="sm" />
            
            {/* 📌 HEADING */}
            <Box mt="xl">
              <Stack gap="sm">
                <Title
                  order={1}
                  ta="center"
                  c={colors['blue-button']}
                  fz={{ base: '2rem', md: '3.6rem' }}
                  lh={{ base: 1.2, md: 1.1 }}
                >
                  {textHeading.title}
                </Title>

                <Text
                  ta="center"
                  fz={{ base: '1rem', md: '1.25rem' }}
                  lh={{ base: 1.5, md: 1.55 }}
                  c="black"
                  maw={800}
                  mx="auto"
                >
                  {textHeading.des}
                </Text>
              </Stack>
            </Box>

            {/* Button Lihat Semua */}
            <Group justify="center">
              <Button
                component={Link}
                href="/darmasaba/apbdes"
                radius="xl"
                size="lg"
                variant="gradient"
                gradient={{ from: '#26667F', to: '#124170' }}
                style={{ 
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  ':hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(38, 102, 127, 0.4)',
                  },
                }}
              >
                Lihat Semua Data
              </Button>
            </Group>

            {/* COMBOBOX */}
            <Box px={{ base: 'md', md: 'sm' }}>
              <Select
                label={<Text fw={600} fz="sm">Pilih Tahun APBDes</Text>}
                placeholder="Pilih tahun"
                value={selectedYear}
                onChange={handleYearChange}
                data={years}
                w={{ base: '100%', sm: 220 }}
                searchable
                clearable
                nothingFoundMessage="Tidak ada tahun tersedia"
                disabled={isChangingYear}
              />
            </Box>

            {/* Tables & Charts */}
            {currentApbdes && currentApbdes.items && currentApbdes.items.length > 0 ? (
              <Box px={{ base: 'md', md: 'sm' }} mb="xl">
                <Transition
                  mounted={!isChangingYear}
                  transition="slide-up"
                  duration={400}
                  timingFunction="ease"
                >
                  {(styles) => (
                    <SimpleGrid 
                      cols={{ base: 1, sm: 3 }}
                      style={styles}
                    >
                      <MotionStack
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                      >
                        <PaguTable apbdesData={currentApbdes as any} />
                      </MotionStack>
                      
                      <MotionStack
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                      >
                        <RealisasiTable apbdesData={currentApbdes as any} />
                      </MotionStack>
                      
                      <MotionStack
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                      >
                        <GrafikRealisasi apbdesData={currentApbdes as any} />
                      </MotionStack>
                    </SimpleGrid>
                  )}
                </Transition>

                {/* Comparison Chart */}
                <Box mt="lg">
                  <Transition
                    mounted={!isChangingYear}
                    transition="slide-up"
                    duration={400}
                    timingFunction="ease"
                  >
                    {(styles) => (
                      <MotionStack
                        style={styles}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.4 }}
                      >
                        <ComparisonChart apbdesData={currentApbdes as any} />
                      </MotionStack>
                    )}
                  </Transition>
                </Box>
              </Box>
            ) : currentApbdes ? (
              <Box px={{ base: 'md', md: 100 }} py="xl" mb="xl">
                <Stack align="center" gap="sm">
                  <Text fz="2rem">📊</Text>
                  <Text fz="sm" c="dimmed" ta="center" lh={1.5}>
                    Tidak ada data item untuk tahun yang dipilih.
                  </Text>
                </Stack>
              </Box>
            ) : null}

            {/* Loading State for Year Change */}
            <Transition mounted={isChangingYear} transition="fade" duration={200}>
              {(styles) => (
                <Box 
                  px={{ base: 'md', md: 'sm' }} 
                  mb="xl"
                  style={styles}
                >
                  <ApbdesMainSkeleton />
                </Box>
              )}
            </Transition>
          </MotionStack>
        )}
      </Transition>
    </Stack>
  )
}

export default Apbdes
