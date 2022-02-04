import React, { useEffect, useState } from "react";
import {
  Button,
  CircularProgress,
  makeStyles,
  Popover,
} from "@material-ui/core";
import CodeIcon from "@material-ui/icons/Code";
import { apiRequest } from "../../lib/api";
import { ExpandedQuery } from "../../lib/searchendpoints/queryexpander";
import { useLabContext } from "../../utils/react/hooks/useLabContext";
import JsonEditor from "../JsonEditor";

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(2),
    background: "#F5F7FA",
    display: "flex",
    justifyContent: "center",
    width: "90vw",
    maxWidth: 500,
    maxHeight: 500,
  },
}));

type Props = {
  phrase: string;
};

export default function ExpandedQueryPopover({ phrase }: Props) {
  const classes = useStyles();

  const { searchConfiguration, project } = useLabContext();

  const [expandedQuery, setExpandedQuery] = useState<ExpandedQuery | null>(
    null
  );
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  useEffect(() => {
    const fetchExpandedQuery = async () => {
      const { query } = await apiRequest("/api/searchendpoints/expandQuery", {
        searchConfigurationId: searchConfiguration?.id,
        searchEndpointId: project?.searchEndpointId,
        phrase,
      });
      setExpandedQuery(query);
    };

    fetchExpandedQuery();
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <div>
      <Button
        aria-label="show details"
        variant="outlined"
        startIcon={<CodeIcon />}
        onClick={handleClick}
      >
        Query
      </Button>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <div className={classes.container}>
          {expandedQuery ? (
            <JsonEditor
              value={JSON.stringify(expandedQuery, null, 2)}
              disabled
            />
          ) : (
            <CircularProgress size={30} />
          )}
        </div>
      </Popover>
    </div>
  );
}
