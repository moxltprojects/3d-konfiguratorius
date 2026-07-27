<?php 

function render_progress_container(
    $product_id, 
    $furniture_id,
    $width_field, 
    $default_width,
    $height_field, 
    $default_height,
    $depth_field, 
    $default_depth,
    $max_value,
    $default_front,
    $default_corpus, 
    $default_price,
    $current_step
) 
{
    global $steps_data, $current_step_type;
    ?>
    <?php include __DIR__ .'/template-parts/index-loaded.php'; ?>
    <?php
}

function redner_step_item($index, $type, $name, $current_step_type)
{
    $is_current_class = $i == $type ? ' current' : '';
    ?>
    <button 
        type="button"
        data-type="<?php echo $type; ?>"
        class="step<?php echo $is_current_class; ?>"
    ><?php echo $name; ?></button>
    </div>

    <?php
}

function render_display_container(
    $product_id,
    $furniture_id, 
    $image_block_width_px,
    $default_width, 
    $default_height, 
    $default_depth,
    $default_price,
    $max_dimensions_val,
    $front_texture, 
    $corpus_texture
) {


    $front_texture_id = $front_texture->ID;
    $corpus_texture_id = $corpus_texture->ID;
    $front_texture_image = get_the_post_thumbnail_url($front_texture_id, 'full');
    $corpus_texture_image = get_the_post_thumbnail_url($corpus_texture_id, 'full');

    list($image_content, $width_percent, $height_percent, $depth_percent) = render_furniture_image_block(
        $furniture_id, 
        $image_block_width_px,
        $default_width, 
        $default_height, 
        $default_depth, 
        $max_dimensions_val,
        $front_texture_image, 
        $corpus_texture_image
    );

    ob_start();

    render_furniture_3d($furniture_id);

    $d3_content = ob_get_clean();

    ob_start();
    ?>
    <div class="display-container"> 
        <div class="display-container-inner"> 
            <div class="top-bar">
                <div class="top-bar-inner">
                    <div class="tabs">
                        <button type="button" class="config active" data-type="config-block"><?php echo __('Configurator', 'config-furniture'); ?></button>
                        <button type="button" class="config" data-type="model-block"><?php echo __('3D', 'config-furniture'); ?></button>
                        <button type="button" class="config" data-type="model-multiple-block"><?php echo __('3D Multiple', 'config-furniture'); ?></button>
                    </div>
                </div>
            </div>
            <div class="display-content">
                <div class="config-block active">
                    <?php echo $image_content; ?>
                    <?php echo render_furniture_info($product_id, $default_price); ?>
                </div>
                <div class="model-block">
                    <?php echo $d3_content; ?>
                </div>
                <div class="model-multiple-block">
                    <?php echo $d3_content; ?>
                </div>
            </div>
        </div>
    </div>
    <?php
    $full_content = ob_get_clean();

    return [$full_content, $image_content, $width_percent, $height_percent, $depth_percent];
}

