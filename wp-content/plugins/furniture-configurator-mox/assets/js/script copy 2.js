let configFurnitureImgHtml = '';
let imageBlockWidth = 0;

window.initFurnitureConfig =  async function initFurnitureConfig(productId) {

    const container = document.querySelector('.config-furniture-shortcode');
    const imageBlock = container.querySelector('.canvas-html-image');
    imageBlockWidth = getImageContainerWidth(imageBlock);

    let [
        fullContent, 
        imageContent, 
        defaultWidth, 
        widthPercent,
        defaultHeight, 
        heightPercent,
        defaultDepth, 
        depthPercent,
        maxDimensionsValue, 
        defaultFrontTextureId, 
        defaultFrontTextureSrc, 
        defaultCorpusTextureId, 
        defaultCorpusTextureSrc, 
        furnitureId
    ] = await getShortcodeContent(productId);

    configFurnitureImgHtml = imageContent;

    if(fullContent) {
        container.innerHTML = fullContent;
        createImageHtml(container);
    }

    await initConfigFunctions(
        container, 
        defaultWidth, 
        widthPercent,
        defaultHeight, 
        heightPercent,
        defaultDepth, 
        depthPercent,
        maxDimensionsValue,
        defaultFrontTextureId, 
        defaultFrontTextureSrc,
        defaultCorpusTextureId,
        defaultCorpusTextureSrc,
        furnitureId,
        productId
    );

    window.addEventListener('resize', function() {
        imageBlockWidth = getImageContainerWidth(imageBlock);
    });
}

