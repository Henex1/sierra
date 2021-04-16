import React, { useState } from "react";

import { makeStyles } from "@material-ui/core/styles";
import Chip from "@material-ui/core/Chip";
import Grid from "@material-ui/core/Grid";
import MUITextField from "@material-ui/core/TextField";
import IconButton from "@material-ui/core/IconButton";
import AddIcon from "@material-ui/icons/Add";

const useStyles = makeStyles(() => ({
  whitelistInput: {
    width: "100%"
  },
  chips: {
    marginRight: "5px",
    marginBottom: "5px"
  }
}));

export type WhitelistProps =  {
  whitelistProps: any
};

export default function Whitelist({whitelistProps}: WhitelistProps) {
  const [whitelistText, setWhitelistText] = useState('');
  const [error, setError] = useState('');
  const classes = useStyles();
  const ipAddressRegExp = new RegExp('^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$');

  const handleWhitelistChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWhitelistText(event.target.value);
  };

  const handleAddWhitelistElement = () => {
    if (ipAddressRegExp.test(whitelistText)) {
      let newWhiteList = whitelistProps.input.value;
      if (newWhiteList) {
        newWhiteList.push(whitelistText);
      } else {
        newWhiteList = [whitelistText];
      }
      whitelistProps.input.onChange({
        target: {
          type: "input",
          value: newWhiteList,
        },
      });
      setWhitelistText('');
      setError('');
    } else {
      setError('This is not valid IP address')
    }
  };

  const handleDeleteWhitelistElement = (index: number) => {
    whitelistProps.input.value.splice(index, 1);
    whitelistProps.input.onChange({
      target: {
        type: "input",
        value: [...whitelistProps.input.value],
      },
    });
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Grid container spacing={1}>
          <Grid item xs={11}>
            <MUITextField
              className={classes.whitelistInput}
              label="IP Whitelist"
              variant="outlined"
              value={whitelistText}
              onChange={handleWhitelistChange}
              error={!!error}
              helperText={error}
            />
          </Grid>
          <Grid item xs={1}>
            <IconButton onClick={handleAddWhitelistElement}>
              <AddIcon />
            </IconButton>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        {whitelistProps.input.value && whitelistProps.input.value.map(
          (whitelistItem: string, index: number) => (
            <Chip
              className={classes.chips}
              key={index}
              label={whitelistItem}
              onDelete={() => handleDeleteWhitelistElement(index)}
              color="primary"
            />
          )
        )}
      </Grid>
    </Grid>
  )
}