function render_furniture_image_block($furniture_id, $image_block_width_px, $default_width, $default_height, $default_depth, $max_dimensions_val, $front_texture, $corpus_texture) {
    $images = get_field('images', $furniture_id);
    $front_image_1 = $images['front_image_1'];
    $front_image_2 = $images['front_image_2'];
    $front_image_3 = $images['front_image_3'];
    $front_image_4 = $images['front_image_4'];
    $front_image_5 = $images['front_image_5'];
    $front_image_6 = $images['front_image_6'];
    $front_images = [];

    if(!empty($front_image_1)) {
        $front_images[] =  $front_image_1;
    }
    if(!empty($front_image_2)) {
        $front_images[] =  $front_image_2;
    }
     if(!empty($front_image_3)) {
        $front_images[] =  $front_image_3;
    }
     if(!empty($front_image_4)) {
        $front_images[] =  $front_image_4;
    }
     if(!empty($front_image_5)) {
        $front_images[] =  $front_image_5;
    }
     if(!empty($front_image_6)) {
        $front_images[] =  $front_image_6;
    }
   
    $corpus_image = $images['corpus_image'];
    $count = (int) $images['count'];
    $single_width = $default_width / $count;
    $gapEdges = 0.9;
    $gapMiddle = 1.9;

    $width_percent = $default_width * 100 / $max_dimensions_val;
    $width_percent_element = $width_percent / $count;
    $width_px = $image_block_width_px * $width_percent / 100; //
    $height_percent = $default_height * 100 / $max_dimensions_val;
    $height_px = $image_block_width_px * $height_percent / 100; //
    $depth_percent = $default_depth * 100 / $max_dimensions_val;
    $depth_px = $image_block_width_px * $depth_percent / 100;

    $middle_block = '<div data-d="'. $max_dimensions_val .'" class="middle-container"><div class="list-content">';

    $front_image_html = '<div class="front-image-block" style="height: '. $image_block_width_px .'px"><div class="front-image-block-inner" style="height: '. $height_px .'px; background-image: url('. $front_texture .');">';
    $front_image_html .= '<div class="measure-h"><div class="measure-inner"><p class="h-value">'. $default_height .'</p></div></div>';
    $front_image_html .= '<div class="images">';

    $corpus_image_html = '<div class="corpus-image-block"><div class="corpus-image-block-inner" style="height: '. $depth_px .'px; background-image: url('. $corpus_texture .');">';
    $corpus_image_html .= '<div class="measure-d"><div class="measure-inner"><p class="d-value">'. $default_depth .'</p></div></div>';
    $corpus_image_html .= '<div class="images">';

    for($i = 1 ; $i <= $count; $i++) {
        $front_image = $front_images[$i - 1];
        $gap = 1 === $i || $count === $i ? $gapEdges : $gapMiddle;
        $single_item_width = $single_width - $gap;

        $middle_block .= '<div class="measure-w"><p class="w-value">'. round($single_item_width, 2) .'</p></div>';

        $front_image_html .= '<div class="img-block">';
        $front_image_html .= '<div class="index"><p>'. $i .'</p></div>';
        $front_image_html .= '<img src="'. $front_image .'" />';
        $front_image_html .= '</div>';

        $corpus_image_html .= '<div class="img-block">';
        $corpus_image_html .= '<img src="'. $corpus_image .'" />';
        $corpus_image_html .= '</div>';
    }

    $middle_block .= '</div>';
    $middle_block .= '<div class="measure-full-w"><p class="full-w-value">'.$default_width .'</p></div>';
    $middle_block .= '</div>';

    $front_image_html .= '</div>';
    $front_image_html .= '<div class="measure-full-h"><div class="measure-inner"><p class="h-value">'.$default_height .'</p></div></div>';
    $front_image_html .= '</div></div>';

    $corpus_image_html .= '</div>';
    $corpus_image_html .= '</div></div>';

    ob_start();
    ?>

    <div class="canvas-html-image-wrap">
        <div class="canvas-html-image">
            <div class="canvas-html-image-inner" style="width: <?php echo $width_px; ?>px">
                <?php echo $front_image_html; ?>
                <?php echo $middle_block; ?>
                <?php echo $corpus_image_html; ?>
            </div>
        </div>
        <div class="config-loader-container">
            <span class="loader"></span>
        </div>
    </div>

    <?php

    $image = ob_get_clean();

    return [
        $image,
        $width_percent,
        $height_percent,
        $depth_percent,
    ];
}

function render_furniture_3d($furniture_id) {
    $models = get_field('3d_models', $furniture_id);
    $closed = $models['closed'];
    $open = $models['open'];
    ?>
    <div class="object-model-container">
        <div class="object-model-container-inner">
            <div class="preview-list">
                <div class="preview-list-inner">
                    <button type="button" class="closed-preview active">  
                        <div class="model-data-container" 
                            data-src="<?php echo $closed; ?>"
                            camera-controls
                            disable-zoom
                        ></div>
                    </button>
                    <button type="button" class="open-preview">  
                        <div class="model-data-container" 
                            data-src="<?php echo $open; ?>"
                            camera-controls
                            disable-zoom
                        ></div>
                    </button>
                </div>
            </div>
            <div class="preview-container">
                <div class="preview-container-inner">
                </div>
            </div>
            <div class="config-loader-container">
                <span class="loader"></span>
            </div>
        </div>
    </div>
    <?php
}

