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
    let g = new paper.Group([
        new paper.Path.Line(pt(s), pt(e))
    ]);
    g.strokeWidth = 0.05;
    g.strokeColor = "black";
    return g;
}

function drawArc(a, b, c) {
    let p = new paper.Path.Arc(pt(a), pt(b), pt(c));
    p.strokeWidth = 0.05;
    p.strokeColor = "red";
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
        let before = this.p.clone();
        let left = s == 'L';

        let turn = left ? Math.PI/2 : -Math.PI/2;
        let pole = this.p.clone().add(this.f.clone().rotate(turn));

        let arm = this.p.clone().sub(pole);

        let rot = left ? 2*Math.PI/this.n : -2*Math.PI/this.n;
        let halfway = arm.clone().rotate(rot/2.0);
        let whole = arm.clone().rotate(rot);

        let passthrough = pole.clone().add(halfway);
        let dest = pole.clone().add(whole);

        let oldHeading_ = this.heading_;
        this.heading_ = this.mod(this.heading_ + (left ? -1 : 1));
        this.counts[left ? this.heading_ : oldHeading_] += 1;

        this.p = dest;
        this.f.rotate(rot);

        this.canvas.addChild(drawArc(before, passthrough, dest));
        this.canvas.addChild(drawDot(before));

        this.drawCurrent();
    }

    random() {
        this.move(Math.random() < 0.5 ? 'L' : 'R');
    }

    goHome() {
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
