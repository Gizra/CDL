'use strict';

(function() {
  // Define object.
  var d3 = window.d3;
  var Q = window.Q;
  var _ = window._;

  var svgContainer,
    g,
    center,
    showCenter = false,
    background,
    system,
    c,
    width = 960,
    height = 500,
    diameter = 960,
    delay = 750;

  // Define the scales of the depth of the tree.
  var depthScale = d3.scale.linear()
    .domain([0, 30])
    .range([0, width]);

  // The states of the node are node.active or node.selected
  // with values 0 or 1.


  // Define color circles of node states.
  var nodeColor = d3.scale.linear()
    .domain([0, 1])
    .range(['black', 'red', 'white']);

  // Define size of fonts node.
  var fontScale = d3.scale.linear()
    .domain([0, 1])
    .range([2.5, 5]);

  // Define color of the text, for the nodes (active or inactive).
  var textColor = d3.scale.linear()
    .domain([0, 1, 3])
    .range(['black', 'red', 'white']);

  /**
   * Handle the combination of states in a node, this is generated with the
   * properties node.selected and node.active.
   *
   * This function is a helper the style of the graph.
   *
   * @param node
   *
   * @return state
   *  Integer value.
   *  0: no active & no selected.
   *  1: active & no selected.
   *  2: no active & selected.
   *  3: active & selected.
   */
  function getNodeState(node) {
    var state;

    if (!node.active && !node.selected) {
      state = 0;
    }
    else if (node.active && !node.selected) {
      state = 1;
    }
    else if (!node.active && node.selected) {
      state = 2;
    }
    else if (node.active && node.selected) {
      state = 3;
    }

    return state;
  }

  /**
   * Create the 'Canvas' area, it's possible define the dimensions.
   *
   * @param width
   * @param height
   */
  function prepareScenario() {
    diameter = 960;
    width = diameter;
    height = diameter;

    // Behaviours.
    function zoomRadial() {
      system.attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
    }

    var zoom = d3.behavior.zoom()
      .center([width / 2, height / 2])
      .scaleExtent([0.5, 10])
      .on('zoom', zoomRadial);

    // Canvas.
    svgContainer = d3.select('body').append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .call(zoom)
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
   * On click a circle apply style transformations, connect the siblings nodes,
   * move the center and zoom the circle to the center.
   *
   * @param node
   * @param index
   */
  function centerNode(node, index) {
    var siblings = [], points = [];

    /**
     * Update the node data onClick event.
     *
     * @param node
     *  Clicked node.
     */
    function nodesUpdate(node) {
      var lastSelected;

      // Inactive other nodes.
      lastSelected = _.where(nodes, {active: 1});
      if (lastSelected.length) {
        lastSelected.forEach(function(node) {
          node.active = 0;
          node.selected = 0;
        });
      }

      // Validate that the node is not the root's node (first parent), and active the siblings nodes of the selected
      // circle.
      if (node.depth !== 0) {
        siblings = node.parent.children;
        // Mark point 'start' and 'end' for the line to connect the sibling.
        _.min(siblings, function(node) { return node.x; }).connection = 'end';
        _.max(siblings, function(node) { return node.x; }).connection = 'start';

        siblings.forEach(function(node) {
          node.active = 1;
          node.selected = 0;
          // Points for the connection.
          points.push({
            x: node.x,
            y: node.y
          });
        });
      }

      // Active the node.
      node.active = 1;
      node.selected = 1;
    }


    /**
     * Render a line between the siblings nodes of the clicked circle.
     */
    function renderConnection() {
      // Remove connection before if exist.
      g.select('.lines').select('path')
        .data([])
        .exit()
        .remove();

      // Create the siblings connections with
      var connection = d3.svg.line()
        .x(function(line) { return line.x; })
        .y(function(line) { return line.y; })
        .interpolate('linear');

      g.select('.lines').selectAll('path'+index)
        .data([points])
        .enter()
        .append('path')
        .style('fill', 'white' )
        .style('stroke', 'white' )
        .style('stroke-width', 2)
        .transition()
        .duration(delay)
        .style('fill', 'red' )
        .style('stroke', 'red' )
        .style('stroke-width', 2)
        .attr('id', 'p'+index)
        .attr('d', connection);
    }

    // Update data node on click.
    nodesUpdate(node);
    // Apply style svg circle selected and siblings circles.
    nodesStyle();
    // Connect siblings with lines.
    renderConnection();
  }

  /**
   * Apply transformation to all nodes after change state.
   */
  function nodesStyle() {
    // Circles.
    d3.select('g.tree').selectAll('circle')
      .transition()
      .duration(delay)
      .attr('r', function(node) { return nodeScale(node.selected); })
      .style('fill', fillNode)
      .style('stroke', function(node) { return (node.active) ?  'red' : 'black'; } );

    // Texts.
    d3.select('g.tree').selectAll('text.name')
      .transition()
      .duration(delay/7)
      .attr('font-size', function(node) { return fontScale(node.selected); })
      .style('fill', function(node) { return textColor(getNodeState(node)); })
      .attr('dy', function(node) { if (node.selected) { return 0; } return node.children ? 1 : 10; })
      .attr('dx', function(node) { if (node.selected) { return 0; } return node.children ? 7 : node; })
      .attr('text-anchor', function(node) { if (node.selected) { return 'middle'; } return node.children ? 'start' : 'middle'; });

    d3.select('g.tree').selectAll('text.id')
      .transition()
      .duration(delay/7)
      .text( function(node) { return (node.active) ? '' : node.chronologicalId; } );
  }


  /**
   *
   * http://bl.ocks.org/mbostock/4063550
   *
   * @param data
   */
  function CDL(data) {
    /// Scales.

    // Define size (radius) of circles of node states.
    var nodeScale = d3.scale.linear()
      .domain([0, 1])
      .range([5, 20]);


    /// Helpers.
    /**
     * Helper to fill the nodes according to its type.
     *
     * @param node
     * @returns {string
     */
    function fillNode(node) {
      var color;

      if (node.styleNode === 'bastard' || node.styleNode === 'chronological' || node.styleNode === 'root') {
        color = 'white';
      }
      else if (node.styleNode === 'default' || node.styleNode === 'sibling') {
        color = 'black';
      }
      else if (node.styleNode === 'selected') {
        color = 'red';
      }

      return color;
    }

    /**
     * Helper to fill the nodes according to its type.
     *
     * @param node
     * @returns {string
     */
    function strokeNode(node) {
      var color;

      if (node.styleNode === 'root' || node.styleNode === 'selected') {
        color = 'red';
      }

      return color;
    }

    /**
     * Helper to set size the nodes according to its type.
     *
     * @param node
     * @returns {*}
     */
    function sizeNode(node) {
      var size;

      if (node.styleNode === 'default' || node.styleNode === 'bastard' || node.styleNode === 'chronological') {
        size = 5;
      }
      else if (node.styleNode === 'root') {
        size = 40;
      }
      else if (node.styleNode === 'selected' || node.styleNode === 'sibling') {
        size = 20;
      }
      return size;
    }

    /**
     * Helper to set color of the text according to its type.
     *
     * @param node
     * @returns {*}
     */
    function fillText(node) {
      var color;

      if (node.styleNode === 'root') {
        color = 'red';
      }
      else if (node.styleNode === 'selected' || node.styleNode === 'sibling') {
        color = 'white';
      }
      return color;
    }

    /**
     * Helper to set size the text according to its type.
     *
     * @param node
     * @returns {*}
     */
    function sizeText(node) {
      var size = 5;

      if (node.styleNode === 'root') {
        size = 20;
      }
      else if (node.styleNode === 'selected' || node.styleNode === 'siblings') {
        size = 10;
      }
      return size;
    }

    /**
     * Helper to print the node information.
     *
     * @param node
     *   Node element.
     * @returns string
     */
    function textNode(node) {
      if (node.type === 'chronological') {
        return node.chronologicalName;
      }
      else if (node.type === 'bastard') {
        return node.bastardName;
      }
      else {
        return node.name;
      }
    }



    /**
     * Apply style to the node selection according yhe node.styleType
     *
     * @param selection
     */
    function styleNode(selection) {
      var circle,
        title;

      if (typeof selection === 'undefined') {
        selection = g.selectAll('.node');
      }

      circle = selection.select('circle');
      title = selection.select('text');

      circle.attr('r', function(node) { return sizeNode(node); })
        .style('fill', fillNode )
        .style('stroke', strokeNode );

      title.attr('font-size', function(node) { return fontScale(node.selected); })
        .style('fill', fillText)
        .attr('font-size', sizeText);
    }

    /**
     * Create a separation from the click event and the double click event.
     * https://gist.github.com/tmcw/4067674
     *
     * @returns {*}
     */
    function clickCancel() {
      var event = d3.dispatch('click', 'dblclick');
      function cc(selection) {
        var down,
          tolerance = 5,
          last,
          wait = null;
        // euclidean distance
        function dist(a, b) {
          return Math.sqrt(Math.pow(a[0] - b[0], 2), Math.pow(a[1] - b[1], 2));
        }
        selection.on('mousedown', function() {
          down = d3.mouse(document.body);
          last = +new Date();
        });
        selection.on('mouseup', function() {
          if (dist(down, d3.mouse(document.body)) > tolerance) {
            return;
          }
          else {
            if (wait) {
              window.clearTimeout(wait);
              wait = null;
              event.dblclick(d3.event);
            }
            else {
              wait = window.setTimeout((function(e) {
                return function() {
                  event.click(e);
                  wait = null;
                };
              })(d3.event), 300);
            }
          }
        });
      }
      return d3.rebind(cc, event, 'on');
    }

    /**
     * Click node.
     * @param node
     */
    function clickNode(event) {

    }

    /**
     * Double click node.
     * @param node
     */
    function doubleClickNode(event) {
      var node;

      // Get element.
      node = d3.select(event.toElement).data()[0];

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

    // Bind events.
    var nodeEvent = clickCancel();
    nodeEvent.on('click', clickNode )
      .on('dblclick', doubleClickNode );


    // Data Tree Layout.
    var tree = d3.layout.tree()
      .size([360, diameter  * 1.35])
      .separation(function(a, b) { return (a.parent === b.parent ? 0.70 : 1) / a.depth; });

    // Data binding.
    var nodes = tree.nodes(data);
    var links = tree.links(nodes);

    // Data modification.
    nodes.forEach(function(node) {
      node.name = node.name.replace(/.{1,20} /g, '$&\n');
      node.active = 0;
      node.selected = false;
      node.styleNode = node.type;
    });

    // Orbits.
    system.append('g')
      .attr('id', 'orbits')
      .selectAll('circle')
      .data(d3.range(10, width * 1.35, 75))
      .enter().append('circle')
      .attr('class', 'orbit')
      .attr('cx', width/2)
      .attr('cy', height/2)
      .attr('r', function(d) { return d; })
      .style('fill', 'none')
      .style('stroke', 'black');

    // Nodes.
    g = system.append('g')
      .attr('id', 'nodes')
      .style('stroke', 'black')
      .style('stroke-width', '1')
      .style('fill', 'white')
      .attr('transform', 'translate(' + diameter / 2 + ',' + diameter / 2 + ')');

    // Center point of the system.
    center = svgContainer.append('svg:circle')
      .attr('class', 'center')
      .style('fill', 'red')
      .attr('r', 0)
      .attr('cx', function() { return width/2; })
      .attr('cy', function() { return height/2; });

    //Links.
    g.selectAll('.link')
      .data(links)
      .enter().append('path')
      .attr('class', 'link')
      .attr('d', function(d) {
        function x(d) { return d.y * Math.cos((d.x - 90) / 180 * Math.PI); }
        function y(d) { return d.y * Math.sin((d.x - 90) / 180 * Math.PI); }

        return 'M' + x(d.source) + ',' + y(d.source) + 'L' + x(d.target) + ',' + y(d.target);
      })
      .style('stroke-width', 2);

    // Circles.
    var node = g.selectAll('.node')
      .data(nodes)
      .enter().append('g')
      .attr('id', function(node, index) { return 'n' + index; })
      .attr('class', 'node')
      .attr('transform', function(d) { return 'rotate(' + (d.x - 90) + ')translate(' + d.y + ')'; });

    // Nodes.
    node.append('circle')
      .attr('id', function(node, index) { return 'n' + index; })
      .attr('r', function(node) { return nodeScale(node.selected); })
      .style('fill', fillNode )
      .style('stroke', function(node) { return (node.active) ?  'red' : 'black'; } )
      .call(nodeEvent);

    // Node titles.
    node.append('text')
      .attr('class', 'name')
      .style('font-family', 'Verdana')
      .style('stroke-width', '0')
      .attr('text-anchor', 'middle')
      .attr('transform', function(d) { return 'rotate(' + (-d.x + 90) + ')'; })
      .text( textNode )
      .call(nodeEvent);

    // Node ID.
    node.append('svg:text')
      .attr('class', 'id')
      .style('font-family', 'Verdana')
      .attr('font-size', sizeText)
      .attr('dy', 2)
      .attr('dx', 0)
      .attr('text-anchor', 'middle')
      .attr('transform', function(d) { return 'rotate(' + (-d.x + 90) + ')'; })
      .text( function(node) { return node.chronologicalId; } )
      .call(nodeEvent);


    // Public CDL API.
    return {
      setBackgroud: function() {
        background.style('fill', 'white');
      },
      setCenter: function() {
        center.attr('r', 10);
      },
      clearText: function(selection) {
        selection.style('fill', 'none');
      },
      setRootStyle: function() {
        // Update data.
        var selection = d3.select('#n0');
        selection.data().pop().styleNode = 'root';
        nodes[0].styleNode = 'root';
        // Style node.
        styleNode();
      },
      selectNode: function(selection) {
        var node = selection.data()[0];

        // Update data.
        selection.data().forEach(function(e) {
          e.selected = true;
          e.styleNode = 'selected';
        });

        _.each(_.where(nodes, {depth: node.depth}), function(e, index) {
          nodes[index].styleNode = 'sibling';
        });

        // Style node.
        styleNode();
      }
    };
  }


  // Preparing scenario, content and rendering.
  prepareScenario();

  // Draw the elements with the promise of load data.
  preparingData().then(function(data) {
    // Radial tree layout render.
    c = new CDL(data);
    c.setBackgroud();
    // c.setCenter();

    // Clear titles.
    c.clearText(d3.select('#nodes').selectAll('.node').select('text'));
    c.setRootStyle();


    c.selectNode(d3.select('#n39'));

  });

})();