function render_furniture_image_block_with_dimensions_data($image_html, $furniture_id, $image_block_width_px, $value_type, $value, $max_value) {

    $new_image_html = '';
    $value_percentage = 0;

    $image_html_item = preg_replace(
                    '/<div class="front-image-block" style="height: .*?px">/', 
                    '<div class="front-image-block" style="height:'. $image_block_width_px .'">', 
                    $image_html_item
                );

    if($value_type == 'width') {
        $images = get_field('images', $furniture_id);
        $count = (int) $images['count'];
        $single_width = $value / $count;
        $gapEdges = 0.9;
        $gapMiddle = 1.9;
        $image_html_array = explode('<div class="img-block">', $image_html);
        $html_array_count = count($image_html_array);
        $width_percent = $value * 100 / $max_value;
        $value_percentage = $width_percent;
        $value_px = $image_block_width_px * $value_percentage / 100;

        foreach($image_html_array as $index => $image_html_item) {
            if($index === 0) {
                $new_image_html .= $image_html_item . '<div class="img-block">';
            } else {
                $gap = 1 === $index || $html_array_count - 1 === $index ? $gapEdges : $gapMiddle;
                $single_item_width = $single_width - $gap;
                $image_html_item_mod = preg_replace(
                    '/<p class="w-value">.*?<\/p>/', 
                    '<p class="w-value">'. round($single_item_width, 2) .'</p>', 
                    $image_html_item
                );

                if($html_array_count === $index) {
                    $new_image_html .= $image_html_item_mod;
                } else {
                    $new_image_html .= $image_html_item_mod . '<div class="img-block">';
                }
            }
        }

        $new_image_html = preg_replace(
            [
                '/<div class="canvas-html-image-inner" style="width: .*?px">/', 
                '/<p class="full-w-value">.*?<\/p>/'
            ],
            [
                '<div class="canvas-html-image-inner" style="width: '. $value_px .'px">', 
                '<p class="full-w-value">'. $value .'</p>'
            ],
            $new_image_html
        );
    } else if($value_type == 'height') {
        $height_percent =  $value * 100 / $max_value;
        $value_percentage = $height_percent;
        $value_px = $image_block_width_px * $value_percentage / 100;
        $new_image_html = preg_replace(
            [
                '/<div class="front-image-block-inner" style="height: .*?px/', 
                '/<p class="h-value">.*?<\/p>/'
            ],
            [
                '<div class="front-image-block-inner" style="height: '. $value_px .'px', 
                '<p class="h-value">'. $value .'</p>'
            ],
            $image_html
        );
    } else {
        $depth_percent =  $value * 100 / $max_value;
        $value_percentage = $depth_percent;
        $value_px = $image_block_width_px * $depth_percent / 100;

        $new_image_html = preg_replace(
            [
                '/<div class="corpus-image-block-inner" style="height: .*?px;/', 
                '/<p class="d-value">.*?<\/p>/'
            ],
            [
                '<div class="corpus-image-block-inner" style="height: '. $value_px .'px;', 
                '<p class="d-value">'. $value .'</p>'
            ],
            $image_html
        );
    }

    ?>        
    <?php return [
        $new_image_html,
        $value_percentage
    ]; ?>
    <?php
}

function render_furniture_image_block_with_texture_data($image_html, $value_type, $texture_id) {
    $texture_id = (int) $texture_id;
    $texture_image = get_the_post_thumbnail_url($texture_id, 'full');
    $texture_data = [
        'heading' => get_the_title($texture_id),
        'image' => $texture_image,
    ];

    $new_image_html = preg_replace(
        '/<div class="' . preg_quote($value_type, '/') . '-image-block-inner" style="(height:\s*[^;]+;\s*)background-image:\s*url\([^)]+\);?"/',
        '<div class="' . $value_type . '-image-block-inner" style="$1background-image: url(' . $texture_image . ');"',
        $image_html
    );
    ?>
    <?php return [$new_image_html, $texture_data]; ?>
    <?php
}

function render_step_dimensions($width_field, $height_field, $depth_field, $max_value, $furniture_id)
{
    ?>
    <div class="steps-dimensions active">
        <div class="steps-dimensions-inner">
            <?php echo render_step_heading(
                 __('Enter dimensions', 'furniture-config'),
                __('Please enter the desired dimensions:', 'furniture-config')); 
            ?>
            <table class="dimensions-list">
                <?php echo render_dimension_input_html($width_field, 'width', $max_value, $furniture_id); ?>
                <?php echo render_dimension_input_html($height_field, 'height', $max_value, $furniture_id); ?>
                <?php echo render_dimension_input_html($depth_field, 'depth', $max_value, $furniture_id); ?>
            </table>
        </div>
    </div>
    <?php
}

