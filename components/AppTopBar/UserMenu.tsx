import React from "react";
import { signOut } from "next-auth/client";
import {
  Menu,
  MenuItem,
  Avatar,
  ButtonBase,
  makeStyles,
} from "@material-ui/core";

import { MenuItemLink } from "../common/Link";

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
  user: {
    name: string;
    image: string;
  };
  org: {
    name: string;
    image: string;
  };
};

export default function UserMenu({ user, org }: Props) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  return (
    <>
      <ButtonBase
        focusRipple
        onClick={(e) => setAnchorEl(e.currentTarget)}
        focusVisibleClassName={classes.focusVisible}
      >
        <div className={classes.content}>
          <Avatar
            className={classes.avatar}
            alt={org.name}
            title={`${org.name}`}
            src={org.image || undefined}
            variant="rounded"
            children={org.image ? undefined : org.name.substring(0, 1)}
          />
          <Avatar
            className={classes.avatar}
            alt={user.name}
            title={`Signed in as ${user.name}`}
            src={user.image}
          />
        </div>
      </ButtonBase>
      <Menu
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        className={classes.dropMenu}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItemLink href="/me/active-org">Organization</MenuItemLink>
        <MenuItemLink href="/me">Profile</MenuItemLink>
        <MenuItem onClick={() => signOut()}>Logout</MenuItem>
      </Menu>
    </>
  );
}
