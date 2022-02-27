import React from "react";
import _ from "lodash";
import classnames from "classnames";
import {
  AppBar,
  Drawer,
  Box,
  Button,
  IconButton,
  Typography,
  Toolbar,
  Menu,
  MenuItem,
  makeStyles,
  Theme,
  ListItemIcon,
  CircularProgress,
  Fab,
  colors,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import CloseIcon from "@material-ui/icons/Close";
import CodeIcon from "@material-ui/icons/Code";
import LayersIcon from "@material-ui/icons/Layers";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import { CreateCSSProperties, CSSProperties } from "@material-ui/styles";

import { ExposedRulesetVersion } from "../../lib/rulesets";
import { ExposedQueryTemplate } from "../../lib/querytemplates";
import { ExposedSearchConfiguration } from "../../lib/searchconfigurations";
import { RulesetVersionValue } from "../../lib/rulesets/rules";
import { QueryTemplateEditor, QueryPanelValues } from "./QueryTemplateEditor";
import { RulesetPanel } from "./RulesetPanel";
import LoadingContent from "../common/LoadingContent";
import Scrollable from "../common/Scrollable";
import { apiRequest } from "../../lib/api";
import { useAlertsContext } from "../../utils/react/hooks/useAlertsContext";
import { useLabContext } from "../../utils/react/hooks/useLabContext";
import { useAppTopBarBannerContext } from "../../utils/react/hooks/useAppTopBarBannerContext";
import { LabContextSearchConfiguration } from "../../utils/react/providers/LabProvider";
import { isValidJson } from "../../utils/json";
import AppTopBarSpacer from "../common/AppTopBarSpacer";

type TabPanelProps = {
  index: number;
  value: number;
};

function TabPanel({
  children,
  value,
  index,
}: React.PropsWithChildren<TabPanelProps>) {
  const classes = useStyles({});

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`configuration-tabpanel-${index}`}
      aria-labelledby={`configuration-tab-${index}`}
      className={classnames(
        classes.tabPanel,
        value !== index && classes.hidden
      )}
    >
      {value === index && children}
    </div>
  );
}

const menu = [
  {
    label: "Query",
    icon: <CodeIcon />,
  },
  {
    label: "Rulesets",
    icon: <LayersIcon />,
  },
];
const formId = "searchConfigurationForm";

type Props = {
  width: number;
  searchEndpointType: string;
  setDrawerWidth: (value: number) => void;
  handleClose: () => void;
};

