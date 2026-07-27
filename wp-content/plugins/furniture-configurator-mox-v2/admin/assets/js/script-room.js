import {
    THREE,
    OrbitControls,
    GLTFLoader,
    DragControls,
    BufferGeometryUtils
} from '../../../assets/js/three-imports.js';

import { 
    initTextures,
    ROOM_TYPE_SINGLE_WALL,
    ROOM_TYPE_WITH_CORNER,
	FURNITURE_TYPE_BOTTOM,
    FURNITURE_TYPE_BOTTOM_CORNER,
    DIMENSION_TYPE_TOP,
    DIMENSION_TYPE_FULL,
    DIMENSION_TYPE_HEIGHT,
    DIMENSION_TYPE_DEPTH,
    DIMENSION_TYPE_WIDTH,
    FLOOR_THICKNESS,
    WALL_THICKNESS,
    LIGHT_STATE_DEFAULT,
    BOTTOM_DISPLAY_IMAGE,
    TOP_DISPLAY_IMAGE,
    FULL_DISPLAY_IMAGE,
    state,
    roomState,
    changeInputFromRangeValue,
    getTextureSrc,
    generateSmartUVs,
	updateBgPlane,	
    getRoomDimensions,
} from '../../../assets/js/shared-scripts.js';

import { 
    initCabinetTypes,
    initRoomModelSettings,
    removeCornerPseudoModelObjects,
    progressInit,
    initCabinetTabs,
    initAddFurnitureMethod,
    loadMoreProducts,
    renderBasicImage3dContainer,
    clearModelScene,
    dragControlsMethod,
    init3dModel,
    productActionsInit,
    editContainerRemove,
    modelSettings,
    updateRoomSize
} from '../../../assets/js/new-shared-scripts.js';

let 
    threeJSRenderedBasicDisplay, 
    basicDisplayScene, 
    threeJSCameraBasicDisplay;


window.initAdminRoomConfigComponent = async function initAdminRoomConfigComponent(postId) {
    const root = document.querySelector('.room-config-shortcode');
    let {
        content,
        all_products,
        products_list,
        products_list_per_page,
        room_dimensions,
        furniture_dimensions,
        corner_furniture_data,
        default_textures,
        totals,
        currency_symbol,
    } = await getRoomAdminConfigComponentShortcodeContent(postId);

    if(!content) return;

    root.innerHTML = content;

    const tempProductsList = {...products_list};

    const container = root.querySelector('.room-config-container');

    const newShared = await import('../../../assets/js/new-shared-scripts.js');
    newShared.initNewSharedScripts(container, configDataRoom.ajaxurl, configDataRoom.generalAssetsUrl);

    roomState.postId = postId;
    const roomType = ROOM_TYPE_SINGLE_WALL;
    roomState.roomType = roomType;
    roomState.furnitureDimensions = furniture_dimensions;
    roomState.roomDimensions = room_dimensions;
    roomState.cornerFurnitureData = corner_furniture_data;

    initRoomConfigFunctions(
        container, 
        postId,
        all_products,
        products_list_per_page, 
        tempProductsList,
        default_textures,
        totals, 
        currency_symbol,
        furniture_dimensions.largest_height,
    );
}

