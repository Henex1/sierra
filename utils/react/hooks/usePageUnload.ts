import { useEffect } from "react";
import { useRouter } from "next/router";

interface Transition {
  type: "transition";
  data: {
    url: string;
    meta: {
      shallow: boolean;
    };
  };
}

interface PageUnload {
  type: "unload";
  data: BeforeUnloadEvent;
}

type UnloadType = Transition | PageUnload;

type TransitionHandler = (type: UnloadType) => false | string;

export function usePageUnload(th: TransitionHandler) {
  const router = useRouter();

  useEffect(() => {
    const handleWindowClose = (e: BeforeUnloadEvent) => {
      const message = th({ type: "unload", data: e });
      if (!message) return;
      e.preventDefault();
      return (e.returnValue = message);
    };
    const handleBrowseAway = (url: string, meta: { shallow: boolean }) => {
      const message = th({ type: "transition", data: { url, meta } });

      if (!message) return;

      if (window.confirm(message)) return;

      router.events.emit("routeChangeError");
      throw "routeChange aborted.";
    };

    window.addEventListener("beforeunload", handleWindowClose);
    router.events.on("routeChangeStart", handleBrowseAway);

    return () => {
      window.removeEventListener("beforeunload", handleWindowClose);
      router.events.off("routeChangeStart", handleBrowseAway);
    };
  }, [th]);
}
