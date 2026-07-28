import {
    THREE,
    OrbitControls,
    GLTFLoader,
    DragControls,
    BufferGeometryUtils
} from './three-imports.js';

import { 
    initTextures,
    ROOM_TYPE_SINGLE_WALL,
    ROOM_TYPE_WITH_CORNER,
    FURNITURE_TYPE_BOTTOM_CORNER,
    FURNITURE_TYPE_FULL,
    FURNITURE_TYPE_TOP,
    FURNITURE_TYPE_BOTTOM,
    DIMENSION_TYPE_TOP,
    DIMENSION_TYPE_FULL,
    DIMENSION_TYPE_HEIGHT,
    DIMENSION_TYPE_DEPTH,
    DIMENSION_TYPE_WIDTH,
    FLOOR_THICKNESS,
    WALL_THICKNESS,
    BOTTOM_DISPLAY_IMAGE,
    TOP_DISPLAY_IMAGE,
    FULL_DISPLAY_IMAGE,
    LIGHT_STATE_DEFAULT,
    LIGHT_STATE_BRIGHT,
    state,
    roomState,
    changeInputFromRangeValue,
    getTextureSrc,
    generateSmartUVs,
	updateBgPlane,	
    getRoomDimensions,
} from './shared-scripts.js';

import { 
    initRoomModelSettings,
    renderBasicImage3dContainer,
    initCabinetTypes,
    removeCornerPseudoModelObjects,
    progressInit,
    initCabinetTabs,
    initAddFurnitureMethod,
    loadMoreProducts,
    clearModelScene,
    dragControlsMethod,
    setZoomSettingsValues,
    changeTotals,
    getCornerDimensions,
    appendCornerPseudoModelObjects,
    init3dModel,
    productActionsInit,
    modelSettings,
    updateRoomSize,
} from './new-shared-scripts.js';

import { 
    changeSingleProductPrice,
} from './calculate-totals.js';

let 
    container,
    saveDataButtonsContainer,
    configSelector,
    threeJSRenderedBasicDisplay, 
    basicDisplayScene, 
    threeJSCameraBasicDisplay,
    rootGroupBasicDisplay,
    userId;


window.initRoomConfigComponent =  async function initRoomConfigComponent(userConfigId = null, templateData = null) {
    const root = document.querySelector('.display-type-container, .room-config-shortcode');
    
    let {
        content,
        all_products,
        products_list,
        products_list_per_page,
        room_type,
        room_dimensions,
        furniture_dimensions,
        corner_furniture_data,
        default_textures,
        ai_textures,
        total,
        currency_symbol,
        user_id, 
    } = await getRoomConfigComponentShortcodeContent(userConfigId, templateData);

    userId = user_id;

    if(!content) return;

    root.innerHTML = content;

    container = root.querySelector('.room-config-container');

    const newShared = await import('./new-shared-scripts.js');

    newShared.initNewSharedScripts(container, configDataRoom.ajaxurl, configDataRoom.assetsUrl);

    const roomType = room_type ?? ROOM_TYPE_SINGLE_WALL;
    roomState.roomType = roomType;
    roomState.aiTextures = ai_textures;
    roomState.furnitureDimensions = furniture_dimensions;
    roomState.roomDimensions = room_dimensions;
    roomState.cornerFurnitureData = corner_furniture_data;

    initRoomConfigFunctions(
        container, 
        default_textures,
        all_products,
        products_list_per_page, 
        products_list,
        total, 
        currency_symbol,
        furniture_dimensions.largest_height,
    );
}

