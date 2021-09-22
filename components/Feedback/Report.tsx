import React, {
  ChangeEventHandler,
  ReactElement,
  useCallback,
  useState,
} from "react";
import { TextField } from "@material-ui/core";
import { useRatingStyles, useTextareaStyles } from "./internal/hooks";
import { Form } from "./internal/Form";

export interface Props {
  submitting: boolean;
  onSubmit: (f: string) => void;
}

export const Report = ({ onSubmit, submitting }: Props): ReactElement => {
  // region Styles
  const C = useRatingStyles();
  const input = useTextareaStyles();
  // endregion

  // region Values
  const [comment, setComment] = useState("");
  // endregion

  // region Handlers
  const handleComment = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (e) => setComment(e.target.value),
    [setComment]
  );
  const handleSubmit = useCallback(() => onSubmit(comment), [
    onSubmit,
    comment,
  ]);
  // endregion

  return (
    <Form onSubmit={handleSubmit} submitting={submitting}>
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
        InputProps={{ className: input.input }}
      />
    </Form>
  );
};
