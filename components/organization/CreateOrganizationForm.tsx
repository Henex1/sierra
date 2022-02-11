import React from "react";
import { Form, Field, FormProps as BaseFormProps } from "react-final-form";
import { TextField } from "mui-rff";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import { ExposedOrg } from "../../lib/org";
import { AvatarUpload } from "../AvatarUpload";

export type FormProps = BaseFormProps<ExposedOrg> & {
  onDelete?: () => void;
  isUserScoped?: boolean;
};

export function CreateOrganizationForm({ onDelete, ...rest }: FormProps) {
  const isNew = rest.initialValues?.id === undefined;
  const disabled = rest.isUserScoped;
  return (
    <Form
      {...rest}
      render={({ handleSubmit, form, submitting }) => (
        <form onSubmit={handleSubmit}>
          <Box pb={2}>
            <TextField
              label="Name"
              name="name"
              required={true}
              variant="filled"
              disabled={disabled}
            />
          </Box>
          <Box pb={2}>
            <TextField
              label="Domain"
              name="domain"
              variant="filled"
              type="url"
              disabled={disabled}
            />
          </Box>
          <Box pb={2}>
            <Field<string> name="image">
              {(props) => {
                return (
                  <AvatarUpload
                    disabled={disabled}
                    value={props.input.value}
                    onChange={(f) => form.change("image", f)}
                    onRemove={() => form.change("image", null)}
                  />
                );
              }}
            </Field>
          </Box>
          <Box pb={2}>
            <Button
              type="submit"
              disabled={submitting || disabled}
              variant="contained"
              color="primary"
            >
              {isNew ? "Create" : "Update"}
            </Button>
            {!isNew && onDelete && (
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
