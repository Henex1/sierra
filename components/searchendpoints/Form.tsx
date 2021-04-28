import React from "react";
import { Form, Field, FormProps as BaseFormProps } from "react-final-form";
import { TextField, Select } from "mui-rff";

import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import MenuItem from "@material-ui/core/MenuItem";
import Grid from "@material-ui/core/Grid";
import SaveIcon from '@material-ui/icons/Save';
import DeleteIcon from '@material-ui/icons/Delete';

import { ExposedSearchEndpoint } from "../../lib/searchendpoints";

import Whitelist from "./Whitelist";
import DisplayFields from "./DisplayFields";

export type FormProps = BaseFormProps<ExposedSearchEndpoint> & {
  onDelete?: () => void;
};

const useStyles = makeStyles(() => ({
  menuItemLogo: {
    height: "25px"
  },
  deleteButton: {
    float: "right",
    marginRight: "15px"
  },
  saveButton: {
    float: "right"
  }
}));

export default function SearchEndpointForm({onDelete, ...rest}: FormProps) {
  const classes = useStyles();
  const isNew = rest.initialValues?.id === undefined;

  return (
    <Form
      {...rest}
      render={({handleSubmit, form, submitting, values}) => (
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Name"
                name="name"
                required={true}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                variant="outlined"
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
                <MenuItem value="ELASTICSEARCH">
                  <img className={classes.menuItemLogo} src="/images/elasticsearch.png" alt="Elasticsearch logo" />
                </MenuItem>
                <MenuItem value="OPEN_SEARCH">
                  <img className={classes.menuItemLogo} src="/images/opensearch.png" alt="OpenSearch logo" />
                </MenuItem>
                <MenuItem value="SOLR">
                  <img className={classes.menuItemLogo} src="/images/solr.png" alt="Solr logo" />
                </MenuItem>
                <MenuItem value="VESPA" disabled>
                  <img className={classes.menuItemLogo} src="/images/vespa.png" alt="Vespa logo" />
                </MenuItem>
                <MenuItem value="REDIS_SEARCH" disabled>
                  <img className={classes.menuItemLogo} src="/images/redisearch.png" alt="RediSearch logo" />
                </MenuItem>
              </Select>
            </Grid>
              {values.type &&
                <Grid item xs={12}>
                  <TextField
                    label="Search URL"
                    helperText={
                      values.type === "ELASTICSEARCH" ?
                        "This should be endpoint for your search instance without the _search." : ""
                    }
                    name="info.endpoint"
                    required={true}
                    variant="outlined"
                  />
                </Grid>
              }
              {(values.type === "ELASTICSEARCH" ||values.type === "OPEN_SEARCH") &&
                <Grid item xs={12}>
                  <TextField
                    label="Index name"
                    name="info.index"
                    required={true}
                    variant="outlined"
                  />
                </Grid>
              }
              {(values.type === "ELASTICSEARCH" ||values.type === "OPEN_SEARCH") &&
                <>
                  <Grid item xs={12}>
                    <TextField
                      label="Username"
                      name="info.username"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Password"
                      name="info.password"
                      variant="outlined"
                      type="password"
                    />
                  </Grid>
                </>
              }
            <Grid item xs={12}>
              <Field name="whitelist">
                {props => (<Whitelist whitelistProps={props}/>)}
              </Field>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Result ID"
                name="resultId"
                required={true}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <Field name="displayFields">
                {props => (<DisplayFields displayFields={props}/>)}
              </Field>
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                className={classes.saveButton}
                disabled={submitting}
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
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
          </Grid>
        </form>
      )}
    />
  );
}
