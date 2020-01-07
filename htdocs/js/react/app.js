/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
/**
 * CryptoJS core components.
 */
var CryptoJS = CryptoJS || function (Math, undefined) {
    /**
     * CryptoJS namespace.
     */
    var C = {};

    /**
     * Library namespace.
     */
    var C_lib = C.lib = {};

    /**
     * Base object for prototypal inheritance.
     */
    var Base = C_lib.Base = function () {
        function F() {}

        return {
            /**
             * Creates a new object that inherits from this object.
             *
             * @param {Object} overrides Properties to copy into the new object.
             *
             * @return {Object} The new object.
             *
             * @static
             *
             * @example
             *
             *     var MyType = CryptoJS.lib.Base.extend({
             *         field: 'value',
             *
             *         method: function () {
             *         }
             *     });
             */
            extend: function (overrides) {
                // Spawn
                F.prototype = this;
                var subtype = new F();

                // Augment
                if (overrides) {
                    subtype.mixIn(overrides);
                }

                // Create default initializer
                if (!subtype.hasOwnProperty('init')) {
                    subtype.init = function () {
                        subtype.$super.init.apply(this, arguments);
                    };
                }

                // Initializer's prototype is the subtype object
                subtype.init.prototype = subtype;

                // Reference supertype
                subtype.$super = this;

                return subtype;
            },

            /**
             * Extends this object and runs the init method.
             * Arguments to create() will be passed to init().
             *
             * @return {Object} The new object.
             *
             * @static
             *
             * @example
             *
             *     var instance = MyType.create();
             */
            create: function () {
                var instance = this.extend();
                instance.init.apply(instance, arguments);

                return instance;
            },

            /**
             * Initializes a newly created object.
             * Override this method to add some logic when your objects are created.
             *
             * @example
             *
             *     var MyType = CryptoJS.lib.Base.extend({
             *         init: function () {
             *             // ...
             *         }
             *     });
             */
            init: function () {},

            /**
             * Copies properties into this object.
             *
             * @param {Object} properties The properties to mix in.
             *
             * @example
             *
             *     MyType.mixIn({
             *         field: 'value'
             *     });
             */
            mixIn: function (properties) {
                for (var propertyName in properties) {
                    if (properties.hasOwnProperty(propertyName)) {
                        this[propertyName] = properties[propertyName];
                    }
                }

                // IE won't copy toString using the loop above
                if (properties.hasOwnProperty('toString')) {
                    this.toString = properties.toString;
                }
            },

            /**
             * Creates a copy of this object.
             *
             * @return {Object} The clone.
             *
             * @example
             *
             *     var clone = instance.clone();
             */
            clone: function () {
                return this.init.prototype.extend(this);
            }
        };
    }();

    /**
     * An array of 32-bit words.
     *
     * @property {Array} words The array of 32-bit words.
     * @property {number} sigBytes The number of significant bytes in this word array.
     */
    var WordArray = C_lib.WordArray = Base.extend({
        /**
         * Initializes a newly created word array.
         *
         * @param {Array} words (Optional) An array of 32-bit words.
         * @param {number} sigBytes (Optional) The number of significant bytes in the words.
         *
         * @example
         *
         *     var wordArray = CryptoJS.lib.WordArray.create();
         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607]);
         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607], 6);
         */
        init: function (words, sigBytes) {
            words = this.words = words || [];

            if (sigBytes != undefined) {
                this.sigBytes = sigBytes;
            } else {
                this.sigBytes = words.length * 4;
            }
        },

        /**
         * Converts this word array to a string.
         *
         * @param {Encoder} encoder (Optional) The encoding strategy to use. Default: CryptoJS.enc.Hex
         *
         * @return {string} The stringified word array.
         *
         * @example
         *
         *     var string = wordArray + '';
         *     var string = wordArray.toString();
         *     var string = wordArray.toString(CryptoJS.enc.Utf8);
         */
        toString: function (encoder) {
            return (encoder || Hex).stringify(this);
        },

        /**
         * Concatenates a word array to this word array.
         *
         * @param {WordArray} wordArray The word array to append.
         *
         * @return {WordArray} This word array.
         *
         * @example
         *
         *     wordArray1.concat(wordArray2);
         */
        concat: function (wordArray) {
            // Shortcuts
            var thisWords = this.words;
            var thatWords = wordArray.words;
            var thisSigBytes = this.sigBytes;
            var thatSigBytes = wordArray.sigBytes;

            // Clamp excess bits
            this.clamp();

            // Concat
            if (thisSigBytes % 4) {
                // Copy one byte at a time
                for (var i = 0; i < thatSigBytes; i++) {
                    var thatByte = thatWords[i >>> 2] >>> 24 - i % 4 * 8 & 0xff;
                    thisWords[thisSigBytes + i >>> 2] |= thatByte << 24 - (thisSigBytes + i) % 4 * 8;
                }
            } else if (thatWords.length > 0xffff) {
                // Copy one word at a time
                for (var i = 0; i < thatSigBytes; i += 4) {
                    thisWords[thisSigBytes + i >>> 2] = thatWords[i >>> 2];
                }
            } else {
                // Copy all words at once
                thisWords.push.apply(thisWords, thatWords);
            }
            this.sigBytes += thatSigBytes;

            // Chainable
            return this;
        },

        /**
         * Removes insignificant bits.
         *
         * @example
         *
         *     wordArray.clamp();
         */
        clamp: function () {
            // Shortcuts
            var words = this.words;
            var sigBytes = this.sigBytes;

            // Clamp
            words[sigBytes >>> 2] &= 0xffffffff << 32 - sigBytes % 4 * 8;
            words.length = Math.ceil(sigBytes / 4);
        },

        /**
         * Creates a copy of this word array.
         *
         * @return {WordArray} The clone.
         *
         * @example
         *
         *     var clone = wordArray.clone();
         */
        clone: function () {
            var clone = Base.clone.call(this);
            clone.words = this.words.slice(0);

            return clone;
        },

        /**
         * Creates a word array filled with random bytes.
         *
         * @param {number} nBytes The number of random bytes to generate.
         *
         * @return {WordArray} The random word array.
         *
         * @static
         *
         * @example
         *
         *     var wordArray = CryptoJS.lib.WordArray.random(16);
         */
        random: function (nBytes) {
            var words = [];
            for (var i = 0; i < nBytes; i += 4) {
                words.push(Math.random() * 0x100000000 | 0);
            }

            return new WordArray.init(words, nBytes);
        }
    });

    /**
     * Encoder namespace.
     */
    var C_enc = C.enc = {};

    /**
     * Hex encoding strategy.
     */
    var Hex = C_enc.Hex = {
        /**
         * Converts a word array to a hex string.
         *
         * @param {WordArray} wordArray The word array.
         *
         * @return {string} The hex string.
         *
         * @static
         *
         * @example
         *
         *     var hexString = CryptoJS.enc.Hex.stringify(wordArray);
         */
        stringify: function (wordArray) {
            // Shortcuts
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;

            // Convert
            var hexChars = [];
            for (var i = 0; i < sigBytes; i++) {
                var bite = words[i >>> 2] >>> 24 - i % 4 * 8 & 0xff;
                hexChars.push((bite >>> 4).toString(16));
                hexChars.push((bite & 0x0f).toString(16));
            }

            return hexChars.join('');
        },

        /**
         * Converts a hex string to a word array.
         *
         * @param {string} hexStr The hex string.
         *
         * @return {WordArray} The word array.
         *
         * @static
         *
         * @example
         *
         *     var wordArray = CryptoJS.enc.Hex.parse(hexString);
         */
        parse: function (hexStr) {
            // Shortcut
            var hexStrLength = hexStr.length;

            // Convert
            var words = [];
            for (var i = 0; i < hexStrLength; i += 2) {
                words[i >>> 3] |= parseInt(hexStr.substr(i, 2), 16) << 24 - i % 8 * 4;
            }

            return new WordArray.init(words, hexStrLength / 2);
        }
    };

    /**
     * Latin1 encoding strategy.
     */
    var Latin1 = C_enc.Latin1 = {
        /**
         * Converts a word array to a Latin1 string.
         *
         * @param {WordArray} wordArray The word array.
         *
         * @return {string} The Latin1 string.
         *
         * @static
         *
         * @example
         *
         *     var latin1String = CryptoJS.enc.Latin1.stringify(wordArray);
         */
        stringify: function (wordArray) {
            // Shortcuts
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;

            // Convert
            var latin1Chars = [];
            for (var i = 0; i < sigBytes; i++) {
                var bite = words[i >>> 2] >>> 24 - i % 4 * 8 & 0xff;
                latin1Chars.push(String.fromCharCode(bite));
            }

            return latin1Chars.join('');
        },

        /**
         * Converts a Latin1 string to a word array.
         *
         * @param {string} latin1Str The Latin1 string.
         *
         * @return {WordArray} The word array.
         *
         * @static
         *
         * @example
         *
         *     var wordArray = CryptoJS.enc.Latin1.parse(latin1String);
         */
        parse: function (latin1Str) {
            // Shortcut
            var latin1StrLength = latin1Str.length;

            // Convert
            var words = [];
            for (var i = 0; i < latin1StrLength; i++) {
                words[i >>> 2] |= (latin1Str.charCodeAt(i) & 0xff) << 24 - i % 4 * 8;
            }

            return new WordArray.init(words, latin1StrLength);
        }
    };

    /**
     * UTF-8 encoding strategy.
     */
    var Utf8 = C_enc.Utf8 = {
        /**
         * Converts a word array to a UTF-8 string.
         *
         * @param {WordArray} wordArray The word array.
         *
         * @return {string} The UTF-8 string.
         *
         * @static
         *
         * @example
         *
         *     var utf8String = CryptoJS.enc.Utf8.stringify(wordArray);
         */
        stringify: function (wordArray) {
            try {
                return decodeURIComponent(escape(Latin1.stringify(wordArray)));
            } catch (e) {
                throw new Error('Malformed UTF-8 data');
            }
        },

        /**
         * Converts a UTF-8 string to a word array.
         *
         * @param {string} utf8Str The UTF-8 string.
         *
         * @return {WordArray} The word array.
         *
         * @static
         *
         * @example
         *
         *     var wordArray = CryptoJS.enc.Utf8.parse(utf8String);
         */
        parse: function (utf8Str) {
            return Latin1.parse(unescape(encodeURIComponent(utf8Str)));
        }
    };

    /**
     * Abstract buffered block algorithm template.
     *
     * The property blockSize must be implemented in a concrete subtype.
     *
     * @property {number} _minBufferSize The number of blocks that should be kept unprocessed in the buffer. Default: 0
     */
    var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm = Base.extend({
        /**
         * Resets this block algorithm's data buffer to its initial state.
         *
         * @example
         *
         *     bufferedBlockAlgorithm.reset();
         */
        reset: function () {
            // Initial values
            this._data = new WordArray.init();
            this._nDataBytes = 0;
        },

        /**
         * Adds new data to this block algorithm's buffer.
         *
         * @param {WordArray|string} data The data to append. Strings are converted to a WordArray using UTF-8.
         *
         * @example
         *
         *     bufferedBlockAlgorithm._append('data');
         *     bufferedBlockAlgorithm._append(wordArray);
         */
        _append: function (data) {
            // Convert string to WordArray, else assume WordArray already
            if (typeof data == 'string') {
                data = Utf8.parse(data);
            }

            // Append
            this._data.concat(data);
            this._nDataBytes += data.sigBytes;
        },

        /**
         * Processes available data blocks.
         *
         * This method invokes _doProcessBlock(offset), which must be implemented by a concrete subtype.
         *
         * @param {boolean} doFlush Whether all blocks and partial blocks should be processed.
         *
         * @return {WordArray} The processed data.
         *
         * @example
         *
         *     var processedData = bufferedBlockAlgorithm._process();
         *     var processedData = bufferedBlockAlgorithm._process(!!'flush');
         */
        _process: function (doFlush) {
            // Shortcuts
            var data = this._data;
            var dataWords = data.words;
            var dataSigBytes = data.sigBytes;
            var blockSize = this.blockSize;
            var blockSizeBytes = blockSize * 4;

            // Count blocks ready
            var nBlocksReady = dataSigBytes / blockSizeBytes;
            if (doFlush) {
                // Round up to include partial blocks
                nBlocksReady = Math.ceil(nBlocksReady);
            } else {
                // Round down to include only full blocks,
                // less the number of blocks that must remain in the buffer
                nBlocksReady = Math.max((nBlocksReady | 0) - this._minBufferSize, 0);
            }

            // Count words ready
            var nWordsReady = nBlocksReady * blockSize;

            // Count bytes ready
            var nBytesReady = Math.min(nWordsReady * 4, dataSigBytes);

            // Process blocks
            if (nWordsReady) {
                for (var offset = 0; offset < nWordsReady; offset += blockSize) {
                    // Perform concrete-algorithm logic
                    this._doProcessBlock(dataWords, offset);
                }

                // Remove processed words
                var processedWords = dataWords.splice(0, nWordsReady);
                data.sigBytes -= nBytesReady;
            }

            // Return processed words
            return new WordArray.init(processedWords, nBytesReady);
        },

        /**
         * Creates a copy of this object.
         *
         * @return {Object} The clone.
         *
         * @example
         *
         *     var clone = bufferedBlockAlgorithm.clone();
         */
        clone: function () {
            var clone = Base.clone.call(this);
            clone._data = this._data.clone();

            return clone;
        },

        _minBufferSize: 0
    });

    /**
     * Abstract hasher template.
     *
     * @property {number} blockSize The number of 32-bit words this hasher operates on. Default: 16 (512 bits)
     */
    var Hasher = C_lib.Hasher = BufferedBlockAlgorithm.extend({
        /**
         * Configuration options.
         */
        cfg: Base.extend(),

        /**
         * Initializes a newly created hasher.
         *
         * @param {Object} cfg (Optional) The configuration options to use for this hash computation.
         *
         * @example
         *
         *     var hasher = CryptoJS.algo.SHA256.create();
         */
        init: function (cfg) {
            // Apply config defaults
            this.cfg = this.cfg.extend(cfg);

            // Set initial values
            this.reset();
        },

        /**
         * Resets this hasher to its initial state.
         *
         * @example
         *
         *     hasher.reset();
         */
        reset: function () {
            // Reset data buffer
            BufferedBlockAlgorithm.reset.call(this);

            // Perform concrete-hasher logic
            this._doReset();
        },

        /**
         * Updates this hasher with a message.
         *
         * @param {WordArray|string} messageUpdate The message to append.
         *
         * @return {Hasher} This hasher.
         *
         * @example
         *
         *     hasher.update('message');
         *     hasher.update(wordArray);
         */
        update: function (messageUpdate) {
            // Append
            this._append(messageUpdate);

            // Update the hash
            this._process();

            // Chainable
            return this;
        },

        /**
         * Finalizes the hash computation.
         * Note that the finalize operation is effectively a destructive, read-once operation.
         *
         * @param {WordArray|string} messageUpdate (Optional) A final message update.
         *
         * @return {WordArray} The hash.
         *
         * @example
         *
         *     var hash = hasher.finalize();
         *     var hash = hasher.finalize('message');
         *     var hash = hasher.finalize(wordArray);
         */
        finalize: function (messageUpdate) {
            // Final message update
            if (messageUpdate) {
                this._append(messageUpdate);
            }

            // Perform concrete-hasher logic
            var hash = this._doFinalize();

            return hash;
        },

        blockSize: 512 / 32,

        /**
         * Creates a shortcut function to a hasher's object interface.
         *
         * @param {Hasher} hasher The hasher to create a helper for.
         *
         * @return {Function} The shortcut function.
         *
         * @static
         *
         * @example
         *
         *     var SHA256 = CryptoJS.lib.Hasher._createHelper(CryptoJS.algo.SHA256);
         */
        _createHelper: function (hasher) {
            return function (message, cfg) {
                return new hasher.init(cfg).finalize(message);
            };
        },

        /**
         * Creates a shortcut function to the HMAC's object interface.
         *
         * @param {Hasher} hasher The hasher to use in this HMAC helper.
         *
         * @return {Function} The shortcut function.
         *
         * @static
         *
         * @example
         *
         *     var HmacSHA256 = CryptoJS.lib.Hasher._createHmacHelper(CryptoJS.algo.SHA256);
         */
        _createHmacHelper: function (hasher) {
            return function (message, key) {
                return new C_algo.HMAC.init(hasher, key).finalize(message);
            };
        }
    });

    /**
     * Algorithm namespace.
     */
    var C_algo = C.algo = {};

    return C;
}(Math);
/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function () {
            // Shortcuts
            var C = CryptoJS;
            var C_lib = C.lib;
            var Base = C_lib.Base;
            var C_enc = C.enc;
            var Utf8 = C_enc.Utf8;
            var C_algo = C.algo;

            /**
             * HMAC algorithm.
             */
            var HMAC = C_algo.HMAC = Base.extend({
                        /**
                         * Initializes a newly created HMAC.
                         *
                         * @param {Hasher} hasher The hash algorithm to use.
                         * @param {WordArray|string} key The secret key.
                         *
                         * @example
                         *
                         *     var hmacHasher = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, key);
                         */
                        init: function (hasher, key) {
                                    // Init hasher
                                    hasher = this._hasher = new hasher.init();

                                    // Convert string to WordArray, else assume WordArray already
                                    if (typeof key == 'string') {
                                                key = Utf8.parse(key);
                                    }

                                    // Shortcuts
                                    var hasherBlockSize = hasher.blockSize;
                                    var hasherBlockSizeBytes = hasherBlockSize * 4;

                                    // Allow arbitrary length keys
                                    if (key.sigBytes > hasherBlockSizeBytes) {
                                                key = hasher.finalize(key);
                                    }

                                    // Clamp excess bits
                                    key.clamp();

                                    // Clone key for inner and outer pads
                                    var oKey = this._oKey = key.clone();
                                    var iKey = this._iKey = key.clone();

                                    // Shortcuts
                                    var oKeyWords = oKey.words;
                                    var iKeyWords = iKey.words;

                                    // XOR keys with pad constants
                                    for (var i = 0; i < hasherBlockSize; i++) {
                                                oKeyWords[i] ^= 0x5c5c5c5c;
                                                iKeyWords[i] ^= 0x36363636;
                                    }
                                    oKey.sigBytes = iKey.sigBytes = hasherBlockSizeBytes;

                                    // Set initial values
                                    this.reset();
                        },

                        /**
                         * Resets this HMAC to its initial state.
                         *
                         * @example
                         *
                         *     hmacHasher.reset();
                         */
                        reset: function () {
                                    // Shortcut
                                    var hasher = this._hasher;

                                    // Reset
                                    hasher.reset();
                                    hasher.update(this._iKey);
                        },

                        /**
                         * Updates this HMAC with a message.
                         *
                         * @param {WordArray|string} messageUpdate The message to append.
                         *
                         * @return {HMAC} This HMAC instance.
                         *
                         * @example
                         *
                         *     hmacHasher.update('message');
                         *     hmacHasher.update(wordArray);
                         */
                        update: function (messageUpdate) {
                                    this._hasher.update(messageUpdate);

                                    // Chainable
                                    return this;
                        },

                        /**
                         * Finalizes the HMAC computation.
                         * Note that the finalize operation is effectively a destructive, read-once operation.
                         *
                         * @param {WordArray|string} messageUpdate (Optional) A final message update.
                         *
                         * @return {WordArray} The HMAC.
                         *
                         * @example
                         *
                         *     var hmac = hmacHasher.finalize();
                         *     var hmac = hmacHasher.finalize('message');
                         *     var hmac = hmacHasher.finalize(wordArray);
                         */
                        finalize: function (messageUpdate) {
                                    // Shortcut
                                    var hasher = this._hasher;

                                    // Compute HMAC
                                    var innerHash = hasher.finalize(messageUpdate);
                                    hasher.reset();
                                    var hmac = hasher.finalize(this._oKey.clone().concat(innerHash));

                                    return hmac;
                        }
            });
})();
/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function () {
    // Shortcuts
    var C = CryptoJS;
    var C_lib = C.lib;
    var WordArray = C_lib.WordArray;
    var Hasher = C_lib.Hasher;
    var C_algo = C.algo;

    // Reusable object
    var W = [];

    /**
     * SHA-1 hash algorithm.
     */
    var SHA1 = C_algo.SHA1 = Hasher.extend({
        _doReset: function () {
            this._hash = new WordArray.init([0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0]);
        },

        _doProcessBlock: function (M, offset) {
            // Shortcut
            var H = this._hash.words;

            // Working variables
            var a = H[0];
            var b = H[1];
            var c = H[2];
            var d = H[3];
            var e = H[4];

            // Computation
            for (var i = 0; i < 80; i++) {
                if (i < 16) {
                    W[i] = M[offset + i] | 0;
                } else {
                    var n = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16];
                    W[i] = n << 1 | n >>> 31;
                }

                var t = (a << 5 | a >>> 27) + e + W[i];
                if (i < 20) {
                    t += (b & c | ~b & d) + 0x5a827999;
                } else if (i < 40) {
                    t += (b ^ c ^ d) + 0x6ed9eba1;
                } else if (i < 60) {
                    t += (b & c | b & d | c & d) - 0x70e44324;
                } else /* if (i < 80) */{
                        t += (b ^ c ^ d) - 0x359d3e2a;
                    }

                e = d;
                d = c;
                c = b << 30 | b >>> 2;
                b = a;
                a = t;
            }

            // Intermediate hash value
            H[0] = H[0] + a | 0;
            H[1] = H[1] + b | 0;
            H[2] = H[2] + c | 0;
            H[3] = H[3] + d | 0;
            H[4] = H[4] + e | 0;
        },

        _doFinalize: function () {
            // Shortcuts
            var data = this._data;
            var dataWords = data.words;

            var nBitsTotal = this._nDataBytes * 8;
            var nBitsLeft = data.sigBytes * 8;

            // Add padding
            dataWords[nBitsLeft >>> 5] |= 0x80 << 24 - nBitsLeft % 32;
            dataWords[(nBitsLeft + 64 >>> 9 << 4) + 14] = Math.floor(nBitsTotal / 0x100000000);
            dataWords[(nBitsLeft + 64 >>> 9 << 4) + 15] = nBitsTotal;
            data.sigBytes = dataWords.length * 4;

            // Hash final blocks
            this._process();

            // Return final computed hash
            return this._hash;
        },

        clone: function () {
            var clone = Hasher.clone.call(this);
            clone._hash = this._hash.clone();

            return clone;
        }
    });

    /**
     * Shortcut function to the hasher's object interface.
     *
     * @param {WordArray|string} message The message to hash.
     *
     * @return {WordArray} The hash.
     *
     * @static
     *
     * @example
     *
     *     var hash = CryptoJS.SHA1('message');
     *     var hash = CryptoJS.SHA1(wordArray);
     */
    C.SHA1 = Hasher._createHelper(SHA1);

    /**
     * Shortcut function to the HMAC's object interface.
     *
     * @param {WordArray|string} message The message to hash.
     * @param {WordArray|string} key The secret key.
     *
     * @return {WordArray} The HMAC.
     *
     * @static
     *
     * @example
     *
     *     var hmac = CryptoJS.HmacSHA1(message, key);
     */
    C.HmacSHA1 = Hasher._createHmacHelper(SHA1);
})();
/*
 * This file is part of evQueue
 *
 * evQueue is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * evQueue is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with evQueue. If not, see <http://www.gnu.org/licenses/>.
 *
 * Author: Thibault Kummer
 */

