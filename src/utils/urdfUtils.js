import { XMLParser, XMLBuilder } from 'fast-xml-parser';

export const generateURDF = (urdfState) => {
    const robot = {
        _attributes: { name: urdfState.name },
        link: urdfState.links.map(link => {
            const l = { _attributes: { name: link.name } };

            if (link.visual) {
                l.visual = {};
                if (link.visual.origin) {
                    l.visual.origin = { _attributes: { xyz: link.visual.origin.xyz, rpy: link.visual.origin.rpy } };
                }
                if (link.visual.geometry) {
                    l.visual.geometry = {};
                    if (link.visual.geometry.type === 'box') {
                        l.visual.geometry.box = { _attributes: { size: link.visual.geometry.size } };
                    } else if (link.visual.geometry.type === 'cylinder') {
                        l.visual.geometry.cylinder = { _attributes: { radius: link.visual.geometry.radius, length: link.visual.geometry.length } };
                    } else if (link.visual.geometry.type === 'sphere') {
                        l.visual.geometry.sphere = { _attributes: { radius: link.visual.geometry.radius } };
                    }
                }
                if (link.visual.material) {
                    l.visual.material = { _attributes: { name: link.visual.material.name } };
                    if (link.visual.material.color) {
                        l.visual.material.color = { _attributes: { rgba: link.visual.material.color } };
                    }
                }
            }
            return l;
        }),
        joint: urdfState.joints.map(joint => ({
            _attributes: { name: joint.name, type: joint.type },
            parent: { _attributes: { link: joint.parent } },
            child: { _attributes: { link: joint.child } },
            origin: joint.origin ? { _attributes: { xyz: joint.origin.xyz, rpy: joint.origin.rpy } } : undefined,
            axis: joint.axis ? { _attributes: { xyz: joint.axis } } : undefined,
            limit: joint.limit ? { _attributes: { lower: joint.limit.lower, upper: joint.limit.upper, effort: joint.limit.effort, velocity: joint.limit.velocity } } : undefined
        }))
    };

    const builder = new XMLBuilder({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
        format: true,
        suppressEmptyNode: true
    });

    // Remap structure to fast-xml-parser format
    const remapToFastXml = (obj) => {
        const newObj = {};
        if (obj === undefined || obj === null) return obj;
        if (obj._attributes) {
            Object.keys(obj._attributes).forEach(key => {
                newObj[`@_${key}`] = obj._attributes[key];
            });
        }
        Object.keys(obj).forEach(key => {
            if (key === '_attributes') return;
            if (Array.isArray(obj[key])) {
                newObj[key] = obj[key].map(remapToFastXml);
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                newObj[key] = remapToFastXml(obj[key]);
            } else {
                newObj[key] = obj[key];
            }
        });
        return newObj;
    };

    const xmlData = { robot: remapToFastXml(robot) };
    return builder.build(xmlData);
};

export const parseURDF = (xmlString) => {
    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_"
    });

    try {
        const result = parser.parse(xmlString);
        if (!result.robot) throw new Error('Invalid URDF: No robot tag found');

        const robot = result.robot;
        const links = Array.isArray(robot.link) ? robot.link : (robot.link ? [robot.link] : []);
        const joints = Array.isArray(robot.joint) ? robot.joint : (robot.joint ? [robot.joint] : []);

        const parsedLinks = links.map(l => {
            const link = { name: l['@_name'], visual: null };
            if (l.visual) {
                link.visual = { geometry: { type: 'unknown' } };
                if (l.visual.geometry) {
                    if (l.visual.geometry.box) {
                        link.visual.geometry = { type: 'box', size: l.visual.geometry.box['@_size'] };
                    } else if (l.visual.geometry.cylinder) {
                        link.visual.geometry = { type: 'cylinder', radius: l.visual.geometry.cylinder['@_radius'], length: l.visual.geometry.cylinder['@_length'] };
                    } else if (l.visual.geometry.sphere) {
                        link.visual.geometry = { type: 'sphere', radius: l.visual.geometry.sphere['@_radius'] };
                    }
                }
                if (l.visual.origin) {
                    link.visual.origin = { xyz: l.visual.origin['@_xyz'] || '0 0 0', rpy: l.visual.origin['@_rpy'] || '0 0 0' };
                }
                if (l.visual.material) {
                    link.visual.material = { name: l.visual.material['@_name'], color: l.visual.material.color ? l.visual.material.color['@_rgba'] : '1 1 1 1' };
                }
            }
            return link;
        });

        const parsedJoints = joints.map(j => ({
            name: j['@_name'],
            type: j['@_type'],
            parent: j.parent ? j.parent['@_link'] : '',
            child: j.child ? j.child['@_link'] : '',
            origin: j.origin ? { xyz: j.origin['@_xyz'] || '0 0 0', rpy: j.origin['@_rpy'] || '0 0 0' } : { xyz: '0 0 0', rpy: '0 0 0' },
            axis: j.axis ? j.axis['@_xyz'] : '1 0 0',
            limit: j.limit ? { lower: j.limit['@_lower'], upper: j.limit['@_upper'], effort: j.limit['@_effort'], velocity: j.limit['@_velocity'] } : null
        }));

        return {
            name: robot['@_name'],
            links: parsedLinks,
            joints: parsedJoints
        };
    } catch (e) {
        console.error("Failed to parse URDF", e);
        return null;
    }
};
