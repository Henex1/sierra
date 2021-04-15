import React from "react";

import Avatar from "@material-ui/core/Avatar";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";

import ProjectList, {
  RecentProject,
} from "../components/dashboard/ProjectList";
import TeamList from "../components/dashboard/TeamList";
import { useSession } from "../components/Session";
import { authenticatedPage } from "../lib/auth";
import { userCanAccessProject } from "../lib/projects";
import prisma from "../lib/prisma";

export const getServerSideProps = authenticatedPage<{
  projects: RecentProject[];
}>(async (context) => {
  const activeOrgId = context.user.activeOrgId;
  const orgUsers = await prisma.orgUser.findMany({
    where: {
      userId: {
        equals: context.user.id,
      },
    },
  });

  const projects = await prisma.project.findMany({
    where: userCanAccessProject(context.user, { orgId: activeOrgId }),
    include: {
      org: {
        select: {
          name: true,
          updatedAt: true,
        },
      },
      searchEndpoint: {
        select: {
          updatedAt: true,
        },
      },
      searchPhrases: {
        select: {
          updatedAt: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: 1,
      },
      queryTemplates: {
        select: {
          updatedAt: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: 1,
      },
    },
    take: 10,
  });

  return {
    props: {
      projects: projects.map((project) => {
        const {
          id,
          orgId,
          searchEndpointId,
          name,
          updatedAt,
          org,
          searchEndpoint,
          searchPhrases,
          queryTemplates,
        } = project;
        const role = orgUsers.find((orgUser) => orgUser.orgId === orgId)
          ?.role as RecentProject["org"]["role"];

        const projectLastUpdate = Math.max(
          updatedAt.valueOf(),
          org.updatedAt.valueOf(),
          searchEndpoint.updatedAt.valueOf(),
          searchPhrases[0]?.updatedAt.valueOf() || 0,
          queryTemplates[0]?.updatedAt.valueOf() || 0
        );

        return {
          id,
          orgId,
          searchEndpointId,
          name,
          updatedAt: projectLastUpdate,
          org: {
            name: org.name,
            role,
          },
        };
      }),
    },
  };
});

const useStyles = makeStyles((theme) => ({
  root: {
    margin: `${theme.spacing(5)}px 0`,
  },
  avatar: {
    width: 70,
    height: 70,
    marginRight: theme.spacing(2),
  },
}));

type Props = {
  projects: RecentProject[];
};

export default function Home({ projects }: Props) {
  const { session } = useSession();
  const classes = useStyles();

  const teams = [
    {
      id: 1,
      name: "Team A",
      role: "Admin",
      members: 4,
    },
    {
      id: 2,
      name: "Team B",
      role: "Admin",
      members: 1,
    },
    {
      id: 3,
      name: "Team C",
      role: "Admin",
      members: 13,
    },
  ];

  return (
    <div className={classes.root} data-testid="home-root">
      <Grid container alignItems="center">
        <Grid item>
          <Avatar
            className={classes.avatar}
            alt={session.user?.name || ""}
            src={session.user?.image || ""}
          />
        </Grid>
        <Grid item>
          <Typography variant="h5">{session.user?.name}</Typography>
          <Typography variant="body2" color="textSecondary">
            {session.user?.email}
          </Typography>
        </Grid>
      </Grid>

      <Box mt={5}>
        <Typography variant="h4">Teams</Typography>
      </Box>
      <TeamList teams={teams} />

      <Box mt={5} mb={1}>
        <Typography variant="h4">Recent Projects</Typography>
      </Box>
      <ProjectList projects={projects} />
    </div>
  );
}
