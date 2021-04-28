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

import { ExposedRuleset } from "../../lib/rulesets";

type Props = {
  rulesets: Array<ExposedRuleset>;
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

export default function ProjectRulesetsTable({ rulesets }: Props) {
  const classes = useStyles();

  return (
    <Grid container spacing={3}>
      {rulesets.length === 0 &&
      <Grid item xs={12}>
        <Paper className={classes.emptyPaperWrapper}>
          <Typography variant="h4">No rulesets added to project</Typography>
          <Typography variant="h6">Go to rulesets page to add one</Typography>
        </Paper>
      </Grid>
      }
      {rulesets.length > 0 &&
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
              {rulesets.map((ruleset) => (
                <TableRow key={ruleset.id}>
                  <TableCell>{ruleset.id}</TableCell>
                  <TableCell>{ruleset.name}</TableCell>
                  <TableCell>{ruleset.projectId}</TableCell>
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
