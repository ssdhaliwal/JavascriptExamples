/**
 * GISMaskHelper.js is designed to allow data collection for input of GIS formats:
 * 
 * Author:  Seraj Dhaliwal/seraj.dhaliwal@live.com
 * Github:  https://github.com/ssdhaliwal/JavascriptExamples
 * Version: 1.0b
 * 
 * DD   Decimal Degrees
 * DMS  Degree Minute Seconds
 * DDM  Degree Decimal Minutes
 * GARS Global Area Reference System
 * GeoREF
 *      World Geographic Reference System
 * UTM  Universal Transverse Mercator
 * USNG United States National Grid
 * MGRS Military Grid Reference System
 * 
 */
define([], function () {
    // static variables
    Array.prototype.addRange = function (start, stop) {
        let char = "";

        for (let min = start.charCodeAt(0), max = stop.charCodeAt(0); min <= max; ++min) {
            char = String.fromCharCode(min);
            if (this.indexOf(char) === -1) {
                this.push(String.fromCharCode(min));
            }
        }

        return this;
    };

    var GISMaskHelper = function (args, callback) {
        // internal counter/tracking variables
        this.valuesRange = {};
        this.ignoreRange = {};
        this.delimiterRange = {};
        this.maxValueRange = {};
        this.selStart = 0;
        this.selEnd = 0;
        this.errorMessage = "";
        this.valueOffsetInit = -1;
        this.valueOffsetCurrent = -1;

        this.element = args.element;
        this.title = args.title;

        this.area = 0;
        this.delimiter = args.delimiter;
        this.callback = callback;

        if ((args.delimiter !== null) && (args.delimiter !== undefined)) {
            this.mask = args.mask.split(args.delimiter);
            this.placeholder = args.placeholder.split(args.delimiter);

            this.value = [];
            for (let i = 0, z = this.mask.length; i < z; i++) {
                this.value.push(this.placeholder[i]);
            }
        } else {
            this.area = 0;
            this.mask = [args.mask];
            this.placeholder = [args.placeholder];

            this.value = [this.placeholder];
        }
    };

    GISMaskHelper.prototype.selectInputArea = function (e) {
        self = e.data.this;

        // if no delimiter, then area = 0
        if ((self.delimiter === null) || (self.delimiter === undefined)) {
            self.area = 0;
        } else {
            //let mask = self.mask.join(self.delimiter).replace(/\[.*?\]/g, "-");
            let placeholder = "", selStart = 0, selEnd = 0;
            for (let i = 0, z = self.placeholder.length; i < z; i++) {
                selStart = (i === 0 ? i : placeholder.length + self.delimiter.length - 1);
                placeholder += self.placeholder[i] + self.delimiter;
                selEnd = placeholder.length - self.delimiter.length;

                if (placeholder.length > e.currentTarget.selectionStart) {
                    self.area = i;

                    self.selStart = selStart;
                    self.selEnd = selEnd;

                    e.currentTarget.selectionStart = self.selStart;
                    e.currentTarget.selectionEnd = self.selEnd;
                    break;
                }
            }
        }
    };

    GISMaskHelper.prototype.processKeyInput = function (e) {
        self = e.data.this;

        // if enter is pressed - do callback?
        if (e.key === "Enter") {
            let val = $(self.element).val().trim();
        } else {
            let value = self.value[self.area].split("");
            let placeholder = self.placeholder[self.area];
            let key = e.key, keyApplied = false;

            // check if ignore key is defined
            if ((self.ignoreRange[self.area] !== null) && (self.ignoreRange[self.area] !== undefined)) {
                if (self.ignoreRange[self.area].keys.indexOf(key) !== -1) {
                    return false;
                }
            }

            // if backspace; delete data from end of value
            if ((key === "Backspace") || (key === "Delete")) {
                self.errorMessage = "";

                let valuesRange = {};
                let keyUpdated = false, keyAdjusted = false;;

                // reset back and validate offset for custom chars
                $.each(self.valuesRange, function (index, item) {
                    if (item.area === self.area) {
                        valuesRange[index] = item;
                    }
                });
                $.each(valuesRange, function (index, item) {
                    if ((self.valueOffsetCurrent - 1) == item.offset) {
                        value[item.offset] = placeholder[item.offset];

                        keyAdjusted = true;
                        self.valueOffsetCurrent--;
                        return false;
                    }
                });

                // reset to marker for any values
                if (!keyUpdated && !keyAdjusted) {
                    let signSkip = false;
                    for (let i = (self.valueOffsetCurrent - 1); i >= 0; i--) {
                        if (["?", "_", "d"].indexOf(placeholder[i]) !== -1) {
                            $.each(valuesRange, function (index, item) {
                                if ((item.offset == i) && item.sign) {
                                    signSkip = true;
                                    return false;
                                }
                            });

                            if (signSkip) {
                                continue;
                            }

                            value[i] = placeholder[i];
                            self.valueOffsetCurrent = i;
                            break;
                        }
                    }
                }

                self.errorMessage = "";
                if ((self.callback !== null) && (self.callback !== undefined)) {
                    self.callback(self.errorMessage);
                }
            } else {
                let keySignField = false;
                let valuesRange = {};

                // if key press is in multiple values
                $.each(self.valuesRange, function (index, item) {
                    if (item.area === self.area) {
                        valuesRange[index] = item;
                    }
                });

                // adjust for sign if NSEW provided
                if (["-", "+"].indexOf(key) !== -1) {
                    $.each(valuesRange, function (index, item) {
                        if (item.keys.indexOf(key) !== -1) {
                            value[item.offset] = key;
                            keySignField = item.sign;
                            keyApplied = true;
                        }
                    });
                    if (keySignField) {
                        $.each(valuesRange, function (index, item) {
                            if (item.sign) {
                                if (item.keys.indexOf(key) !== -1) {
                                } else if (key === "-") {
                                    if ((item.keys.indexOf("S") !== -1) || (item.keys.indexOf("s") !== -1)) {
                                        value[item.offset] = "S";
                                    } else if ((item.keys.indexOf("W") !== -1) || (item.keys.indexOf("w") !== -1)) {
                                        value[item.offset] = "W";
                                    }
                                } else if (key === "+") {
                                    if ((item.keys.indexOf("N") !== -1) || (item.keys.indexOf("n") !== -1)) {
                                        value[item.offset] = "N";
                                    } else if ((item.keys.indexOf("E") !== -1) || (item.keys.indexOf("e") !== -1)) {
                                        value[item.offset] = "E";
                                    }
                                }
                            }
                        });
                    }
                } else {
                    let ignoreKeysExit = false;

                    $.each(valuesRange, function (index, item) {
                        if ((self.valueOffsetCurrent == item.offset) && (item.keys.indexOf(key) === -1) &&
                            (["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].indexOf(key) !== -1) &&
                            (!item.sign)) {
                            ignoreKeysExit = true;
                            return false;
                        } else if (item.keys.indexOf(key) !== -1) {
                            // if sign field, apply it globally
                            if (item.sign) {
                                value[item.offset] = (item.ignoreCase ? key.toUpperCase() : key);
                                keySignField = item.sign;
                                keyApplied = true;
                            } else {
                                // if ignoreKeys is specified, then skip those keys
                                if ((self.valueOffsetCurrent == item.offset) &&
                                    (item.ignoreKeys.length !== 0) && (item.ignoreKeys.indexOf(key) !== -1)) {
                                    ignoreKeysExit = true;
                                    return false;
                                }

                                if (self.valueOffsetCurrent == item.offset) {
                                    value[item.offset] = (item.ignoreCase ? key.toUpperCase() : (item.upperCase ? key.toUpperCase() : key));
                                    keyApplied = true;

                                    self.valueOffsetCurrent++
                                    return false;
                                }
                            }
                        }
                    });
                    if (ignoreKeysExit) {
                        return false;
                    }

                    // if sign field, then update all sign fields to align
                    if (keySignField) {
                        $.each(valuesRange, function (index, item) {
                            if (item.keys.indexOf(key) !== -1) {
                            } else if (["S", "s", "W", "w"].indexOf(key) !== -1) {
                                if (item.keys.indexOf("-") !== -1) {
                                    value[item.offset] = "-";
                                }
                            } else if (["N", "n", "E", "e"].indexOf(key) !== -1) {
                                if (item.keys.indexOf("+") !== -1) {
                                    value[item.offset] = "+";
                                }
                            }
                        });
                    }
                }

                // if numeric key pressed
                if (!keyApplied && 
                    ((self.errorMessage === "") || (self.errorMessage.startsWith("error length;")))) {
                    if (["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].indexOf(key) !== -1) {
                        let index = value.indexOf("d");

                        if (index !== -1) {
                            value[index] = key;
                            self.valueOffsetCurrent++;
                            keyApplied = true;
                        }
                    }
                }

                // handle separators space,hyphen,underscore
                // if delimiter pressed; left fill digits to the next delimiter position with 0 (right justify)
                let delimiterRange = {};
                $.each(self.delimiterRange, function (index, item) {
                    if (item.area === self.area) {
                        delimiterRange[index] = item;
                    }
                });

                $.each(delimiterRange, function (index, item) {
                    if (item.keys.indexOf(key) !== -1) {
                        // find delimiter (from key list), scan back for 'd', find a valid value; shift right and fill 0
                        let start = -1, end = -1, count = 0, shiftValue = [];
                        for (let i = 0, z = value.length; i < z; i++) {
                            if (["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].indexOf(value[i]) !== -1) {
                                if (start === -1) {
                                    start = i;
                                }

                                shiftValue.push(value[i])
                            } else if (value[i] === "d") {
                                end = i;
                                count++;
                            } else if (item.keys.indexOf(value[i]) !== -1) {
                                if ((start === -1) || (end === -1)) {
                                    start = -1;
                                    count = 0;
                                    shiftValue = [];
                                } else {
                                    count += start - 1;
                                    for (let offset = 0, j = start; j <= end; j++) {
                                        if (j <= count) {
                                            value[j] = "0";
                                            self.valueOffsetCurrent++;
                                        } else {
                                            value[j] = shiftValue[offset++];
                                        }
                                    }

                                    break;
                                }
                            }
                        }
                    }
                });

                // validate data entry if min-maxValueRange is provided
                let maxValueRange = {}, errorMessage = "";
                $.each(self.maxValueRange, function (index, item) {
                    if (item.area === self.area) {
                        maxValueRange[index] = item;
                    }
                });

                let storedValue = "", intValue = 0, strValue = "";
                $.each(maxValueRange, function (index, item) {
                    if ((item.valueType === "value") && (self.valueOffsetCurrent == index)) {
                        storedValue = value.slice(item.offset, item.offset + item.length);

                        if (storedValue.indexOf("d") === -1) {
                            intValue = parseInt(storedValue.join(""));
                            if ((intValue < item.minValue) || (intValue > item.maxValue)) {
                                errorMessage = "error value; offset " + item.offset + "/ length " + item.length;
                                return false;
                            }
                        }
                    } else if ((item.valueType === "length") &&
                        (self.valueOffsetCurrent > item.offset) && (self.valueOffsetCurrent <= index)) {
                        storedValue = value.slice(item.offset, item.offset + item.length);
                        strValue = (storedValue.join("")).replace(/d/g, "").length.toString();
                        if (item.maxLength.indexOf(strValue) === -1) {
                            errorMessage = "error length; offset " + item.offset + "/ length " + item.length;
                            return false;
                        }
                    }
                });

                self.errorMessage = errorMessage;
                if ((self.callback !== null) && (self.callback !== undefined)) {
                    self.callback(self.errorMessage);
                }

                // if next char is same as placeholder for valueOffset; keep incrementing to _ or d
                for (let i = self.valueOffsetCurrent, z = placeholder.length; i < z; i++) {
                    if (["_", "d"].indexOf(placeholder[i]) === -1) {
                        self.valueOffsetCurrent++;
                    } else {
                        break;
                    }
                }
            }

            self.value[self.area] = value.join("");

            $(self.element).val(self.value.join(self.delimiter));
            e.currentTarget.selectionStart = self.selStart;
            e.currentTarget.selectionEnd = self.selEnd;
        }

        return false;
    };

    GISMaskHelper.prototype.setValue = function (value) {
        self = this;

        $.each(value, function (index, item) {
            // get placeholder associated with value
            // ? = sign - valid [+-NnSsEeWw]; empty = ?
            // d = numeric [0-9]; empty = d
            // _ = any valid value; empty = _
        });
    };

    GISMaskHelper.prototype.getValue = function () {
        self = this;

        return self.value;
    };

    GISMaskHelper.prototype.initialize = function () {
        self = this;

        // set the element placeholder
        let placeholder = self.placeholder;
        $(self.element).val(placeholder.join(self.delimiter));

        // parse mask to capture multiple chars input index
        let mask = "", maskCharIndex = {}, index = 0, offset = 0, value = 0;
        for (let i = 0, z = self.mask.length; i < z; i++) {
            mask = self.mask[i];
            index += (i === 0) ? 0 : self.delimiter.length;
            offset = 0;

            for (let j = 0, x = mask.length; j < x; j++) {
                // range of values....
                if (mask[j] === "[") {
                    maskCharIndex = {
                        area: i,
                        offset: offset,
                        sign: false,
                        ignoreCase: false,
                        convertUpper: false,
                        keys: [],
                        ignoreKeys: []
                    };

                    for (let k = j + 1; k < x; k++) {
                        if (mask[k] === "]") {
                            self.valuesRange[index++] = maskCharIndex;
                            j = k++;

                            break;
                        } else {
                            if ((mask[k] === "!") || (maskCharIndex.ignoreKeys.length !== 0)) {
                                // do range scan is mask = hyphen
                                if ((mask[k] === ".") && (mask[k + 1] === ".")) {
                                    maskCharIndex.ignoreKeys.addRange(mask[k - 1], mask[k + 2]);
                                    k++; k++;
                                } else {
                                    maskCharIndex.ignoreKeys.push(mask[k]);
                                }
                            } else if (mask[k] === "^") {
                                maskCharIndex.sign = true;
                            } else {
                                // do range scan is mask = hyphen
                                if ((mask[k] === ".") && (mask[k + 1] === ".")) {
                                    maskCharIndex.keys.addRange(mask[k - 1], mask[k + 2]);
                                    k++; k++;
                                } else {
                                    maskCharIndex.keys.push(mask[k]);
                                }
                            }
                        }
                    }

                    offset++;
                } else if (mask[j] === "\\") {
                    maskCharIndex = {
                        area: i,
                        offset: offset,
                        sign: false,
                        ignoreCase: false,
                        convertUpper: false,
                        keys: [],
                        ignoreKeys: []
                    };

                    if (mask[j + 1] === "A") {
                        maskCharIndex.keys = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
                        self.valuesRange[index++] = maskCharIndex;
                    } else if (mask[j + 1] === "a") {
                        maskCharIndex.keys = "abcdefghijklmnopqrstuvwxyz".split("");
                        self.valuesRange[index++] = maskCharIndex;
                    } else if (mask[j + 1] === "i") {
                        maskCharIndex.keys = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");
                        maskCharIndex.ignoreCase = true;
                        self.valuesRange[index++] = maskCharIndex;
                    } else if (mask[j + 1] === "u") {
                        maskCharIndex.keys = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");
                        maskCharIndex.ignoreCase = true;
                        maskCharIndex.convertUpper = true;
                        self.valuesRange[index++] = maskCharIndex;
                    } else if (mask[j + 1] === "!") {
                        maskCharIndex.keys = "`~!@#$%^&*()-_=+[]{}\\|;:'\",<.>/?".split("");
                        self.valuesRange[index++] = maskCharIndex;
                    }

                    j++;
                    offset++;
                } else if ((mask[j] === "!") && (mask[j + 1] === "[")) {
                    maskCharIndex = {
                        area: i,
                        keys: []
                    };

                    for (let k = j + 2; k < x; k++) {
                        if (mask[k] === "]") {
                            self.ignoreRange[i] = maskCharIndex;
                            j = k++;

                            break;
                        } else {
                            maskCharIndex.keys.push(mask[k]);
                        }
                    }
                } else if ((mask[j] === "*") && (mask[j + 1] === "[")) {
                    maskCharIndex = {
                        area: i,
                        keys: []
                    };

                    for (let k = j + 2; k < x; k++) {
                        if (mask[k] === "]") {
                            self.delimiterRange[i] = maskCharIndex;
                            j = k++;

                            break;
                        } else {
                            maskCharIndex.keys.push(mask[k]);
                        }
                    }
                } else if (mask[j] === "{") {
                    maskCharIndex = {
                        area: i,
                        offset: offset,
                        valueType: "value",
                        length: -1,
                        maxValue: null,
                        minValue: 0,
                        keys: []
                    };

                    for (let k = j + 1; k < x; k++) {
                        if (mask[k] === "}") {
                            value = maskCharIndex.keys.join("");

                            // if array then update appropriately
                            if (maskCharIndex.valueType === "value") {
                                maskCharIndex.maxValue = parseInt(value);
                            }
                            // adjust the object for value type
                            else if (maskCharIndex.valueType === "length") {
                                if (maskCharIndex.keys.indexOf("|") === -1) {
                                    maskCharIndex.maxLength = parseInt(value);
                                    maskCharIndex.minLength = maskCharIndex.minValue;
                                } else {
                                    maskCharIndex.maxLength = value.split("|");
                                }

                                delete maskCharIndex.minValue;
                                delete maskCharIndex.maxValue;
                            }

                            // store the value comparision object
                            maskCharIndex.offset -= maskCharIndex.length;
                            delete maskCharIndex.keys;

                            self.maxValueRange[index++] = maskCharIndex;
                            j = k++;

                            break;
                        } else if (mask[k] === "*") {
                            value = maskCharIndex.keys.join("");

                            if (maskCharIndex.length === -1) {
                                maskCharIndex.length = parseInt(value);
                            } else if (maskCharIndex.minValue === null) {
                                maskCharIndex.minValue = parseInt(value);
                            }
                            maskCharIndex.keys = [];
                        } else {
                            if (mask[k] === "v") {
                                maskCharIndex.valueType = "value";
                            } else if (mask[k] === "l") {
                                maskCharIndex.valueType = "length";
                            } else {
                                maskCharIndex.keys.push(mask[k]);
                            }
                        }
                    }
                } else {
                    index++;
                    offset++;
                }
            }

            // set the start value offset
            this.valueOffsetInit = -1;
            placeholder = self.placeholder[self.area];

            for (let i = 0, x = placeholder.length; i < x; i++) {
                if (placeholder[i] === "d") {
                    this.valueOffsetInit = i;
                    break;
                } else if (placeholder[i] === "_") {
                    $.each(self.valuesRange, function (index, item) {
                        if ((item.offset === i) && !item.sign) {
                            this.valueOffsetInit = i;
                            return false;
                        }
                    });

                    if (this.valueOffsetInit !== -1) {
                        break;
                    }
                }
            }

            this.valueOffsetCurrent = this.valueOffsetInit;
        }

        // prevent keys to be showin in the input area
        $(self.element).on("keydown, keypress", { this: self }, function (e) {
            e.preventDefault();

            return false;
        });

        // select area if multiple areas are defined
        $(self.element).on("mouseup", { this: self }, function (e) {
            e.data.this.selectInputArea(e);
        });

        // process keyup 
        $(self.element).on("keyup", { this: self }, function (e) {
            e.preventDefault();
            e.data.this.processKeyInput(e);
        });

        console.log("initialize/", this);
    };

    return GISMaskHelper;
});
