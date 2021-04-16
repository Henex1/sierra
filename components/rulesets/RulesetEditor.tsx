import * as React from "react";
import arrayMutators from "final-form-arrays";
import { Form, FormProps } from "react-final-form";
import { FieldArray, FieldArrayRenderProps } from "react-final-form-arrays";
import {
  DragDropContext,
  Droppable,
  Draggable as DraggableBox,
  DropResult,
} from "react-beautiful-dnd";
import { resetServerContext } from "react-beautiful-dnd";
import Draggable from "react-draggable";

import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import Box from "@material-ui/core/Box";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import AddIcon from "@material-ui/icons/Add";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Paper, { PaperProps } from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import DragIndicatorIcon from "@material-ui/icons/DragIndicator";
import SettingsIcon from "@material-ui/icons/Settings";

import Link from "../common/Link";
import RuleEditor from "./RuleEditor";
import { ExposedRuleset } from "../../lib/rulesets";
import { RulesetVersionValue, Rule } from "../../lib/rulesets/rules";
import RulesetEditorSaveButton from "./RulesetEditorSaveButton";
import MockRulesetConditionEditor from "./MockRulesetConditionEditor";
import BreadcrumbsButtons from "../common/BreadcrumbsButtons";

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

const useRulesListStyles = makeStyles((theme) => ({
  settingsIcon: {
    marginRight: theme.spacing(1),
  },
  dragIcon: {
    marginRight: theme.spacing(1),
    cursor: "pointer",
  },
}));

type RulesListProps = {
  rules: Rule[];
  selectedRule: number;
  onChangeSelection: (x: number, isDragging: boolean) => void;
  onAddRule: (expression: string) => void;
};

function RulesList({
  rules,
  selectedRule,
  onChangeSelection,
  onAddRule,
}: RulesListProps) {
  resetServerContext();
  const classes = useRulesListStyles();
  const [filter, setFilter] = React.useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onAddRule(filter);
  }
  const makeOnDragEndFunction = (
    fields: FieldArrayRenderProps<Rule, any>["fields"]
  ) => (result: DropResult) => {
    if (!result.destination) {
      return;
    }
    fields.move(result.source.index, result.destination.index);
    onChangeSelection(-1, true);
  };

  const renderFilteredRules = (
    fields: FieldArrayRenderProps<Rule, any>["fields"]
  ) => {
    const rulesToDisplay = fields.value.filter(
      (field: Rule) => field.expression.indexOf(filter) !== -1
    );
    return rulesToDisplay.length === 0 ? (
      <ListItem alignItems="center">
        <ListItemText
          primary={rules.length === 0 ? "Empty ruleset" : "No matching rules"}
          primaryTypographyProps={{ style: { fontStyle: "italic" } }}
        />
      </ListItem>
    ) : (
      rulesToDisplay.map((rule: Rule, index: number) => (
        <DraggableBox
          key={`rule[${index}]`}
          draggableId={`rule[${index}]`}
          index={index}
        >
          {(provided) => (
            <ListItem
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              style={{
                userSelect: "none",
                margin: "0 0 8px 0",
                ...provided.draggableProps.style,
              }}
              button
              onClick={() => onChangeSelection(index, false)}
              selected={selectedRule === index}
            >
              <DragIndicatorIcon className={classes.dragIcon} />
              <ListItemText
                primary={rule.expression || "<new rule>"}
                primaryTypographyProps={{
                  style: {
                    textDecoration: rule.enabled ? "inherit" : "line-through",
                    fontStyle: rule.expression ? "normal" : "italic",
                  },
                }}
              />
            </ListItem>
          )}
        </DraggableBox>
      ))
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={1} alignItems="center">
        <Grid item xs>
          <TextField
            label="Filter"
            variant="outlined"
            fullWidth
            value={filter}
            type="search"
            onChange={(e) => setFilter(e.target.value)}
            size="small"
          />
        </Grid>
        <Grid item>
          <Button
            type="submit"
            variant="outlined"
            startIcon={<AddIcon />}
            size="medium"
          >
            New
          </Button>
        </Grid>
      </Grid>
      <Box pt={4} pb={2}>
        <Divider />
      </Box>
      <Box>
        <Button onClick={() => onChangeSelection(-2, false)}>
          <SettingsIcon className={classes.settingsIcon} /> Ruleset Conditions
        </Button>
      </Box>
      <Box pt={2} pb={1}>
        <Divider />
      </Box>
      <List>
        <FieldArray name="rules">
          {({ fields }) => (
            <DragDropContext onDragEnd={makeOnDragEndFunction(fields)}>
              <Droppable droppableId="droppable">
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    style={{
                      padding: "8px 0",
                      width: "auto",
                    }}
                  >
                    {renderFilteredRules(fields)}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </FieldArray>
      </List>
    </form>
  );
}

export type RulesetEditorProps = FormProps<RulesetVersionValue> & {
  name: ExposedRuleset["name"];
};

export default function RulesetEditor({ name, ...rest }: RulesetEditorProps) {
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
          <>
            <BreadcrumbsButtons>
              <Link href="/">Home</Link>
              <Link href="/rulesets">Rulesets</Link>
              <Typography>{name}</Typography>
            </BreadcrumbsButtons>
            <Grid container spacing={4}>
              <Grid item md={3}>
                <RulesList
                  rules={values.rules}
                  selectedRule={activeRuleset}
                  onChangeSelection={
                    dirty
                      ? (x, isDragging) =>
                          isDragging
                            ? setActiveRuleset
                            : setPendingAction(() => () => setActiveRuleset(x))
                      : setActiveRuleset
                  }
                  onAddRule={
                    dirty
                      ? (x) => setPendingAction(() => () => handleAddRule(x))
                      : handleAddRule
                  }
                />
                <form onSubmit={handleSubmit}>
                  <RulesetEditorSaveButton dirty={dirty} />
                </form>
              </Grid>
              <Grid item md={8}>
                {activeRuleset === -1 && <NoRuleset />}
                {activeRuleset === -2 && <MockRulesetConditionEditor />}
                {activeRuleset >= 0 && (
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
          </>
        );
      }}
    />
  );
}
