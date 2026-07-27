<?php 

function get_default_textures_for_products($furnitureType, $textureTypes, $productId = null, $furnitureAllType = null)
{
    global $config_textures_cookie;
    
    $textureTypesMod = [];
    $texturesList = [];
    $cookie_settings = [];
    $typeName = $furnitureType->name;
    $typeSlug = $furnitureType->slug;
    $typeId = $furnitureType->term_id;

    $allTypeName = $furnitureAllType ? $furnitureAllType->name : null;
    $allTypeSlug = $furnitureAllType ?  $furnitureAllType->slug : null;
    $allTypeId =  $furnitureAllType ? $furnitureAllType->term_id : null;

    if (isset($_COOKIE[$config_textures_cookie .'_'. $productId])) {
        $cookie_raw = urldecode($_COOKIE[$config_textures_cookie .'_'. $productId]);
        $cookie_fixed = stripslashes($cookie_raw); 
        $cookie_settings = json_decode($cookie_fixed, true);
    } else if (isset($_COOKIE[$config_textures_cookie])) {
        $cookie_raw = urldecode($_COOKIE[$config_textures_cookie]);
        $cookie_fixed = stripslashes($cookie_raw); 
        $cookie_settings = json_decode($cookie_fixed, true);
    }

    foreach($textureTypes as $textureType) {
        $parentSlug = $textureType->slug;
        $parentId = $textureType->term_id;
        $children = []; 
        $allTypeKeyName = $parentSlug .'_'. $allTypeSlug;
        $typeKeyName = $parentSlug .'_'. $typeSlug;

        $sub = getSubcategoriesDataSingleProductsPage(
            $cookie_settings, 
            $parentId,  
            $allTypeId,
            $allTypeSlug,
            $allTypeName,
            $allTypeKeyName,
            $typeId,
            $typeSlug,
            $typeName,
            $typeKeyName,
        );

        $children[] = $sub;
        $texturesList[$typeKeyName] = [
            'id' => $sub->post_id,
            'thumbnail' => $sub->thumbnail,
        ];

        $categoryResult = (object) [
            'term_id' => $parentId,
            'slug' => $parentSlug,
            'subcategories' => $children,
            'same_colors' => false,
        ];
        $textureTypesMod[$parentId] = $categoryResult;
    }

    return [
        'texture_types' => $textureTypesMod,
        'texture_list' => $texturesList,
    ];
} 

