import * as React from "react";
import { GetServerSideProps } from "next";
import { useTable, Column } from "react-table";

import MaUTable from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { Typography } from "@material-ui/core";

import Link, { LinkButton } from "../../components/common/Link";
import { authenticatedPage } from "../../lib/pageHelpers";
import {
  userCanAccessQueryTemplate,
  ExposedQueryTemplate,
  formatQueryTemplate,
} from "../../lib/querytemplates";
import { useActiveProject } from "../../components/Session";
import prisma from "../../lib/prisma";
import BreadcrumbsButtons from "../../components/common/BreadcrumbsButtons";

export const getServerSideProps = authenticatedPage(async (context) => {
  const templates =
    (await prisma.queryTemplate.findMany({
      where: userCanAccessQueryTemplate(context.user),
    })) || [];
  return { props: { templates: templates.map(formatQueryTemplate) } };
});

type Props = {
  templates: ExposedQueryTemplate[];
};

export default function QueryTemplates({ templates }: Props) {
  const columns: Column<ExposedQueryTemplate>[] = React.useMemo(
    () => [
      {
        Header: "Description",
        Cell: ({ row }) => (
          <Link href={`/querytemplates/${row.original.id}`}>
            {row.original.description}
          </Link>
        ),
        accessor: "description",
      },
      {
        Header: "Tag",
        accessor: "tag",
      },
      {
        Header: "Query",
        accessor: "query",
      },
      {
        Header: "Knobs",
        accessor: "knobs",
      },
      {
        Header: "Project id",
        accessor: "projectId",
      },
      {
        Header: "Parent id",
        accessor: "parentId",
      },
    ],
    []
  );

  const tableInstance = useTable({ columns, data: templates });
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = tableInstance;

  return (
    <div>
      <BreadcrumbsButtons>
        <Link href="/">Home</Link>
        <Typography>Query Templates</Typography>
      </BreadcrumbsButtons>
      <LinkButton href="/querytemplates/create" variant="contained">
        Add Query Template
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