function render_furniture_info($product_id, $default_price)
{
    $heading = get_field('heading', $product_id);
    $excerpt =  get_the_excerpt($product_id);
    
    if(empty($heading) || empty(trim($heading))) {
        $product = wc_get_product($product_id);
        $heading = $product->get_name();
    }

    ?>
    <div class="info-container">
        <div class="intro">
            <h3><?php echo $heading; ?></h3>
            <?php if(!empty($excerpt)):  ?>
                <p class="excerpt"><?php echo $excerpt; ?></p>
            <?php endif; ?>
        </div>
        <div class="price-block">
            <div class="price">
                <span class="price-value"><?php echo $default_price; ?></span> <?php echo get_woocommerce_currency_symbol(); ?></span>
            </div>
            <div class="description">
                <p><?php echo __('Preis Möbel inkl. MwSt.', 'furniture-config'); ?></p>
                <p><?php echo __('zzgl. Lieferung u. Montage ', 'furniture-config'); ?></p>
            </div>
        </div>
    </div>
    <?php
}

function render_step_decoration($default_front, $default_corpus)
{
    ?>
    <div class="steps-decoration">
        <div class="steps-decoration-inner">
            <?php echo render_step_heading(
                 __('Select decors', 'furniture-config'),
                __('In this step, the individual decors for the different areas can be selected.', 'furniture-config')); 
            ?>
            <div class="decorations-list">
                <?php echo render_decor_html('front', $default_front); ?>
                <?php echo render_decor_html('corpus', $default_corpus); ?>
            </div>
        </div>
    </div>
    <?php
}

function render_step_add_to_cart(
    $product_id, 
    $default_width,
    $default_height,
    $default_depth,
    $default_corpus, 
    $default_front, 
    $default_price
)
{
    $default_corpus_id = $default_corpus->ID;
    $default_corpus_title = $default_corpus->post_name;
    $default_corpus_img = get_the_post_thumbnail_url($default_corpus_id, 'thumbnail');
    $default_front_id = $default_front->ID;
    $default_front_title = $default_front->post_name;
    $default_front_img = get_the_post_thumbnail_url($default_front_id, 'thumbnail');
    ?>
    <div class="addtocart-container">
        <div class="addtocart-container-inner">
            <div class="selected-properties">
                <div class="selected-properties-inner">
                <?php 
                    echo render_selections('width', __('Width', 'furniture-config'), $default_width); 
                    echo render_selections('height', __('Height', 'furniture-config'), $default_height); 
                    echo render_selections('depth', __('Depth', 'furniture-config'), $default_depth); 
                    echo render_selections('front', __('Front decor', 'furniture-config'), $default_front_title, $default_front_img); 
                    echo render_selections('corpus', __('Corpus decor', 'furniture-config'), $default_corpus_title, $default_corpus_img); 
                ?>
                </div>
            </div>
            <div class="price-block">
                <div class="price">
                    <p><?php echo sprintf(__('Price: <span class="price-value">%s</span> %s', 'furniture-config'), $default_price, get_woocommerce_currency_symbol()); ?>
                </div>
            </div>
            <div class="addtocart-btn-block">
                <?php echo render_add_to_cart_button(); ?>
            </div>
        </div>
    </div>
    <?php
}

function render_furniture_texture_module($selected_texture) 
{
    $selected_texture_id = $selected_texture ? $selected_texture->ID : null;
    ?>
    <div class="config-modal textures-modal" data-type>
        <div class="config-modal-inner textures-modal-inner"> 
            <div class="config-sidebar">
                <div class="config-sidebar-inner">
                    <button class="back fusion-button button-flat fusion-button-default-size button-default fusion-button-default button-1 fusion-button-default-span fusion-button-default-type" type="button">
                        <i class="fa-angle-left fas button-icon-left" aria-hidden="true"></i>
                        <?php echo __('Go back', 'config-furniture'); ?>
                    </button>
                    <?php 
                        echo render_texture_categories();
                        echo render_texture_brands();
                        echo render_texture_thickness();
                    ?>
                </div>
            </div>
            <div class="main-block">
                <div class="main-block-inner">
                    <div class="heading-block">
                        <h2 class="heading"></h2>
                    </div>
                    <?php  
                        render_texture_selected_block($selected_texture_id);
                        render_textures_bottom_container($selected_texture_id);
                    ?>
                </div>
            </div>
        </div>
        <div class="config-loader-container">
            <span class="loader"></span>
        </div>
    </div>

    <?php
}

