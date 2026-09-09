import {
    THREE,
    OrbitControls,
    GLTFLoader,
    DragControls,
    BufferGeometryUtils,
} from './three-imports.js';

    
import { 
    state,
    roomState,
    ROOM_TYPE_SINGLE_WALL,
    FURNITURE_TYPE_WALL_TOP,
    ROOM_TYPE_WITH_CORNER,
    FURNITURE_TYPE_BOTTOM,
    FURNITURE_TYPE_BOTTOM_CORNER,
    FURNITURE_TYPE_FULL,
	THUMB_TYPE_SLOGAN,
    DIMENSION_TYPE_BOTTOM,
    DIMENSION_TYPE_TOP,
    FURNITURE_TYPE_TOP,
    DIMENSION_TYPE_TOP_CORNER,
    DIMENSION_TYPE_FULL,
    DIMENSION_TYPE_FULL_CORNER,
    SPACE_BOTTOM,
    FLOOR_THICKNESS,
    WALL_THICKNESS,
    LIGHT_STATE_DEFAULT,
    HARDCODED_COLOR_MESHES,
    BRAND_COLOR_MESHES,
    BASIC_DISPLAY_X_PADDING_PX,
    BOTTOM_DISPLAY_IMAGE,
    TOP_DISPLAY_IMAGE,
    FULL_DISPLAY_IMAGE,
    getTextureSrc,
    renderMeshList,
    colorToDefault,
    colorToRed,
    uniqLong,
    addBgImageToFront,
    updateBgPlane,
    setBgPlanesVisibleForWrapper,
    getFootprintSize,
    getIsRotatedItem,
    getRotatedSize,
    getFurnitureDimensionsFromMmtoPx,
    getCurrentModelAllProducts,
    calculateRotationInDegrees,
    getRoomDimensions,
    getContainerBaseScale,
    calculateTopSpaceIn3dModel,
    getTopFurnitureYPositionMm,
    getFreshWrapperBoundingBox,
} from "./shared-scripts.js";

import { 
    changeProductsPrices,
    changeSingleProductPrice,
} from './calculate-totals.js';

export let 
    isSummaryStep = false,
    modelSettings = {
        visibleDimensionsArrows: false,
        lightsOn: false,
    };

/********* model settings ********/
let container;
let zoomSlider;
let progressBar;
let allProgressButtons;
let oldCurrentProgressButton;
let currentStep;
let stepsContainer;
let myCabinetTab;
let currentTabBtnSelectorActive;
let currentContentsHtmlSelectorCurrent;
let myCabinetContents;
let totalContainers;
let roomBasicDisplayData = {
    htmlContainer: null,
    renderer: null,
    camera: null,
    scene: null,
    rootGroup: null,
    paddingXUnits: null,
    width: null, 
    models: {
        bottom: null,
        top: null,
        full: null,
    }
}
let ajaxUrl = '';
let assetsUrl = ''
let currencySymbol = 'eur';

export function initNewSharedScripts(rootContainer, ajaxUrlConst, assetsUrlConst) {

    container = rootContainer;
    ajaxUrl = ajaxUrlConst;
    assetsUrl = assetsUrlConst;

    state.model3dContainer = container.querySelector(
        '.model-display-container .room-model-container-inner'
    );

    roomBasicDisplayData.htmlContainer = container.querySelector('.progress-content .general-settings .display-container .general-settings-display-image .general-image-inner');

    progressBar = container.querySelector('.top-bar .config-progress-bar');
    allProgressButtons = progressBar?.querySelectorAll('button'); 
    oldCurrentProgressButton = progressBar?.querySelector(`button.current`);
    currentStep = parseInt(container.getAttribute('data-progress'));

    stepsContainer = container.querySelector('.steps-content');

    roomState.dynamicLists = container.querySelectorAll('.dynamic-list-inner');

    myCabinetTab = container.querySelector('.tabs button[data-type="my-cabinets"]');
    myCabinetContents = container.querySelectorAll('.my-cabinets-list');

    currentTabBtnSelectorActive = '.cabinet-settings .main-settings-sidebar .cabinets .tabs button.active, .cabinet-settings .cabinets-content .tabs button.active';
    currentContentsHtmlSelectorCurrent = '.cabinet-settings .main-settings-sidebar .cabinets .content .content-inner > .tab-content.current, .cabinet-settings .tabs-content .tab-content.current';

    totalContainers = container.querySelectorAll('.total-container .total-container-inner .number');
}

window.addEventListener('resize', handle3dResize);

/************ export functions **********/

export function initRoomModelSettings() {
    const btnLightbulb = container.querySelector('.model-settings-sidebar button[data-type="turnon-light"]');

    if(btnLightbulb) {
        if(modelSettings.lightsOn) {
            btnLightbulb.classList.add('active');
        }

        btnLightbulb.addEventListener('click', function(e) {
            e.preventDefault();

            modelSettings.lightsOn = !modelSettings.lightsOn;

            const currentRoomModel = roomState.modelsList[roomState.roomType];
            const { scene, renderer, dirLight } = currentRoomModel;

            if(modelSettings.lightsOn) {
                const { width, height, depth } = roomState.modelRoomDimensions;
                btnLightbulb.classList.add('active');
                renderLighting(scene, renderer, currentRoomModel.dirLight, width, height, depth);
            } else {
                btnLightbulb.classList.remove('active');
                removeLighting(scene, renderer, dirLight);
                removeShadowElements(renderer, dirLight);
            }
        });
    }


    const btnShowDimensions = container.querySelector('.model-settings-sidebar button[data-type="show-dimensions"]');

    btnShowDimensions.addEventListener('click', function(e) {
        e.preventDefault();

        modelSettings.visibleDimensionsArrows = !modelSettings.visibleDimensionsArrows;

        if(modelSettings.visibleDimensionsArrows) {
            btnShowDimensions.classList.add('active');
            addDimensionArrows();
        } else {
            btnShowDimensions.classList.remove('active');
            removeDimensionArrows();
        }
    });

    const btnResetView = container.querySelector('.model-settings-sidebar button[data-type="reset-view"]');
    
    btnResetView.addEventListener('click', function(e) {
        e.preventDefault();
        Object.values(roomState.modelsList).forEach(model => {
            if(model.controls) {
                smoothReset(model.controls);
            }
            
        });
    });

    function smoothReset(controls, duration = 600) {
        const camera = controls.object;

        const startPos = camera.position.clone();
        const startTarget = controls.target.clone();
        const startZoom = camera.zoom;

        const endPos = controls.position0.clone();
        const endTarget = controls.target0.clone();
        const endZoom = controls.zoom0 ?? camera.zoom;

        let startTime = null;

        function animate(time) {
            if (!startTime) startTime = time;

            const t = Math.min((time - startTime) / duration, 1);
            const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

            // interpolate position
            camera.position.lerpVectors(startPos, endPos, ease);

            // interpolate target
            controls.target.lerpVectors(startTarget, endTarget, ease);

            // interpolate zoom (important for orthographic / consistency)
            camera.zoom = startZoom + (endZoom - startZoom) * ease;
            camera.updateProjectionMatrix();

            controls.update();

            if (t < 1) {
                requestAnimationFrame(animate);
            }
        }

        requestAnimationFrame(animate);
    }
}

export function createZoomSystem(camera, controls) {
    zoomSlider = container.querySelector('.model-settings-sidebar .zoom-slider input[type="range"]');
    const btnZoomIn = container.querySelector('.model-settings-sidebar button[data-type="zoom-in"]');
    const btnZoomOut = container.querySelector('.model-settings-sidebar button[data-type="zoom-out"]');
    const STEP = 0.1;

    let isUpdatingFromCamera = false;

    // =========================================================
    // 1. CAMERA → UI (ONLY SOURCE OF TRUTH UPDATE)
    // =========================================================
    controls.addEventListener("change", () => {
        if (isUpdatingFromCamera) return;

        const distance = camera.position.distanceTo(controls.target);

        zoomSlider.value = distance.toFixed(2);
    });

    // =========================================================
    // 2. SLIDER → CAMERA
    // =========================================================
    zoomSlider.addEventListener("input", () => {
        const value = parseFloat(zoomSlider.value);

        isUpdatingFromCamera = true;

        setZoomForAll(value, camera, controls);

        isUpdatingFromCamera = false;
    });

    // =========================================================
    // 3. BUTTONS → CAMERA (DIRECT, NO SLIDER)
    // =========================================================
    btnZoomIn.addEventListener("click", (e) => {
        e.preventDefault();

        const distance = camera.position.distanceTo(controls.target);
        const newDistance = Math.max(
            controls.minDistance,
            distance * (1 - STEP)
        );

        zoomSlider.value = newDistance.toFixed(2);
        setZoomForAll(newDistance, camera, controls);
    });

    btnZoomOut.addEventListener("click", (e) => {
        e.preventDefault();

        const distance = camera.position.distanceTo(controls.target);
        const newDistance = Math.min(
            controls.maxDistance,
            distance * (1 + STEP)
        );

        zoomSlider.value = newDistance.toFixed(2);
        setZoomForAll(newDistance, camera, controls);
    });

    // =========================================================
    // 4. PUBLIC API (for cleanup)
    // =========================================================
    return {
        dispose() {
            zoomSlider.replaceWith(zoomSlider.cloneNode(true)); // kills listeners safely
        }
    };
}

export function updateZoomFromCamera(camera, controls) {
    const distance = camera.position.distanceTo(controls.target);

    // only update UI, never trigger logic
    syncZoomUI(distance)
}

function addDimensionArrows() {

    Object.entries(roomState.modelsList).forEach(([key, value]) => {
        const children = value.scene ? [...value.scene.children] : [];

        for(let i = 0; i < children.length; i++) {
            const childObj = children[i];
            const userData = childObj.userData;

            if(!userData.productId) {
                continue;
            }

            createFurnitureDimensionArrows(childObj, value.scene, value.box);
        }
    });
}

function removeDimensionArrows() {
    Object.entries(roomState.modelsList).forEach(([key, value]) => {
        const children = value.scene ? [...value.scene.children] : [];

        children.forEach(child => {
            if (child.userData && child.userData.dimensions) {
                // Remove each arrow/label from the scene
                child.userData.dimensions.forEach(obj => {
                    if (obj.geometry) obj.geometry.dispose();
                    if (obj.material) obj.material.dispose();
                    value.scene.remove(obj);
                });
                // Clear the reference
                child.userData.dimensions = [];
            }
        });
    });
}

export function initCabinetTabs(tabsSelector) {
    const tabs = container.querySelectorAll(tabsSelector);

    tabs.forEach(tab => {
        const type = tab.getAttribute('data-type');
        const contents = container.querySelectorAll(`.cabinet-settings .tab-content[data-type="${type}"]`);

        tab.addEventListener('click', function(e) {
            e.preventDefault();     
            changeCabinetsTab(tab, contents);
            editContainerRemove();
        });
    });
}

export function initCabinetTypes() {
    typesClickInit();
    typesGoBack();
    typesEditInit();

    function typesClickInit() {
        const typeButtons = container.querySelectorAll('.cabinet-settings .furniture-types-list .furniture-type > button');

        typeButtons.forEach(button => {
            const buttonParent = button.parentNode;

            button.addEventListener('click', function(e) {
                e.preventDefault();

                if(button.classList.contains('active')) return;

                const activeButton = container.querySelector('.cabinet-settings .furniture-types-list .furniture-type.active');

                if(activeButton) activeButton.classList.remove('active');

                buttonParent.classList.add('active');

            });
        });
    }

    function typesGoBack() {
        const goBackBtns = container.querySelectorAll('.furniture-type .furniture-type-list > button[data-type="go-back"]');

        goBackBtns.forEach(btn => {
            const parentNode = btn.closest('.furniture-type');

            btn.addEventListener('click', function(e) {
                e.preventDefault();
                if(parentNode.classList.contains('active')) {
                    parentNode.classList.remove('active')
                }
            });
        });
    }

}

export function initAddFurnitureMethod() {
    const addFurnitureButtons = container.querySelectorAll('.add-cabinet-item .item-actions-container button[data-action_type="add"]');
    addFurnitureButtons.forEach(furnitureButton => {
        const parent = furnitureButton.closest('.add-cabinet-item');

        const productId = parent.getAttribute('data-product_id');

        furnitureTypeAddInit(
            furnitureButton, 
            productId, 
        );
    });
}

export function loadMoreProducts(productsListPerPage, ajaxUrl) {
    const loadMoreButtons = container.querySelectorAll('.furniture-types-list .furniture-type-list .load-more-container button');

    loadMoreButtons.forEach(button => {
        const parent = button.closest('.furniture-type');
        const container = parent.querySelector('.furniture-type-list-inner');
        const typeSlug = parent.getAttribute('data-slug');
        let page = 1;

        button.addEventListener('click', async function(e) {
            e.preventDefault();
            if(stepsContainer) {
                stepsContainer.classList.add('loading');
            }
            page++;
            const { content, is_last_page } = await loadMoreProductsByType(typeSlug, page, productsListPerPage, ajaxUrl);

            container.innerHTML += content;

            if(is_last_page) {
                button.remove();
            }

            typesEditInit();
            if(stepsContainer) {
                stepsContainer.classList.remove('loading');
            }
        });
    });
}

export function getCornerDimensions() {
    const { bottom_height, top_height, full_height, space_bottom } = roomState.furnitureDimensions;
    const { width: roomWidth, height:  roomHeight, depth: roomDepth} = roomState.roomDimensions;
    const { width: modelRoomWidth, height:  modelRoomHeight, depth: modelRoomDepth} = roomState.modelRoomDimensions;

    const { 
        bottom: bottomCornerData, 
        top: topCornerData, 
        full: fullCornerData, 
    } = roomState.cornerFurnitureData;

    let { 
        width: cornerBottomWidth, 
        depth: cornerBottomDepth,
    } = bottomCornerData;
    let { 
        width: cornerTopWidth, 
        depth: cornerTopDepth,
    } = topCornerData;
    let { 
        width: cornerFullWidth, 
        depth: cornerFullDepth,
    } = fullCornerData;
    
    const bottomHeightWorld = (bottom_height / (roomHeight * 10)) * modelRoomHeight;
    const bottomWidthWorld = (cornerBottomWidth / (roomWidth * 10)) * modelRoomWidth;
    const bottomDepthWorld = (cornerBottomDepth / (roomDepth * 10)) * modelRoomDepth;
    const topHeightWorld = (top_height / (roomHeight * 10)) * modelRoomHeight;
    const topWidthWorld = (cornerTopWidth / (roomWidth * 10)) * modelRoomWidth;
    const topDepthWorld = (cornerTopDepth / (roomDepth * 10)) * modelRoomDepth;
    const fullHeightWorld = (full_height / (roomHeight * 10)) * modelRoomHeight;

    const fullWidthWorld = (cornerFullWidth / (roomWidth * 10)) * modelRoomWidth;
    const fullDepthWorld = (cornerFullDepth / (roomDepth * 10)) * modelRoomDepth;

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
        // bottomSpace: bottomSpaceWorld,
    };
}

/************ end export functions **********/

export function setZoomForAll(distance) {

    Object.values(roomState.modelsList).forEach(model => {

        if (!model.camera || !model.controls) return;

        const camera = model.camera;
        const controls = model.controls;

        // =====================================================
        // 🔥 clamp distance to valid range
        // =====================================================
        const clamped = THREE.MathUtils.clamp(
            distance,
            controls.minDistance,
            controls.maxDistance
        );

        // =====================================================
        // 🔥 compute direction ONCE from current camera state
        // (important: stable axis per model)
        // =====================================================
        const direction = new THREE.Vector3()
            .subVectors(camera.position, controls.target)
            .normalize();

        // =====================================================
        // 🔥 set new position in SAME direction but fixed distance
        // =====================================================
        camera.position.copy(
            controls.target.clone().add(
                direction.multiplyScalar(clamped)
            )
        );

        // =====================================================
        // 🔥 update controls AFTER camera change
        // =====================================================
        controls.update();
    });
}

export function progressInit() {
    const prevButton = container.querySelector('.actions-container .prev-step');
    const nextButton = container.querySelector('.actions-container .next-step');
    const maxSteps = container.querySelectorAll('.top-bar button').length;

    if(prevButton) {
        prevButton.addEventListener('click', function(e) {
            e.preventDefault();
            const prevStep = currentStep > 1 ? currentStep - 1 : currentStep;
            currentStep = prevStep;
            container.setAttribute('data-progress', prevStep);

            changeCurrentProgressButton(prevStep);

            if(currentStep + 1 === maxSteps) {
                isSummaryStep = true;
                removeAllFurnitureControls();
                removeAllFurnitureButtons();

                removeAllFurnitureControls();
                removeAllFurnitureButtons();
            } else {
                isSummaryStep = false;
            }
        });
    }

    if(nextButton) {
        nextButton.addEventListener('click', function(e) {
            e.preventDefault();
            const nextStep = currentStep < maxSteps ? currentStep + 1 : currentStep;
            currentStep = nextStep;
            container.setAttribute('data-progress', nextStep);

            changeCurrentProgressButton(nextStep);

            if(nextStep === maxSteps) {
                isSummaryStep = true;
                removeAllFurnitureControls();
                removeAllFurnitureButtons();

                removeAllFurnitureControls();
                removeAllFurnitureButtons();
            } else {
                isSummaryStep = false;
            }
        });
    }

    allProgressButtons.forEach(button => {
        const stepData = parseInt(button.getAttribute('data-step'));

        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            if(button.classList.contains('current')) return;

            currentStep = stepData;
            container.setAttribute('data-progress', stepData);
            changeCurrentProgressButton(stepData);

            if(currentStep + 1 === maxSteps) {
                isSummaryStep = true;
                removeAllFurnitureControls();
                removeAllFurnitureButtons();

                removeAllFurnitureControls();
                removeAllFurnitureButtons();
            } else {
                isSummaryStep = false;
            }
        });
    });
    
    function changeCurrentProgressButton(step) {
        const newButton = progressBar.querySelector(`button[data-step="${step}"]`);
        
        if(!newButton) return;

        newButton.classList.add('current');

        if(oldCurrentProgressButton) {
            oldCurrentProgressButton.classList.remove('current');
        }

        oldCurrentProgressButton = newButton;
    }
}

