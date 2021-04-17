import React, { useState } from "react";

import Grid from "@material-ui/core/Grid";

import ChipInput from "material-ui-chip-input";

export type WhitelistProps =  {
  whitelistProps: any
};

export default function Whitelist({whitelistProps}: WhitelistProps) {
  const [error, setError] = useState('');
  const ipAddressRegExp = new RegExp('^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$');

  const handleAddIpAddress = (ipAddress: string) => {
    if (ipAddressRegExp.test(ipAddress)) {
      whitelistProps.input.onChange({
        target: {
          type: "input",
          value: [...whitelistProps.input.value, ipAddress],
        },
      });
      setError('');
    } else {
      setError('This is not valid IP address')
    }
  };

  const handleDeleteIpAddress = (index: number) => {
    whitelistProps.input.value.splice(index, 1)
    console.log(whitelistProps.input.value);
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
        <ChipInput
          fullWidth
          label="IP Whitelist"
          variant="outlined"
          value={whitelistProps.input.value || []}
          onAdd={(chip) => handleAddIpAddress(chip)}
          onDelete={(chip, index) => handleDeleteIpAddress(index)}
          error={!!error}
          helperText={error}
        />
      </Grid>
    </Grid>
  )
}
