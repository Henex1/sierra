import React from "react";
import { IconButton, Modal, makeStyles } from "@material-ui/core";
import FullscreenIcon from "@material-ui/icons/Fullscreen";
import CloseIcon from "@material-ui/icons/Close";
import classnames from "classnames";

const useStyles = makeStyles((theme) => ({
  root: {
    position: "relative",
  },
  scrollContainer: {
    padding: theme.spacing(1),
    overflow: "auto",
    scrollbarWidth: "thin",
    "&::-webkit-scrollbar": {
      height: 8,
      width: 8,
    },
    "&::-webkit-scrollbar-track": {
      borderRadius: 8,
      backgroundColor: "#efefef",
    },
    "&::-webkit-scrollbar-thumb": {
      borderRadius: 8,
      backgroundColor: "#c3c3c3",
    },
  },
  fullscreenButton: {
    position: "absolute",
    top: 5,
    right: 15,
  },
  modal: {
    position: "absolute",
    top: "5vh",
    left: "5vw",
    width: "100%",
    height: "100%",
  },
  modalContent: {
    padding: theme.spacing(1, 6, 1, 2),
  },
  closeButton: {
    position: "absolute",
    top: 0,
    right: 0,
  },
}));

type Props = {
  allowFullscreen?: boolean;
  maxHeight?: number | string;
  maxWidth?: number | string;
  classes?: {
    root?: string;
    scroll?: string;
  };
};

export default function Scrollable({
  allowFullscreen,
  maxHeight = "none",
  maxWidth = "100%",
  classes = {},
  children,
}: React.PropsWithChildren<Props>) {
  const defaultClasses = useStyles();

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div className={classnames(defaultClasses.root, classes.root)}>
      <div
        className={classnames(defaultClasses.scrollContainer, classes.scroll)}
        style={{ maxHeight, maxWidth }}
      >
        {children}
      </div>
      {allowFullscreen && (
        <>
          <IconButton
            className={defaultClasses.fullscreenButton}
            size="small"
            aria-label="fullscreen"
            onClick={handleOpen}
          >
            <FullscreenIcon />
          </IconButton>
          <Modal open={open} onClose={handleClose}>
            <div
              className={defaultClasses.modal}
              style={{ maxHeight: "90vh", maxWidth: "90vw" }}
            >
              <div
                className={classnames(
                  defaultClasses.scrollContainer,
                  defaultClasses.modalContent,
                  classes.scroll
                )}
                style={{ width: "100%", height: "100%" }}
              >
                {children}
              </div>
              <IconButton
                className={defaultClasses.closeButton}
                aria-label="exit fullscreen"
                onClick={handleClose}
              >
                <CloseIcon />
              </IconButton>
            </div>
          </Modal>
        </>
      )}
    </div>
  );
}
