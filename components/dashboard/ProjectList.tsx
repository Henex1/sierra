import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Chip,
  makeStyles,
} from "@material-ui/core";
import moment from "moment";

import { Org, UserOrgRole } from "../../lib/prisma";
import { ExposedProject } from "../../lib/projects";
import Link from "../common/Link";

const useStyles = makeStyles((theme) => ({
  chip: {
    marginLeft: theme.spacing(1),
    textTransform: "capitalize",
  },
}));

export type RecentProject = ExposedProject & {
  updatedAt: number;
  org: {
    name: Org["name"];
    role: UserOrgRole;
  };
};

type Props = {
  projects: RecentProject[];
};

export default function ProjectList({ projects }: Props) {
  const classes = useStyles();

  return (
    <TableContainer>
      <Table>
        <caption>
          <Link href="/projects">View all projects</Link>
        </caption>
        <TableBody>
          {projects.length ? (
            projects
              .sort((a, b) => b.updatedAt - a.updatedAt)
              .map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <Link href={`/projects/${project.id}`}>
                      {`${project.org.name} / `}
                      <b>{project.name}</b>
                    </Link>
                    <Chip
                      label={project.org.role.toLowerCase()}
                      variant="outlined"
                      size="small"
                      className={classes.chip}
                    />
                  </TableCell>
                  <TableCell>
                    {`Updated ${moment(project.updatedAt).fromNow()}`}
                  </TableCell>
                </TableRow>
              ))
          ) : (
            <TableRow>
              <TableCell colSpan={2}>No projects</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
