import dynamic from "next/dynamic";

const RegexInput = dynamic(import("./RegexInput"), {
  ssr: false,
});

export default RegexInput;
