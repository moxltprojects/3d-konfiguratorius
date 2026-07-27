import * as THREE from './three/three.module.js';
import { OrbitControls } from './three/OrbitControls.js';
import { GLTFLoader } from './three/GLTFLoader.js';
import { DragControls } from './three/DragControls.js';
import { DecalGeometry } from  './three/DecalGeometry.js';
import * as BufferGeometryUtils from './three/BufferGeometryUtils.js';

import { 
    ROOM_TYPE_SINGLE_WALL,
    FURNITURE_TYPE_WALL_TOP,
    ROOM_TYPE_WITH_CORNER,
	FURNITURE_TYPE_BOTTOM,
    FURNITURE_TYPE_BOTTOM_CORNER,
    FURNITURE_TYPE_WALL,
    FURNITURE_COUNTERTOP,
    PRICE_CM_CHUNK,
	FRONT_TEXTURES,
    state,
    roomState,
    categoryState,
    changeInputFromRangeValue,
    setTextureLoader,
    getTextureSrc,
    generateSmartUVs,
    uniqLong,
    getFurnitureHeightDepthMm,
	addBgImageToFront,
	updateBgPlane,
    setBgPlanesVisibleForWrapper,
    getFootprintSize,
    getIsRotatedItem,
    getRotatedSize
	
} from './shared-scripts.js';

import { 
    changeProductsPrices,
    changeSingleProductPrice,
    getDisplayPrice,
} from './calculate-totals.js';

const DIMENSION_TYPE_BOTTOM = 'bottom';
const DIMENSION_TYPE_BOTTOM_CORNER = 'bottom-corner';
const DIMENSION_TYPE_TOP = 'top';
const DIMENSION_TYPE_TOP_CORNER = 'top-corner';
const DIMENSION_TYPE_FULL = 'full';
const DIMENSION_TYPE_FULL_CORNER = 'full-corner';

const DIMENSION_TYPE_HEIGHT = 'height';
const DIMENSION_TYPE_DEPTH = 'depth';
const DIMENSION_TYPE_WIDTH = 'width';

const FLOOR_THICKNESS = 20;
const WALL_THICKNESS = 20;
const BASIC_DISPLAY_X_PADDING_PX = 80;
const BOTTOM_DISPLAY_IMAGE = `${configDataRoom.assetsUrl}/models/3d-model.glb`;
const TOP_DISPLAY_IMAGE = `${configDataRoom.assetsUrl}/models/3d-model.glb`;
const FULL_DISPLAY_IMAGE = `${configDataRoom.assetsUrl}/models/3d-model.glb`;

let 
    container,
    saveDataButtonsContainer,
    furnitureDimensions,
    configSelector,
    modelScene, 
    roomModelBox,
    roomType,
    threeJSRendered, 
    room3DGroup, 
    threeJSCamera, 
    threeJSControls, 
    threeJSRenderedBasicDisplay, 
    basicDisplayScene, 
    threeJSCameraBasicDisplay,
    rootGroup,
    dragControls,
    userId,
    currentConfigId = null,
    currentTemplateConfigPostId = null,
    roomHeight = 0,
    roomWidth = 0,
    roomDepth = 0;


window.initRoomConfigComponent =  async function initRoomConfigComponent(userConfigId = null, templateData = null) {
    container = document.querySelector('.display-type-container, .room-config-shortcode');
    let {
        content,
        all_products,
        products_list,
        products_list_per_page,
        room_dimensions,
        furniture_dimensions,
        corner_furniture_data,
        default_textures,
        total,
        currency_symbol,
        user_id, 
        // components,
        // selected_furniture_types,
        // default_textures,
        // products_textures_settings
    } = await getRoomConfigComponentShortcodeContent(userConfigId, templateData);

    userId = user_id;

    if(!content) return;

    container.innerHTML = content;

    container = container.querySelector('.room-config-container');

    roomState.allProducts = all_products;
    roomState.dbChildren = products_list;
    furnitureDimensions = furniture_dimensions;

    initRoomConfigFunctions(
        container, 
        default_textures,
        room_dimensions, 
        corner_furniture_data, 
        products_list_per_page, 
        total, 
        currency_symbol,
    );
}

function initTextures(defaultTextures){
    state.defaultTextures = {...defaultTextures};
    for (const [key, value] of Object.entries(defaultTextures)) {
        setTextureLoader(key, value.thumbnail);
    }
}

