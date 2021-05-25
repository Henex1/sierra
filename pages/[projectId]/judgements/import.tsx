import React, { ChangeEvent, useCallback, useRef, useState } from "react";
import { useRouter } from "next/router";

import {
  Button,
  createStyles,
  InputLabel,
  makeStyles,
  TextField,
  Typography,
  Grid,
  Snackbar,
  IconButton,
  CircularProgress,
} from "@material-ui/core";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import CloseIcon from "@material-ui/icons/Close";
import DescriptionIcon from "@material-ui/icons/Description";
import CancelOutlinedIcon from "@material-ui/icons/CancelOutlined";
import { Alert } from "@material-ui/lab";

import Link from "components/common/Link";
import BreadcrumbsButtons from "components/common/BreadcrumbsButtons";
import { useActiveProject } from "components/Session";
import FileInput from "components/common/FileInput";

const useStyles = makeStyles((theme) =>
  createStyles({
    dialog: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    paper: {
      height: theme.spacing(40),
      width: theme.spacing(60),
      padding: theme.spacing(3),
    },
    form: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      marginTop: theme.spacing(3),
      "& > *": {
        margin: theme.spacing(1),
        width: theme.spacing(45),
      },
    },
    fileInput: {
      display: "none",
    },
    fileInputWrapper: {
      display: "flex",
      alignItems: "center",
    },
    fileInputLabel: {
      textOverflow: "ellipsis",
      overflow: "hidden",
      maxWidth: theme.spacing(25),
      marginLeft: theme.spacing(2),
    },
    buttonActions: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-evenly",
      paddingTop: theme.spacing(3),
    },
    root: {
      height: "90%",
    },
    upload: {},
  })
);

function Import() {
  const { project } = useActiveProject();
  const router = useRouter();
  const classes = useStyles();
  const project_id = project ? project.id : 0;
  const BASE_URL = `/${project_id}/judgements`;

  const [chooseFile, setChooseFile] = useState<File>();
  const [judgementName, setJudgementName] = useState<string>("");
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onFileInputChange = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
    if (ev?.target?.files && ev.target.files.length > 0 && ev.target.files[0]) {
      setChooseFile(ev.target.files[0]);
    }
  }, []);

  const handleClosePage = useCallback(() => {
    router.push(BASE_URL);
  }, [router, BASE_URL]);

  const handleFileUpload = useCallback(() => {
    const onFileUpload = async (file: File, filename: string) => {
      setIsUploading(true);
      const data = new FormData();
      data.append("file", file);
      data.append("name", filename);
      data.append("projectId", `${project?.id}`);
      const response = await fetch("/api/judgements/import", {
        method: "POST",
        body: data,
      });
      const json = await response.json();
      if (!json.success) {
        setError(json.error || "Unknown error");
      } else {
        handleClosePage();
      }
      setIsUploading(false);

      if (fileInputRef?.current) {
        setJudgementName("");
        setChooseFile(undefined);
        fileInputRef.current.value = "";
      }
    };

    if (chooseFile) {
      onFileUpload(chooseFile, judgementName);
    }
  }, [handleClosePage, chooseFile, judgementName, fileInputRef]);

  const clearError = useCallback(() => {
    setError("");
  }, []);

  return (
    <div className={classes.root}>
      <BreadcrumbsButtons>
        <Link href="/">Home</Link>
        <Link href="/judgements">Judgements</Link>
        <Typography>Import</Typography>
      </BreadcrumbsButtons>
      <Grid container spacing={3}>
        <Grid item xs={12} container justify="space-between">
          <Typography variant="h4"> Import judgements</Typography>
          <IconButton
            aria-label="close page"
            component="span"
            onClick={handleClosePage}
          >
            <CancelOutlinedIcon />
          </IconButton>
        </Grid>
        <Grid item xs={12}>
          <form className={classes.form} noValidate autoComplete="off">
            <TextField
              value={judgementName}
              label="Judgement Name"
              onChange={(ev) => setJudgementName(ev?.target?.value)}
            />
            <div className={classes.fileInputWrapper}>
              <FileInput
                id="contained-button-file"
                accept="*.csv"
                buttonProps={{
                  color: "primary",
                  variant: "contained",
                  component: "span",
                  startIcon: <DescriptionIcon />,
                }}
                inputProps={{ ref: fileInputRef }}
                label="Open"
                onChange={onFileInputChange}
              />
              <InputLabel className={classes.fileInputLabel}>
                {chooseFile ? chooseFile.name : "Select a CSV file to import"}
              </InputLabel>
            </div>

            <div>
              The imported file can be an export from Chorus or a Detailed
              Export from Quepid.
            </div>

            <div className={classes.buttonActions}>
              <Button
                disabled={!chooseFile || isUploading}
                variant="contained"
                color="primary"
                component="span"
                className={classes.upload}
                startIcon={
                  isUploading ? (
                    <CircularProgress size={24} />
                  ) : (
                    <CloudUploadIcon />
                  )
                }
                onClick={handleFileUpload}
              >
                Upload
              </Button>

              <Button
                variant="contained"
                color="default"
                component="span"
                startIcon={<CloseIcon />}
                onClick={handleClosePage}
              >
                Close
              </Button>
            </div>
          </form>
        </Grid>
      </Grid>
      <Snackbar
        open={Boolean(error)}
        autoHideDuration={6000}
        onClose={clearError}
      >
        <Alert onClose={clearError} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default Import;