function render_texture_categories() 
{
    $args = array(
        'taxonomy' => 'furniture-texture-category',
        'orderby'      => 'name',
        'order'        => 'ASC',
        'parent'       => 0 
    );

    $categories = get_terms($args);

    if(empty($categories) || is_wp_error($categories)) return;

    ?>
    <div class="texture-categories">
        <h3><?php echo __('Categories', 'config-furniture'); ?></h3>
        <ul class="ul-parent">
        <?php foreach ($categories as $category) : ?>
            <?php
                $term_id = $category->term_id;
                $is_current_class = '';
                $children_html = render_furniture_texture_child_categories($term_id);
                $parent_class = empty(trim($children_html)) ? '' : ' parent';
            ?>

            <li class="<?php echo $is_current_class; ?><?php echo $parent_class; ?>">
                <button type="button" value="<?php echo $term_id; ?>"><?php echo esc_html($category->name); ?></button>
                <?php echo $children_html; ?>
            </li>

        <?php endforeach; ?>
        </ul>
    </div>
    <?php 
}

function render_texture_brands() 
{
    $args = array(
        'taxonomy' => 'furniture-texture-brand',
        'orderby'      => 'name',
        'order'        => 'ASC',
        'parent'       => 0 
    );

    $terms = get_terms($args);

    if(empty($terms) || is_wp_error($terms)) return;

    ?>
    <div class="brands-terms">
        <h3><?php echo __('Brands', 'furniture-config'); ?></h3>
        <ul class="ul-parent">
        <?php foreach ($terms as $term) : ?>
            <?php
                $term_id = $term->term_id;
                $is_current_class = '';
            ?>

            <li class="<?php echo $is_current_class; ?>">
                <label>
                    <input value="<?php echo $term_id; ?>" name="thickness" type="checkbox" />
                    <?php echo esc_html($term->name); ?>
                </label>
            </li>

        <?php endforeach; ?>
        </ul>
    </div>
    <?php 
}

function render_texture_thickness() 
{
    $args = array(
        'taxonomy' => 'furniture-texture-thickness',
        'orderby'      => 'name',
        'order'        => 'ASC',
        'parent'       => 0 
    );

    $terms = get_terms($args);

    if(empty($terms) || is_wp_error($terms)) return;
    ?>
    <div class="thickness-terms">
        <h3><?php echo __('Thickness', 'furniture-config'); ?></h3>
        <ul class="ul-parent">
        <?php foreach ($terms as $term) : ?>
            <?php
                $term_id = $term->term_id;
                $is_current_class = '';
            ?>
            <li class="<?php echo $is_current_class; ?>">
                <label>
                    <input value="<?php echo $term_id; ?>" name="thickness" type="checkbox" />
                    <?php echo esc_html($term->name); ?>
                </label>
            </li>
        <?php endforeach; ?>
        </ul>
    </div>
    <?php 
}

function render_furniture_texture_child_categories($parent_id) {
    global $jms_product_category_ids;
    $args = array(
        'taxonomy'     => 'furniture-texture-category',
        'orderby'      => 'name',
        'order'        => 'ASC',
        'hide_empty'   => false,
        'parent'       => $parent_id
    );

    $children = get_terms($args);

    ob_start();

    if (!empty($children) && !is_wp_error($children)) : ?>
        <div class="submenu-container" data-parent_id="'. $parent_id .'">
            <div class="submenu-container-inner">
                <ul>
                <?php foreach ($children as $child): ?>
                <?php
                    $term_id = $child->term_id;
                    $is_current_class = '';
                    $subchildren_html = render_furniture_texture_child_categories($term_id);
                    $is_parent_class = empty(trim($subchildren_html)) ? '' : ' parent';
                ?>
                    <li class="<?php echo $is_current_class; ?>">
                        <button type="button" value="<?php echo $term_id; ?>"><?php echo esc_html($child->name); ?></button>
                        <?php echo $subchildren_html; ?>
                    </li>
                <?php endforeach; ?>
                </ul>
            </div>
        </div>
    <?php endif ?>
    <?php
    return ob_get_clean();
}

function render_texture_selected_block($id)
{
    $textureArgs = array(
        'post_type' => 'furniture-texture',
        'p' => $id,
        'posts_per_page' => 1,
        'post_status' => array('publish'), 
    );
    $query = new WP_Query($textureArgs);

    if(!$query->have_posts()) return;
    $type = 'textures';
    ?>

    <div class="texture-selected-block">
        <?php while($query->have_posts()): ?>
            <?php
                $query->the_post();
                single_full_texture_item();
            ?>
        <?php endwhile; ?>  
    </div>
    <div class="select-action" data-id="<?php echo $id; ?>">
        <button type="button" value="<?php echo $type; ?>"><?php echo __('Choose', 'config-furniture') ?></button>
    </div>
    <?php
}

