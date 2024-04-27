// Written by solarzone.

const cOCF_count=(x)=>(x.match(/\(/g)||[]).length-(x.match(/\)/g)||[]).length;

function cOCF_abbreviate(x){
//  if(x[0]=='P'){
//    if(x=='P(0)'){return 'Ω';}
//    //...
//  }
  x=x.replaceAll('p(0)','1');
  x=x.replaceAll('p(1)','ω');
  x=x.replaceAll(/(1\+)+1/g,p=>((p.length+1)/2).toString());
  x=x.replaceAll('p(P(0))','Ω');
  x=x.replaceAll('p(P(P(0)))','L');
  x=x.replaceAll('p(P(P(0)+P(0)))','R');
  x=x.replaceAll('p(P(p(P(P(0))+P(0))))','I');
  x=x.replaceAll('p(P(P(0))+P(0))','d');
  x=x.replaceAll('p(P(P(P(0))))','J');
  x=x.replaceAll('P(0)','c');
  x=x.replaceAll('P','χ');
  x=x.replaceAll('p','ψ');
  return x;
}

function cOCF_op(x){
  if(cOCF_lt(x,'p(p(0))')){return false;}
  let f=(x[0]=='p')?`p(${cOCF_sua(cOCF_arg(x))[0]})`:'P(0)';
  let g=null;
  let h=null;
  if(f=='p(0)'){f='p(p(0))';g=cOCF_log(x);h=cOCF_exp(g);}
  else{g=cOCF_div(cOCF_log(x),f);h=cOCF_exp(cOCF_mul(f,g))}
  let c=cOCF_div(x,h);
  let d=cOCF_sub(x,cOCF_mul(h,cOCF_div(x,h)));
  if(d!='0'){return true;}
  return false;
}

function cOCF_display(x){
  //console.log(x);
  if(x+''=='Infinity'){return 'c';}
  if(x=='0'){return '0';}
  if(/^(p\(0\)\+)*p\(0\)$/.test(x)){return ((x.length+1)/5).toString();}
  let f=(x[0]=='p')?`p(${cOCF_sua(cOCF_arg(x))[0]})`:'P(0)';
  let g=null;
  let h=null;
  if(f=='p(0)'){f='p(p(0))';g=cOCF_log(x);h=cOCF_exp(g);}
  else{g=cOCF_div(cOCF_log(x),f);h=cOCF_exp(cOCF_mul(f,g))}
  let c=cOCF_div(x,h);
  let d=cOCF_sub(x,cOCF_mul(h,cOCF_div(x,h)));
  //console.log(f,g,h,'',c,d);
  if(c=='p(0)'&&d=='0'){
    if(cOCF_exp(x)!=x){
      if(x=='p(p(0))'){return 'ω';}
      if(cOCF_lt(x,'p(P(0))')){return `ω<sup>${cOCF_display(cOCF_log(x))}</sup>`;}
      return `${cOCF_display(f)}<sup>${cOCF_display(g)}</sup>`
    }
    if(x=='P(0)'){return 'c';}
    let m=cOCF_div(cOCF_log(cOCF_lastTerm(cOCF_arg(x))[1]),'P(0)');
    let k=cOCF_exp(cOCF_mul('P(0)',cOCF_div(cOCF_log(cOCF_lastTerm(cOCF_arg(x))[1]),'P(0)')));
    k=cOCF_div(cOCF_arg(x),k);
    //console.log(arg(x),k,m)
    k=cOCF_sua(k);
    t=cOCF_exp(cOCF_add(cOCF_mul('P(0)',m),'P(0)'));
    let l=null;
    if(k[0]=='0'){l='0';}
    else{l='p('+cOCF_mul(cOCF_exp(cOCF_mul('P(0)',m)),k[0])+')';}
    let r='p('+cOCF_mul(cOCF_exp(cOCF_mul('P(0)',m)),cOCF_add(k[0],'P(0)'))+')';
    let [a,b]=cOCF_split(k[1],r);
    a='p('+cOCF_mul(cOCF_exp(cOCF_mul('P(0)',m)),a)+')'
    //console.log(k,r,l,a,b)
    if(a=='p(0)'){a='0';}
    l=cOCF_add(l,cOCF_add(a,b))
    let s=''
    if(cOCF_lastTerm(cOCF_arg(x))[1][0]=='P'&&b!='0'){
      if(m=='p(0)'){s='Ω';}
      if(m=='p(0)+p(0)'){s='L';}
      if(m=='p(0)+p(0)+p(0)'){s='R';}
      if(m=='P(0)'){s='J';}
      if(s==''){return `ψ(${cOCF_display(cOCF_arg(x))})`;}
      if(l=='p(0)'){return s;}
      return `${s}<sub>${cOCF_display(l)}</sub>`;
    }
    return `ψ(${cOCF_display(cOCF_arg(x))})`;
  }
  let a=cOCF_display(h);
  //console.log(f,h,c,d)
  if(c!='p(0)'){
    if(!cOCF_op(c)){a+=cOCF_display(c)}
    else{a+=`&sdot;(${cOCF_display(c)})`;}
  }
  if(d!='0'){a+='+'+cOCF_display(d);}
  return a;
}

