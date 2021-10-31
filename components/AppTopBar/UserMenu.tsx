import React from "react";
import { signOut } from "next-auth/client";
import {
  Menu,
  MenuItem,
  Avatar,
  ButtonBase,
  makeStyles,
} from "@material-ui/core";
import { Avatar as OrgAvatar } from "../../components/organization/Avatar";
import { MenuItemLink } from "../common/Link";

const useStyles = makeStyles((theme) => ({
  content: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "2px",
    padding: "2px",
    margin: 4,
    background: "#fff",
    borderRadius: theme.shape.borderRadius,
  },
  avatar: {
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
          <OrgAvatar
            name={org.name}
            image={org.image}
            square={true}
            size={"small"}
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
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItemLink href="/me/organization">Organization</MenuItemLink>
        <MenuItemLink href="/me">Profile</MenuItemLink>
        <MenuItemLink href="/settings">Settings</MenuItemLink>
        <MenuItem onClick={() => signOut()}>Logout</MenuItem>
      </Menu>
    </>
  );
}