function get_textures_cookie_for_product($productId, $productType, $differentTextureSettingsArr, $textureTypes)
{
    global $config_textures_cookie, $TEXTURE_ALL_SLUG;
    $productCookie = null;
    $globalCookie = null;
    $differentCookieVals = null;

    if (isset($_COOKIE[$config_textures_cookie .'_'. $productId])) {
        $cookie_raw = urldecode($_COOKIE[$config_textures_cookie .'_'. $productId]);
        $cookie_fixed = stripslashes($cookie_raw); 
        $productCookie = json_decode($cookie_fixed, true);
    } 
    
    if (isset($_COOKIE[$config_textures_cookie])) {
        $cookie_raw = urldecode($_COOKIE[$config_textures_cookie]);
        $cookie_fixed = stripslashes($cookie_raw); 
        $globalCookie = json_decode($cookie_fixed, true);
    }

    if(empty($productCookie)) {
        return $differentTextureSettingsArr;
    } 
    
    $differentSettingsArr = [];
    if(empty($globalCookie)) {
        $differentSettingsArr = $productCookie;
    } else {
        $currentCookieArray = $globalCookie;
        foreach($productCookie as $key => $value) {
            if (!array_key_exists($key, $globalCookie)) {
                $differentSettingsArr = $productCookie;
                break;
            }
        }
    }
    $texturesArr = [];
    $usedTextureTypes = [];

    foreach($differentSettingsArr as $key => $item) {
        $keyExploded = explode('_', $key);
        $textureType = $keyExploded[0];
        $modKey = $textureType . '_' . $productType;
    
        if(!in_array($textureType, $usedTextureTypes)) {
            $usedTextureTypes[] = $textureType;
        }
        $postId = $item['id'];

        $posts = get_furniture_texture_posts_by_furniture_type_slug($textureType, $productType, 1, $postId);
        $post = null;
        if(empty($posts)) {
            $posts = get_furniture_texture_posts_by_furniture_type_slug($textureType, $TEXTURE_ALL_SLUG, 1);

            if(empty($posts)) {
                $posts = get_furniture_texture_posts_by_furniture_type_slug($textureType, $productType, 1);

                if(!empty($posts)) {
                    $post = $posts[0];
                }
            } else {
                $post = $posts[0];
            }
        } else {
            $post = $posts[0];
        }

        $newPostId = $post ? $post->ID : null;

        $thumbnail = has_post_thumbnail($newPostId)
            ? get_the_post_thumbnail_url($newPostId, 'thumbnail')
            : null;

        $item['thumbnail'] = $thumbnail;
        $texturesArr[$modKey] = $item;
    }   

    if(count($usedTextureTypes) < count($textureTypes)) {
        foreach($textureTypes as $textureType) {
            $slug = $textureType->slug;
            if(in_array($slug, $usedTextureTypes)) {
                continue;
            }
            $merged_slug = $slug .'_'. $productType;
            $posts = get_furniture_texture_posts_by_furniture_type_slug($slug, $productType, 1);
            $post = null;
            if(empty($posts)) {
                $posts = get_furniture_texture_posts_by_furniture_type_slug($slug, $TEXTURE_ALL_SLUG, 1);
                $post = null;

                if(!empty($posts)) {
                    $post = $posts[0];
                } 
            } else {
                $post = $posts[0];
            }

            if($post) {
                $newPostId = $post->ID;
         
                $thumbnail = has_post_thumbnail($newPostId)
                    ? get_the_post_thumbnail_url($newPostId, 'thumbnail')
                    : null;

                $item['thumbnail'] = $thumbnail;
                $texturesArr[$merged_slug] = $item;
            }
        }
    }

    $differentTextureSettingsArr[$productId] = $texturesArr;

    return $differentTextureSettingsArr;
}

function getSubcategoriesDataSingleProductsPage(
    $cookie_settings, 
    $parentId, 
    $allTypeId,
    $allTypeSlug,
    $allTypeName,
    $allTypeKeyName,
    $typeId,
    $typeSlug,
    $typeName,
    $typeKeyName,
) 
{
    $post = null;
    $subcategoryId = null; 
    $subcategorySlug = null; 
    $subcategoryName = null;

    if(
        isset($cookie_settings[$allTypeKeyName]) && 
        isset($cookie_settings[$allTypeKeyName]['id'])
    ) {
        $cookiePostId = $cookie_settings[$allTypeKeyName]['id'];
        $postArray = get_furniture_texture_posts_by_types($parentId, $allTypeId, 1, $cookiePostId);
        $post = empty($postArray) ? null : $postArray[0];

        if($post) {
            $subcategoryId = $allTypeId; 
            $subcategorySlug = $allTypeSlug; 
            $subcategoryName = $allTypeName;
        }
    } 
    if(
        !$post &&
        isset($cookie_settings[$typeKeyName]) && 
        isset($cookie_settings[$typeKeyName]['id'])
    ){
        $cookiePostId = $cookie_settings[$typeKeyName]['id'];
        $postArray = get_furniture_texture_posts_by_types($parentId, $typeId, 1, $cookiePostId);
        $post = empty($postArray) ? null : $postArray[0];

        if($post) {
            $subcategoryId = $typeId; 
            $subcategorySlug = $typeSlug; 
            $subcategoryName = $typeName;
        } 
    }

    if(!$post) {
        $postArray = get_furniture_texture_posts_by_types($parentId, $allTypeId, 1);
        if(empty($postArray)) {
            $postArray = get_furniture_texture_posts_by_types($parentId, $typeId, 1);
            if(!empty($postArray)) {
                $post = $postArray[0];
                $subcategoryId = $typeId; 
                $subcategorySlug = $typeSlug; 
                $subcategoryName = $typeName;
            }
        } else {
            $subcategoryId = $allTypeId; 
            $subcategorySlug = $allTypeSlug; 
            $subcategoryName = $allTypeName;
            $post = $postArray[0];
        }
        
    }

    $postId = $post->ID ?? null;
    
    $thumbnail = has_post_thumbnail($postId)
        ? get_the_post_thumbnail_url($postId, 'thumbnail')
        : null;

    $sub = (object)[
        'term_id'   => $subcategoryId,
        'type_slug' => $subcategorySlug,
        'name' => $subcategoryName,
        'post_id'   => $postId,
        'post_title'   => $post ? $post->post_title : '',
        'thumbnail' => $thumbnail,
        'prices' => getWooPrices($postId),
    ];

    return $sub;
}

