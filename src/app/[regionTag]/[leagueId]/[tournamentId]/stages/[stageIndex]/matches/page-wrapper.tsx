import { createStyles } from "@mantine/core";

const useStyles = createStyles((theme) => ({
  pageWrapper: {
    display: "grid",
  },
}));

export default function PageWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { classes } = useStyles();

  return <div className={classes.pageWrapper}>{children}</div>;
}
