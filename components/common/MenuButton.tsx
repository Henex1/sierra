import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { Button, IconButton, Menu } from "@material-ui/core";

export type MenuButtonProps = {
  buttonClassName?: string;
  buttonIcon?: React.ReactNode;
  buttonChildren?: React.ReactNode;
  menuClassName?: string;
  children?: React.ReactNode;
};

export default function MenuButton({
  buttonClassName,
  buttonIcon,
  buttonChildren,
  menuClassName,
  children,
}: MenuButtonProps) {
  const router = useRouter();

  const [open, setOpen] = useState<boolean>(false);
  const anchorEl = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [router.pathname]);

  const button = buttonChildren ? (
    <Button
      className={buttonClassName}
      size="large"
      color="inherit"
      onClick={() => setOpen(!open)}
      startIcon={buttonIcon}
      ref={anchorEl}
      children={buttonChildren}
    />
  ) : (
    <IconButton
      className={buttonClassName}
      color="inherit"
      onClick={() => setOpen(!open)}
      ref={anchorEl}
    >
      {buttonIcon}
    </IconButton>
  );

  return (
    <>
      {button}
      <Menu
        className={menuClassName}
        anchorEl={anchorEl.current}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        getContentAnchorEl={null}
        keepMounted
        transformOrigin={{ vertical: "bottom", horizontal: "left" }}
        open={open}
        onClose={() => setOpen(false)}
        children={children}
      />
    </>
  );
}
