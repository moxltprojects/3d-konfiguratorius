import * as THREE from './three/three.module.js';
import { OrbitControls } from './three/OrbitControls.js';
import { GLTFLoader } from './three/GLTFLoader.js';
import { FontLoader } from './three/FontLoader.js';
import { DragControls } from './three/DragControls.js';
import { TextGeometry } from './three/TextGeometry.js';
import * as BufferGeometryUtils from './three/BufferGeometryUtils.js';

let imageContainer;
let configFurnitureImgHtml = '';
let imageBlockWidth = 0;
let settingsImageCanvas = null;
let settingsImageHtml = '';
const ROOM_TYPE_SINGLE_WALL = 'single-wall';
const ROOM_TYPE_WITH_CORNER = 'with-corner';
const DIMENSION_TYPE = 'dimensions';
const DIMENSION_TYPE_BOTTOM = 'bottom';
const DIMENSION_TYPE_BOTTOM_CORNER = 'bottom-corner';
const DIMENSION_TYPE_TOP = 'top';
const DIMENSION_TYPE_TOP_CORNER = 'top-corner';
const DIMENSION_TYPE_FULL = 'full';
const DIMENSION_TYPE_FULL_CORNER = 'full-corner';
const DIMENSION_TYPE_HEIGHT = 'height';
const DIMENSION_TYPE_DEPTH = 'depth';
const DIMENSION_TYPE_WIDTH = 'width';
const DIMENSION_TYPE_SPACE = 'space';
const DIMENSION_TYPE_VERTICAL_SPACE = 'vertical-space';
const TEXTURE_TYPE = 'textures';
const TEXTURE_TYPE_BASE = 'base';
const TEXTURE_TYPE_FRAME = 'frame';
const STEP_TOP_BOTTOM_DATA_MM = 200; //200mm
let modelScene = null;
const maxSteps  = 4;
let imageCanvasData = null;
let PRICE_CM_CHUNK = 10;

window.initFurnitureConfig =  async function initFurnitureConfig(productId, userId) {
    const container = document.querySelector('.config-furniture-shortcode');
    let [
        fullContent, 
        configId, 
        furnitureList,
        configSettings,
        displayImageFiles,
        defaultFurnitureDimensios,
        cornerFurnitureData,
        roomDimensions,
        textures,
        total,
    ] = await getShortcodeContent(productId);

    if(!fullContent) return;

    container.innerHTML = fullContent;
    // imageContainer = container.querySelector('.display-container');
    // imageCanvasData = await createImageCanvas();

    await initConfigFunctions(
        userId,
        container, 
        configId,
        furnitureList,
        configSettings,
        productId,
        fullContent, 
        displayImageFiles,
        defaultFurnitureDimensios,
        cornerFurnitureData,
        roomDimensions,
        textures,
        total,
    );

}

async function initConfigFunctions(
    userId,
    container, 
    configId,
    furnitureList,
    configSettings,
    productId,
    fullContent, 
    displayImageFiles,
    defaultFurnitureDimensios,
    cornerFurnitureData,
    roomDimensions,
    textures,
    total,
) {
    container = container.querySelector('.config-furniture-main-content');
    const assetsUrl = configData.assetsUrl;

    const frontNodesGlb = [
        'surface0',
        'surface1', 
        'surface0_1', 
        'surface1_1', 
        'surface0_2', 
        'surface1_2', 
        'surface0_3', 
        'surface1_3', 
        'surface0_4',
        'surface1_4',
        'surface0_5',
        'surface1_5',
        // 'surface0_6', 
        // 'surface1_6', 
        // 'surface0_7', 
        // 'surface1_7', 
        'surface0_8', 
        'surface1_8', 
        'surface0_9',
        'surface1_9',
        'surface0_10',
        'surface1_10',
        'surface0_11',
        'surface1_11'
    ];

    const frontNodesDisplay = [
        'node1',
        'node2',
        'node3',
        'node4',
        'node5',
        'node6',
        'node7',
        'node10',
        'node11',
        'node12',
        'node14',
        'node15',
        'node16',
        'node20',
        'node21',
        'node22',
        'node23',
        'node24',
        'node30',
        'node31',
        'node32',
        'node33',
        'node34',
        // 'node40',
        // 'node41',
        // 'node42',
        // 'node43',
        // 'node50',
        // 'node51',
        // 'node52',
        // 'node53',
        'node74',
        'node75',
        'node76',
        'node77',
        'node78',
        'node79',
        'node80',
        'node81',
        'node82',
        'node83',
        'node84',

    ];
    const floorThickness = 20;
    const wallThickness = 20;

    // const THREE = await import(assetsUrl + '/js/three/three.module.js');
    // const { OrbitControls } = await import(assetsUrl + '/js/three/OrbitControls.js');
    // const { GLTFLoader } = await import(assetsUrl + '/js/three/GLTFLoader.js');
    // const { DragControls  } = await import(assetsUrl + '/js/three/DragControls.js');
    
    let modelChildrenList = furnitureList;
    let threeJSRendered = null;
    let threeJSCamera = null;
    let threeJSControls = null;
    let room3DGroup = null;
    let roomType = null;
    let threeJSRenderedBasicDisplay = null, threeJSCameraBasicDisplay = null, arrowImgTextureTop = null, arrowImgTextureBottom = null, arrowImgTextureLeft = null, arrowImgTextureRight = null, threeJSControlsBasicDisplay = null, basicDisplayScene = null, basicDisplayXPaddingPx = 80;
    let basicDisplayXPaddingUnits = 0; 
    let rootGroup = null;
    let basicDisplayBottomObj = null;
    let basicDisplayTopObj = null;
    let basicDisplayFullObj = null;
    let basicDisplayContainer = container.querySelector('.progress-content .basic-settings .display-container .basic-settings-display-image .display-image-inner');
    let visibleModelDimensionArrows = false;

    const myCabinetContent = container.querySelector('.play-edit-summary .main-settings-sidebar .cabinets .my-cabinets-list');
    const myItemsList = myCabinetContent.querySelector('.my-cabinets-list-inner');
    const summaryItemsList = container.querySelector('.play-edit-summary .summary-cabinets-list-inner');
    const dynamicLists = container.querySelectorAll('.play-edit-summary .dynamic-list-inner');
    const myCabinetTab = container.querySelector('.tabs button[data-type="my-cabinets"]');
    const totalContainer = container.querySelector('.play-edit-summary .total-container .price-block .number');

    /******** textures ********/
    const { base: currentBaseData, frame: currentFrameData } = textures;
    let currentBaseId = currentBaseData.id;
    let currentFrameId = currentFrameData.id;
    let currentBasePrice = parseFloat(currentBaseData.price);
    let currentFramePrice = parseFloat(currentFrameData.price);
    let textureBase = null;
    let textureFrame = null;

    changeTextureValue();

    /******** dimensions ********/
    const { bottom: bottomDisplayFile, top: topDisplayFile, full: fullDisplayFile } = displayImageFiles;
    const { largest_height_val: largestHeight, vertical_space: defaultVerticalSpace, bottom: bottomDimensions, top: topDimensions, full: fullDimensions } = defaultFurnitureDimensios;
    const { min_height: bottomMinHeight, height: defaultBottomHeight, depth: defaultbottomFullDepth, min_depth: bottomMinDepth } = bottomDimensions;
    const { min_height: topMinHeight, height: defaultTopHeight, depth: defaultTopDepth, min_depth: topMinDepth } = topDimensions;
    const { min_height: fullMinHeight, height: defaultFullHeight, min_depth: fullMinDepth } = fullDimensions;
    const globalMinDepth = (topMinDepth < bottomMinDepth ? topMinDepth : bottomMinDepth) - 120;
    const { 
        bottom: bottomCornerData, 
        top: topCornerData, 
        full: fullCornerData, 
    } = cornerFurnitureData;
    let { 
        id: cornerBottomFurnitureId, 
        width: cornerBottomWidth, 
        depth: cornerBottomDepth,
    } = bottomCornerData;
    let { 
        id: cornerTopFurnitureId, 
        width: cornerTopWidth, 
        depth: cornerTopDepth,
    } = topCornerData;
    let { 
        full_id: cornerFullFurnitureId, 
        width: cornerFullWidth, 
        depth: cornerFullDepth 
    } = fullCornerData;

    let cornerBottomWidth3d = 0;
    let cornerBottomHeight3d = 0;
    let cornerBottomSpace3d = 0;
    let cornerBottomDepth3d = 0;
    let cornerTopWidth3d = 0;
    let cornerTopHeight3d = 0;
    let cornerTopDepth3d = 0;
    let cornerFullWidth3d = 0;
    let cornerFullDepth3d = 0;

    const dimensions = {
        bottomHeight: defaultBottomHeight,
        bottomFullDepth: defaultbottomFullDepth,
        topHeight: defaultTopHeight,
        topDepth: defaultTopDepth,
        fullHeight: defaultFullHeight,
        verticalSpace: defaultVerticalSpace,
    };
    let bottomScaleY = 0;

    /******** progress ********/
    const progressBar = container.querySelector('.top-bar .config-progress-bar');
    const allProgressButtons = progressBar.querySelectorAll('button'); 
    let oldCurrentProgressButton = progressBar.querySelector(`button.current`);
    let currentStep = parseInt(container.getAttribute('data-progress'));

    stepsNavigate();

    /******** dimensions ********/
    changeDimensionsValue();
    // changeItemDimensionWidthValue();

    /******** select room options ********/
    const model3dContainer = container.querySelector('.model-display-container .room-model-container-inner');
    const { height: defaultRoomHeight, depth: defaultRoomDepth, width: defaultRoomWidth } = roomDimensions;
    let roomHeight = defaultRoomHeight;
    let roomDepth = defaultRoomDepth;
    let roomWidth = defaultRoomWidth;
    let modelRoomWidth = 0;
    let modelRoomHeight = 0;
    let modelRoomDepth = 0;
    let defaultBottomReferenceY = 0;

    setTextureLoader(currentBaseData.image, currentFrameData.image);
    renderBasicImage3dContainer();

    initModelSettings();
    initRoomType(true);
    changeRoomType();
    changeRoomDimensionsValue();

    /******** play - edit - tab ********/
    // const addFurnitureButtons = container.querySelectorAll('.add-cabinet-item button[data-action_type="add"]');

    initCabinetTabs();
    initCabinetTypes();
    initAddFurnitureMethod();
    initDuplicateFurnitureMethod();

    initExistingFurnitureEditMethod();

    initSettingsSave();

    initAddToCart();

    window.addEventListener('resize', resize3dModel, false);
    window.addEventListener('resize', resizeBasicDisplay3dModel, false);
    

    function setTextureLoader(baseSrc, frameSrc) {
        setBaseTextureLoader(baseSrc);
        setFrameTextureLoader(frameSrc);

        const textureLoader = new THREE.TextureLoader();
        arrowImgTextureTop = textureLoader.load(assetsUrl + '/images/arrow-top.svg', (tex) => {
            tex.minFilter = THREE.LinearFilter;
            tex.magFilter = THREE.LinearFilter;
            tex.anisotropy = threeJSRenderedBasicDisplay.capabilities.getMaxAnisotropy(); // optional, crisper at angles
            tex.needsUpdate = true;
        });
        arrowImgTextureBottom = textureLoader.load(assetsUrl + '/images/arrow-bottom.svg', (tex) => {
            tex.minFilter = THREE.LinearFilter;
            tex.magFilter = THREE.LinearFilter;
            tex.anisotropy = threeJSRenderedBasicDisplay.capabilities.getMaxAnisotropy(); // optional, crisper at angles
            tex.needsUpdate = true;
        });
        arrowImgTextureLeft = textureLoader.load(assetsUrl + '/images/arrow-left.svg', (tex) => {
            tex.minFilter = THREE.LinearFilter;
            tex.magFilter = THREE.LinearFilter;
            tex.anisotropy = threeJSRenderedBasicDisplay.capabilities.getMaxAnisotropy(); // optional, crisper at angles
            tex.needsUpdate = true;
        });
        arrowImgTextureRight = textureLoader.load(assetsUrl + '/images/arrow-right.svg', (tex) => {
            tex.minFilter = THREE.LinearFilter;
            tex.magFilter = THREE.LinearFilter;
            tex.anisotropy = threeJSRenderedBasicDisplay.capabilities.getMaxAnisotropy(); // optional, crisper at angles
            tex.needsUpdate = true;
        });
    }

    function setBaseTextureLoader(src) {
        const textureLoader = new THREE.TextureLoader();
        textureBase = src ? textureLoader.load(src, (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            tex.repeat.set(2, 2); // adjust until wood pattern looks right
        }) : null;
    }

    function setFrameTextureLoader(src) {
        const textureLoader = new THREE.TextureLoader();
        textureFrame = src ? textureLoader.load(src, (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            tex.repeat.set(2, 2);
        }) : null;
    }


    function initModelSettings() {
        const btnShowDimensions = container.querySelectorAll('.model-settings-sidebar button[data-type="show-dimensions"]');
    
        btnShowDimensions.forEach(btnShowDimension => {
            btnShowDimension.addEventListener('click', function(e) {
                e.preventDefault();

                visibleModelDimensionArrows = !visibleModelDimensionArrows;

                if(visibleModelDimensionArrows) {
                    btnShowDimension.classList.add('active');
                    addDimensionArrows();
                } else {
                    btnShowDimension.classList.remove('active');
                    removeDimensionArrows();
                }
            });
        });
    }

    async function initSettingsSave() {
        const saveBtn = container.querySelector('.top-bar button[data-action_type="save-settings"]');

        saveBtn.addEventListener('click', async function(e) {
            e.preventDefault();

            if(!userId) {
                await openLoginModal(saveBtn);
                return;
            }

            const { bottomHeight, bottomFullDepth, topHeight, topDepth, fullHeight, verticalSpace } = dimensions;

            const dataResponse = await saveUserSettingsAjax(
                container,
                saveBtn,
                configId,
                productId,
                currentBaseId,
                currentFrameId,
                roomType,
                roomHeight,
                roomDepth,
                roomWidth,
                bottomHeight,
                bottomFullDepth,
                topHeight,
                topDepth,
                fullHeight,
                verticalSpace,
                modelChildrenList
            );

            if(dataResponse) {
                configId = dataResponse.config_id;
                modelChildrenList = dataResponse.furniture_list;
            }

        });
    }

    function initAddToCart() {
        const addToCartBtn = container.querySelector('.buy-container .config_add_to_cart_button');

        if(!addToCartBtn) return;

        addToCartBtn.addEventListener('click', async function(e) {
            e.preventDefault();

            if(!userId) {
                openLoginModal();
                return;
            }

            const { bottomHeight, bottomFullDepth, topHeight, topDepth, fullHeight, verticalSpace } = dimensions;

            addToCartAjax(
                container, 
                addToCartBtn, 
                productId, 
                configId, 
                userId, 
                imageCanvasData,
                currentBaseId,
                currentFrameId,
                roomType,
                roomHeight,
                roomDepth,
                roomWidth,
                bottomHeight,
                bottomFullDepth,
                topHeight,
                topDepth,
                fullHeight,
                verticalSpace,
                modelChildrenList
            );
        });

    }

    async function saveUserSettings(buttonHtml) {
        if(!userId) return;
        const loginRegisterModal = container.querySelector('.login-register-modal');

        if(loginRegisterModal) {
            loginRegisterModal.remove();
        }

        const { bottomHeight, bottomFullDepth, topHeight, topDepth, fullHeight, verticalSpace } = dimensions;

        const dataResponse = await saveUserSettingsAjax(
            container,
            buttonHtml,
            configId,
            productId,
            currentBaseId,
            currentFrameId,
            roomType,
            roomHeight,
            roomDepth,
            roomWidth,
            bottomHeight,
            bottomFullDepth,
            topHeight,
            topDepth,
            fullHeight,
            verticalSpace,
            modelChildrenList
        );

        if(dataResponse) {
            configId = dataResponse.config_id;
            modelChildrenList = dataResponse.furniture_list;
        }

    }

    function openLoginModal(btnHtml) {
        const loginFormHtml = createLoginHtml();
        const registerFormHtml = createRegisterHtml();
        container.insertAdjacentHTML('beforeend', '<div class="login-register-modal"><div class="login-register-modal-main"><button type="button" class="close-btn">&#x2715;</button><div class="login-register-modal-inner"></div></div></div>');

        toggleLoginRegisterModalContent(loginFormHtml, registerFormHtml, btnHtml);

        removeLoginModal();
    }

    function removeLoginModal() {
        const modal = container.querySelector('.login-register-modal');
        const closeButton = modal.querySelector('.close-btn');

        closeButton.addEventListener('click', function(e) {
            e.preventDefault();
            modal.remove();
        });

        modal.addEventListener('click', function(e) {
            const target = e.target;
            if(!target.classList.contains('login-register-modal')) return;

            modal.remove();
        });
    }

    function toggleLoginRegisterModalContent(loginFormHtml, registerFormHtml, btnHtml) {
        const loginRegisterModal = container.querySelector('.login-register-modal-inner');
        loginRegisterModal.innerHTML = loginFormHtml;

        const loginSubmit = loginRegisterModal.querySelector('#loginForm button[type="submit"]');

        loginSubmit.addEventListener('click', async function(e) {
            e.preventDefault();
            userId = await loginAjax(loginSubmit);

            setTimeout(() => {
                saveUserSettings(btnHtml);
            }, 500);
        });

        const registerFormBtn = loginRegisterModal.querySelector('.login-container button[data-action_type="set-register-form"]');

        registerFormBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            loginRegisterModal.innerHTML = registerFormHtml;
            const loginFormBtn = await loginRegisterModal.querySelector('.register-container button[data-action_type="set-login-form"]');

            const registerSubmit = await loginRegisterModal.querySelector('#registerForm button[type="submit"]');

            registerSubmit.addEventListener('click', async function(e) {
                e.preventDefault();
                userId = await registerAjax(registerSubmit);

                setTimeout(() => {
                    saveUserSettings(btnHtml);
                }, 500);
            });

            loginFormBtn.addEventListener('click', function(e) {
                e.preventDefault();
                toggleLoginRegisterModalContent(loginFormHtml, registerFormHtml, btnHtml);
            });
        });
    }

    async function renderBasicImage3dContainer() {
        const mmToUnits = 0.001; 
        const zoomOut = 1.17;
        const { bottomHeight, bottomFullDepth, topHeight, topDepth, fullHeight, verticalSpace } = dimensions;
        const bottomHeightUnits = bottomHeight * mmToUnits;
        const topHeightUnits = topHeight * mmToUnits;
        const fullHeightUnits = fullHeight * mmToUnits;
        const bottomFullDepthUnits = bottomFullDepth * mmToUnits;
        const topDepthUnits = topDepth * mmToUnits;
        const verticalSpaceUnits = verticalSpace * mmToUnits;
        
        threeJSRenderedBasicDisplay = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });

        // arrowImgTextureTop = textureLoader.load(assetsUrl + '/images/arrow-top.svg');
        // arrowImgTextureBottom = textureLoader.load(assetsUrl + '/images/arrow-bottom.svg');
        // arrowImgTextureLeft = textureLoader.load(assetsUrl + '/images/arrow-left.svg');
        // arrowImgTextureRight = textureLoader.load(assetsUrl + '/images/arrow-right.svg');

        // arrowImgTextureTop = textureLoader.load(assetsUrl + '/images/arrow-top.svg', (tex) => {
        //     tex.minFilter = THREE.LinearFilter;
        //     tex.magFilter = THREE.LinearFilter;
        //     tex.anisotropy = threeJSRenderedBasicDisplay.capabilities.getMaxAnisotropy(); // optional, crisper at angles
        //     tex.needsUpdate = true;
        // });
        // arrowImgTextureBottom = textureLoader.load(assetsUrl + '/images/arrow-bottom.svg', (tex) => {
        //     tex.minFilter = THREE.LinearFilter;
        //     tex.magFilter = THREE.LinearFilter;
        //     tex.anisotropy = threeJSRenderedBasicDisplay.capabilities.getMaxAnisotropy(); // optional, crisper at angles
        //     tex.needsUpdate = true;
        // });
        // arrowImgTextureLeft = textureLoader.load(assetsUrl + '/images/arrow-left.svg', (tex) => {
        //     tex.minFilter = THREE.LinearFilter;
        //     tex.magFilter = THREE.LinearFilter;
        //     tex.anisotropy = threeJSRenderedBasicDisplay.capabilities.getMaxAnisotropy(); // optional, crisper at angles
        //     tex.needsUpdate = true;
        // });
        // arrowImgTextureRight = textureLoader.load(assetsUrl + '/images/arrow-right.svg', (tex) => {
        //     tex.minFilter = THREE.LinearFilter;
        //     tex.magFilter = THREE.LinearFilter;
        //     tex.anisotropy = threeJSRenderedBasicDisplay.capabilities.getMaxAnisotropy(); // optional, crisper at angles
        //     tex.needsUpdate = true;
        // });

        basicDisplayScene = new THREE.Scene();
        const parentWidthPx = basicDisplayContainer.clientWidth;
        const parentWidthUnits = parentWidthPx * mmToUnits * zoomOut;
        const parentHeightPx = basicDisplayContainer.clientHeight;
        const objectHeightUnits = largestHeight * mmToUnits * zoomOut;
        const bottomYUnits = bottomHeightUnits + verticalSpaceUnits;
        const basicDisplayXPaddingUnits = calcBasicDisplayXPaddingUnits(parentWidthPx, parentWidthUnits);
        const widthUnits = parentWidthUnits - basicDisplayXPaddingUnits / 2;

        /*******************/
        /**** set camera ******/
        const fovDeg = 45;
        const aspect = parentWidthPx / parentHeightPx;
        const near = 0.1;
        const far = 10000;

        threeJSCameraBasicDisplay = new THREE.PerspectiveCamera(fovDeg, aspect, near, far);

        // Compute camera distance so objectHeightUnits fits canvas height exactly
        const fovRad = THREE.MathUtils.degToRad(fovDeg);
        const distance = objectHeightUnits / (2 * Math.tan(fovRad / 2));

        threeJSCameraBasicDisplay.position.set(0, objectHeightUnits / 2, distance);
        threeJSCameraBasicDisplay.lookAt(0, objectHeightUnits / 2.15, 0);
        /**** end set camera ******/

        // Renderer
        threeJSRenderedBasicDisplay.setSize(parentWidthPx, parentHeightPx);
        threeJSRenderedBasicDisplay.setPixelRatio(window.devicePixelRatio);
        basicDisplayContainer.appendChild(threeJSRenderedBasicDisplay.domElement);

        // basic lights
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
        hemiLight.position.set(0, 200, 0);
        basicDisplayScene.add(hemiLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(100, 100, 200);
        basicDisplayScene.add(dirLight);
        // threeJSRenderedBasicDisplay.setClearColor(0x333333, 1);

        rootGroup = new THREE.Group();
        basicDisplayScene.add(rootGroup);
        rootGroup.rotation.y = THREE.MathUtils.degToRad(-30);

        /**** Load Models ****/
        basicDisplayFullObj = await renderBaseImage(rootGroup, fullDisplayFile, fullHeightUnits, bottomFullDepthUnits, widthUnits, textureBase, textureFrame, DIMENSION_TYPE_FULL, basicDisplayXPaddingUnits);
        basicDisplayBottomObj = await renderBaseImage(rootGroup, bottomDisplayFile, bottomHeightUnits, bottomFullDepthUnits, widthUnits, textureBase, textureFrame, DIMENSION_TYPE_BOTTOM, basicDisplayXPaddingUnits);
        basicDisplayTopObj = await renderBaseImage(rootGroup, topDisplayFile, topHeightUnits, topDepthUnits, widthUnits, textureBase, textureFrame, DIMENSION_TYPE_TOP, basicDisplayXPaddingUnits, bottomYUnits);

        function animate() {
            requestAnimationFrame(animate);

            threeJSRenderedBasicDisplay.render(basicDisplayScene, threeJSCameraBasicDisplay);
        }

        animate();

        createBasicDisplayDimensionArrows();
    }

    function renderBaseImage(rootGroup, urlSrc, itemHeight, itemDepth, itemWidth, textureBase, textureFrame, type, basicDisplayXPaddingUnits, bottomYUnits = 0) {
        return new Promise((resolve, reject) => {
                const loader = new GLTFLoader();

                loader.load(urlSrc, function (childGltf) {
                    const childMeshGroup = childGltf.scene;

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
                            let texture = textureBase;
       
                            if(frontNodesDisplay.includes(name)) {
                                texture = textureFrame;
                            }

                            node.material = new THREE.MeshStandardMaterial({
                                map: texture,
                                metalness: 0.1,    // little reflection
                                roughness: 0.8,    // wood is not glossy
                                // envMap: modelScene.userData.envMap || null
                            });
                            node.material.needsUpdate = true;

                            node.userData.originalMaterial = {
                                color: node.material.color.clone(),
                                opacity: node.material.opacity,
                                transparent: node.material.transparent
                            };
                        }
                    });

                    // const childMeshGroup = new THREE.Group();
                    // childMeshList.forEach(mesh => {
                    //     mesh.parent.remove(mesh);
                    //     childMeshGroup.add(mesh);
                    // });
                    rootGroup.add(childMeshGroup);
                    // childMeshGroup.rotation.y = THREE.MathUtils.degToRad(-30);

                    // compute bounding box
                    const childBox = new THREE.Box3().setFromObject(childMeshGroup);
                    const childSize = new THREE.Vector3();
                    childBox.getSize(childSize);

                    childMeshGroup.userData.dimensions = [];
                    childMeshGroup.userData.originalSize = childSize.clone();

                    // scale object to match desired dimensions in scene units
                    const scaleX = itemWidth / childSize.x;
                    const scaleY = itemHeight / childSize.y;
                    const scaleZ = itemDepth / childSize.z;
                    childMeshGroup.scale.set(scaleX, scaleY, scaleZ);

                    // recompute scaled size
                    const scaledBox = new THREE.Box3().setFromObject(childMeshGroup);
                    const scaledSize = new THREE.Vector3();
                    scaledBox.getSize(scaledSize);

                    childMeshGroup.userData.scaledSize = scaledSize.clone();

                    // position object: bottom aligned, optional x offset
                    let leftAdditional = type === DIMENSION_TYPE_FULL ? 0 : scaledSize.x;
                    const posX = basicDisplayXPaddingUnits + leftAdditional - itemWidth / 2; // adjust as needed
                    const posY = bottomYUnits + 0.18; // bottom aligned
                    const posZ = 0; // adjust depth if needed

                    childMeshGroup.position.set(posX, posY, posZ);

                    // basicDisplayScene.add(childMeshGroup);
                    // rootGroup.add(childMeshGroup);
                    resolve(childMeshGroup);
                },
                undefined,
                (error) => {
                    console.error("❌ Error loading GLB:", error);
                }
            );
        });
    }

    function changeBaseImageDimensions() {
        const mmToUnits = 0.001; 
        const { bottomHeight, topHeight, fullHeight, verticalSpace, bottomFullDepth, topDepth } = dimensions;

        const itemHeightBottomUnits = bottomHeight * mmToUnits;
        const itemHeightTopUnits = topHeight * mmToUnits;
        const itemHeightFullUnits = fullHeight * mmToUnits;
        const itemTopSpaceUnits = verticalSpace * mmToUnits;

        const itemDepthBottomUnits = bottomFullDepth * mmToUnits;
        const itemDepthTopUnits = topDepth * mmToUnits;
        const itemDepthFullUnits = bottomFullDepth * mmToUnits;

        const bottomOriginalSizeY = basicDisplayBottomObj.userData.originalSize.y;
        const topOriginalSizeY = basicDisplayTopObj.userData.originalSize.y;
        const fullOriginalSizeY = basicDisplayFullObj.userData.originalSize.y;

        const bottomOriginalSizeZ = basicDisplayBottomObj.userData.originalSize.z;
        const topOriginalSizeZ = basicDisplayTopObj.userData.originalSize.z;
        const fullOriginalSizeZ = basicDisplayFullObj.userData.originalSize.z;

        const bottomScaleY = itemHeightBottomUnits / bottomOriginalSizeY;
        const topScaleY = itemHeightTopUnits / topOriginalSizeY;
        const fullScaleY = itemHeightFullUnits / fullOriginalSizeY;

        const bottomScaleZ = itemDepthBottomUnits / bottomOriginalSizeZ;
        const topScaleZ = itemDepthTopUnits / topOriginalSizeZ;
        const fullScaleZ = itemDepthFullUnits / fullOriginalSizeZ;

        basicDisplayBottomObj.scale.y = bottomScaleY;
        basicDisplayTopObj.scale.y = topScaleY;
        basicDisplayFullObj.scale.y = fullScaleY;

        basicDisplayBottomObj.scale.z = bottomScaleZ;
        basicDisplayTopObj.scale.z = topScaleZ;
        basicDisplayFullObj.scale.z = fullScaleZ;

        // basicDisplayTopObj.position.y = bottomScaleY + itemTopSpaceUnits + (topScaleY / 2);
        // basicDisplayTopObj.position.y = (bottomOriginalSizeY * bottomScaleY) + itemTopSpaceUnits + (topOriginalSizeY * topScaleY) / 2;
        basicDisplayTopObj.position.y = (bottomOriginalSizeY * bottomScaleY) + itemTopSpaceUnits;
    
        createBasicDisplayDimensionArrows();
    }

    function changeBaseImageDepth() {
        const mmToUnits = 0.001; 
        const { bottomFullDepth, topDepth } = dimensions;

        const itemDepthBottomUnits = bottomFullDepth * mmToUnits;
        const itemDepthTopUnits = topDepth * mmToUnits;
        const itemDepthFullUnits = bottomFullDepth * mmToUnits;

        const bottomOriginalSizeZ = basicDisplayBottomObj.userData.originalSize.z;
        const topOriginalSizeZ = basicDisplayTopObj.userData.originalSize.z;
        const fullOriginalSizeZ = basicDisplayFullObj.userData.originalSize.z;

        const bottomScaleZ = itemDepthBottomUnits / bottomOriginalSizeZ;
        const topScaleZ = itemDepthTopUnits / topOriginalSizeZ;
        const fullScaleZ = itemDepthFullUnits / fullOriginalSizeZ;

        basicDisplayBottomObj.scale.z = bottomScaleZ;
        basicDisplayTopObj.scale.z = topScaleZ;
        basicDisplayFullObj.scale.z = fullScaleZ;

        // basicDisplayTopObj.position.y = bottomScaleY + itemTopSpaceUnits + (topScaleY / 2);
        // basicDisplayTopObj.position.y = (bottomOriginalSizeY * bottomScaleY) + itemTopSpaceUnits + (topOriginalSizeY * topScaleY) / 2;
        // basicDisplayTopObj.position.y = (bottomOriginalSizeY * bottomScaleY) + itemTopSpaceUnits;
    }

    function calcBasicDisplayXPaddingUnits(parentWidthPx, parentWithUnits) {
        const basicDisplayXPaddingUnitsPercent = basicDisplayXPaddingPx * 100 / parentWidthPx;
        const units = parentWithUnits * basicDisplayXPaddingUnitsPercent / 100;

        return units;
    }

    //   function renderBaseImage(parentHeightPx, parentWidthPx, parentHeightMm, urlSrc, itemHeight, itemDepth, itemWidth, textureBase, textureFrame, type, bottomY = 0) {
    //     const loader = new GLTFLoader();
    //     const [heightPx, depthPx, widthPx, xAdditional] = get3DDisplayDimensions(itemHeight, itemDepth, itemWidth, parentHeightMm, parentHeightMm, parentHeightPx, parentWidthPx);

    //     loader.load(
    //         urlSrc,
    //         function (childGltf) {
    //             const childModel = childGltf.scene;
    //             const childMeshList = [];

    //             childModel.traverse(node => {
    //                 if (node.isMesh) {
    //                     childMeshList.push(node);
    //                     const name = (node.name || "").toLowerCase();
    //                     let texture = textureBase;
    //                     if (frontNodes.includes(name)) {
    //                         texture = textureFrame;
    //                     }

    //                     node.material = new THREE.MeshStandardMaterial({
    //                         map: texture,
    //                         color: 0xffffff,
    //                         metalness: 0,
    //                         roughness: 1,
    //                     });
    //                     node.material.needsUpdate = true;

    //                     node.userData.originalMaterial = {
    //                         color: node.material.color.clone(),
    //                         opacity: node.material.opacity,
    //                         transparent: node.material.transparent
    //                     };
    //                 }
    //             });

    //             const childMeshGroup = new THREE.Group();
    //             childMeshList.forEach(mesh => {
    //                 mesh.parent.remove(mesh);
    //                 childMeshGroup.add(mesh);
    //             });

    //             // compute bounding box
    //             const childBox = new THREE.Box3().setFromObject(childMeshGroup);
    //             const childSize = new THREE.Vector3();
    //             childBox.getSize(childSize);

    //             const scaleX = widthPx / childSize.x;
    //             const scaleY = heightPx / childSize.y;
    //             const scaleZ = depthPx / childSize.z;
    //             childMeshGroup.scale.set(scaleX, scaleY, scaleZ);

    //             const scaledBox = new THREE.Box3().setFromObject(childMeshGroup);
    //             const scaledSize = new THREE.Vector3();
    //             scaledBox.getSize(scaledSize);

    //             let leftAdditional = type === DIMENSION_TYPE_FULL ? 0 : scaledSize.x;
    //             const posX = xAdditional + leftAdditional - scaledSize.x / 2;
    //             const posY = bottomY - scaledSize.y / 2; // bottom aligned
    //             const posZ = 0; // adjust if needed

    //             childMeshGroup.position.set(posX, posY, posZ);

    //             basicDisplayScene.add(childMeshGroup);

    //             console.log("✅ Model visible:", urlSrc, childMeshGroup);
    //         },
    //         (xhr) => console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`),
    //         (error) => console.error("❌ Error loading GLB:", error)
    //     );
    // }

//     function renderBaseImage(parentHeightPx, parentWidthPx, parentHeightMm, urlSrc, itemHeight, itemDepth, itemWidth, textureBase, textureFrame, type, bottomY = 0) {
//         const loader = new GLTFLoader();
//         const [heightPx, depthPx, widthPx, xAdditional] = get3DDisplayDimensions(itemHeight, itemDepth, itemWidth, parentHeightMm, parentHeightMm, parentHeightPx, parentWidthPx);

//         loader.load(
//             urlSrc,
//             function (childGltf) {
//                 const childModel = childGltf.scene;
//                 const childMeshList = [];

//                 childModel.traverse(node => {
//                     if (node.isMesh) {
//                         childMeshList.push(node);
//                         const name = (node.name || "").toLowerCase();
//                         let texture = textureBase;
//                         if (frontNodes.includes(name)) {
//                             texture = textureFrame;
//                         }

//                         node.material = new THREE.MeshStandardMaterial({
//                             map: texture,
//                             color: 0xffffff,
//                             metalness: 0,
//                             roughness: 1,
//                         });
//                         node.material.needsUpdate = true;

//                         node.userData.originalMaterial = {
//                             color: node.material.color.clone(),
//                             opacity: node.material.opacity,
//                             transparent: node.material.transparent
//                         };
//                     }
//                 });

//                 const childMeshGroup = new THREE.Group();
//                 childMeshList.forEach(mesh => {
//                     mesh.parent.remove(mesh);
//                     childMeshGroup.add(mesh);
//                 });

//                 // compute bounding box
//                 const childBox = new THREE.Box3().setFromObject(childMeshGroup);
//                 const childSize = new THREE.Vector3();
//                 childBox.getSize(childSize);

//                 const scaleX = widthPx / childSize.x;
//                 const scaleY = heightPx / childSize.y;
//                 const scaleZ = depthPx / childSize.z;
//                 childMeshGroup.scale.set(scaleX, scaleY, scaleZ);

//                 const scaledBox = new THREE.Box3().setFromObject(childMeshGroup);
//                 const scaledSize = new THREE.Vector3();
//                 scaledBox.getSize(scaledSize);

