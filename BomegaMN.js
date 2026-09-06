;(()=>{
   var temp_id=0
   ,clone = a=>JSON.parse(JSON.stringify(a))
   ,mountain_is_limit = m=>Array.isArray(m) && m.length>0 && m[m.length-1].length>0
   ,mountain_is_one = m=>Array.isArray(m) && m.length===1 && m[0].length===0
   ,mountain_display = m=>m.map(column=>'('+column.map(([v,sep])=>{
      if(Array.isArray(sep) && sep.every(column=>!column.length)) return ','.repeat(sep.length)+v
      return mountain_display(sep)+v
   }).join('')+')').join('')
   ,path_key = p=>p.join('/')

   // Copy a matrix and shift every value satisfying cmp(value,threshold) by d.
   ,shift_matrix = (m,threshold,d,strict)=>m.map(column=>column.map(([v,sep])=>[
      (strict ? v>threshold : v>=threshold) ? v+d : v
      ,shift_matrix(sep,threshold,d,strict)
   ]))
   ,shift_gt = (m,threshold,d)=>shift_matrix(m,threshold,d,true)
   ,shift_ge = (m,threshold,d)=>shift_matrix(m,threshold,d,false)
   // Used only by FS (shorter=true), after all extension rounds and after
   // deleting the final column.  Some deletions can leave an element with the
   // empty matrix [] as its separator; such an element should instead have the
   // successor separator () = [[]].
   ,reset_empty_separators = m=>{
      for(var i=0;i<m.length;++i){
         for(var j=0;j<m[i].length;++j){
            if(m[i][j][1].length===0) m[i][j][1]=[[]]
            else reset_empty_separators(m[i][j][1])
         }
      }
      return m
   }

   // A context gives every (possibly nested) column its BωMN column label and its
   // unique predecessor (the column whose label is smaller by 1).
   //
   // Important: row labels are NOT computed here.  In BωMN a row comparison
   // eventually calls separator_compare, and separator_compare depends on the
   // two separators' source columns.  Therefore rows must be obtained only at
   // the moment a concrete row comparison is needed.  Each column keeps only a
   // lazy cache; build_context itself just records the tree/branch structure.
   ,build_context = (root,firstPrev=null,basePath=null)=>{
      var ctx={columns:[],matrixMap:new Map(),pathMap:new Map(),entryMap:new Map(),rootMctx:null}
      if(!basePath) basePath=[]
      var build_matrix = (matrix,prev,path,ownerSep=null)=>{
         var mctx={matrix:matrix,columns:[],path:path,pathKey:path_key(path),ownerSep:ownerSep}
         ctx.matrixMap.set(matrix,mctx)
         for(var i=0;i<matrix.length;++i){
            var p = path.concat([i])
            var cprev = i ? mctx.columns[i-1] : prev
            var col={
               matrix:matrix,index:i,column:matrix[i],prev:cprev
               ,label:cprev ? cprev.label+1 : 1
               ,entries:[],rowCache:[[]],path:p,pathKey:path_key(p),mctx:mctx
               ,firstOf:i===0 ? ownerSep : null
            }
            mctx.columns.push(col)
            ctx.columns.push(col)
            ctx.pathMap.set(col.pathKey,col)
         }
         for(var i=0;i<mctx.columns.length;++i){
            var col=mctx.columns[i]
            for(var j=0;j<col.column.length;++j){
               var entry=col.column[j]
               var loc={col:col,index:j,entry:entry,path:col.path.concat(['e',j]),pathKey:path_key(col.path.concat(['e',j]))}
               var sepRef={matrix:entry[1],element:loc,mctx:null}
               loc.sepRef=sepRef
               col.entries[j]=loc
               ctx.entryMap.set(loc.pathKey,loc)
               sepRef.mctx = build_matrix(entry[1],col,loc.path.concat(['s']),sepRef)
            }
         }
         return mctx
      }
      ctx.rootMctx = build_matrix(root,firstPrev,basePath)
      return ctx
   }
   ,make_temp_ref = (matrix,sourceCol)=>{
      var m=clone(matrix)
      var ctx=build_context(m,sourceCol,['tmp',++temp_id])
      return {matrix:m,element:{col:sourceCol},mctx:ctx.rootMctx}
   }
   ,same_column = (a,b)=> a===b || (a&&b&&a.pathKey===b.pathKey)
   ,common_label = (a,b)=>{
      var objs=new Set(), paths=new Map(), c=a
      while(c){ objs.add(c); paths.set(c.pathKey,c.label); c=c.prev }
      c=b
      while(c){
         if(objs.has(c)) return c.label
         if(paths.has(c.pathKey)) return paths.get(c.pathKey)
         c=c.prev
      }
      return 0
   }
   ,matrix_context_compare = (ma,mb)=>{
      var i=0,c
      while(true){
         if(i>=ma.columns.length){
            if(i>=mb.columns.length) return 0
            return -1
         }
         if(i>=mb.columns.length) return 1
         c = column_compare(ma.columns[i],mb.columns[i])
         if(c) return c
         ++i
      }
   }
   ,column_compare = (a,b)=>{
      var i=0,c
      while(true){
         if(i>=a.entries.length){
            if(i>=b.entries.length) return 0
            return -1
         }
         if(i>=b.entries.length) return 1
         c = entry_compare(a.entries[i],b.entries[i])
         if(c) return c
         ++i
      }
   }
   ,entry_compare = (a,b)=>{
      if(a.entry[0]<b.entry[0]) return -1
      if(a.entry[0]>b.entry[0]) return 1
      return separator_compare(a.sepRef,b.sepRef)
   }
   ,separator_compare = (a,b)=>{
      if(a===b) return 0
      var ca=a.element.col, cb=b.element.col
      var m=ca.label, n=cb.label
      if(m===n) return matrix_context_compare(a.mctx,b.mctx)
      if(m<n){
         var k=common_label(ca,cb)
         var shifted=shift_gt(a.matrix,k,n-m)
         var ref=make_temp_ref(shifted,cb)
         return matrix_context_compare(ref.mctx,b.mctx)
      }else{
         var k=common_label(cb,ca)
         var shifted=shift_gt(b.matrix,k,m-n)
         var ref=make_temp_ref(shifted,ca)
         return -matrix_context_compare(ref.mctx,a.mctx)
      }
   }
   ,vertical_compare = (a,b)=>{
      var i=0,c
      while(true){
         if(i>=a.length){
            if(i>=b.length) return 0
            return -1
         }
         if(i>=b.length) return 1
         c = separator_compare(a[i],b[i])
         if(c) return c
         ++i
      }
   }
   ,vertical_increase = (v,sep)=>{
      var i=v.length-1
      while(i>=0 && separator_compare(v[i],sep)<0) --i
      return v.slice(0,i+1).concat([sep])
   }
   // Lazily obtain the row label of the `row`-th row of a column.
   // row = 0 is the implicit bottom element.  row = j+1 is the row of
   // column[j].  The cache is filled only as far as demanded by callers such
   // as find_index_below_row / get_references / decrease.
   ,row_label = (col,row)=>{
      if(row<=0) return []
      if(row>col.entries.length) row=col.entries.length
      while(col.rowCache.length<=row){
         var i=col.rowCache.length
         col.rowCache[i]=vertical_increase(col.rowCache[i-1],col.entries[i-1].sepRef)
      }
      return col.rowCache[row]
   }
   // A row reference postpones the actual row-label construction.  This is
   // used for rows such as the original top elements: the reference may be
   // created before reduction, but its separator list is not built until some
   // later comparison with a concrete column asks for it.
   ,row_ref = (col,row)=>({col:col,row:row,value:null})
   ,row_value = r=>{
      if(Array.isArray(r)) return r
      if(!r.value) r.value=row_label(r.col,r.row)
      return r.value
   }
   ,row_compare = (a,b)=>vertical_compare(row_value(a),row_value(b))
   ,find_index_below_row = (col,y)=>{
      var i1=0,i2=col.entries.length,i
      while(i1<i2){
         i=Math.ceil((i1+i2)/2)
         if(row_compare(row_ref(col,i),y)<0) i1=i
         else i2=i-1
      }
      return i1
   }
   ,find_row_equal = (col,y)=>{
      for(var i=0;i<=col.entries.length;++i)
         if(!row_compare(row_ref(col,i),y)) return i
      return -1
   }
   ,left_leg = loc=>{
      var target=loc.entry[0], col=loc.col
      while(col && col.label>target) col=col.prev
      if(!col || col.label!==target) return {col:loc.col,row:0}
      return {col:col,row:find_index_below_row(col,row_ref(loc.col,loc.index+1))}
   }
   ,parent_of_position = pos=>{
      var row=pos.row
      if(row>=pos.col.entries.length) row=pos.col.entries.length-1
      if(row<0) return {col:pos.col,row:0}
      return left_leg(pos.col.entries[row])
   }
   ,find_righttop_trace = ctx=>{
      var mctx=ctx.rootMctx
      if(!mctx.columns.length) return {righttop:null,limits:[]}
      var col=mctx.columns[mctx.columns.length-1]
      if(!col.entries.length) return {righttop:null,limits:[]}
      var loc=col.entries[col.entries.length-1]
      var limits=[]
      while(mountain_is_limit(loc.entry[1])){
         limits.push(loc)
         var smctx=loc.sepRef.mctx
         if(!smctx.columns.length) break
         var scol=smctx.columns[smctx.columns.length-1]
         if(!scol.entries.length) break
         loc=scol.entries[scol.entries.length-1]
      }
      return {righttop:loc,limits:limits}
   }
   ,find_righttop = ctx=>find_righttop_trace(ctx).righttop
   ,column_chain = (rootCol,rightCol)=>{
      var res=[], c=rightCol
      while(c){
         res.push(c)
         if(same_column(c,rootCol)) break
         c=c.prev
      }
      if(!c) return []
      return res.reverse()
   }
   ,get_references = (baseCol,rtops)=>{
      var refs=[], i=0
      for(var j=0;j<rtops.length;++j){
         while(i<=baseCol.entries.length && row_compare(row_ref(baseCol,i),rtops[j])<0) ++i
         refs[j]=i-1
      }
      return refs
   }
   ,relocate_separator = (matrix,sourceCol,targetCol)=>{
      var d=targetCol.label-sourceCol.label
      if(!d) return clone(matrix)
      var k=common_label(sourceCol,targetCol)
      return shift_gt(matrix,k,d)
   }
   ,compute_magma = (ctx,sourcePathKeys,rootPathKey,rootRow,rootLabel)=>{
      var rootCol=ctx.pathMap.get(rootPathKey), out=new Map()
      for(var s=0;s<sourcePathKeys.length;++s){
         var col=ctx.pathMap.get(sourcePathKeys[s]), arr=[]
         if(!col){ out.set(sourcePathKeys[s],arr); continue }
         for(var j=0;j<col.entries.length;++j){
            var working={col:col,row:j}, guard=0
            while(working.col && working.col.label>rootLabel && guard++<10000){
               working=parent_of_position(working)
            }
            arr[j]=(working.col===rootCol && working.row<=rootRow && !row_compare(row_ref(working.col,working.row),row_ref(col,j))) ? working.row : -1
         }
         out.set(sourcePathKeys[s],arr)
      }
      return out
   }
   ,copy_root_segment = (ctx,rootPathKey,rootRow,targetMatrix,baseIndex,rootLabel,offset)=>{
      var rootCol=ctx.pathMap.get(rootPathKey)
      if(!rootCol || !targetMatrix[baseIndex]) return
      var targetColumn=targetMatrix[baseIndex]
      var len=rootCol.entries.length
      for(var y=rootRow;y<len;++y){
         var entry=rootCol.column[y]
         targetColumn.push([
            entry[0] < rootLabel ? entry[0] : entry[0]+offset
            ,shift_ge(entry[1],rootLabel,offset)
         ])
      }
   }
   ,decrease = (A,righttopPathKey,rootPathKey,rootRow,reduced,value)=>{
      var guard=0
      while(guard++<10000){
         var ctx=build_context(A)
         var targetCol=ctx.pathMap.get(righttopPathKey)
         var rootCol=ctx.pathMap.get(rootPathKey)
         if(!targetCol || !rootCol) break
         var alpha=row_ref(rootCol,rootRow)
         var gamma=row_ref(targetCol,targetCol.entries.length)
         if(row_compare(alpha,gamma)>0){
            var r=find_row_equal(rootCol,gamma)
            if(r<0) r=find_index_below_row(rootCol,gamma)
            if(r>=rootCol.entries.length) break
            var B=rootCol.entries[r].sepRef
            targetCol.column.push([value,relocate_separator(B.matrix,B.element.col,targetCol)])
            continue
         }
         var redRef=make_temp_ref(reduced,targetCol)
         if(vertical_compare(vertical_increase(row_value(alpha),redRef),row_value(gamma))>0){
            targetCol.column.push([value,clone(reduced)])
            continue
         }
         break
      }
   }
   // Do exactly the BωMN decrement step on the current matrix, without doing
   // any subsequent copy.  The updated flow uses this for FSalter: after the n
   // extension rounds, do one more decrement instead of deleting the final
   // right-top column.
   ,decrement_current = A=>{
      var ctx=build_context(A)
      var rt=find_righttop(ctx)
      if(!rt) return A
      var root=left_leg(rt)
      var righttopPathKey=rt.col.pathKey
      var rootPathKey=root.col.pathKey
      var rootRow=root.row
      var value=rt.entry[0]
      var reduced=clone(rt.entry[1].slice(0,-1))
      rt.col.column.pop()
      if(reduced.length>0) decrease(A,righttopPathKey,rootPathKey,rootRow,reduced,value)
      return A
   }
   // BωMN version of the TωMN threshold.  Unlike TωMN, the candidate
   // separator A[n] cannot be expanded as a standalone matrix: its columns may
   // branch out of the separator and refer to columns in the ambient matrix.
   // Therefore the threshold is computed from the ambient expression itself:
   // for the outermost limit separator on the right-top trace, expand the whole
   // ambient matrix by n raw rounds, extract that same separator, and test
   //       low + sep[n] >= high + sep[n].
   // The returned value is used only as an initial FS-index offset:
   // expand(A,n) = expand_core(A,n+threshold(A),...), so the actual
   // A[large n with offset] expansion is not otherwise modified.
   ,threshold = (A0,shorter)=>{
      var ctx=build_context(A0)
      var trace=find_righttop_trace(ctx)
      if(!trace.limits.length) return 0
      var loc=trace.limits[0]
      var leg=left_leg(loc)
      var low=row_ref(leg.col,leg.row)
      var high=row_ref(loc.col,loc.index) // row directly below the limit-separator element
      var n=0,res,resCtx,resLoc,sep
      while(true){
         res=expand_core(A0,n,shorter)
         resCtx=build_context(res)
         resLoc=resCtx.entryMap.get(loc.pathKey)
         if(!resLoc) return n
         sep=resLoc.sepRef
         if(vertical_compare(
            vertical_increase(row_value(low),sep),
            vertical_increase(row_value(high),sep)
         )>=0) return n
         ++n
      }
   }
   ,expand = (A0,FSterm,shorter=false)=>expand_core(A0,FSterm+threshold(A0,shorter),shorter)
   ,expand_core = (A0,FSterm,shorter=false)=>{
      var A=clone(A0)
      var finalDeletePathKey=null
      var initCtx=build_context(A)
      var initRighttop=find_righttop(initCtx)
      if(initRighttop) finalDeletePathKey=initRighttop.col.pathKey

      var right_path_after = col=>path_key(col.path.slice(0,-1).concat([col.index+1]))
      var first_sep_path = loc=>path_key(loc.path.concat(['s',0]))
      var transform_value = (v,threshold,d)=> v < threshold ? v : v+d

      // Reference separators are copied recursively as matrices.  They do not
      // carry a frozen source-column identity, but they still must be copied
      // column-by-column and element-by-element.
      var copy_plain_matrix = (matrix,threshold,d)=>{
         var out=[]
         for(var i=0;i<matrix.length;++i){
            var col=[]
            out.push(col)
            for(var j=0;j<matrix[i].length;++j){
               var e=matrix[i][j]
               col.push([transform_value(e[0],threshold,d),copy_plain_matrix(e[1],threshold,d)])
            }
         }
         return out
      }

      for(var round=1;round<=FSterm;++round){
         // In the updated BωMN flow, these objects are re-determined at the
         // beginning of EVERY extension round, before the decrement.
         var preCtx=build_context(A)
         var preRighttop=find_righttop(preCtx)
         if(!preRighttop) break
         var righttopColPathKey=preRighttop.col.pathKey
         var righttopEntryPathKey=preRighttop.pathKey
         var preRootPos=left_leg(preRighttop)
         var rootColPathKey=preRootPos.col.pathKey
         var rootRow=preRootPos.row
         var rootLabel=preRootPos.col.label
         var rightLabel=preRighttop.col.label
         var width=rightLabel-rootLabel
         if(width<=0) break

         // Freeze the source part BEFORE decrement.  The copy part and magma
         // status belong to this pre-decrement state; only references are
         // determined after the decrement.
         var sourceTemplate=clone(A)
         var sourceCtx=build_context(sourceTemplate)
         var sourceRighttop=sourceCtx.entryMap.get(righttopEntryPathKey)
         var sourceRootCol=sourceCtx.pathMap.get(rootColPathKey)
         var sourceRightCol=sourceCtx.pathMap.get(righttopColPathKey)
         if(!sourceRighttop || !sourceRootCol || !sourceRightCol) break

         var topverticals=[]
         for(var r=1;r<=rootRow;++r) topverticals.push(row_ref(sourceRootCol,r))
         topverticals.push(row_ref(sourceRighttop.col,sourceRighttop.index+1))

         var chain=column_chain(sourceRootCol,sourceRightCol)
         if(!chain.length) break
         var sourcePathKeys=chain.slice(1).map(c=>c.pathKey)
         var chainSet=new Set(chain.map(c=>c.pathKey))
         var magmaAll=compute_magma(sourceCtx,sourceCtx.columns.map(c=>c.pathKey),rootColPathKey,rootRow,rootLabel)

         var value=sourceRighttop.entry[0]
         var sep=sourceRighttop.entry[1]
         var reduced=clone(sep.slice(0,-1))
         var offset=width

         // Decrement the CURRENT matrix after the pre-decrement data have been
         // frozen.
         var delCtx=build_context(A)
         var delCol=delCtx.pathMap.get(righttopColPathKey)
         if(!delCol || !delCol.column.length) break
         delCol.column.pop()
         if(reduced.length>0) decrease(A,righttopColPathKey,rootColPathKey,rootRow,reduced,value)

         // References are determined after the decrement, using the top rows
         // fixed before the decrement.
         var ctx=build_context(A)
         var baseCol=ctx.pathMap.get(righttopColPathKey)
         if(!baseCol) break
         var refs=get_references(baseCol,topverticals)
         refs[-1]=-1
         var baseSep0=[]
         for(var j=0;j<baseCol.entries.length;++j) baseSep0[j]=clone(baseCol.entries[j].entry[1])

         var targetColBySource=new Map([[rootColPathKey,righttopColPathKey]])
         var targetEntryBySource=new Map()

         var copy_source_matrix, copy_source_column_contents, push_source_entry_to

         push_source_entry_to = (targetColumn,targetColPath,srcLoc,valueOverride)=>{
            var e=srcLoc.entry
            var v = valueOverride===undefined ? transform_value(e[0],rootLabel,offset) : valueOverride
            var targetEntry=[v,[]]
            targetColumn.push(targetEntry)
            var targetEntryPath=targetColPath.concat(['e',targetColumn.length-1])
            targetEntryBySource.set(srcLoc.pathKey,path_key(targetEntryPath))
            copy_source_matrix(srcLoc.sepRef.mctx,targetEntry[1],targetEntryPath)
         }

         copy_source_column_contents = (srcCol,targetColumn,targetColPath)=>{
            var sourceMagmas=magmaAll.get(srcCol.pathKey) || []
            var dx=srcCol.label-rootLabel
            for(var y=0;y<srcCol.entries.length;++y){
               var srcLoc=srcCol.entries[y]
               var value2=srcLoc.entry[0]
               if(~sourceMagmas[y]){
                  var BRindex=sourceMagmas[y]
                  var start=(refs[BRindex-1]===undefined ? -1 : refs[BRindex-1])+1
                  var end=refs[BRindex]
                  for(var j=start;j<=end;++j){
                     if(j===end){
                        push_source_entry_to(targetColumn,targetColPath,srcLoc,value2+offset)
                     }else{
                        var sep2 = baseSep0[j] ? copy_plain_matrix(baseSep0[j],baseCol.label,dx) : copy_plain_matrix(srcLoc.entry[1],rootLabel,offset)
                        targetColumn.push([value2+offset,sep2])
                     }
                  }
               }else{
                  push_source_entry_to(targetColumn,targetColPath,srcLoc)
               }
            }
         }

         // Recursive BωMN separator-copy.  A separator's columns are copied by
         // the same column/element procedure.  If a separator column lies on the
         // frozen main copy branch, we create its target column here and let the
         // main source-column loop fill it later; otherwise we fill it now.
         copy_source_matrix = (srcMctx,targetMatrix,targetEntryPath)=>{
            if(!srcMctx) return
            for(var i=0;i<srcMctx.columns.length;++i){
               var srcCol=srcMctx.columns[i]
               var targetIndex=targetMatrix.length
               var targetColumn=[]
               targetMatrix.push(targetColumn)
               var targetColPath=targetEntryPath.concat(['s',targetIndex])
               var targetColPathKey=path_key(targetColPath)
               if(chainSet.has(srcCol.pathKey)){
                  targetColBySource.set(srcCol.pathKey,targetColPathKey)
                  continue
               }
               copy_source_column_contents(srcCol,targetColumn,targetColPath)
            }
         }

         var push_source_entry = (targetCol,srcLoc,valueOverride)=>
            push_source_entry_to(targetCol.column,targetCol.path,srcLoc,valueOverride)

         // Root-column elements above the root element also participate as
         // source elements in BωMN.
         ctx=build_context(A)
         baseCol=ctx.pathMap.get(righttopColPathKey)
         if(!baseCol) break
         for(var y=rootRow;y<sourceRootCol.entries.length;++y)
            push_source_entry(baseCol,sourceRootCol.entries[y])

         // Copy the pre-decrement copy part, from left to right, into the
         // current post-decrement matrix.
         for(var si=0;si<sourcePathKeys.length;++si){
            var srcCol=sourceCtx.pathMap.get(sourcePathKeys[si])
            var targetPath=targetColBySource.get(srcCol.pathKey)
            if(!targetPath){
               ctx=build_context(A)
               if(srcCol.index>0){
                  var prevTarget=ctx.pathMap.get(targetColBySource.get(srcCol.prev.pathKey))
                  if(!prevTarget) break
                  prevTarget.matrix.splice(prevTarget.index+1,0,[])
                  targetPath=right_path_after(prevTarget)
               }else if(srcCol.firstOf){
                  var ownerSrc=srcCol.firstOf.element
                  var ownerTarget=ctx.entryMap.get(targetEntryBySource.get(ownerSrc.pathKey))
                  if(!ownerTarget) break
                  ownerTarget.entry[1].splice(0,0,[])
                  targetPath=first_sep_path(ownerTarget)
               }else{
                  break
               }
               targetColBySource.set(srcCol.pathKey,targetPath)
            }

            ctx=build_context(A)
            var targetCol=ctx.pathMap.get(targetPath)
            if(!targetCol) break
            copy_source_column_contents(srcCol,targetCol.column,targetCol.path)
         }

         finalDeletePathKey=targetColBySource.get(righttopColPathKey) || righttopColPathKey
      }

      if(shorter && finalDeletePathKey){
         var finalCtx=build_context(A)
         var finalCol=finalCtx.pathMap.get(finalDeletePathKey)
         if(finalCol) finalCol.matrix.splice(finalCol.index,1)
         reset_empty_separators(A)
      }else if(!shorter){
         decrement_current(A)
      }
      return A
   }
   ,Main = n=>{
      if(n<=0) return [[]]
      var sep=[[]]
      for(var v=n;v>=2;--v) sep=[[[v,sep]]]
      return [[],[[1,sep]]]
   }
   ,top_compare = (a,b)=>{
      var ca=build_context(a), cb=build_context(b)
      return matrix_context_compare(ca.rootMctx,cb.rootMctx)
   }

   register.push({
      id:'b-omega-mn'
      ,name:'Branching ω mountain notation'
      ,display:expr=>''+expr==='Infinity'?'Limit':mountain_display(expr)
      ,able:mountain_is_limit
      ,compare:top_compare
      ,FS:(m,FSterm)=>{
         if(''+m==='Infinity') return Main(FSterm)
         if(m.length===0) return []
         return expand(m,FSterm,true)
      }
      ,FSalter:(m,FSterm)=>{
         if(''+m==='Infinity') return Main(FSterm)
         if(m.length===0) return []
         return expand(m,FSterm)
      }
      ,init:()=>([
         {expr:[[Infinity]],low:[[]],subitems:[]}
         ,{expr:[],low:[[]],subitems:[]}
      ])
   })
})()