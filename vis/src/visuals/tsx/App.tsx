import React from 'react';
import '../styles/main.scss';

import Grid from "./Grid";

const App = () => {
    const [display, setDisplay] = React.useState<boolean>(true);
    const handleClick = () => {
        setDisplay(false);
    }

    return (
        <div>
            <nav className={"header"}>
                <h1>Skip Lists Visualization</h1>
            </nav>
            <Grid/>
            <div className={"welcome"} style={display ? {} : {
                opacity: 0,
                userSelect: 'none',
                pointerEvents: 'none',
            }} onClick={handleClick}>
                <div className={"mask"}></div>

                <h1>Welcome to our Skip List Visualization!</h1>
                <br/>
                <p>Hi! We are Hongyi and Tarun. We are graduate students at NYU Tandon. This is our course project for
                    CS-GY 6043 Design and Analysis of Algorithm II taught by Professor Greg Aloupis. </p>
                <p>This skip list visualization is based on <a href="https://jessetuglu.com/skiplist/">Cole Dumas and
                    Jesse Tuglu’s project</a>. We make the following improvements and extensions to their works:</p>
                <ol>
                    <li>We improved user control by allowing the user to step the animations.</li>
                    <li>We implemented the visualization for insertion and deletion so user can modify the data
                        structure to better understand how the data structure evolves as data are added and removed.
                    </li>
                </ol>
                <br/>
                <h2><em>Now, you can start by clicking anywhere on the screen!</em></h2>


            </div>
        </div>
    )
}

export default App;