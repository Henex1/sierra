import React, { useCallback, useRef } from "react";
import { Form, Field, FormProps as BaseFormProps } from "react-final-form";
import { FormApi, SubmissionErrors } from "final-form";
import { TextField, Select } from "mui-rff";

import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import MenuItem from "@material-ui/core/MenuItem";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Divider from "@material-ui/core/Divider";
import Typography from "@material-ui/core/Typography";
import SaveIcon from "@material-ui/icons/Save";
import FlashOnIcon from "@material-ui/icons/FlashOn";
import DeleteIcon from "@material-ui/icons/Delete";

import { ExposedSearchEndpoint } from "../../lib/searchendpoints/types/ExposedSearchEndpoint";
import { SearchEndpointCredentials } from "../../lib/schema";

import DisplayFields from "./DisplayFields";
import {
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
} from "@material-ui/core";
import { trimEnd } from "lodash";
import { usePageUnload } from "../../utils/react/hooks/usePageUnload";

export const searchEndpointTypes = [
  {
    label: "Elasticsearch",
    value: "ELASTICSEARCH",
    imageSrc: "/images/elasticsearch.png",
    enabled: true,
  },
  {
    label: "OpenSearch",
    value: "OPEN_SEARCH",
    imageSrc: "/images/opensearch.png",
    enabled: true,
  },
  {
    label: "Solr",
    value: "SOLR",
    imageSrc: "/images/solr.png",
    enabled: false,
  },
  // {
  //   label: "Vespa",
  //   value: "VESPA",
  //   imageSrc: "/images/vespa.png",
  //   enabled: false,
  // },
  // {
  //   label: "RediSearch",
  //   value: "REDIS_SEARCH",
  //   imageSrc: "/images/redisearch.png",
  //   enabled: false,
  // },
];

interface Credentials extends SearchEndpointCredentials {
  change: boolean;
}

export interface FormValues extends ExposedSearchEndpoint {
  credentials?: Credentials | null;
}

export type FormProps = BaseFormProps<FormValues> & {
  formId?: string;
  onDelete?: () => void;
  hideActions?: boolean;
};

const useStyles = makeStyles(() => ({
  menuItemLogo: {
    height: "25px",
  },
  deleteButton: {
    float: "right",
    marginRight: "15px",
  },
  saveButton: {
    float: "right",
  },
  testButton: {
    float: "left",
  },
}));

