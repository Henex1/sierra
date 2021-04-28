import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputBase,
} from "@material-ui/core";
import { createStyles, withStyles, Theme } from "@material-ui/core/styles";
import { useRouter } from "next/router";

import { useSession, useActiveProject } from "../Session";
import { ExposedProject } from "../../lib/projects";

import useStyles from "./AppTopBarStyles";

const ProjectInput = withStyles((theme: Theme) =>
  createStyles({
    input: {
      width: "250px",
      color: "white",
      borderRadius: 4,
      position: "relative",
      border: "1px solid white",
      fontSize: 16,
      padding: "10px 26px 10px 12px",
      transition: theme.transitions.create(["border-color", "box-shadow"]),
      "&:focus": {
        borderRadius: 4,
        borderColor: "white",
      },
    },
  })
)(InputBase);

export default function ProjectsMenu() {
  const classes = useStyles();
  const { session } = useSession();
  const { project, setProject } = useActiveProject();
  const router = useRouter();
  const prevProject = React.useRef<ExposedProject | null>();

  React.useEffect(() => {
    if (session?.projects && !project) {
      setProject(session?.projects[0]);
    }
  }, [session]);

  React.useEffect(() => {
    if (
      project &&
      prevProject.current &&
      project.id !== prevProject.current?.id
    ) {
      router.push(`/projects/${project.id}`);
    }
    prevProject.current = project;
  }, [project]);

  // This oddity avoids a console warning message when the session first loads.
  const selectValue =
    session?.projects && !project ? session.projects[0] : project;

  function handleChange(
    e: React.ChangeEvent<{ name?: string | undefined; value: unknown }>
  ) {
    const id = e.target.value as number;
    setProject(
      id === -1 ? null : session!.projects!.find((p) => p.id == id) ?? null
    );
  }

  return (
    <>
      {!!session?.projects?.length && (
        <FormControl variant="outlined" className={classes.projectsFormControl}>
          <InputLabel className={classes.selectLabel} id="currentProjectLabel">
            Current Project
          </InputLabel>
          <Select
            labelId="currentProjectLabel"
            id="currentProject"
            value={selectValue?.id ?? -1}
            label="Current Project"
            classes={{ icon: classes.selectIcon }}
            input={<ProjectInput />}
            onChange={handleChange}
          >
            {session.projects.map((project: ExposedProject) => (
              <MenuItem key={project.id} value={project.id}>
                {project.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </>
  );
}
