<?php 

function render_component_posts($term, $config_types, $selected_components) 
{
    global $furniture_parts_template_parts_url;
    $is_multiselect = get_field('multiselect', $term);
    $multiselect_class = $is_multiselect ? ' multiselect' : '';
    $parent_id = $term->term_id;
    $args = array(
        'post_type' => 'furniture-component',
        'tax_query' => array(
                array(
                    'taxonomy' => 'furniture-component-category',
                    'field' => 'term_id',
                    'terms' => [$term->term_id],
                ),
                array(
                    'taxonomy' => 'config-furniture-type',
                    'field' => 'term_id',
                    'terms' => $config_types,
                )
            )
        );
    $query = new WP_Query( $args );
    if(!$query->have_posts()) return '';
    ob_start();
    ?>
    <div class="component-posts<?php echo $multiselect_class; ?>" data-parent_id="<?php echo $parent_id; ?>">
        <h3><?php echo $term->name; ?></h3>
        <div class="component-posts-inner">
             <?php if ($is_multiselect): ?>
                <?php while ($query->have_posts()) : $query->the_post(); ?>
                    <?php include $furniture_parts_template_parts_url .'/category/setting-sections/components/multiselect.php'; ?>
                <?php endwhile; ?>
            <?php else: ?>
                <?php while ($query->have_posts()) : $query->the_post(); ?>
                    <?php include $furniture_parts_template_parts_url .'/category/setting-sections/components/singleselect.php'; ?>
                <?php endwhile; ?>
            <?php endif; ?>
        </div>
    </div>
    <?php
    return ob_get_clean();
}

$components_parents = get_terms([
    'taxonomy'   => 'furniture-component-category',
    'parent' => 0,
    'hide_empty' => true,
]);

?>

<?php if(count($components_parents) > 0): ?>
    <div class="components-container">
        <h2><?php echo __('Components', 'furniture-config'); ?></h2>
        <div class="components-container-inner">
        <?php foreach($components_parents as $components_parent) :  ?>
        <?php 
            $is_multiselect = get_field('multiselect', $components_parent);

            $component_children = get_terms([
                'taxonomy'   => 'furniture-component-category',
                'parent' => $components_parent->term_id,
                'hide_empty' => true,
            ]);

            if(count($component_children) == 0) : ?>
                <?php echo render_component_posts($components_parent, $config_types, $selected_components) ; ?>
                <?php continue; ?>
            <?php endif; ?>

            <div class="component-terms-children">
                <h3><?php echo $components_parent->name; ?></h3>
                <div class="component-terms-children-inner">
                    <?php foreach($component_children as $component_child) : ?>
                        <?php echo render_component_posts($component_child, $config_types, $selected_components) ; ?>
                    <?php endforeach; ?>    
                </div>
            </div>
        <?php endforeach; ?>    
        </div>
    </div>
<?php endif; ?>