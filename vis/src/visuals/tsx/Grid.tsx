import React from "react";
import {SkipListC} from "../../skiplist/SkipListC";
import Node from './Node';
import {SkipListNode, type} from "../../skiplist/SkipListNode";
import {GetMethodResult} from "../../skiplist/SkipList";


class Grid extends React.Component<any, any> {
    private sl: SkipListC;
    private max = 30; // max/min # of insertions
    private min = 5;

    constructor(props: any) {
        super(props);
        this.sl = new SkipListC();
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
        this.setState({[e.target.name]: e.target.value, animations: [], search_result: null});
        console.log(this.state.search_key);
    }

    componentDidMount() {
        this.renderList();
    }

    skipGrid() {
        return this.state.slArray.slice(0).reverse().map((row: SkipListNode[], rindex: number) => {
            return (
                <div className={"row m-0 p-0 justify-content-center"}>
                    {
                        row.map((col: SkipListNode, cindex: number) => {
                            return (
                                <div className={"col-auto p-0 m-0"}><Node
                                    node={col}
                                    r={rindex}
                                    c={cindex}
                                    on_path={this.state.path_nodes.includes(col)}
                                    is_target={col === this.state.target}
                                /></div>
                            )
                        })
                    }
                </div>
            )
        })
    }

    animate(res: GetMethodResult) {
        this.setState({search_result: res.val === null ? "No Value Found" : res.val,
            animations: res.animations,
            animation_step: 0,
            path_nodes: [],
            target_node: null
        });
    }

    handleSearch() {
        console.log("Should have updated the sl");
        let res: GetMethodResult = this.sl.get(this.state.search_key);
        this.animate(res);
        this.setState({search_key: null});
    }

    renderList() {
        this.sl = new SkipListC();
        for (let i: number = 0; i < this.state.size; i++) {
            let key: number = Math.floor(Math.random() * 100);
            while (this.sl.get(key).val !== null) {
                key = Math.floor(Math.random() * 100); // allow for a speedier animation
            }
            this.sl.insert(key, key);
        }
        let res: SkipListNode[][] = this.sl.to2DArray();
        this.setState({slArray: res[0].map((_, colIndex) => res.map(row => row[colIndex])),
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