function render_textures_bottom_container($selected_texture_id)
{
    ?>
    <div class="modal-bottom-container">
        <div class="modal-bottom-container-inner">
            <?php echo render_furniture_textures(null, null, $selected_texture_id); ?>
        </div>
    </div>
    <?php
}

function render_furniture_textures($taxonomy = null, $taxonomy_id = null, $selected_texture_id = null)
{
    $query = fetch_decor_list($taxonomy, $taxonomy_id);

    if(!$query->have_posts()) return;
    ?>

    <div class="furniture-textures-list">
        <div class="furniture-textures-list-inner">
            <?php while($query->have_posts()): ?>
                <?php
                    $query->the_post();
                    echo single_into_texture_item($selected_texture_id);
                ?>
            <?php endwhile; ?>    
        </div>
    </div>
    <?php
}

function single_into_texture_item($selected_texture_id = null)
{
    $id = get_the_ID();
    $title = get_the_title();
    $thumbnail_url = get_the_post_thumbnail_url($id, 'thumbnail');
    $categories = get_the_terms($id, 'furniture-texture-category');
    $brands = get_the_terms($id, 'furniture-texture-brand');
    $thickness = get_the_terms($id, 'furniture-texture-thickness');
    $is_selected_classname = $selected_texture_id && $selected_texture_id == $id ? ' selected' : '';
    $categories_ids = [];

    if(!is_wp_error($categories) && $categories) {
        foreach($categories as $category) {
            $categories_ids[] = $category->term_id;
            $parent_id = $category->parent;
            
            if($parent_id && !in_array($parent_id, $categories_ids)) {
                $categories_ids[] = $parent_id;     
            }
        }
    }

    $brands_ids = !is_wp_error($brands) && $brands ? wp_list_pluck($brands, 'term_id') : [];
    $thickness_ids = !is_wp_error($thickness) && $thickness ? wp_list_pluck($thickness, 'term_id') : [];

    $terms_ids_arr = array_merge($categories_ids, $brands_ids);
    $terms_ids_arr = array_merge($terms_ids_arr, $thickness_ids);
    ?>
    <div 
        class="intro-item" 
        data-id="<?php echo $id; ?>" 
        data-src="<?php echo $thumbnail_url; ?>"
        data-terms="<?php echo implode('|', $terms_ids_arr); ?>"
    >
        <button 
            type="button" 
            class="texture-item<?php echo $is_selected_classname; ?>" 
        >
            <img src="<?php echo $thumbnail_url; ?>" alt="<?php echo $title; ?>" title="<?php echo $title; ?>" />
            <div class="full-description">
                <?php echo single_full_texture_item(); ?>
            </div>
        </button>
    </div>
    <?php
}

function single_full_texture_item()
{
    $id = get_the_ID();
    $title = get_the_title();
    $thumbnail_url = get_the_post_thumbnail_url($id, 'medium');
    $code = get_field('code', $id);
    $thickness = get_field('thickness', $id);
    $brand = get_field('brand', $id);
    ?>
    <div class="color-item" data-id="<?php echo $id; ?>">
        <div class="top-container">
            <a href="#" class="image-block">
                <img src="<?php echo $thumbnail_url; ?>" alt="<?php echo $title; ?>" title="<?php echo $title; ?>" />
            </a>
            <div class="intro-container">
                <table class="intro-container-inner">
                    <tr class="item">
                        <th class="name">Name:</th>
                        <td class="value"><?php echo $title; ?></td>
                    </tr>
                    <?php if($code): ?>
                        <tr class="item">
                            <th class="name">Code:</th>
                            <td class="value"><?php echo $code; ?></td>
                        </tr>
                    <?php endif; ?>
                    <?php if($brand): ?>
                        <tr class="item">
                            <th class="name">Brand:</th>
                            <td class="value"><?php echo $brand; ?></td>
                        </tr>
                    <?php endif; ?>
                    <?php if($thickness): ?>
                        <tr class="item">
                            <th class="name">Thickness:</th>
                            <td class="value"><?php echo $thickness; ?></td>
                        </tr>
                    <?php endif; ?>
                </table>
            </div>
        </div>
    </div>
    <?php
}