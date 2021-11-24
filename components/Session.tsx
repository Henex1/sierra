import React, { useEffect } from "react";
import {
  getSession as getNextSession,
  useSession as useNextSession,
} from "next-auth/client";
import { Session as NextSession, User as NextUser } from "next-auth";
import Cookies from "js-cookie";

import { ExposedOrg } from "../lib/org";
import { ExposedProject } from "../lib/projects";

type User = NextUser & { id?: number; defaultOrgId: string | null };

export type Session = Omit<NextSession, "user"> & {
  loading: boolean;
  user?: User;
  orgs?: ExposedOrg[];
  projects?: ExposedProject[];
};

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
  const { setProject } = useActiveProject();
  const [val, setVal] = React.useState<Session>(
    mkSession(nextLoading, nextSession)
  );
  const context = React.useMemo(
    () => ({
      session: val,
      refresh: async () => {
        const session = await getNextSession();
        setProject((session as any)?.projects?.[0]);
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

  return <Context.Provider value={context}>{children}</Context.Provider>;
}

export function useSession(): SessionContext {
  return React.useContext(Context);
}

interface ActiveOrg {
  activeOrg: ExposedOrg | null;
  setActiveOrg(org: ExposedOrg | null): Promise<void>;
}

export function useActiveOrg(): ActiveOrg {
  const { session, refresh } = useSession();
  const activeOrg = React.useMemo((): ExposedOrg | null => {
    const activeOrgId = session.activeOrgId;
    if (!activeOrgId) return null;
    const orgs = session.orgs || [];
    return orgs.find((o) => o.id === activeOrgId) || null;
  }, [session.orgs, session.activeOrgId]);
  const setActiveOrg = React.useCallback(
    async (org: ExposedOrg): Promise<void> => {
      Cookies.set("activeOrgId", org.id);
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
  const [project, setProject] = React.useState<ExposedProject | null>(null);
  useEffect(() => {
    if (project) {
      Cookies.set("activeProjectId", project?.id);
    }
  }, [project]);

  return (
    <ActiveProjectContext.Provider value={{ project, setProject }}>
      {children}
    </ActiveProjectContext.Provider>
  );
}

export function useActiveProject(): ActiveProject {
  return React.useContext(ActiveProjectContext);
}
