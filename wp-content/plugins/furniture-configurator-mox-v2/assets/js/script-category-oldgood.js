import * as THREE from './three/three.module.js';
import { OrbitControls } from './three/OrbitControls.js';
import { GLTFLoader } from './three/GLTFLoader.js';
import { FontLoader } from './three/FontLoader.js';
import { DragControls } from './three/DragControls.js';
import { TextGeometry } from './three/TextGeometry.js';
import * as BufferGeometryUtils from './three/BufferGeometryUtils.js';

const TEXTURE_TYPE_FRONT = 'front';
const TEXTURE_ALL_SLUG = 'all';
const TEXTURES_COOKIE_NAME = 'config_textures_data';
const COMPONENTS_COOKIE_NAME = 'config_components_data';
const FURNITURE_TYPE_COOKIE_NAME = 'config_cookie_furniture_types';
const frontNodesGlbIkea = [
    'alex_frame_alex_0',
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
let contactShadow, defaultTextures = {}, textures3DSrc = {}, productScenesChildren = [];
let productsPage = 1;


window.addEventListener('DOMContentLoaded', function() {
    expandSettingsContainer();
    const oldCookie = getCookie(TEXTURES_COOKIE_NAME);
        const parsed = oldCookie ? JSON.parse(oldCookie) : {};
});

window.initFurnitureConfigComponentsComponent =  async function initFurnitureConfigComponentsComponent() {
    const container = document.querySelector('.components-preview-container');
    let {
        content,
        components,
        selected_furniture_types,
        default_textures,
    } = await getFurnitureCategoryComponentsShortcodeContent();

    if(!content) return;
    defaultTextures = {...default_textures};

    container.innerHTML = content;

    expandSettingsContainer();
    toggleAccordions();
    createShadowTexture();
    renderProductThumbnailContainers();

    initComponentsConfigFunctions(container, components, selected_furniture_types);
}

function expandSettingsContainer() {
    const buttons = document.querySelectorAll('.load-more-btn-container button:not(.init)');

    buttons.forEach(button => {
        button.classList.add('init');
        const type = button.getAttribute('data-type');
        const parent = button.closest('.settings-preview-container');

        button.addEventListener('click', function(e) {
            e.preventDefault();
            if(!type) return;

            parent.classList.add('loading');

            switch(type) {
                case 'settings-gallery': {
                    initFurnitureConfigGallery(parent);
                    break;
                }
                case 'settings-components' : {
                    initFurnitureConfigComponents(parent);
                    break;
                }
                default: {
                    initFurnitureConfigGallery(parent);
                }
            }
        });
    });
}

async function initFurnitureConfigGallery(container) {
    if(!container) return;

    let {
        content,
    } = await getFurnitureCategoryGalleryShortcodeContent();

    if(!content) return;

    container.outerHTML = content;
    const newContainer = document.querySelector('.settings-gallery-container');

    await initPartsConfigFunctions(newContainer);

    let intervalI = 0;
    let maxI = 15;
    const swiperInterval = setInterval(initInterval, 500);

    function initInterval() {
        intervalI++;

        const swiperContainer = newContainer.querySelector('.settings-gallery');

        if (swiperContainer) {
            clearInterval(swiperInterval);
            initSwiper(swiperContainer);
            return;
        }

        if (intervalI > maxI) {
            clearInterval(swiperInterval);
        }
    }
}

function initComponentsConfigFunctions(container, components, selectedFurnitureTypes) {
    let selectedFurnitureTypesStr = selectedFurnitureTypes.toString();
    const productsContainerParent = container.querySelector('.products-list');
    const productsContainer = productsContainerParent.querySelector('.products-list-inner');
    const loadMoreContainer = productsContainerParent.querySelector('.load-more-container');
    
    changeFurnitureTypesWithProducts();
    changeComponentsValue();

    function changeFurnitureTypesWithProducts() {
        let productsPage = 1;
        const productsCheckboxes = container.querySelectorAll('.furniture-types-selector input[type="checkbox"]');
    
        productsCheckboxes.forEach(checkbox => {
            const value = checkbox.value;

            const displayImage = container.querySelector(`.furniture-types-images .image-block[data-type_slug="${value}"]`);
            const currentComponent = container.querySelector(`.components-container .config-accordion-item[data-type_slug="${value}"]`);

            checkbox.addEventListener('change', async function(e) {
                productsPage = 1;
                const valueIndex = selectedFurnitureTypes.indexOf(value);
                
                if(valueIndex > -1) {
                    selectedFurnitureTypes.splice(valueIndex, 1);
                    if(displayImage) displayImage.classList.remove('active');
                    if(currentComponent) {
                        currentComponent.classList.add('hidden');
                        if(currentComponent.classList.contains('active')) {
                            currentComponent.classList.remove('active');
                        }
                    }
                    changeTextureSettingsTabsClasses(value);
                } else {
                    selectedFurnitureTypes.push(value);
                    if(displayImage) displayImage.classList.add('active');
                    if(currentComponent) currentComponent.classList.remove('hidden');
                    changeTextureSettingsTabsClasses(value, false);
                }
                selectedFurnitureTypesStr = selectedFurnitureTypes.toString();
                setFurnitureTypeCookie(selectedFurnitureTypesStr);

                await getProductItemsAjax(productsContainerParent, productsContainer, loadMoreContainer, productsPage, selectedFurnitureTypesStr);
                renderProductThumbnailContainers();
                triggerLoadMoreButton();
            });
        });

        function triggerLoadMoreButton() {
            const loadMoreBtn = loadMoreContainer.querySelector('button');

            if(!loadMoreBtn) return;

            loadMoreBtn.addEventListener('click', async function(e) {
                e.preventDefault();
                productsPage++;
                await getProductItemsAjax(productsContainerParent, productsContainer, loadMoreContainer, productsPage, selectedFurnitureTypesStr);
            });
        }

        function changeTextureSettingsTabsClasses(value, needToRemove = true) {
            const activeAllTabs = document.querySelectorAll(`.texture-list-tabs button[data-slug="${TEXTURE_ALL_SLUG}"]`);
            const activeAllDisplayTabsContainers = document.querySelectorAll(`.texture-list-container-inner .texture-multiple-lists-container[data-slug="${TEXTURE_ALL_SLUG}"]`);
            const displayTabs = document.querySelectorAll(`.texture-list-tabs button[data-slug="${value}"]`);
            const displayTabsContainers = document.querySelectorAll(`.texture-list-container-inner .texture-multiple-lists-container[data-slug="${value}"]`);
            
            if(needToRemove) {
                displayTabs.forEach(displayTab => {
                    if(displayTab.classList.contains('active')) {
                        displayTab.classList.remove('active');
                    }
                    
                    displayTab.classList.add('hidden');
                });
                displayTabsContainers.forEach(displayTabsContainer => {
                    if(displayTabsContainer.classList.contains('active')) {
                        displayTabsContainer.classList.remove('active');
                    }
                });
                activeAllTabs.forEach(activeAllTab => {
                    if(!activeAllTab.classList.contains('active')){
                        activeAllTab.classList.add('active');
                    }
                    
                });
                activeAllDisplayTabsContainers.forEach(activeAllDisplayTabsContainer => {
                    if(!activeAllDisplayTabsContainer.classList.contains('active')){
                        activeAllDisplayTabsContainer.classList.add('active');
                    }
                });
            } else {
                displayTabs.forEach(displayTab => {
                    
                    displayTab.classList.remove('hidden');
                });
            }
            
            
        }
    }

    function changeComponentsValue() {
        const multiSelectOptions = container.querySelectorAll('.component-items.multiselect');
        const singleSelectOptions = container.querySelectorAll('.component-items:not(.multiselect)');

        multiSelectOptions.forEach(multi => {
            const options = multi.querySelectorAll('input');

            options.forEach(option => {
                const parent = option.closest('.component-items');
                const parentId = parseInt(parent.getAttribute('data-parent_id'));
                option.addEventListener('change', function(e) {
                    const value = parseInt(e.target.value);

                    const index = components.findIndex(item => item.id == value && item.parent_id == parentId);
                    if(index > -1) {
                        components.splice(index, 1);
                    } else {
                        const obj = {
                            id: value,
                            parent_id: parentId,
                        };
                        components.push(obj);
                    }

                    setComponentsCookie(components);
                });
            });
        });
        
        singleSelectOptions.forEach(single => {
            const options = single.querySelectorAll('input');

            options.forEach(option => {
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
                    };

                    components.push(obj);

                    setComponentsCookie(components);
                });
            });
        });

        function removeOptionByIndex(value, parentId) {
            const index = components.findIndex(item => item.id == value && item.parent_id == parentId);

            if(index > -1) {
                components.splice(index, 1);
            } 
        }
    }

}

