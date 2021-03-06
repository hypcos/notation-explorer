//Encoding: -1 for '0', 0 for 'W', [b,a,-2] for C(a,b), x[1] for left part, x[0] for right part
//In reflection configuration, -0.5 for 'x'
register.push({
   id:'ton-drpc'
   ,name:'Degrees of Reflection with Passthrough (reflection configuration)'
   ,able:TON_limit
   ,compare:TON_noraise_compare
   ,display:TON_noraise_display
   ,FS:(()=>{
      var data={}
      ,DRPCStd={}
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
      ,BuiltQ = (a,ap,ai,b,a0,d)=>{
         if(a===0||TON_noraise_compare(a,b)<0) return true
         if(d===-1&&TON_noraise_compare(a,0)<0&&TON_noraise_compare(r(a,ap),r(ai,b))>0) return false
         if(TON_noraise_compare(a,d)<0) return BuiltQ(a,ap,ai,b,a0,-1)
         var x2 = TON_noraise_compare(a,0)<0?a:ap
         if(d===-1&&TON_noraise_compare(a[0],0)<0&&TON_noraise_compare(r(a[1],x2),r(a0,b))<0) return BuiltQ(a,ap,ai,b,a0,a)
         return BuiltQ(a[0],x2,ai,b,a0,d)&&BuiltQ(a[1],x2,ai,b,a0,d)
      }
      ,StandardQ = a=>{
         var str = JSON.stringify(a)
         if(DRPCStd[str]){
            return DRPCStd[str]
         }else if(typeof a==='number' || (StandardQ(a[1])&&StandardQ(a[0]) && (typeof a[0]==='number'||TON_noraise_compare(a[1],a[0][1])<=0) &&
         smallpart(a[1]).every(x=>BuiltQ(x,a,x,a,a[1],-1)))){
            return DRPCStd[str]=true
         }else{
            return false
         }
      }
      ,Copy = x=>typeof x==='number'?x:[Copy(x[0]),Copy(x[1]),-2]
      ,TON = function*(term){
         var flag=true,c1,c3
         ,n=0
         ,beta = Copy(term)
         ,len = (''+term).split(',').length
         mainloop:while(true){
            if(flag){
               if(typeof beta==='number'&&beta>=0){					   //gamma = 'W', m = 0, assuming beta != '0'
                  beta=-1
               }else if(beta[1]===-1){		                           //gamma = '0', m = 1
                  beta=beta[0]
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
            }
            flag=true
            while((''+beta).split(',').length<len+n*2){//better step 3
               if(!StandardQ(beta)) continue mainloop
               if(typeof beta!=='number'){
                  c1=beta
                  while(typeof c1[1]!=='number')c1=c1[1]		      //step 4
                  c1[1]=[c1[1],0,-2]									   //step 5
               }else{
                  beta=[beta,0,-2]										//step 4 and 5 for beta = '0' and 'W'
               }
            }
            if(StandardQ(beta)){
               n = yield Copy(beta)
               flag=false
            }
         }
      }
      return (term,n)=>{
         if(''+term==='Infinity'){
            term = [-1,0,-2]
         }
         var datakey=''+term
         ,dataterm = data[datakey]
         if(!dataterm){
            dataterm = (data[datakey] = [])
            dataterm.gen = TON(term)
            dataterm[0] = dataterm.gen.next().value
         }
         if(dataterm[n]!==undefined) return dataterm[n]
         return dataterm[n] = dataterm.gen.next(n).value
      }
   })()
   ,init:()=>[
      {expr:Infinity,low:[-1],subitems:[]}
      ,{expr:-1,low:[-1],subitems:[]}
   ]
})