// function renderSingleFurnitureTypeData($parentId, $parentSlug, $typeId, $typeSlug, $typeName, $cookie_settings, $children) {
//     $postsArr = get_furniture_texture_posts_by_types($parentId, $typeId, 1);
//     $skipAdditionalData = true;

//     if(empty($postsArr)) {
//         return $children;
//     }

//     $keyName = $parentSlug.'_'.$typeSlug;

//     $sub = getSubcategoriesDataSingleProductsPage(
//         $cookie_settings, 
//         $parentId,  
//         $keyName,
//         $skipAdditionalData,
//         $typeSlug,
//         true,
//         $typeName,
//         $typeId,
//         $texturesList
//     );
//     $children[$keyName] = $sub;

//     return $children;
// }

function getDefaultProductSettingsDimensions($productId)
{
    $height = get_field('height', $productId);
    $height_standard = 0;
    $height_min = 0;
    $height_max = 0;
    $room_height = 0;
    $max_dimension = 0;

    if($height) {
        $height_standard = intval($height['default']);
        $height_min = intval($height['min']);
        $height_max = intval($height['max']);
    }

    $depth = get_field('depth', $productId);
    $depth_standard = 0;
    $depth_min = 0;
    $depth_max = 0;

    if($depth) {
        $depth_standard = intval($depth['default']);
        $depth_min = intval($depth['min']);
        $depth_max = intval($depth['max']);
    }

    $width = get_field('width', $productId);
    $width_standard = 0;
    $width_min = 0;
    $width_max = 0;

    if($width) {
        $width_standard = intval($width['default']);
        $width_min = intval($width['min']);
        $width_max = intval($width['max']);
    }

    $room_height = $height_max;
    if($room_height < $depth_max) {
        $room_height = $depth_max;
    } else if($room_height < $width_max) {
        $room_height = $width_max;
    }

    $max_dimension = $room_height + 10;

    return [
        $room_height,
        $max_dimension,
        $height_standard,
        $height_min,
        $height_max,
        $depth_standard,
        $depth_min,
        $depth_max,
        $width_standard,
        $width_min,
        $width_max,
    ];
}

function getDefaultProductSettingsComponents($productId, $productFurnitureType) {
    global $config_components_cookie, $FURNITURE_TYPE_ALL_SLUG;
    $cookie_settings = [];


     if (isset($_COOKIE[$config_components_cookie .'_'. $productId])) {
        $cookie_raw = urldecode($_COOKIE[$config_components_cookie .'_'. $productId]);
        $cookie_fixed = stripslashes($cookie_raw); 
        $cookie_settings = json_decode($cookie_fixed, true);
    } else if (isset($_COOKIE[$config_components_cookie])) {
        $cookie_raw = urldecode($_COOKIE[$config_components_cookie]);
        $cookie_fixed = stripslashes($cookie_raw); 
        $cookie_settings = json_decode($cookie_fixed, true);
    }
    //     // $cookie_settings = [];
        
    //     // foreach($cookie_settings_temp as $setting) {
    //     //     if(!$setting['id']) {
    //     //         continue;
    //     //     }
    //     //     $postId = $setting['id'] ?? null;
    //     //     $terms = get_the_terms(intval($postId), 'config-furniture-type');
    //     //     if(empty($terms)) continue;

    //     //     $furnitureType = $terms[0]->slug;

    //     //     if(
    //     //         $furnitureType == $FURNITURE_TYPE_ALL_SLUG || 
    //     //         $furnitureType == $productFurnitureType
    //     //     ) {
    //     //         $cookie_settings[] = $setting;
    //     //     }
    //     // }
    // }

    // if(empty($cookie_settings_products) || empty($cookie_settings_general)) {
    //     $cookie_settings = array_merge($cookie_settings_products, $cookie_settings_general);
    // } else {

    // }

    return $cookie_settings ?? [];
}

