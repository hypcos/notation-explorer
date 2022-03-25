//Encoding: -1 for '0', 0 for 'W', [b,a,-2] for C(a,b), x[1] for left part, x[0] for right part
;var TON_noraise_compare = (x,y)=>{
   var comp = (a,b)=>{
      if(a.length){
         if(b.length){
            if(a[0]>b[0]) return 1
            else if(a[0]<b[0]) return -1
            else return comp(a.slice(1),b.slice(1))
         }else return 1
      }else if(b.length){
         return -1
      }else return 0
   }
   return comp((''+x).split(',').map(e=>+e),(''+y).split(',').map(e=>+e))
}
,TON_noraise_display = term=>typeof term==='number'
   ?term==Infinity?'Limit':term<0?'0':'Ω'
   :TON_noraise_display(term[0])+TON_noraise_display(term[1])+'C'
register.push({
   id:'ton-dr'
   ,name:'Degrees of Reflection'
   ,able:TON_limit
   ,compare:TON_noraise_compare
   ,display:TON_noraise_display
   ,FS:(()=>{
      var data={}
      ,DRStd={}
      ,smallpart = term=>{
         var sow_smallpart = a=>{
            if(a===0) return;
            if(TON_noraise_compare(a,0)<0){
               result.push(a)
            }else{
               sow_smallpart(a[0])
               sow_smallpart(a[1])
            }
         }
         ,result=[]
         sow_smallpart(term)
         return result
      }
      ,BuiltQ = (a,b,x)=>TON_noraise_compare(x,0)<0
         ?TON_noraise_compare(x,b)<0||TON_noraise_compare(x,a)<=0&&BuiltQ(a,b,x[0])&&BuiltQ(a,b,x[1])
         :x===0||BuiltQ(a,b,x[0])&&BuiltQ(a,b,x[1])
      ,StandardQ = a=>{
         var str = JSON.stringify(a)
         if(DRStd[str]){
            return DRStd[str]
         }else if(typeof a==='number' || (StandardQ(a[1])&&StandardQ(a[0]) && (typeof a[0]==='number'||TON_noraise_compare(a[1],a[0][1])<=0) &&
         smallpart(a[1]).every(x=>BuiltQ(x,a,x)))){
            return DRStd[str]=true
         }else{
            return false
         }
      }
      ,Copy = x=>typeof x==='number'?x:[Copy(x[0]),Copy(x[1]),-2]
      ,TON = (term,n)=>{
         if(''+term==='Infinity'){
            term = [-1,0,-2]
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
      return (term,FSterm)=>{
         var datakey=''+term
         if(!data[datakey]) data[datakey] = []
         else if(data[datakey][FSterm]!==undefined) return data[datakey][FSterm]
         return data[datakey][FSterm] = TON(term,FSterm)
      }
   })()
   ,init:()=>[
      {expr:Infinity,low:[-1],subitems:[]}
      ,{expr:-1,low:[-1],subitems:[]}
   ]
})