import { NextApiRequest, NextApiResponse } from "next";
import * as z from "zod";
import { getProject } from "../../../lib/projects";
import {
  formatJudgement,
  getJudgement,
  createJudgementSchema,
  createJudgement,
  updateJudgementSchema,
  updateJudgement,
  setVotesSchema,
  setVotes,
} from "../../../lib/judgements";
import {
  apiHandler,
  HttpError,
  requireMethod,
  requireUser,
  requireBody,
} from "../../../lib/apiServer";
import { IncomingForm } from "formidable";
import * as fs from "fs";
import csvParser from "csv-parse/lib/sync";

export const handleCreateJudgement = apiHandler(async (req, res) => {
  requireMethod(req, "POST");
  const user = requireUser(req);
  const { projectId, ...input } = requireBody(
    req,
    createJudgementSchema.extend({
      projectId: z.number(),
    })
  );
  const project = await getProject(user, projectId);
  if (!project) {
    throw new HttpError(404, { error: "project not found" });
  }
  const judgement = await createJudgement(project, input);
  res.status(200).json({ judgement: formatJudgement(judgement) });
});

export const handleUpdateJudgement = apiHandler(async (req, res) => {
  requireMethod(req, "POST");
  const user = requireUser(req);
  const { id, ...input } = requireBody(
    req,
    updateJudgementSchema.extend({
      id: z.number(),
    })
  );
  const judgement = await getJudgement(user, id);
  if (!judgement) {
    throw new HttpError(404, { error: "judgement not found" });
  }
  const updated = await updateJudgement(judgement, input);
  res.status(200).json({ judgement: formatJudgement(updated) });
});

export const handleSetVotes = apiHandler(async (req, res) => {
  requireMethod(req, "POST");
  const user = requireUser(req);
  const { id, votes } = requireBody(
    req,
    z.object({
      id: z.number(),
      votes: setVotesSchema,
    })
  );
  const judgement = await getJudgement(user, id);
  if (!judgement) {
    throw new HttpError(404, { error: "judgement not found" });
  }
  const updated = await setVotes(judgement, votes);
  res.status(200).json({ success: true });
});

export const handleImport = apiHandler(async (req, res) => {
  requireMethod(req, "POST");
  let data: any = {}
  try {
    const raw = await new Promise<any>((res, rej) => {
      const form = new IncomingForm();
      form.parse(req, (err, fields, files) => {
        if (err) rej(err);
        res({
          fields, files
        });
      })
    });
    data.fileContent = parseCsv(fs.readFileSync(raw?.files?.file?.path, {encoding: 'utf8'}));
    data.projectId = parseInt(raw?.fields?.projectId);
    data.name = raw?.fields?.name;
  } catch (e) {
    res.status(400).json({success: false, error: e.message})
    return;
  }
  const user = requireUser(req);
  const project = await getProject(user, data.projectId);
  if (!project) {
    throw new HttpError(404, { error: "project not found" });
  }
  const judgement = await createJudgement(project, {name: data.name});
  await setVotes(judgement, data.fileContent);
  res.status(200).json({ success: true, id: judgement.id })
});

function parseCsv(content: string): typeof setVotesSchema{
  const raw = csvParser(content, {  columns: true, trim: true, skip_empty_lines: true});
  const actions: any = {};
  // transform to vote actions
  raw.forEach((item: any) => {
    if (!item.query || !item.query.length) throw new Error("Invalid CSV format");
    if (!actions[item.query]) {
      actions[item.query] = {};
    }
    if (item.docid?.length) {
      item.rating = parseInt(item.rating);
      item.rating = Number.isNaN(item.rating) ? 0 : item.rating;
      actions[item.query][item.docid] = isNaN(item.rating) ? 0 : parseInt(item.rating);
    }
  });
  return actions;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return res.status(404).json({ error: "not found" });
}