function furnitureTypeAddInit(
    addBtn, 
    productId,
    itemObj = null, 
    editContainer = null,
) {

    addBtn.addEventListener('click', async function() {
        let { myItemsList, summaryItemsList } = roomState;
        let foundItem = itemObj ?? getCurrentModelAllProducts().find(allProduct => allProduct.product_id == productId);
        
        const {
            furniture_type,
            min_width,
            min_height,
            min_depth,
            attachment_url,
            db_data,
        } = foundItem;
        const { width, height, depth, space_bottom, prices, has_brand_texture, object_src, attachment_type } = db_data;

        if(stepsContainer) {
            stepsContainer.classList.add('loading');
        }

        const customId = uniqLong();
        
        const itemTotal = changeSingleProductPrice(
            furniture_type,
            width, 
            min_width, 
            height,
            min_height,
            depth,
            min_depth,
            prices, 
            state.defaultTextures, 
            has_brand_texture,
            state.defaultComponents
        );

        changeTotalPrice(itemTotal);

        const {my_item_html, summary_item_html, new_object} = await addFurnitureItem(
            customId, 
            foundItem,
            state.defaultTextures,
            roomState.modelsList[roomState.roomType].dbChildren.length + 1
        );

        roomState.modelsList[roomState.roomType].dbChildren.push(new_object);

        const rotation = roomState.roomType === ROOM_TYPE_SINGLE_WALL ? null : 0 + parseFloat(Math.PI / 2);

        await addGLBModel(
            object_src,
            attachment_type, 
            attachment_url,
            furniture_type, 
            productId, 
            customId, 
            height,
            depth, 
            width, 
            space_bottom, 
            has_brand_texture,
            rotation,
        );

        if(my_item_html) {

            myItemsList.insertAdjacentHTML('beforeend', my_item_html);
            summaryItemsList.insertAdjacentHTML('beforeend', summary_item_html);
            
            changeCabinetsTab(myCabinetTab, myCabinetContents);

            if (typeof toggleAccordions === 'function') {
                toggleAccordions();
            }

            if(editContainer) {
                editContainer.classList.remove('active');
                editContainer.innerHTML = '';
            }

            const furnitureItem = myItemsList.querySelector(`.my-cabinet-item[data-custom_id="${customId}"]`);
            
            if(furnitureItem) {
                editItemButtonTrigger(new_object, customId); 
                removeItemButtonTrigger(furnitureItem, customId, furniture_type);
                duplicateFurnitureTrigger(furnitureItem, customId);
                initFurnitureRotationTrigger(furnitureItem, customId);
            }
        }

        if(stepsContainer) {
            stepsContainer.classList.remove('loading');
        }
    });
}

export function onClickModel(e, threeJSRendered, threeJSCamera) {

    removeAllFurnitureControls();
    removeAllFurnitureButtons();
    if(isSummaryStep) {
        return;
    }

    const modelObj = roomState.modelsList[roomState.roomType];

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const rect = threeJSRendered.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, threeJSCamera);

    const intersects = raycaster.intersectObjects(modelObj.scene.children, true);

    let buttonHitItem = intersects.find(hit => hit.object.parent.userData.customId);

    if(buttonHitItem) {
        const obj = buttonHitItem.object.parent;
        const userData = obj.userData;
        const customId = userData.customId;

        openEditModal(userData, customId, false);
        createFurnitureItemControls(obj, customId); 
    } else {
        editContainerRemove();
    }

    let buttonHit = intersects.find(hit => hit.object.userData.isUIButton);
    
    if (buttonHit) {
        const obj = buttonHit.object;
        const action = obj.userData.actionType;
        const customId = obj.userData.customId;

        if (action === "delete") {
            initFurnitureRemoveData(customId);
        } else if (action === "duplicate") {
            initFurnitureDuplicateData(customId);
        }
        return; 
    }

    if (intersects.length > 0) {
        let obj = intersects[0].object;
        const objParent = obj.parent;
        if(!objParent) {
            return;
        }
        
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

function createFurnitureItemControls(childMeshGroup, customId) {
    // Remove old buttons

    const modelObj = roomState.modelsList[roomState.roomType];
    const modelScene = modelObj.scene;

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
        img.src = `${assetsUrl}/images/room/${iconUrl}`;
        const texture = new THREE.CanvasTexture(canvas);
        img.onload = () => {
            const iconSize = canvasSize*0.5;
            ctx.drawImage(img, (canvasSize-iconSize)/2, (canvasSize-iconSize)/2, iconSize, iconSize);
            texture.needsUpdate = true;
        };

        const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
        const sprite = new THREE.Sprite(material);

        sprite.userData.isUIButton = true;
        // sprite.userData.initCustomId = customId;
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

function renderPriceBlock(regular, discount, currencySymbol) {
    let displayPrice = regular;
    let html = '';

    if(discount && discount > 0) {
        displayPrice = discount;
        html = `<span><span class="price-num">${discount.toFixed(2)}</span>${currencySymbol}</span>`;
        html += `<del><span class="price-num">${regular.toFixed(2)}</span>${currencySymbol}</del>`;
    } else {
        html = `<span><span class="price-num">${regular ? parseFloat(regular).toFixed(2) : 0.00}</span></span>${currencySymbol}`
    }

    return {
        html,
        displayPrice,
    };
}

export async function renderBasicImage3dContainer() {

    changeFurnitureDimensionsValue();

    if(!roomBasicDisplayData.htmlContainer) return;

    const basicDisplayContainer = roomBasicDisplayData.htmlContainer;

    const mmToUnits = 0.001; 
    const zoomOut = 1.45;

    const { largest_height } = roomState.furnitureDimensions;

    const threeJSRenderedBasicDisplay = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true, 
        preserveDrawingBuffer: true 
    });

    const basicDisplayScene = new THREE.Scene();
    const parentWidthPx = basicDisplayContainer.clientWidth;
    const parentWidthUnits = parentWidthPx * mmToUnits * zoomOut;
    const parentHeightPx = basicDisplayContainer.clientHeight;
    const objectHeightUnits = largest_height * mmToUnits * zoomOut;

    const basicDisplayXPaddingUnits = calcBasicDisplayXPaddingUnits(parentWidthPx, parentWidthUnits);
    const widthUnits = parentWidthUnits - basicDisplayXPaddingUnits / 2;

    /*******************/
    /**** set camera ******/
    const fovDeg = 45;
    const aspect = parentWidthPx / parentHeightPx;
    const near = 0.1;
    const far = 10000;

    const threeJSCameraBasicDisplay = new THREE.PerspectiveCamera(fovDeg, aspect, near, far);

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

    const rootGroupBasicDisplay = new THREE.Group();
    basicDisplayScene.add(rootGroupBasicDisplay);
    rootGroupBasicDisplay.rotation.y = THREE.MathUtils.degToRad(-30);

    /**** Load Models ****/
    const fullObj = await renderBaseImage(rootGroupBasicDisplay, `${assetsUrl}${FULL_DISPLAY_IMAGE}`, FURNITURE_TYPE_FULL, widthUnits, basicDisplayXPaddingUnits);
    const bottomObj = await renderBaseImage(rootGroupBasicDisplay, `${assetsUrl}${BOTTOM_DISPLAY_IMAGE}`, FURNITURE_TYPE_BOTTOM, widthUnits, basicDisplayXPaddingUnits);
    const topObj = await renderBaseImage(rootGroupBasicDisplay, `${assetsUrl}${TOP_DISPLAY_IMAGE}`, FURNITURE_TYPE_TOP, widthUnits, basicDisplayXPaddingUnits);

    function animate() {
        requestAnimationFrame(animate);

        threeJSRenderedBasicDisplay.render(basicDisplayScene, threeJSCameraBasicDisplay);
    }

    animate();

    function calcBasicDisplayXPaddingUnits(parentWidthPx, parentWithUnits) {
        const basicDisplayXPaddingUnitsPercent = BASIC_DISPLAY_X_PADDING_PX * 100 / parentWidthPx;
        const units = parentWithUnits * basicDisplayXPaddingUnitsPercent / 100;

        return units;
    }

    roomBasicDisplayData = {
        ...roomBasicDisplayData,
        renderer: threeJSRenderedBasicDisplay,
        camera: threeJSCameraBasicDisplay,
        scene: basicDisplayScene,
        rootGroup: rootGroupBasicDisplay,
        paddingXUnits: basicDisplayXPaddingUnits,
        width: widthUnits,  
        models: {
            bottom: bottomObj,
            top: topObj,
            full: fullObj,
        }
    }

}

function changeFurnitureDimensionsValue() {
    const dimensionsItemContainers = container.querySelectorAll('.general-settings .dimension-container');

    dimensionsItemContainers.forEach(dimensionsContainer => {
        const dimensionType = dimensionsContainer.getAttribute('data-dimension_type');
        const furnitureType = dimensionsContainer.getAttribute('data-furniture_type');
        const rangeInput = dimensionsContainer.querySelector('.slider-container input[type="range"]');
        const rangeNumInput = dimensionsContainer.querySelector('.input-container input[type="number"]');

        rangeInput.addEventListener('change', function(e) {
            const value = parseInt(e.target.value);
            rangeNumInput.value = value;

            if(furnitureType === '') {
                roomState.furnitureDimensions[FURNITURE_TYPE_TOP].space_bottom = value;
            } else {
                roomState.furnitureDimensions[furnitureType][dimensionType] = value;
            }
            
            changeBaseImageDimensions();
            changeModelChildrenDimensions(value, furnitureType, dimensionType);
        });

        rangeNumInput.addEventListener('change', function(e) {
            const value = parseInt(e.target.value);
            rangeInput.value = value;

            if(furnitureType === '') {
                roomState.furnitureDimensions[dimensionType].current = value;
            } else {
                roomState.furnitureDimensions[furnitureType][dimensionType] = value;
            }
            
            changeBaseImageDimensions();
            changeModelChildrenDimensions(value, furnitureType, dimensionType);
        });
    });

    function changeModelChildrenDimensions(value, currentType, dimensionType) {
        const modelObj = roomState.modelsList[roomState.roomType];
        const children = modelObj?.dbChildren ?? [];
        const allProducts = modelObj?.allProducts ?? [];
        const type = currentType === '' ? FURNITURE_TYPE_TOP : currentType
      
        for(let i = 0; i < children.length; i++) {
            const childObj = children[i];
            const furnitureType = childObj.furniture_type;
            
            if(
                type !== furnitureType || 
                currentType == '' && furnitureType !== FURNITURE_TYPE_TOP

            ) continue;

            const dbData = childObj.db_data;
            const customId = dbData.custom_id;

            const itemHtml = container.querySelector(`.my-cabinets-list .my-cabinet-item[data-custom_id="${customId}"]`);

            changeItemDimensionValues(childObj, itemHtml, false, dimensionType, value);
        }

        for(let i = 0; i < allProducts.length; i++) {
            const childObj = allProducts[i];
            const furnitureType = childObj.furniture_type;

            if(
                type !== furnitureType
            ) {
                continue;
            }

            const productId = childObj.product_id;

            const itemHtml = container.querySelector(`.furniture-types-list-container .add-cabinet-item[data-product_id="${productId}"]`);

            changeItemDimensionValues(childObj, itemHtml, true, dimensionType, value);
        }
    }

}

function renderBaseImage(rootGroupBasicDisplay, urlSrc, furnitureType, widthUnits, basicDisplayXPaddingUnits = 0) {
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
                        // node.frustumCulled = false;

                        /******* add texture ********/
                        if (!node.geometry.attributes.uv) {
                            generateSmartUVs(node.geometry);
                        }

                        const name = (node.name || "").toLowerCase();
                        const texture = getTextureSrc(furnitureType, name, state.textures3DSrc);

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
                    }
                });
                rootGroupBasicDisplay.add(childMeshGroup);

                // compute bounding box
                const childBox = new THREE.Box3().setFromObject(childMeshGroup);
                const childSize = new THREE.Vector3();
                childBox.getSize(childSize);

                childMeshGroup.userData.box = childBox.clone();
                childMeshGroup.userData.dimensions = [];
                childMeshGroup.userData.originalSize = childSize.clone();
                childMeshGroup.userData.furnitureType = furnitureType;

                sizeAndPlaceDisplayImage(childMeshGroup, furnitureType, widthUnits, basicDisplayXPaddingUnits);

                roomState.displayModelChildren.push(childMeshGroup);

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
    const { bottom, top, full } = roomState.furnitureDimensions;
    const { bottom: bottomObj, top: topObj, full: fullObj } = roomBasicDisplayData.models;

    const itemHeightBottomUnits = bottom.height * mmToUnits;
    const itemHeightTopUnits = top.height * mmToUnits;
    const itemHeightFullUnits = full.height * mmToUnits;
    const itemTopSpaceUnits = top.space_bottom * mmToUnits;

    const itemDepthBottomUnits = bottom.depth * mmToUnits;
    const itemDepthTopUnits = top.depth * mmToUnits;
    const itemDepthFullUnits = full.depth * mmToUnits;

    const bottomOriginalSizeY = bottomObj.userData.originalSize.y;
    const topOriginalSizeY = topObj.userData.originalSize.y;
    const fullOriginalSizeY = fullObj.userData.originalSize.y;

    const bottomOriginalSizeZ = bottomObj.userData.originalSize.z;
    const topOriginalSizeZ = topObj.userData.originalSize.z;
    const fullOriginalSizeZ = fullObj.userData.originalSize.z;

    const bottomScaleY = itemHeightBottomUnits / bottomOriginalSizeY;
    const topScaleY = itemHeightTopUnits / topOriginalSizeY;
    const fullScaleY = itemHeightFullUnits / fullOriginalSizeY;

    const bottomScaleZ = itemDepthBottomUnits / bottomOriginalSizeZ;
    const topScaleZ = itemDepthTopUnits / topOriginalSizeZ;
    const fullScaleZ = itemDepthFullUnits / fullOriginalSizeZ;

    const topPositionY = (bottomOriginalSizeY * bottomScaleY) + itemTopSpaceUnits;

    roomBasicDisplayData.models.bottom.scale.y = bottomScaleY;
    roomBasicDisplayData.models.bottom.scale.z = bottomScaleZ;

    roomBasicDisplayData.models.top.scale.y = topScaleY;
    roomBasicDisplayData.models.top.scale.z = topScaleZ;
    roomBasicDisplayData.models.top.position.y = topPositionY;

    roomBasicDisplayData.models.full.scale.y = fullScaleY;
    roomBasicDisplayData.models.full.scale.z = fullScaleZ;

    const itemsWidth = roomBasicDisplayData.width;
    const basicDisplayXPaddingUnits = roomBasicDisplayData.paddingXUnits;

    roomBasicDisplayData.rootGroup?.children.forEach(obj => {
        const userData = obj.userData;

        if(userData?.furnitureType) {
            sizeAndPlaceDisplayImage(obj, userData.furnitureType, itemsWidth, basicDisplayXPaddingUnits);
        }
        
    });

}

function sizeAndPlaceDisplayImage(object, furnitureType, itemWidth, basicDisplayXPaddingUnits) {
    const mmToUnits = 0.001; 
    const furnitureDimensions = roomState.furnitureDimensions;
    const itemDimensions = furnitureDimensions[furnitureType];

    const itemHeight = itemDimensions.height * mmToUnits;
    const itemDepth = itemDimensions.depth * mmToUnits;

    const childSize = object.userData.originalSize;
    const scaleX = itemWidth / childSize.x * 1.3;
    const scaleY = itemHeight / childSize.y * 1.3;
    const scaleZ = itemDepth / childSize.z * 1.3;
    object.scale.set(scaleX, scaleY, scaleZ);

    const visualWidth = childSize.x * scaleX;

    // recompute scaled size
    const scaledBox = new THREE.Box3().setFromObject(object);
    const scaledSize = new THREE.Vector3();
    scaledBox.getSize(scaledSize);

    object.userData.scaledSize = scaledSize.clone();

    // position object: bottom aligned, optional x offset
    const leftAdditional =
        furnitureType === FURNITURE_TYPE_FULL ? 0 : visualWidth;

    const bottomYUnits =
        furnitureType !== DIMENSION_TYPE_TOP
            ? 0
            : getTopFurnitureYPositionMm() * 10 * mmToUnits;

    const posX = basicDisplayXPaddingUnits + leftAdditional - itemWidth / 2; // adjust as needed

    const posY = bottomYUnits + 0.18; // bottom aligned
    const posZ = 0; // adjust depth if needed

    object.position.set(posX, posY, posZ);
}