// function getProductTotals(
//     $product_id, 
//     $furnitureType,
//     $textures,
//     $options,
//     $current_width,
//     $current_height,
//     $current_depth,
//     $components = null,
//     $is_grouped_components = false,
//     $need_data = false,
//     $existingOptions = null,
// ) 
// {
//     $width = get_field('width', $product_id);
//     $height = get_field('height', $product_id);
//     $depth = get_field('depth', $product_id);
//     $min_width = $width ? intval($width['min']) : 0;  
//     $min_height = $height ? intval($height['min']) : 0;  
//     $min_depth = $depth ? intval($depth['min']) : 0;  
//     $current_width_m = $current_width / 1000;
//     $current_height_m = $current_height / 1000;
//     $current_depth_m = $current_depth / 1000;

//     list($textures_display_price, $textures_regular_total, $textures_discount_total, $texturesData) = getTextureTotalsV2($product_id, $furnitureType, $textures, $current_width_m, $current_height_m, $current_depth_m, $need_data);

//     $cm3_total = getCubicTotalsV2( 
//         $product_id,
//         $min_width, 
//         $min_height, 
//         $min_depth,
//         $current_width,
//         $current_height,
//         $current_depth
//     );  
//     $cm3_display = $cm3_total['display'];

//     $mod_components = null;
//     if($components) {
//        $components_data = $is_grouped_components ? getComponentsTotalGroupedArrayV2($components, $need_data) : getComponentsTotalSimpleArrayV2($components);
//        $components_totals_regular = $components_data[0];
//        $components_totals_discount = isset($components_data[1]) ? $components_data[1] : null;
//        $mod_components = isset($components_data[1]) ? $components_data[1] : null;
//     }

//     $options_prices = getSelectedOptionPrice($product_id, $options, $existingOptions);
//     $options_display_price = $options_prices['display'];

//     $regular_price = get_post_meta( $product_id, '_regular_price', true);
//     $discount_price = floatval(get_post_meta( $product_id, '_sale_price', true));
//     $display_price = floatval($discount_price && $discount_price > 0 ? $discount_price : $regular_price);

//     $total = floatval($regular_price) + floatval($textures_display_price) + floatval($options_display_price) + $cm3_display;
//     $discount_total = floatval($discount_price) > 0 ? (floatval($discount_price) + floatval($textures_display_price)  + floatval($options_display_price) + $cm3_display) : 0.00;

//     return [
//         'regular_total' => $total,
//         'discount_total' => $discount_total,
//         'display_total' => $discount_total && $discount_total > 0 ? $discount_total : $total,
//         'total_cm3' => $cm3_total,
//         'display' => floatval($display_price),
//         'regular' => floatval($regular_price),
//         'discount' => floatval($discount_price),
//         'texture' => $texturesData,
//         'components' => $mod_components,
//         'options' => $options_prices,
//     ];
// }

