<div class="tempalates-categories">
    <div class="tempalates-categories-inner">
        <?php foreach($templatesCategories as $index => $templateCategory): ?>
            <div class="template-category">
                <button class="template-category-button">
                    <?php $templateCategory->name; ?>
                </button>
            </div>
        <?php endforeach; ?>
    </div>
</div>