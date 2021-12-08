import React, { useState } from "react";
import {
  Box,
  List,
  Grid,
  Paper,
  Typography,
  IconButton,
} from "@material-ui/core";

import AddIcon from "@material-ui/icons/Add";

import FqListItem from "./FqListItem";
import { Item } from "../item/Item";

type Props = {
  onChange: (ev: any) => void;
  value: any;
};

type Item = {
  enabled: boolean;
  label: string;
};

export default function FqList(props: Props) {
  const [items, setItems] = useState<Item[]>(props.value || []);

  const { onChange } = props;

  function updateItems(newItems: Item[]) {
    setItems(newItems);
    onChange(newItems.filter((it) => it.enabled).map((it) => it.label));
  }
  function updateItem(index: number, newItem: Item) {
    updateItems(
      items.map((it: Item, i: number) => (i === index ? newItem : it))
    );
  }

  return (
    <>
      <Box mt={1}>
        <Grid container justify="space-between">
          <Grid item>
            <Typography variant="caption">Filter Query (fq)</Typography>
          </Grid>
          <Grid item>
            <IconButton
              size="small"
              onClick={() =>
                updateItems(
                  items.concat([
                    {
                      enabled: true,
                      label: "",
                    },
                  ])
                )
              }
            >
              <AddIcon />
            </IconButton>
          </Grid>
        </Grid>
      </Box>
      {items.length > 0 && (
        <Paper variant="outlined">
          <List>
            {items.map((item: Item, i: number) => (
              <FqListItem
                key={i}
                label={item.label}
                enabled={items[i].enabled}
                onEnabledChange={(enabled) =>
                  updateItem(i, {
                    enabled,
                    label: item.label,
                  })
                }
                onChange={(ev) =>
                  updateItem(i, {
                    ...items[i],
                    label: ev.target.value,
                  })
                }
                onDelete={() =>
                  updateItems(
                    items.filter((it: any, index: number) => index != i)
                  )
                }
              />
            ))}
          </List>
        </Paper>
      )}
    </>
  );
}
