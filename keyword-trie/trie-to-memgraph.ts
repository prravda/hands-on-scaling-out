import { auth, driver } from "neo4j-driver";

// Function to add a keyword to the Trie in Neo4j
async function addKeyword(keyword: string) {
  const memgraphDriver = driver(
    "bolt://localhost:7687",
    auth.basic("test", "testMemGraph")
  );
  const memgraphSession = memgraphDriver.session();
  const tx = memgraphSession.beginTransaction();
  try {
    // Iterate through the characters of the keyword
    for (let i = 0; i < keyword.length; i++) {
      const character = keyword[i];
      const nextCharacter = keyword[i + 1];

      // Create a node for the character
      await tx.run(
        "MERGE (c:Character {value: $value, isTerminal: $isTerminal})",
        { value: character, isTerminal: i === keyword.length - 1 }
      );

      // Create an edge to the next character
      if (nextCharacter) {
        await tx.run(
          "MATCH (c1:Character {value: $c1}), (c2:Character {value: $c2}) " +
            "MERGE (c1)-[:CONNECTED]->(c2)",
          { c1: character, c2: nextCharacter }
        );
      }
    }

    await tx.commit();
  } catch (e) {
    throw e;
  } finally {
    await memgraphSession.close();
  }
}

// Example usage to add a keyword
// addKeyword("dog")
//   .then(() => console.log('Keyword "dog" added successfully'))
//   .catch((error) => console.error(error));

// Function to search for keywords in a title using Aho-Corasick
async function searchKeywordsInTitle(title: string) {
  const memgraphDriver = driver(
    "bolt://localhost:7687",
    auth.basic("test", "testMemGraph")
  );
  const memgraphSession = memgraphDriver.session();
  const tx = memgraphSession.beginTransaction();
  const result = await tx.run(
    "MATCH (root:Character)-[:CONNECTED*]->(end:Character) " +
      'WHERE root.value = "" ' +
      "RETURN end.value"
  );

  const terminalNodes = result.records.map((record) => record.get("end.value"));
  const keywordMatches = [];

  for (const node of terminalNodes) {
    let currentNode = node;
    let currentIndex = 0;

    for (let i = 0; i < title.length; i++) {
      if (title[i] === currentNode[currentIndex]) {
        currentIndex++;
        if (currentIndex === currentNode.length) {
          keywordMatches.push(currentNode);
          break;
        }
      } else {
        currentNode = await tx.run(
          "MATCH (c1:Character {value: $c1})-[:CONNECTED]->(c2:Character) " +
            "RETURN c2.value",
          { c1: currentNode[currentIndex] }
        );
        currentIndex = 0;
        i--;
      }
    }
  }

  await tx.commit();
  return keywordMatches;
}

// Example usage to search for keywords in a title
// searchKeywordsInTitle("dog food for reasonable price!")
//   .then((matches) => console.log("Matches:", matches))
//   .catch((error) => console.error(error));

const keywordList = [
  "컬쳐랜드",
  "스틸북",
  "ps4",
  "ps5",
  "닌텐도",
  "컬렉터즈 에디션",
  "macbook pro",
  "imac",
  "ipad",
  "apple vision pro",
  "airpod",
  "크록스",
  "리튬",
  "리튬건전지",
  "문상",
  "CR123A",
  "cr123a",
  "외장 ssd",
  "삼겹살",
];

(async () => {
  await Promise.all(
    keywordList.map(async (keyword) => await addKeyword(keyword))
  );
})();
