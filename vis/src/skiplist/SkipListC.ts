import {SkipListNode, type} from "./SkipListNode";
import {animationJson, GetMethodResult, InsertMethodResult, SearchMethodResult, DeleteMethodResult, SkipList} from "./SkipList";

interface SkipListCProps {
    p: number;
    n: number;
    start: SkipListNode;
    terminus: SkipListNode;
    height: number;
    animations?: animationJson[];
}

export class SkipListC implements SkipList {
    private p: number = 1 / 2;
    private n: number;
    private readonly start: SkipListNode;
    private readonly terminus: SkipListNode;
    private height: number;

    public animations: animationJson[] = [];

    constructor(props?: SkipListCProps) {// implement this insert array method later if time
        this.start = props?.start ?? new SkipListNode(null, null, null, null, type.root);
        this.terminus = props?.terminus ?? new SkipListNode(null, null, null, null, type.cap);
        this.height = props?.height ?? 1;
        this.n = props?.n ?? 0;
    }

    public clone(): SkipListC {
        let cloned = new Map<SkipListNode, SkipListNode>();
        let cloned_start = new SkipListNode(null, null, null, null, type.root)
        let cloned_terminus = new SkipListNode(null, null, null, null, type.cap)

        cloned.set(this.start, cloned_start);
        cloned.set(this.terminus, cloned_terminus);

        let curr = this.start;
        while (curr.nexts[0].getType() !== type.cap) {
            let next = curr.nexts[0]
            let cloned_curr = cloned.get(curr);
            // @ts-ignore
            let cloned_next = new SkipListNode(null, null, next.getKey(), next.getValue(), next.getType());
            cloned_next.prevs.push(<SkipListNode>cloned.get(curr));
            // @ts-ignore
            cloned_curr.nexts.push(cloned_next);
            cloned.set(next, cloned_next);
            curr = next;
        }
        let cloned_curr = cloned.get(curr);
        // @ts-ignore
        cloned_curr.nexts.push(cloned_terminus);
        cloned_terminus.prevs.push(<SkipListNode>cloned.get(curr));

        for (let i = 1; i < this.height; i++) {
            // @ts-ignore
            cloned_start.nexts.push(cloned.get(this.start.nexts[i]));
            // @ts-ignore
            cloned_terminus.prevs.push(cloned.get(this.terminus.prevs[i]));
        }

        for (let i = 1; i < this.height; i++) {
            curr = this.start.nexts[i];
            while (curr !== this.terminus) {
                let curr_cloned = cloned.get(curr);
                // @ts-ignore
                curr_cloned.nexts.push(cloned.get(curr.nexts[i]));
                // @ts-ignore
                curr_cloned.prevs.push(cloned.get(curr.prevs[i]));
                curr = curr.nexts[i];
            }
        }

        return new SkipListC({
            ...this,
            start: cloned_start,
            terminus: cloned_terminus
        })
    }

    private search(key: number): SearchMethodResult {
        this.animations = [];
        let curr: SkipListNode = this.start;
        let i: number = this.start.height() - 1;
        let animation: animationJson = {
            c1: curr,
            c2: null,
            c3: null,
            row: this.height - 1,
            newNodeLevel: null,
            "slState": this
        };
        this.animations.push(animation);

        while (curr.getType() !== type.cap && i >= 0) {
            if (curr.nexts[i].isLessKey(key)) {
                curr = curr.nexts[i];
            } else if (curr.nexts[i].equals(key)) {
                let animation: animationJson = {
                    c1: null,
                    c2: curr.nexts[i],
                    c3: null,
                    row: i,
                    newNodeLevel: null,
                    "slState": this
                };
                this.animations.push(animation);
                return {element: curr.nexts[i], animations: this.animations};
            } else {
                i -= 1;
            }
            let animation: animationJson = {
                c1: curr,
                c2: null,
                c3: null,
                row: i,
                newNodeLevel: null,
                "slState": this
            };
            this.animations.push(animation);
        }
        return {element: null, animations: this.animations}
    }

    public get(key: number): GetMethodResult {
        let res = this.search(key);
        return {val: res.element?.getValue() || null, animations: res.animations};
    }