export default function SearchEndpointForm({
  formId,
  onDelete,
  testResultModalOpen,
  connectionTestResult,
  setTestResultModalOpen,
  hideActions,
  ...rest
}: FormProps) {
  const submitted = useRef(false);
  const formStatus = useRef(false);
  const [testConnection, setTestConnection] = React.useState(false);
  const onPageUnload = useCallback(
    (): string | false =>
      formStatus.current && "Changes you made may not be saved.",
    []
  );

  const classes = useStyles();
  const isNew = rest.initialValues?.id === undefined;
  if (rest.initialValues) {
    // @ts-expect-error - change is a fake property which we remove
    rest.initialValues.credentials = { change: isNew };
  }

  function handleSubmit(
    values: FormValues,
    form: FormApi<FormValues, Partial<FormValues>>,
    callback?: (errors?: SubmissionErrors) => void
  ) {
    const payload = { ...values };
    // The "change" prop is not a part of the type
    const credentials: any = payload.credentials;
    // There are 3 cases:
    // credentials: null - unset existing credentials
    // credentials: undefined - do not edit existing credentials
    // credentials: object - update existing credentials
    if (credentials.change) {
      delete credentials.change;
      if (
        (credentials.username || "") == "" &&
        (credentials.password || "") == ""
      ) {
        payload.credentials = null;
      }
    } else {
      delete payload.credentials;
    }

    if (payload.info.endpoint) {
      payload.info.endpoint = `${trimEnd(payload.info?.endpoint, "/")}/`;
    }

    if (testConnection) {
      payload.testConnection = true;
    }

    submitted.current = true;
    return rest.onSubmit(payload, form, callback);
  }

  function handleClose(values: FormValues) {
    setTestResultModalOpen(false);
    setTestConnection(false);
    if (isNew) {
      (values.credentials as any).change = true;
    }
  }

  usePageUnload(onPageUnload);

  return (
    <Form
      {...rest}
      onSubmit={handleSubmit}
      render={({
        handleSubmit,
        submitting,
        values,
        dirty,
        dirtySinceLastSubmit,
      }) => {
        // If form
        // - was submitted, then check if was changed since last submit
        // - is not submitted, check if it was changed
        formStatus.current = submitted.current ? dirtySinceLastSubmit : dirty;
        return (
          <form id={formId} onSubmit={handleSubmit}>
            <Dialog
              open={testResultModalOpen}
              onClose={() => {
                handleClose(values);
              }}
            >
              <DialogTitle id="simple-dialog-title">
                Test Connection
              </DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description">
                  Connection
                  {connectionTestResult?.success ? " successful." : " failed."}
                  {connectionTestResult?.success ||
                    " Error Message: " + connectionTestResult?.message}
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => {
                    handleClose(values);
                  }}
                  color="primary"
                >
                  OK
                </Button>
              </DialogActions>
            </Dialog>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Name"
                  name="name"
                  required={true}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  multiline
                  label="Description"
                  name="description"
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <Select
                  label="Type"
                  name="type"
                  required={true}
                  variant="outlined"
                  readOnly={!isNew}
                >
                  {searchEndpointTypes.map((item) => (
                    <MenuItem
                      key={item.value}
                      value={item.value}
                      disabled={!item.enabled}
                    >
                      <img
                        className={classes.menuItemLogo}
                        src={item.imageSrc}
                        alt={item.label}
                      />
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
              {values.type && (
                <Grid item xs={12}>
                  <TextField
                    label="Search URL"
                    helperText={
                      values.type === "ELASTICSEARCH" ||
                      values.type === "OPEN_SEARCH"
                        ? "This should be endpoint for your search cluster without the index name or _search."
                        : ""
                    }
                    name="info.endpoint"
                    required={true}
                    variant="outlined"
                    size="small"
                  />
                  {values.info?.endpoint.startsWith("https") ? (
                    <FormControlLabel
                      control={
                        <Field name="info.ignoreSSL">
                          {(props) => (
                            <Checkbox
                              {...props.input}
                              checked={props.input.value}
                              size={"small"}
                            />
                          )}
                        </Field>
                      }
                      label="Ignore SSL certificate"
                    />
                  ) : null}
                </Grid>
              )}
              {(values.type === "ELASTICSEARCH" ||
                values.type === "OPEN_SEARCH") && (
                <Grid item xs={12}>
                  <TextField
                    label="Index name"
                    name="info.index"
                    required={true}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <Box mt={1} mb={2}>
                  <Divider />
                </Box>
                <Typography variant="subtitle2" color="textSecondary">
                  Security options
                </Typography>
              </Grid>
              {(values.type === "ELASTICSEARCH" ||
                values.type === "OPEN_SEARCH") && (
                <>
                  {isNew ? null : (
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Field name="credentials.change">
                            {(props) => (
                              <Checkbox
                                {...props.input}
                                checked={props.input.value}
                                size={"small"}
                              />
                            )}
                          </Field>
                        }
                        label="Change saved credentials"
                      />
                      {values.hasCredentials ? (
                        <Typography variant="subtitle2" color="secondary">
                          The credentials were provided already.
                        </Typography>
                      ) : null}
                    </Grid>
                  )}
                  {(isNew || values.credentials?.change === true) && (
                    <>
                      <Grid item xs={12}>
                        <TextField
                          label="Username"
                          name="credentials.username"
                          variant="outlined"
                          size="small"
                          disabled={!(values.credentials as any).change}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Password"
                          name="credentials.password"
                          variant="outlined"
                          type="password"
                          size="small"
                          disabled={!(values.credentials as any).change}
                        />
                      </Grid>
                    </>
                  )}
                </>
              )}
              <Grid item xs={12}>
                <Box mt={1} mb={2}>
                  <Divider />
                </Box>
                <Typography variant="subtitle2" color="textSecondary">
                  Display options
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Result ID"
                  name="resultId"
                  required={true}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <Field name="displayFields">
                  {(props) => <DisplayFields displayFields={props} />}
                </Field>
              </Grid>
              {!hideActions && (
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    className={classes.saveButton}
                    disabled={submitting}
                    variant="contained"
                    color="primary"
                    startIcon={isNew ? undefined : <SaveIcon />}
                  >
                    {isNew ? "Create" : "Update"}
                  </Button>
                  {!isNew && (
                    <Button
                      className={classes.deleteButton}
                      variant="contained"
                      onClick={onDelete}
                      startIcon={<DeleteIcon />}
                    >
                      Delete
                    </Button>
                  )}
                  <Button
                    type="submit"
                    className={classes.testButton}
                    disabled={submitting}
                    variant="contained"
                    color="primary"
                    onClick={() => setTestConnection(true)}
                    startIcon={<FlashOnIcon />}
                  >
                    Test Connection
                  </Button>
                </Grid>
              )}
            </Grid>
          </form>
        );
      }}
    />
  );
}

SearchEndpointForm.defaultProps = {
  initialValues: {
    resultId: "_id",
    displayFields: [],
  },
};
