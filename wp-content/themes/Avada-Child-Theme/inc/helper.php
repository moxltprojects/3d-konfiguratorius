<?php 

function my_get_product_taxonomy_terms( $args ) {

    if ( empty( $args['product_taxonomy'] ) ) {
        return [];
    }

    $taxonomy = sanitize_text_field( $args['product_taxonomy'] );

    $terms = get_terms( [
        'taxonomy'   => $taxonomy,
        'hide_empty' => false,
    ] );

    if ( is_wp_error( $terms ) ) {
        return [];
    }

    $options = [];

    foreach ( $terms as $term ) {
        $options[ $term->slug ] = $term->name;
    }

    return $options;
}

function render_post_items($args, $video_popup)
{
    $html = '';

    $loop = new WP_Query( $args );

    if($video_popup) {
        $index = 0;
        while ( $loop->have_posts() ) {
            $loop->the_post();
            $index++;
            $id = esc_attr( $index . '-' . rand(1000, 10000) );
            $post = get_post();
            $html .= render_post_item_with_video($post, $id);
        }
    } else {
        while ( $loop->have_posts() ) {
            $loop->the_post();
            $post = get_post();
            $html .= render_post_item($post);
        }
    }

    wp_reset_postdata();

    return $html;
}


function render_product_items($args, $product_taxonomy, $product_taxonomy_slugs)
{
    $html = '';
    if($product_taxonomy) {
        $args['tax_query'] = array(
            array(
                'taxonomy' => $product_taxonomy,
                'field' => 'slug',
                'terms' => array_map('trim', explode(',', $product_taxonomy_slugs)),
            )
        );
    }

    $loop = new WP_Query( $args );

    while ( $loop->have_posts() ) {
        $loop->the_post();
        
        $product = wc_get_product(get_the_ID());
        $html .= render_product_item($product);
    }
    wp_reset_postdata();

    return $html;
}


function render_product_item($product) {
    if(!$product) return;
    ob_start();
    $permalink = get_permalink($product->get_id());
    ?>
    <div class="swiper-slide post-item">
        <div class="post-item-inner">
            <a href="<?php echo esc_url( $permalink ); ?>">
                <?php echo get_the_post_thumbnail($product->get_id(), 'medium'); ?>
            </a>
            <a href="<?php echo esc_url( $permalink ); ?>">
                <h3><?php echo esc_html($product->get_name()); ?></h3>
            </a>
            <div class="excerpt">
                <?php echo wp_kses_post( get_the_excerpt($product->get_id()) ); ?>
            </div>
            <div class="prices"><?php echo wc_price($product->get_price()); ?></div>
        </div>
    </div>
    <?php
    return ob_get_clean();
}

function render_post_item($post) {
    ob_start();
    $id = $post->ID;
    $permalink = get_permalink($id);
    ?>
    <div class="swiper-slide post-item">
        <div class="post-item-inner">
            <a href="<?php echo esc_url( $permalink ); ?>">
                <?php echo get_the_post_thumbnail($id, 'medium'); ?>
            </a>
            <a href="<?php echo esc_url( $permalink ); ?>">
                <h3><?php echo esc_html($post->post_title); ?></h3>
            </a>
            <div class="excerpt">
                <?php echo wp_kses_post( get_the_excerpt($id) ); ?>
            </div>
        </div>
    </div>
    <?php
    return ob_get_clean();
}


function render_post_item_with_video($post, $index) {

    $id = $post->ID;

    $video = get_field('video', $id);
    if(empty($video)) return;

    $video_type = $video['type'];

    ob_start();
    ?>
    <div class="swiper-slide post-item post-video-item">
        <div class="post-item-inner">
            <a class="video-link" href="#<?php echo $index; ?>" data-lity>
                <?php echo get_the_post_thumbnail($id, 'medium'); ?>
            </a>
            <h3><?php echo esc_html($post->post_title); ?></h3>
            <div class="excerpt">
                <?php echo wp_kses_post( get_the_excerpt($id) ); ?>
            </div>
        </div>
        <div id="<?php echo $index; ?>" class="lity-hide">
            <?php if($video_type === 'file'): ?>
                <?php
                    $file = $video['file'];
                    $mime_type = $file['mime_type'];
                    $link = $file['url'];
                    // var_dump($file);
                ?>
                <video width="760" height="615" controls>
                    <source src="<?php echo $link; ?>" type="<?php echo $mime_type; ?>">
                        Your browser does not support the video tag.
                </video>

                <?php else: ?>
                    <?php
                        $yt_id = $video['youtube_id'];
                    ?>
                    <iframe 
                        width="760" 
                        height="615" 
                        src="https://www.youtube.com/embed/<?php echo $yt_id; ?>" 
                        title="YouTube video player"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen>
                    </iframe>
            <?php endif; ?>
        </div>
    </div>
    <?php
    return ob_get_clean();
}
