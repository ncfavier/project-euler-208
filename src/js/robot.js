const Vec2 = dcodeIO.JustMath.Vec2;

function pt(v) {
    return new paper.Point(v.x, v.y);
}

function drawDot(v,color) {
    let c = new paper.Shape.Circle(pt(v), 0.2);
    c.strokeWidth = 0.04;
    c.strokeColor = "black";
    c.opacity = 0.7;
    if (color) c.fillColor = color;
    return c;
}

function drawVec(s, v) {
    let e = s.clone().add(v);
    let g = new paper.Path.Line(pt(s), pt(e));
    g.strokeWidth = 0.05;
    g.strokeColor = "black";
    return g;
}

function hue(dir) {
    return Math.floor(180 + 180 * dir / Math.PI);
}

function drawArc(a, b, c, aDir, cDir) {
    let p = new paper.Path.Arc(pt(a), pt(b), pt(c));
    p.strokeWidth = 0.06;
    p.strokeColor = {
        gradient: {
            stops: [{
                hue: hue(aDir),
                saturation: 0.8,
                brightness: 1
            }, {
                hue: hue(cDir),
                saturation: 0.8,
                brightness: 1
            }]
        },
        origin: pt(a),
        destination: pt(b)
    };
    return p;
}

export class Robot {

    constructor(paperLayer, n) {
        this.canvas = paperLayer;
        this.heading = new paper.Group();
        this.canvas.addChild(this.heading);

        this.n = n;
        this.heading_ = 0;
        this.counts = new Array(n).fill(0);
        this.p = new Vec2(0,0);
        this.f = new Vec2(0,1);

        this.canvas.addChild(drawDot(this.p, "black"));

        this.drawCurrent();
    }

    mod(k) {
        return (k + this.n) % this.n;
    }

    drawCurrent() {
        this.heading.removeChildren();

        this.heading.addChild(drawDot(this.p));
        this.heading.addChild(drawVec(this.p, this.f));
    }

    move(s) {
        let left = s == 'L';

        this.canvas.addChild(drawDot(this.p));

        let oldHeading_ = this.heading_;
        this.heading_ = this.mod(this.heading_ + (left ? -1 : 1));
        this.counts[left ? this.heading_ : oldHeading_] += 1;

        let turn = left ? Math.PI/2 : -Math.PI/2;
        let pole = this.p.clone().add(this.f.clone().rotate(turn));
        let arm = this.p.clone().sub(pole);

        let rot = left ? 2*Math.PI/this.n : -2*Math.PI/this.n;

        // Paper.js doesn't support conic gradients, so we approximate one by subdividing.
        let subdiv = Math.ceil(15 / this.n);
        let rot_ = rot / subdiv;
        for (let i = 0; i < subdiv; i++) {
            let before = this.p.clone();
            let halfway = arm.clone().rotate(rot_/2);
            let whole = arm.clone().rotate(rot_);
            let passthrough = pole.clone().add(halfway);
            this.p = pole.clone().add(whole);
            let oldDir = this.f.dir();
            this.f.rotate(rot_);
            this.canvas.addChild(drawArc(before, passthrough, this.p, oldDir, this.f.dir()));
            arm = whole;
        }

        this.drawCurrent();
    }

    random() {
        this.move(Math.random() < 0.5 ? 'L' : 'R');
    }

    goHome() {
        // This is not very clever, but it seems to at least terminate and I conjecture that it finds
        // a shortest way to close the loop when n is prime.
        // For non-prime n, the "all counts equal" criteria is not sufficient: consider n = 4, LRLLLRL.
        // The counts are now [1, 3, 1, 3], which is a vanishing sum of 4th roots of unity. Detecting those
        // in general might be feasible, but finding the shortest path around the n-gon that ends up at one is another story...
        let l = this.mod(this.heading_ - 1), r = this.heading_;
        const base = this.counts[r];
        for (let i = 0; i < this.n/2; i++) {
            if (this.counts[l] < this.counts[r]) {
                this.move('L');
                break;
            } else if (this.counts[r] < this.counts[l] || this.counts[r] != base) {
                this.move('R');
                break;
            }
            l = this.mod(l - 1);
            r = this.mod(r + 1);
        }
    }
}
