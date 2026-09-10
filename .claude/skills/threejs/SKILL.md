---
name: threejs
description: Expert Three.js development for the MoxAI 3D configurator. Use when creating, modifying, debugging, or optimizing Three.js/WebGL/WebGPU code.
---

---

# Three.js Expert — MoxAI

This project contains a Three.js-based 3D exhibition stand configurator.

## Three.js version — CRITICAL

This project uses **Three.js r160**.

The project's local `three.module.js` confirms:

```js
const REVISION = '160';
```

**All Three.js code MUST be compatible with r160.**

Do NOT upgrade Three.js unless the user explicitly requests it.

Do NOT use APIs introduced after r160.

---

## Official Three.js r160 reference

The exact Three.js r160 source and official examples are available at:

`~/references/threejs-r160/`

This repository is the **PRIMARY Three.js reference for this project**.

Important directories:

```text
~/references/threejs-r160/
├── examples/       # Official Three.js examples
├── src/            # Three.js r160 source
├── docs/           # API documentation
├── manual/         # Official manual
└── ...
```

### Reference priority

When working on Three.js, use this priority:

1. Existing MoxAI project code
2. Official Three.js r160 examples
3. Official Three.js r160 source
4. Official Three.js r160 documentation
5. General Three.js knowledge

The installed/project version always takes priority over newer Three.js APIs.

---

## Core rule

**Before implementing a non-trivial Three.js feature, search the official r160 examples for an existing implementation or similar pattern.**

Do not invent an implementation if Three.js already demonstrates an established pattern.

The official examples are **references**, not code to copy blindly.

Adapt examples to the existing MoxAI architecture.

---

## Searching the official examples

Use the r160 repository:

```bash
find ~/references/threejs-r160/examples -iname '*keyword*'
```

For example:

```bash
find ~/references/threejs-r160/examples -iname '*raycast*'
```

```bash
find ~/references/threejs-r160/examples -iname '*gltf*'
```

```bash
find ~/references/threejs-r160/examples -iname '*transform*'
```

You can also search source code:

```bash
grep -R "OrbitControls" ~/references/threejs-r160/examples/
```

```bash
grep -R "Raycaster" ~/references/threejs-r160/examples/
```

For complicated features, search multiple related keywords before coding.

---

## API compatibility

The reference repository is specifically Three.js r160.

When uncertain about an API:

1. Search `~/references/threejs-r160/examples/`.
2. Search `~/references/threejs-r160/src/`.
3. Confirm that the API exists in r160.
4. Only then use it.

Never assume that an API found in general Three.js documentation is available in r160.

Do not use newer Three.js examples or documentation as the implementation source unless they are explicitly being used to understand a concept and the resulting implementation is verified against r160.

---

# MoxAI architecture

The existing application is a WordPress + Avada child theme.

The MoxAI Stand functionality lives primarily under:

```text
wp-content/themes/Avada-Child-Theme/
```

Relevant files include:

```text
inc/moxai_stand.php
inc/moxai_stand/
assets/js/moxai_stand.js
```

Other relevant files include:

* PHP shortcode files
* PHP template parts
* WordPress AJAX handlers
* existing MoxAI CSS/SCSS
* existing asset loading

The 3D configurator may be dynamically returned through:

```text
mox_ai_stand_get_configurator
```

Do not restructure the WordPress/PHP architecture unless explicitly requested.

---

# Frontend integration

Respect the existing:

* WordPress AJAX architecture
* PHP shortcodes
* dynamically generated HTML
* existing JavaScript architecture
* existing CSS/SCSS architecture
* Avada styles
* existing asset loading

Prefer the existing frontend architecture.

Do NOT introduce:

* React
* React Three Fiber
* Vue
* Vite
* Webpack
* another build system

unless explicitly requested.

If the configurator is vanilla JavaScript + Three.js, keep it vanilla JavaScript + Three.js.

---

# Three.js implementation preferences

Prefer established official Three.js patterns for:

* GLTFLoader
* DRACOLoader
* KTX2Loader
* OrbitControls
* TransformControls
* Raycaster
* AnimationMixer
* AnimationAction
* InstancedMesh
* WebGLRenderer
* EffectComposer
* post-processing
* environment maps
* PMREM
* HDR textures
* shadows
* ShaderMaterial
* custom shaders
* particles
* render targets
* object picking
* model interaction
* texture management

Before implementing these, search the official r160 examples.

---

# WebGPU / newer APIs

This project is locked to Three.js r160.

Do not introduce newer WebGPU, TSL, Nodes, or other APIs merely because they appear in current Three.js examples.

If WebGPU or another newer API is requested:

1. Check whether it exists in r160.
2. Check the official r160 examples/source.
3. If unavailable, clearly tell the user that it requires a Three.js upgrade.
4. Do not silently upgrade Three.js.

---

# 3D configurator

This is an exhibition stand configurator.

Pay particular attention to:

