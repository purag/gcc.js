tokenizers = [
    ["comment", /(\/\*([\s\S]*?)\*\/)/g],
    ["struct", /(struct)/g],
    ["storage_class_spec", /(static|extern|typedef)/g],
    ["type_spec", /(unsigned|signed|char|short|int|long|float|double)/g],
    ["select_stmt", /(if|else|switch)/g],
    ["labeled_stmt", /(case|default)/g],
    ["iterator_stmt", /(for|while|do)/g],
    ["jump_stmt", /(goto|return|break|continue)/g],
    ["id", /([A-Za-z_][A-Za-z_0-9]*)/g],
    ["number", /([0-9]+)/g],
    ["parens", /(\(|\))/g],
    ["comma", /(\,)/g],
    ["scope", /(\{|\})/g],
    ["semicolon", /(;)/g],
    ["assignment_op", /((&|\||\^|%|\+|\-|\*|\/|<<|>>)?\=)/g],
    ["operator", /(\+|\-|\*|\/|\%)/g],
    ["relational_op", /((<|>)=?)/g],
    ["equality_op", /((=|!)=)/g],
    ["string", /(".*")/g],
    ["character", /('.')/g]
];
var parser = new ParserGen(tokenizers);

window.onload = function () {
    document.querySelector("button").onclick = function () {
        var src = document.querySelector("#src").value,
            tokenized = document.querySelector("#tokenized"),
            parsed = document.querySelector("#parsed");

        tokenized.value = "";
        parsed.value = "";
        
        parser.tokenize(src, function (tokens) {
            for (var i in tokens) {
                var token = tokens[i];
                tokenized.value += "["+token.type+", "+token.value+"]\n";
            }
            tokenized.value += "\n\n";
            parser.parse(src, function (ast) {
                ast.value += ast[0].type + ", " + ast[0].value;
            });
        });
    };
};