<?php


function get_default_config_settings_texture_ids($textureCategories, $furnitureTypes)
{
    
   return get_default_textures_array($textureCategories, $furnitureTypes, 2);
}

function get_default_config_settings_texture_object($textureCategories, $furnitureTypes, $renderPrices = false)
{
    $textureCategoriesMod = get_default_textures_array($textureCategories, $furnitureTypes, 1, true, $renderPrices);
    
   return $textureCategoriesMod;
}

function get_default_config_settings_textures($textureCategories, $furnitureTypes)
{
    $listData = get_default_textures_array($textureCategories, $furnitureTypes, 0);
   
    return $listData;
}

function get_ai_textures($standImageData) 
{
    $textures = [
        'brand' => [],
    ];

    if(isset($standImageData->brand->base64) && !empty($standImageData->brand->base64)) {
        $base64 = 'data:image/jpeg;base64,'. $standImageData->brand->base64;
        $attachment_data = save_product_attachment_id_from_base64($base64, 'brand');

        if(!empty($attachment_data)) {
            $textures['brand']['attachment'] = $attachment_data;
        } else {
            global $BRAND_TEXTURE;

            $textures['brand']['color'] = $BRAND_TEXTURE;
        }
        
    } else {
        global $BRAND_TEXTURE;

        $textures['brand']['color'] = $BRAND_TEXTURE;
    }

    return $textures;
}

function get_default_furniture_types_array($existingFurnitureTypes) 
{
    global $config_cookie_name_furniture_types;
    $cookie_settings = [];
    $selectedSlugs = [];

    if (isset($_COOKIE[$config_cookie_name_furniture_types])) {
        $cookie_settings = $_COOKIE[$config_cookie_name_furniture_types];
    }
    $existingTypesSlugs = array_column($existingFurnitureTypes, 'slug');

    if(empty($cookie_settings)) {
        $selectedSlugs = $existingTypesSlugs;
    } else {
        $slugs = explode(',', $cookie_settings);

        foreach($slugs as $slug) {
            if(in_array($slug, $existingTypesSlugs)) {
                $selectedSlugs[] = $slug;
            }
        }
    }

    return $selectedSlugs;
}

