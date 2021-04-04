import * as React from "react";
import MaUTable from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { useTable, Column } from "react-table";
import { getSession, signIn } from "next-auth/client";

import Link, { LinkButton } from "../../components/common/Link";
import { authenticatedPage } from "../../lib/auth";
import { listDatasources, ExposedDatasource } from "../../lib/datasources";

export const getServerSideProps = authenticatedPage(async (context) => {
  const datasources = await listDatasources(context);
  return { props: { datasources } };
});

type Props = {
  datasources: ExposedDatasource[];
};

export default function Datasources({ datasources }: Props) {
  const columns: Column<ExposedDatasource>[] = React.useMemo(
    () => [
      {
        Header: "Name",
        Cell: ({ row }) => (
          <Link href={`/datasources/${row.original.id}`}>
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

  const tableInstance = useTable({ columns, data: datasources });
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = tableInstance;

  return (
    <div>
      <LinkButton href="/datasources/create" variant="contained">
        Add datasource
      </LinkButton>
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