function initRoomConfigFunctions(
    container, 
    textures,
    roomDimensions, 
    cornerFurnitureData,
    productsListPerPage, 
    total, 
    currencySymbol
) {
    initTextures(textures);

    const assetsUrl = configDataRoom.assetsUrl;

    let { room_type: roomTypeTemp, height: roomHeightTemp, depth: roomDepthTemp, width: roomWidthTemp } = roomDimensions;
    roomType = roomTypeTemp;
    roomHeight = roomHeightTemp;
    roomWidth = roomWidthTemp;
    roomDepth = roomDepthTemp;

    let { 
        largest_height: largestHeight,
    } = furnitureDimensions;

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
        id: cornerFullFurnitureId, 
        width: cornerFullWidth, 
        depth: cornerFullDepth,
    } = fullCornerData;

    let basicDisplayObj = {
        bottom: null,
        top: null,
        full: null,
    }

    let defaultBottomReferenceY = 0;
    let modelRoomWidth = 0;
    let modelRoomHeight = 0;
    let modelRoomDepth = 0;
    let modelRoomScaleX = 0;
    let modelRoomScaleY = 0;
    let modelRoomScaleZ = 0;

    let cornerBottomWidth3d = 0;
    let cornerBottomHeight3d = 0;
    let cornerBottomSpace3d = 0;
    let cornerBottomDepth3d = 0;
    let cornerTopWidth3d = 0;
    let cornerTopHeight3d = 0;
    let cornerTopDepth3d = 0;
    let cornerFullWidth3d = 0;
    let cornerFullDepth3d = 0;

    let isSummaryStep = false;

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
        // bottomSpace: {
        //     bottom: 0,
        //     bottomCorner: 0,
        // }
    };

    let modelSettings = {
        visibleDimensionsArrows: false,
    }

    state.model3dContainer = container.querySelector('.model-display-container .room-model-container-inner');
    configSelector = container.querySelector('.configurator-selector select');
    saveDataButtonsContainer = container.querySelector('.save-data-container .buttons-list');

    const zoomSlider = container.querySelector('.model-settings-sidebar .zoom-slider input[type="range"]');

    /******** progress ********/
    const progressBar = container.querySelector('.top-bar .config-progress-bar');
    const allProgressButtons = progressBar.querySelectorAll('button'); 
    let oldCurrentProgressButton = progressBar.querySelector(`button.current`);
    let currentStep = parseInt(container.getAttribute('data-progress'));
    const stepsContainer = document.querySelector('.steps-content');

    const myCabinetContent = container.querySelector('.my-cabinets-list');
    const myItemsList = myCabinetContent.querySelector('.my-cabinets-list-inner');
    const totalContainer = container.querySelector('.total-container .total-container-inner .number');
    const dynamicLists = container.querySelectorAll('.dynamic-list-inner');
    const summaryItemsList = container.querySelector('.summary-cabinets-list-inner');

    const roomConfigSummary = container.querySelector('.room-config-summary');
    const bottomSummaryItemsList = roomConfigSummary.querySelector('.room-config-summary-items');

    const myCabinetTab = container.querySelector('.tabs button[data-type="my-cabinets"]');
    let basicDisplayContainer = container.querySelector('.progress-content .general-settings .display-container .general-settings-display-image .general-image-inner');

    const injectPopupContainer = document.querySelector('#inject-popup-container');
    
    toggleAccordions();

    initSettingsSave();
    initSettingsConfigChange();
    initTemplateSelector();
    progressInit();
    initCabinetTabs();
    initCabinetTypes();
    renderBasicImage3dContainer();
    initRoomType(true);
    changeRoomType();
    initRoomModelSettings();

    // initDuplicateFurnitureMethod();
    // initExistingFurnitureEditMethod();

    changeInputFromRangeValue(container);
    changeRoomDimensionsValue(container);
    // changeFurnitureDimensionsValue(container);
    changeProductsOptions();
    initAddFurnitureMethod();
    loadMoreProducts(productsListPerPage);
    initAddToCart();

    function progressInit() {
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
            });
        }

        if(nextButton) {
            nextButton.addEventListener('click', function(e) {
                e.preventDefault();
                const nextStep = currentStep < maxSteps ? currentStep + 1 : currentStep;
                currentStep = nextStep;
                container.setAttribute('data-progress', nextStep);

                changeCurrentProgressButton(nextStep);
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
            });
        });
        
        function changeCurrentProgressButton(step) {
            const newButton = progressBar.querySelector(`button[data-step="${step}"]`);
            newButton.classList.add('current');

            if(oldCurrentProgressButton) {
                oldCurrentProgressButton.classList.remove('current');
            }

            oldCurrentProgressButton = newButton;

            if (step >= 3) {
                if ( roomConfigSummary.classList.contains('hidden') ) {
                    roomConfigSummary.classList.remove('hidden');
                }
            } else {
                if ( !roomConfigSummary.classList.contains('hidden') ) {
                    roomConfigSummary.classList.add('hidden');
                }
            }
    
            if(step == 5) {
                isSummaryStep = true;

                removeAllFurnitureControls();
                removeAllFurnitureButtons();
            } else {
                isSummaryStep = false;
            }
        }

    }

    function changeRoomDimensionsValue() {
        const dimensionsItemContainers = container.querySelectorAll('.room-layout .dimension-container');
        
        dimensionsItemContainers.forEach(dimensionsContainer => {
            const type = dimensionsContainer.getAttribute('data-dimension_type');
            const rangeInput = dimensionsContainer.querySelector('.slider-container input[type="range"]');
            const rangeNumInput = dimensionsContainer.querySelector('.input-container input[type="number"]');

            rangeInput.addEventListener('change', function(e) {
                const value = parseInt(e.target.value);
                rangeNumInput.value = value;
                
                changeDimensionValueSwitch(type, value);
                roomDimensions[type] = value;

                initRoomType();
            });

            rangeNumInput.addEventListener('change', function(e) {
                const value = parseInt(e.target.value);
                rangeNumInput.value = value;
                
                changeDimensionValueSwitch(type, value);

                roomDimensions[type] = value;

                initRoomType();
            });
        });

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

    // function changeFurnitureDimensionsValue() {
    //     const dimensionsItemContainers = container.querySelectorAll('.general-settings .dimension-container');
        
    //     dimensionsItemContainers.forEach(dimensionsContainer => {
    //         const dimensionType = dimensionsContainer.getAttribute('data-dimension_type');
    //         const furnitureType = dimensionsContainer.getAttribute('data-furniture_type');
    //         const rangeInput = dimensionsContainer.querySelector('.slider-container input[type="range"]');
    //         const rangeNumInput = dimensionsContainer.querySelector('.input-container input[type="number"]');
    //         const addProductHtmls = container.querySelectorAll(`.furniture-types-list-container .furniture-types-list .furniture-type[data-slug="${furnitureType}"] .cabinet-item`);

    //         rangeInput.addEventListener('change', function(e) {
    //             const value = parseInt(e.target.value);
    //             rangeNumInput.value = value;

    //             if(furnitureType === '') {
    //                 furnitureDimensions[dimensionType].current = value;
    //             } else {
    //                 furnitureDimensions[furnitureType][dimensionType] = value;
    //             }
                
    //             changeBaseImageDimensions();
    //             changeModelChildrenDimensions(furnitureType, furnitureDimensions[furnitureType]);
    //             changeAddItemsHtmls(addProductHtmls, dimensionType, value);
    //             changeExistinItemsHtmls(furnitureType, dimensionType, value);

    //             changeTotals();
    //         });
			
	// 		rangeNumInput.addEventListener('change', function(e) {
    //             const value = parseInt(e.target.value);
    //             rangeInput.value = value;

    //             if(furnitureType === '') {
    //                 furnitureDimensions[dimensionType].current = value;
    //             } else {
    //                 furnitureDimensions[furnitureType][dimensionType] = value;
    //             }
                
    //             changeBaseImageDimensions();
    //             changeModelChildrenDimensions(furnitureType, furnitureDimensions[furnitureType]);
    //             changeAddItemsHtmls(addProductHtmls, dimensionType, value);
    //             changeExistinItemsHtmls(furnitureType, dimensionType, value);

    //             changeTotals();
    //         });
    //     });

    //     function changeAddItemsHtmls(items, attribute, value) {
    //         items.forEach(item => {
    //             item.setAttribute(`data-item_${attribute}`, value);
    //         });
    //     }

    //     function changeExistinItemsHtmls(furnitureType, attribute, value) {
    //         const existingItems = container.querySelectorAll(
    //             `.cabinet-settings .my-cabinets-list .my-cabinet-item[data-item_data*='"furniture_type":"${furnitureType}"']`
    //         );            

    //         existingItems.forEach(item => {
    //             item.setAttribute(`data-item_${attribute}`, value);
    //         });
    //     }

    // }

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
            roomState.dbChildren = [];
            changeTotals()

            dynamicLists.forEach(html => {
                html.innerHTML = '';
            });
        }

        init3dModel(state.model3dContainer);
    }

    function initRoomModelSettings() {
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

        const btnZoomIn = container.querySelector('.model-settings-sidebar button[data-type="zoom-in"]');
        const btnZoomOut = container.querySelector('.model-settings-sidebar button[data-type="zoom-out"]');
        const ZOOM_STEP = 0.1; 

        btnZoomIn.addEventListener('click', function(e) {
            e.preventDefault();

            let value = parseFloat(zoomSlider.value);

            value *= (1 - ZOOM_STEP); // zoom in

            value = Math.max(value, threeJSControls.minDistance);

            zoomSlider.value = value;
            zoomSlider.dispatchEvent(new Event('input'));
            
        });

        btnZoomOut.addEventListener('click', function(e) {
            e.preventDefault();

            let value = parseFloat(zoomSlider.value);

            value *= (1 + ZOOM_STEP); // zoom in

            value = Math.max(value, threeJSControls.minDistance);

            zoomSlider.value = value;
            zoomSlider.dispatchEvent(new Event('input'));
            
        });

        zoomSlider.addEventListener('input', function () {
            setZoomForAll(parseFloat(this.value));
            // const model = getActiveModel();
            // const camera = model.threeJSCamera;
            // const controls = model.threeJSControls;

            // const distance = parseFloat(this.value);

            // const direction = new THREE.Vector3()
            //     .subVectors(camera.position, controls.target)
            //     .normalize();

            // camera.position.copy(
            //     controls.target.clone().add(direction.multiplyScalar(distance))
            // );

            // controls.update();
        });

        const btnResetView = container.querySelector('.model-settings-sidebar button[data-type="reset-view"]');
        
        btnResetView.addEventListener('click', function(e) {
            e.preventDefault();
            smoothReset(threeJSControls);
        });

        function smoothReset(controls, duration = 600) {
            const camera = controls.object;

            const startPos = camera.position.clone();
            const startTarget = controls.target.clone();
            const startZoom = camera.zoom;

            const endPos = controls.position0.clone();
            const endTarget = controls.target0.clone();
            const endZoom = controls.zoom0;

            let startTime = null;

            function animate(time) {
                if (!startTime) startTime = time;

                const elapsed = time - startTime;
                const t = Math.min(elapsed / duration, 1);

                // easeInOut (smooth feeling)
                const ease = t < 0.5
                    ? 2 * t * t
                    : 1 - Math.pow(-2 * t + 2, 2) / 2;

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

    function setZoomForAll(distance) {
        if (!threeJSCamera) return;

        const direction = new THREE.Vector3()
            .subVectors(threeJSCamera.position, threeJSControls.target)
            .normalize();

        threeJSCamera.position.copy(
            threeJSControls.target.clone().add(direction.multiplyScalar(distance))
        );

        threeJSControls.update();
    }

    function setZoomSettingsValues(threeJSCamera, threeJSControls) {
        const currentDistance = threeJSCamera.position.distanceTo(threeJSControls.target);
        zoomSlider.min = threeJSControls.minDistance;
        zoomSlider.max = threeJSControls.maxDistance;
        zoomSlider.value = currentDistance;
    }

    function updateZoomSlider(camera, controls) {

        const distance = camera.position.distanceTo(controls.target);

        const currentValue = parseFloat(zoomSlider.value);

        if (Math.abs(currentValue - distance) > 0.1) {
            zoomSlider.value = distance.toString();
            zoomSlider.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    function loadMoreProducts(productsListPerPage) {
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
                const { content, is_last_page, new_products } = await loadMoreProductsByType(typeSlug, page, productsListPerPage);

                container.innerHTML += content;

                roomState.allProducts.concat(new_products);
                console.log(roomState.allProducts)

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

    function changeProductsOptions() {
        const items = container.querySelectorAll('.room-config-summary-item')
        console.log("change opts")
        items.forEach(item => {
            changeSingleProductOptions(item);
        });
    }

    function changeSingleProductOptions(product) {
        const customId = product.getAttribute('data-custom_id');
        // const correspondingProduct = roomState.dbChildren.find(dbItem => dbItem.db_data.customId == customId);
        const productObj = roomState.dbChildren.find(item => item.db_data?.custom_id == customId);

        if(!productObj) return;

        const items = product.querySelectorAll('.room-config-summary-item-options .option-item');
        const allOptionsArr = productObj.all_options;

        items.forEach(item => {
            const checkbox = item.querySelector('input');
            const value = checkbox.value;

            const currentOpt = allOptionsArr.find(allOption => allOption.option.option_slug == value);

            if(currentOpt) {
                const currentOptObj = currentOpt.option;
                const itemPrices = currentOptObj.prices;
                const allSubitems = currentOptObj.subitems;

                if(allSubitems && allSubitems.length) {
                    const openPopupBtn = item.querySelector('.show-subitems-container button');

                    if(openPopupBtn) {
                        openPopupBtn.addEventListener('click', function(e) {
                            e.preventDefault();
                            createOptionsPopup(currentOptObj, item, checkbox, allSubitems, value);
                        });
                    }
                }
    
                checkbox.addEventListener('change', function(e) {
                    const tempObj = roomState.dbChildren.find(item => item.db_data?.custom_id == customId);
                    const correspondingProduct = {...tempObj};

                    if(!correspondingProduct) return;

                    const dbData = correspondingProduct.db_data;

                    let oldOptions = correspondingProduct.db_data.options;
                    
                    const optionIndex = oldOptions.findIndex(item => item.slug === value)
                    if(optionIndex > -1) {
                        oldOptions.splice(optionIndex, 1);
                    } else {
                        if(!allSubitems || !allSubitems.length) {
                            const newObj = {
                                slug: value,
                                prices: itemPrices,
                            }
                            oldOptions.push(newObj);
                        } else {
                            e.preventDefault();
                            checkbox.checked = false;
                            createOptionsPopup(correspondingProduct, item, checkbox, allSubitems, value);
                            return;
                        }
                    }
                    modifyDataAndTotalsAfterOptionChange(correspondingProduct, dbData, oldOptions);
                });
            }
            
        });

        function modifyDataAndTotalsAfterOptionChange(correspondingProduct, dbData, oldOptions) {
            correspondingProduct.db_data.options = oldOptions;
            
            const newProductPrices = changeSingleProductPrice(
                correspondingProduct.furniture_type,
                dbData.width,
                correspondingProduct.min_width,
                dbData.height,
                correspondingProduct.min_height,
                dbData.depth,
                correspondingProduct.min_depth,
                dbData.prices,
                oldOptions,
                state.defaultTextures, 
                dbData.has_brand_texture,
                state.defaultComponents
            );

            correspondingProduct.prices = newProductPrices;
            
            const productIndex = roomState.dbChildren.findIndex(item => item.db_data?.custom_id == customId);
            if(productIndex < 0) return;

            roomState.dbChildren[productIndex] = {...correspondingProduct};
            console.log(roomState.dbChildren)

            updateProductPricesHtml(customId, newProductPrices);
            changeTotals();
        }


        function createOptionsPopup(option, optionHtml, parentCheckbox, allSubitems, optionSlug) {
            if(!injectPopupContainer) return;

            const productObj = roomState.dbChildren.find(item => item.db_data?.custom_id == customId);
            const currentSelectedOpt = productObj?.db_data?.options?.find(opt => opt.slug == optionSlug);

            const selectedSubitems = currentSelectedOpt?.subitems;
            const selectedSubitemsSlugs = selectedSubitems ? 
                selectedSubitems.map(subItem =>
                    subItem?.slug ?? null
                ) : 
                [];
console.log(selectedSubitemsSlugs)
            let popupHtml = `<div class="room-config-summary-item-popup-container">
                <div class="room-config-summary-item-popup-container-inner">
                    <div class="room-config-summary-item-popup">
                        <div class="room-config-summary-item-popup-inner">
                            <div class="close-btn-container">
                                <button type="button" class="close-btn">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="x" class="lucide lucide-x"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                                </button>
                            </div>
                            <div class="room-config-summary-item-popup-inner-content-wrapper">
                                <div class="room-config-summary-item-popup-inner-content-wrapper-inner">
                                    <div class="desc">
                                        <h3>Landing page options</h3>
                                        <p>Depending on your needs, choose the layout from the visuals below.  We will professionaly set it up and incorporate to your current website. The cost includes 2 hours of strategical calls.</p>
                                    </div>
                                    <fieldset>`;

            allSubitems.forEach(optionSubitem => {
                optionSubitem = optionSubitem.subitem;
                const subitemSlug = optionSubitem.option_slug;
                const subitemLabel = optionSubitem.label;
                const image = optionSubitem.image;
                const prices = optionSubitem.prices;
                const subitemPrice = getDisplayPrice(prices.regular, prices.discount);
                const checkedSubitem = selectedSubitemsSlugs.includes(subitemSlug)
                    ? 'checked'
                    : '';

                popupHtml += `<div class="option-item">
                    <label>
                        <div class="text-block">
                            <span class="pseudo pseudo-box"></span>
                            <input type="radio" id="${subitemSlug}" name="option_${optionSlug}" value="${subitemSlug}" ${checkedSubitem}/>
                            <span class="pseudo pseudo-checked"></span>
                            ${subitemLabel}: +&nbsp;
                            <span class="price-num">${subitemPrice}</span> eur
                        </div>
                        ${image ? `<div class="image-block"><img src="${image}"/></div>` : ''}
                    </label>
                </div>`;
            });

        popupHtml += `</fieldset>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;

            injectPopupContainer.innerHTML = popupHtml;

            const popupHtmlItem = document.querySelector('.room-config-summary-item-popup-container');

            setTimeout(() => {
                popupHtmlItem.classList.add('loaded');
            }, 1200);

            closePopupMethod(popupHtmlItem);
            changeSubitemsInputsMethods(popupHtmlItem, optionHtml, parentCheckbox, allSubitems, optionSlug);
        }

        function changeSubitemsInputsMethods(popupHtml, parentHtml, parentCheckbox, allSubitems, parentSlug) {
            const options = popupHtml.querySelectorAll('.option-item input');
            const parentNumHtml = parentHtml.querySelector('.price-num');

            options.forEach(option => {
                const value = option.value
                const currentSubitemOpt = allSubitems.find(allSubitem => allSubitem.subitem.option_slug == value);

                if(currentSubitemOpt) {
                    const currentSubitemObj = currentSubitemOpt.subitem;
                    const prices = currentSubitemObj.prices;

                    option.addEventListener('change', function(e) {
                        const productIndex = roomState.dbChildren.findIndex(item => item.db_data?.custom_id == customId);
                        if(productIndex < 0) return;

                        const correspondingProduct = {...roomState.dbChildren[productIndex]};
                        const dbData = correspondingProduct.db_data;
                        let oldOptions = correspondingProduct.db_data.options;

                        parentCheckbox.checked = true;

                        const newObj = {
                            slug: parentSlug,
                            prices: prices,
                            subitems: [{
                                slug: value,
                                prices: prices,
                            }]
                        };

                        parentNumHtml.innerHTML = getDisplayPrice(prices.regular, prices.discount);
                        oldOptions.push(newObj);

                        modifyDataAndTotalsAfterOptionChange(correspondingProduct, dbData, oldOptions);
                    });

                    
                }
               
            });

            
        }

        function closePopupMethod(popup) {
            if(!popup) return;

            popup.addEventListener('click', function(e) {
                const target = e.target;
                console.log(target)
                if(target.classList.contains('close-btn')) {
                    e.preventDefault();
                }

                if(
                    target.classList.contains('room-config-summary-item-popup-inner') ||
                    target.closest('.room-config-summary-item-popup-inner') && 
                    !target.classList.contains('close-btn-container') && 
                    !target.closest('.close-btn-container')
                ) {
                    return;
                }

                popup.classList.remove('loaded');

                setTimeout(() => {
                    popup.remove();
                }, 1200);
                
            });

        }
        
    }

    function updateProductPricesHtml(customId, prices) {
        const myCabinetSummaryHtml = container.querySelector(`.summary-cabinets-list .summary-cabinet-item[data-custom_id="${customId}"]`);
        const summaryHtml = container.querySelector(`.room-config-summary .room-config-summary-item[data-custom_id="${customId}"]`);

        const displayPrice = prices.display_total;

        [myCabinetSummaryHtml, summaryHtml].forEach(block => {
            const numHtml = block.querySelector('.price-data .price-num');
            numHtml.innerHTML = displayPrice;
        });

    }

    function initAddFurnitureMethod() {
        const addFurnitureButtons =  container.querySelectorAll('.add-cabinet-item .item-actions-container button[data-action_type="add"]');
        addFurnitureButtons.forEach(furnitureButton => {
            const parent = furnitureButton.closest('.add-cabinet-item');
            const productId = parent.getAttribute('data-product_id');
            // const itemData = JSON.parse(parent.getAttribute('data-item_data'));
            // const hasBrandTexture = item.getAttribute('data-hasBrandTexture');
            // const productId = itemData.product_id;
            const itemObj = roomState.allProducts.find(allProduct => allProduct.product_id == productId);
            const hasBrandTexture = itemObj.has_brand_texture;
            // let {
            //     regular: regularPrice, 
            //     regular_cm3: regularPriceCm3,
            //     discount: discountPrice, 
            //     discount_cm3: discountPriceCm3,
            //     display: displayPrice,
            //     display_cm3: displayPriceCm3,
            // } = itemData.prices;

            // regularPrice = regularPrice ? parseFloat(regularPrice) : 0.00; 
            // regularPriceCm3 = regularPriceCm3 ? parseFloat(regularPriceCm3) : 0.00;
            // discountPrice = discountPrice ? parseFloat(discountPrice) : 0.00; 
            // discountPriceCm3 = discountPriceCm3 ? parseFloat(discountPriceCm3) : 0.00; 
            // discountPriceCm3 = discountPriceCm3 ? parseFloat(discountPriceCm3) : 0.00; 
            // displayPrice = displayPriceCm3 ? parseFloat(displayPrice) : 0.00; 
            // displayPriceCm3 = displayPriceCm3 ? parseFloat(displayPriceCm3) : 0.00; 

            // const furnitureType = itemObj.furniture_type;
            // const modelFileSrc = itemObj.model_src;
            // const itemMinWidth = itemObj.min_width;

            furnitureTypeAddInit(
                furnitureButton, 
                itemObj, 
                productId, 
                // furnitureType,
                // modelFileSrc, 
                // itemMinWidth, 
                // itemObj.min_height,
                // itemObj.max_height,
                // itemObj.min_depth,
                // itemObj.max_depth,
                // itemObj.min_space_bottom,
                // itemObj.max_space_bottom,
                // itemObj.prices,
                hasBrandTexture,
                // displayPrice, 
                // regularPrice, 
                // discountPrice, 
                // displayPriceCm3,
                // regularPriceCm3,
                // discountPriceCm3
            );

        });
    }

    function changeCabinetsTab(tab, content) {
        if(tab.classList.contains('active')) return;

        const currentTab = container.querySelector('.cabinet-settings .main-settings-sidebar .cabinets .tabs button.active');
        const currentContent = container.querySelector('.cabinet-settings .main-settings-sidebar .cabinets .content .content-inner > .tab-content.current');

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

    function typesEditInit() {
        // const furnitureItems = container.querySelectorAll('.cabinet-settings .furniture-type-list .add-cabinet-item');

        // furnitureItems.forEach(furnitureItem => {
        //     const editBtn = furnitureItem.querySelector('.item-actions-container button[data-action_type="edit"]');
        //     const productId = furnitureItem.getAttribute('data-product_id');
        //     const itemObj = roomState.allProducts.find(product => product.product_id == productId);
        //     const { model_src, furniture_type, min_width } = itemObj;
        //     // const itemData = JSON.parse(furnitureItem.getAttribute('data-item_data'));
        //     // const productId = itemData.product_id;
        //     // const furnitureType = itemData.furniture_type;
        //     // const modelFileSrc = itemData.model_src;
        //     // const minWidth = itemData.min_width;

        //     // const {
        //     //     regular: regularPrice, 
        //     //     regular_cm3: regularPriceCm3,
        //     //     discount: discountPrice, 
        //     //     discount_cm3: discountPriceCm3,
        //     //     display: displayPrice,
        //     //     display_cm3: displayPriceCm3,
        //     // } = itemData.prices;
            

        //     editBtn.addEventListener('click', function(e) {
        //         e.preventDefault();
        //         const itemObj = roomState.dbChildren.find(dbChild => dbChild.db_data.custom_id == customId);
        //         // const { width, height, depth, space_bottom } = itemObj;
        //         // const itemWidth = furnitureItem.getAttribute('data-item_width');
        //         // const itemHeight = furnitureItem.getAttribute('data-item_height');
        //         // const itemDepth = furnitureItem.getAttribute('data-item_depth');
        //         // const itemSpaceBottom = furnitureItem.getAttribute('data-item_space_bottom');

        //         createEditModal(
        //             furnitureItem, 
        //             itemObj, 
        //             productId, 
        //             furniture_type, 
        //             model_src, 
        //             // width, 
        //             // height, 
        //             // depth, 
        //             // space_bottom,
        //             // min_width, 
        //             // itemObj.prices,
        //             // // displayPrice, 
        //             // // regularPrice, 
        //             // // discountPrice, 
        //             // // displayPriceCm3, 
        //             // // regularPriceCm3, 
        //             // // discountPriceCm3, 
        //             // // displayPriceCm3
        //         );
        //     });
        // });

        roomState.allProducts.forEach(furnitureItem => {
            const productId = furnitureItem.product_id;
            const htmlItem = document.querySelector(`.cabinet-settings .furniture-type-list .add-cabinet-item[data-product_id="${productId}"]`);
            const editBtn = htmlItem.querySelector('.item-actions-container button[data-action_type="edit"]');
            const { model_src, furniture_type, min_width } = furnitureItem;
            // const itemData = JSON.parse(furnitureItem.getAttribute('data-item_data'));
            // const productId = itemData.product_id;
            // const furnitureType = itemData.furniture_type;
            // const modelFileSrc = itemData.model_src;
            // const minWidth = itemData.min_width;

            // const {
            //     regular: regularPrice, 
            //     regular_cm3: regularPriceCm3,
            //     discount: discountPrice, 
            //     discount_cm3: discountPriceCm3,
            //     display: displayPrice,
            //     display_cm3: displayPriceCm3,
            // } = itemData.prices;
            

            editBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const itemObj = roomState.allProducts.find(dbChild => dbChild.product_id == productId);
                // const { width, height, depth, space_bottom } = itemObj;
                // const itemWidth = furnitureItem.getAttribute('data-item_width');
                // const itemHeight = furnitureItem.getAttribute('data-item_height');
                // const itemDepth = furnitureItem.getAttribute('data-item_depth');
                // const itemSpaceBottom = furnitureItem.getAttribute('data-item_space_bottom');

                createEditModal(
                    htmlItem, 
                    itemObj, 
                    productId, 
                    furniture_type, 
                    model_src, 
                    // width, 
                    // height, 
                    // depth, 
                    // space_bottom,
                    // min_width, 
                    // itemObj.prices,
                    // // displayPrice, 
                    // // regularPrice, 
                    // // discountPrice, 
                    // // displayPriceCm3, 
                    // // regularPriceCm3, 
                    // // discountPriceCm3, 
                    // // displayPriceCm3
                );
            });
        });
    }


    async function initFurnitureDuplicateData(currentCustomId) {
        const currentObj = modelScene.children.find(child => 
            child.userData.customId == currentCustomId
        );

        if(!currentObj) return;

        const newCustomId = await duplicateFurniture(currentCustomId, true);

        openEditModal(currentObj.userData, newCustomId, false);
    }

    async function initFurnitureRotation(currentCustomId) {
        const currentObj = modelScene.children.find(child => 
            child.userData.customId == currentCustomId
        );

        if(!currentObj) return;

        const baseRotation = currentObj.userData.rotation ?? 0;
        const newRotation = parseFloat(baseRotation) + parseFloat(Math.PI / 4);
        currentObj.rotation.y = newRotation;
        currentObj.userData.rotation = newRotation;
        currentObj.userData.rotatedManually = true;
        currentObj.userData.rotatedManuallyOld = false;

        const itemIndex = roomState.dbChildren.findIndex(item => item.db_data?.custom_id == currentCustomId);

        if(itemIndex > -1) {
            const oldItem = {...roomState.dbChildren[itemIndex]};
            oldItem.db_data.rotation = newRotation;
            roomState.dbChildren[itemIndex] = {...oldItem};

            console.log(roomState.dbChildren)
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
    }

    function initFurnitureRemoveData(customId) {
        const furnitureItem = container.querySelector(`.my-cabinets-list .cabinet-item[data-custom_id="${customId}"]`);
        if(!furnitureItem) return;

        const itemObj = roomState.dbChildren.find(dbChild => dbChild.db_data.custom_id == customId);
        if(!itemObj) return;
        const furnitureType = itemObj.db_data.furniture_type;
        // const itemData = JSON.parse(furnitureItem.getAttribute('data-item_data'));
        // const furnitureType = itemData.furniture_type;
        const summaryItem = summaryItemsList.querySelector(`.cabinet-item[data-custom_id="${customId}"]`);

        const bottomSummaryItem = bottomSummaryItemsList.querySelector(`.room-config-summary-item[data-custom_id="${customId}"]`);
    
        removeItemButtonTriggerAction(furnitureItem, summaryItem, bottomSummaryItem, furnitureType, customId);
    }

    function initExistingFurnitureEditMethod() {
        // const items = myItemsList.querySelectorAll('.my-cabinet-item');
        roomState.dbChildren.forEach(item => {
            // const itemData = JSON.parse(item.getAttribute('data-item_data'));
            // const customId = item.getAttribute('data-custom_id');
            // const type = itemData.type;
            const {furniture_type, db_data} = item;
            const { custom_id } = db_data;
            editItemButtonTrigger(item, custom_id);

            const itemHtml = container.querySelector(`.my-cabinets-list .my-cabinet-item[data-custom_id="${custom_id}"]`);
            removeItemButtonTrigger(itemHtml, custom_id, furniture_type);
        });
    }

    function editItemButtonTrigger(furnitureItemObj, customId) {
        const htmlItem = document.querySelector(`.my-cabinets-list .my-cabinet-item[data-custom_id="${customId}"]`);
        console.log(htmlItem)
        if(!htmlItem) return;
        const editButton = htmlItem.querySelector('.item-actions-container button[data-action_type="edit"]');
        console.log(editButton)
        if(!editButton) {
            return;
        }
        const { product_id, furniture_type, db_data } = furnitureItemObj;
        const { object_src } = db_data;

        // const itemData = JSON.parse(furnitureItem.getAttribute('data-item_data'));
        // const productId = itemData.product_id;
        // const furnitureType = itemData.furniture_type;
        // const modelFileSrc = itemData.model_src;
        // const minWidth = itemData.min_width;

        // const {
        //     regular: regularPrice, 
        //     regular_cm3: regularPriceCm3,
        //     discount: discountPrice, 
        //     discount_cm3: discountPriceCm3,
        //     display: displayPrice,
        //     display_cm3: displayPriceCm3,
        // } = itemData.prices;
        editButton.addEventListener('click', function(e) {
            e.preventDefault();

            const itemObj = roomState.dbChildren.find(dbChild => dbChild.db_data.custom_id == customId);

            // const { width, height, depth, space_bottom } = itemObj;
            // const itemWidth = furnitureItem.getAttribute('data-item_width');
            // const itemHeight = furnitureItem.getAttribute('data-item_height');
            // const itemDepth = furnitureItem.getAttribute('data-item_depth');
            // const itemSpaceBottom = furnitureItem.getAttribute('data-item_space_bottom');
            // const customId = furnitureItem.getAttribute('data-custom_id');
            highlightCurrentItem(customId);
 
            createEditModal(
                htmlItem, 
                itemObj, 
                product_id, 
                furniture_type, 
                object_src, 
                // itemSpaceBottom,
                // min_width, 
                // itemData.prices,
                false
            );
        });

    }

    function removeItemButtonTriggerAction(furnitureItem, summaryItem, bottomSummaryItem, furnitureType, customId) {
        const children = modelScene.children;
        const childObj = children.find(child => child.userData.customId == customId);
        removeGLBModel(childObj);

        furnitureItem.remove();
        if(summaryItem) summaryItem.remove();
        
        if(bottomSummaryItem) bottomSummaryItem.remove();

        if(furnitureType.includes('corner')) {
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

        roomState.dbChildren = roomState.dbChildren.filter(item => item.db_data.custom_id != customId);

        changeTotals();
    }

    function removeItemButtonTrigger(furnitureItem, customId, furnitureType) {
        const removeButton = furnitureItem.querySelector('.item-actions-container button[data-action_type="remove"]');
        const summaryItem = summaryItemsList.querySelector(`.cabinet-item[data-custom_id="${customId}"]`);
        const bottomSummaryItem = bottomSummaryItemsList.querySelector(`.room-config-summary-item[data-custom_id="${customId}"]`);
        if(!removeButton) {
            return;
        }

        removeButton.addEventListener('click', function(e) {
            e.preventDefault();
            removeItemButtonTriggerAction(furnitureItem, summaryItem, bottomSummaryItem, furnitureType, customId);
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

    async function duplicateFurniture(currentCustomId, triggerDupItem = false) {
        if(stepsContainer) {
            stepsContainer.classList.add('loading');
        }

        const itemObj = roomState.dbChildren.find(item => item.db_data.custom_id == currentCustomId);

        if(!itemObj) return;

        const customId = uniqLong();
        const { 
            product_id, 
            furniture_type, 
            min_height, 
            max_height, 
            min_depth, 
            max_depth, 
            min_width,
            max_width,
            min_space_bottom,
            max_space_bottom, 
            db_data,
        } = itemObj;
        const { height, depth, width, space_bottom, prices, object_src } = db_data;
        // const furnitureListItemObj = JSON.parse(JSON.stringify(currentItem));

        // const dbData = furnitureListItemObj.db_data;

        // const productId = furnitureListItemObj.product_id;
        // const modelFileSrc = dbData.object_src; 
        // const furnitureType = furnitureListItemObj.furniture_type; 

        // const itemHeight = dbData.height;
        // const itemDepth = dbData.depth; 
        // const itemWidth = dbData.width;
        // const itemMinHeight = furnitureListItemObj.min_height;
        // const itemMaxHeight = furnitureListItemObj.max_height;
        // const itemMinDepth = furnitureListItemObj.min_depth; 
        // const itemMaxDepth = furnitureListItemObj.max_depth; 
        // const itemMinWidth = furnitureListItemObj.min_width;
        // const itemSpaceBottom = dbData.space_bottom; 
        // const itemMinSpaceBottom = furnitureListItemObj.min_space_bottom; 
        // const itemMaxSpaceBottom = furnitureListItemObj.max_space_bottom; 
        // const prices = dbData.prices;

        const {itemPositionMm} = await addGLBModel(
            object_src, 
            furniture_type, 
            product_id, 
            customId, 
            prices, 
            height, 
            depth, 
            width, 
            space_bottom,
            min_height, 
            max_height,
            min_depth, 
            max_depth, 
            min_width, 
            max_width, 
            triggerDupItem
        );

        changeTotalPrice(prices);

        // const itemTotal = {
        //     regular_total,
        //     discount_total,
        //     display_total,
        // }

        const {my_item_html, summary_item_html, bottom_summary_item_html, obnew_objectject} = await addFurnitureItem(
            customId, 
            itemObj,
            // product_id, 
            // width,
            // height,
            // min_height,
            // max_height,
            // depth,
            // min_depth,
            // max_depth,
            // space_bottom,
            // min_space_bottom,
            // max_space_bottom,
            // itemPositionMm,
            state.defaultTextures,
            // prices
        );

        roomState.dbChildren.push(object);

        if(my_item_html) {
            myItemsList.insertAdjacentHTML('beforeend', my_item_html);
            summaryItemsList.insertAdjacentHTML('beforeend', summary_item_html);
            bottomSummaryItemsList.insertAdjacentHTML('beforeend', bottom_summary_item_html);
            changeCabinetsTab(myCabinetTab, myCabinetContent);
            toggleAccordions();

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

        return customId;
    }

    // function initExistingFurnitureEditMethod() {
    //     const items = myItemsList.querySelectorAll('.my-cabinet-item');
    //     items.forEach(item => {
    //         const itemData = JSON.parse(item.getAttribute('data-item_data'));
    //         const customId = item.getAttribute('data-custom_id');
    //         const type = itemData.type;
    //         editItemButtonTrigger(item);
    //         removeItemButtonTrigger(item, customId, type);
    //     });
    // }

    // function initDuplicateFurnitureMethod() {
    //     const duplicateFurnitureButtons =  container.querySelectorAll('.my-cabinets-list .item-actions-container button[data-action_type="duplicate"]');

    //     duplicateFurnitureButtons.forEach(furnitureButton => {
    //         const parent = furnitureButton.closest('.cabinet-item');
    //         const customId = parent.getAttribute('data-custom_id');
    //         duplicateFurnitureTrigger(parent, customId);
    //     });
    // }

    function duplicateFurnitureTrigger(parent, customId) {
        const furnitureButton = parent.querySelector(`.item-actions-container button[data-action_type="duplicate"]`);
        furnitureButton.addEventListener('click', function() {
            duplicateFurniture(customId);
        });
    }


    function getItemWidthPx(itemWidth) {
        const widthWorld = (itemWidth / (roomWidth * 10)) * modelRoomWidth;

        return widthWorld;
    }

    function getItemHeightPx(itemHeight) {
        const heightWorld = (itemHeight / (roomHeight * 10)) * modelRoomHeight;
        return heightWorld;
    }

    function getItemDepthPx(itemDepth) {
        const depthWorld = (itemDepth / (roomDepth * 10)) * modelRoomDepth;

        return depthWorld;
    }

    function get3DItemDimensionWidth(itemWidth) {
        const widthWorld = (itemWidth / (roomWidth * 10)) * modelRoomWidth;

        return widthWorld;
    }

    function getItemSpaceBottomPx(spaceBottom) {
        const depthWorld = (spaceBottom / (roomHeight * 10)) * modelRoomHeight;

        return depthWorld;
    }

    
    // function calculateTopSpaceIn3dModel(parentBoxWorld) {
    function calculateTopSpaceIn3dModel(spaceBottom) {
        const bottomSpacePx = getItemSpaceBottomPx(spaceBottom);
        const bottom = (roomModelBox.min.y) + bottomSpacePx + FLOOR_THICKNESS;
        return bottom;
    }

    async function changeTotals() {

        total = changeProductsPrices(roomState.dbChildren, state.defaultTextures, state.defaultComponents);

        const {html} = renderPriceBlock(total.regular, total.discount, currencySymbol)
        totalContainer.innerHTML = html;
    }

    function changeTotalPrice(itemTotal) {
        const { regular_total, discount_total, display_total } = itemTotal;
        const tempTotal = {...total};

        total.regular = parseFloat(tempTotal.regular) + parseFloat(regular_total);
        total.discount = parseFloat(tempTotal.discount) + parseFloat(discount_total && discount_total > 0 ? discount_total : 0);
        total.display = parseFloat(tempTotal.display) + parseFloat(display_total);

        const {html} = renderPriceBlock(total.regular, total.discount, currencySymbol);
        totalContainer.innerHTML = html;
    }

    // function editProductPrices(productCustomId, regular, discount, display, regularCm3, discountCm3, displayCm3) {
    //     const productHtml = container.querySelector(`.cabinets .my-cabinets-list .cabinet-item [data-custom_id="${productCustomId}"]`);

    //     if(!productHtml) {
    //         return;
    //     }
    //     const oldPrices = {...JSON.decode(productHtml.getAttribute('data-item_price'))};
    //     oldPrices.regular_total = regular;
    //     oldPrices.regular_cm3_total = regularCm3;
    //     oldPrices.discount_total = discount;
    //     oldPrices.discount_cm3_total = discountCm3;
    //     oldPrices.display_total = display;
    //     oldPrices.display_cm3_total = displayCm3;
    //     productHtml.setAttribute('data-item_price', JSON.stringify(oldPrices));
    // }

    function changeModelChildrenDimensions(furnitureType, newDimensions) {
        modelScene.updateWorldMatrix(true, true);

        const children = modelScene.children;
   
        for(let i = 0; i < children.length; i++) {
            const userData = childObj.userData;

            if (!userData || (!userData.productId && !userData.pseudoType)) {
                continue;
            }

            const childFurnitureType = userData.furnitureType;

            if(childFurnitureType !== furnitureType) {
                continue;
            }

            const widthMm = userData.widthMm;
            const widthPx = getItemWidthPx(widthMm);
            const heightMm = newDimensions.height;
            userData.heightMm = heightMm;
            const heightPx = getItemHeightPx(heightMm);
            const depthMm = newDimensions.depth;
            userData.depthMm = depthMm;
            const depthPx = getItemDepthPx(depthMm);
            const spaceBottomMm = newDimensions.space_bottom;
            const spaceBottomPx = getItemHeightPx(spaceBottomMm);
            userData.spaceBottomMm = heightMm;

            const { scaledChildSize } =
                placeFurnitureInRoom(
                    modelRoomType, 
                    childObj, 
                    childFurnitureType, 
                    widthPx, 
                    heightPx, 
                    depthPx, 
                    spaceBottomPx,
                    userData.positionMm
                );

            // save local position
            userData.savedPosition = childObj.position.clone();
            userData.scaledSize = scaledChildSize.clone();

            const userDataNew = childObj.userData;
            const itemIndex = roomState.dbChildren.findIndex(item => item.db_data.custom_id == userDataNew.customId);
            if(itemIndex > -1) {
                const itemPositionMm = getItemPosition(
                    childFurnitureType, 
                    childWorldPos.clone(), 
                    childSize.clone(), 
                    childObj.rotation.y,
                    childObj.userData.savedPosition.y
                );
                childObj.userData.positionMm = itemPositionMm;

                const isFitting = checkIfAbleToDragChildToPosition(childObj);
                const oldItem = {...roomState.dbChildren[itemIndex]};
                oldItem.db_data.width = itemWidth;
                oldItem.db_data.height = itemHeight;
                oldItem.db_data.depth = itemDepth;
                oldItem.db_data.space_bottom = itemSpaceBottom;
                oldItem.db_data.furniture_position_mm = JSON.stringify(itemPositionMm);
                oldItem.db_data.is_fitting = isFitting;
                roomState.dbChildren[itemIndex] = {...oldItem};
            }
        }
    }
		
    function getCornerDimensions() {
        const { bottom_height, top_height, full_height, space_bottom } = furnitureDimensions;
        const bottomHeightWorld = (bottom_height / (roomHeight * 10)) * modelRoomHeight;
        const bottomWidthWorld = (cornerBottomWidth / (roomWidth * 10)) * modelRoomWidth;
        const bottomDepthWorld = (cornerBottomDepth / (roomDepth * 10)) * modelRoomDepth;
        const topHeightWorld = (top_height / (roomHeight * 10)) * modelRoomHeight;
        const topWidthWorld = (cornerTopWidth / (roomWidth * 10)) * modelRoomWidth;
        const topDepthWorld = (cornerTopDepth / (roomDepth * 10)) * modelRoomDepth;
        const fullHeightWorld = (full_height / (roomHeight * 10)) * modelRoomHeight;

        const fullWidthWorld = (cornerFullWidth / (roomWidth * 10)) * modelRoomWidth;
        const fullDepthWorld = (cornerFullDepth / (roomDepth * 10)) * modelRoomDepth;
        // const bottomSpaceWorld = (space_bottom.current / (roomHeight * 10)) * modelRoomHeight;

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

    async function renderBasicImage3dContainer() {

        if(!basicDisplayContainer) return;

        const mmToUnits = 0.001; 
        const zoomOut = 1.17;

        const { bottom, top, full, space_bottom } = furnitureDimensions;
        const bottomHeightUnits = bottom.height * mmToUnits;
        const topHeightUnits = top.height * mmToUnits;
        const fullHeightUnits = full.height * mmToUnits;
        const bottomDepthUnits = bottom.depth * mmToUnits;
        const fullDepthUnits = full.depth * mmToUnits;
        const topDepthUnits = top.depth * mmToUnits;
        const spaceBottomUnits = space_bottom.current * mmToUnits;
        
        threeJSRenderedBasicDisplay = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });

        basicDisplayScene = new THREE.Scene();
        const parentWidthPx = basicDisplayContainer.clientWidth;
        const parentWidthUnits = parentWidthPx * mmToUnits * zoomOut;
        const parentHeightPx = basicDisplayContainer.clientHeight;
        const objectHeightUnits = largestHeight * mmToUnits * zoomOut;

        const bottomYUnits = bottomHeightUnits + spaceBottomUnits;
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

        rootGroup = new THREE.Group();
        basicDisplayScene.add(rootGroup);
        rootGroup.rotation.y = THREE.MathUtils.degToRad(-30);

        /**** Load Models ****/
        basicDisplayObj.full = await renderBaseImage(rootGroup, FULL_DISPLAY_IMAGE, fullHeightUnits, fullDepthUnits, widthUnits, DIMENSION_TYPE_FULL, basicDisplayXPaddingUnits);
        basicDisplayObj.bottom = await renderBaseImage(rootGroup, BOTTOM_DISPLAY_IMAGE, bottomHeightUnits, bottomDepthUnits, widthUnits, FURNITURE_TYPE_BOTTOM, basicDisplayXPaddingUnits);
        basicDisplayObj.top = await renderBaseImage(rootGroup, TOP_DISPLAY_IMAGE, topHeightUnits, topDepthUnits, widthUnits, DIMENSION_TYPE_TOP, basicDisplayXPaddingUnits, bottomYUnits);
        changeBaseImageDimensions();

        function animate() {
            requestAnimationFrame(animate);

            threeJSRenderedBasicDisplay.render(basicDisplayScene, threeJSCameraBasicDisplay);
        }

        animate();
    }

    function renderBaseImage(rootGroup, urlSrc, itemHeight, itemDepth, itemWidth, furnitureType, basicDisplayXPaddingUnits, bottomYUnits = 0) {
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
                    rootGroup.add(childMeshGroup);

                    // compute bounding box
                    const childBox = new THREE.Box3().setFromObject(childMeshGroup);
                    const childSize = new THREE.Vector3();
                    childBox.getSize(childSize);

                    childMeshGroup.userData.dimensions = [];
                    childMeshGroup.userData.originalSize = childSize.clone();

                    // scale object to match desired dimensions in scene units
                    const scaleX = itemWidth / childSize.x * 1.3;
                    const scaleY = itemHeight / childSize.y * 1.3;
                    const scaleZ = itemDepth / childSize.z * 1.3;
                    childMeshGroup.scale.set(scaleX, scaleY, scaleZ);

                    // recompute scaled size
                    const scaledBox = new THREE.Box3().setFromObject(childMeshGroup);
                    const scaledSize = new THREE.Vector3();
                    scaledBox.getSize(scaledSize);

                    childMeshGroup.userData.scaledSize = scaledSize.clone();

                    // position object: bottom aligned, optional x offset
                    let leftAdditional = furnitureType === DIMENSION_TYPE_FULL ? 0 : scaledSize.x;
                    const posX = basicDisplayXPaddingUnits + leftAdditional - itemWidth / 2; // adjust as needed
                    const posY = bottomYUnits + 0.18; // bottom aligned
                    const posZ = 0; // adjust depth if needed

                    childMeshGroup.position.set(posX, posY, posZ);
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
        const { bottom, top, full, space_bottom } = furnitureDimensions;
        const { bottom: bottomObj, top: topObj, full: fullObj } = basicDisplayObj;

        const itemHeightBottomUnits = bottom.height * mmToUnits;
        const itemHeightTopUnits = top.height * mmToUnits;
        const itemHeightFullUnits = full.height * mmToUnits;
        const itemTopSpaceUnits = space_bottom.current * mmToUnits;

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

        basicDisplayObj.bottom.scale.y = bottomScaleY;
        basicDisplayObj.top.scale.y = topScaleY;
        basicDisplayObj.full.scale.y = fullScaleY;

        basicDisplayObj.bottom.scale.z = bottomScaleZ;
        basicDisplayObj.top.scale.z = topScaleZ;
        basicDisplayObj.full.scale.z = fullScaleZ;

        basicDisplayObj.top.position.y = (bottomOriginalSizeY * bottomScaleY) + itemTopSpaceUnits;
    }

    function init3dModel(model3dContainer) {
        clearModelScene();

        modelScene = new THREE.Scene();

        const textureLoader = new THREE.TextureLoader();
        const floorTexture = textureLoader.load(assetsUrl + '/images/room/floor-limestone.jpg');
        const wallTexture = textureLoader.load(assetsUrl + '/images/room/floor-limestone.jpg');
        wallTexture.colorSpace = THREE.SRGBColorSpace;
        floorTexture.colorSpace = THREE.SRGBColorSpace;

        const width = model3dContainer.clientWidth;
        const height = model3dContainer.clientHeight;

        let {heightPx, depthPx, widthPx, scaleX, scaleY, scaleZ} = getRoomDimensions(model3dContainer, roomHeight, roomDepth, roomWidth);
        modelRoomWidth = widthPx;
        modelRoomHeight = heightPx;
        modelRoomDepth = depthPx;
        modelRoomScaleX = scaleX;
        modelRoomScaleY = scaleY;
        modelRoomScaleZ = scaleZ;

        /******** CAMERA ********/
        const fov = 45;
        const aspect = width / height;

        threeJSCamera = new THREE.PerspectiveCamera(fov, aspect, 0.5, 1000);

        /**** end set camera ******/

        threeJSRendered = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true, 
            preserveDrawingBuffer: true 
        });
        
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
   
        // defaultBottomReferenceY = getDefaultBottomHeightWithSpace(roomHeight, modelRoomHeight);

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
        floor.receiveShadow = true;
        room3DGroup.add(floor);
       
        const wallMaterial = new THREE.MeshStandardMaterial({  
            map: wallTexture,
            color: 0xffffff,
            metalness: 0,
            roughness: 1, 
            side: THREE.DoubleSide
        }); 
        const wallHeightWithFloorThinkness = modelRoomHeight + FLOOR_THICKNESS;
        if(roomType === ROOM_TYPE_WITH_CORNER) {
            const wallDepthWithWallThickness = modelRoomDepth + FLOOR_THICKNESS;

            const leftWallGeometry = new THREE.BoxGeometry(WALL_THICKNESS, wallHeightWithFloorThinkness, wallDepthWithWallThickness);
            const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
            leftWall.position.set(
                -modelRoomWidth / 2 - WALL_THICKNESS / 2, 
                 wallHeightWithFloorThinkness / 2 - FLOOR_THICKNESS, 
                -FLOOR_THICKNESS / 2
            );

            leftWall.receiveShadow = true;
            room3DGroup.add(leftWall); 
        }
    
        const rightWallGeometry = new THREE.BoxGeometry(modelRoomWidth, wallHeightWithFloorThinkness, WALL_THICKNESS);
        const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial);
        rightWall.position.set(
            0, 
            wallHeightWithFloorThinkness / 2 - FLOOR_THICKNESS, 
            -modelRoomDepth / 2 - WALL_THICKNESS / 2
        );
        rightWall.receiveShadow = true;
        room3DGroup.add(rightWall);

        modelScene.add(room3DGroup);

        /******** FIT CAMERA TO ROOM ********/
        roomModelBox = new THREE.Box3().setFromObject(room3DGroup);

        const size = new THREE.Vector3();
        const center = new THREE.Vector3();

        roomModelBox.getSize(size);
        roomModelBox.getCenter(center);

        const maxDim = Math.max(size.x, size.y, size.z);
        const fovRad = THREE.MathUtils.degToRad(fov);

        let cameraDistance = maxDim / (2 * Math.tan(fovRad / 2));
        // cameraDistance *= 1.5; // padding
        cameraDistance *= 1.2; // padding

        // angled view (your style preserved)
        const yawOffset = roomType == ROOM_TYPE_SINGLE_WALL ? THREE.MathUtils.degToRad(-70) : 0; 
        const yaw = Math.PI / 4 + yawOffset;
        const pitch = THREE.MathUtils.degToRad(35);

        const camX = cameraDistance * Math.sin(yaw) * Math.cos(pitch);
        const camY = cameraDistance * Math.sin(pitch);
        const camZ = cameraDistance * Math.cos(yaw) * Math.cos(pitch);

        threeJSCamera.position.set(
            center.x + camX,
            center.y + camY,
            center.z + camZ
        );

        threeJSCamera.lookAt(center);

        // SAVE INITIAL STATE
        threeJSControls.target.copy(center);
        threeJSControls.update();

        threeJSControls.saveState();
        // End SAVE INITIAL STATE

        /******** CONTROLS SETUP ********/
        threeJSControls.target.copy(center);

        threeJSControls.maxDistance = cameraDistance * 3;
        threeJSControls.minDistance = cameraDistance * 0.2;
        threeJSControls.maxPolarAngle = Math.PI / 2;

        /******** CAMERA CLIPPING FIX ********/
        threeJSCamera.near = Math.max(0.5, cameraDistance / 100);
        threeJSCamera.far = cameraDistance * 10;
        threeJSCamera.updateProjectionMatrix();

        if(roomType === ROOM_TYPE_WITH_CORNER) {
            const {
                bottomHeight,
                bottomWidth,
                bottomDepth,
                topHeight,
                topWidth,
                topDepth,
                fullWidth,
                fullDepth,
                // bottomSpace,
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
            worldItemsDimensions = {...tempWorldDimensions}

            appendCornerPseudoModelObjects();
        }

        // /************ TEST ********/
        function renderLights() {
            threeJSRendered.physicallyCorrectLights = true;
            threeJSRendered.outputEncoding = THREE.sRGBEncoding;
            threeJSRendered.toneMapping = THREE.ACESFilmicToneMapping;
            threeJSRendered.toneMappingExposure = 2.2;
            threeJSRendered.shadowMap.enabled = false; //change performance
            threeJSRendered.shadowMap.type = THREE.PCFSoftShadowMap;

            const groupFloorSpot1 = new THREE.Group();
            const groupFloorSpot2 = new THREE.Group();
            const groupWallSpot1 = new THREE.Group();
            const groupWallSpot2 = new THREE.Group();
            const maxNum = 0.5;
            // const startX = modelRoomWidth * -1;
            // const step = (modelRoomWidth * maxNum) / lightCount;

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
                    0xffffff,            // color
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
        // renderLights();
        /************ END TEST ********/

        roomState.dbChildren.forEach((child) => {
            const dbData = child.db_data;
            const childId = child.id;
            const childProductId = child.product_id;
            const childCustomId = dbData.custom_id;
            const childSrc = dbData.object_src;
            const childType = child.furniture_type;
            const hasBrandTexture = dbData.has_brand_texture;
            const childWidth = dbData.width;
            const childHeight = dbData.height;
            const childDepth = dbData.depth;
            const childSpaceBottom = dbData.space_bottom;
            const childMinWidth = child.min_width;
            const childPositionMm = JSON.parse(dbData.furniture_position_mm);
            const childRotation = dbData.rotation;
            console.log(childRotation)
            const childIsFitting = Boolean(parseInt(dbData.is_fitting));
            const childPrices = dbData.prices;
       
            addExistingGLBModel(
                childId, 
                childSrc, 
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
            );

            productActionsInit(
                childCustomId,
                childProductId,
                childType,
                childSrc,
                childMinWidth,
                childPrices
            );
        });

        /********drag controls**********/
        dragControls = new DragControls(
            roomState.draggableObjects,
            threeJSCamera,
            threeJSRendered.domElement
        );

        dragControls.transformGroup = true;

        dragControlsMethod();
        
        const animate = () => {
            requestAnimationFrame(animate);
			
			// roomState.bgPlanes.forEach(updateBgPlane);

            threeJSControls.update();
            threeJSRendered.render(modelScene, threeJSCamera); 
            updateZoomSlider(threeJSCamera, threeJSControls);
        };
        animate();

        threeJSRendered.domElement.addEventListener('click', function(e) {
            onClickModel(e);
        }, false);

        setZoomSettingsValues(threeJSCamera, threeJSControls);
    }

    function dragControlsMethod() {
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

            let isFitting = roomType == ROOM_TYPE_WITH_CORNER
                ? setCornerChildenDragging(obj)
                : setSingleWallChilderDragging(obj);

            // obj.userData.isFitting = isFitting;

            // obj.traverse(child => {
            //     if (child.isMesh) {
            //         child.material.color.set(isFitting ? 0x00ff00 : 0xff0000);
            //         child.material.transparent = true;
            //         child.material.opacity = 0.5;
            //     }
            // });

            if (roomState.visibleDimensionArrows) {
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

            obj.userData.positionMm = itemPositionMm;

            const isFitting = checkIfAbleToDragChildToPosition(obj);
            obj.userData.isFitting = isFitting;

            if (isFitting) {
                obj.traverse(child => {
                    if (child.isMesh && child.userData.originalMaterial) {
                        child.material.color.copy(child.userData.originalMaterial.color);
                        child.material.opacity = child.userData.originalMaterial.opacity;
                        child.material.transparent = child.userData.originalMaterial.transparent;
                    }
                });
            } 

            if(isFitting) {
                setTimeout(() => {
                    obj.traverse(child => {
                        if (child.isMesh && child.userData.originalMaterial) {
                            const original = child.userData.originalMaterial;

                            child.material.color.copy(original.color);
                            child.material.opacity = original.opacity;
                            child.material.transparent = original.transparent;
                        }
                    });
                }, 1000)
            }

            const itemIndex = roomState.dbChildren.findIndex(
                item => item.db_data?.custom_id == obj.userData.customId
            );

            if (itemIndex > -1) {
                const oldItem = { ...roomState.dbChildren[itemIndex] };
                oldItem.db_data.furniture_position_mm = JSON.stringify(itemPositionMm);
                oldItem.db_data.is_fitting = isFitting;
                oldItem.db_data.rotation = obj.rotation.y;
                roomState.dbChildren[itemIndex] = { ...oldItem };
            }
        });
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
                if (child.material && child.material.emissive) {
                    child.material.emissive.set(0x000000);   // reset emissive color
                    child.material.emissiveIntensity = 1;   // back to default
                }
            });
        });
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

            // optional but important if control keeps internal state
            dragControls.deactivate?.();
            dragControls.enabled = false;

            childObj.userData.dragControls = null;
        } 

        if (childObj.userData.bgPlane) {
            modelScene.remove(childObj.userData.bgPlane);

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

        const bgPlanesIdx = roomState.bgPlanes.indexOf(childObj.userData.bgPlane);
        if (bgPlanesIdx !== -1) {
            roomState.bgPlanes.splice(bgPlanesIdx, 1);
        }

        const draggableObjIdx = roomState.draggableObjects.indexOf(childObj);
        if (draggableObjIdx !== -1) {
            roomState.draggableObjects.splice(draggableObjIdx, 1);
        }

        childObj.userData = {}; 

        if(roomType === ROOM_TYPE_WITH_CORNER) {
            appendCornerPseudoModelObjects();
        }
    }

    function setSingleWallChilderDragging(obj) {
        // const parentBoxWorld  = new THREE.Box3().setFromObject(room3DGroup);

        // const objBox = new THREE.Box3().setFromObject(obj);
        // const objBox = obj.userData.boundingBox;  // changes performance
        // const objHeight = objBox.max.y - objBox.min.y;

        // const objSize = new THREE.Vector3();
        // objBox.getSize(objSize);
        const objSize = obj.userData.scaledSize;
        const objWidth =  objSize.x;
        const objDepth =  objSize.z;

        const currentPos = new THREE.Vector3();
        obj.getWorldPosition(currentPos);

        const objWorldPos = obj.getWorldPosition(new THREE.Vector3());

        objWorldPos.y = obj.userData.savedPosition.y; 

        // objWorldPos.z = roomModelBox.min.z + (objDepth / 2) + WALL_THICKNESS; 
        if(obj.userData.furnitureType.includes(FURNITURE_TYPE_BOTTOM)) {
            objWorldPos.z = Math.max(
                roomModelBox.min.z + (objDepth / 2) + WALL_THICKNESS,
                Math.min(roomModelBox.max.z - objDepth / 2, objWorldPos.z)
            );
        } else {
            objWorldPos.z = roomModelBox.min.z + (objDepth / 2) + WALL_THICKNESS; 
        }

        objWorldPos.x = Math.max(
            roomModelBox.min.x + objWidth / 2,
            Math.min(roomModelBox.max.x - objWidth / 2, objWorldPos.x)
        );

        obj.position.copy(obj.parent.worldToLocal(objWorldPos));

        const isFitting = checkIfAbleToDragChildToPosition(obj);

        return isFitting;
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

    function clearModelScene() {
        state.model3dContainer.innerHTML = ''

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

        roomState.bgPlanes = [];
        roomState.draggableObjects = [];
    }

    function addExistingGLBModel(
        id, 
        urlSrc, 
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
    ) {
        const loader = new GLTFLoader();

        // const texturesObj = categoryState.textures3DSrc[productId] ? categoryState.textures3DSrc[productId] : state.textures3DSrc;

        loader.load(
            urlSrc,
            function (childGltf) {
                const childMeshGroup = childGltf.scene;
                const childMeshList = [];

                childMeshGroup.traverse(node => {
                    if (node.isMesh) {
                        const geo = node.geometry;
                        // ✅ Ensure geometry uses triangles
                        if (geo && geo.attributes.position && !geo.attributes.normal) {
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
 
                    	if(hasBrandTexture) {
                       		const name = (node.name || "").toLowerCase();

                        	const texture = getTextureSrc(furnitureType, name, state.textures3DSrc);

                        	node.material = new THREE.MeshStandardMaterial({
                            	map: texture,
                            	metalness: 0.5,    // little reflection
                            	roughness: 0.5,    // wood is not glossy
                        	});
                        
							node.material.needsUpdate = true;
                        }

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
                    // mesh.frustumCulled = false;
                });
 
                modelScene.add(wrapper);

                wrapper.userData.rowId = id;
                wrapper.userData.customId = customId;
                wrapper.userData.customId = customId;
                wrapper.userData.productId = productId;
                wrapper.userData.furnitureType = furnitureType;
                wrapper.userData.widthMm = itemWidth;
                wrapper.userData.heightMm = itemHeight;
                wrapper.userData.depthMm = itemDepth;

                wrapper.userData.spaceBottomMm = itemSpaceBottom;
                wrapper.userData.positionMm = childPositionMm;
                wrapper.userData.rotation = childRotation;
                wrapper.userData.rotatedManually = childRotation != null && childRotation != 0 ? true : null;
                wrapper.userData.rotatedManuallyOld = true;
                wrapper.userData.isFitting = isFitting;

                // if(templatePostId) {
                const widthPx = getItemWidthPx(itemWidth);
                const heightPx = getItemHeightPx(itemHeight);
                const depthPx = getItemDepthPx(itemDepth);
                const spaceBottomPx = calculateTopSpaceIn3dModel(itemSpaceBottom);
                // const { heightPx, depthPx } = getItemPxDimensions(furnitureType);
                // const { heightPx, depthPx } = getItemPxDimensions(furnitureType);
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
                // const { scaledChildBox, scaledChildSize } = normalizeAndPlaceMeshGroup(wrapper, furnitureType, widthPx, heightPx, depthPx, savedPosition);

                const { scaledChildSize } = placeFurnitureInRoom(
                    furnitureType, 
                    wrapper, 
                    widthPx, 
                    heightPx, 
                    depthPx, 
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
				
				if(furnitureType.includes(FURNITURE_TYPE_WALL)
                ) {
                    addBgImageToFront(wrapper, modelScene, assetsUrl, furnitureType); 
                }
 
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

                initRoomDragging(furnitureType, wrapper);
            },
            (xhr) => {
                console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
            },
            (error) => {
                console.error("❌ Error loading GLB:", error);
            }
        );
    }

    function addGLBModel(
        urlSrc, 
        furnitureType, 
        productId, 
        customId, 
        prices,
        // displayPrice, 
        // regularPrice, 
        // discountPrice, 
        // regularPriceCm3, 
        // discountPriceCm3, 
        // displayPriceCm3, 
        itemHeight, 
        itemDepth, 
        itemWidth,
        itemSpaceBottom,
        itemHeightMin, 
        itemHeightMax, 
        itemDepthMin, 
        itemDepthMax,
        itemWidthMin, 
        itemWidthMax, 
    	hasBrandTexture,
        triggerDupItem = false
    ) {

        return new Promise((resolve, reject) => {
            const itemModelWidth = getItemWidthPx(itemWidth);
            const itemModelHeight = getItemHeightPx(itemHeight);
            const itemModelDepth = getItemDepthPx(itemDepth);
            const itemModelSpaceBottom = calculateTopSpaceIn3dModel(itemSpaceBottom);
            // const dims = get3DItemDimensions(itemHeight, itemDepth, itemWidth, modelRoomHeight, modelRoomDepth, modelRoomWidth);
            const loader = new GLTFLoader();

            const texturesObj = categoryState.textures3DSrc[productId] ? categoryState.textures3DSrc[productId] : state.textures3DSrc;

            loader.load(
                urlSrc,
                function (childGltf) {
                    let childMesh = childGltf.scene || childGltf.scenes[0];
                    const childMeshList = [];

                    childMesh.traverse(node => {
                        if (node.isMesh) {
                            const geo = node.geometry;

                            // ✅ Ensure geometry uses triangles
                            if (geo && geo.attributes.position && !geo.attributes.normal) {
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
                        
							if(hasBrandTexture) {
                            	const name = (node.name || "").toLowerCase();

                            	const texture = getTextureSrc(furnitureType, name, texturesObj)

                            	node.material = new THREE.MeshStandardMaterial({
                                	map: texture,
                                	metalness: 0.5,    // little reflection
                                	roughness: 0.5,    // wood is not glossy
                            	});
                            
                            	node.material.needsUpdate = true;
                            } 

                            node.userData.originalMaterial = {
                                color: node.material.color.clone(),
                                opacity: node.material.opacity,
                                transparent: node.material.transparent
                            };
                            childMeshList.push(node);
                        }
                    });

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
                    /************normalize end************ */

                    // // Compute bounding box from raw geometry
                    // const originalBox = new THREE.Box3().setFromObject(wrapper);
                    // const originalSize = new THREE.Vector3();
                    // originalBox.getSize(originalSize);

                    // // Safety fallback
                    // const safeOriginalSize = new THREE.Vector3(
                    //     originalSize.x || 1,
                    //     originalSize.y || 1,
                    //     originalSize.z || 1
                    // );

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
                    // wrapper.userData.initCustomId = customId;
                    wrapper.userData.customId = customId;
                    wrapper.userData.furnitureType = furnitureType;
                    wrapper.userData.widthMm = itemWidth;
                    wrapper.userData.heightMm = itemHeight;
                    wrapper.userData.depthMm = itemDepth;
                    wrapper.userData.spaceMm = itemSpaceBottom;
                    wrapper.userData.widthPx = itemModelWidth;
                    let rotation = null;
                    wrapper.userData.rotation = rotation;

                    modelScene.add(wrapper);

                    const { scaledChildSize } = placeFurnitureInRoom(
                        furnitureType, 
                        wrapper, 
                        itemModelWidth, 
                        itemModelHeight, 
                        itemModelDepth, 
                        itemModelSpaceBottom
                    );

                    /******** 2.save position and size********/
                    const placedWorldPos = new THREE.Vector3();
                    wrapper.getWorldPosition(placedWorldPos);
                    wrapper.userData.savedPosition = placedWorldPos.clone();
                    wrapper.userData.scaledSize = scaledChildSize;
                    wrapper.receiveShadow = true;
					
                    rotateExistingItem(wrapper, scaledChildSize, furnitureType);
					
					if(
                        furnitureType.includes(FURNITURE_TYPE_WALL)
                    ) {
						addBgImageToFront(wrapper, modelScene, assetsUrl, furnitureType); 
					}
                    /******** spotlight ******/
					
                //    addFrontTopShade(wrapper, scaledChildSize);
                    /******** end save position ********/

                    /******* enable dragging *********/

                    const isFittingItem = initModelDragging(wrapper, wrapper.userData.boundingBox, furnitureType);
                    
                    const newRotation = wrapper.rotation.y;
                    const itemPositionMm = getItemPosition(
                        furnitureType, 
                        placedWorldPos.clone(), 
                        scaledChildSize,
                        newRotation,
                        wrapper.userData.savedPosition.y
                    );

                    wrapper.userData.positionMm = itemPositionMm;
                    /***** push item ****/

                    const objectIndex = roomState.dbChildren.findIndex(dbChild => dbChild.db_data.custom_id == customId);

                    if(objectIndex > -1) {
                        const currentObj = {...roomState.dbChildren[objectIndex]};
                        currentObj.db_data.isFitting = isFittingItem;
                        currentObj.db_data.rotation = newRotation;
                        currentObj.db_data.is_fitting = isFittingItem;
                        currentObj.db_data.furniture_position_mm = JSON.stringify(itemPositionMm);
                        roomState.dbChildren[objectIndex] = currentObj;
                    }
                    // const dbData  = {
                    //     custom_id: customId,
                    //     width: itemWidth,
                    //     height: itemHeight,
                    //     depth: itemDepth,
                    //     space_bottom: itemSpaceBottom,
                    //     furniture_position_mm: JSON.stringify(itemPositionMm),
                    //     is_fitting: isFittingItem,
                    //     rotation: newRotation,
                    //     options: [],
                    //     prices: {...prices},
                    //     object_src: urlSrc,
                    //     hasBrandTexture: hasBrandTexture,
                    // };
                
                    // const furnitureListItem = {
                    //     product_id: productId,
                    //     db_data: {...dbData},
                    //     // object_src: urlSrc,
                    //     furniture_type: furnitureType, 
                    //     // prices: {...prices},
                    //     // width: itemWidth,
                    //     // height: itemHeight,
                    //     // depth: itemDepth,
                    //     // space_bottom: itemSpaceBottom,
                    //     min_width: itemWidthMin,
                    //     max_width: itemWidthMax,
                    //     min_height: itemHeightMin,
                    //     max_height: itemHeightMax,
                    //     min_depth: itemDepthMin,
                    //     max_depth: itemDepthMax,
                    // }
     
                    // roomState.dbChildren.push(furnitureListItem);

                    if(modelSettings.visibleDimensionsArrows) {
                        createFurnitureDimensionArrows(wrapper, room3DGroup);
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

    function initModelDragging(wrapper, scaledChildBox, furnitureType) {
        // store needed data
        wrapper.userData.furnitureType = furnitureType;
        wrapper.userData.boundingBox = scaledChildBox; // or scaledChildBox if better

        // register for dragging (GLOBAL system)
        if (!furnitureType.includes('corner')) {
            roomState.draggableObjects.push(wrapper);
        }

        // return fitting state if needed
        return checkIfAbleToDragChildToPosition(wrapper);
    }


    function initRoomDragging(furnitureType, wrapper) {
        if (!furnitureType.includes('corner')) {
            roomState.draggableObjects.push(wrapper);
        } else {
            removeCornerPseudoModelObjects(furnitureType);
        }
    }

    function setCornerChildenDragging(obj) {
        const objSize = obj.userData.scaledSize;
        const furnitureType = obj.userData.furnitureType;
    
        const objWidth =  objSize.x;
        const objDepth =  objSize.z
        const pos = obj.getWorldPosition(new THREE.Vector3());

        // ---------- CORNER DIMENSIONS ----------
        const getDimension = (type, dim) => {
            const d = worldItemsDimensions[dim];

            if (type === DIMENSION_TYPE_BOTTOM)
                return d.bottomCorner || d.fullCorner || d.topCorner || 0;

            if (type === DIMENSION_TYPE_TOP)
                return d.topCorner || d.fullCorner || d.bottomCorner || 0;

            if (type === DIMENSION_TYPE_FULL)
                return d.fullCorner || d.topCorner || d.bottomCorner || 0;

            return 0;
        };

        let cornerWidth = getDimension(furnitureType, "width");
        let cornerDepth = getDimension(furnitureType, "depth");
        cornerWidth = 0;
        cornerDepth = 0;

        // ---------- CORNER THRESHOLD ----------
        const threshold = cornerWidth > 0 ? cornerWidth : objSize.x - 0.01;
        const forwardThreshold = roomModelBox.min.x + threshold;

        const isCorner = pos.x < forwardThreshold;

        pos.y = obj.userData.savedPosition.y;

        const yRotation = isCorner && !obj.userData.rotatedManually ||
            isCorner && obj.userData.rotatedManuallyOld ? 
            Math.PI / 2 :
            obj.userData.rotatedManually && !obj.userData.rotatedManuallyOld ? 
            obj.userData.rotation : 
            0;

        obj.rotation.y = yRotation;
        obj.userData.rotation = yRotation;

        if(getIsRotatedItem(yRotation)) {
            let zDimension = 0;

            switch(furnitureType) {
                case FURNITURE_TYPE_BOTTOM: {
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

            zDimension = 0;

            if(obj.userData.furnitureType.includes(FURNITURE_TYPE_BOTTOM)) {
                if(obj.userData.rotatedManually) {
                    pos.x = Math.max(
                        roomModelBox.min.x + objWidth / 2 + WALL_THICKNESS,
                        Math.min(roomModelBox.max.x - objWidth / 2, pos.x)
                    );
                } else {
                    pos.x = roomModelBox.min.x + objDepth / 2 + WALL_THICKNESS;
                }
                
                pos.z = Math.max(
                    roomModelBox.min.z + (objWidth / 2) + WALL_THICKNESS,
                    Math.min(roomModelBox.max.z - objWidth / 2, pos.z)
                );
            } else {
                // pos.x = Math.max(
                //     roomModelBox.min.x + objWidth / 2 + WALL_THICKNESS,
                //     Math.min(roomModelBox.max.x - objWidth / 2, pos.x)
                // );
                pos.x = roomModelBox.min.x + objDepth / 2 + WALL_THICKNESS;

                pos.z = Math.max(
                    roomModelBox.min.z + zDimension  + WALL_THICKNESS + objWidth / 2,
                    Math.min(roomModelBox.max.z - objWidth / 2, pos.z )
                );
            }
        } else {

            if(obj.userData.furnitureType.includes(FURNITURE_TYPE_BOTTOM)) {
                pos.z = Math.max(
                    roomModelBox.min.z + (objDepth / 2) + WALL_THICKNESS,
                    Math.min(roomModelBox.max.z - objDepth / 2, pos.z)
                );
            } else {
                pos.z = roomModelBox.min.z + objDepth / 2 + WALL_THICKNESS;
            }

            pos.x = Math.max(
                roomModelBox.min.x + objWidth / 2 + WALL_THICKNESS,
                Math.min(roomModelBox.max.x - objWidth / 2, pos.x)
            );
        }

        obj.position.copy(obj.parent.worldToLocal(pos));

        // const isFitting = checkIfAbleToDragChildToPosition(obj);
        const isFitting = null;

        return isFitting;

    }

    function clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
    }


    function rotateExistingItem(obj, scaledChildSize, furnitureType, keepPosition) {
        // if(roomType !== ROOM_TYPE_WITH_CORNER) return;

        // Ensure matrices are fresh
        obj.updateMatrixWorld(true);
        room3DGroup.updateMatrixWorld(true);

        /* -------------------------------------------------- */
        /* 2️⃣ Get object world position + size               */
        /* -------------------------------------------------- */
        const worldPos = obj.getWorldPosition(new THREE.Vector3());

        const objSize = obj.userData.scaledSize;

        const objWidth = objSize.x;

        /* -------------------------------------------------- */
        /* 3️⃣ Determine corner threshold width               */
        /* -------------------------------------------------- */

        const {
            bottomCorner: cornerBottomWidth3d,
            fullCorner: cornerFullWidth3d,
            topCorner: cornerTopWidth3d
        } = worldItemsDimensions.width;

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

        const yRotation = isCorner && !obj.userData.rotation ? 
            Math.PI / 2 :
            obj.userData.rotation ?? 0;

        obj.rotation.y = yRotation;
        obj.userData.rotation = yRotation;

        if(!keepPosition && getIsRotatedItem(yRotation)) {
            worldPos.x =
                roomModelBox.min.x +
                objSize.z / 2 +
                WALL_THICKNESS;

            worldPos.z =
                roomModelBox.min.z +
                objSize.x / 2 +
                WALL_THICKNESS;

            const itemIndex = roomState.dbChildren.findIndex(item => item.db_data?.custom_id == obj.userData.customId);

            if(itemIndex > -1) {
                const oldItem = {...roomState.dbChildren[itemIndex]};
                oldItem.db_data.rotation = yRotation;
                roomState.dbChildren[itemIndex] = {...oldItem};
            }

            const localPos = obj.parent.worldToLocal(worldPos);
            obj.position.copy(localPos);
            obj.updateMatrixWorld(true);
        } 

        /* -------------------------------------------------- */
        /* 6️⃣ Save final world position                      */
        /* -------------------------------------------------- */
        const finalWorldPos = obj.getWorldPosition(new THREE.Vector3());

        obj.userData.savedPosition = finalWorldPos.clone();

        const itemPositionMm = getItemPosition(
            roomType,
            furnitureType,
            finalWorldPos.clone(),
            scaledChildSize,
            yRotation,
            obj.userData.savedPosition.y,
            obj.userData.customId,
        );

        obj.userData.positionMm = itemPositionMm;

        const boundingBox = new THREE.Box3().setFromObject(obj);
        obj.userData.boundingBox = boundingBox.clone(); // changes performance    
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

    function getItemPosition(furnitureType, currentPosition, currentSize, rotation, spaceBottomPx, id = null) {

        const halfRoomWidth = modelRoomWidth / 2;
        const halfRoomDepth = modelRoomDepth / 2;

        const rotatedSize = getFootprintSize(currentSize, rotation);

        const itemWidth  = rotatedSize.x;
        const itemHeight = rotatedSize.y;
        const itemDepth  = rotatedSize.z;

        const centerX = currentPosition.x;
        const centerY = currentPosition.y;
        const centerZ = currentPosition.z;

        // ------------------ WORLD POSITIONS ------------------

        const left  = centerX + halfRoomWidth - itemWidth / 2;
        const right = modelRoomWidth - (left + itemWidth);

        const back  = centerZ + halfRoomDepth - itemDepth / 2;
        const front = modelRoomDepth - (back + itemDepth);

        let bottom, top;

        if (furnitureType.includes(DIMENSION_TYPE_TOP)) {
            bottom = spaceBottomPx;
            top = bottom + itemHeight;

        } else {

            bottom = centerY;
            top = modelRoomHeight - (bottom + itemHeight);

        }

        // ------------------ WORLD → MM CONVERSION ------------------

        const pxToMmX = roomWidth  / modelRoomWidth;
        const pxToMmY = roomHeight / modelRoomHeight;
        const pxToMmZ = roomDepth  / modelRoomDepth;

        const toMmX = v => v * pxToMmX;
        const toMmY = v => v * pxToMmY;
        const toMmZ = v => v * pxToMmZ;

        // ------------------ CLAMP ------------------

        const clamp = (v, max) => Math.max(0, Math.min(v, max));

        const newPosition = {
            left:   clamp(toMmX(left), roomWidth),
            right:  clamp(toMmX(right), roomWidth),
            bottom: clamp(toMmY(bottom), roomHeight),
            top:    clamp(toMmY(top), roomHeight),
            back:   clamp(toMmZ(back), roomDepth),
            front:  clamp(toMmZ(front), roomDepth),
        };

        return newPosition;
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
        // ------------------ PIVOT NORMALIZATION (RUN ONCE) ------------------
        if (!wrapper.userData.pivotNormalized) {

            const box = new THREE.Box3().setFromObject(wrapper);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());

            wrapper.children.forEach(child => {
                child.position.sub(center);
                child.position.y += size.y / 2;
            });

            wrapper.updateMatrixWorld(true);

            // IMPORTANT: this is your ONLY geometry-based read (one time only)
            const normalizedBox = new THREE.Box3().setFromObject(wrapper);
            const normalizedSize = normalizedBox.getSize(new THREE.Vector3());

            wrapper.userData.originalSize = normalizedSize.clone();
            wrapper.userData.pivotNormalized = true;
        }

        if(!scaledSize) {
            const originalSize = wrapper.userData.originalSize;

            // ------------------ SCALE (DETERMINISTIC) ------------------
            const scaleX = widthPx / originalSize.x;
            const scaleY = heightPx / originalSize.y;
            const scaleZ = depthPx / originalSize.z;

            wrapper.scale.set(scaleX, scaleY, scaleZ);
            wrapper.updateMatrixWorld(true);

            // ------------------ SIZE (SOURCE OF TRUTH) ------------------
            scaledSize = new THREE.Vector3(
                originalSize.x * scaleX,
                originalSize.y * scaleY,
                originalSize.z * scaleZ
            );

            wrapper.userData.scaledSize = scaledSize.clone();
        }

        let rotation = initRotation ?? wrapper.rotation.y;

        // ------------------ POSITIONING ------------------
        const roomHalfWidth = modelRoomWidth / 2;
        const roomHalfDepth = modelRoomDepth / 2;

        let x, y, z;

        if (mmPosition) {
            const pos = typeof mmPosition === "string"
                ? JSON.parse(mmPosition)
                : mmPosition;

            const rotatedSize = getRotatedSize(scaledSize, rotation);
            x = -roomHalfWidth + pos.left * modelRoomScaleX + rotatedSize.x / 2;
            z = -roomHalfDepth + pos.back * modelRoomScaleZ + rotatedSize.z / 2;           

            // const pos = typeof mmPosition === "string"
            //     ? JSON.parse(mmPosition)
            //     : mmPosition;

            // x = -roomHalfWidth + pos.left * modelRoomScaleX + footprintSize.x / 2;
            // // x = pos.left * modelRoomScaleX + footprintSize.x / 2;

            if (furnitureType.includes(DIMENSION_TYPE_TOP)) {
                y = spaceBottomPx;
            } else {
                y = 0;
            }

            // z = -roomHalfDepth + pos.back * modelRoomScaleZ + footprintSize.z / 2;
            // // z = pos.back * modelRoomScaleZ + footprintSize.z / 2;

        } else {
            const footprintSize = getFootprintSize(scaledSize, rotation);

            const leftAdditionalUnit =
                (roomType === ROOM_TYPE_WITH_CORNER ? WALL_THICKNESS : 0);

            x = roomModelBox.min.x + footprintSize.x / 2 + leftAdditionalUnit;

            if (furnitureType.includes(DIMENSION_TYPE_TOP)) {
                y = spaceBottomPx;
            } else {
                y = 0;
            }

            z = -roomHalfDepth + footprintSize.z / 2;
        }

        // ------------------ APPLY POSITION ------------------
        const worldPos = new THREE.Vector3(x, y, z);
        const localPos = wrapper.parent.worldToLocal(worldPos);

        wrapper.position.copy(localPos);
        wrapper.updateMatrixWorld(true);

        const finalBox = new THREE.Box3().setFromObject(wrapper);
        const finalSize = finalBox.getSize(new THREE.Vector3());

        wrapper.userData.scaledSize = finalSize.clone();

        // ------------------ FINAL OUTPUT ------------------
        return {
            scaledChildSize: scaledSize.clone()
        };
    }


    function createFurnitureDimensionArrows(childMeshGroup) {
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

    
    function checkIfAbleToDragChildToPosition(currentObj, excludeObjId = null) {
        const children = modelScene.children;

        const pos = currentObj.position.clone();
        const scaledSize = currentObj.userData.scaledSize;
        const size = getFootprintSize(scaledSize, currentObj.rotation.y);

        let isFitting = true;

        for (let childObj of children) {
            if (childObj.id === currentObj.id) continue;
            if (excludeObjId && childObj.id === excludeObjId) continue;

            const childData = childObj.userData;
            if (!childData || (!childData.productId && !childData.pseudoType)) continue;

            const childPos = childObj.position;
            const childScaledSize = childData.scaledSize;
            const childSize = getFootprintSize(childScaledSize, childObj.rotation.y);

            // Axis-Aligned Bounding Box overlap check (local space)
            const overlapX = Math.abs(pos.x - childPos.x) < (size.x / 2 + childSize.x / 2);
            const overlapY = Math.abs(pos.y - childPos.y) < (size.y / 2 + childSize.y / 2);
            const overlapZ = Math.abs(pos.z - childPos.z) < (size.z / 2 + childSize.z / 2);
        
            if (overlapX && overlapY && overlapZ) {
                isFitting = false;
                break;
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

                if(userData || !userData.productId && !userData.pseudoType) {
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
                    
                    const isFitting = checkIfAbleToDragChildToPosition(childObj, currentId);
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
                if(!userData.productId && !userData.pseudoType) {
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
                        const isFitting = checkIfAbleToDragChildToPosition(childObj, currentId);
                        if(isFitting) {
                            notFittingObjs.push(childObj);
                        }
                        continue;
                    }
                } else {
                    const childZMin = childBoxMin.z - WALL_THICKNESS;
                    const childZMax = childBoxMax.z - WALL_THICKNESS;

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
                        const isFitting = checkIfAbleToDragChildToPosition(childObj, currentId);
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

    function appendCornerPseudoModelObjects() {
        // const parentBoxWorld = new THREE.Box3().setFromObject(room3DGroup);
        const finalParentSize = new THREE.Vector3();
        roomModelBox.getSize(finalParentSize);

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

            pseudoBottomCornerFurniture.userData.pseudoType = FURNITURE_TYPE_BOTTOM;
            pseudoBottomCornerFurniture.userData.furnitureType = FURNITURE_TYPE_BOTTOM_CORNER;
            pseudoBottomCornerFurniture.userData.widthMm = cornerBottomWidth;
            pseudoBottomCornerFurniture.userData.depthMm = cornerBottomDepth3d;

            const objBox = new THREE.Box3().setFromObject(pseudoBottomCornerFurniture);
            const objSize = new THREE.Vector3();
            objBox.getSize(objSize);

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

            const objBox = new THREE.Box3().setFromObject(pseudoTopCornerFurniture);
            const objSize = new THREE.Vector3();
            objBox.getSize(objSize);

            pseudoTopCornerFurniture.userData.originalSize = objSize.clone();
            pseudoTopCornerFurniture.userData.scaledSize = objSize.clone();
            pseudoTopCornerFurniture.userData.parentBox = roomModelBox;

            const xPosition = roomModelBox.min.x + objSize.x / 2 + WALL_THICKNESS;
            const yPosition = calculateTopSpaceIn3dModel() + cornerTopHeight3d / 2;
            const zPosition = roomModelBox.min.z + (objSize.z / 2) + WALL_THICKNESS;
            pseudoTopCornerFurniture.position.set(xPosition, yPosition, zPosition);

            modelScene.add(pseudoTopCornerFurniture);
        }
    }

     function addDimensionArrows() {
        const children = [...modelScene.children];

        for(let i = 0; i < children.length; i++) {
            const childObj = children[i];
            const userData = childObj.userData;
            const childType = userData.furnitureType;

            if(!childType) {
                continue;
            }

            createFurnitureDimensionArrows(childObj, modelScene, roomModelBox);
        }
    }

    function removeDimensionArrows() {
        const children = [...modelScene.children];

        children.forEach(child => {
            if (child.userData && child.userData.dimensions) {
                // Remove each arrow/label from the scene
                child.userData.dimensions.forEach(obj => {
                    if (obj.geometry) obj.geometry.dispose();
                    if (obj.material) obj.material.dispose();
                    value.modelScene.remove(obj);
                });
                // Clear the reference
                child.userData.dimensions = [];
            }
        });
    }

    function onClickModel(e) {
        removeAllFurnitureControls();
        removeAllFurnitureButtons();
        if(isSummaryStep) {
            return;
        }
        // removeAllFurnitureButtons();

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const rect = threeJSRendered.domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, threeJSCamera);

        const intersects = raycaster.intersectObjects(modelScene.children, true);

        let buttonHitItem = intersects.find(hit => hit.object.parent.userData.customId);
 
        if(buttonHitItem) {
            const obj = buttonHitItem.object.parent;
            const userData = obj.userData;
            const customId = userData.customId;
         
            openEditModal(userData, customId, false);
            createFurnitureItemControls(obj, customId); 
            // openEditModal(userData.widthMm, userData.heightMm, userData.depthMm, modelRoomType, customId, false);
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

    function initCabinetTabs() {
        const tabs = container.querySelectorAll('.cabinet-settings .main-settings-sidebar .cabinets .tabs button');

        tabs.forEach(tab => {
            const type = tab.getAttribute('data-type');
            const content = container.querySelector(`.cabinet-settings .main-settings-sidebar .cabinets .content .tab-content[data-type="${type}"]`);

            tab.addEventListener('click', function(e) {
                e.preventDefault();     
                changeCabinetsTab(tab, content);
                editContainerRemove();
            });
        });
    }

    function openEditModal(userData, customId, actionTypeAdd = true) {
        const width = userData.widthMm;
        const height = userData.heightMm;
        const depth = userData.depthMm;
        const spaceBottom = userData.spaceBottomMm;

        // const furnitureItem = container.querySelector(`.cabinet-settings .my-cabinets-list .cabinet-item[data-custom_id="${customId}"]`);
        const furnitureItem = roomState.dbChildren.find(item => item.custom_id == customId);

        if(!furnitureItem) return;

        const furnitureItemHtml = container.querySelector(`.cabinet-settings .my-cabinets-list .cabinet-item[data-custom_id="${customId}"]`);

        const productId = furnitureItem.product_id;
        const itemDbData = furnitureItem.db_data;

        const minWidth = itemDbData.min_width;
        const furnitureType = itemDbData.furniture_type;
        const modelFileSrc = itemDbData.model_src;

        editContainerRemove();
        createEditModal(
            furnitureItemHtml, 
            furnitureItem, 
            productId, 
            furnitureType, 
            modelFileSrc, 
            // width, 
            // height,
            // depth,
            // spaceBottom,
            // minWidth, 
            // itemDbData.prices,
            // // displayPrice, 
            // // regularPrice, 
            // // discountPrice, 
            // // regularPriceCm3, 
            // // discountPriceCm3, 
            // // displayPriceCm3, 
            actionTypeAdd
        );
    }

    function createEditModal(
        itemHtml, 
        itemObj, 
        productId, 
        furnitureType, 
        modelFileSrc, 
        // width, 
        // height,
        // depth,
        // spaceBottom,
        // itemMinWidth,
        // prices, 
        // displayPrice, 
        // regularPrice, 
        // discountPrice, 
        // regularPriceCm3, 
        // discountPriceCm3, 
        // displayPriceCm3, 
        actionTypeAdd = true
    ) {
        const { min_width, max_width, min_height, max_height, min_depth, max_depth, min_space_bottom, max_space_bottom, db_data } = itemObj;
        const { width, height, depth, prices, hasBrandTexture } = db_data;
        console.log(itemObj)

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
                console.log(max)
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

        const editContainer = itemHtml.closest('.content').querySelector('.edit-container');
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
                itemObj, 
                productId, 
                // furnitureType, 
                // modelFileSrc, 
                // itemMinWidth, 
                // minHeight,
                // maxHeight,
                // minDepth,
                // maxDepth,
                // minSpaceBottom,
                // maxSpaceBottom, 
                // prices, 
                // hasBrandTexture,
                editContainer
            );
        }
    
    }

    function furnitureTypeAddInit(
        addBtn, 
        itemObj, 
        productId, 
        // furnitureType, 
        // modelFileSrc, 
        // itemMinWidth,
        // itemMinHeight,
        // itemMaxHeight,
        // itemMinDepth,
        // itemMaxDepth, 
        // itemMinSpaceBottom,
        // itemMaxSpaceBottom, 
        // prices, 
        // hasBrandTexture,
        // displayPrice, 
        // regularPrice, 
        // discountPrice, 
        // displayPriceCm3, 
        // regularPriceCm3, 
        // discountPriceCm3, 
        editContainer = null
    ) {
        const {
            furniture_type,
            min_width,
            max_width,
            min_height,
            max_height,
            min_depth,
            max_depth,
            min_space_bottom,
            max_space_bottom,
            db_data,
        } = itemObj;

        const { prices, hasBrandTexture, object_src } = db_data;

        addBtn.addEventListener('click', async function() {
            if(stepsContainer) {
                stepsContainer.classList.add('loading');
            }

            const newItemObj = roomState.allProducts.find(allProduct => allProduct.product_id == productId);
            const { width, height, depth, space_bottom } = newItemObj.db_data;
            // const itemWidth = item.getAttribute('data-item_width');
            // const itemHeight = item.getAttribute('data-item_height');
            // const itemDepth = item.getAttribute('data-item_depth');
            // const itemSpaceBottom = item.getAttribute('data-item_space_bottom');
            const customId = Date.now();

            // const { heightMm, heightMmMin, depthMm, depthMmMin } = getItemPxDimensions(furnitureType);
           
            if(furniture_type.includes('corner')) {
                if(roomType === ROOM_TYPE_SINGLE_WALL) {
                    return;
                }
                if(furniture_type === DIMENSION_TYPE_FULL_CORNER) {
                    if(cornerBottomFurnitureId || cornerTopFurnitureId || cornerFullFurnitureId) {
                        alert(`Full Corner Furniture already added.`);
                        return;
                    } else {
                        cornerFullFurnitureId = productId;
                    }
                } else if(furniture_type === FURNITURE_TYPE_BOTTOM_CORNER) {
                    if(cornerBottomFurnitureId || cornerFullFurnitureId) {
                        alert(`Bottom Corner Furniture already added.`);
                        return;
                    } else {
                        cornerBottomFurnitureId = productId;
                    }
                } else {
                    if(cornerTopFurnitureId || cornerFullFurnitureId) {
                        alert(`Top Corner Furniture already added.`);
                        return;
                    } else {
                        cornerTopFurnitureId = productId;
                    }
                }
            }
            
            const options = null;
            const itemTotal = changeSingleProductPrice(
                furniture_type,
                width, 
                min_width, 
                height,
                max_height,
                depth,
                min_depth,
                prices, 
                options,
                // displayPriceCm3, 
                // regularPrice, 
                // discountPrice, 
                state.defaultTextures, 
                hasBrandTexture,
                state.defaultComponents
            );

            changeTotalPrice(itemTotal);

            const mergedPrices = {...prices, ...itemTotal}
            
            const {my_item_html, summary_item_html, bottom_summary_item_html, new_object} = await addFurnitureItem(
                customId, 
                itemObj,
                // productId, 
                // width,
                // height,
                // min_height,
                // max_height,
                // depth,
                // min_depth,
                // max_depth,
                // space_bottom,
                // min_space_bottom,
                // max_space_bottom,
                // itemPositionMm,
                state.defaultTextures,
                // mergedPrices
            );

            roomState.dbChildren.push(new_object);

            const {itemPositionMm} = await addGLBModel(
                object_src, 
                furniture_type, 
                productId, 
                customId, 
                mergedPrices, 
                height,
                depth, 
                width, 
                space_bottom, 
                min_height, 
                max_height, 
                min_depth, 
                max_depth, 
                min_width,
                max_width,
            	hasBrandTexture,
            );

            if(my_item_html) {
                myItemsList.insertAdjacentHTML('beforeend', my_item_html);
                summaryItemsList.insertAdjacentHTML('beforeend', summary_item_html);
                bottomSummaryItemsList.insertAdjacentHTML('beforeend', bottom_summary_item_html);
                changeCabinetsTab(myCabinetTab, myCabinetContent);

                toggleAccordions();

                if(editContainer) {
                    editContainer.classList.remove('active');
                    editContainer.innerHTML = '';
                }

                const furnitureItem = myItemsList.querySelector(`.my-cabinet-item[data-custom_id="${customId}"]`);
                
                if(furnitureItem) {
                    // const newItemObj = roomState.dbChildren.find(dbChild => dbChild.db_data.custom_id == customId);
                    const furnitureSummaryItem = document.querySelector(`.room-config-summary-item[data-custom_id="${customId}"]`);
                    editItemButtonTrigger(new_object, customId); 
                    removeItemButtonTrigger(furnitureItem, customId, furniture_type);
                    duplicateFurnitureTrigger(furnitureItem, customId);
                    initFurnitureRotationTrigger(furnitureItem, customId);
                    changeSingleProductOptions(furnitureSummaryItem);
                }
            }

            if(stepsContainer) {
                stepsContainer.classList.remove('loading');
            }
        });
    }

    function editContainerRemove() {
        const editContainers = container.querySelectorAll('.edit-container.active');

        editContainers.forEach(container => {
            container.classList.remove('active');
            container.innerHTML = '';
        });  
    }

    function productActionsInit(customId, productId, furnitureType, modelFileSrc, minWidth, price) {
        const itemHtml = container.querySelector(`.cabinet-settings .my-cabinets-list .cabinet-item[data-custom_id="${customId}"]`);
        const editBtn = itemHtml.querySelector(`.item-actions-container button[data-action_type="edit"]`);
        const duplicateBtn = itemHtml.querySelector(`.item-actions-container button[data-action_type="duplicate"]`);
        const rotateBtn = itemHtml.querySelector(`.item-actions-container button[data-action_type="rotate"]`);
        const removeBtn = itemHtml.querySelector(`.item-actions-container button[data-action_type="remove"]`);

        // const {
        //     display_total, 
        //     regular_total,
        //     discount_total, 
        //     total_cm3
        // } = price;

        editBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const itemObj = roomState.dbChildren.find(dbChild => dbChild.db_data.custom_id == customId);
            // const { width, height, depth, space_bottom } = itemObj;
            // const itemWidth = itemHtml.getAttribute('data-item_width');
            // const itemHeight = itemHtml.getAttribute('data-item_height');
            // const itemDepth = itemHtml.getAttribute('data-item_depth');
            // const itemSpaceBottom = itemHtml.getAttribute('data-item_space_bottom');
  
            createEditModal(
                itemHtml, 
                itemObj, 
                productId, 
                furnitureType, 
                modelFileSrc, 
                // width, 
                // height,
                // depth,
                // space_bottom,
                // minWidth, 
                // price,
                // // display_total, 
                // // regular_total, 
                // // discount_total, 
                // // total_cm3.regular, 
                // // total_cm3.discount, 
                // // total_cm3.display,
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


    function changeItemDimensionValues(itemObj, itemHtml, actionTypeAdd) {
        const dimentionsContainer = itemHtml.closest('.content').querySelector('.edit-container .dimension-container');

        if(!dimentionsContainer) return;

        const editContainer = dimentionsContainer.closest('.content');

        const {furniture_type, min_width, min_height, min_depth, db_data} = itemObj;
        const customId = item.getAttribute('data-custom_id');

        // // const itemData = JSON.parse(item.getAttribute('data-item_data'));
        // const furnitureType = itemData.furniture_type;
        // const itemMinWidth = itemData.min_width;
        // const itemMinHeight = itemData.min_height;
        // const itemMinDepth = itemData.min_depth;

        changeDimension('width');
        changeDimension('height');
        changeDimension('depth');
        changeDimension('space_bottom', true);

        function changeDimension(type, isSpace = false) {
            const rangeInput = dimentionsContainer.querySelector(`.slider-container input[type="range"][name="${type}"`);
            if(!rangeInput) return;
            const rangeNumInput = dimentionsContainer.querySelector(`.input-container input[type="number"][name="${type}"`);
            const valueHtml = itemHtml.querySelector(`.dimensions-info .${type}-value`);

            rangeInput.addEventListener('change', function(e) {
                const value = parseInt(e.target.value);
                rangeNumInput.value = value;

                setDimensionsMethod(value);
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
                
                setDimensionsMethod(value);


                // item.setAttribute(`data-item_${type}`, value);
                // if(valueHtml) valueHtml.innerHTML = value;

                // const itemWidth = item.getAttribute('data-item_width');
                // const itemHeight = item.getAttribute('data-item_height');
                // const itemDepth = item.getAttribute('data-item_depth');
                // const itemSpaceBottom = item.getAttribute('data-item_space_bottom');

                // if(!actionTypeAdd) {
                //     editGLBModelDimensions(customId, itemWidth, itemHeight, itemDepth, itemSpaceBottom);
                // }

                // if(!isSpace) {
                //     const itemTotal = changeSingleProductPrice(
                //         furnitureType,
                //         itemWidth, 
                //         itemMinWidth, 
                //         itemHeight, 
                //         itemMinHeight, 
                //         itemDepth, 
                //         itemMinDepth,
                //         itemData.prices, 
                //         // displayPriceCm3, 
                //         // regularPrice, 
                //         // discountPrice, 
                //         state.defaultTextures, 
                //         state.defaultComponents
                //     );

                //     changeTotalPrice(itemTotal);
                // }
            });

            function setDimensionsMethod(value) {
                if(valueHtml) valueHtml.innerHTML = value;

                const constCurrentObjIndex = roomState.dbChildren.findIndex(dbChild => dbChild.db_data.custom_id == customId);

                if(constCurrentObjIndex < 0 ) return;

                const tempCurrentObj = {...roomState.dbChildren[constCurrentObjIndex]};
                tempCurrentObj.db_data[type] = value;
                roomState.dbChildren[constCurrentObjIndex] = tempCurrentObj;

                const { db_data } = tempCurrentObj;
                const { width, height, depth, space_bottom, prices, hasBrandTexture, options} = db_data;
                
                if(!actionTypeAdd) {
                    editGLBModelDimensions(customId, width, height, depth, space_bottom);
                }

                if(!isSpace) {
                    const newProductPrices = changeSingleProductPrice(
                        furniture_type,
                        width, 
                        min_width, 
                        height, 
                        min_height, 
                        depth, 
                        min_depth, 
                        prices, 
                        options,
                        state.defaultTextures, 
                        hasBrandTexture,
                        state.defaultComponents
                    );

                    updateProductPricesHtml(customId, newProductPrices);
                    changeTotals();
                    // changeTotalPrice(itemTotal);
                    // total = changeProductsPrices(roomState.dbChildren, state.defaultTextures, state.defaultComponents);
                }
            }
        }


    }

    function changeItemDimensionValues(itemObj, itemHtml, actionTypeAdd) {
        console.log(itemHtml)
        const dimentionsContainer = itemHtml.closest('.content').querySelector('.edit-container .dimension-container');
        console.log(dimentionsContainer)
        if(!dimentionsContainer) return;

        // const customId = item.getAttribute('data-custom_id');

        // const itemData = JSON.parse(item.getAttribute('data-item_data'));
        // const furnitureType = itemData.furniture_type;
        // const itemMinWidth = itemData.min_width;
        // const itemMinHeight = itemData.min_height;
        // const itemMinDepth = itemData.min_depth;

        const { furniture_type, min_width, min_height, min_depth, db_data} = itemObj;
        const { custom_id } = db_data;
        const foundItemIndex = roomState.dbChildren.findIndex(dbChild => dbChild.db_data.custom_id == custom_id);

        if(foundItemIndex < 0) return;

        changeDimension('width');
        changeDimension('height');
        changeDimension('depth');
        changeDimension('space_bottom', true);

        function changeDimension(type, isSpace = false) {
            const rangeInput = dimentionsContainer.querySelector(`.slider-container input[type="range"][name="${type}"`);
            if(!rangeInput) return;
            const rangeNumInput = dimentionsContainer.querySelector(`.input-container input[type="number"][name="${type}"`);
            const valueHtml = itemHtml.querySelector(`.dimensions-info .${type}-value`);

            rangeInput.addEventListener('change', function(e) {
                const value = parseInt(e.target.value);
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
                // rangeInput.value = value;

                // item.setAttribute(`data-item_${type}`, value);
                // if(valueHtml) valueHtml.innerHTML = value;

                // const itemWidth = item.getAttribute('data-item_width');
                // const itemHeight = item.getAttribute('data-item_height');
                // const itemDepth = item.getAttribute('data-item_depth');
                // const itemSpaceBottom = item.getAttribute('data-item_space_bottom');

                // if(!actionTypeAdd) {
                //     editGLBModelDimensions(custom_id, itemWidth, itemHeight, itemDepth, itemSpaceBottom);
                // }

                // if(!isSpace) {
                //     const itemTotal = changeSingleProductPrice(
                //         furnitureType,
                //         itemWidth, 
                //         itemMinWidth, 
                //         itemHeight, 
                //         itemMinHeight, 
                //         itemDepth, 
                //         itemMinDepth,
                //         itemData.prices, 
                //         // displayPriceCm3, 
                //         // regularPrice, 
                //         // discountPrice, 
                //         state.defaultTextures, 
                //         furnitureDimensions, 
                //         state.defaultComponents
                //     );

                //     changeTotalPrice(itemTotal);
                // }
            });
  

            function changeValues(value) {
                const foundItem = {...roomState.dbChildren[foundItemIndex]};
            
                foundItem.db_data[type] = value;
                console.log(type)
                console.log(foundItem.db_data)
                roomState.dbChildren[foundItemIndex] = foundItem;
                console.log(foundItem.db_data)
                const {width, height, depth, space_bottom, hasBrandTexture, options } = foundItem.db_data;
console.log(roomState.dbChildren[foundItemIndex])
                if(valueHtml) valueHtml.innerHTML = value;
                
                if(!actionTypeAdd) {
                    editGLBModelDimensions(custom_id, width, height, depth, space_bottom);
                }


                if(!isSpace) {
                    const newProductPrices = changeSingleProductPrice(
                        furniture_type,
                        width, 
                        min_width, 
                        height, 
                        min_height, 
                        depth, 
                        min_depth, 
                        db_data.prices, 
                        options,
                        // displayPriceCm3, 
                        // regularPrice, 
                        // discountPrice, 
                        state.defaultTextures, 
                        hasBrandTexture,
                        state.defaultComponents
                    );

                    updateProductPricesHtml(custom_id, newProductPrices);
                    changeTotals();
                    // changeTotalPrice(itemTotal);
                    // total = changeProductsPrices(roomState.dbChildren, state.defaultTextures, state.defaultComponents);
                }
            }
        }

    }


    function editGLBModelDimensions(customId, itemWidth, itemHeight, itemDepth, itemSpaceBottom) {
        const children = modelScene.children;

        // defaultBottomReferenceY = getDefaultBottomHeightWithSpace(
        //     roomHeight,
        //     modelRoomHeight
        // );
    
        const childObj = children.find(c => c.userData.customId == customId);
        if (!childObj) return;

        const userData = childObj.userData;
        const furnitureType = userData.furnitureType;

        const widthPx = get3DItemDimensionWidth(itemWidth);
        const heightPx = getItemHeightPx(itemHeight);
        const depthPx = getItemHeightPx(itemDepth);
        const spaceBottomPx = calculateTopSpaceIn3dModel(itemSpaceBottom);

        // const spaceBottomPx = calculateTopSpaceIn3dModel(itemSpaceBottom);

        // ---------- UPDATE CORNER DIMENSIONS ----------
        if (furnitureType.includes("corner")) {

            switch (furnitureType) {

                case FURNITURE_TYPE_BOTTOM_CORNER:
                    cornerBottomWidth = itemWidth;
                    cornerBottomWidth3d = widthPx;
                    break;

                case DIMENSION_TYPE_TOP_CORNER:
                    cornerTopWidth = itemWidth;
                    cornerTopWidth3d = widthPx;
                    break;

                case DIMENSION_TYPE_FULL_CORNER:
                    cornerFullWidth = itemWidth;
                    cornerFullWidth3d = widthPx;
                    break;
            }
        }

        // ---------- RESIZE ----------
        const originalSize = userData.originalSize;

        childObj.scale.set(widthPx, heightPx, depthPx).divide(originalSize);

        const newScaledSize = new THREE.Vector3(widthPx, heightPx, depthPx);

        userData.scaledSize.copy(newScaledSize);
        userData.widthMm = itemWidth;
        userData.heightMm = itemHeight;
        userData.depthMm = itemDepth;
        userData.spaceBottomMm = itemSpaceBottom;

        updateBgPlane(childObj);

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

        userData.positionMm = itemPositionMm;
        userData.isFitting = isFitting;

        // ---------- VISUAL ERROR ----------
        if (!isFitting) {

            childObj.traverse(child => {

                if (!child.isMesh) return;

                child.material.color.set(0xff0000);
                child.material.transparent = true;
                child.material.opacity = 0.5;

            });
        }

        // ---------- UPDATE DB STATE ----------
        const itemIndex = roomState.dbChildren.findIndex(
            item => item.db_data.custom_id == customId
        );

        if (itemIndex > -1) {

            const item = { ...roomState.dbChildren[itemIndex] };

            item.db_data.width = itemWidth;
            item.db_data.height = itemHeight;
            item.db_data.depth = itemDepth;
            item.db_data.space_bottom = itemSpaceBottom;
            item.db_data.furniture_position_mm = JSON.stringify(itemPositionMm);
            item.db_data.is_fitting = isFitting;

            roomState.dbChildren[itemIndex] = item;
        }
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
                if (child.isMesh && child?.material?.emissive) {
                    child.material.emissive.set(0x000000);   // reset emissive color
                    child.material.emissiveIntensity = 1;   // back to default
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
            if(!userData.productId && !userData.pseudoType) {
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
                const childZMin = childBoxMin.z - WALL_THICKNESS;
                const childZMax = childBoxMax.z - WALL_THICKNESS;

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

    function calcBasicDisplayXPaddingUnits(parentWidthPx, parentWithUnits) {
        const basicDisplayXPaddingUnitsPercent = BASIC_DISPLAY_X_PADDING_PX * 100 / parentWidthPx;
        const units = parentWithUnits * basicDisplayXPaddingUnitsPercent / 100;

        return units;
    }

    function getDefaultBottomHeightWithSpace(roomHeightCm, modelRoomHeightPx) {
		const bottomPercent = furnitureDimensions.space_bottom.current / (roomHeightCm * 10);
        const bottomSceneUnits = modelRoomHeightPx * bottomPercent; // this is already in scene units

        return bottomSceneUnits;  
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

    function initAddToCart(){
        const button = container.querySelector('.config_add_to_cart_button');
        const innerHtml = button.innerHTML;
        const messageContainer = button.closest('.buy-container').querySelector('#add-to-cart-message');

        if(!button) return;

        button.addEventListener('click', async function(e) {
            e.preventDefault();

            button.innerHTML = '<span class="loader"></span>';

            if(roomState.dbChildren.length == 0 || parseInt(total.display) === 0) {
                button.classList.remove('loading');
                alert("Please add some products");
                return;
            }

            await addItemsToCart(
				button,
                roomState.dbChildren, 
                state.defaultTextures, 
                state.defaultComponents, 
                messageContainer,
                configSelector,
                currentConfigId,
                roomType,
                roomHeight,
                roomDepth,
                roomWidth,
                furnitureDimensions,
            );

            button.innerHTML = innerHtml;

        });
    }

    function initSettingsConfigChange() {
        // const parentContainer = document.querySelector('.room-config-shortcode');
        if(!configSelector) return;

        configSelector.addEventListener('change', async function(e) {
            const value = e.target.value;
            currentConfigId = value;
            currentTemplateConfigPostId = null;

            // container.classList.add('loading');
            
            // container.innerHTML += `<div class="config-loader-container">
            //             <span class="loader"></span>
            //         </div>`;

            // await initRoomConfigComponent(currentConfigId);

            // container.classList.remove('loading');
            await setShortocodeLoading(value);
        });
    }

    async function setShortocodeLoading(userConfigId, templateData = null) {
        container.classList.add('loading');
            
        container.innerHTML += `<div class="config-loader-container">
                    <span class="loader"></span>
                </div>`;

        await initRoomConfigComponent(userConfigId, templateData);

        container.classList.remove('loading');
    }

    function initTemplateSelector() {
        const templatesForms = container.querySelectorAll('.templates-list form');

        templatesForms.forEach(form => {
            const postId = form.querySelector('input[name="post_id"]').value;

            form.addEventListener('submit', async function(e) {
                e.preventDefault();
                const roomTypeInput = this.querySelector('[name="room_type"]');

                const roomTypeValue = roomTypeInput ? roomTypeInput.value : ROOM_TYPE_SINGLE_WALL;
                currentConfigId = null;
                const data = roomTypeInput.getAttribute('disabled') !== null ? 
                    null : {
                    post_id: postId,
                    room_type: roomTypeValue,
                };

                currentTemplateConfigPostId = postId;

                await setShortocodeLoading(currentConfigId, data);
            }); 
        });
    }

}

 async function saveUserSettings(buttonHtml) {
    if(!userId) return;
    const loginRegisterModal = container.querySelector('.login-register-modal');

    if(loginRegisterModal) {
        loginRegisterModal.remove();
    }

    let { 
        bottom_depth, 
        full_depth, 
        top_depth, 
        bottom_height, 
        top_height,
        full_height,
        space_bottom,
    } = furnitureDimensions;

    await saveUserSettingsAjax(
        saveDataButtonsContainer,
        configSelector,
        buttonHtml,
        currentConfigId,
        state.defaultTextures,
        state.defaultComponents,
        roomType,
        roomHeight,
        roomDepth,
        roomWidth,
        furnitureDimensions,
        // bottom_height,
        // bottom_depth,
        // top_height,
        // top_depth,
        // full_height,
        // full_depth,
        // space_bottom,
        roomState.dbChildren
    );

    // if(dataResponse) {
    //     currentConfigId = dataResponse.config_id;
    //     roomState.dbChildren = dataResponse.products_list;
    //     // modelChildrenList = dataResponse.furniture_list;
    // }

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

    return {
        heightPx: modelHeightPx,
        depthPx: modelDepthPx,
        widthPx: modelWidthPx,
        scaleX: modelWidthPx / width,
        scaleY: modelHeightPx / height,
        scaleZ: modelDepthPx / depth
    };
}

async function initSettingsSave() {
    const saveBtn = saveDataButtonsContainer.querySelector('button[data-action_type="save-settings"]');
    const createNewBtn = saveDataButtonsContainer.querySelector('button[data-action_type="create-settings"]');

    if(saveBtn) {
        initButton(saveBtn, true);
    }

    if(createNewBtn) {
        initButton(createNewBtn);
    }

    function initButton(button, save = false) {
        button.addEventListener('click', async function(e) {
            e.preventDefault();

            if(!userId) {
                openLoginModal(button);
                return;
            }

            await saveUserSettingsAjax(
                saveDataButtonsContainer,
                configSelector,
                button,
                save ? currentConfigId : null,
                state.defaultTextures,
                state.defaultComponents,
                roomType,
                roomHeight,
                roomDepth,
                roomWidth,
                furnitureDimensions,
                roomState.dbChildren
            );

        });
    }
    
}


export async function getRoomConfigComponentShortcodeContent(userConfigId = null, templateData = null) {
    try {
        let formData = new FormData();
        formData.append("action", "render_config_room");
        formData.append("user_config_id", userConfigId);
        formData.append("template_data", JSON.stringify(templateData));

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

async function loadMoreProductsByType(typeSlug, page, productsListPerPage) {
    try {
        let formData = new FormData();
        formData.append("action", "load_more_products");
        formData.append("furniture_type", typeSlug);
        formData.append("page", page);
        formData.append("per_page", productsListPerPage);

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

async function addFurnitureItem(
        customId, 
        productObject,
        // productId, 
        // furnitureWidth,
        // furnitureHeight,
        // furnitureHeightMin,
        // furnitureHeightMax,
        // furnitureDepth,
        // furnitureDepthMin,
        // furnitureDepthMax,
        // furnitureSpaceBottom,
        // furnitureSpaceBottomMin,
        // furnitureSpaceBottomMax,
        // itemPosition,
        textures,
        // prices,
    ) {
    try {
        let formData = new FormData();
        formData.append("action", "add_furniture_item_to_config_v2_settings");
        formData.append("count_index", roomState.dbChildren.length);
        formData.append("config_id", currentConfigId);
        formData.append("custom_id", customId);
        formData.append("product_object", JSON.stringify(productObject));
        // formData.append("product_id", productId);
        // formData.append("furniture_width", furnitureWidth);
        // formData.append("furniture_position", itemPosition);
        // formData.append("furniture_height", furnitureHeight);
        // formData.append("furniture_height_min", furnitureHeightMin);
        // formData.append("furniture_height_max", furnitureHeightMax);
        // formData.append("furniture_depth", furnitureDepth);
        // formData.append("furniture_depth_min", furnitureDepthMin);
        // formData.append("furniture_depth_max", furnitureDepthMax);
        // formData.append("furniture_space_bottom", furnitureSpaceBottom);
        // formData.append("furniture_space_bottom_min", furnitureSpaceBottomMin);
        // formData.append("furniture_space_bottom_max", furnitureSpaceBottomMax);
        formData.append("textures", JSON.stringify(textures));
        // formData.append("item_prices", JSON.stringify(prices));

        const response = await fetch(configDataRoom.ajaxurl, {
            method: "POST",
            body: formData,
        });

        const jsonData = await response.json();

        if(!jsonData.success || !jsonData.data?.my_item_html) return '';
        const data = jsonData.data;
console.log(data)
        return data;
    } catch(e) {
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
        formData.append("action", "ajax_login_v2");
        formData.append("username", username);
        formData.append("password", password);
        formData.append("security", configDataRoom.login_nonce);

        const response = await fetch(configDataRoom.ajaxurl, {
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
        formData.append("action", "ajax_register_v2");
        formData.append("username", username);
        formData.append("email", email);
        formData.append("password", password);
        formData.append("security", configDataRoom.login_nonce);

        const response = await fetch(configDataRoom.ajaxurl, {
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
        return null;
    }
}

async function saveUserSettingsAjax(
    buttonsContainer,
    configSelector,
    buttonHtml,
    configId,
    textures,
    components,
    roomType,
    roomHeight,
    roomDepth,
    roomWidth,
    furnitureDimensions,
    productsList
) {
    const oldText = buttonHtml.innerHTML;
    buttonHtml.innerHTML = '<div class="loader"></div>';
    const messageDiv = buttonsContainer.closest('.save-data-container-inner').querySelector('#save-message');
    if (messageDiv) {
        messageDiv.innerHTML = '';
    }

    try {
        let formData = new FormData();
        formData.append("action", "ajax_save_config_settings");
        formData.append("config_id", configId);
        formData.append("config_settings", JSON.stringify({
            textures: textures,
            components: components,
            room_settings: {
                type: roomType,
                height: roomHeight,
                width: roomWidth,
                depth: roomDepth,
            },
            furniture_dimensions: furnitureDimensions,
        }));

        formData.append("products_list", JSON.stringify(productsList));

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

        const {config_id, new_config_option_html, new_save_buttons_html} = data;

        if(new_config_option_html && configSelector) {
            configSelector.value = config_id;
            configSelector.innerHTML += new_config_option_html;
        }

        if(new_save_buttons_html) {
            buttonsContainer.innerHTML = new_save_buttons_html;
            initSettingsSave();
        }

        // for(let i = 0; i < productsList.length; i++) {
        //     const listItem = {...productsList[i]};
        //     listItem.old_item = true;
        //     productsList[i] = {...listItem};
        // }

        // if(new_custom_ids.length) {
        //     for(let i = 0; i < productsList.length; i++) {
        //         const listItem = {...productsList[i]};
        //         const initCustomId = listItem.db_data.custom_id;
        //         const dataOld = new_custom_ids.find(item => item.init == initCustomId);
        //         if(!dataOld.length) {
        //             continue;
        //         }
        //         const newCustomId = dataOld[0].new;
        //         listItem.db_data.custom_id = newCustomId;
        //         productsList[i] = {...listItem};
        //     }
        // }

        currentConfigId = config_id;
        roomState.dbChildren = productsList;

    } catch (e) {
        buttonHtml.innerHTML = oldText;
        return null;
    }
}

async function addItemsToCart(
		addToCartButton,
        products, 
        textures, 
        components,
        messageContainer,
        configSelector,
        configId,
        roomType,
        roomHeight,
        roomDepth,
        roomWidth,
        furnitureDimensions,
    ) {
    try {

        let formData = new FormData();
        formData.append("action", "config_3d_products_addtocart");
        formData.append("products", JSON.stringify(products));
        formData.append("config_id", configId);
        formData.append("config_settings", JSON.stringify({
            textures: textures,
            components: components,
            room_settings: {
                type: roomType,
                height: roomHeight,
                width: roomWidth,
                depth: roomDepth,
            },
            furniture_dimensions: furnitureDimensions,
        }));

        const response = await fetch(configDataRoom.ajaxurl, {
            method: "POST",
            body: formData,
        });

        const jsonData = await response.json();

        if(!jsonData.success || !jsonData.data?.cart_count) {
            const errorMessage = jsonData.data?.message || "Failed adding to cart.";
   
            if (messageContainer) {
                messageContainer.innerHTML = `<span style="color:red;">${errorMessage}</span>`;
            
                 setTimeout(() => {
                    messageContainer.innerHTML = '';
                }, 1500);
            }

            return;
        };
        const data = jsonData.data;

        if(messageContainer) {
            messageContainer.innerHTML = `<span style="color:green;">${data.message}</span>`;

            setTimeout(() => {
                messageContainer.innerHTML = '';
            }, 1500);
        }

        const {config_id, new_config_option_html} = data;

        if(new_config_option_html && configSelector) {
            configSelector.value = config_id;
            configSelector.innerHTML += new_config_option_html;
        }

        currentConfigId = config_id;
        roomState.dbChildren = products;

		 /*******  minicart trigger**********/
		   jQuery(document.body).trigger('added_to_cart', [
				data.fragments,
				data.cart_hash,
				jQuery(addToCartButton)
			]);

			// Apply fragments manually (safety)
			Object.keys(data.fragments).forEach(key => {
				const el = document.querySelector(key);
				if (el) el.innerHTML = data.fragments[key];
			});

			// Refresh Woo
			jQuery(document.body).trigger('wc_fragment_refresh');
		   
		   const ocId = jQuery('.awb-off-canvas-wrap.cart-item-count-container').data('id');
			window.awbOffCanvas.open_off_canvas(ocId);

        return data;
    } catch(e) {
        return null;
    }
}