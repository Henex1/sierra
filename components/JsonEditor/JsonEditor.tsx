import * as React from "react";
import AceEditor from "react-ace";
import uniqueId from "lodash/uniqueId";

import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-github";

type Props = {
  value: string;
  onChange: (value: string, event: React.ChangeEvent) => void;
};

export default function JsonEditor({ value, onChange }: Props) {
  return (
    <AceEditor
      value={value}
      onChange={onChange}
      name={uniqueId("JsonEditor")}
      mode="json"
      theme="github"
      fontSize={16}
      width="100%"
      height="300px"
      showPrintMargin={false}
      setOptions={{
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        tabSize: 2,
      }}
      editorProps={{ $blockScrolling: true }}
    />
  );
}
