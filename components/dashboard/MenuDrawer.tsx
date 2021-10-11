import React from "react";
import {
  Drawer,
  List,
  Toolbar,
  Divider,
  ListSubheader,
  ListItem,
  ListItemIcon,
  IconButton,
  makeStyles,
  Hidden,
  useTheme,
} from "@material-ui/core";

import { useActiveProject, useSession } from "../Session";
import { mainListItems } from "../AppNavigation";
import AssignmentIcon from "@material-ui/icons/Assignment";
import MenuIcon from "@material-ui/icons/Menu";
import ListItemText from "@material-ui/core/ListItemText";
import { ExposedProject } from "../../lib/projects";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  drawer: {
    [theme.breakpoints.up("sm")]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerPaperMobile: {
    width: drawerWidth,
    top: 65,
  },
  menuButton: {
    position: "absolute",
    top: 8,
    zIndex: 1202,
    color: "#ffffff",
    left: 156,
    display: "flex",
    [theme.breakpoints.up("sm")]: {
      display: "none",
    },
  },
  sectionDesktop: {
    display: "none",
    [theme.breakpoints.up("sm")]: {
      display: "flex",
    },
  },
}));

export default function MenuDrawer() {
  const classes = useStyles();
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { session } = useSession();
  const { setProject } = useActiveProject();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <>
      <Toolbar className={classes.sectionDesktop} />
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
    </>
  );

  const container =
    window !== undefined ? () => window.document.body : undefined;

  return (
    <nav className={classes.drawer}>
      <IconButton
        color="inherit"
        aria-label="open drawer"
        edge="start"
        onClick={handleDrawerToggle}
        className={classes.menuButton}
      >
        <MenuIcon />
      </IconButton>
      <Hidden smUp implementation="css">
        <Drawer
          container={container}
          variant="temporary"
          anchor={theme.direction === "rtl" ? "right" : "left"}
          open={mobileOpen}
          onClose={handleDrawerToggle}
          classes={{
            paper: classes.drawerPaperMobile,
          }}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
        >
          {drawer}
        </Drawer>
      </Hidden>
      <Hidden xsDown implementation="css">
        <Drawer
          classes={{
            paper: classes.drawerPaper,
          }}
          variant="permanent"
          open
        >
          {drawer}
        </Drawer>
      </Hidden>
    </nav>
  );
}
