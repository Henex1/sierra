import * as React from "react";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Pagination from "@material-ui/lab/Pagination";
import AddIcon from "@material-ui/icons/Add";
import { useRouter } from "next/router";
import Link from "../../components/common/Link";
import {
  authenticatedPage,
  optionalNumberQuery,
  requireActiveOrg,
} from "../../lib/pageHelpers";
import ProjectList from "../../components/dashboard/ProjectList";
import {
  countProjects,
  getRecentProjects,
  RecentProject,
} from "../../lib/projects";
import BreadcrumbsButtons from "../../components/common/BreadcrumbsButtons";

const useStyles = makeStyles((theme) => ({
  container: {
    "& a": {
      textDecoration: "none !important",
    },
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  icon: {
    marginRight: theme.spacing(1),
  },
}));

const pageSize = 5;

export const getServerSideProps = authenticatedPage(async (context) => {
  const activeOrg = await requireActiveOrg(context);
  const page = optionalNumberQuery(context, "page", 1);
  const projects = await getRecentProjects(activeOrg, context.user, {
    take: pageSize,
    skip: Math.max(pageSize * (page - 1), 0),
  });
  const projectsTotal = await countProjects(activeOrg);
  return {
    props: {
      projects,
      projectsTotal,
      page,
    },
  };
});

type Props = {
  projects: RecentProject[];
  projectsTotal: number;
  page: number;
};

export default function Projects({ projects, projectsTotal, page }: Props) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = React.useState(page);
  const classes = useStyles();
  React.useEffect(() => {
    router.push({
      pathname: router.pathname,
      query: {
        page: currentPage,
      },
    });
  }, [currentPage]);
  return (
    <Box className={classes.container}>
      <BreadcrumbsButtons>
        <Link href="/">Home</Link>
        <Typography>Projects</Typography>
      </BreadcrumbsButtons>
      <Box className={classes.buttonContainer}>
        <Link href="/projects/create">
          <Button variant="contained" color="primary">
            <AddIcon className={classes.icon} />
            Add Project
          </Button>
        </Link>
        <Pagination
          shape="rounded"
          showFirstButton={projectsTotal > 10}
          showLastButton={projectsTotal > 10}
          page={currentPage}
          count={Math.ceil(projectsTotal / pageSize)}
          onChange={(e: React.ChangeEvent<unknown>, value: number) =>
            setCurrentPage(value)
          }
          color="primary"
          size="large"
        />
      </Box>
      <ProjectList compact={false} projects={projects} />
    </Box>
  );
}