function initRoomConfigFunctions(
    container, 
    textures,
    allProducts,
    productsListPerPage, 
    productList,
    total, 
    currencySymbol,
    largestHeight,
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

    configSelector = container.querySelector('.configurator-selector select');
    saveDataButtonsContainer = container.querySelector('.save-data-container .buttons-list');

    const roomConfigSummary = container.querySelector('.room-config-summary');
    roomState.summaryItemsList = container.querySelector('.summary-cabinets-list-inner');
    roomState.myItemsList = container.querySelector('.my-cabinets-list .my-cabinets-list-inner');

    toggleAccordions();

    setRoomModelData();

    initRoomModelSettings(); //imported
    initSettingsSave();  
    initSettingsConfigChange();
    initTemplateSelector();
    progressInit();  //imported
    initCabinetTabs(
        '.cabinet-settings .main-settings-sidebar .cabinets .tabs button',
    ); //imported
    initCabinetTypes(); //imported
    renderBasicImage3dContainer();
    initRoomType(true);
    changeRoomType();

    changeInputFromRangeValue(container);
    changeRoomDimensionsValue(container);

    initAddFurnitureMethod(); //imported
    loadMoreProducts(productsListPerPage, configDataRoom.ajaxurl); //imported
    initAddToCart();

    function setRoomModelData() {

        const newObj = {
            ...roomState.modelsList[ROOM_TYPE_SINGLE_WALL],
            total: total,
            dbChildren: productList,
            htmlContainer: modelContainer
        }
        roomState.modelsList = {
            ...roomState.modelsList,

            [ROOM_TYPE_SINGLE_WALL]: {
                 ...newObj,
                allProducts: allProducts,
                roomType: ROOM_TYPE_SINGLE_WALL,
            },

            [ROOM_TYPE_WITH_CORNER]: {
                ...newObj,
                roomType: ROOM_TYPE_WITH_CORNER,
            }
        }; 
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
                roomState.roomDimensions[type] = value;

                // initRoomType();
                updateRoomSize(roomState.modelsList[roomState.roomType], roomState.roomDimensions);
            });

            rangeNumInput.addEventListener('change', function(e) {
                const value = parseInt(e.target.value);
                rangeNumInput.value = value;
                
                changeDimensionValueSwitch(type, value);

                roomState.roomDimensions[type] = value;

                // initRoomType();
                updateRoomSize(roomState.modelsList[roomState.roomType], roomState.roomDimensions);
            });
        });

        function changeDimensionValueSwitch(type, value) {

            switch(type) {
                case DIMENSION_TYPE_HEIGHT: {
                    roomState.roomDimensions.height = value;
                    break;
                }
                case DIMENSION_TYPE_DEPTH: {
                    roomState.roomDimensions.depth = value;
                    break;
                }

                case DIMENSION_TYPE_WIDTH: {
                    roomState.roomDimensions.width = value;
                    break;
                }
                
                default: {
                    roomState.roomDimensions.width = value;
                }
            }
        }
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

        const roomType = currentOption.getAttribute('data-type');

        if(!roomType) return;

        // if(!onPageLoad) {
        //     roomState.modelsList[ROOM_TYPE_SINGLE_WALL].dbChildren = [];
        //     roomState.modelsList[ROOM_TYPE_WITH_CORNER].dbChildren = [];
        //     changeTotals()

        //     roomState.dynamicLists.forEach(html => {
        //         html.innerHTML = '';
        //     });
        //     roomState.summaryItemsList.innerHTML = '';
        // }

        roomState.roomType = roomType;
        const currentObj = roomState.modelsList[roomType];
        const roomModelParams = init3dModel(currentObj, state.model3dContainer, roomType, onPageLoad);
        roomState.modelsList[roomType] = {...roomState.modelsList[roomType], ...roomModelParams}
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

    function clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
    }

    function calcBasicDisplayXPaddingUnits(parentWidthPx, parentWithUnits) {
        const basicDisplayXPaddingUnitsPercent = BASIC_DISPLAY_X_PADDING_PX * 100 / parentWidthPx;
        const units = parentWithUnits * basicDisplayXPaddingUnitsPercent / 100;

        return units;
    }

    function initAddToCart(){
        const button = container.querySelector('.config_add_to_cart_button');
        const innerHtml = button.innerHTML;
        const messageContainer = button.closest('.buy-container').querySelector('#add-to-cart-message');

        if(!button) return;

        button.addEventListener('click', async function(e) {
            e.preventDefault();

            button.innerHTML = '<span class="loader"></span>';

            if(roomState.modelsList[roomState.roomType].dbChildren.length == 0) {
                button.innerHTML = innerHtml;
                alert("Please add some products");
                return;
            }

            await addItemsToCart(
				button,
                messageContainer,
                configSelector,
                roomState.currentConfigId,
            );

            button.innerHTML = innerHtml;

        });
    }

    function initSettingsConfigChange() {
        if(!configSelector) return;

        configSelector.addEventListener('change', async function(e) {
            const value = e.target.value;
            roomState.currentConfigId = value;
            roomState.currentTemplatePostId = null;
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
                roomState.currentConfigId = null;
                const data = roomTypeInput.getAttribute('disabled') !== null ? 
                    null : {
                    post_id: postId,
                    room_type: roomTypeValue,
                };

                roomState.currentTemplatePostId = postId;

                await setShortocodeLoading(roomState.currentConfigId, data);
            }); 
        });
    }

}

