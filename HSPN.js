// I'll make this as clear as I can

const HSPN_count=(x)=>(x.match(/\(/g)||[]).length-(x.match(/\)/g)||[]).length;

function unabbreviate(x){
  let y=x;
  y=y.replaceAll('ψ','psi');
  y=y.replaceAll('Ω','W');
  y=y.replaceAll('ω','w');
  y=y.replaceAll('psi','p');
  y=y.replaceAll('_','');
  y=y.replaceAll(/W\d+/g,p=>'W'.repeat(Number(p.slice(1))));
  function e(x){return x.replaceAll(/p\(W{2,}\)/g,p=>'W'.repeat(p.length-4));}
  while(e(y)!=y){y=e(y);}
  y=y.replaceAll('w','p(1)')
  y=y.replaceAll(/[1-9]\d*/g,p=>{return 'p(0)+'.repeat(Number(p)).slice(0,-1)});
  return y;
}

function abbreviate(x){
  let y=x;
  y=y.replaceAll(/W{2,}/g,p=>`W_${p.length}`);
  y=y.replaceAll('W','Ω');
  y=y.replaceAll('p(0)','1')
  y=y.replaceAll(/(1\+)+1/g,p=>((p.length+1)/2).toString())
  y=y.replaceAll('p(1)','ω')
  y=y.replaceAll('p','ψ');
  return y;
}

function HSPN_std(x){return x==''?0:unabbreviate(abbreviate(x));}

function HSPN_paren(x,n,sw=true){
  if(x[n-1]=='W'&&sw){
    n--;
    let i=n;
    while(x[i]=='W'){i++;}
    return i-1;
  }
  let q=x[n]=='('?1:-1;
  let i=n;
  let t=0;
  while(1){t+=(x[i]=='('?1:x[i]==')'?-1:0);if(!t){break;};i+=q;}
  return i;
}


function HSPN_lv(x){
  if(x=='0'){return 0;}
  else if(x.match(/^W+(\+|$)/)){return HSPN_paren(x,1)+1;}
  else{
    let t=HSPN_paren(x,1);
    return Math.max(0,HSPN_lv(x.slice(2,t))-1);
  }
}

function HSPN_arg(x){
  if(x[0]=='0'){return x;}
  if(x[0]=='W'){return 'W'.repeat(HSPN_paren(x,1)+1);}
  return x.slice(2,HSPN_paren(x,1))
}

function HSPN_lt(x,y){
  if(y=='0'){return false;}
  if(x=='0'){return true;}
  if(HSPN_lv(x)==HSPN_lv(y)){
    let x_=HSPN_paren(x,1);
    let y_=HSPN_paren(y,1);
    if(x.slice(0,x_+1)==y.slice(0,y_+1)){return HSPN_lt(HSPN_std(x.slice(x_+2)),HSPN_std(y.slice(y_+2)));}
    return HSPN_lt(HSPN_arg(x),HSPN_arg(y));
  }
  return HSPN_lv(x)<HSPN_lv(y);
}

function HSPN_limit(s,n){return 'p('.repeat(n+1)+'W'.repeat(s+n)+'+'+'W'.repeat(s+n)+')'.repeat(n+1);}

function HSPN_fix(s){while(HSPN_count(s)){s+=')';}return s;}
function HSPN_trim(s){while(s.at(-1)==')'){s=s.slice(0,-1);}return s;}

function HSPN_islimit(x){
  if(''+x=='Infinity'){return true;}
  if(x=='0'){return false;}
  if(x.at(-1)=='W'){return true;}
  x=HSPN_trim(x);
  if(x.at(-1)=='0'&&HSPN_count(x)==1){return false;}
  return true;
}

