import { Container, Text, Title } from "@mantine/core";
import classes from "./not-found.module.css";

export function NotFound({ title, description }: { title: string; description?: string }) {
  return (
    <div className={classes.root}>
      <Container>
        <div className={classes.label}>404</div>
        <Title className={classes.title}>{title}</Title>
        {description && (
          <Text size="lg" ta="center" className={classes.description}>
            {description}
          </Text>
        )}
      </Container>
    </div>
  );
}
