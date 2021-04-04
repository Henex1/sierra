import LandscapeIcon from "@material-ui/icons/Landscape";

import { MenuItemLink } from "../common/Link";
import MenuButton from "../common/MenuButton";
import useStyles from "./AppTopBarStyles";

export default function ResourcesMenu() {
  const classes = useStyles();

  return (
    <MenuButton
      buttonClassName={classes.topButton}
      buttonIcon={<LandscapeIcon />}
      buttonChildren="Resources"
      menuClassName={classes.dropMenu}
    >
      <MenuItemLink href="/datasources">Datasources</MenuItemLink>
      <MenuItemLink href="#">Search phrases</MenuItemLink>
      <MenuItemLink href="#">Judgements</MenuItemLink>
      <MenuItemLink href="/rulesets">Rulesets</MenuItemLink>
    </MenuButton>
  );
}
