import React from "react";
import {SkipListC} from "../../skiplist/SkipListC";
import Node from './Node';
import {SkipListNode, type} from "../../skiplist/SkipListNode";
import {animationJson, GetMethodResult} from "../../skiplist/SkipList";

// interface GridState {
//     size: number;
//     slArray: SkipListNode[][];
//     search_key: null | number;
//     search_result: null | number;
//     animations: animationJson[];
//     path_nodes: (SkipListNode | null)[];
//     target_node: null | SkipListNode;
//     animation_step: number;
// }

class Grid extends React.Component<any, any> {
    private sl: SkipListC;
    private prev_sl: SkipListC;
    private max = 30; // max/min # of insertions
    private min = 5;

    constructor(props: any) {
        super(props);
        this.sl = new SkipListC();
        this.prev_sl = this.sl;
        this.state = {
            size: 5,
            slArray: [],
            search_key: null,
            search_result: null,
            animations: [],
            path_nodes: [],
            target_node: null,
            animation_step: 0
        }
        this.onChangeVal = this.onChangeVal.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.animate = this.animate.bind(this);
        this.handle_prev_animation_step = this.handle_prev_animation_step.bind(this);
        this.handle_next_animation_step = this.handle_next_animation_step.bind(this);
    }

    handle_prev_animation_step() {
        if (this.state.animations.length == 0 || this.state.animation_step == 0) {
            return;
        }

        let path_nodes = [];
        let target_node = null;

        for (let i: number = 0; i < this.state.animation_step - 1; i++) {
            if (this.state.animations[i].c1 !== null) {
                path_nodes.push(this.state.animations[i].c1)
            }
            if (this.state.animations[i].c2 !== null) {
                target_node = this.state.animations[i].c2;
            }
        }

        this.setState({animation_step: this.state.animation_step - 1,
            path_nodes: path_nodes,
            target_node: target_node})
    }

    handle_next_animation_step() {
        if (this.state.animations.length == 0 || this.state.animation_step == this.state.animations.length) {
            return;
        }

        let path_nodes = [];
        let target_node = null;

        for (let i: number = 0; i < this.state.animation_step + 1; i++) {
            if (this.state.animations[i].c1 !== null) {
                path_nodes.push(this.state.animations[i].c1)
            }
            if (this.state.animations[i].c2 !== null) {
                target_node = this.state.animations[i].c2;
            }
        }

        this.setState({animation_step: this.state.animation_step + 1,
            path_nodes: path_nodes,
            target_node: target_node})
    }

    onChangeVal(e: any) {
        e.preventDefault();
        this.setState({[e.target.name]: e.target.value});
    }

    componentDidMount() {
        this.renderList();
    }

    skipGrid() {
        let marked = new Map<SkipListNode, number>();
        let cnt = new Map<SkipListNode, number>();
        if (this.state.target !== null) cnt.set(this.state.target, 1);
        this.state.path_nodes.forEach((node: SkipListNode) => {
            if (cnt.has(node)) {
                // @ts-ignore
                cnt.set(node, cnt.get(node)+1);
            } else {
                cnt.set(node, 1);
            }
        })
        return this.state.slArray.slice(0).reverse().map((row: SkipListNode[], rindex: number) => {
            return (
                <div className={"row m-0 p-0 justify-content-center"}>
                    {
                        row.map((col: SkipListNode, cindex: number) => {
                            let on_path: boolean = false;
                            let is_target: boolean = false;
                            // @ts-ignore
                            if (!marked.has(col)&& this.state.path_nodes.includes(col)) {
                                on_path = true;
                                marked.set(col, 1);
                            } else { // @ts-ignore
                                if (marked.get(col) < cnt.get(col)) {
                                    on_path = true;
                                    // @ts-ignore
                                    marked.set(col, marked.get(col) + 1);
                                }
                            }

                            if (!marked.has(col) && col === this.state.target_node) {
                                is_target = true;
                                marked.set(col, 1);
                            }
                            return (
                                <div className={"col-auto p-0 m-0"}><Node
                                    node={col}
                                    r={rindex}
                                    c={cindex}
                                    on_path={on_path}
                                    is_target={is_target}
                                /></div>
                            )
                        })
                    }
                </div>
            )
        })
    }

    animate(res: GetMethodResult) {
        console.log(res.animations)
        this.setState({search_result: res.val === null ? "No Value Found" : res.val,
            animations: res.animations,
            animation_step: 0,
            path_nodes: [],
            target_node: null
        });
    }

    handleSearch() {
        let res: GetMethodResult = this.sl.get(this.state.search_key);
        this.animate(res);
    }

    renderList(build: boolean = true, prev: boolean = false) {

        if (build) {
            this.sl = new SkipListC();
            this.prev_sl = this.sl;
            for (let i: number = 0; i < this.state.size; i++) {
                let key: number = Math.floor(10 + Math.random() * 90);
                while (this.sl.get(key).val !== null) {
                    key = Math.floor(10 + Math.random() * 90); // allow for a speedier animation
                }
                this.sl.insert(key, key);
            }
        }

        let res: SkipListNode[][] = prev ? this.prev_sl.to2DArray() : this.sl.to2DArray();
        this.setState({
            slArray: res[0].map((_, colIndex) => res.map(row => row[colIndex])),
            animations: [],
            animation_step: 0,
            path_nodes: [],
            target_node: null
        }); // transpose rows to cols LA!
        return this.skipGrid();
    }


    render() {
        return (
            <div>
                <div className={"skiplist-form"}>
                    <h4>Graph Params</h4>
                    <br/>
                    <button className={"btn btn-dark"} onClick={() => {
                        console.log("Original")
                        console.log(this.sl);
                        this.sl = this.sl.clone();
                        console.log("Cloned")
                        console.log(this.sl);
                        this.renderList(false);
                    }}>Get Cloned
                    </button>
                    <label>Number of Elements: {this.state.size}(20+ for larger screens)</label><br/>

                    {this.min}<input type="range" name="size" className="skiplist-form__range" id="range"
                                     onChange={this.onChangeVal} value={this.state.size} max={this.max}
                                     min={this.min}/>{this.max}<br/>

                    <button className={"btn btn-dark"} onClick={() => {
                        this.sl = new SkipListC();
                        this.renderList()
                    }}>Build
                    </button>
                    <br/>

                    <label>Search For An Element</label><br/>

                    <small className={"color-box-purple"}>Purple: Path</small><br/>

                    <small className={"color-box-blue"}>Blue: Element(if any)</small><br/><br/>

                    <input type={"number"} name={"search_key"} value={this.state.search_key} onChange={this.onChangeVal}
                           placeholder={"Enter Key Here."}/>

                    <button className={"btn btn-dark"} onClick={this.handleSearch}>Search</button>
                    <br/>

                    <label>{this.state.search_key === "" && this.state.search_result === null ? "" : "Search Result: " + this.state.search_result}</label><br/><br/><br/>

                    <label> Animation Steps: {this.state.animation_step} / {this.state.animations.length} </label> <br/>
                    <button className={"btn btn-dark"} onClick={this.handle_prev_animation_step}>Previous Animation
                    </button>
                    <button className={"btn btn-dark"} onClick={this.handle_next_animation_step}>Next Animation</button>
                    <br/>
                </div>
                <div ref="skiplist" className={"container-xxl mx-auto skiplist"}>
                    {this.skipGrid()}
                </div>
            </div>
        )
    }

}

export default Grid;