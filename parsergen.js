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
                var thematch = tokenizer.pattern.exec(src);
                return thematch[1];
            };
            return tokenizer;
        }

        lex.getDict = function () {
            return dict;
        };
        
        lex.match = function (src) {
            for (var i in dict) {
                var tokenizer = dict[i];
                tokenizer.test(src)
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
    
    return function () {
        var tokens = [];
        
        var index = 0, tokenIndex = 0, i = 0;
        lex.setIndex(0);
        while (index < this.length) {
            var match = lex.match(this);
            tokens[tokenIndex++] = match.token;
            index = match.tokenizer.pattern.lastIndex;
            lex.setIndex(index);
        }
        
        return tokens;
    };
};

String.prototype.parse = new ParserGen([
    ["identifier", /([A-Za-z_][A-Za-z_0-9]*)/g],
    ["number", /([0-9]+)/g],
    ["parens", /(\(|\))/g],
    ["comma", /(\,)/g],
    ["scope", /(\{|\})/g],
    ["semicolon", /(;)/g],
    ["assignment", /(\=)/g],
    ["string", /(".*")/g],
    ["character", /('.')/g]
]);
String.prototype.parse.bind(this);

window.onload = function () {
    document.querySelector("button").onclick = function () {
        var val = document.querySelector("#src").value;
        document.querySelector("#parsed").value = val.parse();
    };
};