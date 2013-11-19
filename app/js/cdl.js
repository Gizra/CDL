'use strict';

(function() {
  // Define object.
  var d3 = window.d3;
  var Q = window.Q;
  var _ = window._;

  var nodes = [];
  var nodesLinks = [];
  var svgContainer;

  var firstNode = '';

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
   * Prepare nodes attributes and content.
   *
   * @param nodes
   */
  function preparingNodeData() {
    var deferred = Q.defer();
    // @todo: Dynamic definition of file path.
    var src = window.location.href + 'data/TorahBasch_16112013.json';

    /**
     * Promises of getting the JSON data.
     *
     * @param src
     *  relative path of the JSON file.
     *
     * @returns {promise}
     */
    function gettingData(src) {
      var deferred = Q.defer();

      // Create node from only
      d3.json(src, function(error, json) {
        if (error) {
          return console.warn(error);
        }
        deferred.resolve(json);
      });

      return deferred.promise;
    }

    // Prepare the data with the promise of getting the data.
    gettingData(src).then(function(data) {
      var newData;

      /**
       *
       * d3 Tree Layout:
       * https://github.com/mbostock/d3/wiki/Tree-Layout
       *
       */
      function prepareTreeData() {
        var nodeStyle = {};
        var nodesIndexed = [];
        var tree = {};

        // Prepare raw data in thoughts.
        nodes = data.BrainData.Thoughts.Thought;
        nodesLinks = data.BrainData.Links.Link;

        // Remove properties not necessary data from Node and links.
        _.each(nodes, function(thought, index) {
          nodes[index] = _.pick(thought, 'guid', 'name');
        });
        _.each(nodesLinks, function(link, index) {
          nodesLinks[index] = _.pick(link, 'guid', 'idA', 'idB', 'dir', 'linkTypeID', 'isBackward');
        });

        // Index the nodes of thought by guid.
        nodesIndexed = _.indexBy(nodes, 'guid');

        // Prepare the root of the tree.
        nodes = _.without(nodes, nodesIndexed[firstNode]);
        nodes.unshift(nodesIndexed[firstNode]);
        nodes[0].root = true;

        // Refresh nodesIndexed.
        nodesIndexed = _.indexBy(nodes, 'guid');

        // Prepare each node to create tree data structure.
        function getNodeData(guid) {
          var node, index;

          // Look up the node and position into the array.
          node = nodesIndexed[guid];
          index = _.indexOf(nodes, nodesIndexed[guid]);

          // Initialize child property.
          node.children = [];

          console.log(node);

          function getChilds(node) {
            var childs = [],
              branchs = [],
              branch = {};

            if (node.children === undefined) {
              node.children = [];
            }
            node.fill = 'red';

            // Look for the childs, direction
            branch = {
              dir: 1,
              childs: _.where(nodesLinks, {idA: node.guid, dir: '1'})
            };
            branchs.push(branch);

            branch = {
              dir: 2,
              childs: _.where(nodesLinks, {idB: node.guid, dir: '2'})
            };
            branchs.push(branch);

            // Create links with the childs.
            _.each(branchs, function(branch) {
              childs = branch.childs;

              _.each(childs, function(child) {
                child.node = {};
                child.node.children = [];

                if (branch.dir === 1) {
                  child.node = nodesIndexed[child.idB];
                }
                else if (branch.dir === 2) {
                  child.node = nodesIndexed[child.idA];
                }

                // Look up for more next generation of childrens.
                child.node.children = getChilds(child.node);

                // Set node childrens info
                node.children.push(child.node);
              });
            });

            return node.children;
          }

          node.children = getChilds(node);
          // Define node position.
          nodeStyle = {
            'fill': (node.guid  === firstNode)?'green':'red'
          };

          // Add node style.
          node = _.extend(node, nodeStyle);

          return node;
        }

        tree = getNodeData(firstNode);
        return tree;
      }

      // Get the the "guid" of the root node.
      firstNode =  data.BrainData.Source.homeThoughtGuid;
      // Preparing to structure the data.
      newData = prepareTreeData();

      deferred.resolve(newData);
    });

    return deferred.promise;
  }

  /**
   * Draw the SVG elements with the information in nodes object.
   * @param nodes
   */
  function renderNetwork(data) {

    /**
     * Render json data in d3 tree layout definition.
     * https://github.com/mbostock/d3/wiki/Tree-Layout.
     */
    function renderNetworkTree() {
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

      // place the name atribute left or right depending if children
      node.append('svg:text')
        .attr('dx', function(d) { return d.children ? -8 : 8; })
        .attr('dy', 3)
        .attr('text-anchor', function(d) { return d.children ? 'end' : 'start'; })
        .text(function(d) { return d.name; });
    }

    // Draw SVG elements.
    renderNetworkTree();
  }

  // Preparing scenario, content and rendering.
  preapreScenario();

  // Draw the elements with the promise of load data.
  preparingNodeData().then(function(data) {
    renderNetwork(data);
  });

})();
