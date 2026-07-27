
<?php 
$categoryId = $category->term_id;
$componentsSubcategories = get_furniture_component_categories($categoryId);
?>

<?php foreach($componentsSubcategories as $subcategory): ?>
    <?php
        $subcategoryId = $subcategory->term_id;
        $multiselect = get_field('multiselect', $subcategory);
        $multiselectClass = $multiselect ? ' multiselect' : '';
        $categoryPosts = get_furniture_component_posts($subcategoryId);
    ?>
    <div class="component-items<?php echo $multiselectClass; ?>" data-parent_id="<?php echo $subcategoryId; ?>">
        <h3><?php echo $subcategory->name; ?></h3>
        <div class="component-items-inner">
            <?php if($multiselect) : ?>

                <?php include __DIR__ .'/multiselect.php'; ?>

                <?php else: ?>

                    <?php include __DIR__ .'/singleselect.php'; ?>

            <?php endif; ?>
        </div>
    </div>

<?php endforeach; ?>