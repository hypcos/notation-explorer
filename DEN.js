;(()=>{
   /** notation extended from basic Laver pattern
    * *expression*
    * expression = (row)L(row)L...(row)L;R
    * (row) = (a[-1],a[-2],...,a[2],a[1]), big to small
    * L = Number; the step length of each row
    * R = Number list; 0 = no parent; positive = parent row index
    * *encoding*
    * [R,row1,row2,...,rowN]
    * each row = [L,a[-1],a[-2],...,a[1]]; row.length-1 is true length
    * R = [R[1],R[2],...,R[height]]
   */
   var toShort = expr=>expr.slice(1).map(row=>row.slice(1,-row[0]).concat(row[row.length-1]))
   ,compare = (expr1,expr2)=>matrix_compare(toShort(expr1),toShort(expr2))
   ,display = expr=>''+expr==='Infinity'?'Limit':expr.slice(1).map(row=>'('+row.slice(1).join(',')+')'+row[0]).join('')+';'+expr[0].join(',')
   ,isNonzero = expr=> expr.length>1
   ,pleasantUntil = (rows,t)=>{
      var tcheck = t.slice(1+t[0])
      ,tmax = tcheck[0]
      ,tmin = tcheck[tcheck.length-1]
      ,scheck,i1,i2
      for(var n=0;n<rows.length;n++){
         scheck = rows[n].slice(1)
         i1 = scheck.findIndex(x=>x<tmax)
         i2 = scheck.findLastIndex(x=>x>tmin)
         if(~i1 && ~i2 && i1<=i2 && scheck.slice(i1,i2+1).some(x=>!tcheck.includes(x))) return n
      }
      return -1
   }
   ,isLimit = expr=>{
      if(''+expr==='Infinity') return true
      var active = expr[expr.length-1]
      if(!active[1+active[0]]) return false
      return pleasantUntil(expr.slice(active[1+active[0]],-1),active)===-1
   }
   ,cut = expr0=>{
      var expr = expr0.slice(0,-1).map(row=>row.slice())
      expr[0].pop()
      return expr
   }
   ,compute_parent_for_mapped_row = (r_old,row_idx,start,end,old_height,tmin)=>{
      var parent = 0
      if(row_idx<=r_old.length&&row_idx>=1) parent = r_old[row_idx-1]
      if(parent && start<=parent && parent<=end) return parent-start+old_height
      var ancestor = parent
      while(ancestor){
         if(ancestor<tmin) return ancestor
         ancestor = r_old[ancestor-1]
      }
      return 0
   }
   ,ap = (s,t)=> [s[0]].concat(s.slice(1).map(x=> x<t[t.length-1]?x: x>=t[1+t[0]]?x-t[1+t[0]]+t[1] : t[t.lastIndexOf(x)-t[0]] ))
   ,copy = (raw,flag)=>{
      var active = raw[raw.length-1]
      ,expr = cut(raw)
      ,row_idx
      expr = expr.concat(raw.slice(active[1+active[0]],active[1+active[0]]+flag).map(row=>ap(row,active)))
      for(row_idx=active[1+active[0]];row_idx<active[1+active[0]]+flag;++row_idx){
         expr[0].push(compute_parent_for_mapped_row(raw[0],row_idx,active[1+active[0]],active[1+active[0]]+flag-1,raw.length-1,active[active.length-1]))
      }
      return expr
   }
   ,extend = raw=>{
      var active = raw[raw.length-1]
      ,expr = cut(raw)
      ,row_idx
      expr = expr.concat(raw.slice(active[1+active[0]]).map(row=>ap(row,active)))
      for(row_idx=active[1+active[0]];row_idx<raw.length;++row_idx){
         expr[0].push(compute_parent_for_mapped_row(raw[0],row_idx,active[1+active[0]],raw.length-1,raw.length-1,active[active.length-1]))
      }
      return expr
   }
   ,isAncestor = (R,i,j)=> i===j||(i<j&&isAncestor(R,i,R[j-1]))
   ,comp = (raw,i,T)=>{
      var expr = raw.slice(0,i).map(row=>row.slice())
      ,u = T.length
      ,li = raw[i].length<raw[i][0]*2+1 ? raw[i][0] : raw[i][0]+1
      ,ci = raw[i].length<raw[i][0]*2+1 ? raw[i].slice(1,-raw[i][0]).concat(raw[i].slice(1+raw[i][0])) : raw[i].slice(1)
      for(var r=0;r<u;++r){
         var values = ci.concat(T.slice(0,1+r)).concat(Array(r).fill(0).map((x,rr)=>raw[i][1]+1+rr))
         values.sort((x,y)=>y-x)
         expr[i+r] = [li+r].concat(values)
      }
      for(var ii=i;ii<raw.length;++ii){
         values = raw[ii].slice(1).map(x=>x<=i?x:x+u)
         var flag = isAncestor(raw[0],i,ii) && values.findIndex(x=>x<=i)<=raw[ii][0]
         if(flag){
            values = values.concat(T).concat(Array(u).fill(0).map((x,uu)=>i+1+uu))
            values.sort((x,y)=>y-x)
         }
         expr[ii+u] = [raw[ii][0]+(flag?u:0)].concat(values)
      }
      var m = x=>x<i?x:x+u
      expr[0] = raw[0].slice(0,i)
      for(r=0;r<u;++r) expr[0][i+r] = i+r
      for(ii=i+1;ii<raw.length;++ii) expr[0][m(ii)-1] = m(raw[0][ii-1])
      return expr
   }
   ,fullcomp = (expr,i)=>{
      var T = [expr[i][expr[i][0]]]
      do{
         T.unshift(expr[T[0]][2])
      }while(T[0]>expr[i][expr[i][0]+1]);
      T = T.slice(1,-1)
      return T.length ? comp(expr,i,T) : expr
   }
   ,expand = (raw,FSterm,longer)=>{
      var active = raw[raw.length-1]
      if(!active[1+active[0]]) return cut(raw)
      var flag = pleasantUntil(raw.slice(active[1+active[0]],-1),active)
      ,len = raw.length-1
      var expr = raw
      if(~flag){
         expr = copy(expr,flag)
      }else{
         for(var n=1;n<=FSterm;++n) expr = extend(expr)
         expr = longer ? copy(expr,1) : cut(expr)
      }
      for(var i = expr.length-1;i>=len;--i){
         if(expr[i].length<=expr[i][0]*2+1) expr = fullcomp(expr,i)
      }
      return expr
   }
   ,LimitR = n=>n ? [0,0,0].concat(Array(n-1).fill(0).map((x,nn)=>3+nn)) : [0,0]
   ,Limit_row = n=>Array(3+n).fill(0).map((x,nn)=>nn).concat(2).reverse()
   ,Limit = n=>[LimitR(n),[1,1,0],[1,2,1,0]].concat(Array(n).fill(0).map((x,nn)=>Limit_row(1+nn)))
   register.push({
      id:'den'
      ,name:'Defective embedding notation'
      ,display
      ,able:isLimit
      ,semiable:isNonzero
      ,compare
      ,FS:(m,FSterm)=>{
         if(''+m==='Infinity') return Limit(FSterm)
         if(m.length<=1) return [[]]
         return expand(m,FSterm,false)
      }
      ,FSalter:(m,FSterm)=>{
         if(''+m==='Infinity') return Limit(FSterm)
         if(m.length<=1) return [[]]
         return expand(m,FSterm,true)
      }
      ,init:()=>([
         {expr:[[Infinity]],low:[[[]]],subitems:[]}
         ,{expr:[[]],low:[[[]]],subitems:[]}
      ])
   })
})()