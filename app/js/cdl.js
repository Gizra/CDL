'use strict';

(function() {
  // Define object.
  var d3 = window.d3;
  var Q = window.Q;

  var svgContainer,
    g,
    center,
    background,
    width = 1000,
    height = 800;

  // Define the scales.
  var depthScale = d3.scale.linear()
    .domain([0,6])
    .range([0, width]);

  /**
   * Create the 'Canvas' area, it's possible define the dimensions.
   *
   * @param width
   * @param height
   */
  function preapreScenario() {

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
    var tree,
      links,
      w = width,
      h = height;

    data.x0 = w/2;
    data.y0 = 0;

    tree = d3.layout.tree()
      .size([w, h]);

    var nodes = tree.nodes(data);
    links = tree.links(nodes);

    nodes.forEach(function(d) {
      d.y = (d.depth === 0) ? 50 : depthScale(d.depth);
    });

    links.forEach(function(d) {
      console.log(d.source.y, d.target.y, d.source.depth*10, d.target.depth);
    });

    console.log(data);
    console.log(nodes);
    console.log(links);


    var lines = g.append('svg:g')
      .attr('class', 'lines');

    // Add the links.
    var link = lines.selectAll('g.link')
      .data(links)
      .enter();

    // Define line.
    link.append('svg:line')
      .style('stroke', 'black')
      .attr('x1', function(d) { return d.source.x; })
      .attr('y1', function(d) { return d.source.y; })
      .attr('x2', function(d) { return d.target.x; })
      .attr('y2', function(d) { return d.target.y; });

    var node = g.selectAll('g.node')
      .data(nodes)
      .enter().append('svg:g')
      .attr('transform', function(d) { return 'translate(' + d.x + ',' + (d.y) + ')'; });

    // Add circles.
    node.append('svg:circle')
      .attr('r', 20)
      .style('fill', function(d) { return d.fill; });
    node.append('svg:circle')
      .attr('r', 15)
      .style('fill', '#FFF');

    // Place the name attribute, left or right depending of the children.
    node.append('svg:text')
      .attr('font-size', 2.5)
      .attr('text-anchor', 'middle')
      .text(function(d) { return d.name; });
  }

  /**
   * Zoom canvas with the mouse wheel.
   */
  function zoomCanvas() {
    g.attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
  }

  // Preparing scenario, content and rendering.
  preapreScenario();

  // Draw the elements with the promise of load data.
  preparingData().then(function(data) {
    renderNetwork(data);
  });

})();
