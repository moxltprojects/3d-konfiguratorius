<?php 
global $TEXTURE_ALL_SLUG, $FURNITURE_TYPE_ALL_SLUG;
// global $texture_front_slug;

// $regular = $frontPrice['regular'];
// $discount = $frontPrice['discount'];
// $current_price = $frontPrice['current'];
$parentId = $item->term_id;
$parentSlug = $item->slug;
// $subcategories = get_furniture_texture_categories($parentId);
$currentCategory = $defaultTexturesCategories[$parentId] ?? null;

$sameColors = $currentCategory ? $currentCategory->same_colors : null;
// $allCategoryPosts = get_furniture_texture_posts_by_slug($TEXTURE_ALL_SLUG, 10000);
$allCategoryPosts = get_furniture_texture_posts_by_furniture_type_slug($parentSlug, $TEXTURE_ALL_SLUG, 10000);
// $hasNoSubs = !isset($innerProductPage) ? get_field('has_no_subcategories', $item) : true;

$availableFurnitureTypes = null;
// $availableFurnitureTypes = $availableFurnitureTypes ? explode(',', $availableFurnitureTypes) : null;
$hasNoSubs = true;
$availableFurnitureTypesHtml = '';
if(!isset($innerProductPage)) {
    $availableFurnitureTypes = get_field('available_furniture_types', $item);
    $availableFurnitureTypesStr = is_array($availableFurnitureTypes) ?
        implode(',', array_column($availableFurnitureTypes, 'slug')) : '';
    $hasNoSubs = !isset($innerProductPage) && $availableFurnitureTypes && count($availableFurnitureTypes) < 2;
    $availableFurnitureTypesHtml = 'data-available_furniture_types="'. $availableFurnitureTypesStr .'"';
}
?>
<div class="texture-list-container<?php echo $activeCatClass; ?>" 
    data-type_id="<?php echo $parentId; ?>"
    data-slug="<?php echo $parentSlug; ?>"
   
>
    <?php if(!$hasNoSubs) : ?>
        <div class="texture-list-tabs">
            <?php 
                    $typesIndex = 0;
                ?>
            <?php foreach($furnitureTypes as $index => $subcategory): ?>
                <?php 
                    $subcategoryId = $subcategory->term_id;

                    if(!empty($availableFurnitureTypes) && !in_array($subcategoryId, array_column($availableFurnitureTypes, 'term_id'))) {
                        continue;
                    }
                    $slug = $subcategory->slug;
                    $subcategoryName = $subcategory->name;
                    $activeClass = $typesIndex === 0 ? ' active' : '';
                    $hiddenClass = $FURNITURE_TYPE_ALL_SLUG !== $slug && !in_array($slug, $defaultFurnitureTypes) ? ' hidden' : '';
                    $typesIndex++
                ?>
                <button 
                    class="<?php echo $activeClass; ?><?php echo $hiddenClass; ?><?php echo $activeClass; ?><?php echo $hiddenClass; ?>" 
                    data-id="<?php echo $subcategoryId; ?>" 
                    data-slug="<?php echo $slug; ?>"
                ><span class="text"><?php echo $subcategoryName; ?></span>
            </button>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>
    <div class="texture-list-container-inner">
        <div class="texture-multiple-lists">
            <?php 
                $typesIndex = 0;
            ?>
            <?php if($hasNoSubs) : ?>
                <?php 
                    $currentSubcategory = $currentCategory->subcategories[0];
                    $subcategoryId = $currentSubcategory->term_id;
                    // $subSlug = $currentSubcategory->type_slug;
                    $subSlug = isset($furnitureTypeSlug) ? $furnitureTypeSlug : $currentSubcategory->type_slug;
                    $mergedPosts = get_furniture_texture_posts_by_types($parentId);
                    $mergedSlug = create_texture_slug($parentSlug, $subSlug, '');
                    $uniquePosts = [];
                    $displayedPostsIds = [];

                    include __DIR__ .'/list-items-container.php';
                ?>
                <?php else: ?>
                    <?php foreach($furnitureTypes as $index => $subcategory): ?>
                        <?php 
                            $subcategoryId = $subcategory->term_id;
                            $subSlug = $subcategory->slug;
                            $texturePosts = get_furniture_texture_posts_by_types($parentId, $subcategoryId);
                            $currentSubcategory = $sameColors && $subSlug === $TEXTURE_ALL_SLUG && !empty($texturePosts) ? 
                                reset($currentCategory->subcategories) : 
                                (
                                    $subSlug === $TEXTURE_ALL_SLUG ? 
                                    null :
                                    ($currentCategory->subcategories[$subcategoryId] ?? null)
                                );
                            
                            $mergedPosts = $subSlug === $TEXTURE_ALL_SLUG ? $texturePosts : array_merge($allCategoryPosts, $texturePosts);
                            $mergedSlug = create_texture_slug($parentSlug, $subSlug, $furnitureTypes);
                            $typesIndex++;
                        ?>
                        <?php include __DIR__ .'/list-items-container.php'; ?>
                    <?php endforeach; ?>
            <?php endif;  ?>
        </div>
    </div>
</div>