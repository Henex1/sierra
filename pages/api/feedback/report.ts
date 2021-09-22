import * as Zod from "zod";
import { apiHandler, requireBody, requireMethod } from "../../../lib/apiServer";
import { send } from "./index";

const Report = Zod.object({
  comment: Zod.string(),
});

export default apiHandler(async (req, res) => {
  requireMethod(req, "POST");

  const { comment } = requireBody(req, Report);

  if (!comment) {
    throw new Error();
  }

  send(req, res, "New report", ` <strong>Comment</strong>: ${comment}`);
});
