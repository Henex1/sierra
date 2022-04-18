import React from "react";
import { Form, Field, FormProps as BaseFormProps } from "react-final-form";
import { TextField } from "mui-rff";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import { ExposedOrg } from "../../lib/org";
import { AvatarUpload } from "../AvatarUpload";
import { InputAdornment } from "@material-ui/core";

export type FormProps = BaseFormProps<ExposedOrg> & {
  onDelete?: () => void;
  isUserScoped?: boolean;
};

export function CreateOrganizationForm({ onDelete, ...rest }: FormProps) {
  const isNew = rest.initialValues?.id === undefined;
  const disabled = rest.isUserScoped;
  const isValidDomain = (domain: string) =>
    /^(?!:\/\/)([a-zA-Z0-9]+\.)?[a-zA-Z0-9][a-zA-Z0-9-]+\.[a-zA-Z]{2,6}?$/i.test(
      domain
    );

  function validate(values: ExposedOrg) {
    if (values.domain && !isValidDomain(values.domain)) {
      return { domain: "Invalid domain." };
    }
    return;
  }
  return (
    <Form
      {...rest}
      validate={validate}
      render={({ handleSubmit, form, submitting, values }) => (
        <form onSubmit={handleSubmit}>
          <Box pb={2}>
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
            <TextField
              label="Name"
              name="name"
              variant="filled"
              disabled={disabled}
              required={true}
            />
          </Box>
          <Box pb={2}>
            <TextField
              label="Domain without http(s)"
              name="domain"
              variant="filled"
              disabled={disabled}
              required={true}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {" "}
                    <Button
                      disabled={!values.domain || !isValidDomain(values.domain)}
                      variant="contained"
                      color="primary"
                      onClick={() =>
                        form.change(
                          "image",
                          `https://logo.clearbit.com/${
                            form.getState().values.domain
                          }`
                        )
                      }
                    >
                      Fetch Logo
                    </Button>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box pb={2}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Background color"
                  name="bgColor"
                  variant="filled"
                  disabled={disabled}
                  inputProps={{ type: "color" }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Text color"
                  name="textColor"
                  variant="filled"
                  disabled={disabled}
                  inputProps={{ type: "color" }}
                />
              </Grid>
            </Grid>
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
