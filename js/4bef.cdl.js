'use strict';

(function( window ) {
  // Define object.
  var d3 = window.d3,
    Q = window.Q,
    _ = window._,
    $ = window.$,
   config = window.CDLConfig;

  // Create the chart object.
  window.CDL = {};
  var cdl = window.CDL;

  var svgContainer,
    zoomSvg,
    g,
    center,
    background,
    system,
    chart,
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

      // Update behavior of the titles.
      chart.updateTitle();

      // Store current position and zoom ratio.
      chart.setPositionByTransform(system.attr('transform'));
      chart.setScale(d3.event.scale);

      console.log(d3.event.scale);
      // Test with th aspect of the line.
      system.selectAll('.link')
        .style('stroke-width', 1/d3.event.scale);

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
      draw;

    // Index of the actual node centered
    nodeCentered = null;

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

      var nodeType = config.text;

      function get(property) {

        return function(node) {
          var type = node.styleNode;

          if (typeof type === 'undefined') {
            return 0;
          }

          // Focus especific level of the tree, when the node is not selected.
          if (node.depth === 1 && node.styleNode !== 'selected') {
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
        class: get('class'),
        classSelector: function() {
          return '.' + get('class');
        },
        html: function(node) {
          var type = node.styleNode;

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
      var nodeType = config.nodes;

      function get(property) {
        return function(node) {
          return nodeType[node.styleNode][property];
        };
      }

      return {
        fill: get('fill'),
        stroke: get('stroke'),
        r: get('r'),
        inner: function(node) {
          var r = 0;
          if (node.styleNode === 'chronological') {
            r = nodeType[node.styleNode].innerRadio;
          }

          return r;
        },
        click: function(node) {

          var move = [],
            points = [],
            nodeSelected;

          // Check if it is the first or second click.
          if (!nodeCentered || nodeCentered !== node.id) {
            // With this click type.
            nodeCentered = node.id;

            // Back to default style of the nodes previous activated and selected node.
            nodeSelected = chart.getSelectedNode();
            if (typeof nodeSelected !== 'undefined' && nodeSelected.id !== node.id ) {
              // Deactivate title.
              chart.toogleTitles(nodeSelected, {activate: false, default: true});
              nodeSelected.toogleSiblings();
            }
            chart.hideConnection();

            // "Focus view" translate and scale.
            // @todo: Scaling, it's need input from the team issue #119.
            move = node.getCoordinateToCenter();
            chart.setFocus(node.id, move, 30);

            // Storage the selected node in the chart object.
            chart.setSelectedNode(node);

            // Update nodes data, active and selected according the node clicked.
            points = node.toogleSiblings();

            // Draw the connection.
            chart.showConnection(points);

            chart.toogleTitles(node, {activate: true, default: false});
            chart.all();

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
            titles,
            internal,
            textbox;

          // Selection of the objects.
          selection = g.selectAll('.node');

          circles = selection.select('circle');
          internal = selection.select('.circle-internal');
          textbox = selection.select('.textbox');
          titles = selection.select('.titles');


          // Refresh properties of the circles.
          circles.transition()
            .delay(function(d, i) {return i * 3;})
            .attr('r', nodeExtend().r)
            .style('fill', nodeExtend().fill )
            .style('stroke', nodeExtend().stroke )
            .style('stroke-width', 1 );

          // Toogle the internal circle for the chronological nodes.
          internal.transition()
            .delay(function(d, i) {return i * 3;})
            .attr('r', nodeExtend().inner );

          // Update the position of the selected node.
          textbox
            .transition()
            .delay(function(d, i) {return i * 2;})
            .attr('x', text().x)
            .attr('y', text().y)
            .attr('width', text().width)
            .attr('height', text().height);

        },
        /**
         * Render a line between the siblings nodes of the clicked circle.
         *
         * @param points
         *  Collection of point in the format {x,y}
         */
        showConnection: function(points) {
          // Apply connection only for nodes in depth > 1.
          if (this.getSelectedNode().depth < 2) {
            return;
          }

          // Draw the red line.
          system.select('#nodes').selectAll('.points-active')
            .data([points])
            .enter()
            .insert('path', '#triangle')
            .attr('id', 'line-active')
            .attr('class', 'focus')
            .attr('d', line)
            .style('fill', 'none' )
            .style('stroke', 'red' )
            .style('stroke-width', 1);
        },
        hideConnection: function() {
          // Clean actual active path if exist.
          system.select('#line-active').data([]).exit().remove();
        },
        toogleTitles: function(node, options) {
          var nodes,
            self = this;

          // Default config.
          options = options || {
            activate: false,
            default: true
          };

          // Get the siblings.
          nodes = node.getSiblings();

          // Update the titles classes.
          nodes.forEach(function(node) {
            var title =  self.getElementById(node.id).select('.titles');

            title.classed(node.styleNode, options.activate)
              .transition()
              .delay(function(d, i) {return i * 3;})
              .duration(3000);

            title.classed(node.type, options.default)
              .transition()
              .delay(function(d, i) {return i * 3;})
              .duration(3000);
          });
        },
        /**
         * Move a node to the center of the screen.
         *
         * @param index
         * @param move
         */
        setFocus: function(id, move, gain) {
          var focusing,
            zooming,
            self = this;

          zooming = system.transition()
            .duration(delay)
            .attr('transform', 'translate(' + zoomSvg.translate() + ')scale(' + gain + ')');

          zooming.each('end', function() {
            self.setPositionByTransform(system.attr('transform'));

            // Set last scale and translate info to the zoom behaviour.
            zoomSvg.translate(self.getPosition());
            zoomSvg.scale(self.getScale());
          });

          // Move to the center.
          focusing = system.transition()
            .duration(delay)
            .attr('transform', 'translate(' + move.toString() + ')scale(' + zoomSvg.scale() + ')');

          // Set zoom scale and translation to the final state of the focus chart.
          focusing.each('end', function() {
            self.setPositionByTransform(system.attr('transform'));

            // Set last scale and translate info to the zoom behaviour.
            zoomSvg.translate(self.getPosition());
            zoomSvg.scale(self.getScale());
          });
        },
        scale: function() {
          var zooming,
            self = this;

          // Validate
          zooming = system.transition()
            .duration(delay)
            .attr('transform', 'translate(' + d3.event.translate + ')scale(2)');

          // Set zoom scale and translation to the final state of the focus chart.
          zooming.each('end', function() {
            self.setPositionByTransform(system.attr('transform'));

            // Set last scale and translate info to the zoom behaviour.
            zoomSvg.translate(self.getPosition());
            zoomSvg.scale(2);
          });
        },
        centerPoint: function() {
          return chartReference.centerPoint;
        },
        setInitialPoint: function(x, y) {
          chartReference.initialPoint = {x: x, y: y};
        },
        initialPoint: function() {
          return chartReference.initialPoint;
        },
        setScale: function(scale) {
          chartReference.actualScale = scale;
        },
        getScale: function() {
          return (typeof chartReference.actualScale === 'undefined') ? chartReference.actualScale = 1 : chartReference.actualScale;
        },
        /**
         * Store an array of the translation coordinates {x, y} of the actual position
         * from a transform string.
         *
         * Example:
         *   transform="translate(-673.550567648774,253.17313654047598)scale(2.51054398256529)"
         *   return: [-673.550567648774,253.17313654047598]
         *
         * @param transform
         *  string representing a transform attribute of svg element.
         *  reference: http://goo.gl/b2TgYX
         * @returns {Array}
         */
        setPositionByTransform: function(transform) {
          var position =  transform.match(/translate\((-?\d*\.\d*),(-?\d*\.\d*)\)/);

          if (position) {
            chartReference.actualPosition = [parseInt(position[1], 10), parseInt(position[2], 10)];
          }
        },
        /**
         * Return array of the actual position of the chart in the format [x,y].
         *
         * @returns {Array}
         */
        getPosition: function() {
          if (typeof chartReference.actualPosition === 'undefined') {
            chartReference.actualPosition = [chart.initialPoint().x, chart.initialPoint().y];
          }
          return chartReference.actualPosition;
        },
        setSelectedNode: function(node) {
          chartReference.selected = node;
        },
        getSelectedNode: function() {
          return chartReference.selected;
        },
        updateTitle: function() {
          var nodes;

          nodes = system.selectAll('.node');
          if (d3.event.scale > config.chart.zoom.showTextScale) {


            system.selectAll('.default').classed('title-splash', true);
            // Remove the standard states.
            system.selectAll('.default').classed('default', false);
          }
          else {
            system.selectAll('.title-splash').classed('default', true);
            // Add the standard states.
            system.selectAll('.title-splash').classed('title-splash', false);
          }
        },
        getElementById: function(id) {
          return system.select( '#n' + id );
        },
        getElementSelected: function() {
          return this.getElementById(this.getSelectedNode().id);
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
      // Multiply the x and y values to add the correct separation between the nodes.
      // This values are related with the node size.
      node.x = node.x * config.chart.nodesSeparation.horizontal;
      node.y = node.y;
      // Add new behaviours
      node.getTitle = function() {
        return (this.type === 'chronological') ? this.chronologicalName : (this.type === 'bastard') ? this.bastardName : this.name;
      };

      node.name = node.getTitle();

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
          depth: this.depth,
          type: this.type,
          styleNode: this.styleNode
        };
      };

      node.toogleSiblings = function() {
        var siblings,
          points = [];

        // Activate an select this node
        this.toogleSelection();

        // Activate siblings.
        if (node.depth > 1) {
          siblings = this.getSiblings();
          // Mark point 'start' and 'end' for the line to connect the sibling.
          _.min(siblings, function(node) { return node.x; }).connection = 'end';
          _.max(siblings, function(node) { return node.x; }).connection = 'start';

          siblings.forEach(function(node) {
            node.toogleActive();
            node.setStyleNode();

            // Points for the connection.
            points.push({
              x: node.x,
              y: node.y
            });
          });
        }
        else if (node.depth === 1){
          // Update the style of the selected node, in the case of depth 1.
          node.setStyleNode();
        }

        return points;
      };

      node.setStyleNode = function() {

        if (this.selected) {
          this.styleNode = 'selected';
        }
        else if (this.active) {
          this.styleNode = 'activated';
        }
        else {
          this.styleNode = this.type;
        }
      };

      node.getPoints = function() {
        return {
          x: this.x,
          y: this.y
        };
      };


      /**
       * Return the x,y translation to the center of the canvas in an array [x,y].
       *
       * @param node
       * @returns {Array}
       */
      node.getCoordinateToCenter = function() {
        var coordinate = [];

        coordinate[0] = (draw().centerPoint().x) - this.x * chart.getScale();
        coordinate[1] = (draw().centerPoint().y) - this.y * chart.getScale();

        return coordinate;
      };

      // Set node style.
      node.setStyleNode();

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
      .transition()
      .delay(function(d, i) {return i * 3;})
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
          .style('stroke', config.chart.dashedLine.stroke)
          .style('stroke-dasharray', (config.chart.dashedLine.style))
          .style('stroke-width', config.chart.dashedLine.strokeWidth);
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
      .style('fill', config.chart.triangle.fill)
      .style('stroke', config.chart.triangle.stroke)
      .style('stroke-width', config.chart.triangle.strokeWidth);


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
      .transition()
      .delay(function(d, i) {return i * 3;})
      .attr('id', function(node, index) { return 'n' + index + '-circle'; })
      .attr('r', nodeExtend().r )
      .style('fill', nodeExtend().fill )
      .style('stroke', nodeExtend().stroke )
      .style('stroke-width', 1);

    // Chronological internal circle.
    node.append('circle')
      .attr('id', function(node, index) { return 'n' + index + '-circle-internal'; })
      .attr('class', 'circle-internal')
      .attr('r', nodeExtend().inner )
      .attr('fill', 'black' );

    // Node titles.
    node.append('foreignObject')
      .attr('class', 'textbox')
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
      .style('stroke', 'none' )
      .on('click', nodeExtend().click )
      .on('touchstart', nodeExtend().click );


    // Public CDL API.
    return {
      setBackgroud: function() {
        chart = draw();
        chart.setInitialPoint(config.chart.initial.x, config.chart.initial.y);

        background.style('fill', 'white')
          .attr('transform', 'translate(' + chart.initialPoint().x + ', ' + chart.initialPoint().y + ')');
        system.attr('transform', 'translate(' + chart.initialPoint().x + ', ' + chart.initialPoint().y + ')');

        zoomSvg.translate([chart.initialPoint().x, chart.initialPoint().y]);
        zoomSvg.scale(config.chart.initial.zoom);
      },
      setCenter: function(color, size) {
        center.attr('r', size)
          .style('fill', color)
          .attr('cx', function() { return draw().centerPoint().x; })
          .attr('cy', function() { return draw().centerPoint().y; });
      },
      selectNodeById: function(id) {
        return chart.getElementById(id);
      },
      redraw: function() {
        chart.all();
      },
      getChart: function() {
        return system;
      },
      getInfo: function() {
        return chart;
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
    cdl.chart.setCenter(config.chart.center.color, config.chart.center.r);

    // Add window Event Listeners.
    window.onresize = function() {
      cdl.chart.setCenter(config.chart.center.color, config.chart.center.r);
    };

  });

})( window );
