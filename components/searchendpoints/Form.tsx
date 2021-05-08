import React from "react";
import { Form, Field, FormProps as BaseFormProps } from "react-final-form";
import { TextField, Select } from "mui-rff";

import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import MenuItem from "@material-ui/core/MenuItem";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Divider from "@material-ui/core/Divider";
import Typography from "@material-ui/core/Typography";
import SaveIcon from "@material-ui/icons/Save";
import DeleteIcon from "@material-ui/icons/Delete";

import { ExposedSearchEndpoint } from "../../lib/searchendpoints";

import Whitelist from "./Whitelist";
import DisplayFields from "./DisplayFields";

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
    enabled: true,
  },
  {
    label: "Vespa",
    value: "VESPA",
    imageSrc: "/images/vespa.png",
    enabled: false,
  },
  {
    label: "RediSearch",
    value: "REDIS_SEARCH",
    imageSrc: "/images/redisearch.png",
    enabled: false,
  },
];

export type FormProps = BaseFormProps<ExposedSearchEndpoint> & {
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
}));

export default function SearchEndpointForm({
  formId,
  onDelete,
  hideActions,
  ...rest
}: FormProps) {
  const classes = useStyles();
  const isNew = rest.initialValues?.id === undefined;

  return (
    <Form
      {...rest}
      render={({ handleSubmit, form, submitting, values }) => (
        <form id={formId} onSubmit={handleSubmit}>
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
                <Grid item xs={12}>
                  <TextField
                    label="Username"
                    name="info.username"
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Password"
                    name="info.password"
                    variant="outlined"
                    type="password"
                    size="small"
                  />
                </Grid>
              </>
            )}
            <Grid item xs={12}>
              <Field name="whitelist">
                {(props) => <Whitelist whitelistProps={props} />}
              </Field>
            </Grid>
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
              </Grid>
            )}
          </Grid>
        </form>
      )}
    />
  );
}

SearchEndpointForm.defaultProps = {
  initialValues: {
    resultId: "_id",
  },
};
