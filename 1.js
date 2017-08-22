    var func1 = function(callback){
        setTimeout(function(){
            console.log('foo');
            typeof(callback) !== 'function' || callback();
        }, 499);
    };

    var func2 = function(callback){
        setTimeout(function(){
            console.log('bar');
            typeof(callback) !== 'function' || callback();
        }, 500);
    };

    var func3 = function(callback){
        setTimeout(function(){
            console.log('foobar');
            typeof(callback) !== 'function' || callback();
        }, 501);
    };
    // ... more ...
    // promisify those callback functions
    var promisify = function(func){
        return function(){
            return new Promise(function(resolve){
                func(resolve);
            });
        }
    }
    // array can be infinitely long
    var func_arr = [promisify(func1), promisify(func2), promisify(func3)];
     // solution 1 // fail
    // var master = [];
    // for (var i = 0; i < func_arr.length; i++) {
    //     master[i] = function(){
    //         if (i == 0) {
    //             return func_arr[i]();
    //         }
    //         else {
    //             return master[i-1]().then(function(){
    //                 return func_arr[i]();
    //             })
    //         }
    //     };
    // };
    // master[master.length-1]();

    // solution 2 // success
    func_arr.reduce(function(cur, next) {
        return cur.then(next);
    }, Promise.resolve()).then(function() {
        console.log('job finished');
    });

    // solution 3 // success
    // var master = [];
    // master[0] = func_arr[0]();
    // for (var i = 1; i < func_arr.length; i++) {
    //     master[i] = master[i-1].then(func_arr[i]);
    // };

    // solution 1 // success
    // var master = [];
    // for (var i = 0; i < func_arr.length; i++) {
    //     master[i] = (function(j){
    //         return function(){
    //             if (j == 0) {
    //                 return func_arr[j]();
    //             }
    //             else {
    //                 return master[j-1]().then(function(){
    //                     return func_arr[j]();
    //                 })
    //             }
    //         }
    //     })(i);
    // };
    // var execute = master[master.length-1];
    // execute();
