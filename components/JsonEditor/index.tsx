import dynamic from "next/dynamic";

const JsonEditor = dynamic(import("./JsonEditor"), {
  ssr: false,
});

export default JsonEditor;
