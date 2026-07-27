import * as THREE from '../../../assets/js/three/three.module.js';
import { OrbitControls } from '../../../assets/js/three/OrbitControls.js';
import { GLTFLoader } from '../../../assets/js/three/GLTFLoader.js';
import { DragControls } from '../../../assets/js/three/DragControls.js';
import * as BufferGeometryUtils from '../../../assets/js/three/BufferGeometryUtils.js';

import { 
    ROOM_TYPE_SINGLE_WALL,
    ROOM_TYPE_WITH_CORNER,
    PRICE_CM_CHUNK,
    state,
    roomState,
    categoryState,
    changeInputFromRangeValue,
    setTextureLoader,
    getTextureSrc,
    generateSmartUVs,
    uniqLong,
    mmToWorld
} from '../../../assets/js/shared-scripts.js';

import { 
    changeProductsPrices,
    changeSingleProductPrice
} from '../../../assets/js/calculate-totals.js';

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
const BOTTOM_DISPLAY_IMAGE = `${configDataRoom.generalAssetsUrl}/models/3d-model.glb`;
const TOP_DISPLAY_IMAGE = `${configDataRoom.generalAssetsUrl}/models/3d-model.glb`;
const FULL_DISPLAY_IMAGE = `${configDataRoom.generalAssetsUrl}/models/3d-model.glb`;

const createModelStructure = () => ({
    roomType: null,
    htmlContainer: null,
    modelScene: null,
    roomModelBox: null,
    dbChildren: [],
    threeJSCamera: null,
    threeJSRendered: null,
    threeJSControls: null,
    room3DGroup: null,
});

let 
    isSummaryStep = false,
    threeJSRenderedBasicDisplay, 
    basicDisplayScene, 
    threeJSCameraBasicDisplay,
    rootGroup,
    currentConfigId = null,
    modelRoomDimensions = {
        width: 0,
        height: 0,
        depth: 0,
    },
    modelRoomScale = {
        width: 0,
        height: 0,
        depth: 0,
    },
    currentRoomType = ROOM_TYPE_SINGLE_WALL,
    roomModels = {
        [ROOM_TYPE_SINGLE_WALL]: createModelStructure(),
        [ROOM_TYPE_WITH_CORNER]: createModelStructure(),
    };