function cOCF_paren(x,n){
  console.log()
  let q=x[n]=='('?1:-1;
  let i=n;
  let t=0;
  while(1){t+=(x[i]=='('?1:x[i]==')'?-1:0);if(!t){break;};i+=q;}
  return i;
}

function cOCF_firstTerm(x){
  console.log()
  let m=cOCF_paren(x,1);
  return[x.slice(0,m+1),x.slice(m+2)||'0'];
}

function cOCF_lastTerm(x){
  console.log()
  let m=cOCF_paren(x,x.length-1);
  return[x.slice(0,m-2)||'0',x.slice(m-1)];
}

function cOCF_terms(x){
  console.log()
  if(x=='0'){return [];}
  return[cOCF_firstTerm(x)[0]].concat(cOCF_terms(cOCF_firstTerm(x)[1]));
}

function cOCF_trim(s){while(s[s.length-1]==')'){s=s.slice(0,-1);}return s;}

function cOCF_arg(x){
  console.log()
  return cOCF_firstTerm(x)[0].slice(2,-1);
}

function cOCF_lt(x,y){
  console.log()
  if(y=='0'){return false;}
  if(x=='0'){return true;}
  if(x[0]=='p'&&y[0]=='P'){return true;}
  if(x[0]=='P'&&y[0]=='p'){return false;}
  if(cOCF_arg(x)!=cOCF_arg(y)){return cOCF_lt(cOCF_arg(x),cOCF_arg(y));}
  return cOCF_lt(cOCF_firstTerm(x)[1],cOCF_firstTerm(y)[1]);
}

function cOCF_expW(x){
  console.log()
  if(cOCF_lt(x,'P(0)')){return'0';}
  x=cOCF_arg(x);
  let y='';
  while(cOCF_lt('P(0)',cOCF_firstTerm(x)[0])||(cOCF_firstTerm(x)[0]=='P(0)')){
    y+=cOCF_firstTerm(x)[0]+'+';
    x=cOCF_firstTerm(x)[1];
  }
  if(cOCF_lt(y.slice(0,-1)||'0','P(p(0))')){y='P(0)+'+y;}
  return y.slice(0,-1);
}

function cOCF_lv(x){return cOCF_expW(cOCF_lastTerm(cOCF_arg(x)).at(-1));}

function cOCF_fix(s){while(cOCF_count(s)){s+=')';}return s;}

function cOCF_root1(x){
  let i=cOCF_trim(x).length+1;
  let c=undefined;
  while(1){
    c=cOCF_paren(x,i)
    if(cOCF_lt(x.slice(c-1,i+1),'P(0)')){break;}
    i++;
    if(i==x.length){return undefined;}
  }
  console.log();
  let v=cOCF_lv(x.slice(c-1,i+1));
  let p=c;
  let q=i;
  let m=c;
  let n=i;
  i++;
  if(i>=x.length){return undefined;}
  while(1){
    c=cOCF_paren(x,i);
    if(x[c-1]=='p'){
      let l=cOCF_lv(x.slice(c-1,i+1));
      if(cOCF_lv(x.slice(m-1,n+1))=='0'){m=p;n=q;break;}
      if(cOCF_lt(l,v)){break;}
      m=c;
      n=i;
    }
    i++;
    if(i==x.length){return undefined;}
  }
  return [n,x.slice(m-1,n+1)]
}

function cOCF_root2(x){
  console.log();
  if(cOCF_root1(x)===undefined){return undefined;}
  let y=cOCF_root1(x)[1];
  let i=cOCF_root1(x)[0];
  let c=null;
  let z=null;
  console.log(x);
  while(1){
    if(i==x.length){return undefined;}
    let c=cOCF_paren(x,i);
    if(lt(x.slice(c-1,i+1),y)){z=[i,x.slice(c-1,i+1)];break;}
    i++;
  }
  i--;
  console.log(z);
  while(1){
    let m=cOCF_paren(x,i);
    console.log(m);
    if(x[m-1]=='p'){
      let c=cOCF_paren(x,i+1);
      let d=cOCF_terms(x.slice(c+1,i+1));
      let m=[];
      for(let j of d){
        if(lt(j,'P(0)')){m.push(j);}
      }
      m=m.join('+')
      z=[i,m];
      break;
    }
    i--;
  }
  return z;
}