function get_default_textures_array($textureCategories, $furnitureTypes, $skipAdditionalData = 0, $renderParsedTextures = false, $renderPrices = false) {
    global $TEXTURE_ALL_SLUG, $config_textures_cookie;

    $textureCategoriesMod = [];
    $cookie_settings = [];
	$allFurnitureTypesIds = array_column($furnitureTypes, 'term_id');

    if (isset($_COOKIE[$config_textures_cookie])) {
        $cookie_raw = urldecode($_COOKIE[$config_textures_cookie]);
        $cookie_fixed = stripslashes($cookie_raw); 
        $cookie_settings = json_decode($cookie_fixed, true);
    }
    $texturesList = [];

    foreach($textureCategories as $category) {
        $slug = $category->slug;
        $parentId = $category->term_id;
        $categoryResult = (object) [
            'term_id' => $parentId,
            'slug' => $slug,
        ];
        $hasNoSubs = get_field('has_no_subcategories', $category);

        if($hasNoSubs) {
            $subcategorySlug = $TEXTURE_ALL_SLUG;
            $postsArr = get_furniture_texture_posts_by_types($parentId, null, 1);

            if(empty($postsArr)) {
                continue;
            }
            $keyName = $slug .'_'. $subcategorySlug;

            $sub = getSubcategoriesData(
                $cookie_settings, 
                $parentId,  
                $keyName,
                $skipAdditionalData,
                $renderPrices,
                $subcategorySlug
            );

            $categoryResult->same_colors = true;

            if($renderParsedTextures) {
                $texturesList[$keyName] = [
                    'id' => $sub->post_id,
                    'thumbnail' => $sub->thumbnail,
                    // 'prices' => $sub->prices
                ];
            }
            if($renderPrices) {
                $texturesList[$keyName]['prices'] = $sub->prices;
            }

            $categoryResult->subcategories = [$sub];
            
            $textureCategoriesMod[$parentId] = $categoryResult;
            continue;
        }

        $resultSubs = []; 
        $allSubcategory = null;
        $allSameColors = false;
        $selectedIdsArr = [];
        $allTermId = null;
        foreach($furnitureTypes as $index => $subcategory) {
            $name = $subcategory->name;
            $subcategorySlug = $subcategory->slug;
            $subcategoryId = $subcategory->term_id;
            if($subcategorySlug === $TEXTURE_ALL_SLUG) {
                $allTermId = $subcategoryId;
                continue;
            } 

            $postsArr = get_furniture_texture_posts_by_types($parentId, $subcategoryId, 1);

            if(empty($postsArr)) {
                continue;
            }

            $keyName = $slug.'_'.$subcategorySlug;
            $sub = getSubcategoriesData(
                $cookie_settings, 
                $parentId,  
                $keyName,
                $skipAdditionalData,
                $renderPrices,
                $subcategorySlug,
                $name,
                $subcategoryId,
                $furnitureTypes, 
                $allFurnitureTypesIds, 
                $allTermId,
            );

            $postId = $sub->post_id;

            $resultSubs[$subcategoryId] = $sub;

            if(!in_array($postId, $selectedIdsArr)) {
                $selectedIdsArr[] = $postId;
            }

            if($renderParsedTextures) {
                // $thumbnail = $sub->thumbnail;
                // $texturesList[$keyName] = $thumbnail;
                $texturesList[$keyName] = [
                    'id' => $sub->post_id,
                    'thumbnail' => $sub->thumbnail,
                    // 'prices' => $sub->prices
                ];
            }

            if($renderPrices) {
                $texturesList[$keyName]['prices'] = $sub->prices;
            }
        }

        $categoryResult->subcategories = $resultSubs;
        $categoryResult->same_colors = count($selectedIdsArr) == 1;

        $textureCategoriesMod[$parentId] = $categoryResult;
    }
    return $renderParsedTextures ? $texturesList : $textureCategoriesMod;

}

function getSubcategoriesData(
    $cookie_settings, 
    $parentId, 
    $keyName, 
    $skipAdditionalData,
    $renderPrices,
    $subcategorySlug,
    $name = null,
    $subcategoryId = null,
    $furnitureTypes = null, 
    $allFurnitureTypesIds = null, 
    $allTermId = null,
) 
{
    $post;
    if(
        isset($cookie_settings[$keyName]) && 
        isset($cookie_settings[$keyName]['id'])
    ) {
        $cookiePostId = $cookie_settings[$keyName]['id'];
        $postArray = get_furniture_texture_posts_by_types($parentId, $subcategoryId, 1, $cookiePostId);
        $post = empty($postArray) ? null : $postArray[0];
        if(empty($postArray)) {
            $postArray = get_furniture_texture_posts_by_types($parentId, $subcategoryId, 1);
        }
        $post = empty($postArray) ? null : $postArray[0];
    } else {
        $postArray = get_furniture_texture_posts_by_types($parentId, $allFurnitureTypesIds, 1);

        if(empty($postArray)) {
            $termIds = array_column($furnitureTypes, 'term_id');
            $termIds = array_values(
                array_diff($termIds, [$allTermId])
            );
            $postArray = get_furniture_texture_posts($termIds, 1);
            if(empty($postArray)) {
                $postArray = get_furniture_texture_posts($subcategoryId, 1);
            }
        }

        $post = empty($postArray) ? null : $postArray[0];

    }

    $postId = $post->ID ?? null;
    
    $thumbnail = has_post_thumbnail($postId)
        ? get_the_post_thumbnail_url($postId, 'thumbnail')
        : null;
    
    $sub = (object)[
        'term_id'   => $subcategoryId,
        'type_slug' => $subcategorySlug,
        'name' => $name,
        'post_id'   => $postId,
        'post_title'   => $post ? $post->post_title : '',
        'thumbnail' => $thumbnail,
        'prices'    => $skipAdditionalData === 0 || $renderPrices ? getWooPrices($postId) : null,
        'galleries' => $postId && ($skipAdditionalData === 0 || $skipAdditionalData === 2)
            ? fn() => (get_field('galleries', $postId)[$subcategorySlug] ?? null)
            : null,
    ];

    return $sub;
}

