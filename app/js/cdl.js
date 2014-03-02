'use strict';

(function(window) {
  // Define object.
  var d3 = window.d3,
    Q = window.Q,
    _ = window._,
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
    draw = {},
    width = config.chart.canvas.width,
    height = config.chart.canvas.height,
    agent = navigator.userAgent,
    os;

  // Detect device and set configuration respectively.
  if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(agent) ) {
    if (agent.match(/iPad/)) {
      os = 'ios';
      config.chart.initial.minZoom = 0.43;
      config.chart.zoom.hideGrandChildren = 0.44;
      config.chart.initial.y = function(height) { return height * 0.30;};
      config.nodes.root.r = config.nodes.root.rFocus = config.nodes.root.target = config.nodes.translation.r = config.nodes.translation.rFocus = config.nodes.translation.target = 35;
    }
    else if (agent.match(/Android/)) {
      os = 'android';
      if (agent.match(/Pad/)) {
        config.chart.initial.minZoom = 0.65;
        config.chart.zoom.hideGrandChildren = 0.66;
        config.chart.initial.y = function(height) { return height * 0.40;};
        config.nodes.root.r = config.nodes.root.rFocus = config.nodes.root.target = config.nodes.translation.r = config.nodes.translation.rFocus = config.nodes.translation.target = 60 ;
      }
      else {
        config.chart.initial.minZoom = 0.33;
        config.chart.zoom.hideGrandChildren = 0.34
        config.chart.initial.y = function(height) { return height * 0.25;};
        config.nodes.root.r = config.nodes.root.rFocus = config.nodes.root.target = config.nodes.translation.r = config.nodes.translation.rFocus = config.nodes.translation.target = 30 ;
      }
    }

  }
  else {
    if (agent.match(/Mac OS X/)) {
      os = 'osx';
    }
    else {
      os = 'other';
    }

    config.chart.initial.minZoom = 0.55;
    config.chart.zoom.hideGrandChildren = 0.56;
    config.nodes.root.r = config.nodes.root.rFocus = config.nodes.root.target = config.nodes.translation.r = config.nodes.translation.rFocus = config.nodes.translation.target = 50;
  }

  /**
   * Create the 'Canvas' area, it's possible define the dimensions.
   *
   * @param width
   * @param height
   */
  function prepareScenario() {
    var initialScaleOnZoom;

    function zoomstart() {
      initialScaleOnZoom = draw.getScale();
    }

    // Zoom Behaviours.
    function zoom() {
      system.attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');

      // Store current position and zoom ratio.
      draw.setPositionByTransform(system.attr('transform'));
      draw.setScale(d3.event.scale);
    }

    function zoomend() {
      if (typeof draw.getScale() === 'undefined' || initialScaleOnZoom === draw.getScale()) {
        return;
      }

      draw.all(draw.getScale());
    }

    zoomSvg = d3.behavior.zoom()
      .center([window.innerWidth / 2, window.innerHeight / 2])
      .scaleExtent([config.chart.initial.minZoom, config.chart.initial.maxZoom])
      .on('zoomstart', zoomstart)
      .on('zoom', zoom)
      .on('zoomend', zoomend);

    // Defining canvas object, properties and events according.
    if (os === 'ios' || os === 'osx') {
      svgContainer = d3.select('body').append('svg')
        .attr('id', 'chart')
        .attr('width', '100%')
        .attr('height', '100%')
        .style('fill', 'transparent')
        .on('zoom', zoomSvg)
        .on('dblclick.zoom', function(){d3.event.stopPropagation(); return null;})
        .on('touchstart', function(){d3.event.preventDefault(); return null;})
        .on('touchmove', zoomSvg)
        .on('touchend', function(){d3.event.preventDefault(); return null;})
        .on('gesturestart', function(){d3.event.stopPropagation(); return null;})
        .on('gesturechange', zoomSvg)
        .on('gestureend', function(){d3.event.stopPropagation(); return null; })
        .call(zoomSvg);
    }
    else {
      svgContainer = d3.select('body').append('svg')
        .attr('id', 'chart')
        .attr('width', '100%')
        .attr('height', '100%')
        .style('fill', 'transparent')
        .call(zoomSvg);
    }

    // Background.
    background =  svgContainer.append('rect')
      .attr('id', 'background')
      .attr('width', width)
      .attr('height', height)
      .style('fill', 'transparent');

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
      x: config.chart.initial.rootPosition.x(width),
      y: config.chart.initial.rootPosition.y(height)
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
      drawModule,
      textbox,
      cdlEvents;

    // Index of the actual node centered.
    nodeCentered = null;

    // Data Tree Layout.
    tree = d3.layout.tree()
      .size([width, height])
      .separation(function(a, b) { return (a.parent === b.parent ? 1 : 2); });

    // Data binding.
    nodes = tree.nodes(data);
    links = tree.links(nodes);

    //Register customs event.
    cdlEvents = {
      onClickNodeStart: new CustomEvent('onclicknodestart'),
      onClickNodeEnd: new CustomEvent('onclicknodeend')
    };

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
        heightCss: function(node) {
          return nodeType[node.styleNode].height + 'px';
        },
        class: get('class'),
        transform: function(node) {
          return 'scale(' + nodeType[node.styleNode].scale + ')';
        },
        html: function(node) {
          var type = node.styleNode,
            e;

          // Focus in specific level of the tree.
          if (node.depth === 1) {
            type = 'focus';
          }

          e = document.createElement('div');
          d3.select(e)
            .attr('class', 'titles ' + nodeType[type].class)
            .text(node.name);

          return e.outerHTML;
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
          var scale;

          if (typeof nodeType[node.styleNode][property] === 'number') {
            // Keep the radius of the selected nodes, in the zoom in/out behavior.
            if (node.styleNode === 'selected' && property === 'r') {
              scale = d3.scale.linear()
                .domain([nodeType[node.styleNode][property], nodeType[node.styleNode][property] / draw.getScale()])
                .range([nodeType.activated.r * 2, nodeType[node.styleNode][property]]);

              return scale(nodeType[node.styleNode][property]);
            }

            // Scale the number values, like circle radius.
            return nodeType[node.styleNode][property] / draw.getScale();
          }

          return nodeType[node.styleNode][property];
        };
      }

      /**
       * Return target size but hold the minimun for every king of finger.
       *
       * @param property
       * @returns {Function}
       */
      function getTargetSize(property) {
        return function(node) {
          return (nodeType[node.styleNode][property] / draw.getScale() < 5) ? 5 : nodeType[node.styleNode][property] / draw.getScale();
        };
      }

      return {
        fill: get('fill'),
        stroke: get('stroke'),
        r: get('r'),
        rFocus: get('rFocus'),
        targetTouch: getTargetSize('targetTouch'),
        strokeWidth: get('strokeWidth'),
        r2: get('r2'),
        inner: function(node) {
          var r = 0;
          if (node.styleNode === 'chronological') {
            r = nodeType[node.styleNode].r2 / draw.getScale();
          }

          return r;
        },
        /**
         * Open the url in the property from the translation node configuration file.
         *
         * @param node
         */
        changeLanguage: function(node) {
          window.location = node.url;
        },
        /**
         * Implementation of click actions, first click enter in "focus view", second click
         * enter to the page related.
         *
         * @param node
         */
        click: function(node) {
          // If root element, do not perform any action.
          if (node.depth === 0) {
            return;
          }

          var nodeSelected;

          // Start click node event.
          window.dispatchEvent(cdlEvents.onClickNodeStart);

          // @todo: Related to the event.
          if (draw.animation()) {
            return;
          }

          // Check if it is the first or second click.
          if (!nodeCentered || nodeCentered !== node.id) {
            draw.animationStart();

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

            // End click node event.
            window.dispatchEvent(cdlEvents.onClickNodeEnd);

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
          // If it's chronological node, go up until the parent not chronological and set like active node.
          while (node.type === 'chronological') {
            node = node.parent;
          }

          // Go to the detail page.
          window.location = window.location.origin + window.location.pathname + 'pages/' + node.guid;
        },
        /**
         * Return the radius of the circles for each node.
         *
         * @param type
         * @returns {number}
         */
        getRadius: function(node) {
          var rScale = draw.rScale();

          rScale.range([nodeType[node.styleNode].r, nodeType[node.styleNode].rFocus]);

          return rScale(draw.getScale())/draw.getScale();
        },
        getRadiusInternal: function(node) {
          var rScale = draw.rScale();

          // Not necessary get the scale for the chronological selected node.
          if (node.styleNode !== 'chronological') {
            return;
          }

          rScale.range([nodeType[node.styleNode].r2, nodeType[node.styleNode].r2Focus]);

          return rScale(draw.getScale())/draw.getScale();
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

      drawReference.nodeClicked = false;

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
            circleTarget,
            circlesChronological,
            triangle;

          // Get actual scale in case the ratio if is undefined.
          if (typeof ratio === 'undefined') {
            ratio = this.getScale();
          }

          // Selection of the objects.
          selection = g.selectAll('.node');

          circles = selection.selectAll('.circle-node');
          circlesChronological = selection.selectAll('.circle-chronological');
          circleTarget = selection.selectAll('.circle-target');
          triangle = system.select('#triangle');

          // Update the dashed lines
          if (ratio < config.chart.zoom.dashedLine.hideInScale) {
            system.selectAll('.dashed')
              .transition()
              .duration(config.chart.transitions.lines)
              .style('stroke-width', config.chart.dashedLine.strokeWidth/ratio);
          }
          else {
            system.selectAll('.dashed')
              .transition()
              .duration(config.chart.transitions.lines)
              .style('stroke-width', 0);
          }

          // Hide/Show Triangle.
          if (ratio < config.chart.zoom.hideTriangle) {
            triangle.transition()
              .duration(config.chart.transitions.lines)
              .style('fill', config.chart.triangle.fill)
              .style('stroke', config.chart.triangle.fill);
          }
          else {
            triangle.transition()
              .duration(config.chart.transitions.lines)
              .style('fill', 'white')
              .style('stroke', 'white');
          }

          // Refresh Text.
          this.updateText(selection);

          // Refresh Circles.
          circles.filter(function(node){ return node.depth > 0; })
            .transition()
            .duration(config.chart.transitions.circles)
            .ease('linear')
            .attr('r', nodeExtend().getRadius)
            .style('fill', nodeExtend().fill)
            .style('stroke', nodeExtend().stroke)
            .style('stroke-width', nodeExtend().strokeWidth);

          circlesChronological.transition()
            .duration(config.chart.transitions.circles)
            .ease('linear')
            .attr('r', nodeExtend().getRadiusInternal)
            .style('stroke', nodeExtend().stroke)
            .style('stroke-width', nodeExtend().strokeWidth);

          // Target Touch: Resize target touch area.
          circleTarget.transition()
            .duration(config.chart.transitions.circles)
            .attr('r', nodeExtend().targetTouch);

          // Update connections.
          system.selectAll('.link')
            .transition()
            .duration(config.chart.transitions.lines)
            .style('stroke-width', draw.getLinkWidth());

          system.selectAll('.dashed')
            .transition()
            .duration(config.chart.transitions.lines)
            .style('stroke-width', function() { return (ratio > config.chart.zoom.dashedLine.hideInScale) ? 0 : config.chart.dashedLine.strokeWidth/ratio;});

          system.select('#line-active')
            .transition()
            .duration(config.chart.transitions.lines)
            .style('stroke-width', draw.getLinkWidth());

          this.hideGrandChildren(ratio);

        },
        updateText: function(selection) {
          var titles,
            textbox,
            textFocus;

          // Get a default selection if is undefined.
          if (typeof selection === 'undefined') {
            selection = g.selectAll('.node');
          }

          // Selection of the objects.
          textbox = selection.select('.textbox');
          titles = selection.select('.titles');

          // Set position and dimension of the textbox, according the styleNode.
          textbox.attr('width', text().width)
            .attr('height', text().height)
            .attr('x', text().x)
            .attr('y', text().y)
            .attr('transform', text().transform);

          // Apply the opacity to the titles hide/show.
          textbox.filter(function(d) { return d.depth > 1; })
            .filter(function(d) { return d.styleNode === 'default' || d.styleNode === 'chronological' || d.styleNode === 'bastard' || d.styleNode === 'activated' || d.styleNode === 'selected'; })
            .transition()
            .duration(config.chart.transitions.titles)
            .style('opacity', this.redrawTitles());

          // For each node title refresh height to apply styles.
          titles.style('height', function() { return text().heightCss(draw.searchNode(this)); });

          // Apply background alfa and specific node style.
          titles.filter(function(node) { return node.styleNode === 'root'; })
            .style('color', 'white')
            .style('display', 'table-cell')
            .style('vertical-align', 'middle');
          titles.filter(function(node) { return node.styleNode === 'focus'; })
            .style('color', 'black')
            .style('display', 'table-cell')
            .style('vertical-align', 'bottom');

          titles.filter(function(node) { return node.styleNode === 'selected'; })
            .style('color', 'white')
            .style('background-color', 'transparent')
            .style('display', 'table-cell')
            .style('vertical-align', 'middle')
            .style('font-size', '1em');

          if (draw.getScale() < config.chart.zoom.titles.showTextScale) {
            textFocus = config.text.focus;
            textbox.filter(function(node) { return node.depth === 1 && node.styleNode === 'selected'; })
              .attr('width', textFocus.width)
              .attr('height', textFocus.height)
              .attr('x', textFocus.x)
              .attr('y', textFocus.y)
              .attr('transform', 'scale(' + textFocus.scale + ')');

            titles.filter(function(node) { return node.depth === 1 && node.styleNode === 'selected'; })
              .style('color', 'red');
          }

          titles.filter(function(node) { return node.styleNode === 'activated'; })
            .style('color', 'red');
          titles.filter(function(node) { return node.styleNode === 'default' || node.styleNode === 'chronological' || node.styleNode === 'bastard'; })
            .style('color', 'black');
          titles.filter(function(node) { return node.styleNode === 'default' || node.styleNode === 'chronological' || node.styleNode === 'bastard' || node.styleNode === 'activated'; })
            .style('background-color', 'rgba(255,255,255,' + config.chart.titles.backgroundAlfa + ')')
            .style('font-size', '1em');

        },
        /**
         * Return the stroke-width from a d3 scale according the zoom scale.
         *
         * @returns {number}
         */
        getLinkWidth: function() {
          if (typeof drawReference.scaleLinkWidth === 'undefined') {
            // Defined scale first time.
            drawReference.scaleLinkWidth = d3.scale.linear()
              .domain([config.chart.initial.minZoom, config.chart.initial.maxZoom])
              .range([config.chart.link.strokeWidth.normal, config.chart.link.strokeWidth.focus]);
          }

          return drawReference.scaleLinkWidth(this.getScale())/this.getScale();
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
            .style('fill', 'none')
            .style('stroke', 'red')
            .style('stroke-width', 1/this.getScale());
        },
        /**
         * Hide the line between the siblings nodes.
         */
        hideConnection: function() {
          // Clean actual active path if exist.
          system.select('#line-active')
            .data([]).exit().remove()
            .transition()
            .delay(0)
            .duration(config.chart.transitions.lines);

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
              .delay(150)
              .duration(config.chart.transitions.titles);

            title.classed(node.type, options.default)
              .transition()
              .delay(150)
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

          // Store the selected node in the draw object.
          draw.setSelectedNode(node);

          // Highligth the node selected first.
          draw.highlightNode();

          zooming = system.transition()
            .duration(config.chart.zoom.transition)
            .attr('transform', 'translate(' + self.translate + ')scale(' + self.scale + ')');

          // Move to the center.
          zooming.each('end', function() {
            self.setPosition(self.translate);
            self.setScale(self.scale);

            // Set last scale and translate info to the zoom behaviour.
            zoomSvg.translate(self.getPosition());
            zoomSvg.scale(self.getScale());

            // Update nodes data, active and selected according the node clicked.
            points = node.toggleSiblings();

            // Draw the connection.
            draw.showConnection(points);

            draw.toggleTitles(node, {activate: true, default: false});
            draw.all(ratio);

            // End render initialize in the click method.
            draw.animationEnd();
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
          if (typeof drawReference.initialPoint === 'undefined') {
            draw.setInitialPoint(config.chart.initial.x(width), config.chart.initial.y(height));
          }

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
          return (typeof drawReference.actualScale === 'undefined') ? drawReference.actualScale = config.chart.initial.minZoom : drawReference.actualScale;
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
        getElementById: function(id) {
          return system.select( '#n' + id );
        },
        /**
         * Look for the correspond node.
         *
         * @param element
         *  Return
         * @returns {*}
         */
        searchNode: function(element) {
          var node;

          node = d3.select(element).datum();
          if (typeof node === 'undefined') {
            node = d3.select(element.parentNode).datum();
          }

          return node;
        },
        getElementSelected: function() {
          return this.getElementById(this.getSelectedNode().id);
        },
        animation: function() {
          if (typeof drawReference === 'undefined') {
            drawReference.render = null;
          }

          return drawReference.render;
        },
        animationEnd: function() {
          drawReference.render = false;
        },
        animationStart: function() {
          drawReference.render = true;
        },
        /**
         * Return the function to apply the opacity value to each node.
         *
         * @returns {Function}
         */
        redrawTitles: function() {
          return function() {
            if (draw.getScale() < config.chart.zoom.titles.showTextScale) {
              return 0;
            }

            return 1;
          };
        },
        highlightNode: function() {
          draw.getElementSelected()
            .selectAll('.circle-node')
            .transition()
            .style('stroke', 'red')
            .style('fill', 'red');

          draw.getElementSelected()
            .selectAll('.circle-chronological')
            .transition()
            .style('stroke', 'red');
        },
        rScale: function() {
          if (typeof drawReference.rScale === 'undefined') {
            drawReference.rScale = d3.scale.linear()
              .domain([config.chart.initial.minZoom, config.chart.initial.maxZoom]);
          }

          return drawReference.rScale;
        },
        /**
         * Refocus the node if this put in the url.
         *
         * @param nodes
         *   collection of nodes.
         */
        refocusNode: function(nodes) {
          var hash = window.location.hash.match(/[A-Z0-9-]+/);

          // Check if the hash exist on the URL.
          if (!hash) {

            // Apply the inital scale scale
            draw.setInitialScalation();
            return;
          }

          // Filter to get only the node indicated by the GUID in the hash.
          nodes.filter(function(d) {
            // Get location, check if have an specifc node selected and filter it.
            return d.guid === hash[0];
          }).call(function() {
              nodeExtend().click(this.data().pop());
            });
        },
        eventHandler: function(e) {
          if (e.type === 'onclicknodestart' || e.type === 'onclicknodestart') {
            drawReference.nodeClicked = !drawReference.nodeClicked;
          }
          else if (e.type === 'hashchange' && !d3.event) {
            draw.refocusNode(g.selectAll('.node'));
            //@todo: zoom out if the all tree node.
          }
        },
        /**
         * Set initial scalation with the zoom configuration.
         *
         * @param node
         *   Selected node object.
         * @param ratio
         *   Scale of zoom requested. Actually maximun zoom scale.
         */
        setInitialScalation: function() {
          var initialPosition,
            scale = this.getScale();

          system.transition()
            .duration(config.chart.zoom.transition)
            .attr('transform', 'translate(' + draw.initialPoint().x +', ' + draw.initialPoint().y + ')scale(' + scale + ')');

        },
        hideGrandChildren: function(ratio) {
          // Selection of the objects.
          var selection,
            circles,
            circlesChronological,
            circleTarget;

          if (ratio < config.chart.zoom.hideGrandChildren) {
            selection = g.selectAll('.node');

            circles = selection.selectAll('.circle-node');
            circlesChronological = selection.selectAll('.circle-chronological');
            circleTarget = selection.selectAll('.circle-target');

            circles.filter(function(node) { return node.depth > 1; })
              .transition()
              .duration(config.chart.transitions.circles)
              .ease('linear')
              .attr('r', 0);

            circlesChronological.filter(function(node) { return node.depth > 1; })
              .transition()
              .duration(config.chart.transitions.circles)
              .ease('linear')
              .attr('r', 0);

            // Target Touch: Resize target touch area.
            circleTarget.filter(function(node) { return node.depth > 1; })
              .transition()
              .duration(config.chart.transitions.circles)
              .attr('r', 0);

            // Update connections.
            system.selectAll('.link')
              .transition()
              .duration(config.chart.transitions.lines)
              .style('stroke-width', 0);

            system.selectAll('.dashed')
              .transition()
              .duration(config.chart.transitions.lines)
              .style('stroke-width', 0);

            system.select('#line-active')
              .transition()
              .duration(config.chart.transitions.lines)
              .style('stroke-width', 0);
          }


        },
        showTranslation: function() {
          var translation = system.select('#translation'),
            circle,
            gTranslate;

          if (config.chart.translation.show) {

            // Create translation button.
            if (translation.empty()) {

              gTranslate = system.append('g')
                .attr('id', 'translation')
                .selectAll('node-translate')
                .data([config.chart.translation.data])
                .enter()
                .append('g')
                .attr('id', 'node-translate')
                .attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; });

              circle = gTranslate.append('circle')
                .attr('id', 'node-translate')
                .attr('r', nodeExtend().getRadius)
                .style('fill', nodeExtend().fill)
                .style('stroke', nodeExtend().stroke)
                .style('stroke-width', nodeExtend().strokeWidth);

              textbox = gTranslate.append('foreignObject')
                .attr('class', 'textbox textbox-translate');

              textbox.attr('x', text().x)
                .attr('y', text().y)
                .attr('width', text().width)
                .attr('height', text().height)
                .attr('transform', text().transform)
                .append('xhtml:body')
                .attr('class', 'area')
                .html(text().html)
                .on('click', nodeExtend().changeLanguage);

              textbox.select('.translate')
                .style('height', function() { return text().heightCss(draw.searchNode(this)); })
                .style('color', 'black')
                .style('display', 'table-cell')
                .style('vertical-align', 'middle');

              gTranslate.append('circle')
                .on('click', nodeExtend().changeLanguage)
                .attr('class', 'circle-target')
                .attr('r', nodeExtend().targetTouch)
                .style('fill', function() { return (config.chart.initial.targetTouch.show) ? config.chart.initial.targetTouch.color : 'transparent'; })
                .style('stroke', config.chart.initial.targetTouch.color)
                .style('stroke-width', 1);

            }
          }
        }
      };
    };
    // Initialize draw object.
    draw = drawModule();

     // Register listeners.
    window.addEventListener('hashchange', draw.eventHandler, false);
    window.addEventListener('onclicknodestart', draw.eventHandler, false);
    window.addEventListener('onclicknodeend', draw.eventHandler, false);

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
    // @todo: Add Initial draw instructions in the draw module.
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

    // Links.
    g.append('g')
      .attr('id', 'links')
      .selectAll('.link')
      .data(links)
      .enter().append('path')
      .attr('class', 'link')
      .attr('d', function(d) {
        function x(d) { return d.x; }
        function y(d) { return d.y; }

        return 'M' + x(d.source) + ',' + y(d.source) + 'L' + x(d.target) + ',' + y(d.target);
      })
      .style('stroke-width', 1.5)
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

        // Generate the dashed line.
        if (config.chart.zoom.dashedLine.show) {
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

    // Nodes.
    node = g.selectAll('.node')
      .data(nodes)
      .enter().append('g')
      .attr('id', function(node, index) { return 'n' + index; })
      .attr('guid', function(node) { return node.guid; })
      .attr('class', 'node')
      .attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; });

    // Translation.
    draw.showTranslation();

    // Circles.
    node.append('circle')
      .attr('id', function(node, index) { return 'n' + index + '-circle'; })
      .attr('class', 'circle-node')
      .attr('r', nodeExtend().getRadius)
      .style('fill', nodeExtend().fill)
      .style('stroke', nodeExtend().stroke)
      .style('stroke-width', nodeExtend().strokeWidth);

    // Chronological circles.
    node.filter(function(node) { return node.type === 'chronological';})
      .insert('circle', '.circle-node')
      .attr('r', nodeExtend().getRadiusInternal)
      .attr('class', 'circle-chronological')
      .style('fill', 'white')
      .style('stroke', nodeExtend().stroke)
      .style('stroke-width', nodeExtend().strokeWidth);

    // Titles.
    textbox = node.append('foreignObject')
      .attr('class', 'textbox');

    textbox.filter(function(d) { return d.styleNode === 'default' || d.styleNode === 'chronological' || d.styleNode === 'bastard' || d.styleNode === 'activated' || d.styleNode === 'selected'; })
      .style('opacity', 0);

    textbox.attr('x', text().x)
      .attr('y', text().y)
      .attr('width', text().width)
      .attr('height', text().height)
      .attr('transform', text().transform)
      .append('xhtml:body')
      .attr('class', 'area')
      .html(text().html)
      .on('click', nodeExtend().click);

    // Target touch.
    node.append('circle')
      .on('click', nodeExtend().click)
      .attr('class', 'circle-target')
      .attr('r', nodeExtend().targetTouch)
      .style('fill', function() { return (config.chart.initial.targetTouch.show) ? config.chart.initial.targetTouch.color : 'transparent'; })
      .style('stroke', config.chart.initial.targetTouch.color)
      .style('stroke-width', 1);

    // Add height for the titles style.
    node.selectAll('.titles')
      .style('height', function() { return text().heightCss(draw.searchNode(this)); });

    // Update the text.
    draw.updateText();

    // Hide the nodes and connection of depth 2+.
    draw.hideGrandChildren(draw.getScale());

    // Refocus the last node checked in the content pages.
    draw.refocusNode(node);

    // Public CDL API.
    return {
      setBackgroud: function() {
        draw.setInitialPoint(config.chart.initial.x(width), config.chart.initial.y(height));

        background.style('fill', 'white')
          .attr('transform', 'translate(' + draw.initialPoint().x + ', ' + draw.initialPoint().y + ')');

        system.attr('transform', 'translate(' + draw.initialPoint().x + ', ' + draw.initialPoint().y + ')');

        zoomSvg.translate([draw.initialPoint().x, draw.initialPoint().y]);
        zoomSvg.scale(config.chart.initial.minZoom);
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
