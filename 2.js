var module = {
    exports: {}
};

(function(module, exports) {
    exports.multiply = function (n) { return n * 1000 };
}(module, module.exports))

var f = module.exports.multiply;

console.log(f(5));