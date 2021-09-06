import * as React from "react";
import { Form, FormProps as BaseFormProps } from "react-final-form";
import { TextField, Select } from "mui-rff";
import AddIcon from "@material-ui/icons/Add";

import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import MenuItem from "@material-ui/core/MenuItem";
import Grid from "@material-ui/core/Grid";

import { ExposedProject } from "../../lib/projects";
import { ExposedSearchEndpoint } from "../../lib/searchendpoints";
import SearchEndpointForm from "../searchendpoints/Form";
import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api";
import { ProjectSearchConfigurationsSelect } from "./ProjectSearchConfigurationsSelect";

export type NewProject = ExposedProject & {
  searchEndpoint: ExposedSearchEndpoint;
};

export type FormProps = BaseFormProps<NewProject> & {
  onDelete?: () => void;
  endpoints: ExposedSearchEndpoint[];
};

export function ProjectForm({
  onDelete,
  endpoints,
  mutators = {},
  ...rest
}: FormProps) {
  const [searchConfigurations, setSearchConfigurations] = useState([]);
  const isNew = rest.initialValues?.id === undefined;

  useEffect(() => {
    // Get list of project search configurations
    const getSearchConfigurations = async () => {
      if (!rest?.initialValues?.id) return;

      const { searchConfigurations } = await apiRequest(
        "/api/searchconfigurations",
        {
          projectId: rest.initialValues.id,
        }
      );

      return searchConfigurations;
    };

    getSearchConfigurations()
      .then((scs) => {
        if (scs?.length) {
          setSearchConfigurations(scs);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <Form
      {...rest}
      mutators={{
        ...mutators,
        setSearchEndpoint: (args: [ExposedSearchEndpoint], state, utils) => {
          utils.changeValue(state, "searchEndpoint", () => args[0]);
        },
      }}
      render={({ handleSubmit, form, submitting, values }) => {
        const withNewEndpoint = values.searchEndpointId === "-1";
        const createProjectFormId = withNewEndpoint
          ? undefined
          : "createProjectForm";
        const createSearchEndpointFormId = withNewEndpoint
          ? "createSearchEndpointForm"
          : undefined;
        const formId = withNewEndpoint
          ? createSearchEndpointFormId
          : createProjectFormId;

        return (
          <>
            <form id={createProjectFormId} onSubmit={handleSubmit}>
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
                  label="Search Endpoint ID"
                  helperText="This can be changed to a different search endpoint of the same type later."
                  name="searchEndpointId"
                  variant="filled"
                  required={true}
                >
                  <MenuItem value={"-1"}>
                    <Grid container spacing={1} alignItems="center">
                      <AddIcon fontSize="small" />
                      <Grid item>
                        <Box ml={0.5}>Add New</Box>
                      </Grid>
                    </Grid>
                  </MenuItem>
                  {endpoints &&
                    endpoints.map((endpoint: ExposedSearchEndpoint) => (
                      <MenuItem key={endpoint.id} value={endpoint.id}>
                        {endpoint.name}
                      </MenuItem>
                    ))}
                </Select>
              </Box>
            </form>
            {withNewEndpoint && (
              <Box pb={2}>
                <SearchEndpointForm
                  formId={createSearchEndpointFormId}
                  onSubmit={(newSearchEndpoint) => {
                    form.mutators.setSearchEndpoint(newSearchEndpoint);
                    handleSubmit();
                  }}
                  hideActions
                />
              </Box>
            )}
            {searchConfigurations?.length > 0 && (
              <Box pb={2}>
                <ProjectSearchConfigurationsSelect
                  searchConfigurations={searchConfigurations}
                />
              </Box>
            )}
            <Box pb={2}>
              <Button
                type="submit"
                disabled={submitting}
                variant="contained"
                color="primary"
                form={formId}
              >
                {isNew ? "Create" : "Update"}
              </Button>
              {!isNew && (
                <>
                  <Button variant="contained" onClick={onDelete}>
                    Delete
                  </Button>
                </>
              )}
            </Box>
          </>
        );
      }}
    />
  );
}
