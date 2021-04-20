import * as React from "react";
import { Field } from "react-final-form";
import MuiTextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core";
import { useForm } from "react-final-form";
import AceEditor from "react-ace";

import { FilterInstruction, UpDownInstruction } from "../../lib/rulesets/rules";
import JsonEditor from "../JsonEditor";

const useStyles = makeStyles((theme) => ({
  hidden: {
    position: "absolute",
    opacity: 0,
    visibility: "hidden",
    pointerEvents: "none",
  },
}));

type InlineQueryEditor = {
  name: string;
  value: UpDownInstruction | FilterInstruction;
};

export default function InlineQueryEditor({
  name,
  value,
}: React.PropsWithChildren<InlineQueryEditor>) {
  const classes = useStyles();
  const form = useForm();

  const inputRef = React.useRef<HTMLInputElement>();
  const jsonRef = React.useRef<AceEditor>();

  const handleInputChange = (
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  ) => (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value.startsWith("{")) {
      const newValue =
        event.target.value === "{" ? "{\n\t\n}" : event.target.value;
      const position =
        event.target.value === "{"
          ? {
              row: 1,
              column: 1,
            }
          : {
              row: 0,
              column: 0,
            };

      form.batch(() => {
        form.change(`${name}.term`, "");
        form.change(`${name}.query`, newValue);
      });
      jsonRef.current && jsonRef.current.editor.focus();
      setTimeout(() => {
        jsonRef.current &&
          jsonRef.current.editor.selection.setSelectionRange({
            start: position,
            end: position,
          });
      }, 0);
    } else {
      onChange(event);
    }
  };

  const handleJsonChange = (onChange: (v: string) => void) => (val: string) => {
    if (!val.startsWith("{")) {
      form.batch(() => {
        form.change(`${name}.query`, "");
        form.change(`${name}.term`, val);
      });
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } else {
      onChange(val);
    }
  };

  return (
    <>
      <Field name={`${name}.query`}>
        {({ input }) => (
          <JsonEditor
            value={input.value}
            onChange={handleJsonChange(input.onChange)}
            className={!value.query ? classes.hidden : undefined}
            inputRef={jsonRef as React.MutableRefObject<AceEditor>}
            adaptiveHeight
          />
        )}
      </Field>
      <Field name={`${name}.term`}>
        {({ input }) => (
          <MuiTextField
            {...input}
            onChange={handleInputChange(input.onChange)}
            className={value.query ? classes.hidden : undefined}
            inputRef={inputRef}
            fullWidth
          />
        )}
      </Field>
    </>
  );
}
