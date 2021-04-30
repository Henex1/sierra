import dynamic from "next/dynamic";

const RegexInput = dynamic(import("./ExpressionEditor"), {
  ssr: false,
});

export default RegexInput;
