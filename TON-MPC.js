//Encoding: -1 for '0', n for 'W_n', [b,a,-2] for C(a,b), x[1] for left part, x[0] for right part
//In reflection configuration, -0.5 for 'x'
register.push({
   id:'ton-mpc'
   ,name:"TON with passthrough (reflection configuration)"
   ,display:TON_main_display
   ,compare:TON_compare
   ,able:TON_limit
   ,FS:(()=>{
      var data={}
      ,MPCStd = {}
      ,mark = sys=>{
         var res=sys
         for(var i=sys;i>0;i--) res = [[-1,sys,-2],res,-2]
         for(i=sys-1;i>0;i--) res = [-1,res,-2]
         return res
      }
      ,mark_FS = (sys,n)=>{
         var i,res=sys-1
         for(i=0;i<n;++i) res = [sys-1,res,-2]
         for(i=sys-1;i>0;i--) res = [-1,res,-2]
         return res
      }
      ,extract = (term,index)=>index.length?extract(term[index[0]],index.slice(1)):term
      ,subterm_index = a=>{
         var sow_subterms = (a,begin)=>{
            result.push(begin.slice())
            if(typeof a==='number') return;
            sow_subterms(a[0],begin.concat(0))
            sow_subterms(a[1],begin.concat(1))
         }
         ,result=[]
         sow_subterms(a,[])
         return result
      }
      ,BuiltQ = (a,b,rc,n)=>{
         if(!(n>0)) return TON_compare(a,b)<0
         var extractparent = x=>x.length?extract(a,x.slice(0,x.length-1)):b
         ,refresh_totest = (d,e)=>{
            if(typeof extract(a,d)==='number'||TON_compare(extract(a,d),extractparent(e))<0) return;
            totest.push(d)
            refresh_totest(d.concat(0),e)
            refresh_totest(d.concat(1),e)
         }
         ,totest = []
         return subterm_index(a).every(x=>{
            if(TON_compare(r(extract(a,x),extractparent(x)),r(a,b))<=0) return true
            if(x.some((t,zindex)=>TON_compare(extract(a,x.slice(0,zindex)),b)<0)) return true
            totest = []
            refresh_totest(x,x)
            for(var y=x.slice();y.length>0;y.pop()){
               if(x.slice(y.length).every((t,dz)=>TON_compare(extract(a,x.slice(0,y.length+dz)),extractparent(y))>=0)
                  &&totest.every(z=>TON_compare(extract(a,z),extractparent(y))>=0)
                  &&(TON_compare(r(extract(a,y),extractparent(y)),rc)<0||BuiltQ(extract(a,y),extractparent(y),rc,n-1))
               ) return true
            }
            return false
         })
      }
      ,StandardQ = (n,a)=>{
         var str = JSON.stringify(a)
         if(MPCStd[str]){
            return MPCStd[str]
         }else if(typeof a==='number' || (StandardQ(n,a[1])&&StandardQ(n,a[0]) && (typeof a[0]==='number'||TON_compare(a[1],a[0][1])<=0) && BuiltQ(a[1],a,r(a[1],a),n))){
            return MPCStd[str]=true
         }else{
            return false
         }
      }
      ,Copy = x=>typeof x==='number'?x:[Copy(x[0]),Copy(x[1]),-2]
      ,regress = x=>typeof x==='number'?x:(x[0]===-1&&x[1]>0?x[1]-1:[regress(x[0]),regress(x[1]),-2])
      ,regress_repeated = x=>{
         var x1
         while(''+(x1=regress(x))!=''+x) x=x1
         return x1
      }
      ,TON = function*(term,sys){
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
                  beta=[[beta[0],beta[1][0],-2],sys,-2]
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
                     c3[1]=[[c3[1][0],c1[0],-2],sys,-2]
                  }else{							                        //gamma = 'W', m > 2
                     c1[1]=-1
                  }
               }
            }
            flag=true
            while((''+beta).split(',').length<len+n*2){//better step 3
               if(!StandardQ(sys,beta)) continue mainloop
               if(typeof beta!=='number'){
                  c1=beta
                  while(typeof c1[1]!=='number')c1=c1[1]		      //step 4
                  c1[1]=[c1[1],sys,-2]									   //step 5
               }else{
                  beta=[beta,sys,-2]										//step 4 and 5 for beta = '0' and 'W'
               }
            }
            if(StandardQ(sys,beta)){
               n = yield regress_repeated(beta)
               flag=false
            }
         }
      }
      return (term,n)=>{
         var i,res
         ,sys = typeof term==='number'?term:Math.max(0,...((''+term).split(',')))
         if(sys==Infinity){
            res=[n,n,-2]
            for(i=0;i<n;++i) res=[-1,res,-2]
            return res
         }
         term = raise(term,sys)
         if(sys>=1&&''+term===''+mark(sys)) return mark_FS(sys,n)
         var datakey=''+term
         ,dataterm = data[datakey]
         if(!dataterm){
            dataterm = (data[datakey] = [])
            dataterm.gen = TON(term,sys)
            dataterm[0] = dataterm.gen.next().value
         }
         if(dataterm[n]!==undefined) return dataterm[n]
         return dataterm[n] = dataterm.gen.next(n).value
      }
   })()
   ,init:()=>[
      {expr:Infinity,low:[0],subitems:[]}
      ,{expr:0,low:[-1],subitems:[]}
      ,{expr:-1,low:[-1],subitems:[]}
   ]
})