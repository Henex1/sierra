import * as React from "react";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import EditIcon from '@material-ui/icons/Edit';
import Chip from "@material-ui/core/Chip";
import BlurLinearIcon from "@material-ui/icons/BlurLinear";

import {
  authenticatedPage,
  requireNumberParam,
} from "../../../lib/pageHelpers";
import {
  formatExtendedProject,
  getExtendedProject,
  ExtendedProject,
} from "../../../lib/projects";
import { ExposedSearchEndpoint, formatSearchEndpoint, getSearchEndpoint } from "../../../lib/searchendpoints";

import Link, { LinkButton } from "../../../components/common/Link";
import { useActiveProject } from "../../../components/Session";
import BreadcrumbsButtons from "../../../components/common/BreadcrumbsButtons";
import ProjectJudgementsTable from "../../../components/projects/ProjectJudgementsTable";
import ProjectRulesetsTable from "../../../components/projects/ProjectRulesetsTable";
import FlaskIcon from "../../../components/common/FlaskIcon";

export const getServerSideProps = authenticatedPage(async (context) => {
  const id = requireNumberParam(context, "id");
  const project = await getExtendedProject(context.user, id);
  if (!project) {
    return { notFound: true };
  }
  const searchEndpoint = await getSearchEndpoint(context.user, project.searchEndpointId);
  if (!searchEndpoint) {
    return { notFound: true };
  }

  return {
    props: {
      projectData: formatExtendedProject(project),
      searchEndpoint: formatSearchEndpoint(searchEndpoint)
    }
  };
});

type Props = {
  projectData: ExtendedProject;
  searchEndpoint: ExposedSearchEndpoint;
};

const useStyles = makeStyles((theme) => ({
  headerWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  },
  titleWrapper: {
    display: "flex",
    alignItems: "center"
  },
  activeChipRoot: {
    color: "white",
    backgroundColor: green[700],
    marginLeft: theme.spacing(3)
  },
  testbedButton: {
    marginRight: theme.spacing(3)
  },
  detailsWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  }
}));

export default function ViewProject({ projectData, searchEndpoint }: Props) {
  const classes = useStyles();
  const { project } = useActiveProject();

  return (
    <div>
      <BreadcrumbsButtons>
        <Link href="/">Home</Link>
        <Link href="/projects">Projects</Link>
        <Typography>{projectData.name}</Typography>
      </BreadcrumbsButtons>
      <Grid container spacing={3}>
        <Grid item xs={12} className={classes.headerWrapper}>
          <div className={classes.titleWrapper}>
            <Typography variant="h4">Project: {projectData.name}</Typography>
            {projectData.id === project?.id &&
              <Chip
                color="primary"
                label="Active"
                classes={{
                  root: classes.activeChipRoot
                }}
              />
            }
          </div>
          <div>
            <LinkButton
              className={classes.testbedButton}
              href="/testbed"
              size="large"
              variant="contained"
              color="primary"
              startIcon={<BlurLinearIcon />}
            >
              Open Testbed
            </LinkButton>
            <LinkButton
              href={`/${projectData.id}/lab`}
              size="large"
              variant="contained"
              color="primary"
              startIcon={<FlaskIcon />}
            >
              Go To Lab
            </LinkButton>
          </div>
        </Grid>
        <Grid item xs={12} className={classes.detailsWrapper}>
          <Typography variant="h6">Project details</Typography>
          <LinkButton href={`/projects/${projectData.id}/edit`} variant="outlined" startIcon={<EditIcon />}>
            Edit Project
          </LinkButton>
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={4}>
              <Typography variant="overline">Name</Typography>
              <Typography variant="h5">{projectData.name}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="overline">Search Endpoint</Typography>
              <Typography variant="h5">{searchEndpoint.name}</Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} className={classes.detailsWrapper}>
          <Typography variant="h6">Judgements</Typography>
          <LinkButton href={`/judgements`} variant="outlined" startIcon={<EditIcon />}>
            Manage Judgements
          </LinkButton>
        </Grid>
        <Grid item xs={12}>
          <ProjectJudgementsTable judgements={projectData.judgements} />
        </Grid>
        <Grid item xs={12} className={classes.detailsWrapper}>
          <Typography variant="h6">Rulesets</Typography>
          <LinkButton href={`/rulesets`} variant="outlined" startIcon={<EditIcon />}>
            Manage Rulesets
          </LinkButton>
        </Grid>
        <Grid item xs={12}>
          <ProjectRulesetsTable rulesets={projectData.rulesets} />
        </Grid>
      </Grid>
    </div>
  );
}