class evQueueWS {
	constructor(parameters) {
		this.callback = parameters.callback;
		this.node = parameters.node;
		this.stateChange = parameters.stateChange;

		this.state = 'DISCONNECTED'; // We start in disconnected state
		this.api_promise = Promise.resolve(); // No previous query was run at this time
	}

	Connect() {
		var self = this;
		var mode = self.callback === undefined ? 'api' : 'event';

		return new Promise(function (resolve, reject) {
			// Connect using appropriate protocol
			if (mode == 'api') self.ws = new WebSocket(self.node, "api");else self.ws = new WebSocket(self.node, "events");

			self.state = 'CONNECTING';

			// Event on connection
			self.ws.onopen = function (event) {
				console.log("Connected to node " + self.node + " (" + mode + ")");
			};

			// Event on disconnection
			self.ws.onclose = function (event) {
				if (self.state == 'DISCONNECTING' || event.wasClean) {
					// Disconnection was requested by JS or close was requested by browser (ie page closed), this is OK
					self.state = 'DISCONNECTED';
					console.log("Disconnected from node " + self.node);
				} else {
					if (self.state == 'CONNECTING') reject('Connection failed'); // Connecting failed,

					self.state = 'ERROR'; // Unexpected disconnection, set state to error

					// Try reconnecting if we are on event mode
					if (self.callback !== undefined) setTimeout(() => {
						self.api_promise = self.Connect();
					}, 1000);
				}

				// Notify of state change
				if (self.stateChange !== undefined) self.stateChange(self.node, self.state);
			};

			self.ws.onmessage = function (event) {
				var parser = new DOMParser();
				var xmldoc = parser.parseFromString(event.data, "text/xml");

				if (self.state == 'CONNECTING') {
					// We are connecting, first message sent by engine is challeng for authentication
					var challenge = xmldoc.documentElement.getAttribute("challenge");

					// Compute challenge response and send to complete authentication
					var user = document.querySelector("body").dataset.user;
					var passwd_hash = CryptoJS.enc.Hex.parse(document.querySelector("body").dataset.password);
					var response = CryptoJS.HmacSHA1(CryptoJS.enc.Hex.parse(challenge), passwd_hash).toString(CryptoJS.enc.Hex);

					self.ws.send("<auth response='" + response + "' user='" + user + "' />");
					self.state = 'AUTHENTICATED';
				} else if (self.state == 'AUTHENTICATED') {
					self.state = 'READY';

					// Notify of state change
					if (self.stateChange !== undefined) self.stateChange(self.node, self.state);

					resolve(); // We are now connected
				} else if (self.state == 'READY') {
					if (mode == 'event') {
						// Event protocol, notify callback
						self.callback(new DOMParser().parseFromString(event.data, "text/xml"));
					} else {
						// API protocol, resolve our promise to send response
						self.state = 'READY';
						self.promise.resolve(new DOMParser().parseFromString(event.data, "text/xml"));
					}
				}
			};
		});
	}

	Close() {
		if (this.state == 'DISCONNECTED') return; // Node is not connected

		this.state = 'DISCONNECTING';
		this.ws.close();
	}

	GetState() {
		return this.state;
	}

	// Build API XML from object
	build_api_xml(api) {
		var xmldoc = new Document();

		var api_node = xmldoc.createElement(api.group);
		api_node.setAttribute('action', api.action);
		xmldoc.appendChild(api_node);

		for (var attribute in api.attributes) api_node.setAttribute(attribute, api.attributes[attribute]);

		for (var parameter in api.parameters) {
			var parameter_node = xmldoc.createElement('parameter');
			parameter_node.setAttribute('name', parameter);
			parameter_node.setAttribute('value', api.parameters[parameter]);
			api_node.appendChild(parameter_node);
		}

		return new XMLSerializer().serializeToString(xmldoc);
	}

	// Execute API command on evqueue
	API(api) {
		var self = this;

		// Handle late connection
		var evq_ready;
		if (this.state == 'DISCONNECTED' || this.state == 'ERROR') self.api_promise = this.Connect();

		// This is used to serialize API commands
		var old_api_promise = self.api_promise;
		self.api_promise = new Promise(function (resolve, reject) {
			old_api_promise.then(() => {
				var api_cmd = self.build_api_xml(api);
				self.ws.send(api_cmd);
				if (self.callback !== undefined) resolve(); // We are waiting no result to complete this action
				else self.promise = { resolve: resolve, reject: reject }; // Promise will be resolved once response is received
			});
		});

		return self.api_promise;
	}
}
/*
 * This file is part of evQueue
 *
 * evQueue is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * evQueue is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with evQueue. If not, see <http://www.gnu.org/licenses/>.
 *
 * Author: Thibault Kummer
 */

class evQueueCluster {
	constructor(nodes_desc, nodes_names, eventCallback, stateChange) {
		this.stateChangeCallback = stateChange;
		this.stateChange = this.stateChange.bind(this);

		this.nodes = [];
		for (var i = 0; i < nodes_desc.length; i++) this.nodes.push(new evQueueWS({
			node: nodes_desc[i],
			callback: eventCallback,
			stateChange: this.stateChange
		}));

		this.nodes_names = nodes_names;
	}

	GetNodeByName(name) {
		if (name == '*') return '*';

		for (var i = 0; i < this.nodes_names.length; i++) if (this.nodes_names[i] == name) return i;
		return -1;
	}

	GetConnectedNodes() {
		var connected_nodes = 0;
		for (var i = 0; i < this.nodes.length; i++) {
			if (this.nodes[i].GetState() == 'READY') connected_nodes++;
		}
		return connected_nodes;
	}

	GetErrorNodes() {
		var error_nodes = 0;
		for (var i = 0; i < this.nodes.length; i++) {
			if (this.nodes[i].GetState() == 'ERROR') error_nodes++;
		}
		return error_nodes;
	}

	GetUpNode() {
		for (var i = 0; i < this.nodes.length; i++) {
			if (this.nodes[i].GetState() == 'READY' || this.nodes[i].GetState() == 'DISCONNECTED') return i;
		}

		return -1;
	}

	API(api) {
		var self = this;

		var node = api.node !== undefined ? self.GetNodeByName(api.node) : this.GetUpNode();
		if (node == -1) return Promise.reject('Cluster error : unknown node');

		if (node == '*') {
			return new Promise(function (resolve, reject) {
				var resolved = 0;
				for (var i = 0; i < self.nodes.length; i++) {
					self.nodes[i].API(api).then(() => {
						resolved++;
						if (resolved == self.nodes.length) resolve();
					});
				}
			});
		} else return self.nodes[node].API(api);
	}

	BuildAPI(api) {
		return this.nodes[0].build_api_xml(api);
	}

	Close() {
		for (var i = 0; i < this.nodes.length; i++) this.nodes[i].Close();
	}

	stateChange(node, state) {
		if (this.stateChangeCallback !== undefined) this.stateChangeCallback(node, state);
	}
}
/*
 * This file is part of evQueue
 *
 * evQueue is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * evQueue is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with evQueue. If not, see <http://www.gnu.org/licenses/>.
 *
 * Author: Thibault Kummer
 */

