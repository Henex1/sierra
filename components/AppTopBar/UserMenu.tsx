import React from "react";
import { signOut } from "next-auth/client";
import {
  Menu,
  Avatar,
  ButtonBase,
  makeStyles,
  MenuItem,
  Theme,
} from "@material-ui/core";
import { Avatar as OrgAvatar } from "../../components/organization/Avatar";
import { MenuItemLink } from "../common/Link";
import { CogIcon, LogoutIcon, ProfileIcon } from "../common/icons";

const useStyles = makeStyles<Theme, MenuInfoColors>((theme) => ({
  content: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "2px",
    padding: "2px",
    margin: 4,
    background: ({ bgColor }) => bgColor,
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
    background: ({ bgColor }) => bgColor,
    color: ({ textColor }) => textColor,
    width: "150px",
    padding: "15px",
  },
  menuOptions: {},
  p1: {
    fontSize: "15px",
    color: "#FFFFF",
    fontWeight: 700,
  },
  p2: {
    fontSize: "15px",
    color: "#FFFFF",
    opacity: "75%",
    fontWeight: 400,
  },
  icons: {
    paddingRight: "8px",
    fontSize: "30px",
  },
}));

type Props = {
  user: {
    name: string;
    image: string;
    email: string;
  };
  org: {
    name: string;
    image: string;
    bgColor: string;
    textColor: string;
  };
};

interface MenuInfoColors {
  bgColor: string;
  textColor: string;
}

export default function UserMenu({ user, org }: Props) {
  const menuInfoColors: MenuInfoColors = {
    bgColor: org.bgColor,
    textColor: org.textColor,
  };
  const classes = useStyles(menuInfoColors);
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
          <div className={classes.p1}>{user.name}</div>
          <div className={classes.p2}>{org.name}</div>
        </div>
        <div className={classes.menuOptions}>
          <MenuItemLink href="/me">
            <ProfileIcon className={classes.icons} />
            Profile
          </MenuItemLink>
          <MenuItemLink href="/settings">
            <CogIcon className={classes.icons} />
            Settings
          </MenuItemLink>
          <MenuItem onClick={() => signOut()}>
            <LogoutIcon className={classes.icons} />
            Logout
          </MenuItem>
        </div>
      </Menu>
    </>
  );
}
