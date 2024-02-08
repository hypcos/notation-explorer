;register.push({
   id:'btm'
   ,name:'Bashicu triangular matrix'//Bashicu triangular matrix at 2024/2/8
   ,display:matrix_display
   ,able:matrix_limit
   ,compare:matrix_compare
   ,FS:(()=>{
      var data={}
      ,expand = (B,A)=>{
         var D4=B.length-1,D3=B[0].length-1
         ,B2=Array(D4+1).fill(Array(D3+1).fill(0))
         ,C=Array(D3+1).fill(0)
         ,C2=Array(D4+1).fill(0)
         ,C3=Array(D3+1).fill(0)
         ,D8=0,D9=0,D18=0,D19=0,D20=0
         for(var D5=0;D5<=D3;++D5){
            if(0<B[D4][D5] && !B[D4][D5+1]){
               for(var D6=0;D6<=D4;++D6){
                  for(var D7=0;D7<=D5;++D7){
                     if(B[D4-D6][D7]<B[D4][D7]-C[D7]){
                        if(D7<D5){
                           C[D7]=B[D4][D7]-B[D4-D6][D7]
                        }else{
                           if(!D8) D8=D6
                           ;++D9
                           C2[D9]=D6
                           for(var D10=0;D10<=D5;++D10){
                              B2[D4-D6][D10]=D9
                           }
                           for(var D11=0;D11<=D5;++D11){
                              for(var D12=D4-D6;D12<=D4;++D12){
                                 for(var D13=D12;D13>=D4-D6;--D13){
                                    for(var D14=0;D14<=D11;++D14){
                                       if(B[D13][D14]<B[D12][D14]-C3[D14]){
                                          if(D11===D14){
                                             if(0<B2[D13][D11] && !B2[D12][D11]) B2[D12][D11]=D9
                                             D13=D4-D6
                                          }else{
                                             C3[D14]=B[D12][D14]-B[D13][D14]
                                          }
                                       }else{
                                          D14=D11
                                       }
                                    }
                                 }
                                 for(var D15=0;D15<=D5;++D15){
                                    C3[D15]=0
                                 }
                              }
                           }
                           if(B[D4][D5]===1){
                              for(var D16=0;D16<=D8;++D16){
                                 for(var D17=0;D17<=D3;++D17){
                                    D18=0
                                    if(0<B2[D4-D8+D16][D17]){
                                       if(D17<D5) D18=B[D4-C2[B2[D4-D8+D16][D17]]][D17]-B[D4-D6][D17]
                                    }
                                    if(B[D4-D6+D16][D17]<B[D4-D8+D16][D17]-D18){
                                       D16=D8;D17=D3;D19=1;D6=D4
                                    }else if(B[D4-D8+D16][D17]-D18<B[D4-D6+D16][D17]){
                                       D16=D8;D17=D3
                                    }
                                 }
                              }
                              if(!D19) D20=D6
                              else D19=0
                           }else{
                              D20=D6;D6=D4
                           }
                        }
                     }else{
                        D7=D5
                     }
                  }
               }
               D5=D3
            }
         }
         for(var D21=0;D21<=D3;++D21){
            if(0<B[D4][D21+1]) C[D21]=B[D4][D21]-B[D4-D20][D21]
         }
         var result = B.slice(0,D4).map(col=>col.slice())
         for(var D22=1;D22<=A*D20;++D22){
            if(!result[D4]) result[D4]=[]
            if(!B2[D4]) B2[D4]=[]
            for(var D23=0;D23<=D3;++D23){
               if(0<B2[D4-D20][D23]){
                  result[D4][D23]=result[D4-D20][D23]+C[D23]
               }else{
                  result[D4][D23]=result[D4-D20][D23]
               }
               B2[D4][D23]=B2[D4-D20][D23]
            }
            ++D4
         }
         if(D3>0&&result.every(column=>column[D3]===0)) result = result.map(column=>column.slice(0,D3))
         return result
      }
      return (m,FSterm)=>{
         if(''+m==='Infinity') return FSterm?Array(1+FSterm).fill(0).map((e,i)=>Array(FSterm).fill(0).map((e,j)=>i>j?i-j:0)):[[0]]
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