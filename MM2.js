;var mountain_to_matrix = x=>{
   if(''+x==='Infinity') return [[Infinity]]
   var n = x.length, m = 0
   for(var i=0;i<n;i++) m = Math.max(m,x[i].length)
   var ans = []
   for(i=0;i<n;i++){
      var v = []
      for(var j=0;j<m;j++){
         if(~leftlegCol(x,i,j+1)) v.push((ans[leftlegCol(x,i,j+1)][leftlegRow(x,i,j+1)] ?? 0) + 1)
         else if(j) break
         else v.push(0)
      }
      ans.push(v)
   }
   return ans
}
,leftleg = (x,i,j)=>((x[i]?.[j])??[-1,-1]).slice()
,leftlegCol = (x,i,j)=>(x[i]?.[j]?.[0])??-1
,leftlegRow = (x,i,j)=>(x[i]?.[j]?.[1])??-1
;(()=>{
   var data={}
   ,dataalter={}
   var expand = (x0,N)=>{
      var x = x0.map(e=>e.slice())
      var n = x.length, m = 0
      for(var i=0;i<n;i++) m = Math.max(m,x[i].length)
      if(!n) return x
      var t = -1
      for(i=0;i<m;i++) if(~leftlegCol(x,n-1,i)) t=i
      if(t===-1) return x.slice(0,-1)
      var getlvl = (a,b)=>{
         if(leftlegCol(x,a,b) === -1) return 1
         var ans = 1
         for(var i=b-1;i>=1;i--){
            if(leftlegCol(x,a,b)===leftlegCol(x,a,i)&&leftlegRow(x,a,b)===leftlegRow(x,a,i)) ans++
            else break
         }
         return ans
      }
      var llvl = getlvl(n-1,t)
      var br = leftleg(x,n-1,t)
      if(llvl>1){
         while(getlvl(br[0],br[1])>=llvl) br = leftleg(x,br[0],br[1])
      }
      var lf = leftleg(x,n-1,t)
      while(x[n-1].length>t) x[n-1].pop()
      t--
      for(i=lf[1]+1;i<m;i++){
         if(leftlegCol(x,lf[0],i)===-1) break
         x[n-1][i-lf[1]+t] = leftleg(x,lf[0],i)
      }
      for(i=0;i<n;i++) m = Math.max(m,x[i].length)
      var mag=[]
      for(i = br[0]; i < n; i++){
         mag.push(Array(m).fill(0))
      }
      mag[0][br[1]] = 1
      if(br[1]<t&&t>0&&llvl==1){
      	  var h=[n-1,t];
      	  while(h[0]>br[0])h=[leftlegCol(x,h[0],h[1]),leftlegRow(x,h[0],h[1])+1];
      	  br[1]=h[1]-1;
      }
      for(i = br[0] + 1; i < n; i++)
         for(var j = m - 1; j >= 0; j--)
            if(
               (leftlegCol(x,i,j)>=br[0] && mag[leftlegCol(x,i,j)-br[0]][leftlegRow(x,i,j)])
               ||(j<m-1 && mag[i-br[0]][j+1])
            )
               mag[i-br[0]][j] = 1
      for(var M=1;M<=N;M++)
         for(i = br[0] + 1; i <= n - 1; i++){
            var v = []
            var e = mag[i-br[0]][br[1]]
            for(j = 0; j <= br[1]; j++){
               var y=leftleg(x,i,j)
               if(y[0]>=br[0]){
                  y[0] += M*(n-1-br[0])
               }
               v.push(y)
            }
            var h
            if(e) for(j = 1; j <= M * (t - br[1]); j++){
               y = leftleg(x,i,br[1]+1)
               if((j - 1) % (t - br[1]) === 0) h = j - 1
               else{
                  var p = (j - 1) % (t - br[1]) + 1
                  if(leftlegCol(x,n-1,br[1]+p-1)!==leftlegCol(x,n-1,br[1]+p)||leftlegRow(x,n-1,br[1]+p-1)!==leftlegRow(x,n-1,br[1]+p)) h = j - 1
               }
               if(y[0]>=br[0]){
                  y[0] += M*(n-1-br[0])
                  if(y[1]>=br[1]) y[1] += h
               }
               v.push(y)
            }
            for(j = br[1] + 1; j < m; j++){
               y=leftleg(x,i,j)
               if(y[0]>=br[0]){
                  y[0] += M*(n-1-br[0])
                  if(e&&y[1]>=br[1]) y[1] += M*(t-br[1])
               }
               v.push(y)
            }
            x.push(v)
         }
      return x.map(column=>{
         var j=column.length
         while(--j){
            if(~((column[j]?.[0])??-1)) break
            column.pop()
         }
         return column
      })
   }
   register.push({
      id:'mm2'
      ,name:'MM2'
      ,display:x=>matrix_display(mountain_to_matrix(x))
      ,able:x=>matrix_limit(mountain_to_matrix(x))
      ,compare:(x1,x2)=>matrix_compare(mountain_to_matrix(x1),mountain_to_matrix(x2))
      ,FS:(m,FSterm)=>{
         if(''+m==='Infinity') return [[[-1,-1]],[[-1,-1]].concat(Array(FSterm+1).fill(1).map(()=>[0,0]))]
         if(m.length===0) return []
         var datakey=matrix_display(mountain_to_matrix(m))
         if(!data[datakey]) data[datakey] = []
         else if(data[datakey][FSterm]!==undefined) return data[datakey][FSterm]
         return data[datakey][FSterm] = expand(m,FSterm).slice(0,-1)
      }
      ,FSalter:(m,FSterm)=>{
         if(''+m==='Infinity') return [[[-1,-1]],[[-1,-1]].concat(Array(FSterm+1).fill(1).map(()=>[0,0]))]
         if(m.length===0) return []
         var datakey=matrix_display(mountain_to_matrix(m))
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
