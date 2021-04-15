import * as React from "react";
import { useFormState } from "react-final-form";

import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";
import { blue } from "@material-ui/core/colors";
import { makeStyles } from "@material-ui/core/styles";
import SaveIcon from "@material-ui/icons/Save";

const useStyles = makeStyles((theme) => ({
  progress: {
    color: blue[500],
    marginRight: theme.spacing(1),
  },
  icon: {
    marginRight: theme.spacing(1),
  },
}));

export type RulesetEditorSaveButtonProps = {
  dirty: boolean;
};

export default function RulesetEditorSaveButton({
  dirty,
}: RulesetEditorSaveButtonProps) {
  const classes = useStyles();
  const { submitting } = useFormState();

  return (
    <Box pb={2}>
      <Button
        type="submit"
        disabled={!dirty || submitting}
        variant="contained"
        color="primary"
      >
        {submitting ? (
          <CircularProgress size={24} className={classes.progress} />
        ) : (
          <SaveIcon className={classes.icon} />
        )}
        Save
      </Button>
      <Box component="span" ml={2}>
        {dirty && <Typography variant="caption">Unsaved changes</Typography>}
      </Box>
    </Box>
  );
}
