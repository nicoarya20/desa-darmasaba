import images from "@/con/images";
import stateNav from "@/state/state-nav";
import { Center, Image, Paper, SimpleGrid } from "@mantine/core";
import { motion } from 'framer-motion';
import { useTransitionRouter } from 'next-view-transitions';


const listImageModule = Object.values(images.module);

function ModuleItem({ item }: { item: string }) {
  const router = useTransitionRouter();
  return (
    <Paper
      onClick={() => {
        stateNav.module = item;
        router.push("/module");
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
          <Image src={item} alt="icon"
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
  return (
    <SimpleGrid
      cols={{
        base: 2,
        md: 3,
      }}
    >
      {listImageModule.map((item, k) => {
        return <ModuleItem key={k} item={item} />;
      })}
    </SimpleGrid>
  );
}

export default ModuleView;