async function initConfigFunctions(
    container,
    defaultWidth, 
    widthPercent,
    defaultHeight, 
    heightPercent,
    defaultDepth, 
    depthPercent,
    maxDimensionsValue,
    defaultFrontTextureId, 
    defaultFrontTextureSrc,
    defaultCorpusTextureId,
    defaultCorpusTextureSrc,
    furnitureId,
    productId
) {
    const base = configData.baseUrl;
    const THREE = await import(base + '/js/three/three.module.js');
    const { OrbitControls } = await import(base + '/js/three/OrbitControls.js');
    const { GLTFLoader } = await import(base + '/js/three/GLTFLoader.js');
    const { DragControls  } = await import(base + '/js/three/DragControls.js');
    const { mergeGeometries  } = await import(base + '/js/three/BufferGeometryUtils.js');

    const mainContent = container.querySelector('.config-furniture-main-content');
    const progressBar = mainContent.querySelector('.progress-container .steps-bars');
    let oldCurrentProgressButton = progressBar.querySelector(`button.current`);
    const modal = container.querySelector('.config-modal');
    const selectedBlock = modal.querySelector('.texture-selected-block');
    let currentStep = parseInt(mainContent.getAttribute('data-progress'));
    const listItems = modal.querySelectorAll('.modal-bottom-container .intro-item');
    const previewBtnsSingle = container.querySelectorAll('.model-block .preview-list button .model-data-container');
    const previewBtnsMultiple = container.querySelectorAll('.model-multiple-block .preview-list button .model-data-container');
    let selectedCategories = [];
    let selectedTerms = [];
    let currentWidth = defaultWidth;
    let currentHeight = defaultHeight;
    let currentDepth = defaultDepth;
    let currentFrontTextureId = defaultFrontTextureId;
    let currentFrontTextureSrc = defaultFrontTextureSrc;
    let currentCorpusTextureId = defaultCorpusTextureId;
    let currentCorpusTextureSrc = defaultCorpusTextureSrc;
    let currentTextureId = defaultFrontTextureId;
    let currentTextureSrc = defaultFrontTextureSrc;
    let TEXTURE_TYPE_FRONT = 'front';
    let TEXTURE_TYPE_CORPUS = 'corpus';
    let currentTextureIdType = TEXTURE_TYPE_FRONT;
    let TYPE_TEXTURES = 'textures';
    let TYPE_DIMENSIONS = 'dimensions';

    let frontNodes = [
        // 'node47',
        // 'node48',
        // 'node49',
        // 'node50',
        // 'node51',
        // 'node52',
        // 'node53',
        // 'node54',
        // 'node55',
        // 'node56',
        // 'node57',
        // 'node58',
        // 'node59',
        // 'node60',
        // 'node61',
        // 'node62',
        // 'node63',
        // 'node64',
        // 'node65',
        // 'node66',
        // //
        // 'node3',
        // 'node4',
        // 'node7',
        // 'node11',
        // 'node13',
        // 'node16',
        // 'node17',
        // 'node19',
    ];

    stepsNavigate(mainContent, currentStep);

    tabsNavigate(mainContent);

    initModelBlock(false);
    initModelBlock(false, false);

    initAddToCart();

    selectTexturesCatMenuItem(container);
    selectTexturesTermMenuItem(container)

    setSelectedTexture(modal);


    setCurrentTexture(modal);

    changeDimensionsValue(mainContent);

    openTextureModal(mainContent);

    closeModal(modal);


    function updateSelectedCategories(newValue, oldValue) {
        if(newValue) {
            selectedCategories.push(newValue); 
        }
        if(oldValue) {
            const index = selectedCategories.indexOf(oldValue);
            if (index !== -1) {
                selectedCategories.splice(index, 1);
            }
        }

        updateVisibleList();
    }

    function updateSelectedTerms(newValue, oldValue) {
        if(newValue) {
            selectedTerms.push(newValue); 
        }
        if(oldValue) {
            const index = selectedTerms.indexOf(oldValue);
            if (index !== -1) {
                selectedTerms.splice(index, 1);
            }
        }
        
        updateVisibleList();
    }

    function updateVisibleList() {
        const selectedCategoriesLength = selectedCategories.length;
        const selectedTermsLength = selectedTerms.length;

        if(!selectedTermsLength && !selectedCategoriesLength) {
            listItems.forEach(item => {
                item.classList.remove('hidden');
            });

            return;
        }


        listItems.forEach(item => {
            const terms = item.getAttribute('data-terms');
            const termsArray = terms.split('|');
            let selected = false;
            let categorySelected = selectedCategoriesLength == 0;
            let termSelected = selectedTermsLength == 0;

            for(let i = 0; i < selectedCategoriesLength; i++) {
                const selectedCat = selectedCategories[i];
                if(termsArray.includes(selectedCat)) {
                    categorySelected = true;
                    break;
                }
            }

            for(let i = 0; i < selectedTermsLength; i++) {
                const selectedTerm = selectedTerms[i];
                if(termsArray.includes(selectedTerm)) {
                    termSelected = true;
                    break;
                }
            }

            if(categorySelected && termSelected) {
                selected = true;
            }

            if(selected) {
                item.classList.remove('hidden')
            } else {
                item.classList.add('hidden')
            }
        });
    }


    function updateButtonData(textureType, textureData) {
        const dimensionsButtonItem = document.querySelector(`.decorations-list .decor-item[data-type="${textureType}"] button`);

        if(!dimensionsButtonItem) return;

        const img = dimensionsButtonItem.querySelector('img');
        const heading = dimensionsButtonItem.querySelector('h4');
        img.setAttribute('src', textureData.image);
        heading.innerHTML = textureData.heading;
    }

    async function changeImageHtmlProperty(dataType, valueType, value, maxValue = null)
    {
        modal.classList.add('loading');

        try {
            let formData = new FormData();
            formData.append("action", "change_image_html_display");
            formData.append("product_id", productId);
            formData.append("furniture_id", furnitureId);
            formData.append("image_html", configFurnitureImgHtml);
            formData.append("image_block_width_px", imageBlockWidth);
            formData.append("data_type", dataType);
            formData.append("value_type", valueType);
            formData.append("value", value);
            formData.append("max_value", maxValue);
            formData.append("front_texture_id", currentFrontTextureId);
            formData.append("corpus_texture_id", currentCorpusTextureId);

            const response = await fetch(configData.ajaxurl, {
                method: "POST",
                body: formData,
            });

            const jsonData = await response.json();
            if(!jsonData.success || !jsonData.data?.image_html) return;

            const newImageHtml = jsonData.data.image_html;
            configFurnitureImgHtml = newImageHtml;
            const newPrice = jsonData.data.price;
   
            await createImageHtml(container, newImageHtml); 
            updatePriceHtml(container, newPrice);

            modal.classList.remove('loading');

            return jsonData.data;

        } catch(e) {
            modal.classList.remove('loading');
            return;
        }
    } 

    /*********** helpers ***********/
    function stepsNavigate(mainContent) {
        const prevButton = mainContent.querySelector('.prev-step');
        const nextButton = mainContent.querySelector('.next-step');
        const allProgressButtons = container.querySelectorAll('.config-progress-bar .steps-bars button');

        prevButton.addEventListener('click', function(e) {
            e.preventDefault();
            const prevStep = currentStep > 0 ? currentStep - 1 : currentStep;
            currentStep = prevStep;
            mainContent.setAttribute('data-progress', prevStep);

            changeCurrentProgressButton(prevStep);
        });

        nextButton.addEventListener('click', function(e) {
            e.preventDefault();
            const nextStep = currentStep < 3 ? currentStep + 1 : currentStep;
            currentStep = nextStep;
            mainContent.setAttribute('data-progress', nextStep);

            changeCurrentProgressButton(nextStep);
        });

        allProgressButtons.forEach(button => {
            const stepData = parseInt(button.getAttribute('data-step'));

            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                if(button.classList.contains('current')) return;

                currentStep = stepData;
                mainContent.setAttribute('data-progress', stepData);
                 changeCurrentProgressButton(stepData);
            });
        });
    }

    function tabsNavigate(mainContent) {
        const tabs = mainContent.querySelectorAll('.tabs button');

        tabs.forEach(tab => {
            const type = tab.getAttribute('data-type');

            tab.addEventListener('click', function(e) {
                e.preventDefault();

                if(tab.classList.contains('active')) {
                    return;
                }

                const tabContent = mainContent.querySelector(`.display-content .${type}`);

                if(tabContent) {
                    const prevCurrentContainer = mainContent.querySelector(`.display-content > .active`);
                    const prevCurrentButton = mainContent.querySelector(`.tabs button.active`);

                    if(prevCurrentContainer) {
                        prevCurrentContainer.classList.remove('active');
                        prevCurrentButton.classList.remove('active');
                    }

                    tab.classList.add('active');
                    tabContent.classList.add('active');
                }

                if(type === 'model-block') {
                    initModelBlock(true);
                } else if(type === 'model-multiple-block') {
                    initModelBlock(true, false);
                } else {
                    removeModelBlockContent();
                }

            });

        });
    }

    async function initModelBlock(init = false, single = true) {
        const parent = single ? 
            mainContent.querySelector('.display-content .model-block') : 
            mainContent.querySelector('.display-content .model-multiple-block');
        const buttons = parent.querySelectorAll('.preview-list button');

        if(!buttons.length) return;

        if(init) {
            progressBar.classList.add('inactive');

            const firstButton = buttons[0];
            const firstButtonContainer = firstButton.querySelector('.model-data-container');
            const firstButtonSrc = firstButtonContainer.getAttribute('data-src');
            const activeButton = parent.querySelector('.preview-list button.active');

            if(firstButton != activeButton) {
                activeButton.classList.remove('active');
                firstButton.classList.add('active');
            }

            init3dModel(firstButtonSrc, init, parent, single);

            return;
        }

        buttons.forEach(button => {
            const childContainer = button.querySelector('.model-data-container');
            const src = childContainer.getAttribute('data-src');

            button.addEventListener('click', function(e) {
                e.preventDefault();

                const activeButton = parent.querySelector('.preview-list button.active');

                if(button != activeButton) {
                    activeButton.classList.remove('active');
                    button.classList.add('active');
                }

                init3dModel(src, init, parent, single);
            });
        });
    }

    function removeModelBlockContent() {
        progressBar.classList.remove('inactive');

        const objectContainer = mainContent.querySelectorAll('.object-model-container .preview-container .preview-container-inner');
    
        objectContainer.forEach(container => {
            container.innerHTML = '<div class="config-loader-container">span class="loader"></span></div>';
        });
    }

    function init3dModel(src, init, parent, single) {
        const objectContainer = parent.querySelector('.preview-container .preview-container-inner');

        if (!src) return;

        objectContainer.innerHTML = '<div class="config-loader-container">span class="loader"></span></div>';

        const modelContent =  parent.querySelector('.object-model-container');
        modelContent.classList.add('loading');

        if(init) {
            if(single) {
                previewBtnsSingle.forEach(previewContainer => {
                    previewContainer.innerHTML = '';
                    const previewSrc = previewContainer.getAttribute('data-src');

                    init3dModelReadSrc(previewSrc, previewContainer);
                    
                });
            } else {
                previewBtnsMultiple.forEach(previewContainer => {
                    previewContainer.innerHTML = '';
                    const previewSrc = previewContainer.getAttribute('data-src');

                    const srcList = [
                        previewSrc,
                        previewSrc,
                        previewSrc
                    ];
                    init3dMultipleModelReadSrc(srcList, previewContainer);
                    
                });
            }
        }

        if(single) {
            init3dModelReadSrc(src, objectContainer);
        } else {
            const srcList = [
                src,
                src,
                src
            ];
            init3dMultipleModelReadSrc(srcList, objectContainer);
        }

        modelContent.classList.remove('loading');

    }

    function init3dModelReadSrc(srcChild, objectContainer, offsetY = 25) {
        const [widthPx, heightPx, depthPx] = get3DContainerSide(objectContainer, currentWidth, widthPercent, currentHeight, heightPercent, currentDepth, depthPercent);

        const textureLoader = new THREE.TextureLoader();
        const textureFront = currentFrontTextureSrc ? textureLoader.load(currentFrontTextureSrc) : null;
        const textureCorpus = currentCorpusTextureSrc ? textureLoader.load(currentCorpusTextureSrc) : null;

        const scene = new THREE.Scene();

        const width = objectContainer.clientWidth;
        const height = objectContainer.clientHeight;
        const camera = new THREE.OrthographicCamera(
            -width / 2, width / 2,
            height / 2, -height / 2,
            0.1, 1000
        );

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
        renderer.setSize(objectContainer.clientWidth, objectContainer.clientHeight);
        objectContainer.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);

        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
        scene.add(hemiLight);
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
        dirLight.position.set(100, 200, 100);
        scene.add(dirLight);

        /************room ****************/

        const roomWidth = widthPx / 1.3;
        const roomHeight = heightPx / 1.3;
        const roomDepth = depthPx / 1.3;

        // Floor
        const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 }); 
        const floorGeometry = new THREE.PlaneGeometry(roomWidth, roomDepth);
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2; // rotate to be horizontal
        floor.position.y = 0;
        scene.add(floor);

        // Walls
        const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xd3d3d3, side: THREE.DoubleSide });

        // Left Wall (at x = 0, z = -roomDepth/2 → front-left corner)
        const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(roomDepth, roomHeight), wallMaterial);
        leftWall.position.set(-roomWidth / 2, roomHeight / 2, 0); // left edge at x=-width/2
        leftWall.rotation.y = Math.PI / 2; 
        scene.add(leftWall);

        // Right Wall (shares the corner with left wall at z = 0)
        const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(roomWidth, roomHeight), wallMaterial);
        rightWall.position.set(0, roomHeight / 2, -roomDepth / 2);
        scene.add(rightWall);

        const roomGroup = new THREE.Group();
        roomGroup.add(floor, rightWall);
        scene.add(roomGroup);

        camera.position.set(0, roomHeight, roomDepth * 1.5);
        camera.lookAt(0, roomHeight / 2, 0);

        const roomBox = new THREE.Box3().setFromObject(roomGroup); 
        roomBox.expandByScalar(0.01);

        /******** center bottom*******/
        const roomCenter = new THREE.Vector3();
        roomBox.getCenter(roomCenter);
        const roomSize = new THREE.Vector3();
        roomBox.getSize(roomSize);

         /******** create angle *******/
        const distance = Math.max(roomWidth, roomDepth) * 1.5;
        // const distance = maxDim * 2;

        // Tilt down a bit (so we see floor) and yaw so we see both walls
        const yaw   = Math.PI / 4;   // 45° around Y axis
        const pitch = Math.atan(1 / 2); // gentle downward angle (~26°)

        controls.target.set(0, roomHeight / 2, 0); // set target first

        // align slightly top view and rotate the x angle
        const pitchOffset = THREE.MathUtils.degToRad(20); // 15° above horizon
        const camX = distance * Math.sin(yaw) * Math.cos(pitch + pitchOffset);
        const camY = distance * Math.sin(pitch + pitchOffset);
        const camZ = distance * Math.cos(yaw) * Math.cos(pitch + pitchOffset);

        camera.position.set(
            camX + controls.target.x,
            camY + controls.target.y,
            camZ + controls.target.z
        );
    

        /*********** attach child *******/
        const childLoader = new GLTFLoader();
        childLoader.load(srcChild, childGltf => {
            const childModel = childGltf.scene;
            const childMeshList = [];

            childModel.traverse(node => {
                if (node.isMesh) {
                    childMeshList.push(node);
                    const name = (node.name || "").toLowerCase();
                    let texture = textureFront;
        
                    if(frontNodes.includes(name)) {
                        texture = textureCorpus;
                    }

                    node.material = new THREE.MeshStandardMaterial({
                        map: texture,
                        color: 0xffffff,
                        metalness: 0,
                        roughness: 1,
                    });
                    node.material.needsUpdate = true;
                }
            });

            const childMeshGroup = new THREE.Group();
            childMeshList.forEach(mesh => {
                mesh.parent.remove(mesh); // Detach from original hierarchy
                childMeshGroup.add(mesh);
            });
            scene.add(childMeshGroup);

            const childBox = new THREE.Box3().setFromObject(childMeshGroup);
            const childSize = new THREE.Vector3();
            childBox.getSize(childSize);

            const scaleFactor = Math.min(
                roomWidth / 1.7 / childSize.x,
                roomHeight / 1.7 / childSize.y,
                roomDepth / 1.7 / childSize.z
            );
            childMeshGroup.scale.set(scaleFactor, scaleFactor, scaleFactor);

            const finalParentBox = new THREE.Box3().setFromObject(roomGroup);
            const finalParentSize = new THREE.Vector3();
            finalParentBox.getSize(finalParentSize);

            const scaledChildBox = new THREE.Box3().setFromObject(childMeshGroup);
            const scaledChildSize = new THREE.Vector3();
            scaledChildBox.getSize(scaledChildSize);

            const leftX = finalParentBox.min.x + scaledChildSize.x / 2 + scaledChildSize.z;
            const bottomY = finalParentBox.min.y;
            const backZ = finalParentBox.min.z + (scaledChildSize.z / 2) + 1;  // offset from parent's center
            childMeshGroup.position.set(leftX, bottomY, backZ);

        //     /*********** dragging child ******/
            

            const dragControls = new DragControls(
                [childMeshGroup],  // objects to drag
                camera,
                renderer.domElement
            );
            dragControls.transformGroup = true;


            dragControls.addEventListener('drag', event => {
                const obj = event.object;
        
                const parentBoxWorld  = new THREE.Box3().setFromObject(roomGroup);

                const objBox = new THREE.Box3().setFromObject(obj);
                const objHeight = objBox.max.y - objBox.min.y;
                const objMinY = objBox.min.y;
                const offsetY = parentBoxWorld.min.y - objMinY;
                const objSize = new THREE.Vector3();
                objBox.getSize(objSize);

                const forwardThreshold = parentBoxWorld.min.z + (objSize.z / 6);

                const objWorldPos = obj.getWorldPosition(new THREE.Vector3());

                objWorldPos.y = parentBoxWorld.min.y + (objHeight / 100); // set bottom y position
                // objWorldPos.y = parentBoxWorld.min.y - objMinY / 2; // set bottom y position
                // objWorldPos.y = parentBoxWorld.min.y - objMinY + parentBoxWorld.min.y;

                if (obj.position.x < forwardThreshold - 0.01) {
                    obj.rotation.y = Math.PI / 2; 
                    objWorldPos.x = parentBoxWorld.min.x - objSize.z / 2 + 1;
                } else {
                    obj.rotation.y = 0;
                    objWorldPos.z = parentBoxWorld.min.z + objSize.z / 2 + 1;
                }

                objWorldPos.x = Math.max(
                    parentBoxWorld.min.x + objSize.x / 2  + 1,
                    Math.min(parentBoxWorld.max.x - objSize.x / 2, objWorldPos.x)
                );

                objWorldPos.z = Math.max(
                    parentBoxWorld.min.z + objSize.z / 2  + 1,
                    Math.min(parentBoxWorld.max.z - objSize.z / 2, objWorldPos.z )
                );

                obj.position.copy(obj.parent.worldToLocal(objWorldPos));

            });

            // Disable orbit while dragging
            dragControls.addEventListener('dragstart', event => {
                controls.enabled = false; // disable parent rotation & zoom
            });

            dragControls.addEventListener('dragend', event => {
                controls.enabled = true;  // re-enable orbit
            });
        });

        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();
    }

    function mergeMeshesByMaterial(childMeshGroup) {
        const materialMap = new Map();

        // Step 1: group geometries by material
        childMeshGroup.traverse(mesh => {
            if (!mesh.isMesh) return;

            const materialKey = mesh.material.uuid;
            if (!materialMap.has(materialKey)) materialMap.set(materialKey, { material: mesh.material, geometries: [] });
            materialMap.get(materialKey).geometries.push(mesh.geometry.clone().applyMatrix4(mesh.matrixWorld));
        });

        // Step 2: create merged meshes per material
        const mergedGroup = new THREE.Group();
        materialMap.forEach(({ material, geometries }) => {
            console.log(geometries)
            const mergedGeometry = mergeGeometries(geometries, true);
            const mergedMesh = new THREE.Mesh(mergedGeometry, material);
            mergedGroup.add(mergedMesh);
        });

        return mergedGroup;
    }

      function init3dMultipleModelReadSrc(modelSources, objectContainer, offsetY = 25) {
        const [widthPx, heightPx, depthPx] = get3DContainerSide(objectContainer, currentWidth, widthPercent, currentHeight, heightPercent, currentDepth, depthPercent);

        const textureLoader = new THREE.TextureLoader();
        const textureFront = currentFrontTextureSrc ? textureLoader.load(currentFrontTextureSrc) : null;
        const textureCorpus = currentCorpusTextureSrc ? textureLoader.load(currentCorpusTextureSrc) : null;

        const scene = new THREE.Scene();

        // const camera = new THREE.PerspectiveCamera(75, objectContainer.clientWidth / objectContainer.clientHeight, 0.1, 5000);
        const width = objectContainer.clientWidth;
        const height = objectContainer.clientHeight;
        const camera = new THREE.OrthographicCamera(
            -width / 2, width / 2,
            height / 2, -height / 2,
            0.1, 1000
        );

        camera.position.set(0, 0, 500);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
        renderer.setSize(objectContainer.clientWidth, objectContainer.clientHeight);
        objectContainer.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
        scene.add(light);

        const spacing = widthPx + 50; // Space between models
        const loader = new GLTFLoader();

        let modelsLoaded = 0;
        let currentX = 0;
        let totalWidth = 0;
        const meshGroups = [];

        modelSources.forEach((src, index) => {
            loader.load(src, gltf => {
                const model = gltf.scene;
                const meshList = [];

                model.traverse(node => {
                    if (node.isMesh) {
                        meshList.push(node);

                        const name = (node.name || "").toLowerCase();
                        const matName = (node.material?.name || "").toLowerCase();
                        let texture = textureCorpus;

                        if(frontNodes.includes(name)) {
                            texture = textureFront;
                        }

                        node.material = new THREE.MeshStandardMaterial({
                            map: texture,
                            color: 0xffffff,
                            metalness: 0,
                            roughness: 1,
                        });
                        node.material.needsUpdate = true;
                    }
                });

                if (meshList.length === 0) {
                    console.warn(`No mesh objects found in ${src}`);
                    return;
                }

                // Group and center
                const meshGroup = new THREE.Group();
                meshList.forEach(mesh => {
                    mesh.parent?.remove(mesh);
                    meshGroup.add(mesh);
                });

                // Scale uniformly
                const box = new THREE.Box3().setFromObject(meshGroup);
                const size = new THREE.Vector3();
                const center = new THREE.Vector3();
                box.getSize(size);
                box.getCenter(center);

                const scaleX = widthPx / 1.5 / size.x;
                const scaleY = heightPx / 1.5 / size.y;
                const scaleZ = depthPx / 1.5 / size.z;
                meshGroup.scale.set(scaleX, scaleY, scaleZ);


                // Recalculate after scaling
                const newBox = new THREE.Box3().setFromObject(meshGroup);
                const newCenter = new THREE.Vector3();
                newBox.getCenter(newCenter);
                // const minY = newBox.min.y;
                const modelWidth = newBox.max.x - newBox.min.x;
                const centerY = (newBox.max.y + newBox.min.y) / 2;

                meshGroup.position.sub(newCenter); // center to origin
                // meshGroup.position.y -= minY;      // base to y=0
                // meshGroup.position.y += offsetY;
                meshGroup.position.x += currentX + modelWidth / 2;
                meshGroup.position.y += heightPx / 2;

                currentX += modelWidth;
                totalWidth = currentX;

                meshGroups.push(meshGroup);
                scene.add(meshGroup);

                modelsLoaded++;

                // Once all models are loaded
                if (modelsLoaded === modelSources.length) {
                    const halfTotal = totalWidth / 2;

                    // Recenter all meshGroups
                    meshGroups.forEach(group => {
                        group.position.x -= halfTotal;
                    });

                    // Camera centered to the full group
                    camera.position.set(0, heightPx / 2, totalWidth);
                    camera.lookAt(0, heightPx / 2, 0);
                    controls.target.set(0, heightPx / 2, 0);
                    controls.update();
                }
            });
        });

        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();
    }

    function changeCurrentProgressButton(step) {
        const newButton = container.querySelector(`.steps-bars button[data-step="${step}"]`);
        newButton.classList.add('current');

        if(oldCurrentProgressButton) {
            oldCurrentProgressButton.classList.remove('current');
        }

        oldCurrentProgressButton = newButton;
    }

    function selectTexturesCatMenuItem(container) {
        const sidebarMenuItems = container.querySelectorAll('.config-sidebar li button');

        sidebarMenuItems.forEach(item => {
            const value = item.value;
            const parentNode = item.parentNode;
            const parent = item.closest('.ul-parent');
            const parentLi = parentNode.closest('li.parent')
            
            item.addEventListener('click', function(e) {
                e.preventDefault();

                if(item.classList.contains('current')) return;

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

                if(parentLi && parentLi != parentNode) {
                    parentLi.classList.add('current-parent');
                }

                updateSelectedCategories(value, oldValue);
            });
        });
    }

    function selectTexturesTermMenuItem(container) {
        const sidebarMenuItems = container.querySelectorAll('.config-sidebar li input[type="checkbox"]');

        sidebarMenuItems.forEach(item => {
            const value = item.value;
            
            item.addEventListener('change', function(e) {
                e.preventDefault();

                if(e.target.checked) {
                    updateSelectedTerms(value, null)
                } else {
                    updateSelectedTerms(null, value)
                }
            });
        });
    }


    function setSelectedTexture(modal) {
        const texturesList = modal.querySelectorAll('.furniture-textures-list .intro-item button');

        texturesList.forEach(texture => {
            const parentNode = texture.parentNode;
            const colorItem = parentNode.querySelector('.full-description .color-item');
            const textureId = parentNode.getAttribute('data-id');
            const textureSrc = parentNode.getAttribute('data-src'); 

            texture.addEventListener('click', function () {
                if(parentNode.classList.contains('current')) return;

                const prevCurrent = modal.querySelector('.modal-bottom-container .intro-item.current');
                if(prevCurrent) prevCurrent.classList.remove('current');

                parentNode.classList.add('current');
                const clonedNode = colorItem.cloneNode(true);
                selectedBlock.innerHTML = '';
                selectedBlock.appendChild(clonedNode);

                currentTextureId = textureId;
                currentTextureSrc = textureSrc;
            });
        });
    }

    function setCurrentTexture(modal) {
        const chooseButton = modal.querySelector('.select-action button');

        chooseButton.addEventListener('click', async function(e) {
            e.preventDefault();
            if(currentTextureIdType === TEXTURE_TYPE_FRONT) {
                currentFrontTextureId = currentTextureId;
                currentFrontTextureSrc = currentTextureSrc;
            } else {
                currentCorpusTextureId = currentTextureId;
                currentCorpusTextureSrc = currentTextureSrc;
            }

            const data = await changeImageHtmlProperty(TYPE_TEXTURES, currentTextureIdType, currentTextureId);
            const textureData = data.texture_data;
            modal.classList.remove('active');


            changeLastStepSelection(currentTextureIdType, textureData.heading, textureData.image);

            updateButtonData(currentTextureIdType, textureData);
        });

        // const type = target.value;
        // const valueType = modal.getAttribute('data-type');
        // const valueBlock = target.closest('.main-block-inner').querySelector('.texture-selected-block .color-item');
        // const value = valueBlock.getAttribute('data-id');

        // await changeImageHtmlProperty(TYPE_TEXTURES, valueType, value);

        // modal.classList.remove('active');

        // updateButtonData(type);

    }

    function changeDimensionsValue(mainContent) {
        const dimensionInputs = mainContent.querySelectorAll('.dimensions-list input');

        dimensionInputs.forEach(input => {
            const name = input.name;
            const min = parseInt(input.min);
            const max = parseInt(input.max);

            input.addEventListener('change', async function(e) {
                const target = e.target;
                let value = parseInt(target.value);

                if(value < min) {
                    target.value = min;
                    value = min;
                } else if(value > max) {
                    target.value = max;
                    value = max;
                }

                const data = await changeImageHtmlProperty(
                    TYPE_DIMENSIONS, 
                    name, 
                    value, 
                    maxDimensionsValue, 
                    furnitureId
                );

                const valuePercentage = data.value_percentage;

                changeLastStepSelection(name, value);

                switch(name) {
                    case 'width': 
                        currentWidth = value;
                        widthPercent = valuePercentage;
                        break;
                    case 'height': 
                        currentHeight = value;
                        heightPercent = valuePercentage;
                        break;
                    case'depth': 
                        currentDepth = value;
                        depthPercent = valuePercentage;
                        break;
                    default: 
                        currentWidth = value;
                        widthPercent = valuePercentage;
                }

            });
        });
    }

    function openTextureModal(mainContent) {
        const buttons = mainContent.querySelectorAll('.decorations-list .decor-item button');

        buttons.forEach(button => {
            const parentNode = button.parentNode;
            const title = parentNode.getAttribute('data-type_title');
            const type = parentNode.getAttribute('data-type');

            button.addEventListener('click', function(e) {
                e.preventDefault();
                currentTextureIdType = type;

                toggleDecorModal(type, title);

            });
        });
    }

    function closeModal(modal) {
        const backButton = modal.querySelector('button.back');

        if(!backButton) return;

        backButton.addEventListener('click', function(e) {
            e.preventDefault();
            toggleDecorModal();
        });
    }

    function toggleDecorModal(type = null, typeTitle = null) {
        if(!type) {
            modal.classList.remove('active');           
        } else {
            const heading = modal.querySelector('.heading-block > .heading');
            modal.classList.add('active');   
            modal.setAttribute('data-type', type);
            heading.innerHTML = typeTitle;
            let newCurrentSelectedItemId = currentTextureIdType === TEXTURE_TYPE_FRONT ? currentFrontTextureId : currentCorpusTextureId;
            const newCurrentSelectedItem = document.querySelector(`.modal-bottom-container .intro-item[data-id="${newCurrentSelectedItemId}"]`);

            if(newCurrentSelectedItem) {
                const textureId = newCurrentSelectedItem.getAttribute('data-id');
                const textureSrc = newCurrentSelectedItem.getAttribute('data-src');
                const desc = newCurrentSelectedItem.querySelector('.full-description .color-item');
                const prevCurrent = document.querySelector(`.modal-bottom-container .intro-item.current`);
                
                if(prevCurrent) {
                    prevCurrent.classList.remove('current');
                }

                newCurrentSelectedItem.classList.add('current');

                const clonedNode = desc.cloneNode(true);
                selectedBlock.innerHTML = '';
                selectedBlock.appendChild(clonedNode);

                currentTextureId = textureId;
                currentTextureSrc = textureSrc;

                if(currentTextureIdType === TEXTURE_TYPE_FRONT) {
                    currentFrontTextureId = textureId;
                    currentFrontTextureSrc = textureSrc;
                } else {
                    currentCorpusTextureId = textureId;
                    currentCorpusTextureSrc = textureSrc;
                }
            }
        }
    }

    function changeLastStepSelection(type, value, image = null) {
        const selectionItem = mainContent.querySelector(`.addtocart-container .selection-item[data-type="${type}"]`);

        if(!selectionItem) return;

        const valueContent = selectionItem.querySelector('.value-container');
        const valueContentTitle = valueContent.querySelector('h4');

        valueContentTitle.innerHTML = value;
        
        if(image) {
            const valueContentImg = valueContent.querySelector('img'); 
            valueContentImg.setAttribute('src', image);
        }
    }

    async function addToCartAjax() {
        try {
            const imageHtml = mainContent.querySelector('.canvas-html-image img');
            let imageSrc = null;

            if(imageHtml) {
                imageSrc = imageHtml.getAttribute('src');
            }

            let formData = new FormData();
            formData.append("action", "config_furniture_addtocart");
            formData.append("product_id", productId);
            formData.append("furniture_id", furnitureId);
            formData.append("width", currentWidth);
            formData.append("height", defaultHeight);
            formData.append("depth", defaultDepth);
            formData.append("front_texture_id", currentFrontTextureId);
            formData.append("corpus_texture_id", currentCorpusTextureId);
            formData.append("thumbnail_url", imageSrc);

            const response = await fetch(configData.ajaxurl, {
                method: "POST",
                body: formData,
            });

            const jsonData = await response.json();
            if(!jsonData.success || !jsonData.data?.cart_count) return '';
            const cartCount = jsonData.data.cart_count

            return cartCount;
        } catch(e) {
            console.log(e)
            return false;
        }
    }

    function initAddToCart() {
        const addToCartButton = container.querySelector('button.config_add_to_cart_button');
        const iconCountHtml = document.querySelector('.fusion-tb-header .menu-item .fusion-widget-cart-number')
        if(!addToCartButton) return;

        addToCartButton.addEventListener('click', async function(e) {
            e.preventDefault();

            const cartCount = await addToCartAjax();
            if(cartCount) {
                iconCountHtml.innerHTML = cartCount;
                iconCountHtml.setAttribute('data-cart-count', cartCount);
            }

        });
    }
}

