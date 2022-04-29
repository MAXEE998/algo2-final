import React from 'react';
import '../styles/main.scss';

import Grid from "./Grid";

class App extends React.Component<any, any>{
    render(){
        return (
            <div>
                <nav className={"header"}>
                    <h2>Skip Lists by <a href={"https://jessetuglu.com/skiplist/"}>Cole Dumas and Jesse Tuglu</a>,</h2>
                    <h2>Improved and extended by Hongyi Li and Tarun Ramesh Kumar</h2>
                </nav>
                <Grid/>
            </div>
        )
    }
}

export default App;