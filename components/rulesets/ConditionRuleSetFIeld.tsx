import React from "react";
import {
  Grid,
  Typography,
  IconButton,
  makeStyles,
  createStyles,
  Theme,
} from "@material-ui/core";
import { TextField } from "mui-rff";
import DeleteIcon from "@material-ui/icons/Delete";
import {
  RuleSetCondition,
  RulesetConditionRange,
  RuleSetConditionType,
} from "../../lib/rulesets/rules";

const useConditionStyles = makeStyles((theme: Theme) =>
  createStyles({
    instructions: {
      display: "flex",
      alignItems: "baseline",
      justifyContent: "space-between",
    },
    dataRow: {
      display: "flex",
      alignItems: "baseline",
      "& > *": {
        marginRight: theme.spacing(2),
      },
    },
    dataLabel: {
      width: theme.spacing(18),
    },
  })
);

function TimeRangeConditionField(props: ConditionRuleSetProps) {
  return (
    <>
      <TextField
        name={`${props.name}.start`}
        label="Start"
        type="time"
        InputLabelProps={{
          shrink: true,
        }}
        required
      />
      <TextField
        name={`${props.name}.end`}
        label="End"
        type="time"
        InputLabelProps={{
          shrink: true,
        }}
        required
      />
    </>
  );
}

function DateRangeConditionField(props: ConditionRuleSetProps) {
  const value = props.value && (props.value as RulesetConditionRange);
  return (
    <>
      <TextField
        label="Start"
        type="datetime-local"
        name={`${props.name}.start`}
        InputLabelProps={{
          shrink: true,
        }}
        error={!(value?.start && value?.end && value.start <= value.end)}
      />
      <TextField
        label="End"
        type="datetime-local"
        name={`${props.name}.end`}
        InputLabelProps={{
          shrink: true,
        }}
        error={!(value?.start && value?.end && value.start <= value.end)}
      />
    </>
  );
}

function RequestHeaderConditionField(props: ConditionRuleSetProps) {
  return (
    <>
      <TextField label="Key" name={`${props.name}.key`} required />
      <TextField label="Value" name={`${props.name}.value`} required />
    </>
  );
}

type ConditionRuleSetProps = {
  onItemDeleteClick: () => void;
  value: RuleSetCondition;
  name: string;
};

export function ConditionRuleSetFIeld(props: ConditionRuleSetProps) {
  const classes = useConditionStyles();
  const { value, onItemDeleteClick } = props;

  return (
    <Grid item xs={12} className={classes.instructions}>
      <div className={classes.dataRow}>
        <Typography className={classes.dataLabel}>{value.type}</Typography>
        {value.type === RuleSetConditionType.DateRange && (
          <DateRangeConditionField {...props} />
        )}
        {value.type === RuleSetConditionType.TimeRange && (
          <TimeRangeConditionField {...props} />
        )}
        {value.type === RuleSetConditionType.RequestHeader && (
          <RequestHeaderConditionField {...props} />
        )}
      </div>
      <IconButton aria-label="delete" onClick={() => onItemDeleteClick()}>
        <DeleteIcon />
      </IconButton>
    </Grid>
  );
}
