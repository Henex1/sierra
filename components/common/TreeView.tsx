import _ from "lodash";
import * as React from "react";
import { makeStyles } from "@material-ui/core/styles";
import cx from "classnames";

export interface Tree<T> {
  id: string;
  value: T;
  children: Tree<T>[];
}

export function useTree<T>(
  items: T[],
  getNodeId: (t: T) => string,
  getParentId: (t: T) => string | null
): Tree<T>[] {
  const roots = React.useMemo(() => {
    const flatIndex = _.keyBy(items, "id");
    const treeNodes: Record<string, Tree<T>> = {};
    function getNode(t: T): Tree<T> {
      const id = getNodeId(t);
      if (!(id in treeNodes)) {
        treeNodes[id] = { id, value: t, children: [] };
      }
      return treeNodes[id];
    }
    const roots: Tree<T>[] = [];
    items.forEach((t) => {
      const ownNode = getNode(t);
      const parentId = getParentId(t);
      if (parentId && parentId in flatIndex) {
        const parent = flatIndex[parentId];
        const parentNode = getNode(parent);
        parentNode.children.push(ownNode);
      } else {
        roots.push(ownNode);
      }
    });
    return roots;
  }, [items]);
  return roots;
}

// I commented these out because they look super janky, but this is a CSS
// starter.
const useStyles = makeStyles(() => {
  // Size of the space to the left of the vertical line
  const indentPre = 2;
  // Size of the line pointing to the item
  const dash = 10;
  // Size of the space to the right of the vertical line
  const indentPost = 15;
  return {
    children: {
      listStyleType: "none",
      padding: `0 0 0 ${indentPre + 1 + indentPost}px`,
      "& > li": {
        "&:not(:last-child)": {
          marginLeft: -indentPost,
          paddingLeft: indentPost,
          borderLeft: "solid 1px black",
        },
        borderLeft: "solid 1px transparent",
        padding: 0,
        "& > div": {
          position: "relative",
          "&::before": {
            borderBottom: "solid 1px black",
            borderLeft: "solid 1px black",
            content: '" "',
            display: "block",
            height: "0.7rem", // this centers the line in the description label
            left: -indentPost - 1,
            position: "absolute",
            width: dash,
          },
        },
      },
    },
    root: {
      padding: 0,
      "& > li > div::before": {
        display: "none",
      },
    },
  };
});

type Props<T> = {
  roots: Tree<T>[];
  renderItem: (t: T) => React.ReactNode;
};

export function TreeView<T>({ roots, renderItem }: Props<T>) {
  const classes = useStyles();

  function renderNode(node: Tree<T>) {
    return (
      <li key={node.id}>
        <div>{renderItem(node.value)}</div>
        {node.children.length > 0 ? (
          <ul className={classes.children}>
            {node.children.map((n) => renderNode(n))}
          </ul>
        ) : null}
      </li>
    );
  }

  const list = (
    <ul className={cx(classes.children, classes.root)}>
      {roots.map((n) => renderNode(n))}
    </ul>
  );
  return <div>{list}</div>;
}
