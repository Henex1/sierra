import * as React from "react";
import AceEditor from "react-ace";
import uniqueId from "lodash/uniqueId";

import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-xcode";

type Props = {
  value: string;
  onChange: (value: string, event: React.ChangeEvent) => void;
  height?: number;
  className?: string;
  inputRef?: React.MutableRefObject<AceEditor>;
};

export default function PatternEditor({ value, onChange, inputRef }: Props) {
  return (
    <AceEditor
      ref={inputRef}
      className="regexr regexr-expression-editor"
      value={value}
      onChange={onChange}
      name={uniqueId("PatternEditor")}
      mode="javascript"
      theme="xcode"
      placeholder="Type here"
      fontSize={18}
      showGutter={false}
      highlightActiveLine={false}
      width="100%"
      commands={[
        {
          name: "disableEnter",
          bindKey: { win: "Enter", mac: "Enter" },
          exec: () => {},
        },
      ]}
      showPrintMargin={false}
      style={{
        backgroundColor: "#EEE",
        background: "#EEE",
      }}
      setOptions={{
        tabSize: 2,
        useWorker: false,
      }}
      editorProps={{ $blockScrolling: true }}
      minLines={1}
      maxLines={1}
    />
  );
}
