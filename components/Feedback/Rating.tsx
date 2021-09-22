import React, {
  ChangeEventHandler,
  ReactElement,
  useCallback,
  useMemo,
  useState,
} from "react";
import { Rating as Component } from "@material-ui/lab";
import { TextField } from "@material-ui/core";
import { useRatingStyles, useTextareaStyles } from "./internal/hooks";
import { Space } from "./internal/Space";
import { Form } from "./internal/Form";

export interface Value {
  rating: number;
  comment: string;
}

export interface Props {
  submitting: boolean;
  onSubmit: (f: Value) => void;
}

export const Rating = ({ onSubmit, submitting }: Props): ReactElement => {
  // region Styles
  const C = useRatingStyles();
  const input = useTextareaStyles();
  const textareaProps = useMemo(() => ({ className: input.input }), [input]);
  // endregion

  // region Values
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  // endregion

  // region Handlers
  const handleRating = useCallback((_, rating) => setRating(rating), [
    setRating,
  ]);
  const handleComment = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (e) => setComment(e.target.value),
    [setComment]
  );
  const handleSubmit = useCallback(() => onSubmit({ rating, comment }), [
    comment,
    rating,
    onSubmit,
  ]);
  // endregion

  return (
    <Form onSubmit={handleSubmit} submitting={submitting}>
      <span className={C.label}>
        How likely are you to recommend this tool to a friend or co-worker?
      </span>
      <Component
        disabled={submitting}
        value={rating}
        onChange={handleRating}
        size="large"
        className={C.stars}
      />
      <Space />
      <span className={C.label}>Additional comments</span>
      <TextField
        disabled={submitting}
        placeholder="Additional comments"
        size="small"
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
