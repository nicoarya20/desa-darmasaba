/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import korupsiState from '@/app/admin/(dashboard)/_state/landing-page/desa-anti-korupsi';
import BackButton from '@/app/darmasaba/(pages)/desa/layanan/_com/BackButto';
import colors from '@/con/colors';
import React, { useEffect, useState } from 'react';
import { Box, Button, Container, Flex, Paper, SimpleGrid, Stack, Text, ActionIcon } from '@mantine/core';
import { IconFile } from '@tabler/icons-react';
import { useProxy } from 'valtio/utils';


function Lokal() {
  const [selectedKategori, setSelectedKategori] = useState<string>('PENGUATAN TATA LAKSANA');
  const [loading, setLoading] = useState(true);
  const state = useProxy(korupsiState);
  
  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await state.desaAntikorupsi.findMany.load(1, 100); // Load first 100 items
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Get data from state
  const data = state.desaAntikorupsi.findMany.data || [];
  
  // Debug: Log the complete data structure
  console.log('Complete data:', JSON.parse(JSON.stringify(data)));
  
  // Get unique categories
  const categories = [...new Set(
    data
      .filter(item => item.kategori?.name) // Only include items with a category name
      .map(item => item.kategori.name)
  )];
  
  // Filter data based on selected category
  const filteredData = selectedKategori === 'PENGUATAN TATA LAKSANA' 
    ? data 
    : data.filter(item => item.kategori?.name === selectedKategori);
    
  // Debug: Log filtered data
  console.log('Filtered data:', JSON.parse(JSON.stringify(filteredData)));
  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap={22}>
      <Box px={{ base: "md", md: 100 }}>
        <BackButton />
      </Box>
      <Container w={{ base: "100%", md: "80%" }}>
      <Stack align="center" gap={0}>
          <Text fz={"3.4rem"} fw={"bold"}>
            Desa Anti Korupsi
          </Text>
          <Text
            py={10}
            ta={"justify"}
          >
            Desa antikorupsi mendorong pemerintahan jujur dan transparan. Keuangan desa dikelola terbuka dengan melibatkan warga mengawasi anggaran, sehingga digunakan tepat sasaran sesuai kebutuhan. Adapun beberapa jenis tata penguatan :
          </Text>
        </Stack>
      </Container>
      <Container size="lg" px={{ base: "md", md: "xl" }}>
        {/* Category Filter Buttons */}
        <Flex gap="md" justify="center" mb="xl" wrap="wrap">
          {categories.map((kategori) => (
            <Button
            color={selectedKategori === kategori ? colors['blue-button'] : 'gray'}
              key={kategori}
              variant={selectedKategori === kategori ? 'filled' : 'outline'}
              onClick={() => setSelectedKategori(kategori)}
              size="sm"
            >
              {kategori}
            </Button>
          ))}
        </Flex>
        
        {/* Loading State */}
        {loading ? (
          <Text ta="center">Memuat data...</Text>
        ) : (
          <SimpleGrid
            cols={{ base: 1, sm: 2, lg: 3 }}
            spacing="xl"
            verticalSpacing="xl"
          >
            {filteredData.map((item) => {
              console.log('Item data:', item);
              console.log('All item properties:', Object.keys(item).map(key => `${key}: ${item[key]}`).join(', '));
              
              const handleDownload = async (e: React.MouseEvent) => {
                e.stopPropagation();
                if (!item?.file?.link) return;
                
                try {
                  const fileUrl = item.file.link.startsWith('http')
                    ? item.file.link
                    : `${window.location.origin}${item.file.link.startsWith('/') ? '' : '/'}${item.file.link}`;
                  
                  window.open(fileUrl, '_blank');
                } catch (error) {
                  console.error('Error opening file:', error);
                }
              };
              
              return (
                <Paper key={item.id} p="lg" shadow="sm" radius="md" withBorder>
                  <Stack h="100%" justify="space-between">
                    <div>
                      <Text fz="lg" fw={600} mb="sm" c={colors["blue-button"]}>
                        {item.name}
                      </Text>
                    </div>
                    
                    {item?.file && (
                      <ActionIcon
                        variant="filled"
                        color={colors["blue-button"]}
                        size="lg"
                        onClick={handleDownload}
                        style={{ marginTop: 10 }}
                        title="Unduh File"
                      >
                        <IconFile size={20} />
                      </ActionIcon>
                    )}
                  </Stack>
                </Paper>
              );
            })}
          </SimpleGrid>
        )}
      </Container>
    </Stack>
  )
}

export default Lokal;


