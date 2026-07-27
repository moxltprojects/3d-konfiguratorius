<?php

$data = $args['data'];
$taskID = $data['taskID'];
$pageSummaries = $data['pageSummaries'];
$colorScheme = $data['colorScheme'];
$fontFamilies = $data['fontFamilies'];

$devMode = $args['devMode'];
?>
<div class="mox-results-box-summary">
    <div class="mox-results-box-summary-wrapper">
        <div class="mox-results-box-summary-header">
            <h2><?php echo preg_replace('/^https?:\/\//', '', $data['website']); ?> website analysis</h2>
        </div>
        <div class="mox-results-box-summary-content">
            <div class="tabs">
                <div class="tab-buttons">
                    <?php $num = 0; $first = true; foreach ($pageSummaries as $pageSummary) : ?>
                        <div class="tab-button-wrapper <?php echo $first ? 'active-btn' : ''; ?>">
                            <button type="button" class="tab-button active" onclick="showTab(this, 'summary-<?php echo $num; ?>')"><?php echo $pageSummary['name']; ?></button>
                        </div>
                    <?php $num++; $first = false; endforeach; ?>
                </div>
                <div class="tab-contents">
                    <?php $num = 0; $first = true; foreach ($pageSummaries as $pageSummary) : ?>
                        <div id="summary-<?php echo $num; ?>" class="tab-content <?php echo $first ? 'active' : ''; ?>">
                            <div class="tab-content-box">
                                <?php echo $pageSummary['summary']; ?>
                                <div class="show-more-button">   
                                    <button type="button" class="fusion-button button-flat fusion-button-default-size button-custom fusion-button-default button-12345 fusion-button-default-span fusion-button-default-type show-more-button-button" style="--button_accent_color:var(--awb-color2);--button_border_color:var(--awb-color5);--button_accent_hover_color:var(--awb-color2);--button_border_hover_color:var(--awb-color5);--button_gradient_top_color:rgba(255,255,255,0);--button_gradient_bottom_color:rgba(255,255,255,0);--button_gradient_top_color_hover:rgba(255,255,255,0);--button_gradient_bottom_color_hover:rgba(255,255,255,0);" onclick="showMoreContent(this, 'summary-<?php echo $num; ?>')">
                                        <span class="fusion-button-text">Read more</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    <?php $num++; $first = false; endforeach; ?>
                </div>
            </div>
        </div>
    </div>
</div>
<div class="mox-results-box-color-scheme">
    <div class="mox-results-box-color-scheme-wrapper">
        <div class="mox-results-box-color-scheme-header">
            <h2>Color Scheme</h2>
        </div>
        <div class="mox-results-box-color-scheme-content">
            <div class="mox-results-box-color-scheme-colors">
                <?php
                
                // sort by percentage
                usort($colorScheme, function($a, $b) {
                    return $b['percentage'] - $a['percentage'];
                });
                
                foreach ($colorScheme as $color) : ?>
                <div class="mox-results-box-color-scheme-colors-item">
                    <div class="mox-results-box-color-scheme-colors-item-wrapper">
                        <div class="mox-results-box-color-scheme-colors-item-color" style="background-color: <?php echo $color['color']; ?>;"></div>
                        <div class="mox-results-box-color-scheme-colors-item-name">
                            <span><?php echo $color['color']; ?></span>
                        </div>
                        <div class="mox-results-box-color-scheme-colors-item-percentage">
                            <span><?php echo $color['percentage']; ?>%</span>
                        </div>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
        </div>
    </div>
</div>
<div class="mox-results-box-font-families">
    <div class="mox-results-box-font-families-wrapper">
        <div class="mox-results-box-font-families-header">
            <h2>Font Families</h2>
        </div>
        <div class="mox-results-box-font-families-content">
            <div class="mox-results-box-font-families-list">
                <?php if (!empty($fontFamilies['preferredFamilies'])) : ?>
                    <ul class="mox-font-list">
                        <?php foreach ($fontFamilies['preferredFamilies'] as $font) : ?>
                            <li class="mox-font-item">
                                <span class="mox-font-name">
                                    <?php echo $font; ?>
                                </span>
                            </li>
                        <?php endforeach; ?>
                    </ul>
                <?php else : ?>
                    <p>Custom fonts not detected.</p>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<div class="mox-results-box-generate-stand">
    <div class="mox-results-box-generate-stand-header">
        <h2>Prepare and structurize information</h2>
        <button type="button" class="fusion-button button-flat fusion-button-default-size button-custom fusion-button-default button-12345 fusion-button-default-span fusion-button-default-type" onclick="aiStandApp.generateStand('<?php echo $taskID; ?>', this)">
            <span class="fusion-button-text">Begin</span>
        </button>
    </div>

    <div class="mox-results-box-analyze-furniture">
        <div class="mox-results-box-analyze-furniture-header">
            <h3>Analyze furniture from your photo (optional)</h3>
        </div>
        <div class="mox-results-box-analyze-furniture-content">
            <?php get_template_part('template-parts/furniture_analyze_form', null, array('devMode' => $devMode)); ?>
        </div>
    </div>


    <div class="mox-results-box-generate-stand-configurator"></div>
</div>