async function getShortcodeContent(productId) {
    try {
        let formData = new FormData();
        formData.append("action", "render_config_furniture_content");
        formData.append("product_id", productId);
        formData.append("image_block_width_px", imageBlockWidth);

        const response = await fetch(configData.ajaxurl, {
            method: "POST",
            body: formData,
        });

        const jsonData = await response.json();
        if(!jsonData.success || !jsonData.data?.content) return '';
        const data = jsonData.data
        const fullContent = data.content; 
        const imageContent = data.image_content; 
        const defaultWidth = data.default_width; 
        const widthPercent = data.width_percent; 
        const defaultHeight = data.default_height; 
        const heightPercent = data.height_percent; 
        const defaultDepth = data.default_depth; 
        const depthPercent = data.depth_percent; 
        const maxDimensionsValue = data.max_dimensions_value; 
        const defaultFrontTextureId = data.default_front_texture_id; 
        const defaultFrontTextureSrc = data.default_front_texture_src; 
        const defaultCorpusTextureId = data.default_corpus_texture_id; 
        const defaultCorpusTextureSrc = data.default_corpus_texture_src; 
        const furnitureId = data.furniture_id; 

        return [
            fullContent,
            imageContent,
            defaultWidth,
            widthPercent,
            defaultHeight,
            heightPercent,
            defaultDepth,
            depthPercent,
            maxDimensionsValue,
            defaultFrontTextureId,
            defaultFrontTextureSrc,
            defaultCorpusTextureId,
            defaultCorpusTextureSrc,
            furnitureId
        ];
    } catch(e) {
        return '';
    }
}

