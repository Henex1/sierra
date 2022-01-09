import React, { useRef, useState } from "react";
import {
  CircularProgress,
  Fade,
  IconButton,
  makeStyles,
  Popper,
  Tooltip,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { ResultScoreIcon } from "./ResultScoreIcon";

type Props = {
  children: React.ReactElement;
  score?: number;
  onOpen?: () => void;
  onClose: () => void;
  id?: string;
  loading?: boolean;
};

const useStyles = makeStyles(() => ({
  judmentButtonContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  customTooltip: {
    fontSize: "10px",
    fontWeight: 600,
    padding: "2px 5px",
  },
  iconButton: {
    width: "35px",
    height: "35px",
  },
  loader: {
    height: "100%",
    display: "flex",
    alignItems: "center",
  },
}));

export const ResultScorePopover = ({
  children,
  score,
  onOpen = () => {},
  onClose,
  id = "result-score-popover",
  loading = false,
}: Props) => {
  const classes = useStyles();
  const [tooltipIsOpen, setTooltipIsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);

  const anchorRef = useRef<HTMLDivElement | null>(null);

  const handleClick = async () => {
    setAnchorEl(anchorRef.current);
    setTooltipIsOpen(false);
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
      <div className={classes.judmentButtonContainer}>
        <Tooltip
          open={tooltipIsOpen}
          title="Cast your own judgement"
          placement="right"
          classes={{
            tooltip: classes.customTooltip,
          }}
        >
          <div ref={anchorRef}>
            {anchorEl ? (
              <IconButton
                classes={{ root: classes.iconButton }}
                onClick={handleClose}
              >
                <CloseIcon style={{ color: "#C0C0C0" }} fontSize="small" />
              </IconButton>
            ) : loading ? (
              <div className={classes.loader}>
                <CircularProgress size={25} />
              </div>
            ) : (
              <ResultScoreIcon
                score={score}
                handleClick={handleClick}
                setTooltipIsOpen={setTooltipIsOpen}
              />
            )}
          </div>
        </Tooltip>
      </div>
      <Popper
        id={id}
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClick={onClick}
        placement="right"
      >
        <Fade in={Boolean(anchorEl)} timeout={250}>
          <div>{children}</div>
        </Fade>
      </Popper>
    </>
  );
};
