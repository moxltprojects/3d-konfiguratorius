<?php 
$heading1 = get_theme_mod('heading_section_1');
$heading2 = get_theme_mod('heading_section_2');
?>

<div class="config-term-settings-furniture-shortcode">
    <div class="config-term-settings-furniture-shortcode-inner">
       <div class="config-category-content">
            <div class="config-category-content-inner">
                <?php if(!empty($heading1)) : ?>
                    <h2><?php echo $heading1; ?></h2>
                <?php endif; ?>

                <?php include __DIR__ .'/gallery/carousel-gallery-preview.php'; ?>

                <?php include __DIR__ .'/content-type-cta.php'; ?>
            </div>
        </div>
    </div>
    <div class="display-type-container"></div>
</div>

<script>
    window.addEventListener('DOMContentLoaded', function() {
        console.log("TEST")
        initCategoryContent();
    });
</script>