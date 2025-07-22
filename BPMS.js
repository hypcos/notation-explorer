;(()=>{
   var column_compare = (a,b)=>{//each column = [term,term,...,term] where each term = [e1,e2]
      var e1a = Math.max.apply(0,a.map(term=>term[0]))
      ,e1b = Math.max.apply(0,b.map(term=>term[0]))
      ,e1max = Math.max(e1a,e1b)
      while(e1max>=0){
         if(e1a!==e1b) return Math.sign(e1a-e1b)
         var e2a = Math.max.apply(0,a.filter(term=>term[0]===e1a).map(term=>term[1]))
         ,e2b = Math.max.apply(0,b.filter(term=>term[0]===e1b).map(term=>term[1]))
         if(e2a!==e2b) return Math.sign(e2a-e2b)
         var cmp = Math.sign(a.findLastIndex(term=>term[0]===e1a&&term[1]===e2a)-b.findLastIndex(term=>term[0]===e1b&&term[1]===e2b))
         if(cmp) return cmp
         e1a = Math.max.apply(0,a.map(term=>term[0]).filter(e=>e<e1max))
         e1b = Math.max.apply(0,b.map(term=>term[0]).filter(e=>e<e1max))
         e1max = Math.max(e1a,e1b)
      }
      return 0
   }
   ,M3compare = (a,b)=>{//each mountain = [column,column,...,column]
      var i=0,c
      while(true){
         if(i>=a.length){
            if(i>=b.length) return 0
            return -1
         }
         if(i>=b.length) return 1
         c = column_compare(a[i],b[i])
         if(c) return c
         ++i
      }
   }
   ,M3is_limit = m=> m.length>0 && m[m.length-1].length>0
   ,M3display = m=>m.map(column=>'('+column.map(([e1,e2])=>'('+(e1+1)+','+(e2+1)+')').join('')+')').join('')
   ,column_effrow = column=>{
      var y=column.length-1
      if(y<=0) return 0
      while(y>0&&column[y-1][0]>=column[y][0]) --y
      return y
   }
   ,Parent = (A,Eff,[e1,e2])=>{
      var [targetx,targety] = A[e1][e2]??[-1,-1]
      return targety>e2 || (targety<e2 && targety<Eff[targetx]) ? [targetx,e2] : [targetx,targety]
   }
   ,expand = (A0,FSterm,shorter=false)=>{
      var LNZx = A0.length-1
      var LNZy = A0[LNZx].length-1
      var Eff = A0.map(column_effrow)
      var J = LNZy<1 || LNZy-1<Eff[LNZx] ? 0 : A0[LNZx][LNZy-1][1]
      var M = A0[LNZx][LNZy][1]
      var K = Math.max(J,M)
      var rootx
      if(!K) rootx = A0[LNZx][LNZy][0]
      else{
         var working = [LNZx,LNZy]
         while(working = Parent(A0,Eff,working),
            working?.[0]>=0&&
            !(
               Math.max.apply(0,A0[working[0]].map(term=>term[1]))>=A0[working[0]].length
               ? Math.min(working[1],A0[working[0]][working[1]]?.[1]??-1)<K+J
               : (A0[working[0]][working[1]]?.[1]??-1)<K+J
            )
         );
         rootx = working[0]
      }
      var T = Math.max(A0[rootx].length-1,LNZy)
      var A = A0.map(column=>column.map(([e1,e2])=>[e1,e2]))
      var width = LNZx-rootx
      var shiftX = ([x,y])=>[x>=rootx?x+width:x,y]
      if(FSterm*width-shorter<0) return A.slice(0,-1)
      var source_column = A[A0[LNZx][LNZy][0]]
      if(!M){
         var y = source_column.slice(0,T).findIndex(term=>term[1]>K+J)
         if(y===-1) y=T
         A[LNZx].pop()
         if(source_column[y]) A[LNZx][T] = source_column[y]
      }else{
         var source_term = A[LNZx].pop().slice()
         --source_term[1]
         A[LNZx][T] = source_term
      }
      for(var j=LNZy;j<T;++j) A[LNZx][j] = source_column[j]
      if(LNZy>=1&&A[LNZx][LNZy-1][0]<A0[LNZx][LNZy][0]) A[LNZx][LNZy-1] = A0[LNZx][LNZy].slice()
      for(var dx=1;dx<=FSterm*width-shorter;++dx){
         A[LNZx+dx] = A[rootx+dx].map(shiftX)
      }
      return A.map(column=>{
         var j=column.length-1
         while(j>=0&&!(column[j]?.[0]>=0)) --j
         return column.slice(0,j+1)
      })
   }
   ,LimitColumn = n=>n?LimitColumn(n-1).concat([[n-1,n-1]]):[]
   ,Limit = n=>n?Limit(n-1).concat([LimitColumn(n).concat([[n-1,n-1]])]):[[]]
   register.push({
      id:'bpms'
      ,name:'Bidimensionally parented matrix'
      ,display:expr=>''+expr==='Infinity'?'Limit':M3display(expr)
      ,able:M3is_limit
      ,compare:M3compare
      ,FS:(m,FSterm)=>{
         if(''+m==='Infinity') return Limit(FSterm)
         if(m.length===0) return []
         return expand(m,FSterm,true)
      }
      ,FSalter:(m,FSterm)=>{
         if(''+m==='Infinity') return Limit(FSterm)
         if(m.length===0) return []
         return expand(m,FSterm)
      }
      ,init:()=>([
         {expr:[[Infinity]],low:[[]],subitems:[]}
         ,{expr:[],low:[[]],subitems:[]}
      ])
   })
})()