(function () {
    var VideoApresentation = function (element) {
        if (!(this instanceof VideoApresentation)) {
            return new VideoApresentation(element);
        }
        
        //Properties
        this.element = this.util.getElement(element);
    };
    VideoApresentation.fn = VideoApresentation.prototype = {
        each: function (callback) {
            if (this.element instanceof Array) {
                for (var i = 0, len = this.element.length; i < len; i++) {
                    return callback.call(VideoApresentation(this.element[i]), i);
                }
            } else {
                return callback.call(VideoApresentation(this.element), 0);
            }
        },
        on: function (event, callback) {
            this.each(function () {
                var t = this;
                this.element.addEventListener(event, function (e) {
                    callback.call(t, e);
                }, false);
            });
            return this;
        },
        off: function (event, callback) {
            this.each(function () {
                this.element.removeEventListener(event, callback);
            });
            return this;
        },
        getError: function () {
            var error = {
                code: -1,
                string: "Error not stated"
            };
            if (typeof this.element.error.code !== "undefined") {
                error.code = this.element.error.code;
                switch (error.code) {
                    case 1:
                        error.strig = "Media aborted by user agent";
                    break;
                    case 2:
                        error.strig = "A network error accured";
                    break;
                    case 4:
                        error.strig = "Media not supported";
                    break;
                }
            }
            return error;
        },
        currentTime: function (time, human) {
            if (typeof human === "undefined") {
                human = false;
            }
            return this.each(function () {
                if (typeof time === "undefined" || time === null) {
                    if (human) {
                        return this.util.timeSecondsToHuman(this.element.currentTime);
                    } else {
                        return this.element.currentTime;
                    }
                } else {
                    var s = this.util.timeHumanToSeconds(time);
                    this.element.currentTime = s;
                }
                return this;
            });
        },
        eventOrAction: function (event, callback) {
            this.each(function () {
                if (typeof callback === "function") {
                    this.on(event, callback);
                } else {
                    this.element[event]();
                }
            });
            return this;
        },
        play: function (callback) {
            this.eventOrAction('play', callback);
            return this;
        },
        pause: function (callback) {
            this.eventOrAction('pause', callback);
            return this;
        },
        stop: function (callback) {
            this.each(function () {
                if (typeof callback === "function") {
                    this.on('stop', callback);
                } else {
                    this.pause();
                    this.currentTime(0);
                    var event = new Event('stop');
                    this.element.dispatchEvent(event);
                }
            });
            return this;
        },
        restart: function () {
            this.each(function () {
                this.stop().play();
            });
            return this;
        },
        css: function (property, value) {
            return this.each(function () {
                if (property instanceof Object) {
                    for (var p in property) {
                        this.element.style[p] = property[p];
                    }
                } else if (typeof value !== "undefined") {
                    this.element.style[property] = value;
                } else {
                    var value = getComputedStyle(this.element).getPropertyValue(property);
                    return this.util.extractNumber(value);
                }
                return this;
            });
        },
        offset: function () {
            return this.each(function () {
                return {
                    top: this.element.offsetTop,
                    left: this.element.offsetLeft,
                    bottom: this.element.offsetTop + Number(this.css("height")) + 31,
                    right: this.element.offsetLeft + Number(this.css("width"))
                };
            });
        },
        showControls: function () {
            this.each(function () {
                this.element.controls = false;
                new this.canvas(this);
            });
            return this;
        },
        canvas: function canvas(context) {
            if (!(this instanceof canvas)) {
                return new canvas(this);
            } else {
                var context = this.context = context;
                var canvas = this.canvas = document.createElement('canvas');
            }
            this.canvas.style.width = this.context.css("width");
            this.canvas.style.height = 50;
            this.canvas.style.position = "abslute";
            this.canvas.style.top = this.context.offset().bottom;
            this.canvas.style.left = this.context.offset().left;
            document.getElementByTagName("body")[0].appendChild(this.canvas);
            this.panel = this.canvas.getContext('2d');
            
            this.objects = [];
            
            function Objs () {
                if (typeof this !== "object") {
                    return new this();
                }
                this.x = 0;
                this.y = 0;
                this.width = 0;
                this.height = 0;
                
                this.color = function (r, g, b) {
                    return new context.util.color(r, g, b);
                };
                
                this.render = function (fill) {
                    canvas[fill](this.x, this.y, this.width, this.height);
                };
            }
            
            this.rect = function Rect() {
                Objs.call(this);
                this.render("fillRect");
            };
        },
        util: {
            color: function color (r, g, b) {
                if (!(this instanceof color)) {
                    var obj = new color(r, g, b);
                    return obj.toString();
                } else {
                    this.r = r;
                    this.g = g;
                    this.b = b;
                }
                
                this.toString = function () {
                    var color = "rgb(" + this.r + ", " + this.g + ", " + this.b + ")";
                    return color;
                };
            },
            extractNumber: function (value) {
                var test_number = Number(value.substr(0,1));
                if (!isNaN(test_number)) {
                    var pos = value.search(/[a-z]/);
                    if (pos !== -1) {
                        return value.substr(0, pos);
                    }
                }
                return value;
            },
            timeHumanToSeconds: function (time) {
                var time = String(time).split(":").reverse();
                var count = time.length;
                
                var seconds = 0;
                seconds += Number(time[0]);
                
                if (count > 1) {
                    seconds += (Number(time[1]) * 60);
                }
                
                if (count > 2) {
                    seconds += (Number(time[2]) * 60 * 60);
                }
                
                return Math.floor(seconds);
                
            },
            timeSecondsToHuman: function (time) {
                var hour = Math.floor(time / 3600);
                var minutes = Math.floor(time % 3600 / 60);
                var seconds = Math.floor(time % 3600 % 60);

                var currentTime = "";
                if (hour > 0) {
                    currentTime += String(hour) + ":";
                }

                if (String(minutes).length !== 2) {
                    currentTime += "0";
                }
                currentTime += minutes + ":";

                if (String(seconds).length !== 2) {
                    currentTime += "0";
                }
                currentTime += seconds;

                return currentTime;
            },
            getElement: function (element) {
                if (typeof element === "object") {
                    return element;
                }
                var elements_str = element.split(",");
                var elements = [];
                
                for (var i = 0, len = elements_str.length; i < len; i++) {
                    var e = elements_str[i].trim();
                    if (e.substr(0, 1) === "#") {
                        elements.push(document.getElementById(e.substr(1, e.length)));
                    } else if (e.substr(0, 1) === ".") {
                        var el = document.getElementsByClassName(e.substr(1, e.length));
                        for (var a = 0, l = el.length; a < l; a++) {
                            elements.push(el[a]);
                        }
                    } else {
                        var el = document.querySelectorAll(e);
                        for (var a = 0, l = el.length; a < l; a++) {
                            elements.push(el[a]);
                        }
                    }
                }
                return elements;
            }
        }
    };
    
    window.VideoApresentation = VideoApresentation;
    window.$ = VideoApresentation;
})();