import * as THREE from './three/three.module.js';
import { OrbitControls } from './three/OrbitControls.js';
import { GLTFLoader } from './three/GLTFLoader.js';
import { DragControls } from './three/DragControls.js';
import * as BufferGeometryUtils from './three/BufferGeometryUtils.js';

import { 
    ROOM_TYPE_WITH_CORNER,
    state,
    roomState,
    categoryState,
    getTextureSrc,
    generateSmartUVs,
    setTextureLoader
} from './shared-scripts.js';



const FLOOR_THICKNESS = 20;
const WALL_THICKNESS = 20;;

let 
    modelScene, 
    threeJSRendered, 
    room3DGroup, 
    threeJSCamera, 
    threeJSControls;


window.initRoomConfigPreviewComponent =  async function initRoomConfigPreviewComponent(configId) {
    const container = document.querySelector('.room-config-preview-shortcode .config-preview-container');

    if(!container) return;

    let {
        content,
        products_list,
        room_dimensions,
        default_textures,
        furniture_dimensions
    } = await getRoomConfigPreviewShortcodeContent(configId);

    if(!content) return;

    container.innerHTML = content;
    const newContainer = container.querySelector('.config-preview-content');

    initRoomPreview(
        newContainer,
        products_list,
        room_dimensions,
        default_textures,
        furniture_dimensions
    );
}

function initTextures(defaultTextures){
    state.defaultTextures = {...defaultTextures};
    for (const [key, value] of Object.entries(defaultTextures)) {
        setTextureLoader(key, value);
    }
}


