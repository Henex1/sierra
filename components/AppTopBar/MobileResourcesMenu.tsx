import React from "react";
import { Menu, MenuItem } from "@material-ui/core";

import { MenuItemLink } from "../common/Link";
import { useActiveProject } from "../Session";

type Props = {
  closeMenu: () => void;
};

export default function MobileResourcesMenu({ closeMenu }: Props) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { project } = useActiveProject();

  const closeSubMenu = () => {
    closeMenu();
    setAnchorEl(null);
  };

  return (
    <MenuItem>
      <span onClick={(e) => setAnchorEl(e.currentTarget)}>Resources</span>
      <Menu
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItemLink onClick={closeSubMenu} href="/searchendpoints">
          Search Endpoints
        </MenuItemLink>
        <MenuItemLink onClick={closeSubMenu} href="/searchphrases">
          Search Phrases
        </MenuItemLink>
        <MenuItemLink
          href={project?.id ? `/${project?.id}/judgements` : "/judgements"}
        >
          Judgements
        </MenuItemLink>
        <MenuItemLink onClick={closeSubMenu} href="/rulesets">
          Rulesets
        </MenuItemLink>
      </Menu>
    </MenuItem>
  );
}
