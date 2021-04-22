import React from "react";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText, {
  ListItemTextProps,
} from "@material-ui/core/ListItemText";
import DashboardIcon from "@material-ui/icons/Dashboard";
import StorageIcon from "@material-ui/icons/Storage";
import PeopleIcon from "@material-ui/icons/People";
import BarChartIcon from "@material-ui/icons/BarChart";
import LayersIcon from "@material-ui/icons/Layers";
import BlurLinearIcon from "@material-ui/icons/BlurLinear";
import AccountTreeIcon from "@material-ui/icons/AccountTree";
import GavelIcon from '@material-ui/icons/Gavel';

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
      href="/judgements"
      icon={<GavelIcon />}
      text={{ primary: "Judgements" }}
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
