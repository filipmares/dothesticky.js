// Uses AMD or browser globals to create a jQuery plugin.

// It does not try to register in a CommonJS environment since
// jQuery is not likely to run in those environments.
// See jqueryPluginCommonJs.js for that version.
'use strict';
(function(factory) {

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function($) {

    function DoTheSticky($el, options) {

        this.options = $.extend({
            top: 0,
            // container: $el,
            stickies: '.sticky',
            soaps: '.soap'
        }, options);

        this.isWrapping = false;
        this.$el = $el;
        this.$container = options.container || this.$el.find(this.options.stickies).parent();
        this.$children = this.$container.children(this.options.stickies);

        this.init();
    }

    DoTheSticky.prototype = {

        init: function() {
            var _this = this,
                $this, styleBlock;

            // wrap all chrildren
            this.$children.each(function(){
                _this.wrapChild($(this));
            });

            $('<style></style>').html(
                '.glue {' +
                    'position:fixed;' +
                    'pointer-events:none;' +
                    'top:' + (_this.options.top + _this.$el.offset().top) + 'px;' +
                    'z-index: 0' +
                '}' +
                '.glue.move { position: absolute; }' +
                _this.options.stickies + '{' +
                    'z-index: 1;' +
                '}'
            ).appendTo('body');

            _this.$container.css('position', 'relative');

            _this.$container.get(0).addEventListener("DOMNodeInserted", $.proxy(_this.updateListener, _this), false);

            // start scroll event listener
            this.$el.on('scroll', $.proxy(this.doStickyOperation, this));
        },

        updateListener: function(e) {
            var $el = $(e.target),
                _this = this;

            if ($el.is(_this.options.stickies) &&
                !_this.isWrapping) {
                _this.wrapChild($el);
                _this.$children = _this.$container.find(this.options.stickies);
            }
        },

        wrapChild: function($el) {
            var _this = this;
            console.count();
            _this.isWrapping = true;
            $el.wrap('<div></div>');
            _this.isWrapping = false;
            $el.parent().height($el.outerHeight());
            $.data($el[0], 'top', $el.offset().top - _this.getTrueOffsetTop(_this.$container));
        },

        getTrueOffsetTop: function($el) {
            return $el.offset().top + parseInt($el.css('margin-top')) + parseInt($el.css('border-top-width'));
        },

        getTrueOuterHeight: function($el) {
            return $el.outerHeight() +
                    parseInt($el.css('border-top-width')) +
                    parseInt($el.css('border-bottom-width')) +
                    parseInt($el.css('margin-top')) +
                    parseInt($el.css('margin-bottom'));
        },

        doStickyOperation: function() {
            var scrollPosition = this.$el.scrollTop(),
                options = this.options,
                _this = this,
                i, $el, $nextEl, $prevEl, elOffsetTop, nextElOffsetTop;

            this.$children.each(function(i){

                $el = _this.$children.eq(i),
                elOffsetTop = $.data($el[0], 'top');

                console.log('scroll position:', scrollPosition)
                if (scrollPosition >= elOffsetTop + _this.options.top) {

                    if (!$el.hasClass('glue')){
                        console.log('stick', i, 'elOffsetTop:', elOffsetTop);
                        $el.addClass('glue');
                    }

                    $nextEl = _this.$children.eq(i+1);
                    if ($nextEl.length &&
                        !$el.hasClass('move') &&
                        scrollPosition >= $.data($nextEl[0], 'top') - $el.outerHeight()) {

                        $el.addClass('move').css({
                            top: $.data($nextEl[0], 'top') - ($el.outerHeight() + parseInt($el.css('margin-bottom')) + parseInt($nextEl.css('margin-top')))
                        });
                    }

                } else {

                    if ($el.hasClass('glue')) {
                        $el.removeClass('glue');
                    }

                    $prevEl = _this.$children.eq(i-1);
                    if ($prevEl.length &&
                        scrollPosition < elOffsetTop - $prevEl.outerHeight()) {
                        $prevEl.removeClass("move").removeAttr('style');
                    }
                }
            });
        }

    };

    $.fn.doTheSticky = function(options) {
        return this.each(function() {
            new DoTheSticky($(this), options);
        });
    };
}));