import images from "@/con/images";
import stateNav from "@/state/state-nav";
import { Card, Image, SimpleGrid } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { useTransitionRouter } from 'next-view-transitions';


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
      h={100}
      ref={ref}
      p={"md"}
      bg={"white"}
      radius={"32"}
      style={{
        border: `2px solid ${hovered ? "lightgray" : "transparent"}`,
      }}
    >
      <Image src={item} alt="icon"
        fit="contain"
        sizes="100%"
        style={{
          objectFit:"contain",
          objectPosition:"center"
        }}
      />
    </Card>
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
