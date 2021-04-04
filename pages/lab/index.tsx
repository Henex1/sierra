import React from "react";

import { useActiveProject } from "../../components/Session";

export default function Lab() {
  const { project } = useActiveProject();
  return (
    <div>
      Welcome to THE LABORATORY. This is project {project?.name || "*none*"}
    </div>
  );
}