// function get_default_config_settings_textures()
// {
//     global $texture_front_slug;

//     $front_texture_list_args = array(
//         'posts_per_page' => 1000000,
//         'post_type' => 'furniture-texture',
//         'status' => 'publish',
//         'tax_query' => array(
//             array(
//                 'taxonomy' => 'furniture-texture-type',
//                 'field' => 'slug', 
//                 'terms' => $texture_front_slug,
//                 'include_children' => false
//             )
//         )
//     );

//     $front_textures = get_posts( $front_texture_list_args );

//     $default_front_texture = null;
//     $default_front_texture_id = null;
//     $default_front_texture_img = null;

//     $cookie_settings = '';

//     if (isset($_COOKIE['config_textures_data'])) {
//         $cookie_raw = urldecode($_COOKIE['config_textures_data']);
//         $cookie_fixed = stripslashes($cookie_raw); 
//         $cookie_settings = json_decode($cookie_fixed, true);
//     }

//     if(!empty($cookie_settings)) {
//         $default_front_texture_id = isset($cookie_settings['front_color_id']) ? $cookie_settings['front_color_id'] : null;;

//         $default_front_texture_args = array(
//             'p' => $default_front_texture_id,
//             'posts_per_page' => 1,
//             'post_type' => 'furniture-texture',
//             'status' => 'publish',
//             'tax_query' => array(
//                 array(
//                     'taxonomy' => 'furniture-texture-type',
//                     'field' => 'slug', 
//                     'terms' => $texture_front_slug,
//                     'include_children' => false
//                 )
//             )
//         );

//         $default_front_textures = get_posts( $default_front_texture_args );

//         if ( ! empty( $default_front_textures ) ) {
//             $default_front_texture = $default_front_textures[0];
//         }

//     } 
    
//     if(!$default_front_texture) {
//         $textures_loop = fetch_texture_list($texture_front_slug, 1);

//         if($textures_loop->have_posts()) {
//             $default_front_texture = $textures_loop->get_posts()[0];
//         }

//     }
    
//     $default_front_texture_id = $default_front_texture->ID;
//     $default_front_texture_thumbnail = get_the_post_thumbnail_url($default_front_texture_id, 'thumbnail');

//     // $woocommerce_front = get_field('woocommerce', $default_front_texture_id);
//     // $default_front_regular = floatval($woocommerce_front['regular_price']);
//     // $default_front_discount = floatval($woocommerce_front['discount_price']);
//     // $default_front_price = $default_front_discount && $default_front_discount > 0 ? $default_front_discount : $default_front_regular;

//     return [
//         'front' => [
//             'list' => $front_textures,
//             'object' => $default_front_texture,
//             'id' => $default_front_texture_id,
//             'thumbnail' => $default_front_texture_thumbnail,
//             'price' => getWooPrices($default_front_texture_id),
//         ],
//     ];
// }

function get_default_config_settings_components() {
    global $config_components_cookie;
    $cookie_settings = [];

    if (!isset($_COOKIE[$config_components_cookie])) return $cookie_settings;

    $cookie_raw = urldecode($_COOKIE[$config_components_cookie]);
    $cookie_fixed = stripslashes($cookie_raw); 
    $cookie_settings = json_decode($cookie_fixed, true);

    return $cookie_settings ?? [];
}

function getWooPrices($id, $fieldName = 'woocommerce') {
    $woocommerce = get_field($fieldName, $id);
    $regular = floatval($woocommerce['regular_price'] ?? 0 );
    $discount = floatval($woocommerce['discount_price'] ?? 0);
    $default_price = $discount && $discount > 0 ? $discount : $regular;

    return [
        'regular' => number_format($regular, 2, '.', ''),
        'discount' => number_format($discount, 2, '.', ''),
        'current' => number_format($default_price, 2, '.', ''),
    ];
}   

