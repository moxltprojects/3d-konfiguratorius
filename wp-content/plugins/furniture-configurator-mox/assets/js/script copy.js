let configFurnitureImgHtml = '';
let selectedTerms = [];

window.initFurnitureConfig =  async function initFurnitureConfig(productId) {
    let [fullContent, imageContent] = await getShortcodeContent(productId);
    const container = document.querySelector('.config-furniture-shortcode-inner');
    configFurnitureImgHtml = imageContent;

    if(fullContent) {
        container.innerHTML = fullContent;
        createImageHtml();
    }

    initConfigFunctions(container);
}

function initConfigFunctions(container) {
    const mainContent = container.querySelector('.config-furniture-main-content');
    let currentStep = mainContent.getAttribute('data-progress');

    stepsNavigate(mainContent, currentStep);
    // window.goStepBack = function goStepBack() {
    //     const mainContent = document.querySelector('.config-furniture-main-content');
    //     const currentStep = parseInt(mainContent.getAttribute('data-progress'));
    //     const prevStep = currentStep > 0 ? currentStep - 1 : currentStep;
        
    //     mainContent.setAttribute('data-progress', prevStep);
    // }

    // window.goStepForward = function goStepForward() {
    //     const mainContent = document.querySelector('.config-furniture-main-content');
    //     const currentStep = parseInt(mainContent.getAttribute('data-progress'));
    //     const prevStep = currentStep < 3 ? currentStep + 1 : currentStep;
        
    //     mainContent.setAttribute('data-progress', prevStep);
    // }

    window.selectTextureItemButton = function selectTextureItemButton(event) {
        const target = event.target;
        const value = target.value;

        if(target.classList.contains('current')) return;

        const parentNode = target.parentNode;
        const parent = target.closest('.ul-parent');
        const prevCurrent = parent.querySelector('li.current');
        const prevParentCurrent = parent.querySelector('li.current-parent');
        let oldValue = null;

        if(prevCurrent) {
            prevCurrent.classList.remove('current');
            oldValue = prevCurrent.querySelector('button').value;
        }

        if(prevParentCurrent) {
            prevParentCurrent.classList.remove('current-parent');
        }

        parentNode.classList.add('current');
        const parentLi = parentNode.closest('li.parent')

        if(parentLi && parentLi != parentNode) {
            parentLi.classList.add('current-parent');
        }

        updateSelectedTerms(target, value, oldValue);
    }

    window.selectTextureItemCheckbox = function selectTextureItemCheckbox(target) {
        const value = target.value;

        if(target.checked) {
            updateSelectedTerms(target, value, null)
        } else {
            updateSelectedTerms(target, null, value)
        }
    }

    function updateSelectedTerms(target, newValue, oldValue) {
        if(newValue) {
        selectedTerms.push(newValue); 
        }
        if(oldValue) {
            const index = selectedTerms.indexOf(oldValue);
            if (index !== -1) {
                selectedTerms.splice(index, 1);
            }
        }
        
        updateVisibleList(target);
    }

    function updateVisibleList(target) {
        const selectedTermsLength = selectedTerms.length;
        const listItems = target.closest('.config-modal').querySelectorAll('.modal-bottom-container .intro-item');

        if(!selectedTermsLength) {
            listItems.forEach(item => {
                item.classList.remove('hidden');
            });

            return;
        }


        listItems.forEach(item => {
            const terms = item.getAttribute('data-terms');
            const termsArray = terms.split('|');
            let selected = false;

            for(let i = 0; i < selectedTermsLength; i++) {
                const selectedTerm = selectedTerms[i];
                if(termsArray.includes(selectedTerm)) {
                    selected = true;
                    break;
                }
            }

            if(selected) {
                item.classList.remove('hidden')
            } else {
                item.classList.add('hidden')
            }
        });
    }


    window.setSelectedTexture = function setSelectedTexture(target) {
        const parentNode = target.parentNode;

        if(parentNode.classList.contains('current')) return;

        const modal = target.closest('.config-modal');
        const selectedBlock = modal.querySelector('.texture-selected-block');

        const prevCurrent = modal.querySelector('.modal-bottom-container .intro-item.current');
        if(prevCurrent) prevCurrent.classList.remove('current');

        parentNode.classList.add('current');

        if(selectedBlock) {
            const clonedNode = parentNode.querySelector('.full-description .color-item').cloneNode(true);
            selectedBlock.innerHTML = '';
            selectedBlock.appendChild(clonedNode);
        }
    }

    window.setCurrentTexture = async function setCurrentTexture(target) {
        const modal = target.closest('.config-modal');
        if(!modal) return;
        const type = target.value;
        const valueType = modal.getAttribute('data-type');
        const valueBlock = target.closest('.main-block-inner').querySelector('.texture-selected-block .color-item');
        const value = valueBlock.getAttribute('data-id');

        await changeImageHtmlProperty(type, valueType, value);

        modal.classList.remove('active');

        updateButtonData(type);

    }

    function updateButtonData() {

    }

    window.changeDimensionValue = function changeDimensionValue(e, maxValue, furnitureId) {
        const target = e.target;
        const name = target.name;
        let value = parseInt(target.value);
        const dataType = 'dimensions';
        const min = parseInt(target.min);
        const max = parseInt(target.max);

        if(value < min) {
            target.value = min;
            value = min;
        } else if(value > max) {
            target.value = max;
            value = max;
        }

        changeImageHtmlProperty(
            dataType, 
            name, 
            value, 
            maxValue, 
            furnitureId
        )
    }


    

    async function changeImageHtmlProperty(dataType, valueType, value, maxValue = null, furnitureId = null)
    {
        try {
            let formData = new FormData();
            formData.append("action", "change_image_html_display");
            formData.append("image_html", configFurnitureImgHtml);
            formData.append("data_type", dataType);
            formData.append("value_type", valueType);
            formData.append("value", value);
            formData.append("max_value", maxValue);
            formData.append("furniture_id", furnitureId);

            const response = await fetch(configData.ajaxurl, {
                method: "POST",
                body: formData,
            });

            const jsonData = await response.json();
            console.log(jsonData);
            if(!jsonData.success || !jsonData.data?.image_html) return;

            const newImageHtml = jsonData.data.image_html;
            await createImageHtml(newImageHtml)
        } catch(e) {
            console.log(e)
            return;
        }
    } 

    async function createImageCanvas(imagesHtml, imageContent = null) {

        if(imageContent) {
            imagesHtml.outerHTML = imageContent;
            configFurnitureImgHtml = imageContent;
            imagesHtml = document.querySelector('.config-furniture-shortcode .display-container .display-content .canvas-html-image');
        }

        try {
            const canvas = await html2canvas(imagesHtml); 
            const imageData = canvas.toDataURL("image/png"); 

            return imageData;
        } catch (error) {
            console.error("Error:", error);
        }

    }

    function renderCtaEls(imagesHtml) {
        const frontImages = imagesHtml.querySelectorAll('.images .img-block');
        const oldCtaBlocks = imagesHtml.querySelectorAll('cta-el');
        let newCtaElsHtml = '';

        oldCtaBlocks.forEach(block => {
            block.remove();
        });

        const parentRect = imagesHtml.getBoundingClientRect();
        const parentRectTop = parentRect.top;
        const parentRectLeft = parentRect.left;

        frontImages.forEach(image => {
            const boundingClientRect = image.getBoundingClientRect();
            const width = boundingClientRect.width;
            const height = boundingClientRect.height;
            const top = boundingClientRect.top - parentRectTop;
            const left = boundingClientRect.left - parentRectLeft;
            
            const ctaBlock = `<div class="cta-el" style="width: ${width}px; height: ${height}px; top: ${top}px; left: ${left}px;"></div>`;
            newCtaElsHtml += ctaBlock;
        });

        return newCtaElsHtml;
    }

    window.toggleDecorModal = function toggleDecorModal(target, type = null, typeTitle = null) {
        const configContainer = target.closest('.config-furniture-shortcode');
        const modal = configContainer.querySelector('.config-modal');
        if(!modal) return;

        if(!type) {
            modal.classList.remove('active');           
        } else {
            const heading = modal.querySelector('.heading-block > .heading');
            modal.classList.add('active');   
            modal.setAttribute('data-type', type);
            heading.innerHTML = typeTitle;
        }
    }
}

