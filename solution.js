var Grafos = typeof Grafos != "undefined" ? Grafos :
				require("./grafos.js");

var graph = Grafos.parseGraph.apply(Grafos,
				typeof process == "object" ? process.argv.slice(2) :
					Array.isArray(window.socrata_input) ? 
						window.socrata_input : [window.socrata_input]);
var noRoute = "NO SUCH ROUTE";

var answer = Grafos.measurePath(graph, ["A", "B", "C"]);
console.log(answer == null ? noRoute : answer);

answer = Grafos.measurePath(graph, ["A", "D"]);
console.log(answer == null ? noRoute : answer);

answer = Grafos.measurePath(graph, ["A", "D", "C"]);
console.log(answer == null ? noRoute : answer);

answer = Grafos.measurePath(graph, ["A", "E", "B", "C", "D"]);
console.log(answer == null ? noRoute : answer);

answer = Grafos.measurePath(graph, ["A","E","D"]);
console.log(answer == null ? noRoute : answer);

answer =	graph.C == null ? null :
				Grafos.numPaths(graph.C, graph.C, 3, false, false, graph)
console.log(answer == null ? 0 : answer);

answer =	graph.C == null ? null :
			graph.A == null ? null :
			Grafos.numPaths(graph.A, graph.C, 4, true, false, graph)
console.log(answer == null ? 0 : answer);

answer =	graph.A == null ? null :
			graph.C == null ? null :
			Grafos.getDistance(graph.A, graph.C);
console.log(answer == null ? noRoute : answer);

answer =	graph.B == null ? null :
			Grafos.getDistance(graph.B, graph.B);
console.log(answer == null ? noRoute : answer);

answer =	graph.C == null ? null :
			Grafos.numPaths(graph.C, graph.C, 29, false, true, graph);
console.log(answer == null ? 0 : answer);
