;var matrix_compare = (m1,m2)=>{
   if(m1.length===0){
      if(m2.length===0) return 0
      else return -1
   }else{
      if(m2.length===0) return 1
      else{
         var y1=m1[0].length,y2=m2[0].length
         if(y1<y2){
            return sequence_compare(m1.map(col=>col.concat(Array(y2-y1).fill(0))).flat(),m2.flat())
         }else if(y1>y2){
            return sequence_compare(m1.flat(),m2.map(col=>col.concat(Array(y1-y2).fill(0))).flat())
         }else{
            return sequence_compare(m1.flat(),m2.flat())
         }
      }
   }
}
,matrix_display = expr=>''+expr==='Infinity'?'Limit':expr.map(col=>'('+col+')').join('')
,matrix_limit = m=>m.length>0&&m[m.length-1][0]>0
register.push({
   id:'bm4'
   ,name:'Bashicu matrix'
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
         return ascending_cache[str] = r<=x&&(r===x||ascending(r,parent(x,y),y))
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
      ,BR = parent(endcol,LNZ)
      ,BRcolumn = m[BR]
      var offset = child.map((value,y)=>y<LNZ?value-BRcolumn[y]:0)
      ,offset_asc = Array(endcol).fill(0,BR).map((t,x)=>offset.map((value,y)=>ascending(BR,x,y)?value:0))
      ,col,n
      for(n=0;++n<=FSterm;){
         for(col=BR;col<endcol;++col){
            result.push(m[col].map((value,y)=>value+offset_asc[col][y]*n))
         }
      }
      if(ymax>0&&result.every(column=>column[ymax]===0)) result = result.map(column=>column.slice(0,ymax))
      return result
   }
   ,init:()=>([
      {expr:[[Infinity]],low:[[]],subitems:[]}
      ,{expr:[],low:[[]],subitems:[]}
   ])
})