window.initAdminRoomConfigComponent = async function initAdminRoomConfigComponent(postId) {
    const container = document.querySelector('.room-config-shortcode');
    let {
        content,
        products_list,
        products_list_per_page,
        room_dimensions,
        furniture_dimensions,
        corner_furniture_data,
        default_textures,
        total,
        currency_symbol,
    } = await getRoomAdminConfigComponentShortcodeContent(postId);

    if(!content) return;

    container.innerHTML = content;

    const newContainer = container.querySelector('.room-config-container');

    initRoomConfigFunctions(
        newContainer, 
        postId,
        default_textures,
        room_dimensions, 
        furniture_dimensions, 
        corner_furniture_data, 
        products_list,
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
    postId,
    textures,
    roomDimensions, 
    furnitureDimensions, 
    cornerFurnitureData,
    productsList, 
    productsListPerPage, 
    total, 
    currencySymbol
) {
    initTextures(textures);

    const assetsUrl = configDataRoom.assetsUrl;

    let { 
        bottom_depth, 
        bottom_depth_min: bottomDepthMin,
        bottom_depth_max,
        full_depth, 
        full_depth_min: fullDepthMin,
        full_depth_max,
        top_depth, 
        top_depth_min: topDepthMin,
        top_depth_max,
        bottom_height, 
        bottom_height_min: bottomHeightMin, 
        bottom_height_max,
        top_height,
        top_height_min: topHeightMin,
        top_height_max,
        full_height,
        full_height_min: fullHeightMin,
        full_height_max,
        space_bottom,
        space_bottom_min: spaceBottomMin,
        largest_height_val: largestHeight,
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

    let cornerBottomWidth3d = 0;
    let cornerBottomHeight3d = 0;
    let cornerBottomSpace3d = 0;
    let cornerBottomDepth3d = 0;
    let cornerTopWidth3d = 0;
    let cornerTopHeight3d = 0;
    let cornerTopDepth3d = 0;
    let cornerFullWidth3d = 0;
    let cornerFullDepth3d = 0;

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

    let modelSettings = {
        visibleDimensionsArrows: false
    }

    const configSelector = container.querySelector('.configurator-selector select');
    const zoomSlider = container.querySelector('.model-settings-sidebar .zoom-slider input[type="range"]');

    /******** progress ********/
    const progressBar = container.querySelector('.top-bar .config-progress-bar');
    const allProgressButtons = progressBar.querySelectorAll('button'); 
    let oldCurrentProgressButton = progressBar.querySelector(`button.current`);
    let currentStep = parseInt(container.getAttribute('data-progress'));
    const stepsContainer = document.querySelector('.steps-content');

    const myCabinetContents = container.querySelectorAll('.my-cabinets-list');
    const totalContainer = container.querySelector('.total-container .total-container-inner .number');
    const dynamicLists = container.querySelectorAll('.dynamic-list-inner');
    const summaryItemsList = container.querySelectorAll('.summary-cabinets-list-inner');
    const myCabinetTab = container.querySelector('.tabs button[data-type="my-cabinets"]');
    let basicDisplayContainer = container.querySelector('.progress-content .general-settings .display-container .general-settings-display-image .general-image-inner');

    setRoomModelData();
    initRoomModelSettings();
    initSettingsSave();
    progressInit();
    initRoomCabinetTypeTabs();
    initCabinetTabs();
    initCabinetTypes();

    renderBasicImage3dContainer();
    changeRoomType();
    init3dModels();

    changeInputFromRangeValue(container);
    changeRoomDimensionsValue(container);
    changeFurnitureDimensionsValue(container);
    initAddFurnitureMethod();
    loadMoreProducts(productsListPerPage);

    function setRoomModelData() {
        roomModels = {
            ...roomModels,

            [ROOM_TYPE_SINGLE_WALL]: {
                ...roomModels[ROOM_TYPE_SINGLE_WALL],
                roomType: ROOM_TYPE_SINGLE_WALL,
                dbChildren: productsList[ROOM_TYPE_SINGLE_WALL],
                htmlContainer: container.querySelector(
                    `.model-display-container .room-model-container-inner .canvas-parent[data-type="${ROOM_TYPE_SINGLE_WALL}"]`
                )
            },

            [ROOM_TYPE_WITH_CORNER]: {
                ...roomModels[ROOM_TYPE_WITH_CORNER],
                roomType: ROOM_TYPE_WITH_CORNER,
                dbChildren: productsList[ROOM_TYPE_WITH_CORNER],
                htmlContainer: container.querySelector(
                    `.model-display-container .room-model-container-inner .canvas-parent[data-type="${ROOM_TYPE_WITH_CORNER}"]`
                )
            }
        };

        // currentRoomModelObj = roomModels[ROOM_TYPE_SINGLE_WALL];  
    }

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

                if(currentStep + 1 === maxSteps) {
                    isSummaryStep = true;
                    removeAllFurnitureControls(ROOM_TYPE_SINGLE_WALL);
                    removeAllFurnitureButtons(ROOM_TYPE_SINGLE_WALL);

                    removeAllFurnitureControls(ROOM_TYPE_WITH_CORNER);
                    removeAllFurnitureButtons(ROOM_TYPE_WITH_CORNER);
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

                if(currentStep + 1 === maxSteps) {
                    isSummaryStep = true;
                    removeAllFurnitureControls(ROOM_TYPE_SINGLE_WALL);
                    removeAllFurnitureButtons(ROOM_TYPE_SINGLE_WALL);

                    removeAllFurnitureControls(ROOM_TYPE_WITH_CORNER);
                    removeAllFurnitureButtons(ROOM_TYPE_WITH_CORNER);
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
                    removeAllFurnitureControls(ROOM_TYPE_SINGLE_WALL);
                    removeAllFurnitureButtons(ROOM_TYPE_SINGLE_WALL);

                    removeAllFurnitureControls(ROOM_TYPE_WITH_CORNER);
                    removeAllFurnitureButtons(ROOM_TYPE_WITH_CORNER);
                } else {
                    isSummaryStep = false;
                }
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

    function changeRoomDimensionsValue(model3dContainer) {
        const dimensionsItemContainers = container.querySelectorAll('.room-layout .dimension-container');
        
        dimensionsItemContainers.forEach(dimensionsContainer => {
            const type = dimensionsContainer.getAttribute('data-dimension_type');
            const rangeInput = dimensionsContainer.querySelector('.slider-container input[type="range"]');
            const rangeNumInput = dimensionsContainer.querySelector('.input-container input[type="number"]');

            rangeInput.addEventListener('change', function(e) {
                const value = parseInt(e.target.value);
                rangeNumInput.value = value;

                roomDimensions[type] = parseInt(value);

                initRoomDimensions(model3dContainer);
                initRoomType();
            });
        });
    }

    function initRoomType(onPageLoad = false) {
            if(!onPageLoad) {
                roomModels[ROOM_TYPE_SINGLE_WALL].dbChildren = [];
                roomModels[ROOM_TYPE_WITH_CORNER].dbChildren = [];
                changeTotals()
    
                dynamicLists.forEach(list => {
                    list.innerHTML = '';
                });
                summaryItemsList.forEach(list => {
                    list.innerHTML = '';
                });
            }
            init3dModels();
        }

    function changeFurnitureDimensionsValue() {
        const dimensionsItemContainers = container.querySelectorAll('.general-settings .dimension-container');
        
        dimensionsItemContainers.forEach(dimensionsContainer => {
            const dimensionType = dimensionsContainer.getAttribute('data-dimension_type');
            const constName = dimensionsContainer.getAttribute('data-dimension_constant');
            const rangeInput = dimensionsContainer.querySelector('.slider-container input[type="range"]');
            const rangeNumInput = dimensionsContainer.querySelector('.input-container input[type="number"]');
         
            rangeInput.addEventListener('change', function(e) {
                const value = parseInt(e.target.value);
                rangeNumInput.value = value;
                furnitureDimensions[constName] = value;    
                
                changeBaseImageDimensions();
                changeModelChildrenDimensions(ROOM_TYPE_SINGLE_WALL);
                changeModelChildrenDimensions(ROOM_TYPE_WITH_CORNER);

                changeTotals();
            });
        });

    }

    function changeRoomType() {
        const options = container.querySelectorAll('.room-layout-options button');

        options.forEach(option => {
            const optionParent = option.parentNode;
            const type = option.getAttribute('data-type');
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
            });
        });
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
                const { content, is_last_page } = await loadMoreProductsByType(typeSlug, page, productsListPerPage);

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

    function initAddFurnitureMethod() {
        const addFurnitureButtons =  container.querySelectorAll('.add-cabinet-item .item-actions-container button[data-action_type="add"]');
        addFurnitureButtons.forEach(furnitureButton => {
            const parent = furnitureButton.closest('.add-cabinet-item');
            const itemData = JSON.parse(parent.getAttribute('data-item_data'));
            const productId = itemData.product_id;
           
            let {
                regular: regularPrice, 
                regular_cm3: regularPriceCm3,
                discount: discountPrice, 
                discount_cm3: discountPriceCm3,
                display: displayPrice,
                display_cm3: displayPriceCm3,
            } = itemData.prices;

            regularPrice = regularPrice ? parseFloat(regularPrice) : 0.00; 
            regularPriceCm3 = regularPriceCm3 ? parseFloat(regularPriceCm3) : 0.00;
            discountPrice = discountPrice ? parseFloat(discountPrice) : 0.00; 
            discountPriceCm3 = discountPriceCm3 ? parseFloat(discountPriceCm3) : 0.00; 
            discountPriceCm3 = discountPriceCm3 ? parseFloat(discountPriceCm3) : 0.00; 
            displayPrice = displayPriceCm3 ? parseFloat(displayPrice) : 0.00; 
            displayPriceCm3 = displayPriceCm3 ? parseFloat(displayPriceCm3) : 0.00; 

            const furnitureType = itemData.furniture_type;
            const modelFileSrc = itemData.model_src;
            const itemMinWidth = itemData.min_width;

            furnitureTypeAddInit(
                itemData.room_type,
                furnitureButton, 
                parent, 
                productId, 
                furnitureType,
                modelFileSrc, 
                itemMinWidth, 
                itemData.prices,
                displayPrice, 
                regularPrice, 
                discountPrice, 
                displayPriceCm3,
                regularPriceCm3,
                discountPriceCm3
            );

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
    }

    function changeCabinetsTab(tab, contents) {
        if(tab.classList.contains('active')) return;

        const currentTab = container.querySelector('.cabinet-settings .cabinets-content .tabs button.active');
        const currentContents = container.querySelectorAll('.cabinet-settings .tabs-content .tab-content.current');

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
        const furnitureItems = container.querySelectorAll('.cabinet-settings .furniture-type-list .add-cabinet-item');

        furnitureItems.forEach(furnitureItem => {
            const editBtn = furnitureItem.querySelector('.item-actions-container button[data-action_type="edit"]');
            const itemData = JSON.parse(furnitureItem.getAttribute('data-item_data'));
            const productId = itemData.product_id;
            const roomType = itemData.room_type;
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
            

            editBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const itemWidth = parseInt(furnitureItem.getAttribute('data-item_width'));
                const customId = furnitureItem.getAttribute('data-custom_id');
                createEditModal(
                    furnitureItem, 
                    roomType,
                    customId,
                    itemData, 
                    productId, 
                    furnitureType, 
                    modelFileSrc, 
                    itemWidth, 
                    itemData.price,
                    displayPrice, 
                    regularPrice, 
                    discountPrice, 
                    displayPriceCm3, 
                    regularPriceCm3, 
                    discountPriceCm3, 
                    displayPriceCm3
                );
            });
        });
    }


    async function initFurnitureDuplicateData(modelRoomType, currentCustomId, width) {

        if(!width) {
            const modelObj = roomModels[modelRoomType];

            const currentObj = modelObj.modelScene.children.find(child => child.userData.customId == currentCustomId);
    
            if(!currentObj) return;

            width = currentObj.userData.widthMm;
        }

        const newCustomId = await duplicateFurniture(modelRoomType, currentCustomId, true);

        openEditModal(width, modelRoomType, newCustomId, false);
    }

    function initFurnitureRemoveData(modelRoomType, customId) {
        const furnitureItem = container.querySelector(`.tab-item[data-room_type="${modelRoomType}"] .my-cabinets-list .cabinet-item[data-custom_id="${customId}"]`);
        
        if(!furnitureItem) return;

        const itemData = JSON.parse(furnitureItem.getAttribute('data-item_data'));
        const furnitureType = itemData.furniture_type;
        const summaryItem = document.querySelector(`.tab-item[data-room_type="${modelRoomType}"] .summary-cabinet-item[data-custom_id="${customId}"]`);

        removeItemButtonTriggerAction(modelRoomType, furnitureItem, summaryItem, furnitureType, customId);
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

    function removeItemButtonTriggerAction(modelRoomType, furnitureItem, summaryItem, furnitureType, customId) {
        const modelObj = roomModels[modelRoomType];
        const children = modelObj.modelScene.children;
        const childObj = children.find(child => child.userData.customId == customId);
        removeGLBModel(modelRoomType, childObj);

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

        roomModels[modelRoomType].dbChildren = roomModels[modelRoomType].dbChildren.filter(item => item.db_data.custom_id != customId);

        changeTotals();
    }

    function removeItemButtonTrigger(modelRoomType, furnitureItem, customId, furnitureType) {
        const removeButton = furnitureItem.querySelector('.item-actions-container button[data-action_type="remove"]');
        const summaryItem = document.querySelector(`.tabs-content .summary .cabinet-item[data-custom_id="${customId}"]`);
        if(!removeButton) {
            return;
        }

        removeButton.addEventListener('click', function(e) {
            e.preventDefault();
            removeItemButtonTriggerAction(modelRoomType, furnitureItem, summaryItem, furnitureType, customId);
        });

    }

     function duplicateFurnitureTrigger(modelRoomType, parent, customId) {
        const furnitureButton = parent.querySelector(`.item-actions-container button[data-action_type="duplicate"]`);
        furnitureButton.addEventListener('click', function() {
            duplicateFurniture(modelRoomType, customId);
        });
    }

    async function duplicateFurniture(modelRoomType, currentCustomId, triggerDupItem = false) {
        const modelObj = roomModels[modelRoomType];

        if(stepsContainer) {
            stepsContainer.classList.add('loading');
        }
        const currentItem = modelObj.dbChildren.find(item => item.db_data.custom_id == currentCustomId);

        if(!currentItem) {
            stepsContainer.classList.remove('loading');
            return;
        }

        const myItemsList = container.querySelector('.tab-item.current .cabinets .cabinets-inner .my-cabinets-list-inner');
        const summaryItemsList = container.querySelector('.tab-item.current .summary .summary-inner .summary-content');

        const customId = Date.now();
        const furnitureListItemObj = JSON.parse(JSON.stringify(currentItem));

        const productId = furnitureListItemObj.product_id;
        const modelFileSrc = furnitureListItemObj.object_src; 
        const furnitureType = furnitureListItemObj.furniture_type; 
 
        const itemHeight = furnitureListItemObj.height;
        const itemDepth = furnitureListItemObj.depth; 
        const itemWidth = furnitureListItemObj.width;
        const itemMinHeight = furnitureListItemObj.min_height;
        const itemMinDepth = furnitureListItemObj.min_depth; 
        const itemMinWidth = furnitureListItemObj.min_width;

        const {itemPositionMm} = await addGLBModel(
            modelRoomType,
            modelFileSrc, 
            furnitureType, 
            productId, 
            customId, 
            furnitureListItemObj.prices, 
            itemHeight, 
            itemDepth, 
            itemWidth, 
            itemMinHeight, 
            itemMinDepth, 
            itemMinWidth, 
            triggerDupItem
        );

        changeTotalPrice(furnitureListItemObj.prices);

        const {my_item_html, summary_item_html} = await addFurnitureItem(
            customId, 
            productId, 
            modelRoomType,
            itemWidth,
            itemHeight,
            itemDepth,
            itemPositionMm,
            state.defaultTextures,
            furnitureListItemObj.prices
        );

        if(my_item_html) {
            myItemsList.insertAdjacentHTML('beforeend', my_item_html);
            summaryItemsList.insertAdjacentHTML('beforeend', summary_item_html);

            changeCabinetsTab(myCabinetTab, myCabinetContents);

            const furnitureItem = myItemsList.querySelector(`.my-cabinet-item[data-custom_id="${customId}"]`);
            if(furnitureItem) {
                editItemButtonTrigger(modelRoomType, furnitureItem); 
                removeItemButtonTrigger(modelRoomType, furnitureItem, customId, furnitureType);
                duplicateFurnitureTrigger(modelRoomType, furnitureItem, customId);
            }
        }

        if(stepsContainer) {
            stepsContainer.classList.remove('loading');
        }

        return customId;
    }

    function getItemPxDimensions(type) {
        let itemHeight = 0;
        let itemMinHeight = 0;
        let itemDepth = 0;
        let itemMinDepth = 0;

        const { height: modelRoomHeight, depth: modelRoomDepth } = modelRoomDimensions;
    
        switch(type) {
            case DIMENSION_TYPE_BOTTOM: {
                itemHeight = furnitureDimensions.bottom_height;
                itemMinHeight = furnitureDimensions.bottom_height_min;
                itemDepth = furnitureDimensions.bottom_depth;
                itemMinDepth = furnitureDimensions.bottom_depth_min;
                
                break;
            }
            case DIMENSION_TYPE_BOTTOM_CORNER: {
                itemHeight = furnitureDimensions.bottom_height;
                itemMinHeight = furnitureDimensions.bottom_height_min;
                itemDepth = furnitureDimensions.bottom_depth;
                itemMinDepth = furnitureDimensions.bottom_depth_min;

                break;
            }
            case DIMENSION_TYPE_TOP: {
                itemHeight = furnitureDimensions.top_height;
                itemMinHeight = furnitureDimensions.top_height_min;
                itemDepth = furnitureDimensions.top_depth;
                itemMinDepth = furnitureDimensions.top_depth_min;

                break;
            }
            case DIMENSION_TYPE_TOP_CORNER: {
                itemHeight = furnitureDimensions.top_height;
                itemMinHeight = furnitureDimensions.top_height_min;
                itemDepth = furnitureDimensions.top_depth;
                itemMinDepth = furnitureDimensions.top_depth_min;

                break;
            }
            case DIMENSION_TYPE_FULL: {
                itemHeight = furnitureDimensions.full_height;
                itemMinHeight = furnitureDimensions.full_height_min;
                itemDepth = furnitureDimensions.full_depth;
                itemMinDepth = furnitureDimensions.full_depth_min;

                break;
            }
            case DIMENSION_TYPE_FULL_CORNER: {
                itemHeight = furnitureDimensions.full_height;
                itemMinHeight = furnitureDimensions.full_height_min;
                itemDepth = furnitureDimensions.full_depth;
                itemMinDepth = furnitureDimensions.full_depth_min;
                
                break;
            }
            default: {
                itemHeight = furnitureDimensions.bottom_height;
                itemMinHeight = furnitureDimensions.bottom_height_min;
                itemDepth = furnitureDimensions.bottom_depth;
                itemMinDepth = furnitureDimensions.bottom_depth_min;
            }
        }

        const pxHeight =  getItemHeightPx(itemHeight, modelRoomHeight);
        const pxDepth =  getItemDepthPx(itemDepth, modelRoomDepth);

        return {
            heightPx: pxHeight,
            depthPx: pxDepth,
            heighMm: itemHeight,
            heighMmMin: itemMinHeight,
            depthMm: itemDepth,
            depthMmMin: itemMinDepth,
        }
    }
    
    // function getItemWidthPx(itemWidth, parentWidth) {
    //     return mmToWorld(itemWidth, roomDimensions.width * 10, parentWidth);
    // }

    // function getItemHeightPx(itemHeight, parentHeight) {
    //     return mmToWorld(itemHeight, roomDimensions.height * 10, parentHeight);
    // }

    // function getItemDepthPx(itemDepth, parentDepth) {
    //     return mmToWorld(itemDepth, roomDimensions.depth * 10, parentDepth);
    // }
    function getItemWidthPx(itemWidth, parentWidth) {
        const widthWorld = (itemWidth / (roomDimensions.width * 10)) * parentWidth;
        return widthWorld;
    }

    function getItemHeightPx(itemHeight, parentHeight) {
        const heightWorld = (itemHeight / (roomDimensions.height * 10)) * parentHeight;
        return heightWorld;
    }

    function getItemDepthPx(itemDepth, parentDepth) {
        const depthWorld = (itemDepth / (roomDimensions.depth * 10)) * parentDepth;

        return depthWorld;
    }

    function get3DItemDimensionWidth(itemWidth) {
        const widthWorld = (itemWidth / (roomDimensions.width * 10)) * modelRoomDimensions.width;

        return widthWorld;
    }


    
    function calculateTopSpaceIn3dModel(parentBoxWorld) {
        const bottom = (parentBoxWorld.min.y) + defaultBottomReferenceY + FLOOR_THICKNESS;
        return bottom;
    }

    async function changeTotals() {
        total = changeProductsPrices(container.querySelectorAll('.my-cabinets-list .my-cabinet-item'), state.defaultTextures, furnitureDimensions, state.defaultComponents);

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

    function changeModelChildrenDimensions(modelRoomType) {

        const modelObj = roomModels[modelRoomType];
        const children = modelObj.modelScene.children;

        defaultBottomReferenceY =
            getDefaultBottomHeightWithSpace(roomDimensions.height, modelRoomDimensions.height);

        for (const childObj of children) {

            const userData = childObj.userData;

            if (!userData || (!userData.productId && !userData.pseudoType)) {
                continue;
            }

            const originalSize = userData.originalSize;
            const childFurnitureType = userData.furnitureType;

            const widthMm = userData.widthMm;
            const widthPx = getItemWidthPx(widthMm, modelRoomDimensions.width);

            const { heightPx, depthPx } = getItemPxDimensions(childFurnitureType);

            const { scaledChildSize } =
                placeFurnitureInRoom(modelRoomType, childObj, childFurnitureType, widthPx, heightPx, depthPx);

            // save local position
            userData.savedPosition = childObj.position.clone();
            userData.scaledSize = scaledChildSize.clone();

            const itemIndex = modelObj.dbChildren.findIndex(
                item => item.db_data.custom_id == userData.customId
            );

            if (itemIndex > -1) {

                const itemPositionMm = getItemPosition(
                    modelRoomType,
                    childFurnitureType,
                    childObj.position.clone(),
                    scaledChildSize.clone()
                );

                userData.positionMm = itemPositionMm;

                const isFitting =
                    checkIfAbleToDragChildToPosition(modelRoomType, childObj);

                const oldItem = { ...modelObj.dbChildren[itemIndex] };

                oldItem.db_data.width = widthMm;
                oldItem.db_data.furniture_position_mm = JSON.stringify(itemPositionMm);
                oldItem.db_data.is_fitting = isFitting;

                modelObj.dbChildren[itemIndex] = oldItem;
            }
        }
    }
    // function changeModelChildrenDimensions(modelRoomType) {
    //     const modelObj = roomModels[modelRoomType];
    //     const children = modelObj.modelScene.children;

    //     defaultBottomReferenceY = getDefaultBottomHeightWithSpace(roomDimensions.height, modelRoomDimensions.height);

    //     for(let i = 0; i < children.length; i++) {
    //         const childObj = children[i];
    //         const userData = childObj.userData;

    //         if(!userData || !userData.productId && !userData.pseudoType) {
    //             continue;
    //         }

    //         const originalSize = userData.originalSize;
    //         // const parentBox = userData.parentBox;
    //         const childFurnitureType = userData.furnitureType;
    //         const widthMm = userData.widthMm;
    //         const widthPx = getItemWidthPx(widthMm, modelRoomDimensions.width);
    //         // let widthPx = getItemWidthPx(roomDimensions.height, modelRoomDimensions.width);
            
    //         childObj.updateWorldMatrix(true, true);
    //         childObj.traverse((node) => {
    //             if (node.isMesh && node.geometry) {
    //                 node.geometry.computeBoundingBox();
    //             }
    //         });

    //         // const childBox = new THREE.Box3().setFromObject(childObj);
    //         let { heightPx, depthPx } = getItemPxDimensions(childFurnitureType);
    //         const { scaledChildBox, scaledChildSize } = placeFurnitureInRoom(modelRoomType, childObj, childFurnitureType, widthPx, heightPx, depthPx);

    //         /******** 2.save position and size********/
    //         const childWorldPos = new THREE.Vector3();
    //         childObj.getWorldPosition(childWorldPos);
    //         childObj.userData.savedPosition = childWorldPos.clone();
    //         childObj.userData.scaledSize = scaledChildSize.clone();
    //         /******** end save position ********/

    //         const userDataNew = childObj.userData;
    //         const itemIndex = roomModels[modelRoomType].dbChildren.findIndex(item => item.db_data.custom_id == userDataNew.customId);
    //         if(itemIndex > -1) {
    //             const itemPositionMm = getItemPosition(modelRoomType, childFurnitureType, childWorldPos.clone(), scaledChildSize.clone());
    //             childObj.userData.positionMm = itemPositionMm;
    
    //             const isFitting = checkIfAbleToDragChildToPosition(modelRoomType, childObj);
    //             const oldItem = {...roomModels[modelRoomType].dbChildren[itemIndex]};
    //             oldItem.db_data.width = widthMm;
    //             oldItem.db_data.furniture_position_mm = JSON.stringify(itemPositionMm);
    //             oldItem.db_data.is_fitting = isFitting;
    //             roomModels[modelRoomType].dbChildren[itemIndex] = {...oldItem};
    //         }
    //     }
    // }

    function getCornerDimensions() {
        const { width, height, depth } = roomDimensions; 
        const { width: modelRoomWidth, height: modelRoomHeight, depth: modelRoomDepth } = modelRoomDimensions;
        const { bottom_height, top_height, full_height, space_bottom } = furnitureDimensions;
        const bottomHeightWorld = (bottom_height / (height * 10)) * modelRoomHeight;
        const bottomWidthWorld = (cornerBottomWidth / (width * 10)) * modelRoomWidth;
        const bottomDepthWorld = (cornerBottomDepth / (depth * 10)) * modelRoomDepth;
        const topHeightWorld = (top_height / (height * 10)) * modelRoomHeight;
        const topWidthWorld = (cornerTopWidth / (width * 10)) * modelRoomWidth;
        const topDepthWorld = (cornerTopDepth / (depth * 10)) * modelRoomDepth;
        const fullHeightWorld = (full_height / (height * 10)) * modelRoomHeight;

        const fullWidthWorld = (cornerFullWidth / (width * 10)) * modelRoomWidth;
        const fullDepthWorld = (cornerFullDepth / (depth * 10)) * modelRoomDepth;
        const bottomSpaceWorld = (space_bottom / (height * 10)) * modelRoomHeight;

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

    async function renderBasicImage3dContainer() {
        const mmToUnits = 0.001; 
        const zoomOut = 1.17;
        const { bottom_height, bottom_depth, top_height, top_depth, full_height, full_depth, space_bottom } = furnitureDimensions;
        const bottomHeightUnits = bottom_height * mmToUnits;
        const topHeightUnits = top_height * mmToUnits;
        const fullHeightUnits = full_height * mmToUnits;
        const bottomDepthUnits = bottom_depth * mmToUnits;
        const fullDepthUnits = full_depth * mmToUnits;
        const topDepthUnits = top_depth * mmToUnits;
        const spaceBottomUnits = space_bottom * mmToUnits;
        
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
        basicDisplayObj.bottom = await renderBaseImage(rootGroup, BOTTOM_DISPLAY_IMAGE, bottomHeightUnits, bottomDepthUnits, widthUnits, DIMENSION_TYPE_BOTTOM, basicDisplayXPaddingUnits);
        basicDisplayObj.top = await renderBaseImage(rootGroup, TOP_DISPLAY_IMAGE, topHeightUnits, topDepthUnits, widthUnits, DIMENSION_TYPE_TOP, basicDisplayXPaddingUnits, bottomYUnits);
        changeBaseImageDimensions();
        
        function animate() {
            requestAnimationFrame(animate);

            threeJSRenderedBasicDisplay.render(basicDisplayScene, threeJSCameraBasicDisplay);
        }

        animate();

        // createBasicDisplayDimensionArrows();
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
                            node.frustumCulled = false;

                            /******* add texture ********/
                            if (!node.geometry.attributes.uv) {
                                generateSmartUVs(node.geometry);
                            }

                            const name = (node.name || "").toLowerCase();

                            const texture = getTextureSrc(furnitureType, name, state.textures3DSrc);
                            // let texture = textureBase;
        
                            // if(frontNodesDisplay.includes(name)) {
                            //     texture = textureFrame;
                            // }

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

                    // // scale object to match desired dimensions in scene units
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
        const { bottom_height, bottom_depth, top_height, top_depth, full_height, full_depth, space_bottom } = furnitureDimensions;
        const { bottom, top, full } = basicDisplayObj;

        const itemHeightBottomUnits = bottom_height * mmToUnits;
        const itemHeightTopUnits = top_height * mmToUnits;
        const itemHeightFullUnits = full_height * mmToUnits;
        const itemTopSpaceUnits = space_bottom * mmToUnits;

        const itemDepthBottomUnits = bottom_depth * mmToUnits;
        const itemDepthTopUnits = top_depth * mmToUnits;
        const itemDepthFullUnits = full_depth * mmToUnits;

        const bottomOriginalSizeY = bottom.userData.originalSize.y;
        const topOriginalSizeY = top.userData.originalSize.y;
        const fullOriginalSizeY = full.userData.originalSize.y;

        const bottomOriginalSizeZ = bottom.userData.originalSize.z;
        const topOriginalSizeZ = top.userData.originalSize.z;
        const fullOriginalSizeZ = full.userData.originalSize.z;

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

        // basicDisplayTopObj.position.y = bottomScaleY + itemTopSpaceUnits + (topScaleY / 2);
        // basicDisplayTopObj.position.y = (bottomOriginalSizeY * bottomScaleY) + itemTopSpaceUnits + (topOriginalSizeY * topScaleY) / 2;
        basicDisplayObj.top.position.y = (bottomOriginalSizeY * bottomScaleY) + itemTopSpaceUnits;
    }

    function init3dModels() {
        const singleObj = roomModels[ROOM_TYPE_SINGLE_WALL];
        const doubleObj = roomModels[ROOM_TYPE_WITH_CORNER];
        const singleContainer = singleObj.htmlContainer;
        const doubleContainer = doubleObj.htmlContainer;
        const containerWidth = singleContainer.clientWidth;
        const containerHeight = singleContainer.clientHeight;

        initRoomDimensions(singleContainer);

        const singleParams = init3dModel(
            singleObj,
            singleContainer, 
            ROOM_TYPE_SINGLE_WALL, 
            containerWidth, 
            containerHeight, 
        );

        const cornerParams = init3dModel(
            doubleObj,
            doubleContainer, 
            ROOM_TYPE_WITH_CORNER, 
            containerWidth, 
            containerHeight, 
            ROOM_TYPE_WITH_CORNER
        );
        roomModels[ROOM_TYPE_SINGLE_WALL] = {...roomModels[ROOM_TYPE_SINGLE_WALL], ...singleParams}
        roomModels[ROOM_TYPE_WITH_CORNER] = {...roomModels[ROOM_TYPE_WITH_CORNER], ...cornerParams}
    }

    function initRoomDimensions(model3dContainer) {
        let {heightPx, depthPx, widthPx, scaleX, scaleY, scaleZ} = getRoomDimensions(model3dContainer, roomDimensions);

        modelRoomDimensions = {
            width: widthPx,
            height: heightPx,
            depth: depthPx,            
        }
        modelRoomScale = {
            x: scaleX,
            y: scaleY,
            z: scaleZ,            
        }

    }

//     function init3dModel(modelObj, model3dContainer, modelRoomType, containerWidth, containerHeight, roomType = ROOM_TYPE_SINGLE_WALL) {
//     clearModelScene(modelRoomType, model3dContainer);

//     const modelScene = new THREE.Scene();

//     const textureLoader = new THREE.TextureLoader();
//     const wallTexture = textureLoader.load(configDataRoom.generalAssetsUrl + '/images/room/brick-wall.jpg');
//     const floorTexture = textureLoader.load(configDataRoom.generalAssetsUrl + '/images/room/floor-limestone.jpg');
//     wallTexture.colorSpace = THREE.SRGBColorSpace;
//     floorTexture.colorSpace = THREE.SRGBColorSpace;

//     const { width: roomWidth, height: roomHeight, depth: roomDepth } = roomDimensions;
//     const { width: modelRoomWidth, height: modelRoomHeight, depth: modelRoomDepth } = modelRoomDimensions;

//     /******** CAMERA ********/
//     const fov = 45;
//     const aspect = containerWidth / containerHeight;
//     const threeJSCamera = new THREE.PerspectiveCamera(fov, aspect, 0.5, 1000);

//     /******** RENDERER ********/
//     const threeJSRendered = new THREE.WebGLRenderer({
//         antialias: true,
//         alpha: true,
//         preserveDrawingBuffer: true
//     });
//     threeJSRendered.setSize(containerWidth, containerHeight);
//     model3dContainer.appendChild(threeJSRendered.domElement);

//     /******** CONTROLS ********/
//     const threeJSControls = new OrbitControls(threeJSCamera, threeJSRendered.domElement);
//     threeJSControls.enableZoom = true;
//     threeJSControls.enableDamping = true;
//     threeJSControls.dampingFactor = 0.05;
//     threeJSControls.zoomSpeed = 1.2;

//     /******** LIGHTS ********/
//     const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
//     modelScene.add(hemiLight);

//     const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
//     dirLight.position.set(100, 200, 100);
//     modelScene.add(dirLight);

//     const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
//     modelScene.add(ambientLight);

//     /******** ROOM GROUP ********/
//     const room3DGroup = new THREE.Group();
//     defaultBottomReferenceY = getDefaultBottomHeightWithSpace(roomHeight, modelRoomHeight);

//     // Floor
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

//     // Walls
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

//     // /******** VISUAL WRAPPER (Rotate Room) ********/
//     // const visualRoomGroup = new THREE.Group();
//     // visualRoomGroup.add(room3DGroup);
//     // visualRoomGroup.rotation.y = THREE.MathUtils.degToRad(-20); // visual rotation only
//     modelScene.add(room3DGroup);

//     /******** ADD FURNITURE ********/
//     modelObj.dbChildren.forEach(child => {
//         const dbData = child.db_data;
//         const childPositionMm = JSON.parse(dbData.furniture_position_mm);
//         const childIsFitting = Boolean(parseInt(dbData.is_fitting));
//         addExistingGLBModel(
//             modelScene,
//             modelRoomType,
//             modelObj,
//             child.id,
//             child.object_src,
//             child.furniture_type,
//             child.product_id,
//             dbData.custom_id,
//             parseInt(dbData.width),
//             childPositionMm,
//             childIsFitting
//         );
//         productActionsInit(
//             modelRoomType,
//             dbData.custom_id,
//             child,
//             child.product_id,
//             child.furniture_type,
//             child.object_src,
//             child.prices
//         );
//     });

//     /******** FINAL CAMERA FIT ********/
//     const roomModelBox = new THREE.Box3().setFromObject(room3DGroup);
//     const size = new THREE.Vector3();
//     const center = new THREE.Vector3();
//     roomModelBox.getSize(size);
//     roomModelBox.getCenter(center);

//     const maxDim = Math.max(size.x, size.y, size.z);
//     const fovRad = THREE.MathUtils.degToRad(fov);
//     let cameraDistance = maxDim / (2 * Math.tan(fovRad / 2)) * 1.5;

//     const yaw = Math.PI / 4;
//     const pitch = THREE.MathUtils.degToRad(35);

//     threeJSCamera.position.set(
//         center.x + cameraDistance * Math.sin(yaw) * Math.cos(pitch),
//         center.y + cameraDistance * Math.sin(pitch),
//         center.z + cameraDistance * Math.cos(yaw) * Math.cos(pitch)
//     );
//     threeJSCamera.lookAt(center);

//     threeJSControls.target.copy(center);
//     threeJSControls.update();
//     threeJSCamera.near = Math.max(0.5, cameraDistance / 100);
//     threeJSCamera.far = cameraDistance * 20;
//     threeJSCamera.updateProjectionMatrix();

//     threeJSControls.maxDistance = cameraDistance * 5;
//     threeJSControls.minDistance = cameraDistance * 0.05;
//     threeJSControls.maxPolarAngle = Math.PI / 2;

//     /******** ANIMATE ********/
//     const animate = () => {
//         requestAnimationFrame(animate);
//         threeJSControls.update();
//         threeJSRendered.render(modelScene, threeJSCamera);
//         updateZoomSlider(threeJSCamera, threeJSControls);
//     };
//     animate();

//     /******** CLICK EVENTS ********/
//     threeJSRendered.domElement.addEventListener('click', e => {
//         onClickModel(e, roomType, threeJSRendered, threeJSCamera);
//     });

//     if (modelRoomType === ROOM_TYPE_SINGLE_WALL) {
//         setZoomSettingsValues(threeJSCamera, threeJSControls);
//     }

//     /******** RETURN ********/
//     return {
//         ...modelObj,
//         modelScene,
//         roomModelBox,
//         threeJSCamera,
//         threeJSRendered,
//         threeJSControls,
//         room3DGroup,
//         roomDimensions: {
//             width: modelRoomWidth,
//             height: modelRoomHeight,
//             depth: modelRoomDepth,
//         },
//         visualRoomGroup // now stored if you want to adjust rotation later
//     };
// }

    function init3dModel(modelObj, model3dContainer, modelRoomType, containerWidth, containerHeight, roomType = ROOM_TYPE_SINGLE_WALL) {
        clearModelScene(modelRoomType, model3dContainer);

        const modelScene = new THREE.Scene();

        const textureLoader = new THREE.TextureLoader();
        const wallTexture = textureLoader.load(configDataRoom.generalAssetsUrl + '/images/room/brick-wall.jpg');
        const floorTexture = textureLoader.load(configDataRoom.generalAssetsUrl + '/images/room/floor-limestone.jpg');
        wallTexture.colorSpace = THREE.SRGBColorSpace;
        floorTexture.colorSpace = THREE.SRGBColorSpace;

        const { width: roomWidth, height: roomHeight, depth: roomDepth } = roomDimensions;
        const { width: modelRoomWidth, height: modelRoomHeight, depth: modelRoomDepth } = modelRoomDimensions;

        /******** CAMERA ********/
        const fov = 45;
        const aspect = containerWidth / containerHeight;
        let threeJSCamera = new THREE.PerspectiveCamera(fov, aspect, 0.5, 1000);

        /******** RENDERER ********/
        const threeJSRendered = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: true
        });

        threeJSRendered.setSize(containerWidth, containerHeight);
        model3dContainer.appendChild(threeJSRendered.domElement);

        /******** CONTROLS ********/
        const threeJSControls = new OrbitControls(threeJSCamera, threeJSRendered.domElement);

        threeJSControls.enableZoom = true;   // (usually true by default, but safe)
        threeJSControls.enableDamping = true;
        threeJSControls.dampingFactor = 0.05;

        threeJSControls.zoomSpeed = 1.2;

        /******** LIGHTS ********/
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
        modelScene.add(hemiLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
        dirLight.position.set(100, 200, 100);
        modelScene.add(dirLight);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        modelScene.add(ambientLight);

        /******** ROOM ********/
        const room3DGroup = new THREE.Group();

        defaultBottomReferenceY = getDefaultBottomHeightWithSpace(roomHeight, modelRoomHeight);

        const floorMaterial = new THREE.MeshStandardMaterial({
            map: floorTexture,
            color: 0xffffff,
            metalness: 0,
            roughness: 0.5,
            side: THREE.DoubleSide
        });

        const floor = new THREE.Mesh(
            new THREE.BoxGeometry(modelRoomWidth, FLOOR_THICKNESS, modelRoomDepth),
            floorMaterial
        );

        floor.position.y = -FLOOR_THICKNESS / 2;
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

        if (roomType === ROOM_TYPE_WITH_CORNER) {
            const leftWall = new THREE.Mesh(
                new THREE.BoxGeometry(WALL_THICKNESS, wallHeightWithFloorThinkness, modelRoomDepth + FLOOR_THICKNESS),
                wallMaterial
            );

            leftWall.position.set(
                -modelRoomWidth / 2 - WALL_THICKNESS / 2,
                wallHeightWithFloorThinkness / 2 - FLOOR_THICKNESS,
                -FLOOR_THICKNESS / 2
            );

            leftWall.receiveShadow = true;
            room3DGroup.add(leftWall);
        }

        const rightWall = new THREE.Mesh(
            new THREE.BoxGeometry(modelRoomWidth, wallHeightWithFloorThinkness, WALL_THICKNESS),
            wallMaterial
        );

        rightWall.position.set(
            0,
            wallHeightWithFloorThinkness / 2 - FLOOR_THICKNESS,
            -modelRoomDepth / 2 - WALL_THICKNESS / 2
        );

        rightWall.receiveShadow = true;
        room3DGroup.add(rightWall);

        modelScene.add(room3DGroup);

        /************ rotation *********/
        // // Wrap the room in a visual-only group
        // const visualRoomGroup = new THREE.Group();
        // visualRoomGroup.add(room3DGroup);

        // Apply visual rotation without changing room coordinates
        //visualRoomGroup.rotation.y = THREE.MathUtils.degToRad(-20); // rotate -20°

        // Add the visual wrapper to the scene instead of the raw room3DGroup
        // modelScene.add(visualRoomGroup);
        /************ end rotation *********/
        // Now use room3DGroup for calculations (camera fit, OrbitControls, bounding box)
        
        const roomModelBox = new THREE.Box3().setFromObject(room3DGroup); 
     
        /******** CORNER SETUP ********/
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
            appendCornerPseudoModelObjects(modelScene, roomModelBox);
        }

        /******** LIGHTS ********/

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

        /******** ADD MODELS ********/
        modelObj.dbChildren.forEach(child => {
            const dbData = child.db_data;
            const childId = child.id;
            const childProductId = child.product_id;
            const childCustomId = dbData.custom_id;
            const childSrc = child.object_src;
            const childType = child.furniture_type;
            const childWidth = parseInt(dbData.width);
            const childPositionMm = JSON.parse(dbData.furniture_position_mm);
            const childIsFitting = Boolean(parseInt(dbData.is_fitting));

            addExistingGLBModel(
                modelScene,
                modelRoomType,
                child.id,
                child.object_src,
                child.furniture_type,
                child.product_id,
                childCustomId,
                childWidth,
                childPositionMm,
                childIsFitting
            );

            productActionsInit(
                modelRoomType,
                childCustomId,
                child,
                childProductId,
                childType,
                childSrc,
                child.prices,
            );
        });

        /******** FINAL CAMERA FIT ********/
        const fullBox = new THREE.Box3().setFromObject(modelScene);

        const size = new THREE.Vector3();
        const center = new THREE.Vector3();

        fullBox.getSize(size);
        fullBox.getCenter(center);

        const maxDim = Math.max(size.x, size.y, size.z);
        const fovRad = THREE.MathUtils.degToRad(fov);

        let cameraDistance = maxDim / (2 * Math.tan(fovRad / 2));
        cameraDistance *= 1.5;

        const yawOffset = roomType == ROOM_TYPE_SINGLE_WALL ? THREE.MathUtils.degToRad(-70) : 0; 
        const yaw = Math.PI / 4 + yawOffset;
        const pitch = THREE.MathUtils.degToRad(35);

        threeJSCamera.position.set(
            center.x + cameraDistance * Math.sin(yaw) * Math.cos(pitch),
            center.y + cameraDistance * Math.sin(pitch),
            center.z + cameraDistance * Math.cos(yaw) * Math.cos(pitch)
        );

        threeJSCamera.lookAt(center);

        // SAVE INITIAL STATE
        threeJSControls.target.copy(center);
        threeJSControls.update();
        threeJSControls.saveState();
        // End SAVE INITIAL STATE

        threeJSControls.target.copy(center);
        threeJSControls.update();

        threeJSCamera.near = Math.max(0.5, cameraDistance / 100);
        threeJSCamera.far = cameraDistance * 20;
        threeJSCamera.updateProjectionMatrix();

        threeJSControls.maxDistance = cameraDistance * 5;
        // threeJSControls.minDistance = cameraDistance * 0.2;
        threeJSControls.minDistance = cameraDistance * 0.05;
        threeJSControls.maxPolarAngle = Math.PI / 2;

        /******** OPTIONAL SAFETY ********/
        modelScene.traverse(obj => {
            if (obj.isMesh) obj.frustumCulled = false;
        });

        /******** ANIMATE ********/
        const animate = () => {
            requestAnimationFrame(animate);
            threeJSControls.update();
            threeJSRendered.render(modelScene, threeJSCamera);
            updateZoomSlider(threeJSCamera, threeJSControls);
        };
        animate();

        threeJSRendered.domElement.addEventListener('click', function(e) {
            onClickModel(e, roomType, threeJSRendered, threeJSCamera);
        });

        if(modelRoomType === ROOM_TYPE_SINGLE_WALL) {
            setZoomSettingsValues(threeJSCamera, threeJSControls);
        }

        return {
            ...modelObj,
            modelScene,
            roomModelBox,
            threeJSCamera,
            threeJSRendered,
            threeJSControls,
            room3DGroup,
            roomDimensions: {
                width: modelRoomWidth,
                height: modelRoomHeight,
                depth: modelRoomDepth,
            }
        };
    }

    function setZoomSettingsValues(threeJSCamera, threeJSControls) {
        const currentDistance = threeJSCamera.position.distanceTo(threeJSControls.target);
        zoomSlider.min = threeJSControls.minDistance;
        zoomSlider.max = threeJSControls.maxDistance;
        zoomSlider.value = currentDistance;
    }

    // function init3dModel(model3dContainer, containerWidth, containerHeight, children, roomType = ROOM_TYPE_SINGLE_WALL) {
    function init3dModelOld(modelObj, model3dContainer, modelRoomType, containerWidth, containerHeight, roomType = ROOM_TYPE_SINGLE_WALL) {
        clearModelScene(modelRoomType, model3dContainer);
        const modelScene = new THREE.Scene();
        const textureLoader = new THREE.TextureLoader();
        const wallTexture = textureLoader.load(configDataRoom.generalAssetsUrl + '/images/room/brick-wall.jpg');
        const floorTexture = textureLoader.load(configDataRoom.generalAssetsUrl + '/images/room/floor-limestone.jpg');
        wallTexture.colorSpace = THREE.SRGBColorSpace;
        floorTexture.colorSpace = THREE.SRGBColorSpace;

        const { width: roomWidth, height: roomHeight, depth: roomDepth} = roomDimensions;
        const { width: modelRoomWidth, height: modelRoomHeight, depth: modelRoomDepth} = modelRoomDimensions;

        /**** set camera ******/
        const fov = 45;
        const aspect = containerWidth / containerHeight;

        let threeJSCamera = new THREE.PerspectiveCamera(fov, aspect, 0.5, 1000);
        
        /**** end set camera ******/

       const threeJSRendered = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
        
        threeJSRendered.setSize(containerWidth, containerHeight);
        model3dContainer.appendChild(threeJSRendered.domElement);

        const threeJSControls = new OrbitControls(threeJSCamera, threeJSRendered.domElement);

        /********* light *********/
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
        modelScene.add(hemiLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
        dirLight.position.set(100, 200, 100);
        modelScene.add(dirLight);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // soft fill light
        modelScene.add(ambientLight);

        /************room ****************/
        const room3DGroup = new THREE.Group();
   
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

        room3DGroup.rotation.y = THREE.MathUtils.degToRad(-20);

        /******** FIT CAMERA TO ROOM ********/
        const roomModelBox = new THREE.Box3().setFromObject(room3DGroup); 

        const center = new THREE.Vector3();
        roomModelBox.getCenter(center);

        const size = new THREE.Vector3();
        roomModelBox.getSize(size);
        
        const maxDim = Math.max(size.x, size.y, size.z);
        const fovRad = THREE.MathUtils.degToRad(fov);

        let cameraDistance = maxDim / (2 * Math.tan(fovRad / 2));
        // cameraDistance *= 1.5; // padding
        cameraDistance *= 1.2; // padding

        // angled view (your style preserved)
        const yaw = Math.PI / 4;
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

        /******** CONTROLS SETUP ********/
        threeJSControls.target.copy(center);

        // OrbitControls target
        threeJSControls.target.copy(center);//new
        threeJSControls.update();//new

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
            appendCornerPseudoModelObjects(modelScene, roomModelBox);
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

        const newModelObj = {
            ...modelObj,
            modelScene,
            roomModelBox,
            threeJSCamera,
            threeJSRendered,
            threeJSControls,
            room3DGroup,
            roomDimensions: {
                width: modelRoomWidth,
                height: modelRoomHeight,
                depth: modelRoomDepth,
            }
        };

        modelObj.dbChildren.forEach((child, index) => {
            const dbData = child.db_data;
            const childId = child.id;
            const childProductId = child.product_id;
            const childCustomId = dbData.custom_id;
            const childSrc = child.object_src;
            const childType = child.furniture_type;
            const childWidth = parseInt(dbData.width);
            const childPositionMm = JSON.parse(dbData.furniture_position_mm);
            const childIsFitting = Boolean(parseInt(dbData.is_fitting));

            addExistingGLBModel(
                modelScene,
                modelRoomType,
                modelObj,
                childId, 
                childSrc, 
                childType, 
                childProductId, 
                childCustomId, 
                childWidth, 
                childPositionMm, 
                childIsFitting
            );
        
            productActionsInit(
                modelRoomType,
                childCustomId,
                child,
                childProductId,
                childType,
                childSrc,
                child.prices,
            );
        });
  
        const animate = () => {
            requestAnimationFrame(animate);
            threeJSControls.update();
            threeJSRendered.render(modelScene, threeJSCamera);
        };
        animate();

        threeJSRendered.domElement.addEventListener('click', function(e) {
            onClickModel(e, roomType, threeJSRendered, threeJSCamera);
        }, false);

        return newModelObj;
    }

    function removeAllFurnitureControls(modelRoomType) {
        const modelObj = roomModels[modelRoomType];
        modelObj.modelScene.children.forEach(childMeshGroup => {
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

    function highlightCurrentItem(modelRoomType, customId) {
        const modelObj = roomModels[modelRoomType];
        const currentModel = modelObj.modelScene.children.find(item => item.userData.customId == customId);

        if(!currentModel) return;

        const rect = modelObj.threeJSRendered.domElement.getBoundingClientRect();
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

        for (const [key, roomModel] of Object.entries(roomModels)) {
            roomModel.modelScene.children.map(model => {
                model.traverse(child => {
                    if (child.isMesh && child?.material?.emissive) {
                        child.material.emissive.set(0x000000);   // reset emissive color
                        child.material.emissiveIntensity = 1;   // back to default
                    }
                });
            });
        }

    }

    function removeGLBModel(modelRoomType, childObj) {
        if(!childObj) return;
        const modelObj = roomModels[modelRoomType];

        removeAllFurnitureButtons(modelRoomType);

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

        if(modelRoomType === ROOM_TYPE_WITH_CORNER) {
            appendCornerPseudoModelObjects(modelObj.modelScene, modelObj.roomModelBox);
        }
    }

//     function setCornerChildenDragging(modelRoomType, obj, customId) {

//     const modelObj = roomModels[modelRoomType];
//     const { width, depth } = worldItemsDimensions;

//     const furnitureType = obj.userData.furnitureType;
//     const objSize = obj.userData.scaledSize.clone();

//     const objWidth = objSize.x;
//     const objDepth = objSize.z;

//     let cornerThreshold = objWidth - 0.01;

//     const { bottomCorner: cornerBottomWidth3d, fullCorner: cornerFullWidth3d, topCorner: cornerTopWidth3d } = width;
//     const { bottomCorner: cornerBottomDepth3d, fullCorner: cornerFullDepth3d, topCorner: cornerTopDepth3d } = depth;

//     /* -------- choose threshold width -------- */

//     switch (furnitureType) {
//         case DIMENSION_TYPE_BOTTOM:
//             cornerThreshold = cornerBottomWidth3d || cornerFullWidth3d || cornerTopWidth3d || cornerThreshold;
//             break;

//         case DIMENSION_TYPE_TOP:
//             cornerThreshold = cornerTopWidth3d || cornerFullWidth3d || cornerBottomWidth3d || cornerThreshold;
//             break;

//         case DIMENSION_TYPE_FULL:
//             cornerThreshold = cornerFullWidth3d || cornerTopWidth3d || cornerBottomWidth3d || cornerThreshold;
//             break;
//     }

//     const roomBox = modelObj.roomModelBox;

//     const pos = obj.position.clone(); // LOCAL POSITION
//     pos.y = obj.userData.savedPosition.y;

//     const forwardThreshold = roomBox.min.x + cornerThreshold;

//     /* ---------- LEFT CORNER ---------- */

//     if (pos.x < forwardThreshold) {

//         obj.rotation.y = Math.PI / 2;

//         let zDimension = 0;

//         switch (furnitureType) {
//             case DIMENSION_TYPE_BOTTOM:
//                 zDimension = cornerBottomDepth3d || cornerFullDepth3d || cornerTopDepth3d;
//                 break;

//             case DIMENSION_TYPE_TOP:
//                 zDimension = cornerTopDepth3d || cornerFullDepth3d || cornerBottomDepth3d;
//                 break;

//             case DIMENSION_TYPE_FULL:
//                 zDimension = cornerFullDepth3d || cornerTopDepth3d || cornerBottomDepth3d;
//                 break;
//         }

//         pos.x = roomBox.min.x + objWidth / 2 + WALL_THICKNESS;

//         pos.z = THREE.MathUtils.clamp(
//             pos.z,
//             roomBox.min.z + zDimension + WALL_THICKNESS + objDepth / 2,
//             roomBox.max.z - objDepth / 2
//         );

//     }

//     /* ---------- FRONT WALL ---------- */

//     else {

//         obj.rotation.y = 0;

//         pos.z = roomBox.min.z + objDepth / 2 + WALL_THICKNESS;

//         pos.x = THREE.MathUtils.clamp(
//             pos.x,
//             roomBox.min.x + objWidth / 2 + WALL_THICKNESS,
//             roomBox.max.x - objWidth / 2
//         );
//     }
    
//     obj.position.copy(pos);

//     obj.updateMatrixWorld(true);

//     /* ---------- collision ---------- */

//     const objBox = new THREE.Box3().setFromObject(obj);

//     const isFitting = checkIfAbleToDragChildToPosition(
//         modelRoomType,
//         obj,
//         objBox
//     );

//     return isFitting;
// }

    function setCornerChildenDragging(modelRoomType, obj, furnitureType) {

        const modelObj = roomModels[modelRoomType];
        const roomBox = modelObj.roomModelBox;

        const WALL = WALL_THICKNESS || 0.01;

        const objSize = obj.userData.scaledSize;
        console.log(objSize)
        const pos = obj.position.clone();

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

        const cornerWidth = getDimension(furnitureType, "width");
        const cornerDepth = getDimension(furnitureType, "depth");

        // ---------- CORNER THRESHOLD ----------
        const threshold = cornerWidth > 0 ? cornerWidth : objSize.x - 0.01;
        const forwardThreshold = roomBox.min.x + threshold;

        const isCorner = pos.x < forwardThreshold;

        // ---------- FOOTPRINT ----------
        let width = objSize.x;
        let depth = objSize.z;

        if (isCorner) {
            [width, depth] = [depth, width];
        }

        // ---------- POSITIONING ----------
        if (isCorner) {

            pos.x = roomBox.min.x + width / 2 + WALL;

            pos.z = clamp(
                pos.z,
                roomBox.min.z + depth / 2 + WALL + cornerDepth,
                roomBox.max.z - depth / 2
            );

        } else {

            pos.z = roomBox.min.z + depth / 2 + WALL;

            pos.x = clamp(
                pos.x,
                roomBox.min.x + width / 2 + WALL,
                roomBox.max.x - width / 2
            );

        }

        // ---------- APPLY TRANSFORM ----------
        obj.rotation.y = isCorner ? Math.PI / 2 : 0;

        pos.y = obj.userData.savedPosition.y;

        obj.position.copy(pos);

        // ---------- COLLISION CHECK ----------
        return checkIfAbleToDragChildToPosition(modelObj.roomType, obj);
    }


    // ---------- UTIL ----------
    function clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
    }


    // function setCornerChildenDragging(modelRoomType, obj, furnitureType) {
    //     const modelObj = roomModels[modelRoomType];
    //     // ------------------ LOCAL VARIABLES ------------------
    //     const roomBox = modelObj.roomModelBox; // assumed in local coordinates
    //     const WALL = WALL_THICKNESS || 0.01;

    //     // original size (pre-scaled)
    //     const objSize = obj.userData.scaledSize.clone();
    //     let width = objSize.x;
    //     let depth = objSize.z;

    //     // ------------------ ROTATION ------------------
    //     // rotate 90° if object is in corner
    //     // const forwardThreshold = roomBox.min.x + getCornerWidth(furnitureType);

    //     const getDimension = (type, dim) => {
    //         const d = worldItemsDimensions[dim];

    //         if (type === DIMENSION_TYPE_BOTTOM) {
    //             return d.bottomCorner || d.fullCorner || d.topCorner || 0;
    //         }
    //         if (type === DIMENSION_TYPE_TOP) {
    //             return d.topCorner || d.fullCorner || d.bottomCorner || 0;
    //         }
    //         if (type === DIMENSION_TYPE_FULL) {
    //             return d.fullCorner || d.topCorner || d.bottomCorner || 0;
    //         }

    //         return 0;
    //     };

    //     const cornerWidth = getDimension(furnitureType, "width");
    //     const cornerDepth = getDimension(furnitureType, "depth");
    //     console.log(cornerWidth)
    //      let threshold = cornerWidth > 0 ? cornerWidth : width - 0.01;

    //     const forwardThreshold = roomBox.min.x + threshold;

    //     if (obj.position.x < forwardThreshold) {
    //         obj.rotation.y = Math.PI / 2;

    //         // swap footprint after rotation
    //         [width, depth] = [depth, width];
            
    //     } else {
    //         obj.rotation.y = 0;
    //     }

    //     // ------------------ POSITIONING ------------------
    //     let pos = obj.position.clone();

    //     // X: clamp to walls
    //     pos.x = clamp(
    //         roomBox.min.x + width / 2 + WALL,
    //         roomBox.max.x - width / 2,
    //         pos.x
    //     );

    //     // Z: clamp to walls or corner depth
    //     // const cornerDepth = getCornerDepth(furnitureType);
    //     pos.z = clamp(
    //         roomBox.min.z + depth / 2 + WALL + (obj.rotation.y === Math.PI / 2 ? cornerDepth : 0),
    //         roomBox.max.z - depth / 2,
    //         pos.z
    //     );

    //     // Y stays where it was
    //     pos.y = obj.userData.savedPosition.y;

    //     obj.position.copy(pos);

    //     // ------------------ HELPERS ------------------

    //     // returns corner width for the furniture type
    //     function getCornerWidth(furnitureType) {
    //         const { width } = worldItemsDimensions;
    //         return width.bottomCorner || width.fullCorner || width.topCorner || 0;
    //     }

    //     // returns corner depth for the furniture type
    //     function getCornerDepth(furnitureType) {
    //         const { depth } = worldItemsDimensions;
    //         return depth.bottomCorner || depth.fullCorner || depth.topCorner || 0;
    //     }

    //     // clamp helper
    //     function clamp(min, max, val) {
    //         return Math.max(min, Math.min(max, val));
    //     }

    //     // ------------------ CHECK FIT ------------------
    //     return checkIfAbleToDragChildToPosition(modelObj.roomType, obj);
    // }


function setCornerChildenDraggingOlkd2(modelRoomType, obj, customId) {

    const modelObj = roomModels[modelRoomType];
    const furnitureType = obj.userData.furnitureType;

    const objSize = obj.userData.scaledSize.clone();
    const objWidth = objSize.x;
    const objDepth = objSize.z;

    const pos = obj.position.clone(); // LOCAL POSITION
    pos.y = obj.userData.savedPosition.y;

    const roomBox = modelObj.roomModelBox;

    const objBox = new THREE.Box3().setFromObject(obj);

    const getDimension = (type, dim) => {
        const d = worldItemsDimensions[dim];

        if (type === DIMENSION_TYPE_BOTTOM) {
            return d.bottomCorner || d.fullCorner || d.topCorner || 0;
        }
        if (type === DIMENSION_TYPE_TOP) {
            return d.topCorner || d.fullCorner || d.bottomCorner || 0;
        }
        if (type === DIMENSION_TYPE_FULL) {
            return d.fullCorner || d.topCorner || d.bottomCorner || 0;
        }

        return 0;
    };

    const cornerWidth = getDimension(furnitureType, "width");
    const cornerDepth = getDimension(furnitureType, "depth");

    let threshold = cornerWidth > 0 ? cornerWidth : objWidth - 0.01;

    const forwardThreshold = roomBox.min.x + threshold;

    if (pos.x < forwardThreshold) {
        // ---------- CORNER WALL ----------

        // obj.rotation.y = Math.PI / 2;

        // pos.x = roomBox.min.x + rotatedSize.x / 2 + WALL_THICKNESS;
        // // pos.x = roomBox.min.x + WALL_THICKNESS;
        // pos.z = Math.max(
        //     roomBox.min.z + cornerDepth + WALL_THICKNESS + objDepth / 2,
        //     Math.min(roomBox.max.z - objDepth / 2, pos.z)
        // );
        let width = objSize.x;
        let depth = objSize.z;

        [width, depth] = [depth, width];

        pos.x = roomBox.min.x + width / 2 + WALL_THICKNESS;

        pos.z = Math.max(
            roomBox.min.z + cornerDepth + WALL_THICKNESS + depth / 2,
            Math.min(roomBox.max.z - depth / 2, pos.z)
        );
console.log("TTT");
    } else {

        // ---------- MAIN WALL ----------

        obj.rotation.y = 0;

        pos.z = roomBox.min.z + objDepth / 2 + WALL_THICKNESS;

        pos.x = Math.max(
            roomBox.min.x + objWidth / 2 + WALL_THICKNESS,
            Math.min(roomBox.max.x - objWidth / 2, pos.x)
        );

    }

    obj.position.copy(pos);

    const isFitting = checkIfAbleToDragChildToPosition(
        modelRoomType,
        obj,
    );

    return isFitting;
}

    function setCornerChildenDraggingOld(modelRoomType, obj, customId) {
        const modelObj = roomModels[modelRoomType];
        const {width, height, depth} = worldItemsDimensions;
        const { bottomCorner: cornerBottomWidth3d, fullCorner: cornerFullWidth3d, topCorner: cornerTopWidth3d } = width;
        const furnitureType = obj.userData.furnitureType;

        obj.updateMatrixWorld(true); //new
        const objBox = new THREE.Box3().setFromObject(obj);
        // const objSize = objBox.getSize(new THREE.Vector3());
        const objSize = obj.userData.scaledSize.clone(); //new

        const objWidth =  objSize.x;
        const objDepth =  objSize.z

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
                break;
            }
            case DIMENSION_TYPE_FULL: {
                if(cornerFullWidth && cornerFullWidth > 0) {
                    cornerThresholder = cornerFullWidth3d; 
                } else if(cornerTopWidth && cornerTopWidth > 0) {
                    cornerThresholder = cornerTopWidth3d; 
                } else if(cornerBottomWidth && cornerBottomWidth > 0) {
                    cornerThresholder = cornerBottomWidth3d; 
                }
                break;
            }
            default: {
                cornerThresholder = objWidth - 0.01;
            }
        }

        // const parentBoxWorld = new THREE.Box3().setFromObject(modelObj.room3DGroup);
        const forwardThreshold = modelObj.roomModelBox.min.x + cornerThresholder - 0;

        const objWorldPos = obj.getWorldPosition(new THREE.Vector3());
        const rotatedSize = objBox.getSize(new THREE.Vector3());

        objWorldPos.y = obj.userData.savedPosition.y; 
        
        if (obj.position.x < forwardThreshold) {
            const { bottomCorner: cornerBottomDepth3d, fullCorner: cornerFullDepth3d, topCorner: cornerTopDepth3d } = depth;
            obj.rotation.y = Math.PI / 2;
            objBox.setFromObject(obj); // recompute after rotation
            objWorldPos.x = modelObj.roomModelBox.min.x + rotatedSize.x / 2 + WALL_THICKNESS;

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
                    break;
                }
                case DIMENSION_TYPE_FULL: {
                    if(cornerFullDepth && cornerFullDepth > 0) {
                        zDimension = cornerFullDepth3d; 
                    } else if(cornerTopDepth && cornerTopDepth > 0) {
                        zDimension = cornerTopDepth3d; 
                    } else if(cornerBottomDepth && cornerBottomDepth > 0) {
                        zDimension = cornerBottomDepth3d; 
                    }
                    break;
                }
            }
   
            objWorldPos.z = Math.max(
                modelObj.roomModelBox.min.z + zDimension  + WALL_THICKNESS + objDepth / 2,
                Math.min(modelObj.roomModelBox.max.z - objDepth / 2, objWorldPos.z )
            );
            console.log(objWorldPos)
        } else {
            obj.rotation.y = 0;
            objBox.setFromObject(obj);
            objWorldPos.z = modelObj.roomModelBox.min.z + objDepth / 2 + WALL_THICKNESS;

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
                    break;
                }
                case DIMENSION_TYPE_FULL: {
                    if(cornerFullWidth && cornerFullWidth > 0) {
                        xDimension = cornerFullWidth3d; 
                    } else if(cornerTopWidth && cornerTopWidth > 0) {
                        xDimension = cornerTopWidth3d;
                    } else if(cornerBottomWidth && cornerBottomWidth > 0) {
                        xDimension = cornerBottomWidth3d; 
                    }
                    break;
                }
            }

            objWorldPos.x = Math.max(
                modelObj.roomModelBox.min.x + rotatedSize.x / 2 + WALL_THICKNESS,
                Math.min(modelObj.roomModelBox.max.x - rotatedSize.x / 2, objWorldPos.x)
            );
        }

        const worldPos = obj.parent.worldToLocal(objWorldPos);
        obj.position.copy(worldPos.clone());
        // resaveObjPosition(modelRoomType, obj, worldPos, customId);
        
        const isFitting = checkIfAbleToDragChildToPosition(modelRoomType, obj);

        return isFitting;
    }

    function rotateExistingItem(modelRoomType, obj, scaledChildSize, furnitureType) {
        if(modelRoomType !== ROOM_TYPE_WITH_CORNER) return;

        const modelObj = roomModels[modelRoomType];
        if (!modelObj || !modelObj.room3DGroup) return;

       // Ensure matrices are fresh
        // obj.updateMatrixWorld(true);
        modelObj.room3DGroup.updateMatrixWorld(true);

        /* -------------------------------------------------- */
        /* 1️⃣ Get parent (room) world bounding box           */
        /* -------------------------------------------------- */

        /* -------------------------------------------------- */
        /* 2️⃣ Get object world position + size               */
        /* -------------------------------------------------- */
        const objWorldPos = obj.getWorldPosition(new THREE.Vector3());

        obj.updateMatrixWorld(true); //new
        // const objBox = new THREE.Box3().setFromObject(obj);
        // const objSize = objBox.getSize(new THREE.Vector3());
        const objSize = obj.userData.scaledSize.clone(); //new

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

            case DIMENSION_TYPE_BOTTOM:
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

         /* -------------------------------------------------- */
        /* 4️⃣ Compute world-space threshold                  */
        /* -------------------------------------------------- */
        const forwardThreshold =
            modelObj.roomModelBox.min.x + cornerThresholder;

        /* -------------------------------------------------- */
        /* 5️⃣ Rotate if needed (WORLD comparison)            */
        /* -------------------------------------------------- */
        if (objWorldPos.x < forwardThreshold) {

            // Rotate 90° around Y
            obj.rotation.y = Math.PI / 2;

            obj.updateMatrixWorld(true);

            // Recompute bounding box AFTER rotation
            const rotatedBox = new THREE.Box3().setFromObject(obj);
            const rotatedSize = rotatedBox.getSize(new THREE.Vector3());

            // Convert desired WORLD X to LOCAL X
            const desiredWorldX =
                modelObj.roomModelBox.min.x +
                rotatedSize.x / 2 +
                WALL_THICKNESS;

            const newWorldPos = obj.getWorldPosition(new THREE.Vector3());
            newWorldPos.x = desiredWorldX;

            const localPos = obj.parent.worldToLocal(newWorldPos);
            obj.position.x = localPos.x;
        }

        obj.updateMatrixWorld(true);

         /* -------------------------------------------------- */
        /* 6️⃣ Save final world position                      */
        /* -------------------------------------------------- */
        const finalWorldPos = obj.getWorldPosition(new THREE.Vector3());

        obj.userData.savedPosition = finalWorldPos.clone();

        const itemPositionMm = getItemPosition(
            modelRoomType,
            furnitureType,
            finalWorldPos.clone(),
            scaledChildSize,
            obj.userData.customId
        );

        obj.userData.positionMm = itemPositionMm;

        resaveObjPosition(
            modelRoomType,
            finalWorldPos.clone(),
            obj.userData.customId,
            itemPositionMm,
            obj.userData.isFitting
        );
    }

    function setSingleWallChilderDragging(modelRoomType, obj, customId) {
        const modelObj = roomModels[modelRoomType]

        obj.updateMatrixWorld(true); //new
        const objBox = new THREE.Box3().setFromObject(obj);
        // const objHeight = objBox.max.y - objBox.min.y;

        // const objSize = new THREE.Vector3();
        // objBox.getSize(objSize);
        const objSize = obj.userData.scaledSize.clone(); //new
        const objWidth =  objSize.x;
        const objDepth =  objSize.z;

        const currentPos = new THREE.Vector3();
        obj.getWorldPosition(currentPos);

        const objWorldPos = obj.getWorldPosition(new THREE.Vector3());

        objWorldPos.y = obj.userData.savedPosition.y; 

        objWorldPos.z = modelObj.roomModelBox.min.z + (objDepth / 2) + WALL_THICKNESS; 

        objWorldPos.x = Math.max(
            modelObj.roomModelBox.min.x + objWidth / 2,
            Math.min(modelObj.roomModelBox.max.x - objWidth / 2, objWorldPos.x)
        );

        const worldPos = obj.parent.worldToLocal(objWorldPos);
        obj.position.copy(worldPos.clone());
        // resaveObjPosition(modelRoomType, obj, worldPos, customId);

        const isFitting = checkIfAbleToDragChildToPosition(modelRoomType, obj);

        return isFitting;
    }

    function resaveObjPosition(modelRoomType, position, customId, itemPositionMm, isFitting) {
        const dbChildIndex = roomModels[modelRoomType].dbChildren.findIndex(item => item.db_data.custom_id == customId);
        
        if (dbChildIndex !== -1) {
            roomModels = {
                ...roomModels,
                [modelRoomType]: {
                ...roomModels[modelRoomType],
                dbChildren: roomModels[modelRoomType].dbChildren.map((child, index) =>
                    index === dbChildIndex
                    ? {
                        ...child,
                        db_data: {
                            ...child.db_data,
                            furniture_position_mm: JSON.stringify(itemPositionMm),
                            is_fitting: isFitting,
                        }
                    }
                    : child
                ),
                modelChildren: roomModels[modelRoomType].modelScene.children.map((child, index) =>
                    index === dbChildIndex
                    ? {
                        ...child,
                        userData: {
                            ...child.userData,
                            savedPosition: position.clone(),
                            isFitting: isFitting,
                        }
                    }
                    : child
                ),
                },
            };
        }
    }

    function removeAllFurnitureButtons(modelRoomType) {
        const toRemove = [];
        const modelObj = roomModels[modelRoomType];

        modelObj.modelScene.children.forEach(child => {
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
        toRemove.forEach(sprite => modelObj.modelScene.remove(sprite));
    }

    function clearModelScene(modelRoomType, model3dContainer) {
        model3dContainer.innerHTML = ''
        const modelObj = roomModels[modelRoomType];
        const modelScene = modelObj.modelScene;
        if (!modelScene) return;

        const children = modelScene.children;

        // Traverse all children
        for (let i = children.length - 1; i >= 0; i--) {
            removeGLBModel(modelRoomType, children[i]);
        }

        if (modelObj.threeJSControls) {
            modelObj.threeJSControls.dispose();
            modelObj.threeJSControls = null;
        }

        modelObj.modelScene = null;
        modelObj.room3DGroup = null;
        modelObj.threeJSCamera = null;
    }

    function addExistingGLBModel(modelScene, modelRoomType, modelObj, id, urlSrc, furnitureType, productId, customId, itemWidth, childPositionMm, isFitting) {
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

                        const texture = getTextureSrc(furnitureType, name, state.textures3DSrc);

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
                wrapper.userData.widthMm = itemWidth;
                // wrapper.userData.originalSize = originalSize;
                // wrapper.userData.scaledSize = scaledSize;
                // wrapper.userData.savedPosition = savedPosition;
      
                wrapper.userData.positionMm = childPositionMm;
                wrapper.userData.isFitting = isFitting;

                // /******* size and position *********/
                // const scaleX = parseFloat(scaledSize.x) / Math.abs(originalSize.x);
                // const scaleY = parseFloat(scaledSize.y) / Math.abs(originalSize.y) || 1; // avoid zero
                // const scaleZ = parseFloat(scaledSize.z) / Math.abs(originalSize.z);

                // wrapper.scale.set(scaleX, scaleY, scaleZ);
                // wrapper.position.set(savedPosition.x, savedPosition.y, savedPosition.z);
                const widthPx = getItemWidthPx(itemWidth, modelRoomDimensions.width);
                const { heightPx, depthPx } = getItemPxDimensions(furnitureType);

                /************normalize************ */
                    // NORMALIZE MODEL ORIGIN
                    // const normalizeBox = new THREE.Box3().setFromObject(wrapper);
                    // const center = normalizeBox.getCenter(new THREE.Vector3());
                    // const size = normalizeBox.getSize(new THREE.Vector3());

                    // wrapper.children.forEach(child => {
                    //     child.position.sub(center);
                    //     child.position.y += size.y / 2; // put origin at bottom
                    // });

                    // wrapper.updateMatrixWorld(true);

                    // const box = new THREE.Box3().setFromObject(wrapper);
                    // const center = box.getCenter(new THREE.Vector3());
                    // const size = box.getSize(new THREE.Vector3());

                    // center.y -= size.y / 2;

                    // wrapper.position.sub(center);
                    // wrapper.updateMatrixWorld(true);
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
            
                const { scaledChildSize } = placeFurnitureInRoom(modelRoomType, wrapper, furnitureType, widthPx, heightPx, depthPx, childPositionMm);

                /******** 2.save position and size********/
                const placedWorldPos = new THREE.Vector3();
                wrapper.getWorldPosition(placedWorldPos);
                wrapper.userData.savedPosition = placedWorldPos.clone();
                wrapper.userData.scaledSize = scaledChildSize;

                wrapper.updateMatrixWorld(true);

                const currentBox = new THREE.Box3().setFromObject(wrapper);
//                 isFitting = checkIfAbleToDragChildToPosition(modelRoomType, wrapper, currentBox);
// console.log(isFitting)
                rotateExistingItem(modelRoomType, wrapper, scaledChildSize, furnitureType);

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

                initRoomDragging(modelRoomType, furnitureType, wrapper);
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
        modelRoomType,
        urlSrc, 
        furnitureType, 
        productId, 
        customId, 
        prices,
        heightMm, 
        depthMm, 
        widthMm,
        itemHeightMin, 
        itemDepthMin, 
        itemWidthMin, 
        triggerDupItem = false
    ) {

        return new Promise((resolve, reject) => {
            const modelObj = roomModels[modelRoomType];
            const itemModelWidth = getItemWidthPx(widthMm, modelRoomDimensions.width);

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

                            const texture = getTextureSrc(furnitureType, name, texturesObj)

                            node.material = new THREE.MeshStandardMaterial({
                                map: texture,
                                metalness: 0.5,    // little reflection
                                roughness: 0.5,    // wood is not glossy
                                // map: texture,            // keep your texture
                                // metalness: 0.1,          // more reflective metal-like surface
                                // roughness: 0.1,          // low roughness = glossy
                                // envMapIntensity: 1.0,    // how much environment reflection shows
                                // side: THREE.DoubleSide,
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

                    childMeshList.forEach(mesh => {
                        // Save world transform
                        mesh.updateWorldMatrix(true, false);

                        wrapper.attach(mesh);

                        mesh.matrixAutoUpdate = true;
                        mesh.frustumCulled = false;
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
                    wrapper.userData.roomType = modelRoomType;
                    wrapper.userData.widthMm = widthMm;
                    wrapper.userData.widthPx = itemModelWidth;
        
                
                    modelObj.modelScene.add(wrapper);
                    
                    const childBox = new THREE.Box3().setFromObject(wrapper);
                    const { heightPx, depthPx } = getItemPxDimensions(furnitureType);
                    const { scaledChildBox, scaledChildSize } = placeFurnitureInRoom(modelRoomType, wrapper, furnitureType, itemModelWidth, heightPx, depthPx);

                    /******** 2.save position and size********/
                    const placedWorldPos = new THREE.Vector3();
                    wrapper.getWorldPosition(placedWorldPos);
                    wrapper.userData.savedPosition = placedWorldPos.clone();
                    wrapper.userData.scaledSize = scaledChildSize;
                    wrapper.receiveShadow = true;

                    /******** spotlight ******/
                //    addFrontTopShade(wrapper, scaledChildSize);
                    /******** end save position ********/

                    /******* enable dragging *********/

                    rotateExistingItem(modelRoomType, wrapper, scaledChildSize, furnitureType);

                    // initModelDragging(modelRoomType, wrapper, childBox, furnitureType);
                    initRoomDragging(modelRoomType, furnitureType, wrapper);

                    let isFittingItem = checkIfAbleToDragChildToPosition(modelRoomType, wrapper);
                    //  if(modelRoomType == ROOM_TYPE_WITH_CORNER) {
                    //     isFittingItem = setCornerChildenDragging(modelRoomType, wrapper, customId);
                    // } else {
                    //     isFittingItem = setSingleWallChilderDragging(modelRoomType, wrapper, customId);
                    // }   

                    const itemPositionMm = getItemPosition(modelRoomType, furnitureType, placedWorldPos.clone(), scaledChildSize);
         
                    wrapper.userData.positionMm = itemPositionMm;
                    /***** push item ****/
                    const userData = wrapper.userData;
                    const dbData  = {
                        custom_id: customId,
                        room_type: modelRoomType,
                        width: widthMm,
                        furniture_position_mm: JSON.stringify(itemPositionMm),
                        is_fitting: isFittingItem,
                    };

                    const furnitureListItem = {
                        product_id: productId,
                        db_data: {...dbData},
                        object_src: urlSrc,
                        furniture_type: furnitureType, 
                        prices: {...prices},
                        width: widthMm,
                        model_width: itemModelWidth,
                        height: heightMm,
                        model_height: heightPx,
                        depth: depthMm,
                        model_depth: depthPx,
                        min_width: itemWidthMin,
                        min_height: itemHeightMin,
                        min_depth: itemDepthMin,
                    }
      
                    roomModels = {
                        ...roomModels,
                        [modelRoomType]: {
                            ...modelObj,
                            dbChildren: [...modelObj.dbChildren, furnitureListItem],
                        }
                    };
             
                    if(modelSettings.visibleDimensionsArrows) {
                        console.log(modelObj)
                        createFurnitureDimensionArrows(wrapper, modelObj.modelScene, modelObj.roomModelBox);
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

    function placeFurnitureInRoom(
        modelRoomType,
        wrapper,
        furnitureType,
        widthPx,
        heightPx,
        depthPx,
        mmPosition = null,
    ) {
        const modelObj = roomModels[modelRoomType];

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

        const originalSize = wrapper.userData.originalSize;

        // ------------------ SCALE ------------------

        const scaleX = widthPx / originalSize.x;
        const scaleY = heightPx / originalSize.y;
        const scaleZ = depthPx / originalSize.z;

        wrapper.scale.set(scaleX, scaleY, scaleZ);
        wrapper.updateMatrixWorld(true);

        // scaled size
        const scaledSize = new THREE.Vector3(
            originalSize.x * scaleX,
            originalSize.y * scaleY,
            originalSize.z * scaleZ
        );

        wrapper.userData.scaledSize = scaledSize.clone();

        // ------------------ POSITION ------------------

        let x, y, z;

        const roomHalfWidth = modelRoomDimensions.width / 2;
        const roomHalfDepth = modelRoomDimensions.depth / 2;

        if (mmPosition) {

            const pos = typeof mmPosition === "string"
                ? JSON.parse(mmPosition)
                : mmPosition;

            // X distance from left wall
            // x = -roomHalfWidth + (pos.left || 0) + scaledSize.x / 2;
            x = -roomHalfWidth + pos.left * modelRoomScale.x + scaledSize.x / 2;
 
            // Y (origin is now bottom)
            if (furnitureType.includes(DIMENSION_TYPE_TOP)) {

                y = calculateTopSpaceIn3dModel(modelObj.roomModelBox);

            } else {

                y = 0;

            }

            // Z distance from back wall
            // z = -roomHalfDepth + (pos.back || 0) + scaledSize.z / 2;
            z = -roomHalfDepth + pos.back * modelRoomScale.z + scaledSize.z / 2;

        } else {
            const leftAdditionalUnit =
                (modelRoomType === ROOM_TYPE_WITH_CORNER ? WALL_THICKNESS : 0);

            // X
            x = modelObj.roomModelBox.min.x + scaledSize.x / 2 + leftAdditionalUnit;

            // Y
            if (furnitureType.includes(DIMENSION_TYPE_TOP)) {

                y = calculateTopSpaceIn3dModel(modelObj.roomModelBox);

            } else {

                y = 0;

            }

            // Z
            z = -roomHalfDepth + scaledSize.z / 2;
        }

        // ------------------ APPLY POSITION ------------------
        const worldPos = new THREE.Vector3(x, y, z);
        const localPos = wrapper.parent.worldToLocal(worldPos);
   
        wrapper.position.copy(localPos);
        wrapper.updateMatrixWorld(true);

        // ------------------ RETURN ------------------

        const finalBox = new THREE.Box3().setFromObject(wrapper);
        const finalSize = finalBox.getSize(new THREE.Vector3());

        wrapper.userData.scaledSize = finalSize.clone();

        return {
            scaledChildBox: finalBox.clone(),
            scaledChildSize: finalSize.clone()
        };
    }

    function initModelDragging(modelRoomType, childMeshGroup, childBox, furnitureType) {
        let isFittingItem = true;
        const modelObj = roomModels[modelRoomType];

        if(!furnitureType.includes('corner')) {
            /******* check if fits *******/
            isFittingItem = checkIfAbleToDragChildToPosition(modelRoomType, childMeshGroup); 
            childMeshGroup.userData.isFitting = isFittingItem;

            if (!isFittingItem) {
                childMeshGroup.traverse(child => {
                    if (child.isMesh) {
                        child.material.color.set(0xff0000);
                        child.material.transparent = true;
                        child.material.opacity = 0.5;
                    }
                });
            }
            /******* end check if fits *******/

            const dragControls = new DragControls(
                [childMeshGroup],  // objects to drag
                modelObj.threeJSCamera,
                modelObj.threeJSRendered.domElement
            );
            dragControls.transformGroup = true;

            childMeshGroup.userData.dragControls = dragControls;

            dragControls.addEventListener('drag', event => {
                const obj = event.object;
                let isFitting = true;
                if(modelRoomType == ROOM_TYPE_WITH_CORNER) {
                    isFitting = setCornerChildenDragging(modelRoomType, obj, obj.userData.customId);
                } else {
                    isFitting = setSingleWallChilderDragging(modelRoomType, obj, obj.userData.customId);
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

                if(modelSettings.visibleDimensionsArrows) {
                    createFurnitureDimensionArrows(childMeshGroup, modelObj.modelScene, modelObj.roomModelBox);
                }
                
            });

            dragControls.addEventListener('dragstart', event => {
                modelObj.threeJSControls.enabled = false; // disable parent rotation & zoom
            });

            dragControls.addEventListener('dragend', event => {
                modelObj.threeJSControls.enabled = true;  // re-enable orbit
        
                const obj = event.object;

                /******** saved position ********/
                const childWorldPos = new THREE.Vector3();
                obj.getWorldPosition(childWorldPos);
                obj.userData.savedPosition = childWorldPos.clone();

                obj.updateMatrixWorld(true); //new
                const childBox = new THREE.Box3().setFromObject(obj);
                const scaledChildSize = childBox.getSize(new THREE.Vector3());

                const itemPositionMm = getItemPosition(modelRoomType, furnitureType, childWorldPos.clone(), scaledChildSize.clone(), obj.userData.customId);
                obj.userData.positionMm = itemPositionMm;
           
                /******** end saved position ********/
                const newUserData = obj.userData;
                const isFitting = newUserData.isFitting;
                obj.userData.isFitting = isFitting;
        
                if(isFitting) {
                    obj.traverse(child => {
                        if (child.isMesh && child.userData.originalMaterial) {
                            child.material.color.copy(child.userData.originalMaterial.color);
                            child.material.opacity = child.userData.originalMaterial.opacity;
                            child.material.transparent = child.userData.originalMaterial.transparent;
                        }
                    });
                } 

                resaveObjPosition(modelRoomType, childWorldPos.clone(), obj.userData.customId, itemPositionMm, isFitting);
            });
        } else {
            checkIfItemsAreFittingForNewCorner(modelRoomType, childMeshGroup, childBox);
            removeCornerPseudoModelObjects(modelRoomType, furnitureType);
        }

        // return isFittingItem;
    }

    function initRoomDragging(modelRoomType, furnitureType, wrapper) {
        /******* enable dragging *********/
        const modelObj = roomModels[modelRoomType];

        if(!furnitureType.includes('corner')) {
            const dragControls = new DragControls(
                [wrapper],  // objects to drag
                modelObj.threeJSCamera,
                modelObj.threeJSRendered.domElement
            );
            dragControls.transformGroup = true;
    
            wrapper.userData.dragControls = dragControls;
    
            dragControls.addEventListener('drag', event => {
                const obj = event.object;
                let isFitting = true;

                if(modelRoomType == ROOM_TYPE_WITH_CORNER) {
                    isFitting = setCornerChildenDragging(modelRoomType, obj, obj.userData.customId);
                } else {
                    isFitting = setSingleWallChilderDragging(modelRoomType, obj, obj.userData.customId);
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
    
                if(roomState.visibleDimensionArrows) {
                    createFurnitureDimensionArrows(obj, modelObj.modelScene, modelObj.roomModelBox);
                }
            });
            
            dragControls.addEventListener('dragstart', event => {
                modelObj.threeJSControls.enabled = false; // disable parent rotation & zoom
            });
    
            dragControls.addEventListener('dragend', event => {
                modelObj.threeJSControls.enabled = true;  // re-enable orbit
    
                const obj = event.object;
    
                /******** saved position ********/
                const childWorldPos = new THREE.Vector3();
                obj.getWorldPosition(childWorldPos);
                obj.userData.savedPosition = childWorldPos.clone();
                const isFitting = obj.userData.isFitting;
                /******** end saved position ********/
      
                const itemPositionMm = getItemPosition(modelRoomType, furnitureType, childWorldPos.clone(), obj.userData.scaledSize, obj.userData.customId);
                
                if(isFitting) {
                    obj.traverse(child => {
                        if (child.isMesh && child.userData.originalMaterial) {
                            child.material.color.copy(child.userData.originalMaterial.color);
                            child.material.opacity = child.userData.originalMaterial.opacity;
                            child.material.transparent = child.userData.originalMaterial.transparent;
                        }
                    });
                } 
  
                resaveObjPosition(modelRoomType, childWorldPos.clone(), obj.userData.customId, itemPositionMm, isFitting)
            });
    
            /******* end enable dragging *********/              
    
        } else {
            removeCornerPseudoModelObjects(modelRoomType, modelObj.modelScene, furnitureType);
        }
    }

    function removeCornerPseudoModelObjects(modelRoomType, modelScene, furnitureType) {
        if(!furnitureType.includes('corner')) return;

        const modelObj = roomModels[modelRoomType];

        furnitureType = furnitureType.trim();
        const children = modelObj.modelScene.children;
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
                removeGLBModel(modelRoomType, childObj);
                continue;
            } else if(furnitureType == childType) {
                tempI++;
                removeGLBModel(modelRoomType, childObj);
                continue;
            }

            if(tempI === maxPseudoCount) {
                break;
            }
        }
    }

    function createFurnitureItemControls(modelRoomType, childMeshGroup, customId) {
        // Remove old buttons
        const modelObj = roomModels[modelRoomType];
        const modelScene = modelObj.modelScene;

        if (childMeshGroup.userData.uiButtons) {
            childMeshGroup.userData.uiButtons.forEach(btn => {
                modelScene.remove(btn)
            });
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
            img.src = `${configDataRoom.generalAssetsUrl}/images/room/${iconUrl}`;

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

    // function getItemPosition(roomType, furnitureType, currentLocalPos, currentSize) {
    //     const roomObj = roomModels[roomType];
    //     const roomBox = roomObj.roomModelBox; // local coordinates, min = 0 or floor corner

    //     const itemWidth  = currentSize.x;
    //     const itemHeight = currentSize.y;
    //     const itemDepth  = currentSize.z;

    //     // ------------------ LOCAL POSITIONS ------------------
    //     // positions relative to roomBox.min (corner origin)
    //     const left   = currentLocalPos.x - roomBox.min.x;
    //     const bottom = currentLocalPos.y - roomBox.min.y;
    //     const back   = currentLocalPos.z - roomBox.min.z;

    //     // ------------------ WORLD → MM CONVERSION ------------------
    //     const pxToMmX = roomDimensions.width  / (roomBox.max.x - roomBox.min.x);
    //     const pxToMmY = roomDimensions.height / (roomBox.max.y - roomBox.min.y);
    //     const pxToMmZ = roomDimensions.depth  / (roomBox.max.z - roomBox.min.z);

    //     const toMmX = v => v * pxToMmX;
    //     const toMmY = v => v * pxToMmY;
    //     const toMmZ = v => v * pxToMmZ;

    //     const newPosition = {
    //         left:   toMmX(left),
    //         bottom: toMmY(bottom),
    //         back:   toMmZ(back),
    //         width:  toMmX(itemWidth),
    //         height: toMmY(itemHeight),
    //         depth:  toMmZ(itemDepth),
    //     };

    //     return newPosition;
    // }

    function getItemPosition(roomType, furnitureType, currentPosition, currentSize, id = null) {
        const currentObj = roomModels[roomType];

        const halfRoomWidth = modelRoomDimensions.width / 2;
        const halfRoomDepth = modelRoomDimensions.depth / 2;

        const itemWidth  = currentSize.x;
        const itemHeight = currentSize.y;
        const itemDepth  = currentSize.z;

        const centerX = currentPosition.x;
        const centerY = currentPosition.y;
        const centerZ = currentPosition.z;

        // ------------------ WORLD POSITIONS ------------------

        const left  = centerX + halfRoomWidth - itemWidth / 2;
        const right = modelRoomDimensions.width - (left + itemWidth);

        const back  = centerZ + halfRoomDepth - itemDepth / 2;
        const front = modelRoomDimensions.depth - (back + itemDepth);

        let bottom, top;

        if (furnitureType.includes(DIMENSION_TYPE_TOP)) {

            bottom = calculateTopSpaceIn3dModel(currentObj.roomModelBox) + WALL_THICKNESS;
            top = bottom + itemHeight;

        } else {

            bottom = centerY;
            top = modelRoomDimensions.height - (bottom + itemHeight);

        }

        // ------------------ WORLD → MM CONVERSION ------------------

        const pxToMmX = roomDimensions.width  / modelRoomDimensions.width;
        const pxToMmY = roomDimensions.height / modelRoomDimensions.height;
        const pxToMmZ = roomDimensions.depth  / modelRoomDimensions.depth;

        const toMmX = v => v * pxToMmX;
        const toMmY = v => v * pxToMmY;
        const toMmZ = v => v * pxToMmZ;

        // ------------------ CLAMP ------------------

        const clamp = (v, max) => Math.max(0, Math.min(v, max));

        const newPosition = {
            left:   clamp(toMmX(left), roomDimensions.width),
            right:  clamp(toMmX(right), roomDimensions.width),
            bottom: clamp(toMmY(bottom), roomDimensions.height),
            top:    clamp(toMmY(top), roomDimensions.height),
            back:   clamp(toMmZ(back), roomDimensions.depth),
            front:  clamp(toMmZ(front), roomDimensions.depth),
        };

        return newPosition;
    }

    function getItemPositionOld(roomType, furnitureType, currentPosition, currentSize, id = null) {
        const currentObj = roomModels[roomType];

        const halfRoomHeight = modelRoomDimensions.height / 2;
        const halfRoomDepth = modelRoomDimensions.depth / 2;
        const halfRoomWidth = modelRoomDimensions.width / 2;

        const itemHeight = currentSize.y;
        const itemDepth = currentSize.z;
        const itemWidth = currentSize.x;

        // Calculate positions relative to room origin (0,0,0 = center of room)
        const centerX = currentPosition.x;
        const centerY = currentPosition.y;
        const centerZ = currentPosition.z;

        // Convert from Three.js position to mm relative to floor/walls
        const left = centerX + halfRoomWidth - itemWidth / 2;    // distance from left wall
        const right = modelRoomDimensions.width - (left + itemWidth);       // distance from right wall

        // BOTTOM/TOP
        let bottom, top;
        if (furnitureType.includes(DIMENSION_TYPE_TOP)) {
            bottom = calculateTopSpaceIn3dModel(currentObj.roomModelBox) + WALL_THICKNESS;
            top = bottom + itemHeight; // ceiling distance can be calculated if needed
      
        } else {
            // distance from floor
            bottom = centerY; // if wrapper origin is at bottom
            top = modelRoomDimensions.height - (bottom + itemHeight);
        }

        const back = centerZ + halfRoomDepth - itemDepth / 2;   // distance from back wall
        const front = modelRoomDimensions.depth - (back + itemDepth);      // distance from front wall

        // Clamp values to room
        const clamp = (val, max) => Math.max(0, Math.min(val, max));

        const newPosition = {
            left: clamp(left, modelRoomDimensions.width),
            right: clamp(right, modelRoomDimensions.width),
            bottom: clamp(bottom, modelRoomDimensions.height),
            top: clamp(top, modelRoomDimensions.height),
            back: clamp(back, modelRoomDimensions.depth),
            front: clamp(front, modelRoomDimensions.depth),
        };
      
        return newPosition;
    }

    function createFurnitureDimensionArrows(childMeshGroup, modelScene, roomModelBox) {
            if(!childMeshGroup.userData?.positionMm) return;
        
            // Remove old arrows & labels
            if (childMeshGroup.userData.dimensions) {
                childMeshGroup.userData.dimensions.forEach(obj => modelScene.remove(obj));
            }
    
            const objects = [];
    
            const furnitureBox = new THREE.Box3().setFromObject(childMeshGroup);
    
            const furnitureSize = new THREE.Vector3();
            furnitureBox.getSize(furnitureSize);
    
            // const roomSize = new THREE.Vector3();
            // roomModelBox.getSize(roomSize);
            console.log(childMeshGroup.userData)
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
    console.log( positionMm)

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

        // function checkIfAbleToDragChildToPosition(roomType, currentObj, currentBox, excludeObjId = null) {
        //     const modelObj = roomModels[roomType];
        //     const children = modelObj.modelScene.children;

        //     let isFitting = true;

        //     currentObj.updateMatrixWorld(true);

        //     for (let childObj of children) {

        //         if (childObj.id === currentObj.id) continue;
        //         if (excludeObjId && childObj.id === excludeObjId) continue;

        //         const userData = childObj.userData;
        //         if (!userData || (!userData.productId && !userData.pseudoType)) continue;

        //         childObj.updateMatrixWorld(true);

        //         const childBox = new THREE.Box3().setFromObject(childObj);

        //         if (currentBox.intersectsBox(childBox)) {
        //             isFitting = false;
        //             break;
        //         }
        //     }

        //     return isFitting;
        // }

        function checkIfAbleToDragChildToPosition(roomType, currentObj, excludeObjId = null) {
            const modelObj = roomModels[roomType];
            const children = modelObj.modelScene.children;

            const pos = currentObj.position.clone();
            const size = currentObj.userData.scaledSize;

            let isFitting = true;

            for (let childObj of children) {
                if (childObj.id === currentObj.id) continue;
                if (excludeObjId && childObj.id === excludeObjId) continue;

                const childData = childObj.userData;
                if (!childData || (!childData.productId && !childData.pseudoType)) continue;

                const childPos = childObj.position;
                const childSize = childData.scaledSize;

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
    
    // function checkIfAbleToDragChildToPosition(roomType, currentObj, currentBox, exludeObjId = null) {
    //     const modelObj = roomModels[roomType];
    //     const currentId = currentObj.id;
    //     const currentObjType = currentObj.userData.furnitureType;

    //     const currentBoxMin = currentBox.min;
    //     const currentBoxMax = currentBox.max;
    //     const currentXMin = currentBoxMin.x;
    //     const currentYMin = currentBoxMin.y;
    //     const currentXMax = currentBoxMax.x;
    //     const currentYMax = currentBoxMax.y;

    //     console.log("1")
    //     console.log(currentBoxMin)
    //       console.log(currentBoxMax)

    //     let isFitting = true;

    //     const children = modelObj.modelScene.children;

    //     let fittingObjs = [];
    //     const childrenCount = children.length;
    //     let i = 0;

    //     if(roomType === ROOM_TYPE_SINGLE_WALL) {
    //         while(i < childrenCount) {
    //             const childObj = children[i];
    //             const childObjId = childObj.id;
    //             const type = childObj.type;
    //             i++;
    //             if(currentId === childObjId || exludeObjId && exludeObjId == childObjId) {
    //                 continue;
    //             }
          
    //             const userData = childObj.userData;

    //             if(!userData.productId && !userData.pseudoType) {
    //                 continue;
    //             }
 
    //             const childFurnitureType = userData.furnitureType;

    //             childObj.updateMatrixWorld(true);
    //             const childBox = new THREE.Box3().setFromObject(childObj);
    //             const childBoxMin = childBox.min;
    //             const childBoxMax = childBox.max;
    //             const childXMin = childBoxMin.x;
    //             const childYMin = childBoxMin.y;
    //             const childXMax = childBoxMax.x;
    //             const childYMax = childBoxMax.y;
    //     console.log("2")
    //     console.log(childBoxMin)
    //       console.log(childBoxMax)
    //             if(
    //                 (
    //                     currentXMin >= childXMin && currentXMin <= childXMax || 
    //                     currentXMax >= childXMin && currentXMax <= childXMax ||
    //                     currentXMin <= childXMin && currentXMax >= childXMax
    //                 ) &&
    //                 (
    //                     currentYMin >= childYMin && currentYMin <= childYMax || 
    //                     currentYMax >= childYMin && currentYMax <= childYMax ||
    //                     currentYMin <= childYMin && currentYMax >= childYMax
    //                 ) ||
    //                 (
    //                     currentObjType === DIMENSION_TYPE_FULL &&
    //                     currentXMin >= childXMin && currentXMin <= childXMax || 
    //                     currentObjType === DIMENSION_TYPE_FULL && 
    //                     currentXMax >= childXMin && currentXMax <= childXMax ||
    //                     currentObjType === DIMENSION_TYPE_FULL && 
    //                     currentXMin <= childXMin && currentXMax >= childXMax
    //                 ) ||
    //                 (
    //                     currentObjType === DIMENSION_TYPE_TOP &&
    //                     childFurnitureType === DIMENSION_TYPE_FULL &&
    //                     currentXMin >= childXMin && currentXMin <= childXMax || 

    //                     currentObjType === DIMENSION_TYPE_TOP &&
    //                     childFurnitureType === DIMENSION_TYPE_FULL &&
    //                     currentXMax >= childXMin && currentXMax <= childXMax ||

    //                     currentObjType === DIMENSION_TYPE_TOP &&
    //                     childFurnitureType === DIMENSION_TYPE_FULL &&
    //                     currentXMin <= childXMin && currentXMax >= childXMax ||

    //                     currentObjType === DIMENSION_TYPE_TOP && 
    //                     childFurnitureType === DIMENSION_TYPE_FULL &&
    //                     currentXMin >= childXMin && currentXMin <= childXMax ||

    //                     currentObjType === DIMENSION_TYPE_TOP && 
    //                     childFurnitureType === DIMENSION_TYPE_FULL &&
    //                     currentXMax >= childXMin && currentXMax <= childXMax ||
    //                     currentObjType === DIMENSION_TYPE_TOP && 
    //                     childFurnitureType === DIMENSION_TYPE_FULL &&
    //                     currentXMin <= childXMin && currentXMax >= childXMax
    //                 ) ||
    //                 (
    //                     childFurnitureType === DIMENSION_TYPE_TOP &&
    //                     currentObjType === DIMENSION_TYPE_FULL &&
    //                     currentXMin >= childXMin && currentXMin <= childXMax || 

    //                     childFurnitureType === DIMENSION_TYPE_TOP &&
    //                     currentObjType === DIMENSION_TYPE_FULL &&
    //                     currentXMax >= childXMin && currentXMax <= childXMax ||

    //                     childFurnitureType === DIMENSION_TYPE_TOP &&
    //                     currentObjType === DIMENSION_TYPE_FULL &&
    //                     currentXMin <= childXMin && currentXMax >= childXMax ||

    //                     childFurnitureType === DIMENSION_TYPE_TOP && 
    //                     currentObjType === DIMENSION_TYPE_FULL &&
    //                     currentXMin >= childXMin && currentXMin <= childXMax ||

    //                     childFurnitureType === DIMENSION_TYPE_TOP && 
    //                     currentObjType === DIMENSION_TYPE_FULL &&
    //                     currentXMax >= childXMin && currentXMax <= childXMax ||

    //                     childFurnitureType === DIMENSION_TYPE_TOP && 
    //                     currentObjType === DIMENSION_TYPE_FULL &&
    //                     currentXMin <= childXMin && currentXMax >= childXMax
    //                 )
    //             ) {
    //                 isFitting = false; 
    //                 break;
    //             } 
    //         }

    //     } else {
    //         const currentZMin = currentBoxMin.z;
    //         const currentZMax = currentBoxMax.z;

    //         while(i < childrenCount) {
    //             const childObj = children[i];
    //             const userData = childObj.user_data;

    //             i++;
    //             if(!userData || !userData.productId && !userData.pseudoType) {
    //                 continue;
    //             }
    //             const childFurnitureType = userData.furnitureType;
    //             const childObjId = childObj.id;

    //             if(currentId === childObjId) {
    //                 continue;
    //             }

    //             const childBox = new THREE.Box3();

    //             if (userData.pseudoType) {
    //                 // pseudo cubes: scale the geometry to world size first
    //                 const originalScale = childObj.scale.clone();
    //                 childObj.scale.set(userData.originalSize.x, userData.originalSize.y, userData.originalSize.z);
    //                 childBox.setFromObject(childObj);
    //                 childObj.scale.copy(originalScale); // restore scale if needed
    //             } else {
    //                 // GLB model
    //                 childBox.setFromObject(childObj);
    //             }

    //             const childBoxMin = childBox.min;
    //             const childBoxMax = childBox.max;
    //             const childYMin = childBoxMin.y;
    //             const childYMax = childBoxMax.y;
    //             const isRotated = Math.abs(currentObj.rotation.y) > 0.0001;

    //             if(!isRotated) {
    //                 const childXMin = childBoxMin.x;
    //                 const childXMax = childBoxMax.x;

    //                 if(
    //                     (
    //                         currentXMin >= childXMin && currentXMin <= childXMax || 
    //                         currentXMax >= childXMin && currentXMax <= childXMax ||
    //                         currentXMin <= childXMin && currentXMax >= childXMax
    //                     ) &&
    //                     (
    //                         currentYMin >= childYMin && currentYMin <= childYMax || 
    //                         currentYMax >= childYMin && currentYMax <= childYMax ||
    //                         currentYMin <= childYMin && currentYMax >= childYMax
    //                     ) ||
    //                     (
    //                         currentObjType === DIMENSION_TYPE_FULL &&
    //                         currentXMin >= childXMin && currentXMin <= childXMax || 
    //                         currentObjType === DIMENSION_TYPE_FULL && 
    //                         currentXMax >= childXMin && currentXMax <= childXMax ||
    //                         currentObjType === DIMENSION_TYPE_FULL && 
    //                         currentXMin <= childXMin && currentXMax >= childXMax
    //                     ) ||
    //                     (
    //                         currentObjType === DIMENSION_TYPE_TOP &&
    //                         childFurnitureType === DIMENSION_TYPE_FULL &&
    //                         currentXMin >= childXMin && currentXMin <= childXMax || 

    //                         currentObjType === DIMENSION_TYPE_TOP &&
    //                         childFurnitureType === DIMENSION_TYPE_FULL &&
    //                         currentXMax >= childXMin && currentXMax <= childXMax ||

    //                         currentObjType === DIMENSION_TYPE_TOP &&
    //                         childFurnitureType === DIMENSION_TYPE_FULL &&
    //                         currentXMin <= childXMin && currentXMax >= childXMax ||

    //                         currentObjType === DIMENSION_TYPE_TOP && 
    //                         childFurnitureType === DIMENSION_TYPE_FULL &&
    //                         currentXMin >= childXMin && currentXMin <= childXMax ||

    //                         currentObjType === DIMENSION_TYPE_TOP && 
    //                         childFurnitureType === DIMENSION_TYPE_FULL &&
    //                         currentXMax >= childXMin && currentXMax <= childXMax ||
    //                         currentObjType === DIMENSION_TYPE_TOP && 
    //                         childFurnitureType === DIMENSION_TYPE_FULL &&
    //                         currentXMin <= childXMin && currentXMax >= childXMax
    //                     ) ||
    //                     (
    //                         childFurnitureType === DIMENSION_TYPE_TOP &&
    //                         currentObjType === DIMENSION_TYPE_FULL &&
    //                         currentXMin >= childXMin && currentXMin <= childXMax || 

    //                         childFurnitureType === DIMENSION_TYPE_TOP &&
    //                         currentObjType === DIMENSION_TYPE_FULL &&
    //                         currentXMax >= childXMin && currentXMax <= childXMax ||

    //                         childFurnitureType === DIMENSION_TYPE_TOP &&
    //                         currentObjType === DIMENSION_TYPE_FULL &&
    //                         currentXMin <= childXMin && currentXMax >= childXMax ||

    //                         childFurnitureType === DIMENSION_TYPE_TOP && 
    //                         currentObjType === DIMENSION_TYPE_FULL &&
    //                         currentXMin >= childXMin && currentXMin <= childXMax ||

    //                         childFurnitureType === DIMENSION_TYPE_TOP && 
    //                         currentObjType === DIMENSION_TYPE_FULL &&
    //                         currentXMax >= childXMin && currentXMax <= childXMax ||

    //                         childFurnitureType === DIMENSION_TYPE_TOP && 
    //                         currentObjType === DIMENSION_TYPE_FULL &&
    //                         currentXMin <= childXMin && currentXMax >= childXMax
    //                     )
    //                 ) {
    //                     isFitting = false; 
    //                     break;
    //                 } 

    //             } else {
    //                 const childZMin = childBoxMin.z - WALL_THICKNESS;
    //                 const childZMax = childBoxMax.z - WALL_THICKNESS;

    //                 if(
    //                     (
    //                         currentZMin >= childZMin && currentZMin <= childZMax || 
    //                         currentZMin >= childZMin && currentZMax <= childZMax ||
    //                         currentZMin <= childZMin && currentZMax >= childZMax
    //                     ) &&
    //                     (
    //                         currentYMin >= childYMin && currentYMin <= childYMax || 
    //                         currentYMax >= childYMin && currentYMax <= childYMax ||
    //                         currentYMin <= childYMin && currentYMax >= childYMax
    //                     ) ||
    //                     (
    //                         currentObjType === DIMENSION_TYPE_FULL &&
    //                         currentZMin >= childZMin && currentZMin <= childZMax || 
    //                         currentObjType === DIMENSION_TYPE_FULL && 
    //                         currentZMax >= childZMin && currentZMax <= childZMax ||
    //                         currentObjType === DIMENSION_TYPE_FULL && 
    //                         currentZMin <= childZMin && currentZMax >= childZMax
    //                     ) ||
    //                     (
    //                         currentObjType === DIMENSION_TYPE_TOP &&
    //                         childFurnitureType === DIMENSION_TYPE_FULL &&
    //                         currentZMin >= childZMin && currentZMin <= childZMax || 

    //                         currentObjType === DIMENSION_TYPE_TOP &&
    //                         childFurnitureType === DIMENSION_TYPE_FULL &&
    //                         currentZMax >= childZMin && currentZMax <= childZMax ||

    //                         currentObjType === DIMENSION_TYPE_TOP &&
    //                         childFurnitureType === DIMENSION_TYPE_FULL &&
    //                         currentZMin <= childZMin && currentZMax >= childZMax ||

    //                         currentObjType === DIMENSION_TYPE_TOP && 
    //                         childFurnitureType === DIMENSION_TYPE_FULL &&
    //                         currentZMin >= childZMin && currentZMin <= childZMax ||

    //                         currentObjType === DIMENSION_TYPE_TOP && 
    //                         childFurnitureType === DIMENSION_TYPE_FULL &&
    //                         currentZMax >= childZMin && currentZMax <= childZMax ||
    //                         currentObjType === DIMENSION_TYPE_TOP && 
    //                         childFurnitureType === DIMENSION_TYPE_FULL &&
    //                         currentZMin <= childZMin && currentZMax >= childZMax
    //                     ) ||
    //                     (
    //                         childFurnitureType === DIMENSION_TYPE_TOP &&
    //                         currentObjType === DIMENSION_TYPE_FULL &&
    //                         currentZMin >= childZMin && currentZMin <= childZMax || 

    //                         childFurnitureType === DIMENSION_TYPE_TOP &&
    //                         currentObjType === DIMENSION_TYPE_FULL &&
    //                         currentZMax >= childZMin && currentZMax <= childZMax ||

    //                         childFurnitureType === DIMENSION_TYPE_TOP &&
    //                         currentObjType === DIMENSION_TYPE_FULL &&
    //                         currentZMin <= childZMin && currentZMax >= childZMax ||

    //                         childFurnitureType === DIMENSION_TYPE_TOP && 
    //                         currentObjType === DIMENSION_TYPE_FULL &&
    //                         currentZMin >= childZMin && currentZMin <= childZMax ||

    //                         childFurnitureType === DIMENSION_TYPE_TOP && 
    //                         currentObjType === DIMENSION_TYPE_FULL &&
    //                         currentZMax >= childZMin && currentZMax <= childZMax ||

    //                         childFurnitureType === DIMENSION_TYPE_TOP && 
    //                         currentObjType === DIMENSION_TYPE_FULL &&
    //                         currentZMin <= childZMin && currentZMax >= childZMax
    //                     )
    //                 ) {
    //                     isFitting = false;
    //                     break;
    //                 } 
    //             }
    //         }
    //     }
        
    //     return isFitting;

    // }

    function checkIfItemsAreFitting(modelRoomType, currentObj, currentBox) {
        const modelObj = roomModels[modelRoomType];
        const children = modelObj.modelScene.children;
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
                        modelRoomType,
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
    // function checkIfItemsAreFitting(modelRoomType, currentObj, currentBox) {
    //     const modelObj = roomModels[modelRoomType];
    //     const currentId = currentObj.id;
    //     const currentObjType = currentObj.userData.furnitureType;

    //     const currentBoxMin = currentBox.min;
    //     const currentBoxMax = currentBox.max;
    //     const currentXMin = currentBoxMin.x;
    //     const currentYMin = currentBoxMin.y;
    //     const currentXMax = currentBoxMax.x;
    //     const currentYMax = currentBoxMax.y;

    //     const children = modelObj.modelScene.children;

    //     const childrenCount = children.length;
    //     let i = 0;

    //     let notFittingObjs = [];

    //     if(modelRoomType === ROOM_TYPE_SINGLE_WALL) {
    //         while(i < childrenCount) {
    //             const childObj = children[i];
    //             const userData = childObj.userData;
                
    //             i++;

    //             if(!userData.productId && !userData.pseudoType) {
    //                 continue;
    //             }
        
    //             const childFurnitureType = userData.furnitureType;
    //             const childObjId = childObj.id;
            
    //             if(currentId === childObjId) {
    //                 continue;
    //             }

    //             const childBox = new THREE.Box3().setFromObject(childObj);
    //             const childBoxMin = childBox.min;
    //             const childBoxMax = childBox.max;
    //             const childXMin = childBoxMin.x;
    //             const childYMin = childBoxMin.y;
    //             const childXMax = childBoxMax.x;
    //             const childYMax = childBoxMax.y;

    //             if(
    //                 (
    //                     currentXMin >= childXMin && currentXMin <= childXMax || 
    //                     currentXMax >= childXMin && currentXMax <= childXMax ||
    //                     currentXMin <= childXMin && currentXMax >= childXMax
    //                 ) &&
    //                 (
    //                     currentYMin >= childYMin && currentYMin <= childYMax || 
    //                     currentYMax >= childYMin && currentYMax <= childYMax ||
    //                     currentYMin <= childYMin && currentYMax >= childYMax
    //                 ) ||
    //                 (
    //                     currentObjType === DIMENSION_TYPE_FULL &&
    //                     currentXMin >= childXMin && currentXMin <= childXMax || 
    //                     currentObjType === DIMENSION_TYPE_FULL && 
    //                     currentXMax >= childXMin && currentXMax <= childXMax ||
    //                     currentObjType === DIMENSION_TYPE_FULL && 
    //                     currentXMin <= childXMin && currentXMax >= childXMax
    //                 ) ||
    //                 (
    //                     currentObjType === DIMENSION_TYPE_TOP &&
    //                     childFurnitureType === DIMENSION_TYPE_FULL &&
    //                     currentXMin >= childXMin && currentXMin <= childXMax || 

    //                     currentObjType === DIMENSION_TYPE_TOP &&
    //                     childFurnitureType === DIMENSION_TYPE_FULL &&
    //                     currentXMax >= childXMin && currentXMax <= childXMax ||

    //                     currentObjType === DIMENSION_TYPE_TOP &&
    //                     childFurnitureType === DIMENSION_TYPE_FULL &&
    //                     currentXMin <= childXMin && currentXMax >= childXMax ||

    //                     currentObjType === DIMENSION_TYPE_TOP && 
    //                     childFurnitureType === DIMENSION_TYPE_FULL &&
    //                     currentXMin >= childXMin && currentXMin <= childXMax ||

    //                     currentObjType === DIMENSION_TYPE_TOP && 
    //                     childFurnitureType === DIMENSION_TYPE_FULL &&
    //                     currentXMax >= childXMin && currentXMax <= childXMax ||
    //                     currentObjType === DIMENSION_TYPE_TOP && 
    //                     childFurnitureType === DIMENSION_TYPE_FULL &&
    //                     currentXMin <= childXMin && currentXMax >= childXMax
    //                 ) ||
    //                 (
    //                     childFurnitureType === DIMENSION_TYPE_TOP &&
    //                     currentObjType === DIMENSION_TYPE_FULL &&
    //                     currentXMin >= childXMin && currentXMin <= childXMax || 

    //                     childFurnitureType === DIMENSION_TYPE_TOP &&
    //                     currentObjType === DIMENSION_TYPE_FULL &&
    //                     currentXMax >= childXMin && currentXMax <= childXMax ||

    //                     childFurnitureType === DIMENSION_TYPE_TOP &&
    //                     currentObjType === DIMENSION_TYPE_FULL &&
    //                     currentXMin <= childXMin && currentXMax >= childXMax ||

    //                     childFurnitureType === DIMENSION_TYPE_TOP && 
    //                     currentObjType === DIMENSION_TYPE_FULL &&
    //                     currentXMin >= childXMin && currentXMin <= childXMax ||

    //                     childFurnitureType === DIMENSION_TYPE_TOP && 
    //                     currentObjType === DIMENSION_TYPE_FULL &&
    //                     currentXMax >= childXMin && currentXMax <= childXMax ||

    //                     childFurnitureType === DIMENSION_TYPE_TOP && 
    //                     currentObjType === DIMENSION_TYPE_FULL &&
    //                     currentXMin <= childXMin && currentXMax >= childXMax
    //                 )
    //             ) {
                    
    //                 const isFitting = checkIfAbleToDragChildToPosition(modelRoomType, childObj, childBox, currentId);
    //                 if(isFitting) {
    //                     notFittingObjs.push(childObj);
    //                 }
    //                 continue;
    //             }
    //         }
        
    //     } else {
    //         const currentZMin = currentBoxMin.z;
    //         const currentZMax = currentBoxMax.z;

    //         while(i < childrenCount) {
    //             const childObj = children[i];
    //             const userData = childObj.userData;
                
    //             i++;
    //             if(!userData.productId && !userData.pseudoType) {
    //                 continue;
    //             }
    //             const childFurnitureType = userData.furnitureType;
    //             const childObjId = childObj.id;

    //             if(currentId === childObjId) {
    //                 continue;
    //             }

    //             const childBox = new THREE.Box3().setFromObject(childObj);
    //             const childBoxMin = childBox.min;
    //             const childBoxMax = childBox.max;
    //             const childYMin = childBoxMin.y;
    //             const childYMax = childBoxMax.y;
    //             const isRotated = Math.abs(currentObj.rotation.y) > 0.0001;

    //             if(!isRotated) {
    //                 const childXMin = childBoxMin.x;
    //                 const childXMax = childBoxMax.x;
    //                 if(
    //                     (
    //                         currentXMin >= childXMin && currentXMin <= childXMax || 
    //                         currentXMax >= childXMin && currentXMax <= childXMax ||
    //                         currentXMin <= childXMin && currentXMax >= childXMax
    //                     ) &&
    //                     (
    //                         currentYMin >= childYMin && currentYMin <= childYMax || 
    //                         currentYMax >= childYMin && currentYMax <= childYMax ||
    //                         currentYMin <= childYMin && currentYMax >= childYMax
    //                     ) ||
    //                     (
    //                         currentObjType === DIMENSION_TYPE_FULL &&
    //                         currentXMin >= childXMin && currentXMin <= childXMax || 
    //                         currentObjType === DIMENSION_TYPE_FULL && 
    //                         currentXMax >= childXMin && currentXMax <= childXMax ||
    //                         currentObjType === DIMENSION_TYPE_FULL && 
    //                         currentXMin <= childXMin && currentXMax >= childXMax
    //                     ) ||
    //                     (
    //                         currentObjType === DIMENSION_TYPE_TOP &&
    //                         childFurnitureType === DIMENSION_TYPE_FULL &&
    //                         currentXMin >= childXMin && currentXMin <= childXMax || 

    //                         currentObjType === DIMENSION_TYPE_TOP &&
    //                         childFurnitureType === DIMENSION_TYPE_FULL &&
    //                         currentXMax >= childXMin && currentXMax <= childXMax ||

    //                         currentObjType === DIMENSION_TYPE_TOP &&
    //                         childFurnitureType === DIMENSION_TYPE_FULL &&
    //                         currentXMin <= childXMin && currentXMax >= childXMax ||

    //                         currentObjType === DIMENSION_TYPE_TOP && 
    //                         childFurnitureType === DIMENSION_TYPE_FULL &&
    //                         currentXMin >= childXMin && currentXMin <= childXMax ||

    //                         currentObjType === DIMENSION_TYPE_TOP && 
    //                         childFurnitureType === DIMENSION_TYPE_FULL &&
    //                         currentXMax >= childXMin && currentXMax <= childXMax ||
    //                         currentObjType === DIMENSION_TYPE_TOP && 
    //                         childFurnitureType === DIMENSION_TYPE_FULL &&
    //                         currentXMin <= childXMin && currentXMax >= childXMax
    //                     ) ||
    //                     (
    //                         childFurnitureType === DIMENSION_TYPE_TOP &&
    //                         currentObjType === DIMENSION_TYPE_FULL &&
    //                         currentXMin >= childXMin && currentXMin <= childXMax || 

    //                         childFurnitureType === DIMENSION_TYPE_TOP &&
    //                         currentObjType === DIMENSION_TYPE_FULL &&
    //                         currentXMax >= childXMin && currentXMax <= childXMax ||

    //                         childFurnitureType === DIMENSION_TYPE_TOP &&
    //                         currentObjType === DIMENSION_TYPE_FULL &&
    //                         currentXMin <= childXMin && currentXMax >= childXMax ||

    //                         childFurnitureType === DIMENSION_TYPE_TOP && 
    //                         currentObjType === DIMENSION_TYPE_FULL &&
    //                         currentXMin >= childXMin && currentXMin <= childXMax ||

    //                         childFurnitureType === DIMENSION_TYPE_TOP && 
    //                         currentObjType === DIMENSION_TYPE_FULL &&
    //                         currentXMax >= childXMin && currentXMax <= childXMax ||

    //                         childFurnitureType === DIMENSION_TYPE_TOP && 
    //                         currentObjType === DIMENSION_TYPE_FULL &&
    //                         currentXMin <= childXMin && currentXMax >= childXMax
    //                     )
    //                 ) {     
    //                     const isFitting = checkIfAbleToDragChildToPosition(modelRoomType, childObj, childBox, currentId);
    //                     if(isFitting) {
    //                         notFittingObjs.push(childObj);
    //                     }
    //                     continue;
    //                 }
    //             } else {
    //                 const childZMin = childBoxMin.z - WALL_THICKNESS;
    //                 const childZMax = childBoxMax.z - WALL_THICKNESS;

    //                 if(
    //                     (
    //                         currentZMin >= childZMin && currentZMin <= childZMax || 
    //                         currentZMin >= childZMin && currentZMax <= childZMax ||
    //                         currentZMin <= childZMin && currentZMax >= childZMax
    //                     ) &&
    //                     (
    //                         currentYMin >= childYMin && currentYMin <= childYMax || 
    //                         currentYMax >= childYMin && currentYMax <= childYMax ||
    //                         currentYMin <= childYMin && currentYMax >= childYMax
    //                     ) ||
    //                     (
    //                         currentObjType === DIMENSION_TYPE_FULL &&
    //                         currentZMin >= childZMin && currentZMin <= childZMax || 
    //                         currentObjType === DIMENSION_TYPE_FULL && 
    //                         currentZMax >= childZMin && currentZMax <= childZMax ||
    //                         currentObjType === DIMENSION_TYPE_FULL && 
    //                         currentZMin <= childZMin && currentZMax >= childZMax
    //                     ) ||
    //                     (
    //                         currentObjType === DIMENSION_TYPE_TOP &&
    //                         childFurnitureType === DIMENSION_TYPE_FULL &&
    //                         currentZMin >= childZMin && currentZMin <= childZMax || 

    //                         currentObjType === DIMENSION_TYPE_TOP &&
    //                         childFurnitureType === DIMENSION_TYPE_FULL &&
    //                         currentZMax >= childZMin && currentZMax <= childZMax ||

    //                         currentObjType === DIMENSION_TYPE_TOP &&
    //                         childFurnitureType === DIMENSION_TYPE_FULL &&
    //                         currentZMin <= childZMin && currentZMax >= childZMax ||

    //                         currentObjType === DIMENSION_TYPE_TOP && 
    //                         childFurnitureType === DIMENSION_TYPE_FULL &&
    //                         currentZMin >= childZMin && currentZMin <= childZMax ||

    //                         currentObjType === DIMENSION_TYPE_TOP && 
    //                         childFurnitureType === DIMENSION_TYPE_FULL &&
    //                         currentZMax >= childZMin && currentZMax <= childZMax ||
    //                         currentObjType === DIMENSION_TYPE_TOP && 
    //                         childFurnitureType === DIMENSION_TYPE_FULL &&
    //                         currentZMin <= childZMin && currentZMax >= childZMax
    //                     ) ||
    //                     (
    //                         childFurnitureType === DIMENSION_TYPE_TOP &&
    //                         currentObjType === DIMENSION_TYPE_FULL &&
    //                         currentZMin >= childZMin && currentZMin <= childZMax || 

    //                         childFurnitureType === DIMENSION_TYPE_TOP &&
    //                         currentObjType === DIMENSION_TYPE_FULL &&
    //                         currentZMax >= childZMin && currentZMax <= childZMax ||

    //                         childFurnitureType === DIMENSION_TYPE_TOP &&
    //                         currentObjType === DIMENSION_TYPE_FULL &&
    //                         currentZMin <= childZMin && currentZMax >= childZMax ||

    //                         childFurnitureType === DIMENSION_TYPE_TOP && 
    //                         currentObjType === DIMENSION_TYPE_FULL &&
    //                         currentZMin >= childZMin && currentZMin <= childZMax ||

    //                         childFurnitureType === DIMENSION_TYPE_TOP && 
    //                         currentObjType === DIMENSION_TYPE_FULL &&
    //                         currentZMax >= childZMin && currentZMax <= childZMax ||

    //                         childFurnitureType === DIMENSION_TYPE_TOP && 
    //                         currentObjType === DIMENSION_TYPE_FULL &&
    //                         currentZMin <= childZMin && currentZMax >= childZMax
    //                     )
    //                 ) {
    //                     const isFitting = checkIfAbleToDragChildToPosition(modelRoomType, childObj, childBox, currentId);
    //                     if(isFitting) {
    //                         notFittingObjs.push(childObj);
    //                     }
    //                     continue;
    //                 }
    //             } 
    //         }
    //     }

    //     notFittingObjs.forEach(notFittingObj => {
    //         notFittingObj.userData.isFitting = true;  

    //         notFittingObj.traverse(child => {
    //             if (child.isMesh && child.userData.originalMaterial) {
    //                 child.material.color.copy(child.userData.originalMaterial.color);
    //                 child.material.opacity = child.userData.originalMaterial.opacity;
    //                 child.material.transparent = child.userData.originalMaterial.transparent;
    //             }
    //         });
    //     });
    // }

    function addDimensionArrows() {

        Object.entries(roomModels).forEach(([key, value]) => {
            console.log(value)
            const children = [...value.modelScene.children];

            for(let i = 0; i < children.length; i++) {
                const childObj = children[i];
                const userData = childObj.userData;
                const childType = userData.furnitureType;

                if(!childType) {
                    continue;
                }

                createFurnitureDimensionArrows(childObj, value.modelScene, value.roomModelBox);
            }
        });
    }

    function removeDimensionArrows() {
        Object.entries(roomModels).forEach(([key, value]) => {
            console.log(value)
            const children = [...value.modelScene.children];

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
        });
    }

    function appendCornerPseudoModelObjects(modelScene, roomModelBox) {
        // const finalParentSize = new THREE.Vector3();
        // roomModelBox.getSize(finalParentSize);

        if(!cornerBottomFurnitureId && !cornerFullFurnitureId) {
            const bottomGeometry = new THREE.BoxGeometry( 1, 1, 1); 
            const bottomMaterial = new THREE.MeshBasicMaterial( {
                color: 0x808080,
                transparent: true, 
                opacity: 0.7
            }); 
            const pseudoBottomCornerFurniture = new THREE.Mesh( bottomGeometry, bottomMaterial ); 
            pseudoBottomCornerFurniture.scale.set(cornerBottomWidth3d, cornerBottomHeight3d, cornerBottomDepth3d);

            pseudoBottomCornerFurniture.userData.pseudoType = DIMENSION_TYPE_BOTTOM;
            pseudoBottomCornerFurniture.userData.furnitureType = DIMENSION_TYPE_BOTTOM_CORNER;
            pseudoBottomCornerFurniture.userData.widthMm = cornerBottomWidth;
            pseudoBottomCornerFurniture.userData.depthMm = cornerBottomDepth3d;

            // const objBox = new THREE.Box3().setFromObject(pseudoBottomCornerFurniture);
            // const objSize = new THREE.Vector3();
            // objBox.getSize(objSize);

            // pseudoBottomCornerFurniture.userData.originalSize = objSize.clone();
            // pseudoBottomCornerFurniture.userData.scaledSize = objSize.clone();
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

            // const objBox = new THREE.Box3().setFromObject(pseudoTopCornerFurniture);
            // const objSize = new THREE.Vector3();
            // objBox.getSize(objSize);
             const objSize = new THREE.Vector3(
                cornerBottomWidth3d,
                cornerBottomHeight3d,
                cornerBottomDepth3d
            );

            pseudoTopCornerFurniture.userData.originalSize = objSize.clone();
            pseudoTopCornerFurniture.userData.scaledSize = objSize.clone();
            pseudoTopCornerFurniture.userData.parentBox = roomModelBox;

            const xPosition = roomModelBox.min.x + objSize.x / 2 + WALL_THICKNESS;
            const yPosition = calculateTopSpaceIn3dModel(roomModelBox) + cornerTopHeight3d / 2;
            const zPosition = roomModelBox.min.z + (objSize.z / 2) + WALL_THICKNESS;
            pseudoTopCornerFurniture.position.set(xPosition, yPosition, zPosition);

            modelScene.add(pseudoTopCornerFurniture);
        }
    }

    function onClickModel(e, modelRoomType, threeJSRendered, threeJSCamera) {

            if(isSummaryStep) {
                removeAllFurnitureControls(modelRoomType);
                removeAllFurnitureButtons(modelRoomType);
            }
  
            const modelObj = roomModels[modelRoomType];
    
            const raycaster = new THREE.Raycaster();
            const mouse = new THREE.Vector2();
    
            const rect = threeJSRendered.domElement.getBoundingClientRect();
            mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    
            raycaster.setFromCamera(mouse, threeJSCamera);
  
            const intersects = raycaster.intersectObjects(modelObj.modelScene.children, true);

            let buttonHitItem = intersects.find(hit => hit.object.parent.userData.customId);

            if(buttonHitItem) {
                const obj = buttonHitItem.object.parent;
                const userData = obj.userData;
                const customId = userData.customId;

                openEditModal(userData.widthMm, modelRoomType, customId, false);
            } else {
                editContainerRemove();
            }

            let buttonHit = intersects.find(hit => hit.object.userData.isUIButton);
    
            if (buttonHit) {
                const obj = buttonHit.object;
                const action = obj.userData.actionType;
                const customId = obj.userData.customId;

                if (action === "delete") {
                    initFurnitureRemoveData(modelRoomType, customId);
                } else if (action === "duplicate") {
                    initFurnitureDuplicateData(modelRoomType, customId);
                }
                return; 
            }
    
            removeAllFurnitureControls(modelRoomType);
            removeAllFurnitureButtons(modelRoomType);
    
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
    
                    openEditModal(objParent.userData.widthMm, modelRoomType, objParent.userData.customId, false);
                    createFurnitureItemControls(modelRoomType, objParent, objParent.userData.customId); 
                }
            } 
        }

    function initRoomCabinetTypeTabs() {
        const currentRoomTab = container.querySelector('.room-type-tabs button.active');
        roomState.roomType = currentRoomTab ? currentRoomTab.getAttribute('data-type') : null;
        const tabs = container.querySelectorAll('.room-type-tabs button')

        tabs.forEach(tab => {
            const type = tab.getAttribute('data-type');
            const contents = container.querySelectorAll(`.tabs-content .tab-item[data-room_type="${type}"]`);
            const modelContainer = container.querySelector(
                `.model-display-container .room-model-container-inner .canvas-parent[data-type="${type}"]`
            );
            tab.addEventListener('click', function(e) {
                e.preventDefault(); 
                // currentRoomModelObj = roomModels[type];  
                currentRoomType = type;
                changeRoomTypeTab(tab, contents, modelContainer);
                editContainerRemove();
            });
        });

    }

    function initCabinetTabs() {
        const tabs = container.querySelectorAll('.cabinet-settings .cabinets-content .tabs button');

        tabs.forEach(tab => {
            const type = tab.getAttribute('data-type');
            const contents = container.querySelectorAll(`.cabinet-settings .tabs-content .tab-content[data-type="${type}"]`);

            tab.addEventListener('click', function(e) {
                e.preventDefault();     
                changeCabinetsTab(tab, contents);
                editContainerRemove();
            });
        });
    }

    function openEditModal(width, modelRoomType, customId, actionTypeAdd = true) {
        const furnitureItem = container.querySelector(`.cabinet-settings .cabinets .cabinet-item[data-custom_id="${customId}"]`);

        if(!furnitureItem) return;
        const itemData = JSON.parse(furnitureItem.getAttribute('data-item_data'));
        const productId = itemData.product_id;
        const {
            regular: regularPrice, 
            regular_cm3: regularPriceCm3,
            discount: discountPrice, 
            discount_cm3: discountPriceCm3,
            display: displayPrice,
            display_cm3: displayPriceCm3,
        } = itemData.prices;

        const furnitureType = itemData.furniture_type;
        const modelFileSrc = itemData.model_src;

        editContainerRemove();
        createEditModal(
            furnitureItem, 
            modelRoomType,
            customId,
            itemData, 
            productId, 
            furnitureType, 
            modelFileSrc, 
            width, 
            itemData.prices,
            displayPrice, 
            regularPrice, 
            discountPrice, 
            regularPriceCm3, 
            discountPriceCm3, 
            displayPriceCm3, 
            actionTypeAdd
        );
    }

    function createEditModal(
        item, 
        modelRoomType,
        customId,
        data, 
        productId, 
        furnitureType, 
        modelFileSrc, 
        width, 
        prices, 
        displayPrice, 
        regularPrice, 
        discountPrice, 
        regularPriceCm3, 
        discountPriceCm3, 
        displayPriceCm3, 
        actionTypeAdd = true
    ) {
        highlightCurrentItem(modelRoomType, customId);

        const { min_width, max_width } = data;
        
        const minWidth = parseInt(min_width);
        const maxWidth = parseInt(max_width);
        let html = `<div class="edit-container-inner"> <button type="button" data-action_type="go-back">Go Back</button>       
                <div class="list-container dimension-container" data-dimension_type="width" data-type="width" data-constant_name="itemWidth">
                    <div class="general-settings">
                        <h3>Width</h3>
                        <div class="input-container">
                            <input type="number" name="width" value="${width}" min="${minWidth}" max="${maxWidth}">
                            <span class="unit">mm</span>
                        </div>

                        <div class="slider-container">
                            <input type="range" id="width" name="width" value="${width}" min="${minWidth}" max="${maxWidth}">
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

        const editContainer = item.closest('.tabs-content').querySelector('.edit-container');
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

        changeItemDimensionWidthValue(modelRoomType, item, actionTypeAdd);

        const addBtn = editContainer.querySelector('button[data-action_type="add"]');

        if(addBtn) {
            furnitureTypeAddInit(
                modelRoomType,
                addBtn, 
                item, 
                productId, 
                furnitureType, 
                modelFileSrc, 
                minWidth, 
                prices, 
                displayPrice, 
                regularPrice, 
                discountPrice, 
                regularPriceCm3,
                discountPriceCm3, 
                displayPriceCm3, 
                editContainer
            );
        }
    
    }

    function furnitureTypeAddInit(
        itemRoomType,
        addBtn, 
        item, 
        productId, 
        furnitureType, 
        modelFileSrc, 
        itemMinWidth, 
        prices, 
        displayPrice, 
        regularPrice, 
        discountPrice, 
        displayPriceCm3, 
        regularPriceCm3, 
        discountPriceCm3, 
        editContainer = null
    ) {

        const currentMyItemsList = container.querySelector(`.tab-item[data-room_type="${itemRoomType}"] .cabinets .my-cabinets-list-inner`);
        const currentSummaryItemsList = container.querySelector(`.tab-item[data-room_type="${itemRoomType}"] .summary .summary-content`);
        addBtn.addEventListener('click', async function() {
            if(stepsContainer) {
                stepsContainer.classList.add('loading');
            }
            const itemWidth = item.getAttribute('data-item_width');
            const customId = uniqLong();

            const { heighMm, heightPx, heighMmMin, depthMm, depthPx, depthMmMin } = getItemPxDimensions(furnitureType);

            if(furnitureType.includes('corner')) {
                if(roomType === ROOM_TYPE_SINGLE_WALL) {
                    return;
                }
                if(furnitureType === DIMENSION_TYPE_FULL_CORNER) {
                    if(cornerBottomFurnitureId || cornerTopFurnitureId || cornerFullFurnitureId) {
                        alert(`Full Corner Furniture already added.`);
                        return;
                    } else {
                        cornerFullFurnitureId = productId;
                    }
                } else if(furnitureType === DIMENSION_TYPE_BOTTOM_CORNER) {
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
            
            const itemTotal = changeSingleProductPrice(
                furnitureType,
                itemWidth, 
                itemMinWidth, 
                prices, 
                displayPriceCm3, 
                regularPrice, 
                discountPrice, 
                state.defaultTextures, 
                furnitureDimensions, 
                state.defaultComponents
            );

            changeTotalPrice(itemTotal);

            const mergedPrices = {...prices, ...itemTotal}
            const {itemPositionMm} = await addGLBModel(
                itemRoomType,
                modelFileSrc, 
                furnitureType, 
                productId, 
                customId, 
                mergedPrices, 
                heighMm, 
                depthMm, 
                itemWidth, 
                heighMmMin, 
                depthMmMin, 
                itemMinWidth
            );
            
            const {my_item_html, summary_item_html} = await addFurnitureItem(
                customId, 
                productId, 
                itemRoomType,
                itemWidth,
                heightPx,
                depthPx,
                itemPositionMm,
                state.defaultTextures,
                mergedPrices
            );

            if(my_item_html) {
                currentMyItemsList.insertAdjacentHTML('beforeend', my_item_html);
                currentSummaryItemsList.insertAdjacentHTML('beforeend', summary_item_html);
                changeCabinetsTab(myCabinetTab, myCabinetContents);

                if(editContainer) {
                    editContainer.classList.remove('active');
                    editContainer.innerHTML = '';
                }

                const furnitureItem = currentMyItemsList.querySelector(`.my-cabinet-item[data-custom_id="${customId}"]`);
                if(furnitureItem) {
                    editItemButtonTrigger(itemRoomType, furnitureItem); 
                    removeItemButtonTrigger(itemRoomType, furnitureItem, customId, furnitureType);
                    duplicateFurnitureTrigger(itemRoomType, furnitureItem, customId);
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

    function productActionsInit(roomType, customId, itemData, productId, furnitureType, modelFileSrc, price) {
        const itemHtml = container.querySelector(`.tab-item .my-cabinets-list .cabinet-item[data-custom_id="${customId}"]`);
        const editBtn = itemHtml.querySelector(`.item-actions-container button[data-action_type="edit"]`);
        const duplicateBtn = itemHtml.querySelector(`.item-actions-container button[data-action_type="duplicate"]`);
        const removeBtn = itemHtml.querySelector(`.item-actions-container button[data-action_type="remove"]`);

        const {
            display_total, 
            regular_total,
            discount_total, 
            total_cm3
        } = price;
        
        editBtn.addEventListener('click', function(e) {
            e.preventDefault();
                  
            const itemWidth = parseInt(itemHtml.getAttribute('data-item_width'));

            createEditModal(
                itemHtml, 
                roomType,
                customId,
                itemData, 
                productId, 
                furnitureType, 
                modelFileSrc, 
                itemWidth, 
                price,
                display_total, 
                regular_total, 
                discount_total, 
                total_cm3.regular, 
                total_cm3.discount, 
                total_cm3.display,
                false
            );
        });

        duplicateBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const itemWidth = itemHtml.getAttribute('data-item_width');
            initFurnitureDuplicateData(roomType, customId, itemWidth);
        });

        removeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            initFurnitureRemoveData(roomType, customId);
        });
    }

    function changeItemDimensionWidthValue(modelRoomType, item, actionTypeAdd) {
        const dimentionsContainer = item.closest('.tabs-content').querySelector('.edit-container .dimension-container');
        if(!dimentionsContainer) return;

        const editContainer = dimentionsContainer.closest('.tabs-content');
        const rangeInput = dimentionsContainer.querySelector('.slider-container input[type="range"]');
        const rangeNumInput = dimentionsContainer.querySelector('.input-container input[type="number"]');
        const valueHtml = editContainer.querySelector('.dimensions-info .w-value');
        const customId = item.getAttribute('data-custom_id');
        const itemWidth = item.getAttribute('data-item_width');

        const itemData = JSON.parse(item.getAttribute('data-item_data'));
    
        let {
            regular: regularPrice, 
            regular_cm3: regularPriceCm3,
            discount: discountPrice, 
            discount_cm3: discountPriceCm3,
            display: displayPrice,
            display_cm3: displayPriceCm3,
        } = itemData.prices;

        regularPrice = regularPrice ? parseFloat(regularPrice) : 0.00; 
        regularPriceCm3 = regularPriceCm3 ? parseFloat(regularPriceCm3) : 0.00;
        discountPrice = discountPrice ? parseFloat(discountPrice) : 0.00; 
        discountPriceCm3 = discountPriceCm3 ? parseFloat(discountPriceCm3) : 0.00; 
        discountPriceCm3 = discountPriceCm3 ? parseFloat(discountPriceCm3) : 0.00; 
        displayPrice = displayPriceCm3 ? parseFloat(displayPrice) : 0.00; 
        displayPriceCm3 = displayPriceCm3 ? parseFloat(displayPriceCm3) : 0.00; 
        const furnitureType = itemData.furniture_type;
        const itemMinWidth = itemData.min_width;

        rangeInput.addEventListener('change', function(e) {
            const value = parseInt(e.target.value);
            rangeNumInput.value = value;
            item.setAttribute('data-item_width', value);
            valueHtml.innerHTML = value;

            if(!actionTypeAdd) {
                editGLBModelWidth(modelRoomType, customId, value);
            }

            const itemTotal = changeSingleProductPrice(
                furnitureType,
                itemWidth, 
                itemMinWidth, 
                itemData.prices, 
                displayPriceCm3, 
                regularPrice, 
                discountPrice, 
                state.defaultTextures, 
                furnitureDimensions, 
                state.defaultComponents
            );

            changeTotalPrice(itemTotal);
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

            if(!actionTypeAdd) {
                editGLBModelWidth(modelRoomType, customId, value);
            }

            const itemTotal = changeSingleProductPrice(
                furnitureType,
                itemWidth, 
                itemMinWidth, 
                itemData.prices, 
                displayPriceCm3, 
                regularPrice, 
                discountPrice, 
                state.defaultTextures, 
                furnitureDimensions, 
                state.defaultComponents
            );

            changeTotalPrice(itemTotal);
        });
    }

    function editGLBModelWidth(modelRoomType, customId, itemWidth) {

        const modelObj = roomModels[modelRoomType];
        const children = modelObj.modelScene.children;

        defaultBottomReferenceY = getDefaultBottomHeightWithSpace(
            roomDimensions.height,
            modelRoomDimensions.height
        );

        const childObj = children.find(c => c.userData.customId == customId);
        if (!childObj) return;

        const userData = childObj.userData;
        const furnitureType = userData.furnitureType;

        const widthPx = get3DItemDimensionWidth(itemWidth);

        // ---------- UPDATE CORNER DIMENSIONS ----------
        if (furnitureType.includes("corner")) {

            switch (furnitureType) {

                case DIMENSION_TYPE_BOTTOM_CORNER:
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

        const scaleX = widthPx / originalSize.x;
        childObj.scale.x = scaleX;

        // recompute scaled size WITHOUT Box3
        const newScaledSize = new THREE.Vector3(
            originalSize.x * childObj.scale.x,
            originalSize.y * childObj.scale.y,
            originalSize.z * childObj.scale.z
        );

        userData.scaledSize.copy(newScaledSize);
        userData.widthMm = itemWidth;

        // ---------- SAVE LOCAL POSITION ----------
        const localPos = childObj.position.clone();
        userData.savedPosition = localPos.clone();

        // ---------- COLLISION CHECK ----------
        const isFitting = checkIfAbleToDragChildToPosition(modelRoomType, childObj);

        // ---------- CALCULATE MM POSITION ----------
        const itemPositionMm = getItemPosition(
            modelRoomType,
            furnitureType,
            localPos.clone(),
            newScaledSize.clone(),
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
        const itemIndex = modelObj.dbChildren.findIndex(
            item => item.db_data.custom_id == customId
        );

        if (itemIndex > -1) {

            const item = { ...modelObj.dbChildren[itemIndex] };

            item.width = itemWidth;
            item.db_data.width = itemWidth;
            item.db_data.furniture_position_mm = JSON.stringify(itemPositionMm);
            item.db_data.is_fitting = isFitting;

            modelObj.dbChildren[itemIndex] = item;
        }
    }   

//     function editGLBModelWidth(modelRoomType, customId, itemWidth) {
//         const modelObj = roomModels[modelRoomType];
//         const children = modelObj.modelScene.children;

//         defaultBottomReferenceY = getDefaultBottomHeightWithSpace(roomDimensions.height, modelRoomDimensions.height);

//         const childObj = children.find(child => child.userData.customId == customId);

//         if(!childObj) return;
//         const userData = childObj.userData;
//         const widthPx = get3DItemDimensionWidth(itemWidth);

//         const furnitureType = userData.furnitureType;

//         if(furnitureType.includes('corner')) {
//             switch(furnitureType) {
//                 case DIMENSION_TYPE_BOTTOM_CORNER: {
//                     cornerBottomWidth = itemWidth;
//                     cornerBottomWidth3d = widthPx;
//                     break;
//                 }
//                 case DIMENSION_TYPE_TOP_CORNER: {
//                     cornerTopWidth = itemWidth;
//                     cornerTopWidth3d = widthPx;
//                     break;
//                 }
//                 case DIMENSION_TYPE_FULL_CORNER: {
//                     cornerFullWidth = itemWidth;
//                     cornerFullWidth3d = widthPx;
//                     break;
//                 }
//                 default: {
//                     break;
//                 }
//             }
//         }

//         const originalSize = userData.originalSize;
//         const scaleX = widthPx / originalSize.x;
//         childObj.scale.x = scaleX;

//         // Recompute scaled size
//         const childObjBox = new THREE.Box3().setFromObject(childObj);
//         const newScaledSize = new THREE.Vector3();
//         childObjBox.getSize(newScaledSize);

//         childObj.userData.scaledSize = newScaledSize.clone();
//         childObj.userData.widthMm = itemWidth;
// console.log(childObj.userData.scaledSize)
//         /******** 2. save position and size to object ********/
//         const childWorldPos = new THREE.Vector3();
//         childObj.getWorldPosition(childWorldPos);
//         childObj.userData.savedPosition = childWorldPos.clone();

//         /******** end save position ********/

//         // Check if fitting
//         const isFitting = checkIfAbleToDragChildToPosition(modelRoomType, childObj, childObjBox);
//         const itemPositionMm = getItemPosition(modelRoomType, furnitureType, childWorldPos.clone(), newScaledSize.clone(), customId);
//         childObj.userData.positionMm = itemPositionMm;

//         childObj.userData.isFitting = isFitting;

//         if (!isFitting) {
//             childObj.traverse(child => {
//                 if (child.isMesh) {
//                     child.material.color.set(0xff0000);
//                     child.material.transparent = true;
//                     child.material.opacity = 0.5;
//                 }
//             });
//         }

//         const userDataNew = childObj.userData;
//         const itemIndex = modelObj.dbChildren.findIndex(item => item.db_data.custom_id == customId);
//         console.log(itemIndex)
//         console.log(itemWidth)
//         if(itemIndex > -1) {
//             const oldItem = {...modelObj.dbChildren[itemIndex]};
//             oldItem.width = itemWidth;
//             oldItem.db_data.width = itemWidth;
//             oldItem.db_data.furniture_position_mm = JSON.stringify(itemPositionMm);
//             oldItem.db_data.is_fitting = isFitting;
//             modelObj.dbChildren[itemIndex] = {...oldItem};
//         }
//     }

    function checkIfItemsAreFittingForNewCorner(modelRoomType, currentObj, currentBox) {
        const modelObj = roomModels[modelRoomType];
        const currentId = currentObj.id;
        const currentObjType = currentObj.userData.furnitureType;

        const currentBoxMin = currentBox.min;
        const currentBoxMax = currentBox.max;
        const currentXMin = currentBoxMin.x;
        const currentYMin = currentBoxMin.y;
        const currentXMax = currentBoxMax.x;
        const currentYMax = currentBoxMax.y;

        const children = modelObj.modelScene.children;

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
        const bottomPercent = (furnitureDimensions.bottom_height + furnitureDimensions.space_bottom) / (roomHeightCm * 10);
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

            const model = roomModels[ROOM_TYPE_SINGLE_WALL];
            const controls = model.threeJSControls;

            let value = parseFloat(zoomSlider.value);

            value *= (1 - ZOOM_STEP); // zoom in

            value = Math.max(value, controls.minDistance);

            zoomSlider.value = value;
            zoomSlider.dispatchEvent(new Event('input'));
            
        });

        btnZoomOut.addEventListener('click', function(e) {
            e.preventDefault();

            const model = roomModels[ROOM_TYPE_SINGLE_WALL];
            const controls = model.threeJSControls;

            let value = parseFloat(zoomSlider.value);

            value *= (1 + ZOOM_STEP); // zoom in

            value = Math.max(value, controls.minDistance);

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
            Object.values(roomModels).forEach(model => {
                smoothReset(model.threeJSControls);
            });
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
        Object.values(roomModels).forEach(model => {
            if (!model.threeJSCamera) return;

            const camera = model.threeJSCamera;
            const controls = model.threeJSControls;

            const direction = new THREE.Vector3()
                .subVectors(camera.position, controls.target)
                .normalize();

            camera.position.copy(
                controls.target.clone().add(direction.multiplyScalar(distance))
            );

            controls.update();
        });
    }

    function updateZoomSlider(camera, controls) {

        const distance = camera.position.distanceTo(controls.target);

        const currentValue = parseFloat(zoomSlider.value);

        if (Math.abs(currentValue - distance) > 0.1) {
            zoomSlider.value = distance.toString();
            zoomSlider.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    function getActiveModel(){
        return roomModels[currentRoomType];
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
                roomDimensions,
                furnitureDimensions,
                roomModels
            );

        });
        
    }

}

function getRoomDimensions(modelContainer, roomDimensions) {
    const { width, height, depth } = roomDimensions;
    const modelContainerWidth = modelContainer.clientWidth;
    const modelContainerHeight = modelContainer.clientHeight;
    const maxModelContainerDimension = modelContainerWidth > modelContainerHeight ? modelContainerWidth : modelContainerHeight;

    let max = width;
    if(max < height) {
        max = height;
    } else if(max < depth) {
        max = depth;
    }

    const heightPxPercent = height * 100 / max;
    const heightPx = maxModelContainerDimension * heightPxPercent / 100;
    const depthPxPercent = depth * 100 / max;
    const depthPx = maxModelContainerDimension * depthPxPercent / 100;
    const modelWidthPercent = width * 100 / max;
    const widthPx = maxModelContainerDimension * modelWidthPercent / 100;

    return {
        heightPx,
        depthPx,
        widthPx,
        scaleX: widthPx / width,
        scaleY: heightPx / height,
        scaleZ: depthPx / depth
    };
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
        productId,
        roomType, 
        furnitureWidth,
        furnitureHeight,
        furnitureDepth,
        itemPosition,
        textures,
        prices,
    ) {
    try {
        let formData = new FormData();
        formData.append("action", "add_furniture_item_to_admin_config");
        formData.append("custom_id", customId);
        formData.append("product_id", productId);
        formData.append("room_type", roomType);
        formData.append("furniture_width", furnitureWidth);
        formData.append("furniture_position", itemPosition);
        formData.append("furniture_height", furnitureHeight);
        formData.append("furniture_depth", furnitureDepth);
        formData.append("textures", JSON.stringify(textures));
        formData.append("item_prices", JSON.stringify(prices));

        const response = await fetch(configDataRoom.ajaxurl, {
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

        const productsList = Object.entries(roomModels).map(([key, value]) => ({
            type: key,
            products: {...value.dbChildren}
        }));
        console.log(productsList)
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

        currentConfigId = data.config_id;

        // for (const [type, value] of Object.entries(productsList)) {
        //     modChildrenList(value.type, value.products);
        // }

        // function modChildrenList(roomType, products) {
        //     products = products.map(item => ({
        //         ...item,
        //         old_item: true
        //     }));
   
        //     roomModels = {
        //         ...roomModels,
        //         [roomType]: {
        //             ...roomModels[roomType],
        //             dbChildren: [...products],
        //         }
        //     };
        // }

    } catch (e) {
        buttonHtml.innerHTML = oldText;
        return null;
    }
}
