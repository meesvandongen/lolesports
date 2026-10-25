import {
  ActionIcon,
  type ActionIconProps,
  Button,
  type ButtonProps,
  Menu,
  type MenuItemProps,
  NavLink,
  type NavLinkProps,
  Text,
  type TextProps,
  UnstyledButton,
  type UnstyledButtonProps,
} from "@mantine/core";
import { createLink } from "@tanstack/react-router";

// Mantine components rendered as router links. `component={Link}` would lose
// the type checking of `to`, `params` and `search`.

type AnchorProps = Omit<React.ComponentPropsWithRef<"a">, "color" | "style">;

export const NavLinkLink = createLink((props: NavLinkProps & AnchorProps) => (
  <NavLink component="a" {...props} />
));

export const MenuItemLink = createLink((props: MenuItemProps & AnchorProps) => (
  <Menu.Item component="a" {...props} />
));

export const ActionIconLink = createLink((props: ActionIconProps & AnchorProps) => (
  <ActionIcon component="a" {...props} />
));

export const ButtonLink = createLink((props: ButtonProps & AnchorProps) => (
  <Button component="a" {...props} />
));

export const TextLink = createLink((props: TextProps & AnchorProps) => (
  <Text component="a" {...props} />
));

export const UnstyledButtonLink = createLink((props: UnstyledButtonProps & AnchorProps) => (
  <UnstyledButton component="a" {...props} />
));
