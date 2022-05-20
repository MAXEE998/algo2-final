import React from 'react';
import '../styles/main.scss';
import {SkipListNode, type} from "../../skiplist/SkipListNode";


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
    if (is_target) return `rgba(0, 0, 255, 0.7)`;
    if (is_insertion) return `rgba(255, 255, 0, 0.7)`;
    if (on_path) return `rgba(128, 0, 128, 0.7)`;
    switch (node.getType()) {
        case type.cap:
            return `rgba(255, 0, 0, 0.7)`;
        case type.node:
            return `transparent`
        case type.root:
            return `rgba(0, 255, 0, 0.7)`;
    }
}

function setText(node: SkipListNode) {
    switch (node.getType()) {
        case type.root:
            return `ROOT`;
        case type.node:
            return `${node.getKey()}` ;
            //`K:${node.getKey()}\nV:${node.getValue()}`
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
                <p className={"node-square__text"}>=={'>'}</p>
            </div>
        )
    }
    return (
        <div id={`node-${node.getKey()}`}
             className={`node-square node-${r}-${c}`}
             style={{backgroundColor: getColor(node, on_path, is_target, is_insertion)}}
             onClick={_ => {
                 if (node?.getType() === type.node) {
                     // @ts-ignore
                     setDeleteKey(+node.getKey());
                 }
             }}
             onMouseOver={e => {
                 if (node.getType() === type.node) {
                     // @ts-ignore
                     const target = e.target.querySelector('p');
                     // @ts-ignore
                     target.style["backgroundColor"] = "#ddff99";
                 }
             }}
             onMouseOut={e => {
                 if (node.getType() === type.node) {
                     // @ts-ignore
                     const target = e.target.querySelector('p');
                     // @ts-ignore
                     target.style["backgroundColor"] = "transparent";
                 }
             }}
        >
            <p className={"node-square__text"}
               style={{backgroundColor: "transparent"}}
            ><b>{setText(node)}</b></p>
        </div>
    )
}

const Node = (props: nodeProps) => {
    return (
        setNode(props.node, props.r, props.c, props.on_path, props.is_target, props.is_insertion, props.setDeleteKey)
    )
}

export default Node;