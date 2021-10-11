import React from "react";
import { MenuItemLink } from "../common/Link";
import { Menu, MenuItem } from "@material-ui/core";

type Props = {
  closeMenu: () => void;
};

export default function MobileSettingsMenu({ closeMenu }: Props) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const closeSubMenu = () => {
    closeMenu();
    setAnchorEl(null);
  };

  return (
    <MenuItem>
      <span onClick={(e) => setAnchorEl(e.currentTarget)}>Settings</span>
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
        <MenuItemLink onClick={closeSubMenu} href="/projects">
          Projects
        </MenuItemLink>
        <MenuItemLink onClick={closeSubMenu} href="/settings">
          Settings
        </MenuItemLink>
      </Menu>
    </MenuItem>
  );
}
