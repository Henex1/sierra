import React from "react";
import PropTypes from "prop-types";
import { Controlled as CodeMirror } from "react-codemirror2";
import ExpressionHighlighter from "./ExpressionHighlighter";
import ExpressionHover from "./ExpressionHover";
import RegexUtils from "./RegexUtils";
import "codemirror/addon/display/placeholder";

class PatternEditor extends React.Component {
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

  updateCodeMirror(pattern) {
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

PatternEditor.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,

  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // Defaults to 100%
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // Defaults to auto
};
export default PatternEditor;
