import { KeywordSearchMachine } from "./trie-with-aho-corasick";
import {
  ExampleTitleAndExpectedKeywordList,
  KeywordListWithoutWhiteSpace,
  KeywordListWithWhiteSpace,
} from "./test-dataset-for-trie";

describe("testing for trie and aho-corasick pattern matching searching", () => {
  const keywordSearchMachine = new KeywordSearchMachine();

  // inserting keywords
  for (const word of [
    ...KeywordListWithoutWhiteSpace,
    ...KeywordListWithWhiteSpace,
  ]) {
    keywordSearchMachine.insert(word);
  }

  it("[ case 0 ] should find all matched keywords as a list", () => {
    const { title, expectedKeywordList } =
      ExampleTitleAndExpectedKeywordList[0];
    const result = keywordSearchMachine.searchInSentence(title);
    expect(result.sort()).toEqual(expectedKeywordList.sort());
  });

  it("[ case 1 ] should find all matched keywords as a list", () => {
    const { title, expectedKeywordList } =
      ExampleTitleAndExpectedKeywordList[1];
    const result = keywordSearchMachine.searchInSentence(title);
    expect(result.sort()).toEqual(expectedKeywordList.sort());
  });

  it("[ case 2 ] should find all matched keywords as a list", () => {
    const { title, expectedKeywordList } =
      ExampleTitleAndExpectedKeywordList[2];
    const result = keywordSearchMachine.searchInSentence(title);
    expect(result.sort()).toEqual(expectedKeywordList.sort());
  });

  it("[ case 2 ] should find all matched keywords as a list", () => {
    const { title, expectedKeywordList } =
      ExampleTitleAndExpectedKeywordList[2];
    const result = keywordSearchMachine.searchInSentence(title);
    expect(result.sort()).toEqual(expectedKeywordList.sort());
  });

  it("[ case 3 ] should find all matched keywords as a list", () => {
    const { title, expectedKeywordList } =
      ExampleTitleAndExpectedKeywordList[3];
    const result = keywordSearchMachine.searchInSentence(title);
    expect(result.sort()).toEqual(expectedKeywordList.sort());
  });
});

describe("testing for trie serialization / de-serialization", () => {
  const keywordSearchMachineInstance = new KeywordSearchMachine();
  beforeAll(() => {
    // insert keywords into trie
    for (const word of [
      ...KeywordListWithoutWhiteSpace,
      ...KeywordListWithWhiteSpace,
    ]) {
      keywordSearchMachineInstance.insert(word);
    }
  });

  it("should be serialized to JSON", () => {
    const serializedResult = keywordSearchMachineInstance.toJSON();
    expect(serializedResult).toBeInstanceOf(Object);
  });

  it("should be parsed into KeywordSearchMachine instance from serialized result", () => {
    const serializedResult = keywordSearchMachineInstance.toJSON();
    const parsedResult = KeywordSearchMachine.fromJSON(serializedResult);

    expect(parsedResult).toBeInstanceOf(KeywordSearchMachine);
    expect(parsedResult).toStrictEqual(keywordSearchMachineInstance);
  });

  it("should works well when find keywords from a string", () => {
    const serializedResult = keywordSearchMachineInstance.toJSON();
    const parsedResult = KeywordSearchMachine.fromJSON(serializedResult);

    const { title, expectedKeywordList } =
      ExampleTitleAndExpectedKeywordList[0];
    // TODO: compare how `searchInSentence` running inside parsedResult and keywordSearchMachineInstance
    // Currently the parsedResult.searchInSentence(title) throw an Error
    const result = parsedResult.searchInSentence(title);
    expect(result.sort()).toEqual(expectedKeywordList.sort());
  });
});
