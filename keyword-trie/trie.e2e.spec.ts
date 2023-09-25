import "dotenv/config";
import { Cluster } from "ioredis";
import { KeywordSearchMachine } from "./trie";
import {
  ExampleTitleAndExpectedKeywordList,
  KeywordListWithoutWhiteSpace,
  KeywordListWithWhiteSpace,
} from "./test-dataset-for-trie";

describe("keyword search machine - e2e scenario test", () => {
  let cluster: Cluster;
  let password: string;
  let instance: KeywordSearchMachine;
  let words: string[];

  // from about 5,000 word pool from National Institute of the Korean Language
  // beforeAll(async () => {
  //   const data = await readFile("./refined-korean-words.txt", "utf-8");
  //   words = [...new Set(data.split(/\r?\n/))];
  // });

  // from my custom keyword pool for testing
  beforeAll(() => {
    words = [...KeywordListWithoutWhiteSpace, ...KeywordListWithWhiteSpace];
  });

  beforeEach(() => {
    // fill the .env REDIS_PASSWORD variable
    password = process.env.REDIS_PASSWORD!;
    // configure dragonfly replicas and connect them into a cluster
    cluster = new Cluster(
      [
        { host: "localhost", port: 6382 }, // write
        { host: "localhost", port: 6383 }, // read-only
      ],
      {
        scaleReads: "slave",
        redisOptions: {
          password,
        },
      }
    );
    instance = new KeywordSearchMachine();
  });

  it("should be able to read and write", async () => {
    const result = await cluster.ping();
    expect(result).toEqual("PONG");
  });

  it("step 1. insert keywords", async () => {
    // check my custom keyword does not exist into the mock keyword pool
    expect(words).not.toContain("비비고");
    words.forEach((word) => instance.insert(word));
    expect(instance.searchKeyword(words[0])).toEqual(true);
  });

  it("step 2. serialize and put into the kv storage", async () => {
    words.forEach((word) => instance.insert(word));
    const serializedResult = JSON.stringify(instance.toJSON());
    await cluster.set("keywords", serializedResult);
    const resultSuccessfullyInserted = await cluster.exists("keywords");

    expect(resultSuccessfullyInserted).toEqual(1);
  });

  it("step 3. read from read-only nodes and de-serialize it", async () => {
    const resultFromReadOnly = await cluster.get("keywords");
    if (resultFromReadOnly) {
      const deserializedResult = KeywordSearchMachine.fromJSON(
        JSON.parse(resultFromReadOnly)
      );

      expect(deserializedResult.searchKeyword(words[0])).toEqual(true);
    }
  });

  it("step 4. retrieve, de-serialize, insert keyword, and save after serialization", async () => {
    const serializedFirst = await cluster.get("keywords");

    if (!serializedFirst) {
      throw new Error("resultFromReadOnly is null");
    }

    const deserializedResult = KeywordSearchMachine.fromJSON(
      JSON.parse(serializedFirst)
    );
    deserializedResult.insert("비비고");

    const serializedAgain = JSON.stringify(deserializedResult.toJSON());

    await cluster.set("keywords", serializedAgain);

    // for checking, read to master node directly
    const reSerializedDataFromKvStorage = await cluster
      .nodes("master")[0]
      .get("keywords");

    if (!reSerializedDataFromKvStorage) {
      throw new Error("reSerializedDataFromKvStorage is null");
    }

    expect(reSerializedDataFromKvStorage).not.toEqual(serializedFirst);
  });

  it("step 5. retrieve, de-serialize, and find keywords using aho-corasick", async () => {
    const serialized = await cluster.get("keywords");

    if (!serialized) {
      throw new Error("resultFromReadOnly is null");
    }

    const deserializedResult = KeywordSearchMachine.fromJSON(
      JSON.parse(serialized)
    );
    deserializedResult.buildFailureLinks();

    const detectedKeywords =
      deserializedResult.searchInSentence("비비고 만두는 맛있습니다.");

    expect(detectedKeywords).toContain("비비고");
  });

  it("step 5. retrieve, de-serialize, and find keywords using aho-corasick (2)", async () => {
    const serialized = await cluster.get("keywords");

    if (!serialized) {
      throw new Error("resultFromReadOnly is null");
    }

    const deserializedResult = KeywordSearchMachine.fromJSON(
      JSON.parse(serialized)
    );
    deserializedResult.buildFailureLinks();

    for (const eachTestSuit of ExampleTitleAndExpectedKeywordList) {
      const { title, expectedKeywordList } = eachTestSuit;
      const detectedKeywords = deserializedResult.searchInSentence(title);

      expect(detectedKeywords.sort()).toEqual(expectedKeywordList.sort());
    }
  });
});