function initRoomConfigFunctions(
    container, 
    postId,
    allProducts,
    productsListPerPage, 
    tempProductsList,
    textures,
    totals, 
    currencySymbol,
    largestHeight
) {
    initTextures(textures);

    const assetsUrl = configDataRoom.assetsUrl;

    let basicDisplayObj = {
        bottom: null,
        top: null,
        full: null,
    }

    const modelContainer = container.querySelector('.model-display-container .room-model-container-inner');
    state.model3dContainer = modelContainer;

    const configSelector = container.querySelector('.configurator-selector select');

    const totalContainer = container.querySelector('.total-container .total-container-inner .number');
    const summaryItemsList = container.querySelectorAll('.summary-cabinets-list-inner');
    let basicDisplayContainer = container.querySelector('.progress-content .general-settings .display-container .general-settings-display-image .general-image-inner');

    setRoomModelData();

    initRoomModelSettings(); //imported

    initSettingsSave(); 
    progressInit();  //imported
    initRoomCabinetTypeTabs();
    initCabinetTabs(
        '.cabinet-settings .cabinets-content .tabs button',
    ); //imported
    initCabinetTypes(); //imported
    renderBasicImage3dContainer();

    changeRoomType();
    init3dModels(true);

    changeInputFromRangeValue(container); //imported from shared
    changeRoomDimensionsValue(modelContainer);
    initAddFurnitureMethod(); //imported
    loadMoreProducts(productsListPerPage, configDataRoom.ajaxurl); //imported

    function setRoomModelData() {
        roomState.modelsList = {
            ...roomState.modelsList,

            [ROOM_TYPE_SINGLE_WALL]: {
                ...roomState.modelsList[ROOM_TYPE_SINGLE_WALL],
                roomType: ROOM_TYPE_SINGLE_WALL,
                dbChildren: JSON.parse(JSON.stringify(tempProductsList[ROOM_TYPE_SINGLE_WALL])),
                allProducts: allProducts[ROOM_TYPE_SINGLE_WALL],
                total: totals[ROOM_TYPE_SINGLE_WALL],
                htmlContainer: container.querySelector(
                    `.model-display-container .room-model-container-inner .canvas-parent[data-type="${ROOM_TYPE_SINGLE_WALL}"]`
                )
            },
            [ROOM_TYPE_WITH_CORNER]: {
                ...roomState.modelsList[ROOM_TYPE_WITH_CORNER],
                roomType: ROOM_TYPE_WITH_CORNER,
                dbChildren: JSON.parse(JSON.stringify(tempProductsList[ROOM_TYPE_WITH_CORNER])),
                allProducts: allProducts[ROOM_TYPE_WITH_CORNER],
                total: totals[ROOM_TYPE_WITH_CORNER],
                htmlContainer: container.querySelector(
                    `.model-display-container .room-model-container-inner .canvas-parent[data-type="${ROOM_TYPE_WITH_CORNER}"]`
                )
            }
        }; 
    }

    function changeRoomDimensionsValue(model3dContainer) {
        const dimensionsItemContainers = container.querySelectorAll('.room-layout .dimension-container');
        
        dimensionsItemContainers.forEach(dimensionsContainer => {
            const type = dimensionsContainer.getAttribute('data-dimension_type');
            const rangeInput = dimensionsContainer.querySelector('.slider-container input[type="range"]');
            const rangeNumInput = dimensionsContainer.querySelector('.input-container input[type="number"]');

            rangeInput.addEventListener('change', function(e) {
                const value = parseInt(e.target.value);
                rangeNumInput.value = value;

                roomState.roomDimensions[type] = parseInt(value);

                // initRoomDimensions(model3dContainer);
                // initRoomType();

                updateRoomSize(roomState.modelsList[ROOM_TYPE_SINGLE_WALL], roomState.roomDimensions);
                updateRoomSize(roomState.modelsList[ROOM_TYPE_WITH_CORNER], roomState.roomDimensions);

            });

            rangeNumInput.addEventListener('change', function(e) {
                const value = parseInt(e.target.value);
                rangeInput.value = value;

                roomState.roomDimensions[type] = parseInt(value);

                updateRoomSize(roomState.modelsList[ROOM_TYPE_SINGLE_WALL], roomState.roomDimensions);
                updateRoomSize(roomState.modelsList[ROOM_TYPE_WITH_CORNER], roomState.roomDimensions);
                // initRoomDimensions(model3dContainer);
                // initRoomType();
            });
        });
    }

    function initRoomType(onPageLoad = false) {
        // if(!onPageLoad) {
        //     roomState.modelsList[ROOM_TYPE_SINGLE_WALL].dbChildren = [];
        //     roomState.modelsList[ROOM_TYPE_WITH_CORNER].dbChildren = [];
        //     changeTotals()

        //     roomState.dynamicLists.forEach(list => {
        //         list.innerHTML = '';
        //     });
        //     summaryItemsList.forEach(list => {
        //         list.innerHTML = '';
        //     });
        // }
        init3dModels(onPageLoad);
    }


    function changeRoomType() {
        const options = container.querySelectorAll('.room-layout-options button');

        roomState.summaryItemsList = document.querySelector(`.tab-item.current .summary .summary-inner .summary-content`);
        roomState.myItemsList = document.querySelector(`.tab-item.current .cabinets .cabinets-inner .my-cabinets-list-inner`);

        options.forEach(option => {
            const optionParent = option.parentNode;
            const type = option.getAttribute('data-type');
            roomState.roomType = type;
            const modelContainer = container.querySelector(
                `.model-display-container .room-model-container-inner .canvas-parent[data-type="${type}"]`
            );

            option.addEventListener('click', function(e) {
                e.preventDefault();

                if(optionParent.classList.contains('current')) return;

                const currentParent = container.querySelector('.room-layout-options .option.current');

                if(currentParent) currentParent.classList.remove('current');

                const currentModelContainer = container.querySelector( `.model-display-container .room-model-container-inner .canvas-parent.current`);

                if(currentModelContainer) currentModelContainer.classList.remove('current');

                optionParent.classList.add('current');
                modelContainer.classList.add('current');

                roomState.summaryItemsList = container.querySelector('.tab-item.current .summary .summary-inner .summary-content');
                roomState.myItemsList = container.querySelector('.tab-item.current .cabinets .cabinets-inner .my-cabinets-list-inner')
            });
        });
    }

    function changeRoomTypeTab(tab, contents, modelContainer) {
        if(tab.classList.contains('active')) return;

        const currentTab = container.querySelector('.room-type-tabs button.active');
        const currentContents = container.querySelectorAll('.tabs-content  .tab-item.current');
        const currentModelContainer = container.querySelector( `.model-display-container .room-model-container-inner .canvas-parent.current`);
        
        if(currentTab) currentTab.classList.remove('active');
        if(currentContents) {
            currentContents.forEach(currentContent => {
                currentContent.classList.remove('current');
            });
        }
        if(currentModelContainer) currentModelContainer.classList.remove('current');

        tab.classList.add('active');
        contents.forEach(content => {
            if(content) content.classList.add('current');
        })
        if(modelContainer) modelContainer.classList.add('current');

        roomState.myItemsList = container.querySelector('.tab-item.current .cabinets .cabinets-inner .my-cabinets-list-inner');
        roomState.summaryItemsList = container.querySelector('.tab-item.current .summary .summary-inner .summary-content');
    }

    function editItemButtonTrigger(modelRoomType, furnitureItem) {
        const editButton = furnitureItem.querySelector('.item-actions-container button[data-action_type="edit"]');

        if(!editButton) {
            return;
        }

        const itemData = JSON.parse(furnitureItem.getAttribute('data-item_data'));
        const productId = itemData.product_id;
        const furnitureType = itemData.furniture_type;
        const modelFileSrc = itemData.model_src;
        const minWidth = itemData.min_width;

        const {
            regular: regularPrice, 
            regular_cm3: regularPriceCm3,
            discount: discountPrice, 
            discount_cm3: discountPriceCm3,
            display: displayPrice,
            display_cm3: displayPriceCm3,
        } = itemData.prices;

        editButton.addEventListener('click', function(e) {
            e.preventDefault();

            const itemWidth = parseInt(furnitureItem.getAttribute('data-item_width'));
            const itemHeight = parseInt(furnitureItem.getAttribute('data-item_height'));
            const itemDepth = parseInt(furnitureItem.getAttribute('data-item_depth'));
            const itemSpaceBottom = parseInt(furnitureItem.getAttribute('data-item_space_bottom'));
            const customId = furnitureItem.getAttribute('data-custom_id');
            // highlightCurrentItem(modelRoomType, customId);

            createEditModal(
                furnitureItem, 
                modelRoomType,
                customId,
                itemData, 
                productId, 
                furnitureType, 
                modelFileSrc, 
                itemWidth, 
                itemHeight,
                itemDepth,
                itemSpaceBottom,
                itemData.prices,
                displayPrice, 
                regularPrice, 
                discountPrice, 
                regularPriceCm3, 
                discountPriceCm3, 
                displayPriceCm3,
                false
            );
        });

    }

    function initFurnitureRotationTrigger(roomType, parent, customId) {
        const furnitureButton = parent.querySelector(`.item-actions-container button[data-action_type="rotate"]`);
        
        if(!furnitureButton) return;

        furnitureButton.addEventListener('click', function() {
            initFurnitureRotation(roomType, customId);
        });
    }

    function init3dModels(onPageLoad) {
        const singleObj = roomState.modelsList[ROOM_TYPE_SINGLE_WALL];
        const doubleObj = roomState.modelsList[ROOM_TYPE_WITH_CORNER];

        const singleParams = init3dModel(
            singleObj,
            singleObj.htmlContainer,
            ROOM_TYPE_SINGLE_WALL,
            onPageLoad
        );

        const cornerParams = init3dModel(
            doubleObj,
            doubleObj.htmlContainer,
            ROOM_TYPE_WITH_CORNER,
            onPageLoad
        );

        Object.assign(singleObj, singleParams);
        Object.assign(doubleObj, cornerParams);
    }

    function initRoomDimensions(model3dContainer) {
        let {heightPx, depthPx, widthPx, scaleX, scaleY, scaleZ} = getRoomDimensions(model3dContainer);

        roomState.modelRoomDimensions = {
            width: widthPx,
            height: heightPx,
            depth: depthPx,            
        }
        roomState.modelRoomScale = {
            x: scaleX,
            y: scaleY,
            z: scaleZ,            
        }

    }

    // function init3dModel2(modelObj, model3dContainer, modelRoomType, containerWidth, containerHeight, onPageLoad, roomType = ROOM_TYPE_SINGLE_WALL) {
    //     clearModelScene(modelObj, onPageLoad);

    //     const modelScene = new THREE.Scene();
    //     const textureLoader = new THREE.TextureLoader();
    //     const wallTexture = textureLoader.load(configDataRoom.generalAssetsUrl + '/images/room/brick-wall.jpg');
    //     const floorTexture = textureLoader.load(configDataRoom.generalAssetsUrl + '/images/room/wall-spiral.png');

    //     wallTexture.colorSpace = THREE.SRGBColorSpace;
    //     floorTexture.colorSpace = THREE.SRGBColorSpace;

    //     function isWebGLAvailable() {
    //         try {
    //             const canvas = document.createElement('canvas');
    //             return !!(
    //                 window.WebGLRenderingContext &&
    //                 (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    //             );
    //         } catch (e) {
    //             return false;
    //         }
    //     }

    //     if (!isWebGLAvailable()) {
    //         console.error("WebGL is disabled in this environment");
    //         return;
    //     }

    //     const { width: roomWidth, height: roomHeight, depth: roomDepth } = roomState.roomDimensions;
    //     const { width: modelRoomWidth, height: modelRoomHeight, depth: modelRoomDepth } = roomState.modelRoomDimensions;

    //     /******** CAMERA ********/
    //     const fov = 45;
    //     const aspect = containerWidth / containerHeight;
    //     let threeJSCamera = new THREE.PerspectiveCamera(fov, aspect, 0.5, 1000);

    //     /******** RENDERER ********/
    //     const threeJSRendered = new THREE.WebGLRenderer({
    //         antialias: true,
    //         alpha: true,
    //         powerPreference: "high-performance",
    //         // preserveDrawingBuffer: true
    //     });

    //     threeJSRendered.setSize(containerWidth, containerHeight);
    //     model3dContainer.appendChild(threeJSRendered.domElement);

    //     /******** CONTROLS ********/
    //     const threeJSControls = new OrbitControls(threeJSCamera, threeJSRendered.domElement);

    //     threeJSControls.enableZoom = true;   // (usually true by default, but safe)
    //     threeJSControls.enableDamping = true;
    //     threeJSControls.dampingFactor = 0.05;

    //     threeJSControls.zoomSpeed = 1.2;

    //     /******** LIGHTS ********/
    //     // const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
    //     // modelScene.add(hemiLight);

    //     // const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    //     // dirLight.position.set(100, 200, 100);
    //     // modelScene.add(dirLight);

    //     // const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    //     // modelScene.add(ambientLight);

    //     threeJSRendered.toneMapping = THREE.ACESFilmicToneMapping;
    //     threeJSRendered.toneMappingExposure = LIGHT_STATE_DEFAULT.exposure;

    //     const baseLights = new THREE.Group();
    //     baseLights.name = 'base-lights';

    //     const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    //     const dirLight = new THREE.DirectionalLight(0xffffff);
    //     const ambientLight = new THREE.AmbientLight(0xffffff);

    //     hemiLight.intensity = LIGHT_STATE_DEFAULT.hemi;
    //     dirLight.intensity = LIGHT_STATE_DEFAULT.dir;
    //     ambientLight.intensity = LIGHT_STATE_DEFAULT.ambient;
    //     threeJSRendered.toneMappingExposure = LIGHT_STATE_DEFAULT.exposure;

    //     dirLight.position.set(100, 200, 100);

    //     baseLights.add(hemiLight);
    //     baseLights.add(dirLight);
    //     baseLights.add(ambientLight);

    //     modelScene.add(baseLights);

    //     /******** ROOM ********/
    //     const room3DGroup = new THREE.Group();

    //     const floorMaterial = new THREE.MeshStandardMaterial({
    //         map: floorTexture,
    //         color: 0xffffff,
    //         metalness: 0,
    //         roughness: 0.5,
    //         side: THREE.DoubleSide
    //     });

    //     const floor = new THREE.Mesh(
    //         new THREE.BoxGeometry(modelRoomWidth, FLOOR_THICKNESS, modelRoomDepth),
    //         floorMaterial
    //     );

    //     floor.position.y = -FLOOR_THICKNESS / 2;
    //     floor.receiveShadow = true;
    //     room3DGroup.add(floor);

    //     const wallMaterial = new THREE.MeshStandardMaterial({
    //         map: wallTexture,
    //         color: 0xffffff,
    //         metalness: 0,
    //         roughness: 1,
    //         side: THREE.DoubleSide
    //     });

    //     const wallHeightWithFloorThinkness = modelRoomHeight + FLOOR_THICKNESS;

    //     if (roomType === ROOM_TYPE_WITH_CORNER) {
    //         const leftWall = new THREE.Mesh(
    //             new THREE.BoxGeometry(WALL_THICKNESS, wallHeightWithFloorThinkness, modelRoomDepth + FLOOR_THICKNESS),
    //             wallMaterial
    //         );

    //         leftWall.position.set(
    //             -modelRoomWidth / 2 - WALL_THICKNESS / 2,
    //             wallHeightWithFloorThinkness / 2 - FLOOR_THICKNESS,
    //             -FLOOR_THICKNESS / 2
    //         );

    //         leftWall.receiveShadow = true;
    //         room3DGroup.add(leftWall);
    //     }

    //     const rightWall = new THREE.Mesh(
    //         new THREE.BoxGeometry(modelRoomWidth, wallHeightWithFloorThinkness, WALL_THICKNESS),
    //         wallMaterial
    //     );

    //     rightWall.position.set(
    //         0,
    //         wallHeightWithFloorThinkness / 2 - FLOOR_THICKNESS,
    //         -modelRoomDepth / 2 - WALL_THICKNESS / 2
    //     );

    //     rightWall.receiveShadow = true;
    //     room3DGroup.add(rightWall);

    //     modelScene.add(room3DGroup);

    //     const roomModelBox = new THREE.Box3().setFromObject(room3DGroup); 
     
    //     /******** CORNER SETUP ********/
    //     if(roomType === ROOM_TYPE_WITH_CORNER) {
            
    //         const {
    //             bottomHeight,
    //             bottomWidth,
    //             bottomDepth,
    //             topHeight,
    //             topWidth,
    //             topDepth,
    //             fullWidth,
    //             fullDepth,
    //             // bottomSpace,
    //         } = getCornerDimensions();

    //         const tempWorldDimensions = {...roomState.worldItemsDimensions};
    //         tempWorldDimensions.height.bottomCorner = bottomHeight;
    //         tempWorldDimensions.height.topCorner = topHeight;
    //         tempWorldDimensions.width.bottomCorner = bottomWidth;
    //         tempWorldDimensions.width.topCorner = topWidth;
    //         tempWorldDimensions.width.fullCorner = fullWidth;
    //         tempWorldDimensions.depth.bottomCorner = bottomDepth;
    //         tempWorldDimensions.depth.topCorner = topDepth;
    //         tempWorldDimensions.depth.fullCorner = fullDepth;
    //         // tempWorldDimensions.bottomSpace.bottomCorner = bottomSpace;
    //         roomState.worldItemsDimensions = {...tempWorldDimensions}
    //         appendCornerPseudoModelObjects(modelScene, roomModelBox);
    //     }

    //     if(modelSettings.lightsOn) {
    //         renderLighting(modelScene, threeJSRendered, modelRoomWidth, modelRoomHeight, modelRoomDepth);
    //     }

    //     /******** ADD MODELS ********/
    //     modelObj.dbChildren.forEach(child => {
    //         const dbData = child.db_data;
    //         const childId = child.id;
    //         const childProductId = child.product_id;
    //         const childCustomId = dbData.custom_id;
    //         const childSrc = dbData.object_src;
    //         const childType = child.furniture_type;
    //         const hasBrandTexture = dbData.has_brand_texture;
    //         const childWidth = dbData.width;
    //         const childHeight = dbData.height;
    //         const childDepth = dbData.depth;
    //         const childSpaceBottom = dbData.space_bottom;
    //         const childMinWidth = child.min_width;
    //         const childPositionMm = JSON.parse(dbData.furniture_position_mm);
    //         const childRotation = dbData.rotation;
    //         const childIsFitting = Boolean(parseInt(dbData.is_fitting));
    //         const childPrices = dbData.prices;
        
    //         addExistingGLBModel(
    //             modelScene,
    //             roomModelBox,
    //             modelRoomType,
    //             childId, 
    //             childSrc, 
    //             childType, 
    //             childProductId, 
    //             childCustomId, 
    //             childWidth, 
    //             childHeight, 
    //             childDepth, 
    //             childSpaceBottom,
    //             childPositionMm, 
    //             childRotation,
    //             childIsFitting,
    //         	hasBrandTexture,
    //         );

    //         productActionsInit(
    //             childCustomId,
    //             childProductId,
    //             childType,
    //             childSrc,
    //             child.prices,
    //         );
    //     });

    //     /******** FINAL CAMERA FIT ********/
    //     const fullBox = new THREE.Box3().setFromObject(room3DGroup);

    //     const size = new THREE.Vector3();
    //     const center = new THREE.Vector3();

    //     fullBox.getSize(size);
    //     fullBox.getCenter(center);

    //     const maxDim = Math.max(size.x, size.y, size.z);
    //     const fovRad = THREE.MathUtils.degToRad(fov);

    //     let cameraDistance = maxDim / (2 * Math.tan(fovRad / 2));
    //     cameraDistance *= 1.5;

    //     const yawOffset = roomType == ROOM_TYPE_SINGLE_WALL ? THREE.MathUtils.degToRad(-70) : 0; 
    //     const yaw = Math.PI / 4 + yawOffset;
    //     const pitch = THREE.MathUtils.degToRad(35);

    //     threeJSCamera.position.set(
    //         center.x + cameraDistance * Math.sin(yaw) * Math.cos(pitch),
    //         center.y + cameraDistance * Math.sin(pitch),
    //         center.z + cameraDistance * Math.cos(yaw) * Math.cos(pitch)
    //     );

    //     threeJSCamera.lookAt(center);

    //     // SAVE INITIAL STATE
    //     threeJSControls.target.copy(center);
    //     threeJSControls.update();
    //     threeJSControls.saveState();
    //     // End SAVE INITIAL STATE

    //     threeJSControls.target.copy(center);
    //     threeJSControls.update();

    //     threeJSCamera.near = Math.max(0.5, cameraDistance / 100);
    //     threeJSCamera.far = cameraDistance * 20;
    //     threeJSCamera.updateProjectionMatrix();

    //     threeJSControls.maxDistance = cameraDistance * 5;
    //     // threeJSControls.minDistance = cameraDistance * 0.2;
    //     threeJSControls.minDistance = cameraDistance * 0.05;
    //     threeJSControls.maxPolarAngle = Math.PI / 2;

    //     /******** OPTIONAL SAFETY ********/
    //     modelScene.traverse(obj => {
    //         if (obj.isMesh) obj.frustumCulled = false;
    //     });


    //     /********** drag controls ***********/

    //     const dragControls = new DragControls(
    //         modelObj.draggableObjects,
    //         threeJSCamera,
    //         threeJSRendered.domElement
    //     );

    //     dragControls.transformGroup = true;

    //     modelObj.dragControls = dragControls;

    //     dragControlsMethod(dragControls, modelScene, roomModelBox, threeJSControls, roomType);

    //     /******** ANIMATE ********/
    //     const animate = () => {
    //         requestAnimationFrame(animate);

    //         modelObj.bgPlanes.forEach(updateBgPlane);

    //         threeJSControls.update();
    //         threeJSRendered.render(modelScene, threeJSCamera);
    //         updateZoomSlider(threeJSCamera, threeJSControls);
    //     };
    //     animate();

    //     threeJSRendered.domElement.addEventListener('click', function(e) {
    //         onClickModel(e, threeJSRendered, threeJSCamera);
    //     });

    //     if(modelRoomType === ROOM_TYPE_SINGLE_WALL) {
    //         setZoomSettingsValues(threeJSCamera, threeJSControls);
    //     }

    //     return {
    //         ...modelObj,
    //         scene: modelScene,
    //         box: roomModelBox,
    //         camera: threeJSCamera,
    //         renderer: threeJSRendered,
    //         controls: threeJSControls,
    //         dragControls: dragControls,
    //         room3DGroup,
    //         roomDimensions: {
    //             width: modelRoomWidth,
    //             height: modelRoomHeight,
    //             depth: modelRoomDepth,
    //         }
    //     };
    // }

    function clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
    }

    function initRoomCabinetTypeTabs() {
        const currentRoomTab = container.querySelector('.room-type-tabs button.active');
        roomState.roomType = currentRoomTab ? currentRoomTab.getAttribute('data-type') : null;
        const tabs = container.querySelectorAll('.room-type-tabs button')

        tabs.forEach(tab => {
            const type = tab.getAttribute('data-type');
            const contents = container.querySelectorAll(`.cabinet-settings .tab-item[data-room_type="${type}"]`);
            const modelContainer = container.querySelector(
                `.model-display-container .room-model-container-inner .canvas-parent[data-type="${type}"]`
            );

            tab.addEventListener('click', function(e) {
                e.preventDefault(); 

                roomState.roomType = type;
                changeRoomTypeTab(tab, contents, modelContainer);
                editContainerRemove();
            });
        });

    }

    function calcBasicDisplayXPaddingUnits(parentWidthPx, parentWithUnits) {
        const basicDisplayXPaddingUnitsPercent = BASIC_DISPLAY_X_PADDING_PX * 100 / parentWidthPx;
        const units = parentWithUnits * basicDisplayXPaddingUnitsPercent / 100;

        return units;
    }


    function getActiveModel(){
        return roomState.modelsList[roomState.roomType];
    }

    async function initSettingsSave() {
        const saveBtn = container.querySelector('.top-bar button[data-action_type="save-settings"]');

        saveBtn.addEventListener('click', async function(e) {
            e.preventDefault();

            await saveAdminSettingsAjax(
                container,
                saveBtn,
                postId,
                state.defaultTextures,
                state.defaultComponents,
                roomState.roomDimensions,
                roomState.furnitureDimensions,
                roomState.modelsList
            );

        });
        
    }

}


