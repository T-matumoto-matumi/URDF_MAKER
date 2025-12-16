import { create } from 'zustand';
import { generateURDF, parseURDF } from '../utils/urdfUtils';

const useUrdfStore = create((set, get) => ({
    urdf: {
        name: 'my_robot',
        links: [
            {
                name: 'base_link',
                visual: {
                    geometry: { type: 'box', size: '1 0.5 0.2' },
                    material: { name: 'silver', color: '0.75 0.75 0.75 1' },
                    origin: { xyz: '0 0 0', rpy: '0 0 0' }
                }
            }
        ],
        joints: [],
    },
    setUrdf: (urdf) => set({ urdf }),
    loadUrdfXml: (xmlString) => {
        const parsed = parseURDF(xmlString);
        if (parsed) set({ urdf: parsed });
    },
    getUrdfXml: () => {
        return generateURDF(get().urdf);
    },
    addLink: (link) => set((state) => ({
        urdf: { ...state.urdf, links: [...state.urdf.links, link] }
    })),
    updateLink: (index, newLink) => set((state) => {
        const newLinks = [...state.urdf.links];
        newLinks[index] = newLink;
        return { urdf: { ...state.urdf, links: newLinks } };
    }),
    removeLink: (index) => set((state) => {
        const newLinks = state.urdf.links.filter((_, i) => i !== index);
        return { urdf: { ...state.urdf, links: newLinks } };
    }),
    addJoint: (joint) => set((state) => ({
        urdf: { ...state.urdf, joints: [...state.urdf.joints, joint] }
    })),
    updateJoint: (index, newJoint) => set((state) => {
        const newJoints = [...state.urdf.joints];
        newJoints[index] = newJoint;
        return { urdf: { ...state.urdf, joints: newJoints } };
    }),
    removeJoint: (index) => set((state) => {
        const newJoints = state.urdf.joints.filter((_, i) => i !== index);
        return { urdf: { ...state.urdf, joints: newJoints } };
    }),
}));

export default useUrdfStore;
