var initModelRegistry = new Map();

window.addEventListener('DOMContentLoaded', function () {

(async () => {
  const base = themeData.baseUrl;

  const THREE = await import(base + '/three.module.js');
  const { OrbitControls } = await import(base + '/OrbitControls.js');
  const { GLTFLoader } = await import(base + '/GLTFLoader.js');

    const mainContainer = document.querySelector('.config-modal-bottom');
    if (!mainContainer) return;

    const dataTexture = mainContainer.querySelector('.config-items-list').getAttribute('data-texture');

    const containers = mainContainer.querySelectorAll('.object-container');
    const topContainerItems = document.querySelectorAll('.config-modal-main .config-item-wrap .config-item .object-container');

    // Preload texture once
    const textureLoader = new THREE.TextureLoader();
    const texture = dataTexture ? textureLoader.load(dataTexture) : null;

    topContainerItems.forEach(topContainerItem => {
      const src = topContainerItem.getAttribute('data-src');
      if (!src) return;
      const containerId = topContainerItem.getAttribute('data-id');

      // Setup
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, topContainerItem.clientWidth / topContainerItem.clientHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
      renderer.setSize(topContainerItem.clientWidth, topContainerItem.clientHeight);
      topContainerItem.appendChild(renderer.domElement);

      // Controls & Light
      const controls = new OrbitControls(camera, renderer.domElement);
      const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
      scene.add(light);

      // Load model
      const loader = new GLTFLoader();
      loader.load(src, gltf => {
          const model = gltf.scene;

          /** center ***/
          const box = new THREE.Box3().setFromObject(model);
          const center = new THREE.Vector3();
          box.getCenter(center);
          // Center the model
          model.position.sub(center); 
          /*** center end ****/

          /******** set full size **********/
          const size = new THREE.Vector3();
  
          box.getSize(size);
          const maxDim = Math.max(size.x, size.y, size.z);
          const scaleFactor = 1 / maxDim;
          const additionalScale = 0.8;
          model.scale.setScalar(scaleFactor + additionalScale);

          camera.position.set(0, 0, 2);
          camera.lookAt(0, 0, 0);
          controls.target.set(0, 0, 0);
          controls.update();
          /******** end set full size **********/

          scene.add(model);

          initModelRegistry.set(containerId, model);

          model.traverse(node => {
              if (node.isMesh) {
              // Force replace material regardless of loader error
              node.material = new THREE.MeshStandardMaterial({
                  map: texture || null,
                  color: 0xffffff,
                  metalness: 0,
                  roughness: 1,
              });
              node.material.needsUpdate = true;
              }
          });
      });

      camera.position.set(0, 1, 3);

      const animate = () => {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };
      animate();
      return;


    });

    containers.forEach((container, index) => {
      const src = container.getAttribute('data-src');
      if (!src) return;
      const containerId = container.getAttribute('data-id');

      // Setup
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
      renderer.setSize(container.clientWidth, container.clientHeight);
      container.appendChild(renderer.domElement);

      // Controls & Light
      const controls = new OrbitControls(camera, renderer.domElement);
      const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
      scene.add(light);

      // Load model
      const loader = new GLTFLoader();
      loader.load(src, gltf => {
          const model = gltf.scene;

          /** center ***/
          const box = new THREE.Box3().setFromObject(model);
          const center = new THREE.Vector3();
          box.getCenter(center);
          // Center the model
          model.position.sub(center); 
          /*** center end ****/

          /******** set full size **********/
          const size = new THREE.Vector3();
          console.log("size: "+ size)
          box.getSize(size);
          const maxDim = Math.max(size.x, size.y, size.z);
          const scaleFactor = 1 / maxDim;
          const additionalScale = 0.8;
          model.scale.setScalar(scaleFactor + additionalScale);

          camera.position.set(0, 0, 2);
          camera.lookAt(0, 0, 0);
          controls.target.set(0, 0, 0);
          controls.update();
          /*****************/

          scene.add(model);
          initModelRegistry.set(containerId, model);

          model.traverse(node => {
              if (node.isMesh) {
              // Force replace material regardless of loader error
              node.material = new THREE.MeshStandardMaterial({
                  map: texture || null,
                  color: 0xffffff,
                  metalness: 0,
                  roughness: 1,
              });
              node.material.needsUpdate = true;
              }
          });
      });

      camera.position.set(0, 1, 3);

      const animate = () => {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };
      animate();
      return;
    });
    console.log(initModelRegistry)

  })();

})
