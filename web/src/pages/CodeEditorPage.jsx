import { useCallback, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { Button, Card } from 'antd';
import PageLayout from '../components/PageLayout.jsx';

// Seed content copied verbatim from the original code_editer.html practice
// snippets (Q1-Q25), all commented out so the editor starts empty-but-loaded.
const INITIAL_CODE = `// console.log("Hello world");
// alert("hello mithlesh")

// console.log("watching ");
// // Q2
// console.log(45*2 -10);

//Q3
// let dt = new Date().toISOString().split('T')[0];
// let d = new Date().getDate();
// let m = new Date().getMonth();
// let y = new Date().getFullYear();
// console.log(dt,y, d, m)

//Q4

// let stname= "mithlesh";
// let lname = "prasad";

// console.log(\`\${stname}\` + " " + \`\${lname}\`)
//Q 5
// var a = 20;

// console.log(a);

// a = 30;

// console.log(a);

//Q 6
// console.error("error");

//Q 7
// console.log(12* 12)

//Q8
// let a= 12;
// let str = "mithlesh";

// let b = true;

// console.log(typeof a);
// console.log(typeof str);
// console.log(typeof b)
// console.log(typeof CUTIE)


//Q9

// const age = 24;
//  if(age > 18) {

// console.log(age)
//  }

//Q10

// console.log(100/0)


//Q11

// let a= 12;

// console.log(a)


//Q12

// let pi = Math.PI;

// console.log(pi)


//Q13

// var a= 30;
// console.log(a)

// var a= 50;


// console.log(a)


//Q14

// let  a = true;

// console.log(typeof a);


//Q 15

// let str = "24";

// console.log(typeof str)

//Q 16
// let str = "mithlesh";

// let a= 12
// let  b= true;


// console.log(typeof str);
// console.log(typeof a);
// console.log(typeof b);


//Q18

// let b;

// console.log(b)

//Q 19

// let b ;
//  console.log(typeof b);

//Q 20
//  let a= undefined;

//  console.log(typeof a);

// const arr = [];

//  arr.push(12);

//  console.log(arr);

//  console.log(arr.length)

//Q 21

// let n = 12;

// for(let i =0 ; i< n; i++){
//     console.log(i);
// }

//Q 22

/*let  n = 1;
let sum = 0;

while(n < 11){
    sum += n;
    n++;
}
console.log(sum)*/


//Q 23

// let  str = " mithleshbaby";

// for(let ch of str){
//     console.log(ch)
// }


//Q 24
// let n= 20
// let lt = 0;
// for(let i = 1 ; i <= n ; i++){
//     if(i % 2 == 0){
//         console.log(i)
//         lt += i
//     }
// }
// console.log(lt)

//Q 25

// let arr = [12,23,24,34,15,28,56,18];

// console.log(arr)
// arr.push(27)
// console.log(arr)
// console.log(arr.indexOf(24));
// arr.pop()
// console.log(arr)

// arr.unshift(8)
// console.log(arr)

// arr.shift();
// console.log(arr)


//  arr.forEach((item) => console.log(item) );

// const newarr = arr.map((arr1) => arr1 * 2);
// console.log(newarr)

// const filterarr = arr.filter((arr1) => arr1 % 2 == 0)
// console.log(filterarr)

// const reducerarr = arr.reduce((a, b ) =>  a + b , 0)
// console.log(reducerarr)

// const somearr = arr.some((arr1) => arr1 % 2 == 0);

// console.log(somearr)
// const everyarr = arr.every((arr1) => arr1 % 2 == 0);
// console.log(everyarr)

// const foundarr = arr.find((arr1)=> arr1> 12)

// console.log(foundarr)


// const indexarr = arr.findIndex((arr1) => arr > 12)
// console.log(indexarr)

//  const reversearr = arr.reverse();
//  console.log(reversearr)

//  const shortarr = arr.sort();

//  console.log(shortarr)
//  const arr123  = [1,2,4,[5,6,7],[8,9,20]]
//  const flatarr = arr123.flat();

//  console.log(flatarr)

//  const includearr = arr.includes(18)
//  console.log(includearr)
//   const includesarr = arr.includes(26);
//   console.log(includesarr)

// const arr1 = [1,2,3,4];
// const arr2 = [5,6,7]
// const concatarr = arr1.concat(arr2);
// console.log(concatarr)

// const joinarr = arr.join('-')
// console.log(joinarr)
// console.log(arr.length)
`;

export default function CodeEditorPage() {
  const [code, setCode] = useState(INITIAL_CODE);
  const [output, setOutput] = useState('');
  // null = not run yet, 'success' = ran without throwing, 'error' = threw
  const [status, setStatus] = useState(null);

  const handleRun = useCallback(() => {
    let captured = '';

    // Override console.log to capture output, same as the original, while
    // still forwarding to the real console.log.
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      captured += args.join(' ') + '\n';
      originalConsoleLog.apply(console, args);
    };

    try {
      // This is a self-contained, in-browser scratchpad: the user runs their
      // own code in their own tab, so eval() here is acceptable.
      // eslint-disable-next-line no-eval
      eval(code);
      setOutput(captured);
      setStatus('success');
    } catch (error) {
      setOutput('Error: ' + error.message);
      setStatus('error');
    } finally {
      console.log = originalConsoleLog;
    }
  }, [code]);

  const outputBackground =
    status === 'error' ? '#e74c3c' : status === 'success' ? '#2ecc71' : '#1e1e1e';
  const outputColor = status ? '#ffffff' : '#f1f1f1';

  return (
    <PageLayout
      title="Code Editor"
      subtitle="Write and run JavaScript directly in your browser."
      wide
    >
      <Card
        styles={{ body: { padding: 20 } }}
        style={{
          background: '#2e2e2e',
          borderColor: '#444',
        }}
      >
        <div
          style={{
            border: '1px solid #444',
            borderRadius: 5,
            overflow: 'hidden',
          }}
        >
          <CodeMirror
            value={code}
            height="320px"
            theme={oneDark}
            extensions={[javascript()]}
            onChange={(value) => setCode(value)}
          />
        </div>

        <Button type="primary" onClick={handleRun} style={{ marginTop: 20 }}>
          Run Code
        </Button>

        <div
          style={{
            marginTop: 20,
            padding: 20,
            borderRadius: 5,
            border: '1px solid #444',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            minHeight: 200,
            maxHeight: 300,
            overflowY: 'auto',
            fontFamily: "'Courier New', monospace",
            backgroundColor: outputBackground,
            color: outputColor,
            transition: 'background-color 0.2s ease',
          }}
        >
          {output || 'Output will appear here after you run your code.'}
        </div>
      </Card>
    </PageLayout>
  );
}