'use strict';

class Alert extends React.Component {
	constructor(props) {
		super(props);

		this.dlg = React.createRef();

		this.confirm = this.confirm.bind(this);
	}

	confirm() {
		this.dlg.current.close(this.props.dlgid);
	}

	render() {
		return React.createElement(
			Dialog,
			{ ref: this.dlg, dlgid: this.props.dlgid, width: "300", modal: true, hasTitle: false },
			React.createElement(
				"div",
				{ className: "evq-alert" },
				React.createElement(
					"div",
					{ className: "evq-content" },
					this.props.content
				),
				React.createElement(
					"div",
					{ className: "evq-buttons" },
					React.createElement(
						"button",
						{ onClick: this.confirm },
						"OK"
					)
				)
			)
		);
	}
}
/*
 * This file is part of evQueue
 *
 * evQueue is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * evQueue is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with evQueue. If not, see <http://www.gnu.org/licenses/>.
 *
 * Author: Thibault Kummer
 */

'use strict';

class Autocomplete extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			dropdown_opened: false,
			filter: ''
		};

		this.ref = React.createRef();

		this.toggleDropdown = this.toggleDropdown.bind(this);
		this._mouseDown = this._mouseDown.bind(this);
		this.applyFilter = this.applyFilter.bind(this);
		this.changeValue = this.changeValue.bind(this);
	}

	componentDidMount() {
		document.addEventListener('mousedown', this._mouseDown);

		this.global_width = window.getComputedStyle(this.ref.current).getPropertyValue('width');
	}

	componentWillUnmount() {
		document.removeEventListener('mousedown', this._mouseDown);
	}

	_mouseDown(event) {
		if (this.ref.current && !this.ref.current.contains(event.target)) this.setState({ dropdown_opened: false });
	}

	toggleDropdown() {
		this.setState({ dropdown_opened: !this.state.dropdown_opened });
	}

	applyFilter() {
		var filter = this.props.value.toLowerCase();

		if (filter == '') return this.props.autocomplete;

		var autocomplete = [];
		for (var i = 0; i < this.props.autocomplete.length; i++) {
			if (this.props.autocomplete[i].toLowerCase().includes(filter)) autocomplete.push(this.props.autocomplete[i]);
		}

		return autocomplete;
	}

	changeValue(value) {
		var event = {
			target: {
				name: this.props.name,
				value: value
			}
		};

		if (this.props.onChange) this.props.onChange(event);
	}

	renderDropdown() {
		if (!this.state.dropdown_opened) return;

		return React.createElement(
			'div',
			{ className: 'evq-autocomplete-dropdown', style: { width: this.global_width } },
			React.createElement(
				'ul',
				null,
				this.renderAutocomplete()
			)
		);
	}

	renderAutocomplete() {
		var autocomplete = this.applyFilter();

		if (autocomplete.length == 0) return React.createElement(
			'li',
			null,
			'No results found'
		);

		return autocomplete.map(value => {
			return React.createElement(
				'li',
				{ key: value, onClick: () => {
						this.setState({ dropdown_opened: false });this.changeValue(value);
					} },
				value
			);
		});
	}

	render() {
		var className = 'evq-autocomplete';
		if (this.props.className) className += ' ' + this.props.className;

		return React.createElement(
			'div',
			{ ref: this.ref, className: className },
			React.createElement('input', { type: 'text', value: this.props.value, onChange: event => {
					this.changeValue(event.target.value);
				}, onFocus: this.toggleDropdown }),
			this.renderDropdown()
		);
	}
}
/*
 * This file is part of evQueue
 *
 * evQueue is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * evQueue is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with evQueue. If not, see <http://www.gnu.org/licenses/>.
 *
 * Author: Thibault Kummer
 */

'use strict';

class Confirm extends React.Component {
	constructor(props) {
		super(props);

		this.dlg = React.createRef();

		this.confirm = this.confirm.bind(this);
		this.cancel = this.cancel.bind(this);
	}

	confirm() {
		this.props.confirm();
		this.dlg.current.close(this.props.dlgid);
	}

	cancel() {
		this.dlg.current.close(this.props.dlgid);
	}

	renderContent() {
		return this.props.content.split("\n").map((line, idx) => {
			return React.createElement(
				"div",
				{ key: idx },
				line
			);
		});
	}

	render() {
		return React.createElement(
			Dialog,
			{ ref: this.dlg, dlgid: this.props.dlgid, width: "300", modal: true, hasTitle: false },
			React.createElement(
				"div",
				{ className: "evq-confirm" },
				React.createElement(
					"div",
					{ className: "evq-content" },
					this.renderContent()
				),
				React.createElement(
					"div",
					{ className: "evq-buttons" },
					React.createElement(
						"button",
						{ onClick: this.cancel },
						"Cancel"
					),
					React.createElement(
						"button",
						{ onClick: this.confirm },
						"OK"
					)
				)
			)
		);
	}
}
/*
 * This file is part of evQueue
 *
 * evQueue is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * evQueue is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with evQueue. If not, see <http://www.gnu.org/licenses/>.
 *
 * Author: Thibault Kummer
 */

'use strict';

class DatePicker extends React.Component {
	constructor(props) {
		super(props);

		var now = new Date();
		this.state = {
			year: now.getFullYear(),
			month: now.getMonth(),
			displayCalendar: false
		};

		this.ref = React.createRef();
		this.input_ref = React.createRef();

		this.weeks = [];

		this.prevMonth = this.prevMonth.bind(this);
		this.nextMonth = this.nextMonth.bind(this);
		this.changeDate = this.changeDate.bind(this);
		this.pickDate = this.pickDate.bind(this);
		this._onFocus = this._onFocus.bind(this);
		this._mouseDown = this._mouseDown.bind(this);
	}

	componentDidMount() {
		document.addEventListener('mousedown', this._mouseDown);
	}

	componentWillUnmount() {
		document.removeEventListener('mousedown', this._mouseDown);
	}

	changeDate(event) {
		console.log(event);
		if (this.props.onChange) this.props.onChange(event);
	}

	pickDate(date) {
		var month = '' + (this.state.month + 1);
		var date = '' + date;
		var date = this.state.year + '-' + month.padStart(2, '0') + '-' + date.padStart(2, '0');

		var event = {
			target: {
				name: this.props.name,
				value: date
			}
		};

		this.setState({ displayCalendar: false });
		if (this.props.onChange) this.props.onChange(event);
	}

	prevMonth() {
		var month = this.state.month;
		var year = this.state.year;
		month--;
		if (month < 0) {
			month = 11;
			year--;
		}

		this.setState({ month: month, year: year });
	}

	nextMonth() {
		var month = this.state.month;
		var year = this.state.year;
		month++;
		if (month > 11) {
			month = 0;
			year++;
		}

		this.setState({ month: month, year: year });
	}

	computeWeeks() {
		var days = [];

		var base = new Date();
		base.setDate(1);
		base.setMonth(this.state.month);
		base.setFullYear(this.state.year);

		var cur = base;

		while (cur.getMonth() == base.getMonth()) {
			days.push({
				day: cur.getDay(),
				date: cur.getDate()
			});

			cur = new Date(cur.getTime() + 86400 * 1000);
		}

		var pre_days = [];
		for (var i = 0; i < days[0].day; i++) pre_days.push({ day: i });

		var post_days = [];
		for (var i = days[days.length - 1].day + 1; i <= 6; i++) post_days.push({ day: i });

		var padded_days = pre_days.concat(days).concat(post_days);
		this.weeks = [];
		for (var i = 0; i < padded_days.length; i += 7) this.weeks.push(padded_days.slice(i, i + 7));
	}

	renderMonthYear() {
		var months_names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
		return React.createElement(
			'span',
			{ className: 'evq-datepicker-title' },
			'\xA0',
			months_names[this.state.month],
			' ',
			this.state.year,
			'\xA0'
		);
	}

	renderWeekdays() {
		var ret = [];
		return ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((weekday, idx) => {
			return React.createElement(
				'td',
				{ key: idx },
				weekday
			);
		});
	}

	renderDays(days) {
		return days.map((day, idx) => {
			return React.createElement(
				'td',
				{ key: idx, onClick: () => {
						this.pickDate(day.date);
					} },
				day.date
			);
		});
	}

	renderWeeks() {
		this.computeWeeks();

		return this.weeks.map((week, idx) => {
			return React.createElement(
				'tr',
				{ key: idx },
				this.renderDays(week)
			);
		});
	}

	renderCalendar() {
		if (!this.state.displayCalendar) return;

		return React.createElement(
			'div',
			{ className: 'evq-datepicker-calendar' },
			React.createElement(
				'div',
				null,
				React.createElement('span', { className: 'faicon fa-backward', onClick: this.prevMonth }),
				this.renderMonthYear(),
				React.createElement('span', { className: 'faicon fa-forward', onClick: this.nextMonth })
			),
			React.createElement(
				'table',
				null,
				React.createElement(
					'thead',
					null,
					React.createElement(
						'tr',
						null,
						this.renderWeekdays()
					)
				),
				React.createElement(
					'tbody',
					null,
					this.renderWeeks()
				)
			)
		);
	}

	render() {
		return React.createElement(
			'div',
			{ ref: this.ref, className: 'evq-datepicker' },
			React.createElement('input', { ref: this.input_ref, name: this.props.name, value: this.props.value, onChange: this.changeDate, onFocus: this._onFocus, type: 'text' }),
			this.renderCalendar()
		);
	}

	_onFocus(event) {
		this.setState({ displayCalendar: true });
	}

	_mouseDown(event) {
		if (this.ref.current && !this.ref.current.contains(event.target)) this.setState({ displayCalendar: false });
	}
}
/*
 * This file is part of evQueue
 *
 * evQueue is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * evQueue is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with evQueue. If not, see <http://www.gnu.org/licenses/>.
 *
 * Author: Thibault Kummer
 */

'use strict';

class Dialog extends React.Component {
	constructor(props) {
		super(props);

		// Activate this dialog
		if (Dialogs.global.active !== undefined) Dialogs.global.active.setState({ active: false });

		// Add this instance to global state
		var zindex = this.props.modal ? 1001 : Dialogs.global.max_z++;
		Dialogs.global.active = this;
		Dialogs.instance.state[this.props.dlgid].instance = this;

		// Local state
		var top = window.pageYOffset + 200;
		var left = 500;
		var width = props.width ? parseInt(props.width) : 200;
		var height = props.height && props.height != 'auto' ? parseInt(props.height) : 200;

		if (this.props.modal) {
			left = (window.innerWidth - width) / 2;
			top = window.pageYOffset + (window.innerHeight - height) / 2;
		}

		this.state = {
			top: top,
			left: left,
			width: width,
			height: height,
			zindex: zindex,
			moving: false,
			resizing: false,
			active: true
		};

		// Global styles
		this.height_delta = 0;
		this.content_vert_padding = 0;
		this.resize_border = 7;
		this.auto_height = !props.height || props.height == 'auto' ? true : false;

		// Referenes
		this.dlg_outer = React.createRef();
		this.dlg_inner = React.createRef();
		this.dlg_title = React.createRef();
		this.dlg_content = React.createRef();

		// Bind local methods
		this.beginMove = this.beginMove.bind(this);
		this.endMove = this.endMove.bind(this);
		this.move = this.move.bind(this);
		this.beginResize = this.beginResize.bind(this);
		this.endResize = this.endResize.bind(this);
		this.resize = this.resize.bind(this);
		this.close = this.close.bind(this);
		this.activate = this.activate.bind(this);
	}

	componentDidMount() {
		this.node = ReactDOM.findDOMNode(this);

		this.height_delta += parseInt(window.getComputedStyle(this.dlg_outer.current).getPropertyValue('padding-top'));
		this.height_delta += parseInt(window.getComputedStyle(this.dlg_outer.current).getPropertyValue('padding-bottom'));
		this.height_delta += parseInt(window.getComputedStyle(this.dlg_inner.current).getPropertyValue('padding-top'));
		this.height_delta += parseInt(window.getComputedStyle(this.dlg_inner.current).getPropertyValue('padding-bottom'));
		if (this.props.hasTitle) {
			this.height_delta += parseInt(window.getComputedStyle(this.dlg_title.current).getPropertyValue('padding-top'));
			this.height_delta += parseInt(window.getComputedStyle(this.dlg_title.current).getPropertyValue('padding-bottom'));
			this.height_delta += parseInt(window.getComputedStyle(this.dlg_title.current).getPropertyValue('height'));
		}

		this.content_vert_padding += parseInt(window.getComputedStyle(this.dlg_content.current).getPropertyValue('padding-top'));
		this.content_vert_padding += parseInt(window.getComputedStyle(this.dlg_content.current).getPropertyValue('padding-bottom'));

		if (this.auto_height) this.componentDidUpdate();
	}

	componentDidUpdate() {
		if (this.state.resizing || this.state.moving || !this.auto_height) return;

		var old_height = this.state.height;
		var new_height = this.node.querySelector(".evq-dlg-content").clientHeight + this.content_vert_padding + this.height_delta;
		if (old_height != new_height) this.setState({ height: new_height });
	}

	beginMove(event) {
		event.preventDefault();

		if (!this.state.active) this.activate();

		document.addEventListener('mousemove', this.move);
		this.setState({ moving: true });

		this.cursor_start_pos = {
			x: event.clientX,
			y: event.clientY
		};

		this.dlg_start_pos = {
			x: this.state.left,
			y: this.state.top
		};
	}

	endMove() {
		event.preventDefault();

		document.removeEventListener('mousemove', this.move);
		this.setState({ moving: false });
		delete this.cursor_start_pos;
		delete this.dls_start_pos;
	}

	move(event) {
		event.preventDefault();

		if (event.target == document) {
			this.endMove();
			return;
		}

		this.setState({
			top: this.dlg_start_pos.y + event.clientY - this.cursor_start_pos.y,
			left: this.dlg_start_pos.x + event.clientX - this.cursor_start_pos.x
		});
	}

	beginResize(event) {
		event.preventDefault();

		this.resize_type = event.target.dataset.pos;

		this.cursor_start_pos = {
			x: event.clientX,
			y: event.clientY
		};

		this.dlg_start_pos = {
			x: this.state.left,
			y: this.state.top
		};

		this.dlg_start_size = {
			width: this.state.width,
			height: this.state.height
		};

		document.addEventListener('mousemove', this.resize);
		this.setState({ resizing: true });
	}

	endResize() {
		delete this.resize_type;
		delete this.cursor_start_pos;
		delete this.dlg_start_pos;
		delete this.dlg_start_size;

		document.removeEventListener('mousemove', this.resize);
		this.setState({ resizing: false });
		this.auto_height = false;
	}

