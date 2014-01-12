'use strict';

(function (window){
  // Defining initial configuration.
  function CDLConfig() {

    /**
     * General chart configuration.
     *
     * @type {*}
     *   initial: Initial position {x, y} coordinates and zoom scale. [1-60],
     *   text: Define the zoom scale to show the titles,
     *   center: Draw a circle in the center of the screen,
     *   triangle: Define triangle configuration fill color and stroke.
     *   dashedLine: Define stroke and style (length "line, separation").
     *   nodesSeparation: Horizontal separation of the nodes, this value it's related with
     *   the size of the nodes.
     */
    this.chart = {
      initial: {
        x: function(width) { return -width * 0.20;},
        y: function(height) { return height * 0.45;},
        minZoom: 1,
        maxZoom: 5,
        rootPosition: {
          x: function(width) { return width/3;},
          y: function(height) { return -height/4;}
        },
        targetTouch: {
          show: true,
          color: 'transparent'
        }
      },
      zoom: {
        titles: {
          showTextScale: 2,
          scaleDomain: [1,1.1]
        },
        dashedLine: {
          hideInScale: 2,
          show: false
        },
        transition: 1000,
        hideTriangle: 10
      },
      center: {
        color: 'green',
        r: 0
      },
      triangle: {
        fill: '#F5F5F5',
        stroke: '#F5F5F5',
        strokeWidth: 1
      },
      dashedLine: {
        stroke: 'black',
        style: '2,2',
        strokeWidth: 1
      },
      link: {
        strokeWidth: 1.5
      },
      nodesSeparation: {
        horizontal: 2
      },
      transitions: {
        titles: 250,
        circles: 250,
        lines: 250
      }
    };

    /**
     * Configuration of the nodes fill color, stroke and size (zoom ratio).
     *
     * @type {*}
     *    default: solid black,
     *    bastard: white with stroke,
     *    chronological: white with inner circle and strike,
     *    selected: red double size,
     *    activated: red,
     *    root: initial node.
     */
    this.nodes = {
      default: {
        fill: 'black',
        stroke: 'black',
        strokeWidth: 1,
        r: 5,
        targetTouch: 10
      },
      bastard: {
        fill: 'white',
        stroke: 'black',
        strokeWidth: 1,
        r: 5,
        targetTouch: 10
      },
      chronological: {
        fill: 'black',
        stroke: 'black',
        strokeWidth: 1,
        r: 1.5,
        targetTouch: 10,
        r2: 5
      },
      selected: {
        fill: 'red',
        stroke: 'red',
        strokeWidth: 1,
        r: 50,
        targetTouch: 110
      },
      activated: {
        fill: 'red',
        stroke: 'red',
        strokeWidth: 1,
        r: 5,
        targetTouch: 10
      },
      root: {
        fill: 'red',
        stroke: 'red',
        strokeWidth: 1,
        r: 80,
        targetTouch: 80
      },
      focus: {
        fill: 'black',
        stroke: 'black',
        strokeWidth: 1,
        r: 5,
        targetTouch: 10
      }
    };

    /**
     * Configuration of the titles of each node, by type.
     *   - position: Position from the center of the circle {x,y}.
     *   - width, height textbox.
     *   - scale: of the default font-size . actually 14px
     *   - css class.
     *
     *
     * @type {*}
     *    focus: sons of the root node.
     *    default: solid black,
     *    bastard: white with stroke,
     *    chronological: white with inner circle and strike,
     *    selected: red double size,
     *    activated: red,
     *    root: initial node.
     */
    this.text = {
      root: {
        x: -50,
        y: -55,
        width: 110,
        height: 110,
        scale: 1,
        class: 'root-title'
      },
      default: {
        x: 20,
        y: -10,
        width: 80,
        height: 60,
        scale: 0.2,
        class: 'default'
      },
      focus: {
        x: 0,
        y: -70,
        width: 100,
        height: 60,
        scale: 1.2,
        class: 'focus'
      },
      chronological: {
        x: 20,
        y: -10,
        width: 80,
        height: 60,
        scale: 0.2,
        class: 'chronological'
      },
      bastard: {
        x: 20,
        y: -10,
        width: 80,
        height: 60,
        scale: 0.2,
        class: 'bastard'
      },
      selected: {
        x: -30,
        y: -30,
        width: 80,
        height: 80,
        scale: 0.2,
        class: 'selected'
      },
      activated: {
        x: 12,
        y: 12,
        width: 80,
        height: 60,
        scale: 0.2,
        class: 'activated'
      }
    };
  }

  window.CDLConfig =  new CDLConfig();
})(window);

