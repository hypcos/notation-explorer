;register.push({
   id:'bsm2'
   ,name:'BSM2'//https://googology.fandom.com/ja/wiki/%E3%83%A6%E3%83%BC%E3%82%B6%E3%83%BC%E3%83%96%E3%83%AD%E3%82%B0:BashicuHyudora/BAAN?oldid=59140#%E3%83%90%E3%82%B7%E3%82%AF%E6%80%A5%E8%A1%8C%E5%88%97%E6%95%B0(Bashicu_sudden_matrix_number)
   ,display:matrix_display
   ,able:matrix_limit
   ,compare:matrix_compare
   ,FS:(()=>{
      var data={}
      ,expand = (B0,A)=>{
         var B = B0.slice().map(col=>col.slice())
         ,D3=B.length-1,D2=B[0].length-1
         ,B2=Array(D3+1).fill(Array(D2+1).fill(0))
         ,C=Array(D2+1).fill(0)
         ,C2=Array(D3+1).fill(0)
         ,C3=Array(D2+1).fill(0)
         ,D7=0,D8=0,D9=0,D17=0,D21=0
         for(var D4=0;D4<=D2;++D4){
            if(0<B[D3][D4]&&!B[D3][D4+1]){
               var D28=D4
               for(var D5=0;D5<=D3;++D5){
                  for(var D6=0;D6<=D4;++D6){
                     if(B[D3-D5][D6]<B[D3][D6]-C[D6]&&(C[D6]+1===B[D3][D6]-B[D3-D5][D6]||D28<=D6)){
                        if(D6<D4){
                           C[D6]=B[D3][D6]-B[D3-D5][D6]
                        }else{
                           if(!D7) D8=D5
                           ;++D9
                           C2[D9]=D5
                           for(var D10=0;D10<=D2;++D10){
                              B2[D3-D5][D10]=D9
                           }
                           for(var D11=1;D11<=D5;++D11){
                              for(var D12=0;D12<=D2;++D12){
                                 for(var D13=D11;D13>=0;--D13){
                                    for(var D14=0;D14<=D12;++D14){
                                       if(!B2[D3-D5+D11][D12]){
                                          if(B[D3-D5+D13][D14]<B[D3-D5+D11][D14]-C3[D14]&&C3[D14]+1===B[D3-D5+D11][D14]-B[D3-D5+D13][D14]){
                                             if(D12===D14&&0<B2[D3-D5+D13][D14]&&(0<B[D3-D5+D13][D14]||B2[D3-D5+D13][D14]===D9)){
                                                B2[D3-D5+D11][D14]=D9
                                             }else if(1<B[D3-D5+D11][D14]-C3[D14]){
                                                C3[D14]=B[D3-D5+D11][D14]-B[D3-D5+D13][D14]
                                             }
                                          }else{
                                             D14=D12
                                          }
                                       }
                                    }
                                 }
                                 for(var D15=0;D15<=D2;++D15){
                                    C3[D15]=0
                                 }
                              }
                           }
                           if(C[D4]+1<B[D3][D6]-B[D3-D5][D6]&&!B[D3-D5][D4+1]){
                              ++C[D4]
                              for(var D16=D4;D16<=D2;++D16){
                                 if(B[D3-D5][D16]===B[D3-D8][D16]-C[D16]){
                                    D17=1
                                 }else{
                                    D17=2;D16=D2
                                 }
                              }
                           }
                           if(0<B[D3-D5][D4+1]){
                              for(var D29=D4+1;D29<=D2;++D29){
                                 if(0<B[D3-D5][D29]){
                                    B[D3][D29]=B[D3-D5][D29]+1;++D4;D17=1
                                 }else{
                                    D29=D2
                                 }
                              }
                           }
                           if(D17===1){
                              D17=0;D7=D5
                           }else if(!D17){
                              for(var D18=0;D18<=D8;++D18){
                                 for(var D19=0;D19<=D2;++D19){
                                    var D20=0
                                    if(0<B2[D3-D8+D18][D19]){
                                       if(D19<D4+1) D20=B[D3-C2[B2[D3-D8+D18][D19]]][D19]-B[D3-D5][D19]
                                    }
                                    if(B[D3-D5+D18][D19]<B[D3-D8+D18][D19]-D20){
                                       D18=D8;D19=D2;D21=1;D5=D3;--D9
                                    }else if(B[D3-D8+D18][D19]-D20<B[D3-D5+D18][D19]){
                                       D18=D8;D19=D2
                                    }
                                 }
                              }
                              if(!D21) D7=D5
                              else D21=0
                           }else{
                              D17=0;D5=D3;D6=D4
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
         for(var D22=0;D22<=D2;++D22){
            if(D22<D28){
               C[D22]=B[D3][D22]-B[D3-D7][D22]
            }else if(0<B[D3][D22]){
               C[D22]=B[D3][D22]-B[D3-D7][D22]-1
            }else{
               D22=D2
            }
         }
         var result = B.slice(0,D3).map(col=>col.slice())
         for(var D23=1;D23<=A*D7;++D23){
            if(!result[D3]) result[D3]=[]
            if(!B2[D3]) B2[D3]=[]
            for(var D24=0;D24<=D2;++D24){
               if(0<B2[D3-D7][D24] && B2[D3-D7][D24]<D9+1 && (0<result[D3-D7][D24] || B2[D3-D7][D24]===D9)){
                  result[D3][D24]=result[D3-D7][D24]+C[D24]
               }else{
                  result[D3][D24]=result[D3-D7][D24]
               }
               B2[D3][D24]=B2[D3-D7][D24]
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