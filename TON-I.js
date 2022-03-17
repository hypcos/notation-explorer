//Encoding: -1 for '0', 0 for 'W', [b,a,-2] for C(a,b), x[1] for left part, x[0] for right part
var IStd={}
register.push({
   id:'ton-i'
   ,name:"Iteration of n-built from below (no passthrough)"
   ,able:TON_limit
   ,compare:TON_noraise_compare
   ,display:TON_noraise_display
   ,FS:(term,n)=>{
      var extract = (term,index)=>index.length?extract(term[index[0]],index.slice(1)):term
      ,smallindex = a=>{
         if(a===0) return []
         var sow_smallindex = (a,begin)=>{
            if(a===0) return;
            var begins=begin.slice()
            if(TON_noraise_compare(a,0)<0){
               result.push(begin)
            }else{
               begin.push(0)
               sow_smallindex(a[0],begin)
               begin=begins
               begin.push(1)
               sow_smallindex(a[1],begins)
            }
         }
         ,result=[]
         sow_smallindex(a,[])
         return result
      }
      ,Copy = x=>typeof x==='number'?x:[Copy(x[0]),Copy(x[1]),-2]
      ,get_n = (term,index)=>{//get a2=a'' from a1=a'
         var subterm,i
         ,a=Copy(term)
         ,a1index=index.slice()
         //step 3
         for(i=0;i<a1index.length;){
            if(a1index[i]===0){
               if(i===0){
                  a=a[0]
               }else{
                  subterm=extract(a,a1index.slice(0,i-1))
                  subterm[a1index[i-1]] = subterm[a1index[i-1]][0]
               }
               a1index.splice(i,1)
            }else i++
         }
         //step 2
         if(a1index.length===0){
            a = 0
         }else{
            subterm=extract(a,a1index.slice(0,a1index.length-1))
            subterm[a1index[a1index.length-1]] = 0
         }
         //step 4
         var scan = x=>{
            if(typeof x==='number') return;
            if(typeof x[0]==='number') return;
            if(TON_noraise_compare(x[1],x[0][1])>0) x[0] = x[0][0]
            scan(x[0])
            scan(x[1])
         }
         scan(a)
         //step 5
         var alim=a
         a=Copy(term)
         //step 6
         var str1 = (''+a).split(',').map(e=>+e)
         ,str2 = (''+alim).split(',').map(e=>+e)
         ,a2 = []
         while(str1.length&&str2.length&&str1[0]===str2[0]){
            a2.push(str1[0])
            str1.shift()
            str2.shift()
         }
         //step 7
         var n=0
         while(a2[a2.length-1]===-2) a2.pop()
         if(a2[a2.length-1]===-1){
            ++n
            a2.pop()
         }else{
            return n
         }
         while(a2[a2.length-1]===-2&&a2[a2.length-2]===-1){
            ++n
            a2.splice(a2.length-2,2)
         }
         return n
      }
      ,BuiltQ = (a,b,n,x)=>n ? TON_noraise_compare(x,0)<0&&BuiltQ(x,b,n-1,x)||(TON_noraise_compare(x,0)>=0||TON_noraise_compare(x,a)<=0)&&
         (x===0||BuiltQ(a,b,n,x[0])&&BuiltQ(a,b,n,x[1]))
         :TON_noraise_compare(a,b)<0
      ,StandardQ = a=>{
         var str = JSON.stringify(a)
         if(IStd[str]){
            return IStd[str]
         }else if(typeof a==='number' || (StandardQ(a[1])&&StandardQ(a[0]) && (typeof a[0]==='number'||TON_noraise_compare(a[1],a[0][1])<=0) &&
         smallindex(a[1]).every(index=>BuiltQ(extract(a[1],index),a,get_n(a[1],index),extract(a[1],index))))){
            return IStd[str]=true
         }else{
            return false
         }
      }
      if(''+term==='Infinity'){
         term = [-1,[[0,[0,-1,-2],-2],0,-2],-2]
      }
      var flag,c1,c3
      ,beta = Copy(term)
      ,lim = (''+term).split(',').length + n*2
      do{
         flag=false;
         if(typeof beta==='number'&&beta>=0){					   //gamma = 'W', m = 0, assuming beta != '0'
            beta=-1
         }else if(beta[1]===-1){		                           //gamma = '0', m = 1
            beta=beta[0]
            flag=true
            continue
         }else if(typeof beta[1]==='number'&&beta[1]>=0){		//gamma = 'W', m = 1
            beta[1]=-1
         }else if(beta[1][1]===-1){                            //gamma = '0', m = 2
            beta=[[beta[0],beta[1][0],-2],0,-2]
         }else if(typeof beta[1][1]==='number'&&beta[1][1]>=0){//gamma = 'W', m = 2
            beta[1][1]=-1
         }else{							                           //m > 2, the main part of step 1 and 2
            c3=beta
            c1=beta[1][1]
            while(typeof c1[1]!=='number'){
               c3=c3[1]
               c1=c1[1]
            }
            if(c1[1]===-1){                                    //gamma = '0', m > 2
               c3[1]=[[c3[1][0],c1[0],-2],0,-2]
            }else{							                        //gamma = 'W', m > 2
               c1[1]=-1
            }
         }
         while((''+beta).split(',').length<lim&&StandardQ(beta)){//better step 3
            if(typeof beta!=='number'){
               c1=beta
               while(typeof c1[1]!=='number')c1=c1[1]		      //step 4
               c1[1]=[c1[1],0,-2]									   //step 5
            }else{
               beta=[beta,0,-2]										//step 4 and 5 for beta = '0' and 'W'
            }
         }
      }while(flag||!StandardQ(beta));
      return beta
   }
   ,init:()=>[
      {expr:Infinity,low:[[-1,[0,[0,-1,-2],-2],-2]],subitems:[]}
      ,{expr:[-1,[0,[0,-1,-2],-2],-2],low:[[-1,[0,0,-2],-2]],subitems:[]}
      ,{expr:[-1,[0,0,-2],-2],low:[[-1,0,-2]],subitems:[]}
      ,{expr:[-1,0,-2],low:[-1],subitems:[]}
      ,{expr:-1,low:[-1],subitems:[]}
   ]
})