function getWooPricesByPricesField($prices) {
    $prices = (array) $prices;
    $regular = floatval($prices['regular'] ?? 0 );
    $discount = floatval($prices['discount'] ?? 0);
    $default_price = $discount && $discount > 0 ? $discount : $regular;

    return [
        'regular' => $regular,
        'discount' => $discount,
        'display' => $default_price,
    ];
}   

function get_furniture_texture_types($parentId = null, $furnitureTypeId = null) 
{
    $args = [
        'taxonomy'   => 'furniture-texture-type',
        'parent' => $parentId ?? 0,
        'hide_empty' => true,
        'orderby'    => 'name',
        'order'      => 'ASC',
    ];

    if($furnitureTypeId) {
        $args['meta_query'] = [
            'relation' => 'OR',
            [
                'key'     => 'available_furniture_types',
                'compare' => 'NOT EXISTS',
            ],
            [
                'key'     => 'available_furniture_types',
                'value'   => '',
                'compare' => '=',
            ],
            [
                'key'     => 'available_furniture_types',
                'value'   => '"' . (int) $furnitureTypeId . '"',
                'compare' => 'LIKE',
            ],
        ];
    }

    $types = get_terms($args);

    return $types;
}

function get_furniture_types($parentId = null) {
    global $TEXTURE_ALL_SLUG;
    $args = array(
        'taxonomy'   => 'config-furniture-type',
        'parent' => $parentId ?? 0,
        'hide_empty' => true,
        'orderby'    => 'name',
        'order'      => 'ASC',
    );


	$types = get_terms($args);

	return $types;
}


function get_furniture_type_by_slug($typeSlug) {
    $term = get_term_by('slug', $typeSlug, 'furniture-texture-type');

    if (!$term || is_wp_error($term)) {
        return null;
    }

	return $term;
}

function get_furniture_texture_posts_by_types($textureType, $furnitureType = null, $limit = 100000, $postId = null) {
    
    $taxonomyArgs = array(
        'taxonomy' => 'furniture-texture-type',
        'field' => 'term_id', 
        'terms' => $textureType,
        'include_children' => false
    );

    if($furnitureType) {
        $taxonomyArgs[] = array(
            'taxonomy' => 'config-furniture-type',
            'field' => 'term_id', 
            'terms' => $furnitureType,
            'include_children' => false
        );
    }

    $args = array(
        'post_type' => 'furniture-texture',
        'posts_per_page' => $limit,
        'tax_query' => array(
            'relation' => 'AND',
            $taxonomyArgs
        )
    );
	
	 if($postId) {
        $args['p'] = $postId;
    }

    $component_posts = get_posts( $args );
    return $component_posts;
}

function get_furniture_texture_categories($parentId = null) 
{
    $components_categories = get_terms([
        'taxonomy'   => 'furniture-texture-category',
        'parent' => $parentId ?? 0,
        'hide_empty' => true,
        'orderby'    => 'name',
        'order'      => 'ASC',
    ]);

    return $components_categories;
}

function get_furniture_texture_posts($categoryId, $limit = 100000, $postId = null)
{
    $args = array(
        'post_type' => 'furniture-texture',
        'posts_per_page' => $limit,
        'tax_query' => array(
            array(
                'taxonomy' => 'furniture-texture-category',
                'field' => 'id', 
                'terms' => $categoryId,
                'include_children' => false
            )
        )
    );
    if($postId) {
        $args['p'] = $postId;
    }

    $component_posts = get_posts( $args );
    return $component_posts;
}

function get_furniture_texture_posts_by_slug($categorySlug, $limit = 100000)
{
    $args = array(
        'post_type' => 'furniture-texture',
        'posts_per_page' => $limit,
        'tax_query' => array(
            array(
                'taxonomy' => 'furniture-texture-category',
                'field' => 'slug', 
                'terms' => $categorySlug,
                'include_children' => false
            )
        )
    );

    $component_posts = get_posts( $args );
    return $component_posts;
}

