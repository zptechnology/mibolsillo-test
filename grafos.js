(function(Grafos) {
	"use strict";

	//Clase para simular un nodo en el grafo
	var Nodo = function(name) {
		this.getName = function() {return name};
		var edges = [];
		var neighbourhood = {};
		this.getEdges = function() {return edges;};
		this.addEdge = function(edge) {
			//evitar duplicados
			if(neighbourhood[edge.getDest()])
				throw new Error(this+" ya tiene "+edge);
			neighbourhood[edge.getDest()] = edge;

			edges.push(edge)
		};
		this.getEdgeTo = function(nodo) {
			return neighbourhood[nodo];
		}
	}
	Nodo.prototype.toString = function() {
		return "[Nodo "+this.getName()+"]";
	}

	//Clase para crear un borde en el grafo
	var Edge = function(dest, weight) {
		if(!(dest instanceof Nodo))
			throw new TypeError("El destino del borde debe ser un vértice");
		this.getDest = function() {return dest;};
		this.getWeight = function() {return weight;};
	}
	Edge.prototype.toString = function() {
		return "[Edge -> "+this.getDest()+"]";
	}

	/**	Parsear cadenas a grafos.
	 *
	 *  Se retorna un objeto con los nodos
	 *
	 */
	Grafos.parseGraph =  function() {
		var nodoSet = {};

		for(var i = 0; i < arguments.length; i++) {
			var edgeStrs = arguments[i].split(/i,|\s/);
			for(var j = 0; j < edgeStrs.length; j++) {
				var edgeStr = edgeStrs[j];
				if(edgeStr.length >= 3) {
					//Parsear el string de entrada
					var v1 = edgeStr[0];
					var v2 = edgeStr[1];
					var weight = edgeStr.slice(2);
					if(weight.match(/^-?[0-9]*$/) == null)
						throw new TypeError("Los pesos deben ser enteros");
					weight = parseInt(weight);
					if(weight <= 0)
						throw new TypeError("Los pesos deben ser positivos");

					//Setear al objeto de nodos
					if(nodoSet[v1] == null)
						nodoSet[v1] = new Nodo(v1);
					if(nodoSet[v2] == null)
						nodoSet[v2] = new Nodo(v2);

					//agregar nodo
					nodoSet[v1].addEdge(new Edge(nodoSet[v2], weight));

				} else if(edgeStr.length > 0)
					throw new Error("El formato debe ser igual al ejemplo: [nodo][nodo][peso]");
			}
		}
		return nodoSet;
	}

	/**	Calcula el tamaño de la ruta
	 *
	 *	@param	nodoSet nodos
	 *	@param	path	nombres de ls vertices ordenados
	 *	@return	el tamaño de la ruta
	 */
	Grafos.measurePath = function(nodoSet, path) {
		//obtiene los nombre por su nombre
		path = path.map(function(name) { return nodoSet[name]; });

		//calcula la medida
		var length = 0;
		for(var i = 0, j = 1; j < path.length; j = (i = j) + 1) {
			if(path[i] == null)
				return null;
			var edge = path[i].getEdgeTo(path[j]);
			if(edge == null)
				return null;
			else
				length += edge.getWeight();
		}
		return length;
	}

	//Una prioridad en la cola para usar el algoritmo de Dijkstra
	var PriorityQueue = typeof FibonacciHeap != "undefined" ? FibonacciHeap :
						require("./fibonacciHeap.js");

	/**	Calcula la distancia entre dos nodos, asumiento que o hay tamaños negativos
	 *
	 *	@param	Nodo de inicio
	 *	@param	Nodo fin
	 *	@return	Distancia entre los dos nodos
	 */
	Grafos.getDistance = function(start, end)
	{
		//Algoritmo de Dijkstra en código (transpilado de java)
		//Lo que se hace es ir buscando el nodo con arista de menor tamaño que aún no ha sido evaluado.

		var verticesToCheck = new PriorityQueue();
		var hasBeenQueued = {};
		var processNodo = function(nodo, distance) {
			var edges = nodo.getEdges();
			for(var i = 0; i < edges.length; i++) {
				var newVert = edges[i].getDest();
				var newDist = distance + edges[i].getWeight();
				if(hasBeenQueued[newVert])
					try { // try block needed in case newVert was removed
						verticesToCheck.decreaseKey(newVert, newDist);
					} catch(e) {}
				else {
					verticesToCheck.add(newDist, newVert);
					hasBeenQueued[newVert] = true;
				}
			}
		}

		//Creamos el el primer recorrido c

		var queueElem;
		var i = 0;
		processNodo(start, 0);
		while((queueElem = verticesToCheck.extractMin()) != null) {
			
			var distance = queueElem.key;
			var nodo = queueElem.value;
			if(nodo == end)
				return distance;
			else
				processNodo(nodo, distance);
			
			i++;
		}
		return null;
	};

	/**	Calcular el número de rutas de un nodo a otro
	 *
	 *	@param	startNodo Nodo inicio
	 *	@param	endNodo	Nodo fin
	 *	@param	maxLength	Tamaño máximo de la ruta
	 *	@param	exactLength	Bandera para saber si las rutas deben tener un tamaño
	 *	@param	useWeights	Tamaño 1 por defecto
	 *	@param	nodoSet Objeto con todos los nodos
	 *
	 *	@return	Número de rutas que cumplen las condiciones
	 */
	Grafos.numPaths = function(	startNodo, endNodo, maxLength,
									exactLength, useWeights = false, nodoSet)
	{
		var pathCounts = [];
		for(var thisLen = 0; thisLen <= maxLength; thisLen++) {
			pathCounts[thisLen] = {};
			for(var nodoName in nodoSet) {
				var nodo = nodoSet[nodoName];
				var count = 0;
				var edges =	nodo.getEdges();
				for(var i = 0; i < edges.length; i++) {
					var edgeLen = useWeights ? edges[i].getWeight() : 1;
					var edgeDest = edges[i].getDest();
					if(edgeLen <= thisLen)
						count += pathCounts[thisLen-edgeLen][edgeDest];
				}
				if((nodo == endNodo) && (!exactLength || (thisLen == 0)))
					count++;
				pathCounts[thisLen][nodo] = count;
			}
		}

		//Quita el camino inicial de tamaño 0
		return pathCounts[maxLength][startNodo] -
				((!exactLength || (maxLength == 0)) &&
					(startNodo == endNodo) ? 1 : 0);
	}
})(
	//si se corre con node se exporta, de lo contrario se instancia
	(typeof module == "object") && (typeof module.exports == "object") ?
		module.exports : (this.Grafos = {})
);
