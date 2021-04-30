import LandscapeIcon from "@material-ui/icons/Landscape";

import { MenuItemLink } from "../common/Link";
import MenuButton from "../common/MenuButton";
import useStyles from "./AppTopBarStyles";
import { useActiveProject } from "../Session";

export default function ResourcesMenu() {
  const classes = useStyles();
  const { project } = useActiveProject();

  return (
    <MenuButton
      buttonClassName={classes.topButton}
      buttonIcon={<LandscapeIcon />}
      buttonChildren="Resources"
      menuClassName={classes.dropMenu}
    >
      <MenuItemLink href="/searchendpoints">Search Endpoints</MenuItemLink>
      <MenuItemLink href="/searchphrases">Search Phrases</MenuItemLink>
      <MenuItemLink href={project?.id ? `/${project.id}/judgements` : "/judgements"}>Judgements</MenuItemLink>
      <MenuItemLink href="/rulesets">Rulesets</MenuItemLink>
    </MenuButton>
  );
}