function cancelTemplateConfigSelection() {
    const selectedItemButton = container.querySelector('.templates-list .single-template.selected .single-template-button');
    if(!selectedItemButton) return;

    selectedItemButton.setAttribute('data-action_type', 'select');

    selectedItemButton.innerHTML = 'Select';

    roomState.currentTemplatePostId = null;
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
    } = roomState.furnitureDimensions;

    await saveUserSettingsAjax(
        saveDataButtonsContainer,
        configSelector,
        buttonHtml,
        roomState.currentConfigId,
        // state.defaultTextures,
        // state.defaultComponents,
        // roomState.roomType,
        // roomState.roomDimensions,
        // roomState.furnitureDimensions,
        // roomState.modelsList[roomState.roomType].dbChildren
    );

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



/**************** NEW ******* */
export async function initTextureSettingsConfigFunctions(container, textureCookieName, productId = null) {

        changeTextureContainer();
        changeTextureTermTabs();
        changeTextureValues();

        function changeTextureContainer() {
            let initIndex = 1;
            const textureHeading = container.querySelector('.settings-configurator-heading');
            const listCount = container.querySelectorAll('.list > .heading').length;
            const buttonPrev = textureHeading.querySelector('button.prev');
            const buttonNext = textureHeading.querySelector('button.next');
            let currentHeading = textureHeading.querySelector('.heading.active');
            let currentTextureFurnitureType = currentHeading.getAttribute('data-slug');

            buttonPrev.addEventListener('click', function(e) {
                e.preventDefault();

                if(initIndex == 1) return;
                initIndex--;

                renderHeadingSwiperActions(initIndex); 
                
                if(initIndex < listCount) {
                    buttonNext.removeAttribute('disabled');
                }
                if(initIndex == 1) {
                    buttonPrev.setAttribute('disabled', true);
                }
            });

            buttonNext.addEventListener('click', function(e) {
                e.preventDefault();
                if(initIndex == listCount) return;
                initIndex++;

                renderHeadingSwiperActions(initIndex);

                buttonPrev.removeAttribute('disabled');

                 if(initIndex === listCount) {
                    buttonNext.setAttribute('disabled', true);
                }
            });

            function renderHeadingSwiperActions(index) {
                const prevHeading = textureHeading.querySelector(`.list > .heading:nth-child(${index})`)
                if(currentHeading) currentHeading.classList.remove('active');
                if(prevHeading) prevHeading.classList.add('active');
                currentHeading = prevHeading;

                currentTextureFurnitureType = currentHeading.getAttribute('data-slug');
                const prevTextureContainer = container.querySelector(`.settings-main-content .texture-list-container.active`);
                const showedTextureContainer = container.querySelector(`.settings-main-content .texture-list-container[data-slug="${currentTextureFurnitureType}"]`);
                if(prevTextureContainer) prevTextureContainer.classList.remove('active');
                if(showedTextureContainer) showedTextureContainer.classList.add('active');
            }


        }

        function changeTextureValues() {
            const textureContainers = container.querySelectorAll('.settings-main-content .texture-list-container');
            const swiper = container.querySelector('.settings-gallery');

            textureContainers.forEach(textureContainer => {
                const textureCatType = textureContainer.getAttribute('data-slug');
                const headingContainer = textureContainer.querySelector('.heading-container .heading');
                const priceContainer = textureContainer.querySelector('.texture-price-block .price .number');
                const subcatContainers = textureContainer.querySelectorAll('.texture-multiple-lists-container');
                const subcatContainerAll = textureContainer.querySelector(`.texture-multiple-lists-container[data-slug="${TEXTURE_ALL_SLUG}"]`);
                const subcatContainersExceptAll = textureContainer.querySelectorAll(`.texture-multiple-lists-container:not([data-slug="${TEXTURE_ALL_SLUG}"])`);
                const availableFurnitureTypesAttr = textureContainer.getAttribute('data-available_furniture_types');
                const availableFurntitureTypes = availableFurnitureTypesAttr ? availableFurnitureTypesAttr?.split(',') : null;

                subcatContainers.forEach(subcatContainer => {
                    const furnitureType = subcatContainer.getAttribute('data-slug');
                    const textureSubcatMergedSlugs = subcatContainer.getAttribute('data-merged_slug').split(',');
                    const textureButtons = subcatContainer.querySelectorAll('.texture-list .list-item button');

                    textureButtons.forEach(button => {
                        const buttonParent = button.parentNode;
                        const btnId = buttonParent.getAttribute('data-id');
                        const btnName = buttonParent.getAttribute('data-name');
                        const btnThumbnail = buttonParent.getAttribute('data-thumbnail');
                        const {regular, discount} = JSON.parse(buttonParent.getAttribute('data-price'));

                        button.addEventListener('click', function(e) {
                            e.preventDefault();

                            if(buttonParent.classList.contains('active')) return;

                            if(productId) {
                                changeTotals();
                            }

                            changeTextureClassMethod(subcatContainer, buttonParent);

                            changeTextureContainerHtml(headingContainer, priceContainer, btnName, regular, discount);
                            
                            textureSubcatMergedSlugs.forEach(mergedSlug => {
                                setTextureCookie(textureCookieName, mergedSlug, btnId);
                                state.defaultTextures[mergedSlug] = {
                                    id: btnId,
                                    thumbnail: btnThumbnail
                                };
                                setTextureLoader(mergedSlug, btnThumbnail);
                                const mergedChildren = [...state.productScenesChildren, ...roomState.modelChildren, ...roomState.displayModelChildren];
                    
                                changeModelChildrenTexture(mergedChildren, mergedSlug, furnitureType, availableFurntitureTypes, productId);
                            });
    
                            if(!productId) {
                                changeTextureSrc(textureSubcatMergedSlugs, btnId);
                            }
                            

                            if(furnitureType === TEXTURE_ALL_SLUG) {
                                subcatContainersExceptAll.forEach(otherSub => {
                                    const newActive = otherSub.querySelector(`.list-item[data-id="${btnId}"]`);
                                    changeTextureClassMethod(otherSub, newActive);
                                });
                            } else {
                                const activeAll = subcatContainerAll ? subcatContainerAll.querySelector('.list-item.active') : null;
                                if(activeAll) activeAll.classList.remove('active');
                            }
                        });
                    });
                });
            });

            function changeTextureClassMethod(textureContainer, buttonParent) {
                const oldActiveButton = textureContainer.querySelector('.texture-list .list-item.active');
                            
                if(oldActiveButton) {
                    oldActiveButton.classList.remove('active');
                }

                if(buttonParent) buttonParent.classList.add('active');
            }

            function changeTextureContainerHtml(headingContainer, priceContainer, heading, regular, discount) {
                headingContainer.innerHTML = heading;

                const priceHtml = parseFloat(discount) > 0 ? 
                    `<span>${discount}</span><del>${regular}</del>` : 
                    `<span>${regular}</span>`;

                priceContainer.innerHTML = priceHtml;
            }

            async function changeTextureSrc(mergedSlugs, btnId) {
				swiper.classList.add('loading');
				
                const { images, id } = await changeTextureImagesDisplayAjax(btnId);

                if(!images) {
					swiper.classList.remove('loading'); 
					return;
				}

                mergedSlugs.forEach(slug => {
                    const subSlug = slug.split('_')[1];
                    const imageData = images[subSlug] ?? null;

                    if(imageData) {

                        if(imageData.image_1.url) {
                            const img1 = swiper.querySelector(`.swiper-slide.image-1 img[data-cat_slug="${slug}"]`);
                            if(img1) 
                                img1.setAttribute('src', imageData.image_1.url);
                        }
                        if(imageData.image_2.url) {
                            const img2 = swiper.querySelector(`.swiper-slide.image-2 img[data-cat_slug="${slug}"]`);
                            if(img2) 
                                img2.setAttribute('src', imageData.image_2.url);
                        }
                        if(imageData.image_3.url) {
                            const img3 = swiper.querySelector(`.swiper-slide.image-3 img[data-cat_slug="${slug}"]`);
                            
                            if(img3)
                                img3.setAttribute('src', imageData.image_3.url);
                        }
                    }
             
                });
				swiper.classList.remove('loading');
            }
			
    }

    function changeTextureTermTabs() {
        const tabContainers = container.querySelectorAll('.settings-main-content .texture-list-container');

        tabContainers.forEach(tabContainer => {
            const tabs = tabContainer.querySelectorAll('.texture-list-tabs button');

            tabs.forEach(tab => {
                const slug = tab.getAttribute('data-slug');
                const list = tabContainer.querySelector(`.texture-multiple-lists-container[data-slug="${slug}"]`);

                if(!list) return;

                tab.addEventListener('click', function(e) {
                    e.preventDefault();

                    if(tab.classList.contains('active')) return;
                    const oldTabActive = tabContainer.querySelector('.texture-list-tabs button.active');
                    const oldContainerActive = tabContainer.querySelector(`.texture-multiple-lists-container.active`);
                    
                    if(oldTabActive) {
                        oldTabActive.classList.remove('active');
                    }
                    if(oldContainerActive) {
                        oldContainerActive.classList.remove('active');
                    }

                    tab.classList.add('active');
                    list.classList.add('active');
                });

            });
        });
        
    }
}

