import React from "react";
import useSWR from "swr";
import {
  Box,
  Typography,
  MenuItem,
  Chip,
  makeStyles,
  Button,
  Popover,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";

import RulesetEditor from "../rulesets/RulesetEditor";
import { Props as RulesetEditorProps } from "../../pages/rulesets/[id]";
import { RulesetVersionValue } from "../../lib/rulesets/rules";
import LoadingContent from "../common/LoadingContent";
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
  onFormValuesChange?: (
    data: RulesetVersionValue & { id: string; rulesetId: string }
  ) => void;
};

export function RulesetPanel({
  formId,
  activeRulesetIds,
  setActiveRulesetIds,
  onFormValuesChange,
}: RulesetPanelProps) {
  const classes = useStyles();
  const [rulesetId, setRulesetId] = React.useState("");
  const [popoverIsOpen, setPopoverIsOpen] = React.useState(false);
  const popoverAnchorEl = React.useRef<HTMLButtonElement>(null);
  const { rulesets, currentSearchConfigId } = useLabContext();

  const rulesetSelected = Boolean(rulesetId);

  const { data } = useSWR<RulesetEditorProps>(
    rulesetSelected
      ? `/api/rulesets/${rulesetId}?searchConfigurationId=${currentSearchConfigId}`
      : null
  );

  React.useEffect(() => {
    if (!activeRulesetIds.length) {
      setRulesetId("");
    } else if (activeRulesetIds.length && !rulesetId) {
      setRulesetId(activeRulesetIds[0]);
    }
  }, [activeRulesetIds, rulesetId]);

  const onRulesetChange = (value: RulesetVersionValue) => {
    onFormValuesChange &&
      onFormValuesChange({
        id: data?.version.id ?? "",
        rulesetId: data?.ruleset.id ?? "",
        ...value,
      });
  };

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
          onSubmit={() => {}}
          initialValues={data.version.value as RulesetVersionValue}
          facetFilterFields={data.facetFilterFields}
          onRulesetChange={onRulesetChange}
        />
      ) : (
        rulesetSelected && <LoadingContent />
      )}
    </div>
  );
}
