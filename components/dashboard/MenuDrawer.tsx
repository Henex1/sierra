import React from "react";
import {
  Drawer,
  List,
  Toolbar,
  Divider,
  ListSubheader,
  ListItem,
  ListItemIcon,
  makeStyles,
} from "@material-ui/core";

import { useActiveProject, useSession } from "../Session";
import { mainListItems } from "../AppNavigation";
import AssignmentIcon from "@material-ui/icons/Assignment";
import ListItemText from "@material-ui/core/ListItemText";
import { ExposedProject } from "../../lib/projects";

const useStyles = makeStyles((theme) => ({
  drawer: {
    width: 240,
    flexShrink: 0,
  },
  drawerPaper: {
    width: 240,
  },
}));

export default function MenuDrawer() {
  const classes = useStyles();
  const { session } = useSession();
  const { setProject } = useActiveProject();

  return (
    <Drawer
      variant="permanent"
      className={classes.drawer}
      classes={{
        paper: classes.drawerPaper,
      }}
      anchor="left"
    >
      <Toolbar />
      <List>{mainListItems}</List>
      <Divider />
      {!!session?.projects?.length && (
        <List>
          <ListSubheader inset>Recent projects</ListSubheader>
          {session.projects.slice(0, 3).map((project: ExposedProject) => (
            <ListItem
              key={project.id}
              button
              onClick={() => setProject(project ?? null)}
            >
              <ListItemIcon>
                <AssignmentIcon />
              </ListItemIcon>
              <ListItemText primary={project.name} />
            </ListItem>
          ))}
        </List>
      )}
    </Drawer>
  );
}