//                 // // compute scale to fit object height exactly in the camera view
//                 // const distance = threeJSCameraBasicDisplay.position.z; // assuming object is at Z=0
//                 // const fovRad = THREE.MathUtils.degToRad(threeJSCameraBasicDisplay.fov);
//                 // const visibleHeight = 2 * distance * Math.tan(fovRad / 2); // height in scene units

//                 // const scaleFactor = visibleHeight / childSize.y; // scale so object fills vertical view
//                 // childMeshGroup.scale.set(scaleFactor, scaleFactor, scaleFactor);

//                 // position object relative to scene (bottom-aligned)
//                 let leftAdditional = type === DIMENSION_TYPE_FULL ? 0 : scaledSize.x;
//                 const posX = xAdditional + leftAdditional - scaledSize.x / 2;
//                 const posY = bottomY - scaledSize.y / 2; // bottom aligned
//                 const posZ = 0; // adjust if needed

//                 childMeshGroup.position.set(posX, posY, posZ);


//                 // // compute scale based on camera view and scene size
//                 // const distance = threeJSCameraBasicDisplay.position.z - 0; // assuming posZ = 0
//                 // const fov = threeJSCameraBasicDisplay.fov * (Math.PI / 180);
//                 // const visibleHeight = 2 * distance * Math.tan(fov / 2);
//                 // const visibleWidth = visibleHeight * threeJSCameraBasicDisplay.aspect;

//                 // const scaleX = widthPx / childSize.x;
//                 // const scaleY = heightPx / childSize.y;
//                 // const scaleZ = depthPx / childSize.z;
//                 // childMeshGroup.scale.set(scaleX, scaleY, scaleZ);

//                 // const scaleFactor = Math.min(visibleWidth / childSize.x, visibleHeight / childSize.y); // fit to canvas
//                 // childMeshGroup.scale.set(scaleFactor, scaleFactor, scaleFactor);

//                 // // position the object at exact coordinates relative to scene
//                 // let leftAdditional = type === DIMENSION_TYPE_FULL ? 0 : scaledSize.x;
//                 // // const posX = xAdditional + leftAdditional - scaledSize.x / 2;
//                 // const scaledSize = childSize.clone().multiplyScalar(scaleFactor);
//                 // const posX = xAdditional + leftAdditional - scaledSize.x / 2;
//                 // // const posX = 0;
//                 // const posY = bottomY + (childSize.y * scaleFactor) / 2;
//                 // const posZ = 0; // adjust as needed
//                 // childMeshGroup.position.set(posX, posY, posZ);
// //
// //

//                 // // now position relative to container
//                 // const scaledBox = new THREE.Box3().setFromObject(childMeshGroup);
//                 // const scaledSize = new THREE.Vector3();
//                 // scaledBox.getSize(scaledSize);

//                 // let leftAdditional = type === DIMENSION_TYPE_FULL ? 0 : scaledSize.x;
//                 // console.log(xAdditional)
//                 // const posX = xAdditional + -scaledSize.x / 2 + leftAdditional;
//                 // const posY = scaledSize.y / 2 + bottomY;
//                 // const posZ = 0;

//                 // // console.log("yPosition: ", yPosition);

//                 // childMeshGroup.position.set(posX, posY, posZ);

//                 basicDisplayScene.add(childMeshGroup);

//                 // // === AUTO-FIT CAMERA TO MODEL ===
//                 // const box = new THREE.Box3().setFromObject(childMeshGroup);
//                 // const size = new THREE.Vector3();
//                 // box.getSize(size);
//                 // const center2 = new THREE.Vector3();
//                 // box.getCenter(center2);

//                 // // ✅ Re-center model around origin
//                 // childMeshGroup.children.forEach((mesh) => {
//                 //     mesh.position.sub(center2);
//                 // });

//                 // // Now recompute box after centering
//                 // const newBox = new THREE.Box3().setFromObject(childMeshGroup);
//                 // const newSize = new THREE.Vector3();
//                 // newBox.getSize(newSize);

//                 // const maxDim = Math.max(newSize.x, newSize.y, newSize.z);
//                 // const fov = threeJSCameraBasicDisplay.fov * (Math.PI / 180);
//                 // let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));

//                 // cameraZ *= 1.5; // padding
//                 // threeJSCameraBasicDisplay.position.set(0, 0, cameraZ); // ✅ center camera on world origin
//                 // threeJSCameraBasicDisplay.lookAt(0, 0, 0); // ✅ always look at origin

