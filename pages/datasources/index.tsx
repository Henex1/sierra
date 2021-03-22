import * as React from "react";
import { GetServerSideProps } from "next";
import Button from "@material-ui/core/Button";
import MaUTable from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { useTable, Column } from "react-table";
import { getSession } from "next-auth/client";

import Link from "../../components/common/Link";
import { getUser } from "../../lib/auth";
import { listDatasources, ExposedDatasource } from "../../lib/datasources";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getUser(context.req);
  const datasources = session.user ? await listDatasources(session) : [];
  return { props: { datasources } };
};

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
      <Button href="/datasources/create" variant="contained">
        Add datasource
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
