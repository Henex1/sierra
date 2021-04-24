import * as React from "react";
import { useRouter } from "next/router";
import { useTable, Column } from "react-table";

import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import MaUTable from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import AddIcon from "@material-ui/icons/Add";

import { authenticatedPage } from "../../lib/pageHelpers";
import {
  listSearchEndpoints,
  ExposedSearchEndpoint,
} from "../../lib/searchendpoints";

import { useActiveProject } from "../../components/Session";
import Link from "../../components/common/Link";
import BreadcrumbsButtons from "../../components/common/BreadcrumbsButtons";

export const getServerSideProps = authenticatedPage(async (context) => {
  const searchEndpoints = await listSearchEndpoints(context);
  return { props: { searchEndpoints } };
});

type Props = {
  searchEndpoints: ExposedSearchEndpoint[];
};

const useStyles = makeStyles(() => ({
  wrapper: {
    height: "90%",
  },
}));

export default function SearchEndpoints({ searchEndpoints }: Props) {
  const classes = useStyles();
  const router = useRouter();
  const { project } = useActiveProject();

  const handleAddNewSearchEndpoint = () => {
    router.push("/searchendpoints/create");
  };

  const columns: Column<ExposedSearchEndpoint>[] = React.useMemo(
    () => [
      {
        Header: "Name",
        Cell: ({ row }) => (
          <Link href={`/searchendpoints/${row.original.id}`}>
            {row.original.name}
          </Link>
        ),
        accessor: "name",
      },
      {
        Header: "Type",
        accessor: "type",
      },
    ],
    []
  );

  const tableInstance = useTable({ columns, data: searchEndpoints });
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = tableInstance;

  return (
    <div className={classes.wrapper}>
      <BreadcrumbsButtons>
        <Link href="/">Home</Link>
        <Typography>Search Endpoints</Typography>
      </BreadcrumbsButtons>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4">Search Endpoints</Typography>
        </Grid>
        {!project && (
          <Grid item xs={6} style={{ margin: "0 auto", textAlign: "center" }}>
            <Typography variant="h6">No project is active</Typography>
            <Typography variant="subtitle1">
              You must setup or activate project first
            </Typography>
          </Grid>
        )}
        {project && (
          <>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="outlined"
                startIcon={<AddIcon />}
                size="medium"
                onClick={handleAddNewSearchEndpoint}
              >
                Add New Search Endpoint
              </Button>
            </Grid>
            <Grid item xs={12}>
              <MaUTable {...getTableProps()}>
                <TableHead>
                  {headerGroups.map((headerGroup) => (
                    <TableRow {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map((column) => (
                        <TableCell {...column.getHeaderProps()}>
                          {column.render("Header")}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableHead>
                <TableBody {...getTableBodyProps()}>
                  {rows.map((row) => {
                    prepareRow(row);
                    return (
                      <TableRow {...row.getRowProps()}>
                        {row.cells.map((cell) => (
                          <TableCell {...cell.getCellProps()}>
                            {cell.render("Cell")}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </MaUTable>
            </Grid>
          </>
        )}
      </Grid>
    </div>
  );
}