function getProductTotals(
    $product_id, 
    $furnitureType,
    $hasBrandTexture,
    $textures,
    $current_width,
    $current_height,
    $current_depth,
    $components = null,
    $is_grouped_components = false,
    $need_data = false,
) {
    $width  = get_field('width', $product_id);
    $height = get_field('height', $product_id);
    $depth  = get_field('depth', $product_id);

    $min_width  = $width ? intval($width['min']) : 0;  
    $min_height = $height ? intval($height['min']) : 0;  
    $min_depth  = $depth ? intval($depth['min']) : 0;  

    $current_width_m  = toSafeFloat($current_width) / 1000;
    $current_height_m = toSafeFloat($current_height) / 1000;
    $current_depth_m  = toSafeFloat($current_depth) / 1000;

    list($textures_display_price, $textures_regular_total, $textures_discount_total, $texturesData) =
        getTextureTotalsV2(
            $product_id,
            $hasBrandTexture,
            $furnitureType,
            $textures,
            $current_width_m,
            $current_height_m,
            $current_depth_m,
            $need_data
        );

    $textures_display_price = toSafeFloat($textures_display_price);

    $cm3_total = getCubicTotalsV2(
        $product_id,
        $min_width,
        $min_height,
        $min_depth,
        $current_width,
        $current_height,
        $current_depth
    );

    $cm3_display = isset($cm3_total['display'])
        ? toSafeFloat($cm3_total['display'])
        : 0;

    $mod_components = null;

    if ($components) {
        $components_data = $is_grouped_components
            ? getComponentsTotalGroupedArrayV2($components, $need_data)
            : getComponentsTotalSimpleArrayV2($components);

        $components_totals_regular  = isset($components_data[0]) ? toSafeFloat($components_data[0]) : 0;
        $components_totals_discount = isset($components_data[1]) ? toSafeFloat($components_data[1]) : 0;

        $mod_components = $components_data[1] ?? null;
    }

    $regular_price = get_post_meta($product_id, '_regular_price', true);
    $discount_price = get_post_meta($product_id, '_sale_price', true);

    $regular_price = toSafeFloat($regular_price);
    $discount_price = toSafeFloat($discount_price);

    $display_price = $discount_price > 0
        ? $discount_price
        : $regular_price;

    $total =
        $regular_price +
        $textures_display_price +
        $cm3_display;

    $discount_total = $discount_price > 0
        ? (
            $discount_price +
            $textures_display_price +
            $cm3_display
        )
        : 0.00;

    return [
        'regular_total'  => $total,
        'discount_total' => $discount_total,
        'display_total'  => $discount_total > 0 ? $discount_total : $total,
        'total_cm3'      => $cm3_total,
        'display'        => $display_price,
        'regular'        => $regular_price,
        'discount'       => $discount_price,
        'texture'        => $texturesData,
        'components'     => $mod_components,
    ];
}

function getTextureTotalsV2(
    $productId,
    $hasBrandTexture,
    $furnitureType,
    $textures,
    $width_m, 
    $height_m, 
    $depth_m,
    $needData
)
{
    $totalRegular = 0;
    $totalDiscount = 0;
    $display_price = 0;
    $totalsArray = [];

    return [$display_price, $totalRegular, $totalDiscount, $totalsArray];

    if($hasBrandTexture) {
        return [$display_price, $totalRegular, $totalDiscount, $totalsArray];
    };

    $default_brim_width = (int) get_theme_mod('default_brim_width', 25);
    $defaultBrimWidth_m = floatval($default_brim_width) / 1000;

    if(!$needData) {
        foreach($textures as $mergedSub => $texture) {
            $texture = (object) $texture;
            $textureId = intval($texture->id);
            $price = getWooPrices($textureId);
            $textureType = explode('_', $mergedSub)[0];
            
            $data = getTextureTotalsV2Method($productId, $textureType, $price, $width_m, $height_m, $depth_m, $defaultBrimWidth_m);

            $totalRegular += $data['regular'];
            $totalDiscount += $data['discount'];
        }
    } else {
        foreach($textures as $mergedSub => $texture) {
            $texture = (object) $texture;
            $textureId = intval($texture->id);
            $price = getWooPrices($textureId);
            $textureType = explode('_', $mergedSub)[0];
            $textureTypeObj = get_furniture_type_by_slug($textureType);

            $data = getTextureTotalsV2Method($productId, $textureType, $price, $width_m, $height_m, $depth_m, $defaultBrimWidth_m);
            $regular = $data['regular'];
            $discount = $data['discount'];

            $totalsArray[] = [
                'id' => $textureId,
                'name' => get_the_title($textureId),
                'image' => get_the_post_thumbnail_url($textureId, 'thumbnail'),
                'regular_price' => $price['regular'],
                'regular_price_total' => $data['regular'],
                'discount_price' => $price['discount'],
                'discount_price_total' => $data['discount'],
                'texture_type' => [
                    'id' => $textureTypeObj ? $textureTypeObj->term_id : null,
                    'slug' => $textureTypeObj ? $textureTypeObj->slug : null,
                    'name' => $textureTypeObj ? $textureTypeObj->name : null,
                ], 
            ];

            $totalRegular += $regular;
            $totalDiscount += $discount;
        }
    }

    $display_price = $totalDiscount > 0 ? $totalDiscount : $totalRegular;

    return [$display_price, $totalRegular, $totalDiscount, $totalsArray];
}

