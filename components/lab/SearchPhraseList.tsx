import React, { ReactElement, useCallback } from "react";
import { List, Typography } from "@material-ui/core";
import { ExposedSearchPhrase } from "../../lib/lab";
import { useStyles } from "./hooks";
import { ErrorItem } from "./item/ErrorItem";
import { Item } from "./item/Item";

type Props = {
  searchPhrases: ExposedSearchPhrase[];
  activePhrase: ExposedSearchPhrase | null;
  setActivePhrase: (value: ExposedSearchPhrase | null) => void;
};

export default function SearchPhraseList({
  searchPhrases,
  activePhrase,
  setActivePhrase,
}: Props) {
  const classes = useStyles();
  const handleClick = useCallback(
    (item: ExposedSearchPhrase) => {
      if (activePhrase?.id !== item.id) {
        setActivePhrase(item);
      } else {
        setActivePhrase(null);
      }
    },
    [activePhrase]
  );

  if (!searchPhrases.length) {
    return (
      <Typography variant="body1" className={classes.empty}>
        No results.
      </Typography>
    );
  }

  return (
    <>
      <List className={classes.list}>
        {searchPhrases.slice(0, 10).map(
          (item): ReactElement => {
            switch (item.__type) {
              case "FailedSearchPhraseExecution":
                return <ErrorItem item={item} />;
              case "ScoredSearchPhraseExecution": {
                const itemStatus = !activePhrase
                  ? "normal"
                  : activePhrase.id === item.id
                  ? "active"
                  : "inactive";
                return (
                  <Item onClick={handleClick} item={item} status={itemStatus} />
                );
              }
            }
          }
        )}
      </List>
    </>
  );
}
