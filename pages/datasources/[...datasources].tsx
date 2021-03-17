import { useRouter } from "next/router";
import Container from "@material-ui/core/Container";

export default function Datasources() {
  const router = useRouter();
  const { datasources } = router.query;
  return <div>I'm a box at {datasources}</div>;
}
