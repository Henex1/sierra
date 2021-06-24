import { fieldByPrefix, withoutPrefix } from "./utils";

describe("Testing 'fieldByPrefix' function", () => {
  test("match patten '[prefix]:[field]'", () => {
    const fields = ["title:my_title", "test:some_value"];
    const seed: [string, string][] = [
      ["title", "my_title"],
      ["test", "some_value"],
    ];

    seed.forEach(([prefix, field]) =>
      expect(fieldByPrefix(prefix, fields)).toBe(field)
    );
  });

  test("on '[prefix]' or '[prefix]:', return undefined", () => {
    const fields = ["title:", "test"];
    const prefixes = ["title", "test"];

    prefixes.forEach((prefix) =>
      expect(fieldByPrefix(prefix, fields)).toBe(undefined)
    );
  });
});

describe("Testing 'withoutPrefix' function", () => {
  test("return all string that do not start with 'title:', 'image:', 'url:'", () => {
    const seed = ["abc", "title:abc", "test:abc", "url:abc", "image:abc"];

    expect(withoutPrefix(seed)).toStrictEqual(["abc", "test:abc"]);
  });
});
