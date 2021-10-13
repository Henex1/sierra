import React, { useState } from "react";
import { Button, Popover } from "@material-ui/core";
import { ResultScoreIcon } from "./ResultScoreIcon";

type Props = {
  children: React.ReactElement;
  score?: number;
  onOpen?: () => void;
  onClose: () => void;
  id?: string;
};

export const ResultScorePopover = ({
  children,
  score,
  onOpen = () => {},
  onClose,
  id = "result-score-popover",
}: Props) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    onOpen();
  };

  const handleClose = () => {
    setAnchorEl(null);
    onClose();
  };

  const onClick = (event: React.MouseEvent): void => {
    // @ts-expect-error - take the list of classes
    const classList = [...event.target.classList];

    // Close popover on any score button click
    if (
      classList.includes("MuiButtonBase-root") ||
      classList.includes("MuiButton-label")
    ) {
      handleClose();
    }
  };

  return (
    <>
      <Button
        aria-describedby={id}
        onClick={handleClick}
        style={{ backgroundColor: "transparent" }}
      >
        <ResultScoreIcon score={score} />
      </Button>

      <Popover
        id={id}
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        onClick={onClick}
        anchorOrigin={{ vertical: "center", horizontal: "right" }}
        transformOrigin={{ vertical: "center", horizontal: "left" }}
      >
        {children}
      </Popover>
    </>
  );
};
