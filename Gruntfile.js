// Generated on 2013-11-17 using generator-jekyllrb 0.4.1
'use strict';

// Require libraries for the CDL task.
var _ = require('underscore');
var he = require('he');

// Directory reference:
//   css: css
//   compass: _scss
//   javascript: js
//   images: img
//   fonts: fonts

module.exports = function (grunt) {
  // Show elapsed time after tasks run.
  require('time-grunt')(grunt);
  // Load all Grunt tasks.
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    // Configurable paths.
    yeoman: {
      app: 'app',
      dist: 'dist',
      brain: 'brain',
      template: 'template'
    },
    watch: {
      compass: {
        files: ['<%= yeoman.app %>/_scss/**/*.{scss,sass,css}'],
        tasks: ['compass:server', 'autoprefixer:server']
      },
      autoprefixer: {
        files: ['<%= yeoman.app %>/css/**/*.css'],
        tasks: ['copy:stageCss', 'autoprefixer:server']
      },
      jekyll: {
        files: [
          '<%= yeoman.app %>/**/*.index.html',
          '_config.yml',
          '_config.build.yml',
          '!<%= yeoman.app %>/_bower_components',
          '<%= yeoman.template %>/**/*'
        ],
        tasks: [
          'cdlPrepare',
          'convert:json2yaml',
          'generate',
          'copy:cdl',
          'clean:brain',
          'jekyll:server'
        ]
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '.jekyll/**/*.html',
          '.tmp/css/**/*.css',
          '{.tmp,<%= yeoman.app %>}/<%= js %>/**/*.js',
          '<%= yeoman.app %>/img/**/*.{gif,jpg,jpeg,png,svg,webp}'
        ]
      }
    },
    connect: {
      options: {
        port: 8000,
        livereload: 35735,
        // change this to '0.0.0.0' to access the server from outside
        hostname: 'localhost'
      },
      livereload: {
        options: {
          open: true,
          base: [
            '.tmp',
            '.jekyll',
            '<%= yeoman.app %>'
          ]
        }
      },
      dist: {
        options: {
          open: true,
          base: [
            '<%= yeoman.dist %>'
          ]
        }
      },
      test: {
        options: {
          base: [
            '.tmp',
            '.jekyll',
            'test',
            '<%= yeoman.app %>'
          ]
        }
      }
    },
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= yeoman.dist %>/*',
            // Running Jekyll also cleans the target directory.  Exclude any
            // non-standard `keep_files` here (e.g., the generated files
            // directory from Jekyll Picture Tag).
            '!<%= yeoman.dist %>/.git*',
            '<%= yeoman.app %>/pages',
            '<%= yeoman.app %>/data'
          ]
        }]
      },
      server: [
        '.tmp',
        '.tmp',
        '.jekyll',
        '<%= yeoman.app %>/pages',
        '<%= yeoman.app %>/data'
      ],
      brain: [
        '<%= yeoman.app %>/data/.tmp'
      ]
    },
    compass: {
      options: {
        // If you're using global Sass gems, require them here.
        // require: ['singularity', 'jacket'],
        bundleExec: true,
        sassDir: '<%= yeoman.app %>/_scss',
        cssDir: '.tmp/css',
        imagesDir: '<%= yeoman.app %>/img',
        javascriptsDir: '<%= yeoman.app %>/js',
        fontsDir: '<%= yeoman.app %>/fonts',
        importPath: '<%= yeoman.app %>/_bower_components',
        httpFontsPath: '/fonts',
        relativeAssets: false,
        httpImagesPath: '/img',
        httpGeneratedImagesPath: '/img/generated',
        outputStyle: 'expanded',
        raw: 'extensions_dir = "<%= yeoman.app %>/_bower_components"\n'
      },
      dist: {
        options: {
          generatedImagesDir: '<%= yeoman.dist %>/img/generated'
        }
      },
      server: {
        options: {
          debugInfo: true,
          generatedImagesDir: '.tmp/img/generated'
        }
      }
    },
    autoprefixer: {
      options: {
        browsers: ['last 2 versions']
      },
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.dist %>/css',
          src: '**/*.css',
          dest: '<%= yeoman.dist %>/css'
        }]
      },
      server: {
        files: [{
          expand: true,
          cwd: '.tmp/css',
          src: '**/*.css',
          dest: '.tmp/css'
        }]
      }
    },
    jekyll: {
      options: {
        bundleExec: true,
        config: '_config.yml,_config.build.yml',
        src: '<%= yeoman.app %>'
      },
      dist: {
        options: {
          dest: '<%= yeoman.dist %>'
        }
      },
      server: {
        options: {
          config: '_config.yml',
          dest: '.jekyll'
        }
      },
      check: {
        options: {
          doctor: true
        }
      }
    },
    // UseminPrepare will only scan a single page for usemin blocks. If you
    // use usemin blocks that aren't in index.html, create a usemin manifest
    // page (hackery!) and point this task there.
    useminPrepare: {
      options: {
        dest: '<%= yeoman.dist %>'
      },
      html: '<%= yeoman.dist %>/index.html'
    },
    usemin: {
      options: {
        basedir: '<%= yeoman.dist %>',
        dirs: ['<%= yeoman.dist %>/**/*']
      },
      html: ['<%= yeoman.dist %>/**/*.html'],
      css: ['<%= yeoman.dist %>/css/**/*.css']
    },
    htmlmin: {
      dist: {
        options: {
          collapseWhitespace: true,
          collapseBooleanAttributes: true,
          removeAttributeQuotes: true,
          removeRedundantAttributes: true
        },
        files: [{
          expand: true,
          cwd: '<%= yeoman.dist %>',
          src: '**/*.html',
          dest: '<%= yeoman.dist %>'
        }]
      }
    },
    // Usemin adds files to concat
    concat: {},
    // Usemin adds files to uglify
    uglify: {},
    // Usemin adds files to cssmin
    cssmin: {
      dist: {
        options: {
          check: 'gzip'
        }
      }
    },
    imagemin: {
      dist: {
        options: {
          progressive: true
        },
        files: [{
          expand: true,
          cwd: '<%= yeoman.dist %>',
          src: '**/*.{jpg,jpeg,png}',
          dest: '<%= yeoman.dist %>'
        }]
      }
    },
    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.dist %>',
          src: '**/*.svg',
          dest: '<%= yeoman.dist %>'
        }]
      }
    },
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>',
          src: [
            // Jekyll processes and moves HTML and text files
            // Usemin moves CSS and javascript inside of Usemin blocks
            // Copy moves asset files and directories
            'images/**/*',
            'js/**/*',
            'fonts/**/*',
            // Like Jekyll, exclude files & folders prefixed with an underscore
            '!**/_*{,/**}',
            // Explicitly add any files your site needs for distribution here
            //'_bower_components/jquery/jquery.js',
            //'favicon.ico',
            //'apple-touch*.png'
            'data/**/*',
            'pages/**/*.{jpg,JPG,PNG,png,gif,jpeg,webp,tiff,mp3,wav,avi,mp4}'
          ],
          dest: '<%= yeoman.dist %>'
        },
        // Copy the file that define domains/subdomains redirected to the gh-pages site.
        {
          expand: true,
          cwd: '<%= yeoman.app %>',
          src: 'CNAME',
          dest: '<%= yeoman.dist %>'
        }]
      },
      // Copy CSS into .tmp directory for Autoprefixer processing
      stageCss: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>/css',
          src: '**/*.css',
          dest: '.tmp/css'
        }]
      },
      cdl: {
        files: [{
          expand: true,
          dot: true,
          cwd: 'brain/files',
          src: '**/*.{jpg,JPG,png,PNG,gif,jpeg,webp,tiff,mp3,wav,avi,mp4}',
          dest: '<%= yeoman.app %>/pages'
        }]
      }
    },
    rev: {
      options: {
        length: 4
      },
      dist: {
        files: {
          src: [
            '<%= yeoman.dist %>/js/**/*.js',
            '<%= yeoman.dist %>/css/**/*.css',
            '<%= yeoman.dist %>/img/**/*.{gif,jpg,jpeg,png,svg,webp}',
            '<%= yeoman.dist %>/fonts/**/*.{eot*,otf,svg,ttf,woff}'
          ]
        }
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js',
        '<%= yeoman.app %>/js/**/*.js',
        'test/spec/**/*.js',
        '!<%= yeoman.app %>/js/vendor/**/*'
      ]
    },
    csscss: {
      options: {
        bundleExec: true,
        minMatch: 2,
        ignoreSassMixins: false,
        compass: true,
        colorize: true,
        shorthand: false,
        verbose: true
      },
      check: {
        src: ['<%= yeoman.app %>/css/**/*.css',
          '<%= yeoman.app %>/_scss/**/*.scss']
      }
    },
    csslint: {
      options: {
        csslintrc: '.csslintrc'
      },
      check: {
        src: [
          '<%= yeoman.app %>}/css/**/*.css',
          '<%= yeoman.app %>}/_scss/**/*.scss'
        ]
      }
    },
    concurrent: {
      server: [
        'compass:server',
        'copy:stageCss',
        'jekyll:server'
      ],
      dist: [
        'compass:dist',
        'copy:dist'
      ]
    },
    convert: {
      xml2json: {
        options: {
          explicitArray: false
        },
        files: [
          {
            expand: true,
            cwd: '<%= yeoman.brain %>/',
            src: ['**/*.xml'],
            dest: '<%= yeoman.app %>/data/',
            ext: '.json'
          }
        ]
      },
      json2yaml: {
        files: [
          {
            expand: true,
            cwd: '<%= yeoman.app %>/data/.tmp/',
            src: ['**/*.json'],
            dest: '<%= yeoman.app %>/data/.tmp/',
            ext: '.yml'
          }
        ]
      }
    },
    'gh-pages': {
      options: {
        base: 'dist'
      },
      src: ['**']
    },
    replace: {
      dist: {
        src: [
          '<%= yeoman.dist %>/**/index.html',
          '<%= yeoman.dist %>/css/*.css'
        ],
        overwrite: true,
        replacements: [{
          from: '<link rel="stylesheet" href="css/',
          to: '<link rel="stylesheet" href="//gizra.github.io/CDL/css/'
        },
        {
          from: '<script src="js/',
          to: '<script src="//gizra.github.io/CDL/js/'
        },
        {
          from: '<script src="/js/',
          to: '<script src="//gizra.github.io/CDL/js/'
        },
        {
          from: 'url(/fonts/',
          to: 'url(http://gizra.github.io/CDL/fonts/'
        },
        {
          from: 'url(/images/',
          to: 'url(http://gizra.github.io/CDL/images/'
        }]
      }
    },
    'CDL': {
      src: '<%= yeoman.app %>/data/brain.json',
      dest: '<%= yeoman.app %>/data/tree.json',
      tmp: '<%= yeoman.app %>/data/.tmp/'
    },
    'generate': {
      src: '<%= yeoman.app %>/data/tree.json',
      dest: '<%= yeoman.app %>/pages/',
      template: 'pageFull'
    }
  });

  grunt.registerTask('CDL', function() {
    var src = {},
        dest = {};

    // Data Information.
    var nodesIndexed = [],
      nodes = {},
      nodesLinks = [],
      nodesEntries = [],
      nodesAttachments = [],
      firstNode,
      tree = {},
      brain;

    src.path = grunt.config.get('CDL.src');
    dest.path = grunt.config.get('CDL.dest');

    /**
     * Prepare collection of nodes indexed, that will use to parse and generate the tree.
     */
    function prepareData() {
      /**
       * Create an object to filter the data from brain.json file and store in a work
       * variables.
       *
       * The filtering of the nodes it does by identify the "forgotten nodes" and separete this
       * separate from the rest "valid nodes". Example of a Thought tag element:
       *
       *  <Thought>
       *    <guid>723DF418-A329-4636-45E0-B0357D423F7B</guid>
       *    <name>:1: The Wanderings of the Children of Israel in the desert</name>
       *    <label></label>
       *    <creationDateTime>2014-01-07 12:00:05.264 @+0200</creationDateTime>
       *    <realModificationDateTime>2014-01-09 12:49:19.623 @+0200</realModificationDateTime>
       *    <displayModificationDateTime>2014-01-09 12:48:51.711 @+0200</displayModificationDateTime>
       *    <forgottenDateTime>2014-01-09 12:49:19.623 @+0200</forgottenDateTime>
       *    <activationDateTime>2014-01-09 12:49:14.493 @+0200</activationDateTime>
       *    <linksModificationDateTime>2013-11-19 13:28:32.242 @+0200</linksModificationDateTime>
       *    <isType>0</isType>
       *    <color>0</color>
       *    <accessControlType>0</accessControlType>
       *  </Thought>
       *
       *
       * @constructor
       * @param brainData
       *  Json object with the contain brain data, exporter from the brain xml file.
       *
       *  brainData {
       *    Attachments: {*},
       *    AttributesDatas: '',
       *    Attributes: {*},
       *    Entries: {*},
       *    Links: {*},
       *    Source: {*},
       *    Thoughts: {*}
       *  }
       *
       */
      function Data(brainData) {
        var self = this;

        this.data = brainData;
        this.nodes = {};
        this.links = {};
        this.entries = {};
        this.attachments = {};

        // Filter forgotten nodes. (Definition in the beginning of the function)
        this.filterNodes = function() {
          self.nodes.valid = _.filter(self.data.Thoughts.Thought, function(node){
            return typeof node.forgottenDateTime === 'undefined';
          });
          self.nodes.forgotten = _.filter(self.data.Thoughts.Thought, function(node){
            return typeof node.forgottenDateTime !== 'undefined';
          });
        };

        // Filter links of forgotten nodes.
        this.filterLinks = function(result) {
          var properties = ['idB', 'idA'];
          _.each(self.nodes.forgotten, function(node) {
            properties.forEach(function(property) {
              result = _.filter(result, function(link) {
                return link[property] !== node.guid;
              });
            });
          });
          return result;
        };

        // Filter entries of forgotten nodes.
        this.filterEntries = function(result) {
          _.each(self.nodes.forgotten, function(node) {
            result = _.filter(result, function(entry) {
              return entry.EntryObjects.EntryObject.objectID !== node.guid;
            });
          });
          return result;
        };

        // Filter Attachments of forgotten nodes.
        this.filterAttachments = function(result) {
          _.each(self.nodes.forgotten, function(node) {
            result = _.filter(result, function(attachment) {
              return attachment.objectID !== node.guid;
            });
          });
          return result;
        };


        return {
          /**
           * Return the guid of the root node.
           *
           * @returns {*}
           */
          getFirstNode: function() {
            return self.data.Source.homeThoughtGuid;
          },
          /**
           * Return and array of node objects "valid", without the forgotten nodes.
           *
           * @returns [{*}]
           *  Array of node objects.
           */
          getValidNodes: function(){
            // Filter nodes store into properties.
            self.filterNodes();

            return self.nodes.valid;
          },
          /**
           * Return and array of a links objects.
           *
           * @returns {*}
           */
          getLinks: function(){
            self.links = self.filterLinks(self.data.Links.Link);

            return self.links;
          },
          /**
           * Return and array of a entries objects.
           *
           * @returns {*}
           */
          getEntries: function() {
            self.entries = self.filterEntries(self.data.Entries.Entry);

            return self.entries;
          },
          /**
           * Return and array of attachments objects.
           *
           * @returns {*}
           */
          getAttachments: function() {
            self.attachments = self.filterAttachments(self.data.Attachments.Attachment);

            return self.attachments;
          }
        };
      }

      // Create object to do pre-filtering with the data.
      brain = new Data(src.data.BrainData);
      firstNode = brain.getFirstNode();

      // Prepare raw data in thoughts, links, entries and attachments and "guid" of the root node.
      nodes = brain.getValidNodes();
      nodesLinks = brain.getLinks();
      nodesEntries = brain.getEntries();
      nodesAttachments = brain.getAttachments();

      // Remove properties not necessary data from Node and links.
      _.each(nodes, function(thought, index) {
        nodes[index] = _.pick(thought, 'guid', 'name');
      });
      _.each(nodesLinks, function(link, index) {
        nodesLinks[index] = _.pick(link, 'guid', 'idA', 'idB', 'dir', 'linkTypeID', 'isBackward');
      });
      _.each(nodesEntries, function(entry, index) {
        nodesEntries[index] = _.pick(entry, 'guid', 'EntryObjects', 'body', 'format');
      });
      _.each(nodesAttachments, function(item, index) {
        nodesAttachments[index] = _.omit(item, 'creationDateTime', 'modificationDateTime');
      });

      // Index the nodes of thought by guid.
      nodesIndexed = _.indexBy(nodes, 'guid');
      // Index entries.
      _.each(nodesEntries, function(entry) {
        entry.objectID = entry.EntryObjects.EntryObject.objectID;
      });
      nodesEntries = _.indexBy(nodesEntries, 'objectID');
      // Index attachments.
      nodesAttachments = _.groupBy(nodesAttachments, function(item) {
        return item.objectID;
      });

      // Prepare the root of the tree.
      nodes = _.without(nodes, nodesIndexed[firstNode]);
      nodes.unshift(nodesIndexed[firstNode]);

      // Refresh nodesIndexed.
      nodesIndexed = _.indexBy(nodes, 'guid');
    }

    /**
     * Get first node of the array order by node.chronologicaltId.
     *
     * @param nodes
     * @returns {*}
     */
    function getFirst(nodes) {
      return _.min(nodes, function(node) {
        return parseInt(node.chronologicalId, 10);
      });
    }

    /**
     * From an array of nodes node.type: 'chronological', Reorder these in order chronological. Where the children nodes are
     * the next event in order, this repeat for each node.
     *
     * param nodes
     * @returns {*}
     */
    function reorderChronological(nodes) {
      var node;

      // Get the first node and an array without the node.
      node = getFirst(nodes);
      nodes = _.without(nodes, node);
      if (nodes.length > 0) {
        node.children = _.union(node.children, [reorderChronological(nodes)]);
      }

      return node;
    }

     /**
     * Set the content data and properties according the type of node.
     *
     * @param node
     */
    function setNodeContent(node) {
      var regexChronological = /:\d+:/,
          regexBastard = /:_:/,
          regexId = /:/,
          regexContent = /(&lt;body&gt;)((\n.*)*)(&lt;\/body&gt;)/,
          regexCleaner,
          rawName;

      // Init regex for content.
      regexCleaner = [
        {
          regex: / ?class=".*?"+/,
          phrase: ''
        },
        {
          regex: / ?style=".*?"+/,
          phrase: ''
        },
        {
          regex: / ?align=".*?"+/,
          phrase: ''
        },
        {
          regex: /^\n+/,
          phrase: ''
        },
        {
          regex: /$\n+/,
          phrase: ''
        },
        {
          regex: /<font .*?>/,
          phrase: ''
        },
        {
          regex: /<\/font>/,
          phrase: ''
        }
      ];

       /**
        * Clean the content extracted with an array of regular expressions and phrases.
        *
        * @param data
        * @param regex
        * @param phrase
        *
        * @returns {string}
        */
      function cleanContent(data, regex, phrase) {
        data = data.replace(regex, phrase);
        if (data.match(regex)) {
          data = cleanContent(data, regex, phrase);
        }
        return data;
      }

      // Add "node.name" to escape HTML entities in YAML.
      rawName = he.decode(node.name);
      node.name = rawName;

      // Add entry content to the node.
      node.data = '';
      if (nodesEntries[node.guid] && nodesEntries[node.guid].body) {
        // Extract the content from body.
        if (regexContent.test(nodesEntries[node.guid].body)) {
          node.data = he.decode(nodesEntries[node.guid].body.match(regexContent)[2]);
        }
        else {
          node.data = he.decode(nodesEntries[node.guid].body);
        }

        // Clean content.
        regexCleaner.forEach(function(element) {
          node.data = cleanContent(node.data, element.regex, element.phrase);
        });
      }

      // Add attachments.
      node.attachments = [];
      if (nodesAttachments[node.guid]) {
        node.attachments = nodesAttachments[node.guid];
      }

      // Categorize child.
      if (node.name.match(regexChronological)) {
        // Chronological childs.
        node.type = 'chronological';
        node.chronologicalId = rawName.split(regexId)[1];
        node.chronologicalName = rawName.split(regexChronological)[1].trim();
      }
      else if (node.name.match(regexBastard)) {
        // Bastard childs.
        node.type = 'bastard';
        node.bastardName = rawName.split(regexBastard)[1].trim();
      }
      else {
        node.type = 'default';
      }
    }

    // @todo: Function repeted in grunt task CDLPrepare, create one function in a multitask grunt task for
    // the tasks CDL, generate and CDLPrepare.
    /**
     * Helper to select the correct name of the node according its type.
     *
     * @param node
     * @returns {*}
     */
    function getName(node) {
      return (node.type === 'chronological') ? node.chronologicalName : (node.type === 'bastard') ? node.bastardName : node.name;
    }

    /**
     * From an array of nodes links we get the information of each sibling node.
     *
     * @param childs
     * @returns {*}
     */
    function setSiblingsInfo(childs) {
      var key,
        siblings = [];

      _.each(childs, function(child) {

        if (child.dir === '1') {
          key = child.idB;
        }
        else if (child.dir === '2') {
          key = child.idA;
        }
        siblings.push(_.pick(nodesIndexed[key], 'guid', 'name'));

      });

      return siblings;
    }


    /**
     * Reorder the childs properties according dir: (Brain direction), type: chronological, bastard and default.
     * Return a collection of childs categorized and organized.
     *
     * @param childs
     * @param parent
     * @returns {*}
     */
    function parseChilds(childs, parent, depth) {
      var childsOrdered = [],
        chronologicalChilds;

      // Parse child.
      _.each(childs, function(child, index, childs) {

        // Set node information of child node.
        child.node = {};

        child.node.children = [];
        if (child.dir === '1') {
          child.node = nodesIndexed[child.idB];
        }
        else if (child.dir === '2') {
          child.node = nodesIndexed[child.idA];
        }

        // Parse the content and set the classification of the node.
        setNodeContent(child.node);

        // Add depth.
        if (typeof depth === 'undefined') {
          child.node._depth = 1;
        }
        else {
          child.node._depth = depth+1;
        }

        // Add parent information.
        if (parent.guid !== firstNode && child.node._depth > 2) {
          child.node.parent = _.pick(parent, 'guid');
          child.node.parent.name = getName(parent);
        }

        // Set parent guid.
        child.node.hasChronologicalChildren = false;

        // Look up for more generations of childrens.
        child.node.children = getChilds(child.node, child.node._depth);

        // If a chronological node have grandchildSet the granchild.parent like the father parent.
        if (child.node.type === 'chronological' && child.node.children.length > 0) {
          _.each(child.node.children, function(grandchild){
            grandchild.parent = child.node.parent;
          });
        }

        // Check if have chronological children if the node is not chronological, and set it.
        if (child.node.type !== 'chronological' && _.where(child.node.children, {type: 'chronological'}).length) {
          child.node.hasChronologicalChildren = true;
        }

        // Get the siblings nodes.
        child.node.brothers = [];

        if (child.node.type !== 'chronological' && !child.node.hasChronologicalChildren && child.node._depth > 1) {
          child.node.brothers = _.filter(setSiblingsInfo(childs), function(brother) {
            // Clean the name property.
            var label = undefined;

            brother._name = brother.name;
            brother.name = he.decode(brother.name);

            brother.result = brother.name.match(/^:\d+: (.*)|^:_: (.*)/);
            if (brother.result) {
              brother._result = [];
              brother.result.forEach(function(item) {
                if (typeof item !== 'undefined') {
                  brother._result.push(item);
                }
              });
              brother._result = new Array(brother._result);
              label = brother._result.pop();
            }

            brother.name = (label) ? label.pop() : brother.name;

            return brother.guid !== child.node.guid && !brother._name.match(/:\d+:/);
          });
        }

        childsOrdered.push(child.node);
      });

      // Select chronological nodes from children.
      chronologicalChilds = _.where(childsOrdered, {type: 'chronological'});

      if (chronologicalChilds.length) {
        // Reorder chronological childs.
        childsOrdered = _.union(_.difference(childsOrdered, chronologicalChilds),  reorderChronological(chronologicalChilds));
      }

      // Join childs classified.
      return childsOrdered;
    }


    /**
     * Get childs of the node.
     *
     * @param node
     * @param depth
     * @returns {*}
     */
    function getChilds(node, depth) {
      var childsOrdered = [],
          childs = [];

      grunt.log.ok('Parsing node: ' + node.guid);
      childs = _.union( _.where(nodesLinks, {idA: node.guid, dir: '1'}), _.where(nodesLinks, {idB: node.guid, dir: '2'}) );

      if (childs.length) {
        childsOrdered = parseChilds(childs, node, depth);
      }

      return childsOrdered;
    }


     /**
     * Parse JSON to structure d3 layout.
     * Create json d3 tree layout structure.
     * https://github.com/mbostock/d3/wiki/Tree-Layout
     *
     * @returns {*}
     */
    function generateTreeData() {

      prepareData();
      grunt.log.ok('Working object prepared and indexed.');

      // Look up the node and position into the array.
      tree = nodesIndexed[firstNode];
      tree.children = [];

      tree.children = getChilds(tree);

      return tree;
    }

    // Prepare JSON.
    if (grunt.file.exists(src.path)) {
      src.data = grunt.file.readJSON(src.path);
      grunt.log.ok('Loaded source file: ' + src.path);
    }
    else {
      grunt.fail.fatal('File ' + src.path + ' does not exist.');
    }

    try {
      // Generate data.
      dest.data = generateTreeData();
      grunt.log.ok('Data parse.');
    }
    catch(e) {
      grunt.fail.fatal('CDL error: ' + e.message);
    }


    // Save the JSON into a new file.
    grunt.file.write(dest.path, JSON.stringify(dest.data, null, ' '));
    grunt.log.ok('File: ' + dest.path + ' generated.');
  });

  grunt.registerTask('cdlPrepare', function() {
    var tree, treePrepared;

    /**
     * Helper to return a string list of siblings of a specific chronological node.
     *
     * @param node
     * @returns {*}
     */
    function getSiblings(node) {
      var siblings = [];

      /**
       * Filter siblings node from the parent of the first chronological node.
       *
       * @param {*}
       *  Nodes object.
       * @param string
       *  Parent node.guid.
       */
      function filterSiblingsByParent(nodes) {
        _.each(nodes, function(node) {
            // Check for children.
          filterSiblingsByParent(_.where(node.children, {type: 'chronological'}));
        });

        siblings = _.union(siblings, nodes);
      }

      // Get chronological siblings.
      filterSiblingsByParent(_.where(node.children, {type: 'chronological'}));


      // Pick the necessary properties for siblings.
      _.each(siblings, function(sibling, index) {
        siblings[index] = _.pick(sibling, 'guid', 'chronologicalId', 'chronologicalName', 'data', 'attachments');
      });

      return siblings.reverse();
    }

    /**
     * Convert the attachments object in a simple format to handle it in the YAML template.
     *
     * @param attachments
     * @returns {*}
     */
    function convertAttachments(attachments) {
      var item;
      var regexYoutube = /http:\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)(.*)(&(amp;)?[\w\?=]*)?/;
      var regexSoundcloud = /[[http|https]*:]?\/\/?soundcloud\.com\/(.*)/;
      var attachmentsParsed = {
        images: [],
        media: [],
        pages: [],
        youtube: [],
        soundcloud: []
      };

      _.each(attachments, function(attachment) {
        item = {
          name: attachment.name,
          src: attachment.location
        };

        // Attachments type file (media or images ).
        if (attachment.attachmentType === '1') {
          if (attachment.format === '.jpg' || attachment.format === '.png') {
            // Sanitize url.
            item.src = item.src.replace(/\\/, '/');
            // Normalize the extension format.
            item.name = item.name.replace(/.PNG|.JPG/, attachment.format);
            // Remove extension value from the name.
            item.name = item.name.replace(attachment.format, '');
            attachmentsParsed.images.push(item);
          }
          else if (attachment.format === '.mp3') {
            attachmentsParsed.media.push(item);
          }
        }
        // Attachments type url (regular links, youtube or soundcloud links).
        else if (attachment.attachmentType === '3' ) {
          // Check if the link is a youtube's link and prepare properties with video id.
          if (regexYoutube.test(attachment.location)) {
            item.id = attachment.location.match(regexYoutube)[1];
            attachmentsParsed.youtube.push(item);
          }
          // Check if the link is a soundcloud's link and prepare properties with sound hash of the url.
          else if (attachment.location.match(regexSoundcloud)) {
            item.id = attachment.location.match(regexSoundcloud).pop();
            attachmentsParsed.soundcloud.push(item);
          }
          // A regular link.
          else {
            attachmentsParsed.pages.push(item);
          }
        }

      });

      return attachmentsParsed;
    }

    /**
     * Generate JSON files of jekyll pages.
     *
     * @param nodes
     */
    function extractDataPage(nodes) {
      // Write files JSON.
      _.each(nodes, function(node) {
        // Prepare the data, going through the tree from the deepest node to the root.
        if (node.children) {
          extractDataPage(node.children);
        }

        // Pick node selected properties.
        node = _.pick(node, 'guid', 'name', 'data', 'attachments', 'siblings', 'parent', 'children', 'brothers');

        // Capitalize the name of the node.
        node.name = node.name.toUpperCase();

        // Reduce the properties of children.
        if (node.children.length) {
          node.children = _.map(node.children, function(node) {
            return {
              guid: node.guid,
              name: node.name
            };
          });
        }

        // Generate the json file, to bind in the each Jekyll pages, is related with the node.guid.
        grunt.file.write(grunt.config.get('CDL.tmp') + node.guid + '.json', JSON.stringify(node, null, ' '));
        grunt.log.ok('Data object ' + node.guid + ' prepared.');
      });
    }

    /**
     * Helper to select the correct name of the node according its type.
     *
     * @param node
     * @returns {*}
     */
    function getName(node) {
      return (node.type === 'chronological') ? node.chronologicalName : (node.type === 'bastard') ? node.bastardName : node.name;
    }

    /**
     * Prepare data in the format of the YAML need to show in the page of the site.
     *
     * @param nodes
     * @returns {*}
     */
    function prepareData(nodes) {
      // Prepare object to binding with the template system.
      _.each(nodes, function(node, index) {
        // Begin with the last child.
        if (node.children) {
          nodes[index].children = prepareData(node.children);
        }

        // Set name according node type.
        nodes[index].name = getName(node);

        // Modify definition of the object attachments.
        if (node.attachments) {
          nodes[index].attachments = convertAttachments(node.attachments);
        }
      });

      // Get siblings.
      _.each(nodes, function(node, index) {
        nodes[index].siblings = [];
        if (node.type !== 'chronological' && node.hasChronologicalChildren) {
          nodes[index].siblings = getSiblings(node);
        }
      });

      return nodes;
    }

    // Init generation.
    if (grunt.file.exists(grunt.config.get('generate.src'))) {
      // Load work data.
      tree = grunt.file.readJSON(grunt.config.get('generate.src'));
      grunt.log.ok('Load source file: ' + grunt.config.get('generate.src'));

      // Prepare data to Jekyll pages.
      treePrepared = [];
      treePrepared = prepareData([tree]);
      extractDataPage(treePrepared);
    }
    else {
      grunt.fail.fatal('File ' + grunt.config.get('generate.src') + ' does not exist.');
    }
  });

  grunt.registerTask('generate', function () {
    var tree;

    /**
     * Return the template content in a string object.
     *
     * @param name
     *  Could be the name of the file with or without the extension.
     * @returns {*}
     */
    function getTemplate(name) {
      var template;

      name = (name.match(/.html/)) ? 'template/' + name : 'template/' + name + '.html';

      if (grunt.file.exists(name)) {
        // Load template data.
        template = grunt.file.read(name);
      }
      else {
        grunt.fail.fatal('File ' + name + ' does not exist.');
      }

      return template;
    }

    /**
     * Generate the static html file based in a YAML template and the node information. The name of the file is
     * [node.guid].html.
     *
     * @param node
     */
    function generateStaticHtml(node) {
      var template, yamlData, page;

      // Prepare template, filename and data will be write in the yaml page.
      template = getTemplate(grunt.config.get('generate.template'));

      // Read the specific YAML data fragment.
      yamlData = {yaml: grunt.file.read(grunt.config.get('CDL.tmp') + node.guid + '.yml')};

      // Replace dynamic values in the template.
      page = grunt.template.process(template, {data: yamlData});

      // Write the file.
      grunt.file.write(grunt.config.get('generate.dest') + node.guid + '/index.html', page);
      grunt.log.ok(grunt.config.get('generate.dest') + node.guid + '/index.html saved.');
    }

    /**
     * Generate jekyll page for each node.
     *
     * @param nodes
     */
    function generate(nodes) {
      _.each(nodes, function(node) {
        // Generate first the children info.
        generate(node.children);

        // Generate the node info.
        if (node.type !== 'chronological') {
          generateStaticHtml(node);
        }
      });
    }

    // Init generation.
    if (grunt.file.exists(grunt.config.get('generate.src'))) {
      // Load work data.
      tree = grunt.file.readJSON(grunt.config.get('generate.src'));
      grunt.log.ok('Loaded source file: ' + grunt.config.get('generate.src'));
      generate([tree]);
    }
    else {
      grunt.fail.fatal('File ' + grunt.config.get('generate.src') + ' does not exist.');
    }

  });

  // Define Tasks
  grunt.registerTask('serve', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    // Request temporally to load the server with an specific IP address. To load the site in
    // the mobile devices.
    if (target === 'ip') {
      grunt.config('connect.options.hostname', '10.0.0.200');
    }

    grunt.task.run([
      'clean:server',
      'convert:xml2json',
      'CDL',
      'cdlPrepare',
      'convert:json2yaml',
      'generate',
      'copy:cdl',
      'clean:brain',
      'concurrent:server',
      'autoprefixer:server',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('server', function () {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run(['serve']);
  });

  // No real tests yet. Add your own.
  grunt.registerTask('test', [
    //   'clean:server',
    //   'concurrent:test',
    //   'connect:test'
  ]);

  grunt.registerTask('check', [
    'clean:server',
    'jekyll:check',
    'compass:server',
    'jshint:all',
    'csscss:check',
    'csslint:check'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'convert:xml2json',
    'CDL',
    'cdlPrepare',
    'convert:json2yaml',
    'generate',
    'copy:cdl',
    // 'clean:brain',
    'jekyll:dist',
    'concurrent:dist',
    'useminPrepare',
    'concat',
    'autoprefixer:dist',
    'cssmin',
    'uglify',
    // 'imagemin',
    // 'svgmin',
    'rev',
    'usemin',
    'replace:dist'
  ]);

  grunt.registerTask('default', [
    'check',
    'test',
    'build'
  ]);
};
