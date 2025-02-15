import images from "@/con/images";
import stateNav from "@/state/state-nav";
import { Card, Image, SimpleGrid, Stack } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { useTransitionRouter } from 'next-view-transitions'


const listImageModule = Object.values(images.module);

function ModuleItem({ item }: { item: string }) {
  const router = useTransitionRouter();
  const { ref, hovered } = useHover();
  return (
    <Card
      onClick={() => {
        stateNav.module = item;
        router.push("/module");
      }}
      ref={ref}
      p={"md"}
      bg={"white"}
      radius={"32"}
      style={{
        border: `2px solid ${hovered ? "lightgray" : "transparent"}`,
      }}
    >
      <Stack justify="end" h={"100%"}>
        <Image src={item} alt="icon" fit="contain" loading="lazy" />
      </Stack>
    </Card>
  );
}

function ModuleView() {
  return (
    <SimpleGrid
      cols={{
        base: 3,
        md: 4,
      }}
    >
      {listImageModule.map((item, k) => {
        return <ModuleItem key={k} item={item} />;
      })}
    </SimpleGrid>
  );
}

export default ModuleView;
