;register.push({
   id:'bhhm'
   ,name:'Bashicu hyper huge matrix'//超巨大行列数 at 2024/2/8
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
         ,D6=0,D7=0,D16=0
         for(var D4=0;D4<=D3;++D4){
            for(var D5=0;D5<=D2;++D5){
               if(B[D3-D4][D5]<B[D3][D5]-C[D5] || !B[D3][0]){
                  if(!B[D3][0]){
                     D4=D3;D5=D2;D6=0
                  }else if(!B[D3][D5+1]){
                     if(!D6) D6=D4
                     ;++D7
                     C2[D7]=D4
                     for(var D8=0;D8<=D2;++D8){
                        B2[D3-D4][D8]=D7
                     }
                     for(var D9=0;D9<=D5;++D9){
                        for(var D10=D3-D4;D10<=D3-1;++D10){
                           for(var D11=D10;D11>=D3-D4;--D11){
                              for(var D12=0;D12<=D9;++D12){
                                 if(B[D11][D12]<B[D10][D12]-C3[D12]){
                                    if(D9===D12){
                                       if(0<B2[D11][D9] && !B2[D10][D9]) B2[D10][D9]=D7
                                       D11=D3-D4
                                    }else{
                                       C3[D12]=B[D10][D12]-B[D11][D12]
                                    }
                                 }else{
                                    D12=D9
                                 }
                              }
                           }
                           for(var D13=0;D13<=D5;++D13){
                              C3[D13]=0
                           }
                        }
                     }
                     for(var D14=0;D14<=D6;++D14){
                        for(var D15=0;D15<=D2;++D15){
                           D16=0
                           if(0<B2[D3-D6+D14][D15]){
                              if(D15<D5) D16=B[D3-C2[B2[D3-D6+D14][D15]]][D15]-B[D3-D4][D15]
                           }
                           if(B[D3-D4+D14][D15]<B[D3-D6+D14][D15]-D16){
                              D14=D6;D15=D2;D4=D3
                           }else if(B[D3-D6+D14][D15]-D16<B[D3-D4+D14][D15]){
                              D14=D6;D15=D2
                           }
                        }
                     }
                  }else{
                     C[D5]=B[D3][D5]-B[D3-D4][D5]
                  }
               }else{
                  D5=D2
               }
            }
         }
         for(var D17=0;D17<=D2;++D17){
            if(0<B[D3][D17+1]) C[D17]=B[D3][D17]-B[D3-D6][D17]
         }
         var result = B.slice(0,D3).map(col=>col.slice())
         for(var D18=1;D18<=A*D6;++D18){
            if(!result[D3]) result[D3]=[]
            if(!B2[D3]) B2[D3]=[]
            for(var D19=0;D19<=D2;++D19){
               if(0<B2[D3-D6][D19]){
                  result[D3][D19]=result[D3-D6][D19]+C[D19]
               }else{
                  result[D3][D19]=result[D3-D6][D19]
               }
               B2[D3][D19]=B2[D3-D6][D19]
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