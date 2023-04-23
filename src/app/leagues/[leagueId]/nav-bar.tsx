import {
  Avatar,
  Group,
  Navbar,
  ScrollArea,
  Text,
  UnstyledButton,
  createStyles,
  getStylesRef,
  rem,
} from "@mantine/core";
import { useSideBarOpen } from "./providers";
import { components } from "@/api/generated";
import Link from "next/link";
import upperCase from "lodash.uppercase";
import image from "next/image";
import { TbChevronLeft } from "react-icons/tb";

const useStyles = createStyles((theme) => ({
  navbar: {
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
  },

  title: {
    textTransform: "uppercase",
    letterSpacing: rem(-0.25),
  },

  link: {
    ...theme.fn.focusStyles(),
    display: "flex",
    alignItems: "center",
    textDecoration: "none",
    fontSize: theme.fontSizes.sm,
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[1]
        : theme.colors.gray[7],
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    borderRadius: theme.radius.sm,
    fontWeight: 500,

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
      color: theme.colorScheme === "dark" ? theme.white : theme.black,

      [`& .${getStylesRef("icon")}`]: {
        color: theme.colorScheme === "dark" ? theme.white : theme.black,
      },
    },
  },

  linkIcon: {
    ref: getStylesRef("icon"),
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[2]
        : theme.colors.gray[6],
    marginRight: theme.spacing.sm,
  },

  linkActive: {
    "&, &:hover": {
      backgroundColor: theme.fn.variant({
        variant: "light",
        color: theme.primaryColor,
      }).background,
      color: theme.fn.variant({ variant: "light", color: theme.primaryColor })
        .color,
      [`& .${getStylesRef("icon")}`]: {
        color: theme.fn.variant({ variant: "light", color: theme.primaryColor })
          .color,
      },
    },
  },

  header: {
    borderBottom: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[3]
    }`,
    paddingBottom: theme.spacing.md,
  },
  user: {
    display: "block",
    width: "100%",
    padding: theme.spacing.md,
    color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[8]
          : theme.colors.gray[0],
    },
  },
}));

export function AppNavBar({
  tournaments,
}: {
  tournaments: components["schemas"]["tournament"][];
}) {
  const { classes, cx } = useStyles();
  const { sideBarOpen } = useSideBarOpen();
  return (
    <Navbar
      p="md"
      hiddenBreakpoint="sm"
      hidden={!sideBarOpen}
      width={{ sm: 200, lg: 300 }}
    >
      <Navbar.Section className={classes.header}>
        <UnstyledButton className={classes.user} component={Link} href="/">
          <Group>
            <TbChevronLeft size="0.9rem" />
            <div style={{ flex: 1 }}>
              <Text color="dimmed" size="xs">
                Back
              </Text>
            </div>
          </Group>
        </UnstyledButton>
      </Navbar.Section>

      <Navbar.Section grow mt="md" component={ScrollArea}>
        {tournaments.map((tournament) => (
          <UnstyledButton
            component={Link}
            className={cx(classes.link, {
              //   [classes.linkActive]: tournament.label === active,
            })}
            href={`/tournaments/${tournament.id}`}
            key={tournament.slug}
          >
            <Text>{upperCase(tournament.slug)}</Text>
          </UnstyledButton>
        ))}
      </Navbar.Section>
    </Navbar>
  );
}