export function changeComponentsValue(container, componentsCookieName, productId = null) {
    const multiSelectOptions = container.querySelectorAll('.component-items.multiselect');
    const singleSelectOptions = container.querySelectorAll('.component-items:not(.multiselect)');

    multiSelectOptions.forEach(multi => {
        const options = multi.querySelectorAll('input');

        options.forEach(option => {
            const accordionItem = option.closest('.config-accordion-item');
            const furnitureType = accordionItem?.getAttribute('data-type_slug');
            const parent = option.closest('.component-items');
            const parentId = parseInt(parent.getAttribute('data-parent_id'));
            option.addEventListener('change', function(e) {
                const value = parseInt(e.target.value);

                const index = state.defaultComponents.findIndex(item => item.id == value && item.parent_id == parentId);
                if(index > -1) {
                    state.defaultComponents.splice(index, 1);
                } else {
                    const obj = {
                        id: value,
                        parent_id: parentId,
                        furnitureType: furnitureType,
                    };
                    state.defaultComponents.push(obj);
                }
                setComponentsCookie(state.defaultComponents, componentsCookieName);
            });
        });
    });
    
    singleSelectOptions.forEach(single => {
        const options = single.querySelectorAll('input');

        options.forEach(option => {
            const accordionItem = option.closest('.config-accordion-item');
            const furnitureType = accordionItem?.getAttribute('data-type_slug');
            const parent = option.closest('.component-items');
            const parentId = parseInt(parent.getAttribute('data-parent_id'));

            option.addEventListener('change', function(e) {
                const value = parseInt(e.target.value);

                options.forEach(allOption => {
                    removeOptionByIndex(parseInt(allOption.value), parentId);
                });

                const obj = {
                    id: value,
                    parent_id: parentId,
                    furnitureType: furnitureType,
                };

                state.defaultComponents.push(obj);

                setComponentsCookie(state.defaultComponents, componentsCookieName);
            });
        });
    });

    function removeOptionByIndex(value, parentId) {
        const index = state.defaultComponents.findIndex(item => item.id == value && item.parent_id == parentId);

        if(index > -1) {
            state.defaultComponents.splice(index, 1);
        } 
    }
}

