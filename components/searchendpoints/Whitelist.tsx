import React, { useState } from "react";

import { makeStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Chip from "@material-ui/core/Chip";
import TextField from "@material-ui/core/TextField";

export type WhitelistProps =  {
  whitelistProps: any
};

const useStyles = makeStyles((theme) => ({
  tagsInputRoot: {
    display: "flex",
    flexWrap: "wrap"
  },
  tagsInput: {
    maxWidth: "250px"
  }
}));

export default function Whitelist({whitelistProps}: WhitelistProps) {
  const classes = useStyles();
  const [error, setError] = useState('');
  const [ipAddressValue, setIpAddressValue] = useState('');
  const IPv4withCIDR = new RegExp('^([0-9]{1,3}\\.){3}[0-9]{1,3}(\\/([0-9]|[1-2][0-9]|3[0-2]))?$');
  const IPv6withCIDR = new RegExp('^s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:)))(%.+)?s*(\\/([0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8]))?$');

  const handleDeleteIpAddress = (index: number) => {
    whitelistProps.input.value.splice(index, 1)
    whitelistProps.input.onChange({
      target: {
        type: "input",
        value: [...whitelistProps.input.value],
      },
    });
  };

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    setIpAddressValue(inputValue);
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // @ts-ignore
    const inputValue = event.target.value.trim();
    if (event.key === "Enter") {
      if (IPv4withCIDR.test(inputValue) || IPv6withCIDR.test(inputValue)) {
        whitelistProps.input.onChange({
          target: {
            type: "input",
            value: [...whitelistProps.input.value, inputValue],
          },
        });
        setError('');
        setIpAddressValue('');
      } else {
        setError('This is not valid IP address')
      }
      event.preventDefault();
    }
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="IP Whitelist"
          variant="outlined"
          error={!!error}
          helperText={error}
          value={ipAddressValue}
          InputProps={{
            startAdornment: whitelistProps.input.value && whitelistProps.input.value.map((item: string, index: number) => (
              <Chip
                style={{ marginRight: "8px", marginTop: "8px"}}
                key={index}
                tabIndex={-1}
                label={item}
                onDelete={() => handleDeleteIpAddress(index)}
              />
            )),
            classes: {
              root: classes.tagsInputRoot,
              input: classes.tagsInput
            }
          }}
          onKeyDown={handleKeyDown}
          onChange={handleOnChange}
        />
      </Grid>
    </Grid>
  )
}
