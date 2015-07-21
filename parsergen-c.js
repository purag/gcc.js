tokenizers = [
    ["word", /([A-Za-z_][A-Za-z_0-9]*)/g],
    ["number", /([0-9]+)/g],
    ["parens", /(\(|\))/g],
    ["comma", /(\,)/g],
    ["scope", /(\{|\})/g],
    ["semicolon", /(;)/g],
    ["assignment", /(\=)/g],
    ["string", /(".*")/g],
    ["character", /('.')/g],
    ["comment", /(\/\*([\s\S]*?)\*\/)/g]
];

var parser = new ParserGen(tokenizers);

String.prototype.tokenize = parser.tokenize;
String.prototype.parse.bind(this);

String.prototype.parse = parser.parse;
String.prototype.parse.bind(this);