function get_furniture_texture_posts_by_furniture_type_slug($textureType, $furnitureType, $limit = 100000, $postId = null)
{
    $args = array(
        'post_type' => 'furniture-texture',
        'posts_per_page' => $limit,
        'tax_query' => array(
            array(
                'taxonomy' => 'furniture-texture-type',
                'field' => 'slug', 
                'terms' => $textureType,
                // 'include_children' => false
            ),
            array(
                'taxonomy' => 'config-furniture-type',
                'field' => 'slug', 
                'terms' => $furnitureType,
                'include_children' => false
            ),
        )
    );

    if($postId) {
        $args['p'] = intval($postId);
    }

    $component_posts = get_posts( $args );
    return $component_posts;
}

function get_furniture_component_types()
{
    $components_types = get_terms([
        'taxonomy'   => 'config-furniture-type',
        'parent' => 0,
        'hide_empty' => true,
    ]);

    return $components_types;
}

function get_furniture_component_types_by_slug($slug)
{
    
    $furnitureType = get_term_by(
        'slug',
        $slug,
        'config-furniture-type'
    );

    return $furnitureType;
}

function get_furniture_component_categories($parentId = null)
{
    $components_categories = get_terms([
        'taxonomy'   => 'furniture-component-category',
        'parent' => $parentId ?? 0,
        'hide_empty' => true,
    ]);

    return $components_categories;
}

function get_furniture_component_categories_filtered_by_furniture_types($furnitureTypes) 
{
    $allCategories = get_furniture_component_categories();
    $availableCategories = [];

    foreach($allCategories as $category) {
        $termId = $category->term_id;

        foreach($furnitureTypes as $furnitureType) {
            $furnitureTypeId = $furnitureType->term_id;
            $posts = get_furniture_component_posts_by_taxonomies($termId, $furnitureTypeId, 1);

            if(!empty($posts)) {
                $availableCategories[] = $category;
            }
        }
    }

    return $availableCategories;

}


function get_furniture_component_posts($categoryId = null, $limit = 100000, $postId = null)
{
    $taxonomies = [];

    if($categoryId) {
        $taxonomies[] = array(
            'taxonomy' => 'furniture-component-category',
            'field' => 'id', 
            'terms' => $categoryId,
            'include_children' => false
        );
    }

    $args = array(
        'post_type' => 'furniture-component',
        'posts_per_page' => $limit,
    );

    if(!empty($taxonomies)) {
        $args['tax_query'] = $taxonomies;
    }

    if(!empty($postId)) {
        $args['p'] = $postId;
    }

    $component_posts = get_posts( $args );
    return $component_posts;
}

function get_furniture_component_posts_by_taxonomies($categoryId = null, $furnitureTypeId = null, $limit = 100000)
{
    $taxonomies = [];
    $args = array(
        'post_type' => 'furniture-component',
        'posts_per_page' => $limit,
    );

    if($categoryId) {
        $taxonomies[] = array(
            'taxonomy' => 'furniture-component-category',
            'field' => 'id', 
            'terms' => $categoryId,
            'include_children' => false
        );
    }
    if($furnitureTypeId) {
        $taxonomies[] = array(
            'taxonomy' => 'config-furniture-type',
            'field' => 'id', 
            'terms' => $furnitureTypeId,
            'include_children' => false
        );
    }

    if(!empty($taxonomies)) {
        $args['tax_query'] = $taxonomies;
    }

    $component_posts = get_posts( $args );
    return $component_posts;
}

function getProductThumbnailData($standImageData, $productId) {
    $attachmentUrl = null;
    $attachmentId = null;
    $attachmentTypes = get_the_terms($productId, 'config-thumbnail-type');
    $typeSlug = null;

    $defaultThumbnailId = get_post_thumbnail_id($productId);

    if(!empty($attachmentTypes)) {
        $attachmentType = $attachmentTypes[0];
        $typeSlug = $attachmentType->slug;

        if(isset($standImageData->$typeSlug)) {
            $base64 = $standImageData->$typeSlug->base64;
            $attachment_data = save_product_attachment_id_from_base64($base64, 'thumbnail');

            if(!empty($attachment_data) && isset($attachment_data['attachment_id'])) {
                $attachmentId = $attachment_data['attachment_id'];
                $attachmentUrl = $attachment_data['url'];
            //     $textures['brand']['attachment'] = $attachment_data;
            } 
        } 
    }

    if(!$attachmentId) {
        $attachmentId = get_post_thumbnail_id($productId);
        $attachmentUrl = wp_get_attachment_image_url( $defaultThumbnailId, 'full' );
    } 
    

    return [
        'attachmentType' => $typeSlug,
        'id' => $attachmentId,
        'url' => $attachmentUrl,
    ];
}

