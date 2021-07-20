import { Grid, makeStyles } from "@material-ui/core";
import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import { apiRequest } from "../../lib/api";
import { useRouter } from "next/router";
import Link from "../common/Link";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import { ExposedApiKey } from "../../lib/users/apikey";
import AssignmentTurnedInOutlinedIcon from "@material-ui/icons/AssignmentTurnedInOutlined";
import TableContainer from "@material-ui/core/TableContainer";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TextField from "@material-ui/core/TextField";
import Checkbox from "@material-ui/core/Checkbox";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

const useStyles = makeStyles(() => ({
  apiKey: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",

    "&:hover, &:focus, &:active": {
      cursor: "pointer",
      color: "black",
      "& i": {
        visibility: "visible",
      },
      "& span": {
        textDecoration: "underline",
      },
    },

    "& i": {
      color: "#909090",
      visibility: "hidden",
    },
  },
}));

type Props = {
  list: ExposedApiKey[];
};

const ApiKeys = ({ list }: Props) => {
  const [aliasError, setAliasError] = useState(false);
  const [alias, setAlias] = useState("");
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const classes = useStyles();
  const router = useRouter();

  async function handleDialogOpen() {
    setDialogOpen(true);
  }

  async function handleAddApiKey() {
    if (alias == null || alias == "") {
      setAliasError(true);
      return;
    }
    await apiRequest(`/api/users/apikey`, { alias: alias }, { method: "POST" });
    setDialogOpen(false);
    setAlias("");
    router.replace(router.asPath);
  }

  async function handleDelete(id: string, event: MouseEvent) {
    event.preventDefault();
    await apiRequest(`/api/users/apikey/${id}`, {}, { method: "DELETE" });
    router.replace(router.asPath);
  }

  function handleClick(apiKey: string) {
    navigator.clipboard.writeText(apiKey);
    setTooltipOpen(true);
    setTimeout(handleTooltipClose, 600);
  }

  function handleTooltipClose() {
    setTooltipOpen(false);
  }

  function handleDialogClose() {
    setDialogOpen(false);
  }

  function handleAliasFieldChange(e: any) {
    setAliasError(false);
    setAlias(e.target.value);
  }

  async function handleApiKeyEnabledClick(apikey: ExposedApiKey) {
    await apiRequest(
      `/api/users/apikey`,
      { id: apikey.apikey, disabled: !apikey.disabled },
      { method: "PATCH" }
    );
    router.replace(router.asPath);
  }

  return (
    <div>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography gutterBottom variant="h5" component="h2">
            API Keys
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>API Key</TableCell>
                  <TableCell>Alias</TableCell>
                  <TableCell>Expires</TableCell>
                  <TableCell>Enabled</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {list.map((apikey) => (
                  <TableRow key={apikey.apikey}>
                    <TableCell>
                      <div
                        className={classes.apiKey}
                        onClick={() => handleClick(apikey.apikey)}
                      >
                        <span>{apikey.apikey}</span>{" "}
                        <i>
                          <Tooltip
                            PopperProps={{
                              disablePortal: true,
                            }}
                            onClose={handleTooltipClose}
                            open={tooltipOpen}
                            disableFocusListener
                            disableHoverListener
                            disableTouchListener
                            title="Copied to clipboard"
                          >
                            <AssignmentTurnedInOutlinedIcon />
                          </Tooltip>
                        </i>
                      </div>
                    </TableCell>
                    <TableCell>{apikey.alias}</TableCell>
                    <TableCell>{apikey.expirationDate}</TableCell>
                    <TableCell>
                      <Checkbox
                        checked={!apikey.disabled}
                        onChange={() => handleApiKeyEnabledClick(apikey)}
                      />
                    </TableCell>
                    <TableCell>
                      <Link
                        href="#"
                        onClick={(event: any) =>
                          handleDelete(apikey.apikey, event)
                        }
                      >
                        DELETE
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        <Grid item xs={12}>
          <Button
            type="submit"
            disabled={false}
            variant="contained"
            color="primary"
            onClick={handleDialogOpen}
          >
            Create API Key
          </Button>
        </Grid>
      </Grid>
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Create API Key</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please provide an alias to remember what this API key is for
          </DialogContentText>
          <TextField
            error={aliasError}
            required
            autoFocus
            margin="dense"
            id="name"
            label="Alias"
            type="text"
            fullWidth
            value={alias}
            onChange={handleAliasFieldChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleAddApiKey} color="primary">
            CREATE
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ApiKeys;
