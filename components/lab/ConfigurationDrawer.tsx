import React, { useMemo, useState } from "react";
import { useRouter } from "next/router";
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
import { QueryTemplateEditor, QueryPanelValues } from "./QueryTemplateEditor";
import { RulesetPanel } from "./RulesetPanel";
import LoadingContent from "../common/LoadingContent";
import Scrollable from "../common/Scrollable";
import { apiRequest } from "../../lib/api";
import { useAlertsContext } from "../../utils/react/hooks/useAlertsContext";
import { useLabContext } from "../../utils/react/hooks/useLabContext";
import { useAppTopBarBannerContext } from "../../utils/react/hooks/useAppTopBarBannerContext";
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
  const router = useRouter();
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
  const [rulesetHasPendingAction, setRulesetHasPendingAction] = useState(false);

  const queryTemplateChanged = useMemo(
    () =>
      isValidJson(queryPanelData.query) &&
      isValidJson(searchConfiguration?.queryTemplate.query as string)
        ? JSON.stringify(JSON.parse(queryPanelData.query)) !==
          JSON.stringify(
            JSON.parse(searchConfiguration?.queryTemplate.query as string)
          )
        : true,
    [queryPanelData, searchConfiguration]
  );
  const rulesetsChanged = useMemo(
    () =>
      JSON.stringify([...initialRulesetIds].sort()) !==
        JSON.stringify([...rulesetIds].sort()) || rulesetHasPendingAction,
    [initialRulesetIds, rulesetIds, rulesetHasPendingAction]
  );
  const hasUnsavedChanges = queryTemplateChanged || rulesetsChanged;

  const { addErrorAlert } = useAlertsContext();
  const { runExecution, isExecutionRunning, canRunExecution } = useLabContext();

  React.useEffect(() => {
    if (searchConfiguration) {
      const ids = searchConfiguration.rulesets.map(
        (item: ExposedRulesetVersion) => item.rulesetId
      );
      setInitialRulesetIds(ids);
      setRulesetIds(ids);
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

  async function handleQueryTemplateUpdate(
    queryTemplateId: string,
    { knobs }: QueryPanelValues
  ) {
    try {
      await apiRequest(`/api/searchconfigurations/update`, {
        id: searchConfiguration?.id,
        queryTemplateId,
        rulesetIds,
        knobs: knobs
          ? Object.entries(knobs).reduce(
              (result: { [key: string]: number }, item) => {
                result[item[0]] = parseFloat(item[1]) || 10;
                return result;
              },
              {}
            )
          : {},
      });
      router.replace(router.asPath);
    } catch (err) {
      addErrorAlert(err);
    }
  }

  async function handleRulesetUpdate() {
    try {
      await apiRequest(`/api/searchconfigurations/update`, {
        id: searchConfiguration?.id,
        queryTemplateId: searchConfiguration?.queryTemplate.id,
        rulesetIds,
      });
      router.replace(router.asPath);
    } catch (err) {
      addErrorAlert(err);
    }
  }

  const handleQueryPanelChange = (data: QueryPanelValues) =>
    setQueryPanelData(data);

  const updateQueryTemplate = async ({ query }: QueryPanelValues) => {
    const newQueryTemplates: {
      queryTemplate: ExposedQueryTemplate;
    } = await apiRequest(`/api/querytemplates/update`, {
      parentId: searchConfiguration?.queryTemplate.id,
      description: searchConfiguration?.queryTemplate.description || "",
      projectId: searchConfiguration?.queryTemplate.projectId,
      query,
    });

    return newQueryTemplates;
  };

  const handleRun = async () => {
    runExecution();
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
                    onUpdate={handleQueryTemplateUpdate}
                    updateQueryTemplate={updateQueryTemplate}
                    onFormValuesChange={handleQueryPanelChange}
                  />
                </TabPanel>
                <TabPanel value={activeTab} index={1}>
                  <RulesetPanel
                    formId={formId}
                    activeRulesetIds={rulesetIds}
                    setActiveRulesetIds={setRulesetIds}
                    onUpdate={handleRulesetUpdate}
                    setRulesetHasPendingAction={setRulesetHasPendingAction}
                  />
                </TabPanel>
              </Scrollable>
              <Toolbar className={classes.actions}>
                <Button
                  type="submit"
                  variant="outlined"
                  color="primary"
                  size="medium"
                  className={classes.saveButton}
                  form={formId}
                >
                  Save {menu[activeTab].label}
                </Button>
                <Fab
                  color="primary"
                  variant="extended"
                  onClick={handleRun}
                  disabled={
                    !canRunExecution || hasUnsavedChanges || isExecutionRunning
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
