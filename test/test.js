const { it, describe } = require("node:test");
const assert = require("node:assert");
const BTree = require("..");

describe("BTree test", () => {
  it("should split root node once full", () => {
    const tree = new BTree();
    tree.insert(2);
    tree.insert(4);
    tree.insert(7);
    tree.insert(9);
    assert.strictEqual(4, tree.getNodeKeys(tree.root).length);
    assert.deepStrictEqual([2, 4, 7, 9], tree.getNodeKeys(tree.root));
    assert.strictEqual(0, tree.getChildrenAsArray(tree.root).length);

    tree.insert(1);
    assert.strictEqual(1, tree.getNodeKeys(tree.root).length);
    assert.deepStrictEqual([4], tree.getNodeKeys(tree.root));
    assert.strictEqual(2, tree.getChildrenAsArray(tree.root).length);
    assert.deepStrictEqual(
      [
        [1, 2],
        [7, 9],
      ],
      tree.getChildrenValueAsArray(tree.root),
    );
  });

  it("should split child node once full", () => {
    const tree = new BTree();
    tree.insert(2);
    tree.insert(4);
    tree.insert(7);
    tree.insert(9);
    tree.insert(1);
    tree.insert(5);
    tree.insert(0);
    tree.insert(3);
    tree.insert(-1);

    assert.strictEqual(2, tree.getNodeKeys(tree.root).length);
    assert.deepStrictEqual([1, 4], tree.getNodeKeys(tree.root));
    assert.strictEqual(3, tree.getChildrenAsArray(tree.root).length);
    assert.deepStrictEqual(
      [
        [-1, 0],
        [2, 3],
        [5, 7, 9],
      ],
      tree.getChildrenValueAsArray(tree.root),
    );
  });
});
