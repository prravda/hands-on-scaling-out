import { Trie } from "./trie";

describe("test: trie search", () => {
  let trieStructure: Trie;
  beforeEach(() => {
    trieStructure = new Trie();
  });

  it("should be defined", () => {
    expect(trieStructure).toBeDefined();
  });

  it("should insert keyword and find it", () => {
    const keywordToAdd = ["SSD", "SSH", "BHC", "BBQ"];
    keywordToAdd.forEach((keyword) => trieStructure.insert(keyword));

    expect(trieStructure.search(keywordToAdd[0])).toBe(true);
  });

  it("should insert keyword but can not find not inserted keyword", () => {
    const keywordToAdd = ["SSD", "SSH", "BHC", "BBQ"];
    keywordToAdd.forEach((keyword) => trieStructure.insert(keyword));

    const notInsertedKeyword = "BBC";

    expect(trieStructure.search(notInsertedKeyword)).toBe(false);
  });
});