export function init3dModel(modelObj, model3dContainer, roomType, onPageLoad) {
    model3dContainer.innerHTML += `
        <div class="config-loader-container">
            <span class="loader"></span>
        </div>
    `;

    const manager = new THREE.LoadingManager();

    manager.onLoad = () => {
        const htmlLoader = model3dContainer.querySelector('.config-loader-container');
        if (htmlLoader) htmlLoader.remove();
    };

    manager.onError = (url) => {
        console.error('Error loading:', url);
    };

    const containerWidth = model3dContainer.clientWidth;
    const containerHeight = model3dContainer.clientHeight;

    let wallTextureSrc = assetsUrl + '/images/room/brick-wall.jpg';
    let floorTextureSrc = assetsUrl + '/images/room/floor-with-wall.png';

    const toDataUrl = (b64) => {
        if (!b64) return null;
        if (b64.startsWith('data:')) return b64;
        const mime = b64.startsWith('/9j/') ? 'image/jpeg' : 'image/png';
        return `data:${mime};base64,${b64}`;
    };

    if (typeof furnitureAnalyzeData !== 'undefined' && furnitureAnalyzeData) {
        if (furnitureAnalyzeData['wall']?.base64) {
            wallTextureSrc = toDataUrl(furnitureAnalyzeData['wall'].base64);
        } else if(furnitureAnalyzeData['wall']?.url) {
            wallTextureSrc = furnitureAnalyzeData['wall']?.url;
        }

        if (furnitureAnalyzeData['floor']?.base64) {
            floorTextureSrc = toDataUrl(furnitureAnalyzeData['floor'].base64);
        } else if(furnitureAnalyzeData['floor']?.url) {
            wallTextureSrc = furnitureAnalyzeData['floor']?.url;
        }
    }

    clearModelScene(modelObj, onPageLoad);

    const modelScene = new THREE.Scene();

    const textureLoader = new THREE.TextureLoader(manager);
    const gltfLoader = new GLTFLoader(manager);

    const baseScale = getContainerBaseScale(model3dContainer);
    roomState.baseScale = baseScale;

    const {
        heightPx,
        widthPx,
        depthPx,
        scaleX,
        scaleY,
        scaleZ
    } = getRoomDimensions();

    const modelRoomWidth = widthPx;
    const modelRoomHeight = heightPx;
    const modelRoomDepth = depthPx;

    roomState.modelRoomDimensions = {
        width: widthPx,
        height: heightPx,
        depth: depthPx,
    };

    roomState.modelRoomScale = {
        x: scaleX,
        y: scaleY,
        z: scaleZ,
    };

    /******** CAMERA ********/
    const fov = 45;
    const aspect = containerWidth / containerHeight;

    const camera = new THREE.PerspectiveCamera(fov, aspect, 0.5, 1000);

    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true
    });

    renderer.setSize(containerWidth, containerHeight);

    model3dContainer.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);

    modelObj.zoomSystem = createZoomSystem(camera, controls);

    /******** LIGHT STATE ********/
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = LIGHT_STATE_DEFAULT.exposure;

    const baseLights = new THREE.Group();
    baseLights.name = 'base-lights';

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, LIGHT_STATE_DEFAULT.hemi);
    const dirLight = new THREE.DirectionalLight(0xffffff, LIGHT_STATE_DEFAULT.dir);
    const ambientLight = new THREE.AmbientLight(0xffffff, LIGHT_STATE_DEFAULT.ambient);

    dirLight.position.set(100, 200, 100);

    baseLights.add(hemiLight);
    baseLights.add(dirLight);
    modelObj.dirLight = dirLight;
    baseLights.add(ambientLight);

    modelScene.add(baseLights);

    if(modelSettings.lightsOn) {
        renderLighting(modelScene, renderer, dirLight, modelRoomWidth, modelRoomHeight, modelRoomDepth);
    }

    /******** ROOM GROUP ********/
    const room3DGroup = new THREE.Group();

    // =========================================================
    // FIX #1: FORCE ROOM CENTER = (0,0,0)
    // =========================================================
    const halfW = modelRoomWidth / 2;
    const halfD = modelRoomDepth / 2;
    const wallHeight = modelRoomHeight + FLOOR_THICKNESS;
    const wallDepth = modelRoomDepth + WALL_THICKNESS;


    /******** LOAD FLOOR TEXTURE PROPERLY ********/
    textureLoader.load(floorTextureSrc, (floorTexture) => {
        floorTexture.colorSpace = THREE.SRGBColorSpace;
        applyFloorTexture(floorTexture, room3DGroup, modelRoomWidth, modelRoomDepth);
    });

    textureLoader.load(wallTextureSrc, (leftWallTexture) => {
        leftWallTexture.colorSpace = THREE.SRGBColorSpace;
        applyLeftWallTexture(leftWallTexture, room3DGroup, modelRoomWidth, modelRoomHeight, modelRoomDepth);
    });

    function applyFloorTexture(texture, room3DGroup = null, modelRoomWidth = null, modelRoomDepth = null) {
        if(!room3DGroup) {
            const currentObj = roomState.modelsList[roomState.roomType];

            room3DGroup = currentObj.room3DGroup;

            const modelRoomDimensions = roomState.modelRoomDimensions;

            modelRoomWidth = modelRoomDimensions.width;
            modelRoomDepth = modelRoomDimensions.depth;
        }

        const img = texture.image;

        if (!img || !img.width || !img.height) {
            console.warn("Texture not loaded yet");
            return;
        }

        const roomW = modelRoomWidth;
        const roomD = modelRoomDepth;

        const imgAspect = img.width / img.height;
        const roomAspect = roomW / roomD;

        // ---------------------------
        // BASE FLOOR (real geometry)
        // ---------------------------
        const floorTopMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color("#C8C2C6"),
            roughness: 0.6,
        });
        const base = new THREE.Mesh(
            new THREE.BoxGeometry(roomW, FLOOR_THICKNESS, roomD),
            [
                exteriorMat, // +x side
                exteriorMat, // -x side
                floorTopMat, // +y top (inside, under the floor plane)
                exteriorMat, // -y bottom (external)
                exteriorMat, // +z side
                exteriorMat, // -z side
            ]
        );

        base.position.set(0, -FLOOR_THICKNESS / 2, 0);

        /******* for product shadow *****/
        base.castShadow = false;
        base.receiveShadow = true;
        /******* end for product shadow *****/

        base.name = "floor-base";
        room3DGroup.add(base);

        // ---------------------------
        // IMAGE FLOOR (NO STRETCH)
        // ---------------------------
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;

        let repeatX = 1;
        let repeatY = 1;

        // COVER via UV (no distortion)
        if (imgAspect > roomAspect) {
            repeatX = roomAspect / imgAspect;
        } else {
            repeatY = imgAspect / roomAspect;
        }

        texture.repeat.set(repeatX, repeatY);

        // bottom-right
        texture.offset.set(1 - repeatX, 0);

        texture.needsUpdate = true;

        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(roomW, roomD),
            new THREE.MeshStandardMaterial({
                map: texture,
                roughness: 0.5,
                metalness: 0
            })
        );

        floor.rotation.x = -Math.PI / 2;
        floor.position.set(0, 0.001, 0); 

        /******* for product shadow *****/
        floor.castShadow = false;
        floor.receiveShadow = true; 
        /******* end for product shadow *****/

        floor.name = "floor-mesh";
        floor.userData.imgAspect = imgAspect;
        room3DGroup.add(floor);

        /********* */
        fitCameraToBox({box: fitBox, camera, controls, fov});
    }

    function applyLeftWallTexture(texture, room3DGroup = null, modelRoomWidth = null, modelRoomHeight = null, modelRoomDepth = null) {

        if(roomType !== ROOM_TYPE_WITH_CORNER) return;
        if(!room3DGroup) {
            const currentObj = roomState.modelsList[roomState.roomType];

            room3DGroup = currentObj.room3DGroup;

            const modelRoomDimensions = roomState.modelRoomDimensions;

            modelRoomWidth = modelRoomDimensions.width;
            modelRoomHeight = modelRoomDimensions.height;
            modelRoomDepth = modelRoomDimensions.depth;
        }

        const img = texture.image;

        if (!img || !img.width || !img.height) {
            console.warn("Texture not loaded yet");
            return;
        }

        const roomW = modelRoomWidth;
        const roomH = modelRoomHeight;
        const roomD = modelRoomDepth;

        const imgAspect = img.width / img.height;
        const roomAspect = roomD / roomH;

        const leftWallGeometry = new THREE.BoxGeometry(
            WALL_THICKNESS,
            wallHeight,
            wallDepth
        );

        const leftWallInnerMat = new THREE.MeshStandardMaterial({
            map: texture,
            color: 0xffffff,
            roughness: 0.5,
            metalness: 0,
        });

        const leftWallBase = new THREE.Mesh(
            leftWallGeometry,
            [
                leftWallInnerMat, // +x — inner face (toward room)
                exteriorMat,      // -x — outer face
                exteriorMat,      // +y — top
                exteriorMat,      // -y — bottom
                exteriorMat,      // +z — front edge
                exteriorMat,      // -z — back edge
            ]
        );

        leftWallBase.position.set(
            -roomW / 2 - WALL_THICKNESS / 2, 
            wallHeight / 2 - FLOOR_THICKNESS, 
            -WALL_THICKNESS / 2
        );

        leftWallBase.name = "left-wall-base";
        room3DGroup.add(leftWallBase);

        // ---------------------------
        // IMAGE FLOOR (NO STRETCH)
        // ---------------------------
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;

        const repeatY = 1;
        const repeatX = imgAspect / roomAspect;

        texture.repeat.set(repeatX, repeatY);

        // bottom-right
        texture.offset.set(0, 0);
    	// texture.offset.set(1 - repeatX, 0);

        texture.needsUpdate = true;
    
     	const imageH = roomH;
        const imageW = Math.min(imageH * imgAspect, roomD);

        const leftWall = new THREE.Mesh(
            new THREE.PlaneGeometry(imageW, imageH),
            new THREE.MeshStandardMaterial({
                map: texture,
                roughness: 0.5,
                metalness: 0
            })
        );

        leftWall.rotation.y = Math.PI / 2;
        leftWall.position.set(
            -roomW / 2 + 0.001,  // push to left side
            roomH / 2,           // center vertically
        	// 0,
            // roomD / 2 - imageW / 2 // centered in depth
            -roomD / 2 + imageW / 2
        );

        /******* for product shadow *****/
        leftWall.castShadow = false;
        leftWall.receiveShadow = true;
        /******* end for product shadow *****/

        leftWall.name = "left-wall-mesh";
        leftWall.userData.imgAspect = imgAspect;
        room3DGroup.add(leftWall);

        fitCameraToBox({box: fitBox, camera, controls, fov});
    }

    /******** WALL TEXTURE ********/
    const wallTexture = textureLoader.load(wallTextureSrc);
    wallTexture.colorSpace = THREE.SRGBColorSpace;

    const wallMaterial = new THREE.MeshStandardMaterial({
        map: wallTexture,
        color: 0xffffff,
        metalness: 0,
        roughness: 1,
    });

    const exteriorMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#C8C2C6'),
        roughness: 0.9,
        metalness: 0,
    });

    // Back wall: inner face is +z (index 4), outer face is -z (index 5)
    const rightWallGeometry = new THREE.BoxGeometry(
        modelRoomWidth,
        wallHeight,
        WALL_THICKNESS
    );

    const rightWall = new THREE.Mesh(rightWallGeometry, [
        exteriorMat,  // +x — right edge
        exteriorMat,  // -x — left edge
        exteriorMat,  // +y — top
        exteriorMat,  // -y — bottom
        wallMaterial, // +z — inner face (toward room)
        exteriorMat,  // -z — outer face
    ]);

    rightWall.position.set(
        0,
        wallHeight / 2 - FLOOR_THICKNESS,
        -modelRoomDepth / 2 - WALL_THICKNESS / 2
    );

    rightWall.castShadow = false;
    rightWall.receiveShadow = true;
    rightWall.name = "right-wall";
    room3DGroup.add(rightWall);

    let leftSideWallMat = null;
    let rightSideWallMat = null;

    if (roomType === ROOM_TYPE_SINGLE_WALL) {
        const sideWallGeometry = new THREE.BoxGeometry(WALL_THICKNESS, wallHeight, wallDepth);

        // Single material per wall so the whole mesh fades together.
        // depthWrite=false is required for correct transparency in Three.js.
        leftSideWallMat = wallMaterial.clone();
        leftSideWallMat.transparent = true;
        leftSideWallMat.depthWrite = false;

        const leftSideWall = new THREE.Mesh(sideWallGeometry, leftSideWallMat);
        leftSideWall.position.set(
            -modelRoomWidth / 2 - WALL_THICKNESS / 2,
            wallHeight / 2 - FLOOR_THICKNESS,
            -WALL_THICKNESS / 2
        );
        leftSideWall.name = 'left-side-wall';
        room3DGroup.add(leftSideWall);

        rightSideWallMat = wallMaterial.clone();
        rightSideWallMat.transparent = true;
        rightSideWallMat.depthWrite = false;

        const rightSideWall = new THREE.Mesh(sideWallGeometry, rightSideWallMat);
        rightSideWall.position.set(
            modelRoomWidth / 2 + WALL_THICKNESS / 2,
            wallHeight / 2 - FLOOR_THICKNESS,
            -WALL_THICKNESS / 2
        );
        rightSideWall.name = 'right-side-wall';
        room3DGroup.add(rightSideWall);
    }

    modelScene.add(room3DGroup);

    const box = new THREE.Box3().setFromObject(room3DGroup);
    const fitBox = new THREE.Box3(
        new THREE.Vector3(-modelRoomWidth / 2, -FLOOR_THICKNESS, -modelRoomDepth / 2),
        new THREE.Vector3(modelRoomWidth / 2, modelRoomHeight, modelRoomDepth / 2)
    );

    /*********** Render children ************/
    roomState.modelsList[roomType].dbChildren.forEach((child) => {
        const dbData = child.db_data;
        const childId = child.id;
        const childProductId = child.product_id;
        const childCustomId = dbData.custom_id;
        const childSrc = dbData.object_src;
        const childThumbType = dbData.attachment_type;
        const childAttachmentUrl = child.attachment_url;
        const childType = child.furniture_type;
        const hasBrandTexture = dbData.has_brand_texture;
        const childWidth = dbData.width;
        const childHeight = dbData.height;
        const childDepth = dbData.depth;
        const childSpaceBottom = dbData.space_bottom;
        const childMinWidth = child.min_width;
        const parsedPositionMm = JSON.parse(dbData.furniture_position_mm || '{}');
        const childPositionMm = Object.keys(parsedPositionMm).length > 0 ? parsedPositionMm : null;

        const childRotation = dbData.rotation;
        const childIsFitting = Boolean(parseInt(dbData.is_fitting));
        const childPrices = dbData.prices;
    
        addExistingGLBModel(
            modelScene, 
            box,
            roomType, 
            childId, 
            childSrc, 
            childThumbType,
            childAttachmentUrl,
            childType, 
            childProductId, 
            childCustomId, 
            childWidth, 
            childHeight, 
            childDepth, 
            childSpaceBottom,
            childPositionMm, 
            childRotation,
            childIsFitting,
            hasBrandTexture,
            gltfLoader 
        );

        productActionsInit(
            childCustomId,
            childProductId,
            childType,
            childMinWidth,
            childPrices
        );
    });

     /********drag controls**********/
    const dragControls = new DragControls(
        modelObj.draggableObjects,
        camera,
        renderer.domElement
    );

    dragControls.transformGroup = true;

    dragControlsMethod(dragControls, modelScene, box, controls, roomType);

    /******** ANIMATION ********/
    function animate() {
        if (modelObj._destroyed) return;

        modelObj.animationId = requestAnimationFrame(animate);

        controls.update();

        if (leftSideWallMat || rightSideWallMat) {
            const dx = camera.position.x - controls.target.x;
            const dz = camera.position.z - controls.target.z;
            // angle: 0=directly in front, +PI/2=camera to right, -PI/2=camera to left
            const angle = Math.atan2(dx, dz);

            const fadeStart = Math.PI / 6;  // 30° — begin fading
            const fadeEnd   = Math.PI / 3;  // 60° — fully transparent

            if (leftSideWallMat) {
                const a = Math.max(0, -angle); // grows when camera swings left
                leftSideWallMat.opacity = 1 - THREE.MathUtils.clamp(
                    (a - fadeStart) / (fadeEnd - fadeStart), 0, 1
                );
            }
            if (rightSideWallMat) {
                const a = Math.max(0, angle); // grows when camera swings right
                rightSideWallMat.opacity = 1 - THREE.MathUtils.clamp(
                    (a - fadeStart) / (fadeEnd - fadeStart), 0, 1
                );
            }
        }

            renderer.render(modelScene, camera);
        }

    renderer.domElement.addEventListener('wheel', (e) => {
        e.preventDefault();
        e.stopPropagation();
    }, { passive: false });

    animate();

    return {
        scene: modelScene,
        box,
        fitBox,
        camera,
        renderer,
        controls,
        dragControls,
        room3DGroup
    };
}

function handle3dResize() {

    const models = roomState.modelsList;

    Object.values(models).forEach(model => {
        if (!model?.camera || !model?.renderer || !model?.controls || !model?.htmlContainer || !model?.fitBox) {
            return;
        }

        const camera = model.camera;
        const container = model.htmlContainer;
        const width = container.clientWidth;
        const height = container.clientHeight;

        if (!width || !height) return;

        roomState.baseScale = getContainerBaseScale(container);

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        model.renderer.setSize(width, height);

        fitCameraToBox({
            box: model.fitBox,
            camera,
            controls: model.controls
        });

    });
}

