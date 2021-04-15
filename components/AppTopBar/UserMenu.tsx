import { signOut } from "next-auth/client";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import MenuItem from "@material-ui/core/MenuItem";

import { MenuItemLink } from "../common/Link";
import MenuButton from "../common/MenuButton";
import useStyles from "./AppTopBarStyles";

export default function UserMenu() {
  const classes = useStyles();

  return (
    <MenuButton
      buttonIcon={<KeyboardArrowDownIcon />}
      menuClassName={classes.dropMenu}
    >
      <MenuItemLink href="/me/active-org">Switch Org</MenuItemLink>
      <MenuItemLink href="/me">Profile</MenuItemLink>
      <MenuItem onClick={() => signOut()}>Logout</MenuItem>
    </MenuButton>
  );
}
