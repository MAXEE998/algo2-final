import React from "react";
import {SkipListC} from "../../skiplist/SkipListC";
import Node from './Node';
import {nodeID, SkipListNode, type} from "../../skiplist/SkipListNode";
import {animationJson, DeleteMethodResult, GetMethodResult, InsertMethodResult} from "../../skiplist/SkipList";
import head from "../images/head.png"
import tail from "../images/tail.png"

interface GridState {
    state: state;
    size: number;
    slArray: SkipListNode[][];
    search_key: null | number;
    insert_key: null | number;
    delete_key: null | number;
    search_result: null | number | string;
    animations: animationJson[];
    path_nodes: Map<nodeID, Set<number>>;
    insertion_nodes: Map<nodeID, Set<number>>;
    target_node: [nodeID, number] | null;
    explanation: JSX.Element[];
    animation_step: number;
    search_value: number | null;
    biased_insert: boolean
}

enum state {
    current,
    previous,
    after_level
}

class Grid extends React.Component<any, GridState> {
    private sl: SkipListC;
    private previous_sl: SkipListC;
    private after_level_sl: SkipListC;
    private max = 30; // max/min # of insertions
    private min = 1;

    constructor(props: any) {
        super(props);
        this.sl = new SkipListC();
        this.previous_sl = this.sl;
        this.after_level_sl = this.sl;
        this.state = {
            explanation: [],
            state: state.current,
            size: 5,
            slArray: [],
            search_key: null,
            search_result: null,
            insert_key: null,
            delete_key: null,
            animations: [],
            path_nodes: new Map<nodeID, Set<number>>(),
            insertion_nodes: new Map<nodeID, Set<number>>(),
            target_node: null,
            animation_step: 0,
            search_value: null,
            biased_insert: false
        }
        this.onChangeVal = this.onChangeVal.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleInsert = this.handleInsert.bind(this);
        this.animateSearch = this.animateSearch.bind(this);
        this.animateInsert = this.animateInsert.bind(this);
        this.handle_prev_animation_step = this.handle_prev_animation_step.bind(this);
        this.handle_next_animation_step = this.handle_next_animation_step.bind(this);
        this.handle_animation_step = this.handle_animation_step.bind(this);
        this.explanationBox = this.explanationBox.bind(this);
        this.animateDelete = this.animateDelete.bind(this);
        this.setDeleteKey = this.setDeleteKey.bind(this);
        this.handleBiasedChange = this.handleBiasedChange.bind(this);
    }

    animateInsert(res: InsertMethodResult) {
        this.after_level_sl = res.animations[0].slState;

        this.setState({
            state: state.previous,
            animations: res.animations,
            animation_step: 0,
            path_nodes: new Map<nodeID, Set<number>>(),
            insertion_nodes: new Map<nodeID, Set<number>>(),
            target_node: null,
            explanation: [],
            search_value: this.state.insert_key
        });
    }

    handleInsert() {
        if (this.state.insert_key === null || this.state.insert_key > 100 || this.state.insert_key < 0) {
            alert("Please input a valid number between 0 and 100.")
            return;
        }
        let search_res: GetMethodResult = this.sl.get(this.state.insert_key);
        if (search_res.val !== null) {
            alert("Key already exists!")
            return;
        }
        this.previous_sl = this.sl.clone();
        let res: InsertMethodResult = this.sl.insert(this.state.insert_key, this.state.insert_key, this.state.biased_insert);
        this.animateInsert(res);
    }

    handleDelete() {
        if (this.state.state !== state.current) {
            alert("Please clear animation first before deletion");
            return;
        }

        if (this.state.delete_key === null) {
            alert("Please select a node to delete");
            return;
        }

        this.previous_sl = this.sl.clone();
        let deletion_res: DeleteMethodResult = this.sl.delete(this.state.delete_key);
        if (deletion_res.val === null) {
            alert("The key to delete is not in the skiplist");
            this.previous_sl = this.sl;
            return;
        }
        this.animateDelete(deletion_res);

    }

    animateDelete(res: DeleteMethodResult) {
        this.setState({
            state: state.previous,
            animations: res.animations,
            animation_step: 0,
            search_value: this.state.delete_key,
            path_nodes: new Map<nodeID, Set<number>>(),
            insertion_nodes: new Map<nodeID, Set<number>>(),
            target_node: null,
            explanation: [],

        });
    }

    handle_next_animation_step() {
        this.handle_animation_step();
    }

    handle_prev_animation_step() {
        this.handle_animation_step(false);
    }