    public delete(key: number): DeleteMethodResult {
        let res: SearchMethodResult = this.search(key);
        let node: SkipListNode | null = res.element;
        if (node == null) {
            return {
                val: null,
                animations: res.animations
            };
        }
        this.animations = [];
        for (let i: number = 0; i < node.nexts.length; i++) {
            let b: SkipListNode = node.prevs[i];
            let a: SkipListNode = node.nexts[i];
            b.nexts[i] = a;
            a.prevs[i] = b;
        }
        res.animations.forEach(animation => {
            animation.deletion = true;
            return animation
        })

        res.animations.push({
            c1: null,
            c2: null,
            c3: null,
            row: null,
            newNodeLevel: null,
            slState: this,
        });
        this.n -= 1;
        return {
            //@ts-ignore
            val: res.element.getKey(),
            animations: res.animations
        };
    }


    public insert(key: number, val: number): InsertMethodResult {
        this.animations = [];

        let levels: number = this.levels();
        this.increase(levels);
        this.height = this.start.height();
        this.animations.push({
            c1: null,
            c2: null,
            c3: null,
            row: null,
            newNodeLevel: levels,
            slState: this.clone()
        })


        let newNode: SkipListNode = new SkipListNode(undefined, undefined, key, val, type.node);
        for (let i: number = 0; i < levels; i++) {
            newNode.nexts[i] = new SkipListNode(undefined, undefined, undefined, undefined, type.node)
            newNode.prevs[i] = new SkipListNode(undefined, undefined, undefined, undefined, type.node)
        }

        let i: number = this.height - 1;
        let last_stop: SkipListNode = this.start;
        while (i >= 0) {
            let back: SkipListNode = last_stop;
            this.animations.push({
                c1: back,
                c2: null,
                c3: null,
                row: i,
                newNodeLevel: null,
                slState: this
            });

            while (i < back.height() && back.nexts[i] !== this.terminus && back.nexts[i].isLess(newNode)) {
                back = back.nexts[i];
                this.animations.push({
                    c1: back,
                    c2: null,
                    c3: null,
                    row: i,
                    newNodeLevel: null,
                    slState: this
                });
            }

            if (i < levels) {
                this.animations.push({
                    c1: null,
                    c2: null,
                    c3: back,
                    row: i,
                    newNodeLevel: null,
                    slState: this
                });

                let front: SkipListNode = this.terminus;

                if (back.nexts[i] != null) {
                    front = back.nexts[i];
                }

                newNode.prevs[i] = back;
                back.nexts[i] = newNode;


                newNode.nexts[i] = front;
                front.prevs[i] = newNode;
            }


            last_stop = back;
            i -= 1;
        }
        this.animations.push({
            c1: null,
            c2: newNode,
            c3: null,
            row: 0,
            newNodeLevel: null,
            slState: this
        });
        this.n += 1;
        return {
            animations: this.animations
        }
    }

    private levels(): number {
        if (Math.random() < this.p) {
            return 1 + this.levels();
        }
        return 1;
    }

    private increase(levels: number): void {
        while (levels > this.start.height()) {
            this.start.nexts.push(new SkipListNode(null, null, null, null, type.root));
            this.terminus.prevs.push(new SkipListNode(null, null, null, null, type.cap));

            this.start.nexts[this.start.nexts.length - 1] = this.terminus;
            this.terminus.prevs[this.terminus.prevs.length - 1] = this.start;
        }
    }


    public to2DArray(): SkipListNode[][] { // we aren't updating node's next fields to include
        let i: number = 0;
        let tmp: SkipListNode = this.start;
        let cols: SkipListNode[][] = [];
        while (i <= this.n) {
            let col: SkipListNode[] = [];
            for (let j: number = 1; j <= tmp.height(); j++) {
                col.push(tmp);
            }
            tmp = tmp.nexts[0];
            cols.push(col);
            i++;
        }
        let col: SkipListNode[] = [];
        for (let k: number = 1; k <= this.start.nexts.length; k++) {
            col.push(tmp);
        }
        cols.push(col)
        console.log(this.start.to2DArray())
        return cols;
    }

    public toString(): string {
        return this.start.toString();
    }

    public size(): number {
        return this.n;
    }

    public isEmpty(): boolean {
        return this.n === 0;
    }
}