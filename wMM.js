;(function() {
    'use strict';
    
    
    var data = {},
        dataalter = {},
        vertical_cache = new Map();
    
    
    const vertical_compare = (a, b) => {
        if (a.length > b.length) return 1;
        if (a.length < b.length) return -1;
        for (var i = a.length; i--;) {
            if (a[i] > b[i]) return 1;
            if (a[i] < b[i]) return -1;
        }
        return 0;
    };
    
    
    const vertical_increase = (y, d) => {
        var c = y.slice();
        c[d] === undefined ? (c[d] = 1) : (c[d] += 1);
        c.fill(0, 0, d);
        return c;
    };
    
    
    const extract = (A, [x, y]) => A[x][y] || 0;
    
    
    const get_vertical = (A, [x, y]) => {
        var val;
        if (vertical_cache.has(A)) {
            val = vertical_cache.get(A);
        } else {
            val = A.map((column, x) => {
                var result = [], i, y = 0;
                for (; y < column.length; ++y) {
                    i = y;
                    while (--i >= 0 && extract(A, [x, y]) === extract(A, [x, i]));
                    result.push(vertical_increase(result[i] ?? [], y - i - 1));
                }
                return result;
            });
            vertical_cache.set(A, val);
        }
        
        if (val[x][y] !== undefined) return val[x][y];
        var ending = val[x].length - 1;
        return vertical_increase(ending >= 0 ? val[x][ending] : [], y - ending - 1);
    };
    
    
    const parentCheck = (A, [x, y]) => {
        if (!y) return [x - 1, y];
        var p = parent(A, [x, y - 1])[0];
        var i = Math.max(y, A[p].length - 1);
        while (extract(A, [p, i]) < extract(A, [x, y]) - 1 || 
               vertical_compare(get_vertical(A, [p, i]), get_vertical(A, [x, y])) > 0) {
            --i;
        }
        return [p, i];
    };
    
    
    const parent = (A, cur) => {
        if (!extract(A, cur)) return [-1, cur[1]];
        var p = cur;
        do {
            p = parentCheck(A, p);
        } while (extract(A, p) !== extract(A, cur) - 1);
        return p;
    };
    
    
    const expand = (M, FSterm) => {
        var LNZx = M.length - 1;
        var LNZy = M[LNZx].findLastIndex(e => e);
        var LNZ = M[LNZx][LNZy];
        var collection = [];
        var working = [LNZx, LNZy];
        
        
        do {
            while (extract(M, working) !== LNZ - 1) {
                working = parent(M, working);
            }
            if (!collection[working[0]]) collection[working[0]] = [];
            collection[working[0]].unshift(working[1]);
        } while (--working[1] >= 0);
        
        var counts = collection.filter(() => true).map(e => e.length);
        var columns = collection.map((e, i) => i).filter(() => true);
        counts.unshift(1);
        
        var root;
        var r = counts.length - 1;
        
        
        if (counts[r] === 1) {
            root = parent(M, [LNZx, LNZy]);
        } else {
            
            const lastValidColumnIndex = columns[columns.length - 1];
            
            root = [lastValidColumnIndex, collection[lastValidColumnIndex][0]];
            
            
            console.assert(
                collection[lastValidColumnIndex] && collection[lastValidColumnIndex].length > 0,
                '末列数据异常', lastValidColumnIndex, collection
            );
        }
        
        var width = LNZx - root[0];
        var height = LNZy - root[1];
        var A = M.map(column => column.slice());
        
        
        --A[LNZx][LNZy];
        
        
        M[root[0]].slice(root[1]).forEach((val, dy) => {
            A[LNZx][LNZy + dy] = val;
        });
        
        var ascending_cache = {};
        
        
        const ascendingAt = (cur) => {
            var str = '' + cur;
            if (ascending_cache[str] !== undefined) return ascending_cache[str];
            if (cur[0] < root[0]) return ascending_cache[str] = -1;
            if (cur[0] === root[0]) return ascending_cache[str] = cur[1];
            return ascending_cache[str] = ascendingAt(parent(A, cur));
        };
        
        
        for (var n = 1; n <= FSterm; ++n) {
            var reference = [], y1 = 0, y2 = 0, cmp;
            
            
            while (y2 <= root[1] + height * n) {
                cmp = vertical_compare(
                    get_vertical(A, [root[0], y1 + 1]),
                    get_vertical(A, [root[0] + width * n, y2])
                );
                if (cmp > 0 || y1 >= root[1]) {
                    reference[y1] = y2;
                    ++y2;
                    continue;
                } else {
                    ++y1;
                    continue;
                }
            }
            
           
            for (var dx = 1; dx <= width; ++dx) {
                var x = root[0] + dx;
                var targetColumn = A[x + width * n] = [];
                var lastmagma = -1;
                
                A[x].forEach((val, y) => {
                    var asc = ascendingAt([x, y]);
                    if (~asc) {
                        if (asc <= root[1] && !vertical_compare(get_vertical(A, [root[0], asc]), get_vertical(A, [x, y]))) {
                            for (var j = (reference[asc - 1] ?? -1) + 1; j <= reference[asc]; ++j) {
                                targetColumn.push(val - extract(A, [root[0], asc]) + extract(A, [root[0] + width * n, j]));
                            }
                            lastmagma = asc;
                        } else {
                            if (~lastmagma) {
                                targetColumn.push(val - extract(A, [root[0], lastmagma]) + extract(A, [root[0] + width * n, reference[lastmagma]]));
                            } else {
                                targetColumn.push(val - extract(A, [root[0], 0]) + extract(A, [root[0] + width * n, 0]));
                            }
                        }
                    } else {
                        targetColumn.push(val);
                    }
                });
            }
            
            
            vertical_cache.delete(A);
        }
        
        
        A.forEach(column => {
            var i = column.findLastIndex(e => e);
            column.splice(i + 1);
        });
        
        return A;
    };
    
    
    if (typeof register !== 'undefined') {
        
        register.push({
            id: 'wmm',
            name: 'Weak mutant matrix',
            display: typeof matrix_display !== 'undefined' ? matrix_display : function(m) {
                
                return JSON.stringify(m);
            },
            able: typeof matrix_limit !== 'undefined' ? matrix_limit : function(m) {
               
                return true;
            },
            compare: typeof matrix_compare !== 'undefined' ? matrix_compare : function(a, b) {
                
                return JSON.stringify(a) === JSON.stringify(b) ? 0 : 1;
            },
            FS: function(m, FSterm) {
                if (String(m) === 'Infinity') return [[], Array(FSterm + 1).fill(1)];
                if (m.length === 0) return [];
                var datakey = typeof matrix_display !== 'undefined' ? matrix_display(m) : JSON.stringify(m);
                if (!data[datakey]) data[datakey] = [];
                else if (data[datakey][FSterm] !== undefined) return data[datakey][FSterm];
                return data[datakey][FSterm] = expand(m, FSterm).slice(0, -1);
            },
            FSalter: function(m, FSterm) {
                if (String(m) === 'Infinity') return [[], Array(FSterm + 1).fill(1)];
                if (m.length === 0) return [];
                var datakey = typeof matrix_display !== 'undefined' ? matrix_display(m) : JSON.stringify(m);
                if (!dataalter[datakey]) dataalter[datakey] = [];
                else if (dataalter[datakey][FSterm] !== undefined) return dataalter[datakey][FSterm];
                return dataalter[datakey][FSterm] = expand(m, FSterm);
            },
            init: function() {
                return [
                    {expr: [[Infinity]], low: [[]], subitems: []},
                    {expr: [], low: [[]], subitems: []}
                ];
            }
        });
    }
    
    
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            expand: expand,
            vertical_compare: vertical_compare,
            get_vertical: get_vertical,
            parent: parent
        };
    } else if (typeof window !== 'undefined') {
        window.MM3 = {
            expand: expand,
            vertical_compare: vertical_compare,
            get_vertical: get_vertical,
            parent: parent
        };
    }
    
})();