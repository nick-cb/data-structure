class Node {
  /** @type {Array<InternalNode>} internalNodes */
  internalNodes;
  /** @type {Object.<string, Node> | Object.<number, Node>} children */
  children;
  constructor(internalNodes, children) {
    this.internalNodes = internalNodes;
    this.children = children;
  }
}

class InternalNode {
  key;
  value;

  constructor(key, value) {
    this.key = key;
    this.value = value;
  }
}

class BTree {
  numberOfKey = 4;
  mid = this.numberOfKey / 2;
  /** @type Node */
  root = new Node(new Array(), {});

  constructor(numberOfChild = 4) {
    this.numberOfKey = numberOfChild;
  }

  insert(value) {
    this.#insert(this.root, new InternalNode(value, value));
  }

  /**
   * @param {Node} parentNode
   * @param {InternalNode | Node} node
   */
  #insert(parentNode, node) {
    let originalNode = node;
    if (node instanceof Node) {
      node = node.internalNodes[0];
    }
    const key = this.getChildKey(parentNode, node);
    if (!parentNode.children[key]) {
      parentNode.internalNodes.push(node);
      parentNode.internalNodes.sort((a, b) => a.key - b.key);
      if (originalNode && originalNode instanceof Node) {
        for (const key in originalNode.children) {
          parentNode.children[key] = originalNode.children[key];
        }
      }
      if (parentNode.internalNodes.length <= this.numberOfKey) {
        return;
      }

      const newNode = new Node([], {});
      const lessThanNode = new Node([], {});
      const greaterThanNode = new Node([], {});
      const midNode = parentNode.internalNodes[this.mid];
      for (const internalNode of parentNode.internalNodes) {
        if (internalNode.key < midNode.key) {
          lessThanNode.internalNodes.push(internalNode);
          lessThanNode.children[internalNode.key] =
            parentNode.children[internalNode.key];
        }
        if (
          internalNode.key === midNode.key &&
          parentNode.children[midNode.key]
        ) {
          lessThanNode.children["last"] = parentNode.children[midNode.key];
        }

        if (internalNode.key > midNode.key) {
          greaterThanNode.internalNodes.push(internalNode);
        }
        if (internalNode.key > midNode.key || internalNode.key === "last") {
          greaterThanNode.children[internalNode.key] =
            parentNode.children[internalNode.key];
        }
      }
      if (parentNode.children["last"]) {
        greaterThanNode.children["last"] = parentNode.children["last"];
      }
      newNode.internalNodes.push(midNode);
      if (parentNode === this.root) {
        // console.log({midNode, newNode})
        newNode.children[midNode.key] = lessThanNode;
        newNode.children["last"] = greaterThanNode;
        this.root = newNode;
        return;
      }

      return [newNode, lessThanNode, greaterThanNode];
    }

    const result = this.#insert(parentNode.children[key], node);
    if (!result || result.length === 0) {
      return;
    }

    result[0].children[result[0].internalNodes[0].key] = result[1];
    result[0].children[key] = result[2];

    delete parentNode.children[key];
    return this.#insert(parentNode, result[0]);
  }

  /**
   * @param {Node} parentNode
   * @param {InternalNode} node
   * @returns {Node} node
   */
  getChildKey(parentNode, node) {
    for (let i = 0; i < parentNode.internalNodes.length; i++) {
      if (parentNode.internalNodes[i].key > node.key) {
        return parentNode.internalNodes[i].key;
      }
    }
    if (
      parentNode.children["last"] &&
      node.key > parentNode.internalNodes.at(-1).key
    ) {
      return "last";
    }

    return null;
  }

  /** @param {Node} node*/
  getNodeKeys(node) {
    return node.internalNodes.map((n) => n.key);
  }

  /** @param {Node} node*/
  getChildrenAsArray(node) {
    return Object.values(node.children);
  }

  /** @param {Node} node*/
  getChildrenValueAsArray(node) {
    return Object.values(node.children).map((n) => {
      return n.internalNodes.map((iN) => iN.value);
    });
  }
}

module.exports = BTree;