function changeModelChildrenTexture(children, type, furnitureType, availableFurnitureTypes, productId) {
    const currentTexture = state.textures3DSrc[type] ?? null;

    if(!currentTexture) return;

    let acceptedTexturesArrays = [];

    if (type.includes('countertop')) {
        acceptedTexturesArrays = [...countertopNodesDisplay, ...countertopNodesGlbIkea];
    } else if(type.includes('front')) {
        if(furnitureType !== FURNITURE_TYPE_BOTTOM) { 
            acceptedTexturesArrays = [...frontNodesDisplay, ...frontNodesGlbIkea, ...countertopNodesDisplay, ...countertopNodesGlbIkea];
        } else {
            acceptedTexturesArrays = [...frontNodesDisplay, ...frontNodesGlbIkea];
        }
    } else if(type.includes('base')) {
        acceptedTexturesArrays = [...baseNodesDisplay, ...baseNodesGlbIkea];
    }

    if(!acceptedTexturesArrays.length) {
        return;
    }
    for(let i = 0; i < children.length; i++) {
        const childObj = children[i];
        const unmodifiableTexture = childObj.userData?.unmodifiable_texture;

        if(!unmodifiableTexture) {

            const childFurnitureType = childObj.userData?.furniture_type ? childObj.userData.furniture_type : childObj.furniture_type;

            if(
                !productId && furnitureType !== TEXTURE_ALL_SLUG && furnitureType !== childFurnitureType ||
                availableFurnitureTypes && !availableFurnitureTypes.includes(childFurnitureType)
            ) {
                continue;
            }

            childObj.traverse(node => {
                if (node.isMesh && node.material ) {
                    const name = (node.name || "").toLowerCase();
                    if(acceptedTexturesArrays.includes(name)) {
                        node.material.map = currentTexture;
                        node.material.needsUpdate = true;
                    }
                    // if(acceptedTexturesArrays.length && acceptedTexturesArrays.includes(name)) {
                    //     node.material.map = currentTexture;
                    //     node.material.needsUpdate = true;
                    // } else if(unacceptedTexturesArray.length && !unacceptedTexturesArray.includes(name)) {
                    //     node.material.map = currentTexture;
                    //     node.material.needsUpdate = true;
                    // }
                }
            });
        }
    }
}

