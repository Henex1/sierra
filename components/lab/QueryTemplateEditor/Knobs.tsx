import React from "react";
import {
  Box,
  Grid,
  TextField,
  Accordion,
  Typography,
  AccordionSummary,
  AccordionDetails,
  makeStyles,
} from "@material-ui/core";

import { Field } from "react-final-form";

import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

export type Props = {
  values: any;
};

export default function Knobs({ values }: Props) {
  const classes = useStyles();

  return (
    <Accordion
      classes={{
        root: classes.accordion,
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header"
        classes={{
          root: classes.accordionSummary,
          expanded: classes.accordionSummaryExpanded,
          content: classes.accordionSummaryContent,
        }}
      >
        <Typography variant="h6">Knobs</Typography>
      </AccordionSummary>
      <AccordionDetails className={classes.accordionDetails}>
        <Box width="100%">
          {values.knobs && Object.entries(values.knobs).length > 0 ? (
            Object.entries(values.knobs).map(([knobKey, _knobVal], i) => (
              <React.Fragment key={knobKey}>
                <Grid container spacing={1} alignItems="center">
                  <Grid item xs>
                    <Typography component="label" id={"knob-" + i}>
                      {knobKey}
                    </Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Field name={`knobs.${knobKey}`}>
                      {({ input }) => (
                        <TextField
                          value={input.value}
                          variant="outlined"
                          size="small"
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            const value = e.target.value.replace(
                              /[^0-9-]+/g,
                              ""
                            );
                            if (value === "") {
                              // hack, for some reason rff removes
                              // knobs with empty string value
                              input.onChange(" ");
                            } else {
                              input.onChange(value.trim());
                            }
                          }}
                          error={
                            !input.value ||
                            input.value === " " ||
                            (typeof input.value === "string" &&
                              input.value?.trim() === "-")
                          }
                        />
                      )}
                    </Field>
                  </Grid>
                </Grid>
              </React.Fragment>
            ))
          ) : (
            <Typography variant="subtitle2" color="textSecondary">
              Add variables in your query above using keywords enclosed by `##`
              such as `##brand_match_boost##` to use tuning knobs.
            </Typography>
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}

const useStyles = makeStyles((theme) => ({
  accordion: {
    boxShadow: "none",
    "&:before": {
      display: "none",
    },
  },
  accordionSummary: {
    minHeight: 48,
    padding: 0,
    border: "none",
    "&$accordionSummaryExpanded": {
      minHeight: 48,
    },
  },
  accordionSummaryExpanded: {
    "& $accordionSummaryContent": {
      margin: 0,
    },
  },
  accordionSummaryContent: {
    margin: 0,
  },
  accordionDetails: {
    padding: theme.spacing(1, 0),
  },
  knobInput: {
    font: "inherit",
    fontSize: 16,
    lineHeight: "inherit",
    width: "100%",
    height: 40,
    padding: theme.spacing(1, 1.5),
    border: "1px solid rgba(0, 0, 0, 0.23)",
    borderRadius: theme.shape.borderRadius,
    "&:focus": {
      outlineColor: theme.palette.primary.main,
    },
  },
}));
