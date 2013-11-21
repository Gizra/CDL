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
    width = 1000,
    height = 800,
    delay = 750;

  // Define the scales of the depth of the tree.
  var depthScale = d3.scale.linear()
    .domain([0, 7])
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

  // Define size of fonts node.
  var textColor = d3.scale.linear()
    .domain([0, 1, 3])
    .range(['black', 'red', 'white']);

  // Define size of fonts node.
  var lineColor = d3.scale.linear()
    .domain([0, 1])
    .range(['white', 'red']);

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
    data.y0 = 0;

    tree = d3.layout.tree()
      .size([width, height]);

    nodes = tree.nodes(data);
    links = tree.links(nodes);

    // Prepare data for the tree.
    nodes.forEach(function(d) {
      d.y = (d.depth === 0) ? 40 : depthScale(d.depth);
      d.active = 0;
      d.selected = 0;
    });

    // Keep it like example.
    // links.forEach(function(d) {
    //   console.log(d.source.y, d.target.y, d.source.depth*10, d.target.depth);
    // });

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
      .attr('x1', function(d) { return d.source.x; })
      .attr('y1', function(d) { return d.source.y; })
      .attr('x2', function(d) { return d.target.x; })
      .attr('y2', function(d) { return d.target.y; });

    var node = g.selectAll('g.node')
      .data(nodes)
      .enter().append('svg:g')
      .attr('transform', function(d) { return 'translate(' + d.x + ',' + (d.y) + ')'; })
      .attr('class', 'node')
      .attr('id', function(d, i) { return 'n' + i; });

    // Add circles.
    node.append('svg:circle')
      .attr('r', function(d) { return nodeScale(d.selected); })
      .style('fill', function(d) { return nodeColor(d.active); })
      .on('click', centerNode);

    // Place the name attribute, left or right depending of the children.
    node.append('svg:text')
      .attr('font-size', function(d) { return fontScale(d.selected); })
      .attr('dy', function(d) { return d.children ? 1 : 10; })
      .attr('dx', function(d) { return d.children ? 7 : d; })
      .attr('text-anchor', function(d) { if (d.selected) { return 'middle'; } return d.children ? 'start' : 'middle'; })
      .text(function(d) { return d.name; });
  }

  /**
   * Zoom canvas with the mouse wheel.
   */
  function zoomCanvas() {
    g.attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
  }

  /**
   * On click a circle apply style transformations, connect the brothers nodes,
   * move the center and zoom the circle to the center.
   *
   * @param node
   * @param index
   */
  function centerNode(node, index) {
    var nx, ny, brothers = [], points = [];

    /**
     * Update the node data onClick event.
     *
     * @param node
     *  Clicked node.
     */
    function nodesUpdate(node) {
      var lastSelected;

      // Enable node: {node.active: 1, node.selected: 1}
      // Disable node: {node.active: 0, node.selected: 0}

      // Disable other nodes.
      lastSelected = _.where(nodes, {active: 1});
      if (lastSelected.length) {
        lastSelected.forEach(function(node) {
          node.active = 0;
          node.selected = 0;
        });
      }

      // Enable brothers of the select circle.
      if (node.depth !== 0) {
        brothers = node.parent.children;
        // Mark point 'start' and 'end' for the line to connect the brother.
        _.min(brothers, function(node) { return node.x; }).connection = 'end';
        _.max(brothers, function(node) { return node.x; }).connection = 'start';

        brothers.forEach(function(node) {
          node.active = 1;
          node.selected = 0;

          // Points.
          points.push({
            x: node.x,
            y: node.y
          });
        });
      }

      // Enable the node.
      node.active = 1;
      node.selected = 1;
    }


    /**
     * Render a line between the brothers nodes of the clicked circle.
     */
    function renderConnection() {
      // Remove connection before if exist.
      g.select('.lines').select('path')
        .data([])
        .exit()
        .remove();

      // Create the brothers connections with
      var connection = d3.svg.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; })
        .interpolate('linear');

      console.log(lineColor(0));
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
        .attr('transform', null);  // 'translate(' + nx + ', ' + ny + ')'
    }

    // Update data node on click.
    nodesUpdate(node);
    // Apply style svg circle selected and brothers circles.
    nodesStyle();
    // Connect brothers with lines.
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
      .attr('r', function(d) { return nodeScale(d.selected); })
      .style('fill', function(d) { return nodeColor(d.active); });

    // Texts.
    d3.select('g.tree').selectAll('text')
      .transition()
      .duration(delay/7)
      .attr('font-size', function(d) { return fontScale(d.selected); })
      .style('fill', function(d) { return textColor(getNodeState(d)); })
      .attr('dy', function(d) { if (d.selected) { return 0; } return d.children ? 1 : 10; })
      .attr('dx', function(d) { if (d.selected) { return 0; } return d.children ? 7 : d; })
      .attr('text-anchor', function(d) { if (d.selected) { return 'middle'; } return d.children ? 'start' : 'middle'; });
  }

  // Preparing scenario, content and rendering.
  prepareScenario();

  // Draw the elements with the promise of load data.
  preparingData().then(function(data) {
    renderNetwork(data);
  });

})();
