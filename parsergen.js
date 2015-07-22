/* Author:  Purag Moumdjian
 * File:    ParserGen.js
 * Date:    21 July 2015 (v0.1 pre-release)
 * License: GNU General Public License v2.0
 * 
 * ParserGen is a text parsing tool that tokenizes text according to the
 * tokenizers passed in and creates parse trees according to the context free
 * grammar passed in.
 */

function ParserGen (tokenizers) {
    var parsergen = this instanceof ParserGen
            ? this
            : Object.create(ParserGen.prototype);

    /* create a lex to tokenize according to */
    var lex = new Lex(tokenizers);
    
    /* Function:   tokenize
     * Purpose:    Iteratively find matches in the src string, constructing an
     *             array of tokens.
     * Parameters: src - the source string to tokenize
     *             cb (optional) - callback function
     * Return:     callback, if set;
     *             else, array of tokens
     */
    parsergen.tokenize = function (src, cb) {
        /* if there are no tokenizers, abort */
        if (lex.isEmpty()) {
            console.warn("No tokenizers defined; parse aborted.");
            return [];
        }

        /* the array of tokens found in the src string */
        var tokens = [];
        
        /* index in the src */
        var index = 0;

        /* make sure we start at the beginning of the src string */
        lex.setIndex(0);

        /* as long as we still have content in the src string... */
        while (index < src.length) {
            /* find the next match */
            var match = lex.match(src);

            /* if there isn't one, we're done finding tokens, so break */
            if (!match) break;

            /* otherwise, add the token to our array and set the index to
             * continue matching from
             */
            tokens.push(match.token);
            index = match.tokenizer.pattern.lastIndex;
            lex.setIndex(index);
        }
        
        return cb ? cb(tokens) : tokens;
    };
    
    /* Function:   parse
     * Purpose:    Construct a series of abstract syntax trees using tokens and
     *             this parser's grammar.
     * Parameters: src - the source string to parse
     *             tokens (optional) - the tokens to build phrases with
     *             cb (optional) - callback function
     * Return:     (function call) callback, if set;
     *             (array) list of abstract syntax trees, else
     */
    parsergen.parse = function (src, tokens, cb) {
        /* if only two arguments of three were passed in... */
        if (arguments.length == 2) {
            /* check if the second arg was the callback, and set cb if so */
            if (typeof tokens == "function") {
                cb = tokens;
            }
        }

        /* if tokens is null, tokenize the string first */
        tokens = tokens || parsergen.tokenize(src);
        
        /* TODO: build abstract syntax tree here using CFG */
        ast = [];
        
        return cb ? cb(ast) : ast;
    };

    return parsergen;

    /* Class Lex
     * Purpose: Performs lexer operations on a given src string
     */
    function Lex (tokenizers) {
        var lex = this instanceof Lex
                ? this
                : Object.create(Lex.prototype);
        
        /* the dictionary of tokenizers */
        var dict = [];

        /* populate the dictionary */
        for(var i = 0; i < tokenizers.length; i++) {
            dict[i] = new Tokenizer(tokenizers[i][0], tokenizers[i][1]);
        }

        /* Function:   isEmpty
         * Purpose:    Test whether the lex's dictionary is empty.
         * Parameters: none
         * Return:     (boolean) true if empty, false if not
         */
        lex.isEmpty = function () {
            return !dict.length;
        };

        /* Function:   getDict
         * Purpose:    Retrieve the lex's dictionary of tokenizers.
         * Parameters: none
         * Return:     (array) list of tokenizers
         */
        lex.getDict = function () {
            return dict;
        };
        
        /* Function:   match
         * Purpose:    Find nearest matching token in the src string. First test
         *             all the tokenizers, then return the closest match.
         *             "Closest" refers to the token which appears earliest 
         *             relative to the lastIndex starting position of the regex.
         * Parameters: src - string to match against
         * Return:     (object) token matched + corresponding tokenizer
         */
        lex.match = function (src) {
            /* test each tokenizer for a match */
            for (var i in dict) {
                var tokenizer = dict[i];
                tokenizer.test(src);
            }

            /* if no match was found, report to console and return null match */
            if (!lex.closest()) {
                console.warn("No tokens found.");
                return null;
            }

            /* else, return the closest matching token */
            return {
                tokenizer: lex.closest(),
                token: lex.closest().getMatch(src)
            };
        };
        
        /* Function:   setIndex
         * Purpose:    Set the lastIndex property for all tokenizers in dict.
         * Parameters: index - new index
         * Return:     none
         */
        lex.setIndex = function (index) {
            for (var i in dict) {
                dict[i].setIndex(index);
            }
        };
        
        /* Function:   closest
         * Purpose:    Find the closest matching token among those tested.
         * Parameters: none
         * Return:     (Tokenizer object) tokenizer with closest matching token
         */
        lex.closest = function () {
            var closest;
            for (var i in dict) {
                /* if this tokenizer has a match, assign it to `closest` only if
                 * (1) this match is closer than the current closest
                 * (2) closest is not already set, or
                 */
                if (dict[i].nextMatch
                    && (dict[i].nextMatch.index < closest.nextMatch.index
                        || !closest)
                ){
                   closest = dict[i];
                }
            }
            return closest;
        };
    
        return lex;

        /* Class Tokenizer
         * Purpose: Stores a typename and pattern for a tokenizer and extracts
         *          matching tokens from a given source string.
         */
        function Tokenizer (type, pattern) {
            var tokenizer = this instanceof Tokenizer
                    ? this
                    : Object.create(Tokenizer.prototype);
            
            tokenizer.type = type;
            tokenizer.pattern = pattern;

            /* upcoming match for this tokenizer */
            tokenizer.nextMatch = null;
            
            /* Function:   setIndex
             * Purpose:    Set the pattern's lastIndex to the given value.
             * Parameters: index - the pattern's new lastIndex
             * Return:     none
             */
            tokenizer.setIndex = function (index) {
                tokenizer.pattern.lastIndex = index;
            };

            /* Function:   test
             * Purpose:    Find the next match of this tokenizer's type,
             *             retaining lastIndex property (essentially, test for
             *             a match of this type).
             * Parameters: src - the string to test against
             * Return:     none
             */
            tokenizer.test = function (src) {
                var oldIndex = tokenizer.pattern.lastIndex;
                tokenizer.nextMatch = tokenizer.pattern.exec(src);
                tokenizer.setIndex(oldIndex);
            };

            /* Function:   getMatch
             * Purpose:    Retrieve the matching token for this tokenizer and
             *             return it along with the token's type.
             * Parameters: src - the string to retrieve matches from
             * Return:     (object) tokenizer type + matched token
             */
            tokenizer.getMatch = function (src) {
                return {
                    type: tokenizer.type,
                    value: tokenizer.pattern.exec(src)[1]
                };
            };

            return tokenizer;
        }
    }
}