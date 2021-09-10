import * as Zod from "zod";
import { apiHandler, requireBody, requireMethod } from "../../../lib/apiServer";
import { send } from "./index";

const Request = Zod.object({
  title: Zod.string(),
  comment: Zod.string(),
});

export default apiHandler(async (req, res) => {
  requireMethod(req, "POST");

  const { title, comment } = requireBody(req, Request);

  if (!comment) {
    throw new Error();
  }

  send(
    req,
    res,
    "New request",
    ` <strong>Title</strong>: ${title}
      <strong>Comment</strong>: ${comment}
      `
  );
});
