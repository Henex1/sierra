import React, { useCallback, useRef } from "react";
import { Form, Field, FormProps as BaseFormProps } from "react-final-form";
import { FormApi, SubmissionErrors } from "final-form";
import { TextField, Select } from "mui-rff";
import {
  Button,
  MenuItem,
  Grid,
  Box,
  Divider,
  Typography,
  useMediaQuery,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import SaveIcon from "@material-ui/icons/Save";
import FlashOnIcon from "@material-ui/icons/FlashOn";
import DeleteIcon from "@material-ui/icons/Delete";
import classNames from "classnames";

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
  Tooltip,
} from "@material-ui/core";
import { trimEnd } from "lodash";
import { usePageUnload } from "../../utils/react/hooks/usePageUnload";

type Type = "ELASTICSEARCH" | "OPENSEARCH" | "SOLR";

interface SearchEndpointConfig {
  label: string;
  value: Type;
  imageSrc: string;
  enabled: boolean;
}

export const searchEndpointTypes: SearchEndpointConfig[] = [
  {
    label: "Elasticsearch",
    value: "ELASTICSEARCH",
    imageSrc: "/images/elasticsearch.png",
    enabled: true,
  },
  {
    label: "OpenSearch",
    value: "OPENSEARCH",
    imageSrc: "/images/opensearch.png",
    enabled: true,
  },
  {
    label: "Solr",
    value: "SOLR",
    imageSrc: "/images/solr.png",
    enabled: true,
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

const indexTitle = (id: Type): string => {
  switch (id) {
    case "ELASTICSEARCH":
    case "OPENSEARCH":
      return "Index name";
    case "SOLR":
      return "Collection";
  }
};

interface Credentials extends SearchEndpointCredentials {
  change: boolean;
}

export interface FormValues extends ExposedSearchEndpoint {
  credentials?: Credentials | null;
}

export type FormProps = BaseFormProps<FormValues> & {
  formId?: string;
  onDelete?: () => void;
  removable?: boolean;
  removeMessage?: string;
  hideActions?: boolean;
  resultModalOpen?: boolean;
  resultMessage?: {
    success: boolean;
    title: string;
    message: string;
  };
  setResultModalOpen?: (s: boolean) => void;
};

const useStyles = makeStyles((theme) => ({
  menuItemLogo: {
    height: "25px",
  },
  deleteButton: {
    marginRight: "15px",
    "&.Mui-disabled": {
      pointerEvents: "auto",
    },
  },
  floatRight: {
    float: "right",
  },
  testButton: {
    float: "left",
  },
  fullWidthBtn: {
    width: "100%",
    marginBottom: theme.spacing(1),
    marginRight: 0,
  },
}));

export default function SearchEndpointForm({
  formId,
  onDelete,
  resultModalOpen,
  resultMessage,
  setResultModalOpen,
  hideActions,
  removable,
  removeMessage,
  ...rest
}: FormProps) {
  const submitted = useRef(false);
  const formStatus = useRef(false);
  const [testConnection, setTestConnection] = React.useState(false);
  const maxWidthMatches = useMediaQuery("(max-width:499px)");
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
    const payload: FormValues = {
      ...values,
      info: {
        ...values.info,
        endpoint: `${trimEnd(values.info.endpoint, "/")}/`,
      },
    };
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
    setResultModalOpen?.(false);
    setTestConnection(false);
    if (isNew) {
      (values.credentials as any).change = true;
    }
  }

  usePageUnload(onPageUnload);

  const RemoveTooltip = useCallback(
    ({ children }: { children: React.ReactElement }): React.ReactElement => {
      return removeMessage ? (
        <Tooltip title={removeMessage} placement="top">
          {children}
        </Tooltip>
      ) : (
        children
      );
    },
    [removeMessage]
  );

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
              open={resultModalOpen ?? false}
              onClose={() => {
                handleClose(values);
              }}
            >
              <DialogTitle id="simple-dialog-title">
                Test Connection
              </DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description">
                  {resultMessage?.title}.
                  {resultMessage?.success ||
                    " Error Message: " + resultMessage?.message}
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
                      values.type === "OPENSEARCH"
                        ? "This should be endpoint for your search cluster without the index name or _search."
                        : ""
                    }
                    name="info.endpoint"
                    required={true}
                    variant="outlined"
                    size="small"
                  />
                  {values.info?.endpoint?.startsWith("https") ? (
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
              <Grid item xs={12}>
                {["ELASTICSEARCH", "OPENSEARCH", "SOLR"].includes(
                  values.type
                ) ? (
                  <TextField
                    label={indexTitle(values.type as Type)}
                    name="info.index"
                    required={true}
                    variant="outlined"
                    size="small"
                  />
                ) : null}
              </Grid>
              <Grid item xs={12}>
                <Box mt={1} mb={2}>
                  <Divider />
                </Box>
                <Typography variant="subtitle2" color="textSecondary">
                  Security options
                </Typography>
              </Grid>
              {["ELASTICSEARCH", "OPENSEARCH", "SOLR"].includes(
                values.type
              ) && (
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
                    className={classNames(
                      classes.testButton,
                      maxWidthMatches && classes.fullWidthBtn
                    )}
                    disabled={submitting}
                    variant="contained"
                    color="primary"
                    onClick={() => setTestConnection(true)}
                    startIcon={<FlashOnIcon />}
                  >
                    Test Connection
                  </Button>
                  <Box className={`${!maxWidthMatches && classes.floatRight}`}>
                    {!isNew && (
                      <RemoveTooltip>
                        <Button
                          className={classNames(
                            classes.deleteButton,
                            maxWidthMatches && classes.fullWidthBtn
                          )}
                          variant="contained"
                          onClick={onDelete}
                          startIcon={<DeleteIcon />}
                          disabled={removable === false}
                          // There are some problems when adding tooltips on disabled elements
                          // @ts-expect-error, https://stackoverflow.com/questions/61115913/is-it-possible-to-render-a-tooltip-on-a-disabled-material-ui-button-within-a
                          component={removable === false ? "div" : undefined}
                        >
                          Delete
                        </Button>
                      </RemoveTooltip>
                    )}
                    <Button
                      type="submit"
                      className={`${maxWidthMatches && classes.fullWidthBtn}`}
                      disabled={submitting}
                      variant="contained"
                      color="primary"
                      startIcon={isNew ? undefined : <SaveIcon />}
                    >
                      {isNew ? "Create" : "Update"}
                    </Button>
                  </Box>
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
