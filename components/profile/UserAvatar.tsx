import { Avatar, makeStyles } from "@material-ui/core";
import React, { ChangeEvent, useCallback, useState } from "react";
import CameraAltOutlinedIcon from "@material-ui/icons/CameraAltOutlined";
import CircularProgress from "@material-ui/core/CircularProgress";

const useStyles = makeStyles((theme) => ({
  avatar: {
    width: theme.spacing(15),
    height: theme.spacing(15),
  },
  hoverLabel: {
    height: theme.spacing(15),
    width: theme.spacing(15),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    position: "absolute",
    zIndex: 1000,
    color: "rgb(171, 180, 189)",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "#00000080",
    borderRadius: "50%",
  },
  wrapper: {
    position: "relative",
    height: theme.spacing(15),
    width: theme.spacing(15),
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
}));

export type UserInfo = {
  avatar: string;
  name: string;
  email: string;
};
type Props = {
  userInfo: UserInfo;
  onAvatarUpdated: (path: File) => void;
  updating: boolean;
};

const UserProfileAvatar = ({ userInfo, onAvatarUpdated, updating }: Props) => {
  const classes = useStyles();

  const [mouseOver, setMouseOver] = useState(false);

  const handleAvatarUploaded = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const uploadedFiles = event.target.files;
      if (uploadedFiles && uploadedFiles.length === 1) {
        onAvatarUpdated(uploadedFiles[0]);
        setMouseOver(false);
      }
    },
    []
  );

  return (
    <span
      onMouseEnter={() => setMouseOver(true)}
      onMouseLeave={() => setMouseOver(false)}
      className={classes.wrapper}
    >
      {updating ? (
        <CircularProgress />
      ) : (
        <span>
          <Avatar
            alt={userInfo.name}
            src={userInfo.avatar}
            className={classes.avatar}
          />
          {mouseOver && (
            <label className={classes.hoverLabel}>
              <CameraAltOutlinedIcon />
              <input
                style={{ display: "none" }}
                type="file"
                name="file"
                onChange={handleAvatarUploaded}
                accept="image/*"
              />
            </label>
          )}
        </span>
      )}
    </span>
  );
};

export default UserProfileAvatar;
