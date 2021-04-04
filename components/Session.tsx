import React from "react";
import {
  getSession as getNextSession,
  Session as NextSession,
} from "next-auth/client";
import { User as NextUser } from "next-auth";

import { ExposedProject } from "../lib/projects";

type User = NextUser & { id?: number };

export type Session = Omit<NextSession, "user"> & {
  loading: boolean;
  user?: User;
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

export function SessionProvider({ children }: ProviderProps) {
  const [val, setVal] = React.useState<Session>(emptySession);
  const refresh = React.useCallback(async () => {
    if (val !== emptySession) {
      setVal(emptySession);
    }
    const session = await getNextSession();
    setVal({ loading: false, ...session });
  }, []);
  const context = React.useMemo(() => ({ session: val, refresh }), [
    val,
    refresh,
  ]);

  // Do initial load
  React.useEffect(() => {
    refresh();
  }, []);

  return <Context.Provider value={context} children={children} />;
}

export function useSession(): SessionContext {
  return React.useContext(Context);
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