export function updateRoomSize(modelObj) {
    const model3dContainer = modelObj.htmlContainer;
    const room3DGroup = modelObj.room3DGroup;
    const { scene, renderer, dirLight, box } = modelObj;

    const {
        heightPx,
        depthPx,
        widthPx,
    } = getRoomDimensions();

    roomState.modelRoomDimensions = {
        width: widthPx,
        height: heightPx,
        depth: depthPx,
    };

    
    if(modelSettings.lightsOn) {
        renderLighting(scene, renderer, dirLight, modelObj.dirLight, widthPx, heightPx, depthPx);
    }

    const wallHeight = heightPx + FLOOR_THICKNESS
    const wallDepth = depthPx + WALL_THICKNESS;

    const halfD = depthPx / 2 + WALL_THICKNESS;

    // -------------------------
    // FLOOR
    // -------------------------
    const floorMesh = room3DGroup.getObjectByName("floor-mesh");
    const floorBase = room3DGroup.getObjectByName("floor-base");

    if(floorMesh && floorBase) {
        /**** bg plane ***/
        const roomAspect = widthPx / depthPx;
        const imgAspect = floorMesh.userData.imgAspect;

        let repeatX = 1;
        let repeatY = 1;

        if (imgAspect > roomAspect) {
            repeatX = roomAspect / imgAspect;
        } else {
            repeatY = imgAspect / roomAspect;
        }

        const texture = floorMesh.material.map;

        if (texture) {

            // FIX #3: prevent texture drift accumulation
            texture.rotation = 0;

            texture.repeat.set(repeatX, repeatY);

            // IMPORTANT FIX: DO NOT USE OFFSET HERE
            texture.offset.set(1 - repeatX, 0);

            texture.needsUpdate = true;
        }

        floorMesh.geometry.dispose();
        floorMesh.geometry = new THREE.PlaneGeometry(widthPx, depthPx);

        floorMesh.position.set(0, 0.001, 0);


        /**** bg base floor with thickness ***/
        floorBase.geometry.dispose();
        floorBase.geometry =
            new THREE.BoxGeometry(widthPx, FLOOR_THICKNESS, depthPx);

        floorBase.position.set(0, -FLOOR_THICKNESS / 2, 0);
        floorBase.updateMatrix();
        floorBase.updateMatrixWorld(true);
    }

    // -------------------------
    // LEFT WALL
    // -------------------------

    if (modelObj.roomType === ROOM_TYPE_WITH_CORNER) {
        const leftWallMesh = room3DGroup.getObjectByName("left-wall-mesh");
        const leftWallBase = room3DGroup.getObjectByName("left-wall-base");

        if(leftWallMesh && leftWallBase) {
            /**** bg plane ***/
            const roomAspect = depthPx / heightPx;
            const imgAspect = leftWallMesh.userData.imgAspect;

            const repeatY = 1;
            const repeatX = imgAspect / roomAspect;

            const texture = leftWallMesh.material.map;

            if (texture) {

                texture.rotation = 0;

                texture.repeat.set(repeatX, repeatY);

                texture.offset.set(0, 0);

                texture.needsUpdate = true;
            }

            leftWallMesh.geometry.dispose();

            const imageH = heightPx;
            const imageW = Math.min(imageH * imgAspect, depthPx);

            leftWallMesh.geometry = new THREE.PlaneGeometry(imageW, imageH);

            leftWallMesh.position.set(
                -widthPx / 2 + 0.001,  // push to left side
                heightPx / 2,           // center vertically
                depthPx / 2 - imageW / 2 
            );

            /**** bg base floor with thickness ***/
            leftWallBase.geometry.dispose();
            leftWallBase.geometry =
                new THREE.BoxGeometry(
                    WALL_THICKNESS,
                    wallHeight,
                    wallDepth
                );

            leftWallBase.position.set(
                -widthPx / 2 - WALL_THICKNESS / 2, 
                wallHeight / 2 - FLOOR_THICKNESS, 
                -WALL_THICKNESS / 2
            );
            leftWallBase.updateMatrix();
            leftWallBase.updateMatrixWorld(true);

        }
    }

    // -------------------------
    // BACK WALL
    // -------------------------
    const rightWallMesh = room3DGroup.getObjectByName("right-wall");

    if(rightWallMesh) {

        rightWallMesh.geometry.dispose();
        rightWallMesh.geometry =
            new THREE.BoxGeometry(widthPx, wallHeight, WALL_THICKNESS);

        rightWallMesh.position.set(
            0,
            wallHeight / 2 - FLOOR_THICKNESS,
            -halfD + WALL_THICKNESS / 2
        );
    }

    // -------------------------
    // SIDE WALLS (SINGLE_WALL)
    // -------------------------
    if (modelObj.roomType === ROOM_TYPE_SINGLE_WALL) {
        const leftSideWall  = room3DGroup.getObjectByName("left-side-wall");
        const rightSideWall = room3DGroup.getObjectByName("right-side-wall");

        if (leftSideWall) {
            leftSideWall.geometry.dispose();
            leftSideWall.geometry = new THREE.BoxGeometry(WALL_THICKNESS, wallHeight, wallDepth);
            leftSideWall.position.set(
                -widthPx / 2 - WALL_THICKNESS / 2,
                wallHeight / 2 - FLOOR_THICKNESS,
                -WALL_THICKNESS / 2
            );
            leftSideWall.updateMatrix();
            leftSideWall.updateMatrixWorld(true);
        }

        if (rightSideWall) {
            rightSideWall.geometry.dispose();
            rightSideWall.geometry = new THREE.BoxGeometry(WALL_THICKNESS, wallHeight, wallDepth);
            rightSideWall.position.set(
                widthPx / 2 + WALL_THICKNESS / 2,
                wallHeight / 2 - FLOOR_THICKNESS,
                -WALL_THICKNESS / 2
            );
            rightSideWall.updateMatrix();
            rightSideWall.updateMatrixWorld(true);
        }
    }

    // -------------------------
    // UPDATE BOUNDING BOX
    // -------------------------
    box.setFromObject(room3DGroup);

    scene.children.forEach(child => {
        const userData = child.userData;

        if (userData.productId) {
            const furnitureType = userData.furnitureType;
            const rotation = userData.rotation ?? child.rotation.y;

            const { modelWidth, modelHeight, modelDepth } =
            getFurnitureDimensionsFromMmtoPx(
                userData.widthMm,
                userData.heightMm,
                userData.depthMm
            );

            const spaceBottomPx = calculateTopSpaceIn3dModel(furnitureType, userData.spaceMm, box);

            const placeResult = placeFurnitureInRoom(
                furnitureType,
                child,
                modelWidth,
                modelHeight,
                modelDepth,
                spaceBottomPx,
                userData.positionMm,
                null,
                rotation
            );

            child.userData.savedPosition = child.position.clone();
            child.userData.scaledSize = placeResult.scaledChildSize.clone();

            getFreshWrapperBoundingBox(child);

            updateBgPlane(child);
        }
    });
}


/******** CAMERA FIT ********/
export function fitCameraToBox({
    box,
    camera,
    controls,
    fov = 45,
    distanceMultiplier = 1.2,
    yaw = Math.PI / 4,
    pitch = THREE.MathUtils.degToRad(35),
    updateZoomSettings = true
}) {
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();

    box.getSize(size);
    box.getCenter(center);

    const maxDim = Math.max(size.x, size.y, size.z);
    const fovRad = THREE.MathUtils.degToRad(fov);

    let distance = maxDim / (2 * Math.tan(fovRad / 2));
    distance *= distanceMultiplier;

    camera.position.set(
        center.x + distance * Math.sin(yaw) * Math.cos(pitch),
        center.y + distance * Math.sin(pitch),
        center.z + distance * Math.cos(yaw) * Math.cos(pitch)
    );

    camera.lookAt(center);

    controls.target.copy(center);
    controls.update();

    camera.near = Math.max(0.1, distance / 100);
    camera.far = distance * 10;
    camera.updateProjectionMatrix();

    controls.maxDistance = maxDim * 3;
    controls.minDistance = maxDim * 0.5;

    if (updateZoomSettings) {
        setZoomSettingsValues(camera, controls);
    }

    controls.saveState();
}

function addExistingGLBModel(
    modelScene, 
    roomModelBox,
    modelRoomType, 
    id, 
    urlSrc, 
    thumbType,
    attachmentUrl, 
    furnitureType, 
    productId, 
    customId, 
    itemWidth, 
    itemHeight, 
    itemDepth, 
    itemSpaceBottom,
    childPositionMm, 
    childRotation,
    isFitting, 
    hasBrandTexture,
    gltfLoader
) {
    let brandMeshName = null;
    const harcodedColorObj = HARDCODED_COLOR_MESHES.find(mesh => mesh.productId === parseInt(productId));

    if(!harcodedColorObj) {
        const meshObj = BRAND_COLOR_MESHES.find(mesh => mesh.productId === parseInt(productId));
        brandMeshName = meshObj?.meshName;
    }

    gltfLoader.load(
        urlSrc,
        async function (childGltf) {
            const childMeshGroup = childGltf.scene;
            const childMeshList = await renderMeshList(childMeshGroup, furnitureType, thumbType, hasBrandTexture);

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
            wrapper.userData.thumbType = thumbType;
            wrapper.userData.attachmentUrl = attachmentUrl;
            wrapper.userData.widthMm = itemWidth;
            wrapper.userData.heightMm = itemHeight;
            wrapper.userData.depthMm = itemDepth;
            wrapper.userData.spaceMm = itemSpaceBottom;
            wrapper.userData.positionMm = childPositionMm;
            wrapper.userData.rotation = childRotation;
            wrapper.userData.hasBrandTexture = hasBrandTexture;
            wrapper.userData.rotationInDegrees = calculateRotationInDegrees(childRotation);
            wrapper.userData.rotatedManually = childRotation != null && childRotation != 0 ? true : null;
            wrapper.userData.rotatedManuallyOld = true;
            wrapper.userData.isFitting = isFitting;

            // /******* size and position *********/
            // const widthPx = getItemWidthPx(itemWidth);
            // const heightPx = getItemHeightPx(itemHeight);
            // const depthPx = getItemDepthPx(itemDepth);
            const { modelWidth, modelHeight, modelDepth } = getFurnitureDimensionsFromMmtoPx(itemWidth, itemHeight, itemDepth);

            const spaceBottomPx = calculateTopSpaceIn3dModel(furnitureType, itemSpaceBottom, roomModelBox);
            // const spaceBottomPx = getTopFurnitureYPositionIn3dRoom(itemSpaceBottom, roomModelBox);

            // Compute bounding box from raw geometry
            const originalBox = new THREE.Box3().setFromObject(wrapper);
            const originalSize = new THREE.Vector3();
            originalBox.getSize(originalSize);

            // Safety fallback
            const safeOriginalSize = new THREE.Vector3(
                originalSize.x || 1,
                originalSize.y || 1,
                originalSize.z || 1
            );

            // Save permanently
            wrapper.userData.originalSize = safeOriginalSize.clone();
            wrapper.userData.originalBox = originalBox.clone();

            const childBox = new THREE.Box3().setFromObject(wrapper);
            wrapper.userData.boundingBox = childBox.clone(); // changes performance

            const { scaledChildSize } = placeFurnitureInRoom(
                furnitureType,
                wrapper, 
                modelWidth, 
                modelHeight, 
                modelDepth, 
                spaceBottomPx, 
                childPositionMm, 
                null, 
                childRotation
            );

            /******** 2.save position and size********/
            const placedWorldPos = new THREE.Vector3();
            wrapper.getWorldPosition(placedWorldPos);
            wrapper.userData.savedPosition = placedWorldPos.clone();
            wrapper.userData.scaledSize = scaledChildSize;

            rotateExistingItem(wrapper, scaledChildSize, furnitureType, true);
        
            if(thumbType) {
                addBgImageToFront(wrapper, modelScene, attachmentUrl, thumbType); 
            }

            /******* end position *********/

            if (!isFitting) {
                colorToRed(wrapper);
            }

            initRoomDragging(furnitureType, wrapper, modelRoomType);
        },
        (xhr) => {
            // console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
        },
        (error) => {
            console.error("❌ Error loading GLB:", error);
        }
    );
}