function initRoomPreview(
    container, 
    productsList,
    roomDimensions,
    textures,
    furnitureDimensions
) {
    initTextures(textures);

    const assetsUrl = configDataPreviewRoom.assetsUrl;
    roomState.dbChildren = productsList;
    let { room_type: roomType, height: roomHeight, depth: roomDepth, width: roomWidth } = roomDimensions;
    let defaultBottomReferenceY = 0;
    let modelRoomWidth = 0;
    let modelRoomHeight = 0;
    let modelRoomDepth = 0;

    let worldItemsDimensions = {
        width: {
            top: 0,
            bottom: 0,
            full: 0,
            topCorner: 0,
            bottomCorner: 0,
            fullCorner: 0,
        },
        height: {
            top: 0,
            bottom: 0,
            full: 0,
            topCorner: 0,
            bottomCorner: 0,
            fullCorner: 0,
        },
        depth: {
            top: 0,
            bottom: 0,
            full: 0,
            topCorner: 0,
            bottomCorner: 0,
            fullCorner: 0,
        },
        bottomSpace: {
            bottom: 0,
            bottomCorner: 0,
        }
    };

    const model3dContainer = container.querySelector('.model-display-container .room-model-container-inner');

    init3dModel(model3dContainer);

    function init3dModel(model3dContainer) {
        
        modelScene = new THREE.Scene();

        const textureLoader = new THREE.TextureLoader();
        const floorTexture = textureLoader.load(assetsUrl + '/images/floor-limestone.jpg');
        const wallTexture = textureLoader.load(assetsUrl + '/images/brick-wall.jpg');
        wallTexture.colorSpace = THREE.SRGBColorSpace;
        floorTexture.colorSpace = THREE.SRGBColorSpace;

        const width = model3dContainer.clientWidth;
        const height = model3dContainer.clientHeight;

        let [currentRoomHeight, currentRoomDepth, currentRoomWidth] = getRoomDimensions(model3dContainer, roomHeight, roomDepth, roomWidth);
        modelRoomWidth = currentRoomWidth;
        modelRoomHeight = currentRoomHeight;
        modelRoomDepth = currentRoomDepth;

        /**** set camera ******/
        const fov = 45; // field of view in degrees
        const aspect = width / height;
        const near = 0.1;
        const far = Math.max(roomWidth, roomDepth, roomHeight) * 10; // large enough to include entire room
        threeJSCamera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        /**** end set camera ******/

        threeJSRendered = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
        
        threeJSRendered.setSize(model3dContainer.clientWidth, model3dContainer.clientHeight);
        model3dContainer.appendChild(threeJSRendered.domElement);

        threeJSControls = new OrbitControls(threeJSCamera, threeJSRendered.domElement);

        /********* light *********/
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
        modelScene.add(hemiLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
        dirLight.position.set(100, 200, 100);
        modelScene.add(dirLight);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // soft fill light
        modelScene.add(ambientLight);

        /************room ****************/
        room3DGroup = new THREE.Group();
   
        defaultBottomReferenceY = getDefaultBottomHeightWithSpace(roomHeight, modelRoomHeight);

        // Floor
        const floorMaterial = new THREE.MeshStandardMaterial({  
            map: floorTexture,
            color: 0xffffff,
            metalness: 0,
            roughness: 0.5, 
            side: THREE.DoubleSide
        }); 

        const floorGeometry = new THREE.BoxGeometry(modelRoomWidth, FLOOR_THICKNESS, modelRoomDepth);
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.position.y = -FLOOR_THICKNESS / 2; // so top surface stays at y=0
        room3DGroup.add(floor);
        floor.receiveShadow = true;

        const wallMaterial = new THREE.MeshStandardMaterial({  
            map: wallTexture,
            color: 0xffffff,
            metalness: 0,
            roughness: 1, 
            side: THREE.DoubleSide
        }); 
        const wallHeightWithFloorThinkness = modelRoomHeight + FLOOR_THICKNESS;
        if(roomState.roomType === ROOM_TYPE_WITH_CORNER) {
            const wallDepthWithWallThickness = modelRoomDepth + FLOOR_THICKNESS;

            const leftWallGeometry = new THREE.BoxGeometry(WALL_THICKNESS, wallHeightWithFloorThinkness, wallDepthWithWallThickness);
            const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
            leftWall.position.set(
                -modelRoomWidth / 2 - WALL_THICKNESS / 2, 
                 wallHeightWithFloorThinkness / 2 - FLOOR_THICKNESS, 
                -FLOOR_THICKNESS / 2
            );
            room3DGroup.add(leftWall);
            leftWall.receiveShadow = true;
        }
    
        const rightWallGeometry = new THREE.BoxGeometry(modelRoomWidth, wallHeightWithFloorThinkness, WALL_THICKNESS);
        const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial);
        rightWall.position.set(
            0, 
            wallHeightWithFloorThinkness / 2 - FLOOR_THICKNESS, 
            -modelRoomDepth / 2 - WALL_THICKNESS / 2
        );
        room3DGroup.add(rightWall);
        rightWall.receiveShadow = true;

        modelScene.add(room3DGroup);

        threeJSCamera.position.set(0, modelRoomHeight/2, modelRoomDepth * 1.5);
        threeJSCamera.lookAt(0, modelRoomHeight / 2, 0);
        threeJSControls.target.set(0, roomHeight / 2, 0); // set target first
        threeJSControls.maxPolarAngle = Math.PI/2;

        const roomBox = new THREE.Box3().setFromObject(room3DGroup); 
        roomBox.expandByScalar(0.01);

        /******** center bottom*******/
        const roomCenter = new THREE.Vector3();
        roomBox.getCenter(roomCenter);
        const roomSize = new THREE.Vector3();
        roomBox.getSize(roomSize);

         /******** create angle *******/
        const distance = Math.max(roomWidth, roomDepth) * 1.5;
        
        // Tilt down a bit (so we see floor) and yaw so we see both walls
        const yaw   = Math.PI / 4;   // 45° around Y axis
        const pitch = Math.atan(1 / 2); // gentle downward angle (~26°)

        // align slightly top view and rotate the x angle
        const pitchOffset = THREE.MathUtils.degToRad(20);// 15° above horizon

        const camX = distance * Math.sin(yaw) * Math.cos(pitch + pitchOffset);
        const camY = distance * Math.sin(pitch + pitchOffset);
        const camZ = distance * Math.cos(yaw) * Math.cos(pitch + pitchOffset);

        threeJSCamera.position.set(
            camX + threeJSControls.target.x,
            camY + threeJSControls.target.y,
            camZ + threeJSControls.target.z
        );

        if(roomState.roomType === ROOM_TYPE_WITH_CORNER) {
            const {
                bottomHeight,
                bottomWidth,
                bottomDepth,
                topHeight,
                topWidth,
                topDepth,
                fullWidth,
                fullDepth,
                bottomSpace,
            } = getCornerDimensions();

            const tempWorldDimensions = {...worldItemsDimensions};
            tempWorldDimensions.height.bottomCorner = bottomHeight;
            tempWorldDimensions.height.topCorner = topHeight;
            tempWorldDimensions.width.bottomCorner = bottomWidth;
            tempWorldDimensions.width.topCorner = topWidth;
            tempWorldDimensions.width.fullCorner = fullWidth;
            tempWorldDimensions.depth.bottomCorner = bottomDepth;
            tempWorldDimensions.depth.topCorner = topDepth;
            tempWorldDimensions.depth.fullCorner = fullDepth;
            tempWorldDimensions.bottomSpace.bottomCorner = bottomSpace;
            worldItemsDimensions = {...tempWorldDimensions}

            appendCornerPseudoModelObjects();
        }

        /************ TEST ********/
        function renderLights() {
            threeJSRendered.physicallyCorrectLights = true;
            threeJSRendered.outputEncoding = THREE.sRGBEncoding;
            threeJSRendered.toneMapping = THREE.ACESFilmicToneMapping;
            threeJSRendered.toneMappingExposure = 2.2;
            threeJSRendered.shadowMap.enabled = true;
            threeJSRendered.shadowMap.type = THREE.PCFSoftShadowMap;

            const groupFloorSpot1 = new THREE.Group();
            const groupFloorSpot2 = new THREE.Group();
            const groupWallSpot1 = new THREE.Group();
            const groupWallSpot2 = new THREE.Group();
            const maxNum = 0.5;

            for (let i = 0; i <= maxNum; i += 0.1) {
                // Create a SPOTLIGHT instead of PointLight — aimed at floor only
                const spot = new THREE.SpotLight(
                    0xffffff,              // color
                    // modelRoomWidth / 1.8,  // intensity
                    roomWidth * 50,  // intensity
                    roomWidth * 9,  // distance
                    Math.PI / 2,         // angle (cone width)
                    0.6,                   // penumbra (softness)
                    2                      // decay (falloff)
                );

                // Place above the room, near ceiling
                spot.position.set(
                    (modelRoomWidth + modelRoomWidth * i) * -1,
                    modelRoomHeight - WALL_THICKNESS * 2,
                    modelRoomDepth / 4 * -1
                );

                // Aim straight down at the floor
                spot.target.position.set(spot.position.x, 0, spot.position.z);
                spot.target.updateMatrixWorld();
                groupFloorSpot1.add(spot);
                groupFloorSpot1.add(spot.target);
            }

            for (let i = 0; i <= maxNum; i += 0.1) {
                const spot = new THREE.SpotLight(
                    0xffffff,              // color
                    // modelRoomWidth / 1.8,  // intensity
                    modelRoomWidth * 80,  // intensity
                    modelRoomWidth * 10,  // distance
                    Math.PI / 2,         // angle (cone width)
                    0.6,                   // penumbra (softness)
                    2                      // decay (falloff)
                );

                // Place above the room, near ceiling
                spot.position.set(
                    (modelRoomWidth + modelRoomWidth * i),
                    modelRoomHeight - WALL_THICKNESS * 2,
                    modelRoomDepth / 4 * -1
                );

                // Aim straight down at the floor
                spot.target.position.set(spot.position.x, 0, spot.position.z);
                spot.target.updateMatrixWorld();
                groupFloorSpot2.add(spot);
                groupFloorSpot2.add(spot.target);
            }

            for (let i = 0; i <= maxNum; i += 0.1) {
                const spot = new THREE.SpotLight(
                    // 0x00ff00,  
                    0xffffff,            // color
                    // modelRoomWidth / 1.8,  // intensity
                    modelRoomWidth * 50,  // intensity
                    modelRoomWidth * 10,
                    // rightWallGeometry * 10,  // distance
                    Math.PI / 1,         // angle (cone width)
                    0.6,                   // penumbra (softness)
                    2                      // decay (falloff)
                );

                // Place above the room, near ceiling
                // spot.position.set(
                //     (roomWidth + roomWidth * i),
                //     roomHeight - WALL_THICKNESS * 2,
                //     (roomDepth / 2 * -1) + worldItemsDimensions.depth.full
                // )
            	spot.position.set(
                    (modelRoomWidth + modelRoomWidth * i),
                    modelRoomHeight - WALL_THICKNESS * 2,
                    (modelRoomDepth / 2 * -1) + worldItemsDimensions.depth.full
                )

                // Aim straight down at the floor
                spot.target.position.set(spot.position.x, 0, spot.position.z);
                spot.target.updateMatrixWorld();
                groupWallSpot1.add(spot);
                groupWallSpot1.add(spot.target);
            }

            for (let i = 0; i <= maxNum; i += 0.1) {
                const spot = new THREE.SpotLight(
                    // 0x00ff00,  
                    0xffffff,            // color
                    // modelRoomWidth / 1.8,  // intensity
                    modelRoomWidth * 50,  // intensity
                    modelRoomWidth * 10,  // distance
                    Math.PI / 1,         // angle (cone width)
                    0.6,                   // penumbra (softness)
                    2                      // decay (falloff)
                );

                // Place above the room, near ceiling
                spot.position.set(
                    (modelRoomWidth + modelRoomWidth * i) * -1,
                    modelRoomHeight - WALL_THICKNESS * 2,
                    (modelRoomDepth / 2 * -1) + worldItemsDimensions.depth.full
                )

                // Aim straight down at the floor
                spot.target.position.set(spot.position.x, 0, spot.position.z);
                spot.target.updateMatrixWorld();
                groupWallSpot2.add(spot);
                groupWallSpot2.add(spot.target);
            }

            modelScene.add(groupFloorSpot1);
            modelScene.add(groupFloorSpot2)
            modelScene.add(groupWallSpot1)
            modelScene.add(groupWallSpot2)
        }
        renderLights();
        /************ END TEST ********/

        roomState.dbChildren.forEach((child) => {
            const dbData = child.db_data;
            const childId = child.id;
            const childProductId = child.product_id;
            const childCustomId = dbData.custom_id;
            const childSrc = child.object_src;
            const childType = child.furniture_type;
            const childWidth = dbData.width;
            const childOriginalSize = JSON.parse(dbData.model_original_size);
            const childScaledSize = JSON.parse(dbData.model_scaled_size);
            const childSavedPisition = JSON.parse(dbData.model_position);
            const childPositionMm = JSON.parse(dbData.furniture_position_mm);
            const childIsFitting = Boolean(parseInt(dbData.is_fitting));
            addExistingGLBModel(
                childId, 
                childSrc, 
                childType, 
                childProductId, 
                childCustomId, 
                childWidth, 
                childOriginalSize, 
                childScaledSize, 
                childSavedPisition, 
                childPositionMm, 
                childIsFitting
            );
        });
        
        const animate = () => {
            requestAnimationFrame(animate);
            threeJSControls.update();
            threeJSRendered.render(modelScene, threeJSCamera);
        };
        animate();
    }

    function addExistingGLBModel(id, urlSrc, furnitureType, productId, customId, itemWidth, originalSize, scaledSize, savedPosition, childPositionMm, isFitting) {
        const loader = new GLTFLoader();

        const texturesObj = categoryState.textures3DSrc[productId] ? categoryState.textures3DSrc[productId] : state.textures3DSrc;

        loader.load(
            urlSrc,
            function (childGltf) {
                const childMeshGroup = childGltf.scene;
                const childMeshList = [];

                childMeshGroup.traverse(node => {
                    if (node.isMesh) {
                        const geo = node.geometry;
                        // ✅ Ensure geometry uses triangles
                        if (geo && geo.attributes.position) {
                            node.geometry = BufferGeometryUtils.mergeVertices(geo) || geo;
                            node.geometry.computeVertexNormals();
                        }

                        // ✅ Make sure it’s visible
                        node.material.side = THREE.DoubleSide;
                        node.frustumCulled = false;

                        /******* add texture ********/
                        if (!node.geometry.attributes.uv) {
                            generateSmartUVs(node.geometry);
                        }
 
                        const name = (node.name || "").toLowerCase();

                        const texture = getTextureSrc(furnitureType, name, texturesObj);

                        node.material = new THREE.MeshStandardMaterial({
                            map: texture,
                            metalness: 0.5,    // little reflection
                            roughness: 0.5,    // wood is not glossy
                        });
                        node.material.needsUpdate = true;

                        node.userData.originalMaterial = {
                            color: node.material.color.clone(),
                            opacity: node.material.opacity,
                            transparent: node.material.transparent
                        };

                        childMeshList.push(node);
                    }
                });

                const wrapper = new THREE.Group();
                wrapper.position.set(0, 0, 0);
                wrapper.rotation.set(0, 0, 0);
                wrapper.scale.set(1, 1, 1);
                wrapper.updateMatrixWorld(true);
                wrapper.receiveShadow = true;

                childMeshList.forEach(mesh => {
                    // Save world transform
                    mesh.updateWorldMatrix(true, false);

                    wrapper.attach(mesh);

                    mesh.matrixAutoUpdate = true;
                    mesh.frustumCulled = false;
                });
 
                modelScene.add(wrapper);

                wrapper.userData.rowId = id;
                wrapper.userData.customId = customId;
                wrapper.userData.productId = productId;
                wrapper.userData.furnitureType = furnitureType;
                wrapper.userData.width_mm = itemWidth;
                wrapper.userData.originalSize = originalSize;
                wrapper.userData.scaledSize = scaledSize;
                wrapper.userData.savedPosition = savedPosition;
                wrapper.userData.positionMm = childPositionMm;
                wrapper.userData.isFitting = isFitting;
    

                /******* size and position *********/
                const scaleX = parseFloat(scaledSize.x) / Math.abs(originalSize.x);
                const scaleY = parseFloat(scaledSize.y) / Math.abs(originalSize.y) || 1; // avoid zero
                const scaleZ = parseFloat(scaledSize.z) / Math.abs(originalSize.z);

                wrapper.scale.set(scaleX, scaleY, scaleZ);
                wrapper.position.set(savedPosition.x, savedPosition.y, savedPosition.z);

                /******* end position *********/

                if (!isFitting) {
                    wrapper.traverse(child => {
                        if (child.isMesh) {
                            child.material.color.set(0xff0000);
                            child.material.transparent = true;
                            child.material.opacity = 0.5;
                        }
                    });
                }
            },
            (xhr) => {
                console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
            },
            (error) => {
                console.error("❌ Error loading GLB:", error);
            }
        );
    }

    function getDefaultBottomHeightWithSpace(roomHeightCm, modelRoomHeightPx) {
        // const bottomPercent = (dimensions.bottomHeight + dimensions.spaceBottom) / (roomHeightCm * 10);
        const bottomPercent = (furnitureDimensions.bottom_height + furnitureDimensions.space_bottom) / (roomHeightCm * 10);
        const bottomSceneUnits = modelRoomHeightPx * bottomPercent; // this is already in scene units

        return bottomSceneUnits;  
    }

}

