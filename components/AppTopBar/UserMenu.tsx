import React from "react";
import { signOut } from "next-auth/client";
import {
  Menu,
  Avatar,
  ButtonBase,
  makeStyles,
  MenuItem,
} from "@material-ui/core";
import { Avatar as OrgAvatar } from "../../components/organization/Avatar";
import { MenuItemLink } from "../common/Link";
import { BarChart, GearFill, BoxArrowRight } from "react-bootstrap-icons";

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
  menuInfo: {
    marginTop: "-8px",
    padding: "15px",
    background: "#00001a",
    color: "white",
  },
  p1: {
    fontSize: "13px",
    color: "#ccccff",
  },
  icons: {
    paddingRight: "8px",
    fontSize: "24px",
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
        {org.name === `${user.name}'s Space` ? (
          <Avatar
            className={classes.avatar}
            alt={user.name}
            title={`Signed in as ${user.name}`}
            src={user.image}
          />
        ) : (
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
        )}
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
        <div className={classes.menuInfo}>
          <div>{org.name} </div>
          <p className={classes.p1}>{user.name}</p>
        </div>
        <MenuItemLink href="/me">
          <BarChart className={classes.icons} />
          Profile
        </MenuItemLink>
        <MenuItemLink href="/settings">
          <GearFill className={classes.icons} />
          Settings
        </MenuItemLink>
        <MenuItem onClick={() => signOut()}>
          <BoxArrowRight className={classes.icons} />
          Logout
        </MenuItem>
      </Menu>
    </>
  );
}
