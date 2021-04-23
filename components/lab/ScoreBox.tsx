import { Avatar, Tooltip, colors, makeStyles } from "@material-ui/core";
import { scaleLinear } from "d3-scale";

const colorScale = scaleLinear<string, string>()
  .domain([0, 50, 100])
  .range([colors.red[500], colors.yellow[500], colors.green[500]]);

const useStyles = makeStyles((theme) => ({
  avatar: {
    width: 60,
    fontSize: "18px",
    color: "#111",
  },
}));

type Props = {
  score: number;
};

export default function ScoreBox({ score }: Props) {
  const classes = useStyles();

  return (
    <Tooltip title="Sierra score">
      <Avatar
        variant="rounded"
        className={classes.avatar}
        style={{
          background: colorScale(score),
        }}
      >
        {Number.isInteger(score) ? score : score.toFixed(1)}
      </Avatar>
    </Tooltip>
  );
}
