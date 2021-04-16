import { IncomingMessage } from "http";
import { User as UserBase, InitOptions } from "next-auth";
import { SessionBase } from "next-auth/_utils";
import Providers from "next-auth/providers";
import Adapters from "next-auth/adapters";
import { Session, getSession } from "next-auth/client";

import prisma, { User, UserOrgRole } from "./prisma";
import { requireEnv } from "./env";
import { formatProject, listProjects, ExposedProject } from "./projects";
import { formatOrg, userCanAccessOrg, ExposedOrg } from "./org";

export type ValidUserSession = {
  session: Session;
  user: User;
  orgs: ExposedOrg[];
  projects: ExposedProject[];
};

export type UserSession = Partial<ValidUserSession>;

const googleId = requireEnv("GOOGLE_ID");
const googleSecret = requireEnv("GOOGLE_SECRET");
const allowRegistrationFrom = requireEnv("ALLOW_REGISTRATION_FROM").split(",");

export const authOptions: InitOptions = {
  providers: [
    Providers.Google({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
  ],
  adapter: Adapters.Prisma.Adapter({ prisma }),
  secret: process.env.SECRET,
  callbacks: {
    async session(session: SessionBase, user: User) {
      // For some reason next auth doesn't include this by default.
      (session as any).user.id = (user as any).id;

      // We stuff some extra values in the session as well
      const orgs = await prisma.org.findMany({
        where: userCanAccessOrg(user),
      });
      const activeOrg = orgs.find((o) => o.id === user.activeOrgId) || orgs[0];
      (session as any).user.activeOrgId = activeOrg?.id;

      const projects = (activeOrg ? await listProjects(activeOrg) : []).map(
        formatProject
      );

      return { ...session, orgs: orgs.map(formatOrg), projects };
    },
    async signIn(user: any, account: any, profile: any) {
      const email = profile.verified_email ? profile.email : "";
      const validDomain = allowRegistrationFrom.some((d) =>
        email.endsWith(`@${d}`)
      );
      return validDomain;
    },
  },
  events: {
    async createUser(user: any) {
      // Automatically create an organization for each user. Eventually,
      // replace this with an Org invitation system.
      const org = await prisma.org.create({
        data: {
          name: `${user.name}'s Organization`,
          users: {
            create: {
              userId: user.id,
              role: "ADMIN" as UserOrgRole,
            },
          },
        },
      });
    },
  },
};

export async function getUser(req: IncomingMessage): Promise<UserSession> {
  const session = await getSession({ req });
  if (!session) {
    return {};
  }
  const userId = (session.user as any)?.id;
  if (!userId) {
    return { session };
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    // XXX - this is a critical error meaning our session is corrupt!
    return { session };
  }
  if (!user.activeOrgId) {
    // We have to have a default Org or else we can't show any resources.
    user.activeOrgId = session.orgs[0]?.id;
    if (!user.activeOrgId) {
      throw new Error("User has no Orgs!");
    }
  }
  return { session, user };
}