	resize(event) {
		event.preventDefault();

		if (event.target == document) {
			this.endResize();
			return;
		}

		var delta_x = event.clientX - this.cursor_start_pos.x;
		var delta_y = event.clientY - this.cursor_start_pos.y;
		if (this.resize_type == 1) this.setState({ width: this.dlg_start_size.width - delta_x, height: this.dlg_start_size.height - delta_y, top: this.dlg_start_pos.y + delta_y, left: this.dlg_start_pos.x + delta_x });else if (this.resize_type == 2) this.setState({ height: this.dlg_start_size.height - delta_y, top: this.dlg_start_pos.y + delta_y });else if (this.resize_type == 3) this.setState({ width: this.dlg_start_size.width + delta_x, height: this.dlg_start_size.height - delta_y, top: this.dlg_start_pos.y + delta_y });else if (this.resize_type == 4) this.setState({ width: this.dlg_start_size.width + delta_x });else if (this.resize_type == 5) this.setState({ width: this.dlg_start_size.width + delta_x, height: this.dlg_start_size.height + delta_y });else if (this.resize_type == 6) this.setState({ height: this.dlg_start_size.height + delta_y });else if (this.resize_type == 7) this.setState({ width: this.dlg_start_size.width - delta_x, height: this.dlg_start_size.height + delta_y, left: this.dlg_start_pos.x + delta_x });else if (this.resize_type == 8) this.setState({ width: this.dlg_start_size.width - delta_x, left: this.dlg_start_pos.x + delta_x });
	}

	close() {
		Dialogs.close(this.props.dlgid);

		if (Dialogs.global.active == this) {
			if (Object.keys(Dialogs.instance.state).length == 0) Dialogs.global.active = undefined;else {
				Dialogs.global.active = Dialogs.instance.state[Object.keys(Dialogs.instance.state)[0]].instance;
				Dialogs.global.active.setState({ active: true });
			}
		}
	}

	activate() {
		if (Dialogs.global.active == this) return;

		var cur_z = this.state.zindex;

		if (Dialogs.global.active !== undefined) Dialogs.global.active.setState({ active: false });

		Object.keys(Dialogs.instance.state).map(key => {
			if (Dialogs.instance.state[key].instance.state.zindex >= cur_z) Dialogs.instance.state[key].instance.setState({ zindex: Dialogs.instance.state[key].instance.state.zindex - 1 });
		});

		this.setState({ zindex: Dialogs.global.max_z, active: true });
		Dialogs.global.active = this;
	}

	renderTitle() {
		if (!this.props.hasTitle) return;

		return React.createElement(
			'div',
			{ ref: this.dlg_title, className: 'evq-dlg-title', onMouseDown: this.beginMove, onMouseUp: this.endMove },
			this.props.title,
			React.createElement('span', { className: 'evq-dlg-close faicon fa-remove', onClick: this.close })
		);
	}

	render() {
		var style = {
			top: this.state.top,
			left: this.state.left,
			width: this.state.width,
			height: this.state.height,
			zIndex: this.state.zindex
		};

		return React.createElement(
			'div',
			null,
			React.createElement(
				'div',
				{ className: 'evq-dialog', style: style },
				React.createElement(
					'div',
					{ ref: this.dlg_outer, className: 'evq-dialog-outer', style: { backgroundColor: this.state.active && !this.props.modal ? 'rgba(61,174,233,0.2)' : '' } },
					React.createElement(
						'div',
						{ ref: this.dlg_inner, className: 'evq-dialog-inner', onMouseDown: this.activate },
						this.renderTitle(),
						React.createElement(
							'div',
							{ ref: this.dlg_content, className: 'evq-dlg-content', style: !this.auto_height ? { height: this.state.height - this.height_delta } : {} },
							this.props.children
						),
						React.createElement('div', { 'data-pos': '2', style: { width: '100%', height: this.resize_border, position: 'absolute', top: 0, left: 0, cursor: 'ns-resize' }, onMouseDown: this.beginResize, onMouseUp: this.endResize }),
						React.createElement('div', { 'data-pos': '4', style: { width: this.resize_border, height: '100%', position: 'absolute', top: 0, right: 0, cursor: 'ew-resize' }, onMouseDown: this.beginResize, onMouseUp: this.endResize }),
						React.createElement('div', { 'data-pos': '6', style: { width: '100%', height: this.resize_border, position: 'absolute', bottom: 0, left: 0, cursor: 'ns-resize' }, onMouseDown: this.beginResize, onMouseUp: this.endResize }),
						React.createElement('div', { 'data-pos': '8', style: { width: this.resize_border, height: '100%', position: 'absolute', top: 0, left: 0, cursor: 'ew-resize' }, onMouseDown: this.beginResize, onMouseUp: this.endResize }),
						React.createElement('div', { 'data-pos': '1', style: { width: this.resize_border, height: this.resize_border, position: 'absolute', top: 0, left: 0, cursor: 'nwse-resize' }, onMouseDown: this.beginResize, onMouseUp: this.endResize }),
						React.createElement('div', { 'data-pos': '3', style: { width: this.resize_border, height: this.resize_border, position: 'absolute', top: 0, right: 0, cursor: 'nesw-resize' }, onMouseDown: this.beginResize, onMouseUp: this.endResize }),
						React.createElement('div', { 'data-pos': '5', style: { width: this.resize_border, height: this.resize_border, position: 'absolute', bottom: 0, right: 0, cursor: 'nwse-resize' }, onMouseDown: this.beginResize, onMouseUp: this.endResize }),
						React.createElement('div', { 'data-pos': '7', style: { width: this.resize_border, height: this.resize_border, position: 'absolute', bottom: 0, left: 0, cursor: 'nesw-resize' }, onMouseDown: this.beginResize, onMouseUp: this.endResize })
					)
				)
			),
			this.props.modal ? React.createElement('div', { className: 'evq-modal' }) : ''
		);
	}
}

Dialog.defaultProps = {
	modal: false,
	hasTitle: true
};
/*
 * This file is part of evQueue
 *
 * evQueue is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * evQueue is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with evQueue. If not, see <http://www.gnu.org/licenses/>.
 *
 * Author: Thibault Kummer
 */

'use strict';

class Dialogs extends React.Component {
	constructor(props) {
		super(props);

		this.dlgid = 1;

		this.state = {};

		// Instanciate global state for all dialogs
		Dialogs.global = {
			max_z: 100,
			active: undefined
		};
	}

	componentDidMount() {
		Dialogs.instance = this;
	}

	static open(dlg, props) {
		return Dialogs.instance._open(dlg, props);
	}

	_open(dlg, props) {
		props.ref = React.createRef();
		this.setState({ [this.dlgid]: { dlg: dlg, props: props } });
		this.dlgid++;
		return props.ref;
	}

	static close(id) {
		return Dialogs.instance._close(id);
	}

	_close(id) {
		var state = this.state;
		delete state[id];
		this.setState(state);
	}

	renderDialogs() {
		return Object.keys(this.state).map(key => {
			var dlg = this.state[key];
			var props = dlg.props;
			props.key = key;
			props.dlgid = key;
			return React.createElement(dlg.dlg, props);
		});
	}

	render() {
		return React.createElement(
			'div',
			null,
			this.renderDialogs()
		);
	}
}

if (!document.querySelector('#evq-dialogs')) {
	var dialogs = document.createElement("div");
	dialogs.setAttribute("id", "evq-dialogs");
	document.querySelector('body').appendChild(dialogs);
	ReactDOM.render(React.createElement(Dialogs, null), dialogs);
}
/*
 * This file is part of evQueue
 *
 * evQueue is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * evQueue is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with evQueue. If not, see <http://www.gnu.org/licenses/>.
 *
 * Author: Thibault Kummer
 */

'use strict';

class Help extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    var title = "";
    for (var i = 0; i < this.props.children.length; i++) {
      if (this.props.children[i].type == 'br') title += "\n";else title += this.props.children[i];
    }

    return React.createElement('span', { className: 'help faicon fa-question-circle', title: title });
  }
}
/*
 * This file is part of evQueue
 *
 * evQueue is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * evQueue is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with evQueue. If not, see <http://www.gnu.org/licenses/>.
 *
 * Author: Thibault Kummer
 */

'use strict';

class Pannel extends React.Component {
	constructor(props) {
		super(props);
	}

	renderActions() {
		if (!this.props.actions) return;

		var ret = [];
		for (var idx = this.props.actions.length - 1; idx >= 0; idx--) {
			var action = this.props.actions[idx];
			ret.push(React.createElement('span', { key: idx, className: 'action faicon ' + action.icon, onClick: action.callback }));
		}
		return ret;
	}

	render() {
		return React.createElement(
			'div',
			{ className: 'evq-pannel' },
			this.props.left ? this.props.left : '',
			React.createElement(
				'span',
				{ className: 'evq-pannel-title' },
				this.props.title
			),
			this.renderActions()
		);
	}
}
/*
 * This file is part of evQueue
 *
 * evQueue is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * evQueue is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with evQueue. If not, see <http://www.gnu.org/licenses/>.
 *
 * Author: Thibault Kummer
 */

'use strict';

class Select extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			dropdown_opened: false,
			filter: ''
		};

		this.ref = React.createRef();

		this.toggleDropdown = this.toggleDropdown.bind(this);
		this._mouseDown = this._mouseDown.bind(this);
		this.applyFilter = this.applyFilter.bind(this);
		this.changeFilter = this.changeFilter.bind(this);
		this.changeValue = this.changeValue.bind(this);
	}

	componentDidMount() {
		document.addEventListener('mousedown', this._mouseDown);

		this.global_width = window.getComputedStyle(this.ref.current).getPropertyValue('width');
	}

	componentWillUnmount() {
		document.removeEventListener('mousedown', this._mouseDown);
	}

	_mouseDown(event) {
		if (this.ref.current && !this.ref.current.contains(event.target)) this.setState({ dropdown_opened: false });
	}

	toggleDropdown() {
		this.setState({ dropdown_opened: !this.state.dropdown_opened });
	}

	changeFilter(event) {
		this.setState({ filter: event.target.value });
	}

	applyFilter() {
		var filter = this.state.filter.toLowerCase();

		if (filter == '') return this.props.values;

		var values = [];
		for (var i = 0; i < this.props.values.length; i++) {
			if (this.props.values[i].name.toLowerCase().includes(filter)) values.push(this.props.values[i]);
		}

		return values;
	}

	changeValue(value) {
		var event = {
			target: {
				name: this.props.name,
				value: value
			}
		};

		this.setState({ dropdown_opened: false });
		if (this.props.onChange) this.props.onChange(event);
	}

	getValueName(value) {
		for (i = 0; i < this.props.values.length; i++) {
			if (this.props.values[i].value == value) return this.props.values[i].name;
		}

		return undefined;
	}

	renderFilter() {
		if (this.props.filter !== undefined && !this.props.filter) return;

		return React.createElement('input', { autoFocus: true, type: 'text', value: this.state.filter, onChange: this.changeFilter });
	}

	renderDropdown() {
		if (!this.state.dropdown_opened) return;

		return React.createElement(
			'div',
			{ className: 'evq-select-dropdown', style: { width: this.global_width } },
			this.renderFilter(),
			React.createElement(
				'div',
				{ className: 'evq-select-list' },
				this.renderValues()
			)
		);
	}

	renderValues() {
		var values = this.applyFilter();

		if (values.length == 0) return React.createElement(
			'div',
			null,
			'No results found'
		);

		var groupped_values = {};
		for (var i = 0; i < values.length; i++) {
			var group = values[i].group ? values[i].group : 'No group';
			if (groupped_values[group] === undefined) groupped_values[group] = [];

			groupped_values[group].push(values[i]);
		}

		// No groups where set
		if (groupped_values['No group'] && groupped_values['No group'].length == values.length) return React.createElement(
			'ul',
			null,
			this.renderGroup(groupped_values['No group'])
		);

		var ret = [];

		var groups = Object.keys(groupped_values);
		groups.sort(function (a, b) {
			return a.toLowerCase() <= b.toLowerCase() ? -1 : 1;
		});
		for (var i = 0; i < groups.length; i++) {
			var group = groups[i];
			ret.push(React.createElement(
				'div',
				{ className: 'evq-select-group', key: group },
				React.createElement(
					'h3',
					{ key: 'group_' + group },
					groups.length > 1 ? group : ''
				),
				React.createElement(
					'ul',
					null,
					this.renderGroup(groupped_values[group])
				)
			));
		}

		return ret;
	}

	renderGroup(group) {
		return group.map(value => {
			return React.createElement(
				'li',
				{ key: value.value, onClick: () => {
						this.changeValue(value.value);
					} },
				value.name
			);
		});
	}

	renderValue() {
		if (this.props.value !== undefined && this.getValueName(this.props.value) !== undefined) return React.createElement(
			'span',
			null,
			this.getValueName(this.props.value),
			React.createElement('span', { className: 'down faicon fa-chevron-down' })
		);

		if (this.props.placeholder) return React.createElement(
			'span',
			{ className: 'evq-select-placeholder' },
			this.props.placeholder,
			React.createElement('span', { className: 'down faicon fa-chevron-down' })
		);

		return React.createElement(
			'span',
			null,
			'\xA0',
			React.createElement('span', { className: 'down faicon fa-chevron-down' })
		);
	}

	render() {
		var className = 'evq-select';
		if (this.props.className) className += ' ' + this.props.className;

		var value_style = {
			borderRadius: this.state.dropdown_opened ? '0.4rem 0.4rem 0rem 0rem' : '0.4rem 0.4rem 0.4rem 0.4rem'
		};

		return React.createElement(
			'div',
			{ ref: this.ref, className: className },
			React.createElement(
				'div',
				{ className: 'evq-select-value', style: value_style, onClick: this.toggleDropdown },
				this.renderValue()
			),
			this.renderDropdown()
		);
	}
}
/*
 * This file is part of evQueue
 *
 * evQueue is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * evQueue is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with evQueue. If not, see <http://www.gnu.org/licenses/>.
 *
 * Author: Thibault Kummer
 */

'use strict';

class Tabs extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			current: 0
		};
	}

	componentDidUpdate() {
		if (this.props.updateNotify && this.props.updateNotify.current) this.props.updateNotify.current.componentDidUpdate();
	}

	changeTab(idx) {
		this.setState({ current: idx });
	}

	renderTabs() {
		return React.Children.map(this.props.children, (child, i) => {
			if (child.type != Tab) return;

			return React.createElement(
				'li',
				{ key: i, className: this.state.current == i ? 'selected' : '', onClick: () => {
						this.changeTab(i);
					} },
				child.props.title
			);
		});
	}

	renderActiveTab() {
		if (this.props.render) return this.props.render(this.state.current);

		return React.Children.map(this.props.children, (child, i) => {
			if (child.type != Tab) return;

			if (i != this.state.current) return;

			return child.props.children;
		});
	}

	render() {
		return React.createElement(
			'div',
			null,
			React.createElement(
				'ul',
				{ className: 'evq-tabs' },
				this.renderTabs()
			),
			React.createElement(
				'div',
				{ className: 'evq-tabs-content' },
				this.renderActiveTab()
			)
		);
	}
}
/*
 * This file is part of evQueue
 *
 * evQueue is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * evQueue is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with evQueue. If not, see <http://www.gnu.org/licenses/>.
 *
 * Author: Thibault Kummer
 */

'use strict';

class XML extends React.Component {
	constructor(props) {
		super(props);
	}

	attributes(node) {
		var ret = [];
		for (var i = 0; i < node.attributes.length; i++) {
			var attr = node.attributes[i];
			ret.push(React.createElement(
				"span",
				{ key: i },
				"\xA0",
				React.createElement(
					"span",
					{ className: "evq-xml_attributename" },
					attr.name
				),
				"=\"",
				React.createElement(
					"span",
					{ className: "evq-xml_attributevalue" },
					attr.value,
					"\""
				)
			));
		}
		return ret;
	}

