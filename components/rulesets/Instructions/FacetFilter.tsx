import { InstructionFieldProps } from "./types";
import { FacetFilterInstruction } from "../../../lib/rulesets/rules";
import * as React from "react";
import { useActiveProject } from "../../Session";
import { useEffect } from "react";
import { apiRequest } from "../../../lib/api";
import { debounce } from "lodash";
import Grid from "@material-ui/core/Grid";
import { Autocomplete, Select } from "mui-rff";
import MenuItem from "@material-ui/core/MenuItem";

export function FacetFilterField({
  name,
  value,
  disabled,
  facetFilterFields,
}: InstructionFieldProps<FacetFilterInstruction>) {
  const [open, setOpen] = React.useState(false);
  const [facetFilterValues, setFacetFilterValues] = React.useState<string[]>(
    []
  );
  const [loading, setLoading] = React.useState(false);
  const { project } = useActiveProject();

  useEffect(() => {
    if (value) {
      const castedValue = value as FacetFilterInstruction;
      loadAutocomplete(castedValue.field, castedValue.value);
    }
  }, []);

  const loadAutocomplete = async (fieldName: string, prefix?: string) => {
    if (!fieldName) return;
    setLoading(true);
    const data = await apiRequest(
      `/api/searchendpoints/values`,
      {
        projectId: project?.id,
        fieldName,
        prefix,
      },
      { method: "POST" }
    );
    if (data?.length) {
      setFacetFilterValues(data);
    } else {
      setFacetFilterValues([]);
    }
    setLoading(false);
  };

  const autocompleteCallback = React.useCallback(
    debounce(loadAutocomplete, 300),
    []
  );

  const onChangeHandle = (field: string, prefix?: string) => {
    autocompleteCallback(field, prefix);
  };

  return (
    <>
      <Grid item xs={2}>
        <Select name={`${name}.include`} disabled={disabled} required>
          <MenuItem value={true as any}>MUST</MenuItem>
          <MenuItem value={false as any}>MUST NOT</MenuItem>
        </Select>
      </Grid>
      <Grid item xs={3}>
        <Autocomplete
          label=""
          name={`${name}.field`}
          required
          options={facetFilterFields}
          onChange={(ev) => {
            onChangeHandle((ev.target as HTMLElement).innerHTML);
          }}
        />
      </Grid>
      <Grid item xs={3}>
        <Autocomplete
          freeSolo
          open={open}
          onOpen={() => {
            setOpen(true);
          }}
          onClose={() => {
            setOpen(false);
          }}
          loading={loading}
          label=""
          disabled={!(value as FacetFilterInstruction).field}
          name={`${name}.value`}
          options={facetFilterValues || []}
          textFieldProps={{
            onChange: (ev) =>
              onChangeHandle(
                (value as FacetFilterInstruction).field,
                ev.target.value
              ),
          }}
        />
      </Grid>
    </>
  );
}
