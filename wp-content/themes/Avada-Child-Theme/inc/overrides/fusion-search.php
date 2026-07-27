<?php
/**
 * Add an element to fusion-builder.
 *
 * @package fusion-builder
 * @since 2.2.0
 */

if ( fusion_is_element_enabled( 'fusion_search' ) ) {

	if ( ! class_exists( 'FusionSC_Search_Custom' ) ) {
		/**
		 * Shortcode class.
		 *
		 * @since 2.2.0
		 */
		class FusionSC_Search_Custom extends Fusion_Element {

			/**
			 * An array of the shortcode arguments.
			 *
			 * @access protected
			 * @since 2.2.0
			 * @var array
			 */
			protected $args;

			/**
			 * The internal container counter.
			 *
			 * @access private
			 * @since 3.0
			 * @var int
			 */
			private $counter = 1;

			/**
			 * Constructor.
			 *
			 * @access public
			 * @since 2.2.0
			 */
			public function __construct() {
				parent::__construct();
				add_filter( 'fusion_attr_search-element', [ $this, 'attr' ] );

				add_shortcode( 'fusion_search', [ $this, 'render' ] );

				if ( ! is_admin() ) {
					add_filter( 'pre_get_posts', [ $this, 'modify_search_filter' ] );
				}
			}

			/**
			 * Modifies the search filter.
			 *
			 * @access public
			 * @since 2.2.0
			 * @param object $query The search query.
			 * @return object $query The modified search query.
			 */
			public function modify_search_filter( $query ) {
				if ( is_search() && $query->is_search ) {

					if ( isset( $_GET ) && isset( $_GET['fs'] ) && isset( $_GET['post_type'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification
						$query->set( 'post_type', wp_unslash( $_GET['post_type'] ) ); // phpcs:ignore WordPress.Security.NonceVerification, WordPress.Security.ValidatedSanitizedInput
					}
				}

				return $query;
			}

			/**
			 * Maps settings to param variables.
			 *
			 * @static
			 * @access public
			 * @since 2.2.0
			 * @return array
			 */
			public static function settings_to_params() {
				return [
					'search_form_design' => 'design',
				];
			}

			/**
			 * Gets the default values.
			 *
			 * @static
			 * @access public
			 * @since 2.2.0
			 * @return array
			 */
			public static function get_element_defaults() {
				$fusion_settings = awb_get_fusion_settings();
				return [
					'animation_type'              => '',
					'animation_direction'         => 'down',
					'animation_speed'             => '',
					'animation_offset'            => $fusion_settings->get( 'animation_offset' ),
					'class'                       => '',
					'search_content'              => '',
					'placeholder'                 => 'Search...',
					'design'                      => $fusion_settings->get( 'search_form_design' ),
					'live_search'                 => $fusion_settings->get( 'live_search' ) ? 'yes' : 'no',
					'search_limit_to_post_titles' => $fusion_settings->get( 'search_limit_to_post_titles' ) ? 'yes' : 'no',
					'input_height'                => $fusion_settings->get( 'form_input_height' ),
					'bg_color'                    => $fusion_settings->get( 'form_bg_color' ),
					'text_size'                   => $fusion_settings->get( 'form_text_size' ),
					'text_color'                  => $fusion_settings->get( 'form_text_color' ),
					'border_width'                => false,
					'border_size_top'             => '',
					'border_size_right'           => '',
					'border_size_bottom'          => '',
					'border_size_left'            => '',
					'border_color'                => $fusion_settings->get( 'form_border_color' ),
					'focus_border_color'          => $fusion_settings->get( 'form_focus_border_color' ),
					'border_radius'               => $fusion_settings->get( 'form_border_radius' ),
					'hide_on_mobile'              => fusion_builder_default_visibility( 'string' ),
					'sticky_display'              => '',
					'id'                          => '',
					'margin_bottom'               => '',
					'margin_left'                 => '',
					'margin_right'                => '',
					'margin_top'                  => '',
				];
			}

			/**
			 * Render the shortcode
			 *
			 * @access public
			 * @since 2.2.0
			 * @param  array  $args    Shortcode parameters.
			 * @param  string $content Content between shortcode.
			 * @return string          HTML output.
			 */
			public function render( $args, $content = '' ) {
				$defaults   = FusionBuilder::set_shortcode_defaults( self::get_element_defaults(), $args, 'fusion_search' );
				$this->args = $defaults;

				// Old value check.
				if ( $this->args['border_width'] ) {
					$this->args['border_width']       = fusion_library()->sanitize->get_value_with_unit( $this->args['border_width'] );
					$this->args['border_size_top']    = '' !== $this->args['border_size_top'] ? $this->args['border_width'] : $this->args['border_size_top'];
					$this->args['border_size_right']  = '' !== $this->args['border_size_right'] ? $this->args['border_width'] : $this->args['border_size_right'];
					$this->args['border_size_bottom'] = '' !== $this->args['border_size_bottom'] ? $this->args['border_width'] : $this->args['border_size_bottom'];
					$this->args['border_size_left']   = '' !== $this->args['border_size_left'] ? $this->args['border_width'] : $this->args['border_size_left'];
				}

				$this->args['margin_top']    = fusion_library()->sanitize->get_value_with_unit( $this->args['margin_top'] );
				$this->args['margin_right']  = fusion_library()->sanitize->get_value_with_unit( $this->args['margin_right'] );
				$this->args['margin_bottom'] = fusion_library()->sanitize->get_value_with_unit( $this->args['margin_bottom'] );
				$this->args['margin_left']   = fusion_library()->sanitize->get_value_with_unit( $this->args['margin_left'] );
				$this->args['input_height']  = fusion_library()->sanitize->get_value_with_unit( $this->args['input_height'] );
				$this->args['border_radius'] = fusion_library()->sanitize->get_value_with_unit( $this->args['border_radius'] );

				$html  = '';
				$html .= '<div ' . FusionBuilder::attributes( 'search-element' ) . '>';
				$html .= $this->get_search_form();
				$html .= '</div>';

				$styles = $this->get_styles();

				$html = $styles . $html;

				$this->counter++;

				$this->on_render();

				return apply_filters( 'fusion_element_search_content', $html, $args );
			}

			/**
			 * Get the searchform
			 *
			 * @access public
			 * @since 2.1
			 * @return array
			 */
			public function get_search_form() {
				$extra_fields = '';

				if ( ! $this->args['search_content'] ) {
					$this->args['search_content'] = 'any';
				}

				$search_content = explode( ',', $this->args['search_content'] );
				$search_content = apply_filters( 'avada_search_results_post_types', $search_content );

				if ( $search_content ) {
					if ( 1 === count( $search_content ) && 'product' === $search_content[0] ) {
						$extra_fields .= '<input type="hidden" name="post_type" value="' . $search_content[0] . '" />';
					} else {
						foreach ( $search_content as $value ) {
							$extra_fields .= '<input type="hidden" name="post_type[]" value="' . $value . '" />';
						}
					}
				}

				$extra_fields .= '<input type="hidden" name="search_limit_to_post_titles" value="' . ( 'yes' === $this->args['search_limit_to_post_titles'] ? '1' : '0' ) . '" />';

				// Activate the search filter.
				$extra_fields .= '<input type="hidden" name="fs" value="1" />';

				$args = [
					'live_search'  => 'yes' === $this->args['live_search'] ? 1 : 0,
					'design'       => $this->args['design'],
					'after_fields' => $extra_fields,
				];

				if ( $this->args['placeholder'] ) {
					$args['placeholder'] = $this->args['placeholder'];
				}

				ob_start();
				Fusion_Searchform_Custom::get_form( $args );
				$form = ob_get_clean();

				return apply_filters( 'get_search_form', $form, $args );
			}

			/**
			 * Generate style block
			 *
			 * @access public
			 * @since  3.0
			 * @return string
			 */
			public function get_styles() {
				$styles = '<style type="text/css">';

				if ( '' !== $this->args['input_height'] ) {
					$styles .= '.fusion-search-element-' . $this->counter . ' .searchform .fusion-search-form-content .fusion-search-field input,';
					$styles .= '.fusion-search-element-' . $this->counter . ' .searchform .fusion-search-form-content .fusion-search-button input[type=submit] {';
					$styles .= 'height: ' . $this->args['input_height'] . ';';
					$styles .= '}';

					$styles .= '.fusion-search-element-' . $this->counter . ' .searchform .fusion-search-form-content .fusion-search-button input[type=submit] {';
					$styles .= 'line-height: ' . $this->args['input_height'] . ';';
					$styles .= '}';

					$styles .= '.fusion-search-element-' . $this->counter . '.fusion-search-form-clean .searchform .fusion-search-form-content .fusion-search-field input {';
					$styles .= 'padding-left: ' . $this->args['input_height'] . ';';
					$styles .= '}';

					$styles .= '.fusion-search-element-' . $this->counter . ' .searchform .fusion-search-form-content .fusion-search-button input[type=submit] {';
					$styles .= 'width: ' . $this->args['input_height'] . ';';
					$styles .= '}';
				}

				if ( '' !== $this->args['text_color'] ) {
					$styles .= '.fusion-search-element-' . $this->counter . ' .searchform .fusion-search-form-content .fusion-search-field input,';
					$styles .= '.fusion-search-element-' . $this->counter . ' .searchform .fusion-search-form-content .fusion-search-field input::placeholder,';
					$styles .= '.fusion-search-element-' . $this->counter . '.fusion-search-form-clean .searchform .fusion-search-form-content .fusion-search-button input[type=submit] {';
					$styles .= 'color: ' . $this->args['text_color'] . ';';
					$styles .= '}';
				}

				if ( '' !== $this->args['focus_border_color'] ) {
					$styles .= '.fusion-search-element-' . $this->counter . ' .searchform .fusion-search-form-content .fusion-search-field input:focus {';
					$styles .= 'border-color: ' . $this->args['focus_border_color'] . ';';
					$styles .= '}';
				}

				if ( '' !== $this->args['text_size'] ) {
					$styles .= '.fusion-search-element-' . $this->counter . ' .searchform .fusion-search-form-content .fusion-search-field input,';
					$styles .= '.fusion-search-element-' . $this->counter . '.fusion-search-form-clean .searchform .fusion-search-form-content .fusion-search-button input[type=submit] {';
					$styles .= 'font-size: ' . $this->args['text_size'] . ';';
					$styles .= '}';
				}

				$styles .= '.fusion-search-element-' . $this->counter . ' .searchform .fusion-search-form-content .fusion-search-field input {';

				if ( '' !== $this->args['bg_color'] ) {
					$styles .= 'background-color: ' . $this->args['bg_color'] . ';';
				}

				foreach ( [ 'top', 'right', 'bottom', 'left' ] as $direction ) {
					if ( '' !== $this->args[ 'border_size_' . $direction ] ) {
						$styles .= 'border-' . $direction . '-width:' . Fusion_Sanitize::get_value_with_unit( $this->args[ 'border_size_' . $direction ] ) . ';';
					}
				}

				if ( '' !== $this->args['border_color'] ) {
					$styles .= 'border-color: ' . $this->args['border_color'] . ';';
				}

				$styles .= '}';

				if ( '' !== $this->args['border_radius'] ) {
					$styles .= '.fusion-search-element-' . $this->counter . ' .searchform.fusion-search-form-classic .fusion-search-form-content, .fusion-search-form-classic .searchform:not(.fusion-search-form-clean) .fusion-search-form-content {';
					$styles .= 'border-radius: ' . $this->args['border_radius'] . ';';
					$styles .= 'overflow: hidden;';
					$styles .= '}';
					$styles .= '.fusion-search-element-' . $this->counter . ' .fusion-search-form-content input.s {';
					$styles .= 'border-radius: ' . $this->args['border_radius'] . ';';
					$styles .= '}';
				}

				$styles .= '</style>';

				return $styles;
			}

			/**
			 * Builds the attributes array.
			 *
			 * @access public
			 * @since 2.2.0
			 * @return array
			 */
			public function attr() {

				$attr = [
					'class' => 'fusion-search-element fusion-search-element-' . $this->counter,
					'style' => '',
				];

				// Visibility.
				$attr = fusion_builder_visibility_atts( $this->args['hide_on_mobile'], $attr );

				// Margins.
				$attr['style'] .= Fusion_Builder_Margin_Helper::get_margins_style( $this->args );

				$attr['class'] .= Fusion_Builder_Sticky_Visibility_Helper::get_sticky_class( $this->args['sticky_display'] );

				// Animation class.
				if ( $this->args['animation_type'] ) {
					$attr = Fusion_Builder_Animation_Helper::add_animation_attributes( $this->args, $attr );
				}

				if ( $this->args['class'] ) {
					$attr['class'] .= ' ' . $this->args['class'];
				}

				if ( $this->args['design'] ) {
					$attr['class'] .= ' fusion-search-form-' . $this->args['design'];
				}

				if ( $this->args['id'] ) {
					$attr['id'] = $this->args['id'];
				}

				return $attr;
			}

		}
	}

	new FusionSC_Search_Custom();

}