export default function ConfigurationDrawer({
  setDrawerWidth,
  width,
  handleClose,
  searchEndpointType,
}: Props) {
  const { banner, isPageAllowed } = useAppTopBarBannerContext();
  const classes = useStyles({
    pageHasBanner: !!banner && isPageAllowed(),
    width,
  });
  const [activeTab, setActiveTab] = React.useState(0);
  const [isResizing, setIsResizing] = React.useState(false);
  const [initialRulesetIds, setInitialRulesetIds] = React.useState<string[]>(
    []
  );
  const [rulesetIds, setRulesetIds] = React.useState<string[]>([]);
  const { searchConfiguration } = useLabContext();
  const [queryPanelData, setQueryPanelData] = React.useState<QueryPanelValues>({
    query: searchConfiguration?.queryTemplate.query || "",
    knobs: (searchConfiguration?.knobs || {}) as {
      [key: string]: any;
    },
  });
  const [selectedRulesetVData, setSelectedRulesetVData] = React.useState<
    (RulesetVersionValue & { id: string; rulesetId: string }) | undefined
  >(undefined);
  const queryTemplateChanged = React.useMemo(
    () =>
      isValidJson(queryPanelData.query) &&
      isValidJson(searchConfiguration?.queryTemplate.query as string)
        ? !_.isEqual(
            JSON.parse(queryPanelData.query),
            JSON.parse(searchConfiguration?.queryTemplate.query as string)
          )
        : true,
    [queryPanelData, searchConfiguration]
  );
  const rulesetIdsChanged = React.useMemo(
    () => !_.isEqual(initialRulesetIds.sort(), rulesetIds.sort()),
    [initialRulesetIds, rulesetIds]
  );

  const rulesetChanged = React.useMemo(
    () =>
      !!selectedRulesetVData &&
      !_.isEqual(
        searchConfiguration?.rulesets.find(
          (r) => r.id === selectedRulesetVData.id
        )?.value,
        _.omit(selectedRulesetVData, ["id", "rulesetId"])
      ),

    [searchConfiguration, searchConfiguration?.rulesets, selectedRulesetVData]
  );
  const formChanged =
    queryTemplateChanged || rulesetChanged || rulesetIdsChanged;

  const { addErrorAlert } = useAlertsContext();
  const {
    runExecution,
    isExecutionRunning,
    canRunExecution,
    searchConfigurations,
    rulesets,
  } = useLabContext();

  React.useEffect(() => {
    if (searchConfiguration) {
      const ids = searchConfiguration.rulesets.map(
        (item: ExposedRulesetVersion) => item.rulesetId
      );
      setInitialRulesetIds(ids);
      setRulesetIds(ids);
      if (searchConfiguration.rulesets[0]) {
        setSelectedRulesetVData({
          id: searchConfiguration.rulesets[0].id,
          rulesetId: searchConfiguration.rulesets[0].rulesetId,
          rules: (searchConfiguration.rulesets[0].value as any)?.rules ?? [],
          conditions:
            (searchConfiguration.rulesets[0].value as any)?.conditions ?? [],
        });
      } else {
        setSelectedRulesetVData(undefined);
      }
    }
  }, [searchConfiguration]);

  function handleMousedown(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
  }

  function handleMousemove(e: MouseEvent) {
    if (!isResizing) {
      return;
    }
    const offsetLeft = e.clientX;
    const minWidth = 100;
    const maxWidth = 1300;
    if (offsetLeft > minWidth && offsetLeft < maxWidth) {
      setDrawerWidth(offsetLeft);
    }
  }

  function handleMouseup() {
    if (!isResizing) {
      return;
    }
    setIsResizing(false);
  }

  React.useEffect(() => {
    document.addEventListener("mousemove", handleMousemove);
    document.addEventListener("mouseup", handleMouseup);
    return () => {
      document.removeEventListener("mousemove", handleMousemove);
      document.removeEventListener("mouseup", handleMouseup);
    };
  }, [isResizing]);

  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const handleOpenMenu = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleChangeMenu = (index: number) => () => {
    setActiveTab(index);
    setAnchorEl(null);
  };

  const handleQueryPanelChange = (data: QueryPanelValues) =>
    setQueryPanelData(data);

  const handleRulesetPanelChange = (
    data: RulesetVersionValue & {
      id: string;
      rulesetId: string;
    }
  ) => setSelectedRulesetVData(data);

  const updateQueryTemplate = async (
    searchConfiguration: LabContextSearchConfiguration
  ) => {
    const newQueryTemplate: {
      queryTemplate: ExposedQueryTemplate;
    } = await apiRequest(`/api/querytemplates/update`, {
      parentId: searchConfiguration?.queryTemplate.id,
      description: searchConfiguration?.queryTemplate.description || "",
      projectId: searchConfiguration?.queryTemplate.projectId,
      query: queryPanelData.query,
    });

    return newQueryTemplate;
  };

  const updateRulesetVersion = async (
    rulesetVersion:
      | {
          id?: string;
          rulesetId: string;
          rules?: any[];
          conditions?: any[];
        }
      | undefined
  ) => {
    try {
      await apiRequest(`/api/rulesets/createVersion`, {
        value: {
          rules: rulesetVersion?.rules || [],
          conditions: rulesetVersion?.conditions || [],
        },
        rulesetId: rulesetVersion?.rulesetId,
        parentId: rulesetVersion?.id || null,
      });
    } catch (error) {
      addErrorAlert(error);
    }
  };

  const handleRun = async () => {
    if (!isValidJson(queryPanelData.query)) return;

    const executionSC = searchConfiguration && { ...searchConfiguration };

    let queryTemplateId = executionSC?.queryTemplate.id;
    let searchConfigurationId = executionSC?.id;
    let newSearchConfiguration:
      | ExposedSearchConfiguration
      | undefined = undefined;

    if (queryTemplateChanged) {
      const { queryTemplate: newQueryTemplate } = await updateQueryTemplate(
        executionSC
      );
      queryTemplateId = newQueryTemplate.id;
    }
    if (rulesetChanged) {
      await updateRulesetVersion(selectedRulesetVData);
    }
    if (rulesetIdsChanged) {
      const selectedRulesets = rulesets.filter((r) =>
        rulesetIds.includes(r.id)
      );
      const noVersionsRulesets = selectedRulesets.filter(
        (r) =>
          !r.rulesetVersions.length && r.id !== selectedRulesetVData?.rulesetId
      );
      await Promise.all(
        noVersionsRulesets.map((r) => updateRulesetVersion({ rulesetId: r.id }))
      );
    }

    if (formChanged) {
      try {
        const res: {
          searchConfiguration: ExposedSearchConfiguration;
        } = await apiRequest(`/api/searchconfigurations/update`, {
          id: executionSC?.id,
          queryTemplateId,
          rulesetIds,
          knobs: queryPanelData.knobs
            ? Object.entries(queryPanelData.knobs).reduce(
                (result: { [key: string]: number }, item) => {
                  result[item[0]] = parseFloat(item[1]) || 10;
                  return result;
                },
                {}
              )
            : {},
        });
        searchConfigurationId = res.searchConfiguration.id;
        newSearchConfiguration = await apiRequest(
          `/api/searchconfigurations/load/${searchConfigurationId}`,
          {
            index:
              searchConfigurations[searchConfigurations.length - 1].index + 1,
          }
        );
      } catch (err) {
        addErrorAlert(err);
      }
    }

    runExecution(searchConfigurationId, newSearchConfiguration);
  };

  return (
    <Drawer
      variant="permanent"
      classes={{
        root: classes.drawer,
        paper: classes.drawerPaper,
      }}
      anchor="left"
    >
      {!searchConfiguration ? (
        <LoadingContent />
      ) : (
        <>
          <div className={classes.resizer} onMouseDown={handleMousedown} />
          <AppTopBarSpacer />
          <Box
            position="relative"
            className={classnames(classes.drawerContent, classes.withToolbar)}
          >
            <AppBar position="static">
              <Toolbar>
                <Typography className={classes.title} variant="h6" noWrap>
                  Search Configuration
                </Typography>
                <Button
                  color="inherit"
                  onClick={handleOpenMenu}
                  endIcon={<ExpandMoreIcon />}
                  className={classes.menuButton}
                >
                  {menu[activeTab].label}
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleCloseMenu}
                >
                  {menu.map((item, i) => (
                    <MenuItem
                      key={i}
                      selected={activeTab === i}
                      onClick={handleChangeMenu(i)}
                    >
                      <ListItemIcon className={classes.menuIcon}>
                        {item.icon}
                      </ListItemIcon>
                      {item.label}
                    </MenuItem>
                  ))}
                </Menu>
                <IconButton
                  color="inherit"
                  size="small"
                  className={classes.closeButton}
                  onClick={handleClose}
                  aria-label="close"
                >
                  <CloseIcon />
                </IconButton>
              </Toolbar>
            </AppBar>
            <div className={classes.withToolbar}>
              <Scrollable
                classes={{
                  root: classes.withToolbar,
                  scroll: classes.scrollContainer,
                }}
                maxHeight="100%"
              >
                <TabPanel value={activeTab} index={0}>
                  <QueryTemplateEditor
                    formId={formId}
                    queryTemplate={{
                      ...searchConfiguration.queryTemplate,
                      knobs: searchConfiguration.knobs,
                    }}
                    searchEndpointType={searchEndpointType}
                    onFormValuesChange={handleQueryPanelChange}
                  />
                </TabPanel>
                <TabPanel value={activeTab} index={1}>
                  <RulesetPanel
                    formId={formId}
                    activeRulesetIds={rulesetIds}
                    setActiveRulesetIds={setRulesetIds}
                    onFormValuesChange={handleRulesetPanelChange}
                  />
                </TabPanel>
              </Scrollable>
              <Toolbar className={classes.actions}>
                <Fab
                  color="primary"
                  variant="extended"
                  onClick={handleRun}
                  disabled={
                    !canRunExecution ||
                    isExecutionRunning ||
                    !isValidJson(queryPanelData.query)
                  }
                  className={classes.saveAndRunButton}
                  size="medium"
                >
                  {isExecutionRunning ? (
                    <CircularProgress
                      size={18}
                      className={classes.fabProgress}
                    />
                  ) : (
                    <PlayArrowIcon />
                  )}
                  <span className={classes.saveAndRunButtonText}>
                    {isExecutionRunning ? "Running" : "Run"}
                  </span>
                </Fab>
              </Toolbar>
            </div>
          </Box>
        </>
      )}
    </Drawer>
  );
}

