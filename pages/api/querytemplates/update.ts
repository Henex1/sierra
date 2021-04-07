import { NextApiRequest, NextApiResponse } from "next";
import * as z from "zod";

import prisma from "../../../lib/prisma";
import { notAuthorized } from "../../../lib/errors";
import { getUser } from "../../../lib/authServer";
import { userCanAccessOrg } from "../../../lib/org";
import {userCanAccessProject} from "../../../lib/projects";
import {userCanAccessQueryTemplate} from "../../../lib/querytemplates";

const updateQueryTemplateSchema = z.object({
    id: z.number(),
    description: z.string(),
    query: z.string(),
    knobs: z.string(),
    tag: z.string(),
    projectId: z.number(),
});


export default async function updateQueryTemplate(
    req: NextApiRequest,
    res: NextApiResponse
): Promise<void> {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "must use POST" });
    }
    const input = updateQueryTemplateSchema.safeParse(req.body);
    const { user } = await getUser(req);
    if (!user) {
        return notAuthorized(res);
    }
    const org = await prisma.org.findFirst({ where: userCanAccessOrg(user) });
    if (!org) {
        return res.status(500).json({ error: "user has no attached org" });
    }
    if (!input.success) {
        return res.status(400).json(input.error);
    }
    const project = await prisma.project.findFirst({where: userCanAccessProject(user, { id: input.data.projectId })});
    if (!project) {
        return res.status(500).json({ error: "Query template must be attached to a project" });
    }
    const queryTemplate = await prisma.queryTemplate.findFirst({
        where: userCanAccessQueryTemplate(user, { id: input.data.id }),
    });
    if (!queryTemplate) {
        return res.status(404).json({ error: "ruleset does not exist" });
    }

    const { description, query, knobs, projectId, tag } = input.data;
    const latestTemplate = await prisma.queryTemplate.create({
        data: { description, query, knobs, projectId, tag, parentId: queryTemplate.id },
    });
    return res.status(200).json({ latestTemplate });
}