function getRoomDimensions(modelContainer, height, depth, width) {
    const modelContainerWidth = modelContainer.clientWidth;
    const modelContainerHeight = modelContainer.clientHeight;
    const maxModelContainerDimension = modelContainerWidth > modelContainerHeight ? modelContainerWidth : modelContainerHeight;

    let max = width;
    if(max < height) {
        max = height;
    } else if(max < depth) {
        max = depth;
    }

    const modelHeightPercent = height * 100 / max;
    const modelHeightPx = maxModelContainerDimension * modelHeightPercent / 100;
    const modelDepthPercent = depth * 100 / max;
    const modelDepthPx = maxModelContainerDimension * modelDepthPercent / 100;
    const modelWidthPercent = width * 100 / max;
    const modelWidthPx = maxModelContainerDimension * modelWidthPercent / 100;

    return [
        modelHeightPx,
        modelDepthPx,
        modelWidthPx,
    ];
}


async function getRoomConfigPreviewShortcodeContent(configId) {
    try {
        let formData = new FormData();
        formData.append("action", "render_config_room_preview");
        formData.append("config_id", configId);

        const response = await fetch(configDataPreviewRoom.ajaxurl, {
            method: "POST",
            body: formData,
        });

        const jsonData = await response.json();

        if(!jsonData.success || !jsonData.data?.content) return '';
        const data = jsonData.data;
        return data;
    } catch(e) {
            console.log(e)
        return '';
    }
}
