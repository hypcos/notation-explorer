;register.push({
   id:'bhm2'
   ,name:'BHM2'//Bashicu hyper matrix at 2024/2/8, different from what I coded BHM
   ,display:matrix_display
   ,able:matrix_limit
   ,compare:matrix_compare
   ,FS:(()=>{
      var data={}
      ,expand = (b,a)=>{
         var d3=b.length-1,d2=b[0].length-1
         ,b2=Array(d3+1).fill(Array(d2+1).fill(0))
         ,c=Array(d2+1).fill(0)
         ,c2=Array(d3+1).fill(0)
         ,c3=Array(d2+1).fill(0)
         ,d7=0,d8=0,d17=0,d18=0,d19=0
         for(var d4=0;d4<=d2;++d4){
            if(0<b[d3][d4]&&!b[d3][d4+1]){
               for(var d5=0;d5<=d3;++d5){
                  for(var d6=0;d6<=d4;++d6){
                     if(b[d3-d5][d6]<b[d3][d6]-c[d6]){//remove the buggy 0<B[D3-D5,D6]
                        if(d6<d4){
                           c[d6]=b[d3][d6]-b[d3-d5][d6]
                        }else{
                           if(!d7) d7=d5
                           ;++d8
                           c2[d8]=d5
                           for(var d9=0;d9<=d6;++d9){
                              b2[d3-d5][d9]=d8
                           }
                           for(var d10=0;d10<=d4;++d10){
                              for(var d11=d3-d5;d11<=d3;++d11){
                                 for(var d12=d11;d12>=d3-d5;--d12){
                                    for(var d13=0;d13<=d10;++d13){
                                       if(b[d12][d13]<b[d11][d13]-c3[d13]){
                                          if(d10===d13){
                                             if(0<b2[d12][d10]&&!b2[d11][d10]) b2[d11][d10]=d8
                                             d12=d3-d5
                                          }else{
                                             c3[d13]=b[d11][d13]-b[d12][d13]
                                          }
                                       }else{
                                          d13=d10
                                       }
                                    }
                                 }
                                 for(var d14=0;d14<=d2;++d14){
                                    c3[d14]=0
                                 }
                              }
                           }
                           for(var d15=0;d15<=d7;++d15){
                              for(var d16=0;d16<=d2;++d16){
                                 d17=0
                                 if(0<b2[d3-d7+d15][d16]){
                                    if(d16<d4) d17=b[d3-c2[b2[d3-d7+d15][d16]]][d16]-b[d3-d5][d16]
                                 }
                                 if(b[d3-d5+d15][d16]<b[d3-d7+d15][d16]-d17){
                                    d15=d7;d16=d2;d18=1;d5=d3
                                 }else if(b[d3-d7][d16]-d17<b[d3-d5][d16]){
                                    d15=d7;d16=d2
                                 }
                              }
                           }
                           if(!d18) d19=d5
                           else d18=0
                        }
                     }else{
                        d6=d4
                     }
                  }
               }
               d4=d2
            }
         }
         for(var d20=0;d20<=d2;++d20){
            if(0<b[d3][d20+1]) c[d20]=b[d3][d20]-b[d3-d19][d20]
         }
         var result = b.slice(0,d3).map(col=>col.slice())
         for(var d21=1;d21<=a*d19;++d21){
            if(!result[d3]) result[d3]=[]
            if(!b2[d3]) b2[d3]=[]
            for(var d22=0;d22<=d2;++d22){
               if(0<b2[d3-d19][d22]){
                  result[d3][d22]=result[d3-d19][d22]+c[d22]
               }else{
                  result[d3][d22]=result[d3-d19][d22]
               }
               b2[d3][d22]=b2[d3-d19][d22]
            }
            ++d3
         }
         if(d2>0&&result.every(column=>column[d2]===0)) result = result.map(column=>column.slice(0,d2))
         return result
      }
      return (m,FSterm)=>{
         if(''+m==='Infinity') return [Array(FSterm+1).fill(0),Array(FSterm+1).fill(1)]
         if(m.length===0) return []
         var datakey=matrix_display(m)
         if(!data[datakey]) data[datakey] = []
         else if(data[datakey][FSterm]!==undefined) return data[datakey][FSterm]
         return data[datakey][FSterm] = expand(m,FSterm)
      }
   })()
   ,init:()=>([
      {expr:[[Infinity]],low:[[]],subitems:[]}
      ,{expr:[],low:[[]],subitems:[]}
   ])
   ,semiable:m=>m.length>0
})