function create_texture_slug($catSlug, $subcatSlug, $allTerms) {
    global $TEXTURE_ALL_SLUG;

    $slug = '';

    if(!empty($allTerms) && $subcatSlug === $TEXTURE_ALL_SLUG) {
        $arr = [];
        foreach($allTerms as $term) {
            $termSlug = $term->slug;
            if($termSlug === $TEXTURE_ALL_SLUG) continue;
            $arr[] = $catSlug .'_'. $termSlug;
        }

        $slug = implode(',', $arr);
    } else {
        $slug = $catSlug .'_'. $subcatSlug;
    }

    return $slug;
}


function get_products_query($furnitureTypes = null, $page = 1, $postPerPage = 12, $productId = false) {
    $taxonomies = [];  

    $args = array(  
        'post_type' => 'product',
        'posts_per_page' => $postPerPage,
		// 'numberposts' => $postPerPage,
        'paged' => $page,
    	'suppress_filters' => true, 
    );

    if($furnitureTypes) {
        $taxonomies[] = array(
            'taxonomy' => 'config-furniture-type',
            'field' => 'slug', 
            'terms' => $furnitureTypes,
            'include_children' => false
        );
    }

    if ($productId) {
        $args['p'] = $productId;
    }

    if(!empty($taxonomies)) {
        $args['tax_query'] = $taxonomies;
    }

    $loop = new WP_Query($args);

    return $loop;
}

function toSafeFloat($value) {
    return is_numeric($value) ? (float) $value : 0;
}

function getBrantTitleSuffrix($hasBrandTexture) {
    return $hasBrandTexture ? ' (brand)' : '';
}

function save_product_attachment_id_from_base64($base64, $prefix = 'img', $isTempFolder = true) 
{
    if (empty($base64)) {
        return null;
    }

    // Remove data URL prefix if exists
    if (strpos($base64, 'base64,') !== false) {
        $base64 = substr($base64, strpos($base64, ',') + 1);
    }

    $base64 = str_replace(' ', '+', $base64);

    $image_data = base64_decode($base64);

    if (!$image_data) {
        return null;
    }

    // Create image resource
    $image = imagecreatefromstring($image_data);

    if (!$image) {
        return null;
    }

    $upload_dir = wp_upload_dir();

    $custom_folder = $isTempFolder ? 'temp-configurator' : 'configurator';

    // Custom folder inside uploads
    $custom_dir = trailingslashit($upload_dir['basedir']) . $custom_folder;

    // Create folder if not exists
    if (!file_exists($custom_dir)) {
        wp_mkdir_p($custom_dir);
    }

    $filename = $prefix . '-' . uniqid() . '.jpg';

    $file_path = trailingslashit($custom_dir) . $filename;

    // RELATIVE PATH (without domain)
    $relative_path = $custom_folder . '/' . $filename;

    // Save as JPG
    imagejpeg($image, $file_path, 90);

    imagedestroy($image);

    $attachment = [
        'post_mime_type' => 'image/jpeg',
        'post_title'     => sanitize_file_name(pathinfo($filename, PATHINFO_FILENAME)),
        'post_content'   => '',
        'post_status'    => 'inherit',
    ];

    $attachment_id = wp_insert_attachment($attachment, $file_path);

    if (is_wp_error($attachment_id)) {
        return null;
    }

    require_once ABSPATH . 'wp-admin/includes/image.php';

    wp_update_attachment_metadata($attachment_id, []);
    // $metadata = wp_generate_attachment_metadata($attachment_id, $file_path);

    // wp_update_attachment_metadata($attachment_id, $metadata);

    return [
        'attachment_id' => $attachment_id,
        'url' => $relative_path,
    ];
}

