import { NextApiHandler } from "next";
import NextAuth, { Session, User, InitOptions } from "next-auth";
import { SessionBase } from "next-auth/_utils";
import Providers from "next-auth/providers";
import Adapters from "next-auth/adapters";
import prisma, { UserOrgRole } from "../../../lib/prisma";
import { requireEnv } from "../../../lib/env";

const googleId = requireEnv("GOOGLE_ID");
const googleSecret = requireEnv("GOOGLE_SECRET");
const allowRegistrationFrom = requireEnv("ALLOW_REGISTRATION_FROM").split(",");

const authHandler: NextApiHandler = (req, res) => NextAuth(req, res, options);
export default authHandler;

const options: InitOptions = {
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
      return session;
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
