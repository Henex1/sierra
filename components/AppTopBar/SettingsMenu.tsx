import SettingsOutlinedIcon from "@material-ui/icons/SettingsOutlined";

import { MenuItemLink } from "../common/Link";
import MenuButton from "../common/MenuButton";
import useStyles from "./AppTopBarStyles";

export default function SettingsMenu() {
  const classes = useStyles();

  return (
    <MenuButton
      buttonIcon={<SettingsOutlinedIcon />}
      buttonClassName={classes.topButton}
      menuClassName={classes.dropMenu}
    >
      <MenuItemLink href="/teams">Teams</MenuItemLink>
      <MenuItemLink href="/projects">Projects</MenuItemLink>
      <MenuItemLink href="/scores">Scores</MenuItemLink>
      <MenuItemLink href="/settings">Settings</MenuItemLink>
    </MenuButton>
  );
}
