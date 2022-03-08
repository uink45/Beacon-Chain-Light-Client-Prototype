"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkedList = exports.findLastIndex = void 0;
/**
 * Return the last index in the array that matches the predicate
 */
function findLastIndex(array, predicate) {
    let i = array.length;
    while (i--) {
        if (predicate(array[i])) {
            return i;
        }
    }
    return -1;
}
exports.findLastIndex = findLastIndex;
/**
 * The node for LinkedList below
 */
class Node {
    constructor(data) {
        this.next = null;
        this.prev = null;
        this.data = data;
    }
}
/**
 * We want to use this if we only need push/pop/shift method
 * without random access.
 * The shift() method should be cheaper than regular array.
 */
class LinkedList {
    constructor() {
        this._length = 0;
        this.head = null;
        this.tail = null;
    }
    get length() {
        return this._length;
    }
    push(data) {
        if (this._length === 0) {
            this.tail = this.head = new Node(data);
            this._length++;
            return;
        }
        if (!this.head || !this.tail) {
            // should not happen
            throw Error("No head or tail");
        }
        const newTail = new Node(data);
        this.tail.next = newTail;
        newTail.prev = this.tail;
        this.tail = newTail;
        this._length++;
    }
    pop() {
        const oldTail = this.tail;
        if (!oldTail)
            return null;
        this._length = Math.max(0, this._length - 1);
        if (this._length === 0) {
            this.head = this.tail = null;
        }
        else {
            this.tail = oldTail.prev;
            if (this.tail)
                this.tail.next = null;
            oldTail.prev = oldTail.next = null;
        }
        return oldTail.data;
    }
    shift() {
        const oldHead = this.head;
        if (!oldHead)
            return null;
        this._length = Math.max(0, this._length - 1);
        if (this._length === 0) {
            this.head = this.tail = null;
        }
        else {
            this.head = oldHead.next;
            if (this.head)
                this.head.prev = null;
            oldHead.prev = oldHead.next = null;
        }
        return oldHead.data;
    }
    clear() {
        this.head = this.tail = null;
        this._length = 0;
    }
    toArray() {
        let node = this.head;
        if (!node)
            return [];
        const arr = [];
        while (node) {
            arr.push(node.data);
            node = node.next;
        }
        return arr;
    }
    map(fn) {
        let node = this.head;
        if (!node)
            return [];
        const arr = [];
        while (node) {
            arr.push(fn(node.data));
            node = node.next;
        }
        return arr;
    }
}
exports.LinkedList = LinkedList;
//# sourceMappingURL=array.js.map