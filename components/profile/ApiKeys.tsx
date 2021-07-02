import { Grid, makeStyles } from "@material-ui/core";
import React from "react";
import Button from "@material-ui/core/Button";
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
  const classes = useStyles();
  const router = useRouter();

  async function handleAddApiKey() {
    await apiRequest(`/api/users/apikey`, {}, { method: "POST" });
    router.replace(router.asPath);
  }

  async function handleDelete(id: string, event: MouseEvent) {
    event.preventDefault();
    await apiRequest(`/api/users/apikey/${id}`, {}, { method: "DELETE" });
    router.replace(router.asPath);
  }

  function handleClick(apiKey: string) {
    navigator.clipboard.writeText(apiKey);
  }

  return (
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
                        <AssignmentTurnedInOutlinedIcon />
                      </i>
                    </div>
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
          onClick={handleAddApiKey}
        >
          Create API Key
        </Button>
      </Grid>
    </Grid>
  );
};

export default ApiKeys;
