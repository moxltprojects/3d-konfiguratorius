
import { 
    initTextures,
    ROOM_TYPE_SINGLE_WALL,
    ROOM_TYPE_WITH_CORNER,
    state,
    roomState,
    changeInputFromRangeValue,
} from '../../../assets/js/shared-scripts.js';

import { 
    initCabinetTypes,
    initRoomModelSettings,
    progressInit,
    initCabinetTabs,
    initAddFurnitureMethod,
    loadMoreProducts,
    renderBasicImage3dContainer,
    init3dModel,
    editContainerRemove,
    updateRoomSize
} from '../../../assets/js/new-shared-scripts.js';

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
) {
    initTextures(textures);


    const modelContainer = container.querySelector('.model-display-container .room-model-container-inner');
    state.model3dContainer = modelContainer;

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

                updateRoomSize(roomState.modelsList[ROOM_TYPE_SINGLE_WALL]);
                updateRoomSize(roomState.modelsList[ROOM_TYPE_WITH_CORNER]);

            });

            rangeNumInput.addEventListener('change', function(e) {
                const value = parseInt(e.target.value);
                rangeInput.value = value;

                roomState.roomDimensions[type] = parseInt(value);

                updateRoomSize(roomState.modelsList[ROOM_TYPE_SINGLE_WALL]);
                updateRoomSize(roomState.modelsList[ROOM_TYPE_WITH_CORNER]);
            });
        });
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
