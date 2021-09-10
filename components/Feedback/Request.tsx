import React, {
  ChangeEventHandler,
  ReactElement,
  useCallback,
  useMemo,
  useState,
} from "react";
import { TextField } from "@material-ui/core";
import { useRatingStyles, useTextareaStyles } from "./internal/hooks";
import { Space } from "./internal/Space";
import { Form } from "./internal/Form";

interface Value {
  title: string;
  comment: string;
}

export interface Props {
  submitting: boolean;
  onSubmit: ({ title, comment }: Value) => void;
}

export const Request = ({ onSubmit, submitting }: Props): ReactElement => {
  // region Styles
  const C = useRatingStyles();
  const input = useTextareaStyles();
  const textareaProps = useMemo(() => ({ className: input.input }), [input]);
  // endregion

  // region Values
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  // endregion

  // region Handlers
  const handleTitle = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (e) => setTitle(e.target.value),
    [setTitle]
  );
  const handleComment = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (e) => setComment(e.target.value),
    [setComment]
  );
  const handleSubmit = useCallback(() => onSubmit({ title, comment }), [
    title,
    comment,
    onSubmit,
  ]);
  // endregion

  return (
    <Form onSubmit={handleSubmit} submitting={submitting}>
      <span className={C.label}>Request title</span>
      <TextField
        disabled={submitting}
        placeholder={"Short request description"}
        size={"small"}
        rows={15}
        variant="outlined"
        value={title}
        onChange={handleTitle}
        InputProps={textareaProps}
      />
      <Space />
      <span className={C.label}>Report description</span>
      <TextField
        disabled={submitting}
        placeholder={"Describe the issue you've got"}
        size={"small"}
        multiline
        rows={15}
        variant="outlined"
        value={comment}
        onChange={handleComment}
        InputProps={textareaProps}
      />
    </Form>
  );
};
