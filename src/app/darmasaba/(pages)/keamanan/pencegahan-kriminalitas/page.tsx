import colors from '@/con/colors';
import { Box, Button, Flex, Group, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import BackButton from '../../desa/layanan/_com/BackButto';
import { IconArrowRight } from '@tabler/icons-react';

function Page() {
  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap={22}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <SimpleGrid
        px={{ base: 20, md: 100 }}
        cols={{ base: 1, md: 2 }}
        spacing="xl"
      >
        <Box pt={{ base: 0, md: 35 }}>
          <Text c={colors['blue-button']} fz={{ base: 'h4', md: 'h3' }}>
            Community Safety & Crime Prevention
          </Text>
          <Text fz={{ base: 'h1', md: '2.5rem' }} c={colors['blue-button']} fw="bold">
            Emergency Contacts
          </Text>
          <Group>
            <Button
              rightSection={<IconArrowRight />}
              mt={20}
              radius="xl"
              size="md"
              bg={colors['blue-button']}
              c={colors['white-1']}
            >
              View Details
            </Button>
          </Group>
        </Box>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
          <Paper p="lg" radius="xl" shadow="md">
            <Text c={colors['blue-button']} fw="bold" fz={{ base: 'h4', md: 'h3' }}>
              How to Keep Your Neighborhood Safe
            </Text>
            <Text fz={{ base: 'h5', md: 'h4' }} c={colors['blue-button']} mt="sm">
              Practical safety habits everyone can apply daily to reduce risks.
            </Text>
            <Group>
              <Button
                rightSection={<IconArrowRight />}
                mt={20}
                radius="xl"
                size="md"
                bg={colors['blue-button']}
                c={colors['white-1']}
              >
                Learn More
              </Button>
            </Group>
          </Paper>
          <Paper p="lg" radius="xl" shadow="md">
            <Text c={colors['blue-button']} fw="bold" fz={{ base: 'h4', md: 'h3' }}>
              Recognizing Criminal Activities
            </Text>
            <Text fz={{ base: 'h5', md: 'h4' }} c={colors['blue-button']} mt="sm">
              Key warning signs and behavior patterns you should stay aware of.
            </Text>
            <Group>
              <Button
                rightSection={<IconArrowRight />}
                mt={20}
                radius="xl"
                size="md"
                bg={colors['blue-button']}
                c={colors['white-1']}
              >
                Learn More
              </Button>
            </Group>
          </Paper>
        </SimpleGrid>
        <Paper p="xl" radius="xl" shadow="lg">
          <Text fz={{ base: 'h3', md: 'h2' }} c={colors['blue-button']} fw="bold">
            Ongoing Security Programs
          </Text>
          <Stack pt={30} gap="lg">
            {['Night Patrol', 'Neighborhood Watch', 'Emergency Preparedness'].map((program, i) => (
              <Paper key={i} p="md" bg={colors['blue-button']} radius="md" shadow="sm">
                <Flex align="center" justify="space-between">
                  <Text fz="h3" c={colors['white-1']}>
                    {program}
                  </Text>
                  <IconArrowRight size={28} color={colors['white-1']} />
                </Flex>
              </Paper>
            ))}
            <Box pt={25}>
              <Button
                fullWidth
                radius="xl"
                size="md"
                bg={colors['blue-button']}
                rightSection={<IconArrowRight size={20} color={colors['white-1']} />}
              >
                Explore More Programs
              </Button>
            </Box>
          </Stack>
        </Paper>
        <Box>
          <Paper p="xl" radius="xl" shadow="lg">
            <Box style={{ maxWidth: 560, width: '100%', aspectRatio: '16/9' }}>
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/p5OkdBgasWA?si=6lFKXeE9LN5zcJQq"
                title="Community Safety Patrol"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              />
            </Box>
            <Text py={10} fz={{ base: 'h3', md: 'h2' }} fw="bold" c={colors['blue-button']}>
              Darmasaba Night Patrol
            </Text>
            <Text fz="h4" c={colors['blue-button']}>
              A closer look at how the community works together to maintain safety.
            </Text>
            <Box pt={10}>
              <Button
                radius="xl"
                size="md"
                bg={colors['blue-button']}
                rightSection={<IconArrowRight size={20} color={colors['white-1']} />}
              >
                Watch More Videos
              </Button>
            </Box>
          </Paper>
        </Box>
      </SimpleGrid>
    </Stack>
  );
}

export default Page;