//                 console.log("✅ Model visible:", urlSrc, childMeshGroup);
//             },
//             (xhr) => console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`),
//             (error) => console.error("❌ Error loading GLB:", error)
//         );
//     }




    function stepsNavigate() {
        const prevButton = container.querySelector('.actions-container .prev-step');
        const nextButton = container.querySelector('.actions-container .next-step');

        prevButton.addEventListener('click', function(e) {
            e.preventDefault();
            const prevStep = currentStep > 1 ? currentStep - 1 : currentStep;
            currentStep = prevStep;
            container.setAttribute('data-progress', prevStep);

            changeCurrentProgressButton(prevStep);
        });

        nextButton.addEventListener('click', function(e) {
            e.preventDefault();
            const nextStep = currentStep < maxSteps ? currentStep + 1 : currentStep;
            currentStep = nextStep;
            container.setAttribute('data-progress', nextStep);

            changeCurrentProgressButton(nextStep);
        });

        allProgressButtons.forEach(button => {
            const stepData = parseInt(button.getAttribute('data-step'));

            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                if(button.classList.contains('current')) return;

                currentStep = stepData;
                container.setAttribute('data-progress', stepData);
                changeCurrentProgressButton(stepData);
            });
        });
        
        function changeCurrentProgressButton(step) {
            const newButton = progressBar.querySelector(`button[data-step="${step}"]`);
            newButton.classList.add('current');

            if(oldCurrentProgressButton) {
                oldCurrentProgressButton.classList.remove('current');
            }

            oldCurrentProgressButton = newButton;
        }

    }

    function changeTextureValue() {
        const baseButtons = container.querySelectorAll(`.texture-list-container[data-type="${TEXTURE_TYPE_BASE}"] .texture-list-item button`);
        const frameButtons = container.querySelectorAll(`.texture-list-container[data-type="${TEXTURE_TYPE_FRAME}"] .texture-list-item button`);
        const baseContainerHeadings = container.querySelectorAll(`.texture-list-container[data-type="${TEXTURE_TYPE_BASE}"] .heading-block .value`);
        const frameContainerHeadings = container.querySelectorAll(`.texture-list-container[data-type="${TEXTURE_TYPE_BASE}"] .heading-block .value`);

        baseButtons.forEach(button => {
            const buttonParent = button.parentNode;
            const btnId = buttonParent.getAttribute('data-id');
            const btnName = buttonParent.getAttribute('data-name');
            const btnSrc = buttonParent.getAttribute('data-src');
            const priceValue = parseFloat(buttonParent.getAttribute('data-price'));

            button.addEventListener('click', function(e) {
                e.preventDefault();
                if(currentBaseId == btnId) return;

                currentBaseId = btnId;
                // currentBaseSrc = btnSrc;
                setBaseTextureLoader(btnSrc);
                currentBasePrice = parseFloat(priceValue);
                updateSettingsDisplay(baseContainerHeadings, TEXTURE_TYPE_BASE, btnId, btnName, btnSrc);
                // changeModelChildrenBaseTexture();
                changeModelChildrenTextureBase(
                    basicDisplayScene.children,
                    frontNodesDisplay,
                    textureBase
                );
                changeModelChildrenTextureBase(
                    modelScene.children.filter(item => item.userData.furnitureId),
                    frontNodesGlb,
                    textureBase
                );
                changeTotals();
            });
        });

        frameButtons.forEach(button => {
            const buttonParent = button.parentNode;
            const btnId = buttonParent.getAttribute('data-id');
            const btnName = buttonParent.getAttribute('data-name');
            const btnSrc = buttonParent.getAttribute('data-src');
            const priceValue = parseFloat(buttonParent.getAttribute('data-price'));

            button.addEventListener('click', function(e) {
                e.preventDefault();
                if(currentFrameId == btnId) return;

                currentFrameId = btnId;
                // currentFrameSrc = btnSrc;
                setFrameTextureLoader(btnSrc);
                currentFramePrice = parseFloat(priceValue);
                updateSettingsDisplay(frameContainerHeadings, TEXTURE_TYPE_FRAME, btnId, btnName, btnSrc);
                changeModelChildrenTextureFrame(
                    basicDisplayScene.children,
                    frontNodesDisplay,
                    textureFrame
                );
                changeModelChildrenTextureFrame(
                    modelScene.children.filter(item => item.userData.furnitureId),
                    frontNodesGlb,
                    textureFrame
                );
                changeTotals();
            });
        });

        function updateSettingsDisplay(containerHeadings, textureType, id, name, src) {
            changeHeadingName();
            changeCurrentItems();
            // setDisplayImageHtml(TEXTURE_TYPE, textureType, src);

            function changeHeadingName() {
                containerHeadings.forEach(headingValue => {
                    headingValue.innerHTML = name;
                });
            }

            function changeCurrentItems() {
                const currentItems = container.querySelectorAll(`.texture-list-container[data-type="${textureType}"] .texture-list-item.current`);
                currentItems.forEach(currentItem => {
                    currentItem.classList.remove('current');
                });

                const newCurrentItems = container.querySelectorAll(`.texture-list-container[data-type="${textureType}"] .texture-list-item[data-id="${id}"]`);
                newCurrentItems.forEach(newCurrentItem => {
                    newCurrentItem.classList.add('current');
                });
            }
            
        }
    }

    function changeDimensionsValue() {
        const dimentionsItemContainers = container.querySelectorAll('.dimension-container:not(.room-layout .dimension-container):not(.edit-container .dimension-container)');
        dimentionsItemContainers.forEach(dimensionContainer => {
            changeSingleDimensionValue(dimensionContainer);
            // const dimensionType = dimentionsContainer.getAttribute('data-dimension_type');
            // const type = dimentionsContainer.getAttribute('data-type');
            // const rangeInput = dimentionsContainer.querySelector('.slider-container input[type="range"]');
            // const rangeNumInput = dimentionsContainer.querySelector('.input-container input[type="number"]');
            // const constName = dimentionsContainer.getAttribute('data-constant_name');

            // rangeInput.addEventListener('change', function(e) {
            //     const value = parseInt(e.target.value);
            //     rangeNumInput.value = value;

            //     setDisplayImageHtml(DIMENSION_TYPE, type, value, dimensionType);
               
            //     dimensions[constName] = value;
            //     changeModelChildrenDimensions();
            // });

            // rangeNumInput.addEventListener('change', function(e) {
            //     let value = e.target.value;
            //     const min = e.target.min;
            //     const max = e.target.max;

            //     if(value < min) {
            //         value = min;
            //     } else if(value > max) {
            //         value = max;
            //     }

            //     rangeInput.value = value;

            //     setDisplayImageHtml(DIMENSION_TYPE, type, value, dimensionType);

            //     dimensions[constName] = value;

            //     changeModelChildrenDimensions();
            // });
        });
    }

     function changeSingleDimensionValue(dimentionContainer) {
        const dimensionType = dimentionContainer.getAttribute('data-dimension_type');
        const type = dimentionContainer.getAttribute('data-type');
        const rangeInput = dimentionContainer.querySelector('.slider-container input[type="range"]');
        const rangeNumInput = dimentionContainer.querySelector('.input-container input[type="number"]');
        const constName = dimentionContainer.getAttribute('data-constant_name');

        rangeInput.addEventListener('change', function(e) {
            const value = parseInt(e.target.value);
            rangeNumInput.value = value;

            // setDisplayImageHtml(DIMENSION_TYPE, type, value, dimensionType);
            
            dimensions[constName] = value;

            changeBaseImageDimensions();
            changeModelChildrenDimensions();
        });

        rangeNumInput.addEventListener('change', function(e) {
            let value = parseInt(e.target.value);
            const min = parseInt(e.target.min);
            const max = parseInt(e.target.max);

            if(value < min) {
                value = min;
            } else if(value > max) {
                value = max;
            }

            rangeInput.value = value;

            // setDisplayImageHtml(DIMENSION_TYPE, type, value, dimensionType);

            dimensions[constName] = value;

            changeBaseImageDimensions();
            changeModelChildrenDimensions();
        });
    }

    function changeItemDimensionWidthValue(item, actionTypeAdd) {
        const dimentionsContainer = item.querySelector('.edit-container .dimension-container');

        if(!dimentionsContainer) return;

        const parent = dimentionsContainer.closest('.cabinet-item');
        const type = dimentionsContainer.closest('.cabinet-item');
        const rangeInput = dimentionsContainer.querySelector('.slider-container input[type="range"]');
        const rangeNumInput = dimentionsContainer.querySelector('.input-container input[type="number"]');
        const valueHtml = parent.querySelector('.dimensions-info .w-value');
        const customId = parent.getAttribute('data-custom_id');

        rangeInput.addEventListener('change', function(e) {
            const value = parseInt(e.target.value);
            rangeNumInput.value = value;
            parent.setAttribute('data-item_width', value);
            valueHtml.innerHTML = value;
  
            // setDisplayImageHtml(DIMENSION_TYPE, type, value, dimensionType);
            
            // changeModelChildrenDimensions();

            if(!actionTypeAdd) {
                editGLBModelWidth(customId, value);
            }
        });

        rangeNumInput.addEventListener('change', function(e) {
            let value = parseInt(e.target.value);
            const min = parseInt(e.target.min);
            const max = parseInt(e.target.max);

            if(value < min) {
                value = min;
            } else if(value > max) {
                value = max;
            }

            rangeInput.value = value;

            parent.setAttribute('data-item_width', value);
            valueHtml.innerHTML = value;

            // setDisplayImageHtml(DIMENSION_TYPE, type, value, dimensionType);

            // changeModelChildrenDimensions();
            if(!actionTypeAdd) {
                editGLBModelWidth(customId, value);
            }
        });
    }

    function changeTotals() {
        let newTotal = 0;

        for(let i = 0; i < modelChildrenList.length; i++) {
            const item = modelChildrenList[i];
            const itemPrice = parseFloat(item.display_price);
            const itemPriceCm3 = parseFloat(item.display_price_cm3);
            const minWidth = parseFloat(item.min_width);
            const minHeight = parseFloat(item.min_height);
            const minDepth = parseFloat(item.min_depth);
            const width = parseFloat(item.width);
            const height = parseFloat(item.height);
            const depth = parseFloat(item.depth);
            // const minCm3 = parseFloat(minWidth * minHeight * minDepth);
       
            // const currentCm3 = parseFloat(width * height * depth);
            // const remainingCm3Mm = parseFloat(parseFloat(currentCm3 - minCm3) / 1000);
            // const remainingCm3Cm = parseFloat(remainingCm3Mm / PRICE_CM_CHUNK);
            // const remainingPriceCm3 = parseFloat(itemPriceCm3 * remainingCm3Cm);
            const remainingCm3Mm = parseFloat(parseFloat((width - minWidth) * (height - minHeight) * (depth - minDepth)) / 1000);
            const remainingCm3Cm = parseFloat(remainingCm3Mm / PRICE_CM_CHUNK);
            const remainingPriceCm3 = parseFloat(itemPriceCm3 * remainingCm3Cm);

            const totalItemPrice = (remainingPriceCm3 + itemPrice) + (currentBasePrice > 0 ? currentBasePrice : 0) + (currentFramePrice > 0 ? currentFramePrice : 0);
            newTotal += parseFloat(totalItemPrice);
        }
        totalContainer.innerHTML = newTotal.toFixed(2);
        total = newTotal;
    }

    function changeTotalByItemTotal(
        displayPrice, 
        displayPriceCm3,
        itemWidth,
        itemMinWidth,
        itemHeight,
        itemMinHeight,
        itemDepth,
        itemMinDepth,
    ) {
        const remainingCm3Mm = parseFloat(parseFloat((itemWidth - itemMinWidth) * (itemHeight - itemMinHeight) * (itemDepth - itemMinDepth)) / 1000);
        
        const remainingCm3Cm = parseFloat(remainingCm3Mm / PRICE_CM_CHUNK);
        const remainingPriceCm3 = parseFloat(displayPriceCm3 * remainingCm3Cm);

        const totalItemPrice = (remainingPriceCm3 + displayPrice) + (currentBasePrice > 0 ? currentBasePrice : 0) + (currentFramePrice > 0 ? currentFramePrice : 0);
        total += parseFloat(totalItemPrice);

        totalContainer.innerHTML = total.toFixed(2);

        return totalItemPrice;
    }

    function changeRoomType() {
        const options = container.querySelectorAll('.room-layout-options button');

        options.forEach(option => {
            const optionParent = option.parentNode;
            option.addEventListener('click', function(e) {
                e.preventDefault();

                if(optionParent.classList.contains('current')) return;

                const currentParent = container.querySelector('.room-layout-options .option.current');

                if(currentParent) currentParent.classList.remove('current');

                optionParent.classList.add('current');

                initRoomType();
            });
        });
    }

    function initRoomType(onPageLoad = false) {
        const currentOption = container.querySelector('.room-layout-options .option.current button');

        roomType = currentOption.getAttribute('data-type');

        if(!roomType) return;

        if(!onPageLoad) {
            modelChildrenList = [];
            changeTotals();

            dynamicLists.forEach(html => {
                html.innerHTML = '';
            });
        }
             
        init3dModel(model3dContainer, roomType);
    }

    function changeRoomDimensionsValue() {
        const dimentionsItemContainers = container.querySelectorAll('.room-layout .dimension-container');
        
        dimentionsItemContainers.forEach(dimentionsContainer => {
            const type = dimentionsContainer.getAttribute('data-type');
            const rangeInput = dimentionsContainer.querySelector('.slider-container input[type="range"]');
            const rangeNumInput = dimentionsContainer.querySelector('.input-container input[type="number"]');

            rangeInput.addEventListener('change', function(e) {
                const value = parseInt(e.target.value);
                rangeNumInput.value = value;
                
                changeDimensionValueSwitch(type, value);

                initRoomType();
            });

            rangeNumInput.addEventListener('change', function(e) {
                let value = parseInt(e.target.value);
                const min = parseInt(e.target.min);
                const max = parseInt(e.target.max);

                if(value < min) {
                    value = min;
                } else if(value > max) {
                    value = max;
                }

                changeDimensionValueSwitch(type, value);

                rangeInput.value = value;

                initRoomType();
            });
        });
        // const inputs = container.querySelectorAll('.room-layout-options .dimension-container .input-container');

        // inputs.forEach(input => {
        //     const 
        // });

        function changeDimensionValueSwitch(type, value) {
            switch(type) {
                case DIMENSION_TYPE_HEIGHT: {
                    roomHeight = value;
                    break;
                }
                case DIMENSION_TYPE_DEPTH: {
                    roomDepth = value;
                    break;
                }

                case DIMENSION_TYPE_WIDTH: {
                    roomWidth = value;
                    break;
                }
                
                default: {
                    roomWidth = value;
                }
            }
        }
    }

    function initCabinetTabs() {
        const tabs = container.querySelectorAll('.play-edit-summary .main-settings-sidebar .cabinets .tabs button');

        tabs.forEach(tab => {
            const type = tab.getAttribute('data-type');
            const content = container.querySelector(`.play-edit-summary .main-settings-sidebar .cabinets .content .tab-content[data-type="${type}"]`);

            tab.addEventListener('click', function(e) {
                e.preventDefault();     
                changeCabinetsTab(tab, content);
                editContainerRemove();
                // if(tab.classList.contains('active')) return;

                // const currentTab = document.querySelector('.play-edit-summary .main-settings-sidebar .cabinets .tabs button.active');
                // const currentContent = document.querySelector('.play-edit-summary .main-settings-sidebar .cabinets .content .content-inner > .tab-content.current');

                // if(currentTab) currentTab.classList.remove('active');
                // if(currentContent) currentContent.classList.remove('current');

                // tab.classList.add('active');
                // if(content) content.classList.add('current');
            });
        });
    }

    function editContainerRemove() {
        const editContainers = container.querySelectorAll('.edit-container.active');

        editContainers.forEach(container => {
            container.classList.remove('active');
            container.innerHTML = '';
        });  
    }

    function changeCabinetsTab(tab, content) {
        if(tab.classList.contains('active')) return;

        const currentTab = document.querySelector('.play-edit-summary .main-settings-sidebar .cabinets .tabs button.active');
        const currentContent = document.querySelector('.play-edit-summary .main-settings-sidebar .cabinets .content .content-inner > .tab-content.current');

        if(currentTab) currentTab.classList.remove('active');
        if(currentContent) currentContent.classList.remove('current');

        tab.classList.add('active');
        if(content) content.classList.add('current');
    }

    function initCabinetTypes() {
        typesClickInit();
        typesGoBack();
        typesEditInit();

        function typesClickInit() {
            const typeButtons = container.querySelectorAll('.play-edit-summary .furniture-types-list .furniture-type-term > button');
            
            typeButtons.forEach(button => {
                const buttonParent = button.parentNode;

                button.addEventListener('click', function(e) {
                    e.preventDefault();

                    if(button.classList.contains('active')) return;

                    const activeButton = container.querySelector('.play-edit-summary .furniture-types-list .furniture-type-term.active');

                    if(activeButton) activeButton.classList.remove('active');

                    buttonParent.classList.add('active');

                });
            });
        }

        function typesGoBack() {
            const goBackBtns = container.querySelectorAll('.furniture-type-term .furniture-list-container > button[data-type="go-back"]');

            goBackBtns.forEach(btn => {
                const parentNode = btn.closest('.furniture-type-term');

                btn.addEventListener('click', function(e) {
                    e.preventDefault();

                    if(parentNode.classList.contains('active')) {
                        parentNode.classList.remove('active')
                    }
                });
            });
        }

        function typesEditInit() {
            const furnitureItems = container.querySelectorAll('.play-edit-summary .furniture-types-list .furniture-list .add-cabinet-item');

            furnitureItems.forEach(furnitureItem => {
                const editBtn = furnitureItem.querySelector('.item-actions-container button[data-type="edit"]');
                const itemData = JSON.parse(furnitureItem.getAttribute('data-item_data'));
                const furnitureId = itemData.furniture_id;
                const type = itemData.type;
                const modelFileSrc = itemData.model_src;
                const displayPrice = itemData.display_price;
                const regularPrice = itemData.regular_price;
                const discountPrice = itemData.discount_price;
                const displayPriceCm3 = itemData.display_price_cm3;
                const minWidth = itemData.min_width;

                editBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    const itemWidth = furnitureItem.getAttribute('data-item_width');
                    createEditModal(furnitureItem, itemData, furnitureId, type, modelFileSrc, itemWidth, minWidth, displayPrice, regularPrice, discountPrice, displayPriceCm3);
                    // const activeEditOld = container.querySelector('.play-edit-summary .furniture-types-list .furniture-list .add-cabinet-item.active-edit');

                    // if(activeEditOld) activeEditOld.classList.remove('active-edit');

                    // furnitureItem.classList.add('active-edit');
                });

                // editContainerGoBack.addEventListener('click', function(e) {
                //     e.preventDefault();

                //     // furnitureItem.classList.remove('active-edit');
                // });


            });
        }
    }

    function initAddFurnitureMethod() {
        const addFurnitureButtons =  container.querySelectorAll('.add-cabinet-item .item-actions-container button[data-action_type="add"]');
        addFurnitureButtons.forEach(furnitureButton => {
            const parent = furnitureButton.closest('.add-cabinet-item');
            const itemData = JSON.parse(parent.getAttribute('data-item_data'));
            const furnitureId = itemData.furniture_id;
            const displayPrice = itemData.display_price;
            const regularPrice = itemData.regular_price;
            const discountPrice = itemData.discount_price;
            const displayPriceCm3 = itemData.display_price_cm3;
            const type = itemData.type;
            const modelFileSrc = itemData.model_src;
            const itemMinWidth = itemData.min_width;

            furnitureButton.addEventListener('click', async function() {
                const itemWidth = parent.getAttribute('data-item_width');
                const customId = Date.now();

                const { itemHeight, itemMinHeight, itemDepth, itemMinDepth } = getItemDimensions(type);

                if(type.includes('corner')) {
                    if(roomType === ROOM_TYPE_SINGLE_WALL) {
                        return;
                    }
                    if(type === DIMENSION_TYPE_FULL_CORNER) {
                        if(cornerBottomFurnitureId || cornerTopFurnitureId || cornerFullFurnitureId) {
                            alert(`Full Corner Furniture already added.`);
                            return;
                        } else {
                            cornerFullFurnitureId = furnitureId;
                        }
                    } else if(type === DIMENSION_TYPE_BOTTOM_CORNER) {
                        if(cornerBottomFurnitureId || cornerFullFurnitureId) {
                            alert(`Bottom Corner Furniture already added.`);
                            return;
                        } else {
                            cornerBottomFurnitureId = furnitureId;
                        }
                    } else {
                        if(cornerTopFurnitureId || cornerFullFurnitureId) {
                            alert(`Top Corner Furniture already added.`);
                            return;
                        } else {
                            cornerTopFurnitureId = furnitureId;
                        }
                    }
                }

                const {itemPositionMm} = await addGLBModel(modelFileSrc, type, furnitureId, customId, displayPrice, regularPrice, discountPrice, displayPriceCm3, itemHeight, itemDepth, itemWidth, itemMinHeight, itemMinDepth, itemMinWidth);
                
                const itemTotal = await changeTotalByItemTotal(
                    displayPrice, 
                    displayPriceCm3,
                    itemWidth,
                    itemMinWidth,
                    itemHeight,
                    itemMinHeight,
                    itemDepth,
                    itemMinDepth,
                );

                const {my_item_html,summary_item_html} = await addFurnitureItem(
                    customId, 
                    furnitureId, 
                    itemWidth,
                    itemHeight,
                    itemDepth,
                    itemPositionMm,
                    itemTotal
                );

                // await changeTotals();
                
                if(my_item_html) {
                    myItemsList.insertAdjacentHTML('beforeend', my_item_html);
                    summaryItemsList.insertAdjacentHTML('beforeend', summary_item_html);
                    changeCabinetsTab(myCabinetTab, myCabinetContent);

                    const myFurnitureItem = myItemsList.querySelector(`.my-cabinet-item[data-custom_id="${customId}"]`);
                    if(myFurnitureItem) {
                        editItemButtonTrigger(myFurnitureItem); 
                        removeItemButtonTrigger(myFurnitureItem, customId, type);
                        duplicateFurnitureTrigger(myFurnitureItem, customId);
                    }
                }
            });
        });
    }

    function initDuplicateFurnitureMethod() {
        const duplicateFurnitureButtons =  container.querySelectorAll('.my-cabinets-list .item-actions-container button[data-action_type="duplicate"]');

        duplicateFurnitureButtons.forEach(furnitureButton => {
            const parent = furnitureButton.closest('.cabinet-item');
            const customId = parent.getAttribute('data-custom_id');
            duplicateFurnitureTrigger(parent, customId);
            // const parent = furnitureButton.closest('.cabinet-item');
            // const customId = parent.getAttribute('data-custom_id');
            // const parent = furnitureButton.closest('.add-cabinet-item');
            // const itemData = JSON.parse(parent.getAttribute('data-item_data'));
            // const furnitureId = itemData.furniture_id;
            // const displayPrice = itemData.display_price;
            // const regularPrice = itemData.regular_price;
            // const discountPrice = itemData.discount_price;
            // const displayPriceCm3 = itemData.display_price_cm3;
            // const type = itemData.type;
            // const modelFileSrc = itemData.model_src;
            // const itemMinWidth = itemData.min_width;

            // furnitureButton.addEventListener('click', async function() {
            //     const itemWidth = parent.getAttribute('data-item_width');
            //     const customId = Date.now();

            //     const { itemHeight, itemMinHeight, itemDepth, itemMinDepth } = getItemDimensions(type);

            //     if(type.includes('corner')) {
            //         if(roomType === ROOM_TYPE_SINGLE_WALL) {
            //             return;
            //         }
            //         if(type === DIMENSION_TYPE_FULL_CORNER) {
            //             if(cornerBottomFurnitureId || cornerTopFurnitureId || cornerFullFurnitureId) {
            //                 alert(`Full Corner Furniture already added.`);
            //                 return;
            //             } else {
            //                 cornerFullFurnitureId = furnitureId;
            //             }
            //         } else if(type === DIMENSION_TYPE_BOTTOM_CORNER) {
            //             if(cornerBottomFurnitureId || cornerFullFurnitureId) {
            //                 alert(`Bottom Corner Furniture already added.`);
            //                 return;
            //             } else {
            //                 cornerBottomFurnitureId = furnitureId;
            //             }
            //         } else {
            //             if(cornerTopFurnitureId || cornerFullFurnitureId) {
            //                 alert(`Top Corner Furniture already added.`);
            //                 return;
            //             } else {
            //                 cornerTopFurnitureId = furnitureId;
            //             }
            //         }
            //     }

            //     const {itemPositionMm} = await addGLBModel(modelFileSrc, type, furnitureId, customId, displayPrice, regularPrice, discountPrice, displayPriceCm3, itemHeight, itemDepth, itemWidth, itemMinHeight, itemMinDepth, itemMinWidth);
                
            //     const itemTotal = await changeTotalByItemTotal(
            //         displayPrice, 
            //         displayPriceCm3,
            //         itemWidth,
            //         itemMinWidth,
            //         itemHeight,
            //         itemMinHeight,
            //         itemDepth,
            //         itemMinDepth,
            //     );

            //     const {my_item_html,summary_item_html} = await addFurnitureItem(
            //         customId, 
            //         furnitureId, 
            //         itemWidth,
            //         itemHeight,
            //         itemDepth,
            //         itemPositionMm,
            //         itemTotal
            //     );

            // 	// await changeTotals();
                
            //     if(my_item_html) {
            //         myItemsList.insertAdjacentHTML('beforeend', my_item_html);
            //         summaryItemsList.insertAdjacentHTML('beforeend', summary_item_html);
            //         changeCabinetsTab(myCabinetTab, myCabinetContent);

            //         const myFurnitureItem = myItemsList.querySelector(`.my-cabinet-item[data-custom_id="${customId}"]`);
            //         if(myFurnitureItem) {
            //             editItemButtonTrigger(myFurnitureItem); 
            //             removeItemButtonTrigger(myFurnitureItem, customId, type);
            //         }
            //     }
            // });

            // furnitureButton.addEventListener('click', function() {
            //     duplicateFurnitureTrigger(customId);
            // });
        });
    }

    function duplicateFurnitureTrigger(parent, customId) {
        const furnitureButton = parent.querySelector(`.item-actions-container button[data-action_type="duplicate"]`);
        furnitureButton.addEventListener('click', function() {
            duplicateFurniture(customId);
        });
    }

    async function duplicateFurniture(currentCustomId, triggerDupItem = false) {
        const currentItem = modelChildrenList.find(item => item.db_data.custom_id == currentCustomId);

        if(!currentItem) return;

        const customId = Date.now();
        const furnitureListItemObj = JSON.parse(JSON.stringify(currentItem));

        const furnitureId = furnitureListItemObj.furniture_id;
        const modelFileSrc = furnitureListItemObj.object_src; 
        const type = furnitureListItemObj.object_type; 
        const displayPrice = furnitureListItemObj.display_price;
        const regularPrice = furnitureListItemObj.regular_price; 
        const discountPrice = furnitureListItemObj.discount_price;
        const displayPriceCm3 = furnitureListItemObj.display_price_cm3;
        const itemHeight = furnitureListItemObj.height;
        const itemDepth = furnitureListItemObj.depth; 
        const itemWidth = furnitureListItemObj.width;
        const itemMinHeight = furnitureListItemObj.min_height;
        const itemMinDepth = furnitureListItemObj.min_depth; 
        const itemMinWidth = furnitureListItemObj.min_width;

        const {itemPositionMm} = await addGLBModel(modelFileSrc, type, furnitureId, customId, displayPrice, regularPrice, discountPrice, displayPriceCm3, itemHeight, itemDepth, itemWidth, itemMinHeight, itemMinDepth, itemMinWidth, triggerDupItem);
        
        const itemTotal = changeTotalByItemTotal(
            displayPrice, 
            displayPriceCm3,
            itemWidth,
            itemMinWidth,
            itemHeight,
            itemMinHeight,
            itemDepth,
            itemMinDepth,
        );

        const {my_item_html, summary_item_html} = await addFurnitureItem(
            customId, 
            furnitureId, 
            itemWidth,
            itemHeight,
            itemDepth,
            itemPositionMm,
            itemTotal
        );

        if(my_item_html) {
            myItemsList.insertAdjacentHTML('beforeend', my_item_html);
            summaryItemsList.insertAdjacentHTML('beforeend', summary_item_html);
            changeCabinetsTab(myCabinetTab, myCabinetContent);

            const furnitureItem = myItemsList.querySelector(`.my-cabinet-item[data-custom_id="${customId}"]`);
            if(furnitureItem) {
                editItemButtonTrigger(furnitureItem); 
                removeItemButtonTrigger(furnitureItem, customId, type);
                duplicateFurnitureTrigger(furnitureItem, customId);
            }
        }

        return customId;
    }

    function initExistingFurnitureEditMethod() {
        const items = myItemsList.querySelectorAll('.my-cabinet-item');
        items.forEach(item => {
            const itemData = JSON.parse(item.getAttribute('data-item_data'));
            const customId = item.getAttribute('data-custom_id');
            const type = itemData.type;
            editItemButtonTrigger(item);
            removeItemButtonTrigger(item, customId, type);
        });
    }

    function editItemButtonTrigger(furnitureItem) {
        const editButton = furnitureItem.querySelector('.item-actions-container button[data-action_type="edit"]');

        if(!editButton) {
            return;
        }

        const itemData = JSON.parse(furnitureItem.getAttribute('data-item_data'));
        const furnitureId = itemData.furniture_id;
        const type = itemData.type;
        const modelFileSrc = itemData.model_src;
        const displayPrice = itemData.display_price;
        const regularPrice = itemData.regular_price;
        const discountPrice = itemData.discount_price;
        const displayPriceCm3 = itemData.display_price_cm3;
        const minWidth = itemData.min_width;

        editButton.addEventListener('click', function(e) {
            e.preventDefault();

            const itemWidth = furnitureItem.getAttribute('data-item_width');
            const customId = furnitureItem.getAttribute('data-custom_id');
            highlightCurrentItem(customId);
            createEditModal(furnitureItem, itemData, furnitureId, type, modelFileSrc, itemWidth, minWidth, displayPrice, regularPrice, discountPrice, displayPriceCm3, false);
        });

    }

    function removeItemButtonTrigger(furnitureItem, customId, furnitureType) {
        const removeButton = furnitureItem.querySelector('.item-actions-container button[data-action_type="remove"]');
        const summaryItem = summaryItemsList.querySelector(`.cabinet-item[data-custom_id="${customId}"]`);
        if(!removeButton) {
            return;
        }

        removeButton.addEventListener('click', function(e) {
            e.preventDefault();
            removeItemButtonTriggerAction(furnitureItem, summaryItem, furnitureType, customId);
            // const children = modelScene.children;
            // const childObj = children.find(child => child.userData.customId == customId);
            // removeGLBModel(childObj);

            // furnitureItem.remove();
            // if(summaryItem) summaryItem.remove();

            // if(furnitureType.includes('corner')) {
            //     switch(furnitureType) {
            //         case DIMENSION_TYPE_BOTTOM_CORNER: {
            //             cornerBottomFurnitureId = null;
            //             break;
            //         }
            //         case DIMENSION_TYPE_TOP_CORNER: {
            //             cornerTopFurnitureId = null;
            //             break;
            //         }
            //         case DIMENSION_TYPE_FULL_CORNER: {
            //             cornerFullFurnitureId = null;
            //             break;
            //         }
            //         default: {
            //             break;
            //         }
            //     }
            // }

            // modelChildrenList = modelChildrenList.filter(item => item.db_data.custom_id != customId);

            // changeTotals();
        });

    }

    function removeItemButtonTriggerAction(furnitureItem, summaryItem, furnitureType, customId) {
        const children = modelScene.children;
        const childObj = children.find(child => child.userData.customId == customId);
        removeGLBModel(childObj);

        furnitureItem.remove();
        if(summaryItem) summaryItem.remove();

        if(furnitureType.includes('corner')) {
            switch(furnitureType) {
                case DIMENSION_TYPE_BOTTOM_CORNER: {
                    cornerBottomFurnitureId = null;
                    break;
                }
                case DIMENSION_TYPE_TOP_CORNER: {
                    cornerTopFurnitureId = null;
                    break;
                }
                case DIMENSION_TYPE_FULL_CORNER: {
                    cornerFullFurnitureId = null;
                    break;
                }
                default: {
                    break;
                }
            }
        }

        modelChildrenList = modelChildrenList.filter(item => item.db_data.custom_id != customId);

        changeTotals();
    }

    function createEditModal(item, data, furnitureId, type, modelFileSrc, width, itemMinWidth, displayPrice, regularPrice, discountPrice, displayPriceCm3, actionTypeAdd = true) {
        const { min_width, max_width } = data;
        let html = `<div class="edit-container-inner"> <button type="button" data-action_type="go-back">Go Back</button>       
                <div class="list-container dimension-container" data-dimension_type="width" data-type="width" data-constant_name="itemWidth">
                    <div class="dimension-container-inner">
                        <h3>Width</h3>
                        <div class="input-container">
                            <input type="number" name="width" value="${width}" min="${min_width}" max="${max_width}">
                            <span class="unit">mm</span>
                        </div>

                        <div class="slider-container">
                            <input type="range" id="width" name="width" value="${width}" min="${min_width}" max="${max_width}">
                        </div>
                    </div>
                </div>`;
            if(actionTypeAdd) {
                html += `<div class="item-actions">
                    <button type="button" data-action_type="add">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0.5" y="0.5" width="15" height="15" rx="8" fill="#2a568d" stroke="#2a568d"></rect><path d="M4.266 8L7.066 10.8L11.73 5.2" stroke="#ffffff" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dashoffset="0px" stroke-dasharray="1px 1px"></path></svg>
                        <span>Add</span>
                    </button>
                </div>`;
            } 
            html += '</div>';

        const editContainer = item.querySelector('.edit-container');
        editContainer.innerHTML = html;
        editContainer.classList.add('active');
        const goBack = editContainer.querySelector('button[data-action_type="go-back"]');
        const addBtn = editContainer.querySelector('button[data-action_type="add"]');

        if(goBack) {
            goBack.addEventListener('click', function() {
                editContainer.classList.remove('active');
                editContainer.innerHTML = '';
                unhighlightGLBModels();
            });
        }

        changeItemDimensionWidthValue(item, actionTypeAdd);

        if(addBtn) {
            addBtn.addEventListener('click', async function() {
                const itemWidth = item.getAttribute('data-item_width');
                const customId = Date.now();
                const { itemHeight, itemMinHeight, itemDepth, itemMinDepth } = getItemDimensions(type);
                const {itemPositionMm} = await addGLBModel(modelFileSrc, type, furnitureId, customId, displayPrice, regularPrice, discountPrice, displayPriceCm3, itemHeight, itemDepth, itemWidth, itemMinHeight, itemMinDepth, itemMinWidth);
                const itemTotal = changeTotalByItemTotal(
                    displayPrice, 
                    displayPriceCm3,
                    itemWidth,
                    itemMinWidth,
                    itemHeight,
                    itemMinHeight,
                    itemDepth,
                    itemMinDepth,
                );

                const {my_item_html, summary_item_html} = await addFurnitureItem(
                    customId, 
                    furnitureId, 
                    itemWidth,
                    itemHeight,
                    itemDepth,
                    itemPositionMm,
                    itemTotal
                );

                if(my_item_html) {
                    myItemsList.insertAdjacentHTML('beforeend', my_item_html);
                    summaryItemsList.insertAdjacentHTML('beforeend', summary_item_html);
                    changeCabinetsTab(myCabinetTab, myCabinetContent);
                    editContainer.classList.remove('active');
                    editContainer.innerHTML = '';

                    const furnitureItem = myItemsList.querySelector(`.my-cabinet-item[data-custom_id="${customId}"]`);
                    if(furnitureItem) {
                        editItemButtonTrigger(furnitureItem); 
                        removeItemButtonTrigger(furnitureItem, customId, type);
                        duplicateFurnitureTrigger(furnitureItem, customId);
                    }
                }
            });
        }
    }

    function highlightCurrentItem(customId) {
        const currentModel = modelScene.children.find(item => item.userData.customId == customId);

        if(!currentModel) return;

        const rect = threeJSRendered.domElement.getBoundingClientRect();
        const fakeEvent = new MouseEvent("click", {
            clientX: rect.left + rect.width / 2,  // center of canvas
            clientY: rect.top + rect.height / 2,
        });

        // onClickModel(fakeEvent, currentModel); 

        currentModel.traverse(child => {
            if (child.isMesh) {
                child.material.emissive.set(0xffffff);
                child.material.emissiveIntensity = 0.2;
            }
        });
    }

    function unhighlightGLBModels() {
        const furnitureActionsContainer = container.querySelector('.furniture-controls');
        if(furnitureActionsContainer) {
            editContainerRemove();
            furnitureActionsContainer.remove();
        }

        // reset opacity 
        modelScene.children.map(model => {
            model.traverse(child => {
                if (child.isMesh) {
                    child.material.emissive.set(0x000000);   // reset emissive color
                    child.material.emissiveIntensity = 1;   // back to default
                }
            });
        });
    }


    function getItemPosition(currentPosition, currentSize, id = null) {
        const halfRoomHeight = modelRoomHeight / 2;
        const halfRoomDepth = modelRoomDepth / 2;
        const halfRoomWidth = modelRoomWidth / 2;

        const item3dHeight = currentSize.y;
        const item3dDepth = currentSize.z;
        const item3dWidth = currentSize.x;

        const itemPositionY = currentPosition.y;
        const itemPositionZ = currentPosition.z;
        const itemPositionX = currentPosition.x;

        let bottom = 0 + itemPositionY;
        bottom = bottom < 0 ? 0 : bottom;
        // const bottom = (0 + itemPositionY) - (item3dHeight / 2);
        const top = modelRoomHeight - (bottom + item3dHeight);

        let depthBack = (halfRoomDepth + itemPositionZ) - (item3dDepth / 2);
        depthBack = depthBack < 0 ? 0 : depthBack;
        const depthFront = modelRoomDepth - (depthBack + item3dDepth);

        const left = (halfRoomWidth + itemPositionX) - (item3dWidth / 2);
        const right = modelRoomWidth - (left + item3dWidth);

        const leftPercent = left * 100 / modelRoomWidth; 
        const rightPercent = right * 100 / modelRoomWidth; 
        const bottomPercent = bottom * 100 / modelRoomHeight; 
        const topPercent = top * 100 / modelRoomHeight; 
        const depthBackPercent = depthBack * 100 / modelRoomDepth; 
        const depthFrontPercent = depthFront * 100 / modelRoomDepth; 
  
        const bottomPosition = bottomPercent * roomHeight / 100;
        const topPosition = topPercent * roomHeight / 100;
        const depthBackPosition = depthBackPercent * roomDepth / 100;
        const depthFrontPosition = depthFrontPercent * roomDepth / 100;
        // const depthFrontPosition = (roomDepthMm - (depthBackPosition + parseInt(itemDepth))) / 10;
        const leftPosition = leftPercent * roomWidth / 100;
        const rightPosition = rightPercent * roomWidth / 100;
        // const rightPosition = (roomWidthMm - (leftPosition + parseInt(itemWidth))) / 10;

        const newPosition = JSON.stringify({
            bottom: bottomPosition,
            top: topPosition,
            back: depthBackPosition,
            front: depthFrontPosition,
            left: leftPosition,
            right: rightPosition,
        });

        if(id) {
            const currentIndex = modelChildrenList.findIndex(item => item.db_data.custom_id == id);
            if(currentIndex > -1) {
                modelChildrenList[currentIndex].db_data.furniture_position_mm = newPosition;
            }
        }

        return newPosition;
    }

    // function addFurnitureItemToList(item, data, furnitureId, customId, type, modelFileSrc, width, minWidth, maxWidth) {
    //     const html = `
    //         <div class="my-cabinet-item" 
    //             data-furniture_id="${furnitureId}"
    //             data-model_file="${modelFileSrc}"
    //         >
    //             <div class="my-cabinet-item-inner">
    //                 <div class="main-container">
    //                     <h3>${modelFileSrc}</h3>
    //                     <div class="dimensions-info">
    //                         <?php echo sprintf(
    //                             __('H: %s(mm), D: %s(mm), W: %s(mm)', 'furniture-config'), 
    //                             $height, $depth, $item_width
    //                         ); ?>
    //                     </div>
    //                 </div>
    //                 <div class="actions-container">
    //                     <button type="button" data-type="duplicate">
    //                         <svg width="12" height="15" viewBox="0 0 12 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.023.043H2.647a.125.125 0 0 0-.125.125v.875c0 .07.057.125.125.125h7.75v10.75c0 .07.057.126.126.126h.875a.125.125 0 0 0 .125-.126V.543a.5.5 0 0 0-.5-.5Zm-2 2h-8a.5.5 0 0 0-.5.5v8.293a.5.5 0 0 0 .146.353l2.708 2.708a.515.515 0 0 0 .116.085v.03h.065c.055.02.113.031.172.031h5.292a.5.5 0 0 0 .5-.5v-11a.5.5 0 0 0-.5-.5ZM3.49 12.422l-1.345-1.347H3.49v1.347Zm4.906.496H4.491V10.7a.625.625 0 0 0-.625-.625H1.647V3.168h6.75v9.75Z" fill="currentColor"></path></svg>
    //                     </button>
    //                     <button type="button" data-type="edit">
    //                         <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.049 10.793a.63.63 0 0 0 .094-.007l2.628-.461a.153.153 0 0 0 .083-.044l6.623-6.623a.157.157 0 0 0 .034-.17.156.156 0 0 0-.034-.05L9.88.837a.155.155 0 0 0-.11-.045.155.155 0 0 0-.112.046L3.035 7.462a.159.159 0 0 0-.044.083l-.46 2.628a.523.523 0 0 0 .146.466.53.53 0 0 0 .372.155Zm1.053-2.725L9.77 2.403l1.146 1.145-5.668 5.666-1.389.245.244-1.39Zm8.67 4.038h-11.5a.5.5 0 0 0-.5.5v.563c0 .068.057.124.125.124h12.25a.125.125 0 0 0 .126-.124v-.563a.5.5 0 0 0-.5-.5Z" fill="currentColor"></path></svg>
    //                     </button>
    //                         <button type="button" data-type="remove">
    //                             <svg width="13" height="14" viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.647 1.918h-.125a.125.125 0 0 0 .125-.125v.125h4.75v-.125c0 .07.057.125.125.125h-.125v1.125h1.125v-1.25a1 1 0 0 0-1-1h-5a1 1 0 0 0-1 1v1.25h1.125V1.918Zm7.876 1.125h-11a.5.5 0 0 0-.5.5v.5c0 .07.056.125.124.125h.944l.386 8.172a1 1 0 0 0 .999.954h7.093a.999.999 0 0 0 .999-.954l.386-8.172h.944a.125.125 0 0 0 .125-.125v-.5a.5.5 0 0 0-.5-.5ZM9.449 12.17H2.596l-.378-8h7.61l-.379 8Z" fill="currentColor"></path></svg>
    //                         </button>
    //                 </div>
    //             </div>

    //             <div class="edit-container"></div>
    //         </div>`
    // }

    // function randomIntFromInterval(min, max) { // min and max included 
    //     return Math.floor(Math.random() * (max - min + 1) + min);
    // }

    function getItemDimensions(type) {
        let itemHeight = 0;
        let itemMinHeight = 0;
        let itemDepth = 0;
        let itemMinDepth = 0;

        switch(type) {
            case DIMENSION_TYPE_BOTTOM: {
                itemHeight = dimensions.bottomHeight;
                itemDepth = dimensions.bottomFullDepth;
                itemMinHeight = bottomMinHeight;
                itemMinDepth = bottomMinDepth;
                break;
            }
            case DIMENSION_TYPE_BOTTOM_CORNER: {
                itemHeight = dimensions.bottomHeight;
                itemDepth = dimensions.bottomFullDepth;
                itemMinHeight = bottomMinHeight;
                itemMinDepth = bottomMinDepth;
                break;
            }
            case DIMENSION_TYPE_TOP: {
                itemHeight = dimensions.topHeight;
                itemDepth = dimensions.topDepth;
                itemMinHeight = topMinHeight;
                itemMinDepth = topMinDepth;
                break;
            }
            case DIMENSION_TYPE_TOP_CORNER: {
                itemHeight = dimensions.topHeight;
                itemDepth = dimensions.topDepth;
                itemMinHeight = topMinHeight;
                itemMinDepth = topMinDepth;
                break;
            }
            case DIMENSION_TYPE_FULL: {
                itemHeight = dimensions.fullHeight;
                itemDepth = dimensions.bottomFullDepth;
                itemMinHeight = fullMinHeight;
                itemMinDepth = fullMinDepth;
                break;
            }
            case DIMENSION_TYPE_FULL_CORNER: {
                itemHeight = dimensions.fullHeight;
                itemDepth = dimensions.bottomFullDepth;
                itemMinHeight = fullMinHeight;
                itemMinDepth = fullMinDepth;
                break;
            }
            default: {
                itemHeight = dimensions.bottomHeight;
                itemDepth = dimensions.bottomFullDepth;
                itemMinHeight = bottomMinHeight;
                itemMinDepth = bottomMinDepth;
            }
        }

        return {
            itemHeight: itemHeight,
            itemMinHeight: itemMinHeight,
            itemDepth: itemDepth,
            itemMinDepth: itemMinDepth,
        }
    }

    async function setDisplayImageHtml(dataType, dataSubtype, value, dimensionType = null) {
        if(dataType === TEXTURE_TYPE) {
            const property = 'background-image';
            let classnameArray = [];

            switch(dataSubtype) {
                case TEXTURE_TYPE_BASE: {
                    classnameArray = [
                        '.image-container-inner',
                    ];
                    break;
                }
                case TEXTURE_TYPE_FRAME: {
                    classnameArray = [
                        '.image-container',
                    ];
                    break;
                }
                default: {
                    classnameArray = [
                        '.image-container-inner',
                    ];
                    break;
                }
            }

            const urlVal = `url(${value})`;

            replaceHtml(classnameArray, property, urlVal);
        } else {

            if(dimensionType !== DIMENSION_TYPE_HEIGHT) return;

            let percentValue = setHeightValuePercentage(value);
            let classnameArray = [];
            let dimensionNumClassname = '';

            switch(dataSubtype) {
                case DIMENSION_TYPE_BOTTOM: {
                    dimensionNumClassname = '.bottom-furniture .image-data-container .number';
                    classnameArray = [
                        '.bottom-furniture',
                    ];
                    break;
                }
                case DIMENSION_TYPE_TOP: {
                    dimensionNumClassname = '.top-furniture .image-data-container .number';
                    classnameArray = [
                        '.top-furniture',
                    ];
                    break;
                }
                case DIMENSION_TYPE_FULL: {
                    dimensionNumClassname = '.full-furniture .image-data-container .number';
                    classnameArray = [
                        '.full-furniture',
                    ];
                    break;
                }
                case DIMENSION_TYPE_VERTICAL_SPACE: {
                    dimensionNumClassname = '.space-container .image-data-container .number';
                    classnameArray = [
                        '.space-container',
                    ];
                    break;
                }
                default: {
                    classnameArray = [
                        '.full-furniture',
                    ];
                }
            }

            replaceHtml(classnameArray, dimensionType, percentValue);
            replaceDimensionNumHtml(dimensionNumClassname, value);


            
        }

        imageCanvasData = await createImageCanvas();

        function setHeightValuePercentage(value) {
            const percentage = value * 100 / largestHeight;
            return `${percentage}%`;
        }

        function replaceHtml(classnameArray, property, value) {
            imageContainer.innerHTML = '';
            imageContainer.appendChild(settingsImageHtml);

            classnameArray.forEach(classname => {
                const htmlItems = document.querySelectorAll(classname);

                htmlItems.forEach(item => {
                    item.style[property] = value;
                });
                
            });
        }

        function replaceDimensionNumHtml(classname, value) {
            imageContainer.innerHTML = '';
            imageContainer.appendChild(settingsImageHtml);

            const htmlItem = document.querySelector(classname);
            htmlItem.innerHTML = value;    
        }
    }

    function resize3dModel() {
        if(!modelScene) return;

        const width = model3dContainer.clientWidth;
        const height = model3dContainer.clientHeight;

        // Update renderer size
        threeJSRendered.setSize(width, height);

        // Update camera aspect ratio
        threeJSCamera.aspect = width / height;
        threeJSCamera.updateProjectionMatrix();
    }

    function resizeBasicDisplay3dModel() {
        if(!basicDisplayScene) return;

        const width = basicDisplayContainer.clientWidth;
        const height = basicDisplayContainer.clientHeight;

        // Update renderer size
        threeJSRenderedBasicDisplay.setSize(width, height);

        // Update camera aspect ratio
        threeJSCameraBasicDisplay.aspect = width / height;
        threeJSCameraBasicDisplay.updateProjectionMatrix();
        threeJSRenderedBasicDisplay.setSize(width, height);
    }

    function init3dModel(model3dContainer) {
        clearModelScene();
        
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
        const far = Math.max(modelRoomWidth, modelRoomDepth, modelRoomHeight) * 10; // large enough to include entire room
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
        // // Environment map for reflections & base light
        // const pmremGenerator = new THREE.PMREMGenerator(threeJSRendered);
        // const envMap = pmremGenerator.fromScene(new THREE.Scene()).texture;

        // // Basic light setup
        // const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
        // hemiLight.position.set(0, 200, 0);
        // modelScene.add(hemiLight);

        // const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        // dirLight.position.set(100, 200, 100);
        // modelScene.add(dirLight);

        // // Assign environment map to material
        // modelScene.userData.envMap = envMap;

        /********* end light *********/
        /************room ****************/
        room3DGroup = new THREE.Group();
   
        defaultBottomReferenceY = getDefaultBottomHeightWithSpace(roomHeight, modelRoomHeight);

        // Floor
        const floorMaterial = new THREE.MeshStandardMaterial({  
            map: floorTexture,
            color: 0xffffff,
            metalness: 0,
            roughness: 1, 
            side: THREE.DoubleSide
        }); 
        // const floorGeometry = new THREE.PlaneGeometry(modelRoomWidth, modelRoomDepth);
        // const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        // floor.rotation.x = -Math.PI / 2; // rotate to be horizontal
        // floor.position.y = 0;
        // room3DGroup.add(floor);

        const floorGeometry = new THREE.BoxGeometry(modelRoomWidth, floorThickness, modelRoomDepth);
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.position.y = -floorThickness / 2; // so top surface stays at y=0
        room3DGroup.add(floor);

        const wallMaterial = new THREE.MeshStandardMaterial({  
            map: wallTexture,
            color: 0xffffff,
            metalness: 0,
            roughness: 1, 
            side: THREE.DoubleSide
        }); 
        const wallHeightWithFloorThickness = modelRoomHeight + floorThickness;
        if(roomType === ROOM_TYPE_WITH_CORNER) {
            const wallDepthWithWallThickness = modelRoomDepth + floorThickness;
            // // Left Wall (at x = 0, z = -roomDepth/2 → front-left corner)
            // const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(modelRoomDepth, modelRoomHeight), leftWallMaterial);
            // leftWall.position.set(-modelRoomWidth / 2, modelRoomHeight / 2, 0); // left edge at x=-width/2
            // leftWall.rotation.y = Math.PI / 2; 
            // room3DGroup.add(leftWall);
     
            const leftWallGeometry = new THREE.BoxGeometry(wallThickness, wallHeightWithFloorThickness, wallDepthWithWallThickness);
            const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
            leftWall.position.set(
                -modelRoomWidth / 2 - wallThickness / 2, 
                 wallHeightWithFloorThickness / 2 - floorThickness, 
                -floorThickness / 2
            );
            room3DGroup.add(leftWall);
        }
    
        // Right Wall (shares the corner with left wall at z = 0)
        // const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(modelRoomWidth, modelRoomHeight), rightWallMaterial);
        // rightWall.position.set(0, modelRoomHeight / 2, -modelRoomDepth / 2);
        // room3DGroup.add(rightWall);
        const rightWallGeometry = new THREE.BoxGeometry(modelRoomWidth, wallHeightWithFloorThickness, wallThickness);
        const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial);
        rightWall.position.set(
            0, 
            wallHeightWithFloorThickness / 2 - floorThickness, 
            -modelRoomDepth / 2 - wallThickness / 2
        );
        room3DGroup.add(rightWall);


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

        if(roomType === ROOM_TYPE_WITH_CORNER) {
            const cornerDimensions3d = getCornerDimensions();

            cornerBottomHeight3d = cornerDimensions3d.bottomHeight;
            cornerBottomWidth3d = cornerDimensions3d.bottomWidth;
            cornerBottomDepth3d = cornerDimensions3d.bottomDepth;
            cornerTopHeight3d = cornerDimensions3d.topHeight;
            cornerTopWidth3d = cornerDimensions3d.topWidth;
            cornerTopDepth3d = cornerDimensions3d.topDepth;
            cornerFullWidth3d = cornerDimensions3d.fullWidth;
            cornerFullDepth3d = cornerDimensions3d.fullDepth;
            cornerBottomSpace3d = cornerDimensions3d.bottomSpace;

            appendCornerPseudoModelObjects();
        }

        modelChildrenList.forEach((child) => {
            const dbData = child.db_data;
            const childId = dbData.id;
            const childFurnitureId = child.furniture_id;
            const childCustomId = dbData.custom_id;
            const childSrc = child.object_src;
            const childType = child.object_type;
            const childWidth = dbData.width;
            // const childFurniturePosition = dbData.furniture_position_mm;
            const childOriginalSize = JSON.parse(dbData.model_original_size);
            const childScaledSize = JSON.parse(dbData.model_scaled_size);
            const childSavedPisition = JSON.parse(dbData.model_position);
            const childPositionMm = JSON.parse(dbData.furniture_position_mm);
            const childIsFitting = Boolean(parseInt(dbData.is_fitting));
            addExistingGLBModel(childId, childSrc, childType, childFurnitureId, childCustomId, childWidth, childOriginalSize, childScaledSize, childSavedPisition, childPositionMm, childIsFitting);
        });

        // initModelClickEvent();
        
        const animate = () => {
            requestAnimationFrame(animate);
            threeJSControls.update();
            threeJSRendered.render(modelScene, threeJSCamera);
        };
        animate();

        threeJSRendered.domElement.addEventListener('click', function(e) {
            onClickModel(e);
        }, false);

        // threeJSRendered.setAnimationLoop(() => {
        //     updateUIButtonSizes(allUIButtons); // keep all buttons in array
        //     threeJSRendered.render(modelScene, threeJSCamera);
        // });

        // threeJSControls.addEventListener('change', () => {
        //     updateUIButtonSizes(allUIButtons);
        //     threeJSRendered.render(modelScene, threeJSCamera);
        // });

        // threeJSRendered.setAnimationLoop(() => {
        //     modelScene.traverse(obj => {
        //         if (obj.userData?.uiButtons) {
        //             updateUIButtonPositions(obj.userData.uiButtons, threeJSCamera, threeJSRendered);
        //         }
        //     });
        //     threeJSRendered.render(modelScene, threeJSCamera);
        // });
    }

    // function addGLBModel(urlSrc, furnitureType, furnitureId, customId, displayPrice, regularPrice, discountPrice, displayPriceCm3, itemHeight, itemDepth, itemWidth, itemHeightMin, itemDepthMin, itemWidthMin, triggerDupItem = false) {
    //     return new Promise((resolve, reject) => {
    //         const loader = new GLTFLoader();
    //         // const textureLoader = new THREE.TextureLoader();
    //         // const textureBase = currentBaseSrc ? textureLoader.load(currentBaseSrc) : null;
    //         // const textureFrame = currentFrameSrc ? textureLoader.load(currentFrameSrc) : null;

    //         const [heightPx, depthPx, widthPx] = get3DItemDimensions(itemHeight, itemDepth, itemWidth, modelRoomHeight, modelRoomDepth, modelRoomWidth);

    //         loader.load(
    //             urlSrc,
    //             function (gltf) {
    //                 try {
    //                 // keep original scene (preserve bones/transforms)
    //                 const model = gltf.scene || gltf.scenes[0];
    //                 if (!model) {
    //                     console.warn("GLTF has no scene:", urlSrc);
    //                 }

    //                 // Prepare textures (if provided) with proper filters
    //                 const textureLoader = new THREE.TextureLoader();
    //                 const textureBase = currentBaseSrc ? textureLoader.load(currentBaseSrc, tex => {
    //                     tex.minFilter = THREE.LinearFilter;
    //                     tex.magFilter = THREE.LinearFilter;
    //                     tex.anisotropy = threeJSRendered ? threeJSRendered.capabilities.getMaxAnisotropy() : 1;
    //                     tex.needsUpdate = true;
    //                 }) : null;
    //                 const textureFrame = currentFrameSrc ? textureLoader.load(currentFrameSrc, tex => {
    //                     tex.minFilter = THREE.LinearFilter;
    //                     tex.magFilter = THREE.LinearFilter;
    //                     tex.anisotropy = threeJSRendered ? threeJSRendered.capabilities.getMaxAnisotropy() : 1;
    //                     tex.needsUpdate = true;
    //                 }) : null;

    //                 // Create a wrapper group so we can scale/position as before
    //                 const childMeshGroup = new THREE.Group();
    //                 childMeshGroup.add(model); // keep model subtree intact
    //                 childMeshGroup.userData.furnitureId = furnitureId;
    //                 childMeshGroup.userData.customId = customId;
    //                 childMeshGroup.userData.furnitureType = furnitureType;
    //                 childMeshGroup.userData.width_mm = itemWidth;

    //                 // Traverse model and assign/patch materials safely
    //                 model.traverse(node => {
    //                     if (!node.isMesh) return;

    //                     // ensure geometry has normals (some exporters omit them)
    //                     if (node.geometry && (!node.geometry.attributes.normal)) {
    //                     node.geometry.computeVertexNormals();
    //                     }

    //                     // Optionally prevent frustum culling for thin/animated meshes that vanish unexpectedly
    //                     node.frustumCulled = false;

    //                     // Choose texture based on name
    //                     const name = (node.name || "").toLowerCase();
    //                     const chosenTexture = frontNodes.includes(name) ? textureFrame : textureBase;

    //                     // If the mesh has an array of materials, handle each
    //                     if (Array.isArray(node.material)) {
    //                     node.material = node.material.map(mat => {
    //                         const m = mat.clone();
    //                         // apply map only if we have a chosen texture (and original material supports it)
    //                         if (chosenTexture) {
    //                         m.map = chosenTexture;
    //                         chosenTexture.needsUpdate = true;
    //                         }
    //                         // keep key properties from original
    //                         m.metalness = (m.metalness !== undefined) ? m.metalness : 0;
    //                         m.roughness = (m.roughness !== undefined) ? m.roughness : 1;
    //                         m.side = THREE.DoubleSide; // avoid invisible faces due to winding
    //                         m.needsUpdate = true;
    //                         return m;
    //                     });
    //                     } else if (node.material && node.material.isMaterial) {
    //                     // clone original to preserve shader flags (skinning/morphTargets)
    //                     const m = node.material.clone();
    //                     if (chosenTexture) {
    //                         m.map = chosenTexture;
    //                         chosenTexture.needsUpdate = true;
    //                     } else {
    //                         // If you always want a MeshStandard fallback, you can keep clone
    //                         // Otherwise leaving original material may be better for special materials.
    //                     }
    //                     m.metalness = 0;
    //                     m.roughness = 1;
    //                     m.side = THREE.DoubleSide;
    //                     m.needsUpdate = true;
    //                     node.material = m;
    //                     } else {
    //                     // No material? create a simple one
    //                     node.material = new THREE.MeshStandardMaterial({
    //                         map: chosenTexture || null,
    //                         color: 0xffffff,
    //                         metalness: 0,
    //                         roughness: 1,
    //                         side: THREE.DoubleSide,
    //                     });
    //                     }

    //                     // Save original material copy to userData for later restoration
    //                     node.userData.originalMaterial = {
    //                     // store minimal serializable info
    //                     color: node.material.color ? node.material.color.clone() : null,
    //                     opacity: node.material.opacity,
    //                     transparent: node.material.transparent,
    //                     side: node.material.side
    //                     };
    //                 });

    //                 // Add wrapper to scene (use your modelScene / room3DGroup as before)
    //                 modelScene.add(childMeshGroup);

    //                 // force update of world matrices so Box3 reads correct positions/sizes
    //                 modelScene.updateMatrixWorld(true);
    //                 childMeshGroup.updateMatrixWorld(true);

    //                 // compute original bounding box
    //                 const childBox = new THREE.Box3().setFromObject(childMeshGroup);
    //                 const childSize = new THREE.Vector3();
    //                 childBox.getSize(childSize);
    //                 childMeshGroup.userData.originalSize = childSize.clone();

    //                 // Avoid divide-by-zero if model has degenerate size
    //                 const safe = v => (Math.abs(v) < 1e-6 ? 1e-6 : v);

    //                 // compute target scale values (you used px dims previously)
    //                 const scaleX = (safe(widthPx) / safe(childSize.x));
    //                 const scaleY = (safe(heightPx) / safe(childSize.y));
    //                 const scaleZ = (safe(depthPx) / safe(childSize.z));
    //                 childMeshGroup.scale.set(scaleX, scaleY, scaleZ);

    //                 // update world matrices again after scaling
    //                 childMeshGroup.updateMatrixWorld(true);
    //                 modelScene.updateMatrixWorld(true);

    //                 // recompute scaled bounding box & size
    //                 const scaledChildBox = new THREE.Box3().setFromObject(childMeshGroup);
    //                 const scaledChildSize = new THREE.Vector3();
    //                 scaledChildBox.getSize(scaledChildSize);
    //                 childMeshGroup.userData.scaledSize = scaledChildSize.clone();

    //                 // positioning (your logic preserved)
    //                 const finalParentBox = new THREE.Box3().setFromObject(room3DGroup);
    //                 const finalParentSize = new THREE.Vector3();
    //                 finalParentBox.getSize(finalParentSize);
    //                 childMeshGroup.userData.parentBox = finalParentBox;

    //                 let leftAdditionalUnit = 0;
    //                 if (roomType === ROOM_TYPE_WITH_CORNER) {
    //                     leftAdditionalUnit = wallThickness;
    //                     switch (furnitureType) {
    //                         case DIMENSION_TYPE_BOTTOM: leftAdditionalUnit += cornerBottomWidth3d; break;
    //                         case DIMENSION_TYPE_TOP: leftAdditionalUnit += cornerTopWidth3d; break;
    //                         case DIMENSION_TYPE_FULL: leftAdditionalUnit += cornerFullWidth3d; break;
    //                     }
    //                 }

    //                 const leftX = finalParentBox.min.x + scaledChildSize.x / 2 + leftAdditionalUnit;
    //                 const yPosition = furnitureType.includes(DIMENSION_TYPE_TOP)
    //                     ? calculateTopSpaceIn3dModel(finalParentBox)
    //                     : finalParentBox.min.y + floorThickness;
    //                 const backZ = finalParentBox.min.z + (scaledChildSize.z / 2) + wallThickness;

    //                 childMeshGroup.position.set(leftX, yPosition, backZ);

    //                 // update world position after moving
    //                 childMeshGroup.updateMatrixWorld(true);

    //                 const placedWorldPos = new THREE.Vector3();
    //                 childMeshGroup.getWorldPosition(placedWorldPos);
    //                 childMeshGroup.userData.savedPosition = placedWorldPos.clone();

    //                 // re-compute scaled box after final placement (if needed)
    //                 const finalScaledBox = new THREE.Box3().setFromObject(childMeshGroup);
    //                 const finalScaledSize = new THREE.Vector3();
    //                 finalScaledBox.getSize(finalScaledSize);
    //                 childMeshGroup.userData.scaledSize = finalScaledSize.clone();

    //                 // fitting check and drag controls (your existing code)
    //                 let isFittingItem = true;
    //                 if (!furnitureType.includes('corner')) {
    //                     isFittingItem = checkIfAbleToDragChildToPosition(childMeshGroup, finalScaledBox);
    //                     childMeshGroup.userData.isFitting = isFittingItem;

    //                     if (!isFittingItem) {
    //                         childMeshGroup.traverse(child => {
    //                             if (child.isMesh) {
    //                             child.material.color.set(0xff0000);
    //                             child.material.transparent = true;
    //                             child.material.opacity = 0.5;
    //                             }
    //                         });
    //                     }

    //                     const dragControls = new DragControls(
    //                         [childMeshGroup],
    //                         threeJSCamera,
    //                         threeJSRendered.domElement
    //                     );
    //                     dragControls.transformGroup = true;
    //                     childMeshGroup.userData.dragControls = dragControls;

    //                     dragControls.addEventListener('drag', event => {
    //                         const obj = event.object;
    //                         let isFitting = true;
    //                         if(roomType == ROOM_TYPE_WITH_CORNER) {
    //                             isFitting = setCornerChildenDragging(obj);
    //                         } else {
    //                             isFitting = setSingleWallChilderDragging(obj);
    //                         }

    //                         obj.userData.isFitting = isFitting;
    //                         if (!isFitting) {
    //                             obj.traverse(child => {
    //                                 if (child.isMesh) {
    //                                     child.material.color.set(0xff0000);
    //                                     child.material.transparent = true;
    //                                     child.material.opacity = 0.5;
    //                                 } 
    //                             });
    //                         } else {
    //                             obj.traverse(child => {
    //                                 if (child.isMesh) {
    //                                     child.material.color.set(0x00ff00);
    //                                     child.material.transparent = true;
    //                                     child.material.opacity = 0.5;
    //                                 } 
    //                             });
    //                         }

    //                         if(visibleModelDimensionArrows) {
    //                             createFurnitureDimensionArrows(childMeshGroup, room3DGroup);
    //                         }
                            
    //                     });

    //                     dragControls.addEventListener('dragstart', event => {
    //                         threeJSControls.enabled = false; // disable parent rotation & zoom
    //                     });

    //                     dragControls.addEventListener('dragend', event => {
    //                         threeJSControls.enabled = true;  // re-enable orbit

    //                         const obj = event.object;

    //                         /******** saved position ********/
    //                         const childWorldPos = new THREE.Vector3();
    //                         obj.getWorldPosition(childWorldPos);
    //                         obj.userData.savedPosition = childWorldPos.clone();

    //                         const itemPositionMm = getItemPosition(childWorldPos.clone(), scaledChildSize.clone(), customId);
    //                         obj.userData.positionMm = itemPositionMm;
                            
    //                         /******** end saved position ********/
    //                         const newUserData = obj.userData;
    //                         const isFitting = newUserData.isFitting
    //                         if(isFitting) {
    //                             obj.traverse(child => {
    //                                 if (child.isMesh && child.userData.originalMaterial) {
    //                                     child.material.color.copy(child.userData.originalMaterial.color);
    //                                     child.material.opacity = child.userData.originalMaterial.opacity;
    //                                     child.material.transparent = child.userData.originalMaterial.transparent;
    //                                 }
    //                             });
    //                         } 

    //                         const itemIndex = modelChildrenList.findIndex(item => item.db_data.custom_id == obj.userData.customId);
                
    //                         if(itemIndex > -1) {
    //                             const oldItem = {...modelChildrenList[itemIndex]};
    //                             oldItem.db_data.is_fitting = isFitting;
    //                             oldItem.db_data.model_position = JSON.stringify(childWorldPos.clone());
    //                             modelChildrenList[itemIndex] = {...oldItem};
    //                         }

    //                     });
    //                 } else {
    //                     checkIfItemsAreFittingForNewCorner(childMeshGroup, childBox);
    //                     removeCornerPseudoModelObjects(furnitureType);
    //                 }

    //                 // save position & sizes
    //                 childMeshGroup.userData.positionMm = getItemPosition(placedWorldPos.clone(), finalScaledSize.clone());
    //                 const itemPositionMm = childMeshGroup.userData.positionMm;

    //                 // push to modelChildrenList etc — preserve your existing data flow
    //                 const userData = childMeshGroup.userData;
    //                 const dbData = {
    //                     custom_id: customId,
    //                     width: itemWidth,
    //                     furniture_position_mm: itemPositionMm,
    //                     model_original_size: JSON.stringify(userData.originalSize),
    //                     model_scaled_size: JSON.stringify(userData.scaledSize),
    //                     model_position: JSON.stringify(userData.savedPosition),
    //                     is_fitting: isFittingItem,
    //                 };

    //                 const furnitureListItem = {
    //                     furniture_id: furnitureId,
    //                     db_data: {...dbData},
    //                     object_src: urlSrc,
    //                     object_type: furnitureType,
    //                     display_price: displayPrice,
    //                     regular_price: regularPrice,
    //                     discount_price: discountPrice,
    //                     display_price_cm3: displayPriceCm3,
    //                     width: itemWidth,
    //                     height: itemHeight,
    //                     depth: itemDepth,
    //                     min_width: itemWidthMin,
    //                     min_height: itemHeightMin,
    //                     min_depth: itemDepthMin,
    //                 };

    //                 modelChildrenList.push(furnitureListItem);

    //                 if (visibleModelDimensionArrows) {
    //                     createFurnitureDimensionArrows(childMeshGroup, room3DGroup);
    //                 }

    //                 // resolve promise
    //                 resolve({ itemPositionMm });
    //                 } catch (err) {
    //                     console.error("Error processing GLTF:", err);
    //                 reject(err);
    //                 }
    //             },
    //             undefined,
    //             function (error) {
    //                 console.error("❌ Error loading GLB:", error);
    //                 reject(error);
    //             }
    //         );
    //     })
    // }

