import { KeywordSearchMachine } from "./trie";
import { readFile } from "node:fs/promises";

describe("performance testing for trie", () => {
  let instance = new KeywordSearchMachine();

  beforeAll(async () => {
    const data = await readFile("./refined-korean-words.txt", "utf-8");
    const words = [...new Set(data.split(/\r?\n/))];
    words.forEach((word) => instance.insert(word));
    console.log(`the number of words in trie: ${words.length}`);
  });

  it("should also works well after serialization / de-serialization", () => {
    const serialized = JSON.stringify(instance.toJSON());
    const deSerialized = KeywordSearchMachine.fromJSON(JSON.parse(serialized));

    deSerialized.insert("나랑드");
    deSerialized.insert("사이다");
    deSerialized.buildFailureLinks();

    const result = deSerialized.searchInSentence("나랑드 사이다 한 잔 하세요!");
    console.log(result);
  });
});
