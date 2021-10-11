import React, { useState } from "react";

import { makeStyles, Theme } from "@material-ui/core/styles";
import { green, yellow, orange, red, grey } from "@material-ui/core/colors";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import Box from "@material-ui/core/Box";

import BreadcrumbsButtons from "../../../components/common/BreadcrumbsButtons";
import Link from "../../../components/common/Link";
import Tooltip from "@material-ui/core/Tooltip";
import { useActiveProject } from "../../../components/Session";
import classNames from "classnames";

const useStyles = makeStyles((theme: Theme) => ({
  judgeButton: {
    marginRight: theme.spacing(2),
    padding: theme.spacing(0.5, 1),
    [theme.breakpoints.up("sm")]: {
      padding: theme.spacing(0.75, 2),
    },
  },
  noMrg: {
    marginRight: 0,
  },
  notSelected: {
    color: theme.palette.getContrastText(grey[500]),
    backgroundColor: grey[500],
    "&:hover": {
      backgroundColor: grey[700],
    },
  },
  greenButtonRoot: {
    color: theme.palette.getContrastText(green[500]),
    backgroundColor: green[500],
    "&:hover": {
      backgroundColor: green[700],
    },
  },
  yellowButtonRoot: {
    color: theme.palette.getContrastText(yellow[500]),
    backgroundColor: yellow[500],
    "&:hover": {
      backgroundColor: yellow[700],
    },
  },
  orangeButtonRoot: {
    color: theme.palette.getContrastText(orange[500]),
    backgroundColor: orange[500],
    "&:hover": {
      backgroundColor: orange[700],
    },
  },
  redButtonRoot: {
    color: theme.palette.getContrastText(red[500]),
    backgroundColor: red[500],
    "&:hover": {
      backgroundColor: red[700],
    },
  },
  actionsContainer: {
    display: "flex",
    justifyContent: "space-between",
  },
  imageContainer: {
    display: "flex",
    justifyContent: "center",
  },
  image: {
    width: "60%",
    margin: "25px 0",
  },
  paperWrapper: {
    padding: theme.spacing(2),
  },
  tooltipIcon: {
    marginLeft: theme.spacing(1),
  },
  judgeActions: {
    display: "inline-flex",
    whiteSpace: "nowrap",
  },
  fullWidth: {
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: "auto",
    },
  },
  skipBtnFullWidth: {
    marginTop: theme.spacing(1),
  },
  spaceBetween: {
    justifyContent: "space-between",
  },
  typographyMrg: {
    marginBottom: 10,
  },
}));

export default function Judging() {
  const classes = useStyles();
  const maxWidthMatches = useMediaQuery("(max-width:499px)");
  const { project } = useActiveProject();
  const [rating, setRating] = useState<null | number>(null);
  const judgeButtonCls = classNames(
    classes.judgeButton,
    maxWidthMatches && classes.noMrg
  );
  const judgeActionsCls = classNames(
    classes.judgeActions,
    maxWidthMatches && classes.fullWidth
  );

  const handleDecisionButton = () => {
    // TODO: implement judgement scoring
  };

  const handleRatingDecision = (buttonRating: number) => {
    buttonRating === rating ? setRating(null) : setRating(buttonRating);
  };

  return (
    <div>
      <BreadcrumbsButtons>
        <Link href="/">Home</Link>
        <Link href={`/${project?.id}/judgements`}>Judgements</Link>
        <Typography>Judging</Typography>
      </BreadcrumbsButtons>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box className={classes.actionsContainer}>
            <Box />
            <Box>
              <Box
                className={classNames(
                  judgeActionsCls,
                  maxWidthMatches && classes.spaceBetween
                )}
              >
                <Button
                  className={judgeButtonCls}
                  classes={{
                    root:
                      rating === null || rating === 3
                        ? classes.greenButtonRoot
                        : classes.notSelected,
                  }}
                  variant="contained"
                  onClick={() => handleRatingDecision(3)}
                >
                  3 Perfect
                </Button>
                <Button
                  className={judgeButtonCls}
                  classes={{
                    root:
                      rating === null || rating === 2
                        ? classes.yellowButtonRoot
                        : classes.notSelected,
                  }}
                  variant="contained"
                  onClick={() => handleRatingDecision(2)}
                >
                  2 Good
                </Button>
                <Button
                  className={judgeButtonCls}
                  classes={{
                    root:
                      rating === null || rating === 1
                        ? classes.orangeButtonRoot
                        : classes.notSelected,
                  }}
                  variant="contained"
                  onClick={() => handleRatingDecision(1)}
                >
                  1 Fair
                </Button>
                <Button
                  className={judgeButtonCls}
                  classes={{
                    root:
                      rating === null || rating === 0
                        ? classes.redButtonRoot
                        : classes.notSelected,
                  }}
                  variant="contained"
                  onClick={() => handleRatingDecision(0)}
                >
                  0 Poor
                </Button>
              </Box>
              <Box
                className={classNames(
                  judgeActionsCls,
                  maxWidthMatches && classes.skipBtnFullWidth
                )}
              >
                <Button
                  className={classNames(
                    classes.judgeButton,
                    classes.noMrg,
                    maxWidthMatches && classes.fullWidth
                  )}
                  variant="outlined"
                  size="medium"
                  onClick={handleDecisionButton}
                >
                  {rating !== null ? "Confirm" : "Skip"}
                </Button>
              </Box>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="h4" style={{ marginBottom: "25px" }}>
            bluetooth speaker
            <Tooltip
              title="Review the result on the right, and evaluate how relevant it is to the query below. Submit your evaluation by clicking on the buttons at top right."
              arrow
            >
              <HelpOutlineIcon className={classes.tooltipIcon} />
            </Tooltip>
          </Typography>
          <Typography variant="h6">Description</Typography>
          <Typography
            variant="body1"
            align="justify"
            className={classes.typographyMrg}
          >
            An amplifier and loudspeaker with Bluetooth wireless connectivity
            that is paired (pre-associated) with one or more smartphones,
            tablets, iPods or computers. Available in all sizes, including
            replaceable battery and rechargeable models, as well as wall-powered
            units, the Bluetooth speaker receives digital audio streams from the
            host device, which are typically compressed.
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper elevation={3} className={classes.paperWrapper}>
            <Typography variant="h6">Name</Typography>
            <Typography variant="body1" className={classes.typographyMrg}>
              Roller Coaster
            </Typography>
            <Typography variant="h6">Title</Typography>
            <Typography variant="body1" className={classes.typographyMrg}>
              NGS Roller Coaster 10 W Stereo portable speaker Red
            </Typography>
            <Typography variant="h6">Description</Typography>
            <Typography variant="body1" className={classes.typographyMrg}>
              Roller Coaster, Buetooth, 1200 mAh, 10W
            </Typography>
            <Typography variant="h6">Supplier</Typography>
            <Typography variant="body1" className={classes.typographyMrg}>
              NGS
            </Typography>
            <Box className={classes.imageContainer}>
              <img
                className={classes.image}
                src="/images/ngsBluetoothSpeaker.png"
                alt="NGS BluetoothSpeaker"
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}
