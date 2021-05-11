import React, { useCallback } from "react";

import {
  Divider,
  Typography,
  Button,
  createStyles,
  makeStyles,
  Grid,
  MenuList,
  MenuItem,
  Popover,
} from "@material-ui/core";

import AddIcon from "@material-ui/icons/Add";

import { ConditionRuleSetFIeld } from "./ConditionRuleSetFIeld";
import { FormApi } from "final-form";
import { FieldArray } from "react-final-form-arrays";
import Box from "@material-ui/core/Box";
import { RuleSetConditionType } from "../../lib/rulesets/rules";

const useStyles = makeStyles((theme) =>
  createStyles({
    instrWrapper: {
      width: "100%",
      display: "flex",
      flexDirection: "column",
    },
    subtitle: {
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2),
    },

    actions: {
      margin: theme.spacing(2),
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
  })
);

type RulesetConditionEditorProps<T> = {
  name: string;
};

export default function RulesetConditionEditor<T>({
  name,
}: RulesetConditionEditorProps<T>) {
  const classes = useStyles();
  const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);

  return (
    <div>
      <Divider />
      <Typography variant="h5" className={classes.subtitle} color="primary">
        Instructions
      </Typography>
      <Grid container spacing={1} className={classes.instrWrapper}>
        <FieldArray name={`${name}`}>
          {({ fields }) => (
            <>
              {fields.map((name, index) => (
                <ConditionRuleSetFIeld
                  key={name}
                  name={name}
                  value={fields.value[index]}
                  onItemDeleteClick={() => fields.remove(index)}
                />
              ))}
              <Box mt={2} mb={2}>
                <Button
                  onClick={(ev) => setMenuAnchor(ev.currentTarget)}
                  variant="contained"
                  color="primary"
                >
                  <AddIcon /> Add Instruction
                </Button>
                <Popover
                  keepMounted
                  anchorEl={menuAnchor}
                  open={Boolean(menuAnchor)}
                  onClose={() => setMenuAnchor(null)}
                  anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                >
                  <MenuList>
                    <MenuItem
                      onClick={() =>
                        fields.push({ type: RuleSetConditionType.DateRange })
                      }
                    >
                      Date & Time Range
                    </MenuItem>
                    <MenuItem
                      onClick={() =>
                        fields.push({ type: RuleSetConditionType.TimeRange })
                      }
                    >
                      Time Range
                    </MenuItem>
                    <MenuItem
                      onClick={() =>
                        fields.push({
                          type: RuleSetConditionType.RequestHeader,
                        })
                      }
                    >
                      Request Header
                    </MenuItem>
                  </MenuList>
                </Popover>
              </Box>
            </>
          )}
        </FieldArray>
      </Grid>
    </div>
  );
}
