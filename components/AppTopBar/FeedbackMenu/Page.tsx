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
  switch (type.__type) {
    case Type.Rating:
      return apiRequest("api/feedback/rate", value);
    case Type.Report:
      return apiRequest("api/feedback/report", value);
    case Type.Request:
      return apiRequest("api/feedback/request", value);
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
    (v: Type): Feedback.Feedback => {
      if (submitting || v === type.__type) {
        return type;
      }
      switch (v) {
        case Type.Rating: {
          setType(Feedback.rating(0, ""));
          return type;
        }
        case Type.Report: {
          setType(Feedback.report(""));
          return type;
        }
        case Type.Request: {
          setType(Feedback.request("", ""));
          return type;
        }
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
