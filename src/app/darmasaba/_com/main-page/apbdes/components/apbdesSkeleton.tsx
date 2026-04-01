import { Skeleton, Stack, Box, Group } from '@mantine/core'

export function PaguTableSkeleton() {
  return (
    <Box>
      <Skeleton height={28} width="60%" mb="md" />
      <Stack gap="xs">
        {/* Header */}
        <Group justify="space-between">
          <Skeleton height={20} width="40%" />
          <Skeleton height={20} width="30%" />
        </Group>
        
        {/* Section headers */}
        <Skeleton height={24} width="100%" mt="md" />
        <Skeleton height={20} width="90%" />
        <Skeleton height={20} width="85%" />
        <Skeleton height={20} width="80%" />
        
        <Skeleton height={24} width="100%" mt="md" />
        <Skeleton height={20} width="90%" />
        <Skeleton height={20} width="85%" />
        
        <Skeleton height={24} width="100%" mt="md" />
        <Skeleton height={20} width="90%" />
      </Stack>
    </Box>
  )
}

export function RealisasiTableSkeleton() {
  return (
    <Box>
      <Skeleton height={28} width="70%" mb="md" />
      <Stack gap="xs">
        {/* Header */}
        <Group justify="space-between">
          <Skeleton height={20} width="40%" />
          <Skeleton height={20} width="20%" />
          <Skeleton height={20} width="10%" />
        </Group>
        
        {/* Rows */}
        {[1, 2, 3, 4, 5].map((i) => (
          <Group key={i} justify="space-between">
            <Skeleton height={20} width="50%" />
            <Skeleton height={20} width="25%" />
            <Skeleton height={24} width="15%" radius="xl" />
          </Group>
        ))}
      </Stack>
    </Box>
  )
}

export function GrafikRealisasiSkeleton() {
  return (
    <Box>
      <Skeleton height={28} width="65%" mb="md" />
      <Stack gap="lg">
        {[1, 2, 3].map((i) => (
          <Stack key={i} gap="xs">
            <Group justify="space-between">
              <Skeleton height={20} width="40%" />
              <Skeleton height={20} width="15%" />
            </Group>
            <Skeleton height={16} width="100%" />
            <Skeleton height={12} width="100%" mt={4} />
            <Skeleton height={16} width="100%" radius="xl" />
          </Stack>
        ))}
      </Stack>
    </Box>
  )
}

export function SummaryCardsSkeleton() {
  return (
    <Stack gap="lg">
      <Skeleton height={28} width="50%" mb="sm" />
      {[1, 2, 3].map((i) => (
        <Stack key={i} gap="xs" p="md" style={{ border: '1px solid #e5e7eb', borderRadius: 8 }}>
          <Group justify="space-between">
            <Skeleton height={20} width="35%" />
            <Skeleton height={20} width="20%" />
          </Group>
          <Skeleton height={16} width="100%" />
          <Skeleton height={12} width="100%" mt={4} />
          <Skeleton height={16} width="100%" radius="xl" />
        </Stack>
      ))}
    </Stack>
  )
}

export function ApbdesMainSkeleton() {
  return (
    <Stack gap="xl">
      {/* Title */}
      <Skeleton height={48} width="40%" mx="auto" />
      <Skeleton height={24} width="60%" mx="auto" />
      
      {/* Select */}
      <Skeleton height={42} width={220} mx="auto" />
      
      {/* Summary Cards */}
      <SummaryCardsSkeleton />
      
      {/* Tables and Charts */}
      <Stack gap="lg">
        <PaguTableSkeleton />
        <RealisasiTableSkeleton />
        <GrafikRealisasiSkeleton />
      </Stack>
    </Stack>
  )
}
