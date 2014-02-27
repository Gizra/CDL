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
     *   transitions: Define duration in miliseconds of the transitions, for each kind of elements.
     */
    this.chart = {
      canvas: {
        width: 900,
        height: 600
      },
      initial: {
        x: function(width) { return -width * 0.03;},
        y: function(height) { return height * 0.35;},
        minZoom: 0.60,
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
          scaleDomain: [2,4]
        },
        dashedLine: {
          hideInScale: 2,
          show: false
        },
        transition: 750,
        hideTriangle: 10,
        hideGrandChildren: 0.61
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
      titles: {
        backgroundAlfa: 0
      },
      link: {
        strokeWidth: {
          normal: 1.5,
          focus: 2.5
        }
      },
      nodesSeparation: {
        horizontal: 2
      },
      transitions: {
        titles: 40,
        circles: 40,
        lines: 40
      },
      translation: {
        show: true,
        size: {
          r: 50
        },
        data: {
          name: 'BIBLIOTECA NACIONAL DE ISRAEL: DEPÓSITO DE MEMORIA',
          x: 600,
          y: -150,
          styleNode: 'translation',
          url: 'http://gizra.github.io/CDL-ES/'
        }
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
        rFocus: 12,
        targetTouch: 15
      },
      bastard: {
        fill: 'white',
        stroke: 'black',
        strokeWidth: 1,
        r: 5,
        rFocus: 12,
        targetTouch: 15
      },
      chronological: {
        fill: 'black',
        stroke: 'black',
        strokeWidth: 1,
        r: 1.5,
        rFocus: 4,
        targetTouch: 15,
        r2: 5,
        r2Focus: 12
      },
      selected: {
        fill: 'red',
        stroke: 'red',
        strokeWidth: 1,
        r: 12,
        rFocus: 80,
        targetTouch: 50
      },
      activated: {
        fill: 'red',
        stroke: 'red',
        strokeWidth: 1,
        r: 5,
        rFocus: 12,
        targetTouch: 15
      },
      root: {
        fill: 'red',
        stroke: 'red',
        strokeWidth: 1,
        r: 50,
        rFocus: 50,
        targetTouch: 50
      },
      focus: {
        fill: 'black',
        stroke: 'black',
        strokeWidth: 1,
        r: 5,
        rFocus: 12,
        targetTouch: 15
      },
      translation: {
        fill: 'transparent',
        stroke: 'black',
        strokeWidth: 1,
        r: 50,
        rFocus: 50,
        targetTouch: 50
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
        x: -55,
        y: -55,
        width: 110,
        height: 110,
        scale: 1.2,
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
        x: -35,
        y: -35,
        width: 70,
        height: 70,
        scale: 0.3,
        class: 'selected'
      },
      activated: {
        x: 12,
        y: 12,
        width: 80,
        height: 60,
        scale: 0.2,
        class: 'activated'
      },
      translation: {
        x: -55,
        y: -55,
        width: 110,
        height: 110,
        scale: 1.3,
        class: 'translate'
      }
    };
  }

  window.CDLConfig =  new CDLConfig();
})(window);

