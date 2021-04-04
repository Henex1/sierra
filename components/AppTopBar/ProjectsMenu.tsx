import React from "react";

import { FormControl, InputLabel, Select, MenuItem, InputBase } from "@material-ui/core";
import { createStyles, withStyles, Theme } from '@material-ui/core/styles';
import LibraryBooksIcon from '@material-ui/icons/LibraryBooks';

import useStyles from "./AppTopBarStyles";

const ProjectInput = withStyles((theme: Theme) =>
  createStyles({

    input: {
      width: "250px",
      color: "white",
      borderRadius: 4,
      position: 'relative',
      border: '1px solid white',
      fontSize: 16,
      padding: '10px 26px 10px 12px',
      transition: theme.transitions.create(['border-color', 'box-shadow']),
      '&:focus': {
        borderRadius: 4,
        borderColor: "white",
      },
    }
  }),
)(InputBase);

export default function ProjectsMenu() {
  const classes = useStyles();

  const [projectId, setProjectId] = React.useState("1");

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setProjectId(event.target.value as string)
  }

  return (
    <>
      <LibraryBooksIcon/>
      <FormControl variant="outlined" className={classes.projectsFormControl}>
        <InputLabel className={classes.selectLabel} id="currentProjectLabel">Current Project</InputLabel>
        <Select
          labelId="currentProjectLabel"
          id="currentProject"
          value={projectId}
          onChange={handleChange}
          label="Current Project"
          classes={{
            icon: classes.selectIcon,
          }}
          input={<ProjectInput/>}
        >
          <MenuItem value="1">Test Project 1</MenuItem>
          <MenuItem value="2">Test Project 2</MenuItem>
          <MenuItem value="3">Test Project 3</MenuItem>
        </Select>
      </FormControl>
    </>
  )
}
