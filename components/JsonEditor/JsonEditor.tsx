import * as React from "react";
import AceEditor from "react-ace";
import uniqueId from "lodash/uniqueId";

import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-github";

type Props = {
  value: string;
  onChange: (value: string, event: React.ChangeEvent) => void;
  height?: number;
  className?: string;
  inputRef?: React.MutableRefObject<AceEditor>;
  adaptiveHeight?: boolean;
};

export default function JsonEditor({
  value,
  onChange,
  height,
  className,
  inputRef,
  adaptiveHeight,
}: Props) {
  const props = adaptiveHeight
    ? {
        maxLines: Infinity,
      }
    : {
        height: height + "px",
      };

  return (
    <AceEditor
      ref={inputRef}
      className={className || ""}
      value={value}
      onChange={onChange}
      name={uniqueId("JsonEditor")}
      mode="json"
      theme="github"
      fontSize={16}
      width="100%"
      showPrintMargin={false}
      setOptions={{
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        tabSize: 2,
      }}
      editorProps={{ $blockScrolling: true }}
      minLines={3}
      {...props}
    />
  );
}

JsonEditor.defaultProps = {
  height: 300,
};
