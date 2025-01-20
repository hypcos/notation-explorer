let ingrown_compare = (seq1,seq2)=>{
   if(seq1.length===0){
      if(seq2.length===0) return 0
      else return -1
   }else{
      if(seq2.length===0) return 1
      else{
        if(seq1[0][0] < seq2[0][0]) {
            let seq3 = [];
            let diff = seq2[0][0] - seq1[0][0];
            for(let i = 0; i < seq2.length; i++) {
                seq3.push([]);
                for(let j = 0; j < seq2[i].length; j++) {
                    if(seq2[i][j] > diff) {
                        seq3[i].push(seq2[i][j] - diff);
                    } else {
                        seq3[i].push(0);
                    }
                }
            }
            seq2 = seq3;
        }
         for(let i = 0; i < Math.max(seq1[0].length,seq2[0].length); i++)
         {
             if(!seq1[0][i] && !seq2[0][i]) break;
             else if(!seq1[0][i] && seq2[0][i]) return -1;
             else if(seq1[0][i] && !seq2[0][i]) return 1;
             else if(seq1[0][i]<seq2[0][i]) return -1;
             else if(seq1[0][i]>seq2[0][i]) return 1;
         }
         return ingrown_compare(seq1.slice(1),seq2.slice(1))
      }
   }
};

let ingrownSvg = (seq) => {
    
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    var path1 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    var path2 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    
    svg.setAttribute("aria-hidden","true");
    
    
    var svgElements = subSvg(seq,0,0,0,[]).svgElements;
    
    for(let i in svgElements) {
        svg.appendChild(svgElements[i]);
    }
    document.body.appendChild(svg);
    
    let bbox = svg.getBBox({stroke:true});

    svg.remove();
    
    // Set the viewport with these bounds
    svg.setAttribute("viewBox", `${bbox.x-10} ${bbox.y-10} ${bbox.width+20} ${bbox.height+20}`);
    svg.setAttribute('width', `${bbox.width+10}`);
    svg.setAttribute('height', `${bbox.height+10}`);
    
    return svg.outerHTML;
}

let subSvg = (seq,num,x,y,prev,toggleWidth) => {
    if(seq.length == 0) {
        return {width: 20, svgElements: []};
    }
    let totalWidth = 0;
    let result = [];
    for(let i = seq.length-1; i >= 0; i--) {
        if(seq[i][0] == num) {
            let svgElement = document.createElementNS("http://www.w3.org/2000/svg","circle");
            if(seq[i][1] && seq[i][1] > 0 && totalWidth == 0) {
                if(!toggleWidth) {
                    totalWidth = 20;
                }
                toggleWidth = !toggleWidth;
            } else {
                toggleWidth = false;
            }
            svgElement.className.baseVal = "node";
            svgElement.cx.baseVal.value = x+totalWidth;
            svgElement.cy.baseVal.value = y;
            svgElement.r.baseVal.value = 5;
            svgElement.style.fill = 'rgb(0,0,0)';
            result.push(svgElement);
            for(let j = 0; j < seq[i].length; j++) {
                if(seq[i][j] > 0) {
                    let svgElement2 = document.createElementNS("http://www.w3.org/2000/svg","line");
                    svgElement2.className.baseVal = "segment";
                    svgElement2.x1.baseVal.value = prev[seq[i][j]-1][0];
                    svgElement2.y1.baseVal.value = prev[seq[i][j]-1][1];
                    svgElement2.x2.baseVal.value = x+totalWidth;
                    svgElement2.y2.baseVal.value = y;
                    svgElement2.style.stroke = 'rgb(0,0,0)';
                    svgElement2.style["stroke-width"] = '1.2px';
                    svgElement2.style["stroke-linecap"] = 'round';
                    svgElement2.style["stroke-linejoin"] = 'round';
                    result.push(svgElement2);
                } else {
                    break;
                }
            }
            let sub = subSvg(getSubtree(seq,i),num+1,x+totalWidth,y-40/(num+1),prev.concat([[x+totalWidth,y]]),toggleWidth);
            result = result.concat(sub.svgElements);
            totalWidth += sub.width;
        }
    }
    return {width: totalWidth, svgElements: result};
}

