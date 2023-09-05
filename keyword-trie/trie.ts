export class TrieNode {
  accessor children: Map<number, TrieNode>;
  accessor isLastWord: boolean;
  accessor nextWord: string | null;
  constructor() {
    this.children = new Map<number, TrieNode>();
    this.isLastWord = false;
    this.nextWord = null;
  }
}

export class Trie {
  private readonly rootNode: TrieNode;
  constructor() {
    this.rootNode = new TrieNode();
  }

  private getNode(): TrieNode {
    return new TrieNode();
  }

  private charToIndex(character: string): number {
    return character.charCodeAt(0);
  }

  public insert(keyword: string): void {
    let currentRoot = this.rootNode;
    for (const character of keyword) {
      const indexOfCharacter = this.charToIndex(character);

      if (!currentRoot.children.get(indexOfCharacter)) {
        currentRoot.children.set(indexOfCharacter, this.getNode());
      }
      currentRoot = currentRoot.children.get(indexOfCharacter)!;
    }
    currentRoot.isLastWord = true;
  }

  public search(title: string): boolean {
    let currentRoot = this.rootNode;
    for (const character of title) {
      const indexOfCharacter = this.charToIndex(character);
      if (!currentRoot.children.get(indexOfCharacter)) {
        return false;
      }
      currentRoot = currentRoot.children.get(indexOfCharacter)!;
    }
    return currentRoot.isLastWord;
  }
}
