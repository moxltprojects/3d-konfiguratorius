

<div class="templates-list<?php echo isset($index) && $index === 0 ? ' current' : ''; ?>">
    <div class="templates-list-inner">
        <?php if($templatesLoop->have_posts()): ?>
            <?php while($templatesLoop->have_posts()): $templatesLoop->the_post(); ?>
                <?php 
                    include __DIR__ .'/single-template.php'; 
                ?>
                <?php endwhile; ?>
                <?php wp_reset_postdata(); ?>
            <?php else: ?>
                <p><?php echo __('The list is empty.', 'furniture-config'); ?></p>
        <?php endif; ?>
    </div>
</div>