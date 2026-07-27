// const TEXTURE_TYPE_BASE = 'base';
// const TEXTURE_TYPE_BASE_BRIM = 'frame-brim';
// const TEXTURE_TYPE_FRAME = 'frame';
// const TEXTURE_TYPE_FRAME_BRIM = 'front-brim';
// const TEXTURES_COOKIE_NAME = 'texture_data';
// const COMPONENTS_COOKIE_NAME = 'components_data';
// const PRODUCT_COMPONENTS_COOKIE_NAME = 'product_components_data';

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
    productState,
    initTextureSettingsConfigFunctions,
    renderThumbnailImage,
    setTextureLoader,
    changeComponentsValue,
    get3DItemDimensions,
    recalculateTotals,
    changeInputFromRangeValue,
    // getCookie,
} from './shared-scripts.js';

const productId = configDataProduct.productId;
const furnitureType = configDataProduct.furnitureType;
const TEXTURES_COOKIE_NAME  = `${TEXTURES_COOKIE_NAME_DEFAULT}_${productId}`;
const COMPONENTS_COOKIE_NAME = `${COMPONENTS_COOKIE_NAME_DEFAULT}_${productId}`;
const FURNITURE_TYPE_COOKIE_NAME = `${FURNITURE_TYPE_COOKIE_NAME_DEFAUL}_${productId}`;

let modelScene, threeJSRendered, threeJSCamera, threeJSControls;

window.initFurnitureProductPartsConfigV2 =  async function initFurnitureProductPartsConfigV2() {
    const container = document.querySelector('.config-furniture-product-general-settings-shortcode');
    let {
        content,
        data,
        dimensions,
        components,
        textures,
    } = await getFurnitureProductPartsShortcodeContentV2(productId, furnitureType);

    if(!content) return;

    container.innerHTML = content;

    await initPartsConfigFunctions(productId, container, data, dimensions, components, textures);
}