export function renderThumbnailImage(parent, furnitureType, src, parentWidth, parentHeight, productId = null, isCategoryPage = false, unmodifiableTexture = false, roomType = null) {
    const loader = new GLTFLoader();

    loader.load(src, function (childGltf) {
        const childMeshGroup = childGltf.scene;

        const texturesObj = isCategoryPage && categoryState.textures3DSrc[productId] ? categoryState.textures3DSrc[productId] : state.textures3DSrc;
 
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

        parent.add(childMeshGroup);

        childMeshGroup.rotation.y = THREE.MathUtils.degToRad(-30);

        const childBox = new THREE.Box3().setFromObject(childMeshGroup);
        const childSize = new THREE.Vector3();
        childBox.getSize(childSize);
        childMeshGroup.userData.dimensions = [];
        const originalSize = childSize.clone();
        childMeshGroup.userData.originalSize = originalSize;

        if(isCategoryPage) {
            childMeshGroup.userData.unmodifiable_texture = unmodifiableTexture;
            const targetDepth  = Math.min(parentWidth, parentHeight); 
            const scaleX = parentWidth  / childSize.x;
            const scaleY = parentHeight / childSize.y;
            const scaleZ = targetDepth  / childSize.z;
            const uniformScale = Math.min(scaleX, scaleY, scaleZ);
            childMeshGroup.scale.setScalar(uniformScale);
        } else {
            const {height, depth, width} = productState?.dimensions;
            const itemH = get3DItemDimensions(height);
            const itemD = get3DItemDimensions(depth);
            const itemW = get3DItemDimensions(width);
            const scaleX = parseFloat(itemW)  / Math.abs(originalSize.x) * 1.2;
            const scaleY = parseFloat(itemH) / Math.abs(originalSize.y) * 1.2;
            const scaleZ = parseFloat(itemD)  / Math.abs(originalSize.z) * 1.2;

            childMeshGroup.scale.set(scaleX, scaleY, scaleZ);
        }

        // recompute scaled size
        const scaledBox = new THREE.Box3().setFromObject(childMeshGroup);
        const scaledSize = new THREE.Vector3();
        scaledBox.getSize(scaledSize);

        childMeshGroup.userData.scaledSize = scaledSize.clone();

        const box = new THREE.Box3().setFromObject(childMeshGroup);
        const center = new THREE.Vector3();
        box.getCenter(center);
        childMeshGroup.position.sub(center);

        if(isCategoryPage) {
            childMeshGroup.position.y = scaledSize.y / 1.2;
            childMeshGroup.userData.furniture_type = furnitureType;


            /******** shadows *********/
            const shadow = state.contactShadow.clone();

            shadow.material.opacity = 0.35;
            shadow.material.depthTest = false;
            shadow.rotation.x = -Math.PI / 2;
            shadow.position.set(
                0,
                -scaledSize.y / 2 + 0.002, // ✅ correct space
                0
            );
            shadow.scale.set(
                scaledSize.x * 1.15,
                scaledSize.z * 1.15,
                1
            );

            childMeshGroup.add(shadow);
            childMeshGroup.userData.shadow = shadow;
            /******** end shadows *********/
        }
        
        state.productScenesChildren.push(childMeshGroup);
    });
        
}