//     function addGLBModel(urlSrc, furnitureType, furnitureId, customId, displayPrice, regularPrice, discountPrice, displayPriceCm3, itemHeight, itemDepth, itemWidth, itemHeightMin, itemDepthMin, itemWidthMin, triggerDupItem = false) {
//         return new Promise((resolve, reject) => {
//             const loader = new GLTFLoader();
//             const [heightPx, depthPx, widthPx] = get3DItemDimensions(itemHeight, itemDepth, itemWidth, modelRoomHeight, modelRoomDepth, modelRoomWidth);
//             loader.load(
//                 urlSrc,
//                 (gltf) => {
//                     const root = gltf.scene || gltf.scenes[0];

//                     root.traverse((node) => {
//                         if (node.isMesh) {
//                             // ✅ Ensure geometry uses triangles
//                             if (node.geometry && node.geometry.attributes.position) {
//                                 node.geometry = BufferGeometryUtils.mergeVertices(node.geometry) || node.geometry;
//                                 node.geometry.computeVertexNormals();
//                             }
//                             // ✅ Replace broken or missing materials
//                             if (!node.material || !(node.material instanceof THREE.MeshStandardMaterial)) {
//                                 node.material = new THREE.MeshStandardMaterial({
//                                     color: 0xcccccc,
//                                     metalness: 0,
//                                     roughness: 1,
//                                 });
//                             }

//                             // ✅ Make sure it’s visible
//                             node.material.side = THREE.DoubleSide;
//                             node.frustumCulled = false;
//                         }
//                     });

//                     const childBox = new THREE.Box3().setFromObject(root);
//                     const childSize = new THREE.Vector3(); 
//                     childBox.getSize(childSize); 
//                     // ✅ Auto-center & scale to unit size
//                     const box = new THREE.Box3().setFromObject(root);
//                     const size = new THREE.Vector3();
//                     box.getSize(size);
//                     const scaleX = widthPx / childSize.x;
//                     const scaleY = heightPx / childSize.y;
//                     const scaleZ = depthPx / childSize.z;
//                     root.scale.set(scaleX, scaleY, scaleZ);

//                     // const maxDim = Math.max(size.x, size.y, size.z);
//                     // const scale = 1 / maxDim;
//                     // root.scale.set(scale, scale, scale);

//                     // Move to origin
//                     box.setFromObject(root);
//                     const center = new THREE.Vector3();
//                     box.getCenter(center);
//                     root.position.sub(center);

//                     modelScene.add(root);