function initFurnitureConfigComponents(container) {
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

    async function initPartsConfigFunctions(container) {

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

                            changeTextureClassMethod(subcatContainer, buttonParent);

                            changeTextureContainerHtml(headingContainer, priceContainer, btnName,  regular, discount);
                            
                            textureSubcatMergedSlugs.forEach(mergedSlug => {
                                setTextureCookie(mergedSlug, btnId);
                                defaultTextures[mergedSlug] = btnThumbnail;
                                setTextureLoader(mergedSlug, btnThumbnail);
                                changeModelChildrenTexture(productScenesChildren, mergedSlug, furnitureType);
                            });
    
                            changeTextureSrc(textureSubcatMergedSlugs, btnId)

                            if(furnitureType === TEXTURE_ALL_SLUG) {
                                subcatContainersExceptAll.forEach(otherSub => {
                                    const newActive = otherSub.querySelector(`.list-item[data-id="${btnId}"]`);
                                    changeTextureClassMethod(otherSub, newActive, true);
                                });
                            } else {
                                const activeAll = subcatContainerAll.querySelector('.list-item.active');
                                if(activeAll) activeAll.classList.remove('active');
                            }
                        });
                    });
                });
            });

            function changeTextureClassMethod(textureContainer, buttonParent, d) {
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

function initSwiper(swiperContainer)
{
    const options = {
        slidesPerView: 1,
        navigation: {
            nextEl: '.settings-gallery-container .swiper-button-next',
            prevEl: '.settings-gallery-container .swiper-button-prev',
        },
        pagination: {
            el: '.settings-gallery-container .swiper-pagination',
            clickable: true,
        }
    }

   new Swiper(swiperContainer, options);
}

async function getFurnitureCategoryGalleryShortcodeContent() {
    try {
        let formData = new FormData();
        formData.append("action", "render_config_furniture_gallery");

        const response = await fetch(configDataCategory.ajaxurl, {
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

async function getFurnitureCategoryComponentsShortcodeContent() {
    try {
        let formData = new FormData();
        formData.append("action", "render_config_furniture_components");

        const response = await fetch(configDataCategory.ajaxurl, {
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

async function getProductItemsAjax(containerParent, container, loadMoreContainer, page, selectedFurnitureTypesStr) {
    try {
        containerParent.classList.add('loading');
        let formData = new FormData();
        formData.append("action", "render_config_products");
        formData.append("page", page);
        formData.append("furniture_types", selectedFurnitureTypesStr);

        const response = await fetch(configDataCategory.ajaxurl, {
            method: "POST",
            body: formData,
        });

        const jsonData = await response.json();

        if(!jsonData.success) {
            containerParent.classList.remove('loading');
            return;
        }
        const {content, load_more_content} = jsonData.data;

        loadMoreContainer.innerHTML = '';
        loadMoreContainer.innerHTML = load_more_content;
        if(page == 1) {
            container.innerHTML = content;
        } else {
            container.innerHTML += content;
        }
        containerParent.classList.remove('loading');
    } catch(e) {
        containerParent.classList.remove('loading');
        return;
    }
}

function setTextureCookie(mergedSlug, textureId, expires = 45) {
    let parsed = {};

    try {
        const oldCookie = getCookie(TEXTURES_COOKIE_NAME);
        parsed = oldCookie ? JSON.parse(oldCookie) : {};
    } catch (e) {
        parsed = {};
    }

    parsed[mergedSlug] = { id: Number(textureId) };

    const json = JSON.stringify(parsed);
    document.cookie =
        `${TEXTURES_COOKIE_NAME}=${encodeURIComponent(json)}; expires=${expires}; path=/`;
}


function setComponentsCookie(components, days = 45) {
    deleteCookies(`${COMPONENTS_COOKIE_NAME}_`);
    const json = JSON.stringify(components);
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${COMPONENTS_COOKIE_NAME}=${encodeURIComponent(json)}; expires=${expires}; path=/`;
}

function setFurnitureTypeCookie(furnitureTypesStr, days = 45) {
    deleteCookies(`${FURNITURE_TYPE_COOKIE_NAME}_`);
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${FURNITURE_TYPE_COOKIE_NAME}=${encodeURIComponent(furnitureTypesStr)}; expires=${expires}; path=/`;
}


function deleteCookies(name) {
    document.cookie.split(";").forEach(function (cookie) {
        let cookieName = cookie.split("=")[0].trim();
        if (cookieName.indexOf(`${name}`) === 0) {
            document.cookie = cookieName + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        }
    });
}

function getCookie(name) {
  const match = document.cookie.match(
    new RegExp('(?:^|; )' + name + '=([^;]*)')
  );
  return match ? decodeURIComponent(match[1]) : undefined;
}

function renderProductThumbnailContainers() {

    for (const [key, value] of Object.entries(defaultTextures)) {
        setTextureLoader(key, value);
    }

    const modelsContainers = document.querySelectorAll('.postcard-image-container');

        modelsContainers.forEach(modelContainer => {
        const src = modelContainer.getAttribute('data-glb_src');
        const furnitureType = modelContainer.getAttribute('data-furniture_type');
        const containerHeight = modelContainer.clientHeight;
        const containerWidth = modelContainer.clientWidth;

        if(src) {
            renderModelThumbnails(modelContainer, furnitureType, src, containerHeight, containerWidth);
        }
    });
}

function createShadowTexture() {
    const shadowTexture = new THREE.TextureLoader().load(`${configDataCategory.assetsUrl}/images/contact-shadow.png`);

    contactShadow = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.MeshBasicMaterial({
            map: shadowTexture,
            transparent: true,
            opacity: 0.35,
            depthWrite: false
        })
    );
}

function renderModelThumbnails(container, furnitureType, src, parentHeight, parentWidth) {
    const mmToUnits = 0.001; 
    const zoomOut = 1.87;

    const threeJSRendered = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });

    const modelScene = new THREE.Scene();

    /*******************/
    /**** set camera ******/
    const fovDeg = 45;
    const parentHeightUnits = parentHeight * mmToUnits * zoomOut;
    const parentWidthUnits = parentWidth * mmToUnits;
    const aspect = parentWidth / parentHeight;
    const near = 0.1;
    const far = 10000;

    const threeJSCamera = new THREE.PerspectiveCamera(fovDeg, aspect, near, far);

    // Compute camera distance so objectHeightUnits fits canvas height exactly
    const fovRad = THREE.MathUtils.degToRad(fovDeg);
    const distance = parentHeightUnits / (2 * Math.tan(fovRad / 2));

    threeJSCamera.position.set(0, parentHeightUnits / 2, distance);
    threeJSCamera.lookAt(0, parentHeightUnits / 2.15, 0);
    /**** end set camera ******/

    // Renderer
    threeJSRendered.setSize(parentWidth, parentHeight);
    threeJSRendered.setPixelRatio(window.devicePixelRatio);

    container.appendChild(threeJSRendered.domElement);

    // basic lights
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
    hemiLight.position.set(0, 200, 0);
    modelScene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(100, 100, 200);
    modelScene.add(dirLight);
    // threeJSRendered.setClearColor(0x333333, 1)
    const parentHeightUnitsChild = (parentHeight - 10) * mmToUnits;
    const parentWidthUnitsChild = (parentWidth - 10) * mmToUnits;

    //
    // const light = new THREE.DirectionalLight(0xffffff, 1);
    // light.position.set(5, 10, 5);

    // light.castShadow = true;


    /**** Load Models ****/
    renderThumbnailImage(modelScene, furnitureType, src, parentHeightUnitsChild, parentWidthUnitsChild);


    function animate() {
        requestAnimationFrame(animate);

        threeJSRendered.render(modelScene, threeJSCamera);
    }

    animate();

    window.addEventListener('resize', function() {
        resize3dModel(container, modelScene, threeJSRendered, threeJSCamera);
    }, false);
}

function renderThumbnailImage(parent, furnitureType, src, parentWidth, parentHeight) {
    const loader = new GLTFLoader();

    loader.load(src, function (childGltf) {
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
                const texture = getTextureSrc(furnitureType, name);

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
        childMeshGroup.userData.originalSize = childSize.clone();

        const targetDepth  = Math.min(parentWidth, parentHeight); 
        const scaleX = parentWidth  / childSize.x;
        const scaleY = parentHeight / childSize.y;
        const scaleZ = targetDepth  / childSize.z;
        const uniformScale = Math.min(scaleX, scaleY, scaleZ);
        childMeshGroup.scale.setScalar(uniformScale);

        // recompute scaled size
        const scaledBox = new THREE.Box3().setFromObject(childMeshGroup);
        const scaledSize = new THREE.Vector3();
        scaledBox.getSize(scaledSize);

        childMeshGroup.userData.scaledSize = scaledSize.clone();

        const box = new THREE.Box3().setFromObject(childMeshGroup);
        const center = new THREE.Vector3();
        box.getCenter(center);
        childMeshGroup.position.sub(center);

        childMeshGroup.position.y = scaledSize.y / 1.2;

        childMeshGroup.userData.furniture_type = furnitureType;


        /******** shadows *********/
        const shadow  = contactShadow.clone();

        shadow.material.opacity = 0.35;
        // contactShadowCloned.renderOrder = 0;
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
    /******** end shadows *********/
        childMeshGroup.userData.shadow = shadow;

        productScenesChildren.push(childMeshGroup);
    });
        
}


function setFrameTextureLoader(src) {
    const textureLoader = new THREE.TextureLoader();
    textureFrontSrc = src ? textureLoader.load(src, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(2, 2);
    }) : null;
}

function setTextureLoader(type, src) {
    const textureLoader = new THREE.TextureLoader();
    textures3DSrc[type] = src ? textureLoader.load(src, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(2, 2);
    }) : null;
}

function changeModelChildrenTexture(children, type, furnitureType) {
    const currentTexture = textures3DSrc[type] ?? null;

    if(!currentTexture) return;

    let acceptedTexturesArrays = [];
    let unacceptedTexturesArray = [];

    if (type.includes('countertop')) {
        acceptedTexturesArrays = [...frontNodesGlbIkea, ...frontNodesDisplay];
    } else if (type.includes('front')) {
        unacceptedTexturesArray = [...frontNodesGlbIkea, ...frontNodesDisplay];
    } 

    if(!acceptedTexturesArrays.length && !unacceptedTexturesArray.length) {
        return;
    }

    for(let i = 0; i < children.length; i++) {
        const childObj = children[i];
        const childFurnitureType = childObj.userData.furniture_type;

        if(furnitureType !== TEXTURE_ALL_SLUG && furnitureType !== childFurnitureType) continue;

        childObj.traverse(node => {
            if (node.isMesh && node.material ) {
                const name = (node.name || "").toLowerCase();
                if(acceptedTexturesArrays.length && acceptedTexturesArrays.includes(name)) {
                    node.material.map = currentTexture;
                    node.material.needsUpdate = true;
                } else if(unacceptedTexturesArray.length && !unacceptedTexturesArray.includes(name)) {
                    node.material.map = currentTexture;
                    node.material.needsUpdate = true;
                }
            }
        });
    }
}

function getTextureSrc(furnitureType, textureName) {

    let acceptedTexturesArrays = [...frontNodesGlbIkea, ...frontNodesDisplay];

    let texture = null;
    if(acceptedTexturesArrays.includes(textureName)) {
        texture = textures3DSrc.countertop_all;
    } else {
        // if(furnitureType === 'top') {
        //     texture = textures3DSrc.front_top;
        // } else if (furnitureType === 'bottom'){
        //     texture = textures3DSrc.front_bottom;
        // } else if(furnitureType === 'full') {
        //     texture = textures3DSrc.front_full;
        // } else if(furnitureType === 'bottom-corner') {
        //     texture = textures3DSrc.front_bottom-corner;
        // } else if(furnitureType === 'top-corner') {
        //     texture = textures3DSrc.front_top-corner;
        // } else if(furnitureType ===  'full-corner') {
        //     texture = textures3DSrc.front_full-corner;
        // }
         if(furnitureType.includes('top')) {
            texture = textures3DSrc.front_top;
        } else if (furnitureType.includes('bottom')){
            texture = textures3DSrc.front_bottom;
        } else if(furnitureType.includes('full')) {
            texture = textures3DSrc.front_full;
        }
    }

    return texture;
}

function resize3dModel(model3dContainer, modelScene, threeJSRendered, threeJSCamera) {
    if(!modelScene) return;

    const width = model3dContainer.clientWidth;
    const height = model3dContainer.clientHeight;

    // Update renderer size
    threeJSRendered.setSize(width, height);

    // Update camera aspect ratio
    threeJSCamera.aspect = width / height;
    threeJSCamera.updateProjectionMatrix();
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