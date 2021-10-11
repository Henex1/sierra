import React, { useRef, useState } from "react";
import { Popover, PopoverOrigin, MenuItem } from "@material-ui/core";
import { Page } from "./Page";

const anchorOrigin: PopoverOrigin = {
  vertical: "top",
  horizontal: "left",
};
const transformOrigin: PopoverOrigin = {
  vertical: "top",
  horizontal: "right",
};

export default function MobileFeedbackMenu() {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);

  return (
    <>
      <MenuItem>
        <span onClick={() => setOpen(true)} ref={ref}>
          Feedback
        </span>
      </MenuItem>
      <Popover
        open={open}
        onClose={handleClose}
        anchorEl={ref.current}
        anchorOrigin={anchorOrigin}
        transformOrigin={transformOrigin}
      >
        <Page onClose={handleClose} />
      </Popover>
    </>
  );
}
