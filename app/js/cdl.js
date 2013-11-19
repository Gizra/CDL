'use strict';

(function() {
  // Define object.
  var d3 = window.d3;
  var Q = window.Q;

  var svgContainer;

  /**
   * Create the 'Canvas' area, it's possible define the dimensions.
   *
   * @param width
   * @param height
   */
  function preapreScenario(width, height) {
    width = (!width) ? 10000 : width;
    height = (!height) ? 10000 : height;

    svgContainer = d3.select('body').append('svg')
      // Create container.
      .attr('width', width)
      .attr('height', height)
      .append('g');
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
   * Draw the SVG elements with the information in nodes object.
   * @param nodes
   */
  function renderNetwork(data) {
    // Render json data in d3 tree layout definition.
    // https://github.com/mbostock/d3/wiki/Tree-Layout.
    var tree,
      links,
      w = 3000,
      h = 3000;

    data.x0 = w/2;
    data.y0 = 0;

    tree = d3.layout.tree()
      .size([w, h]);

    var nodes = tree.nodes(data);
    links = tree.links(nodes);

    nodes.forEach(function(d) {
      d.y = (d.depth === 0) ? 50 : d.depth * 260;
    });

    links.forEach(function(d) {
      console.log(d.source.y, d.target.y, d.source.depth*10, d.target.depth);
    });

    console.log(data);
    console.log(nodes);
    console.log(links);

    var node = svgContainer.selectAll('g.node')
      .data(nodes)
      .enter().append('svg:g')
      .attr('transform', function(d) { return 'translate(' + d.x + ',' + (d.y) + ')'; });

    var link = svgContainer.selectAll('g.link')
      .data(links)
      .enter();

    // Define line.
    link.append('svg:line')
      .style('stroke', 'black')
      .attr('x1', function(d) { return d.source.x; })
      .attr('y1', function(d) { return d.source.y; })
      .attr('x2', function(d) { return d.target.x; })
      .attr('y2', function(d) { return d.target.y; });

    // Add circles.
    node.append('svg:circle')
      .attr('r', 40)
      .style('fill', function(d) { return d.fill; });
    node.append('svg:circle').
      attr('r', 35).
      style('fill', '#FFF');

    // Place the name attribute, left or right depending of the children.
    node.append('svg:text')
      .attr('dx', function(d) { return d.children ? -8 : 8; })
      .attr('dy', 3)
      .attr('text-anchor', function(d) { return d.children ? 'end' : 'start'; })
      .text(function(d) { return d.name; });
  }

  // Preparing scenario, content and rendering.
  preapreScenario();

  // Draw the elements with the promise of load data.
  preparingData().then(function(data) {
    renderNetwork(data);
  });

})();
