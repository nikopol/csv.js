//CSV 1.0 reader/writer
//niko 2018 - https://github.com/nikopol/csv.js

/*
# CSV

minimalist CSV read/writer in javascript without dependancies.

## reference

### `CSV.read(raw[,sep[,eol]])`

| parameter | default value | purpose                           |
|-----------|---------------|-----------------------------------|
| `raw`     |               | a string with the raw encoded csv |
| `sep`     | ;             | columns separator                 |
| `eol`     | \n            | rows separator                    |

return: rows array of columns arrays


### `CSV.readObjects(raw[,sep[,eol[,columns]]])`

| parameter | default value    | purpose                           |
|-----------|------------------|-----------------------------------|
| `raw`     |                  | a string with the raw encoded csv |
| `sep`     | ;                | columns separator                 |
| `eol`     | \n               | rows separator                    |
| `columns` | null (first row) | define columns names              |

return: rows array of columns objects


### `CSV.write(rows[,sep[,eol]])`

| parameter | default value    | purpose                             |
|-----------|------------------|-------------------------------------|
| `rows`    |                  | array of arrays, objects, or scalar |
| `sep`     | ;                | columns separator                   |
| `eol`     | \n               | rows separator                      |

return: string of the encoded csv


## sample usage

```javascript
//read as array of arrays
CSV.read("a;b\n1;2\n11;22")                      //=> [["a","b"],[1,2],[11,22]]

//read as array of objects using the first row columns names
CSV.readObjects("a;b\n1;2\n11;22")               //=> [{a:1,b:2},{a:11,b:22}]

//read as array of objects giving columns names
CSV.readObjects("1;2\n11;22",";","\n",["a","b"]) //=> [{a:1,b:2},{a:11,b:22}]

//write array of arrays
CSV.write([["a","b"],[1,2],[11,22]])             //=> "a;b\n1;2\n11;22\n"

//write as array of objects
CSV.write([{a:1,b:2},{a:11,b:22}])               //=> "a;b\n1;2\n11;22\n"

//write as array of scalars
CSV.write([1,2,3])                               //=> "1\n2\n3\n"
```
*/



const CSV = (() => {
  "use strict";

  function isNum(v){
    return typeof(v) === 'number' || (typeof(v) === 'string' && /^\d+(\.\d+)?$/.test(v));
  }

  function decode(v){
    const len = typeof(v) === 'string' ? v.length : 0;
    if( len ){
      if( v[0] === '"' && v[len-1] === '"' )
        v = v.substr(1,len-2).replace(/""/g,'"');
      else {
        v = v.replace(/^\s+|\s+$/g,'').replace(/""/g,'"');
        if( isNum(v) ) v = parseFloat(v);
      }
    }
    return v;
  }

  function encodeFn(sep, eol){
    return v => {
      let s = '';
      if( typeof(v) === 'string' )
        s = isNum(v) || (v.indexOf('"')===-1 && v.indexOf(sep)===-1 && v.indexOf(eol)===-1)
          ? v
          : '"' + v.replace(/"/g, '""') + '"';
      else if( v!==undefined && v!==null )
        s = v.toString();
      return s;
    }
  };

  function uqfind(raw, pos, end, f){
    let quoted = false;
    while( pos<end ){
      const c = raw[pos];
      if( c === '"' ) {
        if( pos+1<end && raw[pos+1] === '"' )
          pos++;
        else
          quoted = !quoted;
      } else if ( !quoted && c === f )
        return pos;
      pos++;
    }
    return null;
  }

  function read(raw, sep = ";", eol = "\n"){
    let pos = 0, rows = [];
    if( raw ){
      const end = raw.length;
      while( pos<end ) {
        const row = [],
              rowend = uqfind(raw, pos, end, eol) || end;
        while( pos<rowend ) {
          const colend = uqfind(raw, pos, rowend, sep) || rowend;
          if( colend>pos ) row.push(decode(raw.substr(pos, colend-pos)));
          pos = colend+1;
        }
        rows.push(row);
        pos = rowend+1;
      }
    }
    return rows;
  };

  return {
    //read a raw csv and return a rows array of columns arrays
    //note: eol *must* be a single character (but \n works for \r\n)
    read: read,

    //read a raw csv and return a rows array of objects
    //if column names are not provided, first row is used
    readObjects: (raw, sep = ";", eol = "\n", columns = null) => {
      var rows = read(raw, sep, eol);
      if( !columns ) columns = rows.shift();
      return rows.map(row => row.reduce((o, val, idx) => {
        o[columns[idx] || 'col'+idx] = val;
        return o;
      }, {}));
    },

    //write a csv as string
    //support rows array of columns arrays,
    //or rows array of objects,
    //or rows array of a scalars column
    write: (rows, sep = ";", eol = "\r\n") => {
      const encode = encodeFn(sep, eol);
      let buf = '';
      if( rows && rows.length ) {
        if( rows[0] instanceof Array )
          buf = rows.map(row => row.map(encode).join(sep)).join(eol) + eol;
        else if( typeof(rows[0]) === 'object' ){
          let columns = Object.keys(rows[0]);
          buf = columns.map(encode).join(sep) + eol +
                rows.map(row => columns.map(col => encode(row[col])).join(sep)).join(eol) + eol;
        } else
          buf = rows.map(encode).join(eol) + eol;
      }
      return buf;
    }
  };
})();