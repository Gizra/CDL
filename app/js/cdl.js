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
    tree,
    nodes,
    links,
    width = 960,
    height = 800,
    delay = 750;

  // Define the scales of the depth of the tree.
  var depthScale = d3.scale.linear()
    .domain([0, 30])
    .range([0, width]);

  // The states of the node are node.active or node.selected
  // with values 0 or 1.

  // Define size (radius) of circles of node states.
  var nodeScale = d3.scale.linear()
    .domain([0, 1])
    .range([5, 20]);

  // Define color circles of node states.
  var nodeColor = d3.scale.linear()
    .domain([0, 1])
    .range(['black', 'red']);

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

    svgContainer = d3.select('body').append('svg')
      // Create container.
      .attr('width', width)
      .attr('height', height)
      .call(
        d3.behavior.zoom()
          .scaleExtent([1, 10])
          .on('zoom', zoomCanvas)
      );

    background = svgContainer.append('rect')
      .attr('class', 'background')
      .attr('width', width)
      .attr('height', height);

    // Create a tree.
    g = svgContainer.append('g')
      .attr('class', 'tree');

    showCenter = false;
    if (showCenter) {
      // Reference center point.
      center = svgContainer.append('svg:circle')
        .attr('class', 'center')
        .attr('r', 3)
        .attr('cx', function() { return width/2; })
        .attr('cy', function() { return height/2; });
    }

  }

  /**
   * Promises of getting the JSON data.
   *
   * @returns {promise}
   */
  function preparingData() {
    var deferred = Q.defer();
    // Relative path of the JSON file.
    var src = window.location.href + 'data/tree.json';

    d3.json(src, function(error, json) {
      if (error) {
        return console.warn(error);
      }
      deferred.resolve(json);
    });

    return deferred.promise;
  }

  /**
   * Render the SVG elements with the information in nodes object.
   * @param nodes
   */
  function renderNetwork(data) {
    // Render json data in d3 tree layout definition.
    // https://github.com/mbostock/d3/wiki/Tree-Layout.

    data.x0 = width/2;
    data.y0 = height/4;

    tree = d3.layout.tree()
      .size([width, height]);

    nodes = tree.nodes(data);
    links = tree.links(nodes);

    // Prepare data for the tree.
    nodes.forEach(function(node) {
      // @todo: positions with depth property.
      node.y = (node.depth === 0) ? 1+data.y0 : depthScale(node.depth)+data.y0;
      node.active = 0;
      node.selected = 0;
    });

    // Group of lines.
    var lines = g.append('svg:g')
      .attr('class', 'lines');

    // Add the links.
    var link = lines.selectAll('g.link')
      .data(links)
      .enter();

    // Define line.
    link.append('svg:line')
      .style('stroke', 'black')
      .style('stroke-width', 2)
      .attr('x1', function(line) { return line.source.x; })
      .attr('y1', function(line) { return line.source.y; })
      .attr('x2', function(line) { return line.target.x; })
      .attr('y2', function(line) { return line.target.y; });

    var svgNode = g.selectAll('g.node')
      .data(nodes)
      .enter().append('svg:g')
      .attr('transform', function(node) { return 'translate(' + node.x + ',' + node.y + ')'; })
      .attr('class', 'node')
      .attr('id', function(node, index) { return 'n' + index; });

    // Add circles.
    svgNode.append('svg:circle')
      .attr('r', function(node) { return nodeScale(node.selected); })
      .style('fill', fillNode )
      .style('stroke', function(node) { return (node.active) ?  'red' : 'black'; } )
      .on('click', centerNode );

    // Place the name attribute, left or right depending of the children.
    svgNode.append('svg:text')
      .attr('class', 'name')
      .attr('font-size', function(node) { return fontScale(node.selected); })
      .attr('dy', function(node) { return node.children ? 1 : 10; })
      .attr('dx', function(node) { return node.children ? 7 : node; })
      .attr('text-anchor', function(node) { if (node.selected) { return 'middle'; } return node.children ? 'start' : 'middle'; })
      .text( textNode );

    // Place the name attribute, left or right depending of the children.
    svgNode.append('svg:text')
      .attr('class', 'id')
      .attr('font-size', 5)
      .attr('dy', 2)
      .attr('dx', 0)
      .attr('text-anchor', 'middle')
      .text( function(node) { return node.chronologicalId; } )
      .on('click', centerNode );
  }

  /**
   * Helper to print the node information.
   *
   * @param d
   *   Node element.
   * @returns string
   */
  function textNode(node) {
    if (node.type === 'chronological') {
      return node.chronologicalName;
    }
    else {
      return node.name;
    }
  }

  /**
   * Helper to fill the nodes according to its type.
   *
   * @param d
   * @returns {*}
   */
  function fillNode(node) {
    if (node.type === 'chronological' && !node.active) {
      return 'white';
    }

    return nodeColor(node.active);
  }

  /**
   * Zoom canvas with the mouse wheel.
   */
  function zoomCanvas() {
    g.attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
  }

  /**
   * On click a circle apply style transformations, connect the siblings nodes,
   * move the center and zoom the circle to the center.
   *
   * @param node
   * @param index
   */
  function centerNode(node, index) {
    var nx, ny, siblings = [], points = [];

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

    /**
     * Get to the center the circle selected.
     */
    function focusCircle() {
      // Move the tree to the selection point.
      nx = (width/2) - node.x;
      ny = (height/2) - node.y;
      g.transition()
        .duration(delay)
        .attr('transform', null);
    }

    // Update data node on click.
    nodesUpdate(node);
    // Apply style svg circle selected and siblings circles.
    nodesStyle();
    // Connect siblings with lines.
    renderConnection();
    // Focus on the circle.
    focusCircle();

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

  // Preparing scenario, content and rendering.
  prepareScenario();

  // Draw the elements with the promise of load data.
  preparingData().then(function(data) {
    renderNetwork(data);
  });

})();
