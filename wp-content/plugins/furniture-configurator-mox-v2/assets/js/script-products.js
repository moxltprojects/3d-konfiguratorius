import * as THREE from './three/three.module.js';
import { OrbitControls } from './three/OrbitControls.js';
import { GLTFLoader } from './three/GLTFLoader.js';
import { FontLoader } from './three/FontLoader.js';
import { DragControls } from './three/DragControls.js';
import { TextGeometry } from './three/TextGeometry.js';
import * as BufferGeometryUtils from './three/BufferGeometryUtils.js';
import { 
    TEXTURE_TYPE_FRONT,
    TEXTURES_COOKIE_NAME_DEFAULT,
    COMPONENTS_COOKIE_NAME_DEFAULT,
    FURNITURE_TYPE_COOKIE_NAME_DEFAUL,
    TEXTURE_ALL_SLUG,
    frontNodesGlbIkea,
    frontNodesDisplay,
    state,
    categoryState,
    initTextureSettingsConfigFunctions,
    changeComponentsValue,
    setTextureLoader,
    renderThumbnailImage,
    deleteCookies,
    expandSettingsContainer,
    initFurnitureConfigComponents,
} from './shared-scripts.js';

const TEXTURES_COOKIE_NAME = TEXTURES_COOKIE_NAME_DEFAULT;
const COMPONENTS_COOKIE_NAME = COMPONENTS_COOKIE_NAME_DEFAULT;
const FURNITURE_TYPE_COOKIE_NAME = FURNITURE_TYPE_COOKIE_NAME_DEFAUL;

window.initFurnitureProductsComponent =  async function initFurnitureProductsComponent() {
    const container = document.querySelector('.display-type-container');
    let {
        content,
        components,
        default_textures,
        selected_furniture_types,
        products_textures_settings
    } = await getFurnitureCategoryProductsShortcodeContent();

    if(!content) return;
    state.defaultTextures = {...default_textures};

    container.innerHTML = content;

    toggleAccordions();
    // const expandButtons = document.querySelectorAll('.components-container .load-more-btn-container button:not(.init)');
    // expandSettingsContainer(expandButtons, initFurnitureConfigComponents);
    createShadowTexture();
    renderProductThumbnailContainers(products_textures_settings);

    // initFurnitureConfigComponents(container)
    initComponentsConfigFunctions(container, components, selected_furniture_types);
}


function initComponentsConfigFunctions(container, components, selectedFurnitureTypes) {
    state.defaultComponents = [...components];
    let selectedFurnitureTypesStr = selectedFurnitureTypes.toString();
    const productsContainerParent = container.querySelector('.products-list');
    const productsContainer = productsContainerParent.querySelector('.products-list-inner');
    const loadMoreContainer = productsContainerParent.querySelector('.load-more-container');
   
    changeFurnitureTypesWithProducts();
    changeComponentsValue(container, COMPONENTS_COOKIE_NAME);

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
                const defaultTextures = state.defaultTextures;
                
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
                renderProductThumbnailContainers(defaultTextures);
                // renderModel3DContainers(defaultTextures);
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

}

// function initFurnitureConfigComponents(container) {
//     container.classList.add('loading');
//     container.classList.remove('settings-preview-container');
//     container.classList.remove('loading');

//     const loadMoreButton = container.querySelector('.config-loader-container');
//     const loading = container.querySelector('.load-more-btn-container');
//     if(loading) {
//         loading.remove();
//     }
//     if(loadMoreButton) {
//         loadMoreButton.remove();
//     }
// }

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

async function getProductItemsAjax(containerParent, container, loadMoreContainer, page, selectedFurnitureTypesStr) {
    try {
        containerParent.classList.add('loading');
        let formData = new FormData();
        formData.append("action", "render_config_products");
        formData.append("page", page);
        formData.append("furniture_types", selectedFurnitureTypesStr);

        const response = await fetch(configDataProducts.ajaxurl, {
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



function setFurnitureTypeCookie(furnitureTypesStr, days = 45) {
    deleteCookies(`${FURNITURE_TYPE_COOKIE_NAME}_`);
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${FURNITURE_TYPE_COOKIE_NAME}=${encodeURIComponent(furnitureTypesStr)}; expires=${expires}; path=/`;
}

function renderProductThumbnailContainers(productsTexturesSettings) {
    for (const [key, value] of Object.entries(state.defaultTextures)) {
        setTextureLoader(key, value.thumbnail);
    }

    for (const [productId, textures] of Object.entries(productsTexturesSettings)) {
        let obj = {};
        for (const [key, value] of Object.entries(textures)) {
            obj[key] = setProductsTextureLoader(value.thumbnail);
        }
        categoryState.textures3DSrc[productId] = obj;
    }

    const modelsContainers = document.querySelectorAll('.postcard-image-container');

    modelsContainers.forEach(modelContainer => {
        const item = modelContainer.closest('.product-item');
        const productId = item ? item.getAttribute('data-id') : null;
        const unmodifiableTexture = item ? item.getAttribute('data-unmodifiable_texture') : null; 
        const src = modelContainer.getAttribute('data-glb_src');
        const furnitureType = modelContainer.getAttribute('data-furniture_type');
        const containerHeight = modelContainer.clientHeight;
        const containerWidth = modelContainer.clientWidth;

        if(src) {
            renderModelThumbnails(modelContainer, furnitureType, src, containerHeight, containerWidth, productId, unmodifiableTexture);
        }
    });
}

function renderModel3DContainers(productsTexturesSettings) {
 
}

function setProductsTextureLoader(src){
    const textureLoader = new THREE.TextureLoader();

    return src ? textureLoader.load(src, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(2, 2);
    }) : null;
}
// function getProductSpecificTexturesSetting(productId, productsTexturesSettings) {
//     if(!productsTexturesSettings[productId]) {
//         return null;
//     }

//     const textures = productsTexturesSettings[productId];

// }

function createShadowTexture() {
    const shadowTexture = new THREE.TextureLoader().load(`${configDataProducts.assetsUrl}/images/contact-shadow.png`);

    state.contactShadow = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.MeshBasicMaterial({
            map: shadowTexture,
            transparent: true,
            opacity: 0.35,
            depthWrite: false
        })
    );
}

function renderModelThumbnails(container, furnitureType, src, parentHeight, parentWidth, productId, unmodifiableTexture) {
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
    renderThumbnailImage(modelScene, furnitureType, src, parentHeightUnitsChild, parentWidthUnitsChild, productId, true, unmodifiableTexture);


    function animate() {
        requestAnimationFrame(animate);

        threeJSRendered.render(modelScene, threeJSCamera);
    }

    animate();

    window.addEventListener('resize', function() {
        resize3dModel(container, modelScene, threeJSRendered, threeJSCamera);
    }, false);
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

async function getFurnitureCategoryProductsShortcodeContent() {
    try {
        let formData = new FormData();
        formData.append("action", "render_config_furniture_products");

        const response = await fetch(configDataProducts.ajaxurl, {
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