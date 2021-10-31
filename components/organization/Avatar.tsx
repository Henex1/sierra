import { ReactElement } from "react";
import _Avatar from "@material-ui/core/Avatar";
import { makeStyles } from "@material-ui/styles";

export interface Props {
  name: string;
  image?: string;
  size: "small" | "medium";
  square: boolean;
}

const useStyles = makeStyles(() => ({
  small: {},
  medium: {
    zoom: "300%",
  },
}));

export const Avatar = ({ name, image, size, square }: Props): ReactElement => {
  const classes = useStyles();

  return (
    <_Avatar
      src={image}
      className={classes[size]}
      variant={square ? "rounded" : "circle"}
    >
      {name[0]}
    </_Avatar>
  );
};
