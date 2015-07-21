var ParserGen = function (tokenizers) {
    var lex = new Lex();
    function Lex () {
        var lex = this instanceof Lex ? this : Object.create(Lex.prototype);
        var dict = [];
        for(var i = 0; i < tokenizers.length; i++) {
            dict[i] = new Tokenizer(tokenizers[i][0], tokenizers[i][1]);
        }

        function Tokenizer (type, pattern) {
            var tokenizer = this instanceof Tokenizer ? this : Object.create(Tokenizer.prototype);
            tokenizer.type = type;
            tokenizer.pattern = pattern;
            tokenizer.nextMatch = null;
            tokenizer.setIndex = function (index) {
                tokenizer.pattern.lastIndex = index;
            };
            tokenizer.test = function (src) {
                var oldIndex = tokenizer.pattern.lastIndex;
                tokenizer.nextMatch = tokenizer.pattern.exec(src);
                tokenizer.setIndex(oldIndex);
            };
            tokenizer.getMatch = function (src) {
                return {
                    type: tokenizer.type,
                    entity: tokenizer.pattern.exec(src)[1]
                };
            };
            return tokenizer;
        }

        lex.isEmpty = function () {
            return !dict.length;
        }

        lex.getDict = function () {
            return dict;
        };
        
        lex.match = function (src) {
            for (var i in dict) {
                var tokenizer = dict[i];
                tokenizer.test(src)
            }
            if (!lex.closest()) {
                console.warn("No tokens found.");
                return null;
            }
            return {
                tokenizer: lex.closest(),
                token: lex.closest().getMatch(src)
            };
        };
        
        lex.setIndex = function (index) {
            for (var i in dict) {
                dict[i].setIndex(index);
            }
        };
        
        lex.closest = function () {
            var closest;
            for (var i in dict) {
                if (!closest && dict[i].nextMatch) {
                    closest = dict[i];
                    continue;
                }
                if (dict[i].nextMatch && dict[i].nextMatch.index < closest.nextMatch.index) {
                    closest = dict[i];
                }
            }
            return closest;
        };
    
        return lex;
    }
    
    this.tokenize = function (cb) {
        if (lex.isEmpty()) {
            console.warn("No tokenizers defined; parse aborted.");
            return [];
        }

        var tokens = [];
        
        var index = 0, tokenIndex = 0, i = 0;
        lex.setIndex(0);
        while (index < this.length) {
            var match = lex.match(this);
            if (!match) {
                return cb ? cb([]) : [];
            }
            tokens[tokenIndex++] = match.token;
            index = match.tokenizer.pattern.lastIndex;
            lex.setIndex(index);
        }
        
        this.tokens = tokens;
        return cb ? cb(tokens) : tokens;
    };
    
    this.parse = function (cb) {
        if (!this.tokens) {
            console.warn("String hasn't been tokenized; parse aborted.");
            return cb ? cb([]) : [];
        }
        
        /* TODO: build abstract syntax tree here using CFG */
        ast = [];
        
        return cb ? cb([]) : [];
    };
};