import React, { useState } from "react";

import Grid from "@material-ui/core/Grid";

import ChipInput from "material-ui-chip-input";

export type WhitelistProps =  {
  whitelistProps: any
};

export default function Whitelist({whitelistProps}: WhitelistProps) {
  const [error, setError] = useState('');
  const IPv4withCIDR = new RegExp('^([0-9]{1,3}\\.){3}[0-9]{1,3}(\\/([0-9]|[1-2][0-9]|3[0-2]))?$');
  const IPv6withCIDR = new RegExp('^s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:)))(%.+)?s*(\\/([0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8]))?$');

  const handleAddIpAddress = (ipAddress: string) => {
    if (IPv4withCIDR.test(ipAddress) || IPv6withCIDR.test(ipAddress)) {
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