function addGLBModel(
    urlSrc, 
    thumbType,
    attachmentUrl,
    furnitureType, 
    productId, 
    customId, 
    itemHeight, 
    itemDepth, 
    itemWidth,
    itemSpaceBottom,
    hasBrandTexture,
    rotation,
    dupItemPosition = null
) {

    return new Promise((resolve, reject) => {
        const { modelWidth, modelHeight, modelDepth } = getFurnitureDimensionsFromMmtoPx(itemWidth, itemHeight, itemDepth);
        const itemModelSpaceBottom = calculateTopSpaceIn3dModel(furnitureType, itemSpaceBottom);
        
        const loader = new GLTFLoader();
        
        let brandMeshName = null;
        const harcodedColorObj = HARDCODED_COLOR_MESHES.find(mesh => mesh.productId === parseInt(productId));

        if(!harcodedColorObj) {
            const meshObj = BRAND_COLOR_MESHES.find(mesh => mesh.productId === parseInt(productId));
            brandMeshName = meshObj?.meshName;
        }

        loader.load(
            urlSrc,
            async function (childGltf) {
                let childMeshGroup = childGltf.scene || childGltf.scenes[0];
                const childMeshList = await renderMeshList(childMeshGroup, furnitureType, thumbType, hasBrandTexture);

                const wrapper = new THREE.Group();

                childMeshList.forEach(mesh => {
                    // Save world transform
                    mesh.updateWorldMatrix(true, false);

                    wrapper.attach(mesh);

                    mesh.matrixAutoUpdate = true;
                    // mesh.frustumCulled = false;
                });

                wrapper.position.set(0, 0, 0);
                wrapper.rotation.set(0, 0, 0);
                wrapper.scale.set(1, 1, 1);
                wrapper.updateMatrixWorld(true, true);

                /************normalize************ */
                // NORMALIZE MODEL ORIGIN
                const normalizeBox = new THREE.Box3().setFromObject(wrapper);
                const center = normalizeBox.getCenter(new THREE.Vector3());
                const size = normalizeBox.getSize(new THREE.Vector3());

                wrapper.children.forEach(child => {
                    child.position.sub(center);
                    child.position.y += size.y / 2; // put origin at bottom
                });

                wrapper.updateMatrixWorld(true);

                wrapper.userData.pivotNormalized = true;
                /************normalize end************ */

                // Compute bounding box from raw geometry
                const originalBox = new THREE.Box3().setFromObject(wrapper);
                const originalSize = new THREE.Vector3();
                originalBox.getSize(originalSize);

                // Safety fallback
                const safeOriginalSize = new THREE.Vector3(
                    originalSize.x || 1,
                    originalSize.y || 1,
                    originalSize.z || 1
                );
                

                // Save permanently
                wrapper.userData.originalSize = safeOriginalSize.clone();
                wrapper.userData.originalBox = originalBox.clone();

                wrapper.userData.productId = productId;
                wrapper.userData.customId = customId;
                wrapper.userData.furnitureType = furnitureType;
                wrapper.userData.thumbType = thumbType;
                wrapper.userData.attachmentUrl = attachmentUrl;
                wrapper.userData.widthMm = itemWidth;
                wrapper.userData.heightMm = itemHeight;
                wrapper.userData.depthMm = itemDepth;
                wrapper.userData.spaceMm = itemSpaceBottom;
                wrapper.userData.widthPx = modelWidth;
                wrapper.userData.positionMm = dupItemPosition;
                wrapper.userData.rotation = rotation;
                wrapper.userData.hasBrandTexture = hasBrandTexture;
                wrapper.userData.rotationInDegrees = calculateRotationInDegrees(rotation);

                const roomObj = roomState.modelsList[roomState.roomType]
                const modelScene = roomObj.scene;
                modelScene.add(wrapper);

                const { scaledChildSize } = placeFurnitureInRoom(
                    furnitureType, 
                    wrapper, 
                    modelWidth, 
                    modelHeight, 
                    modelDepth, 
                    itemModelSpaceBottom,
                    dupItemPosition,
                    null,
                    rotation,
                );

                /******** 2.save position and size********/
                const placedWorldPos = new THREE.Vector3();
                wrapper.getWorldPosition(placedWorldPos);
                wrapper.userData.savedPosition = placedWorldPos.clone();
                wrapper.userData.scaledSize = scaledChildSize;
                wrapper.receiveShadow = true;
                
                rotateExistingItem(wrapper, scaledChildSize, furnitureType);
                
                if(thumbType) {
                    addBgImageToFront(wrapper, modelScene, attachmentUrl, thumbType); 
                }

                /******* enable dragging *********/

                const isFittingItem = initModelDragging(wrapper, furnitureType);
                    
                const itemPositionMm = dupItemPosition ?? getItemPosition(
                    furnitureType, 
                    placedWorldPos.clone(), 
                    scaledChildSize,
                    rotation,
                    wrapper.userData.savedPosition.y
                );

                wrapper.userData.positionMm = itemPositionMm;
                /***** push item ****/
                const objectIndex = roomObj.dbChildren.findIndex(dbChild => dbChild.db_data.custom_id == customId);
       
                if(objectIndex > -1) {
                    const currentObj = {...roomObj.dbChildren[objectIndex]};
                    currentObj.db_data.isFitting = isFittingItem;
                    currentObj.db_data.rotation = rotation;
                    currentObj.db_data.is_fitting = isFittingItem;
                    currentObj.db_data.furniture_position_mm = JSON.stringify(itemPositionMm);
                    roomObj.dbChildren[objectIndex] = currentObj;
                }

                if(modelSettings.visibleDimensionsArrows) {
                    createFurnitureDimensionArrows(wrapper, modelScene, roomObj.box);
                }

                /***** end push item ****/
                
                resolve({
                    itemPositionMm,
                });

            },
            undefined,
            (error) => {
                console.error("❌ Error loading GLB:", error);
            }
        );
    });
}

 function removeGLBModel(childObj) {
    if(!childObj) return;
    const modelRoomType = roomState.roomType;
    const modelObj = roomState.modelsList[modelRoomType];

    removeAllFurnitureButtons();

    const childObjBox = new THREE.Box3().setFromObject(childObj);

    checkIfItemsAreFitting(modelRoomType, childObj, childObjBox);

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

    if (childObj.userData.bgPlane) {
        modelObj.scene.remove(childObj.userData.bgPlane);

        // optional: dispose resources
        if (childObj.userData.bgPlane.material?.map) {
            childObj.userData.bgPlane.material.map.dispose();
        }
        childObj.userData.bgPlane.material.dispose();
        childObj.userData.bgPlane.geometry.dispose();

        childObj.userData.bgPlane = null;
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

    const bgPlanesIdx = modelObj.bgPlanes.indexOf(childObj.userData.bgPlane);
    if (bgPlanesIdx !== -1) {
        modelObj.bgPlanes.splice(bgPlanesIdx, 1);
    }

    const draggableObjIdx = modelObj.draggableObjects.indexOf(childObj);
    if (draggableObjIdx !== -1) {
        modelObj.draggableObjects.splice(draggableObjIdx, 1);
    }

    childObj.userData = {}; 

    if(modelRoomType === ROOM_TYPE_WITH_CORNER) {
        appendCornerPseudoModelObjects(modelObj.scene, modelObj.box);
    }
}

function checkIfItemsAreFitting(modelRoomType, currentObj, currentBox) {
    const modelObj = roomState.modelsList[modelRoomType];
    const children = modelObj.scene.children;
    const currentId = currentObj.id;

    const notFittingObjs = [];

    currentObj.updateMatrixWorld(true);

    for (const childObj of children) {

        const userData = childObj.userData;

        if (!userData || (!userData.productId && !userData.pseudoType)) continue;
        if (childObj.id === currentId) continue;

        childObj.updateMatrixWorld(true);

        const childBox = new THREE.Box3().setFromObject(childObj);

        // simple AABB collision
        if (currentBox.intersectsBox(childBox)) {

            const canFitElsewhere =
                checkIfAbleToDragChildToPosition(
                    childObj,
                    currentId
                );

            if (canFitElsewhere) {
                notFittingObjs.push(childObj);
            }
        }
    }

    // restore materials
    notFittingObjs.forEach(obj => {

        obj.userData.isFitting = true;

        obj.traverse(child => {
            if (child.isMesh && child.userData.originalMaterial) {

                child.material.color.copy(child.userData.originalMaterial.color);
                child.material.opacity = child.userData.originalMaterial.opacity;
                child.material.transparent = child.userData.originalMaterial.transparent;

            }
        });
    });
}


function duplicateFurnitureTrigger(parent, customId) {
     const furnitureButton = parent.querySelector(`.item-actions-container button[data-action_type="duplicate"]`);
        furnitureButton.addEventListener('click', function() {
            duplicateFurniture(customId);
        });
}

function initFurnitureRotationTrigger(parent, customId) {
    const furnitureButton = parent.querySelector(`.item-actions-container button[data-action_type="rotate"]`);
    
    if(!furnitureButton) return;

    furnitureButton.addEventListener('click', function() {
        initFurnitureRotation(customId);
    });
}

function placeFurnitureInRoom(
    furnitureType,
    wrapper,
    widthPx,
    heightPx,
    depthPx,
    spaceBottomPx,
    mmPosition = null,
    scaledSize = null,
    initRotation = null
) {
    const modelObj = roomState.modelsList[roomState.roomType];

    // ------------------ NORMALIZE MODEL PIVOT (RUN ONCE) ------------------
    if (!wrapper.userData.pivotNormalized) {

        const box = new THREE.Box3().setFromObject(wrapper);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        // move children instead of wrapper
        wrapper.children.forEach(child => {
            child.position.sub(center);
            child.position.y += size.y / 2;
        });

        wrapper.updateMatrixWorld(true);

        const normalizedBox = new THREE.Box3().setFromObject(wrapper);
        const normalizedSize = normalizedBox.getSize(new THREE.Vector3());

        wrapper.userData.originalSize = normalizedSize.clone();
        wrapper.userData.pivotNormalized = true;
    }

    if(!scaledSize) {
        const originalSize = wrapper.userData.originalSize;

        // ------------------ SCALE ------------------
        const scaleX = widthPx / originalSize.x;
        const scaleY = heightPx / originalSize.y;
        const scaleZ = depthPx / originalSize.z;

        wrapper.scale.set(scaleX, scaleY, scaleZ);
        wrapper.updateMatrixWorld(true);

        // scaled size
        scaledSize = new THREE.Vector3(
            originalSize.x * scaleX,
            originalSize.y * scaleY,
            originalSize.z * scaleZ
        );

        wrapper.userData.scaledSize = scaledSize.clone();
    }

    let rotation = initRotation ?? wrapper.rotation.y;

    // ------------------ POSITION ------------------

    let x, y, z;
    const { width, depth, height } = roomState.modelRoomDimensions;
    const roomHalfWidth = width / 2;
    const roomHalfDepth = depth / 2;

    if (mmPosition) {
        const pos = typeof mmPosition === "string"
            ? JSON.parse(mmPosition)
            : mmPosition;

        const rotatedSize = getRotatedSize(scaledSize, rotation);

        const { x: roomScaleX, z: roomScaleZ, y: roomScaleY } = roomState.modelRoomScale;
        // x = -roomHalfWidth + pos.left * roomScaleX + rotatedSize.x / 2;
        // z = -roomHalfDepth + pos.back * roomScaleZ + rotatedSize.z / 2;         
        const isLeftWall = Math.abs(rotation) > 0.01;

        if (isLeftWall) {
            x = -roomHalfWidth + (pos.back ?? 0) * roomScaleX + rotatedSize.x / 2;
            z = -roomHalfDepth + pos.left * roomScaleZ + rotatedSize.z / 2;
        } else {
            x = -roomHalfWidth + pos.left * roomScaleX + rotatedSize.x / 2;
            z = -roomHalfDepth + pos.back * roomScaleZ + rotatedSize.z / 2;
        }

        if (spaceBottomPx) {
			
            y = spaceBottomPx;

        } else {

            y = 0;

        }
    } else {
        const footprintSize = getFootprintSize(scaledSize, rotation);


        // X
        const usableMinX = -roomHalfWidth;
        x = usableMinX + footprintSize.x / 2;

        // Y
        if (furnitureType.includes(DIMENSION_TYPE_TOP)) {
            y = spaceBottomPx;
        } else {

            y = 0;

        }

        // Z
        z = -roomHalfDepth + footprintSize.z / 2;
    }

    // ------------------ APPLY POSITION ------------------
    const worldPos = new THREE.Vector3(x, y, z);
    const localPos = wrapper.parent.worldToLocal(worldPos);

    wrapper.position.copy(localPos);
    wrapper.updateMatrixWorld(true);

    // ------------------ RETURN ------------------

    wrapper.updateMatrixWorld(true);

    const unrotatedScaledSize = scaledSize.clone();

    wrapper.userData.scaledSize = unrotatedScaledSize.clone();
    wrapper.userData.boundingBox = new THREE.Box3().setFromObject(wrapper);

    return {
        scaledChildSize: unrotatedScaledSize.clone()
    }
}

function resaveObjPosition(position, rotation, customId, itemPositionMm, isFitting) {
    const roomModels = roomState.modelsList;
    const roomType = roomState.roomType;
    const dbChildIndex = roomModels[roomType].dbChildren.findIndex(item => item.db_data.custom_id == customId);

    if (dbChildIndex !== -1) {
        roomState.modelsList = {
            ...roomModels,
            [roomType]: {
            ...roomModels[roomType],
            dbChildren: roomModels[roomType].dbChildren.map((child, index) =>
                index === dbChildIndex
                ? {
                    ...child,
                    db_data: {
                        ...child.db_data,
                        furniture_position_mm: JSON.stringify(itemPositionMm),
                        is_fitting: isFitting,
                        rotation,
                    }
                }
                : child
            ),
            modelChildren: roomModels[roomType].scene.children.map((child, index) =>
                index === dbChildIndex
                ? {
                    ...child,
                    userData: {
                        ...child.userData,
                        savedPosition: position.clone(),
                        isFitting: isFitting,
                        rotation,
                    }
                }
                : child
            ),
            },
        };
    }
}

function initModelDragging(wrapper, furnitureType) {
    const scaledChildBox = wrapper.userData.boundingBox;
    // store needed data
    wrapper.userData.furnitureType = furnitureType;
    wrapper.userData.boundingBox = scaledChildBox; // or scaledChildBox if better

    // register for dragging (GLOBAL system)
    const obj = roomState.modelsList[roomState.roomType];
    obj.draggableObjects.push(wrapper);

    // return fitting state if needed
    return checkIfAbleToDragChildToPosition(wrapper);
}

function rotateExistingItem(obj, objSize, furnitureType, keepPosition = false) {
    const { width, depth } = roomState.modelRoomDimensions;
    const roomHalfWidth = width / 2;
    const roomHalfDepth = depth / 2;

    const worldPos = new THREE.Vector3();
    obj.getWorldPosition(worldPos);

    /************ CORNER START ********* */
    const modelObj = roomState.modelsList[roomState.roomType];
    const roomModelBox = modelObj.box;

     const {
        bottomCorner: cornerBottomWidth3d,
        fullCorner: cornerFullWidth3d,
        topCorner: cornerTopWidth3d
    } = roomState.worldItemsDimensions.width;

    const objWidth = objSize.x;

    let cornerThresholder = objWidth - 0.01;

    switch (furnitureType) {

        case FURNITURE_TYPE_BOTTOM_CORNER:
            if (cornerBottomWidth3d > 0) {
                cornerThresholder = cornerBottomWidth3d;
            } else if (cornerFullWidth3d > 0) {
                cornerThresholder = cornerFullWidth3d;
            } else if (cornerTopWidth3d > 0) {
                cornerThresholder = cornerTopWidth3d;
            }
            break;

        case FURNITURE_TYPE_BOTTOM:
            if (cornerBottomWidth3d > 0) {
                cornerThresholder = cornerBottomWidth3d;
            } else if (cornerFullWidth3d > 0) {
                cornerThresholder = cornerFullWidth3d;
            } else if (cornerTopWidth3d > 0) {
                cornerThresholder = cornerTopWidth3d;
            }
            break;

        case DIMENSION_TYPE_TOP:
            if (cornerTopWidth3d > 0) {
                cornerThresholder = cornerTopWidth3d;
            } else if (cornerFullWidth3d > 0) {
                cornerThresholder = cornerFullWidth3d;
            } else if (cornerBottomWidth3d > 0) {
                cornerThresholder = cornerBottomWidth3d;
            }
            break;

        case DIMENSION_TYPE_FULL:
            if (cornerFullWidth3d > 0) {
                cornerThresholder = cornerFullWidth3d;
            } else if (cornerTopWidth3d > 0) {
                cornerThresholder = cornerTopWidth3d;
            } else if (cornerBottomWidth3d > 0) {
                cornerThresholder = cornerBottomWidth3d;
            }
            break;

        default:
            cornerThresholder = objWidth - 0.01;
    }

    cornerThresholder = 0;

        /* -------------------------------------------------- */
    /* 4️⃣ Compute world-space threshold                  */
    /* -------------------------------------------------- */
    const forwardThreshold =
        roomModelBox.min.x + cornerThresholder;

    const isCorner = worldPos.x < forwardThreshold;
    /********* corner end **********/

    // detect rotated state (90deg)

    const hasRotation = obj.userData.rotation !== undefined && obj.userData.rotation !== null;
    const yRotation = isCorner && hasRotation ? 
        Math.PI / 2 :
        obj.userData.rotation ?? 0;

    obj.rotation.y = yRotation;
    obj.userData.rotation = yRotation;
    obj.userData.rotationInDegrees = calculateRotationInDegrees(yRotation);

    if (!keepPosition && getIsRotatedItem(yRotation)) {

        // attach to LEFT wall using rotated footprint (z becomes width)
        worldPos.x = -roomHalfWidth + objSize.z / 2;

        // keep Z inside bounds
        const minZ = -roomHalfDepth + objSize.x / 2;
        const maxZ = roomHalfDepth - objSize.x / 2;

        worldPos.z = Math.max(minZ, Math.min(maxZ, worldPos.z));

    } else if (!keepPosition) {

        // normal orientation (not rotated)
        worldPos.x = -roomHalfWidth + objSize.x / 2;

        const minZ = -roomHalfDepth + objSize.z / 2;
        const maxZ = roomHalfDepth - objSize.z / 2;

        worldPos.z = Math.max(minZ, Math.min(maxZ, worldPos.z));
    }

    // apply corrected position
    obj.position.copy(obj.parent.worldToLocal(worldPos));
    obj.updateMatrixWorld(true);
}

function removeAllFurnitureControls() {
    const modelScene = roomState.modelsList[roomState.roomType].scene;

    modelScene.children.forEach(childMeshGroup => {
        if (childMeshGroup.userData && childMeshGroup.userData.uiButtons) {
            childMeshGroup.userData.uiButtons.forEach(btn => {
                childMeshGroup.remove(btn);
            });
            childMeshGroup.userData.uiButtons = null; // clear reference
        }

        childMeshGroup.traverse(child => {
            if (child.material && child.material.emissive) {
                child.material.emissive.set(0x000000);   // reset emissive color
                child.material.emissiveIntensity = 1;   // back to default
            }
        });
    });
}

function removeAllFurnitureButtons() {
    const toRemove = [];

    const modelScene = roomState.modelsList[roomState.roomType].scene;

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
    
async function duplicateFurniture(currentCustomId, triggerDupItem = false) {
    if(stepsContainer) {
        stepsContainer.classList.add('loading');
    }
    const dbChildren = roomState.modelsList[roomState.roomType].dbChildren;

    const itemObj = dbChildren.find(item => item.db_data.custom_id == currentCustomId);

    if(!itemObj) return;

    const customId = uniqLong();
    const { 
        product_id, 
        furniture_type, 
        attachment_url,
        db_data,
    } = itemObj;
    const { height, depth, width, space_bottom, rotation, prices, object_src, furniture_position_mm, attachment_type, hasBrandTexture } = db_data;

    const {my_item_html, summary_item_html, new_object} = await addFurnitureItem(
        customId, 
        itemObj,
        state.defaultTextures,
        dbChildren.length
    );

    roomState.modelsList[roomState.roomType].dbChildren.push(new_object);
        await addGLBModel(
        object_src, 
        attachment_type,
        attachment_url,
        furniture_type, 
        product_id, 
        customId, 
        height, 
        depth, 
        width, 
        space_bottom,
        hasBrandTexture,
        rotation,
        furniture_position_mm
    );

    if(my_item_html) {
        let { myItemsList, summaryItemsList } = roomState;

        if(!summaryItemsList) {
            myItemsList = container.querySelector('.tab-item.current .cabinets .cabinets-inner .my-cabinets-list-inner');
            summaryItemsList = container.querySelector('.tab-item.current .summary .summary-inner .summary-content');
        }

        myItemsList.insertAdjacentHTML('beforeend', my_item_html);
        summaryItemsList.insertAdjacentHTML('beforeend', summary_item_html);

        changeCabinetsTab(myCabinetTab, myCabinetContents);

        if (typeof toggleAccordions === 'function') {
            toggleAccordions();
        }

        const furnitureItem = myItemsList.querySelector(`.my-cabinet-item[data-custom_id="${customId}"]`);

        if(furnitureItem) {
            editItemButtonTrigger(new_object, customId); 
            removeItemButtonTrigger(furnitureItem, customId, furniture_type);
            duplicateFurnitureTrigger(furnitureItem, customId);
            initFurnitureRotationTrigger(furnitureItem, customId);
        }
    }

    if(stepsContainer) {
        stepsContainer.classList.remove('loading');
    }

    changeTotals();

    return customId;
}

function createFurnitureDimensionArrows(childMeshGroup, modelScene, roomModelBox) {
    // Remove old arrows & labels
    if (childMeshGroup.userData.dimensions) {
        childMeshGroup.userData.dimensions.forEach(obj => modelScene.remove(obj));
    }

    const objects = [];

    // const roomBox = new THREE.Box3().setFromObject(room3DGroup);
    const furnitureBox = new THREE.Box3().setFromObject(childMeshGroup);

    const furnitureSize = new THREE.Vector3();
    furnitureBox.getSize(furnitureSize);

    const roomSize = new THREE.Vector3();
    roomModelBox.getSize(roomSize);

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
    const leftDist = furnitureBox.min.x - roomModelBox.min.x;
    if (leftDist > 0) {
        const leftArrow = makeArrowWithNumber(
            new THREE.Vector3(roomModelBox.min.x, furnitureBox.min.y + furnitureSize.y, furnitureBox.min.z),
            new THREE.Vector3(furnitureBox.min.x, furnitureBox.min.y + furnitureSize.y, furnitureBox.min.z),
            0xff0000, // red
            `${positionMm.left.toFixed(2)} mm`
        );
        objects.push(...leftArrow);
    }

    // === RIGHT ARROW ===
    const rightDist = roomModelBox.max.x - furnitureBox.max.x;
    if (rightDist > 0) {
        const rightArrow = makeArrowWithNumber(
            new THREE.Vector3(furnitureBox.max.x, furnitureBox.min.y + furnitureSize.y, furnitureBox.min.z),
            new THREE.Vector3(roomModelBox.max.x, furnitureBox.min.y + furnitureSize.y, furnitureBox.min.z),
            0xff0000,
            `${positionMm.right.toFixed(2)} mm`
        );
        objects.push(...rightArrow);
    }

    // === TOP ARROW ===
    const topDist = roomModelBox.max.y - furnitureBox.max.y;
    if (topDist > 0) {
        const topArrow = makeArrowWithNumber(
            new THREE.Vector3(furnitureBox.max.x - furnitureSize.x/2, furnitureBox.max.y, furnitureBox.min.z),
            new THREE.Vector3(furnitureBox.max.x - furnitureSize.x/2, roomModelBox.max.y, furnitureBox.min.z),
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



function typesEditInit() {
    const allProducts = getCurrentModelAllProducts();
    allProducts.forEach(furnitureItem => {
        const productId = furnitureItem.product_id;
        const htmlItem = container.querySelector(`.cabinet-settings .furniture-type-list .add-cabinet-item[data-product_id="${productId}"]`);
        const editBtn = htmlItem.querySelector('.item-actions-container button[data-action_type="edit"]');
        const { furniture_type, min_width } = furnitureItem;

        editBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const itemObj = allProducts.find(dbChild => dbChild.product_id == productId);

            createEditModal(
                htmlItem, 
                itemObj, 
                productId, 
                furniture_type, 
            );
        });
    });
}

export function appendCornerPseudoModelObjects(modelScene, roomModelBox) {
    const { 
        bottom: bottomCornerData, 
        top: topCornerData, 
        full: fullCornerData, 
    } = roomState.cornerFurnitureData;

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
        id: cornerFullFurnitureId, 
        width: cornerFullWidth, 
        depth: cornerFullDepth,
    } = fullCornerData;
    
    const { 
        cornerBottomWidth3d,
        cornerBottomHeight3d,
        cornerBottomDepth3d,
        cornerTopHeight3d,
        cornerTopDepth3d,
    } = roomState.corner3DDimensions;

    if(!cornerBottomFurnitureId && !cornerFullFurnitureId) {
        const bottomGeometry = new THREE.BoxGeometry( 1, 1, 1); 
        const bottomMaterial = new THREE.MeshBasicMaterial( {
            color: 0x808080,
            transparent: true, 
            opacity: 0.7
        }); 
        const pseudoBottomCornerFurniture = new THREE.Mesh( bottomGeometry, bottomMaterial ); 
        pseudoBottomCornerFurniture.scale.set(cornerBottomWidth3d, cornerBottomHeight3d, cornerBottomDepth3d);

        pseudoBottomCornerFurniture.userData.pseudoType = FURNITURE_TYPE_BOTTOM;
        pseudoBottomCornerFurniture.userData.furnitureType = FURNITURE_TYPE_BOTTOM_CORNER;
        pseudoBottomCornerFurniture.userData.widthMm = cornerBottomWidth;
        pseudoBottomCornerFurniture.userData.depthMm = cornerBottomDepth3d;

        const objSize = new THREE.Vector3(
            cornerBottomWidth3d,
            cornerBottomHeight3d,
            cornerBottomDepth3d
        );

        pseudoBottomCornerFurniture.userData.originalSize = objSize.clone();
        pseudoBottomCornerFurniture.userData.scaledSize = objSize.clone();
        pseudoBottomCornerFurniture.userData.parentBox = roomModelBox;

        pseudoBottomCornerFurniture.position.set(
            roomModelBox.min.x + objSize.x / 2 + WALL_THICKNESS,
            roomModelBox.min.y + objSize.y / 2 + FLOOR_THICKNESS,
            roomModelBox.min.z + objSize.z / 2 + WALL_THICKNESS
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
    
        pseudoTopCornerFurniture.userData.pseudoType = DIMENSION_TYPE_TOP;
        pseudoTopCornerFurniture.userData.furnitureType = DIMENSION_TYPE_TOP_CORNER;
        pseudoTopCornerFurniture.userData.widthMm = cornerTopWidth;
        pseudoTopCornerFurniture.userData.depthMm = cornerTopDepth3d;

        const objSize = new THREE.Vector3(
            cornerBottomWidth3d,
            cornerBottomHeight3d,
            cornerBottomDepth3d
        );

        pseudoTopCornerFurniture.userData.originalSize = objSize.clone();
        pseudoTopCornerFurniture.userData.scaledSize = objSize.clone();
        pseudoTopCornerFurniture.userData.parentBox = roomModelBox;

        const xPosition = roomModelBox.min.x + objSize.x / 2 + WALL_THICKNESS;
        const yPosition = calculateTopSpaceIn3dModel(FURNITURE_TYPE_FULL, 0, roomModelBox) + cornerTopHeight3d / 2;
        const zPosition = roomModelBox.min.z + (objSize.z / 2) + WALL_THICKNESS;
        pseudoTopCornerFurniture.position.set(xPosition, yPosition, zPosition);

        modelScene.add(pseudoTopCornerFurniture);
    }
}


async function initFurnitureDuplicateData(currentCustomId, width, height, depth, spaceBottom) {
    const currentObj = roomState.modelsList[roomState.roomType].scene.children.find(child => 
        child.userData.customId == currentCustomId
    );

    if(!currentObj) return;

    const newCustomId = await duplicateFurniture(currentCustomId, true);

    openEditModal(currentObj.userData, newCustomId, false);
}

 async function initFurnitureRotation(currentCustomId) {
    const roomObj = roomState.modelsList[roomState.roomType];
    const modelScene = roomObj.scene;
    const dbChildren = roomObj.dbChildren;

    const currentObj = modelScene.children.find(child => 
        child.userData.customId == currentCustomId
    );

    if(!currentObj) return;

    const baseRotation = currentObj.userData.rotation ?? 0;
    const newRotation = parseFloat(baseRotation) + parseFloat(Math.PI / 4);
    currentObj.rotation.y = newRotation;
    currentObj.userData.rotation = newRotation;
    currentObj.userData.rotationInDegrees = calculateRotationInDegrees(newRotation);
    currentObj.userData.rotatedManually = true;
    currentObj.userData.rotatedManuallyOld = false;


    const itemIndex = dbChildren.findIndex(item => item.db_data?.custom_id == currentCustomId);

    if(itemIndex > -1) {
        const oldItem = {...dbChildren[itemIndex]};
        oldItem.db_data.rotation = newRotation;
        dbChildren[itemIndex] = {...oldItem};
    }

    const currentModel = modelScene.children.find(item => item.userData.customId == currentCustomId);

    if(currentModel) {

        setBgPlanesVisibleForWrapper(currentObj, false);

        currentModel.traverse(child => {
            if (child.isMesh) {
                child.material.emissive.set(0xffffff);
                child.material.emissiveIntensity = 0.4;
            }
        }); 

        setTimeout(() => {
            currentModel.traverse(child => {
                if (child.isMesh) {
                    child.material.emissive.set(0x000000);
                    child.material.emissiveIntensity = 1;
                }
            }); 

            setBgPlanesVisibleForWrapper(currentObj, true);
        }, 800);
    }

    currentObj.updateMatrixWorld(true);

    updateBgPlane(currentObj);
}

function initFurnitureRemoveData(customId) {
    const furnitureItem = container.querySelector(`.my-cabinets-list .cabinet-item[data-custom_id="${customId}"]`);
    if(!furnitureItem) return;

    const dbChildren = roomState.modelsList[roomState.roomType].dbChildren;
    const itemObj = dbChildren.find(dbChild => dbChild.db_data.custom_id == customId);
    if(!itemObj) return;

    const furnitureType = itemObj.furniture_type;

    const summaryItem = roomState.summaryItemsList.querySelector(`.cabinet-item[data-custom_id="${customId}"]`);

    removeItemButtonTriggerAction(furnitureItem, summaryItem, furnitureType, customId);
}

function editItemButtonTrigger(furnitureItemObj, customId) {
    const htmlItem = container.querySelector(`.my-cabinets-list .my-cabinet-item[data-custom_id="${customId}"]`);

    if(!htmlItem) return;
    const editButton = htmlItem.querySelector('.item-actions-container button[data-action_type="edit"]');

    if(!editButton) {
        return;
    }
    const { product_id, furniture_type, db_data } = furnitureItemObj;

    editButton.addEventListener('click', function(e) {
        e.preventDefault();

        const dbChildren = roomState.modelsList[roomState.roomType].dbChildren;
        const itemObj = dbChildren.find(dbChild => dbChild.db_data.custom_id == customId);

        highlightCurrentItem(customId);

        createEditModal(
            htmlItem, 
            itemObj, 
            product_id, 
            furniture_type, 
            false
        );
    });

}

function highlightCurrentItem(customId) {
    const modelObj = roomState.modelsList[roomState.roomType];
    const currentModel = modelObj.scene.children.find(item => item.userData.customId == customId);

    if(!currentModel) return;

    const rect = modelObj.renderer.domElement.getBoundingClientRect();
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

    for (const [key, roomModel] of Object.entries(roomState.modelsList)) {
        if(roomModel.scene) {
            roomModel.scene.children.map(model => {
                model.traverse(child => {
                    if (child.isMesh && child?.material?.emissive) {
                        child.material.emissive.set(0x000000);   // reset emissive color
                        child.material.emissiveIntensity = 1;   // back to default
                    }
                });
            });
        }
    }

}

function setSingleWallChilderDragging(obj) {
    const modelObj = roomState.modelsList[roomState.roomType];

    obj.updateMatrixWorld(true); 

    const objSize = obj.userData.scaledSize;
    const objWidth =  objSize.x;
    const objDepth =  objSize.z;

    const currentPos = new THREE.Vector3();
    obj.getWorldPosition(currentPos);

    const pos = obj.getWorldPosition(new THREE.Vector3());

    pos.y = obj.userData.savedPosition.y; 

    const yRotation = obj.rotation.y;

    const newPos = getDraggingItemsMinMaxPositions(obj, objWidth, objDepth, yRotation, pos.clone());

    if (obj?.parent) {
        obj.position.copy(obj.parent.worldToLocal(newPos));
    } else if (obj) {
        // fallback if no parent
        obj.position.copy(newPos);
    }
}

function getDraggingItemsMinMaxPositions(obj, objWidth, objDepth, yRotation, pos, furnitureType = null) {
    const roomWidth = roomState.modelRoomDimensions.width;
    const roomDepth = roomState.modelRoomDimensions.depth;

    const isRotated = getIsRotatedItem(yRotation);

    // Real footprint after rotation
    const sizeX = isRotated ? objDepth : objWidth;
    const sizeZ = isRotated ? objWidth : objDepth;

    const isBottom = obj.userData.furnitureType.includes(FURNITURE_TYPE_BOTTOM);

    if (isRotated) {
        /**
         * Rotated item = left wall.
         * X is wall distance.
         * Z is movement along the wall.
         */

        if (isBottom) {
            // Bottom rotated furniture can move in X
            const minX = -roomWidth / 2 + sizeX / 2;
            const maxX = roomWidth / 2 - sizeX / 2;

            pos.x = Math.max(minX, Math.min(maxX, pos.x));
        } else {
            // Top/full rotated furniture stays fixed to left wall
            pos.x = -roomWidth / 2 + sizeX / 2;
        }

        // All rotated furniture moves along Z
        const minZ = -roomDepth / 2 + sizeZ / 2;
        const maxZ = roomDepth / 2 - sizeZ / 2;

        pos.z = Math.max(minZ, Math.min(maxZ, pos.z));
    } else {
        /**
         * Non-rotated item = back wall.
         * Z is wall distance.
         * X is movement along the wall.
         */

        if (isBottom) {
            // Bottom non-rotated furniture can move in Z
            const minZ = -roomDepth / 2 + sizeZ / 2;
            const maxZ = roomDepth / 2 - sizeZ / 2;

            pos.z = Math.max(minZ, Math.min(maxZ, pos.z));
        } else {
            // Top/full non-rotated furniture stays fixed to back wall
            pos.z = -roomDepth / 2 + sizeZ / 2;
        }

        // All non-rotated furniture moves along X
        const minX = -roomWidth / 2 + sizeX / 2;
        const maxX = roomWidth / 2 - sizeX / 2;

        pos.x = Math.max(minX, Math.min(maxX, pos.x));
    }

    return pos;
}

export function clearModelScene2(modelObj, onPageLoad) {
    if (!modelObj) return;

    editContainerRemove();

    const scene = modelObj.scene;

    // 1. Dispose full scene graph
    if (scene) {
        scene.traverse((obj) => {

            if (obj.geometry) {
                obj.geometry.dispose?.();
            }

            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(m => disposeMaterial(m));
                } else {
                    disposeMaterial(obj.material);
                }
            }
        });

        scene.clear(); // removes all children safely
    }

    function disposeMaterial(mat) {
        if (!mat) return;

        for (const key in mat) {
            const value = mat[key];
            if (value && value.isTexture) {
                value.dispose?.();
            }
        }
        mat.dispose?.();
    }

    // 2. Dispose renderer
    if (modelObj.renderer) {
        modelObj.renderer.dispose();
        modelObj.renderer.forceContextLoss?.();
        modelObj.renderer.domElement = null;
    }

    // 3. Dispose controls
    if (modelObj.controls) {
        modelObj.controls.dispose?.();
    }

    // 4. Dispose drag controls if needed
    if (modelObj.dragControls) {
        modelObj.dragControls.deactivate?.();
    }

    // 5. IMPORTANT: clear only internal state (NOT object itself)

    modelObj.scene = null;
    modelObj.box = null;
    modelObj.camera = null;
    modelObj.renderer = null;
    modelObj.controls = null;
    modelObj.room3DGroup = null;
    modelObj.dragControls = null;

    if (onPageLoad) {
        modelObj._destroyed = false;
        return;
    };

    modelObj.dbChildren.length = 0;
    modelObj.bgPlanes.length = 0;
    modelObj.draggableObjects.length = 0;

    modelObj.total.regular = 0;
    modelObj.total.discount = 0;
    modelObj.total.display = 0;

    // 6. DOM cleanup (safe reset)
    if (modelObj.htmlContainer) {
        modelObj.htmlContainer.innerHTML = '';
    }

    if (roomState.summaryItemsList) {
        roomState.summaryItemsList.innerHTML = '';
    }

     if (roomState.myItemsList) {
        roomState.myItemsList.innerHTML = '';
    }

}

export function clearModelScene(modelObj, onPageLoad) {
    if (!modelObj) return;

    editContainerRemove();

    const { scene, renderer, controls, dragControls } = modelObj;

    // =========================================================
    // 🔥 1. MARK AS DESTROYED (prevents RAF ghost updates)
    // =========================================================
    modelObj._destroyed = true;

    // =========================================================
    // 🔥 2. STOP ANIMATION LOOP
    // =========================================================
    if (modelObj.animationId) {
        cancelAnimationFrame(modelObj.animationId);
        modelObj.animationId = null;
    }

    // =========================================================
    // 🔥 3. DISABLE ZOOM SYNC (CRITICAL FOR YOUR BUG)
    // =========================================================
    // modelObj.updateZoomSlider = null;
    if (modelObj.zoomSystem) {
        modelObj.zoomSystem.dispose();
        modelObj.zoomSystem = null;
    }
    // =========================================================
    // 🔥 4. DISPOSE SCENE
    // =========================================================
    if (scene) {
        scene.traverse((obj) => {

            if (obj.geometry) {
                obj.geometry.dispose();
            }

            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(disposeMaterial);
                } else {
                    disposeMaterial(obj.material);
                }
            }
        });

        scene.clear();
    }

    function disposeMaterial(mat) {
        if (!mat) return;

        Object.keys(mat).forEach((key) => {
            const value = mat[key];

            // dispose textures
            if (value && value.isTexture) {
                value.dispose();
            }
        });

        mat.dispose?.();
    }

    // =========================================================
    // 🔥 5. DISPOSE CONTROLS
    // =========================================================
    if (controls) {
        controls.dispose();
    }

    // =========================================================
    // 🔥 6. DISPOSE DRAG CONTROLS
    // =========================================================
    if (dragControls) {
        dragControls.dispose();
    }

    // =========================================================
    // 🔥 7. DISPOSE RENDERER + REMOVE CANVAS
    // =========================================================
    if (renderer) {
        renderer.dispose();
        renderer.forceContextLoss?.();

        const canvas = renderer.domElement;
        if (canvas && canvas.parentNode) {
            canvas.parentNode.removeChild(canvas);
        }
    }

    // =========================================================
    // 🔥 8. CLEAR REFERENCES
    // =========================================================
    modelObj.scene = null;
    modelObj.box = null;
    modelObj.camera = null;
    modelObj.renderer = null;
    modelObj.controls = null;
    modelObj.room3DGroup = null;
    modelObj.dragControls = null;

    // =========================================================
    // 🔥 9. RESET STATE (ONLY WHEN NOT PAGE LOAD)
    // =========================================================
    if (onPageLoad) {
        modelObj._destroyed = false;
        return;
    };

    modelObj.dbChildren.length = 0;
    modelObj.bgPlanes.length = 0;
    modelObj.draggableObjects.length = 0;

    modelObj.total.regular = 0;
    modelObj.total.discount = 0;
    modelObj.total.display = 0;

    // =========================================================
    // 🔥 10. CLEAN DOM
    // =========================================================
    if (modelObj.htmlContainer) {
        modelObj.htmlContainer.innerHTML = '';
    }

    if (roomState.summaryItemsList) {
        roomState.summaryItemsList.innerHTML = '';
    }

    if (roomState.myItemsList) {
        roomState.myItemsList.innerHTML = '';
    }

    // =========================================================
    // 🔥 11. FINAL RESET (ALLOW REINIT CLEANLY)
    // =========================================================
    modelObj._destroyed = false;
}

