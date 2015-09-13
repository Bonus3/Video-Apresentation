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
        createCanvas: function () {
            var canvas = document.createElement('canvas');
            canvas.width = this.css("width");
            canvas.height = 50;
            canvas.style.position = "absolute";
            canvas.style.top = this.offset().bottom;
            canvas.style.left = this.offset().left;
            var ctx = canvas.getContext('2d');
            
            ctx.fillStyle = "rgb(255,0,0)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            document.getElementsByTagName("body")[0].appendChild(canvas);
        },
        util: {
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