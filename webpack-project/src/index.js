require("../assets/stylesheets/scss/app.scss");

var selectRipple = '.mdc-ripple:not(.no-ripple)';
var selectButton = '.mdc-button:not(.no-ripple)';
var selectIconButton = '.mdc-icon-button:not(.no-ripple)';
var selectTextField = '.mdc-text-field';
var selectHelperText = '.mdc-text-field-helper-text';
var selectTextFieldIcon = '.mdc-text-field-icon:not(.no-ripple)';
var selectNotchedOutline = '.mdc-notched-outline';
var selectFloatingLabel = '.mdc-floating-label:not(.no-ripple)';
var selectSlider = '.mdc-slider';
var selectPagination = '.c-pagination dot:not(.no-ripple)';
var selectRipple = [
	selectRipple, selectButton, selectPagination

];

import {MDCRipple} from '@material/ripple';
/* Ripple */
for (var i =0;i < selectRipple.length; i++) {
	console.log("Ripple " + selectRipple[i]);
	if ($(selectRipple[i]).length) {
		$(selectButton).each(function( index ) {
		  	new MDCRipple(this);
		});
	}
}



/* Buttons */
if ($(selectButton).length) {
	var buttons = [];
	var mdcButtons = [];
	$(selectButton).each(function( index ) {
	  	buttons[index] = this;
	  	mdcButtons[index] = new MDCRipple(this);
	});
}

/* Script inputbox */
import {MDCTextField} from '@material/textfield';
if ($(selectTextField).length) {
	var textFields = [];
	var mdcTextFields = [];
	$(selectTextField).each(function( index ) {
	  	textFields[index] = this;
	  	mdcTextFields[index] = new MDCTextField(this);
	});
}

/* Helper Text */
import {MDCTextFieldHelperText} from '@material/textfield/helper-text';
if ($(selectHelperText).length) {
	const helperText = new MDCTextFieldHelperText(document.querySelector(selectHelperText));
}

/* Icon */
import {MDCTextFieldIcon} from '@material/textfield/icon';
if ($(selectTextFieldIcon).length) {
	const icon = new MDCTextFieldIcon(document.querySelector(selectTextFieldIcon));
}

import {MDCNotchedOutline} from '@material/notched-outline';
if ($(selectNotchedOutline).length) {
	const notchedOutline = new MDCNotchedOutline(document.querySelector(selectNotchedOutline));
}

import {MDCFloatingLabel} from '@material/floating-label';
if ($(selectFloatingLabel).length) {
	const floatingLabel = new MDCFloatingLabel(document.querySelector(selectFloatingLabel));
}

import {MDCSlider} from '@material/slider';
if ($(selectSlider).length) {

	var sliders = [];
	var mdcSliders = [];
	$(selectSlider).each(function( index ) {
	  	sliders[index] = this;
	  	mdcSliders[index] = new MDCSlider(this);
	  			//mdcSliders[index].listen('MDCSlider:change', () => console.log(`Value changed to ${mdcSliders[index].value}`));
	});
}
