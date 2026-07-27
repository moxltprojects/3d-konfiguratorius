// three-imports.js

import * as THREE from './three/three.module.js';
import { OrbitControls } from './three/OrbitControls.js';
import { GLTFLoader } from './three/GLTFLoader.js';
import { DragControls } from './three/DragControls.js';
import { DecalGeometry } from  './three/DecalGeometry.js';
import * as BufferGeometryUtils from './three/BufferGeometryUtils.js';
import { RectAreaLightUniformsLib } from './three/RectAreaLightUniformsLib.js';
import { RectAreaLightHelper } from './three/RectAreaLightHelper.js';

export {
    THREE,
    OrbitControls,
    GLTFLoader,
    DragControls,
    DecalGeometry,
    BufferGeometryUtils,
    RectAreaLightUniformsLib,
    RectAreaLightHelper,
};