async function createImageHtml(container, imageContent = null) {
    const imageContainer = document.querySelector('.config-furniture-shortcode .display-container .canvas-html-image-wrap');
    
    container.classList.add('disabled');
    imageContainer.classList.add('loading');

    let imagesHtml = document.querySelector('.config-furniture-shortcode .display-container .display-content .canvas-html-image');

    if(imageContent) {
        imagesHtml.outerHTML = imageContent;
        imagesHtml = document.querySelector('.config-furniture-shortcode .display-container .display-content .canvas-html-image');
    }

    const newCtaElsHtml = renderCtaEls(imagesHtml); 

    if(!imagesHtml) return;

    setTimeout(async () => {
        const mainContent = document.querySelector('.config-furniture-main-content');
        const imageFileName = mainContent.getAttribute('data-imgfilename');

        const imageData = await createImageCanvas(imagesHtml);

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

            // imagesHtml.innerHTML = jsonData.data.image_html;
            // imagesHtml.innerHTML += newCtaElsHtml;

        } catch(e) {
            console.log(e)
        }
        imageContainer.classList.remove('loading');
        container.classList.remove('disabled');
    }, 1000)

    
}

function updatePriceHtml(container, newPrice) {
    const priceBlocks = container.querySelectorAll('.price .price-value');

    priceBlocks.forEach(block => {
        block.innerHTML = newPrice;
    });
}

