<?php 

function fusion_element_custom_shortcodes() {

    $taxonomies = get_object_taxonomies( 'product', 'objects' );

    $product_tax_options = [
        'product_cat' => 'Categories',
        'product_tag' => 'Tags',
        'product_collection' => 'Collection'
    ];

    // foreach ( $taxonomies as $taxonomy ) {
    //     $product_tax_options[ $taxonomy->label ] = $taxonomy->name;
    // }

    $post_types = get_post_types(
        [
            'public' => true,
        ],
        'objects'
    );

    $post_type_options = [];

    foreach ( $post_types as $post_type ) {
        $post_type_options[ $post_type->labels->singular_name ] = $post_type->name;
    }
    $post_type_options[ 'product' ] = 'Product';
    $post_type_options[ 'artwork' ] = 'Artwork';

    fusion_builder_map(
        array(
            'name'            => esc_attr__( 'Posts Carousel', 'fusion-builder' ),
            'shortcode'       => 'trukme_posts_carousel',
            'icon'            => 'fusiona-font',
            'params'          => array(
				[
                    'type'        => 'radio_button_set',
                    'heading'     => esc_attr__( 'Style', 'fusion-builder' ),
                    'description' => esc_attr__( 'Style 1 - thumbnail smaller, Style 2 - Thumbnail larger.', 'fusion-builder' ),
                    'param_name'  => 'style',
                    'value'       => [
                        'style-1' => 'Style 1',
                        'style-2' => 'Style 2',
                        'style-3' => 'Style 3',
                    ],
                    'default' => 'style-1',
                ],
                [
                    'type'        => 'radio_button_set',
                    'heading'     => esc_attr__( 'Video popup', 'fusion-builder' ),
                    'param_name'  => 'video_popup',
                    'value'       => [
                        'false' => 'No',
                        'true' => 'Yes',
                    ],
                    'default' => 'false',
                ],
                [
                    'type'        => 'select',
                    'heading'     => esc_attr__( 'Post Type', 'fusion-builder' ),
                    'param_name'  => 'post_type',
                    'value'       => $post_type_options,
                    'default' => 'product',
                ],
                [
                    'type'        => 'select',
                    'heading'     => esc_attr__( 'Product Taxonomy', 'fusion-builder' ),
                    'param_name'  => 'product_taxonomy',
                    'value'       => $product_tax_options,
                    'dependency'  => [
                        [
                            'element'  => 'post_type',
                            'value'    => 'product',
                            'operator' => '==',
                        ],
                    ],
                ],
                [
                    'type'        => 'textfield',
                    'heading'     => esc_attr__( 'Product Taxonomy Slugs', 'fusion-builder' ),
                    'param_name'  => 'product_taxonomy_slugs',
                    'description' => esc_attr__( 'Enter slugs separated by commas (e.g. doors,tables,drawers)', 'fusion-builder' ),
                    'dependency'  => [
                        [
                            'element'  => 'product_taxonomy',
                            'value'    => '',
                            'operator' => '!=',
                        ],
                    ],
                ],
                [
                    'type'        => 'range',
                    'heading'     => esc_attr__( 'Number of Posts', 'fusion-builder' ),
                    'description' => esc_attr__( 'Select number of posts per page. Set to -1 to display all. Set to 0 to use the post type default number of posts. For %1$s and %2$s this comes from the global options. For all others Settings > Reading.', 'fusion-builder' ),
                    'param_name'  => 'number_posts',
                    'min'         => '-1',
                    'max'         => '50',
                    'step'        => '1',
                    'value'       => '0',
                    'callback'    => [
                        'function' => 'fusion_ajax',
                        'action'   => 'get_fusion_post_cards',
                        'ajax'     => true,
                    ],
                ],
                [
                    'type'        => 'radio_button_set',
                    'heading'     => esc_attr__( 'Loop', 'fusion-builder' ),
                    'description' => esc_attr__( 'Is Loop.', 'fusion-builder' ),
                    'param_name'  => 'loop_status',
                    'value'       => [
                        'false' => 'No',
                        'true' => 'Yes',
                    ],
                    'default' => 'false',
                ],
                [
                    'type'        => 'radio_button_set',
                    'heading'     => esc_attr__( 'Autoplay', 'fusion-builder' ),
                    'description' => esc_attr__( 'Is Autoplay.', 'fusion-builder' ),
                    'param_name'  => 'autoplay_status',
                    'value'       => [
                        'false' => 'No',
                        'true' => 'Yes',
                    ],
                    'default' => 'true',
                ],
                [
                    'type'        => 'range',
                    'heading'     => esc_attr__( 'Autoplay Speed', 'fusion-builder' ),
                    'param_name'  => 'autoplay_speed',
                    'value'       => '10000',
                    'min'         => '0',
                    'max'         => '20000',
                    'dependency'  => [
                        [
                            'element'  => 'autoplay_status',
                            'value'    => 'true',
                            'operator' => '==',
                        ],
                    ],
                ],
            )
        ),
    );

}

add_action( 'fusion_builder_before_init', 'fusion_element_custom_shortcodes' );

add_action('init', 'shortcodes_all');
function shortcodes_all() {
    add_shortcode('pterm_banner_title', 'pterm_banner_title_shortcode');
    add_shortcode('pterm_banner_image', 'pterm_banner_image_shortcode');
    add_shortcode('pterm_bottom_content_image', 'pterm_bottom_content_image_shortcode');
    add_shortcode('pterm_bottom_content_title', 'pterm_bottom_content_title_shortcode');
    add_shortcode('pterm_bottom_content_body', 'pterm_bottom_content_body_shortcode');
    add_shortcode('trukme_posts_carousel', 'trukme_posts_carousel_shortcode');
}

