# CSV 1.0
niko 2018

small (3k) CSV read/writer in vanilla flavor of javascript.

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