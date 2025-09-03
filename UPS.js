;(()=>{
   const last=(s,n=1,i=s.length-1)=>{while(i>=0&&s[i][0]!=n)i--;return i}
   const cut=(s,t,e=s.length)=>{if(t===-1)return [];let r=[],d=s[t][0],m=s.length>e?e+1:s.length;for(let i=t;i<m&&s[i][0]>=d;i++)r.push([s[i][0]-d,i===e?1:s[i][1]]);return r}
   const next=s=>cut(s,last(s))
   const next0=s=>compare(s=next(s),[[0,1]])<0?s:next0(s)
   const sup=(s,f1,f2)=>{let i=f1;while(s[i][1]||s[i][0]!=s[f2][0])i++;return i}
   const father=(s,n=s.length-1)=>last(s,s[n][0]-1,n-1)
   const fa0=(s,n=s.length-1)=>s[(n=father(s,n))>=0?n:0][1]?fa0(s,n):n
   const compare=(a,b,i=0)=>a.length===i?b.length===i?0:-1:b.length===i?1:a[i][0]>b[i][0]?1:a[i][0]<b[i][0]?-1:a[i][1]===b[i][1]?compare(a,b,i+1):a[i][1]-b[i][1]
   function proj(s,n){
      let ne=next0(s);
      for(let i=0;i<n;i++)if(compare(s=next(s),[[0,1]])<0){s=0;break;}
      if(ne.length)ne=proj(ne,n);
      return s===0||ne.length&&compare(s,ne)>0?ne:s
   }
   function unproj(s1,s2){
      for(let i=0;;i++){
         let p1=proj(s1,i),p2=proj(s2,i);
         if(p1.length===0)return true
         if(compare(p1,p2)>0)return false
      }
   }
   function r(s0,z0){
      let s=s0.slice(),z=z0,b;
      if(s[s.length-1][1]===0){
         b=father(s);
      }else for(let f2=fa0(s),f1=fa0(s,f2);;f2=f1,f1=fa0(s,f1)){
         if(f1===-1){b=0;break}
         b=sup(s,f1,f2);
         if(unproj(cut(s,f1,b),cut(s,f2)))break
      }
      let d=s[s.length-1][0]+s[s.length-1][1]-s[b][0]-1;
      s.pop();
      let B=s.slice(b);
      while(z--){B=B.map(item=>[item[0]+d,item[1]]);s.push(...B)}
      return s
   }
   register.push({
      id:'ups'
      ,name:'Upward projection sequence'
      ,display:s=>''+s==='Infinity'?'Limit':s.map(item=>item[1]?item[0]+'*':item[0]).join(',')
      ,able:matrix_limit
      ,compare:matrix_compare
      ,FS:(m,FSterm)=>{
         if(''+m==='Infinity') return [[0,0]].concat(Array(FSterm).fill(0).map((x,n)=>[n+1,1]))
         if(m.length===0) return []
         return r(m,FSterm)
      }
      ,init:()=>([
         {expr:[[Infinity]],low:[[]],subitems:[]}
         ,{expr:[],low:[[]],subitems:[]}
      ])
   })
})()