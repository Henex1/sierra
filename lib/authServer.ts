import { IncomingMessage } from "http";
import { Session, NextAuthOptions } from "next-auth";
import Providers from "next-auth/providers";
import Adapters from "next-auth/adapters";
import { getSession } from "next-auth/client";
import { isExpired } from "./users/apikey";
import prisma, { User, UserOrgRole } from "./prisma";
import { requireEnv } from "./env";
import { formatProject, listProjects, ExposedProject } from "./projects";
import { formatOrg, userCanAccessOrg, ExposedOrg, listOrgs } from "./org";

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
const nextAuthSecret = requireEnv("SECRET");

export const authOptions: NextAuthOptions = {
  providers: [
    Providers.Google({
      clientId: googleId,
      clientSecret: googleSecret,
    }),
  ],
  adapter: Adapters.Prisma.Adapter({ prisma }),
  secret: nextAuthSecret,
  callbacks: {
    async session(session: Session, user: User) {
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
      await prisma.org.create({
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

async function initAuth(req: IncomingMessage): Promise<UserSession | null> {
  let session = (await getSession({ req })) as UserSession | null;

  if (!session) {
    console.log("NO SESSION - attempting to retrieve API Key");
    // Attempt API Key authentication if there's no user session.
    let apikey = String(req.headers["authorization"]);
    if (!apikey) {
      return null;
    }
    if (apikey.startsWith("Bearer ")) {
      apikey = apikey.substr(7).trim();
    }
    const apikeyObject = await prisma.apiKey.findFirst({
      where: { apikey: apikey },
    });
    if (!apikeyObject) {
      console.log("API Key not found: " + apikey);
      return null;
    }
    if (isExpired(apikeyObject)) {
      console.log("API Key has expired");
      return null;
    }
    if (apikeyObject.disabled) {
      console.log("API Key is disabled");
      return null;
    }
    const user = {
      id: apikeyObject.userId,
    };
    // Temp hack to find orgs for a user connecting via api key
    const orgs = await listOrgs(user as User);
    session = {
      user: user as User,
      orgs: orgs,
    };
  }

  return session;
}

export async function getUser(req: IncomingMessage): Promise<UserSession> {
  const session = await initAuth(req);

  if (!session) {
    return {};
  }

  const userId = session.user?.id;
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
    // Currently there's no way in UI to set user.activeOrgId, but it is required for apikey authentication to work
    user.activeOrgId = session.orgs?.[0]?.id ?? null;
    if (!user.activeOrgId) {
      throw new Error("User has no Orgs!");
    }
  }
  return { session, user };
}