export function dragControlsMethod(dragControls, modelScene, roomModelBox, threeJSControls, roomType) {
    dragControls.addEventListener('dragstart', event => {
        const obj = event.object;

        obj.userData.initialPosition = obj.position.clone();
        threeJSControls.enabled = false;

        setBgPlanesVisibleForWrapper(obj, false);
    });

    dragControls.addEventListener('drag', event => {
        const obj = event.object;

        if (isSummaryStep) {
            obj.position.copy(obj.userData.initialPosition);
            return;
        }

        setSingleWallChilderDragging(obj);
				
		if(obj.userData.thumbType === THUMB_TYPE_SLOGAN) {
				updateBgPlane(obj);
		}

        if (roomState.visibleDimensionArrows) {
            if(!obj.productId) {
               return; 
            }
            createFurnitureDimensionArrows(obj, room3DGroup);
        }
    });

    dragControls.addEventListener('dragend', event => {
        const obj = event.object;

        threeJSControls.enabled = true;

        updateBgPlane(obj);
        setBgPlanesVisibleForWrapper(obj, true);

        const childWorldPos = new THREE.Vector3();
        obj.getWorldPosition(childWorldPos);
        obj.userData.savedPosition = childWorldPos.clone();

        const itemPositionMm = getItemPosition(
            obj.userData.furnitureType,
            childWorldPos.clone(),
            obj.userData.scaledSize,
            obj.rotation.y,
            obj.userData.savedPosition.y,
            obj.userData.customId
        );
        obj.updateMatrixWorld(true);
        obj.userData.savedPosition = obj.position.clone();
        getFreshWrapperBoundingBox(obj);

        obj.userData.positionMm = itemPositionMm;

        const isFitting = checkIfAbleToDragChildToPosition(obj);
        obj.userData.isFitting = isFitting;

        if (isFitting) {
            colorToDefault(obj);
        } else {
            colorToRed(obj);
        }

        const rotation = obj.userData.rotatedManually || obj.rotation.y != 0 ? obj.rotation.y : null;
        resaveObjPosition(childWorldPos.clone(), rotation, obj.userData.customId, itemPositionMm, isFitting);
    });
}