let getSubtree = (seq, i) => {
    let j = i+1;
    for(j; j < seq.length; j++) {
        if(seq[j][0] <= seq[i][0]) {
            break;
        }
    }
    return seq.slice(i+1,j);
}

let getSubtree2 = (seq, i) => {
    let j = i+1;
    for(j; j < seq.length; j++) {
        if(seq[j][0] <= seq[i][0]) {
            break;
        }
    }
    return seq.slice(i,j);
}

let ingrown_display = expr=>''+expr==='Infinity'?'Limit': ingrownSvg(expr)+expr.map(col => col.toString().split(',0')[0]).join(' ');
let ingrown_display2 = expr=>''+expr==='Infinity'?'Limit': expr.map(col => col.toString().split(',0')[0]).join(' ');
let ingrown_limit = seq=>seq.length>0&&seq[seq.length-1][0]>0;

{
    let lim = (FSterm)=>{
        if(FSterm == 0)
        {
            return [[0]];
        }
        else
        {
            let arr = [];
            for(let i = FSterm; i >= 0; i--)
            {
                arr.push(i);
            }
            return lim(FSterm-1).concat([arr]);
        }
    };
    let ingrown = (seq,FSterm)=>{
        let seq2 = seq.slice(0,seq.length-1);
        if(FSterm === 0)
        {
            return seq2;
        }
        if(seq[seq.length-1][1]===0)
        {
            let index = seq.findLastIndex((x) => x[0] === seq[seq.length-1][0]-1);
            return ingrown(seq,FSterm-1).concat(seq2.slice(index));
        }
        else
        {
            let subindex = seq[seq.length-1].findLastIndex((x) => x !== 0);
            let diffTotal = seq[seq.length-1][subindex] + subindex - 1;
            let index = seq.findLastIndex((x) => x[0] === diffTotal - 1);
            let index2 = seq.findLastIndex((x) => x[0] === diffTotal);
            if(ingrown_compare(getSubtree2(seq,index),getSubtree2(seq,index2)) === -1) {
                index = index2-1;
            }
            let repeat = seq2.slice(index);
            repeat.shift();
            return ingrown(seq,FSterm-1).concat(increment(repeat,FSterm,seq[seq.length-1][0] - diffTotal,seq[seq.length-1]));
        }
    };
    let increment = (seq,FSterm,add,last)=>{
        return seq.map(x => x.map(y => increment2(y,FSterm,add,last)));
    }
    let increment2 = (num,FSterm,add,last)=>{
        for(let i = 0; i < FSterm; i++)
        {
            if (num < last.findLast((x) => x !== 0)) {
                break;
            }
            if(last.indexOf(num) > 0 && num > 0 && num < last[0] - add) {
                num = last[last.indexOf(num)-1];
            } else if (num < last[0] - add) {
                let diff = num - last.find((z) => z < num);
                num = last.findLast((z) => z > num) + diff;
            } else {
                num = num + add;
            }
        }
        return num;
    }
register.push({
   id:'ingrown',
   name:'Ingrown hydra',
   display:ingrown_display,
   able:ingrown_limit,
   compare:ingrown_compare,
   FS:(()=>{
      var data={};
      return (seq,FSterm)=>{
        if(!seq.length) return []
        var datakey=''+seq;
        if(datakey==='Infinity') return lim(FSterm);
        if(seq[seq.length-1][0]===0) return seq.slice(0,seq.length-1);
        if(!data[datakey]) data[datakey] = [];
        else if(data[datakey][FSterm]!==undefined) return data[datakey][FSterm];
        return data[datakey][FSterm] = ingrown(seq,FSterm);
      };
   })(),
   init:()=>([
      {expr:[[[Infinity]]],low:[[]],subitems:[]}
      ,{expr:[],low:[[]],subitems:[]}
   ])
})
}