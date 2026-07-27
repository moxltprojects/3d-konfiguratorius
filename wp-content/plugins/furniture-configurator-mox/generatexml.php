<?php 

function init_products_xml($xml_table_id){
	$doc = new DOMDocument('1.0', 'UTF-8');
    $doc->formatOutput = true;
	$header_row_id = '24515';
	$header_row_type = '173';
	$header_row_name = 'Trukme_Pauliui';

    $xml = $doc->createElement('XML');
    $xml->setAttribute('Type', 'CMS-XMLExport');
    $xml->setAttribute('ExportVersion', '16.0.2.231');
    $doc->appendChild($xml);

    $set = $doc->createElement('Set');
    $set->setAttribute('TABLE', $xml_table_id);
    $set->setAttribute('DELSET', '0');

    $fldSetId = $doc->createElement('FLD');
    $fldSetId->setAttribute('DB', 'ID');
    $fldSetId->setAttribute('VAL', $header_row_id);
    $fldSetId->setAttribute('TYP', '1');

	$fldSetType = $doc->createElement('FLD');
    $fldSetType->setAttribute('DB', 'TYPE');
    $fldSetType->setAttribute('VAL', $header_row_type);
    $fldSetType->setAttribute('TYP', '0');

	$fldSetName = $doc->createElement('FLD');
    $fldSetName->setAttribute('DB', 'NAME');
    $fldSetName->setAttribute('VAL', $header_row_name);
    $fldSetName->setAttribute('TYP', '0');

    $set->appendChild($fldSetId);
	$set->appendChild($fldSetType);
	$set->appendChild($fldSetName);

    $xml->appendChild($set);
    return [$doc, $xml];
}

function end_products_xml($doc, $xml){
	$rows = [
		[
			'DB' => 'IMPORDFOLDER',
			'VAL' => 'Trukme_Pauliui',
			'TYP' => '173',
			'ID' => '24551',
			'PAR' => '22604',
		],
		[
			'DB' => 'IMPORDFOLDER',
			'VAL' => 'Raimondas',
			'TYP' => '1000001',
			'ID' => '22604',
			'PAR' => '22439',
		]
	];

    $folder = $doc->createElement('Folder');

	foreach($rows as $row) {
    	$fldFolder = $doc->createElement('FLD');
		foreach($row as $key => $value) {
			$fldFolder->setAttribute($key, $value);
		}
    	$folder->appendChild($fldFolder);
	}

    $xml->appendChild($folder);

	return $xml;
}

function fill_products_xml($id, $doc, $xml, $xml_table_id, $height, $depth, $width, $base_color_name, $frame_color_name) {
	$field_name = get_the_title($id);

	// foreach($properties as $property) {
		$set = $doc->createElement('Set');
		$set->setAttribute('TABLE', $xml_table_id);
		$set->setAttribute('DELSET', '0');

		// $fld = $doc->createElement('FLD');
		// $fld->setAttribute('DB', 'ID');
		// $fld->setAttribute('VAL', $id);
		// $fld->setAttribute('TYP', '0');
		// $set->appendChild($fld);

		// $fld = $doc->createElement('FLD');
		// $fld->setAttribute('DB', 'NAME');
		// $fld->setAttribute('VAL', $field_name);
		// $fld->setAttribute('TYP', '0');
		// $set->appendChild($fld);

		// foreach($property as $key => $data) {
		// 	$fld = $doc->createElement('FLD');
		// 	$fld->setAttribute('DB', strtoupper($key));
		// 	$fld->setAttribute('VAL', $data['real']);
		// 	$fld->setAttribute('TYP', '1');
		// 	$set->appendChild($fld);
		// }

        /***** HEIGHT ******/
        $fld = $doc->createElement('FLD');
        $fld->setAttribute('DB', 'HEIGHT');
        $fld->setAttribute('VAL', $height);
        $fld->setAttribute('TYP', '1');
        $set->appendChild($fld);

        /***** DEPTH ******/
        $set = $doc->createElement('Set');
		$set->setAttribute('TABLE', $xml_table_id);
		$set->setAttribute('DELSET', '0');

        $fld = $doc->createElement('FLD');
        $fld->setAttribute('DB', 'DEPTH');
        $fld->setAttribute('VAL', $depth);
        $fld->setAttribute('TYP', '1');
        $set->appendChild($fld);

        /***** WIDTH ******/
        $fld = $doc->createElement('FLD');
        $fld->setAttribute('DB', 'WIDTH');
        $fld->setAttribute('VAL', $width);
        $fld->setAttribute('TYP', '1');
        $set->appendChild($fld);

		/******** set base color ********/
		$fld = $doc->createElement('FLD');
		$fld->setAttribute('DB', 'FABRIC_BASE');
		$fld->setAttribute('VAL', $base_color_name);
		$fld->setAttribute('TYP', '1');
		$set->appendChild($fld);
		/*******end set base color **** */
        
		/******** set frame color ********/
		$fld = $doc->createElement('FLD');
		$fld->setAttribute('DB', 'FABRIC_FRAME');
		$fld->setAttribute('VAL', $frame_color_name);
		$fld->setAttribute('TYP', '1');
		$set->appendChild($fld);
		/*******end set frame color **** */

		$xml->appendChild($set);
	// }

	return $xml;
}