	renderNode(node) {
		var ret = [];
		var i = 0;
		while (node) {
			if (node.nodeType == 1) {
				ret.push(React.createElement(
					"div",
					{ key: i, className: "evq-xml_tag" },
					"<",
					React.createElement(
						"span",
						{ className: "evq-xml_tagname" },
						node.nodeName
					),
					this.attributes(node),
					">",
					this.renderNode(node.firstChild),
					"<",
					React.createElement(
						"span",
						{ className: "evq-xml_tagname" },
						"/",
						node.nodeName
					),
					">"
				));
			} else ret.push(React.createElement(
				"span",
				{ key: i },
				node.textContent
			));

			i++;
			node = node.nextSibling;
		}

		return ret;
	}

	render() {
		return React.createElement(
			"div",
			null,
			this.renderNode(this.props.xml)
		);
	}
}
/*
 * This file is part of evQueue
 *
 * evQueue is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * evQueue is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with evQueue. If not, see <http://www.gnu.org/licenses/>.
 *
 * Author: Thibault Kummer
 */

'use strict';

class Tab extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return React.createElement(
      'li',
      null,
      ' ',
      this.props.children,
      ' '
    );
  }
}
/*
 * This file is part of evQueue
 *
 * evQueue is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * evQueue is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with evQueue. If not, see <http://www.gnu.org/licenses/>.
 *
 * Author: Thibault Kummer
 */

'use strict';

class evQueueComponent extends React.Component {
	constructor(props) {
		super(props);

		this.nodes = document.querySelector("body").dataset.nodes.split(',');
		this.last_state = [];
		for (var i = 0; i < this.nodes.length; i++) {
			this.nodes[i] = this.nodes[i].replace('tcp://', 'ws://');
			this.last_state[i] = 'DISCONNECTED';
		}

		this.nodes_names = document.querySelector("body").dataset.nodesnames.split(',');

		this.state = {
			refresh: true
		};

		// Global evqueue connections
		this.eventDispatcher = this.eventDispatcher.bind(this);
		this.stateChanged = this.stateChanged.bind(this);
		if (evQueueComponent.global === undefined) {
			evQueueComponent.global = {
				evqueue_event: new evQueueCluster(this.nodes, this.nodes_names, this.eventDispatcher, this.stateChanged),
				evqueue_api: new evQueueCluster(this.nodes, this.nodes_names),
				external_id: 0,
				handlers: {},
				subscriptions: []
			};
		}

		this.toggleAutorefresh = this.toggleAutorefresh.bind(this);
		if (this.evQueueEvent !== undefined) this.evQueueEvent = this.evQueueEvent.bind(this);

		this.evqueue_event = evQueueComponent.global.evqueue_event;
		this.evqueue_api = evQueueComponent.global.evqueue_api;

		this.prepareAPI = this.prepareAPI.bind(this);
	}

	GetNodes() {
		return this.nodes_names;
	}

	GetNodeByName(name) {
		for (var i = 0; i < this.nodes_names.length; i++) if (this.nodes_names[i] == name) return i;
		return -1;
	}

	GetNodeByCnx(name) {
		for (var i = 0; i < this.nodes.length; i++) if (this.nodes[i] == name) return i;
		return -1;
	}

	GetNodeByIdx(idx) {
		return this.nodes_names[idx];
	}

	toggleAutorefresh() {
		this.setState({ refresh: !this.state.refresh });
	}

	shouldComponentUpdate(nextProps, nextState) {
		if (nextState.refresh) return true;else if (this.state.refresh) return true;
		return false;
	}

	eventDispatcher(data) {
		var external_id = parseInt(data.documentElement.getAttribute('external-id'));
		evQueueComponent.global.handlers[external_id](data);
	}

	xpath(xpath, context) {
		var nodes_ite = context.ownerDocument.evaluate(xpath, context);
		if (nodes_ite.resultType == 1) return nodes_ite.numberValue;

		var ret = [];
		var node;
		while (node = nodes_ite.iterateNext()) {
			var obj = { domnode: node };

			for (var i = 0; i < node.attributes.length; i++) obj[node.attributes[i].name] = node.attributes[i].value;
			ret.push(obj);
		}

		return ret;
	}

	parseResponse(xmldoc, output_xpath_filter = "/response/*") {
		var ret = { response: [] };

		var root = xmldoc.documentElement;
		for (var i = 0; i < root.attributes.length; i++) ret[root.attributes[i].name] = root.attributes[i].value;

		ret.response = this.xpath(output_xpath_filter, xmldoc.documentElement);

		return ret;
	}

	API(api) {
		var self = this;
		return new Promise(function (resolve, reject) {
			self.evqueue_api.API(api).then(xml => {
				if (xml && xml.documentElement.getAttribute('error')) {
					var error = xml.documentElement.getAttribute('error');
					var code = xml.documentElement.getAttribute('error-code');
					Dialogs.open(Alert, { content: React.createElement(
							'div',
							null,
							'evQueue engine returned error :',
							React.createElement('br', null),
							React.createElement('br', null),
							'Code : ',
							React.createElement(
								'b',
								null,
								code
							),
							React.createElement('br', null),
							'Message : ',
							React.createElement(
								'b',
								null,
								error
							),
							React.createElement('br', null),
							React.createElement('br', null),
							'It is likely that your last action didn\'t worked'
						) });
					reject(error);
				} else resolve(xml);
			});
		});
	}

	Subscribe(event, api, send_now, instance_id = 0) {
		var external_id = ++evQueueComponent.global.external_id;
		evQueueComponent.global.handlers[external_id] = this.evQueueEvent;
		evQueueComponent.global.subscriptions.push({
			event: event,
			api: api,
			instance: this,
			instance_id: instance_id,
			external_id: external_id
		});

		return this.subscribe(event, api, send_now, instance_id, external_id);
	}

	subscribe(event, api, send_now, instance_id, external_id) {
		var api_cmd_b64 = btoa(this.evqueue_event.BuildAPI(api));

		var attributes = {
			type: event,
			api_cmd: api_cmd_b64,
			send_now: send_now ? 'yes' : 'no',
			external_id: external_id
		};

		if (instance_id) attributes.instance_id = instance_id;

		return this.evqueue_event.API({
			node: api.node,
			group: 'event',
			action: 'subscribe',
			attributes: attributes
		});
	}

	Unsubscribe(event, instance_id = 0) {
		// Find correct subsciption
		var subscriptions = evQueueComponent.global.subscriptions;
		var external_id = 0;
		for (var i = 0; i < subscriptions.length; i++) {
			if (subscriptions[i].event == event && subscriptions[i].instance == this && subscriptions[i].instance_id == instance_id) {
				external_id = subscriptions[i].external_id;
				break;
			}
		}

		var attributes = {
			type: event,
			external_id: external_id
		};

		if (instance_id) attributes.instance_id = instance_id;

		return this.evqueue_event.API({
			node: '*',
			group: 'event',
			action: 'unsubscribe',
			attributes: attributes
		});
	}

	UnsubscribeAll() {
		return this.evqueue_event.API({
			node: api.node,
			group: 'event',
			action: 'unsubscribeall'
		});
	}

	simpleAPI(api, message = false, confirm = false) {
		var self = this;

		if (confirm !== false) {
			Dialogs.open(Confirm, {
				content: confirm,
				confirm: () => {
					self.API(api).then(() => {
						if (message !== false) Message(message);
					});
				}
			});
		} else {
			self.API(api).then(() => {
				if (message !== false) Message(message);
			});
		}
	}

	prepareAPI(event) {
		var api = this.state.api;
		if (event.target.name == 'node') api.node = event.target.value;else if (event.target.name.substr(0, 10) == 'parameter_') api.parameters[event.target.name.substr(10)] = event.target.value;else api.attributes[event.target.name] = event.target.value;
		this.setState({ api: api });
	}

	stateChanged(node, state) {
		var node_idx = this.GetNodeByCnx(node);
		var node_name = this.GetNodeByIdx(node_idx);

		if (this.last_state[node_idx] == 'ERROR' && state == 'READY') {
			var subscriptions = evQueueComponent.global.subscriptions;
			for (var i = 0; i < subscriptions.length; i++) {
				if (subscriptions[i].api.node == '*' || subscriptions[i].api.node == node_name) {
					// Change API commande to reconnect only to the needed node
					var api = {};
					Object.assign(api, subscriptions[i].api);
					api.node = node_name;
					this.subscribe(subscriptions[i].event, api, true, subscriptions[i].instance_id, subscriptions[i].external_id);
				}
			}
		}

		this.last_state[node_idx] = state;

		if (this.clusterStateChanged !== undefined) this.clusterStateChanged(node, state);
	}
}
/*
 * This file is part of evQueue
 *
 * evQueue is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * evQueue is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with evQueue. If not, see <http://www.gnu.org/licenses/>.
 *
 * Author: Thibault Kummer
 */

'use strict';

class InstanceDetails extends evQueueComponent {
	constructor(props) {
		super(props);

		this.details_dlg = [];

		this.dlg = React.createRef();

		this.tabs = this.tabs.bind(this);
		this.taskDetail = this.taskDetail.bind(this);
		this.relaunch = this.relaunch.bind(this);
		this.debug = this.debug.bind(this);
		this.kill = this.kill.bind(this);
	}

	componentDidMount() {
		var api = { node: this.props.node, group: 'instance', action: 'query', attributes: { id: this.props.id } };
		this.Subscribe('TASK_QUEUE', api, false, this.props.id);
		this.Subscribe('TASK_EXECUTE', api, false, this.props.id);
		this.Subscribe('TASK_TERMINATE', api, true, this.props.id);
	}

	componentWillUnmount() {
		this.Unsubscribe('TASK_QUEUE', this.props.id);
		this.Unsubscribe('TASK_EXECUTE', this.props.id);
		this.Unsubscribe('TASK_TERMINATE', this.props.id);
	}

	evQueueEvent(data) {
		this.setState({ workflow: data });
		this.notifyTasksDetail();
	}

	relaunch() {
		var root = this.state.workflow.documentElement.firstChild;
		var user = root.getAttribute('user');
		var host = root.getAttribute('host');
		var name = root.getAttribute('name');

		var parameters = this.xpath('/response/workflow/parameters/parameter', this.state.workflow.documentElement);
		var parameters_obj = {};
		for (var i = 0; i < parameters.length; i++) parameters_obj[parameters[i].name] = parameters[i].domnode.textContent;

		Dialogs.open(WorkflowLauncher, {
			node: this.props.node,
			name: name,
			user: user,
			host: host,
			parameters: parameters_obj
		});
	}

	debug() {
		this.simpleAPI({
			group: 'instance',
			action: 'debugresume',
			attributes: { id: this.props.id },
			node: this.props.node
		}, 'Debugging new instance ' + this.props.id);
	}

	kill(task) {
		var task_name = task.name ? task.name : task.path;

		this.simpleAPI({
			group: 'instance',
			action: 'killtask',
			attributes: { 'id': this.props.id, 'pid': task.pid },
			node: this.props.node
		}, "Killed task " + task_name, "Are you sure you want to kill this task ?");
	}

	title() {
		return React.createElement(
			'span',
			null,
			'Instance ',
			this.props.id,
			' ',
			React.createElement('span', { className: 'faicon fa-rocket', title: 'Relaunch this instance', onClick: this.relaunch })
		);
	}

	tabs(idx) {
		if (idx == 0) return this.tabWorkflow();else if (idx == 1) return this.tabXML();else if (idx == 2) return this.tabParameters();else if (idx == 3) return this.tabDebug();
	}

	tabXML() {
		return React.createElement(XML, { xml: this.state.workflow.documentElement.firstChild });
	}

	tabWorkflow() {
		if (!this.state.workflow) return;

		return React.createElement(
			'div',
			null,
			this.renderWorkflow()
		);
	}

	workflowComment(workflow) {
		var comment = workflow.getAttribute('comment');

		if (comment) return React.createElement(
			'div',
			null,
			React.createElement(
				'i',
				null,
				comment
			)
		);
	}

	renderWorkflow() {
		var workflow = this.state.workflow.documentElement.firstChild;

		return React.createElement(
			'div',
			null,
			this.workflowComment(workflow),
			React.createElement('br', null),
			React.createElement(
				'div',
				{ className: 'workflow' },
				this.xpath('subjobs/job', workflow).map(node => {
					return this.renderJob(node);
				})
			)
		);
	}

	jobStatus(job) {
		if (job.status == 'SKIPPED') return React.createElement(
			'div',
			{ className: 'jobStatus skipped' },
			React.createElement('span', { className: 'faicon fa-remove', title: job.details + " " + job.condition }),
			' job skipped'
		);else if (job.status == 'ABORTED') return React.createElement(
			'div',
			{ 'class': 'jobStatus error' },
			React.createElement('span', { 'class': 'faicon fa-exclamation-circle', title: job.details }),
			' job aborted'
		);else if (job.details) return React.createElement(
			'div',
			{ 'class': 'jobStatus' },
			React.createElement('span', { 'class': 'faicon fa-question-circle-o', title: job.details })
		);
	}

	renderJob(job) {
		return React.createElement(
			'div',
			{ key: job.evqid, className: 'job', 'data-type': 'job', 'data-evqid': job.evqid },
			React.createElement(
				'div',
				{ className: 'tasks' },
				this.jobStatus(job),
				this.xpath('tasks/task', job.domnode).map(task => {
					return this.renderTask(task);
				})
			),
			this.xpath('subjobs/job', job.domnode).map(job => {
				return this.renderJob(job);
			})
		);
	}

	taskStatus(task) {
		if (task.status == 'ABORTED') return React.createElement('span', { className: 'faicon fa-exclamation-circle error', title: task.status + " - " + task.error });else if (task.status == 'QUEUED') return React.createElement('span', { className: 'faicon fa-hand-stop-o', title: 'QUEUED' });else if (task.status == 'EXECUTING') return React.createElement('span', { className: 'fa fa-spinner fa-pulse fa-fw' });else if (task.status == 'TERMINATED' && task.retry_at) return React.createElement('span', { className: 'faicon fa-clock-o', title: "Will retry at : " + task.retry_at });else if (task.status == 'TERMINATED' && task.retval != 0) return React.createElement('span', { className: 'faicon fa-exclamation error', title: "Return value: " + task.retval });else if (task.status == 'TERMINATED' && task.retval == 0 && this.xpath('count(./output[@retval != 0])', task.domnode) > 0) return React.createElement('span', { className: 'faicon fa-check errorThenSuccess' });else if (task.status == 'TERMINATED' && task.retval == 0) return React.createElement('span', { className: 'faicon fa-check success' });
	}

	renderTask(task) {
		return React.createElement(
			'div',
			{ key: task.evqid },
			React.createElement(
				'span',
				{ className: 'task', 'data-evqid': task.evqid, onClick: () => {
						this.taskDetail(task.evqid);
					} },
				React.createElement(
					'span',
					{ className: 'taskState' },
					this.taskStatus(task)
				),
				React.createElement(
					'span',
					{ className: 'taskName' },
					task.type == 'SCRIPT' ? task.name : task.path
				)
			),
			task.status == 'EXECUTING' ? React.createElement('span', { className: 'faicon fa-bomb', title: 'Kill this instance', onClick: () => this.kill(task) }) : ''
		);
	}

