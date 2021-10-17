import React from "react";
import { Button, colors } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useRouter } from "next/router";
import { scaleLinear } from "d3-scale";
import { apiRequest } from "../../../lib/api";
import { ExposedVote } from "../../../lib/judgements";
import { useLabContext } from "../../../utils/react/hooks/useLabContext";

const colorScale = scaleLinear<string, string>()
  .domain([0, 1, 3])
  .range([colors.red[500], colors.yellow[500], colors.green[500]]);

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    flexDirection: "row",
  },
  button: {
    margin: theme.spacing(0.5),
  },
}));

type Props = {
  vote: ExposedVote;
  documentId: number;
  onChange: () => void;
};

const BUTTONS = ["0 Poor", "1 Fair", "2 Good", "3 Perfect"];

export const VoteScores = ({ vote, onChange, documentId }: Props) => {
  const classes = useStyles();
  const router = useRouter();
  const { searchConfiguration } = useLabContext();

  const handleUpdateVote = async (score: number) => {
    await apiRequest("/api/lab/vote/updateOrCreate", {
      voteId: vote?.id,
      score,
      searchConfigurationId: searchConfiguration?.id,
      documentId,
    });
    router.replace(router.asPath);

    onChange();
  };

  return (
    <div className={classes.container}>
      {BUTTONS.map((button, index) => (
        <Button
          key={`${button}-${index}`}
          className={classes.button}
          style={{ background: colorScale(index) }}
          onClick={() => handleUpdateVote(index)}
        >
          {button}
        </Button>
      ))}
    </div>
  );
};