function cOCF_fs(x,n){
  if(x=='0'){return x;}
  let y=x;
  let m=cOCF_paren(x,x.length-1);
  let d=x.slice(m-1);
  if(d=='p(0)'){return x.slice(0,m-2);}
  x=cOCF_trim(x);
  let o=''
  if(x.at(-3)=='p'){
    x+='))';
    let k=cOCF_paren(x,x.length-1);
    let z=x.slice(k-1,-5)+')';
    o=x.slice(0,k-1)+('+'+z).repeat(n+1);
  }
  else{
    if(cOCF_compare(y,'P(0)')!=-1){
      let b=cOCF_trim(x).slice(0,-3);
      o=b+'p('+'P('.repeat(n)
    }
    else{
      let r=cOCF_root2(y);
      if(r==undefined){
        let b=cOCF_trim(x).slice(0,-3);
        o=b+'p('+'P('.repeat(n)
      }
      else{
        let b=cOCF_trim(x.slice(r[0]-r[1].length+1,r[0])).slice(0,-3);
        o=x.slice(0,r[0]-r[1].length+1)+b.repeat(n);
      }
    }
  }
  o=cOCF_fix(o).replaceAll('+)',')').replaceAll('(+','(').replaceAll('++','+').replaceAll('()','(0)');
  if(o[0]=='+'){o=o.slice(1);}
  return o;
}

//=========================

function cOCF_add(x,y){
  if(x=='0'){return y;}
  if(y=='0'){return x;}
  if(cOCF_lt(cOCF_firstTerm(x)[0],cOCF_firstTerm(y)[0])){return y;}
  let z=cOCF_firstTerm(x)[0]
  let w=cOCF_add(cOCF_firstTerm(x)[1],y);
  if(w!='0'){return z+'+'+w;}
  return z;
}

function cOCF_sub(x,y){
  if(x=='0'){return '0';}
  if(y=='0'){return x;}
  if(cOCF_lt(cOCF_firstTerm(y)[0],cOCF_firstTerm(x)[0])){return x;}
  return cOCF_sub(cOCF_firstTerm(x)[1],cOCF_firstTerm(y)[1]);
}

function cOCF_sua(x){return cOCF_split(x,'P(0)');}

function cOCF_exp(a){
  if(a[0]=='P'){return `P(${cOCF_sub(a,'P(0)')})`;}
  if(cOCF_lt(a,'p(p(P(0)))')){return `p(${a})`;}
  let [x,y]=cOCF_sua(cOCF_arg(a));
  let p=cOCF_split(y,`p(${cOCF_add(x,'P(0)')})`)[0];
  return 'p('+cOCF_add(x,cOCF_add(p,cOCF_sub(a,'p('+cOCF_add(x,p)+')')))+')';
}

function cOCF_log(a){
  if(a=='0'){return [];}
  if(a[0]=='P'){return cOCF_add('P(0)',cOCF_arg(a));}
  let [x,y]=cOCF_sua(cOCF_arg(a));
  let [p,q]=cOCF_split(y,`p(${cOCF_add(x,'P(0)')})`);
  if(x=='0'&&p=='0'){
    return q;
  }
  let m=cOCF_add(`p(${cOCF_add(x,p)})`,q);
  return m;
}

function cOCF_div(a,b){ // only works when b is a.p.
  if(cOCF_lt(a,b)){return '0';}
  return cOCF_add(cOCF_exp(cOCF_sub(cOCF_log(a),cOCF_log(b))),cOCF_div(cOCF_firstTerm(a)[1],b));
}

function cOCF_mul(a,b){ // only works when a is a.p.
  if(b=='0'){return '0';}
  return cOCF_add(cOCF_exp(cOCF_add(cOCF_log(a),cOCF_log(b))),cOCF_mul(a,cOCF_firstTerm(b)[1]))
}

function cOCF_split(a,x){
  if(a=='0'){return ['0','0'];}
  if(cOCF_lt(cOCF_firstTerm(a)[0],x)){return ['0',a];}
  return [cOCF_add(cOCF_firstTerm(a)[0],cOCF_split(cOCF_firstTerm(a)[1],x)[0]),cOCF_split(cOCF_firstTerm(a)[1],x)[1]];
}

function cOCF_compare(x,y){
  if(cOCF_lt(x,y)){return -1;}
  if(cOCF_lt(y,x)){return 1;}
  return 0;
}

function cOCF_islimit(a){
  if(a+''=='Infinity'){return true;}
  if(a=='0'){return false;}
  return a.slice(-4)!='p(0)'
}

register.push({
   id:'cocf'
   ,name:"cOCF"
   ,display:cOCF_display//abbreviate
   ,compare:cOCF_compare
   ,able:cOCF_islimit
   ,FS:(()=>{
      var data={}
      return (m,n)=>{
         if(''+m==='Infinity') return cOCF_fs('P(0)',n);
         if(m==='0') return '0'
         var datakey=m
         if(!data[datakey]) data[datakey] = []
         else if(data[datakey][n]!==undefined) return data[datakey][n]
         return data[datakey][n] = cOCF_fs(m,n)
      }
   })()
   ,init:()=>[
      {expr:Infinity,low:['0'],subitems:[]}
      ,{expr:'0',low:['0'],subitems:[]}
   ]
})
