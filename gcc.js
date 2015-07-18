var jsgcc = function (editor) {
    /* "new"-agnostic constructor -- can construct new compiler without "new" keywd */
    var compiler = this instanceof jsgcc ? this : Object.create(jsgcc.prototype);

    /* the element to read source code from */
    compiler.editor = document.querySelector(editor);

    /* the actual compiler */
    compiler.compile = function (options, cb) {
        /* default compiler options */
        var defaultOptions = {
            optimization: 0
        };
        /* use default if user did not define opts */
        var compileOpts = options.length ? options : defaultOptions;

        /* grab source code from editor */
        var src = compiler.editor.value;
        /* and split it into lines */
        var lines = src.split("\n");
        
        /* translate line-by-line */
        var result = translate(null, 0);
        function translate (type, i) {
            /* check if we're done translating */
            if (i >= lines.length) return;
            
            var trans = "";
            /* if we've declared a function, print "save" instrs and recurse */
            if (type === "fndecl") {
                trans += "save %sp, -96, %sp"
                      + "\n\n"
                      + translate("fn", ++i);
                
            /* if we've entered the function, check what to translate next */
            } else if (type === "fn") {
                var regex = /return\s(-?[0-9]+)/;
                if (regex.test(lines[i])) {
                    var exec = regex.exec(lines[i]);
                    var fnRetVal = parseInt(exec[1], 10);
                    if(Math.abs(fnRetVal) > 4096) {
                        trans += "Constant > 4096 at line " + (i + 1);
                        return trans;
                    }
                    trans += "mov "
                          + fnRetVal
                          + ", %i0"
                          + "\n\n"
                          + "ret\n"
                          + "restore";
                }
                
            /* otherwise, check what this line contains */
            } else {
                var regex = /([a-z]+)\s([A-Za-z_]+([0-9]*))+(\s?)\((.*)\)(\n?)(\s*){/;
                if (regex.test(lines[i])) {
                    var exec = regex.exec(lines[i]);
                    trans += ".global "
                          + exec[2]
                          + "\n"
                          + ".section \".text\""
                          + "\n\n"
                          + exec[2] + ":"
                          + "\n"
                          + translate("fndecl", i);
                } else {
                    trans += "Invalid function identifier used at line " + (i + 1);
                }
            }
            return trans;
        }

        return cb ? cb (result) : result;
    };

    return compiler;
};


window.onload = function () {
    var gcc = new jsgcc("textarea");
    document.querySelector("button").onclick = gcc.compile.bind(gcc, [], function(result) {
        document.getElementById("compiled").value = result;
    });
};