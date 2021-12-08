import React from "react";
import _ from "lodash";
import {
  MenuItem,
  FormControlLabel,
  TextField,
  Checkbox,
} from "@material-ui/core";

import { Field, FormSpy } from "react-final-form";

import { FIELD_NAME_DOT_REPLACEMENT } from "./SolrQueryPanel";

export type Props = {
  field: string;
  type?: string;
  label?: string;
  items?: string[];
  checkbox?: boolean;
  fullWidth?: boolean;
  nestedFields?: Props[];
};

export default function SolrField(props: Props) {
  const { fullWidth, checkbox, nestedFields, items, type } = props;

  // react-final-form does not support dots in field names
  const field = props.field.replaceAll(".", FIELD_NAME_DOT_REPLACEMENT);
  const label = props.label || props.field;

  if (nestedFields) {
    return (
      <>
        <SolrField {..._.omit(props, "nestedFields")} />
        <FormSpy>
          {(formProps) =>
            `${formProps.values[props.field]}` === "true" &&
            nestedFields.map((it: Props, i: number) => (
              <SolrField key={i} {...it} />
            ))
          }
        </FormSpy>
      </>
    );
  }

  if (checkbox) {
    return (
      <Field name={field}>
        {({ input }) => (
          <FormControlLabel
            control={
              <Checkbox checked={input.value} onChange={input.onChange} />
            }
            label={label}
          />
        )}
      </Field>
    );
  }
  if (items) {
    return (
      <Field name={field}>
        {({ input }) => (
          <TextField
            fullWidth={fullWidth}
            select
            label={label}
            value={input.value}
            onChange={input.onChange}
          >
            {items!.map((it, i) => (
              <MenuItem key={i} value={it}>
                {it}
              </MenuItem>
            ))}
          </TextField>
        )}
      </Field>
    );
  }
  return (
    <Field name={field}>
      {({ input }) => (
        <TextField
          fullWidth={fullWidth}
          type={type}
          label={label}
          value={input.value}
          onChange={input.onChange}
        />
      )}
    </Field>
  );
}
