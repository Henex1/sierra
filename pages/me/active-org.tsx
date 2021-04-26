import * as React from "react";
import { GetServerSideProps } from "next";

import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

import { authenticatedPage } from "../../lib/pageHelpers";
import { ExposedOrg, listOrgs, formatOrg } from "../../lib/org";
import { useActiveOrg } from "../../components/Session";
import Link from "../../components/common/Link";
import BreadcrumbsButtons from "../../components/common/BreadcrumbsButtons";

export const getServerSideProps = authenticatedPage(async (context) => {
  const orgs = await listOrgs(context.user);
  return { props: { orgs: orgs.map(formatOrg) } };
});

type Props = {
  orgs: ExposedOrg[];
};

export default function ActiveOrg({ orgs }: Props) {
  const { activeOrg, setActiveOrg } = useActiveOrg();
  return (
    <div>
      <BreadcrumbsButtons>
        <Link href="/">Home</Link>
        <Typography>Active Org</Typography>
      </BreadcrumbsButtons>
      <p>Active org: {activeOrg?.name || "None"}</p>
      <ul>
        {orgs.map((o) => (
          <li key={o.id}>
            <Button
              variant="outlined"
              color={activeOrg?.id === o.id ? "primary" : undefined}
              onClick={() => setActiveOrg(o)}
            >
              {o.name}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
