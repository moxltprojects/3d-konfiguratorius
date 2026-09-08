import {
    THREE,
    GLTFLoader,
    BufferGeometryUtils
} from './three-imports.js';

export const TEXTURE_TYPE_FRONT = 'front';
export const TEXTURE_ALL_SLUG = 'all';
export const FURNITURE_TYPE_BOTTOM = 'bottom';
export const FURNITURE_TYPE_BOTTOM_CORNER = 'bottom-corner';
export const FURNITURE_TYPE_WALL = 'wall';
export const FURNITURE_TYPE_TOP = 'top';
export const FURNITURE_TYPE_FULL = 'full';
export const FURNITURE_TYPE_WALL_TOP = 'wall-top';
export const FURNITURE_COUNTERTOP = 'countertop';
export const SPACE_BOTTOM = 'space_bottom';
export const THUMB_TYPE_SLOGAN = 'slogan';

export const DIMENSION_TYPE_DEPTH = 'depth';
export const DIMENSION_TYPE_WIDTH = 'width';
export const DIMENSION_TYPE_HEIGHT = 'height';

export const POSITION_CENTER = 'center';
export const POSITION_TOP = 'height';

export const TEXTURES_COOKIE_NAME_DEFAULT = 'config_textures_data';
export const COMPONENTS_COOKIE_NAME_DEFAULT = 'config_components_data';
export const FURNITURE_TYPE_COOKIE_NAME_DEFAUL = 'config_cookie_furniture_types';

export const ROOM_TYPE_SINGLE_WALL = 'single-wall';
export const ROOM_TYPE_WITH_CORNER = 'with-corner';
export const DIMENSION_TYPE_BOTTOM = 'bottom';
export const DIMENSION_TYPE_BOTTOM_CORNER = 'bottom-corner';
export const DIMENSION_TYPE_TOP = 'top';
export const DIMENSION_TYPE_TOP_CORNER = 'top-corner';
export const DIMENSION_TYPE_FULL = 'full';
export const DIMENSION_TYPE_FULL_CORNER = 'full-corner';

export const FLOOR_THICKNESS = 20;
export const WALL_THICKNESS = 10;

export const BASIC_DISPLAY_X_PADDING_PX = 80;

export const BOTTOM_DISPLAY_IMAGE = `/models/3d-model.glb`;
export const TOP_DISPLAY_IMAGE = `/models/3d-model.glb`;
export const FULL_DISPLAY_IMAGE = `/models/3d-model.glb`;

export const PRICE_CM_CHUNK = 10;

export const DEFAULT_BRAND_TEXTURE = '#5B94F4';

export const frontNodesGlbIkea = [
     'drawer_large_front_panel_alex_0',
    // 'alex_frame_alex_0',
    // 'drawer_large_front_panel_alex_0',
    // 'drawer_small_front_panel_alex_0',
    // 'alex_frame_alex_0',
];
export const baseNodesGlbIkea = [
    // 'drawer_large_front_panel_alex_0',
    'alex_frame_alex_0',
    // 'drawer_large_back_alex_0',
    // 'drawer_large_side_alex_0',
    // 'drawer_small_back_alex_0',
    // 'drawer_small_side_alex_0',
    // 'legs_legs_0',
    // // 
    // 'alex_frame_alex_0',
];

export const countertopNodesGlbIkea = [
    'drawer_small_front_panel_alex_0',
    'drawer_large_back_alex_0',
    'drawer_large_side_alex_0',
    'drawer_small_back_alex_0',
    'drawer_small_side_alex_0',
    'legs_legs_0',
    // 'drawer_large_surface_alex_0',
    // 'drawer_small_surface_alex_0',
];

// export const HARDCODED_COLOR_MESHES = [
//     {
//         productId: 3132,
//         meshName: '',
//         meshColor: '#ffffff',
//     },
// ];

export const HARDCODED_COLOR_MESHES = [
    {
        productId: 3132,
        singleColor: '#ffffff',
    },
	{
        productId: 3573,
		meshesData: [
			{
				name: 'mesh_0001',
				color: '#797979',	
			},
			{
				name: 'mesh_0002',
				color: '#ffffff',	
			},
		]
    },
];

export const BRAND_COLOR_MESHES = [
    {
        productId: 3389,
        meshName: 'mesh_0',
    },
    {
        productId: 3129,
        meshName: 'mesh_0',
    },
];

export const countertopNodesDisplay = [
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
    //
    'node59',
    'node60',
    'node62',
    'node63',
    'node65',
]

export const baseNodesDisplay = [
    'node84',
];

