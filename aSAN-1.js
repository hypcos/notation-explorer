;var aSAN_compare = (a,b)=>{
   if(typeof a==='number'){
      if(typeof b==='number') return a>b?1:a<b?-1:0
      else a=[a]
   }
   if(typeof b==='number') b=[b]
   if(a.length>b.length) return 1
   if(a.length<b.length) return -1
   var tmp,k
   for(k=a.length;k--;){
      tmp=aSAN_compare(a[k],b[k])
      if(tmp!==0) return tmp
   }
   return 0
}
,aSAN_display = a=>typeof a==='number'?''+a:''+a==='1,Infinity'?'Limit':'('+a.map(aSAN_display).join()+')'
,aSAN_base = A=>typeof A==='number'?A:aSAN_base(A[0])
,aSAN_able = a=>typeof a!=='number'&&aSAN_base(a)===1
,aSAN_semiable = a=>a!=1
register.push({
   id:'asan-1'
   ,name:"Aarex's superstrong array notation (aSAN-1)"
   ,display:aSAN_display
   ,able:aSAN_able
   ,compare:aSAN_compare
   ,FS:(()=>{
      var data={}
      ,Copy = a=>typeof a==='number'?a:a.map(Copy)
      ,pilot = A=>{
         if(typeof A==='number') return A
         for(var b=0;b<A.length;++b){
            if(A[b]!==1) return A[b]
         }
      }
      ,pre = A=>{
         if(typeof A==='number') return A-1
         var e=A.slice()
         e.unshift(pre(e.shift()))
         return e
      }
      ,change = (A,n)=>{
         var b,e=A.slice()
         for(b=0;b<e.length;++b){
            if(e[b]!==1){
               b?e.splice(b-1,2,n,pre(e[b])):e.splice(b,1,pre(e[b]))
               return e
            }
         }
      }
      ,layers = A=>{
         var Lk,L=[A]
         while(true){
            Lk = pilot(L[L.length-1])
            if(aSAN_base(Lk)>1) break
            L.push(Lk)
         }
         return L
      }
      ,changeL = (L,a,b)=>{
         if(a===L.length-1) return change(L[a],b)
         var x=L[a].indexOf(L[a+1])
         ,La = Copy(L[a])
         La[x] = changeL(L,a+1,b)
         return La
      }
      ,search = L=>{
         var n=L.length-1
         for(var a=n;--a>=0&&aSAN_compare(L[n],L[a])<=0;);
         return a+1
      }
      ,Standard = A=>{
         if(typeof A==='number') return A
         if(A.length===1){
            if(typeof A[0]==='number') return A[0]
            if(A[0].length===1) return Standard(A[0])
         }
         if(A[A.length-1]===1) return Standard(A.slice(0,A.length-1))
         return A.map(Standard)
      }
      ,aSAN = (A,FSterm)=>{
         var L=layers(Copy(A))
         ,m=search(L)
         ,f=n=>changeL(L,m,n)
         ,result = FSterm+1//0 should not occur in aSAN expressions
         for(var n=FSterm;n--;){
            result = f(result)
         }
         if(m>0){
            L[m-1][L[m-1].indexOf(L[m])] = result
            result = L[0]
         }
         var std
         while(JSON.stringify(std=Standard(result))!==JSON.stringify(result)) result=std
         return result
      }
      return (A,FSterm)=>{
         if(''+A==='1,Infinity') return FSterm?Array(FSterm).fill(1).concat(2):2
         if(aSAN_base(A)>1) return pre(A)
         var datakey=aSAN_display(A)
         if(!data[datakey]) data[datakey] = []
         else if(data[datakey][FSterm]!==undefined) return data[datakey][FSterm]
         return data[datakey][FSterm] = aSAN(A,FSterm)
      }
   })()
   ,init:()=>([
      {expr:[1,Infinity],low:[1],subitems:[]}
      ,{expr:1,low:[1],subitems:[]}
   ])
   ,semiable:aSAN_semiable
})