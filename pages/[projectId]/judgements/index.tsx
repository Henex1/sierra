import * as React from "react";
import { useRouter } from "next/router";

import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";

import { useActiveProject } from "../../../components/Session";
import Link from "../../../components/common/Link";
import BreadcrumbsButtons from "../../../components/common/BreadcrumbsButtons";
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
import {authenticatedPage, requireNumberParam} from "../../../lib/pageHelpers";
import {
    ExposedJudgementExtendedMetadata,
    listJudgementsExtended
} from "../../../lib/judgements";
import {getProject} from "../../../lib/projects";
import {Modal, Snackbar} from "@material-ui/core";
import {Alert} from "@material-ui/lab";

export const getServerSideProps = authenticatedPage(async (context) => {
    const projectId = requireNumberParam(context, "projectId");
    const project = await getProject(context.user, projectId);
    if (!project) {
        return { notFound: true };
    }
    const judgements = await listJudgementsExtended(project);
    return { props: { judgements } };
});

type Props = {
    judgements: ExposedJudgementExtendedMetadata[]
}

export default function Judgements({ judgements }: Props) {
    const { project } = useActiveProject();
    const router = useRouter();
    const [showImportModal, setShowImportModal] = React.useState<boolean>(false);
    const [fileUpload, setFileUpload] = React.useState<any>();
    const [judgementName, setJudgementName] = React.useState("");
    const [error, setError] = React.useState("");

    const handleStartJudgmentsEndpoint = () => {
        if (project) {
            router.push(`/${project.id}/judgements/judging`);
        }
    }

    const clearError = () => {
        setError("");
    }

    const handleUpload = async () => {
        const data = new FormData()
        data.append("file", fileUpload);
        data.append("name", judgementName);
        data.append("projectId", `${project?.id}`);
        const response = await fetch("/api/judgements/import", {method: "POST", body: data});
        const json = await response.json();
        if (!json.success) {
            setError(json.error || "Unknown error");
        } else {
            handleCloseModal();
            router.replace(router.asPath);
        }
    }

    const handleCloseModal = () => {
        setShowImportModal(false);
        setFileUpload(undefined);
        setJudgementName("");
    }

    const renderImportModal = () => (
        <Paper style={{ height: 500, width: 500, padding: 10 }}>
            <Typography variant="h6">Import judgements</Typography>
            <Typography variant="body1">Select a CSV file to import.</Typography>
            <div style={{marginBottom: 10}}>
                <input
                    value={judgementName}
                    onChange={(ev) => setJudgementName(ev?.target?.value)}
                />
            </div>
            <div style={{marginBottom: 10}}>
                <input
                    type="file"
                    onChange={(ev) => setFileUpload(ev?.target?.files?.length && ev.target.files[0])}
                />
            </div>
            <Button
                variant="outlined"
                size="medium"
                disabled={!Boolean(fileUpload)}
                onClick={handleUpload}
            >
                Upload
            </Button>
            <Button
                style={{marginLeft: 10}}
                variant="outlined"
                size="medium"
                onClick={handleCloseModal}
            >
                Close
            </Button>
        </Paper>
    );
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
                    <Snackbar
                        open={Boolean(error)}
                        autoHideDuration={6000}
                        onClose={clearError}
                    >
                        <Alert onClose={clearError} severity="error">
                            {error}
                        </Alert>
                    </Snackbar>
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
                                setShowImportModal(true)
                            }}
                        >
                            Import judgements
                        </Button>
                        <Modal
                            open={showImportModal}
                            onClose={handleCloseModal}
                            style={{display:'flex',alignItems:'center',justifyContent:'center'}}
                        >
                            {renderImportModal()}
                        </Modal>
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
                                            <TableCell component="th">
                                                {judgement.name}
                                            </TableCell>
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
                }
            </Grid>
        </div>
    );
};
