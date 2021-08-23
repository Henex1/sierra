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
    (item: ExposedSearchPhrase) =>
      setActivePhrase(activePhrase?.id !== item.id ? item : null),
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
        {searchPhrases.map(
          (item): ReactElement => {
            let content = null;

            switch (item.__type) {
              case "FailedSearchPhraseExecution":
                content = <ErrorItem key={item.id} item={item} />;
                break;
              case "ScoredSearchPhraseExecution": {
                let itemStatus = "inactive";

                if (!activePhrase) {
                  itemStatus = "normal";
                } else if (activePhrase.id === item.id) {
                  itemStatus = "active";
                }

                content = (
                  <Item
                    key={item.id}
                    onClick={handleClick}
                    item={item}
                    status={itemStatus as "active" | "inactive" | "normal"}
                  />
                );
              }
            }

            return <React.Fragment key={item.id}>{content}</React.Fragment>;
          }
        )}
      </List>
    </>
  );
}