function move_temp_attachment_to_permanent_folder_or_replace($attachment_id, $isTempFolder = false, $prefix = 'img')
{
    $attachment_id = intval($attachment_id);

    if (!$attachment_id) {
        return null;
    }

    $old_path = get_attached_file($attachment_id);

    if (!$old_path || !file_exists($old_path)) {
        return null;
    }

    $normalized_path = wp_normalize_path($old_path);

    $is_in_configurator =
        strpos($normalized_path, '/configurator/') !== false;

    $is_in_temp_configurator =
        strpos($normalized_path, '/temp-configurator/') !== false;

    $relative_path = get_post_meta($attachment_id, '_wp_attached_file', true);

    if (!$isTempFolder && $is_in_configurator && !$is_in_temp_configurator) {
        return [
            'attachment_id' => $attachment_id,
            'url' => $relative_path,
        ];
    }

    if ($isTempFolder && $is_in_temp_configurator) {
        return [
            'attachment_id' => $attachment_id,
            'url' => $relative_path,
        ];
    }

    if (!$is_in_configurator && !$is_in_temp_configurator) {
        return [
            'attachment_id' => $attachment_id,
            'url' => $relative_path,
        ];
    }

    // if (!$is_in_configurator && !$is_in_test_configurator) {

    //     return [
    //         'attachment_id' => $attachment_id,
    //         'url' => $relative_path,
    //     ];
    // }

    $upload_dir = wp_upload_dir();

    // uploads/configurator
    $custom_folder = $isTempFolder ? 'temp-configurator' : 'configurator';

    $custom_dir = trailingslashit($upload_dir['basedir']) . $custom_folder;

    if (!file_exists($custom_dir)) {
        wp_mkdir_p($custom_dir);
    }

    $extension = pathinfo($old_path, PATHINFO_EXTENSION);

    $filename = $prefix . '-' . uniqid() . '.' . $extension;

    $new_path = trailingslashit($custom_dir) . $filename;

    // Move file
    if (!rename($old_path, $new_path)) {
        return null;
    }

    // Relative path for WP
    $relative_path = $custom_folder . '/' . $filename;

    // Update attachment file path
    update_attached_file($attachment_id, $new_path);

    // Important
    update_post_meta(
        $attachment_id,
        '_wp_attached_file',
        $relative_path
    );

    // Update metadata
    wp_update_attachment_metadata($attachment_id, [
        'file' => $relative_path,
    ]);

    return [
        'attachment_id' => $attachment_id,
        'url' => $relative_path,
    ];
}

function save_ai_textures_attachments($aiTextures, $tempAttachment) {
    $modTextures = [];

    foreach($aiTextures as $key => $texture) {
        $texture = (array) $texture;
        if(
            !isset($texture[$key]['attachment']['attachment_id']) ||
            empty($texture[$key]['attachment']['attachment_id'])
        ) {
            $modTextures[$key] = $texture;
            continue;
        }

        $attachment_id = $texture[$key]['attachment']['attachment_id'];

        $attachment_data = move_temp_attachment_to_permanent_folder_or_replace($attachment_id, $tempAttachment);

        $texture[$key] = $attachment_data;
        
        $modTextures[$key] = $texture;
    }

    return $modTextures;
}

function set_product_value(&$product, $key, $value) {
    if (is_array($product)) {
        $product[$key] = $value;
    } elseif (is_object($product)) {
        $product->{$key} = $value;
    }
}

function set_db_data_value(&$product, $key, $value) {
    if (is_array($product)) {
        if (is_object($product['db_data'])) {
            $product['db_data']->{$key} = $value;
        } else {
            $product['db_data'][$key] = $value;
        }
    } elseif (is_object($product)) {
        if (is_object($product->db_data)) {
            $product->db_data->{$key} = $value;
        } else {
            $product->db_data[$key] = $value;
        }
    }
}