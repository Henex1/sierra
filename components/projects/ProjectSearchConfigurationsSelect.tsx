import React from "react";
import { MenuItem } from "@material-ui/core";
import { Select } from "mui-rff";
import { ExposedSearchConfiguration } from "../../lib/searchconfigurations";

export const ProjectSearchConfigurationsSelect = ({
  searchConfigurations,
}: ProjectSearchConfigurationsSelectProps) => (
  <Select
    label="Active search configuration"
    helperText="This can be changed to a different Search Configuration later."
    name="activeSearchConfigurationId"
    variant="filled"
    required={true}
  >
    {searchConfigurations &&
      searchConfigurations.map((sc: ExposedSearchConfiguration) => (
        <MenuItem key={sc.id} value={sc.id}>
          {sc.id}
        </MenuItem>
      ))}
  </Select>
);

type ProjectSearchConfigurationsSelectProps = {
  searchConfigurations: ExposedSearchConfiguration[];
};
