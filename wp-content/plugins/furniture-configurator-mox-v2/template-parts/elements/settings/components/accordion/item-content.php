
<?php 
$typeId = $furnitureType->term_id;
?>

<?php foreach($componentsCategories as $category): ?>
    <?php
        $categoryId = $category->term_id;
        $key = $typeId .'_'. $categoryId;
        if(in_array($key, $keys)) continue;
        $keys[] = $key;
        $multiselect = get_field('multiselect', $category);
        $multiselectClass = $multiselect ? ' multiselect' : '';
        $categoryPosts = get_furniture_component_posts_by_taxonomies($categoryId, $typeId);
        if(empty($categoryPosts)) continue;
    ?>
    <div class="component-items<?php echo $multiselectClass; ?>" data-parent_id="<?php echo $categoryId; ?>">
        <h3><?php echo $category->name; ?></h3>
        <div class="component-items-inner">
            <?php if($multiselect) : ?>

                <?php include __DIR__ .'/multiselect.php'; ?>

                <?php else: ?>

                    <?php include __DIR__ .'/singleselect.php'; ?>

            <?php endif; ?>
        </div>
    </div>

<?php endforeach; ?>