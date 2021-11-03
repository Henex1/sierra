import React, { useEffect, useRef } from "react";

const getViewportSize = (node: HTMLElement) => {
  return {
    height: node?.clientHeight || 0,
    width: node?.clientWidth || 0,
  };
};

export type Props = {
  images: Array<{
    src: string;
    width: number;
    height: number;
  }>;
};

export default function LoginImage({ images }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const { width, height } = getViewportSize(ref.current);
      const src =
        images.find((i) => i.width >= width && i.height >= height)?.src ??
        "../images/sierra4k-login.jpeg";

      ref.current.setAttribute("style", `background-image: url(${src})`);
    }
  }, []);

  return <div className="image-container" ref={ref} />;
}
