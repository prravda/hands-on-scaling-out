import { auth, driver } from "neo4j-driver";

async function bootstrap() {
  const memgraphDriver = driver(
    "bolt://localhost:7687",
    auth.basic("test", "testMemGraph")
  );
  const memgraphSession = memgraphDriver.session();

  const queryForTesting = {
    returnAll: `MATCH (node) RETURN node;`,
    getAllNodeAndEdgeWithRelation: `MATCH (p:Person)-[r1]-(sg:SubGroup)-[r2]-(mg:MainGroup) return p.name AS PERSON_NAME, r1 as REL_ONE, sg.name as SUB_GROUP_NAME, r2 as REL_TWO, mg.name AS MAIN_GROUP_NAME;`,
    getAllNodeFromBusinessSubGroup: `MATCH (p:Person)-[r]->(sg:SubGroup) WHERE sg.name="미래관" RETURN p.name as personName`,
  };

  try {
    const { records } = await memgraphSession.run(
      queryForTesting.getAllNodeFromBusinessSubGroup
    );
    return records.map((record) => record.get("personName"));
  } catch (e) {
    throw e;
  } finally {
    await memgraphDriver.close();
  }
}

bootstrap()
  .then((res) => console.log(res))
  .catch((e) => console.error(e));
