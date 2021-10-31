import React, { ReactElement, useState } from "react";
import { Badge, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { Close } from "@material-ui/icons";
import { Theme } from "@material-ui/core/styles";
import { Input } from "./Input";
import { Editor } from "./Editor";

const useStyles = makeStyles((theme: Theme) => ({
  none: {
    width: "100%",
  },
  image: {
    width: "100%",
  },
  close: {
    cursor: "pointer",
    fontSize: theme.typography.fontSize,
    borderRadius: "50%",
    backgroundColor: theme.palette.common.white,
    border: `1px solid ${theme.palette.common.black}`,
  },
  description: {
    marginTop: theme.spacing(),
    fontSize: theme.typography.fontSize,
    color: theme.palette.text.hint,
  },
  error: {
    fontSize: theme.typography.fontSize,
    color: theme.palette.error.main,
  },
}));

const errors = {
  size: "Image size should be 1mb or lower.",
};

export interface Props {
  value?: string;
  onChange: (f: string) => void;
  onRemove: () => void;
  disabled?: boolean;
}

export function AvatarUpload({
  value,
  onChange,
  onRemove,
}: Props): ReactElement {
  const classes = useStyles();
  const [error, setError] = useState<"size" | undefined>();

  const handleImageChange = (file: File): void => {
    if (file.size > 1000000) {
      setError("size");
      return;
    }

    const fr = new FileReader();
    fr.onload = function () {
      const image = new Image();
      image.src = fr.result as string;

      image.onload = () => {
        setError(undefined);
        onChange(image.src);
      };
    };
    fr.readAsDataURL(file);
  };

  return (
    <>
      {error !== undefined ? (
        <Typography variant="subtitle2" className={classes.error}>
          * {errors[error]}
        </Typography>
      ) : null}
      {value ? (
        <Badge
          badgeContent={<Close className={classes.close} onClick={onRemove} />}
        >
          <Editor value={value} onChange={onChange} />
        </Badge>
      ) : (
        <Input onChange={handleImageChange}>
          <img src="/images/no-image.svg" className={classes.none} />
        </Input>
      )}
      <Typography variant="subtitle2" className={classes.description}>
        Image size should be 1mb or lower.
      </Typography>
    </>
  );
}
