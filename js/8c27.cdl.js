'use strict';

(function( window ) {
  // Define object.
  var d3 = window.d3,
    Q = window.Q,
    _ = window._,
    $ = window.$;

  // Create the chart object.
  window.CDL = {};
  var cdl = window.CDL;

  var svgContainer,
    g,
    center,
    background,
    system,
    width = 960,
    height = 500,
    delay = 250;


  /**
   * Create the 'Canvas' area, it's possible define the dimensions.
   *
   * @param width
   * @param height
   */
  function prepareScenario() {

    // Behaviours.
    function zoom() {
      system.attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
    }

    var zoomSvg = d3.behavior.zoom()
      .center([window.innerWidth / 2, window.innerHeight / 2])
      .scaleExtent([0.5, 10])
      .on('zoom', zoom);

    // Canvas.
    svgContainer = d3.select('body').append('svg')
      .attr('id', 'chart')
      .attr('width', '100%')
      .attr('height', '100%')
      .call(zoomSvg)
      .on('dblclick.zoom', null);

    // Background.
    background =  svgContainer.append('rect')
      .attr('id', 'backgroud')
      .attr('width', width)
      .attr('height', height);

    // System.
    system = svgContainer.append('g')
      .attr('id', 'system');
  }

  /**
   * Promises of getting the JSON data.
   *
   * @returns {promise}
   */
  function preparingData() {
    var deferred = Q.defer();
    // Relative path of the JSON file.
    var src = window.location.origin + window.location.pathname + 'data/tree.json';

    d3.json(src, function(error, json) {
      if (error) {
        return console.warn(error);
      }
      deferred.resolve(json);
    });

    return deferred.promise;
  }

  /**
   *
   * http://bl.ocks.org/mbostock/4063550
   *
   * @param data
   */
  function CDL(data) {
    // Center point calculation.
    var centerPoint = {
      width: function() {
        return window.innerWidth/2;
      },
      height: function() {
        return window.innerHeight/2;
      }
    };
    
    // Define the new root position.
    var rootPosition = {
      x: width/2,
      y: -height/2
    };

    var line,
      nodeCentered,
      tree,
      nodes,
      node,
      links,
      pointsByDepth,
      trianglePoints,
      text,
      nodeExtend,
      draw;

    // Index of the actual node centered
    nodeCentered = null;


    /**
     * Return the x,y translation to the center of the canvas in an array [x,y].
     *
     * @param node
     * @returns {Array}
     */
    function getCoordinateToCenter(node) {
      var coordinate = [];

      coordinate[0] = (centerPoint.width()) - node.x;
      coordinate[1] = (centerPoint.height()) - node.y;

      return coordinate;
    }

    /**
     * Click node center in the canvas the node.
     * @param node
     */
    function clickNode(node) {
      var move = [],
        points = [];

      // Check if it is the first or second click.
      if (!nodeCentered || nodeCentered !== node.id) {
        move = getCoordinateToCenter(node);

        // Storage the id of the actual node center.
        nodeCentered = node.id;

        // Connect siblings.
        // @todo style line to connect the siblings.
        points = node.toogleSiblings();
        draw().connection(points, node.id);

        // Go to the detail page.
        window.location = window.location.origin + window.location.pathname + '#/' + node.guid;
      }
      else if (nodeCentered === node.id) {
        secondClickNode(node);
        nodeCentered = false;
      }

    }

    /**
     * Second click node open the page related with the node.
     * @param node
     */
    function secondClickNode(node) {
      // If root element, do not perform any action.
      if (node.depth === 0) {
        return;
      }

      // If it's chronological node, go up until the parent not chronological and set like active node.
      while (node.type === 'chronological') {
        node = node.parent;
      }

      // Go to the detail page.
      window.location = window.location.origin + window.location.pathname + 'pages/' + node.guid;
    }

    // Data Tree Layout.
    tree = d3.layout.tree()
      .size([width, height])
      .separation(function(a, b) { return (a.parent === b.parent ? 1 : 2); });

    // Data binding.
    nodes = tree.nodes(data);
    links = tree.links(nodes);

    /**
     * Return an with the properties of the according the type of the node.
     *
     * @returns {{x: *, y: *, width: *, height: *}}
     */
    text = function() {
      var nodeType = {
        root: {
          x:-100,
          y:-100,
          width:220,
          height:220,
          class: 'root-title'
        },
        default: {
          x:0,
          y:-70,
          width:120,
          height:80,
          class: 'default'
        }
      };

      function get(property) {
        return function(node) {
          if (typeof node.type === 'undefined' || node.depth > 1) {
            return 0;
          }

          return nodeType[node.type][property];
        };
      }

      return {
        x: get('x'),
        y: get('y'),
        width: get('width'),
        height: get('height'),
        html: function(node) {
          var e = $('<div>');
          // Only show the names in the first level of depth.
          if (node.depth <= 1 ) {
            e.append(
              $('<div class="titles">')
              .addClass(nodeType[node.type].class)
              .html(node.name)
            );
            return e.html();
          }
        }
      };
    };

    /**
     * Helper to add style the nodes according to its type.
     *
     * @returns {*}
     */
    nodeExtend = function() {
      var nodeType = {
        default: {
          fill: 'black',
          stroke: 'black',
          r: 5
        },
        bastard: {
          fill: 'white',
          stroke: 'black',
          r: 5
        },
        chronological: {
          fill: 'white',
          stroke: 'black',
          r: 5,
          innerRadio: 2
        },
        siblings: {
          fill: 'blue',
          stroke: 'blue',
          r: 5
        },
        selected: {
          fill: 'red',
          stroke: 'red',
          r: 20
        },
        actived: {
          fill: 'red',
          stroke: 'red',
          r: 5
        },
        root: {
          fill: 'black',
          stroke: 'black',
          r: 160
        },
        inner: {
          fill: 'black',
          r: 3
        }
      };

      function get(property) {
        return function(node) {
          return nodeType[node.type][property];
        };
      }

      return {
        fill: get('fill'),
        stroke: get('stroke'),
        r: get('r'),
        inner: function(node) {
          if (node.type === 'chronological') {
            return nodeType[node.type].innerRadio;
          }

          return 0;
        }
      };
    };

    draw = function() {
      return {
        all: function() {
          var selection,
            circles,
            titles;

          // Selection of the objects.
          selection = g.selectAll('.node');
          circles = selection.select('circle');
          titles = selection.select('.titles');

          // Refresh properties of the circles.
          circles.attr('r', nodeExtend().r)
            .style('fill', nodeExtend().fill )
            .style('stroke', nodeExtend().stroke );

        },
        /**
         * Render a line between the siblings nodes of the clicked circle.
         *
         * @param points
         *  Collection of point in the format {x,y}
         * @param index
         *  Id of one of the nodes
         */
        connection: function(points) {
          var connection,
            line;

          // Create the siblings connections with
          connection = d3.svg.line()
            .x(function(line) { return line.x; })
            .y(function(line) { return line.y; })
            .interpolate('linear');

          line = svgContainer.selectAll('path')
            .data([points])
            .enter()
            .append('path')
            .attr('d', connection)
            .style('fill', 'red' )
            .style('stroke', 'red' )
            .style('stroke-width', 2);

        }
      };
    };

    // Node properties and methods - Data modification.
    nodes.forEach(function(node, index) {
      // Add root type.
      if (node.depth === 0) {
        node.type = 'root';
      }
      node.id = index;
      node.active = 0;
      node.selected = false;
      node.styleNode = node.type;
      // Multiply the x and y values to add the correct separation between the nodes.
      // This values are related with the node size.
      node.x = node.x * 1.5;
      node.y = node.y;
      // Add new behaviours
      node.toogleActive = function() {
        this.active = (!this.active) ? 1 : 0;
      };

      node.getSiblings = function() {
        return this.parent.children;
      };

      node.toogleSelection = function() {
        this.selected = !this.selected;
      };

      node.getState = function() {
        return {
          id: this.id,
          active: this.active,
          selected: this.selected,
          type: this.type,
          styleNode: this.styleNode
        };
      };

      node.toogleSiblings = function() {
        var siblings,
          points = [];

        // Activate siblings.
        if (node.depth !== 0) {
          siblings = this.getSiblings();
          // Mark point 'start' and 'end' for the line to connect the sibling.
          _.min(siblings, function(node) { return node.x; }).connection = 'end';
          _.max(siblings, function(node) { return node.x; }).connection = 'start';

          siblings.forEach(function(node) {
            node.toogleActive();

            // Points for the connection.
            points.push({
              x: node.x,
              y: node.y
            });
          });
        }

        // Activate an select this node
        this.toogleSelection();

        return points;
      };

      node.getPoints = function() {
        return {
          x: this.x,
          y: this.y
        };
      };
    });

    // Data modification.
    nodes.forEach(function(link) {
      link.lineColor = 'black';
      // Remove links from the root.
      if (link.depth === 0) {
        link.lineColor = 'white';
      }
    });

    // Nodes.
    g = system.append('g')
      .attr('id', 'nodes')
      .style('stroke', 'black')
      .style('stroke-width', '1')
      .style('fill', 'none');

    // Center point of the system.
    center = svgContainer.append('svg:circle')
      .attr('class', 'center')
      .style('fill', 'transparent')
      .attr('r', 0)
      .attr('cx', function() { return centerPoint.width(); })
      .attr('cy', function() { return centerPoint.height(); });

    // Line path generator.
    line = d3.svg.line()
      .x(function(line) { return line.x; })
      .y(function(line) { return line.y; })
      .interpolate('linear');

    //Links.
    g.selectAll('.link')
      .data(links)
      .enter().append('path')
      .attr('class', 'link')
      .attr('d', function(d) {
        function x(d) { return d.x; }
        function y(d) { return d.y; }

        return 'M' + x(d.source) + ',' + y(d.source) + 'L' + x(d.target) + ',' + y(d.target);
      })
      .style('stroke-width', 1)
      .style('stroke', function(d) {
        return d.source.lineColor;
      });

    // Dashed Lines.
    pointsByDepth = _.groupBy(nodes, function(node){ return node.depth; });
    _.each(pointsByDepth, function(points, index) {
      var coordinates = [];

      // Filter tree depth with more that 1 node.
      if (points.length > 1) {
        // Filter coordinates of the point.
        _.each(points, function(node) {
          coordinates.push(node.getPoints());
        });

        // Render the line.
        g.selectAll('.points')
          .data([coordinates])
          .enter()
          .append('path')
          .attr('id', 'dashed-' + index)
          .attr('d', line)
          .style('fill', 'none')
          .style('stroke', 'black')
          .style('stroke-dasharray', ('2, 2'))
          .style('stroke-width', 1);
      }
    });

    // Triangle.
    trianglePoints = [];
    _.each(
      // Obtain only the nodes of the depth 0 and 1.
      _.flatten(
        _.filter(pointsByDepth, function(node, index) {
          // Reposition the point of the root.
          if (index === '0') {
            node[0].x = rootPosition.x;
            node[0].y = rootPosition.y;
          }
          return index < 2;
        })
      ),
      /**
       * Get triangle points in the structure {x,y}
       *
       * @param node
       */
      function(node) {
        trianglePoints.push(node.getPoints());
      }
    );

    g.selectAll('.pTriangle')
      .data([trianglePoints])
      .enter()
      .append('path')
      .attr('id', 'triangle')
      .attr('d', line)
      .style('fill', '#F5F5F5')
      .style('stroke', '#F5F5F5')
      .style('stroke-width', 1);


    // Circles.
    node = g.selectAll('.node')
      .data(nodes)
      .enter().append('g')
      .attr('id', function(node, index) { return 'n' + index; })
      .attr('guid', function(node) { return node.guid; })
      .attr('class', 'node')
      .attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; });

    // Nodes.
    node.append('circle')
      .attr('id', function(node, index) { return 'n' + index + '-circle'; })
      .attr('r', nodeExtend().r )
      .style('fill', nodeExtend().fill )
      .style('stroke', nodeExtend().stroke )
      .style('stroke-width', 1);

    // Chronological internal circle.
    node.append('circle')
      .attr('id', function(node, index) { return 'n' + index + '-circle-internal'; })
      .attr('r', nodeExtend().inner )
      .attr('fill', 'black' );

    // Node titles.
    node.append('foreignObject')
      .attr('x', text().x)
      .attr('y', text().y)
      .attr('width', text().width)
      .attr('height', text().height)
      .append('xhtml:body')
      .attr('class', 'area')
      .html( text().html );

    // Mask of the node to handle events.
    node.append('circle')
      .attr('r', nodeExtend().r )
      .style('fill', 'transparent' )
      .style('stroke', 'node' )
      .on('click', clickNode )
      .on('touchstart', clickNode);


    // Public CDL API.
    return {
      setBackgroud: function() {
        background.style('fill', 'white')
          .attr('transform', 'translate(30, 450)');

        system.attr('transform', 'translate(30, 450)');
      },
      setCenter: function(color) {
        center.attr('r', 5)
          .style('fill', color)
          .attr('cx', function() { return centerPoint.width(); })
          .attr('cy', function() { return centerPoint.height(); });
      },
      setRootStyle: function() {
        // Update data.
        var selection = d3.select('#n0');
        selection.data().pop().styleNode = 'root';
      },
      selectNodeById: function(id) {
        return d3.select( '#n' + id );
      },
      setFocus: function(index, move) {
        // Validate
        system.transition()
          .duration(delay)
          .attr('transform', 'translate(' + move.toString() + ')');
      },
      repositionRoot: function() {
        // Update data.
        var selection = d3.select('#n0');
        selection.attr('transform', 'translate(' + rootPosition.x + ', ' + rootPosition.y + ')');
      },
      rootColor: function(color) {
        // Update data.
        var selection = d3.select('#n0').select('circle');
        selection.style('fill', color);
      },
      redraw: function() {
        draw().all();
      }
    };
  }

  // Preparing scenario, content and rendering.
  prepareScenario();

  // Draw the elements with the promise of load data.
  preparingData().then(function(data) {
    // Radial tree layout render.
    cdl.chart = new CDL(data);
    cdl.chart.setBackgroud();
    cdl.chart.repositionRoot();
    cdl.chart.setCenter('transparent');

    // Add window Event Listeners.
    window.onresize = function() {
      cdl.chart.setCenter('transparent');
    };

  });

})( window );
