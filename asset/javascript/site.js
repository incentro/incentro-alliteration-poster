(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Rivets.js
// version: 0.8.1
// author: Michael Richards
// license: MIT
'use strict';

(function () {
  var Rivets,
      bindMethod,
      unbindMethod,
      _ref,
      __bind = function __bind(fn, me) {
    return function () {
      return fn.apply(me, arguments);
    };
  },
      __slice = [].slice,
      __hasProp = ({}).hasOwnProperty,
      __extends = function __extends(child, parent) {
    for (var key in parent) {
      if (__hasProp.call(parent, key)) child[key] = parent[key];
    }function ctor() {
      this.constructor = child;
    }ctor.prototype = parent.prototype;child.prototype = new ctor();child.__super__ = parent.prototype;return child;
  },
      __indexOf = [].indexOf || function (item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (i in this && this[i] === item) return i;
    }return -1;
  };

  Rivets = {
    options: ['prefix', 'templateDelimiters', 'rootInterface', 'preloadData', 'handler'],
    extensions: ['binders', 'formatters', 'components', 'adapters'],
    'public': {
      binders: {},
      components: {},
      formatters: {},
      adapters: {},
      prefix: 'rv',
      templateDelimiters: ['{', '}'],
      rootInterface: '.',
      preloadData: true,
      handler: function handler(context, ev, binding) {
        return this.call(context, ev, binding.view.models);
      },
      configure: function configure(options) {
        var descriptor, key, option, value;
        if (options == null) {
          options = {};
        }
        for (option in options) {
          value = options[option];
          if (option === 'binders' || option === 'components' || option === 'formatters' || option === 'adapters') {
            for (key in value) {
              descriptor = value[key];
              Rivets[option][key] = descriptor;
            }
          } else {
            Rivets['public'][option] = value;
          }
        }
      },
      bind: function bind(el, models, options) {
        var view;
        if (models == null) {
          models = {};
        }
        if (options == null) {
          options = {};
        }
        view = new Rivets.View(el, models, options);
        view.bind();
        return view;
      },
      init: function init(component, el, data) {
        var scope, view;
        if (data == null) {
          data = {};
        }
        if (el == null) {
          el = document.createElement('div');
        }
        component = Rivets['public'].components[component];
        el.innerHTML = component.template.call(this, el);
        scope = component.initialize.call(this, el, data);
        view = new Rivets.View(el, scope);
        view.bind();
        return view;
      }
    }
  };

  if (window.jQuery || window.$) {
    _ref = 'on' in jQuery.prototype ? ['on', 'off'] : ['bind', 'unbind'], bindMethod = _ref[0], unbindMethod = _ref[1];
    Rivets.Util = {
      bindEvent: function bindEvent(el, event, handler) {
        return jQuery(el)[bindMethod](event, handler);
      },
      unbindEvent: function unbindEvent(el, event, handler) {
        return jQuery(el)[unbindMethod](event, handler);
      },
      getInputValue: function getInputValue(el) {
        var $el;
        $el = jQuery(el);
        if ($el.attr('type') === 'checkbox') {
          return $el.is(':checked');
        } else {
          return $el.val();
        }
      }
    };
  } else {
    Rivets.Util = {
      bindEvent: (function () {
        if ('addEventListener' in window) {
          return function (el, event, handler) {
            return el.addEventListener(event, handler, false);
          };
        }
        return function (el, event, handler) {
          return el.attachEvent('on' + event, handler);
        };
      })(),
      unbindEvent: (function () {
        if ('removeEventListener' in window) {
          return function (el, event, handler) {
            return el.removeEventListener(event, handler, false);
          };
        }
        return function (el, event, handler) {
          return el.detachEvent('on' + event, handler);
        };
      })(),
      getInputValue: function getInputValue(el) {
        var o, _i, _len, _results;
        if (el.type === 'checkbox') {
          return el.checked;
        } else if (el.type === 'select-multiple') {
          _results = [];
          for (_i = 0, _len = el.length; _i < _len; _i++) {
            o = el[_i];
            if (o.selected) {
              _results.push(o.value);
            }
          }
          return _results;
        } else {
          return el.value;
        }
      }
    };
  }

  Rivets.TypeParser = (function () {
    function TypeParser() {}

    TypeParser.types = {
      primitive: 0,
      keypath: 1
    };

    TypeParser.parse = function (string) {
      if (/^'.*'$|^".*"$/.test(string)) {
        return {
          type: this.types.primitive,
          value: string.slice(1, -1)
        };
      } else if (string === 'true') {
        return {
          type: this.types.primitive,
          value: true
        };
      } else if (string === 'false') {
        return {
          type: this.types.primitive,
          value: false
        };
      } else if (string === 'null') {
        return {
          type: this.types.primitive,
          value: null
        };
      } else if (string === 'undefined') {
        return {
          type: this.types.primitive,
          value: void 0
        };
      } else if (isNaN(Number(string)) === false) {
        return {
          type: this.types.primitive,
          value: Number(string)
        };
      } else {
        return {
          type: this.types.keypath,
          value: string
        };
      }
    };

    return TypeParser;
  })();

  Rivets.TextTemplateParser = (function () {
    function TextTemplateParser() {}

    TextTemplateParser.types = {
      text: 0,
      binding: 1
    };

    TextTemplateParser.parse = function (template, delimiters) {
      var index, lastIndex, lastToken, length, substring, tokens, value;
      tokens = [];
      length = template.length;
      index = 0;
      lastIndex = 0;
      while (lastIndex < length) {
        index = template.indexOf(delimiters[0], lastIndex);
        if (index < 0) {
          tokens.push({
            type: this.types.text,
            value: template.slice(lastIndex)
          });
          break;
        } else {
          if (index > 0 && lastIndex < index) {
            tokens.push({
              type: this.types.text,
              value: template.slice(lastIndex, index)
            });
          }
          lastIndex = index + delimiters[0].length;
          index = template.indexOf(delimiters[1], lastIndex);
          if (index < 0) {
            substring = template.slice(lastIndex - delimiters[1].length);
            lastToken = tokens[tokens.length - 1];
            if ((lastToken != null ? lastToken.type : void 0) === this.types.text) {
              lastToken.value += substring;
            } else {
              tokens.push({
                type: this.types.text,
                value: substring
              });
            }
            break;
          }
          value = template.slice(lastIndex, index).trim();
          tokens.push({
            type: this.types.binding,
            value: value
          });
          lastIndex = index + delimiters[1].length;
        }
      }
      return tokens;
    };

    return TextTemplateParser;
  })();

  Rivets.View = (function () {
    function View(els, models, options) {
      var k, option, v, _base, _i, _j, _len, _len1, _ref1, _ref2, _ref3, _ref4, _ref5;
      this.els = els;
      this.models = models;
      if (options == null) {
        options = {};
      }
      this.update = __bind(this.update, this);
      this.publish = __bind(this.publish, this);
      this.sync = __bind(this.sync, this);
      this.unbind = __bind(this.unbind, this);
      this.bind = __bind(this.bind, this);
      this.select = __bind(this.select, this);
      this.traverse = __bind(this.traverse, this);
      this.build = __bind(this.build, this);
      this.buildBinding = __bind(this.buildBinding, this);
      this.bindingRegExp = __bind(this.bindingRegExp, this);
      this.options = __bind(this.options, this);
      if (!(this.els.jquery || this.els instanceof Array)) {
        this.els = [this.els];
      }
      _ref1 = Rivets.extensions;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        option = _ref1[_i];
        this[option] = {};
        if (options[option]) {
          _ref2 = options[option];
          for (k in _ref2) {
            v = _ref2[k];
            this[option][k] = v;
          }
        }
        _ref3 = Rivets['public'][option];
        for (k in _ref3) {
          v = _ref3[k];
          if ((_base = this[option])[k] == null) {
            _base[k] = v;
          }
        }
      }
      _ref4 = Rivets.options;
      for (_j = 0, _len1 = _ref4.length; _j < _len1; _j++) {
        option = _ref4[_j];
        this[option] = (_ref5 = options[option]) != null ? _ref5 : Rivets['public'][option];
      }
      this.build();
    }

    View.prototype.options = function () {
      var option, options, _i, _len, _ref1;
      options = {};
      _ref1 = Rivets.extensions.concat(Rivets.options);
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        option = _ref1[_i];
        options[option] = this[option];
      }
      return options;
    };

    View.prototype.bindingRegExp = function () {
      return new RegExp('^' + this.prefix + '-');
    };

    View.prototype.buildBinding = function (binding, node, type, declaration) {
      var context, ctx, dependencies, keypath, options, pipe, pipes;
      options = {};
      pipes = (function () {
        var _i, _len, _ref1, _results;
        _ref1 = declaration.split('|');
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          pipe = _ref1[_i];
          _results.push(pipe.trim());
        }
        return _results;
      })();
      context = (function () {
        var _i, _len, _ref1, _results;
        _ref1 = pipes.shift().split('<');
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          ctx = _ref1[_i];
          _results.push(ctx.trim());
        }
        return _results;
      })();
      keypath = context.shift();
      options.formatters = pipes;
      if (dependencies = context.shift()) {
        options.dependencies = dependencies.split(/\s+/);
      }
      return this.bindings.push(new Rivets[binding](this, node, type, keypath, options));
    };

    View.prototype.build = function () {
      var el, parse, _i, _len, _ref1;
      this.bindings = [];
      parse = (function (_this) {
        return function (node) {
          var block, childNode, delimiters, n, parser, text, token, tokens, _i, _j, _len, _len1, _ref1, _results;
          if (node.nodeType === 3) {
            parser = Rivets.TextTemplateParser;
            if (delimiters = _this.templateDelimiters) {
              if ((tokens = parser.parse(node.data, delimiters)).length) {
                if (!(tokens.length === 1 && tokens[0].type === parser.types.text)) {
                  for (_i = 0, _len = tokens.length; _i < _len; _i++) {
                    token = tokens[_i];
                    text = document.createTextNode(token.value);
                    node.parentNode.insertBefore(text, node);
                    if (token.type === 1) {
                      _this.buildBinding('TextBinding', text, null, token.value);
                    }
                  }
                  node.parentNode.removeChild(node);
                }
              }
            }
          } else if (node.nodeType === 1) {
            block = _this.traverse(node);
          }
          if (!block) {
            _ref1 = (function () {
              var _k, _len1, _ref1, _results1;
              _ref1 = node.childNodes;
              _results1 = [];
              for (_k = 0, _len1 = _ref1.length; _k < _len1; _k++) {
                n = _ref1[_k];
                _results1.push(n);
              }
              return _results1;
            })();
            _results = [];
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
              childNode = _ref1[_j];
              _results.push(parse(childNode));
            }
            return _results;
          }
        };
      })(this);
      _ref1 = this.els;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        el = _ref1[_i];
        parse(el);
      }
      this.bindings.sort(function (a, b) {
        var _ref2, _ref3;
        return (((_ref2 = b.binder) != null ? _ref2.priority : void 0) || 0) - (((_ref3 = a.binder) != null ? _ref3.priority : void 0) || 0);
      });
    };

    View.prototype.traverse = function (node) {
      var attribute, attributes, binder, bindingRegExp, block, identifier, regexp, type, value, _i, _j, _len, _len1, _ref1, _ref2, _ref3;
      bindingRegExp = this.bindingRegExp();
      block = node.nodeName === 'SCRIPT' || node.nodeName === 'STYLE';
      _ref1 = node.attributes;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        attribute = _ref1[_i];
        if (bindingRegExp.test(attribute.name)) {
          type = attribute.name.replace(bindingRegExp, '');
          if (!(binder = this.binders[type])) {
            _ref2 = this.binders;
            for (identifier in _ref2) {
              value = _ref2[identifier];
              if (identifier !== '*' && identifier.indexOf('*') !== -1) {
                regexp = new RegExp('^' + identifier.replace(/\*/g, '.+') + '$');
                if (regexp.test(type)) {
                  binder = value;
                }
              }
            }
          }
          binder || (binder = this.binders['*']);
          if (binder.block) {
            block = true;
            attributes = [attribute];
          }
        }
      }
      _ref3 = attributes || node.attributes;
      for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
        attribute = _ref3[_j];
        if (bindingRegExp.test(attribute.name)) {
          type = attribute.name.replace(bindingRegExp, '');
          this.buildBinding('Binding', node, type, attribute.value);
        }
      }
      if (!block) {
        type = node.nodeName.toLowerCase();
        if (this.components[type] && !node._bound) {
          this.bindings.push(new Rivets.ComponentBinding(this, node, type));
          block = true;
        }
      }
      return block;
    };

    View.prototype.select = function (fn) {
      var binding, _i, _len, _ref1, _results;
      _ref1 = this.bindings;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        binding = _ref1[_i];
        if (fn(binding)) {
          _results.push(binding);
        }
      }
      return _results;
    };

    View.prototype.bind = function () {
      var binding, _i, _len, _ref1, _results;
      _ref1 = this.bindings;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        binding = _ref1[_i];
        _results.push(binding.bind());
      }
      return _results;
    };

    View.prototype.unbind = function () {
      var binding, _i, _len, _ref1, _results;
      _ref1 = this.bindings;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        binding = _ref1[_i];
        _results.push(binding.unbind());
      }
      return _results;
    };

    View.prototype.sync = function () {
      var binding, _i, _len, _ref1, _results;
      _ref1 = this.bindings;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        binding = _ref1[_i];
        _results.push(typeof binding.sync === 'function' ? binding.sync() : void 0);
      }
      return _results;
    };

    View.prototype.publish = function () {
      var binding, _i, _len, _ref1, _results;
      _ref1 = this.select(function (b) {
        var _ref1;
        return (_ref1 = b.binder) != null ? _ref1.publishes : void 0;
      });
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        binding = _ref1[_i];
        _results.push(binding.publish());
      }
      return _results;
    };

    View.prototype.update = function (models) {
      var binding, key, model, _i, _len, _ref1, _results;
      if (models == null) {
        models = {};
      }
      for (key in models) {
        model = models[key];
        this.models[key] = model;
      }
      _ref1 = this.bindings;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        binding = _ref1[_i];
        _results.push(typeof binding.update === 'function' ? binding.update(models) : void 0);
      }
      return _results;
    };

    return View;
  })();

  Rivets.Binding = (function () {
    function Binding(view, el, type, keypath, options) {
      this.view = view;
      this.el = el;
      this.type = type;
      this.keypath = keypath;
      this.options = options != null ? options : {};
      this.getValue = __bind(this.getValue, this);
      this.update = __bind(this.update, this);
      this.unbind = __bind(this.unbind, this);
      this.bind = __bind(this.bind, this);
      this.publish = __bind(this.publish, this);
      this.sync = __bind(this.sync, this);
      this.set = __bind(this.set, this);
      this.eventHandler = __bind(this.eventHandler, this);
      this.formattedValue = __bind(this.formattedValue, this);
      this.parseTarget = __bind(this.parseTarget, this);
      this.observe = __bind(this.observe, this);
      this.setBinder = __bind(this.setBinder, this);
      this.formatters = this.options.formatters || [];
      this.dependencies = [];
      this.formatterObservers = {};
      this.model = void 0;
      this.setBinder();
    }

    Binding.prototype.setBinder = function () {
      var identifier, regexp, value, _ref1;
      if (!(this.binder = this.view.binders[this.type])) {
        _ref1 = this.view.binders;
        for (identifier in _ref1) {
          value = _ref1[identifier];
          if (identifier !== '*' && identifier.indexOf('*') !== -1) {
            regexp = new RegExp('^' + identifier.replace(/\*/g, '.+') + '$');
            if (regexp.test(this.type)) {
              this.binder = value;
              this.args = new RegExp('^' + identifier.replace(/\*/g, '(.+)') + '$').exec(this.type);
              this.args.shift();
            }
          }
        }
      }
      this.binder || (this.binder = this.view.binders['*']);
      if (this.binder instanceof Function) {
        return this.binder = {
          routine: this.binder
        };
      }
    };

    Binding.prototype.observe = function (obj, keypath, callback) {
      return Rivets.sightglass(obj, keypath, callback, {
        root: this.view.rootInterface,
        adapters: this.view.adapters
      });
    };

    Binding.prototype.parseTarget = function () {
      var token;
      token = Rivets.TypeParser.parse(this.keypath);
      if (token.type === 0) {
        return this.value = token.value;
      } else {
        this.observer = this.observe(this.view.models, this.keypath, this.sync);
        return this.model = this.observer.target;
      }
    };

    Binding.prototype.formattedValue = function (value) {
      var ai, arg, args, fi, formatter, id, observer, processedArgs, _base, _i, _j, _len, _len1, _ref1;
      _ref1 = this.formatters;
      for (fi = _i = 0, _len = _ref1.length; _i < _len; fi = ++_i) {
        formatter = _ref1[fi];
        args = formatter.match(/[^\s']+|'([^']|'[^\s])*'|"([^"]|"[^\s])*"/g);
        id = args.shift();
        formatter = this.view.formatters[id];
        args = (function () {
          var _j, _len1, _results;
          _results = [];
          for (_j = 0, _len1 = args.length; _j < _len1; _j++) {
            arg = args[_j];
            _results.push(Rivets.TypeParser.parse(arg));
          }
          return _results;
        })();
        processedArgs = [];
        for (ai = _j = 0, _len1 = args.length; _j < _len1; ai = ++_j) {
          arg = args[ai];
          processedArgs.push(arg.type === 0 ? arg.value : ((_base = this.formatterObservers)[fi] || (_base[fi] = {}), !(observer = this.formatterObservers[fi][ai]) ? (observer = this.observe(this.view.models, arg.value, this.sync), this.formatterObservers[fi][ai] = observer) : void 0, observer.value()));
        }
        if ((formatter != null ? formatter.read : void 0) instanceof Function) {
          value = formatter.read.apply(formatter, [value].concat(__slice.call(processedArgs)));
        } else if (formatter instanceof Function) {
          value = formatter.apply(null, [value].concat(__slice.call(processedArgs)));
        }
      }
      return value;
    };

    Binding.prototype.eventHandler = function (fn) {
      var binding, handler;
      handler = (binding = this).view.handler;
      return function (ev) {
        return handler.call(fn, this, ev, binding);
      };
    };

    Binding.prototype.set = function (value) {
      var _ref1;
      value = value instanceof Function && !this.binder['function'] ? this.formattedValue(value.call(this.model)) : this.formattedValue(value);
      return (_ref1 = this.binder.routine) != null ? _ref1.call(this, this.el, value) : void 0;
    };

    Binding.prototype.sync = function () {
      var dependency, observer;
      return this.set((function () {
        var _i, _j, _len, _len1, _ref1, _ref2, _ref3;
        if (this.observer) {
          if (this.model !== this.observer.target) {
            _ref1 = this.dependencies;
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
              observer = _ref1[_i];
              observer.unobserve();
            }
            this.dependencies = [];
            if ((this.model = this.observer.target) != null && ((_ref2 = this.options.dependencies) != null ? _ref2.length : void 0)) {
              _ref3 = this.options.dependencies;
              for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
                dependency = _ref3[_j];
                observer = this.observe(this.model, dependency, this.sync);
                this.dependencies.push(observer);
              }
            }
          }
          return this.observer.value();
        } else {
          return this.value;
        }
      }).call(this));
    };

    Binding.prototype.publish = function () {
      var args, formatter, id, value, _i, _len, _ref1, _ref2, _ref3;
      if (this.observer) {
        value = this.getValue(this.el);
        _ref1 = this.formatters.slice(0).reverse();
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          formatter = _ref1[_i];
          args = formatter.split(/\s+/);
          id = args.shift();
          if ((_ref2 = this.view.formatters[id]) != null ? _ref2.publish : void 0) {
            value = (_ref3 = this.view.formatters[id]).publish.apply(_ref3, [value].concat(__slice.call(args)));
          }
        }
        return this.observer.setValue(value);
      }
    };

    Binding.prototype.bind = function () {
      var dependency, observer, _i, _len, _ref1, _ref2, _ref3;
      this.parseTarget();
      if ((_ref1 = this.binder.bind) != null) {
        _ref1.call(this, this.el);
      }
      if (this.model != null && ((_ref2 = this.options.dependencies) != null ? _ref2.length : void 0)) {
        _ref3 = this.options.dependencies;
        for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
          dependency = _ref3[_i];
          observer = this.observe(this.model, dependency, this.sync);
          this.dependencies.push(observer);
        }
      }
      if (this.view.preloadData) {
        return this.sync();
      }
    };

    Binding.prototype.unbind = function () {
      var ai, args, fi, observer, _i, _len, _ref1, _ref2, _ref3, _ref4;
      if ((_ref1 = this.binder.unbind) != null) {
        _ref1.call(this, this.el);
      }
      if ((_ref2 = this.observer) != null) {
        _ref2.unobserve();
      }
      _ref3 = this.dependencies;
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        observer = _ref3[_i];
        observer.unobserve();
      }
      this.dependencies = [];
      _ref4 = this.formatterObservers;
      for (fi in _ref4) {
        args = _ref4[fi];
        for (ai in args) {
          observer = args[ai];
          observer.unobserve();
        }
      }
      return this.formatterObservers = {};
    };

    Binding.prototype.update = function (models) {
      var _ref1, _ref2;
      if (models == null) {
        models = {};
      }
      this.model = (_ref1 = this.observer) != null ? _ref1.target : void 0;
      return (_ref2 = this.binder.update) != null ? _ref2.call(this, models) : void 0;
    };

    Binding.prototype.getValue = function (el) {
      if (this.binder && this.binder.getValue != null) {
        return this.binder.getValue.call(this, el);
      } else {
        return Rivets.Util.getInputValue(el);
      }
    };

    return Binding;
  })();

  Rivets.ComponentBinding = (function (_super) {
    __extends(ComponentBinding, _super);

    function ComponentBinding(view, el, type) {
      var attribute, bindingRegExp, propertyName, _i, _len, _ref1, _ref2;
      this.view = view;
      this.el = el;
      this.type = type;
      this.unbind = __bind(this.unbind, this);
      this.bind = __bind(this.bind, this);
      this.locals = __bind(this.locals, this);
      this.component = this.view.components[this.type];
      this['static'] = {};
      this.observers = {};
      this.upstreamObservers = {};
      bindingRegExp = view.bindingRegExp();
      _ref1 = this.el.attributes || [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        attribute = _ref1[_i];
        if (!bindingRegExp.test(attribute.name)) {
          propertyName = this.camelCase(attribute.name);
          if (__indexOf.call((_ref2 = this.component['static']) != null ? _ref2 : [], propertyName) >= 0) {
            this['static'][propertyName] = attribute.value;
          } else {
            this.observers[propertyName] = attribute.value;
          }
        }
      }
    }

    ComponentBinding.prototype.sync = function () {};

    ComponentBinding.prototype.update = function () {};

    ComponentBinding.prototype.publish = function () {};

    ComponentBinding.prototype.locals = function () {
      var key, observer, result, value, _ref1, _ref2;
      result = {};
      _ref1 = this['static'];
      for (key in _ref1) {
        value = _ref1[key];
        result[key] = value;
      }
      _ref2 = this.observers;
      for (key in _ref2) {
        observer = _ref2[key];
        result[key] = observer.value();
      }
      return result;
    };

    ComponentBinding.prototype.camelCase = function (string) {
      return string.replace(/-([a-z])/g, function (grouped) {
        return grouped[1].toUpperCase();
      });
    };

    ComponentBinding.prototype.bind = function () {
      var k, key, keypath, observer, option, options, scope, v, _base, _i, _j, _len, _len1, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _results;
      if (!this.bound) {
        _ref1 = this.observers;
        for (key in _ref1) {
          keypath = _ref1[key];
          this.observers[key] = this.observe(this.view.models, keypath, (function (_this) {
            return function (key) {
              return function () {
                return _this.componentView.models[key] = _this.observers[key].value();
              };
            };
          })(this).call(this, key));
        }
        this.bound = true;
      }
      if (this.componentView != null) {
        return this.componentView.bind();
      } else {
        this.el.innerHTML = this.component.template.call(this);
        scope = this.component.initialize.call(this, this.el, this.locals());
        this.el._bound = true;
        options = {};
        _ref2 = Rivets.extensions;
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          option = _ref2[_i];
          options[option] = {};
          if (this.component[option]) {
            _ref3 = this.component[option];
            for (k in _ref3) {
              v = _ref3[k];
              options[option][k] = v;
            }
          }
          _ref4 = this.view[option];
          for (k in _ref4) {
            v = _ref4[k];
            if ((_base = options[option])[k] == null) {
              _base[k] = v;
            }
          }
        }
        _ref5 = Rivets.options;
        for (_j = 0, _len1 = _ref5.length; _j < _len1; _j++) {
          option = _ref5[_j];
          options[option] = (_ref6 = this.component[option]) != null ? _ref6 : this.view[option];
        }
        this.componentView = new Rivets.View(this.el, scope, options);
        this.componentView.bind();
        _ref7 = this.observers;
        _results = [];
        for (key in _ref7) {
          observer = _ref7[key];
          _results.push(this.upstreamObservers[key] = this.observe(this.componentView.models, key, (function (_this) {
            return function (key, observer) {
              return function () {
                return observer.setValue(_this.componentView.models[key]);
              };
            };
          })(this).call(this, key, observer)));
        }
        return _results;
      }
    };

    ComponentBinding.prototype.unbind = function () {
      var key, observer, _ref1, _ref2, _ref3;
      _ref1 = this.upstreamObservers;
      for (key in _ref1) {
        observer = _ref1[key];
        observer.unobserve();
      }
      _ref2 = this.observers;
      for (key in _ref2) {
        observer = _ref2[key];
        observer.unobserve();
      }
      return (_ref3 = this.componentView) != null ? _ref3.unbind.call(this) : void 0;
    };

    return ComponentBinding;
  })(Rivets.Binding);

  Rivets.TextBinding = (function (_super) {
    __extends(TextBinding, _super);

    function TextBinding(view, el, type, keypath, options) {
      this.view = view;
      this.el = el;
      this.type = type;
      this.keypath = keypath;
      this.options = options != null ? options : {};
      this.sync = __bind(this.sync, this);
      this.formatters = this.options.formatters || [];
      this.dependencies = [];
      this.formatterObservers = {};
    }

    TextBinding.prototype.binder = {
      routine: function routine(node, value) {
        return node.data = value != null ? value : '';
      }
    };

    TextBinding.prototype.sync = function () {
      return TextBinding.__super__.sync.apply(this, arguments);
    };

    return TextBinding;
  })(Rivets.Binding);

  Rivets['public'].binders.text = function (el, value) {
    if (el.textContent != null) {
      return el.textContent = value != null ? value : '';
    } else {
      return el.innerText = value != null ? value : '';
    }
  };

  Rivets['public'].binders.html = function (el, value) {
    return el.innerHTML = value != null ? value : '';
  };

  Rivets['public'].binders.show = function (el, value) {
    return el.style.display = value ? '' : 'none';
  };

  Rivets['public'].binders.hide = function (el, value) {
    return el.style.display = value ? 'none' : '';
  };

  Rivets['public'].binders.enabled = function (el, value) {
    return el.disabled = !value;
  };

  Rivets['public'].binders.disabled = function (el, value) {
    return el.disabled = !!value;
  };

  Rivets['public'].binders.checked = {
    publishes: true,
    priority: 2000,
    bind: function bind(el) {
      return Rivets.Util.bindEvent(el, 'change', this.publish);
    },
    unbind: function unbind(el) {
      return Rivets.Util.unbindEvent(el, 'change', this.publish);
    },
    routine: function routine(el, value) {
      var _ref1;
      if (el.type === 'radio') {
        return el.checked = ((_ref1 = el.value) != null ? _ref1.toString() : void 0) === (value != null ? value.toString() : void 0);
      } else {
        return el.checked = !!value;
      }
    }
  };

  Rivets['public'].binders.unchecked = {
    publishes: true,
    priority: 2000,
    bind: function bind(el) {
      return Rivets.Util.bindEvent(el, 'change', this.publish);
    },
    unbind: function unbind(el) {
      return Rivets.Util.unbindEvent(el, 'change', this.publish);
    },
    routine: function routine(el, value) {
      var _ref1;
      if (el.type === 'radio') {
        return el.checked = ((_ref1 = el.value) != null ? _ref1.toString() : void 0) !== (value != null ? value.toString() : void 0);
      } else {
        return el.checked = !value;
      }
    }
  };

  Rivets['public'].binders.value = {
    publishes: true,
    priority: 3000,
    bind: function bind(el) {
      if (!(el.tagName === 'INPUT' && el.type === 'radio')) {
        this.event = el.tagName === 'SELECT' ? 'change' : 'input';
        return Rivets.Util.bindEvent(el, this.event, this.publish);
      }
    },
    unbind: function unbind(el) {
      if (!(el.tagName === 'INPUT' && el.type === 'radio')) {
        return Rivets.Util.unbindEvent(el, this.event, this.publish);
      }
    },
    routine: function routine(el, value) {
      var o, _i, _len, _ref1, _ref2, _ref3, _results;
      if (el.tagName === 'INPUT' && el.type === 'radio') {
        return el.setAttribute('value', value);
      } else if (window.jQuery != null) {
        el = jQuery(el);
        if ((value != null ? value.toString() : void 0) !== ((_ref1 = el.val()) != null ? _ref1.toString() : void 0)) {
          return el.val(value != null ? value : '');
        }
      } else {
        if (el.type === 'select-multiple') {
          if (value != null) {
            _results = [];
            for (_i = 0, _len = el.length; _i < _len; _i++) {
              o = el[_i];
              _results.push(o.selected = (_ref2 = o.value, __indexOf.call(value, _ref2) >= 0));
            }
            return _results;
          }
        } else if ((value != null ? value.toString() : void 0) !== ((_ref3 = el.value) != null ? _ref3.toString() : void 0)) {
          return el.value = value != null ? value : '';
        }
      }
    }
  };

  Rivets['public'].binders['if'] = {
    block: true,
    priority: 4000,
    bind: function bind(el) {
      var attr, declaration;
      if (this.marker == null) {
        attr = [this.view.prefix, this.type].join('-').replace('--', '-');
        declaration = el.getAttribute(attr);
        this.marker = document.createComment(' rivets: ' + this.type + ' ' + declaration + ' ');
        this.bound = false;
        el.removeAttribute(attr);
        el.parentNode.insertBefore(this.marker, el);
        return el.parentNode.removeChild(el);
      }
    },
    unbind: function unbind() {
      var _ref1;
      return (_ref1 = this.nested) != null ? _ref1.unbind() : void 0;
    },
    routine: function routine(el, value) {
      var key, model, models, _ref1;
      if (!!value === !this.bound) {
        if (value) {
          models = {};
          _ref1 = this.view.models;
          for (key in _ref1) {
            model = _ref1[key];
            models[key] = model;
          }
          (this.nested || (this.nested = new Rivets.View(el, models, this.view.options()))).bind();
          this.marker.parentNode.insertBefore(el, this.marker.nextSibling);
          return this.bound = true;
        } else {
          el.parentNode.removeChild(el);
          this.nested.unbind();
          return this.bound = false;
        }
      }
    },
    update: function update(models) {
      var _ref1;
      return (_ref1 = this.nested) != null ? _ref1.update(models) : void 0;
    }
  };

  Rivets['public'].binders.unless = {
    block: true,
    priority: 4000,
    bind: function bind(el) {
      return Rivets['public'].binders['if'].bind.call(this, el);
    },
    unbind: function unbind() {
      return Rivets['public'].binders['if'].unbind.call(this);
    },
    routine: function routine(el, value) {
      return Rivets['public'].binders['if'].routine.call(this, el, !value);
    },
    update: function update(models) {
      return Rivets['public'].binders['if'].update.call(this, models);
    }
  };

  Rivets['public'].binders['on-*'] = {
    'function': true,
    priority: 1000,
    unbind: function unbind(el) {
      if (this.handler) {
        return Rivets.Util.unbindEvent(el, this.args[0], this.handler);
      }
    },
    routine: function routine(el, value) {
      if (this.handler) {
        Rivets.Util.unbindEvent(el, this.args[0], this.handler);
      }
      return Rivets.Util.bindEvent(el, this.args[0], this.handler = this.eventHandler(value));
    }
  };

  Rivets['public'].binders['each-*'] = {
    block: true,
    priority: 4000,
    bind: function bind(el) {
      var attr, view, _i, _len, _ref1;
      if (this.marker == null) {
        attr = [this.view.prefix, this.type].join('-').replace('--', '-');
        this.marker = document.createComment(' rivets: ' + this.type + ' ');
        this.iterated = [];
        el.removeAttribute(attr);
        el.parentNode.insertBefore(this.marker, el);
        el.parentNode.removeChild(el);
      } else {
        _ref1 = this.iterated;
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          view = _ref1[_i];
          view.bind();
        }
      }
    },
    unbind: function unbind(el) {
      var view, _i, _len, _ref1, _results;
      if (this.iterated != null) {
        _ref1 = this.iterated;
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          view = _ref1[_i];
          _results.push(view.unbind());
        }
        return _results;
      }
    },
    routine: function routine(el, collection) {
      var binding, data, i, index, key, model, modelName, options, previous, template, view, _i, _j, _k, _len, _len1, _len2, _ref1, _ref2, _ref3, _results;
      modelName = this.args[0];
      collection = collection || [];
      if (this.iterated.length > collection.length) {
        _ref1 = Array(this.iterated.length - collection.length);
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          i = _ref1[_i];
          view = this.iterated.pop();
          view.unbind();
          this.marker.parentNode.removeChild(view.els[0]);
        }
      }
      for (index = _j = 0, _len1 = collection.length; _j < _len1; index = ++_j) {
        model = collection[index];
        data = {
          index: index
        };
        data[modelName] = model;
        if (this.iterated[index] == null) {
          _ref2 = this.view.models;
          for (key in _ref2) {
            model = _ref2[key];
            if (data[key] == null) {
              data[key] = model;
            }
          }
          previous = this.iterated.length ? this.iterated[this.iterated.length - 1].els[0] : this.marker;
          options = this.view.options();
          options.preloadData = true;
          template = el.cloneNode(true);
          view = new Rivets.View(template, data, options);
          view.bind();
          this.iterated.push(view);
          this.marker.parentNode.insertBefore(template, previous.nextSibling);
        } else if (this.iterated[index].models[modelName] !== model) {
          this.iterated[index].update(data);
        }
      }
      if (el.nodeName === 'OPTION') {
        _ref3 = this.view.bindings;
        _results = [];
        for (_k = 0, _len2 = _ref3.length; _k < _len2; _k++) {
          binding = _ref3[_k];
          if (binding.el === this.marker.parentNode && binding.type === 'value') {
            _results.push(binding.sync());
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      }
    },
    update: function update(models) {
      var data, key, model, view, _i, _len, _ref1, _results;
      data = {};
      for (key in models) {
        model = models[key];
        if (key !== this.args[0]) {
          data[key] = model;
        }
      }
      _ref1 = this.iterated;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        view = _ref1[_i];
        _results.push(view.update(data));
      }
      return _results;
    }
  };

  Rivets['public'].binders['class-*'] = function (el, value) {
    var elClass;
    elClass = ' ' + el.className + ' ';
    if (!value === (elClass.indexOf(' ' + this.args[0] + ' ') !== -1)) {
      return el.className = value ? '' + el.className + ' ' + this.args[0] : elClass.replace(' ' + this.args[0] + ' ', ' ').trim();
    }
  };

  Rivets['public'].binders['*'] = function (el, value) {
    if (value != null) {
      return el.setAttribute(this.type, value);
    } else {
      return el.removeAttribute(this.type);
    }
  };

  Rivets['public'].adapters['.'] = {
    id: '_rv',
    counter: 0,
    weakmap: {},
    weakReference: function weakReference(obj) {
      var id, _base, _name;
      if (!obj.hasOwnProperty(this.id)) {
        id = this.counter++;
        Object.defineProperty(obj, this.id, {
          value: id
        });
      }
      return (_base = this.weakmap)[_name = obj[this.id]] || (_base[_name] = {
        callbacks: {}
      });
    },
    cleanupWeakReference: function cleanupWeakReference(ref, id) {
      if (!Object.keys(ref.callbacks).length) {
        if (!(ref.pointers && Object.keys(ref.pointers).length)) {
          return delete this.weakmap[id];
        }
      }
    },
    stubFunction: function stubFunction(obj, fn) {
      var map, original, weakmap;
      original = obj[fn];
      map = this.weakReference(obj);
      weakmap = this.weakmap;
      return obj[fn] = function () {
        var callback, k, r, response, _i, _len, _ref1, _ref2, _ref3, _ref4;
        response = original.apply(obj, arguments);
        _ref1 = map.pointers;
        for (r in _ref1) {
          k = _ref1[r];
          _ref4 = (_ref2 = (_ref3 = weakmap[r]) != null ? _ref3.callbacks[k] : void 0) != null ? _ref2 : [];
          for (_i = 0, _len = _ref4.length; _i < _len; _i++) {
            callback = _ref4[_i];
            callback();
          }
        }
        return response;
      };
    },
    observeMutations: function observeMutations(obj, ref, keypath) {
      var fn, functions, map, _base, _i, _len;
      if (Array.isArray(obj)) {
        map = this.weakReference(obj);
        if (map.pointers == null) {
          map.pointers = {};
          functions = ['push', 'pop', 'shift', 'unshift', 'sort', 'reverse', 'splice'];
          for (_i = 0, _len = functions.length; _i < _len; _i++) {
            fn = functions[_i];
            this.stubFunction(obj, fn);
          }
        }
        if ((_base = map.pointers)[ref] == null) {
          _base[ref] = [];
        }
        if (__indexOf.call(map.pointers[ref], keypath) < 0) {
          return map.pointers[ref].push(keypath);
        }
      }
    },
    unobserveMutations: function unobserveMutations(obj, ref, keypath) {
      var idx, map, pointers;
      if (Array.isArray(obj) && obj[this.id] != null) {
        if (map = this.weakmap[obj[this.id]]) {
          if (pointers = map.pointers[ref]) {
            if ((idx = pointers.indexOf(keypath)) >= 0) {
              pointers.splice(idx, 1);
            }
            if (!pointers.length) {
              delete map.pointers[ref];
            }
            return this.cleanupWeakReference(map, obj[this.id]);
          }
        }
      }
    },
    observe: function observe(obj, keypath, callback) {
      var callbacks, desc, value;
      callbacks = this.weakReference(obj).callbacks;
      if (callbacks[keypath] == null) {
        callbacks[keypath] = [];
        desc = Object.getOwnPropertyDescriptor(obj, keypath);
        if (!((desc != null ? desc.get : void 0) || (desc != null ? desc.set : void 0))) {
          value = obj[keypath];
          Object.defineProperty(obj, keypath, {
            enumerable: true,
            get: function get() {
              return value;
            },
            set: (function (_this) {
              return function (newValue) {
                var map, _i, _len, _ref1;
                if (newValue !== value) {
                  _this.unobserveMutations(value, obj[_this.id], keypath);
                  value = newValue;
                  if (map = _this.weakmap[obj[_this.id]]) {
                    callbacks = map.callbacks;
                    if (callbacks[keypath]) {
                      _ref1 = callbacks[keypath].slice();
                      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                        callback = _ref1[_i];
                        if (__indexOf.call(callbacks[keypath], callback) >= 0) {
                          callback();
                        }
                      }
                    }
                    return _this.observeMutations(newValue, obj[_this.id], keypath);
                  }
                }
              };
            })(this)
          });
        }
      }
      if (__indexOf.call(callbacks[keypath], callback) < 0) {
        callbacks[keypath].push(callback);
      }
      return this.observeMutations(obj[keypath], obj[this.id], keypath);
    },
    unobserve: function unobserve(obj, keypath, callback) {
      var callbacks, idx, map;
      if (map = this.weakmap[obj[this.id]]) {
        if (callbacks = map.callbacks[keypath]) {
          if ((idx = callbacks.indexOf(callback)) >= 0) {
            callbacks.splice(idx, 1);
            if (!callbacks.length) {
              delete map.callbacks[keypath];
            }
          }
          this.unobserveMutations(obj[keypath], obj[this.id], keypath);
          return this.cleanupWeakReference(map, obj[this.id]);
        }
      }
    },
    get: function get(obj, keypath) {
      return obj[keypath];
    },
    set: function set(obj, keypath, value) {
      return obj[keypath] = value;
    }
  };

  Rivets.factory = function (sightglass) {
    Rivets.sightglass = sightglass;
    Rivets['public']._ = Rivets;
    return Rivets['public'];
  };

  if (typeof (typeof module !== 'undefined' && module !== null ? module.exports : void 0) === 'object') {
    module.exports = Rivets.factory(require('./../../sightglass/index.js'));
  } else if (typeof define === 'function' && define.amd) {
    define(['sightglass'], function (sightglass) {
      return this.rivets = Rivets.factory(sightglass);
    });
  } else {
    this.rivets = Rivets.factory(sightglass);
  }
}).call(undefined);

},{"./../../sightglass/index.js":2}],2:[function(require,module,exports){
'use strict';

(function () {
  // Public sightglass interface.
  function sightglass(obj, keypath, callback, options) {
    return new Observer(obj, keypath, callback, options);
  }

  // Batteries not included.
  sightglass.adapters = {};

  // Constructs a new keypath observer and kicks things off.
  function Observer(obj, keypath, callback, options) {
    this.options = options || {};
    this.options.adapters = this.options.adapters || {};
    this.obj = obj;
    this.keypath = keypath;
    this.callback = callback;
    this.objectPath = [];
    this.parse();

    if (isObject(this.target = this.realize())) {
      this.set(true, this.key, this.target, this.callback);
    }
  }

  // Tokenizes the provided keypath string into interface + path tokens for the
  // observer to work with.
  Observer.tokenize = function (keypath, interfaces, root) {
    var tokens = [];
    var current = { i: root, path: '' };
    var index, chr;

    for (index = 0; index < keypath.length; index++) {
      chr = keypath.charAt(index);

      if (!! ~interfaces.indexOf(chr)) {
        tokens.push(current);
        current = { i: chr, path: '' };
      } else {
        current.path += chr;
      }
    }

    tokens.push(current);
    return tokens;
  };

  // Parses the keypath using the interfaces defined on the view. Sets variables
  // for the tokenized keypath as well as the end key.
  Observer.prototype.parse = function () {
    var interfaces = this.interfaces();
    var root, path;

    if (!interfaces.length) {
      error('Must define at least one adapter interface.');
    }

    if (!! ~interfaces.indexOf(this.keypath[0])) {
      root = this.keypath[0];
      path = this.keypath.substr(1);
    } else {
      if (typeof (root = this.options.root || sightglass.root) === 'undefined') {
        error('Must define a default root adapter.');
      }

      path = this.keypath;
    }

    this.tokens = Observer.tokenize(path, interfaces, root);
    this.key = this.tokens.pop();
  };

  // Realizes the full keypath, attaching observers for every key and correcting
  // old observers to any changed objects in the keypath.
  Observer.prototype.realize = function () {
    var current = this.obj;
    var unreached = false;
    var prev;

    this.tokens.forEach(function (token, index) {
      if (isObject(current)) {
        if (typeof this.objectPath[index] !== 'undefined') {
          if (current !== (prev = this.objectPath[index])) {
            this.set(false, token, prev, this.update.bind(this));
            this.set(true, token, current, this.update.bind(this));
            this.objectPath[index] = current;
          }
        } else {
          this.set(true, token, current, this.update.bind(this));
          this.objectPath[index] = current;
        }

        current = this.get(token, current);
      } else {
        if (unreached === false) {
          unreached = index;
        }

        if (prev = this.objectPath[index]) {
          this.set(false, token, prev, this.update.bind(this));
        }
      }
    }, this);

    if (unreached !== false) {
      this.objectPath.splice(unreached);
    }

    return current;
  };

  // Updates the keypath. This is called when any intermediary key is changed.
  Observer.prototype.update = function () {
    var next, oldValue;

    if ((next = this.realize()) !== this.target) {
      if (isObject(this.target)) {
        this.set(false, this.key, this.target, this.callback);
      }

      if (isObject(next)) {
        this.set(true, this.key, next, this.callback);
      }

      oldValue = this.value();
      this.target = next;

      if (this.value() !== oldValue) this.callback();
    }
  };

  // Reads the current end value of the observed keypath. Returns undefined if
  // the full keypath is unreachable.
  Observer.prototype.value = function () {
    if (isObject(this.target)) {
      return this.get(this.key, this.target);
    }
  };

  // Sets the current end value of the observed keypath. Calling setValue when
  // the full keypath is unreachable is a no-op.
  Observer.prototype.setValue = function (value) {
    if (isObject(this.target)) {
      this.adapter(this.key).set(this.target, this.key.path, value);
    }
  };

  // Gets the provided key on an object.
  Observer.prototype.get = function (key, obj) {
    return this.adapter(key).get(obj, key.path);
  };

  // Observes or unobserves a callback on the object using the provided key.
  Observer.prototype.set = function (active, key, obj, callback) {
    var action = active ? 'observe' : 'unobserve';
    this.adapter(key)[action](obj, key.path, callback);
  };

  // Returns an array of all unique adapter interfaces available.
  Observer.prototype.interfaces = function () {
    var interfaces = Object.keys(this.options.adapters);

    Object.keys(sightglass.adapters).forEach(function (i) {
      if (! ~interfaces.indexOf(i)) {
        interfaces.push(i);
      }
    });

    return interfaces;
  };

  // Convenience function to grab the adapter for a specific key.
  Observer.prototype.adapter = function (key) {
    return this.options.adapters[key.i] || sightglass.adapters[key.i];
  };

  // Unobserves the entire keypath.
  Observer.prototype.unobserve = function () {
    var obj;

    this.tokens.forEach(function (token, index) {
      if (obj = this.objectPath[index]) {
        this.set(false, token, obj, this.update.bind(this));
      }
    }, this);

    if (isObject(this.target)) {
      this.set(false, this.key, this.target, this.callback);
    }
  };

  // Check if a value is an object than can be observed.
  function isObject(obj) {
    return typeof obj === 'object' && obj !== null;
  }

  // Error thrower.
  function error(message) {
    throw new Error('[sightglass] ' + message);
  }

  // Export module for Node and the browser.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = sightglass;
  } else if (typeof define === 'function' && define.amd) {
    define([], function () {
      return this.sightglass = sightglass;
    });
  } else {
    this.sightglass = sightglass;
  }
}).call(undefined);

},{}],3:[function(require,module,exports){
'use strict';

var rivets = require('./../../../../bower_components/rivets/dist/rivets.js');

rivets.binders['background-image'] = function (el, value) {
    el.style.backgroundImage = 'url(' + value + ')';
};

},{"./../../../../bower_components/rivets/dist/rivets.js":1}],4:[function(require,module,exports){
"use strict";

var imagePath = "asset/image/object/";

// read all image names from object folder

var objectData = ["endzjin.jpg", "game-controller-playstation.jpg", "power-ranger.jpg", "scherm-masker.jpg"];

// transform object file names to extendable object datbase
objectData = objectData.map(function (objectFilename) {
    objectFilename = objectFilename.replace(/\.[^/.]+$/, "");
    return {
        id: objectFilename,
        imagePath: {
            thumbnail: imagePath + objectFilename + "-thumbnail.jpg",
            preview: imagePath + objectFilename + "-preview.jpg",
            large: imagePath + objectFilename + "-large.jpg"
        }
    };
});

module.exports = objectData;

},{}],5:[function(require,module,exports){
'use strict';

var getQueryParameter = require('../util/getQueryParameter');
var objectData = require('../data/objects');
var observer = require('../util/observer');

var objectId = getQueryParameter('play');
var activeObject = objectData[0];

objectData.forEach(function (object) {
    if (object.id == objectId) {
        activeObject = object;
    }
});

var settings = {
    playWord: getQueryParameter('play') || 'beers',
    workWord: getQueryParameter('work') || 'bits',
    activeObject: activeObject
};

// allow settings to be persisted in the url
var syncSettingsInUrl = function syncSettingsInUrl() {
    var queryParameters = ['play=' + encodeURIComponent(settings.playWord), 'word=' + encodeURIComponent(settings.workWord), 'object=' + encodeURIComponent(settings.activeObject.id)];
    var pageUrl = '?' + queryParameters.join('&');
    window.history.replaceState('', '', pageUrl);
};

syncSettingsInUrl();

// update setings in url when changes occur
observer(settings, 'playWord', syncSettingsInUrl);
observer(settings, 'workWord', syncSettingsInUrl);
observer(settings, 'activeObject.id', syncSettingsInUrl);

module.exports = settings;

},{"../data/objects":4,"../util/getQueryParameter":7,"../util/observer":8}],6:[function(require,module,exports){
'use strict';

document.addEventListener('DOMContentLoaded', function () {
    var creatorLayoutElement = document.querySelector('.creatorLayout');
    var CreatorLayoutView = require('./view/CreatorLayout');
    var creatorLayout = new CreatorLayoutView(creatorLayoutElement);
});

},{"./view/CreatorLayout":15}],7:[function(require,module,exports){
"use strict";

module.exports = function (name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};

},{}],8:[function(require,module,exports){
"use strict";

var rivets = require("./../../../../bower_components/rivets/dist/rivets.js");
var sightglass = rivets._.sightglass;

var observer = function observer(dataObject, path, callback) {
    return sightglass(dataObject, path, callback, {
        root: ".",
        adapters: rivets.adapters
    });
};

module.exports = observer;

},{"./../../../../bower_components/rivets/dist/rivets.js":1}],9:[function(require,module,exports){
/*

StackBlur - a fast almost Gaussian Blur For Canvas

Version: 	0.5
Author:		Mario Klingemann
Contact: 	mario@quasimondo.com
Website:	http://www.quasimondo.com/StackBlurForCanvas
Twitter:	@quasimondo

In case you find this class useful - especially in commercial projects -
I am not totally unhappy for a small donation to my PayPal account
mario@quasimondo.de

Or support me on flattr: 
https://flattr.com/thing/72791/StackBlur-a-fast-almost-Gaussian-Blur-Effect-for-CanvasJavascript

Copyright (c) 2010 Mario Klingemann

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/

"use strict";

var mul_table = [512, 512, 456, 512, 328, 456, 335, 512, 405, 328, 271, 456, 388, 335, 292, 512, 454, 405, 364, 328, 298, 271, 496, 456, 420, 388, 360, 335, 312, 292, 273, 512, 482, 454, 428, 405, 383, 364, 345, 328, 312, 298, 284, 271, 259, 496, 475, 456, 437, 420, 404, 388, 374, 360, 347, 335, 323, 312, 302, 292, 282, 273, 265, 512, 497, 482, 468, 454, 441, 428, 417, 405, 394, 383, 373, 364, 354, 345, 337, 328, 320, 312, 305, 298, 291, 284, 278, 271, 265, 259, 507, 496, 485, 475, 465, 456, 446, 437, 428, 420, 412, 404, 396, 388, 381, 374, 367, 360, 354, 347, 341, 335, 329, 323, 318, 312, 307, 302, 297, 292, 287, 282, 278, 273, 269, 265, 261, 512, 505, 497, 489, 482, 475, 468, 461, 454, 447, 441, 435, 428, 422, 417, 411, 405, 399, 394, 389, 383, 378, 373, 368, 364, 359, 354, 350, 345, 341, 337, 332, 328, 324, 320, 316, 312, 309, 305, 301, 298, 294, 291, 287, 284, 281, 278, 274, 271, 268, 265, 262, 259, 257, 507, 501, 496, 491, 485, 480, 475, 470, 465, 460, 456, 451, 446, 442, 437, 433, 428, 424, 420, 416, 412, 408, 404, 400, 396, 392, 388, 385, 381, 377, 374, 370, 367, 363, 360, 357, 354, 350, 347, 344, 341, 338, 335, 332, 329, 326, 323, 320, 318, 315, 312, 310, 307, 304, 302, 299, 297, 294, 292, 289, 287, 285, 282, 280, 278, 275, 273, 271, 269, 267, 265, 263, 261, 259];

var shg_table = [9, 11, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 17, 17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24];

function stackBlurImage(imageID, canvasID, radius, blurAlphaChannel) {

	var img = document.getElementById(imageID);
	var w = img.naturalWidth;
	var h = img.naturalHeight;

	var canvas = document.getElementById(canvasID);

	canvas.style.width = w + "px";
	canvas.style.height = h + "px";
	canvas.width = w;
	canvas.height = h;

	var context = canvas.getContext("2d");
	context.clearRect(0, 0, w, h);
	context.drawImage(img, 0, 0);

	if (isNaN(radius) || radius < 1) {
		return;
	}if (blurAlphaChannel) stackBlurCanvasRGBA(canvasID, 0, 0, w, h, radius);else stackBlurCanvasRGB(canvasID, 0, 0, w, h, radius);
}

function stackBlurCanvasRGBA(id, top_x, top_y, width, height, radius) {
	if (isNaN(radius) || radius < 1) {
		return;
	}radius |= 0;

	var canvas = document.getElementById(id);
	var context = canvas.getContext("2d");
	var imageData;

	try {
		try {
			imageData = context.getImageData(top_x, top_y, width, height);
		} catch (e) {

			// NOTE: this part is supposedly only needed if you want to work with local files
			// so it might be okay to remove the whole try/catch block and just use
			// imageData = context.getImageData( top_x, top_y, width, height );
			try {
				netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
				imageData = context.getImageData(top_x, top_y, width, height);
			} catch (e) {
				alert("Cannot access local image");
				throw new Error("unable to access local image data: " + e);
				return;
			}
		}
	} catch (e) {
		alert("Cannot access image");
		throw new Error("unable to access image data: " + e);
	}

	var pixels = imageData.data;

	var x, y, i, p, yp, yi, yw, r_sum, g_sum, b_sum, a_sum, r_out_sum, g_out_sum, b_out_sum, a_out_sum, r_in_sum, g_in_sum, b_in_sum, a_in_sum, pr, pg, pb, pa, rbs;

	var div = radius + radius + 1;
	var w4 = width << 2;
	var widthMinus1 = width - 1;
	var heightMinus1 = height - 1;
	var radiusPlus1 = radius + 1;
	var sumFactor = radiusPlus1 * (radiusPlus1 + 1) / 2;

	var stackStart = new BlurStack();
	var stack = stackStart;
	for (i = 1; i < div; i++) {
		stack = stack.next = new BlurStack();
		if (i == radiusPlus1) var stackEnd = stack;
	}
	stack.next = stackStart;
	var stackIn = null;
	var stackOut = null;

	yw = yi = 0;

	var mul_sum = mul_table[radius];
	var shg_sum = shg_table[radius];

	for (y = 0; y < height; y++) {
		r_in_sum = g_in_sum = b_in_sum = a_in_sum = r_sum = g_sum = b_sum = a_sum = 0;

		r_out_sum = radiusPlus1 * (pr = pixels[yi]);
		g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
		b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
		a_out_sum = radiusPlus1 * (pa = pixels[yi + 3]);

		r_sum += sumFactor * pr;
		g_sum += sumFactor * pg;
		b_sum += sumFactor * pb;
		a_sum += sumFactor * pa;

		stack = stackStart;

		for (i = 0; i < radiusPlus1; i++) {
			stack.r = pr;
			stack.g = pg;
			stack.b = pb;
			stack.a = pa;
			stack = stack.next;
		}

		for (i = 1; i < radiusPlus1; i++) {
			p = yi + ((widthMinus1 < i ? widthMinus1 : i) << 2);
			r_sum += (stack.r = pr = pixels[p]) * (rbs = radiusPlus1 - i);
			g_sum += (stack.g = pg = pixels[p + 1]) * rbs;
			b_sum += (stack.b = pb = pixels[p + 2]) * rbs;
			a_sum += (stack.a = pa = pixels[p + 3]) * rbs;

			r_in_sum += pr;
			g_in_sum += pg;
			b_in_sum += pb;
			a_in_sum += pa;

			stack = stack.next;
		}

		stackIn = stackStart;
		stackOut = stackEnd;
		for (x = 0; x < width; x++) {
			pixels[yi + 3] = pa = a_sum * mul_sum >> shg_sum;
			if (pa != 0) {
				pa = 255 / pa;
				pixels[yi] = (r_sum * mul_sum >> shg_sum) * pa;
				pixels[yi + 1] = (g_sum * mul_sum >> shg_sum) * pa;
				pixels[yi + 2] = (b_sum * mul_sum >> shg_sum) * pa;
			} else {
				pixels[yi] = pixels[yi + 1] = pixels[yi + 2] = 0;
			}

			r_sum -= r_out_sum;
			g_sum -= g_out_sum;
			b_sum -= b_out_sum;
			a_sum -= a_out_sum;

			r_out_sum -= stackIn.r;
			g_out_sum -= stackIn.g;
			b_out_sum -= stackIn.b;
			a_out_sum -= stackIn.a;

			p = yw + ((p = x + radius + 1) < widthMinus1 ? p : widthMinus1) << 2;

			r_in_sum += stackIn.r = pixels[p];
			g_in_sum += stackIn.g = pixels[p + 1];
			b_in_sum += stackIn.b = pixels[p + 2];
			a_in_sum += stackIn.a = pixels[p + 3];

			r_sum += r_in_sum;
			g_sum += g_in_sum;
			b_sum += b_in_sum;
			a_sum += a_in_sum;

			stackIn = stackIn.next;

			r_out_sum += pr = stackOut.r;
			g_out_sum += pg = stackOut.g;
			b_out_sum += pb = stackOut.b;
			a_out_sum += pa = stackOut.a;

			r_in_sum -= pr;
			g_in_sum -= pg;
			b_in_sum -= pb;
			a_in_sum -= pa;

			stackOut = stackOut.next;

			yi += 4;
		}
		yw += width;
	}

	for (x = 0; x < width; x++) {
		g_in_sum = b_in_sum = a_in_sum = r_in_sum = g_sum = b_sum = a_sum = r_sum = 0;

		yi = x << 2;
		r_out_sum = radiusPlus1 * (pr = pixels[yi]);
		g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
		b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
		a_out_sum = radiusPlus1 * (pa = pixels[yi + 3]);

		r_sum += sumFactor * pr;
		g_sum += sumFactor * pg;
		b_sum += sumFactor * pb;
		a_sum += sumFactor * pa;

		stack = stackStart;

		for (i = 0; i < radiusPlus1; i++) {
			stack.r = pr;
			stack.g = pg;
			stack.b = pb;
			stack.a = pa;
			stack = stack.next;
		}

		yp = width;

		for (i = 1; i <= radius; i++) {
			yi = yp + x << 2;

			r_sum += (stack.r = pr = pixels[yi]) * (rbs = radiusPlus1 - i);
			g_sum += (stack.g = pg = pixels[yi + 1]) * rbs;
			b_sum += (stack.b = pb = pixels[yi + 2]) * rbs;
			a_sum += (stack.a = pa = pixels[yi + 3]) * rbs;

			r_in_sum += pr;
			g_in_sum += pg;
			b_in_sum += pb;
			a_in_sum += pa;

			stack = stack.next;

			if (i < heightMinus1) {
				yp += width;
			}
		}

		yi = x;
		stackIn = stackStart;
		stackOut = stackEnd;
		for (y = 0; y < height; y++) {
			p = yi << 2;
			pixels[p + 3] = pa = a_sum * mul_sum >> shg_sum;
			if (pa > 0) {
				pa = 255 / pa;
				pixels[p] = (r_sum * mul_sum >> shg_sum) * pa;
				pixels[p + 1] = (g_sum * mul_sum >> shg_sum) * pa;
				pixels[p + 2] = (b_sum * mul_sum >> shg_sum) * pa;
			} else {
				pixels[p] = pixels[p + 1] = pixels[p + 2] = 0;
			}

			r_sum -= r_out_sum;
			g_sum -= g_out_sum;
			b_sum -= b_out_sum;
			a_sum -= a_out_sum;

			r_out_sum -= stackIn.r;
			g_out_sum -= stackIn.g;
			b_out_sum -= stackIn.b;
			a_out_sum -= stackIn.a;

			p = x + ((p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1) * width << 2;

			r_sum += r_in_sum += stackIn.r = pixels[p];
			g_sum += g_in_sum += stackIn.g = pixels[p + 1];
			b_sum += b_in_sum += stackIn.b = pixels[p + 2];
			a_sum += a_in_sum += stackIn.a = pixels[p + 3];

			stackIn = stackIn.next;

			r_out_sum += pr = stackOut.r;
			g_out_sum += pg = stackOut.g;
			b_out_sum += pb = stackOut.b;
			a_out_sum += pa = stackOut.a;

			r_in_sum -= pr;
			g_in_sum -= pg;
			b_in_sum -= pb;
			a_in_sum -= pa;

			stackOut = stackOut.next;

			yi += width;
		}
	}

	context.putImageData(imageData, top_x, top_y);
}

function stackBlurCanvasRGB(id, top_x, top_y, width, height, radius) {
	if (isNaN(radius) || radius < 1) {
		return;
	}radius |= 0;

	var canvas = document.getElementById(id);
	var context = canvas.getContext("2d");
	var imageData;

	try {
		try {
			imageData = context.getImageData(top_x, top_y, width, height);
		} catch (e) {

			// NOTE: this part is supposedly only needed if you want to work with local files
			// so it might be okay to remove the whole try/catch block and just use
			// imageData = context.getImageData( top_x, top_y, width, height );
			try {
				netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
				imageData = context.getImageData(top_x, top_y, width, height);
			} catch (e) {
				alert("Cannot access local image");
				throw new Error("unable to access local image data: " + e);
				return;
			}
		}
	} catch (e) {
		alert("Cannot access image");
		throw new Error("unable to access image data: " + e);
	}

	var pixels = imageData.data;

	var x, y, i, p, yp, yi, yw, r_sum, g_sum, b_sum, r_out_sum, g_out_sum, b_out_sum, r_in_sum, g_in_sum, b_in_sum, pr, pg, pb, rbs;

	var div = radius + radius + 1;
	var w4 = width << 2;
	var widthMinus1 = width - 1;
	var heightMinus1 = height - 1;
	var radiusPlus1 = radius + 1;
	var sumFactor = radiusPlus1 * (radiusPlus1 + 1) / 2;

	var stackStart = new BlurStack();
	var stack = stackStart;
	for (i = 1; i < div; i++) {
		stack = stack.next = new BlurStack();
		if (i == radiusPlus1) var stackEnd = stack;
	}
	stack.next = stackStart;
	var stackIn = null;
	var stackOut = null;

	yw = yi = 0;

	var mul_sum = mul_table[radius];
	var shg_sum = shg_table[radius];

	for (y = 0; y < height; y++) {
		r_in_sum = g_in_sum = b_in_sum = r_sum = g_sum = b_sum = 0;

		r_out_sum = radiusPlus1 * (pr = pixels[yi]);
		g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
		b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);

		r_sum += sumFactor * pr;
		g_sum += sumFactor * pg;
		b_sum += sumFactor * pb;

		stack = stackStart;

		for (i = 0; i < radiusPlus1; i++) {
			stack.r = pr;
			stack.g = pg;
			stack.b = pb;
			stack = stack.next;
		}

		for (i = 1; i < radiusPlus1; i++) {
			p = yi + ((widthMinus1 < i ? widthMinus1 : i) << 2);
			r_sum += (stack.r = pr = pixels[p]) * (rbs = radiusPlus1 - i);
			g_sum += (stack.g = pg = pixels[p + 1]) * rbs;
			b_sum += (stack.b = pb = pixels[p + 2]) * rbs;

			r_in_sum += pr;
			g_in_sum += pg;
			b_in_sum += pb;

			stack = stack.next;
		}

		stackIn = stackStart;
		stackOut = stackEnd;
		for (x = 0; x < width; x++) {
			pixels[yi] = r_sum * mul_sum >> shg_sum;
			pixels[yi + 1] = g_sum * mul_sum >> shg_sum;
			pixels[yi + 2] = b_sum * mul_sum >> shg_sum;

			r_sum -= r_out_sum;
			g_sum -= g_out_sum;
			b_sum -= b_out_sum;

			r_out_sum -= stackIn.r;
			g_out_sum -= stackIn.g;
			b_out_sum -= stackIn.b;

			p = yw + ((p = x + radius + 1) < widthMinus1 ? p : widthMinus1) << 2;

			r_in_sum += stackIn.r = pixels[p];
			g_in_sum += stackIn.g = pixels[p + 1];
			b_in_sum += stackIn.b = pixels[p + 2];

			r_sum += r_in_sum;
			g_sum += g_in_sum;
			b_sum += b_in_sum;

			stackIn = stackIn.next;

			r_out_sum += pr = stackOut.r;
			g_out_sum += pg = stackOut.g;
			b_out_sum += pb = stackOut.b;

			r_in_sum -= pr;
			g_in_sum -= pg;
			b_in_sum -= pb;

			stackOut = stackOut.next;

			yi += 4;
		}
		yw += width;
	}

	for (x = 0; x < width; x++) {
		g_in_sum = b_in_sum = r_in_sum = g_sum = b_sum = r_sum = 0;

		yi = x << 2;
		r_out_sum = radiusPlus1 * (pr = pixels[yi]);
		g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
		b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);

		r_sum += sumFactor * pr;
		g_sum += sumFactor * pg;
		b_sum += sumFactor * pb;

		stack = stackStart;

		for (i = 0; i < radiusPlus1; i++) {
			stack.r = pr;
			stack.g = pg;
			stack.b = pb;
			stack = stack.next;
		}

		yp = width;

		for (i = 1; i <= radius; i++) {
			yi = yp + x << 2;

			r_sum += (stack.r = pr = pixels[yi]) * (rbs = radiusPlus1 - i);
			g_sum += (stack.g = pg = pixels[yi + 1]) * rbs;
			b_sum += (stack.b = pb = pixels[yi + 2]) * rbs;

			r_in_sum += pr;
			g_in_sum += pg;
			b_in_sum += pb;

			stack = stack.next;

			if (i < heightMinus1) {
				yp += width;
			}
		}

		yi = x;
		stackIn = stackStart;
		stackOut = stackEnd;
		for (y = 0; y < height; y++) {
			p = yi << 2;
			pixels[p] = r_sum * mul_sum >> shg_sum;
			pixels[p + 1] = g_sum * mul_sum >> shg_sum;
			pixels[p + 2] = b_sum * mul_sum >> shg_sum;

			r_sum -= r_out_sum;
			g_sum -= g_out_sum;
			b_sum -= b_out_sum;

			r_out_sum -= stackIn.r;
			g_out_sum -= stackIn.g;
			b_out_sum -= stackIn.b;

			p = x + ((p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1) * width << 2;

			r_sum += r_in_sum += stackIn.r = pixels[p];
			g_sum += g_in_sum += stackIn.g = pixels[p + 1];
			b_sum += b_in_sum += stackIn.b = pixels[p + 2];

			stackIn = stackIn.next;

			r_out_sum += pr = stackOut.r;
			g_out_sum += pg = stackOut.g;
			b_out_sum += pb = stackOut.b;

			r_in_sum -= pr;
			g_in_sum -= pg;
			b_in_sum -= pb;

			stackOut = stackOut.next;

			yi += width;
		}
	}

	context.putImageData(imageData, top_x, top_y);
}

function BlurStack() {
	this.r = 0;
	this.g = 0;
	this.b = 0;
	this.a = 0;
	this.next = null;
}

},{}],10:[function(require,module,exports){
'use strict';(function(){this.canvg = function(target, s, opts){if(target == null && s == null && opts == null){var svgTags=document.querySelectorAll('svg');for(var i=0; i < svgTags.length; i++) {var svgTag=svgTags[i];var c=document.createElement('canvas');c.width = svgTag.clientWidth;c.height = svgTag.clientHeight;svgTag.parentNode.insertBefore(c, svgTag);svgTag.parentNode.removeChild(svgTag);var div=document.createElement('div');div.appendChild(svgTag);canvg(c, div.innerHTML);}return;}if(typeof target == 'string'){target = document.getElementById(target);}if(target.svg != null)target.svg.stop();var svg=build(opts || {});if(!(target.childNodes.length == 1 && target.childNodes[0].nodeName == 'OBJECT'))target.svg = svg;var ctx=target.getContext('2d');if(typeof s.documentElement != 'undefined'){svg.loadXmlDoc(ctx, s);}else if(s.substr(0, 1) == '<'){svg.loadXml(ctx, s);}else {svg.load(ctx, s);}};var matchesSelector;if(typeof Element.prototype.matches != 'undefined'){matchesSelector = function(node, selector){return node.matches(selector);};}else if(typeof Element.prototype.webkitMatchesSelector != 'undefined'){matchesSelector = function(node, selector){return node.webkitMatchesSelector(selector);};}else if(typeof Element.prototype.mozMatchesSelector != 'undefined'){matchesSelector = function(node, selector){return node.mozMatchesSelector(selector);};}else if(typeof Element.prototype.msMatchesSelector != 'undefined'){matchesSelector = function(node, selector){return node.msMatchesSelector(selector);};}else if(typeof Element.prototype.oMatchesSelector != 'undefined'){matchesSelector = function(node, selector){return node.oMatchesSelector(selector);};}else {matchesSelector = Sizzle.matchesSelector;}var attributeRegex=/(\[[^\]]+\])/g;var idRegex=/(#[^\s\+>~\.\[:]+)/g;var classRegex=/(\.[^\s\+>~\.\[:]+)/g;var pseudoElementRegex=/(::[^\s\+>~\.\[:]+|:first-line|:first-letter|:before|:after)/gi;var pseudoClassWithBracketsRegex=/(:[\w-]+\([^\)]*\))/gi;var pseudoClassRegex=/(:[^\s\+>~\.\[:]+)/g;var elementRegex=/([^\s\+>~\.\[:]+)/g;function getSelectorSpecificity(selector){var typeCount=[0, 0, 0];var findMatch=function findMatch(regex, type){var matches=selector.match(regex);if(matches == null){return;}typeCount[type] += matches.length;selector = selector.replace(regex, ' ');};selector = selector.replace(/:not\(([^\)]*)\)/g, '     $1 ');selector = selector.replace(/{[^]*/gm, ' ');findMatch(attributeRegex, 1);findMatch(idRegex, 0);findMatch(classRegex, 1);findMatch(pseudoElementRegex, 2);findMatch(pseudoClassWithBracketsRegex, 1);findMatch(pseudoClassRegex, 1);selector = selector.replace(/[\*\s\+>~]/g, ' ');selector = selector.replace(/[#\.]/g, ' ');findMatch(elementRegex, 2);return typeCount.join('');}function build(opts){var svg={opts:opts};svg.FRAMERATE = 30;svg.MAX_VIRTUAL_PIXELS = 30000;svg.log = function(msg){};if(svg.opts.log == true && typeof console != 'undefined'){svg.log = function(msg){console.log(msg);};};svg.init = function(ctx){var uniqueId=0;svg.UniqueId = function(){uniqueId++;return 'canvg' + uniqueId;};svg.Definitions = {};svg.Styles = {};svg.StylesSpecificity = {};svg.Animations = [];svg.Images = [];svg.ctx = ctx;svg.ViewPort = new function(){this.viewPorts = [];this.Clear = function(){this.viewPorts = [];};this.SetCurrent = function(width, height){this.viewPorts.push({width:width, height:height});};this.RemoveCurrent = function(){this.viewPorts.pop();};this.Current = function(){return this.viewPorts[this.viewPorts.length - 1];};this.width = function(){return this.Current().width;};this.height = function(){return this.Current().height;};this.ComputeSize = function(d){if(d != null && typeof d == 'number')return d;if(d == 'x')return this.width();if(d == 'y')return this.height();return Math.sqrt(Math.pow(this.width(), 2) + Math.pow(this.height(), 2)) / Math.sqrt(2);};}();};svg.init();svg.ImagesLoaded = function(){for(var i=0; i < svg.Images.length; i++) {if(!svg.Images[i].loaded)return false;}return true;};svg.trim = function(s){return s.replace(/^\s+|\s+$/g, '');};svg.compressSpaces = function(s){return s.replace(/[\s\r\t\n]+/gm, ' ');};svg.ajax = function(url){var AJAX;if(window.XMLHttpRequest){AJAX = new XMLHttpRequest();}else {AJAX = new ActiveXObject('Microsoft.XMLHTTP');}if(AJAX){AJAX.open('GET', url, false);AJAX.send(null);return AJAX.responseText;}return null;};svg.parseXml = function(xml){if(typeof Windows != 'undefined' && typeof Windows.Data != 'undefined' && typeof Windows.Data.Xml != 'undefined'){var xmlDoc=new Windows.Data.Xml.Dom.XmlDocument();var settings=new Windows.Data.Xml.Dom.XmlLoadSettings();settings.prohibitDtd = false;xmlDoc.loadXml(xml, settings);return xmlDoc;}else if(window.DOMParser){var parser=new DOMParser();return parser.parseFromString(xml, 'text/xml');}else {xml = xml.replace(/<!DOCTYPE svg[^>]*>/, '');var xmlDoc=new ActiveXObject('Microsoft.XMLDOM');xmlDoc.async = 'false';xmlDoc.loadXML(xml);return xmlDoc;}};svg.Property = function(name, value){this.name = name;this.value = value;};svg.Property.prototype.getValue = function(){return this.value;};svg.Property.prototype.hasValue = function(){return this.value != null && this.value !== '';};svg.Property.prototype.numValue = function(){if(!this.hasValue())return 0;var n=parseFloat(this.value);if((this.value + '').match(/%$/)){n = n / 100;}return n;};svg.Property.prototype.valueOrDefault = function(def){if(this.hasValue())return this.value;return def;};svg.Property.prototype.numValueOrDefault = function(def){if(this.hasValue())return this.numValue();return def;};svg.Property.prototype.addOpacity = function(opacityProp){var newValue=this.value;if(opacityProp.value != null && opacityProp.value != '' && typeof this.value == 'string'){var color=new RGBColor(this.value);if(color.ok){newValue = 'rgba(' + color.r + ', ' + color.g + ', ' + color.b + ', ' + opacityProp.numValue() + ')';}}return new svg.Property(this.name, newValue);};svg.Property.prototype.getDefinition = function(){var name=this.value.match(/#([^\)'"]+)/);if(name){name = name[1];}if(!name){name = this.value;}return svg.Definitions[name];};svg.Property.prototype.isUrlDefinition = function(){return this.value.indexOf('url(') == 0;};svg.Property.prototype.getFillStyleDefinition = function(e, opacityProp){var def=this.getDefinition();if(def != null && def.createGradient){return def.createGradient(svg.ctx, e, opacityProp);}if(def != null && def.createPattern){if(def.getHrefAttribute().hasValue()){var pt=def.attribute('patternTransform');def = def.getHrefAttribute().getDefinition();if(pt.hasValue()){def.attribute('patternTransform', true).value = pt.value;}}return def.createPattern(svg.ctx, e);}return null;};svg.Property.prototype.getDPI = function(viewPort){return 96;};svg.Property.prototype.getEM = function(viewPort){var em=12;var fontSize=new svg.Property('fontSize', svg.Font.Parse(svg.ctx.font).fontSize);if(fontSize.hasValue())em = fontSize.toPixels(viewPort);return em;};svg.Property.prototype.getUnits = function(){var s=this.value + '';return s.replace(/[0-9\.\-]/g, '');};svg.Property.prototype.toPixels = function(viewPort, processPercent){if(!this.hasValue())return 0;var s=this.value + '';if(s.match(/em$/))return this.numValue() * this.getEM(viewPort);if(s.match(/ex$/))return this.numValue() * this.getEM(viewPort) / 2;if(s.match(/px$/))return this.numValue();if(s.match(/pt$/))return this.numValue() * this.getDPI(viewPort) * (1 / 72);if(s.match(/pc$/))return this.numValue() * 15;if(s.match(/cm$/))return this.numValue() * this.getDPI(viewPort) / 2.54;if(s.match(/mm$/))return this.numValue() * this.getDPI(viewPort) / 25.4;if(s.match(/in$/))return this.numValue() * this.getDPI(viewPort);if(s.match(/%$/))return this.numValue() * svg.ViewPort.ComputeSize(viewPort);var n=this.numValue();if(processPercent && n < 1)return n * svg.ViewPort.ComputeSize(viewPort);return n;};svg.Property.prototype.toMilliseconds = function(){if(!this.hasValue())return 0;var s=this.value + '';if(s.match(/s$/))return this.numValue() * 1000;if(s.match(/ms$/))return this.numValue();return this.numValue();};svg.Property.prototype.toRadians = function(){if(!this.hasValue())return 0;var s=this.value + '';if(s.match(/deg$/))return this.numValue() * (Math.PI / 180);if(s.match(/grad$/))return this.numValue() * (Math.PI / 200);if(s.match(/rad$/))return this.numValue();return this.numValue() * (Math.PI / 180);};var textBaselineMapping={baseline:'alphabetic', 'before-edge':'top', 'text-before-edge':'top', middle:'middle', central:'middle', 'after-edge':'bottom', 'text-after-edge':'bottom', ideographic:'ideographic', alphabetic:'alphabetic', hanging:'hanging', mathematical:'alphabetic'};svg.Property.prototype.toTextBaseline = function(){if(!this.hasValue())return null;return textBaselineMapping[this.value];};svg.Font = new function(){this.Styles = 'normal|italic|oblique|inherit';this.Variants = 'normal|small-caps|inherit';this.Weights = 'normal|bold|bolder|lighter|100|200|300|400|500|600|700|800|900|inherit';this.CreateFont = function(fontStyle, fontVariant, fontWeight, fontSize, fontFamily, inherit){var f=inherit != null?this.Parse(inherit):this.CreateFont('', '', '', '', '', svg.ctx.font);return {fontFamily:fontFamily || f.fontFamily, fontSize:fontSize || f.fontSize, fontStyle:fontStyle || f.fontStyle, fontWeight:fontWeight || f.fontWeight, fontVariant:fontVariant || f.fontVariant, toString:function toString(){return [this.fontStyle, this.fontVariant, this.fontWeight, this.fontSize, this.fontFamily].join(' ');}};};var that=this;this.Parse = function(s){var f={};var d=svg.trim(svg.compressSpaces(s || '')).split(' ');var set={fontSize:false, fontStyle:false, fontWeight:false, fontVariant:false};var ff='';for(var i=0; i < d.length; i++) {if(!set.fontStyle && that.Styles.indexOf(d[i]) != -1){if(d[i] != 'inherit')f.fontStyle = d[i];set.fontStyle = true;}else if(!set.fontVariant && that.Variants.indexOf(d[i]) != -1){if(d[i] != 'inherit')f.fontVariant = d[i];set.fontStyle = set.fontVariant = true;}else if(!set.fontWeight && that.Weights.indexOf(d[i]) != -1){if(d[i] != 'inherit')f.fontWeight = d[i];set.fontStyle = set.fontVariant = set.fontWeight = true;}else if(!set.fontSize){if(d[i] != 'inherit')f.fontSize = d[i].split('/')[0];set.fontStyle = set.fontVariant = set.fontWeight = set.fontSize = true;}else {if(d[i] != 'inherit')ff += d[i];}}if(ff != '')f.fontFamily = ff;return f;};}();svg.ToNumberArray = function(s){var a=svg.trim(svg.compressSpaces((s || '').replace(/,/g, ' '))).split(' ');for(var i=0; i < a.length; i++) {a[i] = parseFloat(a[i]);}return a;};svg.Point = function(x, y){this.x = x;this.y = y;};svg.Point.prototype.angleTo = function(p){return Math.atan2(p.y - this.y, p.x - this.x);};svg.Point.prototype.applyTransform = function(v){var xp=this.x * v[0] + this.y * v[2] + v[4];var yp=this.x * v[1] + this.y * v[3] + v[5];this.x = xp;this.y = yp;};svg.CreatePoint = function(s){var a=svg.ToNumberArray(s);return new svg.Point(a[0], a[1]);};svg.CreatePath = function(s){var a=svg.ToNumberArray(s);var path=[];for(var i=0; i < a.length; i += 2) {path.push(new svg.Point(a[i], a[i + 1]));}return path;};svg.BoundingBox = function(x1, y1, x2, y2){this.x1 = Number.NaN;this.y1 = Number.NaN;this.x2 = Number.NaN;this.y2 = Number.NaN;this.x = function(){return this.x1;};this.y = function(){return this.y1;};this.width = function(){return this.x2 - this.x1;};this.height = function(){return this.y2 - this.y1;};this.addPoint = function(x, y){if(x != null){if(isNaN(this.x1) || isNaN(this.x2)){this.x1 = x;this.x2 = x;}if(x < this.x1)this.x1 = x;if(x > this.x2)this.x2 = x;}if(y != null){if(isNaN(this.y1) || isNaN(this.y2)){this.y1 = y;this.y2 = y;}if(y < this.y1)this.y1 = y;if(y > this.y2)this.y2 = y;}};this.addX = function(x){this.addPoint(x, null);};this.addY = function(y){this.addPoint(null, y);};this.addBoundingBox = function(bb){this.addPoint(bb.x1, bb.y1);this.addPoint(bb.x2, bb.y2);};this.addQuadraticCurve = function(p0x, p0y, p1x, p1y, p2x, p2y){var cp1x=p0x + 2 / 3 * (p1x - p0x);var cp1y=p0y + 2 / 3 * (p1y - p0y);var cp2x=cp1x + 1 / 3 * (p2x - p0x);var cp2y=cp1y + 1 / 3 * (p2y - p0y);this.addBezierCurve(p0x, p0y, cp1x, cp2x, cp1y, cp2y, p2x, p2y);};this.addBezierCurve = function(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y){var p0=[p0x, p0y], p1=[p1x, p1y], p2=[p2x, p2y], p3=[p3x, p3y];this.addPoint(p0[0], p0[1]);this.addPoint(p3[0], p3[1]);for(i = 0; i <= 1; i++) {var f=function f(t){return Math.pow(1 - t, 3) * p0[i] + 3 * Math.pow(1 - t, 2) * t * p1[i] + 3 * (1 - t) * Math.pow(t, 2) * p2[i] + Math.pow(t, 3) * p3[i];};var b=6 * p0[i] - 12 * p1[i] + 6 * p2[i];var a=-3 * p0[i] + 9 * p1[i] - 9 * p2[i] + 3 * p3[i];var c=3 * p1[i] - 3 * p0[i];if(a == 0){if(b == 0)continue;var t=-c / b;if(0 < t && t < 1){if(i == 0)this.addX(f(t));if(i == 1)this.addY(f(t));}continue;}var b2ac=Math.pow(b, 2) - 4 * c * a;if(b2ac < 0)continue;var t1=(-b + Math.sqrt(b2ac)) / (2 * a);if(0 < t1 && t1 < 1){if(i == 0)this.addX(f(t1));if(i == 1)this.addY(f(t1));}var t2=(-b - Math.sqrt(b2ac)) / (2 * a);if(0 < t2 && t2 < 1){if(i == 0)this.addX(f(t2));if(i == 1)this.addY(f(t2));}}};this.isPointInBox = function(x, y){return this.x1 <= x && x <= this.x2 && this.y1 <= y && y <= this.y2;};this.addPoint(x1, y1);this.addPoint(x2, y2);};svg.Transform = function(v){var that=this;this.Type = {};this.Type.translate = function(s){this.p = svg.CreatePoint(s);this.apply = function(ctx){ctx.translate(this.p.x || 0, this.p.y || 0);};this.unapply = function(ctx){ctx.translate(-1 * this.p.x || 0, -1 * this.p.y || 0);};this.applyToPoint = function(p){p.applyTransform([1, 0, 0, 1, this.p.x || 0, this.p.y || 0]);};};this.Type.rotate = function(s){var a=svg.ToNumberArray(s);this.angle = new svg.Property('angle', a[0]);this.cx = a[1] || 0;this.cy = a[2] || 0;this.apply = function(ctx){ctx.translate(this.cx, this.cy);ctx.rotate(this.angle.toRadians());ctx.translate(-this.cx, -this.cy);};this.unapply = function(ctx){ctx.translate(this.cx, this.cy);ctx.rotate(-1 * this.angle.toRadians());ctx.translate(-this.cx, -this.cy);};this.applyToPoint = function(p){var a=this.angle.toRadians();p.applyTransform([1, 0, 0, 1, this.p.x || 0, this.p.y || 0]);p.applyTransform([Math.cos(a), Math.sin(a), -Math.sin(a), Math.cos(a), 0, 0]);p.applyTransform([1, 0, 0, 1, -this.p.x || 0, -this.p.y || 0]);};};this.Type.scale = function(s){this.p = svg.CreatePoint(s);this.apply = function(ctx){ctx.scale(this.p.x || 1, this.p.y || this.p.x || 1);};this.unapply = function(ctx){ctx.scale(1 / this.p.x || 1, 1 / this.p.y || this.p.x || 1);};this.applyToPoint = function(p){p.applyTransform([this.p.x || 0, 0, 0, this.p.y || 0, 0, 0]);};};this.Type.matrix = function(s){this.m = svg.ToNumberArray(s);this.apply = function(ctx){ctx.transform(this.m[0], this.m[1], this.m[2], this.m[3], this.m[4], this.m[5]);};this.unapply = function(ctx){var a=this.m[0];var b=this.m[2];var c=this.m[4];var d=this.m[1];var e=this.m[3];var f=this.m[5];var g=0;var h=0;var i=1;var det=1 / (a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g));ctx.transform(det * (e * i - f * h), det * (f * g - d * i), det * (c * h - b * i), det * (a * i - c * g), det * (b * f - c * e), det * (c * d - a * f));};this.applyToPoint = function(p){p.applyTransform(this.m);};};this.Type.SkewBase = function(s){this.base = that.Type.matrix;this.base(s);this.angle = new svg.Property('angle', s);};this.Type.SkewBase.prototype = new this.Type.matrix();this.Type.skewX = function(s){this.base = that.Type.SkewBase;this.base(s);this.m = [1, 0, Math.tan(this.angle.toRadians()), 1, 0, 0];};this.Type.skewX.prototype = new this.Type.SkewBase();this.Type.skewY = function(s){this.base = that.Type.SkewBase;this.base(s);this.m = [1, Math.tan(this.angle.toRadians()), 0, 1, 0, 0];};this.Type.skewY.prototype = new this.Type.SkewBase();this.transforms = [];this.apply = function(ctx){for(var i=0; i < this.transforms.length; i++) {this.transforms[i].apply(ctx);}};this.unapply = function(ctx){for(var i=this.transforms.length - 1; i >= 0; i--) {this.transforms[i].unapply(ctx);}};this.applyToPoint = function(p){for(var i=0; i < this.transforms.length; i++) {this.transforms[i].applyToPoint(p);}};var data=svg.trim(svg.compressSpaces(v)).replace(/\)([a-zA-Z])/g, ') $1').replace(/\)(\s?,\s?)/g, ') ').split(/\s(?=[a-z])/);for(var i=0; i < data.length; i++) {var type=svg.trim(data[i].split('(')[0]);var s=data[i].split('(')[1].replace(')', '');var transform=new this.Type[type](s);transform.type = type;this.transforms.push(transform);}};svg.AspectRatio = function(ctx, aspectRatio, width, desiredWidth, height, desiredHeight, minX, minY, refX, refY){aspectRatio = svg.compressSpaces(aspectRatio);aspectRatio = aspectRatio.replace(/^defer\s/, '');var align=aspectRatio.split(' ')[0] || 'xMidYMid';var meetOrSlice=aspectRatio.split(' ')[1] || 'meet';var scaleX=width / desiredWidth;var scaleY=height / desiredHeight;var scaleMin=Math.min(scaleX, scaleY);var scaleMax=Math.max(scaleX, scaleY);if(meetOrSlice == 'meet'){desiredWidth *= scaleMin;desiredHeight *= scaleMin;}if(meetOrSlice == 'slice'){desiredWidth *= scaleMax;desiredHeight *= scaleMax;}refX = new svg.Property('refX', refX);refY = new svg.Property('refY', refY);if(refX.hasValue() && refY.hasValue()){ctx.translate(-scaleMin * refX.toPixels('x'), -scaleMin * refY.toPixels('y'));}else {if(align.match(/^xMid/) && (meetOrSlice == 'meet' && scaleMin == scaleY || meetOrSlice == 'slice' && scaleMax == scaleY))ctx.translate(width / 2 - desiredWidth / 2, 0);if(align.match(/YMid$/) && (meetOrSlice == 'meet' && scaleMin == scaleX || meetOrSlice == 'slice' && scaleMax == scaleX))ctx.translate(0, height / 2 - desiredHeight / 2);if(align.match(/^xMax/) && (meetOrSlice == 'meet' && scaleMin == scaleY || meetOrSlice == 'slice' && scaleMax == scaleY))ctx.translate(width - desiredWidth, 0);if(align.match(/YMax$/) && (meetOrSlice == 'meet' && scaleMin == scaleX || meetOrSlice == 'slice' && scaleMax == scaleX))ctx.translate(0, height - desiredHeight);}if(align == 'none')ctx.scale(scaleX, scaleY);else if(meetOrSlice == 'meet')ctx.scale(scaleMin, scaleMin);else if(meetOrSlice == 'slice')ctx.scale(scaleMax, scaleMax);ctx.translate(minX == null?0:-minX, minY == null?0:-minY);};svg.Element = {};svg.EmptyProperty = new svg.Property('EMPTY', '');svg.Element.ElementBase = function(node){this.attributes = {};this.styles = {};this.stylesSpecificity = {};this.children = [];this.attribute = function(name, createIfNotExists){var a=this.attributes[name];if(a != null)return a;if(createIfNotExists == true){a = new svg.Property(name, '');this.attributes[name] = a;}return a || svg.EmptyProperty;};this.getHrefAttribute = function(){for(var a in this.attributes) {if(a.match(/:href$/)){return this.attributes[a];}}return svg.EmptyProperty;};this.style = function(name, createIfNotExists, skipAncestors){var s=this.styles[name];if(s != null)return s;var a=this.attribute(name);if(a != null && a.hasValue()){this.styles[name] = a;return a;}if(skipAncestors != true){var p=this.parent;if(p != null){var ps=p.style(name);if(ps != null && ps.hasValue()){return ps;}}}if(createIfNotExists == true){s = new svg.Property(name, '');this.styles[name] = s;}return s || svg.EmptyProperty;};this.render = function(ctx){if(this.style('display').value == 'none')return;if(this.style('visibility').value == 'hidden')return;ctx.save();if(this.attribute('mask').hasValue()){var mask=this.attribute('mask').getDefinition();if(mask != null)mask.apply(ctx, this);}else if(this.style('filter').hasValue()){var filter=this.style('filter').getDefinition();if(filter != null)filter.apply(ctx, this);}else {this.setContext(ctx);this.renderChildren(ctx);this.clearContext(ctx);}ctx.restore();};this.setContext = function(ctx){};this.clearContext = function(ctx){};this.renderChildren = function(ctx){for(var i=0; i < this.children.length; i++) {this.children[i].render(ctx);}};this.addChild = function(childNode, create){var child=childNode;if(create)child = svg.CreateElement(childNode);child.parent = this;if(child.type != 'title'){this.children.push(child);}};this.addStylesFromStyleDefinition = function(){for(var selector in svg.Styles) {if(matchesSelector(node, selector)){var styles=svg.Styles[selector];var specificity=svg.StylesSpecificity[selector];if(styles != null){for(var name in styles) {var existingSpecificity=this.stylesSpecificity[name];if(typeof existingSpecificity == 'undefined'){existingSpecificity = '000';}if(specificity > existingSpecificity){this.styles[name] = styles[name];this.stylesSpecificity[name] = specificity;}}}}}};if(node != null && node.nodeType == 1){for(var i=0; i < node.attributes.length; i++) {var attribute=node.attributes[i];this.attributes[attribute.nodeName] = new svg.Property(attribute.nodeName, attribute.value);}this.addStylesFromStyleDefinition();if(this.attribute('style').hasValue()){var styles=this.attribute('style').value.split(';');for(var i=0; i < styles.length; i++) {if(svg.trim(styles[i]) != ''){var style=styles[i].split(':');var name=svg.trim(style[0]);var value=svg.trim(style[1]);this.styles[name] = new svg.Property(name, value);}}}if(this.attribute('id').hasValue()){if(svg.Definitions[this.attribute('id').value] == null){svg.Definitions[this.attribute('id').value] = this;}}for(var i=0; i < node.childNodes.length; i++) {var childNode=node.childNodes[i];if(childNode.nodeType == 1)this.addChild(childNode, true);if(this.captureTextNodes && (childNode.nodeType == 3 || childNode.nodeType == 4)){var text=childNode.value || childNode.text || childNode.textContent || '';if(svg.compressSpaces(text) != ''){this.addChild(new svg.Element.tspan(childNode), false);}}}}};svg.Element.RenderedElementBase = function(node){this.base = svg.Element.ElementBase;this.base(node);this.setContext = function(ctx){if(this.style('fill').isUrlDefinition()){var fs=this.style('fill').getFillStyleDefinition(this, this.style('fill-opacity'));if(fs != null)ctx.fillStyle = fs;}else if(this.style('fill').hasValue()){var fillStyle=this.style('fill');if(fillStyle.value == 'currentColor')fillStyle.value = this.style('color').value;if(fillStyle.value != 'inherit')ctx.fillStyle = fillStyle.value == 'none'?'rgba(0,0,0,0)':fillStyle.value;}if(this.style('fill-opacity').hasValue()){var fillStyle=new svg.Property('fill', ctx.fillStyle);fillStyle = fillStyle.addOpacity(this.style('fill-opacity'));ctx.fillStyle = fillStyle.value;}if(this.style('stroke').isUrlDefinition()){var fs=this.style('stroke').getFillStyleDefinition(this, this.style('stroke-opacity'));if(fs != null)ctx.strokeStyle = fs;}else if(this.style('stroke').hasValue()){var strokeStyle=this.style('stroke');if(strokeStyle.value == 'currentColor')strokeStyle.value = this.style('color').value;if(strokeStyle.value != 'inherit')ctx.strokeStyle = strokeStyle.value == 'none'?'rgba(0,0,0,0)':strokeStyle.value;}if(this.style('stroke-opacity').hasValue()){var strokeStyle=new svg.Property('stroke', ctx.strokeStyle);strokeStyle = strokeStyle.addOpacity(this.style('stroke-opacity'));ctx.strokeStyle = strokeStyle.value;}if(this.style('stroke-width').hasValue()){var newLineWidth=this.style('stroke-width').toPixels();ctx.lineWidth = newLineWidth == 0?0.001:newLineWidth;}if(this.style('stroke-linecap').hasValue())ctx.lineCap = this.style('stroke-linecap').value;if(this.style('stroke-linejoin').hasValue())ctx.lineJoin = this.style('stroke-linejoin').value;if(this.style('stroke-miterlimit').hasValue())ctx.miterLimit = this.style('stroke-miterlimit').value;if(this.style('stroke-dasharray').hasValue() && this.style('stroke-dasharray').value != 'none'){var gaps=svg.ToNumberArray(this.style('stroke-dasharray').value);if(typeof ctx.setLineDash != 'undefined'){ctx.setLineDash(gaps);}else if(typeof ctx.webkitLineDash != 'undefined'){ctx.webkitLineDash = gaps;}else if(typeof ctx.mozDash != 'undefined' && !(gaps.length == 1 && gaps[0] == 0)){ctx.mozDash = gaps;}var offset=this.style('stroke-dashoffset').numValueOrDefault(1);if(typeof ctx.lineDashOffset != 'undefined'){ctx.lineDashOffset = offset;}else if(typeof ctx.webkitLineDashOffset != 'undefined'){ctx.webkitLineDashOffset = offset;}else if(typeof ctx.mozDashOffset != 'undefined'){ctx.mozDashOffset = offset;}}if(typeof ctx.font != 'undefined'){ctx.font = svg.Font.CreateFont(this.style('font-style').value, this.style('font-variant').value, this.style('font-weight').value, this.style('font-size').hasValue()?this.style('font-size').toPixels() + 'px':'', this.style('font-family').value).toString();}if(this.attribute('transform').hasValue()){var transform=new svg.Transform(this.attribute('transform').value);transform.apply(ctx);}if(this.attribute('clip-path', false, true).hasValue()){var clip=this.attribute('clip-path', false, true).getDefinition();if(clip != null)clip.apply(ctx);}if(this.style('opacity').hasValue()){ctx.globalAlpha = this.style('opacity').numValue();}};};svg.Element.RenderedElementBase.prototype = new svg.Element.ElementBase();svg.Element.PathElementBase = function(node){this.base = svg.Element.RenderedElementBase;this.base(node);this.path = function(ctx){if(ctx != null)ctx.beginPath();return new svg.BoundingBox();};this.renderChildren = function(ctx){this.path(ctx);svg.Mouse.checkPath(this, ctx);if(ctx.fillStyle != ''){if(this.style('fill-rule').valueOrDefault('inherit') != 'inherit'){ctx.fill(this.style('fill-rule').value);}else {ctx.fill();}}if(ctx.strokeStyle != '')ctx.stroke();var markers=this.getMarkers();if(markers != null){if(this.style('marker-start').isUrlDefinition()){var marker=this.style('marker-start').getDefinition();marker.render(ctx, markers[0][0], markers[0][1]);}if(this.style('marker-mid').isUrlDefinition()){var marker=this.style('marker-mid').getDefinition();for(var i=1; i < markers.length - 1; i++) {marker.render(ctx, markers[i][0], markers[i][1]);}}if(this.style('marker-end').isUrlDefinition()){var marker=this.style('marker-end').getDefinition();marker.render(ctx, markers[markers.length - 1][0], markers[markers.length - 1][1]);}}};this.getBoundingBox = function(){return this.path();};this.getMarkers = function(){return null;};};svg.Element.PathElementBase.prototype = new svg.Element.RenderedElementBase();svg.Element.svg = function(node){this.base = svg.Element.RenderedElementBase;this.base(node);this.baseClearContext = this.clearContext;this.clearContext = function(ctx){this.baseClearContext(ctx);svg.ViewPort.RemoveCurrent();};this.baseSetContext = this.setContext;this.setContext = function(ctx){ctx.strokeStyle = 'rgba(0,0,0,0)';ctx.lineCap = 'butt';ctx.lineJoin = 'miter';ctx.miterLimit = 4;if(typeof ctx.font != 'undefined' && typeof window.getComputedStyle != 'undefined'){ctx.font = window.getComputedStyle(ctx.canvas).getPropertyValue('font');}this.baseSetContext(ctx);if(!this.attribute('x').hasValue())this.attribute('x', true).value = 0;if(!this.attribute('y').hasValue())this.attribute('y', true).value = 0;ctx.translate(this.attribute('x').toPixels('x'), this.attribute('y').toPixels('y'));var width=svg.ViewPort.width();var height=svg.ViewPort.height();if(!this.attribute('width').hasValue())this.attribute('width', true).value = '100%';if(!this.attribute('height').hasValue())this.attribute('height', true).value = '100%';if(typeof this.root == 'undefined'){width = this.attribute('width').toPixels('x');height = this.attribute('height').toPixels('y');var x=0;var y=0;if(this.attribute('refX').hasValue() && this.attribute('refY').hasValue()){x = -this.attribute('refX').toPixels('x');y = -this.attribute('refY').toPixels('y');}if(this.attribute('overflow').valueOrDefault('hidden') != 'visible'){ctx.beginPath();ctx.moveTo(x, y);ctx.lineTo(width, y);ctx.lineTo(width, height);ctx.lineTo(x, height);ctx.closePath();ctx.clip();}}svg.ViewPort.SetCurrent(width, height);if(this.attribute('viewBox').hasValue()){var viewBox=svg.ToNumberArray(this.attribute('viewBox').value);var minX=viewBox[0];var minY=viewBox[1];width = viewBox[2];height = viewBox[3];svg.AspectRatio(ctx, this.attribute('preserveAspectRatio').value, svg.ViewPort.width(), width, svg.ViewPort.height(), height, minX, minY, this.attribute('refX').value, this.attribute('refY').value);svg.ViewPort.RemoveCurrent();svg.ViewPort.SetCurrent(viewBox[2], viewBox[3]);}};};svg.Element.svg.prototype = new svg.Element.RenderedElementBase();svg.Element.rect = function(node){this.base = svg.Element.PathElementBase;this.base(node);this.path = function(ctx){var x=this.attribute('x').toPixels('x');var y=this.attribute('y').toPixels('y');var width=this.attribute('width').toPixels('x');var height=this.attribute('height').toPixels('y');var rx=this.attribute('rx').toPixels('x');var ry=this.attribute('ry').toPixels('y');if(this.attribute('rx').hasValue() && !this.attribute('ry').hasValue())ry = rx;if(this.attribute('ry').hasValue() && !this.attribute('rx').hasValue())rx = ry;rx = Math.min(rx, width / 2);ry = Math.min(ry, height / 2);if(ctx != null){ctx.beginPath();ctx.moveTo(x + rx, y);ctx.lineTo(x + width - rx, y);ctx.quadraticCurveTo(x + width, y, x + width, y + ry);ctx.lineTo(x + width, y + height - ry);ctx.quadraticCurveTo(x + width, y + height, x + width - rx, y + height);ctx.lineTo(x + rx, y + height);ctx.quadraticCurveTo(x, y + height, x, y + height - ry);ctx.lineTo(x, y + ry);ctx.quadraticCurveTo(x, y, x + rx, y);ctx.closePath();}return new svg.BoundingBox(x, y, x + width, y + height);};};svg.Element.rect.prototype = new svg.Element.PathElementBase();svg.Element.circle = function(node){this.base = svg.Element.PathElementBase;this.base(node);this.path = function(ctx){var cx=this.attribute('cx').toPixels('x');var cy=this.attribute('cy').toPixels('y');var r=this.attribute('r').toPixels();if(ctx != null){ctx.beginPath();ctx.arc(cx, cy, r, 0, Math.PI * 2, true);ctx.closePath();}return new svg.BoundingBox(cx - r, cy - r, cx + r, cy + r);};};svg.Element.circle.prototype = new svg.Element.PathElementBase();svg.Element.ellipse = function(node){this.base = svg.Element.PathElementBase;this.base(node);this.path = function(ctx){var KAPPA=4 * ((Math.sqrt(2) - 1) / 3);var rx=this.attribute('rx').toPixels('x');var ry=this.attribute('ry').toPixels('y');var cx=this.attribute('cx').toPixels('x');var cy=this.attribute('cy').toPixels('y');if(ctx != null){ctx.beginPath();ctx.moveTo(cx, cy - ry);ctx.bezierCurveTo(cx + KAPPA * rx, cy - ry, cx + rx, cy - KAPPA * ry, cx + rx, cy);ctx.bezierCurveTo(cx + rx, cy + KAPPA * ry, cx + KAPPA * rx, cy + ry, cx, cy + ry);ctx.bezierCurveTo(cx - KAPPA * rx, cy + ry, cx - rx, cy + KAPPA * ry, cx - rx, cy);ctx.bezierCurveTo(cx - rx, cy - KAPPA * ry, cx - KAPPA * rx, cy - ry, cx, cy - ry);ctx.closePath();}return new svg.BoundingBox(cx - rx, cy - ry, cx + rx, cy + ry);};};svg.Element.ellipse.prototype = new svg.Element.PathElementBase();svg.Element.line = function(node){this.base = svg.Element.PathElementBase;this.base(node);this.getPoints = function(){return [new svg.Point(this.attribute('x1').toPixels('x'), this.attribute('y1').toPixels('y')), new svg.Point(this.attribute('x2').toPixels('x'), this.attribute('y2').toPixels('y'))];};this.path = function(ctx){var points=this.getPoints();if(ctx != null){ctx.beginPath();ctx.moveTo(points[0].x, points[0].y);ctx.lineTo(points[1].x, points[1].y);}return new svg.BoundingBox(points[0].x, points[0].y, points[1].x, points[1].y);};this.getMarkers = function(){var points=this.getPoints();var a=points[0].angleTo(points[1]);return [[points[0], a], [points[1], a]];};};svg.Element.line.prototype = new svg.Element.PathElementBase();svg.Element.polyline = function(node){this.base = svg.Element.PathElementBase;this.base(node);this.points = svg.CreatePath(this.attribute('points').value);this.path = function(ctx){var bb=new svg.BoundingBox(this.points[0].x, this.points[0].y);if(ctx != null){ctx.beginPath();ctx.moveTo(this.points[0].x, this.points[0].y);}for(var i=1; i < this.points.length; i++) {bb.addPoint(this.points[i].x, this.points[i].y);if(ctx != null)ctx.lineTo(this.points[i].x, this.points[i].y);}return bb;};this.getMarkers = function(){var markers=[];for(var i=0; i < this.points.length - 1; i++) {markers.push([this.points[i], this.points[i].angleTo(this.points[i + 1])]);}markers.push([this.points[this.points.length - 1], markers[markers.length - 1][1]]);return markers;};};svg.Element.polyline.prototype = new svg.Element.PathElementBase();svg.Element.polygon = function(node){this.base = svg.Element.polyline;this.base(node);this.basePath = this.path;this.path = function(ctx){var bb=this.basePath(ctx);if(ctx != null){ctx.lineTo(this.points[0].x, this.points[0].y);ctx.closePath();}return bb;};};svg.Element.polygon.prototype = new svg.Element.polyline();svg.Element.path = function(node){this.base = svg.Element.PathElementBase;this.base(node);var d=this.attribute('d').value;d = d.replace(/,/gm, ' ');for(var i=0; i < 2; i++) d = d.replace(/([MmZzLlHhVvCcSsQqTtAa])([^\s])/gm, '$1 $2');d = d.replace(/([^\s])([MmZzLlHhVvCcSsQqTtAa])/gm, '$1 $2');d = d.replace(/([0-9])([+\-])/gm, '$1 $2');for(var i=0; i < 2; i++) d = d.replace(/(\.[0-9]*)(\.)/gm, '$1 $2');d = d.replace(/([Aa](\s+[0-9]+){3})\s+([01])\s*([01])/gm, '$1 $3 $4 ');d = svg.compressSpaces(d);d = svg.trim(d);this.PathParser = new function(d){this.tokens = d.split(' ');this.reset = function(){this.i = -1;this.command = '';this.previousCommand = '';this.start = new svg.Point(0, 0);this.control = new svg.Point(0, 0);this.current = new svg.Point(0, 0);this.points = [];this.angles = [];};this.isEnd = function(){return this.i >= this.tokens.length - 1;};this.isCommandOrEnd = function(){if(this.isEnd())return true;return this.tokens[this.i + 1].match(/^[A-Za-z]$/) != null;};this.isRelativeCommand = function(){switch(this.command){case 'm':case 'l':case 'h':case 'v':case 'c':case 's':case 'q':case 't':case 'a':case 'z':return true;break;}return false;};this.getToken = function(){this.i++;return this.tokens[this.i];};this.getScalar = function(){return parseFloat(this.getToken());};this.nextCommand = function(){this.previousCommand = this.command;this.command = this.getToken();};this.getPoint = function(){var p=new svg.Point(this.getScalar(), this.getScalar());return this.makeAbsolute(p);};this.getAsControlPoint = function(){var p=this.getPoint();this.control = p;return p;};this.getAsCurrentPoint = function(){var p=this.getPoint();this.current = p;return p;};this.getReflectedControlPoint = function(){if(this.previousCommand.toLowerCase() != 'c' && this.previousCommand.toLowerCase() != 's' && this.previousCommand.toLowerCase() != 'q' && this.previousCommand.toLowerCase() != 't'){return this.current;}var p=new svg.Point(2 * this.current.x - this.control.x, 2 * this.current.y - this.control.y);return p;};this.makeAbsolute = function(p){if(this.isRelativeCommand()){p.x += this.current.x;p.y += this.current.y;}return p;};this.addMarker = function(p, from, priorTo){if(priorTo != null && this.angles.length > 0 && this.angles[this.angles.length - 1] == null){this.angles[this.angles.length - 1] = this.points[this.points.length - 1].angleTo(priorTo);}this.addMarkerAngle(p, from == null?null:from.angleTo(p));};this.addMarkerAngle = function(p, a){this.points.push(p);this.angles.push(a);};this.getMarkerPoints = function(){return this.points;};this.getMarkerAngles = function(){for(var i=0; i < this.angles.length; i++) {if(this.angles[i] == null){for(var j=i + 1; j < this.angles.length; j++) {if(this.angles[j] != null){this.angles[i] = this.angles[j];break;}}}}return this.angles;};}(d);this.path = function(ctx){var pp=this.PathParser;pp.reset();var bb=new svg.BoundingBox();if(ctx != null)ctx.beginPath();while(!pp.isEnd()) {pp.nextCommand();switch(pp.command){case 'M':case 'm':var p=pp.getAsCurrentPoint();pp.addMarker(p);bb.addPoint(p.x, p.y);if(ctx != null)ctx.moveTo(p.x, p.y);pp.start = pp.current;while(!pp.isCommandOrEnd()) {var p=pp.getAsCurrentPoint();pp.addMarker(p, pp.start);bb.addPoint(p.x, p.y);if(ctx != null)ctx.lineTo(p.x, p.y);}break;case 'L':case 'l':while(!pp.isCommandOrEnd()) {var c=pp.current;var p=pp.getAsCurrentPoint();pp.addMarker(p, c);bb.addPoint(p.x, p.y);if(ctx != null)ctx.lineTo(p.x, p.y);}break;case 'H':case 'h':while(!pp.isCommandOrEnd()) {var newP=new svg.Point((pp.isRelativeCommand()?pp.current.x:0) + pp.getScalar(), pp.current.y);pp.addMarker(newP, pp.current);pp.current = newP;bb.addPoint(pp.current.x, pp.current.y);if(ctx != null)ctx.lineTo(pp.current.x, pp.current.y);}break;case 'V':case 'v':while(!pp.isCommandOrEnd()) {var newP=new svg.Point(pp.current.x, (pp.isRelativeCommand()?pp.current.y:0) + pp.getScalar());pp.addMarker(newP, pp.current);pp.current = newP;bb.addPoint(pp.current.x, pp.current.y);if(ctx != null)ctx.lineTo(pp.current.x, pp.current.y);}break;case 'C':case 'c':while(!pp.isCommandOrEnd()) {var curr=pp.current;var p1=pp.getPoint();var cntrl=pp.getAsControlPoint();var cp=pp.getAsCurrentPoint();pp.addMarker(cp, cntrl, p1);bb.addBezierCurve(curr.x, curr.y, p1.x, p1.y, cntrl.x, cntrl.y, cp.x, cp.y);if(ctx != null)ctx.bezierCurveTo(p1.x, p1.y, cntrl.x, cntrl.y, cp.x, cp.y);}break;case 'S':case 's':while(!pp.isCommandOrEnd()) {var curr=pp.current;var p1=pp.getReflectedControlPoint();var cntrl=pp.getAsControlPoint();var cp=pp.getAsCurrentPoint();pp.addMarker(cp, cntrl, p1);bb.addBezierCurve(curr.x, curr.y, p1.x, p1.y, cntrl.x, cntrl.y, cp.x, cp.y);if(ctx != null)ctx.bezierCurveTo(p1.x, p1.y, cntrl.x, cntrl.y, cp.x, cp.y);}break;case 'Q':case 'q':while(!pp.isCommandOrEnd()) {var curr=pp.current;var cntrl=pp.getAsControlPoint();var cp=pp.getAsCurrentPoint();pp.addMarker(cp, cntrl, cntrl);bb.addQuadraticCurve(curr.x, curr.y, cntrl.x, cntrl.y, cp.x, cp.y);if(ctx != null)ctx.quadraticCurveTo(cntrl.x, cntrl.y, cp.x, cp.y);}break;case 'T':case 't':while(!pp.isCommandOrEnd()) {var curr=pp.current;var cntrl=pp.getReflectedControlPoint();pp.control = cntrl;var cp=pp.getAsCurrentPoint();pp.addMarker(cp, cntrl, cntrl);bb.addQuadraticCurve(curr.x, curr.y, cntrl.x, cntrl.y, cp.x, cp.y);if(ctx != null)ctx.quadraticCurveTo(cntrl.x, cntrl.y, cp.x, cp.y);}break;case 'A':case 'a':while(!pp.isCommandOrEnd()) {var curr=pp.current;var rx=pp.getScalar();var ry=pp.getScalar();var xAxisRotation=pp.getScalar() * (Math.PI / 180);var largeArcFlag=pp.getScalar();var sweepFlag=pp.getScalar();var cp=pp.getAsCurrentPoint();var currp=new svg.Point(Math.cos(xAxisRotation) * (curr.x - cp.x) / 2 + Math.sin(xAxisRotation) * (curr.y - cp.y) / 2, -Math.sin(xAxisRotation) * (curr.x - cp.x) / 2 + Math.cos(xAxisRotation) * (curr.y - cp.y) / 2);var l=Math.pow(currp.x, 2) / Math.pow(rx, 2) + Math.pow(currp.y, 2) / Math.pow(ry, 2);if(l > 1){rx *= Math.sqrt(l);ry *= Math.sqrt(l);}var s=(largeArcFlag == sweepFlag?-1:1) * Math.sqrt((Math.pow(rx, 2) * Math.pow(ry, 2) - Math.pow(rx, 2) * Math.pow(currp.y, 2) - Math.pow(ry, 2) * Math.pow(currp.x, 2)) / (Math.pow(rx, 2) * Math.pow(currp.y, 2) + Math.pow(ry, 2) * Math.pow(currp.x, 2)));if(isNaN(s))s = 0;var cpp=new svg.Point(s * rx * currp.y / ry, s * -ry * currp.x / rx);var centp=new svg.Point((curr.x + cp.x) / 2 + Math.cos(xAxisRotation) * cpp.x - Math.sin(xAxisRotation) * cpp.y, (curr.y + cp.y) / 2 + Math.sin(xAxisRotation) * cpp.x + Math.cos(xAxisRotation) * cpp.y);var m=function m(v){return Math.sqrt(Math.pow(v[0], 2) + Math.pow(v[1], 2));};var r=function r(u, v){return (u[0] * v[0] + u[1] * v[1]) / (m(u) * m(v));};var a=function a(u, v){return (u[0] * v[1] < u[1] * v[0]?-1:1) * Math.acos(r(u, v));};var a1=a([1, 0], [(currp.x - cpp.x) / rx, (currp.y - cpp.y) / ry]);var u=[(currp.x - cpp.x) / rx, (currp.y - cpp.y) / ry];var v=[(-currp.x - cpp.x) / rx, (-currp.y - cpp.y) / ry];var ad=a(u, v);if(r(u, v) <= -1)ad = Math.PI;if(r(u, v) >= 1)ad = 0;var dir=1 - sweepFlag?1:-1;var ah=a1 + dir * (ad / 2);var halfWay=new svg.Point(centp.x + rx * Math.cos(ah), centp.y + ry * Math.sin(ah));pp.addMarkerAngle(halfWay, ah - dir * Math.PI / 2);pp.addMarkerAngle(cp, ah - dir * Math.PI);bb.addPoint(cp.x, cp.y);if(ctx != null){var r=rx > ry?rx:ry;var sx=rx > ry?1:rx / ry;var sy=rx > ry?ry / rx:1;ctx.translate(centp.x, centp.y);ctx.rotate(xAxisRotation);ctx.scale(sx, sy);ctx.arc(0, 0, r, a1, a1 + ad, 1 - sweepFlag);ctx.scale(1 / sx, 1 / sy);ctx.rotate(-xAxisRotation);ctx.translate(-centp.x, -centp.y);}}break;case 'Z':case 'z':if(ctx != null)ctx.closePath();pp.current = pp.start;}}return bb;};this.getMarkers = function(){var points=this.PathParser.getMarkerPoints();var angles=this.PathParser.getMarkerAngles();var markers=[];for(var i=0; i < points.length; i++) {markers.push([points[i], angles[i]]);}return markers;};};svg.Element.path.prototype = new svg.Element.PathElementBase();svg.Element.pattern = function(node){this.base = svg.Element.ElementBase;this.base(node);this.createPattern = function(ctx, element){var width=this.attribute('width').toPixels('x', true);var height=this.attribute('height').toPixels('y', true);var tempSvg=new svg.Element.svg();tempSvg.attributes.viewBox = new svg.Property('viewBox', this.attribute('viewBox').value);tempSvg.attributes.width = new svg.Property('width', width + 'px');tempSvg.attributes.height = new svg.Property('height', height + 'px');tempSvg.attributes.transform = new svg.Property('transform', this.attribute('patternTransform').value);tempSvg.children = this.children;var c=document.createElement('canvas');c.width = width;c.height = height;var cctx=c.getContext('2d');if(this.attribute('x').hasValue() && this.attribute('y').hasValue()){cctx.translate(this.attribute('x').toPixels('x', true), this.attribute('y').toPixels('y', true));}for(var x=-1; x <= 1; x++) {for(var y=-1; y <= 1; y++) {cctx.save();cctx.translate(x * c.width, y * c.height);tempSvg.render(cctx);cctx.restore();}}var pattern=ctx.createPattern(c, 'repeat');return pattern;};};svg.Element.pattern.prototype = new svg.Element.ElementBase();svg.Element.marker = function(node){this.base = svg.Element.ElementBase;this.base(node);this.baseRender = this.render;this.render = function(ctx, point, angle){ctx.translate(point.x, point.y);if(this.attribute('orient').valueOrDefault('auto') == 'auto')ctx.rotate(angle);if(this.attribute('markerUnits').valueOrDefault('strokeWidth') == 'strokeWidth')ctx.scale(ctx.lineWidth, ctx.lineWidth);ctx.save();var tempSvg=new svg.Element.svg();tempSvg.attributes.viewBox = new svg.Property('viewBox', this.attribute('viewBox').value);tempSvg.attributes.refX = new svg.Property('refX', this.attribute('refX').value);tempSvg.attributes.refY = new svg.Property('refY', this.attribute('refY').value);tempSvg.attributes.width = new svg.Property('width', this.attribute('markerWidth').value);tempSvg.attributes.height = new svg.Property('height', this.attribute('markerHeight').value);tempSvg.attributes.fill = new svg.Property('fill', this.attribute('fill').valueOrDefault('black'));tempSvg.attributes.stroke = new svg.Property('stroke', this.attribute('stroke').valueOrDefault('none'));tempSvg.children = this.children;tempSvg.render(ctx);ctx.restore();if(this.attribute('markerUnits').valueOrDefault('strokeWidth') == 'strokeWidth')ctx.scale(1 / ctx.lineWidth, 1 / ctx.lineWidth);if(this.attribute('orient').valueOrDefault('auto') == 'auto')ctx.rotate(-angle);ctx.translate(-point.x, -point.y);};};svg.Element.marker.prototype = new svg.Element.ElementBase();svg.Element.defs = function(node){this.base = svg.Element.ElementBase;this.base(node);this.render = function(ctx){};};svg.Element.defs.prototype = new svg.Element.ElementBase();svg.Element.GradientBase = function(node){this.base = svg.Element.ElementBase;this.base(node);this.gradientUnits = this.attribute('gradientUnits').valueOrDefault('objectBoundingBox');this.stops = [];for(var i=0; i < this.children.length; i++) {var child=this.children[i];if(child.type == 'stop')this.stops.push(child);}this.getGradient = function(){};this.createGradient = function(ctx, element, parentOpacityProp){var stopsContainer=this;if(this.getHrefAttribute().hasValue()){stopsContainer = this.getHrefAttribute().getDefinition();}var addParentOpacity=function addParentOpacity(color){if(parentOpacityProp.hasValue()){var p=new svg.Property('color', color);return p.addOpacity(parentOpacityProp).value;}return color;};var g=this.getGradient(ctx, element);if(g == null)return addParentOpacity(stopsContainer.stops[stopsContainer.stops.length - 1].color);for(var i=0; i < stopsContainer.stops.length; i++) {g.addColorStop(stopsContainer.stops[i].offset, addParentOpacity(stopsContainer.stops[i].color));}if(this.attribute('gradientTransform').hasValue()){var rootView=svg.ViewPort.viewPorts[0];var rect=new svg.Element.rect();rect.attributes.x = new svg.Property('x', -svg.MAX_VIRTUAL_PIXELS / 3);rect.attributes.y = new svg.Property('y', -svg.MAX_VIRTUAL_PIXELS / 3);rect.attributes.width = new svg.Property('width', svg.MAX_VIRTUAL_PIXELS);rect.attributes.height = new svg.Property('height', svg.MAX_VIRTUAL_PIXELS);var group=new svg.Element.g();group.attributes.transform = new svg.Property('transform', this.attribute('gradientTransform').value);group.children = [rect];var tempSvg=new svg.Element.svg();tempSvg.attributes.x = new svg.Property('x', 0);tempSvg.attributes.y = new svg.Property('y', 0);tempSvg.attributes.width = new svg.Property('width', rootView.width);tempSvg.attributes.height = new svg.Property('height', rootView.height);tempSvg.children = [group];var c=document.createElement('canvas');c.width = rootView.width;c.height = rootView.height;var tempCtx=c.getContext('2d');tempCtx.fillStyle = g;tempSvg.render(tempCtx);return tempCtx.createPattern(c, 'no-repeat');}return g;};};svg.Element.GradientBase.prototype = new svg.Element.ElementBase();svg.Element.linearGradient = function(node){this.base = svg.Element.GradientBase;this.base(node);this.getGradient = function(ctx, element){var bb=this.gradientUnits == 'objectBoundingBox'?element.getBoundingBox():null;if(!this.attribute('x1').hasValue() && !this.attribute('y1').hasValue() && !this.attribute('x2').hasValue() && !this.attribute('y2').hasValue()){this.attribute('x1', true).value = 0;this.attribute('y1', true).value = 0;this.attribute('x2', true).value = 1;this.attribute('y2', true).value = 0;}var x1=this.gradientUnits == 'objectBoundingBox'?bb.x() + bb.width() * this.attribute('x1').numValue():this.attribute('x1').toPixels('x');var y1=this.gradientUnits == 'objectBoundingBox'?bb.y() + bb.height() * this.attribute('y1').numValue():this.attribute('y1').toPixels('y');var x2=this.gradientUnits == 'objectBoundingBox'?bb.x() + bb.width() * this.attribute('x2').numValue():this.attribute('x2').toPixels('x');var y2=this.gradientUnits == 'objectBoundingBox'?bb.y() + bb.height() * this.attribute('y2').numValue():this.attribute('y2').toPixels('y');if(x1 == x2 && y1 == y2)return null;return ctx.createLinearGradient(x1, y1, x2, y2);};};svg.Element.linearGradient.prototype = new svg.Element.GradientBase();svg.Element.radialGradient = function(node){this.base = svg.Element.GradientBase;this.base(node);this.getGradient = function(ctx, element){var bb=element.getBoundingBox();if(!this.attribute('cx').hasValue())this.attribute('cx', true).value = '50%';if(!this.attribute('cy').hasValue())this.attribute('cy', true).value = '50%';if(!this.attribute('r').hasValue())this.attribute('r', true).value = '50%';var cx=this.gradientUnits == 'objectBoundingBox'?bb.x() + bb.width() * this.attribute('cx').numValue():this.attribute('cx').toPixels('x');var cy=this.gradientUnits == 'objectBoundingBox'?bb.y() + bb.height() * this.attribute('cy').numValue():this.attribute('cy').toPixels('y');var fx=cx;var fy=cy;if(this.attribute('fx').hasValue()){fx = this.gradientUnits == 'objectBoundingBox'?bb.x() + bb.width() * this.attribute('fx').numValue():this.attribute('fx').toPixels('x');}if(this.attribute('fy').hasValue()){fy = this.gradientUnits == 'objectBoundingBox'?bb.y() + bb.height() * this.attribute('fy').numValue():this.attribute('fy').toPixels('y');}var r=this.gradientUnits == 'objectBoundingBox'?(bb.width() + bb.height()) / 2 * this.attribute('r').numValue():this.attribute('r').toPixels();return ctx.createRadialGradient(fx, fy, 0, cx, cy, r);};};svg.Element.radialGradient.prototype = new svg.Element.GradientBase();svg.Element.stop = function(node){this.base = svg.Element.ElementBase;this.base(node);this.offset = this.attribute('offset').numValue();if(this.offset < 0)this.offset = 0;if(this.offset > 1)this.offset = 1;var stopColor=this.style('stop-color', true);if(stopColor.value === '')stopColor.value = '#000';if(this.style('stop-opacity').hasValue())stopColor = stopColor.addOpacity(this.style('stop-opacity'));this.color = stopColor.value;};svg.Element.stop.prototype = new svg.Element.ElementBase();svg.Element.AnimateBase = function(node){this.base = svg.Element.ElementBase;this.base(node);svg.Animations.push(this);this.duration = 0;this.begin = this.attribute('begin').toMilliseconds();this.maxDuration = this.begin + this.attribute('dur').toMilliseconds();this.getProperty = function(){var attributeType=this.attribute('attributeType').value;var attributeName=this.attribute('attributeName').value;if(attributeType == 'CSS'){return this.parent.style(attributeName, true);}return this.parent.attribute(attributeName, true);};this.initialValue = null;this.initialUnits = '';this.removed = false;this.calcValue = function(){return '';};this.update = function(delta){if(this.initialValue == null){this.initialValue = this.getProperty().value;this.initialUnits = this.getProperty().getUnits();}if(this.duration > this.maxDuration){if(this.attribute('repeatCount').value == 'indefinite' || this.attribute('repeatDur').value == 'indefinite'){this.duration = 0;}else if(this.attribute('fill').valueOrDefault('remove') == 'freeze' && !this.frozen){this.frozen = true;this.parent.animationFrozen = true;this.parent.animationFrozenValue = this.getProperty().value;}else if(this.attribute('fill').valueOrDefault('remove') == 'remove' && !this.removed){this.removed = true;this.getProperty().value = this.parent.animationFrozen?this.parent.animationFrozenValue:this.initialValue;return true;}return false;}this.duration = this.duration + delta;var updated=false;if(this.begin < this.duration){var newValue=this.calcValue();if(this.attribute('type').hasValue()){var type=this.attribute('type').value;newValue = type + '(' + newValue + ')';}this.getProperty().value = newValue;updated = true;}return updated;};this.from = this.attribute('from');this.to = this.attribute('to');this.values = this.attribute('values');if(this.values.hasValue())this.values.value = this.values.value.split(';');this.progress = function(){var ret={progress:(this.duration - this.begin) / (this.maxDuration - this.begin)};if(this.values.hasValue()){var p=ret.progress * (this.values.value.length - 1);var lb=Math.floor(p), ub=Math.ceil(p);ret.from = new svg.Property('from', parseFloat(this.values.value[lb]));ret.to = new svg.Property('to', parseFloat(this.values.value[ub]));ret.progress = (p - lb) / (ub - lb);}else {ret.from = this.from;ret.to = this.to;}return ret;};};svg.Element.AnimateBase.prototype = new svg.Element.ElementBase();svg.Element.animate = function(node){this.base = svg.Element.AnimateBase;this.base(node);this.calcValue = function(){var p=this.progress();var newValue=p.from.numValue() + (p.to.numValue() - p.from.numValue()) * p.progress;return newValue + this.initialUnits;};};svg.Element.animate.prototype = new svg.Element.AnimateBase();svg.Element.animateColor = function(node){this.base = svg.Element.AnimateBase;this.base(node);this.calcValue = function(){var p=this.progress();var from=new RGBColor(p.from.value);var to=new RGBColor(p.to.value);if(from.ok && to.ok){var r=from.r + (to.r - from.r) * p.progress;var g=from.g + (to.g - from.g) * p.progress;var b=from.b + (to.b - from.b) * p.progress;return 'rgb(' + parseInt(r, 10) + ',' + parseInt(g, 10) + ',' + parseInt(b, 10) + ')';}return this.attribute('from').value;};};svg.Element.animateColor.prototype = new svg.Element.AnimateBase();svg.Element.animateTransform = function(node){this.base = svg.Element.AnimateBase;this.base(node);this.calcValue = function(){var p=this.progress();var from=svg.ToNumberArray(p.from.value);var to=svg.ToNumberArray(p.to.value);var newValue='';for(var i=0; i < from.length; i++) {newValue += from[i] + (to[i] - from[i]) * p.progress + ' ';}return newValue;};};svg.Element.animateTransform.prototype = new svg.Element.animate();svg.Element.font = function(node){this.base = svg.Element.ElementBase;this.base(node);this.horizAdvX = this.attribute('horiz-adv-x').numValue();this.isRTL = false;this.isArabic = false;this.fontFace = null;this.missingGlyph = null;this.glyphs = [];for(var i=0; i < this.children.length; i++) {var child=this.children[i];if(child.type == 'font-face'){this.fontFace = child;if(child.style('font-family').hasValue()){svg.Definitions[child.style('font-family').value] = this;}}else if(child.type == 'missing-glyph')this.missingGlyph = child;else if(child.type == 'glyph'){if(child.arabicForm != ''){this.isRTL = true;this.isArabic = true;if(typeof this.glyphs[child.unicode] == 'undefined')this.glyphs[child.unicode] = [];this.glyphs[child.unicode][child.arabicForm] = child;}else {this.glyphs[child.unicode] = child;}}}};svg.Element.font.prototype = new svg.Element.ElementBase();svg.Element.fontface = function(node){this.base = svg.Element.ElementBase;this.base(node);this.ascent = this.attribute('ascent').value;this.descent = this.attribute('descent').value;this.unitsPerEm = this.attribute('units-per-em').numValue();};svg.Element.fontface.prototype = new svg.Element.ElementBase();svg.Element.missingglyph = function(node){this.base = svg.Element.path;this.base(node);this.horizAdvX = 0;};svg.Element.missingglyph.prototype = new svg.Element.path();svg.Element.glyph = function(node){this.base = svg.Element.path;this.base(node);this.horizAdvX = this.attribute('horiz-adv-x').numValue();this.unicode = this.attribute('unicode').value;this.arabicForm = this.attribute('arabic-form').value;};svg.Element.glyph.prototype = new svg.Element.path();svg.Element.text = function(node){this.captureTextNodes = true;this.base = svg.Element.RenderedElementBase;this.base(node);this.baseSetContext = this.setContext;this.setContext = function(ctx){this.baseSetContext(ctx);var textBaseline=this.style('dominant-baseline').toTextBaseline();if(textBaseline == null)textBaseline = this.style('alignment-baseline').toTextBaseline();if(textBaseline != null)ctx.textBaseline = textBaseline;};this.getBoundingBox = function(){var x=this.attribute('x').toPixels('x');var y=this.attribute('y').toPixels('y');var fontSize=this.parent.style('font-size').numValueOrDefault(svg.Font.Parse(svg.ctx.font).fontSize);return new svg.BoundingBox(x, y - fontSize, x + Math.floor(fontSize * 2 / 3) * this.children[0].getText().length, y);};this.renderChildren = function(ctx){this.x = this.attribute('x').toPixels('x');this.y = this.attribute('y').toPixels('y');this.x += this.getAnchorDelta(ctx, this, 0);for(var i=0; i < this.children.length; i++) {this.renderChild(ctx, this, i);}};this.getAnchorDelta = function(ctx, parent, startI){var textAnchor=this.style('text-anchor').valueOrDefault('start');if(textAnchor != 'start'){var width=0;for(var i=startI; i < parent.children.length; i++) {var child=parent.children[i];if(i > startI && child.attribute('x').hasValue())break;width += child.measureTextRecursive(ctx);}return -1 * (textAnchor == 'end'?width:width / 2);}return 0;};this.renderChild = function(ctx, parent, i){var child=parent.children[i];if(child.attribute('x').hasValue()){child.x = child.attribute('x').toPixels('x') + this.getAnchorDelta(ctx, parent, i);if(child.attribute('dx').hasValue())child.x += child.attribute('dx').toPixels('x');}else {if(this.attribute('dx').hasValue())this.x += this.attribute('dx').toPixels('x');if(child.attribute('dx').hasValue())this.x += child.attribute('dx').toPixels('x');child.x = this.x;}this.x = child.x + child.measureText(ctx);if(child.attribute('y').hasValue()){child.y = child.attribute('y').toPixels('y');if(child.attribute('dy').hasValue())child.y += child.attribute('dy').toPixels('y');}else {if(this.attribute('dy').hasValue())this.y += this.attribute('dy').toPixels('y');if(child.attribute('dy').hasValue())this.y += child.attribute('dy').toPixels('y');child.y = this.y;}this.y = child.y;child.render(ctx);for(var i=0; i < child.children.length; i++) {this.renderChild(ctx, child, i);}};};svg.Element.text.prototype = new svg.Element.RenderedElementBase();svg.Element.TextElementBase = function(node){this.base = svg.Element.RenderedElementBase;this.base(node);this.getGlyph = function(font, text, i){var c=text[i];var glyph=null;if(font.isArabic){var arabicForm='isolated';if((i == 0 || text[i - 1] == ' ') && i < text.length - 2 && text[i + 1] != ' ')arabicForm = 'terminal';if(i > 0 && text[i - 1] != ' ' && i < text.length - 2 && text[i + 1] != ' ')arabicForm = 'medial';if(i > 0 && text[i - 1] != ' ' && (i == text.length - 1 || text[i + 1] == ' '))arabicForm = 'initial';if(typeof font.glyphs[c] != 'undefined'){glyph = font.glyphs[c][arabicForm];if(glyph == null && font.glyphs[c].type == 'glyph')glyph = font.glyphs[c];}}else {glyph = font.glyphs[c];}if(glyph == null)glyph = font.missingGlyph;return glyph;};this.renderChildren = function(ctx){var customFont=this.parent.style('font-family').getDefinition();if(customFont != null){var fontSize=this.parent.style('font-size').numValueOrDefault(svg.Font.Parse(svg.ctx.font).fontSize);var fontStyle=this.parent.style('font-style').valueOrDefault(svg.Font.Parse(svg.ctx.font).fontStyle);var text=this.getText();if(customFont.isRTL)text = text.split('').reverse().join('');var dx=svg.ToNumberArray(this.parent.attribute('dx').value);for(var i=0; i < text.length; i++) {var glyph=this.getGlyph(customFont, text, i);var scale=fontSize / customFont.fontFace.unitsPerEm;ctx.translate(this.x, this.y);ctx.scale(scale, -scale);var lw=ctx.lineWidth;ctx.lineWidth = ctx.lineWidth * customFont.fontFace.unitsPerEm / fontSize;if(fontStyle == 'italic')ctx.transform(1, 0, 0.4, 1, 0, 0);glyph.render(ctx);if(fontStyle == 'italic')ctx.transform(1, 0, -0.4, 1, 0, 0);ctx.lineWidth = lw;ctx.scale(1 / scale, -1 / scale);ctx.translate(-this.x, -this.y);this.x += fontSize * (glyph.horizAdvX || customFont.horizAdvX) / customFont.fontFace.unitsPerEm;if(typeof dx[i] != 'undefined' && !isNaN(dx[i])){this.x += dx[i];}}return;}if(ctx.fillStyle != '')ctx.fillText(svg.compressSpaces(this.getText()), this.x, this.y);if(ctx.strokeStyle != '')ctx.strokeText(svg.compressSpaces(this.getText()), this.x, this.y);};this.getText = function(){};this.measureTextRecursive = function(ctx){var width=this.measureText(ctx);for(var i=0; i < this.children.length; i++) {width += this.children[i].measureTextRecursive(ctx);}return width;};this.measureText = function(ctx){var customFont=this.parent.style('font-family').getDefinition();if(customFont != null){var fontSize=this.parent.style('font-size').numValueOrDefault(svg.Font.Parse(svg.ctx.font).fontSize);var measure=0;var text=this.getText();if(customFont.isRTL)text = text.split('').reverse().join('');var dx=svg.ToNumberArray(this.parent.attribute('dx').value);for(var i=0; i < text.length; i++) {var glyph=this.getGlyph(customFont, text, i);measure += (glyph.horizAdvX || customFont.horizAdvX) * fontSize / customFont.fontFace.unitsPerEm;if(typeof dx[i] != 'undefined' && !isNaN(dx[i])){measure += dx[i];}}return measure;}var textToMeasure=svg.compressSpaces(this.getText());if(!ctx.measureText)return textToMeasure.length * 10;ctx.save();this.setContext(ctx);var width=ctx.measureText(textToMeasure).width;ctx.restore();return width;};};svg.Element.TextElementBase.prototype = new svg.Element.RenderedElementBase();svg.Element.tspan = function(node){this.captureTextNodes = true;this.base = svg.Element.TextElementBase;this.base(node);if(node.nodeName == 'tspan')this.text = '';else this.text = node.value || node.text || node.textContent || '';this.getText = function(){if(this.children.length > 0){return '';}return this.text;};};svg.Element.tspan.prototype = new svg.Element.TextElementBase();svg.Element.tref = function(node){this.base = svg.Element.TextElementBase;this.base(node);this.getText = function(){var element=this.getHrefAttribute().getDefinition();if(element != null)return element.children[0].getText();};};svg.Element.tref.prototype = new svg.Element.TextElementBase();svg.Element.a = function(node){this.base = svg.Element.TextElementBase;this.base(node);this.hasText = node.childNodes.length > 0;for(var i=0; i < node.childNodes.length; i++) {if(node.childNodes[i].nodeType != 3)this.hasText = false;}this.text = this.hasText?node.childNodes[0].value:'';this.getText = function(){return this.text;};this.baseRenderChildren = this.renderChildren;this.renderChildren = function(ctx){if(this.hasText){this.baseRenderChildren(ctx);var fontSize=new svg.Property('fontSize', svg.Font.Parse(svg.ctx.font).fontSize);svg.Mouse.checkBoundingBox(this, new svg.BoundingBox(this.x, this.y - fontSize.toPixels('y'), this.x + this.measureText(ctx), this.y));}else if(this.children.length > 0){var g=new svg.Element.g();g.children = this.children;g.parent = this;g.render(ctx);}};this.onclick = function(){window.open(this.getHrefAttribute().value);};this.onmousemove = function(){svg.ctx.canvas.style.cursor = 'pointer';};};svg.Element.a.prototype = new svg.Element.TextElementBase();svg.Element.image = function(node){this.base = svg.Element.RenderedElementBase;this.base(node);var href=this.getHrefAttribute().value;if(href == ''){return;}var isSvg=href.match(/\.svg$/);svg.Images.push(this);this.loaded = false;if(!isSvg){this.img = document.createElement('img');if(svg.opts.useCORS == true){this.img.crossOrigin = 'Anonymous';}var self=this;this.img.onload = function(){self.loaded = true;};this.img.onerror = function(){svg.log('ERROR: image "' + href + '" not found');self.loaded = true;};this.img.src = href;}else {this.img = svg.ajax(href);this.loaded = true;}this.renderChildren = function(ctx){var x=this.attribute('x').toPixels('x');var y=this.attribute('y').toPixels('y');var width=this.attribute('width').toPixels('x');var height=this.attribute('height').toPixels('y');if(width == 0 || height == 0)return;ctx.save();if(isSvg){ctx.drawSvg(this.img, x, y, width, height);}else {ctx.translate(x, y);svg.AspectRatio(ctx, this.attribute('preserveAspectRatio').value, width, this.img.width, height, this.img.height, 0, 0);ctx.drawImage(this.img, 0, 0);}ctx.restore();};this.getBoundingBox = function(){var x=this.attribute('x').toPixels('x');var y=this.attribute('y').toPixels('y');var width=this.attribute('width').toPixels('x');var height=this.attribute('height').toPixels('y');return new svg.BoundingBox(x, y, x + width, y + height);};};svg.Element.image.prototype = new svg.Element.RenderedElementBase();svg.Element.g = function(node){this.base = svg.Element.RenderedElementBase;this.base(node);this.getBoundingBox = function(){var bb=new svg.BoundingBox();for(var i=0; i < this.children.length; i++) {bb.addBoundingBox(this.children[i].getBoundingBox());}return bb;};};svg.Element.g.prototype = new svg.Element.RenderedElementBase();svg.Element.symbol = function(node){this.base = svg.Element.RenderedElementBase;this.base(node);this.render = function(ctx){};};svg.Element.symbol.prototype = new svg.Element.RenderedElementBase();svg.Element.style = function(node){this.base = svg.Element.ElementBase;this.base(node);var css='';for(var i=0; i < node.childNodes.length; i++) {css += node.childNodes[i].data;}css = css.replace(/(\/\*([^*]|[\r\n]|(\*+([^*\/]|[\r\n])))*\*+\/)|(^[\s]*\/\/.*)/gm, '');css = svg.compressSpaces(css);var cssDefs=css.split('}');for(var i=0; i < cssDefs.length; i++) {if(svg.trim(cssDefs[i]) != ''){var cssDef=cssDefs[i].split('{');var cssClasses=cssDef[0].split(',');var cssProps=cssDef[1].split(';');for(var j=0; j < cssClasses.length; j++) {var cssClass=svg.trim(cssClasses[j]);if(cssClass != ''){var props={};for(var k=0; k < cssProps.length; k++) {var prop=cssProps[k].indexOf(':');var name=cssProps[k].substr(0, prop);var value=cssProps[k].substr(prop + 1, cssProps[k].length - prop);if(name != null && value != null){props[svg.trim(name)] = new svg.Property(svg.trim(name), svg.trim(value));}}svg.Styles[cssClass] = props;svg.StylesSpecificity[cssClass] = getSelectorSpecificity(cssClass);if(cssClass == '@font-face'){var fontFamily=props['font-family'].value.replace(/"/g, '');var srcs=props.src.value.split(',');for(var s=0; s < srcs.length; s++) {if(srcs[s].indexOf('format("svg")') > 0){var urlStart=srcs[s].indexOf('url');var urlEnd=srcs[s].indexOf(')', urlStart);var url=srcs[s].substr(urlStart + 5, urlEnd - urlStart - 6);var doc=svg.parseXml(svg.ajax(url));var fonts=doc.getElementsByTagName('font');for(var f=0; f < fonts.length; f++) {var font=svg.CreateElement(fonts[f]);svg.Definitions[fontFamily] = font;}}}}}}}}};svg.Element.style.prototype = new svg.Element.ElementBase();svg.Element.use = function(node){this.base = svg.Element.RenderedElementBase;this.base(node);this.baseSetContext = this.setContext;this.setContext = function(ctx){this.baseSetContext(ctx);if(this.attribute('x').hasValue())ctx.translate(this.attribute('x').toPixels('x'), 0);if(this.attribute('y').hasValue())ctx.translate(0, this.attribute('y').toPixels('y'));};var element=this.getHrefAttribute().getDefinition();this.path = function(ctx){if(element != null)element.path(ctx);};this.getBoundingBox = function(){if(element != null)return element.getBoundingBox();};this.renderChildren = function(ctx){if(element != null){var tempSvg=element;if(element.type == 'symbol'){tempSvg = new svg.Element.svg();tempSvg.type = 'svg';tempSvg.attributes.viewBox = new svg.Property('viewBox', element.attribute('viewBox').value);tempSvg.attributes.preserveAspectRatio = new svg.Property('preserveAspectRatio', element.attribute('preserveAspectRatio').value);tempSvg.attributes.overflow = new svg.Property('overflow', element.attribute('overflow').value);tempSvg.children = element.children;}if(tempSvg.type == 'svg'){if(this.attribute('width').hasValue())tempSvg.attributes.width = new svg.Property('width', this.attribute('width').value);if(this.attribute('height').hasValue())tempSvg.attributes.height = new svg.Property('height', this.attribute('height').value);}var oldParent=tempSvg.parent;tempSvg.parent = null;tempSvg.render(ctx);tempSvg.parent = oldParent;}};};svg.Element.use.prototype = new svg.Element.RenderedElementBase();svg.Element.mask = function(node){this.base = svg.Element.ElementBase;this.base(node);this.apply = function(ctx, element){var x=this.attribute('x').toPixels('x');var y=this.attribute('y').toPixels('y');var width=this.attribute('width').toPixels('x');var height=this.attribute('height').toPixels('y');if(width == 0 && height == 0){var bb=new svg.BoundingBox();for(var i=0; i < this.children.length; i++) {bb.addBoundingBox(this.children[i].getBoundingBox());}var x=Math.floor(bb.x1);var y=Math.floor(bb.y1);var width=Math.floor(bb.width());var height=Math.floor(bb.height());}var mask=element.attribute('mask').value;element.attribute('mask').value = '';var cMask=document.createElement('canvas');cMask.width = x + width;cMask.height = y + height;var maskCtx=cMask.getContext('2d');this.renderChildren(maskCtx);var c=document.createElement('canvas');c.width = x + width;c.height = y + height;var tempCtx=c.getContext('2d');element.render(tempCtx);tempCtx.globalCompositeOperation = 'destination-in';tempCtx.fillStyle = maskCtx.createPattern(cMask, 'no-repeat');tempCtx.fillRect(0, 0, x + width, y + height);ctx.fillStyle = tempCtx.createPattern(c, 'no-repeat');ctx.fillRect(0, 0, x + width, y + height);element.attribute('mask').value = mask;};this.render = function(ctx){};};svg.Element.mask.prototype = new svg.Element.ElementBase();svg.Element.clipPath = function(node){this.base = svg.Element.ElementBase;this.base(node);this.apply = function(ctx){var oldBeginPath=CanvasRenderingContext2D.prototype.beginPath;CanvasRenderingContext2D.prototype.beginPath = function(){};var oldClosePath=CanvasRenderingContext2D.prototype.closePath;CanvasRenderingContext2D.prototype.closePath = function(){};oldBeginPath.call(ctx);for(var i=0; i < this.children.length; i++) {var child=this.children[i];if(typeof child.path != 'undefined'){var transform=null;if(child.attribute('transform').hasValue()){transform = new svg.Transform(child.attribute('transform').value);transform.apply(ctx);}child.path(ctx);CanvasRenderingContext2D.prototype.closePath = oldClosePath;if(transform){transform.unapply(ctx);}}}oldClosePath.call(ctx);ctx.clip();CanvasRenderingContext2D.prototype.beginPath = oldBeginPath;CanvasRenderingContext2D.prototype.closePath = oldClosePath;};this.render = function(ctx){};};svg.Element.clipPath.prototype = new svg.Element.ElementBase();svg.Element.filter = function(node){this.base = svg.Element.ElementBase;this.base(node);this.apply = function(ctx, element){var bb=element.getBoundingBox();var x=Math.floor(bb.x1);var y=Math.floor(bb.y1);var width=Math.floor(bb.width());var height=Math.floor(bb.height());var filter=element.style('filter').value;element.style('filter').value = '';var px=0, py=0;for(var i=0; i < this.children.length; i++) {var efd=this.children[i].extraFilterDistance || 0;px = Math.max(px, efd);py = Math.max(py, efd);}var c=document.createElement('canvas');c.width = width + 2 * px;c.height = height + 2 * py;var tempCtx=c.getContext('2d');tempCtx.translate(-x + px, -y + py);element.render(tempCtx);for(var i=0; i < this.children.length; i++) {this.children[i].apply(tempCtx, 0, 0, width + 2 * px, height + 2 * py);}ctx.drawImage(c, 0, 0, width + 2 * px, height + 2 * py, x - px, y - py, width + 2 * px, height + 2 * py);element.style('filter', true).value = filter;};this.render = function(ctx){};};svg.Element.filter.prototype = new svg.Element.ElementBase();svg.Element.feMorphology = function(node){this.base = svg.Element.ElementBase;this.base(node);this.apply = function(ctx, x, y, width, height){};};svg.Element.feMorphology.prototype = new svg.Element.ElementBase();svg.Element.feComposite = function(node){this.base = svg.Element.ElementBase;this.base(node);this.apply = function(ctx, x, y, width, height){};};svg.Element.feComposite.prototype = new svg.Element.ElementBase();svg.Element.feColorMatrix = function(node){this.base = svg.Element.ElementBase;this.base(node);var matrix=svg.ToNumberArray(this.attribute('values').value);switch(this.attribute('type').valueOrDefault('matrix')){case 'saturate':var s=matrix[0];matrix = [0.213 + 0.787 * s, 0.715 - 0.715 * s, 0.072 - 0.072 * s, 0, 0, 0.213 - 0.213 * s, 0.715 + 0.285 * s, 0.072 - 0.072 * s, 0, 0, 0.213 - 0.213 * s, 0.715 - 0.715 * s, 0.072 + 0.928 * s, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1];break;case 'hueRotate':var a=matrix[0] * Math.PI / 180;var c=function c(m1, m2, m3){return m1 + Math.cos(a) * m2 + Math.sin(a) * m3;};matrix = [c(0.213, 0.787, -0.213), c(0.715, -0.715, -0.715), c(0.072, -0.072, 0.928), 0, 0, c(0.213, -0.213, 0.143), c(0.715, 0.285, 0.14), c(0.072, -0.072, -0.283), 0, 0, c(0.213, -0.213, -0.787), c(0.715, -0.715, 0.715), c(0.072, 0.928, 0.072), 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1];break;case 'luminanceToAlpha':matrix = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.2125, 0.7154, 0.0721, 0, 0, 0, 0, 0, 0, 1];break;}function imGet(img, x, y, width, height, rgba){return img[y * width * 4 + x * 4 + rgba];}function imSet(img, x, y, width, height, rgba, val){img[y * width * 4 + x * 4 + rgba] = val;}function m(i, v){var mi=matrix[i];return mi * (mi < 0?v - 255:v);}this.apply = function(ctx, x, y, width, height){var srcData=ctx.getImageData(0, 0, width, height);for(var y=0; y < height; y++) {for(var x=0; x < width; x++) {var r=imGet(srcData.data, x, y, width, height, 0);var g=imGet(srcData.data, x, y, width, height, 1);var b=imGet(srcData.data, x, y, width, height, 2);var a=imGet(srcData.data, x, y, width, height, 3);imSet(srcData.data, x, y, width, height, 0, m(0, r) + m(1, g) + m(2, b) + m(3, a) + m(4, 1));imSet(srcData.data, x, y, width, height, 1, m(5, r) + m(6, g) + m(7, b) + m(8, a) + m(9, 1));imSet(srcData.data, x, y, width, height, 2, m(10, r) + m(11, g) + m(12, b) + m(13, a) + m(14, 1));imSet(srcData.data, x, y, width, height, 3, m(15, r) + m(16, g) + m(17, b) + m(18, a) + m(19, 1));}}ctx.clearRect(0, 0, width, height);ctx.putImageData(srcData, 0, 0);};};svg.Element.feColorMatrix.prototype = new svg.Element.ElementBase();svg.Element.feGaussianBlur = function(node){this.base = svg.Element.ElementBase;this.base(node);this.blurRadius = Math.floor(this.attribute('stdDeviation').numValue());this.extraFilterDistance = this.blurRadius;this.apply = function(ctx, x, y, width, height){if(typeof stackBlurCanvasRGBA == 'undefined'){svg.log('ERROR: StackBlur.js must be included for blur to work');return;}ctx.canvas.id = svg.UniqueId();ctx.canvas.style.display = 'none';document.body.appendChild(ctx.canvas);stackBlurCanvasRGBA(ctx.canvas.id, x, y, width, height, this.blurRadius);document.body.removeChild(ctx.canvas);};};svg.Element.feGaussianBlur.prototype = new svg.Element.ElementBase();svg.Element.title = function(node){};svg.Element.title.prototype = new svg.Element.ElementBase();svg.Element.desc = function(node){};svg.Element.desc.prototype = new svg.Element.ElementBase();svg.Element.MISSING = function(node){svg.log('ERROR: Element \'' + node.nodeName + '\' not yet implemented.');};svg.Element.MISSING.prototype = new svg.Element.ElementBase();svg.CreateElement = function(node){var className=node.nodeName.replace(/^[^:]+:/, '');className = className.replace(/\-/g, '');var e=null;if(typeof svg.Element[className] != 'undefined'){e = new svg.Element[className](node);}else {e = new svg.Element.MISSING(node);}e.type = node.nodeName;return e;};svg.load = function(ctx, url){svg.loadXml(ctx, svg.ajax(url));};svg.loadXml = function(ctx, xml){svg.loadXmlDoc(ctx, svg.parseXml(xml));};svg.loadXmlDoc = function(ctx, dom){svg.init(ctx);var mapXY=function mapXY(p){var e=ctx.canvas;while(e) {p.x -= e.offsetLeft;p.y -= e.offsetTop;e = e.offsetParent;}if(window.scrollX)p.x += window.scrollX;if(window.scrollY)p.y += window.scrollY;return p;};if(svg.opts.ignoreMouse != true){ctx.canvas.onclick = function(e){var p=mapXY(new svg.Point(e != null?e.clientX:event.clientX, e != null?e.clientY:event.clientY));svg.Mouse.onclick(p.x, p.y);};ctx.canvas.onmousemove = function(e){var p=mapXY(new svg.Point(e != null?e.clientX:event.clientX, e != null?e.clientY:event.clientY));svg.Mouse.onmousemove(p.x, p.y);};}var e=svg.CreateElement(dom.documentElement);e.root = true;e.addStylesFromStyleDefinition();var isFirstRender=true;var draw=function draw(){svg.ViewPort.Clear();if(ctx.canvas.parentNode)svg.ViewPort.SetCurrent(ctx.canvas.parentNode.clientWidth, ctx.canvas.parentNode.clientHeight);if(svg.opts.ignoreDimensions != true){if(e.style('width').hasValue()){ctx.canvas.width = e.style('width').toPixels('x');ctx.canvas.style.width = ctx.canvas.width + 'px';}if(e.style('height').hasValue()){ctx.canvas.height = e.style('height').toPixels('y');ctx.canvas.style.height = ctx.canvas.height + 'px';}}var cWidth=ctx.canvas.clientWidth || ctx.canvas.width;var cHeight=ctx.canvas.clientHeight || ctx.canvas.height;if(svg.opts.ignoreDimensions == true && e.style('width').hasValue() && e.style('height').hasValue()){cWidth = e.style('width').toPixels('x');cHeight = e.style('height').toPixels('y');}svg.ViewPort.SetCurrent(cWidth, cHeight);if(svg.opts.offsetX != null)e.attribute('x', true).value = svg.opts.offsetX;if(svg.opts.offsetY != null)e.attribute('y', true).value = svg.opts.offsetY;if(svg.opts.scaleWidth != null || svg.opts.scaleHeight != null){var xRatio=null, yRatio=null, viewBox=svg.ToNumberArray(e.attribute('viewBox').value);if(svg.opts.scaleWidth != null){if(e.attribute('width').hasValue())xRatio = e.attribute('width').toPixels('x') / svg.opts.scaleWidth;else if(!isNaN(viewBox[2]))xRatio = viewBox[2] / svg.opts.scaleWidth;}if(svg.opts.scaleHeight != null){if(e.attribute('height').hasValue())yRatio = e.attribute('height').toPixels('y') / svg.opts.scaleHeight;else if(!isNaN(viewBox[3]))yRatio = viewBox[3] / svg.opts.scaleHeight;}if(xRatio == null){xRatio = yRatio;}if(yRatio == null){yRatio = xRatio;}e.attribute('width', true).value = svg.opts.scaleWidth;e.attribute('height', true).value = svg.opts.scaleHeight;e.attribute('transform', true).value += ' scale(' + 1 / xRatio + ',' + 1 / yRatio + ')';}if(svg.opts.ignoreClear != true){ctx.clearRect(0, 0, cWidth, cHeight);}e.render(ctx);if(isFirstRender){isFirstRender = false;if(typeof svg.opts.renderCallback == 'function')svg.opts.renderCallback(dom);}};var waitingForImages=true;if(svg.ImagesLoaded()){waitingForImages = false;draw();}svg.intervalID = setInterval(function(){var needUpdate=false;if(waitingForImages && svg.ImagesLoaded()){waitingForImages = false;needUpdate = true;}if(svg.opts.ignoreMouse != true){needUpdate = needUpdate | svg.Mouse.hasEvents();}if(svg.opts.ignoreAnimation != true){for(var i=0; i < svg.Animations.length; i++) {needUpdate = needUpdate | svg.Animations[i].update(1000 / svg.FRAMERATE);}}if(typeof svg.opts.forceRedraw == 'function'){if(svg.opts.forceRedraw() == true)needUpdate = true;}if(needUpdate){draw();svg.Mouse.runEvents();}}, 1000 / svg.FRAMERATE);};svg.stop = function(){if(svg.intervalID){clearInterval(svg.intervalID);}};svg.Mouse = new function(){this.events = [];this.hasEvents = function(){return this.events.length != 0;};this.onclick = function(x, y){this.events.push({type:'onclick', x:x, y:y, run:function run(e){if(e.onclick)e.onclick();}});};this.onmousemove = function(x, y){this.events.push({type:'onmousemove', x:x, y:y, run:function run(e){if(e.onmousemove)e.onmousemove();}});};this.eventElements = [];this.checkPath = function(element, ctx){for(var i=0; i < this.events.length; i++) {var e=this.events[i];if(ctx.isPointInPath && ctx.isPointInPath(e.x, e.y))this.eventElements[i] = element;}};this.checkBoundingBox = function(element, bb){for(var i=0; i < this.events.length; i++) {var e=this.events[i];if(bb.isPointInBox(e.x, e.y))this.eventElements[i] = element;}};this.runEvents = function(){svg.ctx.canvas.style.cursor = '';for(var i=0; i < this.events.length; i++) {var e=this.events[i];var element=this.eventElements[i];while(element) {e.run(element);element = element.parent;}}this.events = [];this.eventElements = [];};}();return svg;}}).apply(window, []);if(typeof CanvasRenderingContext2D != 'undefined'){CanvasRenderingContext2D.prototype.drawSvg = function(s, dx, dy, dw, dh){canvg(this.canvas, s, {ignoreMouse:true, ignoreAnimation:true, ignoreDimensions:true, ignoreClear:true, offsetX:dx, offsetY:dy, scaleWidth:dw, scaleHeight:dh});};}

},{}],11:[function(require,module,exports){
/**
 * A class to parse color values
 * @author Stoyan Stefanov <sstoo@gmail.com>
 * @link   http://www.phpied.com/rgb-color-parser-in-javascript/
 * @license Use it if you like it
 */
'use strict';

function RGBColor(color_string) {
    this.ok = false;

    // strip any leading #
    if (color_string.charAt(0) == '#') {
        // remove # if any
        color_string = color_string.substr(1, 6);
    }

    color_string = color_string.replace(/ /g, '');
    color_string = color_string.toLowerCase();

    // before getting into regexps, try simple matches
    // and overwrite the input
    var simple_colors = {
        aliceblue: 'f0f8ff',
        antiquewhite: 'faebd7',
        aqua: '00ffff',
        aquamarine: '7fffd4',
        azure: 'f0ffff',
        beige: 'f5f5dc',
        bisque: 'ffe4c4',
        black: '000000',
        blanchedalmond: 'ffebcd',
        blue: '0000ff',
        blueviolet: '8a2be2',
        brown: 'a52a2a',
        burlywood: 'deb887',
        cadetblue: '5f9ea0',
        chartreuse: '7fff00',
        chocolate: 'd2691e',
        coral: 'ff7f50',
        cornflowerblue: '6495ed',
        cornsilk: 'fff8dc',
        crimson: 'dc143c',
        cyan: '00ffff',
        darkblue: '00008b',
        darkcyan: '008b8b',
        darkgoldenrod: 'b8860b',
        darkgray: 'a9a9a9',
        darkgreen: '006400',
        darkkhaki: 'bdb76b',
        darkmagenta: '8b008b',
        darkolivegreen: '556b2f',
        darkorange: 'ff8c00',
        darkorchid: '9932cc',
        darkred: '8b0000',
        darksalmon: 'e9967a',
        darkseagreen: '8fbc8f',
        darkslateblue: '483d8b',
        darkslategray: '2f4f4f',
        darkturquoise: '00ced1',
        darkviolet: '9400d3',
        deeppink: 'ff1493',
        deepskyblue: '00bfff',
        dimgray: '696969',
        dodgerblue: '1e90ff',
        feldspar: 'd19275',
        firebrick: 'b22222',
        floralwhite: 'fffaf0',
        forestgreen: '228b22',
        fuchsia: 'ff00ff',
        gainsboro: 'dcdcdc',
        ghostwhite: 'f8f8ff',
        gold: 'ffd700',
        goldenrod: 'daa520',
        gray: '808080',
        green: '008000',
        greenyellow: 'adff2f',
        honeydew: 'f0fff0',
        hotpink: 'ff69b4',
        indianred: 'cd5c5c',
        indigo: '4b0082',
        ivory: 'fffff0',
        khaki: 'f0e68c',
        lavender: 'e6e6fa',
        lavenderblush: 'fff0f5',
        lawngreen: '7cfc00',
        lemonchiffon: 'fffacd',
        lightblue: 'add8e6',
        lightcoral: 'f08080',
        lightcyan: 'e0ffff',
        lightgoldenrodyellow: 'fafad2',
        lightgrey: 'd3d3d3',
        lightgreen: '90ee90',
        lightpink: 'ffb6c1',
        lightsalmon: 'ffa07a',
        lightseagreen: '20b2aa',
        lightskyblue: '87cefa',
        lightslateblue: '8470ff',
        lightslategray: '778899',
        lightsteelblue: 'b0c4de',
        lightyellow: 'ffffe0',
        lime: '00ff00',
        limegreen: '32cd32',
        linen: 'faf0e6',
        magenta: 'ff00ff',
        maroon: '800000',
        mediumaquamarine: '66cdaa',
        mediumblue: '0000cd',
        mediumorchid: 'ba55d3',
        mediumpurple: '9370d8',
        mediumseagreen: '3cb371',
        mediumslateblue: '7b68ee',
        mediumspringgreen: '00fa9a',
        mediumturquoise: '48d1cc',
        mediumvioletred: 'c71585',
        midnightblue: '191970',
        mintcream: 'f5fffa',
        mistyrose: 'ffe4e1',
        moccasin: 'ffe4b5',
        navajowhite: 'ffdead',
        navy: '000080',
        oldlace: 'fdf5e6',
        olive: '808000',
        olivedrab: '6b8e23',
        orange: 'ffa500',
        orangered: 'ff4500',
        orchid: 'da70d6',
        palegoldenrod: 'eee8aa',
        palegreen: '98fb98',
        paleturquoise: 'afeeee',
        palevioletred: 'd87093',
        papayawhip: 'ffefd5',
        peachpuff: 'ffdab9',
        peru: 'cd853f',
        pink: 'ffc0cb',
        plum: 'dda0dd',
        powderblue: 'b0e0e6',
        purple: '800080',
        red: 'ff0000',
        rosybrown: 'bc8f8f',
        royalblue: '4169e1',
        saddlebrown: '8b4513',
        salmon: 'fa8072',
        sandybrown: 'f4a460',
        seagreen: '2e8b57',
        seashell: 'fff5ee',
        sienna: 'a0522d',
        silver: 'c0c0c0',
        skyblue: '87ceeb',
        slateblue: '6a5acd',
        slategray: '708090',
        snow: 'fffafa',
        springgreen: '00ff7f',
        steelblue: '4682b4',
        tan: 'd2b48c',
        teal: '008080',
        thistle: 'd8bfd8',
        tomato: 'ff6347',
        turquoise: '40e0d0',
        violet: 'ee82ee',
        violetred: 'd02090',
        wheat: 'f5deb3',
        white: 'ffffff',
        whitesmoke: 'f5f5f5',
        yellow: 'ffff00',
        yellowgreen: '9acd32'
    };
    for (var key in simple_colors) {
        if (color_string == key) {
            color_string = simple_colors[key];
        }
    }
    // emd of simple type-in colors

    // array of color definition objects
    var color_defs = [{
        re: /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,
        example: ['rgb(123, 234, 45)', 'rgb(255,234,245)'],
        process: function process(bits) {
            return [parseInt(bits[1]), parseInt(bits[2]), parseInt(bits[3])];
        }
    }, {
        re: /^(\w{2})(\w{2})(\w{2})$/,
        example: ['#00ff00', '336699'],
        process: function process(bits) {
            return [parseInt(bits[1], 16), parseInt(bits[2], 16), parseInt(bits[3], 16)];
        }
    }, {
        re: /^(\w{1})(\w{1})(\w{1})$/,
        example: ['#fb0', 'f0f'],
        process: function process(bits) {
            return [parseInt(bits[1] + bits[1], 16), parseInt(bits[2] + bits[2], 16), parseInt(bits[3] + bits[3], 16)];
        }
    }];

    // search through the definitions to find a match
    for (var i = 0; i < color_defs.length; i++) {
        var re = color_defs[i].re;
        var processor = color_defs[i].process;
        var bits = re.exec(color_string);
        if (bits) {
            channels = processor(bits);
            this.r = channels[0];
            this.g = channels[1];
            this.b = channels[2];
            this.ok = true;
        }
    }

    // validate/cleanup values
    this.r = this.r < 0 || isNaN(this.r) ? 0 : this.r > 255 ? 255 : this.r;
    this.g = this.g < 0 || isNaN(this.g) ? 0 : this.g > 255 ? 255 : this.g;
    this.b = this.b < 0 || isNaN(this.b) ? 0 : this.b > 255 ? 255 : this.b;

    // some getters
    this.toRGB = function () {
        return 'rgb(' + this.r + ', ' + this.g + ', ' + this.b + ')';
    };
    this.toHex = function () {
        var r = this.r.toString(16);
        var g = this.g.toString(16);
        var b = this.b.toString(16);
        if (r.length == 1) r = '0' + r;
        if (g.length == 1) g = '0' + g;
        if (b.length == 1) b = '0' + b;
        return '#' + r + g + b;
    };

    // help
    this.getHelpXML = function () {

        var examples = new Array();
        // add regexps
        for (var i = 0; i < color_defs.length; i++) {
            var example = color_defs[i].example;
            for (var j = 0; j < example.length; j++) {
                examples[examples.length] = example[j];
            }
        }
        // add type-in colors
        for (var sc in simple_colors) {
            examples[examples.length] = sc;
        }

        var xml = document.createElement('ul');
        xml.setAttribute('id', 'rgbcolor-examples');
        for (var i = 0; i < examples.length; i++) {
            try {
                var list_item = document.createElement('li');
                var list_color = new RGBColor(examples[i]);
                var example_div = document.createElement('div');
                example_div.style.cssText = 'margin: 3px; ' + 'border: 1px solid black; ' + 'background:' + list_color.toHex() + '; ' + 'color:' + list_color.toHex();
                example_div.appendChild(document.createTextNode('test'));
                var list_item_value = document.createTextNode(' ' + examples[i] + ' -> ' + list_color.toRGB() + ' -> ' + list_color.toHex());
                list_item.appendChild(example_div);
                list_item.appendChild(list_item_value);
                xml.appendChild(list_item);
            } catch (e) {}
        }
        return xml;
    };
}

},{}],12:[function(require,module,exports){
// svg.export.js 0.1.1 - Copyright (c) 2014 Wout Fierens - Licensed under the MIT license
'use strict';

;(function () {

    // Add export method to SVG.Element
    SVG.extend(SVG.Element, {
        // Build node string
        exportSvg: function exportSvg(options, level) {
            var i,
                il,
                width,
                height,
                well,
                clone,
                name = this.node.nodeName,
                node = '';

            /* ensure options */
            options = options || {};

            if (options.exclude == null || !options.exclude.call(this)) {
                /* ensure defaults */
                options = options || {};
                level = level || 0;

                /* set context */
                if (this instanceof SVG.Doc) {
                    /* define doctype */
                    node += whitespaced('<?xml version="1.0" encoding="UTF-8"?>', options.whitespace, level);

                    /* store current width and height */
                    width = this.attr('width');
                    height = this.attr('height');

                    /* set required size */
                    if (options.width) this.attr('width', options.width);
                    if (options.height) this.attr('height', options.height);
                }

                /* open node */
                node += whitespaced('<' + name + this.attrToString() + '>', options.whitespace, level);

                /* reset size and add description */
                if (this instanceof SVG.Doc) {
                    this.attr({
                        width: width,
                        height: height
                    });

                    node += whitespaced('<desc>Created with svg.js [http://svgjs.com]</desc>', options.whitespace, level + 1);
                    /* Add defs... */
                    node += this.defs().exportSvg(options, level + 1);
                }

                /* add children */
                if (this instanceof SVG.Parent) {
                    for (i = 0, il = this.children().length; i < il; i++) {
                        if (SVG.Absorbee && this.children()[i] instanceof SVG.Absorbee) {
                            clone = this.children()[i].node.cloneNode(true);
                            well = document.createElement('div');
                            well.appendChild(clone);
                            node += well.innerHTML;
                        } else {
                            node += this.children()[i].exportSvg(options, level + 1);
                        }
                    }
                } else if (this instanceof SVG.Text || this instanceof SVG.TSpan) {
                    for (i = 0, il = this.node.childNodes.length; i < il; i++) if (this.node.childNodes[i].instance instanceof SVG.TSpan) node += this.node.childNodes[i].instance.exportSvg(options, level + 1);else node += this.node.childNodes[i].nodeValue.replace(/&/g, '&amp;');
                } else if (SVG.ComponentTransferEffect && this instanceof SVG.ComponentTransferEffect) {
                    this.rgb.each(function () {
                        node += this.exportSvg(options, level + 1);
                    });
                }

                /* close node */
                node += whitespaced('</' + name + '>', options.whitespace, level);
            }

            return node;
        }
        // Set specific export attibutes
        , exportAttr: function exportAttr(attr) {
            /* acts as getter */
            if (arguments.length == 0) {
                return this.data('svg-export-attr');
            } /* acts as setter */
            return this.data('svg-export-attr', attr);
        }
        // Convert attributes to string
        , attrToString: function attrToString() {
            var i,
                key,
                value,
                attr = [],
                data = this.exportAttr(),
                exportAttrs = this.attr();

            /* ensure data */
            if (typeof data == 'object') for (key in data) if (key != 'data-svg-export-attr') exportAttrs[key] = data[key];

            /* build list */
            for (key in exportAttrs) {
                value = exportAttrs[key];

                /* enfoce explicit xlink namespace */
                if (key == 'xlink') {
                    key = 'xmlns:xlink';
                } else if (key == 'href') {
                    if (!exportAttrs['xlink:href']) key = 'xlink:href';
                }

                /* normailse value */
                if (typeof value === 'string') value = value.replace(/"/g, '\'');

                /* build value */
                if (key != 'data-svg-export-attr' && key != 'href') {
                    if (key != 'stroke' || parseFloat(exportAttrs['stroke-width']) > 0) attr.push(key + '="' + value + '"');
                }
            }

            return attr.length ? ' ' + attr.join(' ') : '';
        }

    });

    /////////////
    // helpers
    /////////////

    // Whitespaced string
    function whitespaced(value, add, level) {
        if (add) {
            var whitespace = '',
                space = add === true ? '  ' : add || '';

            /* build indentation */
            for (i = level - 1; i >= 0; i--) whitespace += space;

            /* add whitespace */
            value = whitespace + value + '\n';
        }

        return value;
    }
}).call(undefined);

},{}],13:[function(require,module,exports){
'use strict';;(function(root, factory){window.SVG = factory.apply(window, []);})(window, function(){var SVG=this.SVG = function(element){if(SVG.supported){element = new SVG.Doc(element);if(!SVG.parser)SVG.prepare(element);return element;}};SVG.ns = 'http://www.w3.org/2000/svg';SVG.xmlns = 'http://www.w3.org/2000/xmlns/';SVG.xlink = 'http://www.w3.org/1999/xlink';SVG.did = 1000;SVG.eid = function(name){return 'Svgjs' + name.charAt(0).toUpperCase() + name.slice(1) + SVG.did++;};SVG.create = function(name){var element=document.createElementNS(this.ns, name);element.setAttribute('id', this.eid(name));return element;};SVG.extend = function(){var modules, methods, key, i;modules = [].slice.call(arguments);methods = modules.pop();for(i = modules.length - 1; i >= 0; i--) if(modules[i])for(key in methods) modules[i].prototype[key] = methods[key];if(SVG.Set && SVG.Set.inherit)SVG.Set.inherit();};SVG.prepare = function(element){var body=document.getElementsByTagName('body')[0], draw=(body?new SVG.Doc(body):element.nested()).size(2, 0), path=SVG.create('path');draw.node.appendChild(path);SVG.parser = {body:body || element.parent, draw:draw.style('opacity:0;position:fixed;left:100%;top:100%;overflow:hidden'), poly:draw.polyline().node, path:path};};SVG.supported = (function(){return !!document.createElementNS && !!document.createElementNS(SVG.ns, 'svg').createSVGRect;})();if(!SVG.supported)return false;SVG.get = function(id){var node=document.getElementById(idFromReference(id) || id);if(node)return node.instance;};SVG.invent = function(config){var initializer=typeof config.create == 'function'?config.create:function(){this.constructor.call(this, SVG.create(config.create));};if(config.inherit)initializer.prototype = new config.inherit();if(config.extend)SVG.extend(initializer, config.extend);if(config.construct)SVG.extend(config.parent || SVG.Container, config.construct);return initializer;};if(typeof CustomEvent !== 'function'){var _CustomEvent=function(event, options){options = options || {bubbles:false, cancelable:false, detail:undefined};var e=document.createEvent('CustomEvent');e.initCustomEvent(event, options.bubbles, options.cancelable, options.detail);return e;};_CustomEvent.prototype = window.Event.prototype;window.CustomEvent = _CustomEvent;}(function(w){var lastTime=0;var vendors=['moz', 'webkit'];for(var x=0; x < vendors.length && !window.requestAnimationFrame; ++x) {w.requestAnimationFrame = w[vendors[x] + 'RequestAnimationFrame'];w.cancelAnimationFrame = w[vendors[x] + 'CancelAnimationFrame'] || w[vendors[x] + 'CancelRequestAnimationFrame'];}w.requestAnimationFrame = w.requestAnimationFrame || function(callback){var currTime=new Date().getTime();var timeToCall=Math.max(0, 16 - (currTime - lastTime));var id=w.setTimeout(function(){callback(currTime + timeToCall);}, timeToCall);lastTime = currTime + timeToCall;return id;};w.cancelAnimationFrame = w.cancelAnimationFrame || w.clearTimeout;})(window);SVG.regex = {unit:/^(-?[\d\.]+)([a-z%]{0,2})$/, hex:/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i, rgb:/rgb\((\d+),(\d+),(\d+)\)/, reference:/#([a-z0-9\-_]+)/i, isHex:/^#[a-f0-9]{3,6}$/i, isRgb:/^rgb\(/, isCss:/[^:]+:[^;]+;?/, isBlank:/^(\s+)?$/, isNumber:/^-?[\d\.]+$/, isPercent:/^-?[\d\.]+%$/, isImage:/\.(jpg|jpeg|png|gif)(\?[^=]+.*)?/i, isEvent:/^[\w]+:[\w]+$/};SVG.defaults = {matrix:'1 0 0 1 0 0', attrs:{'fill-opacity':1, 'stroke-opacity':1, 'stroke-width':0, 'stroke-linejoin':'miter', 'stroke-linecap':'butt', fill:'#000000', stroke:'#000000', opacity:1, x:0, y:0, cx:0, cy:0, width:0, height:0, r:0, rx:0, ry:0, offset:0, 'stop-opacity':1, 'stop-color':'#000000', 'font-size':16, 'font-family':'Helvetica, Arial, sans-serif', 'text-anchor':'start'}, trans:function trans(){return {x:0, y:0, scaleX:1, scaleY:1, rotation:0, skewX:0, skewY:0, matrix:this.matrix, a:1, b:0, c:0, d:1, e:0, f:0};}};SVG.Color = function(color){var match;this.r = 0;this.g = 0;this.b = 0;if(typeof color === 'string'){if(SVG.regex.isRgb.test(color)){match = SVG.regex.rgb.exec(color.replace(/\s/g, ''));this.r = parseInt(match[1]);this.g = parseInt(match[2]);this.b = parseInt(match[3]);}else if(SVG.regex.isHex.test(color)){match = SVG.regex.hex.exec(fullHex(color));this.r = parseInt(match[1], 16);this.g = parseInt(match[2], 16);this.b = parseInt(match[3], 16);}}else if(typeof color === 'object'){this.r = color.r;this.g = color.g;this.b = color.b;}};SVG.extend(SVG.Color, {toString:function toString(){return this.toHex();}, toHex:function toHex(){return '#' + compToHex(this.r) + compToHex(this.g) + compToHex(this.b);}, toRgb:function toRgb(){return 'rgb(' + [this.r, this.g, this.b].join() + ')';}, brightness:function brightness(){return this.r / 255 * 0.3 + this.g / 255 * 0.59 + this.b / 255 * 0.11;}, morph:function morph(color){this.destination = new SVG.Color(color);return this;}, at:function at(pos){if(!this.destination){return this;}pos = pos < 0?0:pos > 1?1:pos;return new SVG.Color({r:~ ~(this.r + (this.destination.r - this.r) * pos), g:~ ~(this.g + (this.destination.g - this.g) * pos), b:~ ~(this.b + (this.destination.b - this.b) * pos)});}});SVG.Color.test = function(color){color += '';return SVG.regex.isHex.test(color) || SVG.regex.isRgb.test(color);};SVG.Color.isRgb = function(color){return color && typeof color.r == 'number' && typeof color.g == 'number' && typeof color.b == 'number';};SVG.Color.isColor = function(color){return SVG.Color.isRgb(color) || SVG.Color.test(color);};SVG.Array = function(array, fallback){array = (array || []).valueOf();if(array.length == 0 && fallback)array = fallback.valueOf();this.value = this.parse(array);};SVG.extend(SVG.Array, {morph:function morph(array){this.destination = this.parse(array);if(this.value.length != this.destination.length){var lastValue=this.value[this.value.length - 1], lastDestination=this.destination[this.destination.length - 1];while(this.value.length > this.destination.length) this.destination.push(lastDestination);while(this.value.length < this.destination.length) this.value.push(lastValue);}return this;}, settle:function settle(){for(var i=0, il=this.value.length, seen=[]; i < il; i++) if(seen.indexOf(this.value[i]) == -1)seen.push(this.value[i]);return this.value = seen;}, at:function at(pos){if(!this.destination){return this;}for(var i=0, il=this.value.length, array=[]; i < il; i++) array.push(this.value[i] + (this.destination[i] - this.value[i]) * pos);return new SVG.Array(array);}, toString:function toString(){return this.value.join(' ');}, valueOf:function valueOf(){return this.value;}, parse:function parse(array){array = array.valueOf();if(Array.isArray(array)){return array;}return this.split(array);}, split:function split(string){return string.replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '').split(' ');}, reverse:function reverse(){this.value.reverse();return this;}});SVG.PointArray = function(){this.constructor.apply(this, arguments);};SVG.PointArray.prototype = new SVG.Array();SVG.extend(SVG.PointArray, {toString:function toString(){for(var i=0, il=this.value.length, array=[]; i < il; i++) array.push(this.value[i].join(','));return array.join(' ');}, at:function at(pos){if(!this.destination){return this;}for(var i=0, il=this.value.length, array=[]; i < il; i++) array.push([this.value[i][0] + (this.destination[i][0] - this.value[i][0]) * pos, this.value[i][1] + (this.destination[i][1] - this.value[i][1]) * pos]);return new SVG.PointArray(array);}, parse:function parse(array){array = array.valueOf();if(Array.isArray(array)){return array;}array = this.split(array);for(var i=0, il=array.length, p, points=[]; i < il; i++) {p = array[i].split(',');points.push([parseFloat(p[0]), parseFloat(p[1])]);}return points;}, move:function move(x, y){var box=this.bbox();x -= box.x;y -= box.y;if(!isNaN(x) && !isNaN(y))for(var i=this.value.length - 1; i >= 0; i--) this.value[i] = [this.value[i][0] + x, this.value[i][1] + y];return this;}, size:function size(width, height){var i, box=this.bbox();for(i = this.value.length - 1; i >= 0; i--) {this.value[i][0] = (this.value[i][0] - box.x) * width / box.width + box.x;this.value[i][1] = (this.value[i][1] - box.y) * height / box.height + box.y;}return this;}, bbox:function bbox(){SVG.parser.poly.setAttribute('points', this.toString());return SVG.parser.poly.getBBox();}});SVG.PathArray = function(array, fallback){this.constructor.call(this, array, fallback);};SVG.PathArray.prototype = new SVG.Array();SVG.extend(SVG.PathArray, {toString:function toString(){return arrayToString(this.value);}, move:function move(x, y){var box=this.bbox();x -= box.x;y -= box.y;if(!isNaN(x) && !isNaN(y)){for(var l, i=this.value.length - 1; i >= 0; i--) {l = this.value[i][0];if(l == 'M' || l == 'L' || l == 'T'){this.value[i][1] += x;this.value[i][2] += y;}else if(l == 'H'){this.value[i][1] += x;}else if(l == 'V'){this.value[i][1] += y;}else if(l == 'C' || l == 'S' || l == 'Q'){this.value[i][1] += x;this.value[i][2] += y;this.value[i][3] += x;this.value[i][4] += y;if(l == 'C'){this.value[i][5] += x;this.value[i][6] += y;}}else if(l == 'A'){this.value[i][6] += x;this.value[i][7] += y;}}}return this;}, size:function size(width, height){var i, l, box=this.bbox();for(i = this.value.length - 1; i >= 0; i--) {l = this.value[i][0];if(l == 'M' || l == 'L' || l == 'T'){this.value[i][1] = (this.value[i][1] - box.x) * width / box.width + box.x;this.value[i][2] = (this.value[i][2] - box.y) * height / box.height + box.y;}else if(l == 'H'){this.value[i][1] = (this.value[i][1] - box.x) * width / box.width + box.x;}else if(l == 'V'){this.value[i][1] = (this.value[i][1] - box.y) * height / box.height + box.y;}else if(l == 'C' || l == 'S' || l == 'Q'){this.value[i][1] = (this.value[i][1] - box.x) * width / box.width + box.x;this.value[i][2] = (this.value[i][2] - box.y) * height / box.height + box.y;this.value[i][3] = (this.value[i][3] - box.x) * width / box.width + box.x;this.value[i][4] = (this.value[i][4] - box.y) * height / box.height + box.y;if(l == 'C'){this.value[i][5] = (this.value[i][5] - box.x) * width / box.width + box.x;this.value[i][6] = (this.value[i][6] - box.y) * height / box.height + box.y;}}else if(l == 'A'){this.value[i][1] = this.value[i][1] * width / box.width;this.value[i][2] = this.value[i][2] * height / box.height;this.value[i][6] = (this.value[i][6] - box.x) * width / box.width + box.x;this.value[i][7] = (this.value[i][7] - box.y) * height / box.height + box.y;}}return this;}, parse:function parse(array){if(array instanceof SVG.PathArray){return array.valueOf();}var i, il, x0, y0, x1, y1, x2, y2, s, seg, segs, x=0, y=0;SVG.parser.path.setAttribute('d', typeof array === 'string'?array:arrayToString(array));segs = SVG.parser.path.pathSegList;for(i = 0, il = segs.numberOfItems; i < il; ++i) {seg = segs.getItem(i);s = seg.pathSegTypeAsLetter;if(s == 'M' || s == 'L' || s == 'H' || s == 'V' || s == 'C' || s == 'S' || s == 'Q' || s == 'T' || s == 'A'){if('x' in seg)x = seg.x;if('y' in seg)y = seg.y;}else {if('x1' in seg)x1 = x + seg.x1;if('x2' in seg)x2 = x + seg.x2;if('y1' in seg)y1 = y + seg.y1;if('y2' in seg)y2 = y + seg.y2;if('x' in seg)x += seg.x;if('y' in seg)y += seg.y;if(s == 'm')segs.replaceItem(SVG.parser.path.createSVGPathSegMovetoAbs(x, y), i);else if(s == 'l')segs.replaceItem(SVG.parser.path.createSVGPathSegLinetoAbs(x, y), i);else if(s == 'h')segs.replaceItem(SVG.parser.path.createSVGPathSegLinetoHorizontalAbs(x), i);else if(s == 'v')segs.replaceItem(SVG.parser.path.createSVGPathSegLinetoVerticalAbs(y), i);else if(s == 'c')segs.replaceItem(SVG.parser.path.createSVGPathSegCurvetoCubicAbs(x, y, x1, y1, x2, y2), i);else if(s == 's')segs.replaceItem(SVG.parser.path.createSVGPathSegCurvetoCubicSmoothAbs(x, y, x2, y2), i);else if(s == 'q')segs.replaceItem(SVG.parser.path.createSVGPathSegCurvetoQuadraticAbs(x, y, x1, y1), i);else if(s == 't')segs.replaceItem(SVG.parser.path.createSVGPathSegCurvetoQuadraticSmoothAbs(x, y), i);else if(s == 'a')segs.replaceItem(SVG.parser.path.createSVGPathSegArcAbs(x, y, seg.r1, seg.r2, seg.angle, seg.largeArcFlag, seg.sweepFlag), i);else if(s == 'z' || s == 'Z'){x = x0;y = y0;}}if(s == 'M' || s == 'm'){x0 = x;y0 = y;}}array = [];segs = SVG.parser.path.pathSegList;for(i = 0, il = segs.numberOfItems; i < il; ++i) {seg = segs.getItem(i);s = seg.pathSegTypeAsLetter;x = [s];if(s == 'M' || s == 'L' || s == 'T')x.push(seg.x, seg.y);else if(s == 'H')x.push(seg.x);else if(s == 'V')x.push(seg.y);else if(s == 'C')x.push(seg.x1, seg.y1, seg.x2, seg.y2, seg.x, seg.y);else if(s == 'S')x.push(seg.x2, seg.y2, seg.x, seg.y);else if(s == 'Q')x.push(seg.x1, seg.y1, seg.x, seg.y);else if(s == 'A')x.push(seg.r1, seg.r2, seg.angle, seg.largeArcFlag | 0, seg.sweepFlag | 0, seg.x, seg.y);array.push(x);}return array;}, bbox:function bbox(){SVG.parser.path.setAttribute('d', this.toString());return SVG.parser.path.getBBox();}});SVG.Number = function(value){this.value = 0;this.unit = '';if(typeof value === 'number'){this.value = isNaN(value)?0:!isFinite(value)?value < 0?-3.4e+38:+3.4e+38:value;}else if(typeof value === 'string'){var match=value.match(SVG.regex.unit);if(match){this.value = parseFloat(match[1]);if(match[2] == '%')this.value /= 100;else if(match[2] == 's')this.value *= 1000;this.unit = match[2];}}else {if(value instanceof SVG.Number){this.value = value.value;this.unit = value.unit;}}};SVG.extend(SVG.Number, {toString:function toString(){return (this.unit == '%'?~ ~(this.value * 100000000) / 1000000:this.unit == 's'?this.value / 1000:this.value) + this.unit;}, valueOf:function valueOf(){return this.value;}, plus:function plus(number){this.value = this + new SVG.Number(number);return this;}, minus:function minus(number){return this.plus(-new SVG.Number(number));}, times:function times(number){this.value = this * new SVG.Number(number);return this;}, divide:function divide(number){this.value = this / new SVG.Number(number);return this;}, to:function to(unit){if(typeof unit === 'string')this.unit = unit;return this;}, morph:function morph(number){this.destination = new SVG.Number(number);return this;}, at:function at(pos){if(!this.destination){return this;}return new SVG.Number(this.destination).minus(this).times(pos).plus(this);}});SVG.ViewBox = function(element){var x, y, width, height, wm=1, hm=1, box=element.bbox(), view=(element.attr('viewBox') || '').match(/-?[\d\.]+/g), we=element, he=element;width = new SVG.Number(element.width());height = new SVG.Number(element.height());while(width.unit == '%') {wm *= width.value;width = new SVG.Number(we instanceof SVG.Doc?we.parent.offsetWidth:we.parent.width());we = we.parent;}while(height.unit == '%') {hm *= height.value;height = new SVG.Number(he instanceof SVG.Doc?he.parent.offsetHeight:he.parent.height());he = he.parent;}this.x = box.x;this.y = box.y;this.width = width * wm;this.height = height * hm;this.zoom = 1;if(view){x = parseFloat(view[0]);y = parseFloat(view[1]);width = parseFloat(view[2]);height = parseFloat(view[3]);this.zoom = this.width / this.height > width / height?this.height / height:this.width / width;this.x = x;this.y = y;this.width = width;this.height = height;}};SVG.extend(SVG.ViewBox, {toString:function toString(){return this.x + ' ' + this.y + ' ' + this.width + ' ' + this.height;}});SVG.BBox = function(element){var box;this.x = 0;this.y = 0;this.width = 0;this.height = 0;if(element){try{box = element.node.getBBox();}catch(e) {box = {x:element.node.clientLeft, y:element.node.clientTop, width:element.node.clientWidth, height:element.node.clientHeight};}this.x = box.x + element.trans.x;this.y = box.y + element.trans.y;this.width = box.width * element.trans.scaleX;this.height = box.height * element.trans.scaleY;}boxProperties(this);};SVG.extend(SVG.BBox, {merge:function merge(box){var b=new SVG.BBox();b.x = Math.min(this.x, box.x);b.y = Math.min(this.y, box.y);b.width = Math.max(this.x + this.width, box.x + box.width) - b.x;b.height = Math.max(this.y + this.height, box.y + box.height) - b.y;boxProperties(b);return b;}});SVG.RBox = function(element){var e, zoom, box={};this.x = 0;this.y = 0;this.width = 0;this.height = 0;if(element){e = element.doc().parent;zoom = element.doc().viewbox().zoom;box = element.node.getBoundingClientRect();this.x = box.left;this.y = box.top;this.x -= e.offsetLeft;this.y -= e.offsetTop;while(e = e.offsetParent) {this.x -= e.offsetLeft;this.y -= e.offsetTop;}e = element;while(e = e.parent) {if(e.type == 'svg' && e.viewbox){zoom *= e.viewbox().zoom;this.x -= e.x() || 0;this.y -= e.y() || 0;}}}this.x /= zoom;this.y /= zoom;this.width = box.width /= zoom;this.height = box.height /= zoom;this.x += typeof window.scrollX === 'number'?window.scrollX:window.pageXOffset;this.y += typeof window.scrollY === 'number'?window.scrollY:window.pageYOffset;boxProperties(this);};SVG.extend(SVG.RBox, {merge:function merge(box){var b=new SVG.RBox();b.x = Math.min(this.x, box.x);b.y = Math.min(this.y, box.y);b.width = Math.max(this.x + this.width, box.x + box.width) - b.x;b.height = Math.max(this.y + this.height, box.y + box.height) - b.y;boxProperties(b);return b;}});SVG.Element = SVG.invent({create:function create(node){this._stroke = SVG.defaults.attrs.stroke;this.trans = SVG.defaults.trans();if(this.node = node){this.type = node.nodeName;this.node.instance = this;}}, extend:{x:function x(_x){if(_x != null){_x = new SVG.Number(_x);_x.value /= this.trans.scaleX;}return this.attr('x', _x);}, y:function y(_y){if(_y != null){_y = new SVG.Number(_y);_y.value /= this.trans.scaleY;}return this.attr('y', _y);}, cx:function cx(x){return x == null?this.x() + this.width() / 2:this.x(x - this.width() / 2);}, cy:function cy(y){return y == null?this.y() + this.height() / 2:this.y(y - this.height() / 2);}, move:function move(x, y){return this.x(x).y(y);}, center:function center(x, y){return this.cx(x).cy(y);}, width:function width(_width){return this.attr('width', _width);}, height:function height(_height){return this.attr('height', _height);}, size:function size(width, height){var p=proportionalSize(this.bbox(), width, height);return this.width(new SVG.Number(p.width)).height(new SVG.Number(p.height));}, clone:function clone(){var clone, attr, type=this.type;clone = type == 'rect' || type == 'ellipse'?this.parent[type](0, 0):type == 'line'?this.parent[type](0, 0, 0, 0):type == 'image'?this.parent[type](this.src):type == 'text'?this.parent[type](this.content):type == 'path'?this.parent[type](this.attr('d')):type == 'polyline' || type == 'polygon'?this.parent[type](this.attr('points')):type == 'g'?this.parent.group():this.parent[type]();attr = this.attr();delete attr.id;clone.attr(attr);clone.trans = this.trans;return clone.transform({});}, remove:function remove(){if(this.parent)this.parent.removeElement(this);return this;}, replace:function replace(element){this.after(element).remove();return element;}, addTo:function addTo(parent){return parent.put(this);}, putIn:function putIn(parent){return parent.add(this);}, doc:function doc(type){return this._parent(type || SVG.Doc);}, attr:function attr(a, v, n){if(a == null){a = {};v = this.node.attributes;for(n = v.length - 1; n >= 0; n--) a[v[n].nodeName] = SVG.regex.isNumber.test(v[n].nodeValue)?parseFloat(v[n].nodeValue):v[n].nodeValue;return a;}else if(typeof a == 'object'){for(v in a) this.attr(v, a[v]);}else if(v === null){this.node.removeAttribute(a);}else if(v == null){v = this.node.attributes[a];return v == null?SVG.defaults.attrs[a]:SVG.regex.isNumber.test(v.nodeValue)?parseFloat(v.nodeValue):v.nodeValue;}else if(a == 'style'){return this.style(v);}else {if(a == 'stroke-width')this.attr('stroke', parseFloat(v) > 0?this._stroke:null);else if(a == 'stroke')this._stroke = v;if(a == 'fill' || a == 'stroke'){if(SVG.regex.isImage.test(v))v = this.doc().defs().image(v, 0, 0);if(v instanceof SVG.Image)v = this.doc().defs().pattern(0, 0, function(){this.add(v);});}if(typeof v === 'number')v = new SVG.Number(v);else if(SVG.Color.isColor(v))v = new SVG.Color(v);else if(Array.isArray(v))v = new SVG.Array(v);if(a == 'leading'){if(this.leading)this.leading(v);}else {typeof n === 'string'?this.node.setAttributeNS(n, a, v.toString()):this.node.setAttribute(a, v.toString());}if(this.rebuild && (a == 'font-size' || a == 'x'))this.rebuild(a, v);}return this;}, transform:function transform(o, v){if(arguments.length == 0){return this.trans;}else if(typeof o === 'string'){if(arguments.length < 2){return this.trans[o];}var transform={};transform[o] = v;return this.transform(transform);}var transform=[];o = parseMatrix(o);for(v in o) if(o[v] != null)this.trans[v] = o[v];this.trans.matrix = this.trans.a + ' ' + this.trans.b + ' ' + this.trans.c + ' ' + this.trans.d + ' ' + this.trans.e + ' ' + this.trans.f;o = this.trans;if(o.matrix != SVG.defaults.matrix)transform.push('matrix(' + o.matrix + ')');if(o.rotation != 0)transform.push('rotate(' + o.rotation + ' ' + (o.cx == null?this.bbox().cx:o.cx) + ' ' + (o.cy == null?this.bbox().cy:o.cy) + ')');if(o.scaleX != 1 || o.scaleY != 1)transform.push('scale(' + o.scaleX + ' ' + o.scaleY + ')');if(o.skewX != 0)transform.push('skewX(' + o.skewX + ')');if(o.skewY != 0)transform.push('skewY(' + o.skewY + ')');if(o.x != 0 || o.y != 0)transform.push('translate(' + new SVG.Number(o.x / o.scaleX) + ' ' + new SVG.Number(o.y / o.scaleY) + ')');if(transform.length == 0)this.node.removeAttribute('transform');else this.node.setAttribute('transform', transform.join(' '));return this;}, style:function style(s, v){if(arguments.length == 0){return this.node.style.cssText || '';}else if(arguments.length < 2){if(typeof s == 'object'){for(v in s) this.style(v, s[v]);}else if(SVG.regex.isCss.test(s)){s = s.split(';');for(var i=0; i < s.length; i++) {v = s[i].split(':');this.style(v[0].replace(/\s+/g, ''), v[1]);}}else {return this.node.style[camelCase(s)];}}else {this.node.style[camelCase(s)] = v === null || SVG.regex.isBlank.test(v)?'':v;}return this;}, id:function id(_id){return this.attr('id', _id);}, bbox:function bbox(){return new SVG.BBox(this);}, rbox:function rbox(){return new SVG.RBox(this);}, inside:function inside(x, y){var box=this.bbox();return x > box.x && y > box.y && x < box.x + box.width && y < box.y + box.height;}, show:function show(){return this.style('display', '');}, hide:function hide(){return this.style('display', 'none');}, visible:function visible(){return this.style('display') != 'none';}, toString:function toString(){return this.attr('id');}, classes:function classes(){var classAttr=this.node.getAttribute('class');if(classAttr === null){return [];}else {return classAttr.trim().split(/\s+/);}}, hasClass:function hasClass(className){return this.classes().indexOf(className) != -1;}, addClass:function addClass(className){var classArray;if(!this.hasClass(className)){classArray = this.classes();classArray.push(className);this.node.setAttribute('class', classArray.join(' '));}return this;}, removeClass:function removeClass(className){var classArray;if(this.hasClass(className)){classArray = this.classes().filter(function(c){return c != className;});this.node.setAttribute('class', classArray.join(' '));}return this;}, toggleClass:function toggleClass(className){if(this.hasClass(className)){this.removeClass(className);}else {this.addClass(className);}return this;}, reference:function reference(attr){return SVG.get(this.attr()[attr]);}, _parent:function _parent(parent){var element=this;while(element != null && !(element instanceof parent)) element = element.parent;return element;}}});SVG.Parent = SVG.invent({create:function create(element){this.constructor.call(this, element);}, inherit:SVG.Element, extend:{children:function children(){return this._children || (this._children = []);}, add:function add(element, i){if(!this.has(element)){i = i == null?this.children().length:i;if(element.parent)element.parent.children().splice(element.parent.index(element), 1);this.children().splice(i, 0, element);this.node.insertBefore(element.node, this.node.childNodes[i] || null);element.parent = this;}if(this._defs){this.node.removeChild(this._defs.node);this.node.appendChild(this._defs.node);}return this;}, put:function put(element, i){this.add(element, i);return element;}, has:function has(element){return this.index(element) >= 0;}, index:function index(element){return this.children().indexOf(element);}, get:function get(i){return this.children()[i];}, first:function first(){return this.children()[0];}, last:function last(){return this.children()[this.children().length - 1];}, each:function each(block, deep){var i, il, children=this.children();for(i = 0, il = children.length; i < il; i++) {if(children[i] instanceof SVG.Element)block.apply(children[i], [i, children]);if(deep && children[i] instanceof SVG.Container)children[i].each(block, deep);}return this;}, removeElement:function removeElement(element){this.children().splice(this.index(element), 1);this.node.removeChild(element.node);element.parent = null;return this;}, clear:function clear(){for(var i=this.children().length - 1; i >= 0; i--) this.removeElement(this.children()[i]);if(this._defs)this._defs.clear();return this;}, defs:function defs(){return this.doc().defs();}}});SVG.Container = SVG.invent({create:function create(element){this.constructor.call(this, element);}, inherit:SVG.Parent, extend:{viewbox:function viewbox(v){if(arguments.length == 0){return new SVG.ViewBox(this);}v = arguments.length == 1?[v.x, v.y, v.width, v.height]:[].slice.call(arguments);return this.attr('viewBox', v);}}});SVG.FX = SVG.invent({create:function create(element){this.target = element;}, extend:{animate:function animate(d, ease, delay){var akeys, tkeys, skeys, key, element=this.target, fx=this;if(typeof d == 'object'){delay = d.delay;ease = d.ease;d = d.duration;}d = d == '='?d:d == null?1000:new SVG.Number(d).valueOf();ease = ease || '<>';fx.to = function(pos){var i;pos = pos < 0?0:pos > 1?1:pos;if(akeys == null){akeys = [];for(key in fx.attrs) akeys.push(key);if(element.morphArray && (fx._plot || akeys.indexOf('points') > -1)){var box, p=new element.morphArray(fx._plot || fx.attrs.points || element.array);if(fx._size)p.size(fx._size.width.to, fx._size.height.to);box = p.bbox();if(fx._x)p.move(fx._x.to, box.y);else if(fx._cx)p.move(fx._cx.to - box.width / 2, box.y);box = p.bbox();if(fx._y)p.move(box.x, fx._y.to);else if(fx._cy)p.move(box.x, fx._cy.to - box.height / 2);delete fx._x;delete fx._y;delete fx._cx;delete fx._cy;delete fx._size;fx._plot = element.array.morph(p);}}if(tkeys == null){tkeys = [];for(key in fx.trans) tkeys.push(key);}if(skeys == null){skeys = [];for(key in fx.styles) skeys.push(key);}pos = ease == '<>'?-Math.cos(pos * Math.PI) / 2 + 0.5:ease == '>'?Math.sin(pos * Math.PI / 2):ease == '<'?-Math.cos(pos * Math.PI / 2) + 1:ease == '-'?pos:typeof ease == 'function'?ease(pos):pos;if(fx._plot){element.plot(fx._plot.at(pos));}else {if(fx._x)element.x(fx._x.at(pos));else if(fx._cx)element.cx(fx._cx.at(pos));if(fx._y)element.y(fx._y.at(pos));else if(fx._cy)element.cy(fx._cy.at(pos));if(fx._size)element.size(fx._size.width.at(pos), fx._size.height.at(pos));}if(fx._viewbox)element.viewbox(fx._viewbox.x.at(pos), fx._viewbox.y.at(pos), fx._viewbox.width.at(pos), fx._viewbox.height.at(pos));if(fx._leading)element.leading(fx._leading.at(pos));for(i = akeys.length - 1; i >= 0; i--) element.attr(akeys[i], at(fx.attrs[akeys[i]], pos));for(i = tkeys.length - 1; i >= 0; i--) element.transform(tkeys[i], at(fx.trans[tkeys[i]], pos));for(i = skeys.length - 1; i >= 0; i--) element.style(skeys[i], at(fx.styles[skeys[i]], pos));if(fx._during)fx._during.call(element, pos, function(from, to){return at({from:from, to:to}, pos);});};if(typeof d === 'number'){this.timeout = setTimeout(function(){var start=new Date().getTime();fx.situation = {interval:1000 / 60, start:start, play:true, finish:start + d, duration:d};fx.render = function(){if(fx.situation.play === true){var time=new Date().getTime(), pos=time > fx.situation.finish?1:(time - fx.situation.start) / d;fx.to(pos);if(time > fx.situation.finish){if(fx._plot)element.plot(new SVG.PointArray(fx._plot.destination).settle());if(fx._loop === true || typeof fx._loop == 'number' && fx._loop > 1){if(typeof fx._loop == 'number')--fx._loop;fx.animate(d, ease, delay);}else {fx._after?fx._after.apply(element, [fx]):fx.stop();}}else {fx.animationFrame = requestAnimationFrame(fx.render);}}else {fx.animationFrame = requestAnimationFrame(fx.render);}};fx.render();}, new SVG.Number(delay).valueOf());}return this;}, bbox:function bbox(){return this.target.bbox();}, attr:function attr(a, v){if(typeof a == 'object'){for(var key in a) this.attr(key, a[key]);}else {var from=this.target.attr(a);this.attrs[a] = SVG.Color.isColor(from)?new SVG.Color(from).morph(v):SVG.regex.unit.test(from)?new SVG.Number(from).morph(v):{from:from, to:v};}return this;}, transform:function transform(o, v){if(arguments.length == 1){o = parseMatrix(o);delete o.matrix;this.target.trans.cx = o.cx || null;this.target.trans.cy = o.cy || null;delete o.cx;delete o.cy;for(v in o) this.trans[v] = {from:this.target.trans[v], to:o[v]};}else {var transform={};transform[o] = v;this.transform(transform);}return this;}, style:function style(s, v){if(typeof s == 'object')for(var key in s) this.style(key, s[key]);else this.styles[s] = {from:this.target.style(s), to:v};return this;}, x:function x(_x2){this._x = new SVG.Number(this.target.x()).morph(_x2);return this;}, y:function y(_y2){this._y = new SVG.Number(this.target.y()).morph(_y2);return this;}, cx:function cx(x){this._cx = new SVG.Number(this.target.cx()).morph(x);return this;}, cy:function cy(y){this._cy = new SVG.Number(this.target.cy()).morph(y);return this;}, move:function move(x, y){return this.x(x).y(y);}, center:function center(x, y){return this.cx(x).cy(y);}, size:function size(width, height){if(this.target instanceof SVG.Text){this.attr('font-size', width);}else {var box=this.target.bbox();this._size = {width:new SVG.Number(box.width).morph(width), height:new SVG.Number(box.height).morph(height)};}return this;}, plot:function plot(p){this._plot = p;return this;}, leading:function leading(value){if(this.target._leading)this._leading = new SVG.Number(this.target._leading).morph(value);return this;}, viewbox:function viewbox(x, y, width, height){if(this.target instanceof SVG.Container){var box=this.target.viewbox();this._viewbox = {x:new SVG.Number(box.x).morph(x), y:new SVG.Number(box.y).morph(y), width:new SVG.Number(box.width).morph(width), height:new SVG.Number(box.height).morph(height)};}return this;}, update:function update(o){if(this.target instanceof SVG.Stop){if(o.opacity != null)this.attr('stop-opacity', o.opacity);if(o.color != null)this.attr('stop-color', o.color);if(o.offset != null)this.attr('offset', new SVG.Number(o.offset));}return this;}, during:function during(_during){this._during = _during;return this;}, after:function after(_after){this._after = _after;return this;}, loop:function loop(times){this._loop = times || true;return this;}, stop:function stop(fulfill){if(fulfill === true){this.animate(0);if(this._after)this._after.apply(this.target, [this]);}else {clearTimeout(this.timeout);cancelAnimationFrame(this.animationFrame);this.attrs = {};this.trans = {};this.styles = {};this.situation = {};delete this._x;delete this._y;delete this._cx;delete this._cy;delete this._size;delete this._plot;delete this._loop;delete this._after;delete this._during;delete this._leading;delete this._viewbox;}return this;}, pause:function pause(){if(this.situation.play === true){this.situation.play = false;this.situation.pause = new Date().getTime();}return this;}, play:function play(){if(this.situation.play === false){var pause=new Date().getTime() - this.situation.pause;this.situation.finish += pause;this.situation.start += pause;this.situation.play = true;}return this;}}, parent:SVG.Element, construct:{animate:function animate(d, ease, delay){return (this.fx || (this.fx = new SVG.FX(this))).stop().animate(d, ease, delay);}, stop:function stop(fulfill){if(this.fx)this.fx.stop(fulfill);return this;}, pause:function pause(){if(this.fx)this.fx.pause();return this;}, play:function play(){if(this.fx)this.fx.play();return this;}}});SVG.extend(SVG.Element, SVG.FX, {dx:function dx(x){return this.x((this.target || this).x() + x);}, dy:function dy(y){return this.y((this.target || this).y() + y);}, dmove:function dmove(x, y){return this.dx(x).dy(y);}});['click', 'dblclick', 'mousedown', 'mouseup', 'mouseover', 'mouseout', 'mousemove', 'touchstart', 'touchmove', 'touchleave', 'touchend', 'touchcancel'].forEach(function(event){SVG.Element.prototype[event] = function(f){var self=this;this.node['on' + event] = typeof f == 'function'?function(){return f.apply(self, arguments);}:null;return this;};});SVG.listeners = [];SVG.handlerMap = [];SVG.registerEvent = function(){};SVG.on = function(node, event, listener){var l=listener.bind(node.instance || node), index=(SVG.handlerMap.indexOf(node) + 1 || SVG.handlerMap.push(node)) - 1, ev=event.split('.')[0], ns=event.split('.')[1] || '*';SVG.listeners[index] = SVG.listeners[index] || {};SVG.listeners[index][ev] = SVG.listeners[index][ev] || {};SVG.listeners[index][ev][ns] = SVG.listeners[index][ev][ns] || {};SVG.listeners[index][ev][ns][listener] = l;node.addEventListener(ev, l, false);};SVG.off = function(node, event, listener){var index=SVG.handlerMap.indexOf(node), ev=event && event.split('.')[0], ns=event && event.split('.')[1];if(index == -1)return;if(listener){if(SVG.listeners[index][ev] && SVG.listeners[index][ev][ns || '*']){node.removeEventListener(ev, SVG.listeners[index][ev][ns || '*'][listener], false);delete SVG.listeners[index][ev][ns || '*'][listener];}}else if(ns){if(SVG.listeners[index][ev] && SVG.listeners[index][ev][ns]){for(listener in SVG.listeners[index][ev][ns]) SVG.off(node, [ev, ns].join('.'), listener);delete SVG.listeners[index][ev][ns];}}else if(ev){if(SVG.listeners[index][ev]){for(namespace in SVG.listeners[index][ev]) SVG.off(node, [ev, namespace].join('.'));delete SVG.listeners[index][ev];}}else {for(event in SVG.listeners[index]) SVG.off(node, event);delete SVG.listeners[index];}};SVG.extend(SVG.Element, {on:function on(event, listener){SVG.on(this.node, event, listener);return this;}, off:function off(event, listener){SVG.off(this.node, event, listener);return this;}, fire:function fire(event, data){this.node.dispatchEvent(new CustomEvent(event, {detail:data}));return this;}});SVG.Defs = SVG.invent({create:'defs', inherit:SVG.Container});SVG.G = SVG.invent({create:'g', inherit:SVG.Container, extend:{x:function x(_x3){return _x3 == null?this.trans.x:this.transform('x', _x3);}, y:function y(_y3){return _y3 == null?this.trans.y:this.transform('y', _y3);}, cx:function cx(x){return x == null?this.bbox().cx:this.x(x - this.bbox().width / 2);}, cy:function cy(y){return y == null?this.bbox().cy:this.y(y - this.bbox().height / 2);}}, construct:{group:function group(){return this.put(new SVG.G());}}});SVG.extend(SVG.Element, {siblings:function siblings(){return this.parent.children();}, position:function position(){return this.parent.index(this);}, next:function next(){return this.siblings()[this.position() + 1];}, previous:function previous(){return this.siblings()[this.position() - 1];}, forward:function forward(){var i=this.position();return this.parent.removeElement(this).put(this, i + 1);}, backward:function backward(){var i=this.position();if(i > 0)this.parent.removeElement(this).add(this, i - 1);return this;}, front:function front(){return this.parent.removeElement(this).put(this);}, back:function back(){if(this.position() > 0)this.parent.removeElement(this).add(this, 0);return this;}, before:function before(element){element.remove();var i=this.position();this.parent.add(element, i);return this;}, after:function after(element){element.remove();var i=this.position();this.parent.add(element, i + 1);return this;}});SVG.Mask = SVG.invent({create:function create(){this.constructor.call(this, SVG.create('mask'));this.targets = [];}, inherit:SVG.Container, extend:{remove:function remove(){for(var i=this.targets.length - 1; i >= 0; i--) if(this.targets[i])this.targets[i].unmask();delete this.targets;this.parent.removeElement(this);return this;}}, construct:{mask:function mask(){return this.defs().put(new SVG.Mask());}}});SVG.extend(SVG.Element, {maskWith:function maskWith(element){this.masker = element instanceof SVG.Mask?element:this.parent.mask().add(element);this.masker.targets.push(this);return this.attr('mask', 'url("#' + this.masker.attr('id') + '")');}, unmask:function unmask(){delete this.masker;return this.attr('mask', null);}});SVG.Clip = SVG.invent({create:function create(){this.constructor.call(this, SVG.create('clipPath'));this.targets = [];}, inherit:SVG.Container, extend:{remove:function remove(){for(var i=this.targets.length - 1; i >= 0; i--) if(this.targets[i])this.targets[i].unclip();delete this.targets;this.parent.removeElement(this);return this;}}, construct:{clip:function clip(){return this.defs().put(new SVG.Clip());}}});SVG.extend(SVG.Element, {clipWith:function clipWith(element){this.clipper = element instanceof SVG.Clip?element:this.parent.clip().add(element);this.clipper.targets.push(this);return this.attr('clip-path', 'url("#' + this.clipper.attr('id') + '")');}, unclip:function unclip(){delete this.clipper;return this.attr('clip-path', null);}});SVG.Gradient = SVG.invent({create:function create(type){this.constructor.call(this, SVG.create(type + 'Gradient'));this.type = type;}, inherit:SVG.Container, extend:{from:function from(x, y){return this.type == 'radial'?this.attr({fx:new SVG.Number(x), fy:new SVG.Number(y)}):this.attr({x1:new SVG.Number(x), y1:new SVG.Number(y)});}, to:function to(x, y){return this.type == 'radial'?this.attr({cx:new SVG.Number(x), cy:new SVG.Number(y)}):this.attr({x2:new SVG.Number(x), y2:new SVG.Number(y)});}, radius:function radius(r){return this.type == 'radial'?this.attr({r:new SVG.Number(r)}):this;}, at:function at(offset, color, opacity){return this.put(new SVG.Stop()).update(offset, color, opacity);}, update:function update(block){this.clear();if(typeof block == 'function')block.call(this, this);return this;}, fill:function fill(){return 'url(#' + this.id() + ')';}, toString:function toString(){return this.fill();}}, construct:{gradient:function gradient(type, block){return this.defs().gradient(type, block);}}});SVG.extend(SVG.Defs, {gradient:function gradient(type, block){return this.put(new SVG.Gradient(type)).update(block);}});SVG.Stop = SVG.invent({create:'stop', inherit:SVG.Element, extend:{update:function update(o){if(typeof o == 'number' || o instanceof SVG.Number){o = {offset:arguments[0], color:arguments[1], opacity:arguments[2]};}if(o.opacity != null)this.attr('stop-opacity', o.opacity);if(o.color != null)this.attr('stop-color', o.color);if(o.offset != null)this.attr('offset', new SVG.Number(o.offset));return this;}}});SVG.Pattern = SVG.invent({create:'pattern', inherit:SVG.Container, extend:{fill:function fill(){return 'url(#' + this.id() + ')';}, update:function update(block){this.clear();if(typeof block == 'function')block.call(this, this);return this;}, toString:function toString(){return this.fill();}}, construct:{pattern:function pattern(width, height, block){return this.defs().pattern(width, height, block);}}});SVG.extend(SVG.Defs, {pattern:function pattern(width, height, block){return this.put(new SVG.Pattern()).update(block).attr({x:0, y:0, width:width, height:height, patternUnits:'userSpaceOnUse'});}});SVG.Doc = SVG.invent({create:function create(element){this.parent = typeof element == 'string'?document.getElementById(element):element;this.constructor.call(this, this.parent.nodeName == 'svg'?this.parent:SVG.create('svg'));this.attr({xmlns:SVG.ns, version:'1.1', width:'100%', height:'100%'}).attr('xmlns:xlink', SVG.xlink, SVG.xmlns);this._defs = new SVG.Defs();this._defs.parent = this;this.node.appendChild(this._defs.node);this.doSpof = false;if(this.parent != this.node)this.stage();}, inherit:SVG.Container, extend:{stage:function stage(){var element=this;this.parent.appendChild(this.node);element.spof();SVG.on(window, 'resize', function(){element.spof();});return this;}, defs:function defs(){return this._defs;}, spof:function spof(){if(this.doSpof){var pos=this.node.getScreenCTM();if(pos)this.style('left', -pos.e % 1 + 'px').style('top', -pos.f % 1 + 'px');}return this;}, fixSubPixelOffset:function fixSubPixelOffset(){this.doSpof = true;return this;}, remove:function remove(){if(this.parent){this.parent.removeChild(this.node);this.parent = null;}return this;}}});SVG.Shape = SVG.invent({create:function create(element){this.constructor.call(this, element);}, inherit:SVG.Element});SVG.Symbol = SVG.invent({create:'symbol', inherit:SVG.Container, construct:{symbol:function symbol(){return this.defs().put(new SVG.Symbol());}}});SVG.Use = SVG.invent({create:'use', inherit:SVG.Shape, extend:{element:function element(_element){this.target = _element;return this.attr('href', '#' + _element, SVG.xlink);}}, construct:{use:function use(element){return this.put(new SVG.Use()).element(element);}}});SVG.Rect = SVG.invent({create:'rect', inherit:SVG.Shape, construct:{rect:function rect(width, height){return this.put(new SVG.Rect().size(width, height));}}});SVG.Ellipse = SVG.invent({create:'ellipse', inherit:SVG.Shape, extend:{x:function x(_x4){return _x4 == null?this.cx() - this.attr('rx'):this.cx(_x4 + this.attr('rx'));}, y:function y(_y4){return _y4 == null?this.cy() - this.attr('ry'):this.cy(_y4 + this.attr('ry'));}, cx:function cx(x){return x == null?this.attr('cx'):this.attr('cx', new SVG.Number(x).divide(this.trans.scaleX));}, cy:function cy(y){return y == null?this.attr('cy'):this.attr('cy', new SVG.Number(y).divide(this.trans.scaleY));}, width:function width(_width2){return _width2 == null?this.attr('rx') * 2:this.attr('rx', new SVG.Number(_width2).divide(2));}, height:function height(_height2){return _height2 == null?this.attr('ry') * 2:this.attr('ry', new SVG.Number(_height2).divide(2));}, size:function size(width, height){var p=proportionalSize(this.bbox(), width, height);return this.attr({rx:new SVG.Number(p.width).divide(2), ry:new SVG.Number(p.height).divide(2)});}}, construct:{circle:function circle(size){return this.ellipse(size, size);}, ellipse:function ellipse(width, height){return this.put(new SVG.Ellipse()).size(width, height).move(0, 0);}}});SVG.Line = SVG.invent({create:'line', inherit:SVG.Shape, extend:{x:function x(_x5){var b=this.bbox();return _x5 == null?b.x:this.attr({x1:this.attr('x1') - b.x + _x5, x2:this.attr('x2') - b.x + _x5});}, y:function y(_y5){var b=this.bbox();return _y5 == null?b.y:this.attr({y1:this.attr('y1') - b.y + _y5, y2:this.attr('y2') - b.y + _y5});}, cx:function cx(x){var half=this.bbox().width / 2;return x == null?this.x() + half:this.x(x - half);}, cy:function cy(y){var half=this.bbox().height / 2;return y == null?this.y() + half:this.y(y - half);}, width:function width(_width3){var b=this.bbox();return _width3 == null?b.width:this.attr(this.attr('x1') < this.attr('x2')?'x2':'x1', b.x + _width3);}, height:function height(_height3){var b=this.bbox();return _height3 == null?b.height:this.attr(this.attr('y1') < this.attr('y2')?'y2':'y1', b.y + _height3);}, size:function size(width, height){var p=proportionalSize(this.bbox(), width, height);return this.width(p.width).height(p.height);}, plot:function plot(x1, y1, x2, y2){return this.attr({x1:x1, y1:y1, x2:x2, y2:y2});}}, construct:{line:function line(x1, y1, x2, y2){return this.put(new SVG.Line().plot(x1, y1, x2, y2));}}});SVG.Polyline = SVG.invent({create:'polyline', inherit:SVG.Shape, construct:{polyline:function polyline(p){return this.put(new SVG.Polyline()).plot(p);}}});SVG.Polygon = SVG.invent({create:'polygon', inherit:SVG.Shape, construct:{polygon:function polygon(p){return this.put(new SVG.Polygon()).plot(p);}}});SVG.extend(SVG.Polyline, SVG.Polygon, {morphArray:SVG.PointArray, plot:function plot(p){return this.attr('points', this.array = new SVG.PointArray(p, [[0, 0]]));}, move:function move(x, y){return this.attr('points', this.array.move(x, y));}, x:function x(_x6){return _x6 == null?this.bbox().x:this.move(_x6, this.bbox().y);}, y:function y(_y6){return _y6 == null?this.bbox().y:this.move(this.bbox().x, _y6);}, width:function width(_width4){var b=this.bbox();return _width4 == null?b.width:this.size(_width4, b.height);}, height:function height(_height4){var b=this.bbox();return _height4 == null?b.height:this.size(b.width, _height4);}, size:function size(width, height){var p=proportionalSize(this.bbox(), width, height);return this.attr('points', this.array.size(p.width, p.height));}});SVG.Path = SVG.invent({create:'path', inherit:SVG.Shape, extend:{plot:function plot(p){return this.attr('d', this.array = new SVG.PathArray(p, [['M', 0, 0]]));}, move:function move(x, y){return this.attr('d', this.array.move(x, y));}, x:function x(_x7){return _x7 == null?this.bbox().x:this.move(_x7, this.bbox().y);}, y:function y(_y7){return _y7 == null?this.bbox().y:this.move(this.bbox().x, _y7);}, size:function size(width, height){var p=proportionalSize(this.bbox(), width, height);return this.attr('d', this.array.size(p.width, p.height));}, width:function width(_width5){return _width5 == null?this.bbox().width:this.size(_width5, this.bbox().height);}, height:function height(_height5){return _height5 == null?this.bbox().height:this.size(this.bbox().width, _height5);}}, construct:{path:function path(d){return this.put(new SVG.Path()).plot(d);}}});SVG.Image = SVG.invent({create:'image', inherit:SVG.Shape, extend:{load:function load(url){if(!url){return this;}var self=this, img=document.createElement('img');img.onload = function(){var p=self.doc(SVG.Pattern);if(self.width() == 0 && self.height() == 0)self.size(img.width, img.height);if(p && p.width() == 0 && p.height() == 0)p.size(self.width(), self.height());if(typeof self._loaded === 'function')self._loaded.call(self, {width:img.width, height:img.height, ratio:img.width / img.height, url:url});};return this.attr('href', img.src = this.src = url, SVG.xlink);}, loaded:function loaded(_loaded){this._loaded = _loaded;return this;}}, construct:{image:function image(source, width, height){return this.put(new SVG.Image()).load(source).size(width || 0, height || width || 0);}}});SVG.Text = SVG.invent({create:function create(){this.constructor.call(this, SVG.create('text'));this._leading = new SVG.Number(1.3);this._rebuild = true;this._build = false;this.attr('font-family', SVG.defaults.attrs['font-family']);}, inherit:SVG.Shape, extend:{x:function x(_x8){if(_x8 == null){return this.attr('x');}if(!this.textPath)this.lines.each(function(){if(this.newLined)this.x(_x8);});return this.attr('x', _x8);}, y:function y(_y8){var oy=this.attr('y'), o=typeof oy === 'number'?oy - this.bbox().y:0;if(_y8 == null){return typeof oy === 'number'?oy - o:oy;}return this.attr('y', typeof _y8 === 'number'?_y8 + o:_y8);}, cx:function cx(x){return x == null?this.bbox().cx:this.x(x - this.bbox().width / 2);}, cy:function cy(y){return y == null?this.bbox().cy:this.y(y - this.bbox().height / 2);}, text:function text(_text){if(typeof _text === 'undefined'){return this.content;}this.clear().build(true);if(typeof _text === 'function'){_text.call(this, this);}else {_text = (this.content = _text).split('\n');for(var i=0, il=_text.length; i < il; i++) this.tspan(_text[i]).newLine();}return this.build(false).rebuild();}, size:function size(_size){return this.attr('font-size', _size).rebuild();}, leading:function leading(value){if(value == null){return this._leading;}this._leading = new SVG.Number(value);return this.rebuild();}, rebuild:function rebuild(_rebuild){if(typeof _rebuild == 'boolean')this._rebuild = _rebuild;if(this._rebuild){var self=this;this.lines.each(function(){if(this.newLined){if(!this.textPath)this.attr('x', self.attr('x'));this.attr('dy', self._leading * new SVG.Number(self.attr('font-size')));}});this.fire('rebuild');}return this;}, build:function build(_build){this._build = !!_build;return this;}}, construct:{text:function text(_text2){return this.put(new SVG.Text()).text(_text2);}, plain:function plain(text){return this.put(new SVG.Text()).plain(text);}}});SVG.TSpan = SVG.invent({create:'tspan', inherit:SVG.Shape, extend:{text:function text(_text3){typeof _text3 === 'function'?_text3.call(this, this):this.plain(_text3);return this;}, dx:function dx(_dx){return this.attr('dx', _dx);}, dy:function dy(_dy){return this.attr('dy', _dy);}, newLine:function newLine(){var t=this.doc(SVG.Text);this.newLined = true;return this.dy(t._leading * t.attr('font-size')).attr('x', t.x());}}});SVG.extend(SVG.Text, SVG.TSpan, {plain:function plain(text){if(this._build === false)this.clear();this.node.appendChild(document.createTextNode(this.content = text));return this;}, tspan:function tspan(text){var node=(this.textPath || this).node, tspan=new SVG.TSpan();if(this._build === false)this.clear();node.appendChild(tspan.node);tspan.parent = this;if(this instanceof SVG.Text)this.lines.add(tspan);return tspan.text(text);}, clear:function clear(){var node=(this.textPath || this).node;while(node.hasChildNodes()) node.removeChild(node.lastChild);if(this instanceof SVG.Text){delete this.lines;this.lines = new SVG.Set();this.content = '';}return this;}, length:function length(){return this.node.getComputedTextLength();}});SVG.TextPath = SVG.invent({create:'textPath', inherit:SVG.Element, parent:SVG.Text, construct:{path:function path(d){this.textPath = new SVG.TextPath();while(this.node.hasChildNodes()) this.textPath.node.appendChild(this.node.firstChild);this.node.appendChild(this.textPath.node);this.track = this.doc().defs().path(d);this.textPath.parent = this;this.textPath.attr('href', '#' + this.track, SVG.xlink);return this;}, plot:function plot(d){if(this.track)this.track.plot(d);return this;}}});SVG.Nested = SVG.invent({create:function create(){this.constructor.call(this, SVG.create('svg'));this.style('overflow', 'visible');}, inherit:SVG.Container, construct:{nested:function nested(){return this.put(new SVG.Nested());}}});SVG.A = SVG.invent({create:'a', inherit:SVG.Container, extend:{to:function to(url){return this.attr('href', url, SVG.xlink);}, show:function show(target){return this.attr('show', target, SVG.xlink);}, target:function target(_target){return this.attr('target', _target);}}, construct:{link:function link(url){return this.put(new SVG.A()).to(url);}}});SVG.extend(SVG.Element, {linkTo:function linkTo(url){var link=new SVG.A();if(typeof url == 'function')url.call(link, link);else link.to(url);return this.parent.put(link).put(this);}});SVG.Marker = SVG.invent({create:'marker', inherit:SVG.Container, extend:{width:function width(_width6){return this.attr('markerWidth', _width6);}, height:function height(_height6){return this.attr('markerHeight', _height6);}, ref:function ref(x, y){return this.attr('refX', x).attr('refY', y);}, update:function update(block){this.clear();if(typeof block == 'function')block.call(this, this);return this;}, toString:function toString(){return 'url(#' + this.id() + ')';}}, construct:{marker:function marker(width, height, block){return this.defs().marker(width, height, block);}}});SVG.extend(SVG.Defs, {marker:function marker(width, height, block){return this.put(new SVG.Marker()).size(width, height).ref(width / 2, height / 2).viewbox(0, 0, width, height).attr('orient', 'auto').update(block);}});SVG.extend(SVG.Line, SVG.Polyline, SVG.Polygon, SVG.Path, {marker:function marker(_marker, width, height, block){var attr=['marker'];if(_marker != 'all')attr.push(_marker);attr = attr.join('-');_marker = arguments[1] instanceof SVG.Marker?arguments[1]:this.doc().marker(width, height, block);return this.attr(attr, _marker);}});var sugar={stroke:['color', 'width', 'opacity', 'linecap', 'linejoin', 'miterlimit', 'dasharray', 'dashoffset'], fill:['color', 'opacity', 'rule'], prefix:function prefix(t, a){return a == 'color'?t:t + '-' + a;}};['fill', 'stroke'].forEach(function(m){var i, extension={};extension[m] = function(o){if(typeof o == 'string' || SVG.Color.isRgb(o) || o && typeof o.fill === 'function')this.attr(m, o);else for(i = sugar[m].length - 1; i >= 0; i--) if(o[sugar[m][i]] != null)this.attr(sugar.prefix(m, sugar[m][i]), o[sugar[m][i]]);return this;};SVG.extend(SVG.Element, SVG.FX, extension);});SVG.extend(SVG.Element, SVG.FX, {rotate:function rotate(deg, x, y){return this.transform({rotation:deg || 0, cx:x, cy:y});}, skew:function skew(x, y){return this.transform({skewX:x || 0, skewY:y || 0});}, scale:function scale(x, y){return this.transform({scaleX:x, scaleY:y == null?x:y});}, translate:function translate(x, y){return this.transform({x:x, y:y});}, matrix:function matrix(m){return this.transform({matrix:m});}, opacity:function opacity(value){return this.attr('opacity', value);}});SVG.extend(SVG.Rect, SVG.Ellipse, SVG.FX, {radius:function radius(x, y){return this.attr({rx:x, ry:y || x});}});SVG.extend(SVG.Path, {length:function length(){return this.node.getTotalLength();}, pointAt:function pointAt(length){return this.node.getPointAtLength(length);}});SVG.extend(SVG.Parent, SVG.Text, SVG.FX, {font:function font(o){for(var k in o) k == 'leading'?this.leading(o[k]):k == 'anchor'?this.attr('text-anchor', o[k]):k == 'size' || k == 'family' || k == 'weight' || k == 'stretch' || k == 'variant' || k == 'style'?this.attr('font-' + k, o[k]):this.attr(k, o[k]);return this;}});SVG.Set = SVG.invent({create:function create(){this.clear();}, extend:{add:function add(){var i, il, elements=[].slice.call(arguments);for(i = 0, il = elements.length; i < il; i++) this.members.push(elements[i]);return this;}, remove:function remove(element){var i=this.index(element);if(i > -1)this.members.splice(i, 1);return this;}, each:function each(block){for(var i=0, il=this.members.length; i < il; i++) block.apply(this.members[i], [i, this.members]);return this;}, clear:function clear(){this.members = [];return this;}, has:function has(element){return this.index(element) >= 0;}, index:function index(element){return this.members.indexOf(element);}, get:function get(i){return this.members[i];}, first:function first(){return this.get(0);}, last:function last(){return this.get(this.members.length - 1);}, valueOf:function valueOf(){return this.members;}, bbox:function bbox(){var box=new SVG.BBox();if(this.members.length == 0){return box;}var rbox=this.members[0].rbox();box.x = rbox.x;box.y = rbox.y;box.width = rbox.width;box.height = rbox.height;this.each(function(){box = box.merge(this.rbox());});return box;}}, construct:{set:function set(){return new SVG.Set();}}});SVG.SetFX = SVG.invent({create:function create(set){this.set = set;}});SVG.Set.inherit = function(){var m, methods=[];for(var m in SVG.Shape.prototype) if(typeof SVG.Shape.prototype[m] == 'function' && typeof SVG.Set.prototype[m] != 'function')methods.push(m);methods.forEach(function(method){SVG.Set.prototype[method] = function(){for(var i=0, il=this.members.length; i < il; i++) if(this.members[i] && typeof this.members[i][method] == 'function')this.members[i][method].apply(this.members[i], arguments);return method == 'animate'?this.fx || (this.fx = new SVG.SetFX(this)):this;};});methods = [];for(var m in SVG.FX.prototype) if(typeof SVG.FX.prototype[m] == 'function' && typeof SVG.SetFX.prototype[m] != 'function')methods.push(m);methods.forEach(function(method){SVG.SetFX.prototype[method] = function(){for(var i=0, il=this.set.members.length; i < il; i++) this.set.members[i].fx[method].apply(this.set.members[i].fx, arguments);return this;};});};SVG.extend(SVG.Element, {data:function data(a, v, r){if(typeof a == 'object'){for(v in a) this.data(v, a[v]);}else if(arguments.length < 2){try{return JSON.parse(this.attr('data-' + a));}catch(e) {return this.attr('data-' + a);}}else {this.attr('data-' + a, v === null?null:r === true || typeof v === 'string' || typeof v === 'number'?v:JSON.stringify(v));}return this;}});SVG.extend(SVG.Element, {remember:function remember(k, v){if(typeof arguments[0] == 'object')for(var v in k) this.remember(v, k[v]);else if(arguments.length == 1){return this.memory()[k];}else this.memory()[k] = v;return this;}, forget:function forget(){if(arguments.length == 0)this._memory = {};else for(var i=arguments.length - 1; i >= 0; i--) delete this.memory()[arguments[i]];return this;}, memory:function memory(){return this._memory || (this._memory = {});}});function camelCase(s){return s.toLowerCase().replace(/-(.)/g, function(m, g){return g.toUpperCase();});}function fullHex(hex){return hex.length == 4?['#', hex.substring(1, 2), hex.substring(1, 2), hex.substring(2, 3), hex.substring(2, 3), hex.substring(3, 4), hex.substring(3, 4)].join(''):hex;}function compToHex(comp){var hex=comp.toString(16);return hex.length == 1?'0' + hex:hex;}function proportionalSize(box, width, height){if(width == null || height == null){if(height == null)height = box.height / box.width * width;else if(width == null)width = box.width / box.height * height;}return {width:width, height:height};}function at(o, pos){return typeof o.from == 'number'?o.from + (o.to - o.from) * pos:o instanceof SVG.Color || o instanceof SVG.Number?o.at(pos):pos < 1?o.from:o.to;}function arrayToString(a){for(var i=0, il=a.length, s=''; i < il; i++) {s += a[i][0];if(a[i][1] != null){s += a[i][1];if(a[i][2] != null){s += ' ';s += a[i][2];if(a[i][3] != null){s += ' ';s += a[i][3];s += ' ';s += a[i][4];if(a[i][5] != null){s += ' ';s += a[i][5];s += ' ';s += a[i][6];if(a[i][7] != null){s += ' ';s += a[i][7];}}}}}}return s + ' ';}function boxProperties(b){b.x2 = b.x + b.width;b.y2 = b.y + b.height;b.cx = b.x + b.width / 2;b.cy = b.y + b.height / 2;}function parseMatrix(o){if(o.matrix){var m=o.matrix.replace(/\s/g, '').split(',');if(m.length == 6){o.a = parseFloat(m[0]);o.b = parseFloat(m[1]);o.c = parseFloat(m[2]);o.d = parseFloat(m[3]);o.e = parseFloat(m[4]);o.f = parseFloat(m[5]);}}return o;}function idFromReference(url){var m=url.toString().match(SVG.regex.reference);if(m){return m[1];}}return SVG;});

},{}],14:[function(require,module,exports){
'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

require('../vendor/svg');
require('../vendor/svg.export');
require('../vendor/rgbcolor');
require('../vendor/StackBlur');
require('../vendor/canvg');

var settingsData = require('../data/settings');
var observer = require('../util/observer');

var CanvasView = (function () {
    function CanvasView(element) {
        _classCallCheck(this, CanvasView);

        this.element = element;

        observer(settingsData, 'playWord', this.syncData.bind(this));
        observer(settingsData, 'workWord', this.syncData.bind(this));
        observer(settingsData, 'activeObject.id', this.syncData.bind(this));

        window.addEventListener('resize', this.syncLayout.bind(this));
        window.addEventListener('load', this.syncLayout.bind(this));
        window.addEventListener('orientationchange', this.syncLayout.bind(this));

        this.syncData();
        this.syncLayout();
    }

    _createClass(CanvasView, [{
        key: 'element',
        set: function (element) {
            this._element = element;

            var draw = this.draw = SVG(element).size(element.offsetWidth, element.offsetHeight);
            this.backdrop = draw.rect(element.offsetWidth, element.offsetHeight).attr({ fill: '#fff' });

            this.objectImage = draw.image(settingsData.activeObject.imagePath.preview);

            var workWord;
            var playWord;

            this.text = draw.text(function (add) {
                add.tspan('the world');
                add.tspan('is made of ').newLine();
                workWord = add.tspan('');
                add.tspan('and ').newLine();
                playWord = add.tspan('');
            });

            workWord.fill('#888');
            playWord.fill('#888');

            this.workWord = workWord;
            this.playWord = playWord;
        },
        get: function () {
            return this._element;
        }
    }, {
        key: 'syncData',
        value: function syncData() {
            this.workWord.clear().text(settingsData.workWord);
            this.playWord.clear().text(settingsData.playWord);
            this.objectImage.load(settingsData.activeObject.imagePath.preview);
        }
    }, {
        key: 'syncLayout',
        value: function syncLayout() {
            var posterHeight = this.element.offsetHeight;
            var posterWidth = this.element.offsetWidth;

            this.backdrop.size(posterWidth, posterHeight);

            this.objectImage.size(posterWidth, posterHeight / 2);
            this.objectImage.x(0);
            this.objectImage.cy(posterHeight * 0.35);

            this.text.cy(posterHeight * 0.75);
            this.text.x(posterWidth / 2);

            this.text.font({
                family: 'Open Sans',
                size: posterHeight / 16,
                anchor: 'middle',
                leading: '1.5em'
            });

            this.draw.size(posterWidth, posterHeight);
        }
    }, {
        key: 'download',
        value: function download() {
            var canvasElement = document.createElement('canvas');
            canvasElement.width = '1500px';
            canvasElement.height = '2000px';

            canvg(canvasElement, this.element.innerHTML, {
                forceRedraw: function forceRedraw() {
                    return true;
                },
                renderCallback: function renderCallback() {
                    var downloadUrl = canvasElement.toDataURL('image/jpeg', 1);
                    var anchorELement = document.createElement('a');
                    anchorELement.setAttribute('download', encodeURIComponent(settingsData.workWord) + '-' + encodeURIComponent(settingsData.playWord) + '-' + encodeURIComponent(settingsData.activeObject.id) + '.jpg');
                    anchorELement.setAttribute('href', downloadUrl);
                    document.body.appendChild(anchorELement);
                    anchorELement.click();
                }
            });
        }
    }]);

    return CanvasView;
})();

module.exports = CanvasView;

//posterCanvasElement.addEventListener('click', function(){
//    var canvasElement = document.createElement('canvas');
//    canvasElement.width = '1500px';
//    canvasElement.height = '2000px';
//
//    canvg(canvasElement, posterCanvasElement.innerHTML, {
//        forceRedraw: function(){
//            return true;
//        },
//        renderCallback: function(){
//            var downloadUrl = canvasElement.toDataURL("image/jpeg", 1);
//            var anchorELement = document.createElement('a');
//            anchorELement.setAttribute('download', 'poster.jpg');
//            anchorELement.setAttribute('href', downloadUrl);
//            document.body.appendChild(anchorELement);
//            anchorELement.click();
//        }
//    });
//});

},{"../data/settings":5,"../util/observer":8,"../vendor/StackBlur":9,"../vendor/canvg":10,"../vendor/rgbcolor":11,"../vendor/svg":13,"../vendor/svg.export":12}],15:[function(require,module,exports){
'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var rivets = require('./../../../../bower_components/rivets/dist/rivets.js');
var objectData = require('../data/objects');
var settingsData = require('../data/settings');
var CanvasView = require('./Canvas');

require('../binder/backgroundImage');

var CreatorLayoutView = (function () {
    function CreatorLayoutView(element) {
        _classCallCheck(this, CreatorLayoutView);

        this.data = {
            objects: objectData,
            settings: settingsData,
            onPosterSelect: (function (event, data) {
                this.data.settings.activeObject = data.object;
            }).bind(this),
            onDownloadClick: (function (event, data) {
                this._canvasView.download();
            }).bind(this)
        };

        this.element = element;
    }

    _createClass(CreatorLayoutView, [{
        key: 'element',
        set: function (element) {
            this._element = element;
            this._rivetsView = rivets.bind(this._element, this.data);
            this._canvasView = new CanvasView(this._element.querySelector('.creatorLayout_previewCanvas'));
        },
        get: function () {
            return this._element;
        }
    }]);

    return CreatorLayoutView;
})();

module.exports = CreatorLayoutView;

},{"../binder/backgroundImage":3,"../data/objects":4,"../data/settings":5,"./../../../../bower_components/rivets/dist/rivets.js":1,"./Canvas":14}]},{},[6]);
