import * as React from "react";
import arrayMutators from "final-form-arrays";
import { Form, FormProps } from "react-final-form";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import Box from "@material-ui/core/Box";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import IconButton from "@material-ui/core/IconButton";
import Alert from "@material-ui/lab/Alert";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Paper, { PaperProps } from "@material-ui/core/Paper";
import Draggable from "react-draggable";

import RuleEditor from "./RuleEditor";
import { RulesetVersionValue, Rule } from "../../lib/rulesets";

function PaperComponent(props: PaperProps) {
  return (
    <Draggable
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper {...props} />
    </Draggable>
  );
}

type DiscardChangesDialogProps = {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

function DiscardChangesDialog({
  open,
  onCancel,
  onConfirm,
}: DiscardChangesDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      PaperComponent={PaperComponent}
      aria-labelledby="draggable-dialog-title"
    >
      <DialogTitle style={{ cursor: "move" }} id="draggable-dialog-title">
        Discard changes?
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          You have not yet saved the changes to this rule.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={onCancel} color="primary">
          Continue Editing
        </Button>
        <Button onClick={onConfirm} color="primary">
          Discard Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function NoRuleset() {
  return (
    <Container maxWidth="md">
      Select a rule on the left to get started.
    </Container>
  );
}

type RulesListProps = {
  rules: Rule[];
  selectedRule: number;
  onChangeSelection: (x: number) => void;
  onAddRule: (expression: string) => void;
};

function RulesList({
  rules,
  selectedRule,
  onChangeSelection,
  onAddRule,
}: RulesListProps) {
  const [filter, setFilter] = React.useState("");

  const visibleRules = rules
    .map((rule: Rule, index: number) => {
      if (rule.expression.indexOf(filter) === -1) {
        return null;
      }
      return (
        <ListItem
          key={index}
          button
          selected={selectedRule === index}
          onClick={() => onChangeSelection(index)}
        >
          <ListItemText
            primary={rule.expression || "<new rule>"}
            primaryTypographyProps={{
              style: {
                textDecoration: rules[index].enabled
                  ? "inherit"
                  : "line-through",
                fontStyle: rule.expression ? "normal" : "italic",
              },
            }}
          />
        </ListItem>
      );
    })
    .filter((x) => x);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onAddRule(filter);
  }

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={1} alignItems="center">
        <Grid item xs>
          <TextField
            label="Filter"
            variant="filled"
            fullWidth
            value={filter}
            type="search"
            onChange={(e) => setFilter(e.target.value)}
          />
        </Grid>
        <Grid item>
          <Button type="submit" variant="contained" startIcon={<AddIcon />}>
            New
          </Button>
        </Grid>
      </Grid>
      <Box pt={2} pb={1}>
        <Divider />
      </Box>
      <List>
        {visibleRules}
        {visibleRules.length === 0 && (
          <ListItem alignItems="center">
            <ListItemText
              primary={
                rules.length === 0 ? "Empty ruleset" : "No matching rules"
              }
              primaryTypographyProps={{ style: { fontStyle: "italic" } }}
            />
          </ListItem>
        )}
      </List>
    </form>
  );
}

export type RulesetEditorProps = FormProps<RulesetVersionValue> & {};

export default function RulesetEditor(rest: RulesetEditorProps) {
  const [activeRuleset, setActiveRuleset] = React.useState(-1);
  // Note: storing a function in useState requires setState(() => myFunction),
  // which is why you see setState(() => () => foo), below.
  const [pendingAction, setPendingAction] = React.useState(
    null as null | (() => () => void)
  );

  return (
    <Form
      {...rest}
      mutators={{ ...arrayMutators }}
      render={({ handleSubmit, submitting, values, dirty, form }) => {
        function handleAddRule(expression: string) {
          form.mutators.push("rules", {
            enabled: true,
            expression,
            instructions: [],
          });
          setActiveRuleset(values.rules.length);
        }
        return (
          <Grid container spacing={2}>
            <Grid item md={3}>
              <RulesList
                rules={values.rules}
                selectedRule={activeRuleset}
                onChangeSelection={
                  dirty
                    ? (x) => setPendingAction(() => () => setActiveRuleset(x))
                    : setActiveRuleset
                }
                onAddRule={
                  dirty
                    ? (x) => setPendingAction(() => () => handleAddRule(x))
                    : handleAddRule
                }
              />
            </Grid>
            <Grid item md={8}>
              {activeRuleset === -1 ? (
                <NoRuleset />
              ) : (
                <form onSubmit={handleSubmit}>
                  <RuleEditor
                    name={`rules[${activeRuleset}]`}
                    onDelete={() => {
                      form.mutators.remove("rules", activeRuleset);
                      setActiveRuleset(activeRuleset - 1);
                    }}
                  />
                </form>
              )}
            </Grid>
            <DiscardChangesDialog
              open={pendingAction !== null}
              onCancel={() => setPendingAction(null)}
              onConfirm={() => {
                setPendingAction(null);
                form.reset();
                pendingAction!();
              }}
            />
          </Grid>
        );
      }}
    />
  );
}
