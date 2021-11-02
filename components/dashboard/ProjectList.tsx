import React from "react";
import {
  Typography,
  makeStyles,
  Button,
  Box,
  Avatar,
  colors,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import FlaskIcon from "../common/FlaskIcon";
import InfoIcon from "@material-ui/icons/InfoOutlined";
import Link from "../common/Link";
import { RecentProject } from "../../lib/projects";
import { scaleLinear } from "d3-scale";
import { searchEndpointTypes } from "../searchendpoints/Form";

const useStyles = makeStyles((theme) => ({
  projects: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  searchLogo: {
    height: "30px",
  },
  projectCard: {
    padding: theme.spacing(3),
    color: "inherit",
    textDecoration: "none",
    border: "1px solid #eaeaea",
    borderRadius: 10,
    transition: "0.15s",
    "&:hover, &:focus, &:active": {
      color: colors.blue[500],
      borderColor: colors.blue[500],
      textDecoration: "none",
    },
    "& a": {
      textDecoration: "none !important",
    },
  },
  viewAllProjectCard: {
    padding: theme.spacing(3),
    color: "inherit",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textDecoration: "none",
    border: "1px solid #eaeaea",
    borderRadius: 10,
    transition: "0.15s",
    "&:hover, &:focus, &:active": {
      color: colors.blue[500],
      borderColor: colors.blue[500],
      textDecoration: "none",
    },
  },
  projectCardTitle: {
    marginBottom: theme.spacing(1),
    "& > span": {
      marginRight: theme.spacing(2),
    },
  },
  chip: {
    textTransform: "capitalize",
  },
  noProjectCOntainer: {
    display: "flex",
    flexDirection: "column",
  },
  icon: {
    marginRight: theme.spacing(1),
  },
  cardHeaderContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dataContainer: {
    marginBottom: 10,
  },
  avatar: {
    width: 50,
    fontSize: "18px",
    color: "#111",
  },
  button: {
    textTransform: "none",
    color: "#8BAB5E",
    "&:hover": {
      backgroundColor: "#8BAB5E26",
    },
  },
  buttonContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
}));

function getTimeAgo(date: number): string {
  const MINUTE = 60;
  const HOUR = MINUTE * 60;
  const DAY = HOUR * 24;
  const WEEK = DAY * 7;
  const MONTH = DAY * 30;
  const YEAR = DAY * 365;

  const secondsAgo = Math.round((+new Date() - date) / 1000);
  let divisor;
  let unit;

  if (secondsAgo < MINUTE) {
    return secondsAgo + " seconds ago";
  } else if (secondsAgo < HOUR) {
    [divisor, unit] = [MINUTE, "minute"];
  } else if (secondsAgo < DAY) {
    [divisor, unit] = [HOUR, "hour"];
  } else if (secondsAgo < WEEK) {
    [divisor, unit] = [DAY, "day"];
  } else if (secondsAgo < MONTH) {
    [divisor, unit] = [WEEK, "week"];
  } else if (secondsAgo < YEAR) {
    [divisor, unit] = [MONTH, "month"];
  } else if (secondsAgo > YEAR) {
    [divisor, unit] = [YEAR, "year"];
  }

  const count = Math.floor(secondsAgo / (divisor as number));
  return `${count} ${unit}${count > 1 ? "s" : ""} ago`;
}

type SearchEndpointType = {
  label: string;
  value: string;
  imageSrc: string;
  enabled: boolean;
};

function getDataLogo(text: string): SearchEndpointType {
  return searchEndpointTypes.filter((item) => item.value === text)[0];
}

const colorScale = scaleLinear<string, string>()
  .domain([0, 50, 100])
  .range([colors.red[500], colors.yellow[500], colors.green[500]]);

const MAX_PROJECTS_IN_COMPACT_MODE = 2;
type Props = {
  projects: RecentProject[];
  compact: boolean;
};

export default function Projects({ projects, compact }: Props) {
  const classes = useStyles();
  return (
    <div className={classes.projects}>
      {projects.length ? (
        <React.Fragment>
          {projects
            .slice(0, compact ? MAX_PROJECTS_IN_COMPACT_MODE : projects.length)
            .map((project) => {
              const searchType = getDataLogo(project.searchEndpointType);
              return (
                <Box className={classes.projectCard} key={project.id}>
                  <Box className={classes.cardHeaderContainer}>
                    <Typography
                      variant="h5"
                      color="textPrimary"
                      className={classes.projectCardTitle}
                    >
                      <span>{project.name}</span>
                    </Typography>

                    <Avatar
                      variant="rounded"
                      className={classes.avatar}
                      style={{
                        background:
                          typeof project?.combinedScore === "number"
                            ? colorScale(project.combinedScore)
                            : undefined,
                      }}
                    >
                      {typeof project?.combinedScore === "number"
                        ? project.combinedScore
                        : "?"}
                    </Avatar>
                  </Box>
                  <Box className={classes.dataContainer}>
                    <Typography variant="subtitle2" color="textSecondary">
                      {project.searchEndpointName}
                    </Typography>
                    <img
                      className={classes.searchLogo}
                      src={searchType.imageSrc}
                      alt={searchType.label}
                    />
                  </Box>
                  <Box className={classes.buttonContainer}>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                    >{`Updated ${getTimeAgo(project.updatedAt)}`}</Typography>
                    <Box>
                      <Link href={`/projects/${project.id}`}>
                        <Button
                          className={classes.button}
                          startIcon={<InfoIcon />}
                        >
                          Details
                        </Button>
                      </Link>
                      <Link href={`/${project.id}/lab`}>
                        <Button
                          className={classes.button}
                          startIcon={<FlaskIcon />}
                        >
                          Go to Lab
                        </Button>
                      </Link>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          {compact && projects.length > MAX_PROJECTS_IN_COMPACT_MODE && (
            <Link href="/projects" className={classes.viewAllProjectCard}>
              <Typography variant="h5" className={classes.projectCardTitle}>
                View all
              </Typography>
            </Link>
          )}
        </React.Fragment>
      ) : (
        <React.Fragment>
          <Box>
            <Typography style={{ marginBottom: 10 }}>
              No projects yet.
            </Typography>
            {compact && (
              <Link href="/projects/create">
                <Button variant="contained" color="primary">
                  <AddIcon className={classes.icon} />
                  Add Project
                </Button>
              </Link>
            )}
          </Box>
        </React.Fragment>
      )}
    </div>
  );
}
