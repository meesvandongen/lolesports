"use client";

import { components } from "@/api/generated";
import {
  createStyles,
  Card,
  Text,
  SimpleGrid,
  UnstyledButton,
  Anchor,
  Group,
  rem,
  clsx,
} from "@mantine/core";
import Image from "next/image";
import Link from "next/link";

const useStyles = createStyles((theme) => ({
  // card: {
  //   backgroundColor:
  //     theme.colorScheme === "dark"
  //       ? theme.colors.dark[6]
  //       : theme.colors.gray[0],
  // },

  item: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    borderRadius: theme.radius.md,
    height: rem(70),
    width: rem(90),
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
    transition: "box-shadow 150ms ease, transform 100ms ease",

    "&:hover": {
      boxShadow: theme.shadows.md,
      transform: "scale(1.05)",
    },
  },
}));

interface RegionCardProps {
  items: (components["schemas"]["extendedLeague"] & {
    /**
     * @description Indicates which type of tournament the league is. Whether
     * international or a regional tournament. The region name is
     * given.
     */
    region: string;
  })[];
  title: string;
  className?: string;
  cols?: number;
}

export function RegionCard({
  items,
  title,
  className,
  cols = 4,
}: RegionCardProps) {
  const { classes } = useStyles();
  return (
    <Card
      withBorder
      radius="sm"
      className={clsx(
        className,
        // "bg-gray-800/90 backdrop-blur-md backdrop-filter"
        "p-2 pt-1"
      )}
    >
      <Group position="apart">
        <Text>{title}</Text>
      </Group>
      <SimpleGrid cols={cols} mt="xs" spacing="xs">
        {items.map((item) => (
          <UnstyledButton
            key={item.name}
            className={classes.item}
            component={Link}
            href={`/leagues/${item.id}`}
          >
            <Image src={item.image} alt={item.name} width={30} height={30} />
            <Text size="xs" mt={2}>
              {item.name}
            </Text>
          </UnstyledButton>
        ))}
      </SimpleGrid>
    </Card>
  );
}