//                     const childWorldPos = new THREE.Vector3();
//                     root.getWorldPosition(childWorldPos);
//                     const itemPositionMm = getItemPosition(childWorldPos.clone(), size.clone(), customId);
//                     resolve({itemPositionMm})
//                 },
//                 undefined,
//                 (err) => {
//                     console.error('❌ GLB load error:', err);
//                 }
//             );
//         });

        // return new Promise((resolve, reject) => {
        //     const loader = new GLTFLoader();
        //     // const textureLoader = new THREE.TextureLoader();
        //     // const textureBase = currentBaseSrc ? textureLoader.load(currentBaseSrc) : null;
        //     // const textureFrame = currentFrameSrc ? textureLoader.load(currentFrameSrc) : null;

        //     const [heightPx, depthPx, widthPx] = get3DItemDimensions(itemHeight, itemDepth, itemWidth, modelRoomHeight, modelRoomDepth, modelRoomWidth);

        //     loader.load(
        //         urlSrc,
        //         function (gltf) {
        //             try {
        //             // keep original scene (preserve bones/transforms)
        //             const model = gltf.scene || gltf.scenes[0];
        //             if (!model) {
        //                 console.warn("GLTF has no scene:", urlSrc);
        //             }

        //             // Prepare textures (if provided) with proper filters
        //             const textureLoader = new THREE.TextureLoader();
        //             const textureBase = currentBaseSrc ? textureLoader.load(currentBaseSrc, tex => {
        //                 tex.minFilter = THREE.LinearFilter;
        //                 tex.magFilter = THREE.LinearFilter;
        //                 tex.anisotropy = threeJSRendered ? threeJSRendered.capabilities.getMaxAnisotropy() : 1;
        //                 tex.needsUpdate = true;
        //             }) : null;
        //             const textureFrame = currentFrameSrc ? textureLoader.load(currentFrameSrc, tex => {
        //                 tex.minFilter = THREE.LinearFilter;
        //                 tex.magFilter = THREE.LinearFilter;
        //                 tex.anisotropy = threeJSRendered ? threeJSRendered.capabilities.getMaxAnisotropy() : 1;
        //                 tex.needsUpdate = true;
        //             }) : null;

        //             // Create a wrapper group so we can scale/position as before
        //             const childMeshGroup = new THREE.Group();
        //             childMeshGroup.add(model); // keep model subtree intact
        //             childMeshGroup.userData.furnitureId = furnitureId;
        //             childMeshGroup.userData.customId = customId;
        //             childMeshGroup.userData.furnitureType = furnitureType;
        //             childMeshGroup.userData.width_mm = itemWidth;

        //             // Traverse model and assign/patch materials safely
        //             model.traverse(node => {
        //                 if (!node.isMesh) return;

        //                 // ensure geometry has normals (some exporters omit them)
        //                 if (node.geometry && (!node.geometry.attributes.normal)) {
        //                 node.geometry.computeVertexNormals();
        //                 }

        //                 // Optionally prevent frustum culling for thin/animated meshes that vanish unexpectedly
        //                 node.frustumCulled = false;

        //                 // Choose texture based on name
        //                 const name = (node.name || "").toLowerCase();
        //                 const chosenTexture = frontNodes.includes(name) ? textureFrame : textureBase;

        //                 // If the mesh has an array of materials, handle each
        //                 if (Array.isArray(node.material)) {
        //                 node.material = node.material.map(mat => {
        //                     const m = mat.clone();
        //                     // apply map only if we have a chosen texture (and original material supports it)
        //                     if (chosenTexture) {
        //                     m.map = chosenTexture;
        //                     chosenTexture.needsUpdate = true;
        //                     }
        //                     // keep key properties from original
        //                     m.metalness = (m.metalness !== undefined) ? m.metalness : 0;
        //                     m.roughness = (m.roughness !== undefined) ? m.roughness : 1;
        //                     m.side = THREE.DoubleSide; // avoid invisible faces due to winding
        //                     m.needsUpdate = true;
        //                     return m;
        //                 });
        //                 } else if (node.material && node.material.isMaterial) {
        //                 // clone original to preserve shader flags (skinning/morphTargets)
        //                 const m = node.material.clone();
        //                 if (chosenTexture) {
        //                     m.map = chosenTexture;
        //                     chosenTexture.needsUpdate = true;
        //                 } else {
        //                     // If you always want a MeshStandard fallback, you can keep clone
        //                     // Otherwise leaving original material may be better for special materials.
        //                 }
        //                 m.metalness = 0;
        //                 m.roughness = 1;
        //                 m.side = THREE.DoubleSide;
        //                 m.needsUpdate = true;
        //                 node.material = m;
        //                 } else {
        //                 // No material? create a simple one
        //                 node.material = new THREE.MeshStandardMaterial({
        //                     map: chosenTexture || null,
        //                     color: 0xffffff,
        //                     metalness: 0,
        //                     roughness: 1,
        //                     side: THREE.DoubleSide,
        //                 });
        //                 }

        //                 // Save original material copy to userData for later restoration
        //                 node.userData.originalMaterial = {
        //                 // store minimal serializable info
        //                 color: node.material.color ? node.material.color.clone() : null,
        //                 opacity: node.material.opacity,
        //                 transparent: node.material.transparent,
        //                 side: node.material.side
        //                 };
        //             });

        //             // Add wrapper to scene (use your modelScene / room3DGroup as before)
        //             modelScene.add(childMeshGroup);

        //             // force update of world matrices so Box3 reads correct positions/sizes
        //             modelScene.updateMatrixWorld(true);
        //             childMeshGroup.updateMatrixWorld(true);

        //             // compute original bounding box
        //             const childBox = new THREE.Box3().setFromObject(childMeshGroup);
        //             const childSize = new THREE.Vector3();
        //             childBox.getSize(childSize);
        //             childMeshGroup.userData.originalSize = childSize.clone();

        //             // Avoid divide-by-zero if model has degenerate size
        //             const safe = v => (Math.abs(v) < 1e-6 ? 1e-6 : v);

        //             // compute target scale values (you used px dims previously)
        //             const scaleX = (safe(widthPx) / safe(childSize.x));
        //             const scaleY = (safe(heightPx) / safe(childSize.y));
        //             const scaleZ = (safe(depthPx) / safe(childSize.z));
        //             childMeshGroup.scale.set(scaleX, scaleY, scaleZ);

        //             // update world matrices again after scaling
        //             childMeshGroup.updateMatrixWorld(true);
        //             modelScene.updateMatrixWorld(true);

        //             // recompute scaled bounding box & size
        //             const scaledChildBox = new THREE.Box3().setFromObject(childMeshGroup);
        //             const scaledChildSize = new THREE.Vector3();
        //             scaledChildBox.getSize(scaledChildSize);
        //             childMeshGroup.userData.scaledSize = scaledChildSize.clone();

        //             // positioning (your logic preserved)
        //             const finalParentBox = new THREE.Box3().setFromObject(room3DGroup);
        //             const finalParentSize = new THREE.Vector3();
        //             finalParentBox.getSize(finalParentSize);
        //             childMeshGroup.userData.parentBox = finalParentBox;

        //             let leftAdditionalUnit = 0;
        //             if (roomType === ROOM_TYPE_WITH_CORNER) {
        //                 leftAdditionalUnit = wallThickness;
        //                 switch (furnitureType) {
        //                     case DIMENSION_TYPE_BOTTOM: leftAdditionalUnit += cornerBottomWidth3d; break;
        //                     case DIMENSION_TYPE_TOP: leftAdditionalUnit += cornerTopWidth3d; break;
        //                     case DIMENSION_TYPE_FULL: leftAdditionalUnit += cornerFullWidth3d; break;
        //                 }
        //             }

        //             const leftX = finalParentBox.min.x + scaledChildSize.x / 2 + leftAdditionalUnit;
        //             const yPosition = furnitureType.includes(DIMENSION_TYPE_TOP)
        //                 ? calculateTopSpaceIn3dModel(finalParentBox)
        //                 : finalParentBox.min.y + floorThickness;
        //             const backZ = finalParentBox.min.z + (scaledChildSize.z / 2) + wallThickness;

        //             childMeshGroup.position.set(leftX, yPosition, backZ);

        //             // update world position after moving
        //             childMeshGroup.updateMatrixWorld(true);

        //             const placedWorldPos = new THREE.Vector3();
        //             childMeshGroup.getWorldPosition(placedWorldPos);
        //             childMeshGroup.userData.savedPosition = placedWorldPos.clone();

        //             // re-compute scaled box after final placement (if needed)
        //             const finalScaledBox = new THREE.Box3().setFromObject(childMeshGroup);
        //             const finalScaledSize = new THREE.Vector3();
        //             finalScaledBox.getSize(finalScaledSize);
        //             childMeshGroup.userData.scaledSize = finalScaledSize.clone();

        //             // fitting check and drag controls (your existing code)
        //             let isFittingItem = true;
        //             if (!furnitureType.includes('corner')) {
        //                 isFittingItem = checkIfAbleToDragChildToPosition(childMeshGroup, finalScaledBox);
        //                 childMeshGroup.userData.isFitting = isFittingItem;

        //                 if (!isFittingItem) {
        //                     childMeshGroup.traverse(child => {
        //                         if (child.isMesh) {
        //                         child.material.color.set(0xff0000);
        //                         child.material.transparent = true;
        //                         child.material.opacity = 0.5;
        //                         }
        //                     });
        //                 }

        //                 const dragControls = new DragControls(
        //                     [childMeshGroup],
        //                     threeJSCamera,
        //                     threeJSRendered.domElement
        //                 );
        //                 dragControls.transformGroup = true;
        //                 childMeshGroup.userData.dragControls = dragControls;

        //                 dragControls.addEventListener('drag', event => {
        //                     const obj = event.object;
        //                     let isFitting = true;
        //                     if(roomType == ROOM_TYPE_WITH_CORNER) {
        //                         isFitting = setCornerChildenDragging(obj);
        //                     } else {
        //                         isFitting = setSingleWallChilderDragging(obj);
        //                     }

        //                     obj.userData.isFitting = isFitting;
        //                     if (!isFitting) {
        //                         obj.traverse(child => {
        //                             if (child.isMesh) {
        //                                 child.material.color.set(0xff0000);
        //                                 child.material.transparent = true;
        //                                 child.material.opacity = 0.5;
        //                             } 
        //                         });
        //                     } else {
        //                         obj.traverse(child => {
        //                             if (child.isMesh) {
        //                                 child.material.color.set(0x00ff00);
        //                                 child.material.transparent = true;
        //                                 child.material.opacity = 0.5;
        //                             } 
        //                         });
        //                     }

        //                     if(visibleModelDimensionArrows) {
        //                         createFurnitureDimensionArrows(childMeshGroup, room3DGroup);
        //                     }
                            
        //                 });

        //                 dragControls.addEventListener('dragstart', event => {
        //                     threeJSControls.enabled = false; // disable parent rotation & zoom
        //                 });

        //                 dragControls.addEventListener('dragend', event => {
        //                     threeJSControls.enabled = true;  // re-enable orbit

        //                     const obj = event.object;

        //                     /******** saved position ********/
        //                     const childWorldPos = new THREE.Vector3();
        //                     obj.getWorldPosition(childWorldPos);
        //                     obj.userData.savedPosition = childWorldPos.clone();

        //                     const itemPositionMm = getItemPosition(childWorldPos.clone(), scaledChildSize.clone(), customId);
        //                     obj.userData.positionMm = itemPositionMm;
                            
        //                     /******** end saved position ********/
        //                     const newUserData = obj.userData;
        //                     const isFitting = newUserData.isFitting
        //                     if(isFitting) {
        //                         obj.traverse(child => {
        //                             if (child.isMesh && child.userData.originalMaterial) {
        //                                 child.material.color.copy(child.userData.originalMaterial.color);
        //                                 child.material.opacity = child.userData.originalMaterial.opacity;
        //                                 child.material.transparent = child.userData.originalMaterial.transparent;
        //                             }
        //                         });
        //                     } 

        //                     const itemIndex = modelChildrenList.findIndex(item => item.db_data.custom_id == obj.userData.customId);
                
        //                     if(itemIndex > -1) {
        //                         const oldItem = {...modelChildrenList[itemIndex]};
        //                         oldItem.db_data.is_fitting = isFitting;
        //                         oldItem.db_data.model_position = JSON.stringify(childWorldPos.clone());
        //                         modelChildrenList[itemIndex] = {...oldItem};
        //                     }

        //                 });
        //             } else {
        //                 checkIfItemsAreFittingForNewCorner(childMeshGroup, childBox);
        //                 removeCornerPseudoModelObjects(furnitureType);
        //             }

        //             // save position & sizes
        //             childMeshGroup.userData.positionMm = getItemPosition(placedWorldPos.clone(), finalScaledSize.clone());
        //             const itemPositionMm = childMeshGroup.userData.positionMm;

        //             // push to modelChildrenList etc — preserve your existing data flow
        //             const userData = childMeshGroup.userData;
        //             const dbData = {
        //                 custom_id: customId,
        //                 width: itemWidth,
        //                 furniture_position_mm: itemPositionMm,
        //                 model_original_size: JSON.stringify(userData.originalSize),
        //                 model_scaled_size: JSON.stringify(userData.scaledSize),
        //                 model_position: JSON.stringify(userData.savedPosition),
        //                 is_fitting: isFittingItem,
        //             };

        //             const furnitureListItem = {
        //                 furniture_id: furnitureId,
        //                 db_data: {...dbData},
        //                 object_src: urlSrc,
        //                 object_type: furnitureType,
        //                 display_price: displayPrice,
        //                 regular_price: regularPrice,
        //                 discount_price: discountPrice,
        //                 display_price_cm3: displayPriceCm3,
        //                 width: itemWidth,
        //                 height: itemHeight,
        //                 depth: itemDepth,
        //                 min_width: itemWidthMin,
        //                 min_height: itemHeightMin,
        //                 min_depth: itemDepthMin,
        //             };

        //             modelChildrenList.push(furnitureListItem);

        //             if (visibleModelDimensionArrows) {
        //                 createFurnitureDimensionArrows(childMeshGroup, room3DGroup);
        //             }

        //             // resolve promise
        //             resolve({ itemPositionMm });
        //             } catch (err) {
        //                 console.error("Error processing GLTF:", err);
        //             reject(err);
        //             }
        //         },
        //         undefined,
        //         function (error) {
        //             console.error("❌ Error loading GLB:", error);
        //             reject(error);
        //         }
        //     );
        // })
    // }

    async function addGLBModel(
        urlSrc, furnitureType, furnitureId, customId,
        displayPrice, regularPrice, discountPrice, displayPriceCm3,
        itemHeight, itemDepth, itemWidth,
        itemHeightMin, itemDepthMin, itemWidthMin,
        triggerDupItem = false
    ) {
    return new Promise((resolve, reject) => {
        const dims = get3DItemDimensions(itemHeight, itemDepth, itemWidth, modelRoomHeight, modelRoomDepth, modelRoomWidth);
        const loader = new GLTFLoader();

        loader.load(
            urlSrc,
            (gltf) => {
                const rootGroup = gltf.scene || gltf.scenes[0];

                // Traverse all meshes to fix geometry/material
                rootGroup.traverse(mesh => {
                    if (mesh.isMesh) {
                        if (mesh.geometry && mesh.geometry.attributes.position) {
                            mesh.geometry = BufferGeometryUtils.mergeVertices(mesh.geometry) || mesh.geometry;
                            mesh.geometry.computeVertexNormals();
                        }

                        mesh.material.side = THREE.DoubleSide;
                        mesh.frustumCulled = false;

                        if (!mesh.geometry.attributes.uv) generateSmartUVs(mesh.geometry);

                        const name = (mesh.name || "").toLowerCase();
                        let texture = textureBase;
                        if (frontNodesGlb.includes(name)) texture = textureFrame;

                        mesh.material = new THREE.MeshStandardMaterial({
                            map: texture,
                            metalness: 0.1,
                            roughness: 0.8
                        });
                        mesh.material.needsUpdate = true;

                        mesh.userData.originalMaterial = {
                            color: mesh.material.color.clone(),
                            opacity: mesh.material.opacity,
                            transparent: mesh.material.transparent
                        };
                    }
                });

                const childMeshGroup = new THREE.Group();
                childMeshList.forEach(mesh => {
                    // Save world transform
                    mesh.updateWorldMatrix(true, false);
                    const worldMatrix = mesh.matrixWorld.clone();

                    // Remove from old parent & add to new group
                    mesh.parent.remove(mesh);
                    childMeshGroup.add(mesh);

                    // Reapply world transform so the mesh keeps its position/rotation/scale
                    mesh.matrix.copy(worldMatrix);
                    mesh.matrix.decompose(mesh.position, mesh.quaternion, mesh.scale);
                });

                modelScene.add(childMeshGroup);

                // // Assign metadata to group
                // rootGroup.userData = {
                //     furnitureId,
                //     customId,
                //     furnitureType,
                //     width_mm: itemWidth
                // };

                // Compute bounding box and normalize
                const box = new THREE.Box3().setFromObject(rootGroup);
                const { scaledChildBox, scaledChildSize } = normalizeAndPlaceMeshGroup(rootGroup, box, furnitureType, dims);

                // Save position metadata
                const placedWorldPos = new THREE.Vector3();
                rootGroup.getWorldPosition(placedWorldPos);
                rootGroup.userData.savedPosition = placedWorldPos.clone();
                rootGroup.userData.scaledSize = scaledChildSize;

                // Add to scene
                modelScene.add(rootGroup);

                // Enable dragging
                const isFittingItem = initModelDragging(rootGroup, box, scaledChildBox, scaledChildSize, customId, furnitureType);
                const itemPositionMm = getItemPosition(placedWorldPos.clone(), scaledChildSize);
                rootGroup.userData.positionMm = itemPositionMm;

                // Push to modelChildrenList
                const dbData = {
                    custom_id: customId,
                    width: itemWidth,
                    furniture_position_mm: itemPositionMm,
                    model_original_size: JSON.stringify(rootGroup.userData.originalSize),
                    model_scaled_size: JSON.stringify(rootGroup.userData.scaledSize),
                    model_position: JSON.stringify(rootGroup.userData.savedPosition),
                    is_fitting: isFittingItem
                };

                const furnitureListItem = {
                    furniture_id: furnitureId,
                    db_data: {...dbData},
                    object_src: urlSrc,
                    object_type: furnitureType,
                    display_price: displayPrice,
                    regular_price: regularPrice,
                    discount_price: discountPrice,
                    display_price_cm3: displayPriceCm3,
                    width: itemWidth,
                    height: itemHeight,
                    depth: itemDepth,
                    min_width: itemWidthMin,
                    min_height: itemHeightMin,
                    min_depth: itemDepthMin
                };

                modelChildrenList.push(furnitureListItem);

                if (visibleModelDimensionArrows) createFurnitureDimensionArrows(rootGroup, room3DGroup);

                resolve({ itemPositionMm });
            },
            undefined,
            (error) => {
                console.error("❌ Error loading GLB:", error);
                reject(error);
            }
        );
    });
}


    function generateSmartUVs(geometry) {
        geometry.computeBoundingBox();
        const box = geometry.boundingBox;
        const size = new THREE.Vector3();
        box.getSize(size);

        // Pick dominant axis pair (largest 2D area)
        const areaXY = size.x * size.y;
        const areaYZ = size.y * size.z;
        const areaXZ = size.x * size.z;

        let proj = "XZ"; // default
        if (areaXY >= areaYZ && areaXY >= areaXZ) proj = "XY";
        else if (areaYZ >= areaXY && areaYZ >= areaXZ) proj = "YZ";

        const posAttr = geometry.attributes.position;
        const uvAttr = new Float32Array(posAttr.count * 2);

        for (let i = 0; i < posAttr.count; i++) {
            const x = posAttr.getX(i);
            const y = posAttr.getY(i);
            const z = posAttr.getZ(i);

            let u = 0, v = 0;
            if (proj === "XY") {
                u = (x - box.min.x) / size.x;
                v = (y - box.min.y) / size.y;
            } else if (proj === "YZ") {
                u = (z - box.min.z) / size.z;
                v = (y - box.min.y) / size.y;
            } else { // "XZ"
                u = (x - box.min.x) / size.x;
                v = (z - box.min.z) / size.z;
            }

            uvAttr[i * 2] = u;
            uvAttr[i * 2 + 1] = v;
        }

        geometry.setAttribute("uv", new THREE.BufferAttribute(uvAttr, 2));
    }

    function generateFallbackUVs(geometry) {
        geometry.computeBoundingBox();
        const box = geometry.boundingBox;
        const size = new THREE.Vector3();
        box.getSize(size);

        const posAttr = geometry.attributes.position;
        const uvAttr = new Float32Array((posAttr.count) * 2);

        for (let i = 0; i < posAttr.count; i++) {
            const x = posAttr.getX(i);
            const z = posAttr.getZ(i);

            // Normalize into [0,1] range using bounding box
            uvAttr[i * 2] = (x - box.min.x) / size.x;
            uvAttr[i * 2 + 1] = (z - box.min.z) / size.z;
        }

        geometry.setAttribute('uv', new THREE.BufferAttribute(uvAttr, 2));
    }


    // function addGLBModel(urlSrc, furnitureType, furnitureId, customId, displayPrice, regularPrice, discountPrice, displayPriceCm3, itemHeight, itemDepth, itemWidth, itemHeightMin, itemDepthMin, itemWidthMin, triggerDupItem = false) {
    //     return new Promise((resolve, reject) => {
    //         const loader = new GLTFLoader();
    //         const textureLoader = new THREE.TextureLoader();
    //         const textureBase = currentBaseSrc ? textureLoader.load(currentBaseSrc) : null;
    //         const textureFrame = currentFrameSrc ? textureLoader.load(currentFrameSrc) : null;

    //         const [heightPx, depthPx, widthPx] = get3DItemDimensions(itemHeight, itemDepth, itemWidth, modelRoomHeight, modelRoomDepth, modelRoomWidth);

    //         loader.load(
    //             urlSrc,
    //             function (childGltf) {
    //                 const childModel = childGltf.scene;
    //                 const childMeshList = [];

    //                 childModel.traverse(node => {
    //                     if (node.isMesh) {
    //                         childMeshList.push(node);
    //                         const name = (node.name || "").toLowerCase();
    //                         let texture = textureBase;

    //                         if(frontNodes.includes(name)) {
    //                             texture = textureFrame;
    //                         }

    //                         node.material = new THREE.MeshStandardMaterial({
    //                             map: texture,
    //                             color: 0xffffff,
    //                             metalness: 0,
    //                             roughness: 1,
    //                         });
    //                         node.material.needsUpdate = true;

    //                         node.userData.originalMaterial = {
    //                             color: node.material.color.clone(),
    //                             opacity: node.material.opacity,
    //                             transparent: node.material.transparent
    //                         };
    //                     }
    //                 });

    //                 const childMeshGroup = new THREE.Group();
    //                 childMeshList.forEach(mesh => {
    //                     mesh.parent.remove(mesh); // Detach from original hierarchy
    //                     childMeshGroup.add(mesh);
    //                 });
    //                 childMeshGroup.userData.furnitureId = furnitureId;
    //                 childMeshGroup.userData.customId = customId;
    //                 childMeshGroup.userData.furnitureType = furnitureType;
    //                 childMeshGroup.userData.width_mm = itemWidth;

    //                 modelScene.add(childMeshGroup);

    //                 // childMeshGroup.updateWorldMatrix(true, true); //new
    //                 const childBox = new THREE.Box3().setFromObject(childMeshGroup);
    //                 const childSize = new THREE.Vector3(); 
    //                 childBox.getSize(childSize); 
        
    //                 childMeshGroup.userData.originalSize = childSize.clone();

    //                 /******* size ********/

    //                 const scaleX = widthPx / childSize.x;
    //                 const scaleY = heightPx / childSize.y;
    //                 const scaleZ = depthPx / childSize.z;
    //                 childMeshGroup.scale.set(scaleX, scaleY, scaleZ);

    //                 const finalParentBox = new THREE.Box3().setFromObject(room3DGroup);
    //                 const finalParentSize = new THREE.Vector3();
    //                 finalParentBox.getSize(finalParentSize);
    //                 childMeshGroup.userData.parentBox = finalParentBox;
                    
    //                 // childMeshGroup.updateWorldMatrix(true, true); // new
    //                 const scaledChildBox = new THREE.Box3().setFromObject(childMeshGroup);
    //                 const scaledChildSize = new THREE.Vector3();
    //                 scaledChildBox.getSize(scaledChildSize);

    //                 // // new
    //                 // const finalParentBox = new THREE.Box3().setFromObject(room3DGroup);
    //                 // const worldPos = new THREE.Vector3();
    //                 // childMeshGroup.getWorldPosition(worldPos);
    //                 // childMeshGroup.userData.parentBox = finalParentBox.clone();

    //                 const objHeight = scaledChildBox.max.y - scaledChildBox.min.y;

    //                 /******* end size ********/

    //                 /******* position *********/
    //                 let leftAdditionalUnit = 0;

    //                 if(roomType === ROOM_TYPE_WITH_CORNER) {
    //                     leftAdditionalUnit = wallThickness;
    //                     switch(furnitureType) {
    //                         case DIMENSION_TYPE_BOTTOM: {
    //                             leftAdditionalUnit += cornerBottomWidth3d;
    //                             break;
    //                         }
    //                         case DIMENSION_TYPE_TOP: {
    //                             leftAdditionalUnit += cornerTopWidth3d;
    //                             break;
    //                         }
    //                         case DIMENSION_TYPE_FULL: {
    //                             leftAdditionalUnit += cornerFullWidth3d;
    //                             break;
    //                         }
    //                         default: {
    //                             break;
    //                         }
    //                     }
    //                 } 
    //                 // else {
    //                 //     leftAdditionalUnit = scaledChildSize.x / 2;
    //                 // }

    //                 // const leftX = finalParentBox.min.x + leftAdditionalUnit + scaledChildSize.z; 
    //                 const leftX = finalParentBox.min.x + scaledChildSize.x / 2 + leftAdditionalUnit; 

    //                 const yPosition = furnitureType.includes(DIMENSION_TYPE_TOP)
    //                     ? calculateTopSpaceIn3dModel(finalParentBox)
    //                     : finalParentBox.min.y + floorThickness;
        
    //                 const backZ = finalParentBox.min.z + (scaledChildSize.z / 2) + wallThickness;  // offset from parent's center
    //                 childMeshGroup.position.set(leftX, yPosition, backZ);

    //                 let isFittingItem = true;
                    

    //                 /******* end position *********/

    //                 // lock Y position
    //                 // childMeshGroup.userData.lockedY = placedWorldPos.y;

    //                 /******** 2.save position and size********/
    //                 const placedWorldPos = new THREE.Vector3();
    //                 childMeshGroup.getWorldPosition(placedWorldPos);
    //                 childMeshGroup.userData.savedPosition = placedWorldPos.clone();
    //                 childMeshGroup.userData.scaledSize = scaledChildSize.clone();
    //                 /******** end save position ********/

    //                 /******* enable dragging *********/

    //                 if(!furnitureType.includes('corner')) {
    //                     /******* check if fits *******/
    //                     isFittingItem = checkIfAbleToDragChildToPosition(childMeshGroup, scaledChildBox); 
    //                     childMeshGroup.userData.isFitting = isFittingItem;
            
    //                     if (!isFittingItem) {
    //                         childMeshGroup.traverse(child => {
    //                             if (child.isMesh) {
    //                                 child.material.color.set(0xff0000);
    //                                 child.material.transparent = true;
    //                                 child.material.opacity = 0.5;
    //                             }
    //                         });
    //                     }
    //                     /******* end check if fits *******/

    //                     const dragControls = new DragControls(
    //                         [childMeshGroup],  // objects to drag
    //                         threeJSCamera,
    //                         threeJSRendered.domElement
    //                     );
    //                     dragControls.transformGroup = true;

    //                     childMeshGroup.userData.dragControls = dragControls;

    //                     dragControls.addEventListener('drag', event => {
    //                         const obj = event.object;
    //                         let isFitting = true;
    //                         if(roomType == ROOM_TYPE_WITH_CORNER) {
    //                             isFitting = setCornerChildenDragging(obj);
    //                         } else {
    //                             isFitting = setSingleWallChilderDragging(obj);
    //                         }

    //                         obj.userData.isFitting = isFitting;
    //                         if (!isFitting) {
    //                             obj.traverse(child => {
    //                                 if (child.isMesh) {
    //                                     child.material.color.set(0xff0000);
    //                                     child.material.transparent = true;
    //                                     child.material.opacity = 0.5;
    //                                 } 
    //                             });
    //                         } else {
    //                             obj.traverse(child => {
    //                                 if (child.isMesh) {
    //                                     child.material.color.set(0x00ff00);
    //                                     child.material.transparent = true;
    //                                     child.material.opacity = 0.5;
    //                                 } 
    //                             });
    //                         }

    //                         if(visibleModelDimensionArrows) {
    //                             createFurnitureDimensionArrows(childMeshGroup, room3DGroup);
    //                         }
                            
    //                     });

    //                     dragControls.addEventListener('dragstart', event => {
    //                         threeJSControls.enabled = false; // disable parent rotation & zoom
    //                     });

    //                     dragControls.addEventListener('dragend', event => {
    //                         threeJSControls.enabled = true;  // re-enable orbit

    //                         const obj = event.object;

    //                         /******** saved position ********/
    //                         const childWorldPos = new THREE.Vector3();
    //                         obj.getWorldPosition(childWorldPos);
    //                         obj.userData.savedPosition = childWorldPos.clone();

    //                         const itemPositionMm = getItemPosition(childWorldPos.clone(), scaledChildSize.clone(), customId);
    //                         obj.userData.positionMm = itemPositionMm;
                            
    //                         /******** end saved position ********/
    //                         const newUserData = obj.userData;
    //                         const isFitting = newUserData.isFitting
    //                         if(isFitting) {
    //                             obj.traverse(child => {
    //                                 if (child.isMesh && child.userData.originalMaterial) {
    //                                     child.material.color.copy(child.userData.originalMaterial.color);
    //                                     child.material.opacity = child.userData.originalMaterial.opacity;
    //                                     child.material.transparent = child.userData.originalMaterial.transparent;
    //                                 }
    //                             });
    //                         } 

    //                         const itemIndex = modelChildrenList.findIndex(item => item.db_data.custom_id == obj.userData.customId);
                
    //                         if(itemIndex > -1) {
    //                             const oldItem = {...modelChildrenList[itemIndex]};
    //                             oldItem.db_data.is_fitting = isFitting;
    //                             oldItem.db_data.model_position = JSON.stringify(childWorldPos.clone());
    //                             modelChildrenList[itemIndex] = {...oldItem};
    //                         }

    //                     });
    //                 } else {
    //                     checkIfItemsAreFittingForNewCorner(childMeshGroup, childBox);
    //                     removeCornerPseudoModelObjects(furnitureType);
    //                 }
                    
    //                 const itemPositionMm = getItemPosition(placedWorldPos.clone(), scaledChildSize.clone());
    //                 childMeshGroup.userData.positionMm = itemPositionMm;
    //                 /***** push item ****/
    //                 const userData = childMeshGroup.userData;
    //                 const dbData  = {
    //                     custom_id: customId,
    //                     width: itemWidth,
    //                     furniture_position_mm: itemPositionMm,
    //                     model_original_size: JSON.stringify(userData.originalSize),
    //                     model_scaled_size: JSON.stringify(userData.scaledSize),
    //                     model_position: JSON.stringify(userData.savedPosition),
    //                     is_fitting: isFittingItem,
    //                 };
                
    //                 const furnitureListItem = {
    //                     furniture_id: furnitureId,
    //                     db_data: {...dbData},
    //                     object_src: urlSrc,
    //                     object_type: furnitureType, 
    //                     display_price: displayPrice,
    //                     regular_price: regularPrice,
    //                     discount_price: discountPrice,
    //                     display_price_cm3: displayPriceCm3,
    //                     width: itemWidth,
    //                     height: itemHeight,
    //                     depth: itemDepth,
    //                     min_width: itemWidthMin,
    //                     min_height: itemHeightMin,
    //                     min_depth: itemDepthMin,
    //                 }

    //                 modelChildrenList.push(furnitureListItem);

    //                 if(visibleModelDimensionArrows) {
    //                     createFurnitureDimensionArrows(childMeshGroup, room3DGroup);
    //                 }

    //                 const duplicateItem = triggerDupItem ? childMeshGroup : null;
    //                 // initModelClickEvent(duplicateItem) 
    //                 /***** end push item ****/

    //                 // Disable orbit while dragging


    //                 /******* end enable dragging *********/
                    
    //                 resolve({
    //                     itemPositionMm,
    //                 });

    //             },
    //             undefined,
    //             (error) => {
    //                 console.error("❌ Error loading GLB:", error);
    //             }
    //         );
    //     });
    // }

    function addExistingGLBModel(id, urlSrc, furnitureType, furnitureId, customId, itemWidth, originalSize, scaledSize, savedPosition, childPositionMm, isFitting) {
        const loader = new GLTFLoader();
        // const textureLoader = new THREE.TextureLoader();
        // const textureBase = currentBaseSrc ? textureLoader.load(currentBaseSrc) : null;
        // const textureFrame = currentFrameSrc ? textureLoader.load(currentFrameSrc) : null;

        loader.load(
            urlSrc,
            function (childGltf) {
                const childMesh = childGltf.scene;
                let childMeshList = [];

                childMesh.traverse(node => {
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
                        let texture = textureBase;
    
                        if(frontNodesGlb.includes(name)) {
                            texture = textureFrame;
                        }

                        node.material = new THREE.MeshStandardMaterial({
                            map: texture,
                            metalness: 0.1,    // little reflection
                            roughness: 0.8,    // wood is not glossy
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

                // const childMeshGroup = new THREE.Group();
                // childMeshList.forEach(mesh => {
                //     mesh.parent.remove(mesh); // Detach from original hierarchy
                //     childMeshGroup.add(mesh);
                // });

                const childMeshGroup = new THREE.Group();
                childMeshGroup.userData.rowId = id;
                childMeshGroup.userData.customId = customId;
                childMeshGroup.userData.furnitureId = furnitureId;
                childMeshGroup.userData.furnitureType = furnitureType;
                childMeshGroup.userData.width_mm = itemWidth;
                childMeshGroup.userData.originalSize = originalSize;
                childMeshGroup.userData.scaledSize = scaledSize;
                childMeshGroup.userData.savedPosition = savedPosition;
                childMeshGroup.userData.positionMm = childPositionMm;
                childMeshGroup.userData.isFitting = isFitting;

                // childMeshGroup.userData.furnitureId = furnitureId;
                // childMeshGroup.userData.customId = customId;
                // childMeshGroup.userData.furnitureType = furnitureType;
                // childMeshGroup.userData.width_mm = itemWidth;

                childMeshList.forEach(mesh => {
                    // Save world transform
                    mesh.updateWorldMatrix(true, false);
                    const worldMatrix = mesh.matrixWorld.clone();

                    // Remove from old parent & add to new group
                    mesh.parent.remove(mesh);
                    childMeshGroup.add(mesh);

                    // Reapply world transform so the mesh keeps its position/rotation/scale
                    mesh.matrix.copy(worldMatrix);
                    mesh.matrix.decompose(mesh.position, mesh.quaternion, mesh.scale);
                });

                modelScene.add(childMeshGroup);

                /******* size and position *********/
                const scaleX = parseFloat(scaledSize.x) / Math.abs(originalSize.x);
                const scaleY = parseFloat(scaledSize.y) / Math.abs(originalSize.y) || 1; // avoid zero
                const scaleZ = parseFloat(scaledSize.z) / Math.abs(originalSize.z);

                childMeshGroup.scale.set(scaleX, scaleY, scaleZ);
                // childMeshGroup.scale.set(scaledSize.x, scaledSize.y, scaledSize.z);
                childMeshGroup.position.set(savedPosition.x, savedPosition.y, savedPosition.z);

                /******* end position *********/

                if (!isFitting) {
                    childMeshGroup.traverse(child => {
                        if (child.isMesh) {
                            child.material.color.set(0xff0000);
                            child.material.transparent = true;
                            child.material.opacity = 0.5;
                        }
                    });
                }

                /******* enable dragging *********/
                if(!furnitureType.includes('corner')) {
                    const dragControls = new DragControls(
                        [childMeshGroup],  // objects to drag
                        threeJSCamera,
                        threeJSRendered.domElement
                    );
                    dragControls.transformGroup = true;

                    childMeshGroup.userData.dragControls = dragControls;


                    dragControls.addEventListener('drag', event => {
                        const obj = event.object;
                        let isFitting = true;
                        if(roomType == ROOM_TYPE_WITH_CORNER) {
                            isFitting = setCornerChildenDragging(obj);
                        } else {
                            isFitting = setSingleWallChilderDragging(obj);
                        }

                        obj.userData.isFitting = isFitting;
                        if (!isFitting) {
                            obj.traverse(child => {
                                if (child.isMesh) {
                                    child.material.color.set(0xff0000);
                                    child.material.transparent = true;
                                    child.material.opacity = 0.5;
                                } 
                            });
                        } else {
                            obj.traverse(child => {
                                if (child.isMesh) {
                                    child.material.color.set(0x00ff00);
                                    child.material.transparent = true;
                                    child.material.opacity = 0.5;
                                } 
                            });
                        }

                        if (obj.userData.dimensions) {
                            obj.userData.dimensions.forEach(dim => obj.remove(dim)); // remove old
                        }

                        if(visibleModelDimensionArrows) {
                            createFurnitureDimensionArrows(obj, room3DGroup);
                        }
                    });
                    

                    dragControls.addEventListener('dragstart', event => {
                        threeJSControls.enabled = false; // disable parent rotation & zoom
                    });

                    dragControls.addEventListener('dragend', event => {
                        threeJSControls.enabled = true;  // re-enable orbit

                        const obj = event.object;

                        /******** saved position ********/
                        const childWorldPos = new THREE.Vector3();
                        obj.getWorldPosition(childWorldPos);
                        obj.userData.savedPosition = childWorldPos.clone();
                        const isFitting = obj.userData.isFitting;
                        /******** end saved position ********/

                        if(isFitting) {
                            obj.traverse(child => {
                                if (child.isMesh && child.userData.originalMaterial) {
                                    child.material.color.copy(child.userData.originalMaterial.color);
                                    child.material.opacity = child.userData.originalMaterial.opacity;
                                    child.material.transparent = child.userData.originalMaterial.transparent;
                                }
                            });
                        } 

                        const itemIndex = modelChildrenList.findIndex(item => item.db_data.custom_id == obj.userData.customId);
            
                        if(itemIndex > -1) {
                            const oldItem = {...modelChildrenList[itemIndex]};
                            oldItem.db_data.is_fitting = isFitting;
                            oldItem.db_data.model_position = JSON.stringify(childWorldPos.clone());
                            modelChildrenList[itemIndex] = {...oldItem};
                        }
                    });

                // Disable orbit while dragging

                /******* end enable dragging *********/

                } else {
                    removeCornerPseudoModelObjects(furnitureType);
                }

                /******** click event start ********/

                /******** click event end ********/

                // dragControls.addEventListener('click', event => {
                //     const obj = event.object;
                //     const userData = obj.userData;
                //     const customId = userData.customId;
                //     console.log(customId);
                // });
            },
            (xhr) => {
                console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
            },
            (error) => {
                console.error("❌ Error loading GLB:", error);
            }
        );
    }

    function normalizeAndPlaceMeshGroup(rootGroup, targetBox, furnitureType, dims) {
    const [heightPx, depthPx, widthPx] = dims;

    // Compute original size
    const childSize = new THREE.Vector3();
    targetBox.getSize(childSize);
    rootGroup.userData.originalSize = childSize.clone();

    // Move group center to origin
    const center = new THREE.Vector3();
    targetBox.getCenter(center);
    rootGroup.position.sub(center);

    // Scale group to target dimensions
    const scaleX = widthPx / childSize.x;
    const scaleY = heightPx / childSize.y || 1; // avoid division by zero
    const scaleZ = depthPx / childSize.z;
    rootGroup.scale.set(scaleX, scaleY, scaleZ);

    // Compute scaled bounding box
    const scaledChildBox = new THREE.Box3().setFromObject(rootGroup);
    const scaledChildSize = new THREE.Vector3();
    scaledChildBox.getSize(scaledChildSize);
    rootGroup.userData.scaledSize = scaledChildSize.clone();

    // Place in room
    const parentBox = new THREE.Box3().setFromObject(room3DGroup);
    rootGroup.userData.parentBox = parentBox;

    let leftAdditionalUnit = 0;
    if (roomType === ROOM_TYPE_WITH_CORNER) {
        leftAdditionalUnit = wallThickness;
        switch (furnitureType) {
            case DIMENSION_TYPE_BOTTOM: leftAdditionalUnit += cornerBottomWidth3d; break;
            case DIMENSION_TYPE_TOP: leftAdditionalUnit += cornerTopWidth3d; break;
            case DIMENSION_TYPE_FULL: leftAdditionalUnit += cornerFullWidth3d; break;
        }
    }

    const leftX = parentBox.min.x + scaledChildSize.x / 2 + leftAdditionalUnit;
    const yPosition = (furnitureType.includes(DIMENSION_TYPE_TOP)
        ? calculateTopSpaceIn3dModel(parentBox)
        : parentBox.min.y + floorThickness) + scaledChildSize.y / 2;
    const backZ = parentBox.min.z + scaledChildSize.z / 2 + wallThickness;

    // Apply final position
    const scaledCenter = scaledChildBox.getCenter(new THREE.Vector3());
    rootGroup.position.add(new THREE.Vector3(
        leftX - scaledCenter.x,
        yPosition - scaledCenter.y,
        backZ - scaledCenter.z
    ));

    return { scaledChildBox: scaledChildBox.clone(), scaledChildSize: scaledChildSize.clone() };
}


    function initModelDragging(rootGroup, childBox, scaledChildBox, scaledChildSize, customId, furnitureType) {
    let isFittingItem = true;

    if (!furnitureType.includes('corner')) {
        // Initial fitting check
        isFittingItem = checkIfAbleToDragChildToPosition(rootGroup, scaledChildBox);
        rootGroup.userData.isFitting = isFittingItem;

        if (!isFittingItem) {
            rootGroup.traverse(mesh => {
                if (mesh.isMesh) {
                    mesh.material.color.set(0xff0000);
                    mesh.material.transparent = true;
                    mesh.material.opacity = 0.5;
                }
            });
        }

        // Create DragControls on the group
        const dragControls = new DragControls([rootGroup], threeJSCamera, threeJSRendered.domElement);
        dragControls.transformGroup = true;
        rootGroup.userData.dragControls = dragControls;

        dragControls.addEventListener('dragstart', () => {
            threeJSControls.enabled = false;
        });

        dragControls.addEventListener('drag', event => {
            const obj = event.object;
            let isFitting = true;
            if (roomType === ROOM_TYPE_WITH_CORNER) {
                isFitting = setCornerChildenDragging(obj);
            } else {
                isFitting = setSingleWallChilderDragging(obj);
            }
            obj.userData.isFitting = isFitting;

            obj.traverse(mesh => {
                if (mesh.isMesh) {
                    mesh.material.color.set(isFitting ? 0x00ff00 : 0xff0000);
                    mesh.material.transparent = true;
                    mesh.material.opacity = 0.5;
                }
            });

            if (visibleModelDimensionArrows) createFurnitureDimensionArrows(obj, room3DGroup);
        });

        dragControls.addEventListener('dragend', event => {
            threeJSControls.enabled = true;

            const obj = event.object;
            const worldPos = new THREE.Vector3();
            obj.getWorldPosition(worldPos);
            obj.userData.savedPosition = worldPos.clone();
            obj.userData.positionMm = getItemPosition(worldPos.clone(), scaledChildSize.clone(), customId);

            if (obj.userData.isFitting) {
                obj.traverse(mesh => {
                    if (mesh.isMesh && mesh.userData.originalMaterial) {
                        mesh.material.color.copy(mesh.userData.originalMaterial.color);
                        mesh.material.opacity = mesh.userData.originalMaterial.opacity;
                        mesh.material.transparent = mesh.userData.originalMaterial.transparent;
                    }
                });
            }

            const itemIndex = modelChildrenList.findIndex(item => item.db_data.custom_id === obj.userData.customId);
            if (itemIndex > -1) {
                const oldItem = { ...modelChildrenList[itemIndex] };
                oldItem.db_data.is_fitting = obj.userData.isFitting;
                oldItem.db_data.model_position = JSON.stringify(worldPos);
                modelChildrenList[itemIndex] = { ...oldItem };
            }
        });
    } else {
        checkIfItemsAreFittingForNewCorner(rootGroup, childBox);
        removeCornerPseudoModelObjects(furnitureType);
    }

    return isFittingItem;
}


   function createFurnitureDimensionArrows(childMeshGroup, room3DGroup) {
        // Remove old arrows & labels
        if (childMeshGroup.userData.dimensions) {
            childMeshGroup.userData.dimensions.forEach(obj => modelScene.remove(obj));
        }

        const objects = [];

        const roomBox = new THREE.Box3().setFromObject(room3DGroup);
        const furnitureBox = new THREE.Box3().setFromObject(childMeshGroup);

        const furnitureSize = new THREE.Vector3();
        furnitureBox.getSize(furnitureSize);

        const roomSize = new THREE.Vector3();
        roomBox.getSize(roomSize);
        const positionMmOrigin = childMeshGroup.userData.positionMm
        const positionMm = typeof(positionMmOrigin) == 'string' ? JSON.parse(positionMmOrigin) : positionMmOrigin;

        // Helper: create line + label
        function makeArrowWithNumber(start, end, color, labelText) {
            const group = [];

            // Line
            const points = [start, end];
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({ color: color, linewidth: 2, depthTest: false });
            const line = new THREE.Line(geometry, material);
            group.push(line);

            // Label at midpoint
            const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
            const label = makeTextSprite(labelText, { fontSize: 600, color: "black" });
            label.position.copy(mid);
            label.position.y += 0.1; // small offset above line
            group.push(label);

            return group;
        }

        function makeTextSprite(message, params = {}) {
            const fontSize = params.fontSize || 100; // px
            const color = params.color || "black";

            // Create canvas
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            // First, measure text
            ctx.font = `${fontSize}px Arial`;
            const textWidth = ctx.measureText(message).width;

            // Set canvas size AFTER measuring
            canvas.width = textWidth * 2; // add padding
            canvas.height = fontSize * 2;

            // Reset font after resizing canvas
            ctx.font = `${fontSize}px Arial`;
            ctx.fillStyle = color;
            ctx.textBaseline = "top";
            ctx.fillText(message, 0, 0);

            // Create texture
            const texture = new THREE.CanvasTexture(canvas);
            texture.needsUpdate = true;

            const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
            const sprite = new THREE.Sprite(material);
            sprite.renderOrder = 999;
            sprite.position.z += 0.05; 

            // Scale to scene units
            const scaleFactor = 0.02; // tweak depending on scene size
            sprite.scale.set(canvas.width * scaleFactor, canvas.height * scaleFactor, 1);

            return sprite;
        }

        // === LEFT ARROW ===
        const leftDist = furnitureBox.min.x - roomBox.min.x;
        if (leftDist > 0) {
            const leftArrow = makeArrowWithNumber(
                new THREE.Vector3(roomBox.min.x, furnitureBox.min.y + furnitureSize.y, furnitureBox.min.z),
                new THREE.Vector3(furnitureBox.min.x, furnitureBox.min.y + furnitureSize.y, furnitureBox.min.z),
                0xff0000, // red
                `${positionMm.left.toFixed(2)} mm`
            );
            objects.push(...leftArrow);
        }

        // === RIGHT ARROW ===
        const rightDist = roomBox.max.x - furnitureBox.max.x;
        if (rightDist > 0) {
            const rightArrow = makeArrowWithNumber(
                new THREE.Vector3(furnitureBox.max.x, furnitureBox.min.y + furnitureSize.y, furnitureBox.min.z),
                new THREE.Vector3(roomBox.max.x, furnitureBox.min.y + furnitureSize.y, furnitureBox.min.z),
                0xff0000,
                `${positionMm.right.toFixed(2)} mm`
            );
            objects.push(...rightArrow);
        }

        // === TOP ARROW ===
        const topDist = roomBox.max.y - furnitureBox.max.y;
        if (topDist > 0) {
            const topArrow = makeArrowWithNumber(
                new THREE.Vector3(furnitureBox.max.x - furnitureSize.x/2, furnitureBox.max.y, furnitureBox.min.z),
                new THREE.Vector3(furnitureBox.max.x - furnitureSize.x/2, roomBox.max.y, furnitureBox.min.z),
                0xff0000,
                `${positionMm.top.toFixed(2)} mm`
            );
            objects.push(...topArrow);
        }

        // Add all objects to scene
        objects.forEach(o => modelScene.add(o));

        // Save for removal later
        childMeshGroup.userData.dimensions = objects;
    }

    // function createBasicDisplayDimensionArrows() {
    //     const { bottomHeight, bottomFullDepth, topHeight, topDepth, fullHeight, verticalSpace } = dimensions;

    //     if (basicDisplayBottomObj.userData.dimensions) {
    //         basicDisplayBottomObj.userData.dimensions.forEach(obj => modelScene.remove(obj));
    //         basicDisplayTopObj.userData.dimensions.forEach(obj => modelScene.remove(obj));
    //         basicDisplayFullObj.userData.dimensions.forEach(obj => modelScene.remove(obj));
    //     }
           
    //     const bottomObjects = [];
    //     const topObjects = [];
    //     const fullObjects = [];

    //     // Helper: create line + label
    //     function makeArrowWithNumber(start, end, color, labelText) {
    //         const group = [];

    //         // Line
    //         const points = [start, end];
    //         const geometry = new THREE.BufferGeometry().setFromPoints(points);
    //         const material = new THREE.LineBasicMaterial({ color: color, linewidth: 2, depthTest: false });
    //         const line = new THREE.Line(geometry, material);
    //         group.push(line);

    //         // Label at midpoint
    //         const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    //         const label = makeTextSprite(labelText, { fontSize: 1500, color: "black" });
    //         label.position.copy(mid);
    //         label.position.y += 0.1; // small offset above line
    //         group.push(label);

    //         return group;
    //     }

    //     // === BOTTOM ARROWS ===

    //     const furnitureBoxBottom = new THREE.Box3().setFromObject(basicDisplayBottomObj);
    //     const furnitureSizeBottom = new THREE.Vector3();
    //     furnitureBoxBottom.getSize(furnitureSizeBottom);

    //     //
    //     const startLocal = new THREE.Vector3(
    //         0.5,               // right side in X
    //         0,                 // bottom in Y
    //         -0.5               // back in Z
    //     );

    //     const depthLength = furnitureSizeBottom.z; // along Z
    //     const angle = THREE.MathUtils.degToRad(-30); // rotate around Y if needed
    //     const endLocal = new THREE.Vector3(
    //         startLocal.x + Math.cos(angle) * depthLength,
    //         startLocal.y,
    //         startLocal.z + Math.sin(angle) * depthLength
    //     );

    //     // Transform to world coordinates
    //     const startDeptArrowBottom = startLocal.clone().applyMatrix4(basicDisplayBottomObj.matrixWorld);
    //     const endDeptArrowBottom = endLocal.clone().applyMatrix4(basicDisplayBottomObj.matrixWorld);

    //     const bottomHeightArrow = makeArrowWithNumber(
    //         // startLocalHeight,
    //         // endHeight,
    //         new THREE.Vector3(furnitureBoxBottom.max.x + 0.1, furnitureBoxBottom.min.y - 0.02, furnitureBoxBottom.min.z),
    //         new THREE.Vector3(furnitureBoxBottom.max.x + 0.1, furnitureBoxBottom.max.y - 0.02, furnitureBoxBottom.min.z),
    //         0xff0000, // red
    //         `${bottomHeight} mm`
    //     );
    //     bottomObjects.push(...bottomHeightArrow);

    //     const bottomDepthArrow = makeArrowWithNumber(
    //         startDeptArrowBottom,
    //         endDeptArrowBottom,
    //         0xff0000, // red
    //         `${bottomFullDepth} mm`
    //     );
    //     bottomObjects.push(...bottomDepthArrow);

    //     // Add all objects to scene
    //     bottomObjects.forEach(o => basicDisplayScene.add(o));

    //     // === TOP ARROWS ===

    //     const furnitureBoxTop = new THREE.Box3().setFromObject(basicDisplayTopObj);
    //     const furnitureSizeTop = new THREE.Vector3();
    //     furnitureBoxTop.getSize(furnitureSizeTop);

    //     //
    //     const startLocalTop = new THREE.Vector3(
    //         0.5,               // right side in X
    //         0,                 // bottom in Y
    //         -0.5               // back in Z
    //     );

    //     const depthLengthTop = furnitureSizeBottom.z; // along Z
    //     const angleTop = THREE.MathUtils.degToRad(-30); // rotate around Y if needed
    //     const endLocalTop = new THREE.Vector3(
    //         startLocalTop.x + Math.cos(angle) * depthLengthTop,
    //         startLocalTop.y,
    //         startLocalTop.z + Math.sin(angle) * angleTop
    //     );

    //     // Transform to world coordinates
    //     const startDeptArrowTop = startLocalTop.clone().applyMatrix4(basicDisplayTopObj.matrixWorld);
    //     const endDeptArrowTop = endLocalTop.clone().applyMatrix4(basicDisplayTopObj.matrixWorld);

    //     const topHeightArrow = makeArrowWithNumber(
    //         // startLocalHeight,
    //         // endHeight,
    //         new THREE.Vector3(furnitureBoxTop.max.x + 0.1, furnitureBoxTop.min.y + 0.02, furnitureBoxTop.min.z),
    //         new THREE.Vector3(furnitureBoxTop.max.x + 0.1, furnitureBoxTop.max.y + 0.02, furnitureBoxTop.min.z),
    //         0xff0000, // red
    //         `${topHeight} mm`
    //     );
    //     topObjects.push(...topHeightArrow);

    //     const topDepthArrow = makeArrowWithNumber(
    //         startDeptArrowTop,
    //         endDeptArrowTop,
    //         0xff0000, // red
    //         `${topDepth} mm`
    //     );
    //     topObjects.push(...topDepthArrow);

    //     topObjects.forEach(o => basicDisplayScene.add(o));

    //     // === FULL ARROWS ===

    //     const furnitureBoxFull = new THREE.Box3().setFromObject(basicDisplayFullObj);
    //     const furnitureSizeFull = new THREE.Vector3();
    //     furnitureBoxFull.getSize(furnitureSizeFull);

    //     //
    //     const startLocalFull = new THREE.Vector3(
    //         0.5,               // right side in X
    //         0,                 // bottom in Y
    //         -0.5               // back in Z
    //     );

    //     const depthLengthFull = furnitureSizeBottom.z; // along Z
    //     const angleFull = THREE.MathUtils.degToRad(-30); // rotate around Y if needed
    //     const endLocalFull = new THREE.Vector3(
    //         startLocalFull.x + Math.cos(angle) * depthLengthFull,
    //         startLocalFull.y,
    //         startLocalFull.z + Math.sin(angle) * angleFull
    //     );

    //     // Transform to world coordinates
    //     const startDeptArrowFull = startLocalFull.clone().applyMatrix4(basicDisplayFullObj.matrixWorld);
    //     const endDeptArrowFull = endLocalFull.clone().applyMatrix4(basicDisplayFullObj.matrixWorld);

    //     const fullHeightArrow = makeArrowWithNumber(
    //         // startLocalHeight,
    //         // endHeight,
    //         new THREE.Vector3(furnitureBoxFull.min.x - 0.1, furnitureBoxFull.min.y - 0.11, furnitureBoxFull.min.z),
    //         new THREE.Vector3(furnitureBoxFull.min.x - 0.1, furnitureBoxFull.max.y + 0.055, furnitureBoxFull.min.z),
    //         0xff0000, // red
    //         `${fullHeight} mm`
    //     );
    //     fullObjects.push(...fullHeightArrow);

    //     const fullDepthArrow = makeArrowWithNumber(
    //         startDeptArrowFull,
    //         endDeptArrowFull,
    //         0xff0000, // red
    //         `${topDepth} mm`
    //     );
    //     fullObjects.push(...fullDepthArrow);

    //     // Add all objects to scene
    //     fullObjects.forEach(o => basicDisplayScene.add(o));

    //     // Save for removal later
    //     basicDisplayBottomObj.userData.dimensions = bottomObjects;
    //     basicDisplayTopObj.userData.dimensions = topObjects;
    //     basicDisplayFullObj.userData.dimensions = fullObjects;
    // }

// ---------- main create function ----------
function createBasicDisplayDimensionArrowsGood() {
     function makeDimensionArrow(startWorld, endWorld, labelText, arrowDir) {
        let fontSize = 40;
        // let arrowMinRadiusX = 0.001;
        // let arrowMinHeightX = 0.002;
        // let arrowMinRadiusY = 0.015;
        // let arrowMinHeightY = 0.03;

        if(arrowDir === 'y-right') {
            fontSize = 55;
            // arrowMinRadiusX = 0.005;
            // arrowMinHeightX = 0.006;
            // arrowMinRadiusY = 0.023;
            // arrowMinHeightY = 0.07;
        }
        // startWorld, endWorld are THREE.Vector3 in WORLD coordinates
        const group = new THREE.Group();

        // main line
        const pts = [ startWorld.clone(), endWorld.clone() ];
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        const matLine = new THREE.LineBasicMaterial({ color: 0xff0000, depthTest: false });
        const line = new THREE.Line(geo, matLine);
        group.add(line);

        // direction & length
        const dir = new THREE.Vector3().subVectors(endWorld, startWorld);
        const length = dir.length();
        if (length < 1e-6) return group;
        dir.normalize();

        // // arrowhead geometry scaled to length
        // // const arrowRadius = Math.max(arrowMinRadiusX, length * arrowMinRadiusY); // min radius
        // // const arrowHeight = Math.max(arrowMinHeightX, length * arrowMinHeightY); // min height
        // const arrowGeometry = new THREE.ConeGeometry(arrowRadius, arrowHeight, 12);

        // // create a material that always renders on top
        // const arrowMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, depthTest: false });

        // function addArrowAt(pos, direction, invert = false) {
        //     const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
        //     // orient cone: Cone default points +Y; create quaternion from +Y to direction
        //     const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
        //     if (invert) {
        //         // if invert, rotate 180 degrees around axis orthogonal to direction
        //         const flip = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0), Math.PI);
        //         q.multiply(flip);
        //     }
        //     arrow.quaternion.copy(q);
        //     arrow.position.copy(pos);
        //     group.add(arrow);
        // }

        function addArrowSprite(pos, direction, invert = false) {
            const material = new THREE.SpriteMaterial({ map: arrowImgTexture, transparent: true, depthTest: false });
            const sprite = new THREE.Sprite(material);

            // scale arrow relative to line length
            const scale = Math.max(0.02, length * 0.05);
            sprite.scale.set(scale, scale, 1);

            // orient sprite along direction (rotate around Y)
            const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
            if (invert) {
                const flip = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI);
                q.multiply(flip);
            }
            sprite.quaternion.copy(q);
            sprite.position.copy(pos);
            group.add(sprite);
        }

        // place arrowheads slightly offset inward so they don't overlap label
        const inset = Math.min(length * 0.02, 0.05); // small inset
        const arrowPosA = startWorld.clone().add(dir.clone().multiplyScalar(inset));
        const arrowPosB = endWorld.clone().add(dir.clone().multiplyScalar(-inset));

        // addArrowAt(arrowPosA, dir.clone().negate(), false);           // arrow pointing inward from start
        // addArrowAt(arrowPosB, dir, false); // arrow pointing inward from end

        addArrowSprite(arrowPosA, dir.clone().negate());
        addArrowSprite(arrowPosB, dir);

        // label
        const mid = new THREE.Vector3().addVectors(startWorld, endWorld).multiplyScalar(0.5);
        const label = makeTextSprite(labelText, { fontSize: fontSize, color: "black" });

        label.position.copy(mid);

        if(arrowDir === 'y-left') {
            const xOffset = 0.2;
            label.position.x -= xOffset;
            const yOffset = Math.max(0.01, length * 0.04);
            label.position.y += yOffset;
        } else if(arrowDir === 'y-right') {
            const xOffset = 0.25;
            label.position.x += xOffset;
            const yOffset = Math.max(0.01, length * 0.04);
            label.position.y -= yOffset;
        } else if(arrowDir === 'z-right'){
            const yOffset = 0.01;
            label.position.y -= yOffset;
            label.rotateY(THREE.MathUtils.degToRad(-30));
        }
    
        group.add(label);

        return group;
    }

    function makeTextSprite(message, params = {}) {
        const fontSize = params.fontSize || 120; // pixels (smaller by default)
        const color = params.color || "black";

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // temporary font to measure
        ctx.font = `${fontSize}px Arial`;
        const textWidth = Math.ceil(ctx.measureText(message).width);

        // size canvas to measured text + padding
        canvas.width = textWidth + 20;
        canvas.height = Math.ceil(fontSize * 1.4);

        // redraw text
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = color;
        ctx.textBaseline = "top";
        ctx.fillText(message, 10, 0);

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
        const sprite = new THREE.Sprite(material);
        sprite.renderOrder = 999;

        // Scale to scene units: tune this scale factor to your scene units (0.001 = mm->m)
        // We use a heuristic: width in px * 0.001 (scene units) so it scales with model sizes.
        const scaleFactor = 0.0015; // tweak if needed
        sprite.scale.set(canvas.width * scaleFactor, canvas.height * scaleFactor, 1);

        return sprite;
    }

    // remove old arrows if present
    [basicDisplayBottomObj, basicDisplayTopObj, basicDisplayFullObj].forEach(obj => {
        if (!obj) return;
        if (obj.userData.dimensions) {
            obj.userData.dimensions.forEach(o => basicDisplayScene.remove(o));
        }
        obj.userData.dimensions = [];
    });

    // ensure scene world matrices are up-to-date (important because you rotate rootGroup)
    basicDisplayScene.updateMatrixWorld(true);

    // --- bottom object ---
    // if (basicDisplayBottomObj) {
        // world bounding box
        const boxB = new THREE.Box3().setFromObject(basicDisplayBottomObj);

        // world points for height arrow (left side of object, slightly outside)
        // const xOffset = (box.max.x - 0.07); // 0.05 world units left of box; tweak if necessary
        // const bottomWorld = new THREE.Vector3(xOffset, box.min.y, box.min.z);
        // const topWorld    = new THREE.Vector3(xOffset, box.max.y, box.min.z);
        const xOffsetB = boxB.max.x + 0.1;
        const bottomWorldB = new THREE.Vector3(xOffsetB, boxB.min.y, boxB.min.z);
        const topWorldB    = new THREE.Vector3(xOffsetB, boxB.max.y, boxB.min.z);

        // world coords already in world; but to be safe we copy
        const heightArrowB = makeDimensionArrow(bottomWorldB, topWorldB, `${dimensions.bottomHeight} mm`, 'y-right', 60);
        basicDisplayScene.add(heightArrowB);
        basicDisplayBottomObj.userData.dimensions.push(heightArrowB);

        //
        const depthHalfB = (boxB.max.z - boxB.min.z) / 7;
        const frontWorldB = new THREE.Vector3(boxB.max.x, boxB.max.y, boxB.min.z + (boxB.max.z - boxB.min.z) / 2.5);
        const backWorldB  = new THREE.Vector3(boxB.max.x, boxB.max.y, boxB.max.z + (boxB.max.z - boxB.min.z) / 7);
        const depthArrowB = makeDimensionArrow(frontWorldB, backWorldB, `${dimensions.topDepth} mm`, 'z-right', 65);
        depthArrowB.rotateY(THREE.MathUtils.degToRad(-30));
        basicDisplayScene.add(depthArrowB);
        basicDisplayFullObj.userData.dimensions.push(depthArrowB);

    //     // depth arrow (center X)
    //     const centerX = (box.min.x + box.max.x) / 2;
    //     const frontWorld = new THREE.Vector3(centerX, box.min.y, box.max.z);
    //     const backWorld  = new THREE.Vector3(centerX, box.min.y, box.min.z);

    //     const depthArrow = makeDimensionArrow(frontWorld, backWorld, `${depthMm} mm`);
    //     basicDisplayScene.add(depthArrow);
    //     basicDisplayBottomObj.userData.dimensions.push(depthArrow);

    //     // width arrow (optional: bottom front area)
    //     const yBelow = box.min.y - Math.max(0.02, (box.max.y - box.min.y) * 0.06);
    //     const leftWorld  = new THREE.Vector3(box.min.x, yBelow, box.min.z);
    //     const rightWorld = new THREE.Vector3(box.max.x, yBelow, box.min.z);

    //     const widthArrow = makeDimensionArrow(leftWorld, rightWorld, `${widthMm} mm`);
    //     basicDisplayScene.add(widthArrow);
    //     basicDisplayBottomObj.userData.dimensions.push(widthArrow);
    // }

    // --- top object (repeat same pattern) ---
    // if (basicDisplayTopObj) {
        const boxT = new THREE.Box3().setFromObject(basicDisplayTopObj);
        const centerXT = (boxT.min.x + boxT.max.x) / 2;

        // const xOffset = box.max.x - 0.07;
        // const bottomWorld = new THREE.Vector3(xOffset, box.min.y - 0.05, box.max.z);
        // const topWorld    = new THREE.Vector3(xOffset, box.max.y - 0.16, box.max.z);
        const xOffsetT = boxT.max.x + 0.1;
        const bottomWorldT = new THREE.Vector3(xOffsetT, boxT.min.y, boxT.min.z);
        const topWorldT    = new THREE.Vector3(xOffsetT, boxT.max.y, boxT.min.z);

        const heightArrowT = makeDimensionArrow(topWorldT, bottomWorldT, `${dimensions.topHeight} mm`, 'y-right', 55);
        basicDisplayScene.add(heightArrowT);
        basicDisplayTopObj.userData.dimensions.push(heightArrowT);

        // const frontWorld = new THREE.Vector3(centerX, box.min.y, box.max.z);
        // const backWorld  = new THREE.Vector3(centerX, box.min.y, box.min.z);
        // const depthArrow = makeDimensionArrow(frontWorld, backWorld, `${depthMm} mm`);
        // basicDisplayScene.add(depthArrow);
        // basicDisplayTopObj.userData.dimensions.push(depthArrow);
    // }

     // --- space (repeat pattern) ---
    // if (basicDisplayFullObj) {
        // const boxTop = new THREE.Box3().setFromObject(basicDisplayTopObj);
        // const boxBottom = new THREE.Box3().setFromObject(basicDisplayBottomObj);

        const xOffsetSpace = boxT.max.x + 0.1;
        const bottomWorldSpace = new THREE.Vector3(xOffsetSpace, boxB.max.y, boxT.min.z);
        const topWorldSpace    = new THREE.Vector3(xOffsetSpace, boxT.min.y, boxT.min.z);

        const spaceArrowSpace = makeDimensionArrow(bottomWorldSpace, topWorldSpace, `${dimensions.verticalSpace} mm`, 'y-right', 55);
        basicDisplayScene.add(spaceArrowSpace);
        basicDisplayTopObj.userData.dimensions.push(spaceArrowSpace);
    // }

    // --- full object (repeat pattern) ---
    // if (basicDisplayFullObj) {
        const boxF = new THREE.Box3().setFromObject(basicDisplayFullObj);

        const xOffsetF = boxF.min.x - 0.01; // place height arrow on the right
        const bottomWorldF = new THREE.Vector3(xOffsetF, boxF.min.y, boxF.max.z);
        const topWorldF   = new THREE.Vector3(xOffsetF, boxF.max.y, boxF.max.z);

        const heightArrowF = makeDimensionArrow(bottomWorldF, topWorldF, `${dimensions.fullHeight} mm`, 'y-left');
        basicDisplayScene.add(heightArrowF);
        basicDisplayFullObj.userData.dimensions.push(heightArrowF);

        // const centerXF = (boxF.min.z + boxF.max.z) / 2;
        const depthHalfF = (boxF.max.z - boxF.min.z) / 4;
        // const frontWorldF = new THREE.Vector3(boxF.max.x + 0.02, boxB.max.y + 0.1, boxF.min.z);
        // const backWorldF  = new THREE.Vector3(centerXF - 0.05, boxB.max.y + 0.1, boxF.max.z);
        // const frontWorldF = new THREE.Vector3(boxF.max.x + centerXF * 2, boxB.max.y + 0.05, boxF.min.z);
        // const backWorldF  = new THREE.Vector3(boxF.max.x + centerXF * 2, boxB.max.y + 0.05, boxF.max.z);
        const frontWorldF = new THREE.Vector3(boxF.max.x - depthHalfF, boxB.max.y + 0.05, boxF.min.z);
        const backWorldF  = new THREE.Vector3(boxF.max.x - depthHalfF + 0.02, boxB.max.y + 0.05, boxF.max.z);
        const depthArrowF = makeDimensionArrow(frontWorldF, backWorldF, `${dimensions.bottomFullDepth} mm`, 'z-right', 65);
        depthArrowF.rotateY(THREE.MathUtils.degToRad(-30));
        basicDisplayScene.add(depthArrowF);
        basicDisplayFullObj.userData.dimensions.push(depthArrowF);

        // // width arrow
        // const yBelow = box.min.y - Math.max(0.02, (box.max.y - box.min.y) * 0.06);
        // const leftWorld  = new THREE.Vector3(box.min.x, yBelow, box.min.z);
        // const rightWorld = new THREE.Vector3(box.max.x, yBelow, box.min.z);

        // const widthArrow = makeDimensionArrow(leftWorld, rightWorld, `${widthMm} mm`);
        // basicDisplayScene.add(widthArrow);
        // basicDisplayFullObj.userData.dimensions.push(widthArrow);
    // }
}

    // function createBasicDisplayDimensionArrows() {
    //     const box = new THREE.Box3().setFromObject(basicDisplayBottomObj);

    //     // === HEIGHT ARROW ===
    //     const bottom = new THREE.Vector3(box.min.x - 0.1, box.min.y, box.min.z);
    //     const top    = new THREE.Vector3(box.min.x - 0.1, box.max.y, box.min.z);

    //     const heightMm = ((box.max.y - box.min.y) * 1000).toFixed(0); // example mm
    //     const heightArrow = makeDimensionArrow(bottom, top, `${heightMm} mm`);
    //     basicDisplayScene.add(heightArrow);

    //     // === DEPTH ARROW ===
    //     const front = new THREE.Vector3((box.min.x + box.max.x) / 2, box.min.y, box.max.z);
    //     const back  = new THREE.Vector3((box.min.x + box.max.x) / 2, box.min.y, box.min.z);

    //     const depthMm = ((box.max.z - box.min.z) * 1000).toFixed(0); // example mm
    //     const depthArrow = makeDimensionArrow(front, back, `${depthMm} mm`);
    //     basicDisplayScene.add(depthArrow);
    // }

    // function makeDimensionArrow(start, end, labelText, color = 0xff0000) {
    //     const group = new THREE.Group();

    //     // --- Main line ---
    //     const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
    //     const material = new THREE.LineBasicMaterial({ color, depthTest: false });
    //     const line = new THREE.Line(geometry, material);
    //     group.add(line);

    //     // --- Direction & length ---
    //     const dir = new THREE.Vector3().subVectors(end, start).normalize();
    //     const length = start.distanceTo(end);

    //     // --- Arrowhead size relative to length ---
    //     const arrowRadius = length * 0.02; // 2% of line length
    //     const arrowHeight = length * 0.05; // 5% of line length
    //     const arrowGeometry = new THREE.ConeGeometry(arrowRadius, arrowHeight, 8);

    //     function addArrow(pos, direction) {
    //         const arrowMaterial = new THREE.MeshBasicMaterial({ color, depthTest: false });
    //         const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
    //         arrow.position.copy(pos);
    //         // Orient cone to face along direction
    //         arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
    //         group.add(arrow);
    //     }

    //     // Place both arrowheads
    //     addArrow(start, dir);
    //     addArrow(end, dir.clone().negate());

    //     // --- Label ---
    //     const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    //     const label = makeTextSprite(labelText, { fontSize: 200, color: "black" }); // smaller font
    //     label.position.copy(mid);
    //     label.position.y += length * 0.05; // lift relative to size
    //     group.add(label);

    //     return group;
    // }

    async function createBasicDisplayDimensionArrows() {
        function renderDimensionArrow(rootGroup, startWorld, endWorld, labelText, arrowDir, arrowTexture1, arrowTexture2) {
            return new Promise((resolve) => {
                const group = new THREE.Group();

                // Main line
                const pts = [startWorld.clone(), endWorld.clone()];
                const geo = new THREE.BufferGeometry().setFromPoints(pts);
                const matLine = new THREE.LineBasicMaterial({ color: 0xff0000, depthTest: false });
                const line = new THREE.Line(geo, matLine);
                group.add(line);

                // Direction & length
                const dir = new THREE.Vector3().subVectors(endWorld, startWorld);
                const length = dir.length();
                if (length > 1e-6) dir.normalize();

                // Arrow sprite
                // const loader = new THREE.TextureLoader();
                // const arrowTexture = loader.load(arrowPngUrl);

                function addArrowSprite(pos, direction, arrowTexture, invert = false) {
                    const material = new THREE.SpriteMaterial({ map: arrowTexture, transparent: true, depthTest: false });
                    const sprite = new THREE.Sprite(material);
                    // const scale = Math.max(0.02, length * 0.05);
                    const scale = Math.max(0.05, length * 0.05);
                    sprite.scale.set(scale, scale, 1);

                    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
                    if (invert) {
                        const flip = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI);
                        q.multiply(flip);
                    }
                    sprite.quaternion.copy(q);
                    sprite.position.copy(pos);
                    group.add(sprite);
                }

                const inset = Math.min(length * 0.02, 0.05);
                addArrowSprite(startWorld.clone().add(dir.clone().multiplyScalar(inset)), dir.clone().negate(), arrowTexture1);
                addArrowSprite(endWorld.clone().add(dir.clone().multiplyScalar(-inset)), dir, arrowTexture2);

                // Label
                const mid = new THREE.Vector3().addVectors(startWorld, endWorld).multiplyScalar(0.5);
                const label = makeTextSprite(labelText, { fontSize: 40, color: "black" });

                label.position.copy(mid);

                // Offset label depending on arrowDir
                // const xOffset = 0.05;
                // const yOffset = 0.02;
                if (arrowDir === 'y-left') {
                    const xOffset = 0.2;
                    const yOffset = Math.max(0.01, length * 0.04);
                    label.position.x -= xOffset;
                    label.position.y += yOffset;
                } else if (arrowDir === 'y-right') {
                    const xOffset = 0.15;
                    label.position.x += xOffset;
                    const yOffset = Math.max(0.01, length * 0.04);
                    label.position.y -= yOffset;
                } else if (arrowDir === 'z-right') {
                    const yOffset = 0.01;
                    label.position.y -= yOffset;
                    label.rotateY(THREE.MathUtils.degToRad(-30));
                }

                group.add(label);

                // Add to rootGroup
                rootGroup.add(group);

                resolve(group);
            });
        }

        function makeTextSprite(message, params = {}) {
            const fontSize = params.fontSize || 120;
            const color = params.color || "black";

            // Use devicePixelRatio for crisp text
            const dpr = window.devicePixelRatio || 1;

            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            ctx.font = `${fontSize * dpr}px Arial`;
            const textWidth = Math.ceil(ctx.measureText(message).width);

            // scale canvas up by DPR
            canvas.width = (textWidth + 20) * dpr;
            canvas.height = Math.ceil(fontSize * 1.4 * dpr);

            // redraw at higher resolution
            ctx.font = `${fontSize * dpr}px Arial`;
            ctx.fillStyle = color;
            ctx.textBaseline = "top";
            ctx.scale(dpr, dpr); // normalize coords
            ctx.fillText(message, 10, 0);

            const texture = new THREE.CanvasTexture(canvas);
            texture.needsUpdate = true;

            // 👇 Prevent mipmap blur
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;

            const material = new THREE.SpriteMaterial({
                map: texture,
                transparent: true,
                depthTest: false
            });

            const sprite = new THREE.Sprite(material);
            sprite.renderOrder = 999;

            const scaleFactor = 0.0015;
            sprite.scale.set(canvas.width / dpr * scaleFactor, canvas.height / dpr * scaleFactor, 1);

            return sprite;
        }

        async function setBoxBottom() {
            const box = new THREE.Box3().setFromObject(basicDisplayBottomObj);

            const xOffset = box.max.x;
            const bottomWorld = new THREE.Vector3(xOffset, box.min.y, box.min.z);
            const topWorld    = new THREE.Vector3(xOffset, box.max.y, box.min.z);

            const heightArrow = await renderDimensionArrow(
                rootGroup,
                bottomWorld,
                topWorld,
                `${dimensions.bottomHeight} mm`,
                'y-right',
                arrowImgTextureBottom,
                arrowImgTextureTop,
            );
            basicDisplayBottomObj.userData.dimensions.push(heightArrow);

            // const frontWorldB = new THREE.Vector3(boxB.max.x, boxB.max.y, boxB.min.z + (boxB.max.z - boxB.min.z) / 2.5);
            // const backWorldB  = new THREE.Vector3(boxB.max.x, boxB.max.y, boxB.max.z + (boxB.max.z - boxB.min.z) / 7);
            const frontWorld = new THREE.Vector3(box.max.x, box.max.y, box.min.z + 0.4);
            const backWorld  = new THREE.Vector3(box.max.x, box.max.y, box.max.z + 0.1);

            const depthArrow = await renderDimensionArrow(
                rootGroup,
                frontWorld,
                backWorld,
                `${dimensions.bottomFullDepth} mm`,
                'z-right',
                arrowImgTextureRight,
                arrowImgTextureLeft,
            );
            basicDisplayBottomObj.userData.dimensions.push(depthArrow);

            return box;
        }

        async function setBoxTop(boxB) {
            const box = new THREE.Box3().setFromObject(basicDisplayTopObj);

            const xOffset = box.max.x;
            const bottomWorld = new THREE.Vector3(xOffset, box.min.y, box.min.z);
            const topWorld    = new THREE.Vector3(xOffset, box.max.y, box.min.z);

            const heightArrow = await renderDimensionArrow(
                rootGroup,
                bottomWorld,
                topWorld,
                `${dimensions.topHeight} mm`,
                'y-right',
                arrowImgTextureBottom,
                arrowImgTextureTop,
            );
            basicDisplayBottomObj.userData.dimensions.push(heightArrow);

            const frontWorld = new THREE.Vector3(box.max.x, box.max.y - 0.03, box.min.z + 0.4);
            const backWorld  = new THREE.Vector3(box.max.x, box.max.y - 0.06, box.max.z + 0.1);

            const depthArrow = await renderDimensionArrow(
                rootGroup,
                frontWorld,
                backWorld,
                `${dimensions.topDepth} mm`,
                'z-right',
                arrowImgTextureRight,
                arrowImgTextureLeft,
            );
            basicDisplayBottomObj.userData.dimensions.push(depthArrow);

            return box;
        }

        async function setBoxSpace(boxB, boxT) {
            const xOffset = boxT.max.x;
            const bottomWorld = new THREE.Vector3(xOffset, boxB.max.y, boxT.min.z);
            const topWorld    = new THREE.Vector3(xOffset, boxT.min.y, boxT.min.z);

            const heightArrow = await renderDimensionArrow(
                rootGroup,
                bottomWorld,
                topWorld,
                `${dimensions.bottomFullDepth} mm`,
                'y-right',
                arrowImgTextureBottom,
                arrowImgTextureTop,
            );
            basicDisplayBottomObj.userData.dimensions.push(heightArrow);
        }

        async function setBoxFull(boxB) {
            const box = new THREE.Box3().setFromObject(basicDisplayFullObj);

            const xOffset = box.min.x;
            const bottomWorld = new THREE.Vector3(xOffset, box.min.y, box.max.z);
            const topWorld    = new THREE.Vector3(xOffset, box.max.y, box.max.z);

            const heightArrow = await renderDimensionArrow(
                rootGroup,
                bottomWorld,
                topWorld,
                `${dimensions.fullHeight} mm`,
                'y-left',
                arrowImgTextureBottom,
                arrowImgTextureTop,
            );
            basicDisplayBottomObj.userData.dimensions.push(heightArrow);

            const mmToUnits = 0.001;

            const depthLength = globalMinDepth * mmToUnits;
            const depthDir = new THREE.Vector3(0, 0, 1);
            depthDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), THREE.MathUtils.degToRad(-30));
            depthDir.normalize();

            // const frontWorldB = new THREE.Vector3(boxB.max.x, boxB.max.y, boxB.min.z + (boxB.max.z - boxB.min.z) / 2.5);
            // const backWorldB  = new THREE.Vector3(boxB.max.x, boxB.max.y, boxB.max.z + (boxB.max.z - boxB.min.z) / 7);
            // const depthHalfF = (box.max.z - box.min.z) / 4;
            // const frontWorld = new THREE.Vector3(box.max.x - depthHalfF, boxB.max.y + 0.05, box.min.z);
            // const backWorld  = new THREE.Vector3(box.max.x - depthHalfF, boxB.max.y + 0.05, box.max.z);
            const depthHalfF = (box.max.z - box.min.z) / 5;
            // const frontWorld = new THREE.Vector3(box.max.x - depthHalfF, boxB.max.y + 0.05, box.min.z);
            // const backWorld  = new THREE.Vector3(box.max.x + 0, boxB.max.y + 0.05, box.max.z);
            const frontWorld = new THREE.Vector3(box.max.x + depthHalfF, boxB.max.y + 0.12, box.max.z); // anchor point
            const backWorld  = frontWorld.clone().add(depthDir.clone().multiplyScalar(depthLength));

            const depthArrow = await renderDimensionArrow(
                rootGroup,
                frontWorld,
                backWorld,
                `${dimensions.bottomHeight} mm`,
                'z-right',
                arrowImgTextureRight,
                arrowImgTextureLeft,
            );
            basicDisplayBottomObj.userData.dimensions.push(depthArrow);
        }

        const boxB = await setBoxBottom();
        const boxT = await setBoxTop(boxB);
        setBoxSpace(boxB, boxT);
        setBoxFull(boxB);
    }


    // function createFurnitureDimensionArrows(childMeshGroup, room3DGroup) {
    //     // Remove old arrows & labels if they exist
    //     if (childMeshGroup.userData.dimensions) {
    //         childMeshGroup.userData.dimensions.forEach(obj => modelScene.remove(obj));
    //     }
    //     const objects = [];

    //     // Bounding boxes
    //     const roomBox = new THREE.Box3().setFromObject(room3DGroup);
    //     const furnitureBox = new THREE.Box3().setFromObject(childMeshGroup);

    //     const roomSize = new THREE.Vector3();
    //     roomBox.getSize(roomSize);

    //     const furnitureSize = new THREE.Vector3();
    //     furnitureBox.getSize(furnitureSize);

    //     // Helper to create an arrow + label
    //     function makeArrowWithLabel(start, end, color, labelText) {
    //         const group = [];

    //         // Arrow line
    //         const dir = new THREE.Vector3().subVectors(end, start);
    //         const length = dir.length();
    //         dir.normalize();

    //         const arrowHelper = new THREE.ArrowHelper(dir, start, length, color, 0.1, 0.05);
    //         group.push(arrowHelper);

    //         // Text label
    //         const loader = new FontLoader();
    //         loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', font => {
    //             const textGeo = new TextGeometry(labelText, {
    //                 font: font,
    //                 size: length * 0.05,
    //                 height: 0.01,
    //             });
    //             const textMat = new THREE.MeshBasicMaterial({ color: 0x555555 });
    //             const textMesh = new THREE.Mesh(textGeo, textMat);
                
    //             // Position at middle of arrow
    //             const midPos = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    //             textMesh.position.copy(midPos);
    //             textMesh.lookAt(threeJSCamera.position); // always face camera
    //             modelScene.add(textMesh);
    //             group.push(textMesh);
    //         });

    //         return group;
    //     }

    //     // === LEFT ARROW ===
    //     const leftDist = furnitureBox.min.x - roomBox.min.x;
    //     if (leftDist > 0) {
    //         const leftArrow = makeArrowWithLabel(
    //             new THREE.Vector3(roomBox.min.x, furnitureBox.min.y + furnitureSize.y, furnitureBox.min.z),
    //             new THREE.Vector3(furnitureBox.min.x, furnitureBox.min.y + furnitureSize.y, furnitureBox.min.z),
    //             0x888888, // grey
    //             `${Math.round(leftDist*100)} cm`
    //         );
    //         objects.push(...leftArrow);
    //     }

    //     // === RIGHT ARROW ===
    //     const rightDist = roomBox.max.x - furnitureBox.max.x;
    //     if (rightDist > 0) {
    //         const rightArrow = makeArrowWithLabel(
    //             new THREE.Vector3(furnitureBox.max.x, furnitureBox.min.y + furnitureSize.y, furnitureBox.min.z),
    //             new THREE.Vector3(roomBox.max.x, furnitureBox.min.y + furnitureSize.y, furnitureBox.min.z),
    //             0x888888,
    //             `${Math.round(rightDist*100)} cm`
    //         );
    //         objects.push(...rightArrow);
    //     }

    //     // === TOP ARROW ===
    //     const topDist = roomBox.max.y - furnitureBox.max.y;
    //     if (topDist > 0) {
    //         const topArrow = makeArrowWithLabel(
    //             new THREE.Vector3(furnitureBox.max.x - furnitureSize.x / 2, furnitureBox.max.y, furnitureBox.min.z),
    //             new THREE.Vector3(furnitureBox.max.x - furnitureSize.x / 2, roomBox.max.y, furnitureBox.min.z),
    //             0x888888,
    //             `${Math.round(topDist*100)} cm`
    //         );
    //         objects.push(...topArrow);
    //     }

    //     // Add arrows to scene
    //     objects.forEach(o => modelScene.add(o));
    //     childMeshGroup.userData.dimensions = objects;
    // }


    // // Helper: create line + text
    // function makeArrow(start, end, color, labelText) {
    //     const group = [];

    //     // Line
    //     const points = [start, end];
    //     const geometry = new THREE.BufferGeometry().setFromPoints(points);
    //     const material = new THREE.LineBasicMaterial({ color: color });
    //     const line = new THREE.Line(geometry, material);
    //     group.push(line);

    //     // Midpoint for label
    //     const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);

    //     // Text label
    //     const sprite = makeTextSprite(labelText, { fontSize: 40, color: "black" });
    //     sprite.position.copy(mid);
    //     sprite.position.y += 5; // small offset above line
    //     group.push(sprite);

    //     return group;
    // }

   // // Helper: simple text sprite
    // function makeTextSprite(message, params = {}) {
    //     const fontSize = params.fontSize || 64;
    //     const color = params.color || "black";

    //     const canvas = document.createElement("canvas");
    //     const ctx = canvas.getContext("2d");
    //     ctx.font = `${fontSize}px Arial`;
    //     const textWidth = ctx.measureText(message).width;

    //     canvas.width = textWidth;
    //     canvas.height = fontSize * 1.4;
    //     ctx.font = `${fontSize}px Arial`;
    //     ctx.fillStyle = color;
    //     ctx.fillText(message, 0, fontSize);

    //     const texture = new THREE.CanvasTexture(canvas);
    //     const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    //     const sprite = new THREE.Sprite(material);

    //     const scaleFactor = 0.01; // adjust scaling to fit scene units
    //     sprite.scale.set(canvas.width * scaleFactor, canvas.height * scaleFactor, 1);

    //     return sprite;
    // }

    function addDimensionArrows() {
        const children = modelScene.children;

        for(let i = 0; i < children.length; i++) {
            const childObj = children[i];
            const userData = childObj.userData;
            const childType = userData.furnitureType;

            if(!childType) {
                continue;
            }

            createFurnitureDimensionArrows(childObj, room3DGroup);
        }
    }

    function removeDimensionArrows() {
        modelScene.children.forEach(child => {
            if (child.userData && child.userData.dimensions) {
                // Remove each arrow/label from the scene
                child.userData.dimensions.forEach(obj => {
                    if (obj.geometry) obj.geometry.dispose();
                    if (obj.material) obj.material.dispose();
                    modelScene.remove(obj);
                });
                // Clear the reference
                child.userData.dimensions = [];
            }
        });
    }


    function appendCornerPseudoModelObjects() {

        const parentBoxWorld = new THREE.Box3().setFromObject(room3DGroup);
        const finalParentSize = new THREE.Vector3();
        parentBoxWorld.getSize(finalParentSize);

        if(!cornerBottomFurnitureId && !cornerFullFurnitureId) {
            const bottomGeometry = new THREE.BoxGeometry( 1, 1, 1); 
            // const bottomGeometry = new THREE.BoxGeometry( cornerBottomWidth3d, cornerBottomHeight3d, cornerBottomDepth3d); 
            const bottomMaterial = new THREE.MeshBasicMaterial( {
                color: 0x808080,
                transparent: true, 
                opacity: 0.7
            }); 
            const pseudoBottomCornerFurniture = new THREE.Mesh( bottomGeometry, bottomMaterial ); 
            pseudoBottomCornerFurniture.scale.set(cornerBottomWidth3d, cornerBottomHeight3d, cornerBottomDepth3d);

            pseudoBottomCornerFurniture.userData.pseudoType = DIMENSION_TYPE_BOTTOM;
            pseudoBottomCornerFurniture.userData.furnitureType = DIMENSION_TYPE_BOTTOM_CORNER;
            pseudoBottomCornerFurniture.userData.width_mm = cornerBottomWidth;
            pseudoBottomCornerFurniture.userData.depth_mm = cornerBottomDepth3d;

            const objBox = new THREE.Box3().setFromObject(pseudoBottomCornerFurniture);
            const objSize = new THREE.Vector3();
            objBox.getSize(objSize);

            pseudoBottomCornerFurniture.userData.originalSize = objSize.clone();
            pseudoBottomCornerFurniture.userData.parentBox = parentBoxWorld;

            // const xPosition = parentBoxWorld.min.x + objSize.x / 2 + wallThickness;
            // const yPosition = parentBoxWorld.min.y + (objSize.y / 2) + floorThickness;
            // const zPosition = parentBoxWorld.min.z + (objSize.z / 2) + wallThickness;
            // pseudoBottomCornerFurniture.position.set(xPosition, yPosition, zPosition);

            pseudoBottomCornerFurniture.position.set(
                parentBoxWorld.min.x + objSize.x / 2 + wallThickness,
                parentBoxWorld.min.y + objSize.y / 2 + floorThickness,
                parentBoxWorld.min.z + objSize.z / 2 + wallThickness
            );

            modelScene.add(pseudoBottomCornerFurniture);
        } 
        if (!cornerTopFurnitureId && !cornerFullFurnitureId) { 
            const topGeometry = new THREE.BoxGeometry( 1, 1, 1 );
            // const topGeometry = new THREE.BoxGeometry(1, 1, 1); 
            const topMaterial = new THREE.MeshBasicMaterial( {
                color: 0x808080,
                transparent: true, 
                opacity: 0.7
            }); 
            const pseudoTopCornerFurniture = new THREE.Mesh( topGeometry, topMaterial ); 
            pseudoTopCornerFurniture.scale.set(cornerBottomWidth3d, cornerBottomHeight3d, cornerBottomDepth3d);
            
            // const childSize = new THREE.Vector3(1, 1, 1);
            // const scaleX = cornerTopWidth3d / childSize.x;
            // const scaleY = cornerTopHeight3d / childSize.y;
            // const scaleZ = cornerTopDepth3d / childSize.z;

            // pseudoTopCornerFurniture.scale.set(scaleX, scaleY, scaleZ);


            pseudoTopCornerFurniture.userData.pseudoType = DIMENSION_TYPE_TOP;
            pseudoTopCornerFurniture.userData.furnitureType = DIMENSION_TYPE_TOP_CORNER;
            pseudoTopCornerFurniture.userData.width_mm = cornerTopWidth;
            pseudoTopCornerFurniture.userData.depth_mm = cornerTopDepth3d;

            const objBox = new THREE.Box3().setFromObject(pseudoTopCornerFurniture);
            const objSize = new THREE.Vector3();
            objBox.getSize(objSize);

            pseudoTopCornerFurniture.userData.originalSize = objSize.clone();
            pseudoTopCornerFurniture.userData.parentBox = parentBoxWorld;

            const xPosition = parentBoxWorld.min.x + objSize.x / 2 + wallThickness;
            const yPosition = calculateTopSpaceIn3dModel(parentBoxWorld) + cornerTopHeight3d / 2;
            const zPosition = parentBoxWorld.min.z + (objSize.z / 2) + wallThickness;
            pseudoTopCornerFurniture.position.set(xPosition, yPosition, zPosition);
            // pseudoTopCornerFurniture.position.set(
            //     parentBoxWorld.min.x + objSize.x / 2 + wallThickness,
            //     parentBoxWorld.min.y + objSize.y / 2 + floorThickness,
            //     parentBoxWorld.min.z + objSize.z / 2 + wallThickness
            // );

            modelScene.add(pseudoTopCornerFurniture);
        }
    }

    function removeCornerPseudoModelObjects(furnitureType) {

        if(!furnitureType.includes('corner')) return;
        furnitureType = furnitureType.trim();
        const children = modelScene.children;
        let maxPseudoCount = 2;
        let tempI = 0;

        for(let i = 0; i < children.length; i++) {
            const childObj = children[i];
            const userData = childObj.userData;
            const pseudoType = userData.pseudoType;

            if(!pseudoType) {
                continue;
            }

            const childType = userData.furnitureType;

            if(furnitureType === DIMENSION_TYPE_FULL) {
                tempI++;
                removeGLBModel(childObj);
                continue;
            } else if(furnitureType == childType) {
                tempI++;
                removeGLBModel(childObj);
                continue;
            }

            if(tempI === maxPseudoCount) {
                break;
            }
        }
    }

    // function initModelClickEvent(duplicateItem = null) {
    //     threeJSRendered.domElement.addEventListener('click', function(e) {
    //         onClickModel(e);
    //     }, false);

    //     // if(duplicateItem) {
    //     //     const rect = threeJSRendered.domElement.getBoundingClientRect();
    //     //     const fakeEvent = new MouseEvent("click", {
    //     //         clientX: rect.left + rect.width / 2,  // center of canvas
    //     //         clientY: rect.top + rect.height / 2,
    //     //     });
    //     //     onClickModel(fakeEvent);
    //     // }
    // }

    function onClickModel(e) {

        // removeAllFurnitureButtons();

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const rect = threeJSRendered.domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, threeJSCamera);

        const intersects = raycaster.intersectObjects(modelScene.children, true);

        let buttonHit = intersects.find(hit => hit.object.userData.isUIButton);

        if (buttonHit) {
            const obj = buttonHit.object;
            const action = obj.userData.actionType;
            const customId = obj.userData.customId;

            if (action === "delete") {
                console.log("delete")
                initFurnitureRemoveData(customId);
            } else if (action === "duplicate") {
                console.log("duplicate")
                initFurnitureDuplicateData(customId);
            }
            return; 
        }

        removeAllFurnitureControls();
        removeAllFurnitureButtons();

        if (intersects.length > 0) {
            let obj = intersects[0].object;
            const objParent = obj.parent;
            if(!objParent) {
                return;
            }

            // while (obj.parent && !obj.userData.customId) {
            //     obj = obj.parent;
            // }
           
            if (objParent.userData && objParent.userData.customId) {

                objParent.traverse(child => {
                    if (child.isMesh) {
                        child.renderOrder = 1; 
                        child.material.emissive.set(0xffffff);
                        child.material.emissiveIntensity = 0.2;
                    }
                });

                openEditModal(objParent.userData, objParent.userData.customId, false);
                createFurnitureItemControls(objParent, objParent.userData.customId); 
            }
        } 
    }

    async function initFurnitureDuplicateData(currentCustomId) {
        const currentObj = modelScene.children.find(child => child.userData.customId == currentCustomId);

        if(!currentObj) return;

        const newCustomId = await duplicateFurniture(currentCustomId, true);

        openEditModal(currentObj.userData, newCustomId, false);
    }

    function initFurnitureRemoveData(customId) {
        const furnitureItem = container.querySelector(`.my-cabinets-list .cabinet-item[data-custom_id="${customId}"]`);
        if(!furnitureItem) return;

        const itemData = JSON.parse(furnitureItem.getAttribute('data-item_data'));
        const type = itemData.type;
        const summaryItem = summaryItemsList.querySelector(`.cabinet-item[data-custom_id="${customId}"]`);
    
        removeItemButtonTriggerAction(furnitureItem, summaryItem, type, customId);
    }

    function removeAllFurnitureControls() {
        modelScene.children.forEach(childMeshGroup => {
            if (childMeshGroup.userData && childMeshGroup.userData.uiButtons) {
                childMeshGroup.userData.uiButtons.forEach(btn => {
                    childMeshGroup.remove(btn);
                });
                childMeshGroup.userData.uiButtons = null; // clear reference
            }

            childMeshGroup.traverse(child => {
                if (child.isMesh) {
                    child.material.emissive.set(0x000000);   // reset emissive color
                    child.material.emissiveIntensity = 1;   // back to default
                }
            });
        });
    }

    function removeAllFurnitureButtons() {
        const toRemove = [];

        modelScene.children.forEach(child => {
            if (child.type === 'Sprite' && child.userData.isUIButton) {
                // Clean up texture
                if (child.material) {
                    if (child.material.map) {
                        child.material.map.dispose();
                    }
                    child.material.dispose();
                }

                // Sprites don’t have geometry, so skip dispose() on that
                toRemove.push(child);
            }
        });

        // Remove after iteration
        toRemove.forEach(sprite => modelScene.remove(sprite));
    }

    function openEditModal(userData, customId, actionTypeAdd = true) {
        const width = userData.width_mm;

        const furnitureItem = container.querySelector(`.play-edit-summary .my-cabinets-list .cabinet-item[data-custom_id="${customId}"]`);

        if(!furnitureItem) return;
        const itemData = JSON.parse(furnitureItem.getAttribute('data-item_data'));
        const furnitureId = itemData.furniture_id;
        const displayPrice = itemData.display_price;
        const regularPrice = itemData.regular_price;
        const discountPrice = itemData.discount_price;
        const displayPriceCm3 = itemData.display_price_cm3;
        const minWidth = itemData.min_width;
        const type = itemData.type;
        const modelFileSrc = itemData.model_src;

        editContainerRemove();
        createEditModal(furnitureItem, itemData, furnitureId, type, modelFileSrc, width, minWidth, displayPrice, regularPrice, discountPrice, displayPriceCm3, actionTypeAdd);
    }

    function createFurnitureItemControls(childMeshGroup, customId) {
        // Remove old buttons
        if (childMeshGroup.userData.uiButtons) {
            childMeshGroup.userData.uiButtons.forEach(btn => modelScene.remove(btn));
        }

        const worldPos = new THREE.Vector3();
        childMeshGroup.getWorldPosition(worldPos);

        const scaledSize = childMeshGroup.userData.scaledSize;
        const topY = worldPos.y + scaledSize.y; // top of model

        function makeButton(iconUrl, offsetX, actionType) {
            const canvasSize = 128;
            const canvas = document.createElement('canvas');
            canvas.width = canvasSize;
            canvas.height = canvasSize;
            const ctx = canvas.getContext('2d');

            ctx.fillStyle = 'rgba(255,255,255,1)';
            ctx.beginPath();
            ctx.arc(canvasSize/2, canvasSize/2, canvasSize*0.45, 0, Math.PI*2);
            ctx.fill();

            const img = new Image();
            img.src = `${assetsUrl}/images/${iconUrl}`;
            const texture = new THREE.CanvasTexture(canvas);
            img.onload = () => {
                const iconSize = canvasSize*0.5;
                ctx.drawImage(img, (canvasSize-iconSize)/2, (canvasSize-iconSize)/2, iconSize, iconSize);
                texture.needsUpdate = true;
            };

            const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
            const sprite = new THREE.Sprite(material);

            sprite.userData.isUIButton = true;
            sprite.userData.customId = customId;
            sprite.userData.actionType = actionType;
            sprite.renderOrder = 999;

            // Place at center-top of the model
            // sprite.position.set(worldPos.x + offsetX, topY + scaledSize.y*0.1, worldPos.z); 
            sprite.position.set(worldPos.x + offsetX, topY - scaledSize.y*0.1, worldPos.z); 

            // Set size relative to model
            const buttonScale = Math.max(scaledSize.x, scaledSize.y, scaledSize.z) * 0.2;
            sprite.scale.set(buttonScale, buttonScale, 1);

            modelScene.add(sprite);
            return sprite;
        }

        // Two buttons with small horizontal offset
        const btn1 = makeButton("duplicate.svg", -scaledSize.x*0.15, 'duplicate');
        const btn2 = makeButton("delete.svg", scaledSize.x*0.15, 'delete');

        childMeshGroup.userData.uiButtons = [btn1, btn2];
        // allUIButtons.push(btn1, btn2);

        return childMeshGroup.userData.uiButtons;
    }

    function editGLBModelWidth(customId, itemWidth) {
        const children = modelScene.children;

        defaultBottomReferenceY = getDefaultBottomHeightWithSpace(roomHeight, modelRoomHeight);

        const childObj = children.find(child => child.userData.customId == customId);

        if(!childObj) return;
        const userData = childObj.userData;
        const widthPx = get3DItemDimensionWidth(itemWidth);

        const furnitureType = userData.furnitureType;

        if(furnitureType.includes('corner')) {
            switch(furnitureType) {
                case DIMENSION_TYPE_BOTTOM_CORNER: {
                    cornerBottomWidth = itemWidth;
                    cornerBottomWidth3d = widthPx;
                    break;
                }
                case DIMENSION_TYPE_TOP_CORNER: {
                    cornerTopWidth = itemWidth;
                    cornerTopWidth3d = widthPx;
                    break;
                }
                case DIMENSION_TYPE_FULL_CORNER: {
                    cornerFullWidth = itemWidth;
                    cornerFullWidth3d = widthPx;
                    break;
                }
                default: {
                    break;
                }
            }
        }

        const originalSize = userData.originalSize;
        const scaleX = widthPx / originalSize.x;
        childObj.scale.x = scaleX;

        // Recompute scaled size
        const childObjBox = new THREE.Box3().setFromObject(childObj);
        const newScaledSize = new THREE.Vector3();
        childObjBox.getSize(newScaledSize);

        childObj.userData.scaledSize = newScaledSize.clone();
        childObj.userData.width_mm = itemWidth;

        /******** 2. save position and size to object ********/
        const childWorldPos = new THREE.Vector3();
        childObj.getWorldPosition(childWorldPos);
        childObj.userData.savedPosition = childWorldPos.clone();

        /******** end save position ********/

        // Check if fitting
        const isFitting = checkIfAbleToDragChildToPosition(childObj, childObjBox);

        const itemPositionMm = getItemPosition(childWorldPos.clone(), newScaledSize.clone(), customId);
        childObj.userData.positionMm = itemPositionMm;

        childObj.userData.isFitting = isFitting;

        if (!isFitting) {
            childObj.traverse(child => {
                if (child.isMesh) {
                    child.material.color.set(0xff0000);
                    child.material.transparent = true;
                    child.material.opacity = 0.5;
                }
            });
        }

        const userDataNew = childObj.userData;
        const itemIndex = modelChildrenList.findIndex(item => item.db_data.custom_id == userDataNew.customId);

        if(itemIndex > -1) {
            const oldItem = {...modelChildrenList[itemIndex]};
            oldItem.width = itemWidth;
            oldItem.db_data.width = itemWidth;
            // oldItem.model_original_size = originalSize.clone();
            oldItem.db_data.model_scaled_size = JSON.stringify(newScaledSize.clone());
            oldItem.db_data.model_position = JSON.stringify(childWorldPos.clone());
            oldItem.db_data.is_fitting = isFitting;
            modelChildrenList[itemIndex] = {...oldItem};
        }

    }


    function clearModelScene() {
        model3dContainer.innerHTML = ''

        if (!modelScene) return;

        // Traverse all children
        for (let i = modelScene.children.length - 1; i >= 0; i--) {
            removeGLBModel(modelScene.children[i]);
        }

        if (threeJSControls) {
            threeJSControls.dispose();
            threeJSControls = null;
        }

        modelScene = null;
        room3DGroup = null;
        threeJSCamera = null;
    }

    function removeGLBModel(childObj) {
        if(!childObj) return;

        removeAllFurnitureButtons();

        const childObjBox = new THREE.Box3().setFromObject(childObj);

        checkIfItemsAreFitting(childObj, childObjBox);

        // Remove attached HTML controls
        if (childObj.userData.htmlControls) {
            childObj.userData.htmlControls.remove();
            childObj.userData.htmlControls = null;
        }

        if (childObj.userData.dragControls) {
            const dragControls = childObj.userData.dragControls;
            const index = dragControls.objects.indexOf(childObj);
            if (index !== -1) dragControls.objects.splice(index, 1); // remove from array
        }

        // Dispose geometries, materials, and textures
        childObj.traverse((node) => {
            if (node.isMesh) {
                if (node.geometry) {
                    node.geometry.dispose();
                }
                if (node.material) {
                    // Material could be an array or single
                    if (Array.isArray(node.material)) {
                        node.material.forEach(mat => disposeMaterial(mat));
                    } else {
                        disposeMaterial(node.material);
                    }
                }
            }
        });

        function disposeMaterial(material) {
            for (const key in material) {
                if (material[key] && material[key].isTexture) {
                    material[key].dispose();
                }
            }
            material.dispose();
        }

        // Remove from parent (scene)
        if (childObj.parent) {
            childObj.parent.remove(childObj);
        }

        childObj.userData = {}; 

        if(roomType === ROOM_TYPE_WITH_CORNER) {
            appendCornerPseudoModelObjects();
        }
    }

    function changeModelChildrenDimensions() {
        const children = modelScene.children;

        defaultBottomReferenceY = getDefaultBottomHeightWithSpace(roomHeight, modelRoomHeight);

        for(let i = 0; i < children.length; i++) {
            const childObj = children[i];
            const userData = childObj.userData;

            if(!userData.furnitureId && !userData.pseudoType) {
                continue;
            }

            const originalSize = userData.originalSize;
            // const parentBox = userData.parentBox;
            const childFurnitureType = userData.furnitureType;
            const itemWidth = userData.width_mm;

            const { itemHeight, itemDepth } = getItemDimensions(childFurnitureType);

            let [heightPx, depthPx, widthPx] = get3DItemDimensions(itemHeight, itemDepth, itemWidth, modelRoomHeight, modelRoomDepth, modelRoomWidth);


            if(userData.pseudoType) {
                depthPx = userData.depth_mm ? userData.depth_mm : depthPx;
            } else {
                const scaleX = widthPx / originalSize.x;
                const scaleY = heightPx / originalSize.y;
                const scaleZ = depthPx / originalSize.z;
                childObj.scale.set(scaleX, scaleY, scaleZ);
                const scaledHeight = originalSize.y * scaleY;
            }

            const scaledChildBox = new THREE.Box3().setFromObject(childObj);
            const scaledChildSize = new THREE.Vector3();
            scaledChildBox.getSize(scaledChildSize);

            const parentBox = new THREE.Box3().setFromObject(basicDisplayScene);
            const parentSize = new THREE.Vector3();
            parentBox.getSize(parentSize);
            
            const yPosition = childFurnitureType === DIMENSION_TYPE_TOP
                ? calculateTopSpaceIn3dModel(parentBox)
                : parentBox.min.y;
            const zPosition = parentBox.min.z + (scaledChildSize.z / 2) + wallThickness; 

            childObj.position.y = yPosition;
            childObj.position.z = zPosition;

            if(roomType === ROOM_TYPE_WITH_CORNER) {
                const parentBoxWorld = new THREE.Box3().setFromObject(room3DGroup);
                const scaledDepth = originalSize.z * childObj.scale.z;
                // const childObjBox = new THREE.Box3().setFromObject(childObj);
                // const objSize = new THREE.Vector3();
                // childObjBox.getSize(objSize);

                if (Math.abs(childObj.rotation.y) > 0.0001) {
                    // Work in world space like dragging
                    const objWorldPos = childObj.getWorldPosition(new THREE.Vector3());
                    objWorldPos.x = parentBoxWorld.min.x + scaledDepth / 2 + wallThickness;

                    // Convert back to local
                    childObj.position.copy(childObj.parent.worldToLocal(objWorldPos));
                }
            }

            /******** 2. save position and size to object ********/
            const childWorldPos = new THREE.Vector3();
            childObj.getWorldPosition(childWorldPos);
            childObj.userData.savedPosition = childWorldPos.clone();

            childObj.userData.scaledSize = scaledChildSize.clone();
            /******** end save position ********/

            const userDataNew = childObj.userData;
            const itemIndex = modelChildrenList.findIndex(item => item.db_data.custom_id == userDataNew.customId);
            if(itemIndex > -1) {
                const itemPositionMm = getItemPosition(childWorldPos.clone(), scaledChildSize.clone());
                childObj.userData.positionMm = itemPositionMm;

                const isFitting = checkIfAbleToDragChildToPosition(childObj, scaledChildBox);
                const oldItem = {...modelChildrenList[itemIndex]};
                oldItem.db_data.width = itemWidth;
                oldItem.db_data.furniture_position_mm = itemPositionMm;
                oldItem.db_data.model_scaled_size = JSON.stringify(userDataNew.scaledSize);
                oldItem.db_data.model_position = JSON.stringify(userDataNew.savedPosition);
                oldItem.db_data.is_fitting = isFitting;
                modelChildrenList[itemIndex] = {...oldItem};
            }
        }
    }

    function changeModelChildrenTextureBase(children, searchArr, texture) {
        for(let i = 0; i < children.length; i++) {
            const childObj = children[i];

            childObj.traverse(node => {
                if (node.isMesh) {
                    const name = (node.name || "").toLowerCase();

                    if (!searchArr.includes(name)) {
                        // Update material map
                        if (node.material) {
                            node.material.map = texture;
                            node.material.needsUpdate = true;
                        }
                    }
                }
            });
        }
    }

    function changeModelChildrenTextureFrame(children, searchArr, texture) {
        for(let i = 0; i < children.length; i++) {
            const childObj = children[i];

            childObj.traverse(node => {
                if (node.isMesh) {
                    const name = (node.name || "").toLowerCase();

                    if (searchArr.includes(name)) {
                        // Update material map
                        if (node.material) {
                            node.material.map = texture;
                            node.material.needsUpdate = true;
                        }
                    }
                }
            });
        }
    }

    // function changeModelChildrenBaseTexture(children, searchArr, texture) {
    //     const children = modelScene.children;

    //     for(let i = 0; i < children.length; i++) {
    //         const childObj = children[i];
    //         const userData = childObj.userData;

    //         if(!userData.furnitureId) {
    //             continue;
    //         }

    //         childObj.traverse(node => {
    //             if (node.isMesh) {
    //                 const name = (node.name || "").toLowerCase();

    //                 if (!frontNodesGlb.includes(name)) {
    //                     // Update material map
    //                     if (node.material) {
    //                         node.material.map = textureBase;
    //                         node.material.needsUpdate = true;
    //                     }
    //                 }
    //             }
    //         });
    //     }
    // }

    // function changeModelChildrenFrameTexture() {
    //     const children = modelScene.children;

    //     for(let i = 0; i < children.length; i++) {
    //         const childObj = children[i];
    //         const userData = childObj.userData;

    //         if(!userData.furnitureId) {
    //             continue;
    //         }

    //         childObj.traverse(node => {
    //             if (node.isMesh) {
    //                 const name = (node.name || "").toLowerCase();

    //                 if (frontNodesGlb.includes(name)) {
    //                     // Update material map
    //                     if (node.material) {
    //                         node.material.map = textureFrame;
    //                         node.material.needsUpdate = true;
    //                     }
    //                 }
    //             }
    //         });
    //     }
    // }

    function get3DItemDimensions(itemHeight, itemDepth, itemWidth, parentHeight, parentDepth, parentWidth) {
        const heightWorld = (itemHeight / (roomHeight * 10)) * parentHeight;
        const depthWorld = (itemDepth / (roomDepth * 10)) * parentDepth;
        const widthWorld = (itemWidth / (roomWidth * 10)) * parentWidth;

        return [
            heightWorld,
            depthWorld, 
            widthWorld,
        ];
    }

    function get3DDisplayDimensions(itemHeight, itemDepth, itemWidth, parentHeightMm, parentWidthMm, parentHeightPx, parentWidthPx) {
        const heightWorld = (itemHeight / parentHeightMm) * parentHeightPx;
        const depthWorld = (itemDepth / parentWidthMm) * parentWidthPx;
        const widthWorld = (itemWidth / parentWidthMm) * parentWidthPx;
        const xWorld = (itemWidth / parentWidthMm) * basicDisplayXPaddingPx;

        return [
            heightWorld,
            depthWorld,
            widthWorld,
            xWorld
        ];
    }

    function getMaxDisplayDimensions() {
        // const { bottomHeight, topHeight, fullHeight, verticalSpace } = dimensions;
        // const topBottomHeight = bottomHeight + topHeight + verticalSpace;

        // return fullHeight > topBottomHeight ? fullHeight : topBottomHeight;
        const { bottomMaxHeight, topHeight, fullHeight, verticalSpace } = dimensions;
        const topBottomHeight = bottomMaxHeight + topMaxHeight + verticalSpace;

        return fullHeight > topBottomHeight ? fullHeight : topBottomHeight;
    }

    function getCornerDimensions() {
        const { bottomHeight, topHeight, fullHeight, verticalSpace } = dimensions;
        const bottomHeightWorld = (bottomHeight / (roomHeight * 10)) * modelRoomHeight;
        const bottomWidthWorld = (cornerBottomWidth / (roomWidth * 10)) * modelRoomWidth;
        const bottomDepthWorld = (cornerBottomDepth / (roomDepth * 10)) * modelRoomDepth;
        const topHeightWorld = (topHeight / (roomHeight * 10)) * modelRoomHeight;
        const topWidthWorld = (cornerTopWidth / (roomWidth * 10)) * modelRoomWidth;
        const topDepthWorld = (cornerTopDepth / (roomDepth * 10)) * modelRoomDepth;
        const fullHeightWorld = (fullHeight / (roomHeight * 10)) * modelRoomHeight;

        const fullWidthWorld = (cornerFullWidth / (roomWidth * 10)) * modelRoomWidth;
        const fullDepthWorld = (cornerFullDepth / (roomDepth * 10)) * modelRoomDepth;
        const bottomSpaceWorld = (verticalSpace / (roomHeight * 10)) * modelRoomHeight;

        return {
            bottomHeight: bottomHeightWorld,
            bottomWidth: bottomWidthWorld,
            bottomDepth: bottomDepthWorld,
            topHeight: topHeightWorld,
            topWidth: topWidthWorld,
            topDepth: topDepthWorld,
            fullHeight: fullHeightWorld,
            fullWidth: fullWidthWorld,
            fullDepth: fullDepthWorld,
            bottomSpace: bottomSpaceWorld,
        };
    }

    function get3DItemDimensionWidth(itemWidth) {
        const widthWorld = (itemWidth / (roomWidth * 10)) * modelRoomWidth;

        return widthWorld;
    }


    function calculateTopSpaceIn3dModel(parentBoxWorld) {
        const bottom = (parentBoxWorld.min.y) + defaultBottomReferenceY + floorThickness;
        return bottom;
    }

    function getDefaultBottomHeightWithSpace(roomHeightCm, modelRoomHeightPx) {
        const bottomPercent = (dimensions.bottomHeight + dimensions.verticalSpace) / (roomHeightCm * 10);
        const bottomSceneUnits = modelRoomHeightPx * bottomPercent; // this is already in scene units

        return bottomSceneUnits;  
    }

    function setSingleWallChilderDragging(obj) {
        const parentBoxWorld  = new THREE.Box3().setFromObject(room3DGroup);

        const objBox = new THREE.Box3().setFromObject(obj);
        const objHeight = objBox.max.y - objBox.min.y;

        const objSize = new THREE.Vector3();
        objBox.getSize(objSize);
        const objWidth =  objSize.x;
        const objDepth =  objSize.z;

        const currentPos = new THREE.Vector3();
        obj.getWorldPosition(currentPos);

        const objWorldPos = obj.getWorldPosition(new THREE.Vector3());

        objWorldPos.y = obj.userData.savedPosition.y; 

        objWorldPos.z = parentBoxWorld.min.z + (objDepth / 2) + wallThickness; 

        objWorldPos.x = Math.max(
            parentBoxWorld.min.x + objWidth / 2,
            Math.min(parentBoxWorld.max.x - objWidth / 2, objWorldPos.x)
        );

        obj.position.copy(obj.parent.worldToLocal(objWorldPos));

        const isFitting = checkIfAbleToDragChildToPosition(obj, objBox);

        return isFitting;
    }
    function setCornerChildenDragging(obj) {
        // const furnitureType = obj.userData.furnitureType;
        // const parentBoxWorld  = new THREE.Box3().setFromObject(room3DGroup);

        // const objBox = new THREE.Box3().setFromObject(obj);

        // const objSize = new THREE.Vector3();
        // objBox.getSize(objSize);
         const furnitureType = obj.userData.furnitureType;
        const parentBox = new THREE.Box3().setFromObject(room3DGroup);

        const objBox = new THREE.Box3().setFromObject(obj);
        const objSize = objBox.getSize(new THREE.Vector3());

        const objWidth =  objSize.x;
        const objDepth =  objSize.z

        // const forwardThreshold = parentBoxWorld.min.z + (objDepth / 6);
        let cornerThresholder = objWidth - 0.01;
        switch(furnitureType) {
            case DIMENSION_TYPE_BOTTOM: {
                if(cornerBottomWidth && cornerBottomWidth > 0) {
                   cornerThresholder = cornerBottomWidth3d; 
                } else if(cornerFullWidth && cornerFullWidth > 0) {
                    cornerThresholder = cornerFullWidth3d;
                } else if(cornerTopWidth && cornerTopWidth > 0) {
                    cornerThresholder = cornerTopWidth3d;
                }
                break;
            }
            case DIMENSION_TYPE_TOP: {
                if(cornerTopWidth && cornerTopWidth > 0) {
                   cornerThresholder = cornerTopWidth3d; 
                } else if(cornerFullWidth && cornerFullWidth > 0) {
                    cornerThresholder = cornerFullWidth3d;
                } else if(cornerBottomWidth && cornerBottomWidth > 0) {
                    cornerThresholder = cornerBottomWidth3d;
                }
            }
            case DIMENSION_TYPE_FULL: {
                if(cornerFullWidth && cornerFullWidth > 0) {
                    cornerThresholder = cornerFullWidth3d;
                } else if(cornerTopWidth && cornerTopWidth > 0) {
                   cornerThresholder = cornerTopWidth3d; 
                } else if(cornerBottomWidth && cornerBottomWidth > 0) {
                    cornerThresholder = cornerBottomWidth3d;
                }
            }
            default: {
                // cornerThresholder = objWidth - 0.01;
                cornerThresholder = objWidth - 0.01;
            }
        }

        // const forwardThreshold = parentBoxWorld.min.z + cornerThresholder - wallThickness;
        const forwardThreshold = parentBoxWorld.min.x + cornerThresholder - 0;

        const objWorldPos = obj.getWorldPosition(new THREE.Vector3());

        objWorldPos.y = obj.userData.savedPosition.y; 
        
        if (obj.position.x < forwardThreshold) {
            // obj.rotation.y = Math.PI / 2; 
            // objWorldPos.x = parentBoxWorld.min.x + objWidth / 2 + wallThickness;
            obj.rotation.y = Math.PI / 2;
            objBox.setFromObject(obj); // recompute after rotation
            const rotatedSize = objBox.getSize(new THREE.Vector3());
            objWorldPos.x = parentBox.min.x + rotatedSize.x / 2 + wallThickness;

            let zDimension = 0;

            switch(furnitureType) {
                case DIMENSION_TYPE_BOTTOM: {
                    if(cornerBottomDepth && cornerBottomDepth > 0) {
                        zDimension = cornerBottomDepth3d; 
                    } else if(cornerFullDepth && cornerFullDepth > 0) {
                        zDimension = cornerFullDepth3d;
                    } else if(cornerTopDepth && cornerTopDepth > 0) {
                        zDimension = cornerTopDepth3d;
                    }
                    break;
                }
                case DIMENSION_TYPE_TOP: {
                    if(cornerTopDepth && cornerTopDepth > 0) {
                        zDimension = cornerTopDepth3d; 
                    } else if(cornerFullDepth && cornerFullDepth > 0) {
                        zDimension = cornerFullDepth3d;
                    } else if(cornerBottomDepth && cornerBottomDepth > 0) {
                        zDimension = cornerBottomDepth3d;
                    }
                }
                case DIMENSION_TYPE_FULL: {
                    if(cornerFullDepth && cornerFullDepth > 0) {
                        zDimension = cornerFullDepth3d;
                    } else if(cornerTopDepth && cornerTopDepth > 0) {
                        zDimension = cornerTopDepth3d; 
                    } else if(cornerBottomDepth && cornerBottomDepth > 0) {
                        zDimension = cornerBottomDepth3d;
                    }
                }
            }

            objWorldPos.z = Math.max(
                parentBoxWorld.min.z + zDimension  + wallThickness + objDepth / 2,
                Math.min(parentBoxWorld.max.z - objDepth / 2, objWorldPos.z )
            );
        } else {
            obj.rotation.y = 0;
            objBox.setFromObject(obj);
            objWorldPos.z = parentBoxWorld.min.z + objDepth / 2 + wallThickness;

            let xDimension = 0;

            switch(furnitureType) {
                case DIMENSION_TYPE_BOTTOM: {
                    if(cornerBottomWidth && cornerBottomWidth > 0) {
                        xDimension = cornerBottomWidth3d; 
                    } else if(cornerFullWidth && cornerFullWidth > 0) {
                        xDimension = cornerFullWidth3d;
                    } else if(cornerTopWidth && cornerTopWidth > 0) {
                        xDimension = cornerTopWidth3d;
                    }
                    break;
                }
                case DIMENSION_TYPE_TOP: {
                    if(cornerTopWidth && cornerTopWidth > 0) {
                        xDimension = cornerTopWidth3d; 
                    } else if(cornerFullWidth && cornerFullWidth > 0) {
                        xDimension = cornerFullWidth3d;
                    } else if(cornerBottomWidth && cornerBottomWidth > 0) {
                        xDimension = cornerBottomWidth3d;
                    }
                }
                case DIMENSION_TYPE_FULL: {
                    if(cornerFullWidth && cornerFullWidth > 0) {
                        xDimension = cornerFullWidth3d;
                    } else if(cornerTopWidth && cornerTopWidth > 0) {
                        xDimension = cornerTopWidth3d; 
                    } else if(cornerBottomWidth && cornerBottomWidth > 0) {
                        xDimension = cornerBottomWidth3d;
                    }
                }
            }

            // objWorldPos.x = Math.max(
            //     // parentBoxWorld.min.x + objWidth / 2  + wallThickness,
            //     parentBoxWorld.min.x + xDimension  + wallThickness + objWidth / 2,
            //     Math.min(parentBoxWorld.max.x - objWidth / 2, objWorldPos.x)
            // );
             objWorldPos.x = Math.max(
                parentBox.min.x + rotatedSize.x / 2 + wallThickness,
                Math.min(parentBox.max.x - rotatedSize.x / 2, objWorldPos.x)
            );
        }

        obj.position.copy(obj.parent.worldToLocal(objWorldPos));

        const isFitting = checkIfAbleToDragChildToPosition(obj, objBox);

        return isFitting;
    }

    function setCornerChildenDraggingOld(obj) {
        const furnitureType = obj.userData.furnitureType;
        const parentBoxWorld  = new THREE.Box3().setFromObject(room3DGroup);

        const objBox = new THREE.Box3().setFromObject(obj);
        const objHeight = objBox.max.y - objBox.min.y;

        const objSize = new THREE.Vector3();
        objBox.getSize(objSize);
        const objWidth =  objSize.x;
        const objDepth =  objSize.z

        // const forwardThreshold = parentBoxWorld.min.z + (objDepth / 6);
        let cornerThresholder = objWidth - 0.01;
        switch(furnitureType) {
            case DIMENSION_TYPE_BOTTOM: {
                if(cornerBottomWidth && cornerBottomWidth > 0) {
                    cornerThresholder = cornerBottomWidth3d; 
                } else if(cornerFullWidth && cornerFullWidth > 0) {
                    cornerThresholder = cornerFullWidth3d;
                } else if(cornerTopWidth && cornerTopWidth > 0) {
                    cornerThresholder = cornerTopWidth3d;
                }
                break;
            }
            case DIMENSION_TYPE_TOP: {
                if(cornerTopWidth && cornerTopWidth > 0) {
                    cornerThresholder = cornerTopWidth3d; 
                } else if(cornerFullWidth && cornerFullWidth > 0) {
                    cornerThresholder = cornerFullWidth3d;
                } else if(cornerBottomWidth && cornerBottomWidth > 0) {
                    cornerThresholder = cornerBottomWidth3d;
                }
            }
            case DIMENSION_TYPE_FULL: {
                if(cornerFullWidth && cornerFullWidth > 0) {
                    cornerThresholder = cornerFullWidth3d;
                } else if(cornerTopWidth && cornerTopWidth > 0) {
                    cornerThresholder = cornerTopWidth3d; 
                } else if(cornerBottomWidth && cornerBottomWidth > 0) {
                    cornerThresholder = cornerBottomWidth3d;
                }
            }
            default: {
                // cornerThresholder = objWidth - 0.01;
                cornerThresholder = objWidth - 0.01;
            }
        }

        // const forwardThreshold = parentBoxWorld.min.z + cornerThresholder - wallThickness;
        const forwardThreshold = parentBoxWorld.min.x + cornerThresholder - 0;

        const objWorldPos = obj.getWorldPosition(new THREE.Vector3());

        objWorldPos.y = obj.userData.savedPosition.y; 

        // const currentPos = new THREE.Vector3();
        // const currentY = currentPos.y;
        // obj.getWorldPosition(currentPos);

        // objWorldPos.y = currentY; 
        
        if (obj.position.x < forwardThreshold) {
            obj.rotation.y = Math.PI / 2; 
            // objWorldPos.x = parentBoxWorld.min.x - objDepth / 2 + wallThickness;
            objWorldPos.x = parentBoxWorld.min.x + objWidth / 2 + wallThickness;
            //  objWorldPos.x = parentBoxWorld.min.x - cornerThresholder + wallThickness;

            let zDimension = 0;

            switch(furnitureType) {
                case DIMENSION_TYPE_BOTTOM: {
                    if(cornerBottomDepth && cornerBottomDepth > 0) {
                        zDimension = cornerBottomDepth3d; 
                    } else if(cornerFullDepth && cornerFullDepth > 0) {
                        zDimension = cornerFullDepth3d;
                    } else if(cornerTopDepth && cornerTopDepth > 0) {
                        zDimension = cornerTopDepth3d;
                    }
                    break;
                }
                case DIMENSION_TYPE_TOP: {
                    if(cornerTopDepth && cornerTopDepth > 0) {
                        zDimension = cornerTopDepth3d; 
                    } else if(cornerFullDepth && cornerFullDepth > 0) {
                        zDimension = cornerFullDepth3d;
                    } else if(cornerBottomDepth && cornerBottomDepth > 0) {
                        zDimension = cornerBottomDepth3d;
                    }
                }
                case DIMENSION_TYPE_FULL: {
                    if(cornerFullDepth && cornerFullDepth > 0) {
                        zDimension = cornerFullDepth3d;
                    } else if(cornerTopDepth && cornerTopDepth > 0) {
                        zDimension = cornerTopDepth3d; 
                    } else if(cornerBottomDepth && cornerBottomDepth > 0) {
                        zDimension = cornerBottomDepth3d;
                    }
                }
            }

            objWorldPos.z = Math.max(
                parentBoxWorld.min.z + zDimension  + wallThickness + objDepth / 2,
                // parentBoxWorld.min.z + cornerThresholder  + wallThickness,
                Math.min(parentBoxWorld.max.z - objDepth / 2, objWorldPos.z )
            );
        } else {
            obj.rotation.y = 0;
            objWorldPos.z = parentBoxWorld.min.z + objDepth / 2 + wallThickness;

            let xDimension = 0;

            switch(furnitureType) {
                case DIMENSION_TYPE_BOTTOM: {
                    if(cornerBottomWidth && cornerBottomWidth > 0) {
                        xDimension = cornerBottomWidth3d; 
                    } else if(cornerFullWidth && cornerFullWidth > 0) {
                        xDimension = cornerFullWidth3d;
                    } else if(cornerTopWidth && cornerTopWidth > 0) {
                        xDimension = cornerTopWidth3d;
                    }
                    break;
                }
                case DIMENSION_TYPE_TOP: {
                    if(cornerTopWidth && cornerTopWidth > 0) {
                        xDimension = cornerTopWidth3d; 
                    } else if(cornerFullWidth && cornerFullWidth > 0) {
                        xDimension = cornerFullWidth3d;
                    } else if(cornerBottomWidth && cornerBottomWidth > 0) {
                        xDimension = cornerBottomWidth3d;
                    }
                }
                case DIMENSION_TYPE_FULL: {
                    if(cornerFullWidth && cornerFullWidth > 0) {
                        xDimension = cornerFullWidth3d;
                    } else if(cornerTopWidth && cornerTopWidth > 0) {
                        xDimension = cornerTopWidth3d; 
                    } else if(cornerBottomWidth && cornerBottomWidth > 0) {
                        xDimension = cornerBottomWidth3d;
                    }
                }
            }

            objWorldPos.x = Math.max(
                // parentBoxWorld.min.x + objWidth / 2  + wallThickness,
                parentBoxWorld.min.x + xDimension  + wallThickness + objWidth / 2,
                Math.min(parentBoxWorld.max.x - objWidth / 2, objWorldPos.x)
            );
        }

        // objWorldPos.x = Math.max(
        //     // parentBoxWorld.min.x + objWidth / 2  + wallThickness,
        //     parentBoxWorld.min.x + cornerThresholder  + wallThickness,
        //     Math.min(parentBoxWorld.max.x - objWidth / 2, objWorldPos.x)
        // );

        // objWorldPos.z = Math.max(
        //     parentBoxWorld.min.z + objDepth / 2  + wallThickness,
        //     // parentBoxWorld.min.z + cornerThresholder  + wallThickness,
        //     Math.min(parentBoxWorld.max.z - objDepth / 2, objWorldPos.z )
        // );

        obj.position.copy(obj.parent.worldToLocal(objWorldPos));

        const isFitting = checkIfAbleToDragChildToPosition(obj, objBox);

        return isFitting;
    }

    function checkIfAbleToDragChildToPosition(currentObj, currentBox, exludeObjId = null) {
        const currentId = currentObj.id;
        const currentObjType = currentObj.userData.furnitureType;

        const currentBoxMin = currentBox.min;
        const currentBoxMax = currentBox.max;
        const currentXMin = currentBoxMin.x;
        const currentYMin = currentBoxMin.y;
        const currentXMax = currentBoxMax.x;
        const currentYMax = currentBoxMax.y;

        let isFitting = true;

        const children = modelScene.children;

        let fittingObjs = [];
        const childrenCount = children.length;
        let i = 0;

        if(roomType === ROOM_TYPE_SINGLE_WALL) {
            while(i < childrenCount) {
                const childObj = children[i];
                const childObjId = childObj.id;
                i++;
                if(currentId === childObjId || exludeObjId && exludeObjId == childObjId) {
                    continue;
                }
                const userData = childObj.userData;
  
                if(!userData.furnitureId && !userData.pseudoType) {
                    continue;
                }
        
                const childFurnitureType = userData.furnitureType;

                const childBox = new THREE.Box3().setFromObject(childObj);
                const childBoxMin = childBox.min;
                const childBoxMax = childBox.max;
                const childXMin = childBoxMin.x;
                const childYMin = childBoxMin.y;
                const childXMax = childBoxMax.x;
                const childYMax = childBoxMax.y;

                if(
                    (
                        currentXMin >= childXMin && currentXMin <= childXMax || 
                        currentXMax >= childXMin && currentXMax <= childXMax ||
                        currentXMin <= childXMin && currentXMax >= childXMax
                    ) &&
                    (
                        currentYMin >= childYMin && currentYMin <= childYMax || 
                        currentYMax >= childYMin && currentYMax <= childYMax ||
                        currentYMin <= childYMin && currentYMax >= childYMax
                    ) ||
                    (
                        currentObjType === DIMENSION_TYPE_FULL &&
                        currentXMin >= childXMin && currentXMin <= childXMax || 
                        currentObjType === DIMENSION_TYPE_FULL && 
                        currentXMax >= childXMin && currentXMax <= childXMax ||
                        currentObjType === DIMENSION_TYPE_FULL && 
                        currentXMin <= childXMin && currentXMax >= childXMax
                    ) ||
                    (
                        currentObjType === DIMENSION_TYPE_TOP &&
                        childFurnitureType === DIMENSION_TYPE_FULL &&
                        currentXMin >= childXMin && currentXMin <= childXMax || 

                        currentObjType === DIMENSION_TYPE_TOP &&
                        childFurnitureType === DIMENSION_TYPE_FULL &&
                        currentXMax >= childXMin && currentXMax <= childXMax ||

                        currentObjType === DIMENSION_TYPE_TOP &&
                        childFurnitureType === DIMENSION_TYPE_FULL &&
                        currentXMin <= childXMin && currentXMax >= childXMax ||

                        currentObjType === DIMENSION_TYPE_TOP && 
                        childFurnitureType === DIMENSION_TYPE_FULL &&
                        currentXMin >= childXMin && currentXMin <= childXMax ||

                        currentObjType === DIMENSION_TYPE_TOP && 
                        childFurnitureType === DIMENSION_TYPE_FULL &&
                        currentXMax >= childXMin && currentXMax <= childXMax ||
                        currentObjType === DIMENSION_TYPE_TOP && 
                        childFurnitureType === DIMENSION_TYPE_FULL &&
                        currentXMin <= childXMin && currentXMax >= childXMax
                    ) ||
                    (
                        childFurnitureType === DIMENSION_TYPE_TOP &&
                        currentObjType === DIMENSION_TYPE_FULL &&
                        currentXMin >= childXMin && currentXMin <= childXMax || 

                        childFurnitureType === DIMENSION_TYPE_TOP &&
                        currentObjType === DIMENSION_TYPE_FULL &&
                        currentXMax >= childXMin && currentXMax <= childXMax ||

                        childFurnitureType === DIMENSION_TYPE_TOP &&
                        currentObjType === DIMENSION_TYPE_FULL &&
                        currentXMin <= childXMin && currentXMax >= childXMax ||

                        childFurnitureType === DIMENSION_TYPE_TOP && 
                        currentObjType === DIMENSION_TYPE_FULL &&
                        currentXMin >= childXMin && currentXMin <= childXMax ||

                        childFurnitureType === DIMENSION_TYPE_TOP && 
                        currentObjType === DIMENSION_TYPE_FULL &&
                        currentXMax >= childXMin && currentXMax <= childXMax ||

                        childFurnitureType === DIMENSION_TYPE_TOP && 
                        currentObjType === DIMENSION_TYPE_FULL &&
                        currentXMin <= childXMin && currentXMax >= childXMax
                    )
                ) {
                    isFitting = false; 
                    break;
                } 
// 				else {
// 					const isFittingChild = checkIfAbleToDragChildToPosition(childObj, childBox, currentId);

// 					if(isFittingChild) {
// 						fittingObjs.push(childObj);
// 					} 
// 				}
            }

        } else {
            const currentZMin = currentBoxMin.z;
            const currentZMax = currentBoxMax.z;

            while(i < childrenCount) {
                const childObj = children[i];
                const userData = childObj.userData;
        
                i++;
                if(!userData.furnitureId && !userData.pseudoType) {
                    continue;
                }
                const childFurnitureType = userData.furnitureType;
                const childObjId = childObj.id;

                if(currentId === childObjId) {
                    continue;
                }

                const childBox = new THREE.Box3();

                if (userData.pseudoType) {
                    // pseudo cubes: scale the geometry to world size first
                    const originalScale = childObj.scale.clone();
                    childObj.scale.set(userData.originalSize.x, userData.originalSize.y, userData.originalSize.z);
                    childBox.setFromObject(childObj);
                    childObj.scale.copy(originalScale); // restore scale if needed
                } else {
                    // GLB model
                    childBox.setFromObject(childObj);
                }

                const childBoxMin = childBox.min;
                const childBoxMax = childBox.max;
                const childYMin = childBoxMin.y;
                const childYMax = childBoxMax.y;
                const isRotated = Math.abs(currentObj.rotation.y) > 0.0001;

                if(!isRotated) {
                    const childXMin = childBoxMin.x;
                    const childXMax = childBoxMax.x;

                    if(
                        (
                            currentXMin >= childXMin && currentXMin <= childXMax || 
                            currentXMax >= childXMin && currentXMax <= childXMax ||
                            currentXMin <= childXMin && currentXMax >= childXMax
                        ) &&
                        (
                            currentYMin >= childYMin && currentYMin <= childYMax || 
                            currentYMax >= childYMin && currentYMax <= childYMax ||
                            currentYMin <= childYMin && currentYMax >= childYMax
                        ) ||
                        (
                            currentObjType === DIMENSION_TYPE_FULL &&
                            currentXMin >= childXMin && currentXMin <= childXMax || 
                            currentObjType === DIMENSION_TYPE_FULL && 
                            currentXMax >= childXMin && currentXMax <= childXMax ||
                            currentObjType === DIMENSION_TYPE_FULL && 
                            currentXMin <= childXMin && currentXMax >= childXMax
                        ) ||
                        (
                            currentObjType === DIMENSION_TYPE_TOP &&
                            childFurnitureType === DIMENSION_TYPE_FULL &&
                            currentXMin >= childXMin && currentXMin <= childXMax || 

                            currentObjType === DIMENSION_TYPE_TOP &&
                            childFurnitureType === DIMENSION_TYPE_FULL &&
                            currentXMax >= childXMin && currentXMax <= childXMax ||

                            currentObjType === DIMENSION_TYPE_TOP &&
                            childFurnitureType === DIMENSION_TYPE_FULL &&
                            currentXMin <= childXMin && currentXMax >= childXMax ||

                            currentObjType === DIMENSION_TYPE_TOP && 
                            childFurnitureType === DIMENSION_TYPE_FULL &&
                            currentXMin >= childXMin && currentXMin <= childXMax ||

                            currentObjType === DIMENSION_TYPE_TOP && 
                            childFurnitureType === DIMENSION_TYPE_FULL &&
                            currentXMax >= childXMin && currentXMax <= childXMax ||
                            currentObjType === DIMENSION_TYPE_TOP && 
                            childFurnitureType === DIMENSION_TYPE_FULL &&
                            currentXMin <= childXMin && currentXMax >= childXMax
                        ) ||
                        (
                            childFurnitureType === DIMENSION_TYPE_TOP &&
                            currentObjType === DIMENSION_TYPE_FULL &&
                            currentXMin >= childXMin && currentXMin <= childXMax || 

                            childFurnitureType === DIMENSION_TYPE_TOP &&
                            currentObjType === DIMENSION_TYPE_FULL &&
                            currentXMax >= childXMin && currentXMax <= childXMax ||

                            childFurnitureType === DIMENSION_TYPE_TOP &&
                            currentObjType === DIMENSION_TYPE_FULL &&
                            currentXMin <= childXMin && currentXMax >= childXMax ||

                            childFurnitureType === DIMENSION_TYPE_TOP && 
                            currentObjType === DIMENSION_TYPE_FULL &&
                            currentXMin >= childXMin && currentXMin <= childXMax ||

                            childFurnitureType === DIMENSION_TYPE_TOP && 
                            currentObjType === DIMENSION_TYPE_FULL &&
                            currentXMax >= childXMin && currentXMax <= childXMax ||

                            childFurnitureType === DIMENSION_TYPE_TOP && 
                            currentObjType === DIMENSION_TYPE_FULL &&
                            currentXMin <= childXMin && currentXMax >= childXMax
                        )
                    ) {
                        isFitting = false; 
                        break;
                    } 

                } else {
                    const childZMin = childBoxMin.z - wallThickness;
                    const childZMax = childBoxMax.z - wallThickness;

                    if(
                        (
                            currentZMin >= childZMin && currentZMin <= childZMax || 
                            currentZMin >= childZMin && currentZMax <= childZMax ||
                            currentZMin <= childZMin && currentZMax >= childZMax
                        ) &&
                        (
                            currentYMin >= childYMin && currentYMin <= childYMax || 
                            currentYMax >= childYMin && currentYMax <= childYMax ||
                            currentYMin <= childYMin && currentYMax >= childYMax
                        ) ||
                        (
                            currentObjType === DIMENSION_TYPE_FULL &&
                            currentZMin >= childZMin && currentZMin <= childZMax || 
                            currentObjType === DIMENSION_TYPE_FULL && 
                            currentZMax >= childZMin && currentZMax <= childZMax ||
                            currentObjType === DIMENSION_TYPE_FULL && 
                            currentZMin <= childZMin && currentZMax >= childZMax
                        ) ||
                        (
                            currentObjType === DIMENSION_TYPE_TOP &&
                            childFurnitureType === DIMENSION_TYPE_FULL &&
                            currentZMin >= childZMin && currentZMin <= childZMax || 

                            currentObjType === DIMENSION_TYPE_TOP &&
                            childFurnitureType === DIMENSION_TYPE_FULL &&
                            currentZMax >= childZMin && currentZMax <= childZMax ||

                            currentObjType === DIMENSION_TYPE_TOP &&
                            childFurnitureType === DIMENSION_TYPE_FULL &&
                            currentZMin <= childZMin && currentZMax >= childZMax ||

                            currentObjType === DIMENSION_TYPE_TOP && 
                            childFurnitureType === DIMENSION_TYPE_FULL &&
                            currentZMin >= childZMin && currentZMin <= childZMax ||

                            currentObjType === DIMENSION_TYPE_TOP && 
                            childFurnitureType === DIMENSION_TYPE_FULL &&
                            currentZMax >= childZMin && currentZMax <= childZMax ||
                            currentObjType === DIMENSION_TYPE_TOP && 
                            childFurnitureType === DIMENSION_TYPE_FULL &&
                            currentZMin <= childZMin && currentZMax >= childZMax
                        ) ||
                        (
                            childFurnitureType === DIMENSION_TYPE_TOP &&
                            currentObjType === DIMENSION_TYPE_FULL &&
                            currentZMin >= childZMin && currentZMin <= childZMax || 

                            childFurnitureType === DIMENSION_TYPE_TOP &&
                            currentObjType === DIMENSION_TYPE_FULL &&
                            currentZMax >= childZMin && currentZMax <= childZMax ||

                            childFurnitureType === DIMENSION_TYPE_TOP &&
                            currentObjType === DIMENSION_TYPE_FULL &&
                            currentZMin <= childZMin && currentZMax >= childZMax ||

                            childFurnitureType === DIMENSION_TYPE_TOP && 
                            currentObjType === DIMENSION_TYPE_FULL &&
                            currentZMin >= childZMin && currentZMin <= childZMax ||

                            childFurnitureType === DIMENSION_TYPE_TOP && 
                            currentObjType === DIMENSION_TYPE_FULL &&
                            currentZMax >= childZMin && currentZMax <= childZMax ||

                            childFurnitureType === DIMENSION_TYPE_TOP && 
                            currentObjType === DIMENSION_TYPE_FULL &&
                            currentZMin <= childZMin && currentZMax >= childZMax
                        )
                    ) {
                        isFitting = false;
                        break;
                    } 
                }
            }
        }
        
        return isFitting;

    }

    function checkIfItemsAreFitting(currentObj, currentBox) {
        const currentId = currentObj.id;
        const currentObjType = currentObj.userData.furnitureType;

        const currentBoxMin = currentBox.min;
        const currentBoxMax = currentBox.max;
        const currentXMin = currentBoxMin.x;
        const currentYMin = currentBoxMin.y;
        const currentXMax = currentBoxMax.x;
        const currentYMax = currentBoxMax.y;

        const children = modelScene.children;

        const childrenCount = children.length;
        let i = 0;

        let notFittingObjs = [];

        if(roomType === ROOM_TYPE_SINGLE_WALL) {
            while(i < childrenCount) {
                const childObj = children[i];
                const userData = childObj.userData;
                
                i++;

                if(!userData.furnitureId && !userData.pseudoType) {
                    continue;
                }
        
                const childFurnitureType = userData.furnitureType;
                const childObjId = childObj.id;
            
                if(currentId === childObjId) {
                    continue;
                }

                const childBox = new THREE.Box3().setFromObject(childObj);
                const childBoxMin = childBox.min;
                const childBoxMax = childBox.max;
                const childXMin = childBoxMin.x;
                const childYMin = childBoxMin.y;
                const childXMax = childBoxMax.x;
                const childYMax = childBoxMax.y;

                if(
                    (
                        currentXMin >= childXMin && currentXMin <= childXMax || 
                        currentXMax >= childXMin && currentXMax <= childXMax ||
                        currentXMin <= childXMin && currentXMax >= childXMax
                    ) &&
                    (
                        currentYMin >= childYMin && currentYMin <= childYMax || 
                        currentYMax >= childYMin && currentYMax <= childYMax ||
                        currentYMin <= childYMin && currentYMax >= childYMax
                    ) ||
                    (
                        currentObjType === DIMENSION_TYPE_FULL &&
                        currentXMin >= childXMin && currentXMin <= childXMax || 
                        currentObjType === DIMENSION_TYPE_FULL && 
                        currentXMax >= childXMin && currentXMax <= childXMax ||
                        currentObjType === DIMENSION_TYPE_FULL && 
                        currentXMin <= childXMin && currentXMax >= childXMax
                    ) ||
                    (
                        currentObjType === DIMENSION_TYPE_TOP &&
                        childFurnitureType === DIMENSION_TYPE_FULL &&
                        currentXMin >= childXMin && currentXMin <= childXMax || 

                        currentObjType === DIMENSION_TYPE_TOP &&
                        childFurnitureType === DIMENSION_TYPE_FULL &&
                        currentXMax >= childXMin && currentXMax <= childXMax ||

                        currentObjType === DIMENSION_TYPE_TOP &&
                        childFurnitureType === DIMENSION_TYPE_FULL &&
                        currentXMin <= childXMin && currentXMax >= childXMax ||

                        currentObjType === DIMENSION_TYPE_TOP && 
                        childFurnitureType === DIMENSION_TYPE_FULL &&
                        currentXMin >= childXMin && currentXMin <= childXMax ||

                        currentObjType === DIMENSION_TYPE_TOP && 
                        childFurnitureType === DIMENSION_TYPE_FULL &&
                        currentXMax >= childXMin && currentXMax <= childXMax ||
                        currentObjType === DIMENSION_TYPE_TOP && 
                        childFurnitureType === DIMENSION_TYPE_FULL &&
                        currentXMin <= childXMin && currentXMax >= childXMax
                    ) ||
                    (
                        childFurnitureType === DIMENSION_TYPE_TOP &&
                        currentObjType === DIMENSION_TYPE_FULL &&
                        currentXMin >= childXMin && currentXMin <= childXMax || 

                        childFurnitureType === DIMENSION_TYPE_TOP &&
                        currentObjType === DIMENSION_TYPE_FULL &&
                        currentXMax >= childXMin && currentXMax <= childXMax ||

                        childFurnitureType === DIMENSION_TYPE_TOP &&
                        currentObjType === DIMENSION_TYPE_FULL &&
                        currentXMin <= childXMin && currentXMax >= childXMax ||

                        childFurnitureType === DIMENSION_TYPE_TOP && 
                        currentObjType === DIMENSION_TYPE_FULL &&
                        currentXMin >= childXMin && currentXMin <= childXMax ||

                        childFurnitureType === DIMENSION_TYPE_TOP && 
                        currentObjType === DIMENSION_TYPE_FULL &&
                        currentXMax >= childXMin && currentXMax <= childXMax ||

                        childFurnitureType === DIMENSION_TYPE_TOP && 
                        currentObjType === DIMENSION_TYPE_FULL &&
                        currentXMin <= childXMin && currentXMax >= childXMax
                    )
                ) {
                    
                    const isFitting = checkIfAbleToDragChildToPosition(childObj, childBox, currentId);
                    if(isFitting) {
                        notFittingObjs.push(childObj);
                    }
                    continue;
                }
            }
      
        } else {
            const currentZMin = currentBoxMin.z;
            const currentZMax = currentBoxMax.z;

            while(i < childrenCount) {
                const childObj = children[i];
                const userData = childObj.userData;
                
                i++;
                if(!userData.furnitureId && !userData.pseudoType) {
                    continue;
                }
                const childFurnitureType = userData.furnitureType;
                const childObjId = childObj.id;

                if(currentId === childObjId) {
                    continue;
                }

                const childBox = new THREE.Box3().setFromObject(childObj);
                const childBoxMin = childBox.min;
                const childBoxMax = childBox.max;
                const childYMin = childBoxMin.y;
                const childYMax = childBoxMax.y;
                const isRotated = Math.abs(currentObj.rotation.y) > 0.0001;

                if(!isRotated) {
                    const childXMin = childBoxMin.x;
                    const childXMax = childBoxMax.x;
                    if(
                        (
                            currentXMin >= childXMin && currentXMin <= childXMax || 
                            currentXMax >= childXMin && currentXMax <= childXMax ||
                            currentXMin <= childXMin && currentXMax >= childXMax
                        ) &&
                        (
                            currentYMin >= childYMin && currentYMin <= childYMax || 
                            currentYMax >= childYMin && currentYMax <= childYMax ||
                            currentYMin <= childYMin && currentYMax >= childYMax
                        ) ||
                        (
                            currentObjType === DIMENSION_TYPE_FULL &&
                            currentXMin >= childXMin && currentXMin <= childXMax || 
                            currentObjType === DIMENSION_TYPE_FULL && 
                            currentXMax >= childXMin && currentXMax <= childXMax ||
                            currentObjType === DIMENSION_TYPE_FULL && 
                            currentXMin <= childXMin && currentXMax >= childXMax
                        ) ||
                        (
                            currentObjType === DIMENSION_TYPE_TOP &&
                            childFurnitureType === DIMENSION_TYPE_FULL &&
                            currentXMin >= childXMin && currentXMin <= childXMax || 

                            currentObjType === DIMENSION_TYPE_TOP &&
                            childFurnitureType === DIMENSION_TYPE_FULL &&
                            currentXMax >= childXMin && currentXMax <= childXMax ||

                            currentObjType === DIMENSION_TYPE_TOP &&
                            childFurnitureType === DIMENSION_TYPE_FULL &&
                            currentXMin <= childXMin && currentXMax >= childXMax ||

                            currentObjType === DIMENSION_TYPE_TOP && 
                            childFurnitureType === DIMENSION_TYPE_FULL &&
                            currentXMin >= childXMin && currentXMin <= childXMax ||

                            currentObjType === DIMENSION_TYPE_TOP && 
                            childFurnitureType === DIMENSION_TYPE_FULL &&
                            currentXMax >= childXMin && currentXMax <= childXMax ||
                            currentObjType === DIMENSION_TYPE_TOP && 
                            childFurnitureType === DIMENSION_TYPE_FULL &&
                            currentXMin <= childXMin && currentXMax >= childXMax
                        ) ||
                        (
                            childFurnitureType === DIMENSION_TYPE_TOP &&
                            currentObjType === DIMENSION_TYPE_FULL &&
                            currentXMin >= childXMin && currentXMin <= childXMax || 

                            childFurnitureType === DIMENSION_TYPE_TOP &&
                            currentObjType === DIMENSION_TYPE_FULL &&
                            currentXMax >= childXMin && currentXMax <= childXMax ||

                            childFurnitureType === DIMENSION_TYPE_TOP &&
                            currentObjType === DIMENSION_TYPE_FULL &&
                            currentXMin <= childXMin && currentXMax >= childXMax ||

                            childFurnitureType === DIMENSION_TYPE_TOP && 
                            currentObjType === DIMENSION_TYPE_FULL &&
                            currentXMin >= childXMin && currentXMin <= childXMax ||

                            childFurnitureType === DIMENSION_TYPE_TOP && 
                            currentObjType === DIMENSION_TYPE_FULL &&
                            currentXMax >= childXMin && currentXMax <= childXMax ||

                            childFurnitureType === DIMENSION_TYPE_TOP && 
                            currentObjType === DIMENSION_TYPE_FULL &&
                            currentXMin <= childXMin && currentXMax >= childXMax
                        )
                    ) {     
                        const isFitting = checkIfAbleToDragChildToPosition(childObj, childBox, currentId);
                        if(isFitting) {
                            notFittingObjs.push(childObj);
                        }
                        continue;
                    }
                } else {
                    const childZMin = childBoxMin.z - wallThickness;
                    const childZMax = childBoxMax.z - wallThickness;

                    if(
                        (
                            currentZMin >= childZMin && currentZMin <= childZMax || 
                            currentZMin >= childZMin && currentZMax <= childZMax ||
                            currentZMin <= childZMin && currentZMax >= childZMax
                        ) &&
                        (
                            currentYMin >= childYMin && currentYMin <= childYMax || 
                            currentYMax >= childYMin && currentYMax <= childYMax ||
                            currentYMin <= childYMin && currentYMax >= childYMax
                        ) ||
                        (
                            currentObjType === DIMENSION_TYPE_FULL &&
                            currentZMin >= childZMin && currentZMin <= childZMax || 
                            currentObjType === DIMENSION_TYPE_FULL && 
                            currentZMax >= childZMin && currentZMax <= childZMax ||
                            currentObjType === DIMENSION_TYPE_FULL && 
                            currentZMin <= childZMin && currentZMax >= childZMax
                        ) ||
                        (
                            currentObjType === DIMENSION_TYPE_TOP &&
                            childFurnitureType === DIMENSION_TYPE_FULL &&
                            currentZMin >= childZMin && currentZMin <= childZMax || 

                            currentObjType === DIMENSION_TYPE_TOP &&
                            childFurnitureType === DIMENSION_TYPE_FULL &&
                            currentZMax >= childZMin && currentZMax <= childZMax ||

                            currentObjType === DIMENSION_TYPE_TOP &&
                            childFurnitureType === DIMENSION_TYPE_FULL &&
                            currentZMin <= childZMin && currentZMax >= childZMax ||

                            currentObjType === DIMENSION_TYPE_TOP && 
                            childFurnitureType === DIMENSION_TYPE_FULL &&
                            currentZMin >= childZMin && currentZMin <= childZMax ||

                            currentObjType === DIMENSION_TYPE_TOP && 
                            childFurnitureType === DIMENSION_TYPE_FULL &&
                            currentZMax >= childZMin && currentZMax <= childZMax ||
                            currentObjType === DIMENSION_TYPE_TOP && 
                            childFurnitureType === DIMENSION_TYPE_FULL &&
                            currentZMin <= childZMin && currentZMax >= childZMax
                        ) ||
                        (
                            childFurnitureType === DIMENSION_TYPE_TOP &&
                            currentObjType === DIMENSION_TYPE_FULL &&
                            currentZMin >= childZMin && currentZMin <= childZMax || 

                            childFurnitureType === DIMENSION_TYPE_TOP &&
                            currentObjType === DIMENSION_TYPE_FULL &&
                            currentZMax >= childZMin && currentZMax <= childZMax ||

                            childFurnitureType === DIMENSION_TYPE_TOP &&
                            currentObjType === DIMENSION_TYPE_FULL &&
                            currentZMin <= childZMin && currentZMax >= childZMax ||

                            childFurnitureType === DIMENSION_TYPE_TOP && 
                            currentObjType === DIMENSION_TYPE_FULL &&
                            currentZMin >= childZMin && currentZMin <= childZMax ||

                            childFurnitureType === DIMENSION_TYPE_TOP && 
                            currentObjType === DIMENSION_TYPE_FULL &&
                            currentZMax >= childZMin && currentZMax <= childZMax ||

                            childFurnitureType === DIMENSION_TYPE_TOP && 
                            currentObjType === DIMENSION_TYPE_FULL &&
                            currentZMin <= childZMin && currentZMax >= childZMax
                        )
                    ) {
                        const isFitting = checkIfAbleToDragChildToPosition(childObj, childBox, currentId);
                        if(isFitting) {
                            notFittingObjs.push(childObj);
                        }
                        continue;
                    }
                } 
            }
        }

        notFittingObjs.forEach(notFittingObj => {
            notFittingObj.userData.isFitting = true;  

            notFittingObj.traverse(child => {
                if (child.isMesh && child.userData.originalMaterial) {
                    child.material.color.copy(child.userData.originalMaterial.color);
                    child.material.opacity = child.userData.originalMaterial.opacity;
                    child.material.transparent = child.userData.originalMaterial.transparent;
                }
            });
        });

    }

    function checkIfItemsAreFittingForNewCorner(currentObj, currentBox) {
        const currentId = currentObj.id;
        const currentObjType = currentObj.userData.furnitureType;

        const currentBoxMin = currentBox.min;
        const currentBoxMax = currentBox.max;
        const currentXMin = currentBoxMin.x;
        const currentYMin = currentBoxMin.y;
        const currentXMax = currentBoxMax.x;
        const currentYMax = currentBoxMax.y;

        const children = modelScene.children;

        const childrenCount = children.length;
        let i = 0;

        const currentZMin = currentBoxMin.z;
        const currentZMax = currentBoxMax.z;

        while(i < childrenCount) {
            const childObj = children[i];
            const userData = childObj.userData;
            
            i++;
            if(!userData.furnitureId && !userData.pseudoType) {
                continue;
            }
            const childFurnitureType = userData.furnitureType;
            const childObjId = childObj.id;

            if(currentId === childObjId) {
                continue;
            }

            const childBox = new THREE.Box3().setFromObject(childObj);
            const childBoxMin = childBox.min;
            const childBoxMax = childBox.max;
            const childYMin = childBoxMin.y;
            const childYMax = childBoxMax.y;
            const isRotated = Math.abs(currentObj.rotation.y) > 0.0001;

            if(!isRotated) {
                const childXMin = childBoxMin.x;
                const childXMax = childBoxMax.x;
                if(
                    (
                        currentXMin >= childXMin && currentXMin <= childXMax || 
                        currentXMax >= childXMin && currentXMax <= childXMax ||
                        currentXMin <= childXMin && currentXMax >= childXMax
                    ) &&
                    (
                        currentYMin >= childYMin && currentYMin <= childYMax || 
                        currentYMax >= childYMin && currentYMax <= childYMax ||
                        currentYMin <= childYMin && currentYMax >= childYMax
                    ) ||
                    (
                        currentObjType === DIMENSION_TYPE_FULL &&
                        currentXMin >= childXMin && currentXMin <= childXMax || 
                        currentObjType === DIMENSION_TYPE_FULL && 
                        currentXMax >= childXMin && currentXMax <= childXMax ||
                        currentObjType === DIMENSION_TYPE_FULL && 
                        currentXMin <= childXMin && currentXMax >= childXMax
                    ) ||
                    (
                        currentObjType === DIMENSION_TYPE_TOP &&
                        childFurnitureType === DIMENSION_TYPE_FULL &&
                        currentXMin >= childXMin && currentXMin <= childXMax || 

                        currentObjType === DIMENSION_TYPE_TOP &&
                        childFurnitureType === DIMENSION_TYPE_FULL &&
                        currentXMax >= childXMin && currentXMax <= childXMax ||

                        currentObjType === DIMENSION_TYPE_TOP &&
                        childFurnitureType === DIMENSION_TYPE_FULL &&
                        currentXMin <= childXMin && currentXMax >= childXMax ||

                        currentObjType === DIMENSION_TYPE_TOP && 
                        childFurnitureType === DIMENSION_TYPE_FULL &&
                        currentXMin >= childXMin && currentXMin <= childXMax ||

                        currentObjType === DIMENSION_TYPE_TOP && 
                        childFurnitureType === DIMENSION_TYPE_FULL &&
                        currentXMax >= childXMin && currentXMax <= childXMax ||
                        currentObjType === DIMENSION_TYPE_TOP && 
                        childFurnitureType === DIMENSION_TYPE_FULL &&
                        currentXMin <= childXMin && currentXMax >= childXMax
                    ) ||
                    (
                        childFurnitureType === DIMENSION_TYPE_TOP &&
                        currentObjType === DIMENSION_TYPE_FULL &&
                        currentXMin >= childXMin && currentXMin <= childXMax || 

                        childFurnitureType === DIMENSION_TYPE_TOP &&
                        currentObjType === DIMENSION_TYPE_FULL &&
                        currentXMax >= childXMin && currentXMax <= childXMax ||

                        childFurnitureType === DIMENSION_TYPE_TOP &&
                        currentObjType === DIMENSION_TYPE_FULL &&
                        currentXMin <= childXMin && currentXMax >= childXMax ||

                        childFurnitureType === DIMENSION_TYPE_TOP && 
                        currentObjType === DIMENSION_TYPE_FULL &&
                        currentXMin >= childXMin && currentXMin <= childXMax ||

                        childFurnitureType === DIMENSION_TYPE_TOP && 
                        currentObjType === DIMENSION_TYPE_FULL &&
                        currentXMax >= childXMin && currentXMax <= childXMax ||

                        childFurnitureType === DIMENSION_TYPE_TOP && 
                        currentObjType === DIMENSION_TYPE_FULL &&
                        currentXMin <= childXMin && currentXMax >= childXMax
                    )
                ) {     
                    childObj.userData.isFitting = false;  
                    childObj.traverse(child => {
                        if (child.isMesh) {
                            child.material.color.set(0xff0000);
                            child.material.transparent = true;
                            child.material.opacity = 0.5;
                        }
                    });
                    continue;
                }
            } else {
                const childZMin = childBoxMin.z - wallThickness;
                const childZMax = childBoxMax.z - wallThickness;

                if(
                    (
                        currentZMin >= childZMin && currentZMin <= childZMax || 
                        currentZMin >= childZMin && currentZMax <= childZMax ||
                        currentZMin <= childZMin && currentZMax >= childZMax
                    ) &&
                    (
                        currentYMin >= childYMin && currentYMin <= childYMax || 
                        currentYMax >= childYMin && currentYMax <= childYMax ||
                        currentYMin <= childYMin && currentYMax >= childYMax
                    ) ||
                    (
                        currentObjType === DIMENSION_TYPE_FULL &&
                        currentZMin >= childZMin && currentZMin <= childZMax || 
                        currentObjType === DIMENSION_TYPE_FULL && 
                        currentZMax >= childZMin && currentZMax <= childZMax ||
                        currentObjType === DIMENSION_TYPE_FULL && 
                        currentZMin <= childZMin && currentZMax >= childZMax
                    ) ||
                    (
                        currentObjType === DIMENSION_TYPE_TOP &&
                        childFurnitureType === DIMENSION_TYPE_FULL &&
                        currentZMin >= childZMin && currentZMin <= childZMax || 

                        currentObjType === DIMENSION_TYPE_TOP &&
                        childFurnitureType === DIMENSION_TYPE_FULL &&
                        currentZMax >= childZMin && currentZMax <= childZMax ||

                        currentObjType === DIMENSION_TYPE_TOP &&
                        childFurnitureType === DIMENSION_TYPE_FULL &&
                        currentZMin <= childZMin && currentZMax >= childZMax ||

                        currentObjType === DIMENSION_TYPE_TOP && 
                        childFurnitureType === DIMENSION_TYPE_FULL &&
                        currentZMin >= childZMin && currentZMin <= childZMax ||

                        currentObjType === DIMENSION_TYPE_TOP && 
                        childFurnitureType === DIMENSION_TYPE_FULL &&
                        currentZMax >= childZMin && currentZMax <= childZMax ||
                        currentObjType === DIMENSION_TYPE_TOP && 
                        childFurnitureType === DIMENSION_TYPE_FULL &&
                        currentZMin <= childZMin && currentZMax >= childZMax
                    ) ||
                    (
                        childFurnitureType === DIMENSION_TYPE_TOP &&
                        currentObjType === DIMENSION_TYPE_FULL &&
                        currentZMin >= childZMin && currentZMin <= childZMax || 

                        childFurnitureType === DIMENSION_TYPE_TOP &&
                        currentObjType === DIMENSION_TYPE_FULL &&
                        currentZMax >= childZMin && currentZMax <= childZMax ||

                        childFurnitureType === DIMENSION_TYPE_TOP &&
                        currentObjType === DIMENSION_TYPE_FULL &&
                        currentZMin <= childZMin && currentZMax >= childZMax ||

                        childFurnitureType === DIMENSION_TYPE_TOP && 
                        currentObjType === DIMENSION_TYPE_FULL &&
                        currentZMin >= childZMin && currentZMin <= childZMax ||

                        childFurnitureType === DIMENSION_TYPE_TOP && 
                        currentObjType === DIMENSION_TYPE_FULL &&
                        currentZMax >= childZMin && currentZMax <= childZMax ||

                        childFurnitureType === DIMENSION_TYPE_TOP && 
                        currentObjType === DIMENSION_TYPE_FULL &&
                        currentZMin <= childZMin && currentZMax >= childZMax
                    )
                ) {
                    childObj.userData.isFitting = false;  
                    childObj.traverse(child => {
                        if (child.isMesh) {
                            child.material.color.set(0xff0000);
                            child.material.transparent = true;
                            child.material.opacity = 0.5;
                        }
                    });
                    continue;
                }
            } 
        }

    }
}


