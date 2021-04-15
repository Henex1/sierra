import React from "react";
import {
  getSession as getNextSession,
  useSession as useNextSession,
  Session as NextSession,
} from "next-auth/client";
import { User as NextUser } from "next-auth";

import { ExposedOrg } from "../lib/org";
import { ExposedProject } from "../lib/projects";
import { apiRequest } from "../lib/api";

type User = NextUser & { id?: number; activeOrgId: number | null };

export type Session = Omit<NextSession, "user"> & {
  loading: boolean;
  user?: User;
  orgs?: ExposedOrg[];
  projects?: ExposedProject[];
};

const emptySession: Session = { loading: true };

interface SessionContext {
  session: Session;
  refresh(): Promise<void>;
}
const Context = React.createContext<SessionContext>(undefined as any);

type ProviderProps = {
  children: React.ReactNode;
};

function mkSession(loading: boolean, session: any = {}): Session {
  return { loading, ...session };
}

export function SessionProvider({ children }: ProviderProps) {
  const [nextSession, nextLoading] = useNextSession();
  const [val, setVal] = React.useState<Session>(
    mkSession(nextLoading, nextSession)
  );
  const context = React.useMemo(
    () => ({
      session: val,
      refresh: async () => {
        const session = await getNextSession();
        // When this promise resolves, the useNextSession hook will change and
        // we'll see an updated session... except there's a bug, and the
        // session is actually the old session still, so we have to maintain
        // our own state instead.
        setVal(mkSession(false, session));
      },
    }),
    [val]
  );
  React.useEffect(() => {
    setVal(mkSession(nextLoading, nextSession));
  }, [nextLoading, nextSession]);

  return <Context.Provider value={context} children={children} />;
}

export function useSession(): SessionContext {
  return React.useContext(Context);
}

interface ActiveOrg {
  activeOrg: ExposedOrg | null;
  setActiveOrg(org: ExposedOrg | null): Promise<void>;
}
const ActiveOrgContext = React.createContext<ActiveOrg>(undefined as any);

export function useActiveOrg(): ActiveOrg {
  const { session, refresh } = useSession();
  const activeOrg = React.useMemo((): ExposedOrg | null => {
    const activeOrgId = session.user?.activeOrgId;
    if (!activeOrgId) return null;
    const orgs = session.orgs || [];
    return orgs.find((o) => o.id === activeOrgId) || null;
  }, [session.orgs, session.user?.activeOrgId]);
  const setActiveOrg = React.useCallback(
    async (org: ExposedOrg): Promise<void> => {
      await apiRequest(
        "/api/users/me",
        { activeOrgId: org.id },
        { method: "PATCH" }
      );
      refresh();
    },
    []
  );
  return { activeOrg, setActiveOrg };
}

interface ActiveProject {
  project: ExposedProject | null;
  setProject(project: ExposedProject | null): void;
}
const ActiveProjectContext = React.createContext<ActiveProject>(
  undefined as any
);

export function ActiveProjectProvider({ children }: ProviderProps) {
  const { session } = useSession();
  const [project, setProject] = React.useState<ExposedProject | null>(null);

  return (
    <ActiveProjectContext.Provider
      value={{ project, setProject }}
      children={children}
    />
  );
}

export function useActiveProject(): ActiveProject {
  return React.useContext(ActiveProjectContext);
}