function getTextureTotalsV2Method($productId, $textureType, $price, $width, $height, $depth, $defaultBrimWidth_m) {
    return [
        'regular' => 0,
        'discount' => 0,
    ];

    global $FURNITURE_TYPE_BASE, $FURNITURE_TEXTURE_SLUG__COUNTERTOP, $FURNITURE_TEXTURE_SLUG__FRONT, $FURNITURE_TEXTURE_SLUG__BASE;

    $hasBrandTexture = get_field('has_brand_texture', $productId);

    if(!$hasBrandTexture) {
        return [
            'regular' => 0,
            'discount' => 0,
        ];
    };

    $m3 = 0;
    if($textureType === $FURNITURE_TEXTURE_SLUG__FRONT) {
        $m3 = floatval($defaultBrimWidth_m) * $height * 2 * (($width - $defaultBrimWidth_m * 2) * 2);
    } else if($textureType === $FURNITURE_TEXTURE_SLUG__BASE) {
        $m3 = $defaultBrimWidth_m * $height * 2 * ($width - 2 * $defaultBrimWidth_m);
    } else if($textureType === $FURNITURE_TEXTURE_SLUG__COUNTERTOP) {
        $m3 = floatval($width) * floatval($depth) * 0.003; // 0.003 - is 3mm
    } 

    $regularPrice = floatval($price['regular']) * floatval($m3); 
    $discountPrice = floatval($price['discount']) * floatval($m3); 

    return [
        'regular' => $regularPrice,
        'discount' => $discountPrice,
    ];
}

// function getSelectedOptionPrice($productId, $selectedOptions, $existingOptions = null) {
//     $pricesTotal = [
//         'regular' => 0,
//         'discount' => 0,
//         'display'  => 0,
//     ];

//     if(!$selectedOptions || empty($selectedOptions)) {
//         return $pricesTotal;
//     } 

//     if(!$existingOptions) {
//         $existingOptions = get_field('options', $productId) ?? [];
//     }

//     $selectedMap = [];
//     foreach ($selectedOptions as $opt) {
//         $opt = (array) $opt;
//         $selectedMap[$opt['slug']] = $opt;
//     }

//     // helper to add prices

//     $addPrices = function($allPrices) use (&$pricesTotal) {
//         $prices = getWooPricesByPricesField($allPrices);
//         $pricesTotal['regular']  += (float) $prices['regular'];
//         $pricesTotal['discount'] += (float) $prices['discount'];
//         $pricesTotal['display']  += (float) $prices['display'];

//         return $prices;
//     };

//     // ✅ loop existing options FIRST
//     foreach ($existingOptions as $option) {
//         $option = $option['option'];
//         $slug = $option['option_slug'];
//         $label = $option['label'];

//         $prices = getWooPricesByPricesField($option['prices']);

//         $checkedAttr = '';

//         // skip if not selected
//         if (isset($selectedMap[$slug])) {
//             $subitems = $selected['items'] ?? [];

//             // no subitems → apply main option price
//             if (empty($subitems)) {
//                 $addPrices($prices);
//                 continue;
//             }

//             // index existing subitems for fast lookup
//             $existingSubs = [];
//             foreach (($option['items'] ?? []) as $sub) {
//                 $existingSubs[$sub['option_slug']] = $sub;
//             }

//             foreach ($subitems as $sub) {
//                 $subSlug = $sub['slug'];

