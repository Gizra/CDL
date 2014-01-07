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
    draw,
    width = window.innerWidth,
    height = window.innerHeight,
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
      var nodeSelected;

      system
        .attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');

      // Remove connection if zoom out/in.
      nodeSelected = draw.getSelectedNode();
      if (typeof nodeSelected !== 'undefined') {
        // Deactivate title.
        draw.toggleTitles(draw.getSelectedNode(), {activate: false, default: true});
        nodeSelected.toggleSiblings();
        draw.hideConnection();
        draw.setSelectedNode(undefined);
      }

      // Store current position and zoom ratio.
      draw.setPositionByTransform(system.attr('transform'));
      draw.setScale(d3.event.scale);

      // Update behavior of the titles.
      draw.updateTitle();

      // Keep object size during the zoom.
      draw.all(d3.event.scale);
    }

    /**
     * Pass to the zoom event instantiation the last position and scale.
     */
    function touch() {
      zoomSvg.translate(draw.getPosition());
      zoomSvg.scale(draw.getScale());
    }

    zoomSvg = d3.behavior.zoom()
      .center([window.innerWidth / 2, window.innerHeight / 2])
      .scaleExtent([1, config.chart.initial.maxZoom])
      .on('zoom', zoom);

    // Canvas.
    svgContainer = d3.select('body').append('svg')
      .attr('id', 'chart')
      .attr('width', '100%')
      .attr('height', '100%')
      .on('dblclick.zoom', null)
      .on('touchmove', touch)
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
      y: -height/4
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
      drawModule;

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
     * Return an with the properties of the according the type of the node. From the
     * configuration file config.js
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
        transform: function(node) {
          return 'scale(' + nodeType[node.styleNode].scale + ')';
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
     * Helper to get style and behaviour of the nodes according to its type.
     *
     * @returns {*}
     */
    nodeExtend = function() {
      var nodeType = config.nodes;

      function get(property) {
        return function(node) {
          if (typeof nodeType[node.styleNode][property] === 'number') {
            return nodeType[node.styleNode][property] / draw.getScale();
          }

          return nodeType[node.styleNode][property];
        };
      }

      return {
        fill: get('fill'),
        stroke: get('stroke'),
        r: get('r'),
        strokeWidth: get('strokeWidth'),
        inner: function(node) {
          var r = 0;
          if (node.styleNode === 'chronological') {
            r = nodeType[node.styleNode].innerRadio / draw.getScale();
          }

          return r;
        },
        /**
         * Implementation of click actions, first click enter in "focus view", second click
         * enter to the page related.
         *
         * @param node
         */
        click: function(node) {

          var nodeSelected;

          // Check if it is the first or second click.
          if (!nodeCentered || nodeCentered !== node.id) {
            // With this click type.
            nodeCentered = node.id;

            // Back to default style of the nodes previous activated and selected node.
            nodeSelected = draw.getSelectedNode();
            if (typeof nodeSelected !== 'undefined' && nodeSelected.id !== node.id ) {
              // Deactivate title.
              draw.toggleTitles(nodeSelected, {activate: false, default: true});
              nodeSelected.toggleSiblings();
            }
            draw.hideConnection();

            // "Focus view" translate and scale.
            draw.setFocus(node, config.chart.initial.maxZoom);

            // Go to the detail page.
            window.location = window.location.origin + window.location.pathname + '#/' + node.guid;
          }
          else if (nodeCentered === node.id) {
            nodeExtend().secondClick(node);
            nodeCentered = false;
          }
        },
        /**
         * Second click node open the page related with the detailed information.
         *
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

    /**
     * Module of drawing function and general properties of the draw.
     *
     * @returns {*}
     *  Drawing function.
     */
    drawModule = function() {
      // Handle the referencen information of the general draw g#system.
      var drawReference = {};

      // Define center point.
      drawReference.centerPoint = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      };

      return {
        /**
         * Refresh all the elements in the draw according the node type.
         *
         * @param ratio
         *   Specific zoom scale that affect the sizes of the elements.
         */
        all: function(ratio) {
          var selection,
            circles,
            titles,
            textbox;

          // Selection of the objects.
          selection = g.selectAll('.node');

          circles = selection.selectAll('circle');
          textbox = selection.select('.textbox');
          titles = selection.select('.titles');

          // Refresh properties of the circles.
          circles.transition()
            .duration(function(d, i) {return i * 1;})
            .delay(0)
            .attr('r', nodeExtend().r)
            .style('fill', nodeExtend().fill)
            .style('stroke', nodeExtend().stroke)
            .style('stroke-width', nodeExtend().strokeWidth);

          // Update the position of the selected node.
          textbox
            .transition()
            .delay(0)
            .attr('x', text().x)
            .attr('y', text().y)
            .attr('width', text().width)
            .attr('height', text().height)
            .attr('transform', text().transform);

          // Update connections.
          system.selectAll('.link')
            .transition()
            .delay(0)            
            .style('stroke-width', config.chart.link.strokeWidth/ratio);

          system.selectAll('.dashed')
            .transition()
            .delay(0)
            .style('stroke-width', config.chart.dashedLine.strokeWidth/ratio);
          
          // Update the dashed lines
          if (ratio < config.chart.zoom.hideDashedLines) {
            system.selectAll('.dashed')
              .transition()
              .style('stroke-width', config.chart.dashedLine.strokeWidth/ratio);
          }
          else {
            system.selectAll('.dashed')
              .transition()
              .style('stroke-width', 0);
          }


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
            .style('stroke-width', 1/this.getScale());
        },
        /**
         * Hide the line between the siblings nodes.
         */
        hideConnection: function() {
          // Clean actual active path if exist.
          system.select('#line-active').data([]).exit().remove();
        },
        /**
         * Toggle the class to activated of default for the title of the nodes.
         *
         * @param node
         *   Node object.
         * @param options
         *   Indicate the class (by key of the object) and to add or remove, according
         *   the value. (true or false).
         */
        toggleTitles: function(node, options) {
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
              .duration(config.chart.transitions.titles);

            title.classed(node.type, options.default)
              .transition()
              .delay(function(d, i) {return i * 3;})
              .duration(config.chart.transitions.titles);
          });
        },
        /**
         * Move a node to the center of the screen.
         *
         * @param node
         *   Selected node object.
         * @param ratio
         *   Scale of zoom requested. Actually maximun zoom scale.
         */
        setFocus: function(node, ratio) {
          var zooming,
            points,
            self = this;

          self.translate = node.getCoordinateToCenter(ratio);
          self.scale = ratio;

          zooming = system.transition()
            .duration(delay)
            .attr('transform', 'translate(' + self.translate + ')scale(' + self.scale + ')');

          // Move to the center.
          zooming.each('end', function() {
            self.setPosition(self.translate);
            self.setScale(self.scale);

            // Set last scale and translate info to the zoom behaviour.
            zoomSvg.translate(self.getPosition());
            zoomSvg.scale(self.getScale());


            // Store the selected node in the draw object.
            draw.setSelectedNode(node);

            // Update nodes data, active and selected according the node clicked.
            points = node.toggleSiblings();

            // Draw the connection.
            draw.showConnection(points);

            draw.toggleTitles(node, {activate: true, default: false});
            draw.all(ratio);
          });
        },
        /**
         * Return the points of the center of the screen.
         *
         * @returns {{x: number, y: number}}
         */
        centerPoint: function() {
          return drawReference.centerPoint;
        },
        /**
         * Store initial point of the draw, by default is 0,0 regarding to the top left corner.
         * {x,y} format
         *
         * @param x
         * @param y
         */
        setInitialPoint: function(x, y) {
          drawReference.initialPoint = {x: x, y: y};
        },
        /**
         * Return the points of the initial point of the draw.
         *
         * @returns {{x: *, y: *}}
         */
        initialPoint: function() {
          return drawReference.initialPoint;
        },
        /**
         * Store the scale of zoom of the drawing.
         *
         * @param scale
         */
        setScale: function(scale) {
          drawReference.actualScale = scale;
        },
        /**
         * Return the zoom scale  of the drawing.
         *
         * @returns {number}
         */
        getScale: function() {
          return (typeof drawReference.actualScale === 'undefined') ? drawReference.actualScale = 1 : drawReference.actualScale;
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
            drawReference.actualPosition = [parseInt(position[1], 10), parseInt(position[2], 10)];
          }
        },
        setPosition: function(position) {
          drawReference.actualPosition = position;
        },
        /**
         * Return array of the actual position of the draw in the format [x,y].
         *
         * @returns {Array}
         */
        getPosition: function() {
          if (typeof drawReference.actualPosition === 'undefined') {
            drawReference.actualPosition = [draw.initialPoint().x, draw.initialPoint().y];
          }
          return drawReference.actualPosition;
        },
        /**
         * Store the node object after the first click "selected".
         *
         * @param node
         */
        setSelectedNode: function(node) {
          drawReference.selected = node;
        },
        /**
         * Return the node object selected.
         *
         * @returns {*}
         */
        getSelectedNode: function() {
          return drawReference.selected;
        },
        /**
         * Update classes for the titles.
         */
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
    // Initialize draw object.
    draw = drawModule();

    // Node properties and methods - Data modification.
    nodes.forEach(function(node, index) {
      // Add root and focus type.
      if (node.depth === 0) {
        node.type = 'root';
      }
      if (node.depth === 1) {
        node.type = 'focus';
      }

      // Add id and default values.
      node.id = index;
      node.active = 0;
      node.selected = false;
      // Store the initial position define for the nodes by the tree layout.
      node.x0 = node.x;
      node.y0 = node.y;
      // Multiply the x and y values to add the correct separation between the nodes.
      // This values are related with the node size.
      node.x = node.x * config.chart.nodesSeparation.horizontal;

      if (node.type === 'chronological') {
        if (node.chronologicalId > 1) {
          node.y = node.y;
        }
      }

      /**
       * Return the title of the node according the type
       *
       * @param style
       *   String, to indicate the style, example 'uppercase' return the
       *   text capitalized.
       * @returns string
       */
      node.getTitle = function(style) {
        var title = (this.type === 'chronological') ? this.chronologicalName : (this.type === 'bastard') ? this.bastardName : this.name;

        if (style && style === 'uppercase') {
          title = title.toUpperCase();
        }

        return title;
      };

      node.name = node.getTitle('uppercase');

      /**
       * Change the node from activated to deactivated and vice versa.
       */
      node.toogleActive = function() {
        this.active = (!this.active) ? 1 : 0;
      };

      /**
       * Return the siblings and the node it self into an array.
       *
       * @returns {*}
       */
      node.getSiblings = function() {
        return this.parent.children;
      };

      /**
       * Change the node from selected to unselected and vice versa.
       */
      node.toggleSelection = function() {
        this.selected = !this.selected;
      };

      /**
       * Get a chunk of info of the node that could be use to indicate
       * the state.
       *
       * @returns {*}
       */
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

      /**
       * Select current node and activated siblings, and vice versa.
       *
       * @returns {Array}
       *   Array of the positions of the points [{x,y}, ...] of the node
       *   and siblings.
       */
      node.toggleSiblings = function() {
        var siblings,
          points = [];

        // Activate an select this node
        this.toggleSelection();

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

      /**
       * Update the node style according data.
       */
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

      node.getPoints = function(state) {
        var position = {
          x: this.x,
          y: this.y
        };

        if (state === 'y-fixed') {
          position = {
            x: this.x,
            y: this.y0
          };
        }

        return position;
      };


      /**
       * Return the x,y translation to the center of the canvas in an array [x,y].
       *
       * @param gain
       *   Scale of actual zoom.
       * @returns {Array}
       */
      node.getCoordinateToCenter = function(gain) {
        var coordinate = [];

        coordinate[0] = (drawModule().centerPoint().x) - this.x * gain;
        coordinate[1] = (drawModule().centerPoint().y) - this.y * gain;

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
      .attr('cx', function() { return drawModule().centerPoint().x; })
      .attr('cy', function() { return drawModule().centerPoint().y; });

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
      .style('stroke-width', 3)
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
          .attr('class', 'dashed')
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
      .on('click', nodeExtend().click)
      .transition()
      .delay(function(d, i) {return i * 3;})
      .attr('id', function(node, index) { return 'n' + index + '-circle'; })
      .attr('r', nodeExtend().r)
      .style('fill', nodeExtend().fill)
      .style('stroke', nodeExtend().stroke)
      .style('stroke-width', nodeExtend().strokeWidth);

    // Node titles.
    node.append('foreignObject')
      .attr('class', 'textbox')
      .attr('x', text().x)
      .attr('y', text().y)
      .attr('width', text().width)
      .attr('height', text().height)
      .attr('transform', text().transform)
      .append('xhtml:body')
      .attr('class', 'area')
      .html(text().html)
      .on('click', nodeExtend().click);

    // Public CDL API.
    return {
      setBackgroud: function() {
        draw.setInitialPoint(config.chart.initial.x, config.chart.initial.y);

        background.style('fill', 'white')
          .attr('transform', 'translate(' + draw.initialPoint().x + ', ' + draw.initialPoint().y + ')');
        system.attr('transform', 'translate(' + draw.initialPoint().x + ', ' + draw.initialPoint().y + ')');

        zoomSvg.translate([draw.initialPoint().x, draw.initialPoint().y]);
        zoomSvg.scale(config.draw.initial.minZoom);
      },
      setCenter: function(color, size) {
        center.attr('r', size)
          .style('fill', color)
          .attr('cx', function() { return drawModule().centerPoint().x; })
          .attr('cy', function() { return drawModule().centerPoint().y; });
      },
      selectNodeById: function(id) {
        return draw.getElementById(id);
      },
      redraw: function() {
        draw.all();
      },
      getDraw: function() {
        return system;
      },
      getInfo: function() {
        return draw;
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

    cdl.chart.setCenter(config.chart.center.color, config.chart.center.r);

    // Add window Event Listeners.
    window.onresize = function() {
      cdl.chart.setCenter(config.chart.center.color, config.chart.center.r);
    };

  });

})( window );
