import * as React from "react";
import { useFormState } from "react-final-form";

import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

export type RulesetEditorSaveButtonProps = {
  dirty: boolean
};

export default function RulesetEditorSaveButton({ dirty }: RulesetEditorSaveButtonProps) {
  const { submitting } = useFormState();

  return (
    <Box pb={2}>
      <Button
        type="submit"
        disabled={submitting}
        variant="contained"
        color="primary"
      >
        Save
      </Button>
      <Box component="span" ml={2}>
        {dirty &&
        <Typography variant="caption">
          Unsaved changes
        </Typography>
        }
      </Box>
    </Box>
  )
}