async function getShortcodeContent(productId) {
    try {
        let formData = new FormData();
        formData.append("action", "render_config_furniture_content");
        formData.append("product_id", productId);

        const response = await fetch(configData.ajaxurl, {
            method: "POST",
            body: formData,
        });

        const jsonData = await response.json();
        if(!jsonData.success || !jsonData.data?.content) return '';
        const data = jsonData.data
        const fullContent = data.content; 
        const imageContent = data.image_content; 

        return [
            fullContent,
            imageContent
        ];
    } catch(e) {
        return '';
    }
}

async function createImageHtml(imageContent = null) {
    let imagesHtml = document.querySelector('.config-furniture-shortcode .display-container .display-content .canvas-html-image');
    
    const newCtaElsHtml = renderCtaEls(imagesHtml); 

    if(!imagesHtml) return;

    const mainContent = document.querySelector('.config-furniture-main-content');
    const imageFileName = mainContent.getAttribute('data-imgfilename');
    const imageData = await createImageCanvas(imagesHtml, imageContent);

    if(!imageData) return;

    try {
        let formData = new FormData();
        formData.append("action", "save_config_furniture_canvas");
        formData.append("canvas_content", imageData);
        formData.append("image_file_name", imageFileName);

        const response = await fetch(configData.ajaxurl, {
            method: "POST",
            body: formData,
        });

        const jsonData = await response.json();

        if(!jsonData.success || !jsonData.data?.image_html) return;
        imagesHtml.innerHTML = jsonData.data.image_html;
        imagesHtml.innerHTML += newCtaElsHtml;
        
    } catch(e) {
        return;
    }
}

