import {
  Header,
  MediaQuery,
  Burger,
  useMantineTheme,
  Text,
} from "@mantine/core";
import { useSideBarOpen } from "./providers";
import { Bungee } from "next/font/google";
import Link from "next/link";

const rye = Bungee({
  weight: "400",
  subsets: ["latin"],
});

export function AppHeader() {
  const theme = useMantineTheme();
  const { setSideBarOpen, sideBarOpen } = useSideBarOpen();
  return (
    <Header height={{ base: 50, md: 70 }} p="md">
      <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
        <MediaQuery largerThan="md" styles={{ display: "none" }}>
          <Burger
            opened={sideBarOpen}
            onClick={() => setSideBarOpen(!sideBarOpen)}
            size="sm"
            color={theme.colors.gray[6]}
            mr="xl"
          />
        </MediaQuery>
        <Text
          variant="gradient"
          gradient={{ from: "#00C9FF", to: "#30d38f", deg: 90 }}
          sx={{
            ...rye.style,
          }}
          ta="center"
          fz="xl"
          component={Link}
          href="/"
        >
          LOLMATH ESPORTS
        </Text>
      </div>
    </Header>
  );
}
