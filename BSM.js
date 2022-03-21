;register.push({
   id:'bsm'
   ,name:'Bashicu sudden matrix'
   ,display:matrix_display
   ,able:matrix_limit
   ,compare:matrix_compare
   ,FS:(m,FSterm)=>{
      if(''+m==='Infinity') return [Array(FSterm+1).fill(0),Array(FSterm+1).fill(1)]
      if(m.length===0) return []
      var parent = (x,y)=>{
         var str=x+','+y
         if(parent_cache[str]!==undefined) return parent_cache[str]
         for(var p=x;(p=y?parent(p,y-1):p-1)>=0;){
            if(m[p][y]<m[x][y]) break
         }
         return parent_cache[str]=p
      }
      ,ascending = (r,x,y)=>{
         var str=r+','+x+','+y
         if(ascending_cache[str]!==undefined) return ascending_cache[str]
         return ascending_cache[str] = r<=x&&(roots.includes(x)||ascending(r,parent(x,y),y))
      }
      ,delta = r=>m[r].map((value,y)=>y<LNZ?child[y]-value:y===LNZ?child[y]-value-1:0)
      ,expansion = (r,n)=>{
         var a,x,ss=m.slice(0,endcol)
         ,delr = delta(r)
         for(a=1;a<=n;++a){
            for(x=r;x<endcol;++x){
               ss.push(ss[x].map((value,y)=>value+a*delr[y]*ascending(r,x,y)))
            }
         }
         return ss
      }
      ,expansionappend = r=>{
         var delr = delta(r)
         ,res = expansion(r,1)
         res.push(m[endcol].map((value,y)=>value+delr[y]*ascending(r,endcol,y)))
         return res
      }
      ,endcol = m.length-1
      ,result = m.slice(0,endcol)
      ,child = m[endcol]
      ,ymax = child.length-1
      ,LNZ
      for(LNZ=ymax;LNZ>=0;--LNZ){
         if(child[LNZ]>0) break
      }
      if(LNZ<0) return result
      var parent_cache={},ascending_cache={}
      ,specialroots=[],roots=[],n
      for(n=endcol;n>=0;){
         specialroots.push(n=parent(n,LNZ))
      }
      for(n=specialroots[0];n>=0;n=LNZ?parent(n,LNZ-1):n-1){
         if(specialroots.includes(parent(n,LNZ))) roots.push(n)
      }
      var testroot=m[roots[0]].slice(LNZ+1)
      ,threshould = expansionappend(roots[0])
      n=roots.findIndex(r=>specialroots.includes(r)?m[r].slice(LNZ+1).some((value,dy)=>value!==testroot[dy]):matrix_compare(expansionappend(r),threshould)<0)
      if(n===-1) n=roots.length
      result = expansion(roots[n-1],FSterm)
      if(ymax>0&&result.every(column=>column[ymax]===0)) result = result.map(column=>column.slice(0,ymax))
      return result
   }
   ,init:()=>([
      {expr:[[Infinity]],low:[[]],subitems:[]}
      ,{expr:[],low:[[]],subitems:[]}
   ])
})