export function setZoomSettingsValues(threeJSCamera, threeJSControls) {
    const currentDistance = threeJSCamera.position.distanceTo(threeJSControls.target);

    zoomSlider.min = threeJSControls.minDistance;
    zoomSlider.max = threeJSControls.maxDistance;
    zoomSlider.value = currentDistance;
}

function changeTotalPrice(itemTotal) {
    const { regular_total, discount_total, display_total } = itemTotal;
    const total = roomState.modelsList[roomState.roomType].total;
    const tempTotal = {...total};

    total.regular = parseFloat(tempTotal.regular) + parseFloat(regular_total);
    total.discount = parseFloat(tempTotal.discount) + parseFloat(discount_total && discount_total > 0 ? discount_total : 0);
    total.display = parseFloat(tempTotal.display) + parseFloat(display_total);

    const {html} = renderPriceBlock(total.regular, total.discount, currencySymbol);

    totalContainers.forEach(totalContainer => {
        totalContainer.innerHTML = html;
    });
}

function updateProductPricesHtml(customId, prices) {
    const myCabinetSummaryHtml = container.querySelector(`.summary-cabinets-list .summary-cabinet-item[data-custom_id="${customId}"]`);
    const summaryHtml = container.querySelector(`.room-config-summary .room-config-summary-item[data-custom_id="${customId}"]`);

    const displayPrice = prices.display_total;

    [myCabinetSummaryHtml, summaryHtml].forEach(block => {
        if(block) {
            const numHtml = block.querySelector('.price-data .price-num');
            numHtml.innerHTML = displayPrice;
        }
        
    });

}

export function productActionsInit(customId, productId, furnitureType, price) {
    const itemHtml = container.querySelector(`.my-cabinets-list .cabinet-item[data-custom_id="${customId}"]`);
    const editBtn = itemHtml.querySelector(`.item-actions-container button[data-action_type="edit"]`);
    const rotateBtn = itemHtml.querySelector(`.item-actions-container button[data-action_type="rotate"]`);
    const duplicateBtn = itemHtml.querySelector(`.item-actions-container button[data-action_type="duplicate"]`);
    const removeBtn = itemHtml.querySelector(`.item-actions-container button[data-action_type="remove"]`);

    editBtn.addEventListener('click', function(e) {
        e.preventDefault();

        const itemObj = roomState.modelsList[roomState.roomType].dbChildren.find(dbChild => dbChild.db_data.custom_id == customId);

        createEditModal(
            itemHtml, 
            itemObj, 
            productId, 
            furnitureType, 
            false
        );
    });

    duplicateBtn.addEventListener('click', function(e) {
        e.preventDefault();
        initFurnitureDuplicateData(customId);
    });

    if(rotateBtn) {
        rotateBtn.addEventListener('click', function(e) {
            e.preventDefault();
            initFurnitureRotation(customId);
        });
    }

    removeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        initFurnitureRemoveData(customId);
    });
}

export function changeTotals() {
    const obj = roomState.modelsList[roomState.roomType];

    const total = changeProductsPrices(
        obj.dbChildren, 
        state.defaultTextures, 
        state.defaultComponents
    );

    roomState.modelsList[roomState.roomType].total = total

    const {html} = renderPriceBlock(total.regular, total.discount, currencySymbol)

    totalContainers.forEach(totalContainer => {
        totalContainer.innerHTML = html;
    });
}


function initRoomDragging(furnitureType, wrapper, roomType) {
    if (!furnitureType.includes('corner')) {
        roomState.modelsList[roomType].draggableObjects.push(wrapper);
    } else {
        removeCornerPseudoModelObjects(furnitureType);
    }
}

