import * as React from "react";
import { GetServerSideProps } from "next";
import MaUTable from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { useTable, Column } from "react-table";
import { getSession } from "next-auth/client";

import Link, { LinkButton } from "../../components/common/Link";
import { authenticatedPage } from "../../lib/auth";
import { redirectToLogin } from "../../lib/errors";
import {
  userCanAccessRuleset,
  formatRuleset,
  ExposedRuleset,
} from "../../lib/rulesets";
import prisma from "../../lib/prisma";

export const getServerSideProps = authenticatedPage(async (context) => {
  const rulesets = await prisma.ruleset.findMany({
    where: userCanAccessRuleset(context.user),
  });
  return { props: { rulesets: rulesets.map(formatRuleset) } };
});

type Props = {
  rulesets: ExposedRuleset[];
};

export default function Rulesets({ rulesets }: Props) {
  const columns: Column<ExposedRuleset>[] = React.useMemo(
    () => [
      {
        Header: "Name",
        Cell: ({ row }) => (
          <Link href={`/rulesets/${row.original.id}`}>{row.original.name}</Link>
        ),
        accessor: "name",
      },
    ],
    []
  );

  const tableInstance = useTable({ columns, data: rulesets });
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = tableInstance;

  return (
    <div>
      <LinkButton href="/rulesets/create" variant="contained">
        Add ruleset
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