//                 if (!isset($existingSubs[$subSlug])) continue;

//                 $subSubitems = $sub['items'] ?? [];

//                 if (!empty($subSubitems)) {

//                     $existingSubSubs = [];
//                     foreach (($option['items'] ?? []) as $sub) {
//                         $existingSubSubs[$sub['option_slug']] = $sub;
//                     }

//                     foreach ($subitems as $subsub) {
//                         $subsubSlug = $subsub['slug'];
//                         if (!isset($existingSubSubs[$subsubSlug])) continue;

//                         $addPrices($existingSubs[$subsubSlug]['prices']);
//                     }

//                 } else {
//                     $addPrices($existingSubs[$subSlug]['prices']);
//                 }

//             }
//         }
//     }


//     return $pricesTotal;
// }


function getCubicTotalsV2( 
    $product_id,
    $min_width, 
    $min_height, 
    $min_depth,
    $current_width,
    $current_height,
    $current_depth
)
{
    $price_data = get_field('cm3_price', $product_id);
    $price_regular = floatval($price_data['regular']);
    $price_discount = floatval($price_data['discount'] ?? 0);

    $width = (floatval($current_width) - floatval($min_width)) / 10;
    $height = (floatval($current_height) - floatval($min_height)) / 10;
    $depth = (floatval($current_depth) - floatval($min_depth)) / 10;
    /*
    here "/ 10" means, for every 10cm price is added
    */ 
    // $cm3 = (($width * $height * $depth) / 10 * $price * 100) / 100;
    $cm3_regular = floatval((($width * $height * $depth) / 10 * $price_regular * 100) / 100);
    $cm3_discount = floatval((($width * $height * $depth) / 10 * $price_discount * 100) / 100);

    return [
        'regular' => $cm3_regular,
        'discount' => $cm3_discount,
        'display' => $cm3_discount && $cm3_discount > 0 ? $cm3_discount : $cm3_regular,
    ];
}

function getComponentsTotalSimpleArrayV2($components)
{
    $total = 0;

    foreach($components as $component) {
        $total += getComponentTotal($component);
    }

    $total = round($total / 100);

    return [ floatval($total) ];
}

function getProductsComponentsTotalGroupedArrayV2($components, $need_data = false)
{
    $total = 0;

    if(!$need_data) {
        foreach($components as $component) {
            $total += getComponentTotal($component);
        }

        $total = round($total / 100);

        return [ floatval($total) ];
    }

    $mod_components = [];
    $mod_components_children = [];

    foreach($components as $component) {
        if(isset($component['id'])) {
            $parent_id = $component['id'];

            if(!$parent_id) {
                continue;
            }
            $parent_woocommerce = get_field('woocommerce', $parent_id);
            $base_regular = $parent_woocommerce['regular_price'];
            $base_discount = $parent_woocommerce['discount_price'];
            $price = floatval($base_discount && $base_discount > 0 ? $base_discount : $base_regular) * 100;
            $total += intval($price); 

            $mod_components_children[] = [
                'item' => [
                    'id' => $parent_id,
                    'name' => get_the_title($parent_id),
                    'woocommerce' => $parent_woocommerce,
                ],
            ];
        } else {
            $parent_id = $component['parent_id'];

            if(!$parent_id) {
                continue;
            }
            $children = $component['children'];
            $children_total = 0;
            if(!empty($children)) {
                foreach($children as $child) {
                    $id = $child['id'];

                    $item_woocommerce = get_field('woocommerce', $id);
                    $base_regular = $item_woocommerce['regular_price'];
                    $base_discount = $item_woocommerce['discount_price'];
                    $price = floatval($base_discount && $base_discount > 0 ? $base_discount : $base_regular) * 100;
                    $children_total += intval($price); 

                    $children_mod[] = [
                        'id' => $id,
                        'name' => get_the_title($id),
                        'woocommerce' => $item_woocommerce,
                    ];
                }
            } 

            $total += intval($children_total); 

            $mod_components_children[] = [
                'parent' => [
                    'id' => $parent_id,
                    'name' => get_the_title($parent_id),  
                    'subtotal' => $children_total,              
                ],
                'children' => $children_mod,
            ];
        }
    }

    $total = round($total / 100);

    $mod_components['children'] = $mod_components_children;
    $mod_components['total'] = $total;
    $mod_components['currency'] = get_woocommerce_currency_symbol();

    return [ 
        floatval($total),
        $mod_components,
    ];
}

