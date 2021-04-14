import { Typography, Chip, colors, makeStyles } from "@material-ui/core";

import Link from "../common/Link";

const useStyles = makeStyles((theme) => ({
  teams: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 140px",
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  teamCard: {
    padding: theme.spacing(3),
    color: "inherit",
    textDecoration: "none",
    border: "1px solid #eaeaea",
    borderRadius: 10,
    transition: "0.15s",
    "&:hover, &:focus, &:active": {
      color: colors.blue[500],
      borderColor: colors.blue[500],
      textDecoration: "none",
    },
  },
  teamCardTitle: {
    marginBottom: theme.spacing(1),
    "& > span": {
      marginRight: theme.spacing(2),
    },
  },
  chip: {
    textTransform: "capitalize",
  },
}));

type Props = {
  teams: { [key: string]: any }[];
};

export default function TeamList({ teams }: Props) {
  const classes = useStyles();

  return (
    <div className={classes.teams}>
      {teams.length ? (
        <>
          {teams.slice(0, 3).map((team) => (
            <Link href="#" className={classes.teamCard} key={team.id}>
              <Typography variant="h5" className={classes.teamCardTitle}>
                <span>{team.name}</span>
                <Chip
                  label={team.role.toLowerCase()}
                  size="small"
                  className={classes.chip}
                />
              </Typography>
              <Typography color="textSecondary">{`${team.members} members`}</Typography>
            </Link>
          ))}
          <Link href="#" className={classes.teamCard}>
            <Typography variant="h6" className={classes.teamCardTitle}>
              View all..
            </Typography>
          </Link>
        </>
      ) : (
        <Typography>No teams yet.</Typography>
      )}
    </div>
  );
}
