import { apiHandler, HttpError, requireUser } from "../../../lib/apiServer";
import { getProjects } from "../../../lib/projects";
import { getActiveOrg } from "../../../lib/org";
import { getCookies } from "../../../lib/cookies";

export default apiHandler(async (req, res) => {
  const user = requireUser(req);
  const { activeOrgId } = getCookies(req);
  const org = await getActiveOrg(user, activeOrgId);
  if (!org) {
    throw new HttpError(400, "No org associated with user");
  }
  const projects = await getProjects(org);
  res.status(200).json({
    username: user.email,
    orgId: org.id,
    projectIds: projects?.length > 0 ? projects.map((p) => p.id) : [],
  });
});