async function getShortcodeContent(productId) {
    try {
        let formData = new FormData();
        formData.append("action", "render_config_furniture_content");
        formData.append("product_id", productId);
        // formData.append("image_block_height_px", getImageHeightValue());

        const response = await fetch(configData.ajaxurl, {
            method: "POST",
            body: formData,
        });

        const jsonData = await response.json();
        if(!jsonData.success || !jsonData.data?.content) return '';
        const data = jsonData.data;

        const {
            content,
            config_id,
            furniture_list,
            saved_settings,
            display_image_files,
            default_furniture_dimensions,
            corner_furniture_data,
            room_dimensions,
            textures,
            total
         } = data;

        return [
            content,
            config_id,
            furniture_list,
            saved_settings,
            display_image_files,
            default_furniture_dimensions,
            corner_furniture_data,
            room_dimensions,
            textures,
            total
        ];
    } catch(e) {
        return '';
    }
}

async function addFurnitureItem(
        customId, 
        furnitureId, 
        furnitureWidth,
        furnitureHeight,
        furnitureDepth,
        itemPosition,
        itemTotal
    ) {
    try {
        let formData = new FormData();
        formData.append("action", "add_furniture_item_to_config_settings");
        formData.append("custom_id", customId);
        formData.append("furniture_id", furnitureId);
        formData.append("furniture_width", furnitureWidth);
        formData.append("furniture_position", itemPosition);
        formData.append("furniture_height", furnitureHeight);
        formData.append("furniture_depth", furnitureDepth);
        formData.append("item_total", itemTotal);

        const response = await fetch(configData.ajaxurl, {
            method: "POST",
            body: formData,
        });

        const jsonData = await response.json();

        if(!jsonData.success || !jsonData.data?.my_item_html) return '';
        const data = jsonData.data;

        return data;
    } catch(e) {
        console.log(e)
        return '';
    }
}

