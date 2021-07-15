import React from "react";
import { IconButton, Modal, makeStyles } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import classnames from "classnames";

const useStyles = makeStyles((theme) => ({
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
  modal: {
    position: "fixed",
    top: "5vh",
    left: "5vw",
    width: "100%",
    height: "100%",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: theme.spacing(1, 6, 1, 2),
    borderRadius: theme.shape.borderRadius,
  },
  closeButton: {
    position: "absolute",
    top: 0,
    right: 0,
  },
}));

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function BasicModal({
  open,
  onClose,
  children,
}: React.PropsWithChildren<Props>) {
  const classes = useStyles();
  return (
    <Modal open={open} onClose={onClose}>
      <div
        className={classes.modal}
        style={{ maxHeight: "90vh", maxWidth: "90vw" }}
      >
        <div
          className={classnames(classes.scrollContainer, classes.modalContent)}
          style={{ width: "100%", height: "100%" }}
        >
          {children}
        </div>
        <IconButton
          className={classes.closeButton}
          aria-label="exit fullscreen"
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      </div>
    </Modal>
  );
}
