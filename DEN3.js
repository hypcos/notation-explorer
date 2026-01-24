;(()=>{
   /** notation extended from basic Laver pattern
    * *expression*
    * expression = (row)L(row)L...(row)L
    * (row) = (a[-1],a[-2],...,a[2],a[1]), big to small
    * L = Number; the step length of each row
    * *encoding*
    * [row1,row2,...,rowN]
    * each row = [L,a[-1],a[-2],...,a[1]]; row.length-1 is true length; row.length is BLP length
    * entry a[i] = [Number value, Boolean mark]
   */
   var toShort = expr=>expr.map(row=>row.slice(1,-row[0]).concat([row[row.length-1]]).map(x=>x[0]))
   ,seqseq_compare = (m1,m2)=>{
      if(m1.length===0){
         if(m2.length===0) return 0
         else return -1
      }else{
         if(m2.length===0) return 1
         else{
            var cmp = sequence_compare(m1[0],m2[0])
            if(cmp) return cmp
            else return seqseq_compare(m1.slice(1),m2.slice(1))
         }
      }
   }
   ,compare = (expr1,expr2)=>seqseq_compare(toShort(expr1),toShort(expr2))
   ,display = expr=>''+expr==='Infinity'?'Limit':expr.map(row=>'('+row.slice(1).map(x=>(x[1]?'*':'')+x[0]).join(',')+')'+row[0]).join('')
   ,values = row=>[row[0]].concat(row.slice(1).map(x=>x[0]))
   ,isNonzero = expr=> expr.length>0
   ,pleasantUntil = (rows,t)=>{
      var tcheck = values(t).slice(1+t[0])
      ,tmax = tcheck[0]
      ,tmin = tcheck[tcheck.length-1]
      ,scheck,i1,i2
      for(var n=0;n<rows.length;n++){
         scheck = values(rows[n]).slice(1)
         i1 = scheck.findIndex(x=>x<tmax)
         i2 = scheck.findLastIndex(x=>x>tmin)
         if(~i1 && ~i2 && i1<=i2 && scheck.slice(i1,i2+1).some(x=>!tcheck.includes(x))) return n
      }
      return -1
   }
   ,isLimit = expr=>{
      if(''+expr==='Infinity') return true
      var active = expr[expr.length-1]
      if(!(active[1+active[0]]?.[0])) return false
      return pleasantUntil(expr.slice(active[1+active[0]][0]-1,-1),active)===-1
   }
   ,cut = expr=>expr.slice(0,-1).map(row=>[row[0]].concat(row.slice(1).map(x=>x.slice())))
   ,seqFrom = (expr,i,j)=>{
      var row = expr[i]
      ,val = row[j][0]
      ,threshold = row[j+row[0]]?.[0]??0
      ,idx
      ,record = [[i+1,j],[val]]
      if(!threshold) return;
      while(val>threshold){
         row = expr[val-1]
         idx = 1+row[0]
         record[record.length-1][1] = idx
         val = row[idx]?.[0]
         record.push([val])
      }
      if(val!==threshold) return;
      return record.slice(1,-1)
   }
   ,apv = (s,t)=> s.map(x=> x<t[t.length-1]?x: x>=t[1+t[0]]?x-t[1+t[0]]+t[1] : t[t.lastIndexOf(x)-t[0]] )
   ,ap = (s,t)=> [s[0]].concat(apv(values(s).slice(1),values(t)).map(x=>[x]))
   ,copy = (raw,flag)=>{
      var active = raw[raw.length-1]
      ,expr = cut(raw)
      ,begin = active[1+active[0]][0]
      ,a1 = active[active.length-1][0]
      ,end = ~flag ? active[1+active[0]][0]+flag : raw.length+1
      ,offset = raw.length-begin
      expr = expr.concat(raw.slice(begin-1,end-1).map(row=>ap(row,active)))
      var row,targetrow,i,j,seq
      for(i=begin-1;i<end-1;++i){
         row = raw[i]
         targetrow = expr[i+offset]
         for(j=1;j<row.length;++j){
            if(!row[j][1]) continue
            seq = seqFrom(expr,i+offset,j)
            if(!seq) continue
            var nomove = seq.findIndex(x=>x[0]<begin)
            if(nomove===-1){
               targetrow[j][1] = true
               continue
            }
            var y0 = seq[nomove][0]
            if(y0<a1){
               targetrow[j][1] = true
               continue
            }
            var k = 1+active.slice(1).findIndex(x=>x[0]===y0)
            if(active[k-active[0]]?.[1] && !(targetrow[j+targetrow[0]-1]?.[0]>a1)) targetrow[j][1] = true
         }
      }
      return expr
   }
   ,compTo = (raw,r,Rec)=>{
      var expr = raw.map(row=>[row[0]].concat(row.slice(1).map(x=>x.slice())))
      for(var i=raw[r].length-1;i>0;--i){
         if(!raw[r][i][1]) continue
         var bi = raw[r][i][0]
         var seq = seqFrom(expr,r,i)
         if(!seq) continue
         var t = seq[seq.length-1][0]
         var T = Rec[t-1]
         if(!T) continue
         for(var j=0;j+1<seq.length;++j) if(!(expr[seq[j+1][0]-1].some(x=>x[0]===seq[j][0]+1))) continue
         var q = T.length
         var entries = expr[r].slice(1).map(x=>x.slice()).concat(T.map(x=>[x])).concat(Array(q).fill(0).map((x,uu)=>[bi+1+uu,true]))
         entries.sort((x,y)=>y[0]-x[0])
         expr[r] = [expr[r][0]+q].concat(entries)
      }
      return expr
   }
   ,compFrom = (raw,r,T)=>{
      var expr = raw.slice(0,r).map(row=>[row[0]].concat(row.slice(1).map(x=>x.slice())))
      ,q = T.length
      ,lr = raw[r].length<raw[r][0]*2+1 ? raw[r][0] : raw[r][0]+1
      ,cr = raw[r].length<raw[r][0]*2+1 ? raw[r].slice(1,-raw[r][0]).concat(raw[r].slice(1+raw[r][0])) : raw[r].slice(1)
      for(var qq=0;qq<q;++qq){
         var entries = cr.map(x=>x.slice()).concat(T.slice(0,1+qq).map(x=>[x])).concat(Array(qq).fill(0).map((x,uu)=>[raw[r][1][0]+1+uu]))
         entries.sort((x,y)=>y[0]-x[0])
         expr[r+qq] = [lr+qq].concat(entries)
      }
      entries = raw[r].slice(1).map(x=>x.slice()).concat(T.map(x=>[x])).concat(Array(q).fill(0).map((x,uu)=>[raw[r][1][0]+1+uu]))
      entries.sort((x,y)=>y[0]-x[0])
      expr[r+q] = [raw[r][0]+q].concat(entries)
      for(qq=1;qq<=q;++qq) for(var uu=2;uu<=1+qq;++uu) expr[r+qq][uu][1] = true
      var m = (x,idx)=>{
         if(!idx) return x
         var xx = x.slice()
         xx[0] += (xx[0]<=raw[r][1][0] ? 0 : q)
         return xx
      }
      expr = expr.concat(raw.slice(r+1).map(row=>row.map(m)))
      return expr
   }
   ,expand = (raw,FSterm,longer)=>{
      var active = raw[raw.length-1]
      if(!(active[1+active[0]]?.[0])) return cut(raw)
      var flag = pleasantUntil(raw.slice(active[1+active[0]][0]-1,-1),active)
      var expr = raw
      if(~flag){
         expr = copy(expr,flag)
      }else{
         for(var n=1;n<=FSterm;++n) expr = copy(expr,flag)
         if(longer){
            var len0 = expr.length
            expr = copy(expr,1)
         }else{
            expr = cut(expr)
         }
      }
      var Rec = []
      for(var r=raw.length-1;r<expr.length;++r){
         expr = compTo(expr,r,Rec)
         if(!(expr[r].length<=expr[r][0]*2+1)) continue
         var row = expr[r]
         ,pr = row[1+row[0]][0]
         var T = [row[row[0]][0]]
         do{
            T.unshift(expr[T[0]-1][2][0])
         }while(T[0]>pr);
         T = T.slice(1,-1)
         if(T.length<1) continue
         Rec[r] = T
         expr = compFrom(expr,r,T)
         r += T.length
      }
      if(longer) while(expr.length>len0) expr = cut(expr)
      return expr
   }
   ,Limit_row = n=>Array(3+n).fill(0).map((x,nn)=>3<=nn&&nn<2+n?[nn,true]:[nn]).concat(2).reverse()
   ,Limit = n=>[[1,[1],[0]],[1,[2],[1],[0]]].concat(Array(n).fill(0).map((x,nn)=>Limit_row(1+nn)))
   register.push({
      id:'den3'
      ,name:'DEN3'
      ,display
      ,able:isLimit
      ,semiable:isNonzero
      ,compare
      ,FS:(m,FSterm)=>{
         if(''+m==='Infinity') return Limit(FSterm)
         if(!m.length) return []
         return expand(m,FSterm,false)
      }
      ,FSalter:(m,FSterm)=>{
         if(''+m==='Infinity') return Limit(FSterm)
         if(!m.length) return []
         return expand(m,FSterm,true)
      }
      ,init:()=>([
         {expr:[Infinity],low:[[]],subitems:[]}
         ,{expr:[],low:[[]],subitems:[]}
      ])
   })
})()