function HSPN_root(x,l){
  let b=x.length-1;
  while(x[b]==')'){b--;}
  if(x[b]=='0'){return undefined;}
  let a=b;
  while(x[a]!='+'&&x[a]!='('){a--;}
  a++;
  b++;
  let i=b
  let y=x.slice(a,b)
  if(l==1){
    while(1){
      if(i==x.length){return undefined;}
      let c=HSPN_paren(x,i,false)
      if(HSPN_lt(x.slice(c-1,i+1),y)){return [i,x.slice(c-1,i+1)];}
      i++;
    }
  }
  let h=x.length-1;
  while(x.at(h)!='W'){h--;}
  let v=x.slice(0,HSPN_root(x,l-1)[0]);
  let f=HSPN_root(x,l-1);
  let z=HSPN_count(v);
  let q=f[0]-f[1].length+2;
  let w=q;
  let c=f[1]
  i=f[0]-f[1].length+1;
  while(1){
    if(x[i]=='('){
      let m=x.slice(0,i);
      let t=HSPN_count(m);
      if(t<=z){
        if(HSPN_lt(HSPN_fix(x.slice(i-1,h)),HSPN_root(x,l-1)[1])){
          break;
        }
        q=i;
      }
    }
    i--;
  }
  q--;
  let n=f[0];
  while(HSPN_count(x.slice(q,n+1))>0){n++;}
  return [n,x.slice(q,n+1)];
}

function HSPN_fs(x,n){
  if(x=='0'){return x;}
  if(x.at(-1)=='W'){
    let y=x;
    while(y.at(-1)=='W'){y=y.slice(0,-1);}
    return y+HSPN_limit(x.length-y.length,n);
  }
  x=HSPN_trim(x);
  let o=''
  if(x.at(-1)=='0'){
    if(HSPN_count(x)==1){o=(x!='p(0')?x.slice(0,-4):'0';}
    else{
        x+='))';
        let k=HSPN_paren(x,x.length-1);
        let z=x.slice(k-1,-5)+')';
        o=x.slice(0,k-1)+('+'+z).repeat(n+1);
    }
  }
  else{
    let m=false;
    let z=x;
    let y=HSPN_fix(x);
    let i=0;
    while(z.at(-1)=='W'){i++;z=z.slice(0,-1);}
    let l=i;
    let j=x.length;
    let v='W'.repeat(i);
    let a=undefined;
    while(1){
      while(1){
        if(j==y.length){m=true;break;}
        a=HSPN_paren(y,j,false);
        if(HSPN_lt(y.slice(a-1,j+1),v)){break;}
        j++;
      }
      if(m){break;}
      v=y.slice(a-1,j+1);
      i--;
      if(!i){break;}
    }
    if(m){
      o=z+HSPN_limit(l,n);
    }
    else{
      let r=HSPN_root(y,l)[0]-HSPN_root(y,l)[1].length+1;
      if(r<1){n++;}
      o=x.slice(0,r)+z.slice(r).repeat(n);
    }
  }
  o=HSPN_fix(o).replaceAll('+)',')').replaceAll('(+','(').replaceAll('++','+').replaceAll('()','(0)');
  if(o[0]=='+'){o=o.slice(1);}
  return HSPN_std(o);
}

function HSPN_display(x){
  if(''+x=='Infinity'){return 'Limit';}
  return abbreviate(x).replaceAll(/_\d+/g,x=>`<sub>${Number(x.slice(1))}</sub>`)
}

function HSPN_compare(x,y){
  if(HSPN_lt(x,y)){return -1;}
  if(HSPN_lt(y,x)){return 1;}
  return 0;
}

register.push({
   id:'hspn'
   ,name:"n-shifted psi"
   ,display:HSPN_display
   ,compare:HSPN_compare
   ,able:HSPN_islimit
   ,FS:(()=>{
      var data={}
      return (m,n)=>{
         if(''+m==='Infinity') return HSPN_fs('W',n);
         if(m==='0') return '0'
         var datakey=HSPN_display(m)
         if(!data[datakey]) data[datakey] = []
         else if(data[datakey][n]!==undefined) return data[datakey][n]
         return data[datakey][n] = HSPN_fs(m,n)
      }
   })()
   ,init:()=>[
      {expr:Infinity,low:['0'],subitems:[]}
      ,{expr:'0',low:['0'],subitems:[]}
   ]
})
