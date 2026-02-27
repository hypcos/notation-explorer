let hydra_test_map = {
    ":": 2,
    "[": 1,
    "]": 0,
}

let hydra_test_compare = (seq1, seq2) => {
   if(seq1.length===0){
      if(seq2.length===0) return 0
      else return -1
   }else{
      if(seq2.length===0) return 1
      else{
          if (hydra_test_map[seq1[0]] === hydra_test_map[seq2[0]]) {
            return hydra_test_compare(seq1.slice(1),seq2.slice(1))
          }
          return Math.sign(hydra_test_map[seq1[0]] - hydra_test_map[seq2[0]]);
      }
   }
};

let matching_parenthesis_close = (str, index, open, close) => {
    let openIndex = index;
    let counter = 1;
    while (counter > 0 && openIndex >= 0) {
        openIndex--;
        let c = str[openIndex];
        if (c === close) {
            counter++;
        }
        if (c === open) {
            counter--;
        }
    }
    return openIndex;
}

{
    let lim = (FSterm)=>{
        if(FSterm == 0)
        {
            return "[[]]";
        }
        else
        {
            let result = "[[!]]";
            for(let i = 0; i < FSterm; i++)
            {
                result = result.replace("!", "[:!]");
            }
            return result.replace("!","");
        }
    };
    let hydra_test = (str, FSterm) => {
        let indexopen = str.lastIndexOf("[");
        let indexclose = indexopen + 1;
        if(str[indexclose] === "]") {
            let outerclose = indexopen + 2;
            let outeropen = matching_parenthesis_close(str, outerclose, "[", "]");
            let repeat = str.slice(outeropen, indexopen) + str.slice(indexclose + 1, outerclose + 1) + "!";
            let result = str.slice(0, outeropen) + "!" + str.slice(outerclose + 1);
            for (let i = 0; i < FSterm; i++) {
                result = result.replace("!", repeat);
            }
            return result.replace("!", "");
        } else if (str[indexclose] === ":") {
            let indexclose = indexopen + 2;
            let outerclose = indexopen + 3;
            let outeropen = matching_parenthesis_close(str, outerclose, "[", "]");
            let innerclose = indexclose;
            let inneropen = indexopen;
            let innerclose2 = innerclose;
            let inneropen2 = inneropen;
            let breakout = false;
            for (let i = 0; i < 3; i++) {
                while (hydra_test_compare(str.slice(inneropen, innerclose + 1), str.slice(outeropen, outerclose + 1)) <= 0) {
                    outerclose = outerclose + 1;
                    outeropen = matching_parenthesis_close(str, outerclose, "[", "]");
                    
                    if (outerclose >= str.length || (i > 3 && hydra_test_compare(str.slice(inneropen2, innerclose2 + 1), str.slice(outeropen, outerclose + 1)) > 0) || (hydra_test_compare("[[:]]", str.slice(outeropen, outerclose + 1)) > 0)) {
                        outerclose = outerclose - 1;
                        outeropen = outeropen + 1;
                        breakout = true;
                        break;
                    }
                }
                if (breakout) {
                    break;
                }
                innerclose = outerclose;
                inneropen = outeropen;
                if (i === 0) {
                    innerclose2 = innerclose;
                    inneropen2 = inneropen;
                }
            }
            if (!breakout) {
                indexclose = innerclose2;
                indexopen = inneropen2;
                outerclose = outerclose-1;
                outeropen = matching_parenthesis_close(str, outerclose, "[", "]");
            }
            let repeat = str.slice(outeropen, indexopen) + "!" + str.slice(indexclose + 1, outerclose + 1);
            let result = str.slice(0, outeropen) + "!" + str.slice(outerclose + 1);
            for (let i = 0; i < FSterm; i++) {
                result = result.replace("!", repeat);
            }
            return result.replace("!", "");
        }
    };
    let display = (str) => {
        for (let i = str.length - 1; i >= 0; i--) {
            if (str[i] == "]" && str[matching_parenthesis_close(str, i, "[", "]") + 1] == ":") {
                str = str.slice(0, i) + ">" + str.slice(i+1);
            }
        }
        return str.replaceAll("[:", "<");
    }
register.push({
   id:'hydra_test',
   name:'hydra_test',
   display:display,
   able:(x) => (x.length >= 2 && x[x.length-2]!=="["),
   compare:hydra_test_compare,
   FS:(()=>{
      var data={};
      return (seq,FSterm)=>{
        if(!seq.length) return ""
        var datakey=seq;
        if(datakey==='Limit') return lim(FSterm);
        if(seq[seq.length-2]==="[") return seq.substring(0,seq.length-2);
        if(!data[datakey]) data[datakey] = [];
        else if(data[datakey][FSterm]!==undefined) return data[datakey][FSterm];
        return data[datakey][FSterm] = hydra_test(seq,FSterm);
      };
   })(),
   init:()=>([
      {expr:"Limit",low:[""],subitems:[]}
      ,{expr:"",low:[""],subitems:[]}
   ])
})
}