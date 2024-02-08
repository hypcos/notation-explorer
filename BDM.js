;register.push({
   id:'bdm'
   ,name:'Bashicu difference matrix'//バシク階差行列数 at 2024/2/8
   ,display:matrix_display
   ,able:matrix_limit
   ,compare:matrix_compare
   ,FS:(()=>{
      var data={}
      ,expand = (B0,A)=>{
         var B=B0.slice().map(col=>col.slice())
         ,D3=B.length-1,D2=B[0].length-1
         ,B2=Array(D3+1).fill(Array(D2+1).fill(0))
         ,C=Array(D2+1).fill(0)
         ,C2=Array(D3+1).fill(0)
         ,C3=Array(D2+1).fill(0)
         ,D6=0,D7=0,D17=0,D19=0
         for(var D4=0;D4<=D3;++D4){
            for(var D5=0;D5<=D2;++D5){
               if(B[D3-D4][D5]<B[D3][D5]-C[D5] || !B[D3][0]){
                  if(!B[D3][0]){
                     D4=D3;D5=D2;D6=0
                  }else if(0<B[D3][D5+1]){
                     if(B[D3][D5]-B[D3-D4][D5]+C[D5]===1) C[D5]=B[D3][D5]-B[D3-D4][D5]
                  }else if(B[D3][D5]-B[D3-D4][D5]===2 && 0<B[D3][D5+1]){
                     for(var D8=D5+1;D8<=D2;++D8){
                        if(0<B[D3-D4][D8]) B[D3][D8]=B[D3-D4][D8]
                     }
                     D6=0
                     if(!D19) D19=D5
                  }else if(B[D3][D5]-B[D3-D4][D5]===1){
                     if(!D6) D6=D4
                     if(!D19) D19=D5
                     ;++D7
                     C2[D7]=D4
                     for(var D9=0;D9<=D2;++D9){
                        B2[D3-D4][D9]=D7
                     }
                     for(var D10=0;D10<=D2;++D10){
                        for(var D11=D3-D4;D11<=D3-1;++D11){
                           for(var D12=D11;D12>=D3-D4;--D12){
                              for(var D13=0;D13<=D10;++D13){
                                 if(B[D12][D13]<B[D11][D13]-C3[D13]){
                                    if(D10===D13){
                                       if(0<B2[D12][D10] && !B2[D11][D10]) B2[D11][D10]=D7
                                       D12=D3-D4
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
                     for(var D15=0;D15<=D6;++D15){
                        for(var D16=0;D16<=D2;++D16){
                           D17=0
                           if(0<B2[D3-D6+D15][D16]){
                              if(D16<D5) D17=B[D3-C2[B2[D3-D6+D15][D16]]][D16]-B[D3-D4][D16]
                           }
                           if(B[D3-D4+D15][D16]<B[D3-D6+D15][D16]-D17){
                              D15=D6;D16=D2;D4=D3;D5=D2
                           }else if(B[D3-D6+D15][D16]-D17<B[D3-D4+D15][D16]){
                              D15=D6;D16=D2
                           }
                        }
                     }
                  }
               }else{
                  D5=D2
               }
            }
         }
         for(var D18=0;D18<=D2;++D18){
            if(D18===D19){
               C[D18]=B[D3][D18]-B[D3-D6][D18]-1
            }else if(0<B[D3][D18]){
               C[D18]=B[D3][D18]-B[D3-D6][D18]
            }
         }
         var result = B.slice(0,D3).map(col=>col.slice())
         for(var D23=1;D23<=A*D6;++D23){
            if(!result[D3]) result[D3]=[]
            if(!B2[D3]) B2[D3]=[]
            for(var D20=0;D20<=D2;++D20){
               if(0<B2[D3-D6][D20] && (0<result[D3-D6][D20] || B2[D3-D6][D20]===D7)){
                  result[D3][D20]=result[D3-D6][D20]+C[D20]
               }else{
                  result[D3][D20]=result[D3-D6][D20]
               }
               B2[D3][D20]=B2[D3-D6][D20]
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