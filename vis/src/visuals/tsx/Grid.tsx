import React from "react";
import {SkipListC} from "../../skiplist/SkipListC";
import Node from './Node';
import {SkipListNode, type, nodeID} from "../../skiplist/SkipListNode";
import {animationJson, GetMethodResult, InsertMethodResult} from "../../skiplist/SkipList";
import node from "./Node";
import {cursorTo} from "readline";

interface GridState {
    state: state;
    size: number;
    slArray: SkipListNode[][];
    search_key: null | number;
    insert_key: null | number;
    search_result: null | number | string;
    animations: animationJson[];
    path_nodes: Map<nodeID, Set<number>>;
    insertion_nodes: Map<nodeID, Set<number>>;
    target_node: [nodeID, number] | null;
    animation_step: number;
}

enum state {
    current,
    before_level,
    after_level
}

class Grid extends React.Component<any, GridState> {
    private sl: SkipListC;
    private before_level_sl: SkipListC;
    private after_level_sl: SkipListC;
    private max = 30; // max/min # of insertions
    private min = 5;

    constructor(props: any) {
        super(props);
        this.sl = new SkipListC();
        this.before_level_sl = this.sl;
        this.after_level_sl = this.sl;
        this.state = {
            state: state.current,
            size: 5,
            slArray: [],
            search_key: null,
            search_result: null,
            insert_key: null,
            animations: [],
            path_nodes: new Map<nodeID, Set<number>>(),
            insertion_nodes: new Map<nodeID, Set<number>>(),
            target_node: null,
            animation_step: 0
        }
        this.onChangeVal = this.onChangeVal.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleInsert = this.handleInsert.bind(this);
        this.animateSearch = this.animateSearch.bind(this);
        this.animateInsert = this.animateInsert.bind(this);
        this.handle_prev_animation_step = this.handle_prev_animation_step.bind(this);
        this.handle_next_animation_step = this.handle_next_animation_step.bind(this);
        this.handle_animation_step = this.handle_animation_step.bind(this);
    }

    animateInsert(res: InsertMethodResult) {
        console.log(res.animations)

        this.after_level_sl = res.animations[0].slState;

        this.setState({
            state: state.before_level,
            animations: res.animations,
            animation_step: 0,
            path_nodes: new Map<nodeID, Set<number>>(),
            insertion_nodes: new Map<nodeID, Set<number>>(),
            target_node: null
        });
    }

    handleInsert() {
        if (this.state.insert_key === null || this.state.insert_key > 100 || this.state.insert_key < 10) {
            alert("Please input a valid number between 10 and 100.")
            return;
        }
        let search_res: GetMethodResult = this.sl.get(this.state.insert_key);
        if (search_res.val !== null) {
            alert("Key always exists!")
            return;
        }
        this.before_level_sl = this.sl.clone();
        let res: InsertMethodResult = this.sl.insert(this.state.insert_key, this.state.insert_key);
        this.animateInsert(res);
    }

    handle_next_animation_step() {
        this.handle_animation_step();
    }

    handle_prev_animation_step() {
        this.handle_animation_step(false);
    }

    handle_animation_step(next: boolean = true) {
        if (!next) {
            if (this.state.animations.length == 0 || this.state.animation_step == 0) {
                return;
            }
        } else if (this.state.animations.length == 0 || this.state.animation_step == this.state.animations.length) {
            return;
        }

        let path_nodes: Map<nodeID, Set<number>> = new Map<nodeID, Set<number>>();
        let insertion_node: Map<nodeID, Set<number>> = new Map<nodeID, Set<number>>();
        let target_node: [nodeID, number] | null = null;
        let new_step = this.state.animation_step + (next ? 1 : -1);
        let grid_state: state = state.current;


        if (this.state.animations[0].levelUp !== null) {
            console.log("Levelup is:" + this.state.animations[0].levelUp);
            console.log("new_step:" + new_step);
            if (new_step === 0)
                grid_state = state.before_level;
            else if (new_step < this.state.animations.length)
                grid_state = state.after_level;
            else
                grid_state = state.current;
        }

        console.log(grid_state);
        let key: nodeID;
        for (let i: number = 0; i < new_step; i++) {
            if (this.state.animations[i].c1 !== null) {
                let c1 = this.state.animations[i].c1;
                // @ts-ignore
                let rows: Set<number> = path_nodes.has(c1.getID()) ? path_nodes.get(c1.getID()) : new Set<number>();
                rows.add(this.state.animations[i].row as number);
                // @ts-ignore
                path_nodes.set(c1.getID(), rows)
                // @ts-ignore
                console.log(c1.getID(), rows)
            }
            if (this.state.animations[i].c2 !== null) {
                // @ts-ignore
                target_node = [this.state.animations[i].c2.getID(), this.state.animations[i].row];
            }
            if (this.state.animations[i].c3 !== null) {
                // @ts-ignore
                let c3 = this.state.animations[i].c3;
                // @ts-ignore
                let rows: Set<number> = insertion_node.has(c3.getID()) ? insertion_node.get(c3.getID()) : new Set<number>();
                rows.add(this.state.animations[i].row as number);
                // @ts-ignore
                insertion_node.set(c3.getID(), rows);
            }
        }

        // TODO: optimize it
        let res: SkipListNode[][];
        switch (grid_state) {
            case state.current: {
                res = this.sl.to2DArray();
                break;
            }
            case state.before_level: {
                res = this.before_level_sl.to2DArray();
                break;
            }
            case state.after_level: {
                res = this.after_level_sl.to2DArray();
                break;
            }
        }

        this.setState({
            // @ts-ignore
            slArray: res[0].map((_, colIndex) => res.map(row => row[colIndex])),
            state: grid_state,
            animation_step: new_step,
            path_nodes: path_nodes,
            target_node: target_node,
            insertion_nodes: insertion_node
        })
    }

