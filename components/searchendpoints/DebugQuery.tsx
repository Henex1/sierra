import * as React from "react";
import { FormApi, SubmissionErrors } from "final-form";
import { Form, FormProps as BaseFormProps } from "react-final-form";
import { TextField, Select } from "mui-rff";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import MUITextField from "@material-ui/core/TextField";

import { parseNonnegativeInt } from "../common/form";
import { ExposedProject } from "../../lib/projects";

export default function DebugQuery() {
  const [result, setResult] = React.useState("");
  async function doQuery(values: any) {
    const response = await fetch(`/api/searchendpoints/query`, {
      method: "POST",
      body: JSON.stringify(values),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const body = await response.text();
    if (!response.ok) {
      // XXX - do something about this
      throw new Error(body);
    }
    setResult(body);
  }
  return (
    <Form
      onSubmit={doQuery}
      render={({ handleSubmit, form, submitting, values }) => (
        <form onSubmit={handleSubmit}>
          <Box pb={2}>
            <TextField
              label="Query"
              name="query"
              required={true}
              variant="filled"
              multiline
            />
          </Box>
          <Box pb={2}>
            <TextField
              label="Search Endpoint ID"
              name="searchEndpointId"
              required={true}
              variant="filled"
              fieldProps={{
                parse: parseNonnegativeInt,
              }}
            />
          </Box>
          <Box pb={2}>
            <Button
              type="submit"
              disabled={submitting}
              variant="contained"
              color="primary"
            >
              Query
            </Button>
          </Box>
          <Box pb={2}>
            <MUITextField fullWidth disabled multiline value={result} />
          </Box>
        </form>
      )}
    />
  );
}
