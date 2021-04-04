import { IncomingMessage } from "http";
import { User as UserBase, InitOptions } from "next-auth";
import { SessionBase } from "next-auth/_utils";
import Providers from "next-auth/providers";
import Adapters from "next-auth/adapters";
import { Session, getSession } from "next-auth/client";

import prisma, { User, UserOrgRole } from "./prisma";
import { requireEnv } from "./env";
import {
  formatProject,
  userCanAccessProject,
  ExposedProject,
} from "./projects";

export type ValidUserSession = {
  session: Session;
  user: User;
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
      const projects = (
        await prisma.project.findMany({
          where: userCanAccessProject(user),
        })
      ).map(formatProject);

      return { ...session, projects };
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

      // Automatically create a development datasource for the new org.
      // Eventually, this needs to be some kind of Org creation wizard.
      const datasource = await prisma.datasource.create({
        data: {
          orgId: org.id,
          name: "Local Elasticsearch",
          type: "ELASTICSEARCH",
          info: { host: "http://localhost:9200/*" },
        },
      });

      // Automatically create a project for the new org. Eventually, do this
      // when we create the Org, rather than for each user.
      await prisma.project.create({
        data: {
          orgId: org.id,
          datasourceId: datasource.id,
          name: "My Project",
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
  const user =
    (await prisma.user.findUnique({
      where: { id: userId },
    })) ?? undefined;
  return { session, user };
}
