import * as React from "react";

import { makeStyles, Theme } from "@material-ui/core/styles";
import { green, lime, yellow, orange, red } from '@material-ui/core/colors';
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Button from '@material-ui/core/Button';
import Paper from "@material-ui/core/Paper";

import BreadcrumbsButtons from "../../components/common/BreadcrumbsButtons";
import Link from "../../components/common/Link";
import Box from "@material-ui/core/Box";

const useStyles = makeStyles((theme: Theme) => ({
  judgeButton: {
    marginRight: theme.spacing(2)
  },
  greenButtonRoot: {
    color: theme.palette.getContrastText(green[500]),
    backgroundColor: green[500],
    '&:hover': {
      backgroundColor: green[700],
    },
  },
  yellowButtonRoot: {
    color: theme.palette.getContrastText(yellow[500]),
    backgroundColor: yellow[500],
    '&:hover': {
      backgroundColor: yellow[700],
    },
  },
  orangeButtonRoot: {
    color: theme.palette.getContrastText(orange[500]),
    backgroundColor: orange[500],
    '&:hover': {
      backgroundColor: orange[700],
    },
  },
  redButtonRoot: {
    color: theme.palette.getContrastText(red[500]),
    backgroundColor: red[500],
    '&:hover': {
      backgroundColor: red[700],
    },
  },
  paperWrapper: {
    padding: theme.spacing(2)
  }
}));

export default function Judging() {
  const classes = useStyles();

  return (
    <div>
      <BreadcrumbsButtons>
        <Link href="/">Home</Link>
        <Link href="/judgements">Judgements</Link>
        <Typography>Judging</Typography>
      </BreadcrumbsButtons>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box style={{display: "flex", justifyContent: "space-between"}}>
            <Box />
            <Box>
              <Button className={classes.judgeButton} classes={{root: classes.greenButtonRoot}} variant="contained">3 Perfect</Button>
              <Button className={classes.judgeButton} classes={{root: classes.yellowButtonRoot}} variant="contained">2 Good</Button>
              <Button className={classes.judgeButton} classes={{root: classes.orangeButtonRoot}} variant="contained">1 Fair</Button>
              <Button className={classes.judgeButton} classes={{root: classes.redButtonRoot}} variant="contained">0 Poor</Button>
              <Button
                variant="outlined"
                size="medium"
                onClick={() => {}}
              >
                Skip
              </Button>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body1" style={{marginBottom: "25px"}}>Review the result on the right, and evaluate 
          how relevant it is to the query below. Submit your evaluation by clicking on the buttons at top right.
          </Typography>
          <Typography variant="h4" style={{ marginBottom: "25px" }}>bluetooth speaker</Typography>
          <Typography variant="h6">Description</Typography>
          <Typography variant="body1" style={{marginBottom: "10px"}}>An amplifier and loudspeaker with Bluetooth
            wireless connectivity that is paired (pre-associated) with one or more smartphones, tablets, iPods or
            computers. Available in all sizes, including replaceable battery and rechargeable models, as well as
            wall-powered units, the Bluetooth speaker receives digital audio streams from the host device, which are
            typically compressed.</Typography>
        </Grid>
        <Grid item xs={6}>
          <Paper elevation={3} className={classes.paperWrapper}>
            <Typography variant="h4" style={{ marginBottom: "25px" }}>Result</Typography>
            <Typography variant="h6">Name</Typography>
            <Typography variant="body1" style={{ marginBottom: "10px" }}>
              Roller Coaster
            </Typography>
            <Typography variant="h6">Title</Typography>
            <Typography variant="body1" style={{ marginBottom: "10px" }}>
              NGS Roller Coaster 10 W Stereo portable speaker Red
            </Typography>
            <Typography variant="h6">Description</Typography>
            <Typography variant="body1" style={{ marginBottom: "10px" }}>
              Roller Coaster, Buetooth, 1200 mAh, 10W
            </Typography>
            <Typography variant="h6">Supplier</Typography>
            <Typography variant="body1" style={{ marginBottom: "10px" }}>
              NGS
            </Typography>
            <Box style={{ display: "flex", justifyContent: "center" }}>
              <img
                style={{ width: "60%", margin: "25px 0" }}
                src="/images/ngsBluetoothSpeaker.png"
                alt="NGS BluetoothSpeaker"
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};
