register.push({
   id:'asan-tilde3plus'
   ,name:"aSAN~3+"
   ,display:aSAN_display
   ,able:aSAN_able
   ,compare:aSAN_compare
   ,FS:(A,FSterm)=>{
      var Copy = a=>typeof a==='number'?a:a.map(Copy)
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
      ,trans = L=>{
         var n=L.length-1,Trans=0,Transcenders={}
         for(var k=1;k<=n;++k){
            if(!Trans&&L[k-1][0]!==L[k]){
               Transcenders[k-1]=true
               Trans=1
            }
            if(Trans&&aSAN_compare(L[n],L[k])>0) Trans=0
         }
         return Transcenders
      }
      ,search = L=>{
         var T=trans(L)
         ,k=L.length-1
         ,N=L[k]
         ,o=k,M=N,Trans=0
         while(k--){
            if(aSAN_compare(L[k],M)>0) o=k
            if(!Trans){
               if(T[k]){
                  if(aSAN_compare(M,L[k])>0&&aSAN_compare(L[k],L[k+1])>0) return o
                  o=k
                  M=L[k]
                  Trans=1
               }
               if(N[1]===1&&k>0) continue
            }
            if(Trans&&!T[k]) continue
            if(aSAN_compare(M,L[k])>0) return o
         }
         return 0
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
      if(''+A==='1,Infinity') return FSterm?Array(FSterm).fill(1).concat(2):2
      if(aSAN_base(A)>1) return pre(A)
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
   ,init:()=>([
      {expr:[1,Infinity],low:[1],subitems:[]}
      ,{expr:1,low:[1],subitems:[]}
   ])
   ,semiable:aSAN_semiable
})