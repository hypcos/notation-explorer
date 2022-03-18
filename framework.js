;const FSbounded = (FS,compare,seq,low)=>{
   var res,n=0
   while(true){
      res = FS(seq,n)
      if(compare(res,low[0])>0) return res
      n++
   }
}
,app = Vue.createApp({
   data:()=>({
      current_tab:0
      ,FS_shown:register.map(()=>4)
      ,extra_FS:register.map(()=>0)
      ,tier:register.map(()=>1)
      ,datasets:register.map(notation=>notation.init())
   })
   ,computed:{
      current_notation(){return register[this.current_tab].id}
      ,tab_names:()=>register.map(notation=>notation.name)
      ,tiername(){
         var n=this.tier[this.current_tab]
         if(0<=n&&n<=8) return ['small','single','double','triple','quadruple','quintuple','sextuple','septuple','octuple'][n]+' expansion'
         return n+'-fold expansion'
      }
   }
   ,methods:{
      incrFS(tab_index){
         this.FS_shown.splice(tab_index,1,this.FS_shown[tab_index]+1)
      }
      ,decrFS(tab_index){
         this.FS_shown.splice(tab_index,1,Math.max(this.FS_shown[tab_index]-1,0))
      }
      ,incr_extra(tab_index){
         this.extra_FS.splice(tab_index,1,this.extra_FS[tab_index]+1)
      }
      ,decr_extra(tab_index){
         this.extra_FS.splice(tab_index,1,Math.max(this.extra_FS[tab_index]-1,0))
      }
      ,incr_tier(tab_index){
         this.tier.splice(tab_index,1,this.tier[tab_index]+1)
      }
      ,decr_tier(tab_index){
         this.tier.splice(tab_index,1,Math.max(this.tier[tab_index]-1,0))
      }
   }
})
register.forEach((notation,index)=>{
   app.component(notation.id+'-list',{
      props:['expr','low','subitems']
      ,data:()=>({
         display:notation.display
         ,able:notation.able
         ,compare:notation.compare
         ,FS:notation.FS
         ,shownFS:[]
      })
      ,methods:{
         recalculate(){
            if(!this.able(this.expr)) return;
            var res=[]
            ,nmax=this.$root.FS_shown[index]
            for(var n=0;n<=nmax;++n) res.push(n+':&nbsp;'+this.display(this.FS(this.expr,n)))
            this.shownFS = res
         }
         ,expand(){
            if(!this.able(this.expr)) return;
            var extraFS = this.$root.extra_FS[index]
            ,expand_at = (item,tier)=>{
               if(!tier) return;
               var working_expr = item.expr
               while(this.able(working_expr)){
                  working_expr = FSbounded(this.FS,this.compare,working_expr,item.low)
                  item.subitems.push({
                     expr:working_expr
                     ,low:JSON.parse(JSON.stringify(item.low))
                     ,subitems:[]
                  })
               }
               for(i=extraFS;i--;){
                  working_expr = item.subitems[0].expr
                  item.subitems.unshift({
                     expr:FSbounded(this.FS,this.compare,item.expr,[working_expr])
                     ,low:[]
                     ,subitems:[]
                  })
               }
               for(var i=item.subitems.length;i--;){
                  if(i>0) item.subitems[i-1].low[0] = JSON.parse(JSON.stringify(item.subitems[i].expr))
                  else item.low[0] = JSON.parse(JSON.stringify(item.subitems[0].expr))
               }
               item.subitems.slice(extraFS).forEach(subitem=>expand_at(subitem,tier-1))
            }
            var working_low = this.low
            for(var i=extraFS;i>=0;--i){
               this.subitems.unshift({
                  expr:FSbounded(this.FS,this.compare,this.expr,working_low)
                  ,low:JSON.parse(JSON.stringify(working_low))
                  ,subitems:[]
               })
               working_low = [this.subitems[0].expr]
            }
            this.low[0] = this.subitems[0].expr
            expand_at(this.subitems[extraFS],this.$root.tier[index])
         }
      }
      ,template:`<li><span class="shown-item" @mouseover="recalculate()" @mousedown="expand()"><span v-html="display(expr)"></span><span class="tooltip" v-if="able(expr)">
            <span v-html="display(expr)"></span> fundamental sequence:
            <span v-for="term in shownFS"><br><span v-html="term"></span></span>
         </span></span>
         <ul>
            <`+notation.id+`-list v-for="subitem in subitems" v-bind="subitem"></`+notation.id+`-list>
         </ul>
      </li>`
   })
   app.component(notation.id,{
      props:['dataset']
      ,template:`<ul><`+notation.id+`-list v-for="item in dataset" v-bind="item"></`+notation.id+`-list></ul>`
   })
})
app.mount('#app')