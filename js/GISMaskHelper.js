/**
 * GISMaskHelper.js is designed to allow data collection for input of GIS formats:
 * 
 * Author:  Seraj Dhaliwal/seraj.dhaliwal@live.com
 * Github:  https://github.com/ssdhaliwal/JavascriptExamples
 * Version: 1.6
 * 
 * DD   Decimal Degrees
 * DMS  Degree Minute Seconds
 * DDM  Degree Decimal Minutes
 * UTM  Universal Transverse Mercator
 * MGRS Military Grid Reference System
 * 
 * GARS Global Area Reference System
 * GeoREF
 *      World Geographic Reference System
 * USNG United States National Grid
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

    var GISMaskHelper = function (args, errorCallback, validationCallback) {
        // static sequences
        this.latSign = [];
        this.lonSign = [];

        this.asciiNumbers = "0123456789".split("");
        this.asciiAlphaLower = "abcdefghijklmnopqrstuvwxyz".split("");
        this.asciiAlphaUpper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
        this.asciiSpecial = "`~!@#$%^&*()-_=+[]{}\\|;:'\",<.>/?".split("");

        // internal counter/tracking variables
        this.valuesRange = {};
        this.ignoreRange = {};
        this.delimiterRange = {};
        this.maxValueRange = {};
        this.selStart = 0;
        this.selEnd = 0;
        this.errorMessage = [];
        this.valueOffset = {};

        this.element = args.element;
        this.title = args.title;

        this.area = 0;
        this.delimiter = ",";
        this.errorCallback = errorCallback;
        this.validationCallback = validationCallback;

        this.mask = args.mask;
        this.placeholder = args.placeholder;

        this.value = args.placeholder.slice();
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

        // if there is an error message active, resend it
        if ((self.errorCallback !== null) && (self.errorCallback !== undefined)) {
            self.errorCallback(self.errorMessage[self.area]);
        }
    };

    GISMaskHelper.prototype.processKeyInput = function (e) {
        self = e.data.this;

        // if enter is pressed - do callback?
        if (e.key === "Enter") {
            let val = $(self.element).val().trim();
        } else {
            let area = self.area, value = self.value[area].split("");
            let placeholder = self.placeholder[area];
            let key = e.key, keyApplied = false;

            // check if ignore key is defined
            if ((self.ignoreRange[area] !== null) && (self.ignoreRange[area] !== undefined)) {
                if (self.ignoreRange[area].keys.indexOf(key) !== -1) {
                    return false;
                }
            }

            // if backspace; delete data from end of value
            if ((key === "Backspace") || (key === "Delete")) {
                self.errorMessage[area] = "";

                let valuesRange = {};
                let keyUpdated = false, keyAdjusted = false;;

                // reset back and validate offset for custom chars
                $.each(self.valuesRange, function (index, item) {
                    if (item.area === area) {
                        valuesRange[index] = item;
                    }
                });
                $.each(valuesRange, function (index, item) {
                    if ((self.valueOffset[area].current - 1) == item.offset) {
                        value[item.offset] = placeholder[item.offset];

                        keyAdjusted = true;
                        self.valueOffset[area].current--;
                        return false;
                    }
                });

                // reset to marker for any values
                if (!keyUpdated && !keyAdjusted) {
                    let signSkip = false;
                    for (let i = (self.valueOffset[area].current - 1); i >= 0; i--) {
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
                            self.valueOffset[area].current = i;
                            break;
                        }
                    }
                }

                // validate current value
                self.validate(value);
            } else {
                let keySignField = false;
                let valuesRange = {};

                // if key press is in multiple values
                $.each(self.valuesRange, function (index, item) {
                    if (item.area === area) {
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
                        if ((self.valueOffset[area].current == item.offset) && (item.keys.indexOf(key) === -1) &&
                            (self.asciiNumbers.indexOf(key) !== -1) &&
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
                                if ((self.valueOffset[area].current == item.offset) &&
                                    (item.ignoreKeys.length !== 0) && (item.ignoreKeys.indexOf(key) !== -1)) {
                                    ignoreKeysExit = true;
                                    return false;
                                }

                                if (self.valueOffset[area].current == item.offset) {
                                    if ((self.errorMessage[area] === "") || (self.errorMessage[area].startsWith("error length;"))) {
                                        value[item.offset] = (item.ignoreCase ? key.toUpperCase() : (item.upperCase ? key.toUpperCase() : key));
                                        keyApplied = true;

                                        self.valueOffset[area].current++
                                    }
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
                    ((self.errorMessage[area] === "") || (self.errorMessage[area].startsWith("error length;")))) {
                    if (self.asciiNumbers.indexOf(key) !== -1) {
                        let index = value.indexOf("d");

                        if (index !== -1) {
                            value[index] = key;
                            self.valueOffset[area].current++;
                            keyApplied = true;
                        }
                    }
                }

                // handle separators space,hyphen,underscore
                // if delimiter pressed; left fill digits to the next delimiter position with 0 (right justify)
                let delimiterRange = {};
                $.each(self.delimiterRange, function (index, item) {
                    if (item.area === area) {
                        delimiterRange[index] = item;
                    }
                });

                $.each(delimiterRange, function (index, item) {
                    if (item.keys.indexOf(key) !== -1) {
                        // find delimiter (from key list), scan back for 'd', find a valid value; shift right and fill 0
                        let start = -1, end = -1, count = 0, shiftValue = [];
                        for (let i = 0, z = value.length; i < z; i++) {
                            if (self.asciiNumbers.indexOf(value[i]) !== -1) {
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
                                            self.valueOffset[area].current++;
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

                // validate current value
                self.validate(value);

                // if next char is same as placeholder for valueOffset; keep incrementing to _ or d
                if (self.errorMessage[area] === "") {
                    for (let i = self.valueOffset[area].current, z = placeholder.length; i < z; i++) {
                        if (["_", "d"].indexOf(placeholder[i]) === -1) {
                            self.valueOffset[area].current++;
                        } else {
                            break;
                        }
                    }
                }
            }

            self.value[area] = value.join("");

            $(self.element).val(self.value.join(self.delimiter));
            e.currentTarget.selectionStart = self.selStart;
            e.currentTarget.selectionEnd = self.selEnd;
        }

        return false;
    };

    GISMaskHelper.prototype.validate = function(value) {
        self = this;

        // validate data entry if min-maxValueRange is provided
        let area = self.area, maxValueRange = {}, errorMessage = "";
        console.log("validate/", value, self.valueOffset[area].current, self);
        $.each(self.maxValueRange, function (index, item) {
            if (item.area === area) {
                maxValueRange[index] = item;
            }
        });

        let storedValue = "", intValue = 0, strValue = "";
        $.each(maxValueRange, function (index, item) {
            if ((item.valueType === "value") && (self.valueOffset[area].current == (item.offset + item.length))) {
                storedValue = value.slice(item.offset, item.offset + item.length);

                if (storedValue.indexOf("d") === -1) {
                    intValue = parseInt(storedValue.join(""));

                    // if external validation is defined
                    if ((item.maxValue === -1) &&
                        (self.validationCallback !== null) && (self.validationCallback !== undefined)) {
                        errorMessage = self.validationCallback({
                            "value": intValue, 
                            "offset": item.offset, 
                            "length": item.offset + item.length});
                    } else {
                        // if maxvalue is array; then it is comparative match
                        if (Array.isArray(item.maxValue)) {
                            if (item.maxValue.indexOf(intValue.toString()) == -1) {
                                errorMessage = "error value; offset " + item.offset + "/ length " + item.length;
                                return false;
                            }
                        } else if ((intValue < item.minValue) || (intValue > item.maxValue)) {
                            errorMessage = "error value; offset " + item.offset + "/ length " + item.length;
                            return false;
                        }
                    }
                }
            } else if ((item.valueType === "length") &&
                (self.valueOffset[area].current > item.offset) && (self.valueOffset[area].current <= index)) {
                storedValue = value.slice(item.offset, item.offset + item.length);
                valueLength = (storedValue.join("")).replace(/d/g, "").length.toString();

                // if external validation is defined
                if ((item.maxLength === -1) &&
                    (self.validationCallback !== null) && (self.validationCallback !== undefined)) {
                    errorMessage = self.validationCallback({
                        "value": [storedValue.join(""), valueLength], 
                        "offset": item.offset, 
                        "length": item.length});
                } else {
                    // if maxvalue is array; then it is comparative match
                    if (Array.isArray(item.maxLength)) {
                        if (item.maxLength.indexOf(valueLength) == -1) {
                            errorMessage = "error length; offset " + item.offset + "/ length " + item.length;
                            return false;
                        }
                    } else if (item.maxLength.indexOf(valueLength) === -1) {
                        errorMessage = "error length; offset " + item.offset + "/ length " + item.length;
                        return false;
                    }
                }
            }
        });

        self.errorMessage[area] = errorMessage;
        if ((self.errorCallback !== null) && (self.errorCallback !== undefined)) {
            self.errorCallback(self.errorMessage[area]);
        }
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
        let area = self.area, placeholder = self.placeholder[area];
        $(self.element).val(self.placeholder.join(self.delimiter));

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
                        maskCharIndex.keys = self.asciiAlphaUpper.slice();
                        self.valuesRange[index++] = maskCharIndex;
                    } else if (mask[j + 1] === "a") {
                        maskCharIndex.keys = self.asciiAlphaLower.slice();
                        self.valuesRange[index++] = maskCharIndex;
                    } else if (mask[j + 1] === "i") {
                        maskCharIndex.keys = self.asciiAlphaUpper.concat(self.asciiAlphaLower);
                        maskCharIndex.ignoreCase = true;
                        self.valuesRange[index++] = maskCharIndex;
                    } else if (mask[j + 1] === "u") {
                        maskCharIndex.keys = self.asciiAlphaUpper.concat(self.asciiAlphaLower);
                        maskCharIndex.ignoreCase = true;
                        maskCharIndex.convertUpper = true;
                        self.valuesRange[index++] = maskCharIndex;
                    } else if (mask[j + 1] === "z") {
                        maskCharIndex.keys = self.asciiAlphaUpper.concat(self.asciiAlphaLower).concat(self.asciiNumbers);
                        maskCharIndex.ignoreCase = true;
                        maskCharIndex.convertUpper = false;
                        self.valuesRange[index++] = maskCharIndex;
                    } else if (mask[j + 1] === "Z") {
                        maskCharIndex.keys = self.asciiAlphaUpper.concat(self.asciiAlphaLower).concat(self.asciiNumbers);
                        maskCharIndex.ignoreCase = true;
                        maskCharIndex.convertUpper = true;
                        self.valuesRange[index++] = maskCharIndex;
                    } else if (mask[j + 1] === "*") {
                        maskCharIndex.keys = self.asciiAlphaUpper.concat(self.asciiAlphaLower).concat(self.asciiNumbers).concat(self.asciiSpecial);
                        maskCharIndex.ignoreCase = true;
                        maskCharIndex.convertUpper = false;
                        self.valuesRange[index++] = maskCharIndex;
                    } else if ((mask[j + 1] === "n") || (mask[j + 1] === "N")) {
                        maskCharIndex.keys = self.asciiNumbers.slice();
                        maskCharIndex.ignoreCase = true;
                        maskCharIndex.convertUpper = false;
                        self.valuesRange[index++] = maskCharIndex;
                    } else if (mask[j + 1] === "!") {
                        maskCharIndex.keys = self.asciiSpecial.slice();
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
                            
                            // when external validation will be called, min/max are provided
                            if (maskCharIndex.length === -1) {
                                maskCharIndex.length = parseInt(value);
                                value = -1;
                            }

                            // if array then update appropriately
                            if (maskCharIndex.valueType === "value") {
                                if (maskCharIndex.keys.indexOf("|") === -1) {
                                    maskCharIndex.maxValue = parseInt(value);
                                } else {
                                    maskCharIndex.maxValue = value.split("|");
                                }
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
                        } else if (mask[k] === ",") {
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
            let placeholder = "";
            for (let a = 0, l = self.placeholder.length; a < l; a++) {
                placeholder = self.placeholder[a];
                self.valueOffset[a] = {};
                self.errorMessage[a] = "";

                for (let i = 0, x = placeholder.length; i < x; i++) {
                    if (placeholder[i] === "d") {
                        self.valueOffset[a].init = i;
                        self.valueOffset[a].current = i;
                        break;
                    } else if (placeholder[i] === "_") {
                        $.each(self.valuesRange, function (index, item) {
                            if ((item.offset === i) && !item.sign) {
                                self.valueOffset[a].init = i;
                                self.valueOffset[a].current = i;
                                return false;
                            }
                        });

                        if (self.valueOffset[a].init !== -1) {
                            break;
                        }
                    }
                }
            }
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

        console.log("initialize/", self);
    };

    return GISMaskHelper;
});
