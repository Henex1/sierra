import React from "react";
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
import {
  Grid,
  TextField,
  Button,
  Divider,
  Box,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Typography,
  makeStyles,
  PaperProps,
} from "@material-ui/core";

import AddIcon from "@material-ui/icons/Add";
import DragIndicatorIcon from "@material-ui/icons/DragIndicator";
import SettingsIcon from "@material-ui/icons/Settings";

import RuleEditor from "./RuleEditor";
import { isInstructionsType } from "./Instructions/types";
import { RulesetVersionValue, Rule } from "../../lib/rulesets/rules";
import RulesetConditionEditor from "./RulesetConditionEditor";
import FormSubmitButton from "../common/FormSubmitButton";

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

function NoRuleset({ compact }: { compact?: boolean }) {
  return (
    <div>
      Select or create a new rule {compact ? "above" : "on the left"} to get
      started.
    </div>
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

  function handleAddRule(ruleName: string) {
    onAddRule(ruleName);
    setFilter("");
  }

  function handleKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.keyCode === 13) {
      e.preventDefault();
      handleAddRule(filter);
    }
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
    let rulesToDisplay = fields.value;
    if (filter) {
      rulesToDisplay = fields.value.filter(
        (field: Rule) =>
          field.expression.indexOf(filter) > -1 ||
          field.instructions.find(
            (instr) =>
              instr.type === "synonym" && instr.term.indexOf(filter) > -1
          )
      );
    }
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
    <>
      <Grid container spacing={1} alignItems="center">
        <Grid item xs>
          <TextField
            label="Filter"
            variant="outlined"
            fullWidth
            value={filter}
            type="search"
            onChange={(e) => setFilter(e.target.value)}
            onKeyPress={handleKeyPress}
            size="small"
          />
        </Grid>
        <Grid item>
          <Button
            type="button"
            variant="outlined"
            startIcon={<AddIcon />}
            size="medium"
            onClick={() => handleAddRule(filter)}
          >
            New
          </Button>
        </Grid>
      </Grid>
      <Box pt={4} pb={2}>
        <Divider />
      </Box>
      <Box>
        <ListItem
          button
          selected={selectedRule === -2}
          onClick={() => onChangeSelection(-2, false)}
        >
          <SettingsIcon className={classes.settingsIcon} />{" "}
          <Typography>Ruleset Conditions</Typography>
        </ListItem>
      </Box>
      <Box pt={2} pb={1}>
        <Divider />
      </Box>
      <List>
        <FieldArray name="rules">
          {({ fields }) => (
            <DragDropContext onDragEnd={makeOnDragEndFunction(fields)}>
              <Droppable droppableId="droppable">
                {(provided) => (
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
    </>
  );
}

export type RulesetEditorProps = FormProps<RulesetVersionValue> & {
  facetFilterFields: string[];
  formId?: string;
  compact?: boolean;
  setHasPendingAction?: (data: boolean) => void;
};

export default function RulesetEditor({
  facetFilterFields,
  formId,
  compact,
  setHasPendingAction,
  ...rest
}: RulesetEditorProps) {
  const [activeRuleset, setActiveRuleset] = React.useState(-1);
  // Note: storing a function in useState requires setState(() => myFunction),
  // which is why you see setState(() => () => foo), below.
  const [pendingAction, setPendingAction] = React.useState(
    null as null | (() => () => void)
  );

  React.useEffect(() => {
    setActiveRuleset(-1);
  }, [rest.initialValues]);

  const parseValue = (value: RulesetVersionValue) => {
    return {
      ...value,
      rules: value.rules.map((r) => ({
        ...r,
        instructions: r.instructions.filter((i) => isInstructionsType(i.type)),
      })),
    };
  };

  return (
    <Form
      {...rest}
      onSubmit={(value, form) =>
        rest.onSubmit && rest.onSubmit(parseValue(value), form)
      }
      mutators={{
        ...arrayMutators,
        setRulesValue: ([args], state, tools) => {
          const [key, value] = args;
          tools.changeValue(state, key, () => value);
        },
      }}
      render={({ handleSubmit, values, dirty, form }) => {
        function handleAddRule(expression: string) {
          form.mutators.push("rules", {
            enabled: true,
            isCaseSensitive: false,
            expressionType: "contained",
            expression,
            instructions: [],
          });
          setActiveRuleset(values.rules.length);
        }

        React.useEffect(() => {
          setHasPendingAction && setHasPendingAction(dirty);
        }, [dirty]);

        return (
          <form id={formId} onSubmit={handleSubmit}>
            <Grid container spacing={4}>
              <Grid item md={compact ? 12 : 4}>
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
                {!formId && <FormSubmitButton />}
              </Grid>
              <Grid item md={compact ? 12 : 8}>
                {activeRuleset === -1 && <NoRuleset compact={compact} />}
                {activeRuleset === -2 && (
                  <RulesetConditionEditor name="conditions" />
                )}
                {activeRuleset >= 0 && (
                  <RuleEditor
                    name={`rules[${activeRuleset}]`}
                    rules={values.rules}
                    activeRuleset={activeRuleset}
                    form={form}
                    facetFilterFields={facetFilterFields}
                    onDelete={() => {
                      form.mutators.remove("rules", activeRuleset);
                      setActiveRuleset(activeRuleset - 1);
                    }}
                  />
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
          </form>
        );
      }}
    />
  );
}
