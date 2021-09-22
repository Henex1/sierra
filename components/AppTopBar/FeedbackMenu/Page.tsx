import React, {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { omit } from "lodash";
import { Feedback as FeedbackComponent } from "../../Feedback";
import { Rating as RatingComponent } from "../../Feedback/Rating";
import { Report as ReportComponent } from "../../Feedback/Report";
import { Request as RequestComponent } from "../../Feedback/Request";
import * as Feedback from "./types/Feedback";
import { Type } from "./types/Feedback";
import { apiRequest } from "../../../lib/api";

export interface Props {
  onClose: () => void;
}

const request = (type: Feedback.Feedback): Promise<void> => {
  const value = omit(type, "__type");
  const requestTypes = {
    [Type.Rating]: "rate",
    [Type.Report]: "report",
    [Type.Request]: "request",
  };

  return apiRequest(`api/feedback/${requestTypes[type.__type]}`, value);
};

const toggleFeedback = (type: Type): Feedback.Feedback => {
  switch (type) {
    case Type.Rating: {
      return Feedback.rating(0, "");
    }
    case Type.Report: {
      return Feedback.report("");
    }
    case Type.Request: {
      return Feedback.request("", "");
    }
  }
};

export const Page = ({ onClose }: Props): ReactElement => {
  const [type, setType] = useState<Feedback.Feedback>(Feedback.rating(0, ""));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const submit = useCallback(
    (v: Feedback.Feedback): void => {
      setType(v);
      setSubmitting(true);
      setError(undefined);
    },
    [submitting, setSubmitting, setType]
  );
  const handleType = useCallback(
    (v: Type): void => {
      if (!submitting && v !== type.__type) {
        setType(toggleFeedback(v));
      }
    },
    [type, setType]
  );
  const form = useMemo((): ReactElement => {
    switch (type.__type) {
      case Type.Rating:
        return (
          <RatingComponent
            submitting={submitting}
            onSubmit={(v) => submit(Feedback.rating(v.rating, v.comment))}
          />
        );
      case Type.Report:
        return (
          <ReportComponent
            submitting={submitting}
            onSubmit={(v) => submit(Feedback.report(v))}
          />
        );
      case Type.Request:
        return (
          <RequestComponent
            submitting={submitting}
            onSubmit={(v) => submit(Feedback.request(v.title, v.comment))}
          />
        );
    }
  }, [type.__type, submit]);
  const handleSuccess = useCallback(() => {
    setSubmitting(false);
    onClose();
  }, [onClose, setSubmitting]);
  const handleFail = useCallback(() => {
    setSubmitting(false);
    setError("Ooops, something got wrong!");
  }, [setSubmitting]);

  useEffect(() => {
    if (!submitting) {
      return;
    }

    let flag = true;

    request(type)
      .then(() => flag && handleSuccess())
      .catch(() => flag && handleFail());

    return () => {
      flag = false;
    };
  }, [type, submitting]);

  return (
    <FeedbackComponent
      onClose={onClose}
      type={type.__type}
      onChange={handleType}
      error={error}
    >
      {form}
    </FeedbackComponent>
  );
};