	taskFromEvqid(evqid) {
		var task = this.xpath('//task[@evqid=' + evqid + ']', this.state.workflow.documentElement)[0];
		task.input = this.xpath('input', task.domnode, true);
		task.output = this.xpath('output', task.domnode, true);
		task.stderr = this.xpath('stderr', task.domnode);
		task.log = this.xpath('log', task.domnode);
		return task;
	}

	taskDetail(evqid) {
		var ref = Dialogs.open(TaskDetails, { task: this.taskFromEvqid(evqid), node: this.props.node });
		this.details_dlg.push({ evqid: evqid, ref: ref });
	}

	notifyTasksDetail() {
		return this.details_dlg.map(detail => {
			detail.ref.current.setState({ task: this.taskFromEvqid(detail.evqid) });
		});
	}

	tabParameters() {
		return React.createElement(
			'div',
			{ className: 'tabbed' },
			this.renderParameters()
		);
	}

	tabDebug() {
		return React.createElement(
			'div',
			null,
			'Debug mode is used to clone an existing instance and restart it. Successful tasks will not be executed and their output will be kept.',
			React.createElement('br', null),
			React.createElement('br', null),
			'Loops and conditions that have already been evaluated will not be evaluated again.',
			React.createElement('br', null),
			React.createElement('br', null),
			'Error tasks will be restarted and their attributes will be reset.',
			React.createElement('br', null),
			React.createElement('br', null),
			'Modifications on the original workflow will not be taken into account as what is run is a clone of the previous instance.',
			React.createElement('br', null),
			React.createElement('br', null),
			'This mode is used for debugging tasks and workflows without launching each time your full treatment chain.',
			React.createElement('br', null),
			React.createElement('br', null),
			React.createElement(
				'span',
				{ className: 'faicon fa-step-forward', onClick: this.debug },
				' Relaunch this instance in debug mode'
			)
		);
	}

	renderParameters() {
		var parameters = this.xpath('/response/workflow/parameters/parameter', this.state.workflow.documentElement);
		return parameters.map(parameter => {
			return React.createElement(
				'div',
				{ key: parameter.name },
				React.createElement(
					'div',
					null,
					parameter.name
				),
				React.createElement(
					'div',
					null,
					parameter.domnode.textContent
				)
			);
		});
	}

	render() {
		return React.createElement(
			'div',
			null,
			React.createElement(
				Dialog,
				{ dlgid: this.props.dlgid, title: this.title(), width: '400', height: 'auto', ref: this.dlg },
				React.createElement(
					Tabs,
					{ render: this.tabs, updateNotify: this.dlg },
					React.createElement(Tab, { title: 'Tree' }),
					React.createElement(Tab, { title: 'XML' }),
					React.createElement(Tab, { title: 'Parameters' }),
					React.createElement(Tab, { title: 'Debug' })
				)
			)
		);
	}
}
/*
 * This file is part of evQueue
 *
 * evQueue is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * evQueue is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with evQueue. If not, see <http://www.gnu.org/licenses/>.
 *
 * Author: Thibault Kummer
 */

'use strict';

class ListInstances extends evQueueComponent {
	constructor(props, node) {
		super(props);

		this.node = node;

		if (this.node == '*') this.state.workflows = {};else this.state.workflows = { current: { response: [] } };
	}

	evQueueEvent(response) {
		var data = this.parseResponse(response);

		if (this.node == '*') {
			for (var i = 0; i < data.response.length; i++) data.response[i].node_name = data.node;

			var current_state = this.state.workflows;
			current_state[data.node] = data;
		} else var current_state = { current: data };

		this.setState({ workflows: current_state });
	}

	humanTime(seconds) {
		if (seconds < 0) seconds = 0;
		seconds = Math.floor(seconds);
		return (seconds / 86400 >= 1 ? Math.floor(seconds / 86400) + ' days, ' : '') + (seconds / 3600 >= 1 ? Math.floor(seconds / 3600) % 24 + 'h ' : '') + (seconds / 60 >= 1 ? Math.floor(seconds / 60) % 60 + 'm ' : '') + seconds % 60 + 's';
	}

	timeSpan(dt1, dt2 = '') {
		var duration = (Date.parse(dt2) - Date.parse(dt1)) / 1000;

		if (dt1.split(' ')[0] == dt2.split[0]) dt2.replace(/^\d{4}-\d{2}-\d{2}/, ''); // don't display same date twice

		var dts = [dt1, dt2];
		var today = new Date().toISOString().substr(0, 10);
		var yesterday = new Date(Date.now() - 86400000).toISOString().substr(0, 10);
		var tomorrow = new Date(Date.now() + 86400000).toISOString().substr(0, 10);
		for (var i = 0; i < 2; i++) {
			dts[i] = dts[i].replace(new RegExp('^' + today), ''); // don't display today's date
			dts[i] = dts[i].replace(new RegExp('^' + yesterday), 'yesterday'); // 'yesterday' instead of date
			dts[i] = dts[i].replace(new RegExp('^' + tomorrow), 'tomorrow'); // 'tomorrow' instead of date
			dts[i] = dts[i].replace(/:\d+$/, ''); // don't display seconds
		}

		if (duration < 60) dts[1] = false;

		return dts[1] ? dts[0] + '→' + dts[1] : dts[0];
	}

	renderWorkflowsList() {
		var ret = [];

		for (var node in this.state.workflows) {
			ret = ret.concat(this.state.workflows[node].response.map(wf => {
				wf.wf_status = wf.status; // .status seems to be reserved by react, in any case it is replaced by a boolean in the rendered HTML
				return React.createElement(
					'tr',
					{ key: wf.id,
						'data-id': wf.id,
						'data-node': wf.node_name,
						'data-running_tasks': wf.running_tasks,
						'data-retrying_tasks': wf.retrying_tasks,
						'data-queued_tasks': wf.queued_tasks,
						'data-error_tasks': wf.error_tasks,
						'data-waiting_conditions': wf.waiting_conditions
					},
					React.createElement(
						'td',
						{ className: 'center' },
						this.WorkflowStatus(wf)
					),
					React.createElement(
						'td',
						null,
						React.createElement(
							'span',
							{ className: 'action', 'data-id': wf.id, 'data-node-name': wf.node_name, 'data-status': wf.wf_status, onClick: () => {
									Dialogs.open(InstanceDetails, { id: wf.id, node: wf.node_name, width: 300 });
								} },
							wf.id,
							' \u2013 ',
							wf.name,
							' ',
							this.workflowInfos(wf),
							' (',
							this.workflowDuration(wf),
							')'
						),
						'\xA0'
					),
					React.createElement(
						'td',
						{ className: 'center' },
						wf.node_name
					),
					React.createElement(
						'td',
						{ className: 'center' },
						wf.host ? wf.host : 'localhost'
					),
					React.createElement(
						'td',
						{ className: 'tdStarted' },
						this.timeSpan(wf.start_time, wf.end_time)
					),
					this.renderActions(wf)
				);
			}));
		}

		return ret;
	}

	renderWorkflows() {
		if (Object.keys(this.state.workflows).length == 0) return React.createElement(
			'div',
			{ className: 'center' },
			React.createElement('br', null),
			'Loading...'
		);

		var n = 0;
		for (var node in this.state.workflows) n += this.state.workflows[node].response.length;

		if (n == 0) return React.createElement(
			'div',
			{ className: 'center' },
			React.createElement('br', null),
			'No workflow.'
		);

		return React.createElement(
			'div',
			{ className: 'workflow-list' },
			React.createElement(
				'table',
				{ className: 'border' },
				React.createElement(
					'thead',
					null,
					React.createElement(
						'tr',
						null,
						React.createElement(
							'th',
							{ style: { width: '80px' }, className: 'center' },
							'State'
						),
						React.createElement(
							'th',
							null,
							'ID \u2013 Name'
						),
						React.createElement(
							'th',
							null,
							'Node'
						),
						React.createElement(
							'th',
							{ className: 'thStarted' },
							'Host'
						),
						React.createElement(
							'th',
							{ className: 'thStarted' },
							'Time'
						),
						React.createElement(
							'th',
							{ className: 'thActions' },
							'Actions'
						)
					)
				),
				React.createElement(
					'tbody',
					null,
					this.renderWorkflowsList()
				)
			)
		);
	}

	render() {
		return React.createElement(
			'div',
			null,
			this.renderTitle(),
			this.renderWorkflows()
		);
	}
}
/*
 * This file is part of evQueue
 *
 * evQueue is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * evQueue is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with evQueue. If not, see <http://www.gnu.org/licenses/>.
 *
 * Author: Thibault Kummer
 */

'use strict';

class ListQueues extends evQueueComponent {
	constructor(props) {
		super(props);

		this.state.nodes = [];
		this.state.queues = [];
		this.state.idx = 0;

		this.changeNode = this.changeNode.bind(this);
		this.node = 0;
	}

	subscribe() {
		var api = { group: 'statistics', action: 'query', attributes: { type: 'queue' } };
		this.evqueue.Subscribe('QUEUE_ENQUEUE', api);
		this.evqueue.Subscribe('QUEUE_DEQUEUE', api);
		this.evqueue.Subscribe('QUEUE_EXECUTE', api);
		this.evqueue.Subscribe('QUEUE_TERMINATE', api, true);
	}

	componentDidMount() {
		var self = this;
		super.componentDidMount().then(() => {
			self.subscribe();
			self.setState({ nodes: self.GetNodes() });
		});
	}

	changeNode(event) {
		var self = this;
		self.setState({ idx: event.target.dataset.idx });
		this.evqueue.ChangeNode(event.target.dataset.idx).then(() => {
			self.subscribe();
		});
	}

	evQueueEvent(response) {
		var data = this.parseResponse(response, '/response/statistics/*');
		this.setState({ queues: data.response });
	}

	renderQueuesList() {
		return this.state.queues.map(queue => {
			var running_prct = queue.running_tasks / queue.concurrency * 100;
			var queue_prct = queue.size > 20 ? 100 : queue.size / 20 * 100;
			return React.createElement(
				'tr',
				{ key: queue.name, className: 'evenOdd' },
				React.createElement(
					'td',
					null,
					queue.name
				),
				React.createElement(
					'td',
					{ className: 'center' },
					queue.scheduler
				),
				React.createElement(
					'td',
					{ className: 'center' },
					queue.concurrency
				),
				React.createElement(
					'td',
					null,
					React.createElement(
						'div',
						{ className: 'prctgradient' },
						React.createElement(
							'div',
							{ style: { background: 'linear-gradient(to right,transparent ' + running_prct + '%,white ' + running_prct + '%)' } },
							React.createElement(
								'div',
								{ style: { textAlign: 'right', width: running_prct + '%' } },
								Math.round(running_prct),
								'\xA0%'
							)
						)
					),
					queue.running_tasks,
					' task',
					queue.running_tasks ? 's' : '',
					' running.'
				),
				React.createElement(
					'td',
					null,
					React.createElement(
						'div',
						{ className: 'prctgradient' },
						React.createElement(
							'div',
							{ style: { background: "linear-gradient(to right,transparent " + queue_prct + "%,white " + queue_prct + "%)" } },
							React.createElement(
								'div',
								{ style: { textAlign: 'right', width: queue_prct + '%' } },
								'\xA0'
							)
						)
					),
					queue.size,
					' awaiting task',
					queue.size > 1 ? 's' : '',
					' in queue.'
				)
			);
		});
	}

	renderNodesList() {
		var ret = [];
		for (var i = 0; i < this.state.nodes.length; i++) {
			var node = this.state.nodes[i];
			ret.push(React.createElement(
				'li',
				{ key: node, 'data-idx': i, className: this.state.idx == i ? 'selected' : '', onClick: this.changeNode },
				node
			));
		}
		return ret;
	}

	renderQueues() {
		return React.createElement(
			'div',
			{ className: 'workflow-list' },
			React.createElement(
				'table',
				null,
				React.createElement(
					'thead',
					null,
					React.createElement(
						'tr',
						null,
						React.createElement(
							'th',
							null,
							'Name'
						),
						React.createElement(
							'th',
							null,
							'Scheduler'
						),
						React.createElement(
							'th',
							null,
							'Concurrency'
						),
						React.createElement(
							'th',
							null,
							'Running tasks'
						),
						React.createElement(
							'th',
							null,
							'Queued tasks'
						)
					)
				),
				React.createElement(
					'tbody',
					null,
					this.renderQueuesList()
				)
			)
		);
	}

	render() {
		return React.createElement(
			'div',
			null,
			React.createElement(
				'div',
				{ className: 'boxTitle' },
				React.createElement(
					'span',
					{ className: 'title' },
					'aQueues States'
				),
				React.createElement('span', { className: "faicon fa-refresh action" + (this.state.refresh ? ' fa-spin' : ''), onClick: this.toggleAutorefresh })
			),
			React.createElement(
				'ul',
				{ className: 'reacttabs' },
				this.renderNodesList()
			),
			this.renderQueues()
		);
	}
}

if (document.querySelector('#queues')) ReactDOM.render(React.createElement(ListQueues, null), document.querySelector('#queues'));
/*
 * This file is part of evQueue
 *
 * evQueue is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * evQueue is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with evQueue. If not, see <http://www.gnu.org/licenses/>.
 *
 * Author: Thibault Kummer
 */

'use strict';

class TagSelector extends evQueueComponent {
	constructor(props) {
		super(props);

		this.state.values = [];

		this.changeTag = this.changeTag.bind(this);
	}

	componentDidMount() {
		var self = this;
		this.API({
			group: 'tags',
			action: 'list'
		}).then(data => {
			var tags = this.xpath('/response/tag', data.documentElement);

			var values = [];
			for (var i = 0; i < tags.length; i++) values.push({ name: tag.label, value: tag.id });
			this.setState({ values: values });
		});
	}

	changeTag(event) {
		this.setState({ value: event.target.value });
		if (this.props.onChange) this.props.onChange(event);
	}

	render() {
		return React.createElement(Select, { value: this.props.value, values: this.state.values, name: this.props.name, placeholder: 'Choose a tag', onChange: this.changeTag });
	}
}
/*
 * This file is part of evQueue
 *
 * evQueue is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * evQueue is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with evQueue. If not, see <http://www.gnu.org/licenses/>.
 *
 * Author: Thibault Kummer
 */

'use strict';

