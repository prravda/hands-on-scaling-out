export class TrieNode {
  children: Map<number, TrieNode>;
  isLastWord: boolean;
  fail: TrieNode | null;
  output: string[];
  constructor() {
    this.children = new Map<number, TrieNode>();
    this.isLastWord = false;
    this.fail = null;
    this.output = [];
  }

  public toJSON(): Record<string, any> {
    const jsonTrieNode: Record<string, any> = {
      isLastWord: this.isLastWord,
      children: {},
      fail: this.fail,
      output: this.output,
    };

    for (const [charCode, child] of this.children) {
      jsonTrieNode.children[charCode] = child.toJSON();
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

  public static fromJSON(jsonData: Record<string, any>): KeywordSearchMachine {
    const trie = new KeywordSearchMachine();
    trie.rootNode.children = new Map<number, TrieNode>();

    const buildTrieFromJSON = (
      trieNodeData: Record<string, any>,
      trieNode: TrieNode
    ) => {
      trieNode.isLastWord = trieNodeData.isLastWord;
      trieNode.output = trieNodeData.output;
      trieNode.fail = trieNodeData.fail;

      for (const charCode in trieNodeData.children) {
        const childData = trieNodeData.children[charCode];
        const childTrieNode = new TrieNode();
        trieNode.children.set(Number(charCode), childTrieNode);

        buildTrieFromJSON(childData, childTrieNode);
      }
    };

    buildTrieFromJSON(jsonData, trie.rootNode);

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

    // build failure link
    this.buildFailureLinks();
  }

  public buildFailureLinks(): void {
    const queue: TrieNode[] = [];
    this.rootNode.fail = null;

    for (const child of this.rootNode.children.values()) {
      child.fail = this.rootNode;
      queue.push(child);
    }

    while (queue.length > 0) {
      const node = queue.shift()!;

      for (const [charCode, child] of node.children) {
        let failure = node.fail;

        while (failure !== null && !failure.children.has(charCode)) {
          failure = failure.fail!;
        }

        child.fail = failure?.children.get(charCode) || this.rootNode;

        child.output = [...child.output, ...child.fail.output];

        queue.push(child);
      }
    }
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
        currentRoot = currentRoot.fail!;
      }

      currentRoot = currentRoot.children.get(indexOfCharacter) || this.rootNode;

      for (const keyword of currentRoot.output) {
        keywordsFound.push(keyword);
      }
    }

    return keywordsFound;
  }
}