    onChangeVal(e: any) {
        e.preventDefault();
        // @ts-ignore
        this.setState({[e.target.name]: e.target.value});
    }

    componentDidMount() {
        this.renderList();
    }

    skipGrid() {
        return this.state.slArray.slice(0).reverse().map((row: SkipListNode[], rindex: number) => {
            let rowIdx = this.state.slArray.length - rindex - 1;
            return (
                <div className={"row m-0 p-0 justify-content-center"}>
                    {
                        row.map((col: SkipListNode, cindex: number) => {
                            let on_path: boolean = false;
                            let is_target: boolean = false;
                            let is_insertion: boolean = false;
                            // @ts-ignore
                            if (col) {
                                // @ts-ignore
                                if (this.state.target_node !== null &&
                                    col.getID() === this.state.target_node[0]
                                ) {
                                    is_target = true;
                                } else if (this.state.insertion_nodes.has(col.getID()) &&
                                    // @ts-ignore
                                    this.state.insertion_nodes.get(col.getID()).has(rowIdx)
                                ) {
                                    is_insertion = true;
                                } else {
                                    if (this.state.path_nodes.has(col.getID())) {
                                        let rows = this.state.path_nodes.get(col.getID());
                                        // @ts-ignore
                                        if (rows.has(rowIdx)) {
                                            on_path = true;
                                        }
                                    }

                                }
                            }
                            return (
                                <div className={"col-auto p-0 m-0"}><Node
                                    node={col}
                                    r={rindex}
                                    c={cindex}
                                    on_path={on_path}
                                    is_target={is_target}
                                    is_insertion={is_insertion}
                                /></div>
                            )
                        })
                    }
                </div>
            )
        })
    }

    animateSearch(res: GetMethodResult) {
        console.log(res.animations)
        this.setState({
            search_result: res.val === null ? "No Value Found" : res.val,
            animations: res.animations,
            animation_step: 0,
            state: state.current,
            path_nodes: new Map<nodeID, Set<number>>(),
            insertion_nodes: new Map<nodeID, Set<number>>(),
            target_node: null
        });
    }

    handleSearch() {
        if (this.state.search_key === null) {
            alert("Please input a valid number.")
            return;
        }
        this.after_level_sl = this.sl;
        this.before_level_sl = this.sl;
        let res: GetMethodResult = this.sl.get(this.state.search_key);
        this.animateSearch(res);
    }

    renderList(build: boolean = true) {

        if (build) {
            this.sl = new SkipListC();
            this.before_level_sl = this.sl;
            this.after_level_sl = this.sl;
            for (let i: number = 0; i < this.state.size; i++) {
                let key: number = Math.floor(10 + Math.random() * 90);
                while (this.sl.get(key).val !== null) {
                    key = Math.floor(10 + Math.random() * 90); // allow for a speedier animation
                }
                this.sl.insert(key, key);
            }
        }
        this.after_level_sl = this.sl;
        this.before_level_sl = this.sl;

        let res: SkipListNode[][] = this.sl.to2DArray();

        this.setState({
            state: state.current,
            slArray: res[0].map((_, colIndex) => res.map(row => row[colIndex])),
            animations: [],
            animation_step: 0,
            path_nodes: new Map<nodeID, Set<number>>(),
            insertion_nodes: new Map<nodeID, Set<number>>(),
            target_node: null,
            search_key: null,
            search_result: null,
            insert_key: null
        }); // transpose rows to cols LA!
    }


    render() {

        return (
            <div>
                <div className={"skiplist-form"}>
                    <h4>Graph Params</h4>

                    <label>Number of Elements: {this.state.size}(20+ for larger screens)</label><br/>

                    {this.min}<input type="range" name="size" className="skiplist-form__range" id="range"
                                     onChange={this.onChangeVal} value={this.state.size} max={this.max}
                                     min={this.min}/>{this.max}<br/>

                    <button className={"btn btn-dark"} onClick={() => {
                        this.sl = new SkipListC();
                        this.renderList()
                    }}>Build
                    </button>

                    <button className={"btn btn-dark"} onClick={() => {
                        console.log("Original")
                        console.log(this.sl);
                        this.sl = this.sl.clone();
                        console.log("Cloned")
                        console.log(this.sl);
                        this.renderList(false);
                    }}>Get Clone
                    </button>
                    <br/>

                    <label>Search For An Element</label><br/>

                    <small className={"color-box-purple"}>Purple: Path</small><br/>

                    <small className={"color-box-blue"}>Blue: Found Element(if any)/New Element</small><br/>

                    <small className={"color-box-yellow"}>Yellow: Insertion Point</small><br/><br/>

                    <input type={"number"}
                           name={"insert_key"}
                        // @ts-ignore
                           value={this.state.insert_key === null ? "" : this.state.insertion_key}
                           onChange={this.onChangeVal}
                           placeholder={"Enter Key Here."}/>

                    <button className={"btn btn-dark"} onClick={this.handleInsert}>Insert</button>
                    <br/>

                    <input type={"number"}
                           name={"search_key"}
                        // @ts-ignore
                           value={this.state.search_key === null ? "": this.state.search_key}
                           onChange={this.onChangeVal}
                           placeholder={"Enter Key Here."}/>

                    <button className={"btn btn-dark"} onClick={this.handleSearch}>Search</button>
                    <br/>

                    <label>{this.state.search_result === null ? "" : "Search Result: " + this.state.search_result}</label><br/><br/><br/>

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