class TaskDetails extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			execution: props.task.output.length - 1,
			task: this.props.task,
			now: Date.now()
		};

		this.dlg = React.createRef();

		this.changeExecution = this.changeExecution.bind(this);
	}

	componentDidMount() {
		if (this.state.task.status == 'EXECUTING') this.timerID = setInterval(() => {
			this.setState({ now: this.now() });
		}, 1000);
	}

	componentWillUnmount() {
		if (this.timerID !== undefined) clearInterval(this.timerID);
	}

	now() {
		return Date.now();
	}

	renderInputs(task) {
		if (task.input.length == 0) return React.createElement(
			'div',
			null,
			'This task has no inputs'
		);

		return task.input.map(input => {
			return React.createElement(
				'div',
				{ key: input.name },
				React.createElement(
					'div',
					null,
					input.name
				),
				React.createElement(
					'div',
					null,
					input.domnode.textContent
				)
			);
		});
	}

	renderHost(task) {
		if (!task.host) return '';

		return React.createElement(
			'fieldset',
			{ className: 'tabbed' },
			React.createElement(
				'legend',
				null,
				'Remote'
			),
			task.user ? React.createElement(
				'div',
				null,
				React.createElement(
					'div',
					null,
					'User'
				),
				React.createElement(
					'div',
					null,
					task.user
				)
			) : '',
			React.createElement(
				'div',
				null,
				React.createElement(
					'div',
					null,
					'Host'
				),
				React.createElement(
					'div',
					null,
					task.host
				)
			)
		);
	}

	renderOutput(task, output, type) {
		if (!output) return;

		if (task.status == 'EXECUTING') {
			return React.createElement(
				'div',
				null,
				React.createElement('br', null),
				'This task is currently running.',
				React.createElement('br', null),
				'You can view it\'s live output : \xA0',
				React.createElement(
					'a',
					{ target: '_blank', className: 'action', href: "ajax/datastore.php?node=" + this.props.node + "&tid=" + task.tid + "&type=" + type },
					'here'
				)
			);
		}

		if (output['datastore-id']) {
			return React.createElement(
				'div',
				null,
				React.createElement(
					'div',
					null,
					React.createElement(
						'i',
						null,
						'The output of this task is too big and has been stored in the datastore.'
					)
				),
				React.createElement('br', null),
				React.createElement(
					'div',
					null,
					React.createElement(
						'a',
						{ href: 'ajax/datastore.php?id={@datastore-id}&download' },
						React.createElement('span', { className: 'faicon fa-download' }),
						'Download from datastore'
					)
				),
				React.createElement(
					'div',
					null,
					React.createElement(
						'a',
						{ target: '_blank', href: 'ajax/datastore.php?id={@datastore-id}' },
						React.createElement('span', { className: 'faicon fa-eye' }),
						'View in browser'
					)
				)
			);
		}

		if (task['output-method'] == 'XML' && output.retval == 0) return React.createElement(XML, { xml: output.domnode });
		return React.createElement(
			'pre',
			null,
			output.domnode.textContent
		);
	}

	renderExecutions(task) {
		if (task.output.length <= 1) return '';

		return React.createElement(
			'fieldset',
			{ className: 'tabbed' },
			React.createElement(
				'legend',
				null,
				'Previous executions'
			),
			React.createElement(
				'div',
				null,
				React.createElement(
					'div',
					null,
					'Choose'
				),
				React.createElement(
					'div',
					null,
					React.createElement(
						'select',
						{ value: this.state.execution, onChange: this.changeExecution },
						task.output.map((output, idx) => {
							return React.createElement(
								'option',
								{ key: idx, value: idx },
								output.execution_time
							);
						})
					)
				)
			)
		);
	}

	changeExecution(event) {
		this.setState({ execution: event.target.value });
	}

	render() {
		var task = this.state.task;
		var execution = this.state.execution >= 0 ? this.state.execution : 0;

		// Clear timer if task is terminated
		if (task.status != 'EXECUTING' && this.timerID !== undefined) {
			clearInterval(this.timerID);
			delete this.timerID;
		}

		return React.createElement(
			Dialog,
			{ dlgid: this.props.dlgid, ref: this.dlg, title: 'Task ' + (task.type == 'SCRIPT' ? task.name : task.path), width: '600' },
			React.createElement(
				Tabs,
				{ updateNotify: this.dlg },
				React.createElement(
					Tab,
					{ title: 'General' },
					React.createElement(
						'fieldset',
						{ className: 'tabbed' },
						React.createElement(
							'legend',
							null,
							'Description'
						),
						React.createElement(
							'div',
							null,
							React.createElement(
								'div',
								null,
								'Type'
							),
							React.createElement(
								'div',
								null,
								task.type == 'SCRIPT' ? 'Script' : 'Shell'
							)
						),
						React.createElement(
							'div',
							null,
							React.createElement(
								'div',
								null,
								task.type == 'SCRIPT' ? 'Name' : 'Path'
							),
							React.createElement(
								'div',
								null,
								task.type == 'SCRIPT' ? task.name : task.path
							)
						)
					),
					React.createElement(
						'fieldset',
						{ className: 'tabbed' },
						React.createElement(
							'legend',
							null,
							'Inputs'
						),
						this.renderInputs(task)
					),
					React.createElement(
						'fieldset',
						{ className: 'tabbed' },
						React.createElement(
							'legend',
							null,
							'Execution'
						),
						React.createElement(
							'div',
							null,
							React.createElement(
								'div',
								null,
								'Status'
							),
							React.createElement(
								'div',
								null,
								task.status
							)
						),
						task.error ? React.createElement(
							'div',
							null,
							React.createElement(
								'div',
								null,
								'Error'
							),
							React.createElement(
								'div',
								null,
								task.error
							)
						) : '',
						task.details ? React.createElement(
							'div',
							null,
							React.createElement(
								'div',
								null,
								'Infos'
							),
							React.createElement(
								'div',
								null,
								task.details
							)
						) : '',
						React.createElement(
							'div',
							null,
							React.createElement(
								'div',
								null,
								'Return value'
							),
							React.createElement(
								'div',
								null,
								task.output.length != 0 ? task.output[execution].retval : '∅'
							)
						),
						React.createElement(
							'div',
							null,
							React.createElement(
								'div',
								null,
								'Started at'
							),
							React.createElement(
								'div',
								null,
								task.output.length != 0 ? task.output[execution].execution_time : task.execution_time
							)
						),
						React.createElement(
							'div',
							null,
							React.createElement(
								'div',
								null,
								'Ended at'
							),
							React.createElement(
								'div',
								null,
								task.output.length != 0 ? task.output[execution].exit_time : '∅'
							)
						),
						React.createElement(
							'div',
							null,
							React.createElement(
								'div',
								null,
								'Execution time'
							),
							React.createElement(
								'div',
								null,
								task.output.length != 0 ? Date.parse(task.output[execution].exit_time) / 1000 - Date.parse(task.output[execution].execution_time) / 1000 : Math.round(this.state.now / 1000 - Date.parse(task.execution_time) / 1000),
								' second(s)'
							)
						),
						React.createElement(
							'div',
							null,
							React.createElement(
								'div',
								null,
								'Number of executions'
							),
							React.createElement(
								'div',
								null,
								task.output.length
							)
						),
						React.createElement(
							'div',
							null,
							React.createElement(
								'div',
								null,
								'Queue'
							),
							React.createElement(
								'div',
								null,
								task.queue
							)
						)
					),
					this.renderHost(task),
					this.renderExecutions(task)
				),
				React.createElement(
					Tab,
					{ title: 'stdout' },
					this.renderOutput(task, task.output.length != 0 ? task.output[execution] : '', 'stdout')
				),
				React.createElement(
					Tab,
					{ title: 'stderr' },
					this.renderOutput(task, task.output.length != 0 ? task.stderr[execution] : '', 'stderr')
				),
				React.createElement(
					Tab,
					{ title: 'log' },
					this.renderOutput(task, task.output.length != 0 ? task.log[execution] : '', 'log')
				)
			)
		);
	}
}
/*
 * This file is part of evQueue
 *
 * evQueue is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * evQueue is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with evQueue. If not, see <http://www.gnu.org/licenses/>.
 *
 * Author: Thibault Kummer
 */

'use strict';

class WorkflowLauncher extends evQueueComponent {
	constructor(props) {
		super(props);

		this.state.workflows = [];

		this.state.api = {
			group: 'instance',
			action: 'launch',
			attributes: {},
			parameters: {}
		};

		if (this.props.node !== undefined) this.state.api.node = this.props.node;
		if (this.props.name !== undefined) this.state.api.attributes.name = this.props.name;
		if (this.props.user !== undefined) this.state.api.attributes.user = this.props.user;
		if (this.props.host !== undefined) this.state.api.attributes.host = this.props.host;
		if (this.props.parameters !== undefined) this.state.api.parameters = this.props.parameters;

		this.dlg = React.createRef();

		this.changeWorkflow = this.changeWorkflow.bind(this);
		this.launch = this.launch.bind(this);
	}

	changeWorkflow(event) {
		var name = event.target.value;
		this.API({ group: 'workflow', action: 'get', attributes: { name: name } }).then(data => {
			var workflow = this.xpath('/response/workflow', data.documentElement)[0];

			var parameters = this.xpath('/response/workflow/workflow/parameters/parameter', data.documentElement);

			var api = this.state.api;
			api.attributes.name = data.documentElement.firstChild.getAttribute('name');
			api.parameters = {};
			for (var i = 0; i < parameters.length; i++) api.parameters[parameters[i].name] = '';

			this.setState({ api: api });
		});
	}

	renderParameters() {
		var self = this;
		return Object.keys(this.state.api.parameters).map(parameter => {
			return React.createElement(
				'div',
				{ key: parameter },
				React.createElement(
					'label',
					null,
					parameter
				),
				React.createElement('input', { type: 'text', name: "parameter_" + parameter, value: self.state.api.parameters[parameter], onChange: self.prepareAPI })
			);
		});
	}

	renderNodes() {
		return this.GetNodes().map(name => {
			return React.createElement(
				'option',
				{ key: name, value: name },
				name
			);
		});
	}

	launch() {
		var self = this;
		this.API(this.state.api).then(data => {
			var instance_id = data.documentElement.getAttribute('workflow-instance-id');
			Message("Launched instance " + instance_id);
			self.dlg.current.close();
		});
	}

	render() {
		return React.createElement(
			Dialog,
			{ dlgid: this.props.dlgid, ref: this.dlg, title: 'Launch a new workflow instance', width: '600' },
			React.createElement(
				Tabs,
				{ updateNotify: this.dlg },
				React.createElement(
					Tab,
					{ title: 'Workflow' },
					React.createElement(
						'h2',
						null,
						'Select workflow',
						React.createElement(
							Help,
							null,
							'Select the workflow to launch.',
							React.createElement('br', null),
							React.createElement('br', null),
							'If the workflow needs parameters, you will be prompted for them.',
							React.createElement('br', null),
							React.createElement('br', null),
							'If needed, you can add an optional comment that will not be used by the engine.'
						)
					),
					React.createElement(
						'div',
						{ className: 'formdiv' },
						React.createElement(
							'form',
							null,
							React.createElement(
								'div',
								null,
								React.createElement(
									'label',
									null,
									'Workflow'
								),
								React.createElement(WorkflowSelector, { name: 'workflow', value: this.state.api.attributes.name, onChange: this.changeWorkflow })
							),
							this.renderParameters(),
							React.createElement(
								'div',
								null,
								React.createElement(
									'label',
									null,
									'Comment'
								),
								React.createElement('input', { type: 'text', name: 'comment', onChange: this.prepareAPI })
							)
						)
					)
				),
				React.createElement(
					Tab,
					{ title: 'Remote' },
					React.createElement(
						'h2',
						null,
						'Remote execution',
						React.createElement(
							Help,
							null,
							'The workflow or task can be launched through SSH on a distant machine. Enter the user and host used for SSH connection.'
						)
					),
					React.createElement(
						'div',
						{ className: 'formdiv' },
						React.createElement(
							'form',
							null,
							React.createElement(
								'div',
								null,
								React.createElement(
									'label',
									null,
									'User'
								),
								React.createElement('input', { name: 'user', onChange: this.prepareAPI })
							),
							React.createElement(
								'div',
								null,
								React.createElement(
									'label',
									null,
									'Host'
								),
								React.createElement('input', { name: 'host', onChange: this.prepareAPI })
							)
						)
					)
				),
				React.createElement(
					Tab,
					{ title: 'Node' },
					React.createElement(
						'h2',
						null,
						'Cluster node',
						React.createElement(
							Help,
							null,
							'If you are using evQueue in a clustered environement, specify here the node on which the workflow will be launched.'
						)
					),
					React.createElement(
						'div',
						{ className: 'formdiv' },
						React.createElement(
							'form',
							null,
							React.createElement(
								'div',
								null,
								React.createElement(
									'label',
									null,
									'Node'
								),
								React.createElement(
									'select',
									{ name: 'node', value: this.state.api.node, onChange: this.prepareAPI },
									this.renderNodes()
								)
							)
						)
					)
				)
			),
			React.createElement(
				'button',
				{ className: 'submit', onClick: this.launch },
				'Launch new workflow instance'
			)
		);
	}
}
/*
 * This file is part of evQueue
 *
 * evQueue is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * evQueue is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with evQueue. If not, see <http://www.gnu.org/licenses/>.
 *
 * Author: Thibault Kummer
 */

'use strict';

class WorkflowSelector extends evQueueComponent {
	constructor(props) {
		super(props);

		this.state.values = [];

		this.changeWorkflow = this.changeWorkflow.bind(this);
	}

	componentDidMount() {
		var self = this;
		this.API({ group: 'workflows', action: 'list' }).then(data => {
			var workflows = this.xpath('/response/workflow', data.documentElement);

			var values = [];
			for (var i = 0; i < workflows.length; i++) {
				values.push({
					group: workflows[i].group ? workflows[i].group : 'No group',
					name: workflows[i].name,
					value: this.props.valueType == 'id' ? workflows[i].id : workflows[i].name
				});
			}

			this.setState({ values: values });
		});
	}

	changeWorkflow(event) {
		this.setState({ value: event.target.value });
		if (this.props.onChange) this.props.onChange(event);
	}

	render() {
		return React.createElement(Select, { value: this.props.value, values: this.state.values, name: this.props.name, placeholder: 'Choose a workflow', onChange: this.changeWorkflow });
	}
}
/*
 * This file is part of evQueue
 *
 * evQueue is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * evQueue is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with evQueue. If not, see <http://www.gnu.org/licenses/>.
 *
 * Author: Thibault Kummer
 */

'use strict';

class ExecutingInstances extends ListInstances {
	constructor(props) {
		super(props, '*');

		this.state.nodes_up = 0;
		this.state.nodes_down = 0;
		this.state.now = 0;
		this.timerID = false;

		this.retry = this.retry.bind(this);
	}

	componentDidMount() {
		var api = { node: '*', group: 'status', action: 'query', attributes: { type: 'workflows' } };
		this.Subscribe('INSTANCE_STARTED', api);
		this.Subscribe('INSTANCE_TERMINATED', api, true);

		this.setState({ now: this.now() });

		this.timerID = setInterval(() => this.state.refresh ? this.setState({ now: this.now() }) : this.state.now = this.now(), 1000);
	}

	componentWillUnmount() {
		super.componentWillUnmount();
		clearInterval(this.timerID);
	}

	now() {
		return Date.now();
	}

	workflowDuration(wf) {
		return this.humanTime((this.state.now - Date.parse(wf.start_time)) / 1000);
	}

	workflowInfos(wf) {
		return React.createElement('span', { className: 'faicon fa-info' });
	}

	renderActions(wf) {
		return React.createElement(
			'td',
			{ className: 'tdActions' },
			React.createElement('span', { className: 'faicon fa-ban', title: 'Cancel this instance', onClick: () => this.cancel(wf) }),
			React.createElement('span', { className: 'faicon fa-bomb', title: 'Kill this instance', onClick: () => this.cancel(wf, true) })
		);
	}

