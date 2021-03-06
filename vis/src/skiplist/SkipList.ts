import {SkipListNode} from "./SkipListNode";
import {SkipListC} from "./SkipListC";

export interface SkipList{ // interface for skiplist
    get(key: number): GetMethodResult;
    delete(key: number): DeleteMethodResult;
    insert(key: number, val: number, biased: boolean): InsertMethodResult;
    toString():string;
    isEmpty():boolean;
    size():number;
}

export interface GetMethodResult{ // special type of response for get method
    val: number | null;
    animations:animationJson[];
}

export interface SearchMethodResult{ // special type of response for search method
    element: SkipListNode | null;
    animations:animationJson[];
}

export interface InsertMethodResult{
    animations:animationJson[];
}

export interface DeleteMethodResult{
    val: number | null;
    animations:animationJson[];
}

export interface animationJson{ // special structure for animation
    c1: SkipListNode | null;
    c2: SkipListNode | null;
    c3: SkipListNode | null;
    row: number | null;
    newNodeLevel: number | null;
    slState: SkipListC;
    deletion?: boolean;
}