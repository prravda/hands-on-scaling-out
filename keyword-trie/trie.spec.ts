import { KeywordSearchMachine } from "./trie-with-aho-corasick";
import {
  ExampleTitleAndExpectedKeywordList,
  KeywordListForTesting,
  KeywordListWithoutWhiteSpace,
  KeywordListWithWhiteSpace,
} from "./test-dataset-for-trie";

describe("testing for trie, simply finding keyword exist or not in trie", () => {
  let keywordSearchMachine: KeywordSearchMachine;

  beforeEach(() => {
    keywordSearchMachine = new KeywordSearchMachine();
    // inserting keywords
    for (const word of [
      ...KeywordListWithoutWhiteSpace,
      ...KeywordListWithWhiteSpace,
    ]) {
      keywordSearchMachine.insert(word);
    }
  });

  it("should return true for the result of finding exist keywords", () => {
    const { EXIST } = KeywordListForTesting;
    for (const existKeyword of EXIST) {
      expect(keywordSearchMachine.searchKeyword(existKeyword)).toBe(true);
    }
  });

  it("should return false for the result of finding exist keywords", () => {
    const { NOT_EXIST } = KeywordListForTesting;
    for (const existKeyword of NOT_EXIST) {
      expect(keywordSearchMachine.searchKeyword(existKeyword)).toBe(false);
    }
  });
});

describe("testing for trie and aho-corasick pattern matching searching", () => {
  let keywordSearchMachine: KeywordSearchMachine;

  beforeEach(() => {
    keywordSearchMachine = new KeywordSearchMachine();
    // inserting keywords
    for (const word of [
      ...KeywordListWithoutWhiteSpace,
      ...KeywordListWithWhiteSpace,
    ]) {
      keywordSearchMachine.insert(word);
    }
  });

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
  let keywordSearchMachineInstance: KeywordSearchMachine;

  beforeEach(() => {
    keywordSearchMachineInstance = new KeywordSearchMachine();
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
    expect(() =>
      KeywordSearchMachine.fromJSON(serializedResult)
    ).not.toThrowError();
    const parsedResult = KeywordSearchMachine.fromJSON(serializedResult);
    expect(parsedResult).toBeInstanceOf(KeywordSearchMachine);
  });

  it("should works well when find keywords from a string", () => {
    const serializedResult = keywordSearchMachineInstance.toJSON();
    const parsedResult = KeywordSearchMachine.fromJSON(serializedResult);

    const { title, expectedKeywordList } =
      ExampleTitleAndExpectedKeywordList[0];
    const result = parsedResult.searchInSentence(title);
    expect(result.sort()).toEqual(expectedKeywordList.sort());
  });
});

describe("testing for trie serialization / de-serialization in iterative way", () => {
  let keywordSearchMachineInstance: KeywordSearchMachine;

  beforeEach(() => {
    keywordSearchMachineInstance = new KeywordSearchMachine();
    // insert keywords into trie
    for (const word of [
      ...KeywordListWithoutWhiteSpace,
      ...KeywordListWithWhiteSpace,
    ]) {
      keywordSearchMachineInstance.insert(word);
    }
  });

  it("should be serialized to JSON", () => {
    const serializedResult = keywordSearchMachineInstance.toJSONIteratively();
    expect(serializedResult).toBeInstanceOf(Object);
  });

  it("should be parsed into KeywordSearchMachine instance from serialized result", () => {
    const serializedResult = keywordSearchMachineInstance.toJSONIteratively();
    expect(() =>
      KeywordSearchMachine.fromJSONIteratively(serializedResult)
    ).not.toThrowError();
    const parsedResult =
      KeywordSearchMachine.fromJSONIteratively(serializedResult);
    expect(parsedResult).toBeInstanceOf(KeywordSearchMachine);
  });

  it("should works well when find keywords from a string", () => {
    const serializedResult = keywordSearchMachineInstance.toJSONIteratively();
    const parsedResult =
      KeywordSearchMachine.fromJSONIteratively(serializedResult);

    const { title, expectedKeywordList } =
      ExampleTitleAndExpectedKeywordList[0];
    const result = parsedResult.searchInSentence(title);
    expect(result.sort()).toEqual(expectedKeywordList.sort());
  });
});

describe("testing for trie serialization / de-serialization using trampoline", () => {
  let keywordSearchMachineInstance: KeywordSearchMachine;
  beforeEach(() => {
    keywordSearchMachineInstance = new KeywordSearchMachine();
    // insert keywords into trie
    for (const word of [
      ...KeywordListWithoutWhiteSpace,
      ...KeywordListWithWhiteSpace,
    ]) {
      keywordSearchMachineInstance.insert(word);
    }
  });

  it("should be serialized to JSON", () => {
    const serializedResult = keywordSearchMachineInstance.toJSONRecursively();
    expect(serializedResult).toBeInstanceOf(Object);
  });

  it("should be parsed into KeywordSearchMachine instance from serialized result", () => {
    const serializedResult = keywordSearchMachineInstance.toJSONRecursively();
    expect(() =>
      KeywordSearchMachine.fromJSONRecursively(serializedResult)
    ).not.toThrowError();
    const parsedResult =
      KeywordSearchMachine.fromJSONRecursively(serializedResult);
    expect(parsedResult).toBeInstanceOf(KeywordSearchMachine);
  });

  it("should works well when find keywords from a string", () => {
    const serializedResult = keywordSearchMachineInstance.toJSONRecursively();
    const parsedResult =
      KeywordSearchMachine.fromJSONRecursively(serializedResult);

    const { title, expectedKeywordList } =
      ExampleTitleAndExpectedKeywordList[0];
    const result = parsedResult.searchInSentence(title);
    expect(result.sort()).toEqual(expectedKeywordList.sort());
  });
});
