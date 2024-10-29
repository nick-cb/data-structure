const process = require("process");
const util = require("util");
// B-Tree
/* B-Tree order `m`:
 * - The root is either leaf or has at least 2 children
 * - Each internal node, except for the root, has between [m/2] and m children
* - All leaf are at the same level
 * Search a node
 * - Start from the root node
 * - Go though each element of the node and compare to the needed search value
 * - if (val < elements[0]) goToLeftMostPointer()
 * - if (val > elements[-1]) goToRightMostPointer()
 * - if (val >= elements[i] && val < elements[i+1]) goToPointer(elements[i])

 * Insert a node
 * - Start from the root node
 * - Find the position in which the node should be insert to the parent node
 * - If there is a child node at that position, try insert this new node to that child node
 * - If there is no child node at that position, insert new node to the that position
 * - If the length of the parent node > max children, split the children into 3 node
 * - Make the 2 new node childrent of the middle node
 * - If parent node is None -> make that middle node to be root node
 * - Else insert that middle node into parent node
 */

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
    // console.log(util.inspect({ result }, { colors: true, depth: 12 }));

    result[0].children[result[0].internalNodes[0].key] = result[1];
    result[0].children[key] = result[2];

    // result.children[key] = result.children['last']
    // delete result.children['last'];
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

// const btree = new BTree();
// console.log(btree);
// btree.insert(2);
// btree.insert(4);
// btree.insert(7);
// btree.insert(9);
// // console.log(btree);
// btree.insert(1);
// // console.log(util.inspect(btree, { colors: true, depth: 12 }));
// btree.insert(5);
// // console.log(util.inspect(btree, { colors: true, depth: 12 }));
// btree.insert(0);
// // console.log(util.inspect(btree, { colors: true, depth: 12 }));
// btree.insert(3);
// // console.log(util.inspect(btree, { colors: true, depth: 12 }));
// btree.insert(-1);
// btree.insert(10);
// btree.insert(11);
// btree.insert(12);
// btree.insert(13);
// btree.insert(14);
// btree.insert(15);
// btree.insert(16);
// btree.insert(17);
// btree.insert(18);
// btree.insert(19);
// btree.insert(20);
// console.log(util.inspect(btree, { colors: true, depth: 12 }));
