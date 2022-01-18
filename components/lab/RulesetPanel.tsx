import React from "react";
import {
  Box,
  Typography,
  MenuItem,
  Chip,
  makeStyles,
  Button,
  Popover,
} from "@material-ui/core";
import { Form } from "react-final-form";
import useSWR from "swr";
import AddIcon from "@material-ui/icons/Add";

import { apiRequest } from "../../lib/api";
import RulesetEditor from "../rulesets/RulesetEditor";
import { Props as RulesetEditorProps } from "../../pages/rulesets/[id]";
import { RulesetVersionValue } from "lib/rulesets/rules";
import LoadingContent from "../common/LoadingContent";
import { useAlertsContext } from "../../utils/react/hooks/useAlertsContext";
import { useLabContext } from "../../utils/react/hooks/useLabContext";

const useStyles = makeStyles((theme) => ({
  rulesetChip: {
    padding: theme.spacing(0, 0.5),
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    "& svg": {
      width: 16,
      height: 16,
    },
  },
  addRulesetButton: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  label: {
    marginBottom: theme.spacing(1),
  },
}));

type RulesetPanelProps = {
  formId: string;
  activeRulesetIds: string[];
  setActiveRulesetIds: (ids: string[]) => void;
  onUpdate: () => void;
};

export function RulesetPanel({
  formId,
  activeRulesetIds,
  setActiveRulesetIds,
  onUpdate,
}: RulesetPanelProps) {
  const classes = useStyles();
  const [rulesetId, setRulesetId] = React.useState("");
  const [popoverIsOpen, setPopoverIsOpen] = React.useState(false);
  const popoverAnchorEl = React.useRef<HTMLButtonElement>(null);
  const { addErrorAlert } = useAlertsContext();
  const { rulesets } = useLabContext();

  React.useEffect(() => {
    if (!activeRulesetIds.length) {
      setRulesetId("");
    } else if (activeRulesetIds.length && !rulesetId) {
      setRulesetId(activeRulesetIds[0]);
    }
  }, [activeRulesetIds, rulesetId]);

  const rulesetSelected = Boolean(rulesetId);
  const { data } = useSWR<RulesetEditorProps>(
    rulesetSelected ? `/api/rulesets/${rulesetId}` : null
  );

  async function onSubmit(value: RulesetVersionValue) {
    if (data) {
      try {
        await apiRequest(`/api/rulesets/createVersion`, {
          value,
          rulesetId: rulesetId,
          parentId: data.version.id,
        });
      } catch (error) {
        addErrorAlert(error);
      }
    }
    onUpdate();
    return;
  }

  return (
    <div>
      <Typography variant="h6" className={classes.label} id="rulesetLabel">
        Active Rulesets
      </Typography>
      <Box mb={2} />
      <Box mb={4}>
        {rulesets.map((item) => {
          if (!activeRulesetIds.includes(item.id)) {
            return null;
          }
          return (
            <Chip
              clickable
              key={item.id}
              label={item.name}
              color={rulesetId === item.id ? "primary" : "default"}
              className={classes.rulesetChip}
              onClick={() => setRulesetId(item.id)}
              onDelete={() => {
                const filteredRulesetIds = activeRulesetIds.filter(
                  (rulesetId) => rulesetId !== item.id
                );
                setActiveRulesetIds(filteredRulesetIds);
                setRulesetId(filteredRulesetIds[0] ?? "");
              }}
            />
          );
        })}
        {rulesets.length > activeRulesetIds.length && (
          <Button
            ref={popoverAnchorEl}
            className={classes.addRulesetButton}
            variant="outlined"
            color="primary"
            size="small"
            onClick={() => setPopoverIsOpen(true)}
          >
            {activeRulesetIds.length > 0 ? (
              <AddIcon fontSize="small" />
            ) : (
              "Add Ruleset"
            )}
          </Button>
        )}
        <Popover
          open={popoverIsOpen}
          anchorEl={popoverAnchorEl.current}
          onClose={() => setPopoverIsOpen(false)}
        >
          {rulesets
            .filter((ruleset) => !activeRulesetIds.includes(ruleset.id))
            .map((ruleset) => (
              <MenuItem
                key={ruleset.id}
                onClick={() => {
                  setActiveRulesetIds([...activeRulesetIds, ruleset.id]);
                  setPopoverIsOpen(false);
                }}
              >
                {ruleset.name}
              </MenuItem>
            ))}
        </Popover>
      </Box>
      {data ? (
        <RulesetEditor
          compact
          formId={formId}
          onSubmit={onSubmit}
          initialValues={data.version.value as RulesetVersionValue}
          facetFilterFields={data.facetFilterFields}
        />
      ) : rulesetSelected ? (
        <LoadingContent />
      ) : (
        <Form
          onSubmit={onSubmit}
          render={({ handleSubmit }) => (
            <form id={formId} onSubmit={handleSubmit} />
          )}
        />
      )}
    </div>
  );
}
