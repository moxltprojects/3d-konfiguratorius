<?php 
global $CAT_MATERIAL_SLUG, $CAT_STRETCH_SLUG;

$dynamic_components = get_field('dynamic_components', $product_id);
?>

<?php if(count($dynamic_components) > 0): ?>
    <div class="dynamic-components-container">
        <h2><?php echo __('Product Components', 'furniture-config'); ?></h2>
        <div class="dynamic-components-container-inner">
            <?php foreach($dynamic_components as $post_id) :  ?>
                <?php 
                    $component_terms = get_the_terms($post_id, 'config-d-component-category');
                    if (!$component_terms || is_wp_error($component_terms)) {
                        continue;
                    }
                    $dynamic_component = get_post($post_id);
                    $dynamic_component_title = get_the_title($post_id); 
                    $slugs = wp_list_pluck($component_terms, 'slug');
                    $post_select_name = 'furniture-dynamic-components';
                    $parent_id = null;
                ?>
                    <div class="dynamic-component-item 
                        <?php echo 
                            $selected_product_components && 
                            in_array($post_id, array_column($selected_product_components, 'parent_id')) ?
                            'active' : ''
                        ?>">                            
                        <?php if(in_array($CAT_MATERIAL_SLUG, $slugs)) : ?>
                            <?php 
                                $material_data = get_field('material', $post_id);
                                $material_list = $material_data['material_list'];

                                if(empty($material_list)) continue;

                                $parent_id = $post_id;
                            ?>
                            <?php include $furniture_parts_template_parts_url .'/product/settings-sections/dynamic-components/checkbox-label.php'; ?>
                            <?php include $furniture_parts_template_parts_url .'/product/settings-sections/dynamic-components/select-material.php'; ?>
                        <?php elseif(in_array($CAT_STRETCH_SLUG, $slugs)) : ?>
                            <?php 
                                $additional_title = ' <span>(mm)</span>';
                            ?>
                            <?php include $furniture_parts_template_parts_url .'/product/settings-sections/dynamic-components/checkbox-label.php'; ?>
                            <?php else: ?>
                                <?php include $furniture_parts_template_parts_url .'/product/settings-sections/dynamic-components/checkbox-label.php'; ?>
                        <?php endif; ?>
                    </div>
            <?php endforeach; ?>
        </div>
    </div>
<?php endif; ?>