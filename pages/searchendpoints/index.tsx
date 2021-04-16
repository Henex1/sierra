import * as React from "react";
import { useRouter } from "next/router";
import { useTable, Column } from "react-table";

import { makeStyles } from "@material-ui/core/styles";
import MaUTable from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Box from "@material-ui/core/Box";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import AddIcon from "@material-ui/icons/Add";

import { authenticatedPage } from "../../lib/auth";
import {
  listSearchEndpoints,
  ExposedSearchEndpoint,
} from "../../lib/searchendpoints";

import Link from "../../components/common/Link";

export const getServerSideProps = authenticatedPage(async (context) => {
  const searchEndpoints = await listSearchEndpoints(context);
  return { props: { searchEndpoints } };
});

type Props = {
  searchEndpoints: ExposedSearchEndpoint[];
};

const useStyles = makeStyles(() => ({
  wrapper: {
    height: "100%"
  }
}));

export default function SearchEndpoints({ searchEndpoints }: Props) {
  const classes = useStyles();
  const router = useRouter();

  const handleAddNewSearchEndpoint = () => {
    router.push("/searchendpoints/create");
  }

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
      <Box display="flex" mb={4}>
        <Breadcrumbs aria-label="breadcrumb">
          <Typography>Search Endpoints</Typography>
        </Breadcrumbs>
      </Box>
      <Button
        type="submit"
        variant="outlined"
        startIcon={<AddIcon />}
        size="medium"
        onClick={handleAddNewSearchEndpoint}
      >
        Add New Search Endpoint
      </Button>
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
    </div>
  );
}
