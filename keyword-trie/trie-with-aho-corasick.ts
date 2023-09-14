import { KeywordListWithoutWhiteSpace } from "./test-dataset-for-trie";

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
}

export class KeywordSearchMachine {
  private readonly rootNode: TrieNode;
  constructor() {
    this.rootNode = new TrieNode();
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

  private buildFailureLinks(): void {
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
