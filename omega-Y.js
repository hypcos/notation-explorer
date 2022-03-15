;var sequence_compare = (seq1,seq2)=>{
   if(seq1.length===0){
      if(seq2.length===0) return 0
      else return -1
   }else{
      if(seq2.length===0) return 1
      else{
         if(seq1[0]<seq2[0]) return -1
         else if(seq1[0]>seq2[0]) return 1
         else return sequence_compare(seq1.slice(1),seq2.slice(1))
      }
   }
}
,sequence_display = expr=>''+expr==='Infinity'?'Limit':''+expr
,Y_limit = seq=>seq[seq.length-1]>1
register.push({
   id:'omega-y'
   ,name:'ω-Y sequence'
   ,display:sequence_display
   ,able:Y_limit
   ,compare:sequence_compare
   ,FS:(seq,FSterm)=>{
      var from_sequence = seq=>{
         var bottom,phantom,i,mountain=[]
         for(i=0;i<seq.length;++i){
            bottom={value:seq[i],x:i,y:[1],leftleg_up:[]}
            phantom={x:i,y:[],leftleg_up:[]}
            //define default edges below the bottom row
            bottom.rightleg_down = phantom
            phantom.rightleg_up = bottom
            if(i>0){
               bottom.leftleg_down = mountain[i-1][1]
               mountain[i-1][1].leftleg_up.push(bottom)
            }
            mountain[i]=[bottom,phantom]
         }
         return mountain
      }
      ,to_sequence = mountain=>mountain.map(column=>column[column.length-2].value)
      ,vertical_compare = (a,b)=>{
         if(a.leftleg_up) return vertical_compare(a.y,b)
         if(b.leftleg_up) return vertical_compare(a,b.y)
         if(a.length>b.length) return 1
         if(a.length<b.length) return -1
         for(var i=a.length;i--;){
            if(a[i]>b[i]) return 1
            if(a[i]<b[i]) return -1
         }
         return 0
      }
      ,same_row = (entry1,entry2)=>vertical_compare(entry1.y,entry2.y)===0
      ,vertical_increase = (y,d)=>{//go from y=[r0,r1,r2,...,r(d-1),rd #] to [0,0,0,...,0,rd+1 #]
         if(y.leftleg_up) return vertical_increase(y.y,d)
         var c=y.slice()
         c[d]===undefined?(c[d]=1):(c[d]+=1)
         c.fill(0,0,d)
         return c
      }
      ,dimension_difference = (c1,c2)=>{
         var d=Math.max(c1.length,c2.length)
         while(d--){
            if(c1[d]!==c2[d]) return d
         }
         return d//identical coordinate means dimension difference -1
      }
      ,create_entry = function(parent,entry){
         var newentry={
            value:entry.value-parent.value
            ,x:entry.x
            ,y:vertical_increase(entry.y,dimension_difference(parent.y,entry.y)+1)
            ,leftleg_up:[]
         }
         newentry.rightleg_down = entry
         entry.rightleg_up = newentry
         newentry.leftleg_down = parent
         parent.leftleg_up.push(newentry)
         return newentry
      }
      ,draw_mountain = mountain=>{
         mountain.forEach(column=>{
            var parent,entry,up
            while(true){
               entry = column[0]
               if(entry.value===1) return;
               for(parent=entry;true;){
                  up=parent.leftleg_down
                  while(up.rightleg_up&& vertical_compare(up.rightleg_up,parent)<=0) up=up.rightleg_up
                  parent=up
                  if(parent.value<entry.value) break
               }
               column.unshift(create_entry(parent,entry))
            }
         })
         return mountain
      }
      ,collect_usual = (working_entry,collection=[])=>{
         working_entry.leftleg_up.forEach(e=>{
            var child=e.rightleg_down
            if(collection.includes(child)) return;
            if(same_row(working_entry,child)){
               collection.push(child)
               collect_usual(child,collection)
            }
         })
         return collection
      }
      ,collect1D = (working_entry,collection=[])=>{
         working_entry.rightleg_down.leftleg_up.forEach(child=>{
            if(collection.includes(child)) return;
            if(same_row(working_entry,child)){
               collection.push(child)
               collect1D(child,collection)
            }
         })
         return collection
      }
      ,collect = working_entry=>
         vertical_compare(working_entry.y,[1])>0 && dimension_difference(working_entry.y,working_entry.rightleg_down.y)===0 
         ?collect1D(working_entry) :collect_usual(working_entry)
      ,fill_magma_edge = (mountain,source_entry,leftleg_entry)=>{
         var newentry,d
         ,targetx = source_entry.x-source_entry.leftleg_down.x+leftleg_entry.x
         for(d=dimension_difference(leftleg_entry.y,leftleg_entry.rightleg_up.y);d>=0;--d){
            newentry={
               x:targetx
               ,y:vertical_increase(leftleg_entry,d)
               ,leftleg_up:[]
            }
            newentry.leftleg_down = leftleg_entry
            leftleg_entry.leftleg_up.push(newentry)
            mountain[targetx].push(newentry)
         }
      }
      ,copy_single_edge = (mountain,source_entry,x_offset,BR_x,targety)=>{
         if(targety===undefined) targety = source_entry.y
         var leftleg_entry
         ,newentry={
            x:source_entry.x+x_offset
            ,y:targety.slice()
            ,leftleg_up:[]
         }
         if(source_entry.y.length>0){//underground doesn't have this
            if(source_entry.leftleg_down.x>=BR_x){//ascend
               leftleg_entry = mountain[source_entry.leftleg_down.x+x_offset].find(entry=>vertical_compare(entry,newentry)<0)
            }else{//not ascend
               leftleg_entry = source_entry.leftleg_down
            }
            newentry.leftleg_down = leftleg_entry
            leftleg_entry.leftleg_up.push(newentry)
         }
         mountain[source_entry.x+x_offset].push(newentry)
      }
      if(!seq.length) return []
      if(''+seq==='Infinity') return [1,1+FSterm]
      if(seq[seq.length-1]===1) return seq.slice(0,seq.length-1)
      var mountain = draw_mountain(from_sequence(seq))
      var child = mountain[mountain.length-1]
      var BR = child[0].leftleg_down
      var width=mountain.length-1-BR.x
      ,top=mountain[BR.x]
      top = top.slice(top.findIndex(entry=>entry===BR),top.length-1)
      top.unshift(child[0])
      var s=seq.slice()
      --s[s.length-1]
      mountain = draw_mountain(from_sequence(s))
      BR = mountain[BR.x].find(entry=>same_row(entry,BR))//restore in the new mountain
      var magma_entries=[]
      for(var BR1=BR;true;BR1=BR1.rightleg_down){
         collect(BR1).forEach(entry=>{
            var dx=entry.x-BR.x
            if(magma_entries[dx]===undefined) magma_entries[dx]=[]
            magma_entries[dx].push(entry)
         })
         if(!BR1.y.length) break
      }
      for(var n=1;n<=FSterm;++n){
         var ref = top.map(topentry=>mountain[mountain.length-1].find(entry=>vertical_compare(entry,topentry)<0))
         for(var dx=1;dx<=width;++dx){
            var column=[]
            mountain[BR.x+n*width+dx]=column
            magma_entries[dx].forEach(magma_entry=>{
               copy_single_edge(mountain,magma_entry,n*width,BR.x)
               var source_entry = magma_entry
               ,targety = ref.slice().reverse().find(refentry=>vertical_compare(magma_entry,refentry)<=0).y
               while(!(source_entry.value<=1||magma_entries[dx].includes(source_entry.rightleg_up))){
                  targety = vertical_increase(targety,dimension_difference(source_entry.y,source_entry.rightleg_up.y))
                  source_entry = source_entry.rightleg_up
                  copy_single_edge(mountain,source_entry,n*width,BR.x,targety)
               }
               if(!magma_entry.y.length) return;
               targety = ref.slice().reverse().find(refentry=>vertical_compare(magma_entry,refentry)<=0).y
               var leftlegx = magma_entry.leftleg_down.x+n*width//strong magma
               mountain[leftlegx].filter(
                  entry=>vertical_compare(magma_entry,entry)<=0&&vertical_compare(entry,targety)<0
               ).forEach(
                  leftleg_entry=>fill_magma_edge(mountain,magma_entry,leftleg_entry)
               )
            })
            column.sort((entry1,entry2)=>-vertical_compare(entry1,entry2))
            for(var i=0;i<column.length-1;++i){
               column[i].rightleg_down = column[i+1]
               column[i+1].rightleg_up = column[i]
            }
            column[0].value = 1
            column.slice(1,column.length-1).forEach(entry=>entry.value=entry.rightleg_up.value+entry.rightleg_up.leftleg_down.value)
         }
      }
      s=to_sequence(mountain)
      s.pop()
      return s
   }
   ,init:()=>([
      {expr:[Infinity],low:[[1]],subitems:[]}
      ,{expr:[1],low:[[]],subitems:[]}
      ,{expr:[],low:[[]],subitems:[]}
   ])
})