import React from "react";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText, {
  ListItemTextProps,
} from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import DashboardIcon from "@material-ui/icons/Dashboard";
import StorageIcon from "@material-ui/icons/Storage";
import PeopleIcon from "@material-ui/icons/People";
import BarChartIcon from "@material-ui/icons/BarChart";
import LayersIcon from "@material-ui/icons/Layers";
import AssignmentIcon from "@material-ui/icons/Assignment";

import Link, { LinkProps } from "./common/Link";

type NavigationItemProps = {
  href: LinkProps["href"];
  icon: React.Node;
  text: ListItemTextProps;
};

const NavigationItem: React.FC = ({
  icon,
  text,
  ...rest
}: NavigationItemProps) => (
  <ListItem button {...rest} component={Link}>
    <ListItemIcon children={icon} />
    <ListItemText {...text} />
  </ListItem>
);

export const mainListItems = (
  <div>
    <NavigationItem
      href="/"
      icon={<DashboardIcon />}
      text={{ primary: "Dashboard" }}
    />
    <NavigationItem
      href="/datasources"
      icon={<StorageIcon />}
      text={{ primary: "Orders" }}
    />
    <ListItem button>
      <ListItemIcon>
        <PeopleIcon />
      </ListItemIcon>
      <ListItemText primary="Customers" />
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <BarChartIcon />
      </ListItemIcon>
      <ListItemText primary="Reports" />
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <LayersIcon />
      </ListItemIcon>
      <ListItemText primary="Integrations" />
    </ListItem>
  </div>
);

export const secondaryListItems = (
  <div>
    <ListSubheader inset>Saved reports</ListSubheader>
    <ListItem button>
      <ListItemIcon>
        <AssignmentIcon />
      </ListItemIcon>
      <ListItemText primary="Current month" />
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <AssignmentIcon />
      </ListItemIcon>
      <ListItemText primary="Last quarter" />
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <AssignmentIcon />
      </ListItemIcon>
      <ListItemText primary="Year-end sale" />
    </ListItem>
  </div>
);
