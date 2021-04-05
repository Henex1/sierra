import { FormApi, SubmissionErrors } from "final-form";
import { Form, FormProps as BaseFormProps } from "react-final-form";
import { TextField, Select } from "mui-rff";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";

import { parseNonnegativeInt } from "../common/form";
import { ExposedProject } from "../../lib/projects";

export type FormProps = BaseFormProps<ExposedProject> & {
  onDelete?: () => void;
};

export default function ProjectForm({ onDelete, ...rest }: FormProps) {
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
            <TextField
              label="Search Endpoint ID"
              helperText="This can be changed to a different search endpoint of the same type later."
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
