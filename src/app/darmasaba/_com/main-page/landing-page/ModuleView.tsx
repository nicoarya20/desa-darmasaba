import profileLandingPageState from "@/app/admin/(dashboard)/_state/landing-page/profile";
import { Center, Image, Paper, SimpleGrid } from "@mantine/core";
import { useShallowEffect } from "@mantine/hooks";
import { motion } from 'framer-motion';
import { useTransitionRouter } from 'next-view-transitions';
import { useProxy } from "valtio/utils";
import { Prisma } from "@prisma/client";


type ProgramInovasiItem = Prisma.ProgramInovasiGetPayload<{ include: { image: true } }>;

function ModuleItem({ data }: { data: ProgramInovasiItem }) {
  const router = useTransitionRouter();
  return (
    <Paper
      onClick={() => {
        router.push(`/${data.name}`);
      }}
      p={"md"}
      bg={"white"}
      radius={"32"}
      pos={"relative"}
    >
      <Center h={"100%"}>
        <motion.div
          whileHover={{ scale: 1.05 }}
        >
          <Image src={data.image?.link || ""} alt="icon"
            fit="contain"
            sizes="100%"
            loading="lazy"
            style={{
              objectFit: "contain",
              objectPosition: "center"
            }}
          />
        </motion.div>
      </Center>
    </Paper>
  );
}

function ModuleView() {
  const listImageState = useProxy(profileLandingPageState.programInovasi)

  useShallowEffect(() => {
    listImageState.findMany.load()
  }, [])
  return (
    <SimpleGrid
      cols={{
        base: 2,
        md: 3,
      }}
    >
      {listImageState.findMany.data?.map((item) => (
        <ModuleItem key={item.id} data={item} />
      ))}
    </SimpleGrid>
  );
}

export default ModuleView;