function getComponentsTotalGroupedArrayV2($components)
{
    if(!is_checkout()) {
        return [
            getComponentsTotalGroupedArrayTotalOnlyV2($components)
        ];
    }
    
    $totalRegular = 0;
    $totalDiscount = 0;
    $mod_components = [];
    $mod_components_children = [];

    foreach($components as $component_term) {
        $component_term = (object) $component_term;
        $component_parent_id = $component_term->parent_id;
        $component_term_post = get_term($component_parent_id);
        $term_parent_id = $component_term_post ? $component_term_post->parent : 0;
      
        $children = $component_term->children;
        $children_mod = [];
        foreach($children as $component) {
            $component = (object) $component;
            $id = $component->id;
            $woocommerce = get_field('woocommerce', $id);

            $base_regular = $woocommerce['regular_price'];
            $base_discount = $woocommerce['discount_price'];
            $price = floatval($base_discount && $base_discount > 0 ? $base_discount : $base_regular) * 100;
            $totalRegular += intval($base_regular); 
            $totalDiscount += intval($base_discount); 

            $children_mod[] = [
                'name' => get_the_title($id),
                'woocommerce' => $woocommerce,
            ];
        }

        $parent_data = [];

        if($term_parent_id != 0) {
            $term_parent_term = get_term($term_parent_id);
            $parent_data = [
                'id' => $term_parent_id,
                'name' => $term_parent_term->name,
            ];
        }

        $mod_components_children[] = [
            'term' => [
                'id' => $component_parent_id,
                'name' => $component_term_post->name,
                'parent' => $parent_data
            ],
            'children' => $children_mod,
        ];
    }

    $totalRegular = round($totalRegular / 100);
    $totalDiscount = round($totalDiscount / 100);

    $mod_components['children'] = $mod_components_children;
    $mod_components['regular_total'] = $totalRegular;
    $mod_components['discount_total'] = $totalDiscount;
    $mod_components['currency'] = get_woocommerce_currency_symbol();

    return [ 
        floatval($totalRegular),
        floatval($totalDiscount),
        $mod_components,
    ];
}

function getComponentsTotalGroupedArrayTotalOnlyV2($components)
{
    $total = 0;

    foreach($components as $component_term) {
        $component_term = (object) $component_term;
        $children = $component_term->children;
        foreach($children as $component) {
            $total += getComponentTotal($component);
        }
    }

    $total = round($total / 100);

    return $total;
}

function getComponentTotal($component) 
{
    $component = (object) $component;
    $id = isset($component->id) ? $component->id : $component->parent_id;
    $woocommerce = get_field('woocommerce', $id);

    $base_regular = $woocommerce['regular_price'] ?? 0;
    $base_discount = $woocommerce['discount_price'] ?? 0;
    $price = floatval($base_discount && $base_discount > 0 ? $base_discount : $base_regular) * 100;
    $total = intval($price); 

    return $total;
}

function getProductTextures($furnitureType, $textures) {
    global $FURNITURE_TEXTURE_SLUG__COUNTERTOP, $FURNITURE_TYPE_BASE;
    $itemTextures = [];
    foreach($textures as $key => $texture) {
        $explodedArray = explode('_', $key);
        $type = $explodedArray[0];
        $textureType = $explodedArray[1];

        if(
            $type === $FURNITURE_TEXTURE_SLUG__COUNTERTOP && 
            strpos($furnitureType, $FURNITURE_TYPE_BASE) === false &&
            $textureType != $furnitureType || 
            in_array($type, array_column($itemTextures, 'type'))
        ) {
            continue;
        }

        $texture->type = $type;
        $itemTextures[$key] = $texture;
    }

    return $itemTextures;
}