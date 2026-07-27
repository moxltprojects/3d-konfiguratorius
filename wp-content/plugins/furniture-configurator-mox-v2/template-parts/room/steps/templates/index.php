<?php 
global $furniture_config_v2_template_parts_url;
$templatesCategories = get_room_templates_categories();

?>


<section class="templates-container" data-step="1">
    <div class="templates-container-inner">
        <?php include $furniture_config_v2_template_parts_url . '/room/config-data/selector.php'; ?>
        <div class="types-separator">
            <p>OR</p>
        </div>
        <div class="templates-main">
        <?php if(!empty($templatesCategories)): ?>
            <?php include __DIR__ . '/categories-list.php'; ?>

            <?php foreach($templatesCategories as $index => $templateCategory) : ?>
                <?php 
                    $templatesLoop = get_templates_query($templateCategory->slug);
                ?>
                <?php include __DIR__ . '/templates-list.php'; ?>
                <?php endforeach; ?>
            <?php else: ?>
                <?php 
                    $templatesLoop = get_templates_query();
                ?>
                <?php include __DIR__ . '/templates-list.php'; ?>
            <?php endif; ?>
        </div>
    </div>
</section>
