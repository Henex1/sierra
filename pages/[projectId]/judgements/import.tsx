import React, {
  ChangeEvent,
  useCallback,
  useRef,
  useState,
  useMemo,
} from "react";
import { useRouter } from "next/router";

import {
  Button,
  createStyles,
  InputLabel,
  makeStyles,
  TextField,
  Typography,
  Grid,
  MenuItem,
  Select,
  Snackbar,
  IconButton,
  CircularProgress,
  FormControl,
} from "@material-ui/core";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import { Alert } from "@material-ui/lab";

import Link from "../../../components/common/Link";
import BreadcrumbsButtons from "../../../components/common/BreadcrumbsButtons";
import { useActiveProject } from "../../../components/Session";
import FileInput from "../../../components/common/FileInput";

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
        width: theme.spacing(70),
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
      maxWidth: theme.spacing(30),
      marginLeft: theme.spacing(2),
    },
    buttonActions: {
      display: "flex",
      alignItems: "center",
      paddingTop: theme.spacing(3),
    },
    root: {
      height: "90%",
    },
  })
);

const steps: ["file-upload", "judgement-form"] = [
  "file-upload",
  "judgement-form",
];

function Import() {
  const { project } = useActiveProject();
  const router = useRouter();
  const classes = useStyles();
  const project_id = project ? project.id : 0;
  const BASE_URL = `/${project_id}/judgements`;

  const [step, setStep] = useState(0);
  const [chooseFile, setChooseFile] = useState<File>();
  const [uploadedColumns, setUploadedColumns] = useState<string[]>([]);
  const [voteColumns, setVoteColumns] = useState({
    "Search phrase": "",
    "Document Id": "",
    Rating: "",
  });
  const [judgementName, setJudgementName] = useState<string>("");
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formIsValid = useMemo(() => {
    const selectedVoteColumns = Object.values(voteColumns);
    return (
      judgementName.trim().length &&
      !selectedVoteColumns.some((column) => !column.trim().length) &&
      new Set(selectedVoteColumns).size === selectedVoteColumns.length
    );
  }, [judgementName, voteColumns]);

  const handleNextStep = useCallback(() => {
    if (step < steps.length - 1) setStep((step) => step + 1);
  }, [step]);

  const handlePreviousStep = useCallback(() => {
    if (step > 0) setStep((step) => step - 1);
  }, [step]);

  const onFileInputChange = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
    if (ev?.target?.files && ev.target.files.length > 0 && ev.target.files[0]) {
      setChooseFile(ev.target.files[0]);
    }
  }, []);

  const handleGetColumns = useCallback(() => {
    const onFileUpload = async (file: File) => {
      setIsUploading(true);
      const data = new FormData();
      data.append("file", file);
      const response = await fetch("/api/judgements/getColumns", {
        method: "POST",
        body: data,
      });
      const json = await response.json();
      if (!json.success) {
        setError(json.error || "Unknown error");
      } else {
        setUploadedColumns(json.columns);
        handleNextStep();
      }

      setIsUploading(false);
    };
    if (chooseFile) {
      onFileUpload(chooseFile);
    }
  }, [chooseFile]);

  const handleVoteColumnsChange = useCallback(
    (column: string) => (e: any) => {
      setVoteColumns((voteColumns) => ({
        ...voteColumns,
        [column]: e.target.value,
      }));
    },
    []
  );

  const handleFileUpload = useCallback(() => {
    const onFileUpload = async (file: File, filename: string) => {
      setIsUploading(true);
      const data = new FormData();
      data.append("file", file);
      data.append("name", filename);
      data.append("projectId", `${project?.id}`);
      data.append("searchPhraseColumn", voteColumns["Search phrase"]);
      data.append("documentIdColumn", voteColumns["Document Id"]);
      data.append("ratingColumn", voteColumns.Rating);
      const response = await fetch("/api/judgements/import", {
        method: "POST",
        body: data,
      });
      const json = await response.json();
      if (!json.success) {
        setError(json.error || "Unknown error");
      } else {
        router.push(BASE_URL);
      }
      setIsUploading(false);

      if (fileInputRef?.current) {
        setJudgementName("");
        setChooseFile(undefined);
        fileInputRef.current.value = "";
      }
    };

    if (chooseFile && formIsValid) {
      onFileUpload(chooseFile, judgementName);
    }
  }, [chooseFile, judgementName, fileInputRef, formIsValid, voteColumns]);

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
      <Grid item xs={12}>
        {steps[step] === "file-upload" && (
          <form className={classes.form} noValidate autoComplete="off">
            <div className={classes.fileInputWrapper}>
              <FileInput
                id="contained-button-file"
                accept="*.csv"
                buttonProps={{
                  color: "primary",
                  variant: "outlined",
                  component: "span",
                  startIcon: <AttachFileIcon />,
                }}
                inputProps={{ ref: fileInputRef }}
                label={chooseFile ? chooseFile.name : "Import file"}
                onChange={onFileInputChange}
              />
            </div>

            <div>
              Select a CSV / TSV file to import. The imported file can be an
              export from Chorus or a Detailed Export from Quepid.
            </div>

            <div className={classes.buttonActions}>
              <Button
                disabled={!chooseFile || isUploading}
                variant="contained"
                color="primary"
                component="span"
                startIcon={
                  isUploading ? <CircularProgress size={24} /> : undefined
                }
                onClick={handleGetColumns}
              >
                Continue
              </Button>
            </div>
          </form>
        )}
        {steps[step] === "judgement-form" && (
          <form className={classes.form} noValidate autoComplete="off">
            <TextField
              value={judgementName}
              label="Judgement Name *"
              variant="filled"
              onChange={(ev) => setJudgementName(ev?.target?.value)}
            />

            <div>
              Select columns for <strong>Search phrase</strong>,{" "}
              <strong>Document Id</strong>, and <strong>Rating</strong>
            </div>

            {Object.keys(voteColumns).map((key) => (
              <FormControl key={key}>
                <InputLabel id={`${key}-select-label`} variant="filled">
                  {key} *
                </InputLabel>
                <Select
                  labelId={`${key}-select-label`}
                  id={`${key}-select`}
                  value={(voteColumns as any)[key]}
                  onChange={handleVoteColumnsChange(key)}
                  label={`${key} *`}
                  variant="filled"
                >
                  {uploadedColumns.map((column) => (
                    <MenuItem key={column} value={column}>
                      {column}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ))}

            <div className={classes.buttonActions}>
              <IconButton
                color="primary"
                component="span"
                onClick={handlePreviousStep}
              >
                <ArrowBackIcon />
              </IconButton>
              <Button
                disabled={!chooseFile || !formIsValid || isUploading}
                variant="contained"
                color="primary"
                component="span"
                startIcon={
                  isUploading ? <CircularProgress size={24} /> : undefined
                }
                onClick={handleFileUpload}
              >
                Confirm
              </Button>
            </div>
          </form>
        )}
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
