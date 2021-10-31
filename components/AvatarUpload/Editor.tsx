import Dropzone from "react-dropzone";
import AvatarEditor, { Position } from "react-avatar-editor";
import { ReactElement, useCallback, useEffect, useRef, useState } from "react";
import { Slider } from "@material-ui/core";
import { CheckCircle } from "@material-ui/icons";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => ({
  controls: {
    display: "grid",
    gap: theme.spacing(),
    "grid-template-columns": "1fr auto",
    paddingLeft: "5px",
  },
  save: {
    color: theme.palette.primary.main,
    cursor: "pointer",
  },
}));

export interface Props {
  value: string;
  onChange: (url: string) => void;
}

export const Editor = ({ value, onChange }: Props): ReactElement => {
  const classes = useStyles();
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState<Position | undefined>();
  const editorRef = useRef<AvatarEditor>(null);
  const handleSave = useCallback(() => {
    const editor = editorRef.current;

    if (editor) {
      const img = editor.getImageScaledToCanvas().toDataURL();
      onChange(img);
    }
  }, []);

  useEffect(() => setScale(1), [value]);

  return (
    <div>
      <Dropzone>
        {({ getRootProps }) => {
          return (
            <div {...getRootProps()}>
              <AvatarEditor
                ref={editorRef}
                scale={scale}
                position={position}
                onPositionChange={setPosition}
                image={value}
                className="editor-canvas"
                width={200}
                height={200}
              />
            </div>
          );
        }}
      </Dropzone>
      <div className={classes.controls}>
        <Slider
          value={scale}
          min={1}
          max={3}
          step={0.01}
          onChange={(_, v) => setScale(v as number)}
          title={"Scale"}
        />
        <CheckCircle className={classes.save} onClick={handleSave} />
      </div>
    </div>
  );
};