const withToolbar = (
  theme: Theme,
  pageHasBanner: boolean,
  style: CSSProperties
): CreateCSSProperties => {
  if (!pageHasBanner) return style as CreateCSSProperties;

  let minHeight = style.height;

  const appTopBarHeight =
    Number((minHeight as string).split(" - ")[1].slice(0, -3)) +
    theme.spacing(6);

  minHeight = `calc(100% - ${appTopBarHeight}px)`;

  return { ...style, minHeight };
};

const useStyles = makeStyles<
  Theme,
  { pageHasBanner?: boolean; width?: number }
>((theme) => ({
  drawer: (props) => ({
    width: props.width,
  }),
  drawerPaper: (props) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    width: props.width,
    overflowY: "auto",
    overflowX: "hidden",
  }),
  drawerContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
  },
  withToolbar: (props) =>
    withToolbar(theme, !!props.pageHasBanner, theme.mixins.withToolbar(theme)),
  scrollContainer: {
    height: "100%",
    overflowX: "hidden",
  },
  resizer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: 8,
    cursor: "ew-resize",
    zIndex: 1000000,
    "&:hover": {
      background: "rgba(0,0,0,0.1)",
    },
  },
  title: {
    flex: "none",
  },
  menuButton: {
    marginLeft: "auto",
  },
  menuIcon: {
    minWidth: 40,
  },
  closeButton: {
    marginLeft: theme.spacing(2),
  },
  label: {
    marginBottom: theme.spacing(1),
  },
  tabPanel: {
    minHeight: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    padding: theme.spacing(1, 0),
  },
  hidden: {
    display: "none",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    borderTop: "1px solid rgba(0,0,0,0.12)",
    boxShadow:
      "0px 2px 4px -1px rgb(0 0 0 / 20%), 0px 4px 5px 0px rgb(0 0 0 / 14%), 0px 1px 10px 0px rgb(0 0 0 / 12%)",
  },
  saveButton: {
    borderRadius: 9999,
    paddingTop: 7,
    paddingBottom: 7,
    marginRight: theme.spacing(1),
  },
  saveAndRunButton: {
    boxShadow: "none",
  },
  saveAndRunButtonText: {
    marginLeft: theme.spacing(1),
  },
  fabProgress: {
    color: colors.blue[500],
  },
}));
