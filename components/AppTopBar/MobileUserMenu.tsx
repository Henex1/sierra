import React from "react";
import { signOut } from "next-auth/client";
import { Menu, MenuItem, makeStyles, IconButton } from "@material-ui/core";
import Divider from "@material-ui/core/Divider";
import MobileResourcesMenu from "./MobileResourcesMenu";
import MobileSettingsMenu from "./MobileSettingsMenu";
import MobileFeedbackMenu from "./FeedbackMenu/MobileFeedbackMenu";

import { MenuItemLink } from "../common/Link";
import MoreIcon from "@material-ui/icons/MoreVert";

const useStyles = makeStyles((theme) => ({
  content: {
    display: "flex",
    margin: 4,
    background: "#fff",
    borderRadius: theme.shape.borderRadius,
  },
  avatar: {
    width: theme.spacing(5),
    height: theme.spacing(5),
    border: "solid 2px white",
  },
  focusVisible: {},
  dropMenu: {
    marginTop: theme.spacing(5),
  },
}));

type Props = {
  activeProjectId: any;
};

const mobileMenuId = "account-menu-mobile";

export default function MobileUserMenu({ activeProjectId }: Props) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const closeMenu = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        aria-label="show more"
        aria-controls={mobileMenuId}
        aria-haspopup="true"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        color="inherit"
      >
        <MoreIcon />
      </IconButton>
      <Menu
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        className={classes.dropMenu}
        onClose={closeMenu}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItemLink onClick={closeMenu} href="/">
          Home
        </MenuItemLink>
        <MenuItemLink onClick={closeMenu} href={`/${activeProjectId}/lab`}>
          Lab
        </MenuItemLink>
        <MobileResourcesMenu closeMenu={closeMenu} />
        <Divider variant="middle" />
        <MobileSettingsMenu closeMenu={closeMenu} />
        <MobileFeedbackMenu />
        <Divider variant="middle" />
        <MenuItemLink onClick={closeMenu} href="/me">
          Profile
        </MenuItemLink>
        <MenuItem onClick={() => signOut()}>Logout</MenuItem>
      </Menu>
    </>
  );
}
