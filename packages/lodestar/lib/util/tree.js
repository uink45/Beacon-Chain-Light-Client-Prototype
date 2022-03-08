"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTreeAtIndex = void 0;
function getTreeAtIndex(tree, index) {
    const newTree = tree.clone();
    let maxIndex = newTree.length - 1;
    if (index > maxIndex) {
        throw new Error(`Cannot get tree for index: ${index}, maxIndex: ${maxIndex}`);
    }
    while (maxIndex > index) {
        newTree.pop();
        maxIndex = newTree.length - 1;
    }
    return newTree;
}
exports.getTreeAtIndex = getTreeAtIndex;
//# sourceMappingURL=tree.js.map