export function setTextureLoader(type, src) {
    const textureLoader = new THREE.TextureLoader();
    state.textures3DSrc[type] = src ? textureLoader.load(src, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(2, 2);
    }) : null;
}

export function expandSettingsContainer(buttons, onClickHandler) {

    buttons.forEach(button => {
        button.classList.add('init');
        const type = button.getAttribute('data-type');
        const parent = button.closest('.settings-preview-container');

        button.addEventListener('click', function(e) {
            e.preventDefault();

            parent.classList.add('loading');
            onClickHandler(parent);
            toggleAccordions();
        });
    });
}


/************ END NEW **********/



async function initSettingsSave(container) {
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
                save ? roomState.currentConfigId : null,
                // state.defaultTextures,
                // state.defaultComponents,
                // roomState.roomType,
                // roomState.roomDimensions,
                // roomState.furnitureDimensions,
                // roomState.modelsList[roomState.roomType].dbChildren
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

        if(typeof standImageData !== "undefined" && standImageData && standImageData['base']) {
            const standImageDataMod = {
                'brand' : {
                    'base64': standImageData['base']?.base64,
                },
                'horizontal-wall-top': {
                    'base64': standImageData['base']?.base64,
                },
            }
            formData.append("stand_image_data", JSON.stringify(standImageDataMod));
        }

        if(typeof furnitureAnalyzeData !== "undefined" && furnitureAnalyzeData && furnitureAnalyzeData['result']) {
            formData.append("ai_furniture_data", JSON.stringify(furnitureAnalyzeData['result']));
        }

        const aiFurniture = {
            [FURNITURE_TYPE_FULL]: {
                count: 2,
            },
            [FURNITURE_TYPE_TOP]: {
                count: 1,
            },
            [FURNITURE_TYPE_BOTTOM]: {
                count: 2,
            },
        }

        formData.append("ai_furniture", JSON.stringify(aiFurniture));

        const response = await fetch(configDataRoom.ajaxurl, {
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
    // textures,
    // components,
    // roomType,
    // roomDimensions,
    // furnitureDimensions,
    // productsList
) {
    const oldText = buttonHtml.innerHTML;
    buttonHtml.innerHTML = '<div class="loader"></div>';
    const messageDiv = buttonsContainer.closest('.save-data-container-inner').querySelector('#save-message');
    if (messageDiv) {
        messageDiv.innerHTML = '';
    }

    const productsList = roomState.modelsList[roomState.roomType].dbChildren;

    try {
        let formData = new FormData();
        formData.append("action", "ajax_save_config_settings");
        formData.append("config_id", configId);
        formData.append("config_settings", JSON.stringify({
            textures: state.defaultTextures,
            ai_textures: roomState.aiTextures,
            components: state.defaultComponents,
            room_settings: {
                type: roomState.roomType,
                ...roomState.roomDimensions,
            },
            furniture_dimensions: roomState.furnitureDimensions,
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

        const {config_id, mod_products, new_config_option_html, new_save_buttons_html} = data;

        if(mod_products) {
            roomState.modelsList[roomState.roomType].dbChildren = [...mod_products];
        }

        if(new_config_option_html && configSelector) {
            configSelector.value = config_id;
            configSelector.innerHTML += new_config_option_html;
        }

        if(new_save_buttons_html) {
            buttonsContainer.innerHTML = new_save_buttons_html;
            initSettingsSave();
        }

        roomState.currentConfigId = config_id;

        cancelTemplateConfigSelection();

    } catch (e) {
        buttonHtml.innerHTML = oldText;
        return null;
    }
}

async function addItemsToCart(
		addToCartButton,
        messageContainer,
        configSelector,
        configId,
    ) {
    try {

        const products = roomState.modelsList[roomState.roomType].dbChildren;
        let formData = new FormData();
        formData.append("action", "config_3d_products_addtocart");
        formData.append("products", JSON.stringify(products));
        formData.append("config_id", configId);
        formData.append("config_settings", JSON.stringify({
            textures: state.defaultTextures,
            ai_textures: roomState.aiTextures,
            components: state.defaultComponents,
            room_settings: {
                type: roomState.roomType,
                ...roomState.roomDimensions,
            },
            furniture_dimensions: roomState.furnitureDimensions,
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

        const {config_id, mod_products, new_config_option_html} = data;

        if(mod_products) {
            roomState.modelsList[roomState.roomType].dbChildren = [...mod_products];
        }

        if(new_config_option_html && configSelector) {
            configSelector.value = config_id;
            configSelector.innerHTML += new_config_option_html;
        }

        roomState.currentConfigId = config_id;
        roomState.modelsList[roomState.roomType].dbChildren = products;

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
		   
		//    const ocId = jQuery('.awb-off-canvas-wrap.cart-item-count-container').data('id');
		// 	window.awbOffCanvas.open_off_canvas(ocId);

        const ocId = jQuery('.awb-off-canvas-wrap.cart-item-count-container').data('id');

        if (window.awbOffCanvas && ocId) {
            window.awbOffCanvas.open_off_canvas(ocId);
        }

        return data;
    } catch(e) {
        console.log(e)
        return null;
    }
}