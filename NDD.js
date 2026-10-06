;(()=>{
   'use strict'

   // Nested dimensional diagram (NDD).
   // Definition: https://zhuanlan.zhihu.com/p/2085373132764927424
   // Reference interface: hypcos/notation-explorer, TomegaMN.js / BomegaMN.js.
   //
   // Clarification confirmed by the requester:
   // transport applies to BOTH k-element values AND k-vector heads, using
   // theta[k], delta[k]. In particular, separator heads are not frozen.
   //
   // matrix = [vector, ...]
   // vector = [head, [entry, ...]]
   // entry  = [value, separatorVector]
   // All numbers are nonnegative safe JS integers; heads/values are positive.
   // Public operations return fresh trees and never mutate their arguments.

   var integer = (n,min=0)=>{
      if(!Number.isSafeInteger(n) || n<min)
         throw new RangeError('NDD: expected a safe integer >= '+min)
      return n
   }
   ,add = (a,b)=>integer(a+b)
   ,cmp = (a,b)=>a<b ? -1 : a>b ? 1 : 0
   ,lex = (a,b,compare)=>{
      for(var i=0;i<Math.min(a.length,b.length);++i){
         var c=compare(a[i],b[i])
         if(c) return c
      }
      return cmp(a.length,b.length)
   }
   ,clone_vector = v=>[v[0],v[1].map(clone_entry)]
   ,clone_entry = e=>[e[0],clone_vector(e[1])]

   // The internal comparators expect canonical vectors (recursively simplified,
   // with entries sorted in DESCENDING ordinary order). Ordinary entry order
   // is value first; height order is separator first. Do not interchange them.
   ,entry_compare = (a,b)=>cmp(a[0],b[0]) || vector_compare(a[1],b[1])
   ,vector_compare = (a,b)=>cmp(a[0],b[0]) || lex(a[1],b[1],entry_compare)
   ,height_compare = (a,b)=>vector_compare(a[1],b[1]) || cmp(a[0],b[0])
   ,canonical_vector = v=>{
      var entries=v[1].map(e=>[e[0],canonical_vector(e[1])])
      entries.sort((a,b)=>-entry_compare(a,b))
      return [v[0],entries.filter((e,i)=>!i || entry_compare(e,entries[i-1])!==0)]
   }
   ,check_vector = v=>{
      if(!Array.isArray(v) || v.length!==2 || !Array.isArray(v[1]))
         throw new TypeError('NDD: vector must be [head, entries]')
      integer(v[0],1)
      for(var e of v[1]){
         if(!Array.isArray(e) || e.length!==2)
            throw new TypeError('NDD: entry must be [value, separator]')
         integer(e[0],1)
         if(e[0]>=v[0]) throw new RangeError('NDD: element value must be < vector head')
         check_vector(e[1])
      }
      return v
   }
   ,check_matrix = m=>{
      if(!Array.isArray(m)) throw new TypeError('NDD: matrix must be an array')
      m.forEach((v,i)=>{
         check_vector(v)
         if(v[0]!==i+1) throw new RangeError('NDD: column heads must be 1,2,...')
      })
      return m
   }
   ,normalize = m=>check_matrix(m).map(canonical_vector)
   ,matrix_compare = (a,b)=>lex(normalize(a),normalize(b),vector_compare)
   ,matrix_is_limit = m=>Array.isArray(m) && m.length>0 && m[m.length-1][1].length>0
   ,highest_index = entries=>{
      var best=-1
      for(var i=0;i<entries.length;++i)
         if(best<0 || height_compare(entries[i],entries[best])>0) best=i
      return best
   }

   // Human notation: (head separator value separator value ...).
   // Only the empty separator (1) is abbreviated as a single comma.
   // Every other separator is written explicitly, including empty (2), (3), ... .
   ,vector_display = v=>'('+v[0]+v[1].map(e=>{
      var s=e[1]
      return (s[1].length===0 && s[0]===1 ? ',' : vector_display(s))+e[0]
   }).join('')+')'
   ,matrix_display = m=>normalize(m).map(vector_display).join('')

   // Freeze C_k, LNZ_k, theta_k, delta_k and R_k at the start of EACH round.
   // All level arrays are 1-based; missing thresholds mean infinity.
   ,context = old=>{
      var C=[], LNZ=[], index=[], theta=[], delta=[], R=[]
      var v=old[old.length-1], M=0
      while(v && v[1].length){
         var k=++M, i=highest_index(v[1])
         C[k]=v
         index[k]=i
         LNZ[k]=v[1][i]
         theta[k]=LNZ[k][0]
         delta[k]=v[0]-theta[k]
         v=LNZ[k][1]
      }
      var K=0
      if(M){
         R[1]=old[theta[1]-1]
         K=1
         for(var k=1;k<M;++k){
            var best=null
            for(var e of R[k][1]){
               if(e[1][0]===theta[k+1] && (!best || height_compare(e,best)>0)) best=e
            }
            if(!best) break
            R[k+1]=best[1]
            K=k+1
         }
      }
      return {C,LNZ,index,theta,delta,R,M,K}
   }

   // Dimension-specific transport. The same threshold map is applied to a
   // k-vector's head and its k-elements' values; recursion advances to k+1.
   ,transport_number = (v,k,ctx)=>
      ctx.theta[k]!==undefined && v>=ctx.theta[k] ? add(v,ctx.delta[k]) : v
   ,transport_entry = (e,k,ctx)=>[
      transport_number(e[0],k,ctx),transport_vector(e[1],k+1,ctx)
   ]
   ,transport_vector = (v,k,ctx)=>[
      transport_number(v[0],k,ctx),v[1].map(e=>transport_entry(e,k,ctx))
   ]

   ,extend_round = old=>{
      var ctx=context(old)
      if(!ctx.M) throw new RangeError('NDD: extension requires a nonempty last column')
      var next=old.map(clone_vector)
      var extend_level = (target,k)=>{
         var i=ctx.index[k]
         if(k===ctx.M){
            // The last LNZ separator is empty; decrement its head or remove LNZ.
            if(target[1][i][1][0]===1) target[1].splice(i,1)
            else --target[1][i][1][0]
         }else{
            // Recurse before merging R_k, as prescribed in the definition.
            target[1][i][1]=extend_level(target[1][i][1],k+1)
         }
         if(k<=ctx.K){
            for(var e of ctx.R[k][1]) target[1].push(transport_entry(e,k,ctx))
         }
         return canonical_vector(target)
      }
      next[next.length-1]=extend_level(next[next.length-1],1)

      // Copy strictly to the right of R_1, from the OLD matrix, including the
      // OLD rightmost column. Never copy the just-modified C_1 here.
      for(var i=ctx.theta[1];i<old.length;++i)
         next.push(transport_vector(old[i],1,ctx))
      return next
   }
   ,is_limit_marker = m=>Array.isArray(m) && m.length===1 &&
      Array.isArray(m[0]) && m[0].length===1 && m[0][0]===Infinity
   ,Main = n=>{
      integer(n)
      var result=[], a=[1,[]]
      for(var k=1;k<=n;++k){
         if(k>1) a=[k,[[k-1,a]]]
         result.push(clone_vector(a))
      }
      return result
   }
   // Recompute the right-upper chain AFTER all extension rounds. Only the
   // deepest decrement is performed: no R_k merge and no column deletion.
   ,decrement_deepest = current=>{
      var v=current[current.length-1], entry
      while(v && v[1].length){
         var i=highest_index(v[1])
         entry=v[1][i]
         if(!entry[1][1].length){
            if(entry[1][0]===1) v[1].splice(i,1)
            else --entry[1][0]
            break
         }
         v=entry[1]
      }
      // Editing a separator can change ancestor ordering or create duplicates.
      return current.map(canonical_vector)
   }
   ,FSalter = (m,n)=>{
      integer(n)
      if(is_limit_marker(m)) return Main(n)
      var current=normalize(m)
      if(!current.length) return []
      // A successor has no M/LNZ; use the same successor rule as FS.
      if(!matrix_is_limit(current)) return current.slice(0,-1)
      for(var round=0;round<n;++round) current=extend_round(current)
      return decrement_deepest(current)
   }
   ,FS = (m,n)=>{
      integer(n)
      if(is_limit_marker(m)) return Main(n)
      var current=normalize(m)
      if(!current.length) return []
      // FS returns only a MATRIX. For the full successor rule n -> n^2,
      // use step(). The explorer itself does not evaluate numerical arguments.
      if(!matrix_is_limit(current)) return current.slice(0,-1)
      for(var round=0;round<n;++round) current=extend_round(current)
      current.pop() // Exactly once, AFTER all n rounds (also when n = 0).
      return current
   }

   // Only explorer protocol fields are placed in register.
   var notation={
      id:'ndd'
      ,name:'Nested dimensional diagram'
      ,display:m=>is_limit_marker(m)?'Limit':matrix_display(m)
      ,able:m=>is_limit_marker(m)||matrix_is_limit(m)
      ,compare:(a,b)=>{
         var al=is_limit_marker(a), bl=is_limit_marker(b)
         return al||bl ? (al===bl?0:al?1:-1) : matrix_compare(a,b)
      }
      ,FS:FS
      ,FSalter:FSalter
      ,init:()=>([
         {expr:[[Infinity]],low:[[]],subitems:[]}
         ,{expr:[],low:[[]],subitems:[]}
      ])
   }

   if(typeof register!=='undefined') register.push(notation)
})();