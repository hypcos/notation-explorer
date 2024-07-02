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
      ,FS_shown:register.map(()=>3)
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
      incrFS(){
         this.FS_shown.splice(this.current_tab,1,this.FS_shown[this.current_tab]+1)
      }
      ,decrFS(){
         this.FS_shown.splice(this.current_tab,1,Math.max(this.FS_shown[this.current_tab]-1,0))
      }
      ,incr_extra(){
         this.extra_FS.splice(this.current_tab,1,this.extra_FS[this.current_tab]+1)
      }
      ,decr_extra(){
         this.extra_FS.splice(this.current_tab,1,Math.max(this.extra_FS[this.current_tab]-1,0))
      }
      ,incr_tier(){
         this.tier.splice(this.current_tab,1,this.tier[this.current_tab]+1)
      }
      ,decr_tier(){
         this.tier.splice(this.current_tab,1,Math.max(this.tier[this.current_tab]-1,0))
      }
      ,reset_list(){
         this.datasets.splice(this.current_tab,1,register[this.current_tab].init())
      }
   }
})
register.forEach((notation,index)=>{
   app.component(notation.id+'-list',{
      props:['expr','low','subitems']
      ,data:()=>({
         display:notation.display
         ,able:notation.able
         ,semiable:notation.semiable
         ,compare:notation.compare
         ,FS:notation.FS
         ,FSalter:notation.FSalter
         ,shownFS:[]
         ,tooltip:false
         ,tooltipX:{}
      })
      ,methods:{
         recalculate(event){
            if(!this.able(this.expr)) return;
            var FS = event.shiftKey&&this.FSalter?this.FSalter:this.FS
            var res=[]
            ,nmax=this.$root.FS_shown[index]
            for(var n=0;n<=nmax;++n) res.push(n+':&nbsp;'+this.display(FS(this.expr,n)))
            this.shownFS = res
            this.tooltipX = {left:(event.offsetX+15)+'px'}
            this.tooltip = true
         }
         ,unshow(){
            if(!this.able(this.expr)) return;
            this.tooltip = false
         }
         ,expand(event){
            var FS = event.shiftKey&&this.FSalter?this.FSalter:this.FS
            var expand_extra = item=>{
               var working_low = item.low
               for(var i=this.$root.extra_FS[index];i--;){
                  item.subitems.unshift({
                     expr:FSbounded(FS,this.compare,item.expr,working_low)
                     ,low:JSON.parse(JSON.stringify(working_low))
                     ,subitems:[]
                  })
                  working_low = [item.subitems[0].expr]
               }
               if(item.subitems[0]) item.low[0] = item.subitems[0].expr
            }
            ,expand_tier = (tier,item,append)=>{
               if(!(this.able(item.expr)&&extras.add(item)||this.semiable&&this.semiable(item.expr)&&this.compare(FS(item.expr,0),item.low[0])>0)) return;
               var newitem={
                  expr:FSbounded(FS,this.compare,item.expr,item.low)
                  ,low:JSON.parse(JSON.stringify(item.low))
                  ,subitems:[]
               }
               append.splice(append.map(x=>JSON.stringify(x.expr)).indexOf(JSON.stringify(item.expr))+1,0,newitem)
               item.low[0] = newitem.expr
               if(tier>0){
                  expand_tier(tier,newitem,JSON.stringify(append[append.length-1].expr)===JSON.stringify(newitem.expr)?append:newitem.subitems)
                  tier>1&&expand_tier(tier-1,newitem.subitems.length?newitem.subitems[newitem.subitems.length-1]:newitem,newitem.subitems)
               }
            }
            ,extras=new Set()
            ,parentsubs = this.$parent.subitems
            expand_tier(this.$root.tier[index],this,JSON.stringify(parentsubs[parentsubs.length-1].expr)===JSON.stringify(this.expr)?parentsubs:this.subitems)
            extras.forEach(expand_extra)
         }
      }
      ,template:`<li><div class="shown-item" @mouseenter="recalculate" @mouseleave="unshow()" @mousedown="expand"><span v-html="display(expr)"></span>
            <div class="tooltip" v-if="tooltip" :style="tooltipX" @mousedown.stop>
            <span v-html="display(expr)"></span> fundamental sequence:
            <div v-for="term in shownFS" v-html="term"></div>
         </div></div>
         <ul>
            <`+notation.id+`-list v-for="subitem in subitems" v-bind="subitem"></`+notation.id+`-list>
         </ul>
      </li>`
   })
   app.component(notation.id,{
      props:['subitems']
      ,template:`<ul class="nowrap"><`+notation.id+`-list v-for="item in subitems" v-bind="item"></`+notation.id+`-list></ul>`
   })
})
var root=app.mount('#app')
window.addEventListener('keydown',e=>{
   if(e.ctrlKey||e.altKey||e.shiftKey||e.metaKey) return;
   var k=e.key
   if(0<=k&&k<=9){
      root.tier.splice(root.current_tab,1,+k)
   }else{
      switch(k){
         case ',':
         case '<':
            root.decrFS()
            break
         case '.':
         case '>':
            root.incrFS()
            break
         case '-':
         case '_':
            root.decr_extra()
            break
         case '=':
         case '+':
            root.incr_extra()
            break
      }
   }
})