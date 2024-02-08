;register.push({
   id:'blm'
   ,name:'Bashicu large matrix'//https://googology.fandom.com/ja/wiki/%E3%83%A6%E3%83%BC%E3%82%B6%E3%83%BC%E3%83%96%E3%83%AD%E3%82%B0:BashicuHyudora/BASIC%E8%A8%80%E8%AA%9E%E3%81%AB%E3%82%88%E3%82%8B%E5%B7%A8%E5%A4%A7%E6%95%B0%E3%81%AE%E3%81%BE%E3%81%A8%E3%82%81?oldid=31586#%E3%83%90%E3%82%B7%E3%82%AF%E5%A4%A7%E8%A1%8C%E5%88%97%E6%95%B0(Bashicu_Large_matrix_number)
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
         ,d7=0,d8=0,d9=0,d18=0,d19=0
         for(var d4=0;d4<=d2;++d4){
            if(0<b[d3][d4]&&!b[d3][d4+1]){
               for(var d5=0;d5<=d3;++d5){
                  for(var d6=0;d6<=d4;++d6){//turn the buggy "for D6=1 to D2" into "for D6=1 to D4"
                     if(b[d3-d5][d6]<b[d3][d6]-c[d6]){
                        if(d6<d4){
                           c[d6]=b[d3][d6]-b[d3-d5][d6]
                        }else{
                           if(!d7) d8=d5
                           ;++d9
                           if(c[d4]+1<b[d3][d6]-b[d3-d5][d6]) ++c[d4]
                           c2[d9]=d5
                           for(var d10=0;d10<=d4;++d10){
                              b2[d3-d5][d10]=d9
                           }
                           for(var d11=0;d11<=d4;++d11){
                              for(var d12=d3-d5+1;d12<=d3;++d12){
                                 for(var d13=d12;d13>=d3-d5;--d13){
                                    for(var d14=0;d14<=d11;++d14){
                                       if(b[d13][d14]<b[d12][d14]-c3[d14]){
                                          if(d11===d14){
                                             if(0<b2[d13][d11]&&!b2[d12][d11]) b2[d12][d11]=d9
                                             d13=d3-d5
                                          }else{
                                             c3[d14]=b[d12][d14]-b[d13][d14]
                                          }
                                       }else{
                                          d14=d11
                                       }
                                    }
                                 }
                                 for(var d15=0;d15<=d4;++d15){
                                    c3[d15]=0
                                 }
                              }
                           }
                           for(var d16=0;d16<=d8;++d16){
                              for(var d17=0;d17<=d2;++d17){
                                 d18=0
                                 if(0<b2[d3-d8+d16][d17]){
                                    if(d17<d4+1) d18=b[d3-c2[b2[d3-d8+d16][d17]]][d17]-b[d3-d5][d17]
                                 }
                                 if(b[d3-d5+d16][d17]<b[d3-d8+d16][d17]-d18||1<d5-d7&&0<d7){
                                    d16=d7;d17=d2;d19=1;d5=d3;--d9
                                 }else if(b[d3-d8+d16][d17]-d18<b[d3-d5+d16][d17]){
                                    d16=d7;d17=d2
                                 }
                              }
                           }
                           if(!d19) d7=d5
                           else d19=0
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
            if(0<b[d3][d20+1]){
               c[d20]=b[d3][d20]-b[d3-d7][d20]
            }else{
               c[d20]=b[d3][d20]-b[d3-d7][d20]-1
               d20=d2
            }
         }
         var result = b.slice(0,d3).map(col=>col.slice())
         for(var d21=1;d21<=a*d7;++d21){
            if(!result[d3]) result[d3]=[]
            if(!b2[d3]) b2[d3]=[]
            for(var d22=0;d22<=d2;++d22){
               if(0<b2[d3-d7][d22]&&b2[d3-d7][d22]<d9+1){
                  result[d3][d22]=result[d3-d7][d22]+c[d22]
               }else{
                  result[d3][d22]=result[d3-d7][d22]
               }
               b2[d3][d22]=b2[d3-d7][d22]
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