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
import BlurLinearIcon from "@material-ui/icons/BlurLinear";
import AssignmentIcon from "@material-ui/icons/Assignment";
import AccountTreeIcon from "@material-ui/icons/AccountTree";

import Link, { LinkProps } from "./common/Link";

type NavigationItemProps = {
  href: LinkProps["href"];
  icon: React.ReactNode;
  text: ListItemTextProps;
};

const NavigationItem: React.FC<NavigationItemProps> = ({
  icon,
  text,
  ...rest
}) => (
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
      href="/searchendpoints"
      icon={<StorageIcon />}
      text={{ primary: "Search Endpoints" }}
    />
    <NavigationItem
      href="/projects"
      icon={<BarChartIcon />}
      text={{ primary: "Projects" }}
    />
    <NavigationItem
      href="/rulesets"
      icon={<LayersIcon />}
      text={{ primary: "Rulesets" }}
    />
    <NavigationItem
      href="/querytemplates"
      icon={<AccountTreeIcon />}
      text={{ primary: "Query Templates" }}
    />
    <NavigationItem
      href="/testbed"
      icon={<BlurLinearIcon />}
      text={{ primary: "Testbed" }}
    />
    <NavigationItem
      href="/teams"
      icon={<PeopleIcon />}
      text={{ primary: "Teams" }}
    />
  </div>
);

export const secondaryListItems = (
  <div>
    <ListSubheader inset>Recent projects</ListSubheader>
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
