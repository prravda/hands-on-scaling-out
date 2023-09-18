export class TrieNode {
  accessor children: Map<number, TrieNode>;
  accessor isLastWord: boolean;
  accessor failNodeId: number | null;
  accessor failNode: TrieNode | null;
  accessor output: string[];
  constructor() {
    this.children = new Map<number, TrieNode>();
    this.isLastWord = false;
    this.failNodeId = null;
    this.failNode = null;
    this.output = [];
  }

  public toJSON(): Record<string, any> {
    // set fail as null for avoiding too much recursive call
    // and buildFailureGraph again after de-serialization
    const jsonTrieNode: Record<string, any> = {
      isLastWord: this.isLastWord,
      children: {},
      failNodeId: this.failNodeId,
      failNode: null,
      output: this.output,
    };

    for (const [charCode, child] of this.children) {
      jsonTrieNode.children[charCode] = child.toJSON();
    }

    return jsonTrieNode;
  }

  public toJSONIteratively(): Record<string, any> {
    // iterative version of toJSON method
    // for avoiding exceeding the maximum call stack
    const jsonTrieNode: Record<string, any> = {
      isLastWord: this.isLastWord,
      children: {},
      fail: this.failNodeId,
      output: this.output,
    };

    const stack: {
      node: TrieNode;
      jsonTrieNode: Record<string, any>;
    }[] = [{ node: this, jsonTrieNode }];

    while (stack.length > 0) {
      const { node, jsonTrieNode } = stack.pop()!;
      for (const [charCode, child] of node.children) {
        const childJSONTrieNode: Record<string, any> = {
          isLastWord: child.isLastWord,
          children: {},
          fail: child.failNodeId,
          output: child.output,
        };
        jsonTrieNode.children[charCode] = childJSONTrieNode;
        stack.push({ node: child, jsonTrieNode: childJSONTrieNode });
      }
    }

    return jsonTrieNode;
  }
}

export class KeywordSearchMachine {
  private readonly rootNode: TrieNode;
  constructor() {
    this.rootNode = new TrieNode();
  }
  public toJSON(): Record<string, any> {
    return this.rootNode.toJSON();
  }

  public toJSONIteratively(): Record<string, any> {
    return this.rootNode.toJSONIteratively();
  }

  public static fromJSON(jsonData: Record<string, any>): KeywordSearchMachine {
    const trie = new KeywordSearchMachine();
    trie.rootNode.children = new Map<number, TrieNode>();

    // storing trie into the Map object for restoring failure link
    const nodesMap = new Map<number, TrieNode>();

    const buildTrieFromJSON = (
      trieNodeData: Record<string, any>,
      trieNode: TrieNode
    ) => {
      trieNode.isLastWord = trieNodeData.isLastWord;
      trieNode.output = trieNodeData.output;
      trieNode.failNodeId = trieNodeData.failNodeId;

      trieNode.failNode =
        trieNode.failNodeId !== null
          ? nodesMap.get(trieNode.failNodeId) || null
          : null;

      for (const charCode in trieNodeData.children) {
        const childData = trieNodeData.children[charCode];
        const childTrieNode = new TrieNode();

        trieNode.children.set(Number(charCode), childTrieNode);
        nodesMap.set(Number(charCode), childTrieNode);

        buildTrieFromJSON(childData, childTrieNode);
      }
    };

    buildTrieFromJSON(jsonData, trie.rootNode);
    return trie;
  }

  public static fromJSONIteratively(
    jsonData: Record<string, any>
  ): KeywordSearchMachine {
    const trie = new KeywordSearchMachine();
    trie.rootNode.children = new Map<number, TrieNode>();

    const stack: { node: TrieNode; trieNodeData: Record<string, any> }[] = [
      { node: trie.rootNode, trieNodeData: jsonData },
    ];

    while (stack.length > 0) {
      const { node, trieNodeData } = stack.pop()!;
      node.isLastWord = trieNodeData.isLastWord;
      node.output = trieNodeData.output;
      node.failNodeId = trieNodeData.fail;

      for (const charCode in trieNodeData.children) {
        const childData = trieNodeData.children[charCode];
        const childTrieNode = new TrieNode();
        node.children.set(Number(charCode), childTrieNode);

        stack.push({ node: childTrieNode, trieNodeData: childData });
      }
    }

    trie.buildFailureLinks();
    return trie;
  }

  private charToIndex(character: string): number {
    return character.charCodeAt(0);
  }

  public insert(keyword: string): void {
    let currentRoot = this.rootNode;
    for (const character of keyword) {
      const indexOfCharacter = this.charToIndex(character);

      if (!currentRoot.children.has(indexOfCharacter)) {
        currentRoot.children.set(indexOfCharacter, new TrieNode());
      }
      currentRoot = currentRoot.children.get(indexOfCharacter)!;
    }
    currentRoot.isLastWord = true;
    currentRoot.output.push(keyword);

    // build failure graph
    this.buildFailureGraph();
  }

  private assignUniqueIds(): void {
    let idCounter = 0;
    const stack: TrieNode[] = [this.rootNode];

    while (stack.length > 0) {
      const node = stack.pop()!;
      node.failNodeId = idCounter++;
      for (const child of node.children.values()) {
        stack.push(child);
      }
    }
  }

  private buildFailureLinks(): void {
    const queue: TrieNode[] = [];
    this.rootNode.failNodeId = null;

    for (const child of this.rootNode.children.values()) {
      child.failNode = this.rootNode;
      queue.push(child);
    }

    while (queue.length > 0) {
      const node = queue.shift()!;

      for (const [charCode, child] of node.children) {
        let failure = node.failNode;

        while (failure !== null && !failure.children.has(charCode)) {
          failure = failure.failNode!;
        }

        child.failNode = failure?.children.get(charCode) || this.rootNode;

        child.output = [...child.output, ...child.failNode.output];

        queue.push(child);
      }
    }
  }

  private buildFailureGraph() {
    this.assignUniqueIds();
    this.buildFailureLinks();
  }

  public searchInSentence(sentence: string): string[] {
    const keywordsFound: string[] = [];
    let currentRoot = this.rootNode;

    for (const character of sentence) {
      const indexOfCharacter = this.charToIndex(character);

      while (
        !currentRoot.children.has(indexOfCharacter) &&
        currentRoot !== this.rootNode
      ) {
        currentRoot = currentRoot.failNode!;
      }

      currentRoot = currentRoot.children.get(indexOfCharacter) || this.rootNode;

      for (const keyword of currentRoot.output) {
        keywordsFound.push(keyword);
      }
    }

    return keywordsFound;
  }
}
