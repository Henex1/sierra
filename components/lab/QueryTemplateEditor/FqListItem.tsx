import React from "react";
import {
  Grid,
  ListItemText,
  TextField,
  ListItem,
  ListItemSecondaryAction,
  IconButton,
  Checkbox,
} from "@material-ui/core";

import DeleteIcon from "@material-ui/icons/Delete";

type Props = {
  label: string;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  onDelete: () => void;
  onChange: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>;
};

export default function FqListItem(props: Props) {
  return (
    <ListItem>
      <ListItemText
        primary={
          <Grid container>
            <Grid item>
              <Checkbox
                checked={props.enabled}
                onChange={(ev) => props.onEnabledChange(ev.target.checked)}
              />
            </Grid>
            <Grid item>
              <TextField
                fullWidth
                onChange={props.onChange}
                value={props.label}
              />
            </Grid>
          </Grid>
        }
      ></ListItemText>
      <ListItemSecondaryAction>
        <IconButton onClick={props.onDelete} size="small">
          <DeleteIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
}
