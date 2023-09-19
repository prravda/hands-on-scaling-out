import { Cluster } from "ioredis";
import { KeywordSearchMachine } from "./trie-with-aho-corasick";
import { KeywordListWithoutWhiteSpace } from "./test-dataset-for-trie";

// configure dragonfly replicas and connect them into a cluster
// using ioredis cluster feature
const dragonFlyCluster = new Cluster(
  [
    { host: "dragonfly-write", port: 6379 },
    { host: "dragonfly-read-only-0", port: 6380 },
    { host: "dragonfly-read-only-1", port: 6381 },
  ],
  {
    scaleReads: "slave",
    redisOptions: {
      password: "test-dragonfly",
    },
  }
);

// init search machine
const keywordSearchMachine = new KeywordSearchMachine();

// insert keyword
for (const keyword of KeywordListWithoutWhiteSpace) {
  keywordSearchMachine.insert(keyword);
}

// serialize
const serializedResult = JSON.stringify(keywordSearchMachine.toJSON());

async function testForReadAndWrite() {
  // save to a write-available node
  await dragonFlyCluster.set("keywords", serializedResult);

  // read from read-only nodes
  const resultFromReadOnly = await dragonFlyCluster.get("keywords");

  // null check
  if (resultFromReadOnly) {
    // deserialization
    const deserializedResult = KeywordSearchMachine.fromJSON(
      JSON.parse(resultFromReadOnly)
    );

    // detecting keyword from a string
    const detectedKeywords = deserializedResult.searchInSentence(
      "[ 회기농장쇼핑특가 ] 크록스 바야밴드 클로그 28,000 (컬쳐랜드 문상신공 적용시 20,000까지 가능)"
    );

    // showing the result
    console.log(`result: ${detectedKeywords}`);
  }
}

testForReadAndWrite().catch((e) => console.error(e));
