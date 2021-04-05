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
      <MenuItemLink href="/searchendpoints">Search Endpoints</MenuItemLink>
      <MenuItemLink href="#">Search Phrases</MenuItemLink>
      <MenuItemLink href="#">Judgements</MenuItemLink>
      <MenuItemLink href="/rulesets">Rulesets</MenuItemLink>
    </MenuButton>
  );
}
