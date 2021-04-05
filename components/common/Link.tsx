/* eslint-disable jsx-a11y/anchor-has-content */
import * as React from "react";
import clsx from "clsx";
import { useRouter } from "next/router";
import NextLink, { LinkProps as NextLinkProps } from "next/link";
import MuiLink, { LinkProps as MuiLinkProps } from "@material-ui/core/Link";
import MenuItem, {
  MenuItemProps as MuiMenuItemProps,
} from "@material-ui/core/MenuItem";
import MuiButton, {
  ButtonProps as MuiButtonProps,
} from "@material-ui/core/Button";

interface NextLinkComposedProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">,
    Omit<NextLinkProps, "href" | "as"> {
  linkAs?: NextLinkProps["as"];
  href: NextLinkProps["href"];
}

export const NextLinkComposed = React.forwardRef<
  HTMLAnchorElement,
  NextLinkComposedProps
>(function NextLinkComposed(props, ref) {
  const {
    linkAs,
    href,
    replace,
    scroll,
    passHref,
    shallow,
    prefetch,
    locale,
    ...other
  } = props;

  return (
    <NextLink
      href={href}
      prefetch={prefetch}
      as={linkAs}
      replace={replace}
      scroll={scroll}
      shallow={shallow}
      passHref={passHref}
      locale={locale}
    >
      <a ref={ref} {...other} />
    </NextLink>
  );
});

export type LinkProps = {
  activeClassName?: string;
  as?: NextLinkProps["as"];
  href: NextLinkProps["href"];
  noLinkStyle?: boolean;
} & Omit<NextLinkComposedProps, "linkAs" | "href"> &
  Omit<MuiLinkProps, "href">;

// A styled version of the Next.js Link component:
// https://nextjs.org/docs/#with-link
const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  props,
  ref
) {
  const {
    activeClassName = "active",
    as: linkAs,
    className: classNameProps,
    href,
    noLinkStyle,
    role, // Link don't have roles.
    ...other
  } = props;

  const router = useRouter();
  const pathname = typeof href === "string" ? href : href.pathname;
  const className = clsx(classNameProps, {
    [activeClassName]: router.pathname === pathname && activeClassName,
  });

  const isExternal =
    typeof href === "string" &&
    (href.indexOf("http") === 0 || href.indexOf("mailto:") === 0);

  if (isExternal) {
    if (noLinkStyle) {
      return (
        <a
          className={className}
          href={href as string}
          ref={ref as any}
          {...other}
        />
      );
    }

    return (
      <MuiLink
        className={className}
        href={href as string}
        ref={ref}
        {...other}
      />
    );
  }

  if (noLinkStyle) {
    return (
      <NextLinkComposed
        className={className}
        ref={ref as any}
        href={href}
        {...other}
      />
    );
  }

  return (
    <MuiLink
      component={NextLinkComposed}
      linkAs={linkAs}
      className={className}
      ref={ref}
      href={href as string}
      {...other}
    />
  );
});

export type MenuItemLinkProps = MuiMenuItemProps & NextLinkComposedProps;

// This is necessary to shut up a TypeScript error regarding the component
// prop. The code works, the type definitions are incorrect.
const UntypedMenuItem = MenuItem as React.ComponentType<any>;

export const MenuItemLink = React.forwardRef<
  HTMLAnchorElement,
  MenuItemLinkProps
>((props: MenuItemLinkProps, ref) => {
  const {
    linkAs,
    href,
    replace,
    scroll,
    passHref,
    shallow,
    prefetch,
    locale,
    ...other
  } = props;

  return (
    <NextLink
      href={href}
      prefetch={prefetch}
      as={linkAs}
      replace={replace}
      scroll={scroll}
      shallow={shallow}
      passHref={true}
      locale={locale}
    >
      <UntypedMenuItem component="a" ref={ref as any} {...other} />
    </NextLink>
  );
});

export type ButtonProps = MuiButtonProps & NextLinkComposedProps;

export const LinkButton = (props: ButtonProps) => {
  const {
    linkAs,
    href,
    replace,
    scroll,
    passHref,
    shallow,
    prefetch,
    locale,
    ...other
  } = props;

  return (
    <NextLink
      href={href}
      prefetch={prefetch}
      as={linkAs}
      replace={replace}
      scroll={scroll}
      shallow={shallow}
      passHref={true}
      locale={locale}
    >
      <MuiButton {...other} />
    </NextLink>
  );
};

export default Link;
