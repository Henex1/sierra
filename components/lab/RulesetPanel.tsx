import React from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  ListItemIcon,
  Chip,
  makeStyles,
} from "@material-ui/core";
import { Form } from "react-final-form";
import useSWR from "swr";
import { useRouter } from "next/router";
import CheckIcon from "@material-ui/icons/Check";
import EditIcon from "@material-ui/icons/Edit";

import { apiRequest } from "../../lib/api";
import RulesetEditor from "../rulesets/RulesetEditor";
import { Props as RulesetEditorProps } from "../../pages/rulesets/[id]";
import { RulesetVersionValue } from "lib/rulesets/rules";
import LoadingContent from "../common/LoadingContent";
import { useAlertsContext } from "../../utils/react/hooks/useAlertsContext";
import { useLabContext } from "../../utils/react/hooks/useLabContext";

const useStyles = makeStyles((theme) => ({
  dropdown: {
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(1.5),
  },
  dropdownIcon: {
    minWidth: 40,
  },
  rulesetChip: {
    padding: theme.spacing(0, 0.5),
    marginRight: theme.spacing(1),
    "& svg": {
      width: 16,
      height: 16,
    },
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

export default function RulesetPanel({
  formId,
  activeRulesetIds,
  setActiveRulesetIds,
  onUpdate,
}: RulesetPanelProps) {
  const classes = useStyles();
  const router = useRouter();
  const [rulesetId, setRulesetId] = React.useState<string>("");
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
        router.push(router.asPath);
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
      <Select
        multiple
        fullWidth
        variant="outlined"
        aria-labelledby="rulesetLabel"
        value={activeRulesetIds}
        onChange={(e: React.ChangeEvent<{ value: unknown }>) => {
          setActiveRulesetIds(e.target.value as string[]);
        }}
        renderValue={(value: any) =>
          (value as string[])
            .map((id: string) => rulesets.find((r) => r.id === id)?.name)
            .join(", ")
        }
        classes={{
          select: classes.dropdown,
        }}
      >
        {rulesets.map((ruleset) => (
          <MenuItem key={ruleset.id} value={ruleset.id}>
            <ListItemIcon className={classes.dropdownIcon}>
              {activeRulesetIds.includes(ruleset.id) && <CheckIcon />}
            </ListItemIcon>
            {ruleset.name}
          </MenuItem>
        ))}
      </Select>
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
              onDelete={() => setRulesetId(item.id)}
              deleteIcon={<EditIcon fontSize="small" />}
            />
          );
        })}
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