async function loginAjax(submit) {
    try {
        const form = submit.closest(('form'));
        const username = form.querySelector('input[name="username"]').value;
        const password = form.querySelector('input[name="password"]').value;

        if(!username || !password) {
            return;
        }

        let formData = new FormData();
        formData.append("action", "ajax_login");
        formData.append("username", username);
        formData.append("password", password);
        formData.append("security", configData.login_nonce);

        const response = await fetch(configData.ajaxurl, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            return null;
        }

        const jsonData = await response.json();
        const messageDiv = form.querySelector('#login-message');

        if (!jsonData.success) {
            const errorMessage = jsonData.data?.message || "Login failed.";
   
            if (messageDiv) {
                messageDiv.innerHTML = `<span style="color:red;">${errorMessage}</span>`;
            }

            return null;
        }

        // success
        const data = jsonData.data;

        if (messageDiv) {
            messageDiv.innerHTML = `<span style="color:green;">${data.message}</span>`;
        }

        return data.user_id;

    } catch (e) {
        console.error("JS Exception:", e);
        return null;
    }
}

async function registerAjax(submit) {
    try {
        const form = submit.closest(('form'));
        const username = form.querySelector('input[name="username"]').value;
        const email = form.querySelector('input[name="email"]').value;
        const password = form.querySelector('input[name="password"]').value;

        if(!username || !password) {
            return;
        }
        let formData = new FormData();
        formData.append("action", "ajax_register");
        formData.append("username", username);
        formData.append("email", email);
        formData.append("password", password);
        formData.append("security", configData.login_nonce);

        const response = await fetch(configData.ajaxurl, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            return null;
        }

        const jsonData = await response.json();
        const messageDiv = form.querySelector('#register-message');

        if (!jsonData.success) {
            const errorMessage = jsonData.data?.message || "Registration failed.";
   
            if (messageDiv) {
                messageDiv.innerHTML = `<span style="color:red;">${errorMessage}</span>`;
            }

            return null;
        }

        // success
        const data = jsonData.data;

        if (messageDiv) {
            messageDiv.innerHTML = `<span style="color:green;">${data.message}</span>`;
        }

        return data.user_id;

    } catch (e) {
        console.error("JS Exception:", e);
         return null;
    }
}

