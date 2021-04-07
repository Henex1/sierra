import * as React from "react";
import { Form, Field } from "react-final-form";
import { TextField } from "mui-rff";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import MUITextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";

import JsonEditor from "../JsonEditor";
import { parseNonnegativeInt } from "../common/form";
import { apiRequest } from "../../lib/api";

export default function DebugQuery() {
  const [result, setResult] = React.useState("");
  async function doQuery(values: any) {
    const body = await apiRequest(`/api/searchendpoints/query`, values);
    setResult(JSON.stringify(body, null, 2));
  }
  return (
    <Form
      onSubmit={doQuery}
      render={({ handleSubmit, form, submitting, values }) => (
        <form onSubmit={handleSubmit}>
          <Box pt={2} pb={2}>
            <Box pb={1}>
              <Typography variant="body1">Query</Typography>
            </Box>
            <Field name="query">
              {({ input }) => (
                <JsonEditor value={input.value} onChange={input.onChange} />
              )}
            </Field>
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
