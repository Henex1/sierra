import React from "react";
import { Controlled as CodeMirror } from "react-codemirror2";
import ExpressionHighlighter from "./ExpressionHighlighter";
import ExpressionHover from "./ExpressionHover";
import RegexUtils from "./RegexUtils";
import "codemirror/addon/display/placeholder";

type PatternEditorPropField = {
  width: number | string;
  height: number | string;
  value: string;
  onChange: (text: string) => void;
  onBeforeChange: (editor: object, data: object, value: string) => void;
};
class PatternEditor extends React.Component<PatternEditorPropField> {
  _cmElem: object | any;
  _expressionHighlighter: object | any;
  _expressionHover: object | any;

  UNSAFE_componentWillMount() {
    this._cmElem = React.createRef();
  }

  componentDidMount() {
    var elem = this._cmElem;
    var cm = elem.current.editor;
    var width = this.props.width || "100%";
    var height = this.props.height || "auto";
    cm.setSize(width, height);

    // Copied from regexr code:
    // Hacky method to disable overwrite mode on expressions to avoid overwriting flags
    cm.toggleOverwrite = function () {};

    this._cmElem = elem;
    this._expressionHighlighter = new ExpressionHighlighter(cm);
    this._expressionHover = new ExpressionHover(
      cm,
      this._expressionHighlighter
    );

    this.updateCodeMirror(this.props.value);
  }

  updateCodeMirror(pattern: string) {
    var parsed = RegexUtils.parsePattern(pattern);
    this._expressionHighlighter.draw(parsed.tree);
    this._expressionHover.token = parsed.token;
  }

  componentDidUpdate() {
    this.updateCodeMirror(this.props.value);
  }

  render() {
    const value = this.props.value;
    const onNewLine = () => {};

    return (
      <CodeMirror
        className="regexr regexr-expression-editor"
        value={value}
        onChange={this.props.onChange}
        onBeforeChange={this.props.onBeforeChange}
        options={{
          lineNumbers: false,
          tabSize: 2,
          indentWithTabs: false,
          scrollbarStyle: "null",
          placeholder: "Type here",
          lineWrapping: false,
          extraKeys: {
            Enter: onNewLine,
          },
        }}
        ref={this._cmElem}
      />
    );
  }
}

export default PatternEditor;