export const frontNodesDisplay = [
    'node8',
    'node9',
    'node17',
    'node18',
    'node19',
    'node25',
    'node26',
    'node27',
    'node28',
    'node29',
    'node30',
    'node31',
    'node32',
    'node33',
    'node34',
    'node35',
    'node36',
    'node37',

    'node38',
    'node39',
    'node40',
    'node41',
    'node42',
    'node43',
    'node44',
    'node45',
    'node46',
    'node47',

    'node48',
    'node49',
    'node50',
    'node51',
    'node52',
    'node53',
    'node54',
    'node55',

    'node56',
    'node57',
    'node58',
    'node61',
    'node64',
    'node66',
    'node67',
    'node68',

    'node69',
    'node70',
    'node71',
    'node72',
    'node73',
];

export const frontCornerFurniture = [
    'carcass',
    'mesh_2',
    'mesh_3',
    'mesh_4',
];

const COUNTER_TEXTURES = [...countertopNodesDisplay, ...countertopNodesGlbIkea];
export const FRONT_TEXTURES = [...frontNodesDisplay, ...frontNodesGlbIkea, ...frontCornerFurniture];
const BASE_TEXTURES = [...baseNodesDisplay, ...baseNodesGlbIkea];

export const state = {
    uploadsUrl: null,
    defaultTextures: {},
    defaultComponents: [],
    textures3DSrc: {},
    model3dContainer: null,
    productScenesChildren: [],
    contactShadow: null,
};

export const productState = {
    priceHtmlContainer: null,
    dimensions: {},
    textures3DSrc: {},
}

export const categoryState = {
    textures3DSrc: {},
}

const createModelStructure = () => ({
    roomType: null,
    htmlContainer: null,
    aiTextures: {},
    scene: null,
    box: null,
    fitBox: null,
    dbChildren: [],
    allProducts: [],
    camera: null,
    renderer: null,
    dirLight: null,
    controls: null,
    room3DGroup: null,
    dragControls: null,
    bgPlanes: [],
    draggableObjects: [],
    total: {
        regular: 0,
        discount: 0,
        display: 0,
    },
});

export const LIGHT_STATE_DEFAULT = {
    hemi: 0.9,
    dir: 0.45,
    ambient: 0.54,
    exposure: 1.98
};

export const LIGHT_STATE_BRIGHT = {
    hemi: 1, 
    dir: 0.5, 
    ambient: 0.6, 
    exposure: 2.2
};

export const roomState = {
    visibleDimensionArrows: false,
    currentConfigId: null,
    currentTemplatePostId: null,
    roomType: null,
    baseScale: 1,
    summaryItemsList :null,
    dynamicLists: null,
    myItemsList: null,
    roomDimensions: {
        width: 0,
        height: 0,
        depth: 0,
    },
    modelRoomDimensions: {
        width: 0,
        height: 0,
        depth: 0,
    },
    furnitureDimensions: {
        bottom: {
            width: 0, 
            height: 0, 
            depth: 0,
        },
        top: {
           width: 0, 
            height: 0, 
            depth: 0,
        },
        full: {
            width: 0, 
            height: 0, 
            depth: 0,
        },
        space_bottom: 0,
    },
    modelRoomScale: {
        x: 0,
        y: 0,
        z: 0,
    },
    // modelChildren: [],
    displayModelChildren: [],
    allProducts: [],
    dbChildren: [],
    bgPlanes: [],
    postId: false,
    modelsList: {
        [ROOM_TYPE_SINGLE_WALL]: createModelStructure(),
        [ROOM_TYPE_WITH_CORNER]: createModelStructure(),
    },
    cornerFurnitureData: {
        bottom: {
            id: null, 
            width: 0, 
            depth: 0,
        },
        top: {
            id: null, 
            width: 0, 
            depth: 0,
        },
        full: {
            id: null, 
            width: 0, 
            depth: 0,
        }
    },
    corner3DDimensions: {
        cornerBottomWidth3d: 0,
        cornerBottomHeight3d: 0,
        cornerBottomSpace3d: 0,
        cornerBottomDepth3d: 0,
        cornerTopWidth3d: 0,
        cornerTopHeight3d: 0,
        cornerTopDepth3d: 0,
        cornerFullWidth3d: 0,
        cornerFullDepth3d: 0,
    },
    worldItemsDimensions: {
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
    }
}

export function initTextures(defaultTextures){
    state.defaultTextures = {...defaultTextures};
    for (const [key, value] of Object.entries(defaultTextures)) {
        setTextureLoader(key, value.thumbnail);
    }
}

