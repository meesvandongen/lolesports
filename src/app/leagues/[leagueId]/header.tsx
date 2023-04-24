import {
  Header,
  MediaQuery,
  Burger,
  useMantineTheme,
  Text,
} from "@mantine/core";
import { useSideBarOpen } from "./providers";

export function AppHeader() {
  const theme = useMantineTheme();
  const { setSideBarOpen, sideBarOpen } = useSideBarOpen();
  return (
    <Header height={{ base: 50, md: 70 }} p="md">
      <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
        <MediaQuery largerThan="sm" styles={{ display: "none" }}>
          <Burger
            opened={sideBarOpen}
            onClick={() => setSideBarOpen(!sideBarOpen)}
            size="sm"
            color={theme.colors.gray[6]}
            mr="xl"
          />
        </MediaQuery>

        <Text>LOL ESPORTS</Text>
      </div>
    </Header>
  );
}
