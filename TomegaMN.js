;(()=>{
   var data=new Map()
   ,datashort=new Map()
   ,entry_compare = (a,b)=>{//each entry = [value,separator] where separator is mountain
      if(a[0]<b[0]) return -1
      if(a[0]>b[0]) return 1
      return mountain_compare(a[1],b[1])
   }
   ,column_compare = (a,b)=>{//each column = [entry,entry,...,entry]
      var i=0,c
      while(true){
         if(i>=a.length){
            if(i>=b.length) return 0
            return -1
         }
         if(i>=b.length) return 1
         c = entry_compare(a[i],b[i])
         if(c) return c
         ++i
      }
   }
   ,mountain_compare = (a,b)=>{//each mountain = [column,column,...,column]
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
   ,mountain_is_limit = m=> m.length>0 && m[m.length-1].length>0
   ,mountain_is_one = m=> m.length===1 && m[0].length===0
   ,mountain_display = m=>m.map(column=>'('+column.map(([v,sep])=>{
      if(sep.every(column=>!column.length)) return ','.repeat(sep.length)+v
      return mountain_display(sep)+v
   }).join('')+')').join('')
   ,vertical_compare = (a,b)=>{//each vertical = [separator,separator,...,separator]
      var i=0,c
      while(true){
         if(i>=a.length){
            if(i>=b.length) return 0
            return -1
         }
         if(i>=b.length) return 1
         c = mountain_compare(a[i],b[i])
         if(c) return c
         ++i
      }
   }
   ,vertical_increase = (v,m)=>{
      var i=v.length-1
      while(i>=0&&mountain_compare(v[i],m)<0) --i
      return v.slice(0,i+1).concat([m])
   }
   //an entry [value,separator] means a pair of left-leg + right-leg
   ,find_index_below_row = (verticals,y)=>{
      var working = [[]].concat(verticals)
      var i1=0,i2=working.length-1,i
      while(i1<i2){
         i=Math.ceil((i1+i2)/2)
         if(vertical_compare(working[i],y)<0) i1=i
         else i2=i-1
      }
      return i1
   }
   ,parent = (A,verticalss,[i,j])=>{
      var targetcolumn = A[i][j][0]-1
      var targeti = find_index_below_row(verticalss[targetcolumn],verticalss[i][j])
      return [targetcolumn,targeti]
   }
   ,column_verticals = column=>{
      var v=[[]]
      for(var j=0;j<column.length;++j) v.push(vertical_increase(v[j],column[j][1]))
      return v.slice(1)
   }
   ,get_references = (A,rtops)=>{
      var verticals = column_verticals(A[A.length-1])
      verticals.unshift([])
      var ref=[],i=0,j=0
      while(i<verticals.length&&j<rtops.length){
         if(vertical_compare(verticals[i],rtops[j])<0){
            ref[j] = i
            ++i
         }else{
            ++j
         }
      }
      return ref
   }
   ,threshold = (A,shorter,low,high)=>{
      var res,n=0
      while(true){
         res = expand(A,n,shorter)
         if(vertical_compare(vertical_increase(low,res),vertical_increase(high,res))>=0) return n
         n++
      }
   }
   ,expand = (A0,FSterm,shorter=false)=>{
      var datakey = mountain_display(A0)
      if(shorter){
         var mapval = datashort.get(datakey+'"'+FSterm)
         if(mapval) return mapval
      }else{
         var mapval = data.get(datakey+'"'+FSterm)
         if(mapval) return mapval
      }

      var rightmost = A0.length-1
      var topmost = A0[rightmost].length-1
      var A = JSON.parse(JSON.stringify(A0))
      var topright_entry = A[rightmost][topmost]
      var topright_separator = topright_entry[1]

      var V0 = A.map(column_verticals)
      var BRij = parent(A,V0,[rightmost,topmost])
      var width = rightmost - BRij[0]

      if(mountain_is_limit(topright_separator)){
         A[rightmost][topmost][1] = expand(topright_separator,
            threshold(topright_separator,shorter,V0[BRij[0]][BRij[1]-1]??[],V0[rightmost][topmost-1]??[])+FSterm
         ,shorter)
         return A
      }

      var topverticals = V0[BRij[0]].slice(0,BRij[1])
      topverticals.push(V0[rightmost][topmost])

      if(mountain_is_one(topright_separator)) A[rightmost].pop()
      else{
         topright_separator = topright_separator.slice(0,-1)
         if(vertical_compare(vertical_increase(V0[BRij[0]][BRij[1]-1]??[],topright_separator),V0[rightmost][topmost-1]??[])<=0)
            A[rightmost].pop()
         else
            A[rightmost][topmost][1] = topright_separator
      }
      A[rightmost] = A[rightmost].concat(A[BRij[0]].slice(BRij[1]))

      var V = A.map(column_verticals)
      var magma_checkss = []
      for(var i=BRij[0]+1;i<=rightmost;++i){
         magma_checkss[i] = []
         for(var j=0;j<A[i].length;++j){
            var working = [i,j]
            while(working[0]>BRij[0]){
               if(A[working[0]].length<=working[1]) --working[1]
               working = parent(A,V,working)
            }
            magma_checkss[i][j] = (
               working[0]===BRij[0] && working[1]<=BRij[1] && !vertical_compare(V[working[0]][working[1]-1]??[],V[i][j-1]??[])
            ) ? working[1] : -1
         }
      }

      for(var n=1;n<=FSterm;++n){
         var refs = get_references(A,topverticals)
         refs[-1] = -1
         for(var dx=1;dx<=width;++dx){
            var x = BRij[0]+dx
            var source_magmas = magma_checkss[x]
            var target_column = A[x+width*n] = []
            A[x].forEach((entry,y)=>{
               var value = entry[0]
               if(~source_magmas[y]){
                  var BRindex = source_magmas[y]
                  for(var j=refs[BRindex-1]+1;j<=refs[BRindex];++j){
                     if(j===refs[BRindex]) target_column.push([value+width*n,entry[1]])
                     else target_column.push([value+width*n,A[BRij[0]+width*n][j][1]])
                  }
               }else{
                  target_column.push([value + (value>BRij[0] ? width*n :0) ,entry[1]])
               }
            })
         }
      }

      if(shorter) A.pop()
      if(shorter){
         datashort.set(datakey+'"'+FSterm,A)
      }else{
         data.set(datakey+'"'+FSterm,A)
      }
      return A
   }
   ,Limit = n=>n>0?[[],[[1,Limit(n-1)]]]:[[]]
   register.push({
      id:'t-omega-mn'
      ,name:'Transfinite ω mountain notation'
      ,display:expr=>''+expr==='Infinity'?'Limit':mountain_display(expr)
      ,able:mountain_is_limit
      ,compare:mountain_compare
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