	cancel(wf, killtasks = false) {
		var self = this;
		var message;
		if (killtasks) message = "You are about to kill this instance.\nRunning tasks will be killed with SIGKILL and workflow will end immediately.\nThis can lead to inconsistancies in running tasks.";else message = "You are about to cancel this instance.\nRunning tasks will continue to run normally but no new task will be launched.\nRetry schedules will be disabled.";

		Dialogs.open(Confirm, {
			content: message,
			confirm: () => {
				self._cancel(wf, killtasks);
			}
		});
	}

	_cancel(wf, killtasks = false) {
		var self = this;

		this.API({
			group: 'instance',
			action: 'cancel',
			attributes: { id: wf.id },
			node: wf.node_name
		}).then(() => {
			Message('Canceled instance ' + wf.id);
			if (killtasks) {
				this.API({
					group: 'instance',
					action: 'query',
					attributes: { id: wf.id }
				}).then(data => {
					var tasks = self.xpath("//task[@status='EXECUTING']", data.documentElement);
					for (var i = 0; i < tasks.length; i++) {
						var task_name = tasks[i].name ? tasks[i].name : tasks[i].path;
						evqueueAPI({
							group: 'instance',
							action: 'killtask',
							attributes: { 'id': wf.id, 'pid': tasks[i].pid },
							node: wf.node_name
						}).done(function () {
							Message('Killed task ' + task_name);
						});
					}
				});
			}
		});
	}

	WorkflowStatus(wf) {
		if (wf.running_tasks - wf.queued_tasks > 0) return React.createElement('span', { className: 'fa fa-spinner fa-pulse fa-fw', title: 'Task(s) running' });

		if (wf.queued_tasks > 0) return React.createElement('span', { className: 'faicon fa-hand-stop-o', title: 'Task(s) queued' });

		if (wf.retrying_tasks > 0) return React.createElement('span', { className: 'faicon fa-clock-o', title: 'A task ended badly and will retry' });
	}

	clusterStateChanged() {
		this.setState({
			nodes_up: this.evqueue_event.GetConnectedNodes(),
			nodes_down: this.evqueue_event.GetErrorNodes()
		});
	}

	renderNodeStatus() {
		if (this.state.nodes_down == 0) return React.createElement(
			'div',
			{ id: 'nodes-status' },
			React.createElement(
				'a',
				{ href: 'nodes.php' },
				React.createElement(
					'span',
					{ className: 'success' },
					this.state.nodes_up,
					' node',
					this.state.nodes_up != 1 ? 's' : '',
					' up'
				)
			)
		);
		return React.createElement(
			'div',
			{ id: 'nodes-status' },
			React.createElement(
				'a',
				{ href: 'nodes.php' },
				React.createElement(
					'span',
					{ className: 'success' },
					this.state.nodes_up,
					' node',
					this.state.nodes_up != 1 ? 's' : '',
					' up - ',
					React.createElement(
						'span',
						{ className: 'error' },
						this.state.nodes_down,
						' node',
						this.state.nodes_down != 1 ? 's' : '',
						' down'
					)
				)
			)
		);
	}

	renderTitle() {
		var n = 0;
		for (var node in this.state.workflows) n += this.state.workflows[node].response.length;

		var actions = [{ icon: 'fa-clock-o', callback: this.retry }, { icon: 'fa-rocket', callback: () => {
				Dialogs.open(WorkflowLauncher, {});
			} }, { icon: 'fa-refresh ' + (this.state.refresh ? ' fa-spin' : ''), callback: this.toggleAutorefresh }];

		return React.createElement(Pannel, { left: this.renderNodeStatus(), title: 'Executing workflows (' + n + ')', actions: actions });
	}

	retry() {
		this.simpleAPI({ node: '*', group: 'control', action: 'retry', node: '*' }, "Retrying all tasks", "The retry counter of each task in error will be decremented. Continue ?");
	}
}

if (document.querySelector('#executing-workflows')) ReactDOM.render(React.createElement(ExecutingInstances, null), document.querySelector('#executing-workflows'));
/*
 * This file is part of evQueue
 *
 * evQueue is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * evQueue is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with evQueue. If not, see <http://www.gnu.org/licenses/>.
 *
 * Author: Thibault Kummer
 */

'use strict';

class TerminatedInstances extends ListInstances {
	constructor(props) {
		super(props, 'any');

		// Off-state attributes
		this.search_filters = {};
		this.current_page = 1;
		this.items_per_page = 30;

		// Bind actions
		this.nextPage = this.nextPage.bind(this);
		this.previousPage = this.previousPage.bind(this);
		this.removeInstance = this.removeInstance.bind(this);
		this.updateFilters = this.updateFilters.bind(this);
	}

	componentDidMount() {
		var api = { node: '*', group: 'instances', action: 'list' };
		this.Subscribe('INSTANCE_REMOVED', api);
		this.Subscribe('INSTANCE_TERMINATED', api, true);
	}

	workflowDuration(wf) {
		return this.humanTime((Date.parse(wf.end_time) - Date.parse(wf.start_time)) / 1000);
	}

	workflowInfos(wf) {
		return React.createElement('span', { className: 'faicon fa-comment-o', title: "Comment : " + wf.comment });
	}

	renderActions(wf) {
		return React.createElement(
			'td',
			{ className: 'tdActions' },
			React.createElement('span', { className: 'faicon fa-remove', title: 'Delete this instance', onClick: () => {
					this.removeInstance(wf.id);
				} })
		);
	}

	removeInstance(id) {
		this.simpleAPI({
			group: 'instance',
			action: 'delete',
			attributes: { 'id': id }
		}, 'Instance ' + id + ' removed', "You are about to remove instance " + id);
	}

	WorkflowStatus(wf) {
		if (wf.status = 'TERMINATED' && wf.errors > 0) return React.createElement('span', { className: 'faicon fa-exclamation error', title: 'Errors' });

		if (wf.status = 'TERMINATED' && wf.errors == 0) return React.createElement('span', { className: 'faicon fa-check success', title: 'Workflow terminated' });
	}

	renderTitle() {
		var title = React.createElement(
			'span',
			null,
			'Terminated workflows \xA0',
			this.current_page > 1 ? React.createElement('span', { className: 'faicon fa-backward', onClick: this.previousPage }) : '',
			'\xA0',
			(this.current_page - 1) * this.items_per_page + 1,
			' - ',
			this.current_page * this.items_per_page,
			' / ',
			this.state.workflows.current.rows,
			this.current_page * this.items_per_page < this.state.workflows.current.rows ? React.createElement('span', { className: 'faicon fa-forward', onClick: this.nextPage }) : ''
		);

		var actions = [{ icon: 'fa-refresh ' + (this.state.refresh ? ' fa-spin' : ''), callback: this.toggleAutorefresh }];

		return React.createElement(Pannel, { left: '', title: title, actions: actions });
	}

	updateFilters(search_filters) {
		Object.assign(this.search_filters, search_filters);

		this.Unsubscribe('INSTANCE_TERMINATED');

		this.search_filters.limit = this.items_per_page;
		this.search_filters.offset = (this.current_page - 1) * this.items_per_page;

		var api = {
			group: 'instances',
			action: 'list',
			attributes: search_filters
		};

		this.Subscribe('INSTANCE_TERMINATED', api, true);
	}

	nextPage() {
		this.current_page++;
		this.updateFilters(this.search_filters, this.current_page);
	}

	previousPage() {
		this.current_page--;
		this.updateFilters(this.search_filters, this.current_page);
	}
}

if (document.querySelector('#terminated-workflows')) var terminated_instances = ReactDOM.render(React.createElement(TerminatedInstances, null), document.querySelector('#terminated-workflows'));
/*
 * This file is part of evQueue
 *
 * evQueue is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * evQueue is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with evQueue. If not, see <http://www.gnu.org/licenses/>.
 *
 * Author: Thibault Kummer
 */

'use strict';

class InstanceFilters extends evQueueComponent {
	constructor(props) {
		super(props, 'any');

		this.state.filters = {
			filter_node: '',
			filter_name: '',
			dt_inf: '',
			hr_inf: '',
			filter_launched_from: '',
			dt_sup: '',
			hr_sup: '',
			filter_launched_until: '',
			dt_at: '',
			hr_at: '',
			filter_ended_from: ''
		};

		this.state.opened = false;
		this.state.parameters = [];

		this.hours = [];
		for (var i = 0; i < 24; i++) {
			var h = ('' + i).padStart(2, '0');
			this.hours.push(h + ':00');
			this.hours.push(h + ':30');
		}

		this.state.nodes = [{ name: 'All', value: '' }];
		var nodes = this.GetNodes();
		for (var i = 0; i < nodes.length; i++) this.state.nodes.push({ name: nodes[i], value: nodes[i] });

		this.toggleFilters = this.toggleFilters.bind(this);
		this.filterChange = this.filterChange.bind(this);
		this.cleanFilters = this.cleanFilters.bind(this);
	}

	toggleFilters() {
		this.setState({ opened: !this.state.opened });
	}

	implodeDate(date, hour) {
		if (!date) return '';

		if (date && !hour) return date;

		return date + ' ' + hour;
	}

	filterChange(event) {
		this.setFilter(event.target.name, event.target.value);

		if (event.target.name == 'dt_inf' || event.target.name == 'hr_inf') this.setFilter('filter_launched_from', this.implodeDate(this.state.filters.dt_inf, this.state.filters.hr_inf));
		if (event.target.name == 'dt_sup' || event.target.name == 'hr_sup') this.setFilter('filter_launched_until', this.implodeDate(this.state.filters.dt_sup, this.state.filters.hr_sup));
		if (event.target.name == 'dt_at' || event.target.name == 'hr_at') {
			var hr = this.state.filters.hr_at;
			if (hr && hr.length <= 5) hr += ':59';

			this.setFilter('filter_launched_until', this.implodeDate(this.state.filters.dt_at, hr));
			this.setFilter('filter_ended_from', this.implodeDate(this.state.filters.dt_at, this.state.filters.hr_at));
		}

		if (this.props.onChange) this.props.onChange(this.state.filters);
	}

	setFilter(name, value) {
		var filters = this.state.filters;
		filters[name] = value;
		this.setState({ filters: filters });
	}

	cleanFilters() {
		var filters = this.state.filters;
		for (name in filters) filters[name] = '';

		this.setState({ filters: filters, opened: false });

		if (this.props.onChange) this.props.onChange(filters);
	}

	hasFilter() {
		var filters = this.state.filters;
		for (name in filters) {
			if (filters[name] != '') return true;
		}
		return false;
	}

	renderExplain() {
		if (Object.keys(this.state.filters).length == 0) return 'Showing all terminated workflows';

		var explain;
		if (this.state.filters.filter_error) explain = 'Showing failed ';else explain = 'Showing terminated ';

		explain += (this.state.filters.filter_workflow ? ' ' + this.state.filters.filter_workflow + ' ' : '') + 'workflows';
		if (this.state.filters.filter_launched_until && this.state.filters.filter_ended_from) explain += ' that were running at ' + this.state.filters.filter_launched_until;else if (this.state.filters.filter_launched_from && this.state.filters.filter_launched_until) explain += ' between ' + this.state.filters.filter_launched_from + ' and ' + this.state.filters.filter_launched_until;else if (this.state.filters.filter_launched_from) explain += ' since ' + this.state.filters.filter_launched_from;else if (this.state.filters.filter_launched_until) explain += ' before ' + this.state.filters.filter_launched_until;else if (this.state.filters.filter_tag_id) explain += ' tagged ' + $('#searchform select[name=tagged] option[value=' + this.state.filters.filter_tag_id + ']').text();

		var i = 0;
		if (Object.keys(this.state.parameters).length) {
			explain += ' having ';
			for (var param in parameters) {
				if (i > 0) explain += ', ';
				explain += param.substr(10) + '=' + parameters[param];
				i++;
			}
		}

		if (this.state.filters.filter_node) explain += ' on node ' + this.state.filters.filter_node;

		return explain;
	}

	renderFilters() {
		if (!this.state.opened) return;

		return React.createElement(
			'div',
			{ className: 'formdiv instance_filters' },
			React.createElement(
				'form',
				null,
				React.createElement(
					'div',
					null,
					React.createElement(
						'label',
						null,
						'Node'
					),
					React.createElement(Select, { filter: false, name: 'filter_node', value: this.state.filters.filter_node, values: this.state.nodes, onChange: this.filterChange })
				),
				React.createElement(
					'div',
					null,
					React.createElement(
						'label',
						null,
						'Workflow'
					),
					React.createElement(WorkflowSelector, { valueType: 'name', name: 'filter_workflow', value: this.state.filters.filter_workflow, onChange: this.filterChange })
				),
				React.createElement(
					'div',
					null,
					React.createElement(
						'label',
						null,
						'Tag'
					),
					React.createElement(TagSelector, { name: 'filter_tagged', value: this.state.filters.filter_tagged, onChange: this.filterChange })
				),
				React.createElement(
					'div',
					null,
					React.createElement(
						'label',
						null,
						'Test'
					),
					React.createElement('input', { type: 'text', name: 'aze' })
				),
				React.createElement(
					'div',
					null,
					React.createElement(
						'label',
						null,
						'Launched between'
					),
					'Date\xA0:\xA0',
					React.createElement(DatePicker, { name: 'dt_inf', value: this.state.filters.dt_inf, onChange: this.filterChange }),
					'\xA0 Hour\xA0:\xA0',
					React.createElement(Autocomplete, { className: 'hour', name: 'hr_inf', value: this.state.filters.hr_inf, autocomplete: this.hours, onChange: this.filterChange }),
					'\xA0\xA0',
					React.createElement(
						'b',
						null,
						'and'
					),
					'\xA0\xA0 Date\xA0:\xA0',
					React.createElement(DatePicker, { name: 'dt_sup', value: this.state.filters.dt_sup, onChange: this.filterChange }),
					'\xA0 Hour\xA0:\xA0',
					React.createElement(Autocomplete, { className: 'hour', name: 'hr_sup', value: this.state.filters.hr_sup, autocomplete: this.hours, onChange: this.filterChange })
				),
				React.createElement(
					'div',
					null,
					React.createElement(
						'label',
						null,
						'Workflows that were running at'
					),
					'Date\xA0:\xA0',
					React.createElement(DatePicker, { name: 'dt_at', value: this.state.filters.dt_at, onChange: this.filterChange }),
					'\xA0 Hour\xA0:\xA0',
					React.createElement(Autocomplete, { className: 'hour', name: 'hr_at', value: this.state.filters.hr_at, autocomplete: this.hours, onChange: this.filterChange })
				)
			)
		);
	}

	render() {
		return React.createElement(
			'div',
			null,
			React.createElement(
				'a',
				{ className: 'action', onClick: this.toggleFilters },
				'Filters'
			),
			' : ',
			React.createElement(
				'span',
				null,
				this.renderExplain()
			),
			this.hasFilter() ? React.createElement('span', { className: 'faicon fa-remove', title: 'Clear filters', onClick: this.cleanFilters }) : '',
			this.renderFilters()
		);
	}
}

if (document.querySelector('#searchformcontainer')) ReactDOM.render(React.createElement(InstanceFilters, { onChange: terminated_instances.updateFilters }), document.querySelector('#searchformcontainer'));
