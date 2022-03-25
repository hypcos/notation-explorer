//Encoding: -1 for '0', n for 'W_n', [b,a,-2] for C(a,b), x[1] for left part, x[0] for right part
;var raise = (term,sys)=>typeof term==='number'
   ?term>=0&&term<sys?[-1,raise(term+1,sys),-2]:term
   :[raise(term[0],sys),raise(term[1],sys),-2]
,TON_compare = (x,y)=>{
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
   var sysx,sysy
   ,tmpx = (''+x).split(',')
   ,tmpy = (''+y).split(',')
   sysx = Math.max(0,...tmpx)
   sysy = Math.max(0,...tmpy)
   if(sysx<Infinity&&sysy<Infinity&&(sysx>0||sysy>0)){
      x=raise(x,Math.max(sysx,sysy))
      y=raise(y,Math.max(sysx,sysy))
   }
   return comp((''+x).split(',').map(e=>+e),(''+y).split(',').map(e=>+e))
}
,TON_main_display = term=>typeof term==='number'
   ?term==Infinity?'Limit':term<0?'0':'Ω<sub>'+term+'</sub>'
   :TON_main_display(term[0])+TON_main_display(term[1])+'C'
,TON_limit = term=>typeof term==='number'?term>=0:typeof term[1]!=='number'||term[1]>=0
register.push({
   id:'ton-m'
   ,name:"Taranosvky's ordinal notation"
   ,display:TON_main_display
   ,compare:TON_compare
   ,able:TON_limit
   ,FS:(()=>{
      var data={}
      ,StdTrue = {}
      ,mark = sys=>{
         var res=[[-1,sys,-2],sys,-2]
         for(var i=sys-1;i>0;i--) res = [-1,res,-2]
         return res
      }
      ,mark_FS = (sys,n)=>{
         var i,res=sys-1
         for(i=0;i<n;++i) res = [sys-1,res,-2]
         for(i=sys-1;i>0;i--) res = [-1,res,-2]
         return res
      }
      ,BuiltQ = (n,b,a,x)=>n ? BuiltQ(n-1,b,x,x)||(TON_compare(x,a)<=0&&(typeof x==='number'?x>=0:BuiltQ(n,b,a,x[1])&&BuiltQ(n,b,a,x[0]))) : TON_compare(a,b)<0
      ,StandardQ = (n,a)=>{
         var str = JSON.stringify(a)
         if(StdTrue[str]){
            return StdTrue[str]
         }else if(typeof a==='number' || (StandardQ(n,a[1])&&StandardQ(n,a[0]) && (typeof a[0]==='number'||TON_compare(a[1],a[0][1])<=0) && BuiltQ(n,a,a[1],a[1]))){
            return StdTrue[str]=true
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