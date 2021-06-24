import React, { useCallback, useState } from "react";
import { Title } from "./Title";
import { Image } from "./Image";
import { Text } from "./Text";
import { fieldByPrefix, getField, withoutPrefix } from "./utils";
import { IconButton, Modal, Paper } from "@material-ui/core";
import FullScreenIcon from "@material-ui/icons/Fullscreen";
import Grid from "@material-ui/core/Grid";
import { useStyles } from "./styles";
import { JSONPreview } from "../../common/JSONPreview";

type Data = Record<string, unknown>;

type Props = {
  displayFields: string[];
  result: Data;
};

export function ResultCard({ displayFields, result }: Props) {
  const classes = useStyles();
  const [modalOpen, setModal] = useState(false);
  const openModal = useCallback(() => setModal(true), []);
  const closeModal = useCallback(() => setModal(false), []);

  const fields = withoutPrefix(displayFields);
  const title = getField(fieldByPrefix("title", displayFields), result);
  const url = getField(fieldByPrefix("url", displayFields), result);
  const image = getField(fieldByPrefix("image", displayFields), result);

  return (
    <Grid container justify="space-between">
      <Grid item>
        {title ? (
          <Title
            field={title.field}
            title={title.value as string}
            url={url && url.value}
            key={title.field}
          />
        ) : null}
        {image ? (
          <Image src={image.value} field={image.field} key={image.field} />
        ) : null}
        {fields.map((field): JSX.Element | null => {
          const text = getField(field, result);
          return text ? (
            <Text text={text.value} field={field} key={field} />
          ) : null;
        })}
        <Modal
          open={modalOpen}
          onClose={closeModal}
          disableEnforceFocus
          className={classes.modal}
        >
          <Paper className={classes.popover}>
            <JSONPreview data={result} />
          </Paper>
        </Modal>
      </Grid>
      <Grid item>
        <IconButton onClick={openModal}>
          <FullScreenIcon />
        </IconButton>
      </Grid>
    </Grid>
  );
}

export default ResultCard;
