import { trampoline, TrampolineFunction } from "./trampoline";

export class TrieNode {
  children: Map<string, TrieNode>;
  isLastWord: boolean;
  fail: TrieNode | null;
  output: Set<string>;
  constructor() {
    this.children = new Map<string, TrieNode>();
    this.isLastWord = false;
    this.fail = null;
    this.output = new Set<string>();
  }

  private toJSONTrampoline(): TrampolineFunction<Record<string, any>> {
    const node = this;

    return function () {
      const jsonTrieNode: Record<string, any> = {
        isLastWord: node.isLastWord,
        children: {},
        fail: null,
        output: [...node.output],
      };

      for (const [charCode, child] of node.children) {
        jsonTrieNode.children[charCode] = child.toJSONTrampoline()();
      }

      return jsonTrieNode;
    };
  }

  public toJSONWithRecursively(): Record<string, any> {
    const trampolinedRecursiveToJSON = trampoline(this.toJSONTrampoline());
    return trampolinedRecursiveToJSON();
  }

  public toJSON(): Record<string, any> {
    const jsonTrieNode: Record<string, any> = {
      isLastWord: this.isLastWord,
      children: {},
      fail: null,
      output: [...this.output],
    };

    for (const [charCode, child] of this.children) {
      jsonTrieNode.children[charCode] = child.toJSON();
    }

    return jsonTrieNode;
  }

  public toJSONIteratively(): Record<string, any> {
    const jsonTrieNode: Record<string, any> = {
      isLastWord: this.isLastWord,
      children: {},
      fail: null,
      output: [...this.output],
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
          fail: child.fail,
          output: [...child.output],
        };
        jsonTrieNode.children[charCode] = childJSONTrieNode;
        stack.push({ node: child, jsonTrieNode: childJSONTrieNode });
      }
    }

    return jsonTrieNode;
  }
}

export class KeywordSearchMachine {
  rootNode: TrieNode;
  constructor(rootNode?: TrieNode) {
    this.rootNode = rootNode ? rootNode : new TrieNode();
  }
  public toJSON(): Record<string, any> {
    return this.rootNode.toJSON();
  }

  public toJSONIteratively(): Record<string, any> {
    return this.rootNode.toJSONIteratively();
  }

  public toJSONRecursively(): Record<string, any> {
    return this.rootNode.toJSONWithRecursively();
  }

  public static fromJSON(jsonData: Record<string, any>): KeywordSearchMachine {
    const trie = new KeywordSearchMachine();
    trie.rootNode.children = new Map<string, TrieNode>();

    const buildTrieFromJSON = (
      trieNodeData: Record<string, any>,
      trieNode: TrieNode
    ) => {
      trieNode.isLastWord = trieNodeData.isLastWord;
      trieNode.output = new Set(trieNodeData.output);
      trieNode.fail = trieNodeData.fail;

      for (const charCode in trieNodeData.children) {
        const childData = trieNodeData.children[charCode];
        const childTrieNode = new TrieNode();
        trieNode.children.set(charCode, childTrieNode);

        buildTrieFromJSON(childData, childTrieNode);
      }
    };

    buildTrieFromJSON(jsonData, trie.rootNode);
    return trie;
  }

  public static fromJSONRecursively(jsonData: Record<string, any>) {
    const rootNode = new TrieNode();

    const buildTrieFromJSONTrampoline = (
      trieNodeData: Record<string, any>,
      trieNode: TrieNode
    ) => {
      return function () {
        trieNode.isLastWord = trieNodeData.isLastWord;
        trieNode.output = new Set(trieNodeData.output);
        trieNode.fail = trieNodeData.fail;

        for (const charCode in trieNodeData.children) {
          const childData = trieNodeData.children[charCode];
          const childTrieNode = new TrieNode();
          trieNode.children.set(charCode, childTrieNode);

          buildTrieFromJSONTrampoline(childData, childTrieNode)();
        }
      };
    };

    const trampolinedBuildTrieFromJSON = trampoline(
      buildTrieFromJSONTrampoline(jsonData, rootNode)
    );
    trampolinedBuildTrieFromJSON();

    return new KeywordSearchMachine(rootNode);
  }

  public static fromJSONIteratively(
    jsonData: Record<string, any>
  ): KeywordSearchMachine {
    const trie = new KeywordSearchMachine();
    trie.rootNode.children = new Map<string, TrieNode>();

    const stack: { node: TrieNode; trieNodeData: Record<string, any> }[] = [
      { node: trie.rootNode, trieNodeData: jsonData },
    ];

    while (stack.length > 0) {
      const { node, trieNodeData } = stack.pop()!;
      node.isLastWord = trieNodeData.isLastWord;
      node.output = new Set(trieNodeData.output);
      node.fail = trieNodeData.fail;

      for (const charCode in trieNodeData.children) {
        const childData = trieNodeData.children[charCode];
        const childTrieNode = new TrieNode();
        node.children.set(charCode, childTrieNode);

        stack.push({ node: childTrieNode, trieNodeData: childData });
      }
    }

    return trie;
  }

  private charToIndex(character: string): string {
    return String(character.charCodeAt(0));
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
    currentRoot.output.add(keyword);
  }

  public delete(keyword: string) {
    let currentRoot = this.rootNode;
    const parentStack: TrieNode[] = [];

    for (const character of keyword) {
      const indexOfCharacter = this.charToIndex(character);

      if (!currentRoot.children.has(indexOfCharacter)) {
        return;
      }

      parentStack.push(currentRoot);
      currentRoot = currentRoot.children.get(indexOfCharacter)!;
    }

    if (!currentRoot.isLastWord) {
      return;
    }

    currentRoot.isLastWord = false;

    while (parentStack.length > 0) {
      const parentNodeOfNodeToDelete = parentStack.pop()!;
      const charCodeToRemove = this.charToIndex(keyword[parentStack.length]);

      if (
        parentNodeOfNodeToDelete.children.size === 1 &&
        !parentNodeOfNodeToDelete.children.get(charCodeToRemove)!.isLastWord
      ) {
        parentNodeOfNodeToDelete.children.delete(charCodeToRemove);
      } else {
        break;
      }
    }
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

        // child.output = [...child.output, ...child.fail.output];
        child.fail.output.forEach(child.output.add, child.output);

        queue.push(child);
      }
    }
  }

  public searchKeyword(keyword: string): boolean {
    let currentNode = this.rootNode;

    for (const character of keyword) {
      const indexOfCharacter = this.charToIndex(character);
      const nextNode = currentNode.children.get(indexOfCharacter);

      if (!nextNode) {
        return false;
      }

      currentNode = nextNode;
    }

    return currentNode.isLastWord;
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
      currentRoot.output.forEach((value) => keywordsFound.push(value));
    }

    return keywordsFound;
  }
}
