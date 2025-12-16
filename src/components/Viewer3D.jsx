import React, { Suspense, useEffect, useState } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Grid, Environment, Center } from '@react-three/drei';
import Loader from './Loader';
import useUrdfStore from '../store/urdfStore';
import URDFLoader from 'urdf-loader';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

// Configure URDFLoader to use STLLoader
URDFLoader.prototype.loadMeshCb = function (path, ext, done) {
    if (ext === 'stl') {
        new STLLoader().load(path, done);
    } else {
        // Fallback or other loaders
        console.warn('Unknown mesh extension', ext);
        done(null);
    }
};

function Model({ xml }) {
    const [blobUrl, setBlobUrl] = useState(null);
    const [model, setModel] = useState(null);

    useEffect(() => {
        const blob = new Blob([xml], { type: 'text/xml' });
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [xml]);

    useEffect(() => {
        if (!blobUrl) return;
        const loader = new URDFLoader();
        loader.load(
            blobUrl,
            (result) => {
                console.log("URDF Loaded successfully", result);
                result.rotation.x = -Math.PI / 2;
                setModel(result);
            },
            (progress) => { },
            (error) => {
                console.error("Failed to load URDF", error);
            }
        );
    }, [blobUrl]);

    if (!model) return null;
    return <primitive object={model} />;
}


function SceneContent() {
    const urdfXml = useUrdfStore(state => state.getUrdfXml());
    const urdf = useUrdfStore(state => state.urdf);
    const [xml, setXml] = useState('');

    useEffect(() => {
        const generated = useUrdfStore.getState().getUrdfXml();
        setXml(generated);
    }, [urdf]);

    return (
        <>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <Grid infiniteGrid fadeDistance={50} sectionColor="#4a4a4a" cellColor="#2a2a2a" />
            <OrbitControls makeDefault />
            <Environment preset="city" />
            <Center>
                <Model xml={xml} />
            </Center>
        </>
    );
}

export default function Viewer3D() {
    return (
        <div style={{ width: '100%', height: '100%' }}>
            <Canvas camera={{ position: [2, 2, 2], fov: 50 }}>
                <Suspense fallback={<Loader />}>
                    <SceneContent />
                </Suspense>
            </Canvas>
        </div>
    );
}