export function renderPriceBlock(regular, discount, currencySymbol) {
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
                                recalculateTotals(productState.priceHtmlContainer, productId, furnitureType, state.defaultTextures, productState.dimensions, state.defaultComponents)  
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
                                const currentModel = roomState?.modelsList[roomState.roomType];

                                const mergedChildren = [...state?.productScenesChildren ?? [], ...currentModel?.scene?.children ?? [], ...roomState?.displayModelChildren ?? []];
             
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
        const hasBrandTexture = childObj.userData?.hasBrandTexture;

        if(type.includes('front') && hasBrandTexture) continue;

        if(!unmodifiableTexture) {
            const childFurnitureType = childObj.userData?.furnitureType ? childObj.userData.furnitureType : childObj.furniture_type;

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
            childMeshGroup.userData.furnitureType = furnitureType;


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

export function get3DItemDimensions(value) {
    const { max_dimension } = productState.dimensions;
    const units = 0.001;
    const modelParentHeight = getRoomHeightDimensions();
    const value3D = (value / (max_dimension)) * modelParentHeight;

    return value3D * units;
}

function getRoomHeightDimensions() {
    const modelContainerHeight = state.model3dContainer.clientHeight;
    const { room_height, max_dimension } = productState.dimensions;

    const modelHeightPercent = room_height * 100 / max_dimension;
    const modelHeightPx = modelContainerHeight * modelHeightPercent / 100;

    return modelHeightPx;
}

export function getTopFurnitureYPositionMm(defaultTop = null) {
    const { bottom, top } = roomState.furnitureDimensions;

    const currentTop = defaultTop ?? top.space_bottom;
    const yMm = bottom.height / 10 + currentTop / 10;

    return yMm;
}

export function getTopFurnitureYPositionIn3dRoom(defaultTop = null, roomModelBox = null) {
    if(!roomModelBox) {
        const modelObj = roomState.modelsList[roomState.roomType];
        roomModelBox = modelObj.box;
    }
    const scale = roomState.baseScale;

    const yMm = getTopFurnitureYPositionMm(defaultTop);

    const { bottom, top } = roomState.furnitureDimensions;

    const yPx = (roomModelBox.min.y) + (yMm * scale);

    return yPx;
}


export function generateSmartUVs(geometry) {
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

export function getContainerBaseScale(model3dContainer) {
    const { width_max, height_max, depth_max } = roomState.roomDimensions;
    const modelContainerWidth = model3dContainer.clientWidth;
    const modelContainerHeight = model3dContainer.clientHeight;

    const scaleX = modelContainerWidth / width_max;
    const scaleY = modelContainerHeight / height_max;

    const baseScale = Math.min(scaleX, scaleY);

    return baseScale;
}

export function getRoomDimensions() {
    const { width, height, depth } = roomState.roomDimensions;
    const scale = roomState.baseScale;

    const heightPx = height * scale;
    const widthPx = width * scale;
    const depthPx = depth * scale;

    roomState.modelRoomDimensions = {
        width: widthPx,
        height: heightPx,
        depth: depthPx,
    }
    roomState.modelRoomScale = {
        x: scale,
        y: scale,
        z: scale,
    }

    return {
        heightPx: heightPx,
        widthPx: widthPx,
        depthPx: depthPx,
        scaleX: scale,
        scaleY: scale,
        scaleZ: scale
    };
}


export function getTextureSrc(furnitureType, textureName, texturesObj) {

    let texture = null;

    if(COUNTER_TEXTURES.includes(textureName)) {
        if(furnitureType == FURNITURE_TYPE_BOTTOM) {
            texture = texturesObj[`countertop_${furnitureType}`] ? texturesObj[`countertop_${furnitureType}`] : texturesObj[`countertop_${TEXTURE_ALL_SLUG}`];
        } else {
            texture = texturesObj[`front_${furnitureType}`] ? texturesObj[`front_${furnitureType}`] : texturesObj[`front_${TEXTURE_ALL_SLUG}`];
        }
    } else if(BASE_TEXTURES.includes(textureName)) {
        texture = texturesObj[`base_${furnitureType}`] ? texturesObj[`base_${furnitureType}`] : texturesObj[`base_${TEXTURE_ALL_SLUG}`];
    } else if(FRONT_TEXTURES.includes(textureName)) {
        texture = texturesObj[`front_${furnitureType}`] ? texturesObj[`front_${furnitureType}`] : texturesObj[`front_${TEXTURE_ALL_SLUG}`];
    } 

    return texture;
}

export function getAIColors(brandMeshName, currentName) {
    let color = null;
    const whiteColor = '#ffffff';

    if(currentName === 'mesh_0002') {
        color = whiteColor;
    } else if(currentName === brandMeshName) {
        color = typeof standImageData !== "undefined" 
            && standImageData.baseColor ? 
                standImageData.baseColor : 
                whiteColor;
    }

    return color;
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

export function initFurnitureConfigComponents(container) {
    container.classList.add('loading');
    container.classList.remove('settings-preview-container');
    container.classList.remove('loading');

    const loadMoreButton = container.querySelector('.config-loader-container');
    const loading = container.querySelector('.load-more-btn-container');
    if(loading) {
        loading.remove();
    }
    if(loadMoreButton) {
        loadMoreButton.remove();
    }
}


export async function recalculateTotals(
    htmlContainer,
    productId, 
    furnitureType,
    textures,
    dimensions,
    components,
) {
    const messageDiv = document.querySelector('.price-container #totals-message');
    if (messageDiv) {
        messageDiv.innerHTML = '';
    }

    htmlContainer.innerHTML = '<div class="loader"></div>';

    try {
        let formData = new FormData();
        formData.append("action", "product_ajax_calculate_totals");
        formData.append("product_id", productId);
        formData.append("furniture_type", furnitureType);
        formData.append("textures", JSON.stringify(textures));
        formData.append("dimensions", JSON.stringify(dimensions));
        formData.append("components", JSON.stringify(components));
  
        const response = await fetch(configData.ajaxurl, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            return null;
        }

        const jsonData = await response.json();
        const data = jsonData.data;

        if (!jsonData.success || !data.totals) {
            const errorMessage = jsonData.data?.message || "Failed to calculate totals.";
   
            if (messageDiv) {
                messageDiv.innerHTML = `<span style="color:red;">${errorMessage}</span>`;
            }

            return null;
        }

        htmlContainer.innerHTML = data.totals;
        return data.totals;
    
    } catch (e) {
        const errorMessage = "Failed to calculate totals.";
        htmlContainer.innerHTML = '-';
   
        if (messageDiv) {
            messageDiv.innerHTML = `<span style="color:red;">${errorMessage}</span>`;
        }

        return null;
    }
}

export async function calculateAllTotals(
    htmlContainer,
    products, 
    textures,
    dimensions,
    components,
) {
    const messageDiv = document.querySelector('.price-container #totals-message');
    if (messageDiv) {
        messageDiv.innerHTML = '';
    }

    htmlContainer.innerHTML = '<div class="loader"></div>';

    try {
        let formData = new FormData();
        formData.append("action", "ajax_config_calculate_totals");
        formData.append("products", JSON.stringify(products));
        formData.append("textures", JSON.stringify(textures));
        formData.append("dimensions", JSON.stringify(dimensions));
        formData.append("components", JSON.stringify(components));
  
        const response = await fetch(configData.ajaxurl, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            return null;
        }

        const jsonData = await response.json();
        const data = jsonData.data;

        if (!jsonData.success || !data.totals) {
            const errorMessage = jsonData.data?.message || "Failed to calculate totals.";
   
            if (messageDiv) {
                messageDiv.innerHTML = `<span style="color:red;">${errorMessage}</span>`;
            }

            return null;
        }

        htmlContainer.innerHTML = data.totals;
        return data;
    
    } catch (e) {
        const errorMessage = "Failed to calculate totals.";
        htmlContainer.innerHTML = '-';
   
        if (messageDiv) {
            messageDiv.innerHTML = `<span style="color:red;">${errorMessage}</span>`;
        }

        return null;
    }
}


export function getCookie(name) {
  const match = document.cookie.match(
    new RegExp('(?:^|; )' + name + '=([^;]*)')
  );
  return match ? decodeURIComponent(match[1]) : undefined;
}

function setTextureCookie(cookieName, mergedSlug, textureId, expires = 45) {
    let parsed = {};

    try {
        const oldCookie = getCookie(cookieName);
        parsed = oldCookie ? JSON.parse(oldCookie) : {};
    } catch (e) {
        parsed = {};
    }

    parsed[mergedSlug] = { id: Number(textureId) };

    const json = JSON.stringify(parsed);
    document.cookie =
        `${cookieName}=${encodeURIComponent(json)}; expires=${expires}; path=/`;
}

function setComponentsCookie(components, cookieName, days = 45) {
    deleteCookies(`${cookieName}_`);
    const json = JSON.stringify(components);
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${cookieName}=${encodeURIComponent(json)}; expires=${expires}; path=/`;
}

export function deleteCookies(name) {
    document.cookie.split(";").forEach(function (cookie) {
        let cookieName = cookie.split("=")[0].trim();
        if (cookieName.indexOf(`${name}`) === 0) {
            document.cookie = cookieName + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        }
    });
}

async function changeTextureImagesDisplayAjax(textureId) {
    try {
        let formData = new FormData();
        formData.append("action", "render_settings_images");
        formData.append("texture_id", textureId);

        const response = await fetch(configDataCategory.ajaxurl, {
            method: "POST",
            body: formData,
        });

        const jsonData = await response.json();

        if(!jsonData.success || !jsonData.data?.images) return null;
        const data = jsonData.data;
        return data;
    } catch(e) {
        return '';
    }
}

export function changeInputFromRangeValue(container) {
    const dimentionsItemContainers = container.querySelectorAll('.dimension-container');
    dimentionsItemContainers.forEach(dimensionContainer => {
        changeSingleDimensionValue(dimensionContainer);
    });

    function changeSingleDimensionValue(dimentionContainer) {
        const rangeInput = dimentionContainer.querySelector('.slider-container input[type="range"]');
        const rangeNumInput = dimentionContainer.querySelector('.input-container input[type="number"]');

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
            rangeInput.dispatchEvent(new Event('change', { bubbles: true }));
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

export function uniqLong() {
    return Date.now() * 1000 + Math.floor(Math.random() * 1000);
}

export function mmToWorld(mm, roomPx, roomMm) {
    const mmToPx = roomPx / roomMm;

    return mm * mmToPx;
}

export function getFurnitureDimensionsFromMmtoPx(itemWidth, itemHeight, itemDepth) {
    const scale = roomState.baseScale;
    
    return {
        modelWidth: itemWidth / 10 * scale,
        modelHeight: itemHeight / 10 * scale,
        modelDepth: itemDepth / 10 * scale,
    }
}

export function getItemRationInARoom(numberMm) {
    const scale = roomState.baseScale;

    const numberScaled = numberMm / 10 * scale;

    return numberScaled;
}

export function get3DItemDimensionWidth(itemWidth) {
    const widthWorld = (itemWidth / (roomState.roomDimensions.width * 10)) * roomState.modelRoomDimensions.width;

    return widthWorld;
}

export function getItemSpaceBottomPx(spaceBottom, furnitureType) {
    const scale = roomState.baseScale;

    let bottom = 0;
    if(furnitureType === FURNITURE_TYPE_TOP) {
        const bottomHeight = roomState?.furnitureDimensions?.bottom?.height ?? 10;
        bottom = (spaceBottom / 10 + bottomHeight / 10) * scale;
    } else {
        bottom = 0;
    }

    return bottom;
}

export function calculateTopSpaceIn3dModel(furnitureType, spaceBottom, roomModelBox = null) {

    if (!furnitureType.includes(DIMENSION_TYPE_TOP)) {
        return 0;
    }

    if(!roomModelBox) {
        const modelObj = roomState.modelsList[roomState.roomType];
        roomModelBox = modelObj.box;
    }

    const bottomSpacePx = getItemSpaceBottomPx(spaceBottom, furnitureType);
    const bottom = (roomModelBox.min.y) + bottomSpacePx + FLOOR_THICKNESS;
    return bottom;
}

export function getFreshWrapperBoundingBox(wrapper) {
    wrapper.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(wrapper);

    wrapper.userData.boundingBox = box;

    return box;
}

export function getCurrentModelAllProducts() {
    return roomState.postId ? 
        roomState.modelsList[roomState.roomType].allProducts: 
        roomState.modelsList[ROOM_TYPE_SINGLE_WALL].allProducts;
}

export function getFurnitureHeightDepthMm(type, furnitureDimensions) {
    let itemHeight = 0;
    let itemMinHeight = 0;
    let itemMaxHeight = 0;
    let itemDepth = 0;
    let itemMinDepth = 0;
    let itemMaxDepth = 0;

    switch(type) {
        case DIMENSION_TYPE_BOTTOM: {
            itemHeight = furnitureDimensions.bottom_height;
            itemMinHeight = furnitureDimensions.bottom_height_min;
            itemMaxHeight = furnitureDimensions.bottom_height_max;
            itemDepth = furnitureDimensions.bottom_depth;
            itemMinDepth = furnitureDimensions.bottom_depth_min;
            itemMaxDepth = furnitureDimensions.bottom_depth_max;
            
            break;
        }
        case DIMENSION_TYPE_BOTTOM_CORNER: {
            itemHeight = furnitureDimensions.bottom_height;
            itemMinHeight = furnitureDimensions.bottom_height_min;
            itemMaxHeight = furnitureDimensions.bottom_height_max;
            itemDepth = furnitureDimensions.bottom_depth;
            itemMinDepth = furnitureDimensions.bottom_depth_min;
            itemMaxDepth = furnitureDimensions.bottom_depth_max;

            break;
        }
        case DIMENSION_TYPE_TOP: {
            itemHeight = furnitureDimensions.top_height;
            itemMinHeight = furnitureDimensions.top_height_min;
            itemMaxHeight = furnitureDimensions.top_height_max;
            itemDepth = furnitureDimensions.top_depth;
            itemMinDepth = furnitureDimensions.top_depth_min;
            itemMaxDepth = furnitureDimensions.top_depth_max;

            break;
        }
        case DIMENSION_TYPE_TOP_CORNER: {
            itemHeight = furnitureDimensions.top_height;
            itemMinHeight = furnitureDimensions.top_height_min;
            itemMaxHeight = furnitureDimensions.top_height_max;
            itemDepth = furnitureDimensions.top_depth;
            itemMinDepth = furnitureDimensions.top_depth_min;
            itemMaxDepth = furnitureDimensions.top_depth_max;

            break;
        }
        case DIMENSION_TYPE_FULL: {
            itemHeight = furnitureDimensions.full_height;
            itemMinHeight = furnitureDimensions.full_height_min;
            itemMaxHeight = furnitureDimensions.full_height_max;
            itemDepth = furnitureDimensions.full_depth;
            itemMinDepth = furnitureDimensions.full_depth_min;
            itemMaxDepth = furnitureDimensions.full_depth_max;

            break;
        }
        case DIMENSION_TYPE_FULL_CORNER: {
            itemHeight = furnitureDimensions.full_height;
            itemMinHeight = furnitureDimensions.full_height_min;
            itemMaxHeight = furnitureDimensions.full_height_max;
            itemDepth = furnitureDimensions.full_depth;
            itemMinDepth = furnitureDimensions.full_depth_min;
            itemMaxDepth = furnitureDimensions.full_depth_max;
            
            break;
        }
        default: {
            itemHeight = furnitureDimensions.bottom_height;
            itemMinHeight = furnitureDimensions.bottom_height_min;
            itemMaxHeight = furnitureDimensions.bottom_height_max;
            itemDepth = furnitureDimensions.bottom_depth;
            itemMinDepth = furnitureDimensions.bottom_depth_min;
            itemMaxDepth = furnitureDimensions.bottom_depth_max;
        }
    }

    return {
        itemHeight,
        itemMinHeight,
        itemMaxHeight,
        itemDepth,
        itemMinDepth,
        itemMaxDepth
    }
}

export async function addBgImageToFront(wrapper, modelScene, attachmentUrl, thumbType) {
	const loader = new THREE.TextureLoader();
    const thumbnail = `${state.uploadsUrl}${attachmentUrl}`

    if(!thumbnail) return;

	loader.load(thumbnail, (texture) => {

		texture.colorSpace = THREE.SRGBColorSpace;

		const material = new THREE.MeshBasicMaterial({
			map: texture,
			transparent: true,
			depthTest: true,
			depthWrite: false
		});

		const plane = new THREE.Mesh(
			new THREE.PlaneGeometry(1, 1), // TEMP size (will scale later)
			material
		);

        plane.userData.parentWrapper = wrapper;

        if(thumbType === FURNITURE_TYPE_WALL) {
            plane.userData.yTop = POSITION_TOP;
        } 

		// 🔥 store reference for updates
		wrapper.userData.bgPlane = plane;
        roomState.bgPlanes.push(plane);

		// IMPORTANT: add to SCENE, not wrapper
		modelScene.add(plane);

		// first update
		updateBgPlane(wrapper);
	});
} 

async function urlExists(url) {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok;
  } catch (e) {
    return false;
  }
}

async function loadOptimizedTexture(src) {
    if (!src || typeof src !== "string") return null;

    return new Promise((resolve, reject) => {
        const texture = new THREE.TextureLoader().load(
            `${state.uploadsUrl}${src}`,
            () => {
                texture.flipY = false;
                texture.colorSpace = THREE.SRGBColorSpace;
                texture.needsUpdate = true;

                resolve(texture);
            },
            undefined,
            reject
        );
    });
}

function applyMapToMaterial(material, map) {
    const newMat = material.clone();

    if (newMat.map && newMat.map !== map) {
        newMat.map.dispose();
    }

    newMat.map = map;
    newMat.color.set(0xffffff);
    newMat.needsUpdate = true;

    return newMat;
}

export async function renderMeshList(
    childMeshGroup,
    furnitureType,
    thumbType,
    hasBrandTexture,
) {
    const childMeshList = [];

    let brandMap = null;
    let brandColor = null;

    if (hasBrandTexture) {
        const brandImageUrl = roomState.aiTextures?.brand?.attachment?.url;

        brandColor =
            roomState.aiTextures?.brand?.color ||
            DEFAULT_BRAND_TEXTURE;

        if (brandImageUrl) {
            brandMap = await loadOptimizedTexture(brandImageUrl);
        }
    }

    childMeshGroup.traverse(node => {
        if (!node.isMesh) return;

        const name = (node.name || "").toLowerCase();
        let geo = node.geometry;

        if (geo && geo.attributes.position && !geo.attributes.normal) {
            geo = BufferGeometryUtils.mergeVertices(geo) || geo;
            geo.computeVertexNormals();
            node.geometry = geo;
        }

        if (!node.geometry.attributes.uv) {
            generateSmartUVs(node.geometry);
        }

        if(!thumbType) {
            if (hasBrandTexture && FRONT_TEXTURES.includes(name)) {
                if (brandMap) {
                    node.material = Array.isArray(node.material)
                        ? node.material.map(mat => applyMapToMaterial(mat, brandMap))
                        : applyMapToMaterial(node.material, brandMap);
                } else if (brandColor) {
                    node.material = Array.isArray(node.material)
                        ? node.material.map(mat => {
                            const newMat = mat.clone();
                            newMat.map = null;
                            newMat.color.set(brandColor);
                            newMat.needsUpdate = true;
                            return newMat;
                        })
                        : node.material.clone();

                    if (!Array.isArray(node.material)) {
                        node.material.map = null;
                        node.material.color.set(brandColor);
                        node.material.needsUpdate = true;
                    }
                }
            } else {
                const texture = getTextureSrc(furnitureType, name, state.textures3DSrc);

                node.material = new THREE.MeshStandardMaterial({
                    map: texture,
                    metalness: 0.1,
                    roughness: 0.8,
                    side: THREE.DoubleSide,
                });
            }
        }

        

        const materials = Array.isArray(node.material)
            ? node.material
            : [node.material];

        materials.forEach(mat => {
            if (!mat) return;
            mat.side = THREE.DoubleSide;
            mat.needsUpdate = true;
        });

        node.castShadow = true;
        node.receiveShadow = true;
        node.frustumCulled = false;

        node.userData.originalMaterial = materials.map(mat => ({
            color: mat?.color ? mat.color.clone() : null,
            emissive: mat?.emissive ? mat.emissive.clone() : null,
            emissiveIntensity: mat?.emissiveIntensity ?? 0,
            opacity: mat?.opacity ?? 1,
            transparent: mat?.transparent ?? false,
            depthWrite: mat?.depthWrite ?? true,
            depthTest: mat?.depthTest ?? true,
        }));

        childMeshList.push(node);
    });

    return childMeshList;
}

export function colorToDefault(obj) {
    obj.traverse(child => {
        if (!child.isMesh || !child.material || !child.userData.originalMaterial) return;

        const materials = Array.isArray(child.material)
            ? child.material
            : [child.material];

        const originals = Array.isArray(child.userData.originalMaterial)
            ? child.userData.originalMaterial
            : [child.userData.originalMaterial];

        materials.forEach((mat, index) => {
            const original = originals[index] || originals[0];
            if (!original) return;

            if (mat.color && original.color) {
                mat.color.copy(original.color);
            }

            if (mat.emissive && original.emissive) {
                mat.emissive.copy(original.emissive);
                mat.emissiveIntensity = original.emissiveIntensity ?? 0;
            }

            mat.opacity = original.opacity ?? 1;
            mat.transparent = original.transparent ?? false;
            mat.depthWrite = original.depthWrite ?? true;
            mat.depthTest = original.depthTest ?? true;

            if (original.alphaTest !== undefined) {
                mat.alphaTest = original.alphaTest;
            }

            if (original.blending !== undefined) {
                mat.blending = original.blending;
            }

            mat.needsUpdate = true;
        });
    });
}

export function colorToRed(obj) {
    obj.traverse(child => {
        if (!child.isMesh || !child.material) return;

        const materials = Array.isArray(child.material)
            ? child.material
            : [child.material];

        materials.forEach(mat => {
            if (mat.color) {
                mat.color.set(0xff0000);
            }

            // makes red visible even if texture/map hides color
            if (mat.emissive) {
                mat.emissive.set(0xff0000);
                mat.emissiveIntensity = 0.5;
            }

            mat.transparent = true;
            mat.opacity = 0.5;
            mat.depthWrite = false;

            mat.needsUpdate = true;
        });
    });
}

export function setBgPlanesVisibleForWrapper(wrapper, visible) {
	if(wrapper.userData.thumbType === THUMB_TYPE_SLOGAN) {
		return;
	}
	
    roomState.bgPlanes.forEach(plane => {
        if (plane.userData.parentWrapper === wrapper) {
            plane.visible = visible;
        }
    });
}

export function updateBgPlane(wrapper) {
    const userData = wrapper.userData;
    const plane = userData.bgPlane;

    if (!plane) return;

    const Y_FRAME = 0;
    const X_FRAME = 0;
    const Y_FRAME_WALL = 40;
    let frameOffsetWorldY = 0;
    let frameOffsetWorldX = 0;

    wrapper.updateMatrixWorld(true);

    const texture = plane.material.map;
    if (!texture?.image) return;

    const aspect = texture.image.width / texture.image.height;

    // -------------------------------------------------
    // ROTATION
    // -------------------------------------------------
    const quat = new THREE.Quaternion();
    wrapper.getWorldQuaternion(quat);

    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(quat);

    // -------------------------------------------------
    // SIZE (correct face)
    // -------------------------------------------------
    const box = new THREE.Box3().setFromObject(wrapper);
    const center = box.getCenter(new THREE.Vector3());
    const wrapperOriginalSize = userData.scaledSize;

    const frameWorldX = getItemRationInARoom(X_FRAME);   // left + right
    const frameWorldY = getItemRationInARoom(Y_FRAME);  // top + bottom
    const innerWidth  = wrapperOriginalSize.x - frameWorldX * 2;
    const innerHeight = wrapperOriginalSize.y - frameWorldY * 2;

    let depth = wrapperOriginalSize.z;
    const maxWidth  = wrapperOriginalSize.x - frameWorldX * 2;
    const maxHeight = wrapperOriginalSize.y - frameWorldY * 2;

    let width = maxWidth;
    let height = width / aspect;

    if (height > maxHeight) {
    height = maxHeight;
    width = height * aspect;
    }

    width  -= frameOffsetWorldX * 2;
    height -= frameOffsetWorldY * 2;
    /*********** */

    height -= frameOffsetWorldY * 2;
    width -= frameOffsetWorldX * 2;

    plane.scale.set(width, height, 1);

    // -------------------------------------------------
    // OFFSET (based on correct depth)
    // -------------------------------------------------
    const offset = depth / 2 + 0.5;

    // -------------------------------------------------
    // POSITION
    // -------------------------------------------------
    plane.position.copy(center).add(forward.multiplyScalar(offset));

    // -------------------------------------------------
    // ROTATION
    // -------------------------------------------------
    copyParentYRotationSimple();

    function copyParentYRotationSimple() {
        const rotationY = wrapper.rotation.y;
        // -------------------------------------------------
        // WORLD BASIS (KEY FIX)
        // -------------------------------------------------
        const worldQuat = new THREE.Quaternion();
        wrapper.getWorldQuaternion(worldQuat);

        const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(worldQuat);
        const right   = new THREE.Vector3(1, 0, 0).applyQuaternion(worldQuat);
        const up      = new THREE.Vector3(0, 1, 0).applyQuaternion(worldQuat);

        // -------------------------------------------------
        // CENTER BASE (KEEP THIS)
        // -------------------------------------------------
        const position = center.clone();

        // -------------------------------------------------
        // SIMPLE FRONT OFFSET (REPLACES ALL SWITCH CASES)
        // -------------------------------------------------
        const offset = depth / 2 + 0.5;
        position.add(forward.multiplyScalar(offset));

        if (userData.furnitureType === FURNITURE_TYPE_WALL) {
            const planeSize = new THREE.Vector3();
            plane.getWorldScale(planeSize);
            const planeHalfHeight = (planeSize.y || plane.scale.y) / 2;
            const topOffset = wrapperOriginalSize.y / 2 - planeHalfHeight;
            position.add(up.clone().multiplyScalar(topOffset));
        }

        // -------------------------------------------------
        // APPLY POSITION
        // -------------------------------------------------
        plane.position.copy(position);

        // -------------------------------------------------
        // ROTATION (FIXED)
        // -------------------------------------------------
        plane.quaternion.copy(worldQuat);
    }

    function copyParentYRotationTilt() {

        // -------------------------------------------------
        // WORLD BASIS
        // -------------------------------------------------
        const worldQuat = new THREE.Quaternion();
        wrapper.getWorldQuaternion(worldQuat);

        const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(worldQuat);
        const up      = new THREE.Vector3(0, 1, 0).applyQuaternion(worldQuat);

        // -------------------------------------------------
        // CENTER
        // -------------------------------------------------
        const position = center.clone();

        // -------------------------------------------------
        // TOP PLACEMENT (KEY CHANGE)
        // -------------------------------------------------
        const planeSize = new THREE.Vector3();
        plane.getWorldScale(planeSize);
        const planeHalfHeight = (planeSize.y || plane.scale.y) / 2;

        const topOffset = wrapperOriginalSize.y / 2 - frameOffsetWorldY - planeHalfHeight;
        position.add(up.clone().multiplyScalar(topOffset));

        // -------------------------------------------------
        // SIMPLE FRONT OFFSET (REPLACES ALL SWITCH CASES)
        // -------------------------------------------------
        const offset = depth / 2 * -0.2;
        position.add(forward.multiplyScalar(offset));

        // -------------------------------------------------
        // APPLY POSITION
        // -------------------------------------------------
        plane.position.copy(position);

        // -------------------------------------------------
        // ROTATION (keep aligned to object)
        // -------------------------------------------------
        plane.quaternion.copy(worldQuat);
    }
}

export function getFootprintSize(baseSize, rotationY) {
    // const step = Math.round(rotationY / (Math.PI / 2)) % 2;

    // if (step === 0) {
    if (!getIsRotatedItem(rotationY)) {
        return baseSize.clone(); // x,z unchanged
    }

    return new THREE.Vector3(
        baseSize.z,
        baseSize.y,
        baseSize.x
    );
}

export function getIsRotatedItem(rotationY) {
    const step = Math.round(rotationY / (Math.PI / 2)) % 2;
    return step !== 0;
}

export function getRotatedSize(size, rotation) {
    const sin = Math.abs(Math.sin(rotation));
    const cos = Math.abs(Math.cos(rotation));

    return {
        x: size.x * cos + size.z * sin,
        z: size.x * sin + size.z * cos,
        y: size.y
    };
}

export function calculateRotationInDegrees(radRotation) {
    const radToDeg = THREE.MathUtils.radToDeg;

    // 1. get rotation in degrees
    let deg = radToDeg(radRotation);

    // 2. normalize to 0–360
    deg = (deg % 360 + 360) % 360;

    return deg;

}

function base64ToBlob(base64Data) {
    const parts = base64Data.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);

    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const binary = atob(parts[1] ?? parts[0]);

    const length = binary.length;
    const bytes = new Uint8Array(length);

    for (let i = 0; i < length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    return new Blob([bytes], { type: mime });
}