async function saveUserSettingsAjax(
    container,
    buttonHtml,
    configId,
    productId,
    currentBaseId,
    currentFrameId,
    roomType,
    roomHeight,
    roomDepth,
    roomWidth,
    bottomHeight,
    bottomFullDepth,
    topHeight,
    topDepth,
    fullHeight,
    verticalSpace,
    furnitureList
) {
    const oldText = buttonHtml.innerHTML;
    buttonHtml.innerHTML = '<div class="loader"></div>';
    const messageDiv = container.querySelector('.top-bar .save-data-container #save-message');
    if (messageDiv) {
        messageDiv.innerHTML = '';
    }
console.log(furnitureList);
    try {
        let formData = new FormData();
        formData.append("action", "save_config_settings");
        formData.append("config_id", configId);
        formData.append("main_settings", JSON.stringify({
            product_id: productId,
            base_color_id: currentBaseId,
            frame_color_id: currentFrameId,
            room_type: roomType,
            room_height: roomHeight,
            room_width: roomWidth,
            room_depth: roomDepth,
            bottom_height: bottomHeight,
            bottom_full_depth: bottomFullDepth,
            top_height: topHeight,
            top_depth: topDepth,
            full_height: fullHeight,
            vertical_space: verticalSpace,
        }));
        formData.append("furniture_list", JSON.stringify(furnitureList));

        const response = await fetch(configData.ajaxurl, {
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

        for(let i = 0; i < furnitureList.length; i++) {
            const listItem = {...furnitureList[i]};
            listItem.old_item = true;
            furnitureList[i] = {...listItem};
        }

        return {
            config_id: data.config_id,
            furniture_list: furnitureList,
        };

    } catch (e) {
        buttonHtml.innerHTML = oldText;
        console.error("JS Exception:", e);
        return null;
    }
}

async function addToCartAjax(
    container, 
    buttonHtml, 
    productId, 
    configId, 
    userId, 
    imageCanvasData,
    currentBaseId,
    currentFrameId,
    roomType,
    roomHeight,
    roomDepth,
    roomWidth,
    bottomHeight,
    bottomFullDepth,
    topHeight,
    topDepth,
    fullHeight,
    verticalSpace,
    furnitureList
) {
    const oldText = buttonHtml.innerHTML;
    buttonHtml.innerHTML = '<div class="loader"></div>';

    const messageDiv = container.querySelector('.buy-container #add-to-cart-message');
    if (messageDiv) {
        messageDiv.innerHTML = '';
    }

    try {
        let formData = new FormData();
        formData.append("action", "custom_ajax_add_to_cart");
        formData.append("user_id", userId);
        formData.append("config_id", configId);
        formData.append("product_id", productId);
        formData.append("image_data", imageCanvasData);
        formData.append("main_settings", JSON.stringify({
            product_id: productId,
            base_color_id: currentBaseId,
            frame_color_id: currentFrameId,
            room_type: roomType,
            room_height: roomHeight,
            room_width: roomWidth,
            room_depth: roomDepth,
            bottom_height: bottomHeight,
            bottom_full_depth: bottomFullDepth,
            top_height: topHeight,
            top_depth: topDepth,
            full_height: fullHeight,
            vertical_space: verticalSpace,
        }));
        formData.append("furniture_list", JSON.stringify(furnitureList));
        
        const response = await fetch(configData.ajaxurl, {
            method: "POST",
            body: formData,
        });

        buttonHtml.innerHTML = oldText;

        if (!response.ok) {
            return null;
        }

        const jsonData = await response.json();

        if (!jsonData.success) {
            const errorMessage = jsonData.data?.message || "Add to cart failed.";
   
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

        return data;

    } catch (e) {
        console.error("JS Exception:", e);

        buttonHtml.innerHTML = oldText;

        setTimeout(() => {
            messageDiv.innerHTML = '';
        }, 1000);

        return null;
    }
}

function updatePriceHtml(container, newPrice) {
    const priceBlocks = container.querySelectorAll('.price .price-value');

    priceBlocks.forEach(block => {
        block.innerHTML = newPrice;
    });
}

function createLoginHtml() {
    const loginFormHtml  = `
            <div class="login-container">
                <form id="loginForm" action="" method="post">
                    <input type="text" name="username" placeholder="Username or Email" required>
                    <input type="password" name="password" placeholder="Password" required>
                    <button type="submit">Login</button>
                    <div id="login-message"></div>
                </form>
                <div class="bottom-container">
                    <button type="button" data-action_type="set-register-form">Register</button>
                </div>
            </div>
    `;

    return loginFormHtml;
}

function createRegisterHtml() {
    const registerFormHtml  = `
        <div class="register-container">
            <form id="registerForm" action="" method="post">
                <input type="text" name="username" placeholder="Username" required>
                <input type="email" name="email" placeholder="Email" required>
                <input type="password" name="password" placeholder="Password" required>
                <button type="submit">Register</button>
                <div id="register-message"></div>
            </form>
            <div class="bottom-container">
                <button type="button" data-action_type="set-login-form">Login</button>
            </div>
        </div>
    `;
    return registerFormHtml;
}

async function createImageCanvas() {

    let imageHtml = imageContainer.querySelector('.basic-settings-display-image');

    settingsImageHtml = imageHtml;

    try {
        const canvas = await html2canvas(imageHtml); 
        const imageData = canvas.toDataURL("image/png"); 

        const canvasImg = document.createElement("img");
        canvasImg.src = imageData;

        imageContainer.innerHTML = ""; 
        imageContainer.appendChild(canvasImg);

        return imageData;
    } catch (error) {
        console.error("Error:", error);
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

// function getImageHeightValue() {
//     const windowWidth = window.innerWidth;

//     if(windowWidth < 1201) {
//         return 300;
//     } else if (windowWidth < 1215) {
//         return 300;
//     } else {
//         return 400;
//     }
// }