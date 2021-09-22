import { getUser } from "../../../lib/authServer";
import { getClient } from "../../../lib/sendgrid";
import { requireEnv } from "../../../lib/env";
import { SierraApiRequest } from "../../../lib/apiServer";
import { NextApiResponse } from "next";

export const send = async (
  req: SierraApiRequest,
  res: NextApiResponse,
  subject: string,
  body: string
) => {
  try {
    const session = await getUser(req);
    const from = session.user?.email ?? undefined;
    const to = requireEnv("FEEDBACK_SEND_TO");
    const client = getClient();

    if (!from || !client || !to) {
      throw new Error();
    }

    await client.send({
      from,
      to,
      subject: subject,
      html: body,
    });

    res.status(200).json({});
  } catch (e) {
    res.status(500).json(e);
  }
};
