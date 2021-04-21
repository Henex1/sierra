import * as React from "react";
import { useRouter } from "next/router";

import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";

import { useActiveProject } from "../../components/Session";
import Link from "../../components/common/Link";
import BreadcrumbsButtons from "../../components/common/BreadcrumbsButtons";
import TableContainer from "@material-ui/core/TableContainer";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import Paper from "@material-ui/core/Paper";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Button from "@material-ui/core/Button";
import GavelIcon from '@material-ui/icons/Gavel';
import AddIcon from "@material-ui/icons/Add";

export default function Judgements() {
  const { project } = useActiveProject();
  const router = useRouter();

  const handleStartJudgmentsEndpoint = () => {
    router.push("/judgements/judging");
  }

  const judgements = [
    {
      name: 'Roller Coaster',
      query: 'bluetooth speaker',
      title: 'NGS Roller Coaster 10W Stereo portable speaker Red',
      supplier: 'NGS'
    }
  ]

  return (
    <div style={{ height: "90%" }}>
      <BreadcrumbsButtons>
        <Link href="/">Home</Link>
        <Typography>Judgements</Typography>
      </BreadcrumbsButtons>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4">Judgements</Typography>
        </Grid>
        {!project &&
          <Grid item xs={6} style={{ margin: "0 auto", textAlign: "center"}}>
            <Typography variant="h6">No project is active</Typography>
            <Typography variant="subtitle1">You must setup or activate project first</Typography>
          </Grid>
        }
        {project &&
          <>
            <Grid item xs={12}>
              <Button
                style={{marginRight: "15px"}}
                variant="outlined"
                startIcon={<GavelIcon/>}
                size="medium"
                onClick={handleStartJudgmentsEndpoint}
              >
                Start Judging
              </Button>
              <Button
                variant="outlined"
                startIcon={<AddIcon/>}
                size="medium"
                onClick={() => {
                }}
              >
                Add judgement
              </Button>
            </Grid>
            <Grid item xs={12}>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Query</TableCell>
                      <TableCell>Title</TableCell>
                      <TableCell>Supplier</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {judgements.map((judgement) => (
                      <TableRow key={judgement.name}>
                        <TableCell component="th">
                          {judgement.name}
                        </TableCell>
                        <TableCell>{judgement.query}</TableCell>
                        <TableCell>{judgement.title}</TableCell>
                        <TableCell>{judgement.supplier}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </>
        }
      </Grid>
    </div>
  );
};