    handle_animation_step(next: boolean = true) {
        if (!next) {
            if (this.state.animations.length === 0 || this.state.animation_step === 0) {
                return;
            }
        } else if (this.state.animations.length === 0 || this.state.animation_step === this.state.animations.length) {
            return;
        }

        let path_nodes: Map<nodeID, Set<number>> = new Map<nodeID, Set<number>>();
        let insertion_node: Map<nodeID, Set<number>> = new Map<nodeID, Set<number>>();
        let target_node: [nodeID, number] | null = null;
        let new_step = this.state.animation_step + (next ? 1 : -1);
        let grid_state: state = state.current;
        let explanation: JSX.Element[] = [];
        let is_insertion = this.state.animations[0].newNodeLevel !== null;


        // animation for searching
        if (!this.state.animations[0].deletion || new_step !== this.state.animations.length) {
            for (let i: number = 0; i < new_step; i++) {
                if (this.state.animations[i].c1 !== null) {
                    let c1 = this.state.animations[i].c1;
                    // @ts-ignore
                    let rows: Set<number> = path_nodes.has(c1.getID()) ? path_nodes.get(c1.getID()) : new Set<number>();
                    rows.add(this.state.animations[i].row as number);
                    // @ts-ignore
                    path_nodes.set(c1.getID(), rows)
                    if (i === new_step - 1) {
                        let current_key: any = c1?.getID();
                        if (current_key === type.root) {
                            current_key = "root";
                        }
                        explanation.push(<p> {current_key} {'<'} {this.state.search_value}</p>);
                    }
                } else if (this.state.animations[i].c2 !== null) {
                    // @ts-ignore
                    target_node = [this.state.animations[i].c2.getID(), this.state.animations[i].row];
                    if (i === new_step - 1 && !is_insertion) {
                        explanation.push(<p>{this.state.search_value} is found.</p>);
                    }
                } else if (this.state.animations[i].c3 !== null) {
                    // @ts-ignore
                    let c3 = this.state.animations[i].c3
                    let row = this.state.animations[i].row
                    // @ts-ignore
                    let rows: Set<number> = insertion_node.has(c3.getID()) ? insertion_node.get(c3.getID()) : new Set<number>();
                    rows.add(row as number);
                    // @ts-ignore
                    insertion_node.set(c3.getID(), rows);
                    if (i === new_step - 1) {
                        let current_key: any = c3?.getID();
                        if (current_key === type.root) {
                            current_key = "root";
                        }
                        explanation.push(<p> {this.state.search_value} will be inserted after {current_key} on
                            level {row}</p>);
                    }
                }
            }
        }

        if (is_insertion) {
            // State change for insertion
            if (new_step === 0) {
                grid_state = state.previous;
            } else if (new_step < this.state.animations.length) {
                grid_state = state.after_level;
                let coins = (n: number): JSX.Element[] => {
                    const pics: JSX.Element[] = [];
                    for (let i = 0; i < n - 1; i++) {
                        pics.push(<img src={head} alt="head" width={40} height={40}/>)
                    }
                    pics.push(<img src={tail} alt="tail" width={40} height={40}/>)
                    return pics;
                }
                explanation.push(<p>Coin toss: {coins(this.state.animations[0].newNodeLevel as number)}</p>)
                explanation.push(<p>The inserted node will be {this.state.animations[0].newNodeLevel}-level high.</p>)

            } else {
                grid_state = state.current;
                explanation.push(<p>{this.state.search_value} has been inserted.</p>)
            }
        } else if (this.state.animations[0].deletion) {
            // State change for deletion
            if (new_step !== this.state.animations.length) {
                grid_state = state.previous;
            } else {
                explanation.push(<p>{this.state.search_value} has been deleted.</p>)
            }
        } else if (typeof this.state.search_result === "string" && new_step === this.state.animations.length) {
            // final explanation for search
            explanation.push(<p>{this.state.search_value} is not found in the skiplist.</p>)
        }


        // TODO: optimize it
        let res: SkipListNode[][];
        switch (grid_state) {
            case state.current: {
                res = this.sl.to2DArray();
                break;
            }
            case state.previous: {
                res = this.previous_sl.to2DArray();
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
            explanation: explanation,
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
        this.setState({[e.target.name]: +e.target.value});
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
                                    setDeleteKey={this.setDeleteKey}
                                /></div>
                            )
                        })
                    }
                </div>
            )
        })
    }

    animateSearch(res: GetMethodResult) {
        this.setState({
            search_result: res.val === null ? "No Value Found" : res.val,
            animations: res.animations,
            animation_step: 0,
            state: state.current,
            path_nodes: new Map<nodeID, Set<number>>(),
            insertion_nodes: new Map<nodeID, Set<number>>(),
            target_node: null,
            explanation: [],
            search_value: this.state.search_key
        });
    }

    handleSearch() {
        if (this.state.search_key === null) {
            alert("Please input a valid number.")
            return;
        }
        this.after_level_sl = this.sl;
        this.previous_sl = this.sl;
        let res: GetMethodResult = this.sl.get(this.state.search_key);
        this.animateSearch(res);
    }

    handleBiasedChange() {
        console.log((this.state.biased_insert))
        this.setState({
            biased_insert: !this.state.biased_insert
        })
    }

    renderList(build: boolean = true) {

        if (build) {
            this.sl = new SkipListC();
            this.previous_sl = this.sl;
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
        this.previous_sl = this.sl;

        let res: SkipListNode[][] = this.sl.to2DArray();

        this.setState({
            state: state.current,
            slArray: res[0].map((_, colIndex) => res.map(row => row[colIndex])),
            animations: [],
            animation_step: 0,
            path_nodes: new Map<nodeID, Set<number>>(),
            insertion_nodes: new Map<nodeID, Set<number>>(),
            delete_key: null,
            target_node: null,
            search_key: null,
            search_result: null,
            insert_key: null,
            explanation: []
        }); // transpose rows to cols LA!
    }

    explanationBox(): JSX.Element {
        if (this.state.animations.length) {
            return <section className={"explanation-box"}>
                {this.state.explanation.length === 0 ?
                    <p> Press Next to start animation </p> :
                    this.state.explanation
                }

            </section>
        } else
            return <></>;
    }

    setDeleteKey(key: number) {
        this.setState({delete_key: key});
    }

    renderBuild(): JSX.Element {
        return <section className="op">
            <h4>Build</h4>

            <label>Number of Elements: {this.state.size}<br/>(20+ for larger screens)</label><br/>

            {this.min}<input type="range" name="size" className="skiplist-form__range" id="range"
                             onChange={this.onChangeVal} value={this.state.size} max={this.max}
                             min={this.min}/>{this.max}<br/>

            <button className={"btn btn-dark"} onClick={() => {
                this.sl = new SkipListC();
                this.renderList()
            }}>Build
            </button>
            <br/>
        </section>
    }

    renderInsert(): JSX.Element {
        return <section className="op">
            <h4>Insert</h4>

            <small className={"color-box-purple"}>Purple: Path</small><br/>

            <small className={"color-box-blue"}>Blue: New Element</small><br/>

            <small className={"color-box-yellow"}>Yellow: Insertion Point</small><br/>

            <small> Key should be between 0 and 100 </small><br/>
            <input type={"number"}
                   name={"insert_key"}
                // @ts-ignore
                   value={this.state.insert_key === null ? "" : this.state.insertion_key}
                   onChange={this.onChangeVal}
                   placeholder={"Enter Key Here."}/>
            <br/>
            <button className={"btn btn-dark"} onClick={this.handleInsert}>Insert</button> <br/>
        <input type={"checkbox"} id={"biased"} onChange={this.handleBiasedChange}/>
            <label htmlFor={"biased"}> 9:1 biased coin</label>
        </section>
    }

    renderDelete(): JSX.Element {
        return <section className="op">
            <h4>Delete</h4>

            <small className={"color-box-purple"}>Purple: Path</small><br/>

            <small className={"color-box-blue"}>Blue: Element to be deleted</small><br/>

            <label>Key to be deleted: <br/>{
                this.state.delete_key === null ?
                    <b>Click on a key to select</b>
                    :
                    <b>{this.state.delete_key}</b>
            }

            </label><br/>

            <button className={"btn btn-dark"} onClick={this.handleDelete}>Delete</button>
        </section>
    }

    renderSearch(): JSX.Element {
        return <section className="op">
            <h4>Search</h4>

            <small className={"color-box-purple"}>Purple: Path</small><br/>

            <small className={"color-box-blue"}>Blue: Found Element(if any)</small><br/>


            <input type={"number"}
                   name={"search_key"}
                // @ts-ignore
                   value={this.state.search_key === null ? "" : this.state.search_key}
                   onChange={this.onChangeVal}
                   placeholder={"Enter Key Here."}/>
            <br/>
            <button className={"btn btn-dark"} onClick={this.handleSearch}>Search</button>
            <br/>
            <label>{this.state.search_result === null ? "" : "Search Result: " + this.state.search_result}</label>
        </section>
    }

    renderAnimationControl(): JSX.Element {
        if (this.state.animations.length === 0)
            return <></>
        return <section className={"animation-control"}>
            <label> Animation Steps: {this.state.animation_step} / {this.state.animations.length} </label>
            <div>
                <button className={"btn btn-dark"} onClick={this.handle_prev_animation_step}>Previous
                </button>
                <button className={"btn btn-dark"} onClick={this.handle_next_animation_step}>Next</button>
                <button className={"btn btn-dark"} onClick={() => {
                    this.renderList(false);
                }}>
                    Clear
                </button>
            </div>

        </section>
    }

    render() {

        return (
            <div>
                <div className={"skiplist-form"}>
                    <div className={"control-panel"}>
                        {this.renderBuild()}
                        {this.renderInsert()}
                        {this.renderDelete()}
                        {this.renderSearch()}
                    </div>
                    <div className={"animation-panel"}>
                        {this.renderAnimationControl()}
                        {this.explanationBox()}
                    </div>

                </div>

                <div ref="skiplist" className={"container-xxl mx-auto skiplist"}>
                    {this.skipGrid()}
                </div>

            </div>
        )
    }

}

export default Grid;