* model loading
* model hierarchy
* furniture placement
* object selection
* object highlighting
* raycasting
* camera controls
* dragging
* snapping
* rotation
* positioning
* collision/overlap
* shadows
* lighting
* environment reflections
* material replacement
* texture replacement
* transparent materials
* model visibility
* responsive canvas sizing
* mobile interaction
* loading states
* performance

Before implementing substantial functionality, search the official r160 examples for similar behavior.

---

# Models and GLB/glTF

Prefer GLB/glTF for 3D assets.

When working with a GLB/glTF model:

1. Inspect the scene hierarchy.
2. Identify meshes.
3. Identify materials.
4. Identify textures.
5. Identify animations.
6. Identify object names/userData where relevant.
7. Understand whether resources are shared.
8. Avoid unnecessary cloning.
9. Reuse geometry/materials when appropriate.
10. Properly dispose resources when objects/assets are removed.

For complicated GLTF functionality, inspect the official r160 GLTFLoader examples first.

---

# Materials

Prefer built-in Three.js materials when they can achieve the requested result.

Relevant materials include:

* MeshBasicMaterial
* MeshLambertMaterial
* MeshPhongMaterial
* MeshStandardMaterial
* MeshPhysicalMaterial
* ShaderMaterial

When working with materials, inspect official r160 examples for:

* roughness
* metalness
* transmission
* clearcoat
* environment maps
* normal maps
* displacement
* alpha
* transparency

Do not create a custom shader when a standard Three.js material can achieve the result adequately.

---

# Interaction

For interactive objects, prefer established Three.js patterns using:

* Raycaster
* PointerEvent
* OrbitControls
* TransformControls

when appropriate.

Before implementing object selection, dragging, highlighting, or manipulation, search the official r160 examples.

Keep interaction logic separate from rendering logic where practical.

---

# Rendering

Respect the project's existing renderer configuration.

Before changing rendering settings, inspect:

* renderer initialization
* camera
* tone mapping
* output color space
* pixel ratio
* shadow settings
* resize handling
* animation loop

Do not blindly copy renderer configuration from examples.

Use APIs available in Three.js r160.

---

# Animation and render loop

Do not perform expensive work every frame unless necessary.

Avoid inside the render loop:

* repeated DOM queries
* unnecessary object creation
* unnecessary Vector3/Quaternion/Euler allocations
* material cloning
* asset loading
* geometry creation
* rebuilding geometry
* repeated event registration

Reuse objects and resources where practical.

---

# Performance

The configurator must remain performant.

Pay attention to:

* draw calls
* geometry count
* material count
* texture memory
* GPU memory
* shader complexity
* shadow map resolution
* pixel ratio
* object count
* instancing
* frustum culling
* LOD
* asset compression

Prefer:

* geometry reuse
* material reuse
* texture reuse
* InstancedMesh where appropriate
* compressed GLB assets where appropriate

Do not optimize blindly.

Identify the expensive operation first.

---

# Resource disposal

When removing objects or replacing assets, properly dispose of resources where appropriate:

* geometries
* materials
* textures
* render targets

Be careful with shared resources.

Do not dispose of resources that are still being used elsewhere.

---

# Color management

Pay attention to:

* texture color spaces
* renderer output color space
* tone mapping
* environment maps
* lighting

Use the APIs available in Three.js r160.

Do not copy newer color-management APIs without verifying r160 compatibility.

---

# Debugging

When a Three.js feature does not work:

1. Inspect browser console errors.
2. Inspect renderer initialization.
3. Inspect camera position.
4. Inspect scene hierarchy.
5. Inspect object visibility.
6. Inspect materials.
7. Inspect lights/environment.
8. Inspect texture loading.
9. Inspect model loading.
10. Check event listeners.
11. Compare against an official r160 example.
12. Inspect the r160 source if API behavior is unclear.

Do not randomly change values until something works.

Find the underlying cause.

---

# UX

The configurator is user-facing.

Consider:

* loading indicators
* selection feedback
* hover feedback
* touch interaction
* responsive resizing
* mobile controls
* errors
* empty states
* accessibility of surrounding UI

Do not sacrifice usability for visual effects.

---

# Code changes

Before modifying Three.js code:

1. Inspect the existing implementation.
2. Understand how the configurator is initialized.
3. Understand how it is destroyed/reset.
4. Understand how PHP provides data to JavaScript.
5. Identify existing global variables and APIs.
6. Identify existing event listeners.
7. Identify existing render/animation loops.
8. Identify existing asset-loading mechanisms.

Make the smallest clean change that solves the problem.

Do not rewrite working systems unnecessarily.

Do not introduce a new architecture simply because an official example uses one.

---

# Final verification

After implementing a Three.js feature:

1. Verify Three.js r160 compatibility.
2. Check imports.
3. Check JavaScript syntax.
4. Check browser console errors.
5. Check model/texture loading.
6. Check resize behavior.
7. Check desktop interaction.
8. Check mobile interaction when relevant.
9. Check for obvious GPU/resource leaks.
10. Compare important implementation details against official r160 examples.

When useful, mention the official r160 example(s) that were used as implementation references.
