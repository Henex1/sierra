import { FormApi, SubmissionErrors } from "final-form";
import { Form, FormProps as BaseFormProps } from "react-final-form";
import { TextField, Select } from "mui-rff";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import MenuItem from "@material-ui/core/MenuItem";

import { ExposedSearchEndpoint } from "../../lib/searchendpoints";

export type FormProps = BaseFormProps<ExposedSearchEndpoint> & {
  onDelete?: () => void;
};

export default function SearchEndpointForm({ onDelete, ...rest }: FormProps) {
  const isNew = rest.initialValues?.id === undefined;
  return (
    <Form
      {...rest}
      render={({ handleSubmit, form, submitting, values }) => (
        <form onSubmit={handleSubmit}>
          <Box pb={2}>
            <TextField
              label="Name"
              name="name"
              required={true}
              variant="filled"
            />
          </Box>
          <Box pb={2}>
            <Select
              label="Type"
              name="type"
              required={true}
              variant="filled"
              readOnly={!isNew}
            >
              <MenuItem value="ELASTICSEARCH">Elasticsearch</MenuItem>
            </Select>
          </Box>
          {values.type === "ELASTICSEARCH" && (
            <Box pb={2}>
              <TextField
                label="Elasticsearch URL"
                name="info.endpoint"
                required={true}
                variant="filled"
              />
            </Box>
          )}
          <Box pb={2}>
            <Button
              type="submit"
              disabled={submitting}
              variant="contained"
              color="primary"
            >
              {isNew ? "Create" : "Update"}
            </Button>
            {!isNew && (
              <>
                {" "}
                <Button variant="contained" onClick={onDelete}>
                  Delete
                </Button>
              </>
            )}
          </Box>
        </form>
      )}
    />
  );
}