export function removeCornerPseudoModelObjects(furnitureType) {

    if(!furnitureType.includes('corner')) return;

    const modelObj = roomState.modelsList[roomState.roomType];

    furnitureType = furnitureType.trim();

    const children = modelObj.scene.children;
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
    
function removeItemButtonTriggerAction(furnitureItem, summaryItem, furnitureType, customId) {
    const roomObj = roomState.modelsList[roomState.roomType]; 
    let dbChildren = roomObj.dbChildren;
    const children = roomObj.scene.children;
    const childObj = children.find(child => child.userData.customId == customId);
    removeGLBModel(childObj);

    furnitureItem.remove();
    if(summaryItem) summaryItem.remove();
    
    if(furnitureType.includes('corner')) {
        const { 
            bottom: bottomCornerData, 
            top: topCornerData, 
            full: fullCornerData, 
        } = roomState.cornerFurnitureData;

        let { 
            id: cornerBottomFurnitureId, 
        } = bottomCornerData;
        let { 
            id: cornerTopFurnitureId, 
        } = topCornerData;
        let { 
            id: cornerFullFurnitureId, 
        } = fullCornerData;

        switch(furnitureType) {
            case FURNITURE_TYPE_BOTTOM_CORNER: {
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

    roomState.modelsList[roomState.roomType].dbChildren = dbChildren.filter(item => item.db_data.custom_id != customId);
    changeTotals();
}

function removeItemButtonTrigger(furnitureItem, customId, furnitureType) {
    const removeButton = furnitureItem.querySelector('.item-actions-container button[data-action_type="remove"]');
    const summaryItem = roomState.summaryItemsList.querySelector(`.cabinet-item[data-custom_id="${customId}"]`);


    if(!removeButton) {
        return;
    }

    removeButton.addEventListener('click', function(e) {
        e.preventDefault();
        removeItemButtonTriggerAction(furnitureItem, summaryItem, furnitureType, customId);
    });

}

 function changeCabinetsTab(tab, contents) {
    if(tab.classList.contains('active')) return;

    const currentTab = document.querySelector(currentTabBtnSelectorActive);
    const currentContents = document.querySelectorAll(currentContentsHtmlSelectorCurrent);

    if(currentTab) currentTab.classList.remove('active');
    if(currentContents.length) {
        currentContents.forEach((currentContent) => {
            currentContent.classList.remove('current');
        });
        
    }

    tab.classList.add('active');

    if(contents.length) {
        contents.forEach(content => {
            content.classList.add('current');
        });
        
    }
}

function openEditModal(userData, customId, actionTypeAdd = true) {
    const currentModel = roomState.modelsList[roomState.roomType];

    const furnitureItem = currentModel.dbChildren.find(item => item.custom_id == customId);

    if(!furnitureItem) return;

    const furnitureItemHtml = container.querySelector(`.cabinet-settings .my-cabinets-list .cabinet-item[data-custom_id="${customId}"]`);

    const productId = furnitureItem.product_id;
    const itemDbData = furnitureItem.db_data;

    const minWidth = itemDbData.min_width;
    const furnitureType = itemDbData.furniture_type;

    editContainerRemove();
    createEditModal(
        furnitureItemHtml, 
        furnitureItem, 
        productId, 
        furnitureType, 
        actionTypeAdd
    );
}

function createEditModal(
    itemHtml, 
    itemObj, 
    productId, 
    furnitureType, 
    actionTypeAdd = true
) {
    const { min_width, max_width, min_height, max_height, min_depth, max_depth, min_space_bottom, max_space_bottom, db_data } = itemObj;
    const { width, height, depth, space_bottom, custom_id } = db_data;

    highlightCurrentItem(custom_id);

    const minWidth = parseInt(min_width);
    const maxWidth = parseInt(max_width);
    const minHeight = parseInt(min_height);
    const maxHeight = parseInt(max_height);
    const minDepth = parseInt(min_depth);
    const maxDepth = parseInt(max_depth);
    const minSpaceBottom = parseInt(min_space_bottom);
    const maxSpaceBottom = parseInt(max_space_bottom);

    let html = `<div class="edit-container-inner"> <button type="button" data-action_type="go-back">Go Back</button>       
            <div class="list-container dimension-container" data-dimension_type="width" data-type="width" data-constant_name="itemWidth">
                <div class="dimension-container-inner">
                    ${renderInput('Width', width, minWidth, maxWidth)}
                    ${renderInput('Height', height, minHeight, maxHeight)}
                    ${renderInput('Depth', depth, minDepth, maxDepth)}
                    ${furnitureType !== DIMENSION_TYPE_TOP && furnitureType !== FURNITURE_TYPE_WALL_TOP ?
                        '' :
                        renderInput('Space Bottom', space_bottom, minSpaceBottom, maxSpaceBottom)}
                </div>
            </div>`;

        function renderInput(title, value, min, max) {

            const slug = title.toLowerCase().replace(' ', '_'); 
            const htmlItem = `<div class="dimensions-item">
                                    <div class="dimensions-item-inner">
                                    <h3>${title}</h3>
                                    <div class="input-container">
                                        <input type="number" name="${slug}" value="${value}" min="${min}" max="${max}">
                                        <span class="unit">mm</span>
                                    </div>
                                    <div class="slider-container">
                                        <input type="range" id="${slug}" name="${slug}" value="${value}" min="${min}" max="${max}">
                                    </div>
                                </div>
                            </div>`;

            return htmlItem;
        }

        if(actionTypeAdd) {
            html += `<div class="item-actions">
                <button type="button" data-action_type="add">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0.5" y="0.5" width="15" height="15" rx="8" fill="#2a568d" stroke="#2a568d"></rect><path d="M4.266 8L7.066 10.8L11.73 5.2" stroke="#ffffff" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dashoffset="0px" stroke-dasharray="1px 1px"></path></svg>
                    <span>Add</span>
                </button>
            </div>`;
        } 
        html += '</div>';

    const editContainer = itemHtml.closest('.cabinet-settings').querySelector('.edit-container');

    editContainer.innerHTML = html;
    editContainer.classList.add('active');
    const goBack = editContainer.querySelector('button[data-action_type="go-back"]');

    if(goBack) {
        goBack.addEventListener('click', function() {
            editContainer.classList.remove('active');
            editContainer.innerHTML = '';
            unhighlightGLBModels();
        });
    }

    changeItemDimensionValues(itemObj, itemHtml, actionTypeAdd);

    const addBtn = editContainer.querySelector('button[data-action_type="add"]');

    if(addBtn) {
        furnitureTypeAddInit(
            addBtn, 
            productId, 
            itemObj,
            editContainer
        );
    }

}

export function editContainerRemove() {
    const editContainers = container.querySelectorAll('.edit-container.active');

    editContainers.forEach(container => {
        container.classList.remove('active');
        container.innerHTML = '';
    });  
}

function changeItemDimensionValues(itemObj, itemHtml, actionTypeAdd = false, generalSettingsDimensionType = false, generalSettingsValue = false) {
    const dimentionsContainer = itemHtml?.closest('.cabinet-settings').querySelector('.edit-container .dimension-container');

    if(!dimentionsContainer && !generalSettingsDimensionType) return;

    const { furniture_type, min_width, min_height, min_depth, db_data} = itemObj;
    let custom_id = null;
    let dbChildren = [];
    let foundItemIndex = null;

    if(!actionTypeAdd) {
        custom_id = db_data.custom_id;
        dbChildren = roomState.modelsList[roomState.roomType].dbChildren;
        foundItemIndex = dbChildren.findIndex(dbChild => dbChild.db_data.custom_id == custom_id);

        if(foundItemIndex < 0) return;

    } else {
        custom_id = itemObj.product_id;
        dbChildren = roomState.modelsList[roomState.roomType].allProducts;  
        foundItemIndex = dbChildren.findIndex(dbChild => dbChild.product_id == custom_id);

        if(foundItemIndex < 0) return;
    }

    if(generalSettingsDimensionType) {
        changeDimension(generalSettingsDimensionType);
    } else {
        changeDimension('width');
        changeDimension('height');
        changeDimension('depth');
        changeDimension('space_bottom');
    }


    function changeDimension(type) {
        const valueHtml = itemHtml.querySelector(`.dimensions-info .${type}-value`);
       
        if(generalSettingsValue) {
            const typeMin = itemObj[`min_${type}`];
            const typeMax = itemObj[`max_${type}`];

            if(generalSettingsValue < typeMin) {
                generalSettingsValue = typeMin;
            } else if(generalSettingsValue > typeMax) {
                generalSettingsValue = typeMax;
            }
            changeValues(generalSettingsValue);
                
        } else {
            const rangeInput = dimentionsContainer.querySelector(`.slider-container input[type="range"][name="${type}"`);

            if(!rangeInput) return;
            const rangeNumInput = dimentionsContainer.querySelector(`.input-container input[type="number"][name="${type}"`);

            rangeInput.addEventListener('change', function(e) {
                let value = parseInt(e.target.value);
                rangeNumInput.value = value;
                changeValues(value);
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
                changeValues(value);
            });
        }

        function changeValues(value) {
            const foundItem = {...dbChildren[foundItemIndex]};
        
            foundItem.db_data[type] = value;

            dbChildren[foundItemIndex] = foundItem;

            const {width, height, depth, space_bottom, hasBrandTexture } = foundItem.db_data;

            if(valueHtml) {
                valueHtml.innerHTML = value;
            }
            
            if(!actionTypeAdd) {
                editGLBModelDimensions(custom_id, width, height, depth, space_bottom);
            }

            if(type !== SPACE_BOTTOM && !actionTypeAdd) {
                const newProductPrices = changeSingleProductPrice(
                    furniture_type,
                    width, 
                    min_width, 
                    height, 
                    min_height, 
                    depth, 
                    min_depth, 
                    db_data.prices, 
                    state.defaultTextures, 
                    hasBrandTexture,
                    state.defaultComponents
                );

                updateProductPricesHtml(custom_id, newProductPrices);
                changeTotals();
            }
        }
    }

}

function editGLBModelDimensions(customId, itemWidth, itemHeight, itemDepth, itemSpaceBottom) {
    const modelObj = roomState.modelsList[roomState.roomType];
    const children = modelObj.scene.children;

    const childObj = children.find(c => c.userData.customId == customId);
    if (!childObj) return;

    const userData = childObj.userData;
    const furnitureType = userData.furnitureType;

    const { modelWidth, modelHeight, modelDepth } = getFurnitureDimensionsFromMmtoPx(itemWidth, itemHeight, itemDepth);

    const spaceBottomPx = calculateTopSpaceIn3dModel(
        furnitureType, 
        itemSpaceBottom,
        modelObj.box,
    );

    // ---------- UPDATE CORNER DIMENSIONS ----------
    if (furnitureType.includes("corner")) {

        switch (furnitureType) {

            case FURNITURE_TYPE_BOTTOM_CORNER:
                roomState.worldItemsDimensions.width.bottomCorner = itemWidth;
                roomState.corner3DDimensions.cornerBottomWidth3d = modelWidth;
                break;

            case DIMENSION_TYPE_TOP_CORNER:
                roomState.worldItemsDimensions.width.top = itemWidth;
                roomState.corner3DDimensions.cornerTopWidth3d = modelWidth;
                break;

            case DIMENSION_TYPE_FULL_CORNER:
                roomState.worldItemsDimensions.full.top= itemWidth;
                roomState.corner3DDimensions.cornerFullWidth3d = modelWidth;
                break;
        }
    }

    // ---------- RESIZE ----------
    const originalSize = userData.originalSize;

    childObj.scale.set(modelWidth, modelHeight, modelDepth).divide(originalSize);

    const newScaledSize = new THREE.Vector3(modelWidth, modelHeight, modelDepth);

    userData.scaledSize.copy(newScaledSize);
    userData.widthMm = itemWidth;
    userData.heightMm = itemHeight;
    userData.depthMm = itemDepth;
    userData.spaceMm = itemSpaceBottom;

    // ---------- SAVE LOCAL POSITION ----------
    childObj.position.y = spaceBottomPx;
    const localPos = childObj.position.clone();
    userData.savedPosition = localPos.clone();

    // ---------- COLLISION CHECK ----------
    const isFitting = checkIfAbleToDragChildToPosition(childObj);

    // ---------- CALCULATE MM POSITION ----------
    const itemPositionMm = getItemPosition(
        furnitureType,
        localPos.clone(),
        newScaledSize.clone(),
        childObj.rotation.y,
        spaceBottomPx,
        customId
    );

    updateBgPlane(childObj);

    userData.positionMm = itemPositionMm;
    userData.isFitting = isFitting;

    const childWorldPos = new THREE.Vector3();
    childObj.getWorldPosition(childWorldPos);

    // ---------- VISUAL ERROR ----------
    if (!isFitting) {
        colorToRed(childObj);        
    } else {
        colorToDefault(childObj);
    }

    const itemIndex = modelObj.dbChildren.findIndex(
        item => item.db_data.custom_id == customId
    );

    if (itemIndex > -1) {

        const item = { ...modelObj.dbChildren[itemIndex] };

        item.width = itemWidth;
        item.db_data.width = itemWidth;
        item.db_data.height = itemHeight;
        item.db_data.depth = itemDepth;
        item.db_data.space_bottom = itemSpaceBottom;
        item.db_data.furniture_position_mm = JSON.stringify(itemPositionMm);
        item.db_data.is_fitting = isFitting;

        modelObj.dbChildren[itemIndex] = item;
    }
}   

function isProbablyCircle(obj) {
    const furnitureType = obj.userData.furnitureType;

    if (furnitureType === DIMENSION_TYPE_BOTTOM) {
        return true;
    }

    const size = obj.userData.scaledSize;
    if (!size) return false;
    // width/depth almost equal = maybe round/square
    const ratio = Math.abs(size.x - size.z) / Math.max(size.x, size.z);


    // only auto-detect as circle if product says it is round-ish
    return ratio < 0.08;
}

function getCollisionShape(obj) {
    const size = obj.userData.scaledSize;

    if (!size) return null;

    const rotatedSize = getFootprintSize(size, obj.rotation.y);

    const minY = obj.position.y;
    const maxY = obj.position.y + size.y;

    if (isProbablyCircle(obj)) {
        return {
            type: 'circle',
            x: obj.position.x,
            z: obj.position.z,
            r: Math.min(rotatedSize.x, rotatedSize.z) / 2,
            minY,
            maxY,
        };
    }

    return {
        type: 'rect',
        minX: obj.position.x - rotatedSize.x / 2,
        maxX: obj.position.x + rotatedSize.x / 2,
        minZ: obj.position.z - rotatedSize.z / 2,
        maxZ: obj.position.z + rotatedSize.z / 2,
        minY,
        maxY,
    };
}

function yOverlaps(a, b, tolerance = 1) {
    return a.minY < b.maxY - tolerance && a.maxY > b.minY + tolerance;
}

function rectRectOverlaps(a, b, tolerance = 1) {
    return (
        a.minX < b.maxX - tolerance &&
        a.maxX > b.minX + tolerance &&
        a.minZ < b.maxZ - tolerance &&
        a.maxZ > b.minZ + tolerance
    );
}

function circleCircleOverlaps(a, b, tolerance = 1) {
    const dx = a.x - b.x;
    const dz = a.z - b.z;
    const r = a.r + b.r - tolerance;

    return dx * dx + dz * dz < r * r;
}

function rectCircleOverlaps(rect, circle, tolerance = 1) {
    const closestX = Math.max(rect.minX, Math.min(circle.x, rect.maxX));
    const closestZ = Math.max(rect.minZ, Math.min(circle.z, rect.maxZ));

    const dx = circle.x - closestX;
    const dz = circle.z - closestZ;
    const r = circle.r - tolerance;

    return dx * dx + dz * dz < r * r;
}

function shapesOverlap(a, b, tolerance = 1) {
    if (!a || !b) return false;
    if (!yOverlaps(a, b, tolerance)) return false;

    if (a.type === 'circle' && b.type === 'circle') {
        return circleCircleOverlaps(a, b, tolerance);
    }

    if (a.type === 'rect' && b.type === 'rect') {
        return rectRectOverlaps(a, b, tolerance);
    }

    if (a.type === 'rect' && b.type === 'circle') {
        return rectCircleOverlaps(a, b, tolerance);
    }

    if (a.type === 'circle' && b.type === 'rect') {
        return rectCircleOverlaps(b, a, tolerance);
    }

    return false;
}

function checkIfAbleToDragChildToPosition(currentObj, excludeObjId = null) {
    const children = roomState.modelsList[roomState.roomType].scene.children;

    const currentShape = getCollisionShape(currentObj);

    for (const childObj of children) {
        if (childObj.id === currentObj.id) continue;
        if (excludeObjId && childObj.id === excludeObjId) continue;

        const childData = childObj.userData;
        if (!childData || (!childData.productId && !childData.pseudoType)) continue;

        const childShape = getCollisionShape(childObj);

        if (shapesOverlap(currentShape, childShape, 2)) {

            return false;
        }
    }

    return true;
}

function getItemPosition(furnitureType, currentPosition, currentSize, rotation, spaceBottomPx, id = null) {
    const { width, depth, height } = roomState.modelRoomDimensions;
    const { width: mmWidth, height: mmHeight, depth: mmDepth } = roomState.roomDimensions;

    const halfRoomWidth = width / 2;
    const halfRoomDepth = depth / 2;

    const rotatedSize = getFootprintSize(currentSize, rotation);

    const itemWidth = rotatedSize.x;
    const itemHeight = rotatedSize.y;
    const itemDepth = rotatedSize.z;

    const centerX = currentPosition.x;
    const centerY = currentPosition.y;
    const centerZ = currentPosition.z;

    const isLeftWall = Math.abs(rotation) > 0.01;

    let leftPx;
    let backPx;

    if (isLeftWall) {
        // left-wall item: saved "left" must come from Z axis
        leftPx = centerZ + halfRoomDepth - itemDepth / 2;

        // saved "back" means distance from left wall
        backPx = centerX + halfRoomWidth - itemWidth / 2;
    } else {
        // back-wall item
        leftPx = centerX + halfRoomWidth - itemWidth / 2;
        backPx = centerZ + halfRoomDepth - itemDepth / 2;
    }

    const rightPx = width - (leftPx + itemWidth);
    const frontPx = depth - (backPx + itemDepth);

    let bottomPx;
    let topPx;

    if (furnitureType.includes(DIMENSION_TYPE_TOP)) {
        bottomPx = spaceBottomPx;
        topPx = bottomPx + itemHeight;
    } else {
        bottomPx = centerY;
        topPx = height - (bottomPx + itemHeight);
    }

    const pxToMmX = mmWidth / width;
    const pxToMmY = mmHeight / height;
    const pxToMmZ = mmDepth / depth;

    const clamp = (v, max) => Math.max(0, Math.min(v, max));

    return {
        left: clamp(leftPx * (isLeftWall ? pxToMmZ : pxToMmX), isLeftWall ? mmDepth : mmWidth),
        back: clamp(backPx * (isLeftWall ? pxToMmX : pxToMmZ), isLeftWall ? mmWidth : mmDepth),
        right: clamp(rightPx * pxToMmX, mmWidth),
        front: clamp(frontPx * pxToMmZ, mmDepth),
        bottom: clamp(bottomPx * pxToMmY, mmHeight),
        top: clamp(topPx * pxToMmY, mmHeight),
    };
}
export function renderLighting(scene, renderer, dirLight, width, height, depth) {
    removeLighting(scene, renderer, dirLight);

    setupRendererForShadows(renderer);

    // Directional light should NOT create the main shadow.
    // It is only soft fill light now.
    addShadowElements(renderer, dirLight, width, height, depth);

    addCeilingLamps(scene, width, height, depth);

    renderLights(scene, renderer);
}
export function renderLighting2(scene, renderer, dirLight, width, height, depth) {
    removeLighting(scene, renderer);
    removeShadowElements(renderer, dirLight);

    addCeilingLamps(scene, width, height, depth);

    renderLights(scene, renderer);

    addShadowElements(renderer, dirLight, width, height, depth);
}

function setupRendererForShadows(renderer) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    renderer.outputColorSpace = THREE.SRGBColorSpace;

    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    if ('physicallyCorrectLights' in renderer) {
        renderer.physicallyCorrectLights = true;
    }
}

function addShadowElements(renderer, dirLight, width, height, depth) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    if (!dirLight) return;

    dirLight.castShadow = false;
    dirLight.intensity = 0.15;
}
function addShadowElements2(renderer, dirLight, width, height, depth) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    dirLight.castShadow = true;

    // ✅ stronger shadow-casting light
    dirLight.intensity = 3.5;

    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;

    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 1000;

    // ✅ tighter shadow camera = darker/clearer shadow
    const shadowSize = Math.max(width, depth) * 1.2;

    dirLight.shadow.camera.left = -shadowSize;
    dirLight.shadow.camera.right = shadowSize;
    dirLight.shadow.camera.top = shadowSize;
    dirLight.shadow.camera.bottom = -shadowSize;

    dirLight.shadow.bias = -0.0003;
    dirLight.shadow.normalBias = 0.01;
    dirLight.shadow.radius = 2;

    dirLight.shadow.camera.updateProjectionMatrix();
}

function removeShadowElements(renderer, dirLight) {
    renderer.shadowMap.enabled = false;

    if (!dirLight) return;

    dirLight.castShadow = false;

    if (dirLight.shadow?.map) {
        dirLight.shadow.map.dispose();
        dirLight.shadow.map = null;
    }
}
function removeShadowElements2(renderer, dirLight) {
    // renderer shadows OFF
    renderer.shadowMap.enabled = false;

    if (!dirLight) return;

    // disable shadow casting
    dirLight.castShadow = false;

    // dispose shadow map texture
    if (dirLight.shadow?.map) {
        dirLight.shadow.map.dispose();
        dirLight.shadow.map = null;
    }

    // optional: reset shadow settings
    dirLight.shadow.bias = 0;
    dirLight.shadow.normalBias = 0;
    dirLight.shadow.radius = 1;
}

function addCeilingLamps(scene, width, height, depth) {
    removeCeilingLamps(scene);

    const ceilingLampsGroup = new THREE.Group();
    ceilingLampsGroup.name = 'ceiling-lamps';

    const y = height + 80;

    function createLamp(x, z) {
        const light = new THREE.SpotLight(
            0xffffff,
            1800,
            height * 3,
            Math.PI / 3,
            0.45,
            1
        );

        light.position.set(x, y, z);
        light.target.position.set(x, 0, z);

        light.castShadow = true;

        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;

        light.shadow.camera.near = 1;
        light.shadow.camera.far = height * 4;

        light.shadow.bias = -0.0001;
        light.shadow.normalBias = 0.005;
        light.shadow.radius = 1;

        ceilingLampsGroup.add(light);
        ceilingLampsGroup.add(light.target);

        light.target.updateMatrixWorld();
    }

    const wallZ = -depth / 2 + WALL_THICKNESS / 2;

    createLamp(-width * 0.25, wallZ);
    createLamp(width * 0.25, wallZ);

    if (roomState.roomType === ROOM_TYPE_WITH_CORNER) {
        const wallX = -width / 2 + WALL_THICKNESS / 2;

        createLamp(wallX, -depth * 0.25);
        createLamp(wallX, depth * 0.25);
    }

    scene.add(ceilingLampsGroup);
}

function removeCeilingLamps(scene) {
    const ceilingLampsGroup = scene.getObjectByName('ceiling-lamps');

    if (!ceilingLampsGroup) return;

    ceilingLampsGroup.traverse((child) => {
        if (child.isLight && child.shadow?.map) {
            child.shadow.map.dispose();
        }
    });

    scene.remove(ceilingLampsGroup);
    ceilingLampsGroup.clear();
}
function addCeilingLamps2(scene, width, height, depth) {
    const  ceilingLampsGroup = new THREE.Group();
    ceilingLampsGroup.name = 'ceiling-lamps';

    const y = height - 2; // slightly below ceiling
    const intensity = 3000;
    const distance = Math.max(width, depth) * 2;

    function createLamp(x, z) {
        const light = new THREE.SpotLight(0xffffff, 800);

        light.position.set(x, y, z);

        // IMPORTANT: direction
        // ✅ FIX: correct direction
        light.target.position.set(x, 0, z);
    
        light.angle = Math.PI / 5;     // narrow cone
        light.penumbra = 0.5;          // soft edges
        light.decay = 1.5;
        light.distance = height * 2;

        // 🚀 performance saver
        light.castShadow = false;

        ceilingLampsGroup.add(light);
        ceilingLampsGroup.add(light.target);
    }

    // ---- 8 lamps (2 per wall) ----

    // back wall
    const wallZ = -depth / 2 + WALL_THICKNESS / 2;
    createLamp(-width * 0.25, wallZ);
    createLamp( width * 0.25, wallZ);

    // // front wall

    if(roomState.roomType === ROOM_TYPE_WITH_CORNER) {
        // left wall
        const wallX = -width / 2 + WALL_THICKNESS / 2;
        createLamp(wallX, -depth * 0.25);
        createLamp(wallX,  depth * 0.25);
    }

    scene.add(ceilingLampsGroup);
}


function switchBaseLightsIntensity(scene, renderer, state = LIGHT_STATE_DEFAULT) {
    const baseLights = scene.getObjectByName('base-lights');

    baseLights.traverse(obj => {
        switch (true) {
            case obj.isHemisphereLight:
                obj.intensity = state.hemi;
                break;

            case obj.isDirectionalLight:
                obj.intensity = state.dir;
                break;

            case obj.isAmbientLight:
                obj.intensity = state.ambient;
                break;
        }
    });

    renderer.toneMappingExposure = state.exposure;
}

function renderLights(scene, renderer) {

    const { width: roomWidth, height: roomHeight, depth: roomDepth } = roomState.roomDimensions;
    const { width: modelRoomWidth, height: modelRoomHeight, depth: modelRoomDepth } = roomState.modelRoomDimensions;

    renderer.physicallyCorrectLights = true;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9;

    let shadeGroup = scene.getObjectByName('shade-lamps');

    if (!shadeGroup) {
        shadeGroup = new THREE.Group();
        shadeGroup.name = 'shade-lamps';
        scene.add(shadeGroup);
    }

    shadeGroup.clear();

    const maxNum = 0.5;

    function createShadeSpot(x, y, z, intensity, distance, angle) {
        const light = new THREE.SpotLight(
            0xffffff,
            intensity,
            distance,
            angle,
            0.6,
            2
        );

        light.position.set(x, y, z);

        // IMPORTANT: keep target INSIDE group (same as ceiling lamps)
        light.target.position.set(x, 0, z);

        shadeGroup.add(light);
        shadeGroup.add(light.target);
    }

    for (let i = 0; i <= maxNum; i += 0.1) {

        // floor left
        createShadeSpot(
            (modelRoomWidth + modelRoomWidth * i) * -1,
            modelRoomHeight - WALL_THICKNESS * 2,
            modelRoomDepth / 4 * -1,
            roomWidth * 8,
            roomWidth * 9,
            Math.PI / 2
        );

        // floor right
        createShadeSpot(
            (modelRoomWidth + modelRoomWidth * i),
            modelRoomHeight - WALL_THICKNESS * 2,
            modelRoomDepth / 4 * -1,
            roomWidth * 8,
            modelRoomWidth * 10,
            Math.PI / 2
        );

        // wall right
        createShadeSpot(
            (modelRoomWidth + modelRoomWidth * i),
            modelRoomHeight - WALL_THICKNESS * 2,
            (modelRoomDepth / 2 * -1) + roomState.worldItemsDimensions.depth.full,
            roomWidth * 8,
            modelRoomWidth * 10,
            Math.PI / 1
        );

        // wall left
        createShadeSpot(
            (modelRoomWidth + modelRoomWidth * i) * -1,
            modelRoomHeight - WALL_THICKNESS * 2,
            (modelRoomDepth / 2 * -1) + roomState.worldItemsDimensions.depth.full,
            roomWidth * 8,
            modelRoomWidth * 10,
            Math.PI / 1
        );
    }

}

export function removeLighting(scene, renderer, dirLight) {
    removeCeilingLamps(scene);

    const shadeGroup = scene.getObjectByName('shade-lamps');
    if (shadeGroup) {
        scene.remove(shadeGroup);
        shadeGroup.clear();
    }

    removeShadowElements(renderer, dirLight);
    switchBaseLightsIntensity(scene, renderer);
}
export function removeLighting2(scene, renderer) {
    const oldCeilingLamps = scene.getObjectByName('ceiling-lamps');
   
    if(oldCeilingLamps) {
        oldCeilingLamps.traverse(obj => {
            if (obj.isLight) {
                obj.dispose?.();
            }
        });
        scene.remove(oldCeilingLamps);
    }

    const shadeGroup = scene.getObjectByName('shade-lamps');

    if (shadeGroup) {
        scene.remove(shadeGroup);
    }

    switchBaseLightsIntensity(scene, renderer);
}

export function applyBaseLighting(renderer, scene, lights) {
    renderer.toneMappingExposure = lightState.exposure;

    lights.ambient.intensity = lightState.ambient;
    lights.hemisphere.intensity = lightState.hemisphere;
    lights.directional.intensity = lightState.directional;
}

/********* AJAX *************/

async function loadMoreProductsByType(typeSlug, page, productsListPerPage, ajaxUrl) {
    try {
        let formData = new FormData();
        formData.append("action", "load_more_products");
        formData.append("furniture_type", typeSlug);
        formData.append("page", page);
        formData.append("per_page", productsListPerPage);

        const response = await fetch(ajaxUrl, {
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

async function addFurnitureItem(
        customId, 
        productObject,
        textures,
        countIndex = null
    ) {
    try {
        let formData = new FormData();
        formData.append("custom_id", customId);
        formData.append("product_object", JSON.stringify(productObject));
        formData.append("textures", JSON.stringify(textures));

        if(!roomState.postId) {
            formData.append("action", "add_furniture_item_to_config_v2_settings");
            formData.append("count_index", countIndex);
            formData.append("config_id", roomState.currentConfigId);
        } else {
            formData.append("action", "add_furniture_item_to_admin_config");
        }

        const response = await fetch(ajaxUrl, {
            method: "POST",
            body: formData,
        });

        const jsonData = await response.json();

        if(!jsonData.success || !jsonData.data?.my_item_html) return '';
        const data = jsonData.data;

        return data;
    } catch(e) {
        return '';
    }
}
