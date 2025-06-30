;(()=>{
   var data={}
   ,dataalter={}
   var extract = (A,[x,y])=>A[x][y]||0
   ,amount = (A,x,val)=>{
      if(!val) return Infinity
      if(!A[x]) return 0
      var s=0
      A[x].forEach(e=>(e===val)&&(++s))
      return s
   }
   ,Parent = (A,[x0,y0])=>{
      var val = extract(A,[x0,y0])
      if(!val) return [-1,0]
      var x = x0
      if(!y0){
         while(extract(A,[x,y0])!==val-1 && x>=0) --x;
         return [x,y0]
      }
      var except = []
      var working = [x0,y0-1]
      var amt = amount(A,x,extract(A,working))
      while((working = Parent(A,working))[0]>=0){
         x = working[0]
         for(var y=Math.max(working[1]-amt,0);y<=y0;++y){
            if(y>working[1]+amt) break
            if(except.includes(y)) continue
            if(extract(A,[x,y])===val-1) return [x,y]
            if(extract(A,[x,y])<val) except.push(y)
         }
      }
      return [-1,0]//normally we should not reach this
   }
   ,expand = (M,FSterm,shorter=false)=>{
      var LNZx = M.length-1
      var LNZy = M[LNZx].findLastIndex(e=>e)
      var root = Parent(M,[LNZx,LNZy])
      var width = LNZx-root[0]
      var height = LNZy-root[1]
      var A = M.map(column=>column.slice())
      for(var dx=1;dx<=width*FSterm-shorter;++dx) A[LNZx+dx]=[]
      ;--A[LNZx][LNZy]
      M[root[0]].slice(root[1]).forEach((val,dy)=>A[LNZx][LNZy+dy]=val)
      var ascending_cache = {}
      var ascendingAt = (cur)=>{//falsy means not ascending; otherwise the xy of the BR column entry it corresponds
         var str=''+cur
         if(ascending_cache[str]!==undefined) return ascending_cache[str]
         if(cur[0]<root[0]) return ascending_cache[str] = false
         if(cur[0]===root[0]) return ascending_cache[str] = cur
         return ascending_cache[str] = ascendingAt(Parent(A,cur))
      }
      //upper rows
      for(var y=0;y<height;++y){
         var rootAt = ascendingAt([LNZx,y])
         var offset = [rootAt[0]-LNZx,rootAt[1]-y]
         for(dx=1;dx<=width*FSterm-shorter;++dx){
            var x=LNZx+dx
            var cor = [x+offset[0],y+offset[1]]
            A[x][y] = ascendingAt(cor)?extract(A,cor)+extract(A,[LNZx,y])-extract(A,rootAt):extract(A,cor)
         }
      }
      //lower rows
      var upleft = [root[0],0]
      var upright = [LNZx,height]
      for(dx=1;dx<=width*FSterm-shorter;++dx){
         x=root[0]+dx
         for(y=0;true;++y){
            var offsetXY = [x-upleft[0],y-upleft[1]]
            if(ascendingAt([x,y])){
               var P = Parent(A,[x,y])
               var offsetP = [P[0]-upleft[0],P[1]-upleft[1]]
               A[upright[0]+offsetXY[0]][upright[1]+offsetXY[1]] = extract(A,[upright[0]+offsetP[0],upright[1]+offsetP[1]])+1
            }else{
               if(!extract(A,[x,y])) break
               A[upright[0]+offsetXY[0]][upright[1]+offsetXY[1]] = extract(A,[x,y])
            }
         }
      }
      if(width*FSterm-shorter<0) A.splice(A.length+width*FSterm-shorter)
      A.forEach(column=>{
         var i = column.findLastIndex(e=>e)
         column.splice(i+1)
      })
      return A
   }
   ,Limit = n=>[[],[1],Array(n).fill(2)]
   register.push({
      id:'epm'
      ,name:'Enjambment parented matrix'
      ,display:matrix_display
      ,able:matrix_limit
      ,compare:matrix_compare
      ,FS:(m,FSterm)=>{
         if(''+m==='Infinity') return Limit(FSterm)
         if(m.length===0) return []
         var datakey=matrix_display(m)
         if(!data[datakey]) data[datakey] = []
         else if(data[datakey][FSterm]!==undefined) return data[datakey][FSterm]
         return data[datakey][FSterm] = expand(m,FSterm,true)
      }
      ,FSalter:(m,FSterm)=>{
         if(''+m==='Infinity') return Limit(FSterm)
         if(m.length===0) return []
         var datakey=matrix_display(m)
         if(!dataalter[datakey]) dataalter[datakey] = []
         else if(dataalter[datakey][FSterm]!==undefined) return dataalter[datakey][FSterm]
         return dataalter[datakey][FSterm] = expand(m,FSterm)
      }
      ,init:()=>([
         {expr:[[Infinity]],low:[[[],[1]]],subitems:[]}
         ,{expr:[[],[1]],low:[[]],subitems:[]}
         ,{expr:[],low:[[]],subitems:[]}
      ])
   })
})()