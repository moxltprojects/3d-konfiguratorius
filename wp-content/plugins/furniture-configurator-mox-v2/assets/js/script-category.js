
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
    expandSettingsContainer,
    categoryState,
    initTextureSettingsConfigFunctions,
    changeComponentsValue,
    setTextureLoader,
    renderThumbnailImage,
    deleteCookies,
} from './shared-scripts.js';

const TEXTURES_COOKIE_NAME = TEXTURES_COOKIE_NAME_DEFAULT;
const COMPONENTS_COOKIE_NAME = COMPONENTS_COOKIE_NAME_DEFAULT;
const FURNITURE_TYPE_COOKIE_NAME = FURNITURE_TYPE_COOKIE_NAME_DEFAUL;

window.initCategoryContent = function initCategoryContent() {
    state.uploadsUrl = configDataCategory.uploadsUrl;

    initSetDisplayCtas();

    const expandButtons = document.querySelectorAll('.load-more-btn-container button:not(.init)');
    expandSettingsContainer(expandButtons, initFurnitureConfigGallery);
};

window.initFurnitureConfigTextureSettingsComponent =  async function initFurnitureConfigTextureSettingsComponent() {
    const container = document.querySelector('.settings-preview-gallery-container');
    let {
        content,
        components,
        selected_furniture_types,
        default_textures,
        products_textures_settings
    } = await getFurnitureCategoryGalleryShortcodeContent();

    if(!content) return;
    state.defaultTextures = {...default_textures};

    container.innerHTML = content;

    // initSetDisplayCtas(container, selected_furniture_types);
}

async function initFurnitureConfigGallery(container) {
    if(!container) return;

    let {
        content,
    } = await getFurnitureCategoryGalleryShortcodeContent();

    if(!content) return;

    container.outerHTML = content;
    const newContainer = document.querySelector('.settings-gallery-container');

    await initTextureSettingsConfigFunctions(newContainer, TEXTURES_COOKIE_NAME);

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


function initSetDisplayCtas() {
    const displayContainer = document.querySelector('.display-type-container');

    if(!displayContainer) return;
    const buttons = document.querySelectorAll('.builder-type-ctas button');

    buttons.forEach(button => {
        const type = button.getAttribute('data-type');

        button.addEventListener('click', async function(e) {
            e.preventDefault();

            const prevCurrent = document.querySelector('.furniture-config-btn.current');
            if(prevCurrent) {
                prevCurrent.classList.remove('current');
            }

            button.classList.add('current');

            displayContainer.innerHTML = `<div class="config-loader-container">
                    <span class="loader"></span>
                    </div>
                </div>`;

            if(type === 'config') {
                await initRoomConfigComponent();
            } else {
                await initFurnitureProductsComponent();
            }
        });
    });
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


