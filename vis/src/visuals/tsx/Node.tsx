import React from 'react';
import '../styles/main.scss';
import {SkipListNode} from "../../skiplist/SkipListNode";
import {type} from '../../skiplist/SkipListNode';


interface nodeProps {
    node: SkipListNode | undefined;
    on_path: boolean;
    is_target: boolean;
    is_insertion: boolean;
    r: number;
    c: number;
    setDeleteKey: (k: number) => void;
}

function getColor(node: SkipListNode, on_path: boolean = false, is_target: boolean = false, is_insertion: boolean = false) {
    if (is_target) return `blue`;
    if (is_insertion) return `yellow`;
    if (on_path) return `purple`;
    switch (node.getType()) {
        case type.cap:
            return `red`;
        case type.node:
            return `transparent`
        case type.root:
            return `green`;
    }
}

function setText(node: SkipListNode) {
    switch (node.getType()) {
        case type.root:
            return `ROOT`;
        case type.node:
            return `K:${node.getKey()}\nV:${node.getValue()}`
        case type.cap:
            return `CAP`;
    }
}

function setNode(node: SkipListNode | undefined, r: number, c: number,
                 on_path: boolean, is_target: boolean, is_insertion: boolean,
                 setDeleteKey: (k:number) => void): (JSX.Element) {
    if (node === undefined) {
        return (
            <div id={`null-${r}-${c}`} className={"node-square"} style={{backgroundColor: `transparent`}}>
                <br className={"modified-b"}/>
                <p className={"node-square__text"}>===={'>'}</p>
            </div>
        )
    }
    return (
        <div id={`node-${node.getKey()}`}
             className={`node-square node-${r}-${c}`}
             style={{backgroundColor: getColor(node, on_path, is_target, is_insertion)}}>
            <p className={"node-square__text"}
               onClick={_ => {
                   // @ts-ignore
                   setDeleteKey(+node.getKey());
               }}
               onMouseOver={e => {
                   if (node.getType() === type.node) {
                       const target = e.target;
                       // @ts-ignore
                       target.style["backgroundColor"] = "#ddff99";
                   }
               }}
               onMouseOut={e => {
                   if (node.getType() === type.node) {
                       const target = e.target;
                       // @ts-ignore
                       target.style["backgroundColor"] = "transparent";
                   }
               }}
               style={{backgroundColor: "transparent"}}
            >{setText(node)}</p>
        </div>
    )
}

const Node = (props: nodeProps) => {
    return (
        setNode(props.node, props.r, props.c, props.on_path, props.is_target, props.is_insertion, props.setDeleteKey)
    )
}

export default Node;