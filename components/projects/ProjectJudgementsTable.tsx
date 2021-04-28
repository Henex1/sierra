import { makeStyles } from "@material-ui/core/styles";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import Paper from "@material-ui/core/Paper";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Table from "@material-ui/core/Table";
import Grid from "@material-ui/core/Grid";
import TableBody from "@material-ui/core/TableBody";
import Typography from "@material-ui/core/Typography";

import { ExposedJudgement } from "../../lib/judgements";

type Props = {
  judgements: Array<ExposedJudgement>;
};

const useStyles = makeStyles((theme) => ({
  emptyPaperWrapper: {
    padding: theme.spacing(5),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column"
  }
}));

export default function ProjectJudgementsTable({ judgements }: Props) {
  const classes = useStyles();

  return (
    <Grid container spacing={3}>
      {judgements.length === 0 &&
        <Grid item xs={12}>
          <Paper className={classes.emptyPaperWrapper}>
            <Typography variant="h4">No judgements added to project</Typography>
            <Typography variant="h6">Go to Judgements page to add one</Typography>
          </Paper>
        </Grid>
      }
      {judgements.length > 0 &&
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Project ID</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {judgements.map((judgement) => (
                  <TableRow key={judgement.id}>
                    <TableCell>{judgement.id}</TableCell>
                    <TableCell>{judgement.name}</TableCell>
                    <TableCell>{judgement.projectId}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      }
    </Grid>
  );
}
