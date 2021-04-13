import React from "react";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Modal,
  makeStyles,
} from "@material-ui/core";

import { SearchPhrase } from "../../lib/lab";

const useStyles = makeStyles((theme) => ({
  paper: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

type Props = {
  searchPhrase: SearchPhrase;
  onClose: () => void;
};

export default function DetailModal({ searchPhrase, onClose }: Props) {
  const classes = useStyles();

  return (
    <Modal open={true} onClose={onClose}>
      <div className={classes.paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Scoring Method</TableCell>
              <TableCell>Score</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(searchPhrase.score).map(([method, score]) => (
              <TableRow key={method}>
                <TableCell>{method}</TableCell>
                <TableCell>{score}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Modal>
  );
}
