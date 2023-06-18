import {CoordinateSystem} from './coordinatesystem.js'
import {Robot} from './robot.js'

$(document).ready(() => {

    const [WIDTH, HEIGHT] = [$(window).width(), $(window).height() - $(".top-bar").outerHeight()];

    $("#canvas").width(WIDTH);
    $("#canvas").height(HEIGHT);
    $("#canvas").attr("width", WIDTH);
    $("#canvas").attr("height", HEIGHT);

    paper.setup($("#canvas").get(0));

    let cs = new CoordinateSystem(WIDTH, HEIGHT);
    cs.autoSetFromWidth(50);
    cs.calculateTransformation();

    let t = cs.transform;
    paper.project.activeLayer.transformContent = false;
    paper.project.activeLayer.matrix = new paper.Matrix(t.sx, 0, 0, t.sy, t.tx, t.ty);

    let params = new URLSearchParams(document.location.search);
    let n = parseInt(params.get('n'));
    if (isNaN(n)) n = 5;

    let r = new Robot(paper.project.activeLayer, n);

    let keyboard = new paper.Tool();
    keyboard.onKeyDown = (event) => {
        if (event.key == 'left') {
            r.move("L");
        } else if (event.key == 'right') {
            r.move("R");
        } else if (event.key == 'r') {
            r.random();
        } else if (event.key == 'space') {
            r.goHome();
        }
    };

    let hash = window.location.hash ? window.location.hash.substring(1) : null;
	if (hash != null) {
        hash.split("").map(x => r.move(x));
	}

});