async function createImageCanvas(imagesHtml) {
    try {
        const canvas = await html2canvas(imagesHtml); 
        const imageData = canvas.toDataURL("image/png"); 

        return imageData;
    } catch (error) {
        console.error("Error:", error);
    }
}

function getImageContainerWidth(imageBlock) {

    if(!imageBlock) {
        const shortcodeBlock = document.querySelector('.config-furniture-shortcode');
        const parentWidth = window.innerWidth > 1023 ? shortcodeBlock.clientWidth / 2 : shortcodeBlock.clientWidth;

        let width = parentWidth - 110;
        width = width > 300 ? 300 : width;

        return width;
    }

    const width = imageBlock.clientWidth;

    return width;
}

function get3DContainerSide(modelContainer, width, widthPercent, height, heightPercent, depth, depthPercent) {
    let largestVal = widthPercent;
    if(largestVal < heightPercent) {
        largestVal = heightPercent;
    }
    if(largestVal < depthPercent) {
        largestVal = depthPercent;
    }
    const minusPercent = 100 - largestVal;

    widthPercent = widthPercent + minusPercent;
    heightPercent = heightPercent + minusPercent;
    depthPercent = depthPercent + minusPercent;

    const containerWidth = modelContainer.clientWidth;
    const containerHeight = modelContainer.clientHeight;

    const containerVal = (containerWidth > containerHeight ? containerHeight : containerWidth);

    const widthPx = containerVal * widthPercent / 100;
    const heightPx = containerVal * heightPercent / 100;
    const depthPx = containerVal * depthPercent / 100;

    return [
        widthPx,
        heightPx,
        depthPx
    ];
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