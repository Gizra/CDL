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
    zoomSvg,
    g,
    center,
    background,
    system,
    width = window.innerWidth * 0.6,
    height = window.innerHeight * 0.6,
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
      system
        .attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');

      if (d3.event.scale > 5) {
        if (!$('.default').first().hasClass('title-splash') ) {
          $('.default').addClass('title-splash');
          $('.default').removeClass('default');
        }
      }
      else {
        if (!$('.title-splash').first().hasClass('default') ) {
          $('.title-splash').addClass('default');
          $('.title-splash').removeClass('title-splash');
        }
      }
    }

    zoomSvg = d3.behavior.zoom()
      .center([window.innerWidth / 2, window.innerHeight / 2])
      .scaleExtent([1, 60])
      .on('zoom', zoom);


    // Canvas.
    svgContainer = d3.select('body').append('svg')
      .attr('id', 'chart')
      .attr('width', '100%')
      .attr('height', '100%')
      .on('dblclick.zoom', null)
      .call(zoomSvg);

    // Background.
    background =  svgContainer.append('rect')
      .attr('id', 'backgroud')
      .attr('width', width)
      .attr('height', height)
      .on('zoom', zoom);

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
    // Define the new root position.
    var rootPosition = {
      x: width/2,
      y: -height/3
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
      draw,
      chart;

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

      coordinate[0] = (draw().centerPoint().x) - node.x;
      coordinate[1] = (draw().centerPoint().y) - node.y;

      return coordinate;
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
      var levelFocus = 1;


      var nodeType = {
        root: {
          x:-50,
          y:-55,
          width:110,
          height:110,
          class: 'root-title'
        },
        default: {
          x: 2,
          y: 5,
          width:20,
          height:10,
          class: 'default'
        },
        focus: {
          x: 0,
          y: -70,
          width:100,
          height:80,
          class: 'focus'
        },
        chronological: {
          x: 2,
          y: 5,
          width:20,
          height:10,
          class: 'default'
        },
        bastard: {
          x: 2,
          y: 5,
          width:20,
          height:10,
          class: 'default'
        }
      };

      function get(property) {

        return function(node) {
          var type = node.type;

          if (typeof type === 'undefined') {
            return 0;
          }

          // Focus especific level of the tree.
          if (node.depth === 1) {
            type = 'focus';
          }

          return nodeType[type][property];
        };
      }

      return {
        x: get('x'),
        y: get('y'),
        width: get('width'),
        height: get('height'),
        html: function(node) {
          var type = node.type;

          // Focus especific level of the tree.
          if (node.depth === 1) {
            type = 'focus';
          }

          var e = $('<div>');
          // Only show the names in the first level of depth.
          e.append(
            $('<div class="titles">')
            .addClass(nodeType[type].class)
            .html(node.name)
          );
          return e.html();


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
          innerRadio: 1.5
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
          r: 80
        },
        inner: {
          fill: 'black',
          r: 1.5
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
        },
        click: function(node) {

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
            nodeExtend().secondClick(node);
            nodeCentered = false;
          }
        },
        /**
         * Second click node open the page related with the node.
         * @param node
         */
        secondClick: function(node) {
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

      };
    };

    draw = function() {
      // Handle the referencen information of the general chart g#system.
      var chartReference = {};

      // Define center point.
      chartReference.centerPoint = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      };

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

        },
        /**
         * Move a node to the center of the screen.
         *
         * @param index
         * @param move
         */
        setFocus: function(id, move) {

          // Validate
          system.transition()
            .duration(delay)
            .attr('transform', 'translate(' + move.toString() + ')scale(' + zoomSvg.scale() + ')');

        },
        scale: function() {
          // Validate
          system.transition()
            .duration(1000)
            .attr('transform', 'scale(2)');
        },
        centerPoint: function() {
          return chartReference.centerPoint;
        },
        setInitialPoint: function(x, y) {
          chartReference.initialPoint = {x: x, y: y};
        },
        initialPoint: function() {
          return chartReference.initialPoint;
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
      .attr('cx', function() { return draw().centerPoint().x; })
      .attr('cy', function() { return draw().centerPoint().y; });

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
      .html( text().html )
      .on('click', nodeExtend().click );

    // Mask of the node to handle events.
    node.append('circle')
      .attr('r', nodeExtend().r )
      .style('fill', 'transparent' )
      .style('stroke', 'node' )
      .on('click', nodeExtend().click )
      .on('touchstart', nodeExtend().click );


    // Public CDL API.
    return {
      setBackgroud: function() {
        chart = draw();
        chart.setInitialPoint(50,300);

        background.style('fill', 'white')
          .attr('transform', 'translate(' + chart.initialPoint().x + ', ' + chart.initialPoint().y + ')');
        system.attr('transform', 'translate(' + chart.initialPoint().x + ', ' + chart.initialPoint().y + ')');

        zoomSvg.translate([chart.initialPoint().x, chart.initialPoint().y]);
        zoomSvg.scale(1);
      },
      setCenter: function(color) {
        center.attr('r', 5)
          .style('fill', color)
          .attr('cx', function() { return draw().centerPoint().x; })
          .attr('cy', function() { return draw().centerPoint().y; });
      },
      setRootStyle: function() {
        // Update data.
        var selection = d3.select('#n0');
        selection.data().pop().styleNode = 'root';
      },
      selectNodeById: function(id) {
        return d3.select( '#n' + id );
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
      },
      getChart: function() {
        return system;
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
