import * as React from "react";
import { Field, Form, FormProps as BaseFormProps } from "react-final-form";
import { TextField, Select } from "mui-rff";

import { MenuItem } from '@material-ui/core';
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";

import { ExposedQueryTemplate } from "../../lib/querytemplates";
import JsonEditor from "../JsonEditor";
import { ExposedProject } from "../../lib/projects";
import ChipInput from "material-ui-chip-input";

export type FormProps = BaseFormProps<ExposedQueryTemplate> & {
  onDelete?: () => void;
};

export default function QueryTemplateForm({onDelete, projects, ...rest}: FormProps) {
  const isNew = rest.initialValues?.id === undefined;

  const parseChips = (tagsString: string) => {
    return tagsString ? tagsString.split(" ") : [];
  };

  const handleAddChip = (oldTags: string, newTag: string) => {
    return oldTags ? `${oldTags} ${newTag}` : newTag;
  };

  const handleDeleteChip = (chips: Array<string>, index: number) => {
    chips.splice(index, 1)
    return chips.join(" ");
  };

  return (
    <Form
      {...rest}
      render={({handleSubmit, form, submitting, values}) => (
        <form onSubmit={handleSubmit}>
          <Box pb={2}>
            <TextField
              label="Description"
              name="description"
              required={true}
              variant="filled"
            />
          </Box>
          <Box pb={2}>
            <Select
              name="projectId"
              label="Project Id"
              variant="filled"
              required={true}
            >
              {projects && projects.map((project: ExposedProject) => (
                <MenuItem
                  key={project.id}
                  value={project.id}
                >
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </Box>
          <Box pb={2}>
            <TextField
              label="Knobs"
              name="knobs"
              required={true}
              variant="filled"
            />
          </Box>
          <Box pb={2}>
            <Field name="tag">
              {props => {
                const chips = parseChips(props.input.value)
                return (
                  <ChipInput
                    fullWidth
                    required={!props.input.value}
                    label="Tag"
                    variant="filled"
                    value={chips}
                    onAdd={(chip) => {
                      props.input.onChange({
                        target: {
                          type: "input",
                          value: handleAddChip(props.input.value, chip),
                        },
                      });
                    }}
                    onDelete={(chip, index) => {
                      props.input.onChange({
                        target: {
                          type: "input",
                          value: handleDeleteChip(chips, index),
                        },
                      });
                    }}
                  />
                )
              }}
            </Field>
          </Box>
          <Box pb={2}>
            <Field label="query" name="query" required={true}>
              {({input}) => (
                <JsonEditor value={input.value} onChange={input.onChange}/>
              )}
            </Field>
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
