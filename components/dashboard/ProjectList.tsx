import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from "@material-ui/core";

import { ExposedProject } from "../../lib/projects";
import Link from "../common/Link";

export type RecentProject = ExposedProject & {
  updatedAt: number;
};

type Props = {
  projects: RecentProject[];
};

export default function ProjectList({ projects }: Props) {
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
                      <b>{project.name}</b>
                    </Link>
                  </TableCell>
                  <TableCell>{`Updated ${getTimeAgo(
                    project.updatedAt
                  )}`}</TableCell>
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
