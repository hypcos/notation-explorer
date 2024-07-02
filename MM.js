;(()=>{
   var data={}
   ,dataalter={}
   ,extract = (A,[x,y])=>A[x][y]||0
   ,parentCheck = (A,[x,y])=>{
      if(!y) return [x-1,y]
      var p = parent(A,[x,y-1])[0]
      var i=y
      while(extract(A,[p,i])<extract(A,[x,y])-1) --i
      return [p,i]
   }
   ,parent = (A,cur)=>{
      if(!extract(A,cur)) return [-1,cur[1]]
      var p = cur
      do{
         p = parentCheck(A,p)
      }while(extract(A,p)!==extract(A,cur)-1);
      return p
   }
   ,expand = (M,FSterm)=>{
      var LNZx = M.length-1
      var LNZy = M[LNZx].findLastIndex(e=>e)
      var LNZ = M[LNZx][LNZy]
      var collection = []
      var working = [LNZx,LNZy]
      do{
         while(extract(M,working)!==LNZ-1) working = parent(M,working)
         if(!collection[working[0]]) collection[working[0]] = []
         collection[working[0]].unshift(working[1])
      }while(--working[1]>=0);
      var counts = collection.filter(()=>true).map(e=>e.length)
      var columns = collection.map((e,i)=>i).filter(()=>true)
      counts.unshift(1)
      var root
      var r=counts.length-1
      if(counts[r]===1){
         root = parent(M,[LNZx,LNZy])
      }else{
         while(counts[r]>=counts[counts.length-1]) --r
         root = [columns[r],collection[columns[r]][0]]
      }
      var width = LNZx-root[0]
      var height = LNZy-root[1]
      var A = M.map(column=>column.slice())
      ;--A[LNZx][LNZy]
      M[root[0]].slice(root[1]).forEach((val,dy)=>A[LNZx][LNZy+dy]=val)
      var ascending_cache = {}
      var ascendingAt = (cur)=>{//-1 means not ascending; otherwise row index of the BR column entry it corresponds
         var str=''+cur
         if(ascending_cache[str]!==undefined) return ascending_cache[str]
         if(cur[0]<root[0]) return ascending_cache[str] = -1
         if(cur[0]===root[0]) return ascending_cache[str] = cur[1]
         return ascending_cache[str] = ascendingAt(parent(A,cur))
      }
      //actual expand
      for(var n=1;n<=FSterm;++n){
         var reference = [root[0]+width*n,root[1]+height*n]
         for(var dx=1;dx<=width;++dx){
            var x = root[0]+dx
            var targetColumn = A[x+width*n] = []
            var pastmagma = false
            A[x].forEach((val,y)=>{
               var asc = ascendingAt([x,y])
               if(~asc){
                  if(asc===root[1]&&y===root[1]){
                     for(var j=0;j<=height*n;++j){
                        targetColumn[y+j] = val-extract(A,root)+extract(A,[root[0]+width*n,y+j])
                     }
                     pastmagma = true
                  }else{
                     if(pastmagma) targetColumn[y+height*n] = val-extract(A,root)+extract(A,reference)
                     else targetColumn[y] = val-extract(A,[root[0],asc])+extract(A,[root[0]+width*n,asc])
                  }
               }else{
                  if(pastmagma) targetColumn[y+height*n] = val
                  else targetColumn[y] = val
               }
            })
         }
      }
      A.forEach(column=>{
         var i = column.findLastIndex(e=>e)
         column.splice(i+1)
      })
      return A
   }
   register.push({
      id:'mm'
      ,name:'Mutant matrix'
      ,display:matrix_display
      ,able:matrix_limit
      ,compare:matrix_compare
      ,FS:(m,FSterm)=>{
         if(''+m==='Infinity') return [[],Array(FSterm+1).fill(1)]
         if(m.length===0) return []
         var datakey=matrix_display(m)
         if(!data[datakey]) data[datakey] = []
         else if(data[datakey][FSterm]!==undefined) return data[datakey][FSterm]
         return data[datakey][FSterm] = expand(m,FSterm).slice(0,-1)
      }
      ,FSalter:(m,FSterm)=>{
         if(''+m==='Infinity') return [[],Array(FSterm+1).fill(1)]
         if(m.length===0) return []
         var datakey=matrix_display(m)
         if(!dataalter[datakey]) dataalter[datakey] = []
         else if(dataalter[datakey][FSterm]!==undefined) return dataalter[datakey][FSterm]
         return dataalter[datakey][FSterm] = expand(m,FSterm)
      }
      ,init:()=>([
         {expr:[[Infinity]],low:[[]],subitems:[]}
         ,{expr:[],low:[[]],subitems:[]}
      ])
   })
})()