function pterm_banner_title_shortcode($args, $content) {
    if (is_product_category()) {
        $term = get_queried_object(); 

        $banner = get_field('banner', $term);
        $banner_title = $banner['title'];

        if(empty($banner_title))  return '';

        return $banner_title;
    }

    return '';
}

function pterm_banner_image_shortcode($args, $content) {
    if (is_product_category()) {
        $term = get_queried_object(); 
    
        $banner = get_field('banner', $term);
        $banner_image = isset($banner['image']) ? $banner['image'] : null;

        if(empty($banner_image)) return '';

        return $banner_image;
    }

    return '';
}

function pterm_bottom_content_title_shortcode($args, $content) {
    if (is_product_category()) {
        $term = get_queried_object(); 
    
        $bottom_content = get_field('bottom_content', $term);
        $title = $bottom_content['title'];

        if(empty($title)) return '';

        return esc_html($title);
    }

    return '';
}

function pterm_bottom_content_body_shortcode($args, $content) {
    if (is_product_category()) {
        $term = get_queried_object(); 
    
        $bottom_content = get_field('bottom_content', $term);
        $body = $bottom_content['body'];

        if(empty($body)) return '';

        return $body;
    }

    return '';
}

function pterm_bottom_content_image_shortcode($args, $content) {
    if (is_product_category()) {
        $term = get_queried_object(); 
        
        $bottom_content = get_field('bottom_content', $term);
        $image = $bottom_content['image'];

        if(empty($image)) return '';

        return $image;
    }

    return '';
}

function trukme_posts_carousel_shortcode($atts, $content) {
    
	$atts = shortcode_atts( array(
        'style' => '',
        'video_popup' => '',
        'post_type' => '',
    	'product_taxonomy' => '',
        'product_taxonomy_slugs' => '',
        'number_posts' => '',
        'loop_status' => '',
        'autoplay_status' => '',
        'autoplay_speed' => '',
    ), $atts);
	$style = $atts['style'];
    $post_type = $atts['post_type'];
	$video_popup = $atts['video_popup'];
    $number_posts = $atts['number_posts'];
    // $autoplay_status = $atts['autoplay_status'];
    // $autoplay_speed = $atts['autoplay_speed'];
    $id = rand(100000, 999999);

    $children_html = '';
    $args = array(
        'posts_per_page' => $number_posts == '-1' ? -1 : intval($number_posts),
        'post_type' => $post_type,
        'post_status' => 'publish',
    );

    if($post_type === 'product') {
        $product_taxonomy = $atts['product_taxonomy'];
        $product_taxonomy_slugs = $atts['product_taxonomy_slugs'];
        $children_html = render_product_items($args, $product_taxonomy, $product_taxonomy_slugs);
    } else {
        $children_html = render_post_items($args, $video_popup);
    }

    ob_start(); 
    ?>
    <div class="hejfront-carousel <?php echo $style; ?>">
        <div class="hejfront-carousel-inner">
            <div class="swiper" data-id="<?php echo $id; ?>">
                <div class="swiper-wrapper">
                    <?php echo $children_html; ?>
                </div>
                <div class="swiper-button-next swiper-button"></div>
                <div class="swiper-button-prev swiper-button"></div>
            </div>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', initSwiper);

        function initSwiper() {

            const id = "<?php echo $id; ?>";
            const swiperItem = document.querySelector(`.swiper[data-id="${id}"]`);
            let slideCount = swiperItem.querySelectorAll('.swiper-slide').length;
            const loop = "<?php echo $atts['loop_status']; ?>";

            let options = {
                slidesPerView: 1.5,
                spaceBetween: 10,
                mousewheel: true,
                centeredSlides: true,
                slidesOffsetBefore: 20,
                slidesOffsetAfter: 20,
                watchSlidesProgress: true,
                loop: "<?php echo $atts['loop_status']; ?>" === 'true',
                breakpoints: {
                    768: { slidesPerView: 2.5, spaceBetween: 16, loop: slideCount <= 3 || loop !== 'true' ? false : true },
                    1201: { slidesPerView: 3.5, spaceBetween: 16, loop: slideCount <= 3 || loop !== 'true' ? false : true },
                },
                
                navigation: {
                    nextEl: swiperItem.querySelector('.swiper-button-next'),
                    prevEl: swiperItem.querySelector('.swiper-button-prev'),
                }
            };

            if (slideCount <= 3) options.loop = false;

            if ("<?php echo $atts['autoplay_status']; ?>" === 'true') {
                options.autoplay = {
                    delay: parseInt("<?php echo $atts['autoplay_speed']; ?>"),
                    disableOnInteraction: true
                };
            }

            new window.Swiper(swiperItem, options);

            buttonsPosition(swiperItem);

            window.addEventListener('resize', () => buttonsPosition(swiperItem));
        }

        function buttonsPosition(swiperItem) {
            const image = swiperItem.querySelector('img');
            if(!image) return;
            
            const imageHeight = parseFloat(image.clientHeight) / 2;
            const buttons = swiperItem.querySelectorAll('.swiper-button');

            buttons.forEach(button => {
                button.style.top = `${imageHeight}px`;
            });
        }

        jQuery(function ($) {
            $(document).on('lity:close', function(event, instance) {
                const iframe = instance.element().find('iframe');
                const video = instance.element().find('video');

                iframe.each(function () {
                    const src = this.src;
                    this.src = src; // reload = stops video
                });
     
                video.each(function () {
                    this.pause();
                    this.currentTime = 0;
                    this.load();
                });
            });
        });

    </script>

    <?php
    return ob_get_clean();
}