async function getRoomAdminConfigComponentShortcodeContent(postId) {
    try {
        let formData = new FormData();
        formData.append("action", "render_config_room_admin");
        formData.append("post_id", postId);

        const response = await fetch(configDataRoom.ajaxurl, {
            method: "POST",
            body: formData,
        });

        const jsonData = await response.json();

        if(!jsonData.success || !jsonData.data?.content) return '';
        const data = jsonData.data;

        return data;
    } catch(e) {
        return '';
    }
}

async function saveAdminSettingsAjax(
    container,
    buttonHtml,
    postId,
    textures,
    components,
    roomDimensions,
    furnitureDimensions,
    roomModels
) {
    const oldText = buttonHtml.innerHTML;
    buttonHtml.innerHTML = '<div class="loader"></div>';
    const messageDiv = container.querySelector('.top-bar .save-data-container #save-message');
    if (messageDiv) {
        messageDiv.innerHTML = '';
    }
console.log(furnitureDimensions)
    try {
        let formData = new FormData();
        formData.append("action", "ajax_save_admin_config_settings");
        formData.append("post_id", postId);
        formData.append("config_settings", JSON.stringify({
            textures: textures,
            components: components,
            room_dimensions: roomDimensions,
            furniture_dimensions: furnitureDimensions,
        }));

        const productsItems = Object.entries(roomModels).map(([key, value]) => ({
            type: key,
            products: [...value.dbChildren]
        }));

        formData.append("products_list", JSON.stringify(productsItems));

        const response = await fetch(configDataRoom.ajaxurl, {
            method: "POST",
            body: formData,
        });

        buttonHtml.innerHTML = oldText;

        if (!response.ok) {
            return null;
        }

        const jsonData = await response.json();

        if (!jsonData.success) {
            const errorMessage = jsonData.data?.message || "Settings save failed.";
   
            if (messageDiv) {
                messageDiv.innerHTML = `<span style="color:red;">${errorMessage}</span>`;
            }

            return null;
        }

        // success
        const data = jsonData.data;

        if (messageDiv) {
            messageDiv.innerHTML = `<span style="color:green;">${data.message}</span>`;

            setTimeout(() => {
                messageDiv.innerHTML = '';
            }, 1000);

        }

        roomState.currentConfigId = data.config_id;


    } catch (e) {
        buttonHtml.innerHTML = oldText;
        return null;
    }
}
