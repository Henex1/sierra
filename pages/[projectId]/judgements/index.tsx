import React, { useCallback } from "react";
import { useRouter } from "next/router";

import {
  Typography,
  TableContainer,
  Grid,
  Table,
  TableBody,
  TableCell,
  Paper,
  TableHead,
  TableRow,
  Button,
} from "@material-ui/core";
import GavelIcon from "@material-ui/icons/Gavel";
import AddIcon from "@material-ui/icons/Add";

import BreadcrumbsButtons from "components/common/BreadcrumbsButtons";
import { useActiveProject } from "components/Session";
import Link from "components/common/Link";
import { authenticatedPage, requireParam } from "lib/pageHelpers";
import {
  ExposedJudgementExtendedMetadata,
  listJudgementsExtended,
} from "lib/judgements";
import { getProject } from "lib/projects";

export const getServerSideProps = authenticatedPage(async (context) => {
  const projectId = requireParam(context, "projectId");
  const project = await getProject(context.user, projectId);
  if (!project) {
    return { notFound: true };
  }
  const judgements = await listJudgementsExtended(project);
  return { props: { judgements } };
});

type Props = {
  judgements: ExposedJudgementExtendedMetadata[];
};

export default function Judgements({ judgements }: Props) {
  const { project } = useActiveProject();
  const router = useRouter();
  const BASE_URL = project && project.id ? `/${project.id}/judgements` : "";

  const handleStartJudgmentsEndpoint = () => {
    if (project) {
      router.push(`${BASE_URL}/judging`);
    }
  };

  const handleOpenImportPage = useCallback(() => {
    router.push(`${BASE_URL}/import`);
  }, [router, project]);

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
        {!project && (
          <Grid item xs={6} style={{ margin: "0 auto", textAlign: "center" }}>
            <Typography variant="h6">No project is active</Typography>
            <Typography variant="subtitle1">
              You must setup or activate project first
            </Typography>
          </Grid>
        )}
        {project && (
          <>
            <Grid item xs={12}>
              <Button
                style={{ marginRight: "15px" }}
                variant="outlined"
                startIcon={<GavelIcon />}
                size="medium"
                onClick={handleStartJudgmentsEndpoint}
              >
                Start Judging
              </Button>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                size="medium"
                onClick={() => {
                  handleOpenImportPage();
                }}
              >
                Import judgements
              </Button>
            </Grid>
            <Grid item xs={12}>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Total Phrases</TableCell>
                      <TableCell>Total Votes</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {judgements.map((judgement) => (
                      <TableRow key={judgement.name}>
                        <TableCell component="th">{judgement.name}</TableCell>
                        <TableCell component="th">
                          {judgement.totalSearchPhrases}
                        </TableCell>
                        <TableCell component="th">
                          {judgement.totalVotes}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </>
        )}
      </Grid>
    </div>
  );
}