async function initPartsConfigFunctions(productId, container, data, defaultDimensions, defaultComponents, defaultTextures) {
    toggleAccordions();
    initAddToCart();

    productState.priceHtmlContainer = container.querySelector('.buy-container .price-container .price-data');
    state.model3dContainer = container.querySelector('.product-3d-container .product-thumbnail');

    productState.dimensions = {...defaultDimensions};
    state.defaultTextures = {...defaultTextures}
    state.defaultComponents = [...defaultComponents]
       
    for (const [key, value] of Object.entries(defaultTextures)) {
        setTextureLoader(key, value.thumbnail);
    }

    initTextureSettingsConfigFunctions(container, TEXTURES_COOKIE_NAME, productId);
    changeComponentsValue(container, COMPONENTS_COOKIE_NAME, productId);
    changeDimensionsValue();
    changeInputFromRangeValue(container);
    window.addEventListener('resize', resize3dModel, false);
    
    const { glb_src, base_total } = data;    
    
    renderProductThumbnailContainer();

    function renderProductThumbnailContainer() {
        if(!glb_src) return;

        const containerHeight = state.model3dContainer.clientHeight;
        const containerWidth = state.model3dContainer.clientWidth;

        renderModelThumbnails(glb_src, containerHeight, containerWidth);
    }

    function renderModelThumbnails(src, parentHeight, parentWidth) {
        const mmToUnits = 0.001; 
        const zoomOut = 1.87;
        
        threeJSRendered = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
        modelScene = new THREE.Scene();

        /*******************/
        /**** set camera ******/
        const fovDeg = 45;
        const parentHeightUnits = parentHeight * mmToUnits * zoomOut;
        const parentWidthUnits = parentWidth * mmToUnits * zoomOut;
        const aspect = parentWidth / parentHeight;
        const near = 0.1;
        const far = 10000;

        threeJSCamera = new THREE.PerspectiveCamera(fovDeg, aspect, near, far);
        threeJSControls = new OrbitControls(threeJSCamera, threeJSRendered.domElement);

        // Compute camera distance so objectHeightUnits fits canvas height exactly
        const fovRad = THREE.MathUtils.degToRad(fovDeg);
        const distance = parentHeightUnits / (2 * Math.tan(fovRad / 2));

        threeJSCamera.position.set(0, parentHeightUnits / 2, distance);
        threeJSCamera.lookAt(0, parentHeightUnits / 2.15, 0);
        /**** end set camera ******/

        // Renderer
        threeJSRendered.setSize(parentWidth, parentHeight);
        threeJSRendered.setPixelRatio(window.devicePixelRatio);
        state.model3dContainer.appendChild(threeJSRendered.domElement);

        // basic lights
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
        hemiLight.position.set(0, 200, 0);
        modelScene.add(hemiLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(100, 100, 200);
        modelScene.add(dirLight);
        // threeJSRendered.setClearColor(0x333333, 1)
        // const parentHeightUnitsChild = (parentHeight - 50) * mmToUnits;
        // const parentWidthUnitsChild = (parentWidth - 50) * mmToUnits;
        /**** Load Models ****/
        renderThumbnailImage(modelScene, furnitureType, src, null, null, productId);

        function animate() {
            requestAnimationFrame(animate);
            threeJSControls.update();
            threeJSRendered.render(modelScene, threeJSCamera);
        }

        animate();
    }

    function resize3dModel() {
        if(!modelScene) return;

        const width = state.model3dContainer.clientWidth;
        const height = state.model3dContainer.clientHeight;

        // Update renderer size
        threeJSRendered.setSize(width, height);

        // Update camera aspect ratio
        threeJSCamera.aspect = width / height;
        threeJSCamera.updateProjectionMatrix();
    }

    function changeDimensionsValue() {
        const dimentionsItemContainers = container.querySelectorAll('.dimension-container:not(.room-layout .dimension-container):not(.edit-container .dimension-container)');
        dimentionsItemContainers.forEach(dimensionContainer => {
            changeSingleDimensionValue(dimensionContainer);
        });

        function changeSingleDimensionValue(dimentionContainer) {
            const dimensionType = dimentionContainer.getAttribute('data-dimension_type');
            const rangeInput = dimentionContainer.querySelector('.slider-container input[type="range"]');
            const rangeNumInput = dimentionContainer.querySelector('.input-container input[type="number"]');

            rangeInput.addEventListener('change', function(e) {
                const value = parseInt(e.target.value);
                rangeNumInput.value = value;
                
                productState.dimensions[dimensionType] = value;

                changeModelDimensions(dimensionType, value);

                recalculateTotals(productState.priceHtmlContainer, productId, furnitureType, state.defaultTextures, productState.dimensions, state.defaultComponents);
            });
        }
    }

    function changeModelDimensions(type, value) {
        let data = 'x';

        switch(type) {
            case 'height': {
                data = 'y';
                break;
            }
            case 'depth': {
                data = 'z';
                break;
            }
            default: {
                break;
            }
        }

        const valueUnit = get3DItemDimensions(value);
        const model3dObject = state.productScenesChildren[0] ?? null;

        const originalSize = model3dObject.userData.originalSize;
        const scale = parseFloat(valueUnit) / Math.abs(originalSize[data]);
        model3dObject.scale[data] = scale;
    }

    // function getRoomHeightDimensions() {
    //     const modelContainerHeight = model3dContainer.clientHeight;

    //     const modelHeightPercent = room_height * 100 / max_dimension;
    //     const modelHeightPx = modelContainerHeight * modelHeightPercent / 100;

    //     return modelHeightPx;
    // }

    // function get3DItemDimensions(value) {
    //     const units = 0.001;
    //     const modelParentHeight = getRoomHeightDimensions();
    //     const value3D = (value / (max_dimension)) * modelParentHeight;

    //     return value3D * units;
    // }

    // function generateSmartUVs(geometry) {
    //     geometry.computeBoundingBox();
    //     const box = geometry.boundingBox;
    //     const size = new THREE.Vector3();
    //     box.getSize(size);

    //     // Pick dominant axis pair (largest 2D area)
    //     const areaXY = size.x * size.y;
    //     const areaYZ = size.y * size.z;
    //     const areaXZ = size.x * size.z;

    //     let proj = "XZ"; // default
    //     if (areaXY >= areaYZ && areaXY >= areaXZ) proj = "XY";
    //     else if (areaYZ >= areaXY && areaYZ >= areaXZ) proj = "YZ";

    //     const posAttr = geometry.attributes.position;
    //     const uvAttr = new Float32Array(posAttr.count * 2);

    //     for (let i = 0; i < posAttr.count; i++) {
    //         const x = posAttr.getX(i);
    //         const y = posAttr.getY(i);
    //         const z = posAttr.getZ(i);

    //         let u = 0, v = 0;
    //         if (proj === "XY") {
    //             u = (x - box.min.x) / size.x;
    //             v = (y - box.min.y) / size.y;
    //         } else if (proj === "YZ") {
    //             u = (z - box.min.z) / size.z;
    //             v = (y - box.min.y) / size.y;
    //         } else { // "XZ"
    //             u = (x - box.min.x) / size.x;
    //             v = (z - box.min.z) / size.z;
    //         }

    //         uvAttr[i * 2] = u;
    //         uvAttr[i * 2 + 1] = v;
    //     }

    //     geometry.setAttribute("uv", new THREE.BufferAttribute(uvAttr, 2));
    // }
 
    function initAddToCart() {
        const addToCartBtn = container.querySelector('.buy-container .config_add_to_cart_button');

        if(!addToCartBtn) return;

        addToCartBtn.addEventListener('click', async function(e) {
            e.preventDefault();

            addToCartAjax(
                addToCartBtn,
                container, 
                productId, 
                state.defaultTextures,
                productState.dimensions,
                state.defaultComponents,
            );
        });

    }
}


async function getFurnitureProductPartsShortcodeContentV2(productId, furnitureType) {
    try {
        let formData = new FormData();
        formData.append("action", "render_config_furniture_product_settings");
        formData.append("product_id", productId);
        formData.append("furniture_type", furnitureType);

        const response = await fetch(configData.ajaxurl, {
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

async function addToCartAjax(
    buttonHtml,
    container, 
    productId, 
    textures,
    dimensions,
    components,
) {
    const oldText = buttonHtml.innerHTML;
    buttonHtml.innerHTML = '<div class="loader"></div>';

    const messageDiv = container.querySelector('.buy-container #add-to-cart-message');
    if (messageDiv) {
        messageDiv.innerHTML = '';
    }

    try {
        let formData = new FormData();
        formData.append("action", "product_ajax_add_to_cart");
        formData.append("product_id", productId);
        formData.append("main_settings", JSON.stringify({
            textures: textures,
            dimensions,
            components: groupComponents(components),
        }));
        
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

function groupComponents(components) 
{
    const groupedComponents = Object.values(
        components.reduce((acc, item) => {

            if (item.parent_id === null) {
                acc[`single_${item.id}`] = { ...item, children: [] };
                return acc;
            }

            if (!acc[item.parent_id]) {
                acc[item.parent_id] = { parent_id: item.parent_id, children: [] };
            }
                            console.log(item)
            acc[item.parent_id].children.push(item);
            return acc;
        }, {})
    );

    return groupedComponents;
}