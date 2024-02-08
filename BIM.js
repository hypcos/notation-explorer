;register.push({
   id:'bim'
   ,name:'Bashicu induction matrix'//Bashicu induction matrix at 2024/2/8
   ,display:matrix_display
   ,able:matrix_limit
   ,compare:matrix_compare
   ,FS:(()=>{
      var data={}
      ,expand = (B,A)=>{
         var D3=B.length-1,D2=B[0].length-1
         ,B2=Array(D3+1).fill(Array(D2+1).fill(0))
         ,C=Array(D2+1).fill(0)
         ,C2=Array(D3+1).fill(0)
         ,C3=Array(D2+1).fill(0)
         ,D7=0,D8=0,D17=0,D18=0,D19=0,D26=0
         for(var D4=0;D4<=D2;++D4){
            if(0<B[D3][D4] && !B[D3][D4+1]){
               for(var D5=0;D5<=D3;++D5){
                  for(var D6=0;D6<=D4;++D6){
                     if(B[D3-D5][D6]<B[D3][D6]-C[D6]){//remove 0<B[D3-D5,D6]
                        if(D6<D4){
                           C[D6]=B[D3][D6]-B[D3-D5][D6]
                        }else{
                           if(!D7) D7=D5
                           ;++D8
                           C2[D8]=D5
                           for(var D9=0;D9<=D6;++D9){
                              B2[D3-D5][D9]=D8
                           }
                           for(var D10=0;D10<=D4;++D10){
                              for(var D11=D3-D5;D11<=D3;++D11){
                                 for(var D12=D11;D12>=D3-D5;--D12){
                                    for(var D13=0;D13<=D10;++D13){
                                       if(B[D12][D13]<B[D11][D13]-C3[D13]){
                                          if(D10===D13){
                                             if(0<B2[D12][D10] && !B2[D11,D10]) B2[D11][D10]=D8
                                             D12=D3-D5
                                          }else{
                                             C3[D13]=B[D11][D13]-B[D12][D13]
                                          }
                                       }else{
                                          D13=D10
                                       }
                                    }
                                 }
                                 for(var D14=0;D14<=D2;++D14){
                                    C3[D14]=0
                                 }
                              }
                           }
                           for(var D15=0;D15<=D7;++D15){
                              for(var D16=0;D16<=D2;++D16){
                                 D17=0
                                 if(0<B2[D3-D7+D15][D16]){
                                    if(D16<D4) D17=B[D3-C2[B2[D3-D7+D15][D16]]][D16]-B[D3-D5][D16]
                                 }
                                 if(B[D3-D5+D15][D16]<B[D3-D7+D15][D16]-D17){
                                    D26=D15;D15=D7;D16=D2;D18=1
                                 }else if(B[D3-D7][D16]-D17<B[D3-D5][D16]){
                                    D15=D7;D16=D2
                                 }
                              }
                           }
                           if(!D18){
                              D19=D5
                           }else{
                              if(D26===D7) D5=D3//differences from BHM2 ?
                              D18=0
                           }
                        }
                     }else{
                        D6=D4
                     }
                  }
               }
               D4=D2
            }
         }
         for(var D20=0;D20<=D2;++D20){
            if(0<B[D3][D20+1]) C[D20]=B[D3][D20]-B[D3-D19][D20]
         }
         var result = B.slice(0,D3).map(col=>col.slice())
         for(var D21=1;D21<=A*D19;++D21){
            if(!result[D3]) result[D3]=[]
            if(!B2[D3]) B2[D3]=[]
            for(var D22=0;D22<=D2;++D22){
               if(0<B2[D3-D19][D22]){
                  result[D3][D22]=result[D3-D19][D22]+C[D22]
               }else{
                  result[D3][D22]=result[D3-D19][D22]
               }
               B2[D3][D22]=B2[D3-D19][D22]
            }
            ++D3
         }
         if(D2>0&&result.every(column=>column[D2]===0)) result = result.map(column=>column.slice(0,D2))
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