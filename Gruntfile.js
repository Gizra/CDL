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

  // Register npm task.
  grunt.loadNpmTasks('grunt-convert');
  grunt.loadNpmTasks('grunt-gh-pages');

  grunt.initConfig({
    // Configurable paths.
    yeoman: {
      app: 'app',
      dist: 'dist',
      brain: 'brain'
    },
    watch: {
      compass: {
        files: ['<%= yeoman.app %>/_scss/**/*.{scss,sass}'],
        tasks: ['compass:server', 'autoprefixer:server']
      },
      autoprefixer: {
        files: ['<%= yeoman.app %>/css/**/*.css'],
        tasks: ['copy:stageCss', 'autoprefixer:server']
      },
      jekyll: {
        files: [
          '<%= yeoman.app %>/**/*.{html,yml,md,mkd,markdown}',
          '_config.yml',
          '!<%= yeoman.app %>/_bower_components'
        ],
        tasks: ['jekyll:server']
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
        port: 9000,
        livereload: 35729,
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
            '<%= yeoman.dist %>/data/*'
          ]
        }]
      },
      server: [
        '.tmp',
        '.tmp',
        '.jekyll',
        '<%= yeoman.app %>/data/*'

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
            'img/**/*',
            'fonts/**/*',
            // Like Jekyll, exclude files & folders prefixed with an underscore
            '!**/_*{,/**}',
            // Explicitly add any files your site needs for distribution here
            //'_bower_components/jquery/jquery.js',
            //'favicon.ico',
            //'apple-touch*.png'
            'data/**/*'
          ],
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
      }
    },
    'gh-pages': {
      options: {
        base: 'dist'
      },
      src: ['**']
    },
    'CDL': {
      src: '<%= yeoman.app %>/data/brain.json',
      dest: '<%= yeoman.app %>/data/tree.json'
    },
    'generate' : {
      src: '<%= yeoman.app %>/data/tree.json',
      dest: '<%= yeoman.app %>/pages/',
      template: 'page'
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
      firstNode,
      tree = {};

    src.path = grunt.config.get('CDL.src');
    dest.path = grunt.config.get('CDL.dest');
    grunt.config.set('CDL.period', 0);

    /**
     * Prepare collection of nodes indexed, that will use to parse and generate the tree.
     */

    function prepareData() {
      // Prepare raw data in thoughts, and "guid" of the root node.
      firstNode =  src.data.BrainData.Source.homeThoughtGuid;
      nodes = src.data.BrainData.Thoughts.Thought;
      nodesLinks = src.data.BrainData.Links.Link;
      nodesEntries = src.data.BrainData.Entries.Entry;

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

      // Index the nodes of thought by guid.
      nodesIndexed = _.indexBy(nodes, 'guid');
      // Index entries.
      _.each(nodesEntries, function(entry) {
        entry.objectID = entry.EntryObjects.EntryObject.objectID;
      });
      nodesEntries = _.indexBy(nodesEntries, 'objectID');

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
        return node.chronologicalId;
      });
    }

    /**
     * From an array of nodes node.type: 'chronological', Reorder these in order chronological. Where the children nodes are
     * the next event in order, this repeat for each node.
     *
     * @param nodes
     * @param period
     * @returns {*}
     */
    function reorderChronological(nodes) {
      var node;

      // Get the first node and an array without the node.
      node = getFirst(nodes);
      nodes = _.without(nodes, node);
      if (nodes.length > 0) {
        node.children = [reorderChronological(nodes)];
      }

      return node;
    }

    /**
     * Groups the chronological nodes in a period of time.
     *
     * @param nodes
     * @param period
     */
    function setPeriod(nodes, period) {
      _.each(nodes, function(node, index) {
        nodes[index].period = period;
      });
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
          regex: /class=".*?"+/,
          phrase: ''
        },
        {
          regex: /style=".*?"+/,
          phrase: ''
        },
        {
          regex: /"/,
          phrase: '&quot;'
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
      node.name = '\"' + rawName + '\"';

      // Add entry content to the node.
      node.content = '';
      if (nodesEntries[node.guid] && nodesEntries[node.guid].body) {
        // Extract the content from body.
        node.content = he.decode(nodesEntries[node.guid].body.match(regexContent)[2]);

        // Clean content.
        regexCleaner.forEach(function(element) {
          node.content = cleanContent(node.content, element.regex, element.phrase);
        });

        // Escape HTML with " for YAML.
        node.content = '\"' + node.content + '\"';
      }

      // Categorize child.
      if (node.name.match(regexChronological)) {
        // Chronological childs.
        node.type = 'chronological';
        node.chronologicalId = rawName.split(regexId)[1];
        node.chronologicalName = '\"' + rawName.split(regexChronological)[1].trim() + '\"';
      }
      else if (node.name.match(regexBastard)) {
        // Bastard childs.
        node.type = 'bastard';
        node.bastardName = '\"' + rawName.split(regexBastard)[1].trim() + '\"';
      }
      else {
        node.type = 'default';
      }
    }

    /**
     * Reorder the childs properties according dir: (Brain direction), type: chronological, bastard and default.
     * Return a collection of childs categorized and organized.
     *
     * @param childs
     * @returns {*}
     */
    function parseChilds(childs) {
      var childsOrdered = [],
        chronologicalChilds,
        period;

      // Parse child.
      _.each(childs, function(child) {

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

        // Look up for more generations of childrens.
        child.node.children = getChilds(child.node);

        childsOrdered.push(child.node);
      });

      // @todo: check formation of chronological nodes, with sibling not chronological. Issue #21
      chronologicalChilds = _.where(childsOrdered, {type: 'chronological'});
      // console.log(childsOrdered);
      if (chronologicalChilds.length) {
        period = grunt.config.get('CDL.period') + 1;
        grunt.config.set('CDL.period', period);
        setPeriod(chronologicalChilds, period);
        // Reorder chronological childs.
        childsOrdered = _.union(_.difference(childsOrdered, chronologicalChilds),  reorderChronological(chronologicalChilds, grunt.config.get('CDL.period')));
      }

      // Join childs classified.
      return childsOrdered;
    }


    /**
     * Get childs of the node.
     *
     * @param node
     * @returns {*}
     */
    function getChilds(node) {
      var childsOrdered = [],
          childs = [];

      childs = _.union( _.where(nodesLinks, {idA: node.guid, dir: '1'}), _.where(nodesLinks, {idB: node.guid, dir: '2'}) );

      if (childs.length) {
        childsOrdered = parseChilds(childs);
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

      // Look up the node and position into the array.
      tree = nodesIndexed[firstNode];
      tree.children = [];

      tree.children = getChilds(tree);

      return tree;
    }

    // Prepare JSON.
    if (grunt.file.exists(src.path)) {
      if (grunt.file.exists(dest.path)) {
        grunt.file.delete(dest.path);
      }
      grunt.log.ok('Clean destination.');
      src.data = grunt.file.readJSON('app/data/brain.json');
      grunt.log.ok('Loaded source file: ' + src.path);
    }
    else {
      grunt.fail.fatal('File ' + src.path + ' does not exist.');
    }

    // Generate data.
    dest.data = generateTreeData();

    // Save the JSON into a new file.
    grunt.file.write(dest.path, JSON.stringify(dest.data));
    grunt.log.ok(src.path + ' saved.');
  });

  grunt.registerTask('generate', function () {
    var tree;

    /**
     * Helper to return a string list of siblings of a specific chronological node.
     *
     * @param node
     * @returns {*}
     */
    function getSiblings(node) {
      var list = '';
      var siblings = [];

      /**
       * Filter siblings of the period of the node.
       *
       * @param nodes
       * @param period
       */
      function filterPeriodSiblings(nodes, period) {
        _.each(nodes, function(node) {
          // Check for children.
          filterPeriodSiblings(node.children, period);
        });

        siblings = _.union(siblings, _.where(nodes, {period: node.period}));
      }

      filterPeriodSiblings([tree], node.period);

      // Get chronological siblings.
      _.each(siblings.reverse(), function(node, index) {
        list = list + '\n  - ' + index+1 + ':\n    title: ' + node.chronologicalName + '\n    data: ' + node.content;
      });

      return list;
    }

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
      var file, template, data, yamlData;

      // Prepare template, filename and data will be write in the yaml page.
      template = getTemplate(grunt.config.get('generate.template'));
      file = node.guid + '.html';
      data = {
        guid: node.guid,
        title: (node.type === 'chronological') ? node.chronologicalName : (node.type === 'bastard') ? node.bastardName : node.name,
        data: node.content
      };

      if (node.type === 'chronological') {
        data.siblings = getSiblings(node);
      }

      // Replace dynamic values in the template.
      yamlData = grunt.template.process(template, {data: data});

      // Write the file.
      grunt.file.write(grunt.config.get('generate.dest') + file, yamlData);
      grunt.log.ok(file + ' saved.');
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
        generateStaticHtml(node);
      });
    }


    // Init generation.
    if (grunt.file.exists(grunt.config.get('generate.src'))) {
      // Clean destination folder.
      grunt.log.ok('Clean destination. ' + grunt.config.get('generate.dest') );
      grunt.file.delete(grunt.config.get('generate.dest'));

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

    grunt.task.run([
      'clean:server',
      'convert',
      'CDL',
      'generate',
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
    // Jekyll cleans files from the target directory, so must run first
    'jekyll:dist',
    'convert',
    'CDL',
    'concurrent:dist',
    'useminPrepare',
    'concat',
    'autoprefixer:dist',
    'cssmin',
    'uglify',
    'imagemin',
    'svgmin',
    'rev',
    'usemin',
    'htmlmin'
  ]);

  grunt.registerTask('default', [
    'check',
    'test',
    'build'
  ]);
};
