import React from "react";
import { makeStyles } from "@material-ui/core";
import classnames from "classnames";

const useStyles = makeStyles((theme) => ({
  root: {},
}));

type Props = {
  children: (size: { width: number; height: number }) => React.ReactNode;
  className?: string;
};

export default function Resizable({ className, children }: Props) {
  const classes = useStyles();
  const [size, setSize] = React.useState({
    width: 0,
    height: 0,
  });
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleResize = () => {
    if (containerRef.current) {
      setSize({
        width: containerRef.current.getBoundingClientRect().width,
        height: containerRef.current.getBoundingClientRect().height,
      });
    }
  };

  React.useEffect(() => {
    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    handleResize();
    return () => {
      resizeObserver.disconnect();
    };
  }, [containerRef]);

  return (
    <div ref={containerRef} className={classnames(className, classes.root)}>
      {children(size)}
    </div>
  );
}
