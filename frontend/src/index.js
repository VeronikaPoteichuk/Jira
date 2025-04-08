import React from "react";
import { createRoot } from "react-dom/client";

const App = () => <h1>Hello World from React!</h1>;

const root = createRoot(document.getElementById("root"));
root.render(<App />);


// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// function HelloWorld() {
//   const [message, setMessage] = useState('');

//   useEffect(() => {
//     axios.get('http://localhost:8001')
//       .then(response => {
//         setMessage(response.data.message);
//       })
//       .catch(error => {
//         console.log(error);
//       });
//   }, []);

//   return (
//     <div>
//       <h1>Hello, World!</h1>
//       <p>{message}</p>
//     </div>
//   );
// }

// export default HelloWorld;
