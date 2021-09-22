import * as Zod from "zod";
import { apiHandler, requireBody, requireMethod } from "../../../lib/apiServer";
import { send } from "./index";

const Rating = Zod.object({
  rating: Zod.number(),
  comment: Zod.string(),
});

export default apiHandler(async (req, res) => {
  requireMethod(req, "POST");

  const { rating, comment } = requireBody(req, Rating);

  if (!rating) {
    throw new Error();
  }

  send(
    req,
    res,
    "New review",
    `<div><strong>Stars:</strong> ${rating}</div>
      <div><strong>Comment</strong>: ${comment}</div>
      `
  );
});
