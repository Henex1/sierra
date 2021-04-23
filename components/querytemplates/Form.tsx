import React, { useState } from "react";
import { Field, Form, FormProps as BaseFormProps } from "react-final-form";
import { TextField, Select } from "mui-rff";

import { makeStyles, MenuItem } from '@material-ui/core';
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import MUITextField from "@material-ui/core/TextField";
import Chip from "@material-ui/core/Chip";

import { ExposedQueryTemplate } from "../../lib/querytemplates";
import JsonEditor from "../JsonEditor";
import { ExposedProject } from "../../lib/projects";

export type FormProps = BaseFormProps<ExposedQueryTemplate> & {
  onDelete?: () => void;
};

const useStyles = makeStyles((theme) => ({
  tagsInputRoot: {
    display: "flex",
    flexWrap: "wrap"
  },
  tagsInput: {
    maxWidth: "250px"
  }
}));

export default function QueryTemplateForm({onDelete, projects, ...rest}: FormProps) {
  const classes = useStyles();
  const isNew = rest.initialValues?.id === undefined;
  const [tagInputValue, setTagInputValue] = useState('');

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    setTagInputValue(inputValue);
  }

  const parseChips = (tagsString: string) => {
    return tagsString ? tagsString.split(" ") : [];
  };

  const handleAddChip = (oldTags: string) => {
    return oldTags ? `${oldTags} ${tagInputValue.trim()}` : tagInputValue.trim();
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
              variant="outlined"
            />
          </Box>
          <Box pb={2}>
            <Select
              name="projectId"
              label="Project Id"
              variant="outlined"
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
              variant="outlined"
            />
          </Box>
          <Box pb={2}>
            <Field name="tag" required>
              {props => {
                const chips = parseChips(props.input.value)
                return (
                  <MUITextField
                    fullWidth
                    label="Tag"
                    variant="outlined"
                    value={tagInputValue}
                    onChange={handleOnChange}
                    InputProps={{
                      startAdornment: !!chips.length && chips.map((chip: string, index: number) => (
                        <Chip
                          style={{ marginRight: "8px", marginTop: "8px"}}
                          key={index}
                          tabIndex={-1}
                          label={chip}
                          onDelete={() => {
                            props.input.onChange({
                              target: {
                                type: "input",
                                value: handleDeleteChip(chips, index),
                              },
                            });
                          }}
                        />
                      )),
                      classes: {
                        root: classes.tagsInputRoot,
                        input: classes.tagsInput
                      }
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        props.input.onChange({
                          target: {
                            type: "input",
                            value: handleAddChip(props.input.value),
                          },
                        });
                        setTagInputValue('');
                        event.preventDefault();
                      }
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
