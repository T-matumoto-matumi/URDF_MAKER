import React from 'react';
import Viewer3D from './components/Viewer3D';
import EditorPanel from './components/EditorPanel';
import styles from './App.module.css';

function App() {
    return (
        <div className={styles.container}>
            <div className={styles.sidebar}>
                <EditorPanel />
            </div>
            <div className={styles.main}>
                <Viewer3D />
            </div>
        </div>
    );
}

export default App;
