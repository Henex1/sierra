import * as React from "react";
import { GetServerSideProps } from "next";
import MaUTable from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { useTable, Column } from "react-table";

import Link, { LinkButton } from "../../components/common/Link";
import { authenticatedPage } from "../../lib/auth";
import {
  userCanAccessProject,
  formatProject,
  ExposedProject,
} from "../../lib/projects";

export const getServerSideProps = authenticatedPage(async (context) => {
  const projects = await prisma.project.findMany({
    where: userCanAccessProject(context.user),
  });
  return { props: { projects: projects.map(formatProject) } };
});

type Props = {
  projects: ExposedProject[];
};

export default function Projects({ projects }: Props) {
  const columns: Column<ExposedProject>[] = React.useMemo(
    () => [
      {
        Header: "Name",
        Cell: ({ row }) => (
          <Link href={`/projects/${row.original.id}`}>{row.original.name}</Link>
        ),
        accessor: "name",
      },
    ],
    []
  );

  const tableInstance = useTable({ columns, data: projects });
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = tableInstance;

  return (
    <div>
      <LinkButton href="/projects/create" variant="contained">
        Add project
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
