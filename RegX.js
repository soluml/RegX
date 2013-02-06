/**
* RegX.js
* RegX.js is a HTML5 input validation polyfill that helps you validate all W3C input types.
* Kudos to Jonas Raoni Soares Silva for writing Big Number, making it easy to do to precision math with floats for the number/range inputs.
*
* Copyright 2013 Benjamin Solum (@soluml)
* Released under the Creative Commons Attribution-ShareAlike (CC BY-SA) License.
*
* author:  Benjamin Solum
* version: 0.4
* url:     http://www.soluml.com/RegX/
* source:  https://regx.github.com/
* @module RegX
* @main RegX
*/
var RegX = RegX || {};
/**
@class RegX
*/
(function(RegX){
'use strict';
/**
* Sanitizing our inputs means stripping out white space as the spec requires or setting replacement values for incompatible ones. Some browsers opt not to sanitize in cases where they should before validating.
* Also, some inputs only require the trimming of linebreaks (not white space), but that is dependant on the input.
* __If you opt to sanitize your front end, remember that the values in the backend also need to be sanitized!__
*
* @attribute USE_SANITATION
* @optional
* @private
* @default true
* @since 1.0
* @type {Boolean}
	@example
		//This setting should be passed in prior to loading the .js file.
		var RegX = {USE_SANITATION: false};
		<script src="RegX.js"></script>
*/
var USE_SANITATION = (RegX.USE_SANITATION === false ? false : true),

/**
* The spec declares a certain way to validate all inputs. This is built in to the core of RegX. However, the spec isn't always the ideal way to validate things.
* For example, there are better regular expressions to validate an email address against.
* Another example is that for the datetime input, the spec allows for non-existant timezones: e.x. +23:59.
* Some browsers themselves opt to use better validation for fields than required in the spec, Chrome for example does a better job of validating URL's. 
* Basically, USE_BETTER_VALIDATION parameter tells RegX to be "better" than the spec.
* __This parameter impacts inputs: email,url,datetime,color and any input with maxlength attribute set.__
*
* @attribute USE_BETTER_VALIDATION
* @optional
* @private
* @default true
* @since 1.0
* @type {Boolean}
	@example
		//This setting should be passed in prior to loading the .js file.
		var RegX = {USE_BETTER_VALIDATION: false};
		<script src="RegX.js"></script>
*/
USE_BETTER_VALIDATION = (RegX.USE_BETTER_VALIDATION === false ? false : true),

/**
* __*NOT YET IMPLEMENTED!!!!!*__
* For use in conjunction with a server side validation method.
* Instead of using JavaScript to validate on every form submission, we'll perform an ajax call to validate on the server.
* The server should return a valid RegX error object.
*
* @attribute USE_SERVER_VALIDATION
* @beta
* @optional
* @private
* @default false
* @since 1.0
* @type {Boolean}
	@example
		//This setting should be passed in prior to loading the .js file.
		var RegX = {USE_SERVER_VALIDATION: true};
		<script src="RegX.js"></script>
*/
USE_SERVER_VALIDATION = (RegX.USE_SERVER_VALIDATION === true ? true : false),

/**
* This array contains all field objects that pertain to fields in error from the last form submission and is passed to the RegX.onFailure callback method. __The ERRRORS array is only accessible inside of the callback.__
* 
*
* Example array with error objects:
*
* @property ERRORS
* @readOnly
* @default []
* @since 1.0
* @type {Array}
	@example
		//Example ERRORS return object.
	  [
			{
				"name" : "name",
				"type" : "text",
				"value": "",
				"msg"  : "The name field is required, this cannot be left blank."
			},
			{
				"name" : "email",
				"type" : "email",
				"value": "test@email.",
				"msg"  : "Your email address was not formatted correctly."
			}
		]
*/
ERRORS = [],
//Boolean value for btns with the formnovalidate attribute.
isFormnovalidate = false;

/**
* Boolean check if there are errors in the last submitted form.
*
* @property isError
* @type {Boolean}
* @default false
*/
RegX.isError = false;

/**
* On success callback method. Either this function or "onFailure" are called on form submission, depending on the results of field validity.
* __This callback is passed one argument, which is the event object.__
* __Handling the onsubmit event is taken care of for you. If you want to stop the form from submitting, simply return false.__
*
* You should redefine to fit your purpose:
@example
		RegX.onSuccess = function(e){
			alert('No problems');
			return; //Return's to the submission function which prevents the dom event if you return false.
		};
*
* @event onSuccess
*/
RegX.onSuccess = function(){};

/**
* On failure callback method. Either this function or "onSuccess" are called on form submission, depending on the results of field validity.
* __This callback is passed two arguments, the first is the event object and the second is the ERRORS array filled with field objects.__
* __Handling the onsubmit event is taken care of for you. If you want to stop the form from submitting, simply return false.__
*
* You should redefine to fit your purpose:
@example
		RegX.onFailure = function(e, ERR){
			alert('Big problems');
			for(var i = 0; i < ERR.length; i++){
				alert(ERR[i].error_msg);
			}
			return false; //Return's to the submission function which prevents the dom event if you return false.
		};
*
* @event onFailure
*/
RegX.onFailure = function(){};

/**
* This function loops through each form and binds methods to the submit event. It also loops through the submit buttons and binds click events to those.
* This function is called at window.onload by default.
* __If you add additional forms through JavaScript or AJAX, this method must be called again to ensure validation of that form.__
*
@example
    RegX.init();
*
* @method init
*/
RegX.init = function(){
	var $forms = document.forms,
		$in = document.getElementsByTagName('input'),
		$btn = document.getElementsByTagName('button'),
		i;
	for(i = $forms.length; i > 0; i--){
		removeEvent($forms[i-1], 'submit', onSubmitRegX);
		addEvent($forms[i-1], 'submit', onSubmitRegX);
	}
	//Bind <input type="submit" formnovalidate> to prevent validation on submit
	for(i = $in.length; i > 0; i--){
		if(attr($in[i-1], 'type') === 'submit' && typeof attr($in[i-1], 'formnovalidate') == 'string'){
			removeEvent($in[i-1], 'click', onClickRegX);
			addEvent($in[i-1], 'click', onClickRegX);
		}
	}
	//Bind <button type="submit" formnovalidate> to prevent validation on submit
	for(i = $btn.length; i > 0; i--){
		//Bind <button type="submit">
		if(attr($btn[i-1], 'type') === 'submit' && typeof attr($btn[i-1], 'formnovalidate') == 'string'){
			removeEvent($btn[i-1], 'click', onClickRegX);
			addEvent($btn[i-1], 'click', onClickRegX);
		}	
	}
};

/**
* __This function returns TRUE if the field is valid and FALSE if not.__ This mirrors native browser implementation.
* Use this if you want to see if the field is valid, taking into consideration the DOM.
* If you want to match an input's value, irregardless of whether it's immutable, use the checkRequired and check["Input"] functions.
* __If you want to check individual select or textarea elements, use this function.__
*
@example
    RegX.checkValidity(document.getElementById('ELEMENT_ID'));
		
@example
    RegX.checkValidity(jQuery(':input'));
*
* @method checkValidity
* @param $elem {jQuery or DOM Element} The field you want to check the validity of. If jQuery selector grabs more than one element, the elements are validated as a set.
* @param returnError {Boolean} Set this to true if you want to be returned an error object versus a boolean false.
* @return {Boolean|Object} Returns true if element is valid and false if not. If jQuery selector or node list matches multiple elements, this method returns true if all elements are valid and false otherwise. If returnError is set to true, returns true if element(s) are valid and either returns a single Object or in case of multiple elements returns an array of error objects.
*/
RegX.checkValidity = function($elem, returnError) {
	var elementsArray = [],
	    $input;
	//Checks if $elem is Dom Element or jQuery Element
	if($elem.selector !== undefined){
		if($elem.length === 1){
			//jQuery Selector returns one element
			return checkElementValidity($elem[0]);
		} else {
			//jQuery Selector returns multiple elements
			for(var i = $elem.length-1; i >= 0; i--){
				$input = checkElementValidity($elem[i]);
				if(!$input){ return false; } //Mark the whole batch as false because returnError is not set.
				else if($input !== true){ elementsArray.push($input); }
			}
			if(elementsArray.length > 0) return elementsArray; //If returnError is set to true, it'll return an erray of errors.
			return true;
		}
	} else {
		if($elem.length === 1 || $elem.nodeName.toLowerCase() === "input"){
			return checkElementValidity($elem);
		} else {
			//Check through node list
			for(var i = $elem.length-1; i >= 0; i--){
				$input = checkElementValidity($elem[i]);
				if(!$input){ return false; } //Mark the whole batch as false because returnError is not set.
				else if($input !== true){ elementsArray.push($input); }
			}
			if(elementsArray.length > 0) return elementsArray; //If returnError is set to true, it'll return an erray of errors.
			return true;
		}
	}
	//Checks individual field
	function checkElementValidity($elem) {
		var val       = $elem.value,
			tag       = $elem.tagName.toLowerCase(),
			name      = attr($elem,'name'),
			required  = attr($elem,'required'),
			disabled  = attr($elem,'disabled'),
			readonly  = attr($elem,'readonly'),
			pattern   = attr($elem,'pattern'),
			max       = parseFloat(attr($elem, 'max')),
			min       = parseFloat(attr($elem, 'min')),
			maxlength = parseInt(attr($elem,'maxlength'),10);
				
		//When a form element is disabled, it is immutable.
		if(disabled === true){ return true; }
		
		if(required === null || required === false){ required = false; }
		else { required = true; }
		
		//Readonly makes these input types immutable: text, search, url, telephone, email, password, datetime, date, month, week, time, datetime-local, number
		if((typeof readonly == 'string' && readonly !== '') || readonly === true){ readonly = true; }
		else { readonly = false; }
		
		//Check maxlength property as long as 'USE_BETTER_VALIDATION' is true
		if(USE_BETTER_VALIDATION && isNaN(maxlength) === false && maxlength > 0){
			try{ checkMaxLength($elem); }
			catch(e){ return formatError(e); }
		}
		
		//Validate select and textarea
		switch(tag){
			case 'select':
				if(!readonly && required){
					try{ checkSelect($elem); }
					catch(e){ return formatError(e); }
				}
				return true;
				break;
			case 'textarea':
				return (required && val.length === 0 ? formatError('Textarea was left empty.') : true);
				break;
			case 'button':
				return true;
				break;
		}
		
		//Pattern attribute applies to these types: Text, Search, URL, Tel, Email, Password
		if(pattern === null || pattern === ''){ pattern = false; }
		else { pattern = true; }
		
		//Element Groups: http://www.w3.org/TR/2011/WD-html5-20110525/the-input-element.html#concept-input-mutable
		
		tag = attr($elem,'type').toLowerCase(); //change input tag to type
		switch(tag){
			case 'hidden':
			case 'submit':
			case 'image':
			case 'reset':
			case 'button':
				return true;
				break;
			case 'color':
				if(!readonly && (required || val.length > 0)){
					try{ checkColor($elem); }
					catch(e){ return formatError(e); }
				}
				return true;
				break;
			case 'email':
				if(pattern && val !== ""){
					try{ checkPattern($elem); }
					catch(e){ return formatError(e); }
				}
				if(!readonly && (required || val.length > 0)){
					try{ checkEmail($elem); }
					catch(e){ return formatError(e); }
				}
				return true;
				break;
			case 'url':
				if(pattern && val !== ""){
					try{ checkPattern($elem); }
					catch(e){ return formatError(e); }
				}
				if(!readonly && (required || val.length > 0)){
					try{ checkURL($elem); }
					catch(e){ return formatError(e); }
				}
				return true;
				break;
			case 'number':
				//Sanitize Number Value - http://www.whatwg.org/specs/web-apps/current-work/multipage/states-of-the-type-attribute.html#number-state-(type=number)
				if(USE_SANITATION && isNaN(parseFloat(val))){ $elem.value = ''; }
				if(!readonly && (required || val.length > 0)){
					try{ checkNumber($elem); }
					catch(e){ return formatError(e); }
				}
				return true;
				break;
			case 'range':
				//Sanitize Range Value - http://www.whatwg.org/specs/web-apps/current-work/multipage/states-of-the-type-attribute.html#range-state-(type=range)
				if(USE_SANITATION && isNaN(parseFloat(val))){
					$elem.value = min + ((max-min) / 2);
					if(max < min){ $elem.value = min; }
				}
				if(required || val.length > 0){
					try{ checkRange($elem); }
					catch(e){ return formatError(e); }
				}
				return true;
				break;
			case 'week':
				if(!readonly && (required || val.length > 0)){
					try{ checkWeek($elem); }
					catch(e){ return formatError(e); }
				}
				return true;
				break;
			case 'month':
				if(!readonly && (required || val.length > 0)){
					try{ checkMonth($elem); }
					catch(e){ return formatError(e); }
				}
				return true;
				break;
			case 'date':
				if(!readonly && (required || val.length > 0)){
					try{ checkDate($elem); }
					catch(e){ return formatError(e); }
				}
				return true;
				break;
				
				
				
				
				
				
			/*
			case 'datetime':
				if(!readonly && (required || val.length > 0)){ return !this.validateDateTime($elem); }
				return true;
				break;
			case 'time':
				if(!readonly && (required || val.length > 0)){ return !this.validateTime($elem); }
				return true;
				break;
			case 'datetime-local':
				if(!readonly && (required || val.length > 0)){ return !this.validateDateTimeLocal($elem); }
				return true;
				break;
			*/
			case 'checkbox':
			case 'radio':
			case 'file':
				if(required){
					try{ checkRequired($elem); }
					catch(e){ return formatError(e); }
				}
				return true;
				break;
			default: //'Text', 'Search', Telephone, 'Password', and any non spec types
				if(pattern && val !== ""){
					try{ checkPattern($elem); }
					catch(e){ return formatError(e); }
				}
				if(!readonly && required){
					try{ checkRequired($elem); }
					catch(e){ return formatError(e); }
				}
				return true;
				break;
		}
		//Format the error for returning.
		function formatError(e){
			if(returnError){ return {"name": name, "type": tag, "value": val, "msg": getMessage($elem), "error":e.type, "error_msg": e.msg}; }
			return false;
		}
	}
};

/**
* This function checks if the field is valid, assuming that the field IS required and only observing that fact.
*
* @method checkRequired
* @private
*/
function checkRequired($input) {
	if($input.selector !== undefined) $input = $input[0];
	switch(attr($input,'type')) {
		case 'checkbox':
			if(!$input.checked){ throw {type: 'valueMissing', msg: 'Checkbox was left unchecked.'}; }
			break;
		case 'radio':
			var radioName = $input.getAttribute('name'),
					radioForm = $input.form.name,
					radiosWithName = document.getElementsByName(radioName),
					radioGroup = [], //This group contains an array of all the radio buttons in the same form with the same name.
					i = 0;
			for(i = 0; i < radiosWithName.length; i++) {
				//Sort inputs to make sure that all of the radios with the same name are in the same form
				if(radiosWithName[i].form.name === radioForm){
					radioGroup.push(radiosWithName[i]);
				}
			}
			for(i = 0; i < radioGroup.length; i++) {
				if(radioGroup[i].checked){
					return;
				}
			}
			throw {type: 'valueMissing', msg: 'A radio option was not checked.'};
			break;
		default:
			if(trim($input.value, true).length === 0){ throw {type: 'valueMissing', msg: 'There was no value for this field.'}; }
			break;
	}
}

/**
* This function checks if the field is valid based on it's pattern attribute. __If no pattern attribute is supplied, this method returns false!__
* If specified, the attribute's value must match the JavaScript Pattern production ([ECMA262]). The pattern is compiled with the "global, ignoreCase, and multiline flags disabled".
*
* @method checkPattern
* @private
*/
function checkPattern($input) {
	if($input.selector !== undefined) $input = $input[0];
	var pattern = new RegExp('^(?:'+attr($input,'pattern')+')$');
	if(!pattern.test($input.value)){ throw {type: 'patternMismatch', msg: 'The value does not match the pattern: "'+ pattern +'".'}; }
	return;
}

/**
* This function checks if the field's value exceeds the max length based on it's maxlength attribute. __If no maxlength attribute is supplied, this method returns false!__
* If maxlength is specified as a float, the maxlength value is floored. Maxlength value must be a number >= 0 or else this property is effectively ignored.
*
* @method checkMaxLength
* @private
*/
function checkMaxLength($input) {
	if($input.selector !== undefined){ $input = $input[0]; }
	if($input.value.length > parseInt(attr($input,'maxLength'),10)){
		throw {type: 'tooLong', msg: 'The value exceeds the maxlength attribute.'};
	}
}

/**
* This function checks selects in more detail for various browsers.
*
* @method checkSelect
* @private
*/
function checkSelect($select) {
	if($select.selector !== undefined) $select = $select[0];
	
	var placeholderOptionVal; // value of placeholder
	
	// If the element has its required attribute specified, and either none of the option elements in the select element's list of options have their selectedness set to true, or the only option element in the select element's list of options with its selectedness set to true is the placeholder label option, then the element is suffering from being missing.
	
	//On submission the select input MUST have a value selected.
	if($select.selectedIndex < 0){ throw {type: 'valueMissing', msg: 'An option was not selected.'}; }
	
	//If selected element value is placeholder label option...
	if($select.value === ''){
		//In older versions of IE, if the value attribute isn't set on the option, the value will be empty string in the DOM, but will still send a value to the server.
		//The trick is determining IF the value truly is empty (which is an error) or if IE just thinks it is (not an error)
		
		//Check for other browsers
		placeholderOptionVal = attr($select.options[0], 'value');
		//Check if var is "specified" in IE
		if($select.options[0].attributes.value && !$select.options[0].attributes.value.specified){
			if(trim($select.options[0].innerHTML) === ''){ throw {type: 'valueMissing', msg: 'No value was specified.'}; }
		} else {
			if(placeholderOptionVal === '' || (placeholderOptionVal === null && trim($select.options[0].innerHTML) === '')){ throw {type: 'valueMissing', msg: 'No value was specified.'}; }
		}	
	}
}

/**
* This function checks if the field's value is a valid color.
* __The input color control shouldn't allow you to set the color to anything BUT a color.__
* In a modern browser, checkValidity() should ALWAYS return true, because the default value for anything other than a valid hex color, is #000000.
* When the setting RegX.USE_BETTER_VALIDATION is set to true, RegX allows the use of SVG color keywords or simple colors (ex. aliceblue or #f00).
*
* @method checkColor
* @private
*/
function checkColor($input) {
	if($input.selector !== undefined) $input = $input[0];
	
	var val = $input.value,
	regex = /^#[a-f0-9]{6}$/i;
	
	if(regex.test(val)) {
		return;
	} else {
		if(!USE_BETTER_VALIDATION || val.length === 0){
			throw {type: 'typeMismatch', msg: 'This is not a valid hex color. e.g. "#FF0000"'};
		} else if(val.length === 0){
			throw {type: 'valueMissing', msg: 'This field is empty.'};
		}
		
		//Do Legacy Color Value Parser
		val = trim(val);
		if(val.toLowerCase() === 'transparent'){
			throw {type: 'typeMismatch', msg: 'This is not a valid hex color. e.g. "#FF0000"'};
		}
		
		//Check SVG color keywords
		if(val === 'aliceblue' || val === 'antiquewhite' || val === 'aqua' || val === 'aquamarine' || val === 'azure' || val === 'beige' || val === 'bisque' || val === 'black' || val === 'blanchedalmond' || val === 'blue' || val === 'blueviolet' || val === 'brown' || val === 'burlywood' || val === 'cadetblue' || val === 'chartreuse' || val === 'chocolate' || val === 'coral' || val === 'cornflowerblue' || val === 'cornsilk' || val === 'crimson' || val === 'cyan' || val === 'darkblue' || val === 'darkcyan' || val === 'darkgoldenrod' || val === 'darkgray' || val === 'darkgreen' || val === 'darkgrey' || val === 'darkkhaki' || val === 'darkmagenta' || val === 'darkolivegreen' || val === 'darkorange' || val === 'darkorchid' || val === 'darkred' || val === 'darksalmon' || val === 'darkseagreen' || val === 'darkslateblue' || val === 'darkslategray' || val === 'darkslategrey' || val === 'darkturquoise' || val === 'darkviolet' || val === 'deeppink' || val === 'deepskyblue' || val === 'dimgray' || val === 'dimgrey' || val === 'dodgerblue' || val === 'firebrick' || val === 'floralwhite' || val === 'forestgreen' || val === 'fuchsia' || val === 'gainsboro' || val === 'ghostwhite' || val === 'gold' || val === 'goldenrod' || val === 'gray' || val === 'green' || val === 'greenyellow' || val === 'grey' || val === 'honeydew' || val === 'hotpink' || val === 'indianred' || val === 'indigo' || val === 'ivory' || val === 'khaki' || val === 'lavender' || val === 'lavenderblush' || val === 'lawngreen' || val === 'lemonchiffon' || val === 'lightblue' || val === 'lightcoral' || val === 'lightcyan' || val === 'lightgoldenrodyellow' || val === 'lightgray' || val === 'lightgreen' || val === 'lightgrey' || val === 'lightpink' || val === 'lightsalmon' || val === 'lightseagreen' || val === 'lightskyblue' || val === 'lightslategray' || val === 'lightslategrey' || val === 'lightsteelblue' || val === 'lightyellow' || val === 'lime' || val === 'limegreen' || val === 'linen' || val === 'magenta' || val === 'maroon' || val === 'mediumaquamarine' || val === 'mediumblue' || val === 'mediumorchid' || val === 'mediumpurple' || val === 'mediumseagreen' || val === 'mediumslateblue' || val === 'mediumspringgreen' || val === 'mediumturquoise' || val === 'mediumvioletred' || val === 'midnightblue' || val === 'mintcream' || val === 'mistyrose' || val === 'moccasin' || val === 'navajowhite' || val === 'navy' || val === 'oldlace' || val === 'olive' || val === 'olivedrab' || val === 'orange' || val === 'orangered' || val === 'orchid' || val === 'palegoldenrod' || val === 'palegreen' || val === 'paleturquoise' || val === 'palevioletred' || val === 'papayawhip' || val === 'peachpuff' || val === 'peru' || val === 'pink' || val === 'plum' || val === 'powderblue' || val === 'purple' || val === 'red' || val === 'rosybrown' || val === 'royalblue' || val === 'saddlebrown' || val === 'salmon' || val === 'sandybrown' || val === 'seagreen' || val === 'seashell' || val === 'sienna' || val === 'silver' || val === 'skyblue' || val === 'slateblue' || val === 'slategray' || val === 'slategrey' || val === 'snow' || val === 'springgreen' || val === 'steelblue' || val === 'tan' || val === 'teal' || val === 'thistle' || val === 'tomato' || val === 'turquoise' || val === 'violet' || val === 'wheat' || val === 'white' || val === 'whitesmoke' || val === 'yellow' || val === 'yellowgreen'){ return; }
		
		//Check simple color
		if(val.length === 4 && /^#[a-f0-9]{3}$/i.test(val)){
			return;
		}

		throw {type: 'typeMismatch', msg: 'This is not a valid hex color. e.g. "#F00"'};
	}
}

/**
* This function checks if the field's value is a valid email address.
* Spec: http://www.w3.org/TR/html5/states-of-the-type-attribute.html#e-mail-state-type-email
* This method can use "Better Validation" based on  Arluison Guillaume's regex.
*
* @method checkEmail
* @private
*/
function checkEmail($input) {
	if($input.selector !== undefined) $input = $input[0];
	
	var email = trim($input.value),
	regex = /^[a-zA-Z0-9.!#$%&'*+\/=?\^_`{|}~\-]+@[a-zA-Z0-9\-]+(?:\.[a-zA-Z0-9\-]+)*$/;
	
	if(USE_BETTER_VALIDATION) {
		regex = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|xxx|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
	} //'
	
	if(!regex.test(email)){
		throw {type: 'typeMismatch', msg: 'This is not a valid email address.'};
	}
	return;
}

/**
* This function checks if the field's value is a valid URL.
* Spec: http://www.w3.org/TR/html5/states-of-the-type-attribute.html#url-state-type-url
* http://tools.ietf.org/html/rfc3986#section-3 - URI Must have a Scheme:
*	Scheme = ALPHA *( ALPHA / DIGIT / "+" / "-" / "." )
* This method can use "Better Validation" to do deeper checking for ftp and http/https (as Chrome does).
*
* @method checkURL
* @private
*/
function checkURL($input) {
	if($input.selector !== undefined) $input = $input[0];
	
	//Scheme = ALPHA *( ALPHA / DIGIT / "+" / "-" / "." )
	var url = trim($input.value);
	if(!/^[a-z][a-z\d+\-.]*:/i.test(url)) { //Global Scheme Check for Firefox, Safari, Opera and Chrome
		 throw {type: 'typeMismatch', msg: 'This is not a valid URL.'};
	}
	//Path can be empty.
	//On Chrome, path cannot be empty for ftp, http, or https.
	if(USE_BETTER_VALIDATION && /^(ftp|https?):/i.test(url)) { //Chrome like FTP, HTTP, HTTPS Check
		//Google Does not like these chars in url: @~=;[]%^
		//Google Does not like these additional chars after authority path-abempty: :#\/
		if(!/^(ftp|https?):(\/\/[^\/:#\\@~=;\[\]%\^][^@~=;\[\]%\^]*|\/[^\/:#\\@~=;\[\]%\^][^@~=;\[\]%\^]*|[^\/:#\\@~=;\[\]%\^][^\/@~=;\[\]%\^]*[^@~=;\[\]%\^]*)$/i.test(url)) {
			throw {type: 'typeMismatch', msg: 'This is not a valid web address.'};
		}
	}
	return;
}

/**
* This function checks if the field's value is a valid number.
* Specify the min, max, and step to control which numbers are available.
*
* @method checkNumber
* @private
*/
function checkNumber($input) {
	if($input.selector !== undefined) $input = $input[0];

	var step        = parseFloat(attr($input, 'step')),
	    max         = attr($input, 'max'),
	    min         = attr($input, 'min'),
	    num         = parseFloat($input.value),
	    specialStep = false, //Special Step means that the value has to be the absolute value of the min plus or minus n where n is an integer.
	    validStep   = false, // Logic sets this to true if it finds that the value is an even step.
		tempMin,
	    tempNum,
		regexp = /^\d+$/;
	
	if(isNaN(num)) { //Value MUST be a valid floating point number. If not, return with error.
		throw {type: 'typeMismatch', msg: 'This is not a valid number.'};
	}
	
	if(isNaN(step)) { //If step isn't set or is NaN, set temporarily to 0 and determine if it should be based on min value or set to default 1 value.
		step = 0;
	}

	if(min==='any' || min==='') {
		min = num - 1;
	}
	min = parseFloat(min);

	if(max==='any' || max==='') {
		max = num + 1;
	}
	max = parseFloat(max);
	
	//If step is less than or equal to 0, we use the MIN value as our step as recommended in the HTML5 standards.
	if(step <= 0) {
		//If no min and step set incorrectly, set to 1
		if(isNaN(min) || min === 0) {
			step = 1;
		} else { //Special Step means that the value has to be the absolute value of the min plus or minus n where n is an integer.
			specialStep = true;
		}
	}
	
	if(specialStep) {
		tempMin = min.toString().split('.');
    tempNum = num.toString().split('.');
		tempMin = (tempMin.length === 1 ? 0.0 : '0.'+tempMin[1]);
		tempNum = (tempNum.length === 1 ? 0.0 : '0.'+tempNum[1]);
		
		if(min < 0) {
			tempMin = parseFloat(tempMin) * -1 + 1;
		}
		
		if(num < 0) {
			tempNum = parseFloat(tempNum) * -1 + 1;
		}
		
		if(tempMin === tempNum) {
			validStep = true;
		}
	} else {
		//If you take the value and subtract the step.. and the result is evenly divisible by the step...
		//Base 10 syntax would be something like: 
		//if(/^\d+$/.test((num - min) % step)) { validStep = true; }
		//However, Base 2 cannot accurately express some floats (like .1), so, we need to account for that.
		//Use big.js library to help with the inaccuracies in the math.
		
		if(isNaN(min) && step === 1) {
			//Min isn't set, so check that value is int.
			if(regexp.test(num)) validStep = true;
		} else if(regexp.test(new Big(num).minus(min).mod(step).valueOf())) {
			validStep = true;
		}
	}
	
	if(!validStep){ throw {type: 'stepMismatch', msg: 'This number is not a valid step ('+step+').'}; }
	if(!isNaN(max) && num > max){ throw {type: 'rangeOverflow', msg: 'This number is larger than the maximum ('+max+').'}; }
	if(!isNaN(min) && num < min){ throw {type: 'rangeUnderflow', msg: 'This number is smaller than the minimum ('+min+').'}; }
	return;
}

/**
* This function checks if the field's value is a valid number within a range.
* The range input seems to be a different GUI on top of the number input type. If you look at the spec for input range, no matter what value you set, the browser should auto correct it for you.
* __Since the spec assumes always valid (unless somehow, you pass in a "NaN"), RegX assumes always valid (unless somehow, you pass in a "NaN").__ The control will literally not allow you to move outside the range.
* However, when USE_BETTER_VALIDATION is true, we treat range like a number and assume that it should be validated the same way.
*
* @method checkRange
* @private
*/
function checkRange($input) {
	if($input.selector !== undefined){ $input = $input[0]; }
	
	var num = parseFloat($input.value);
	if(isNaN(num)){ throw {type: 'typeMismatch', msg: 'This is not a valid number.'}; }
	
	if(USE_BETTER_VALIDATION){
		try{ checkNumber($input); }
		catch (e){ throw e; }
	}
	
	return;
}

/**
* This function checks if the field's value is a valid week, optionally within a range.
* The week string must contain 4 digits for the year, followed by a dash, followed by a capital W, followed by two week digits, ranging from 01 to 53.
* __The week input supports both a min and a max week. These strings must be valid week strings.__
* The week input also supports a step attribute, which is an integer describing how many weeks one should step.
*
* @method checkWeek
* @private
*/
function checkWeek($input){ //YYYY-"W"WW
	if($input.selector !== undefined) $input = $input[0];

	var val       = $input.value,
	    max       = attr($input, 'max'),
	    min       = attr($input, 'min'),
		step      = attr($input, 'step'),
		basestep  = [1970,1], //Default step base is 1970-W01
	    regex     = /^(\d{4})\-W(\d{2})$/;
			
	if(USE_SANITATION) {
		val = trim(val);
		if(max) max = trim(max);
		if(min) min = trim(min);
		if(step) step = trim(step);
	}

	if(!regex.test(val)){ throw {type: 'typeMismatch', msg: 'This is not a valid week string. e.g. "YYYY-\'W\'WW"'}; }

	val = gregorianWeek(val.match(regex)); //Match passes an array with three args

	if(val && val.length === 2) {

		if(regex.test(max)) {
			max = gregorianWeek(max.match(regex));
			if((max && max.length === 2) && max[0] < val[0] || (max[0] === val[0] && max[1] < val[1])){
				throw {type: 'rangeOverflow', msg: 'This week date is past the maximum week date ('+pad(4, max[0])+'-'+pad(2, max[1])+').'};
			}
			basestep = max;
		}

		if(regex.test(min)) {
			min = gregorianWeek(min.match(regex));
			if((min && min.length === 2) && min[0] > val[0] || (min[0] === val[0] && min[1] > val[1])){
				throw {type: 'rangeUnderflow', msg: 'This week date is sooner than the minimum week date ('+pad(4, min[0])+'-'+pad(2, min[1])+').'};
			}
			basestep = min;
		}

		//Check Step
		if(/^\d+$/.test(step)){
			step = parseInt(step, 10);
			//Basestep is 1970-W01 unless the following.
			//If max is present, it is the basestep unless min is present.
			//If min is present, it is the basestep.
			if(spanWeeks(basestep, val) % step !== 0){
				throw {type: 'stepMismatch', msg: 'This week date is not a valid step ('+step+') of the base week date ('+pad(4, basestep[0])+'-'+pad(2, basestep[1])+').'};
			}
		}

		return;
	}

	throw {type: 'typeMismatch', msg: 'This is not a valid week string. e.g. "YYYY-\'W\'WW"'};

	function spanWeeks(base, val){
		//Determine amount of weeks in between span of years
		var numweeks = 0,
		    i;

		for(i = base[0]; i < val[0]; i++){
			numweeks += (is53Weeks(i) ? 53 : 52);
		}

		//Subtract weeks you're already into base year.
		numweeks -= base[1];

		//Add weeks you haven't yet added in for the value year
		numweeks += val[1];

		return numweeks;
	}
	// Check if the week is gregorian
	function gregorianWeek(val) {
		var year = parseInt(val[1],10),
		    week = parseInt(val[2],10);

		if(1 > year || 1 > week || week > 53 || (week === 53 && !is53Weeks(year))){
			return false;
		}

		return [year, week];
	}
	function is53Weeks(y){
		//Years that Jan 1 start on Thursday even on leap year or Leap Year where Jan 1 starts on Wednesday
		var d = new Date(y+'-01-01').getDay();
		if(d !== 2 && d !== 3 || (d === 2 && !isLeapYear(y))){
			return false;
		}
		return true;
	}
}

/**
* This function checks if the field's value is a valid month, optionally within a range.
* The month string must contain 4 digits for the year, followed by a dash, followed by two month digits, ranging from 01 to 12.
* __The month input supports both a min and a max month. These strings must be valid month strings.__
* The month input also supports a step attribute, which is an integer describing how many months one should step.
*
* @method checkMonth
* @private
*/
function checkMonth($input){ //YYYY-MM
	if($input.selector !== undefined) $input = $input[0];

	var val       = $input.value,
	    max       = attr($input, 'max'),
	    min       = attr($input, 'min'),
		step      = attr($input, 'step'),
		basestep  = [1970,1], //Default step base is 1970-01
	    regex     = /^(\d{4})\-(\d{2})$/;
			
	if(USE_SANITATION) {
		val = trim(val);
		if(max) max = trim(max);
		if(min) min = trim(min);
		if(step) step = trim(step);
	}

	if(!regex.test(val)){ throw {type: 'typeMismatch', msg: 'This is not a valid month string. e.g. "YYYY-MM"'}; }

	val = gregorianMonth(val.match(regex)); //Match passes an array with three args

	if(val && val.length === 2) {
		//Check Max Month
		if(regex.test(max)) {
			max = gregorianMonth(max.match(regex));
			if((max && max.length === 2) && max[0] < val[0] || (max[0] === val[0] && max[1] < val[1])){
				throw {type: 'rangeOverflow', msg: 'This month is past the maximum month ('+pad(4, max[0])+'-'+pad(2, max[1])+').'};
			}
			basestep = max;
		}
		//Check Min Month
		if(regex.test(min)) {
			min = gregorianMonth(min.match(regex));
			if((min && min.length === 2) && min[0] > val[0] || (min[0] === val[0] && min[1] > val[1])){
				throw {type: 'rangeUnderflow', msg: 'This month is sooner than the minimum month ('+pad(4, min[0])+'-'+pad(2, min[1])+').'};
			}
			basestep = min;
		}
		//Check Step
		if(/^\d+$/.test(step)){
			step = parseInt(step, 10);

			//Basestep is 1970-01 unless the following.
			//If max is present, it is the basestep unless min is present.
			//If min is present, it is the basestep.
			if(spanMonths(basestep, val) % step !== 0){
				throw {type: 'stepMismatch', msg: 'This month is not a valid step ('+step+') of the base month ('+pad(4, basestep[0])+'-'+pad(2, basestep[1])+').'};
			}
		}

		return;
	}

	throw {type: 'typeMismatch', msg: 'This is not a valid month string. e.g. "YYYY-MM"'};
	
	function spanMonths(base, val){
		return ((val[0]-base[0]) * 12) - base[1] + val[1];
	}
}
function gregorianMonth(val) {
	var year = parseInt(val[1],10),
		month = parseInt(val[2],10);

	if(1 > year || 1 > month || month > 12){
		return false;
	}

	return [year, month];
}
/**
* This function checks if the field's value is a valid date, optionally within a range.
* The date string must contain 4 digits for the year, followed by a dash, followed by two month digits, ranging from 01 to 12, followed by a dash, followed by two day digits, ranging from 01 and 31.
* __The date input supports both a min and a max date. These strings must be valid date strings.__
* The date input also supports a step attribute, which is an integer describing how many days one should step.
*
* @method checkMonth
* @private
*/
function checkDate($input){ //YYYY-MM-DD
	if($input.selector !== undefined) $input = $input[0];

	var val       = $input.value,
	    max       = attr($input, 'max'),
	    min       = attr($input, 'min'),
		step      = attr($input, 'step'),
		basestep  = [1970,1,1], //Default step base is 1970-01
	    regex     = /^(\d{4})\-(\d{2})\-(\d{2})$/,
		tDate;
			
	if(USE_SANITATION) {
		val = trim(val);
		if(max) max = trim(max);
		if(min) min = trim(min);
		if(step) step = trim(step);
	}

	if(!regex.test(val)){ throw {type: 'typeMismatch', msg: 'This is not a valid date string. e.g. "YYYY-MM-DD"'}; }
	
	val = gregorianDate(val.match(regex)); //Match passes an array with four args
	
	if(val && val.length === 3) {
		//Val in milliseconds since epoch
		//Must subtract 1 from val[1] because months are zero based. e.g. January = '0';
		tDate = new Date(val[0],(val[1]-1),val[2]).getTime();
		//Check Max Date
		if(regex.test(max)) {
			max = gregorianDate(max.match(regex));
			if((max && max.length === 3) && (new Date(max[0],(max[1]-1),max[2]).getTime() < tDate)){
				throw {type: 'rangeOverflow', msg: 'This date is past the maximum date ('+pad(4, max[0])+'-'+pad(2, max[1])+'-'+pad(2, max[2])+').'};
			}
			basestep = max;
		}
		//Check Min Date
		if(regex.test(min)) {
			min = gregorianDate(min.match(regex));
			if((max && max.length === 3) && (new Date(min[0],(min[1]-1),min[2]).getTime() > tDate)){
				throw {type: 'rangeUnderflow', msg: 'This date is sooner than the minimum date ('+pad(4, min[0])+'-'+pad(2, min[1])+'-'+pad(2, min[2])+').'};
			}
			basestep = min;
		}
		//Check Step
		if(/^\d+$/.test(step)){
			step = parseInt(step, 10);

			//Basestep is 1970-01-01 unless the following.
			//If max is present, it is the basestep unless min is present.
			//If min is present, it is the basestep.
			if(spanDays(basestep, val) % step !== 0){
				throw {type: 'stepMismatch', msg: 'This date is not a valid step ('+step+') of the base date ('+pad(4, basestep[0])+'-'+pad(2, basestep[1])+'-'+pad(2, basestep[2])+').'};
			}
		}
		
		return;
	}
	
	throw {type: 'typeMismatch', msg: 'This is not a valid date string. e.g. "YYYY-MM-DD"'};

	function spanDays(base, val){
		//Determine amount of weeks in between span of years
		//86400000 = milliseconds in a day.
		return (new Date(base[0],(base[1]-1),base[2]).getTime() - new Date(val[0],(val[1]-1),val[2]).getTime()) / 86400000;
	}
}
function gregorianDate(val) {
	var year,
		month,
		day = parseInt(val[3],10);
		
	//Check to see if month year string is valid.
	val = gregorianMonth(val);
	if(!val) { return false; }
	year = val[0];
	month = val[1];
	
	//Check day to make sure it's valid for the year.
	if(1 > day || day > 31 || (day > 30 && (month === 4 || month === 6 || month === 9 || month === 11)) || (month === 2 && (day > 29 || (day > 28 && !isLeapYear(year))))){
		return false;
	}

	return [year, month, day];
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RegX Private Parts //////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	
//Get attribute value from element.
function attr($elem, prop) {
	if (typeof $elem.getAttribute !== "undefined" && typeof $elem[ prop ] !== "boolean") {
		return $elem.getAttribute( prop );
	} else {
		return $elem[ prop ];
	}
}

//Trim value's
function trim(val, lb) {
	if(USE_SANITATION){ //Opera does not trim values as the spec requires so skip sanitization if you want to match Opera.
		//Strip Linebreaks
		val = val.replace(/(\r\n|\n|\r)/gm,'');
		
		if(!lb){
			val = val.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
		}
	}
	return val;
}

//Get HTML5 Input Message
function getMessage($elem) {
	var msg = attr($elem, 'data-regx-errormessage');
	if(typeof msg === "string" && msg !== '') {
		return msg;
	}
	
	msg = attr($elem, 'x-moz-errormessage');
	if(typeof msg === "string" && msg !== '') {
		return msg;
	}
	
	msg = $elem.validationMessage;
	if(typeof msg === "string") {
		return msg;
	}
	
	return '';
}
//Add zeros for strings
function pad(n, str){
	if(typeof str !== 'string'){ str = str + ''; }
	while(str.length < n){ str = '0' + str; }
	return str;
}
//Utility function for date fields to determine leap year.
function isLeapYear(y){
	return !(y % 4) && (y % 100) || !(y % 400) ? true : false;
}
//Submit Handler
function onSubmitRegX(e){
	var $frm = e.target,
		novalidate = false,
		returnt,
		i;
	
	//If submit button had formnovalidate set
	if(!isFormnovalidate){
		//For IE
		if(typeof $frm === 'undefined'){ $frm = e.srcElement; }
	
		//If form has the attribute novalidate, stop validation.
		if(typeof attr($frm, 'novalidate') == 'string'){ novalidate = true; }
		if(!novalidate){
			//Reset Boolean Error Tracker
			RegX.isError = false;
			
			//Pass form to checkValidity to check all fields.
			ERRORS = RegX.checkValidity($frm, true);
		
			//There were errors...
			if(ERRORS.length > 0){
				RegX.isError = true;
				returnt = RegX.onFailure(e, ERRORS);
			} else {
				returnt = RegX.onSuccess(e);
			}
			
			//If the RegX.onSuccess or onFailure events returned false, stop the form submission
			if(returnt === false){
				if (e.preventDefault) { 
					e.preventDefault(); 
				} else { 
					e.returnValue = false;
				}
				return false;	
			}
		}
	}
	
	//Reset var
	isFormnovalidate = false;
}
//Click Handler for Submits
function onClickRegX(e){
	isFormnovalidate = true;
}
//Add event listeners
function addEvent(obj, type, fn){
  if (obj.attachEvent){
    obj['e'+type+fn] = fn;
    obj[type+fn] = function(){obj['e'+type+fn]( window.event );}
    obj.attachEvent( 'on'+type, obj[type+fn] );
  } else
    obj.addEventListener(type, fn, false);
}
//Remove event handlers
function removeEvent(obj, type, fn){
  if ( obj.detachEvent){
    //Will be undefined if an event wasn't previously set.
	if(typeof obj[type+fn] === 'function'){
		obj.detachEvent('on'+type, obj[type+fn]);
	}
    obj[type+fn] = null;
  } else
    obj.removeEventListener(type, fn, false);
}
//Protects any previously specified onload events 
function wOL(f1, f2){
    return function(){
        if(f1)
			f1();
        if(f2)
			f2();
    }
}
window.onload = wOL(window.onload, RegX.init);
})(RegX);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// big.js Library //////////////////////////////////////////////////////////////////////////////////////////////////////////////
// + Michael Mclaughlin ////////////////////////////////////////////////////////////////////////////////////////////////////////
// @ https://github.com/MikeMcl/big.js /////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

(function ( global ) {
    'use strict';

    /*
      big.js v1.0.1
      A small, fast Javascript library for arbitrary-precision arithmetic with decimal numbers. 
      https://github.com/MikeMcl/big.js/
      Copyright (c) 2012 Michael Mclaughlin <M8ch88l@gmail.com>
      MIT Expat Licence
    */

    /****************************** EDITABLE DEFAULTS **********************************/


    // The default values below must be integers within the stated ranges (inclusive).

    /*
     * The maximum number of decimal places of the results of methods involving
     * division, i.e. 'div' and 'sqrt', and 'pow' with negative exponents.
     */
    Big['DP'] = 20;                                  // 0 to MAX_DP

    /*
     * The rounding mode used when rounding to the above decimal places.
     *
     * 0 Round towards zero (i.e. truncate, no rounding).               (ROUND_DOWN     )
     * 1 Round to nearest neighbour. If equidistant, round up.          (ROUND_HALF_UP  )
     * 2 Round to nearest neighbour. If equidistant, to even neighbour. (ROUND_HALF_EVEN)
     */
    Big['RM'] = 1;                                   // 0, 1 or 2

        // The maximum value of 'Big.DP'.
    var MAX_DP = 1E6,                                // 0 to 1e+6

        // The maximum magnitude of the exponent argument to the 'pow' method.
        MAX_POWER = 1E6,                             // 1 to 1e+6

        /*
         * The exponent value at and beneath which 'toString' returns exponential notation.
         * Javascript's Number type: -7
         * -1e+6 is the minimum recommended exponent value of a 'Big'.
         */
        TO_EXP_NEG = -7,                             // 0 to -1e+6

        /*
         * The exponent value at and above which 'toString' returns exponential notation.
         * Javascript's Number type: 21
         * 1e+6 is the maximum recommended exponent value of a 'Big', though there is no
         * enforcing or checking of a limit.
         */
        TO_EXP_POS = 21,                             // 0 to 1e+6


    /***********************************************************************************/

        P = Big.prototype,
        isValid = /^-?\d+(?:\.\d+)?(?:e[+-]?\d+)?$/i,
        ONE = new Big(1);


    // CONSTRUCTOR


    /*
     * The exported function.
     * Create and return a new instance of a 'Big' object.
     *
     * n {number|string|Big} A numeric value.
     */
    function Big( n ) {
        var i, j, nL,
            x = this;

        // Enable constructor usage without new.
        if ( !(x instanceof Big) ) {
            return new Big( n )
        }

        // Duplicate.
        if ( n instanceof Big ) {
            x['s'] = n['s'];
            x['e'] = n['e'];
            x['c'] = n['c'].slice();
            return
        }

        // Minus zero?
        if ( n === 0 && 1 / n < 0 ) {
            n = '-0'
        // Ensure 'n' is string and check validity.
        } else if ( !isValid.test(n += '') ) {
            throw NaN
        }

        // Determine sign.
        x['s'] = n.charAt(0) == '-' ? ( n = n.slice(1), -1 ) : 1;

        // Decimal point?
        if ( ( i = n.indexOf('.') ) > -1 ) {
            n = n.replace( '.', '' )
        }

        // Exponential form?
        if ( ( j = n.search(/e/i) ) > 0 ) {

            // Determine exponent.
            if ( i < 0 ) {
                i = j
            }
            i += +n.slice( j + 1 );
            n = n.substring( 0, j )

        } else if ( i < 0 ) {

            // Integer.
            i = n.length
        }

        // Determine leading zeros.
        for ( j = 0; n.charAt(j) == '0'; j++ ) {
        }

        if ( j == ( nL = n.length ) ) {

            // Zero.
            x['c'] = [ x['e'] = 0 ]
        } else {

            // Determine trailing zeros.
            for ( ; n.charAt(--nL) == '0'; ) {
            }

            x['e'] = i - j - 1;
            x['c'] = [];

            // Convert string to array of digits (without leading and trailing zeros).
            for ( i = 0; j <= nL; x['c'][i++] = +n.charAt(j++) ) {
            }
        }
    }


    // PRIVATE FUNCTIONS


    /*
     * Round 'Big' 'x' to a maximum of 'dp' decimal places using rounding mode
     * 'rm'. (Called by 'div', 'sqrt' and 'round'.)
     *
     * x {Big} The 'Big' to round.
     * dp {number} Integer, 0 to MAX_DP inclusive.
     * rm {number} 0, 1 or 2 ( ROUND_DOWN, ROUND_HALF_UP or ROUND_HALF_EVEN )
     * [more] {boolean} Whether the result of division was truncated.
     */
    function rnd( x, dp, rm, more ) {
        var xc = x['c'],
            i = x['e'] + dp + 1;

        if ( rm !== 0 && rm !== 1 && rm !== 2 ) {
            throw '!Big.RM!'
        }

        // 'xc[i]' is the digit after the digit that may be rounded up.
        rm = rm && ( xc[i] > 5 || xc[i] == 5 &&
          ( rm == 1 || more || i < 0 || xc[i + 1] != null || xc[i - 1] & 1 ) );

        if ( i < 1 || !xc[0] ) {
            x['c'] = rm
              // 1, 0.1, 0.01, 0.001, 0.0001 etc.
              ? ( x['e'] = -dp, [1] )
              // Zero.
              : [ x['e'] = 0 ];
        } else {

            // Remove any digits after the required decimal places.
            xc.length = i--;

            // Round up?
            if ( rm ) {

                // Rounding up may mean the previous digit has to be rounded up and so on.
                for ( ; ++xc[i] > 9; ) {
                    xc[i] = 0;

                    if ( !i-- ) {
                        ++x['e'];
                        xc.unshift(1)
                    }
                }
            }

            // Remove trailing zeros.
            for ( i = xc.length; !xc[--i]; xc.pop() ) {
            }
        }

        return x
    }


    // PROTOTYPE/INSTANCE METHODS


    /*
     * Return
     * 1 if the value of this 'Big' is greater than the value of 'Big' 'y',
     * -1 if the value of this 'Big' is less than the value of 'Big' 'y', or
     * 0 if they have the same value,
     */
    P['cmp'] = function ( y ) {
        var xNeg,
            x = this,
            xc = x['c'],
            yc = ( y = new Big( y ) )['c'],
            i = x['s'],
            j = y['s'],
            k = x['e'],
            l = y['e'];

        // Either zero?
        if ( !xc[0] || !yc[0] ) {
            return !xc[0] ? !yc[0] ? 0 : -j : i
        }

        // Signs differ?
        if ( i != j ) {
            return i
        }
        xNeg = i < 0;

        // Compare exponents.
        if ( k != l ) {
            return k > l ^ xNeg ? 1 : -1
        }

        // Compare digit by digit.
        for ( i = -1,
              j = ( k = xc.length ) < ( l = yc.length ) ? k : l;
              ++i < j; ) {

            if ( xc[i] != yc[i] ) {
                return xc[i] > yc[i] ^ xNeg ? 1 : -1
            }
        }

        // Compare lengths.
        return k == l ? 0 : k > l ^ xNeg ? 1 : -1
    };


    /*
     * Return a new 'Big' whose value is the value of this 'Big' divided by the
     * value of 'Big' 'y', rounded, if necessary, to a maximum of 'Big.DP'
     * decimal places using rounding mode 'Big.RM'.
     */
    P['div'] = function ( y ) {
        var x = this,
            dvd = x['c'],
            dvs = ( y = new Big(y) )['c'],
            s = x['s'] == y['s'] ? 1 : -1,
            dp = Big['DP'];

        if ( dp !== ~~dp || dp < 0 || dp > MAX_DP ) {
            throw '!Big.DP!'
        }

        // Either 0?
        if ( !dvd[0] || !dvs[0] ) {

            // Both 0?
            if ( dvd[0] == dvs[0] ) {
                throw NaN
            }

            // 'dvs' is 0?
            if ( !dvs[0] ) {
                // Throw +-Infinity.
                throw s / 0
            }

            // 'dvd' is 0. Return +-0.
            return new Big( s * 0 )
        }


        var dvsL, dvsT, next, cmp, remI,
            dvsZ = dvs.slice(),
            dvdI = dvsL = dvs.length,
            dvdL = dvd.length,
            rem = dvd.slice( 0, dvsL ),
            remL = rem.length,
            quo = new Big(ONE),
            qc = quo['c'] = [],
            qi = 0,
            digits = dp + ( quo['e'] = x['e'] - y['e'] ) + 1;

        quo['s'] = s;
        s = digits < 0 ? 0 : digits;

        // Create version of divisor with leading zero.
        dvsZ.unshift(0);

        // Add zeros to make remainder as long as divisor.
        for ( ; remL++ < dvsL; rem.push(0) ) {
        }

        do {

            // 'next' is how many times the divisor goes into the current remainder.
            for ( next = 0; next < 10; next++ ) {

                // Compare divisor and remainder.
                if ( dvsL != ( remL = rem.length ) ) {
                    cmp = dvsL > remL ? 1 : -1
                } else {
                    for ( remI = -1, cmp = 0; ++remI < dvsL; ) {

                        if ( dvs[remI] != rem[remI] ) {
                            cmp = dvs[remI] > rem[remI] ? 1 : -1;
                            break
                        }
                    }
                }

                // Subtract divisor from remainder (if divisor < remainder).
                if ( cmp < 0 ) {

                    // Remainder cannot be more than one digit longer than divisor.
                    // Equalise lengths using divisor with extra leading zero?
                    for ( dvsT = remL == dvsL ? dvs : dvsZ; remL; ) {

                        if ( rem[--remL] < dvsT[remL] ) {

                            for ( remI = remL;
                                  remI && !rem[--remI];
                                  rem[remI] = 9 ) {
                            }
                            --rem[remI];
                            rem[remL] += 10
                        }
                        rem[remL] -= dvsT[remL]
                    }
                    for ( ; !rem[0]; rem.shift() ) {
                    }
                } else {
                    break
                }
            }

            // Add the 'next' digit to the result array.
            qc[qi++] = cmp ? next : ++next;

            // Update the remainder.
            rem[0] && cmp
              ? ( rem[remL] = dvd[dvdI] || 0 )
              : ( rem = [ dvd[dvdI] ] )

        } while ( ( dvdI++ < dvdL || rem[0] != null ) && s-- );

        // Leading zero? Do not remove if result is simply zero (qi == 1).
        if ( !qc[0] && qi != 1) {

            // There can't be more than one zero.
            qc.shift();
            quo['e']--;
        }

        // Round?
        if ( qi > digits ) {
            rnd( quo, dp, Big['RM'], rem[0] != null )
        }

        return quo
    }


    /*
     * Return a new 'Big' whose value is the value of this 'Big' minus the value
     * of 'Big' 'y'.
     */
    P['minus'] = function ( y ) {
        var d, i, j, xLTy,
            x = this,
            a = x['s'],
            b = ( y = new Big( y ) )['s'];

        // Signs differ?
        if ( a != b ) {
            return y['s'] = -b, x['plus'](y)
        }

        var xc = x['c'],
            xe = x['e'],
            yc = y['c'],
            ye = y['e'];

        // Either zero?
        if ( !xc[0] || !yc[0] ) {

            // 'y' is non-zero?
            return yc[0]
              ? ( y['s'] = -b, y )
              // 'x' is non-zero?
              : new Big( xc[0]
                ? x
                // Both are zero.
                : 0 )
        }

        // Determine which is the bigger number.
        // Prepend zeros to equalise exponents.
        if ( xc = xc.slice(), a = xe - ye ) {
            d = ( xLTy = a < 0 ) ? ( a = -a, xc ) : ( ye = xe, yc );

            for ( d.reverse(), b = a; b--; d.push(0) ) {
            }
            d.reverse()
        } else {

            // Exponents equal. Check digit by digit.
            j = ( ( xLTy = xc.length < yc.length ) ? xc : yc ).length;

            for ( a = b = 0; b < j; b++ ) {

                if ( xc[b] != yc[b] ) {
                    xLTy = xc[b] < yc[b];
                    break
                }
            }
        }

        // 'x' < 'y'? Point 'xc' to the array of the bigger number.
        if ( xLTy ) {
            d = xc, xc = yc, yc = d;
            y['s'] = -y['s']
        }

        /*
         * Append zeros to 'xc' if shorter. No need to add zeros to 'yc' if shorter
         * as subtraction only needs to start at 'yc.length'.
         */
        if ( ( b = -( ( j = xc.length ) - yc.length ) ) > 0 ) {

            for ( ; b--; xc[j++] = 0 ) {
            }
        }

        // Subtract 'yc' from 'xc'.
        for ( b = yc.length; b > a; ){

            if ( xc[--b] < yc[b] ) {

                for ( i = b; i && !xc[--i]; xc[i] = 9 ) {
                }
                --xc[i];
                xc[b] += 10
            }
            xc[b] -= yc[b]
        }

        // Remove trailing zeros.
        for ( ; xc[--j] == 0; xc.pop() ) {
        }

        // Remove leading zeros and adbust exponent accordingly.
        for ( ; xc[0] == 0; xc.shift(), --ye ) {
        }

        if ( !xc[0] ) {

            // Result must be zero.
            xc = [ye = 0]
        }

        return y['c'] = xc, y['e'] = ye, y
    };


    /*
     * Return a new 'Big' whose value is the value of this 'Big' modulo the
     * value of 'Big' 'y'.
     */
    P['mod'] = function ( y ) {
        y = new Big( y );
        var c,
            x = this,
            i = x['s'],
            j = y['s'];

        if ( !y['c'][0] ) {
            throw NaN
        }

        x['s'] = y['s'] = 1;
        c = y['cmp'](x) == 1;
        x['s'] = i, y['s'] = j;

        return c
          ? new Big(x)
          : ( i = Big['DP'], j = Big['RM'],
            Big['DP'] = Big['RM'] = 0,
              x = x['div'](y),
                Big['DP'] = i, Big['RM'] = j,
                  this['minus']( x['times'](y) ) )
    };


    /*
     * Return a new 'Big' whose value is the value of this 'Big' plus the value
     * of 'Big' 'y'.
     */
    P['plus'] = function ( y ) {
        var d,
            x = this,
            a = x['s'],
            b = ( y = new Big( y ) )['s'];

        // Signs differ?
        if ( a != b ) {
            return y['s'] = -b, x['minus'](y)
        }

        var xe = x['e'],
            xc = x['c'],
            ye = y['e'],
            yc = y['c'];

        // Either zero?
        if ( !xc[0] || !yc[0] ) {

            // 'y' is non-zero?
            return yc[0]
              ? y
              : new Big( xc[0]

                // 'x' is non-zero?
                ? x

                // Both are zero. Return zero.
                : a * 0 )
        }

        // Prepend zeros to equalise exponents.
        // Note: Faster to use reverse then do unshifts.
        if ( xc = xc.slice(), a = xe - ye ) {
            d = a > 0 ? ( ye = xe, yc ) : ( a = -a, xc );

            for ( d.reverse(); a--; d.push(0) ) {
            }
            d.reverse()
        }

        // Point 'xc' to the longer array.
        if ( xc.length - yc.length < 0 ) {
            d = yc, yc = xc, xc = d
        }

        /*
         * Only start adding at 'yc.length - 1' as the
         * further digits of 'xc' can be left as they are.
         */
        for ( a = yc.length, b = 0; a;
             b = ( xc[--a] = xc[a] + yc[a] + b ) / 10 ^ 0, xc[a] %= 10 ) {
        }

        // No need to check for zero, as +x + +y != 0 && -x + -y != 0

        if ( b ) {
            xc.unshift(b);
            ++ye
        }

         // Remove trailing zeros.
        for ( a = xc.length; xc[--a] == 0; xc.pop() ) {
        }

        return y['c'] = xc, y['e'] = ye, y
    };


    /*
     * Return a 'Big' whose value is the value of this 'Big' raised to the power
     * 'e'. If 'e' is negative, round, if necessary, to a maximum of 'Big.DP'
     * decimal places using rounding mode 'Big.RM'.
     *
     * e {number} Integer, -MAX_POWER to MAX_POWER inclusive.
     */
    P['pow'] = function ( e ) {
        var isNeg = e < 0,
            x = new Big(this),
            y = ONE;

        if ( e !== ~~e || e < -MAX_POWER || e > MAX_POWER ) {
            throw '!pow!'
        }

        for ( e = isNeg ? -e : e; ; ) {

            if ( e & 1 ) {
                y = y['times'](x)
            }
            e >>= 1;

            if ( !e ) {
                break
            }
            x = x['times'](x)
        }

        return isNeg ? ONE['div'](y) : y
    };


    /*
     * Return a new 'Big' whose value is the value of this 'Big' rounded, if
     * necessary, to a maximum of 'dp' decimal places using rounding mode 'rm'.
     * If 'dp' is not specified, round to 0 decimal places.
     * If 'rm' is not specified, use 'Big.RM'.
     *
     * [dp] {number} Integer, 0 to MAX_DP inclusive.
     * [rm] 0, 1 or 2 ( i.e. ROUND_DOWN, ROUND_HALF_UP or ROUND_HALF_EVEN )
     */
    P['round'] = function ( dp, rm ) {
        var x = new Big(this);

        if ( dp == null ) {
            dp = 0
        } else if ( dp !== ~~dp || dp < 0 || dp > MAX_DP ) {
            throw '!round!'
        }
        rnd( x, dp, rm == null ? Big['RM'] : rm );

        return x
    };


    /*
     * Return a new 'Big' whose value is the square root of the value of this
     * 'Big', rounded, if necessary, to a maximum of 'Big.DP' decimal places
     * using rounding mode 'Big.RM'.
     */
    P['sqrt'] = function () {
        var estimate, r, approx,
            x = this,
            xc = x['c'],
            i = x['s'],
            e = x['e'],
            half = new Big('0.5');

        // Zero?
        if ( !xc[0] ) {
            return new Big(x)
        }

        // Negative?
        if ( i < 0 ) {
            throw NaN
        }

        // Estimate.
        i = Math.sqrt( x.toString() );

        // Math.sqrt underflow/overflow?
        // Pass 'x' to Math.sqrt as integer, then adjust the exponent of the result.
        if ( i == 0 || i == 1 / 0 ) {
            estimate = xc.join('');

            if ( !( estimate.length + e & 1 ) ) {
                estimate += '0'
            }

            r = new Big( Math.sqrt(estimate).toString() );
            r['e'] = ( ( ( e + 1 ) / 2 ) | 0 ) - ( e < 0 || e & 1 )
        } else {
            r = new Big( i.toString() )
        }

        i = r['e'] + ( Big['DP'] += 4 );

        // Newton-Raphson loop.
        do {
            approx = r;
            r = half['times']( approx['plus']( x['div'](approx) ) )
        } while ( approx['c'].slice( 0, i ).join('') !==
                       r['c'].slice( 0, i ).join('') );

        rnd( r, Big['DP'] -= 4, Big['RM'] );

        return r
    };


    /*
     * Return a new 'Big' whose value is the value of this 'Big' times the value
     * of 'Big' 'y'.
     */
    P['times'] = function ( y ) {
        var c,
            x = this,
            xc = x['c'],
            yc = ( y = new Big( y ) )['c'],
            a = xc.length,
            b = yc.length,
            i = x['e'],
            j = y['e'];

        y['s'] = x['s'] == y['s'] ? 1 : -1;

        // Either 0?
        if ( !xc[0] || !yc[0] ) {

            return new Big( y['s'] * 0 )
        }

        y['e'] = i + j;

        if ( a < b ) {
            c = xc, xc = yc, yc = c, j = a, a = b, b = j
        }

        for ( j = a + b, c = []; j--; c.push(0) ) {
        }

        // Multiply!
        for ( i = b - 1; i > -1; i-- ) {

            for ( b = 0, j = a + i;
                  j > i;
                  b = c[j] + yc[i] * xc[j - i - 1] + b,
                  c[j--] = b % 10 | 0,
                  b = b / 10 | 0 ) {
            }

            if ( b ) {
                c[j] = ( c[j] + b ) % 10
            }
        }

        b && ++y['e'];

        // Remove any leading zero.
        !c[0] && c.shift();

        // Remove trailing zeros.
        for ( j = c.length; !c[--j]; c.pop() ) {
        }

        return y['c'] = c, y
    };


    /*
     * Return a string representing the value of this 'Big'.
     * Return exponential notation if this 'Big' has a positive exponent equal
     * to or greater than 'TO_EXP_POS', or a negative exponent equal to or less
     * than 'TO_EXP_NEG'.
     */
    P['toString'] = P['valueOf'] = function () {
        var x = this,
            e = x['e'],
            str = x['c'].join(''),
            strL = str.length;

        // Exponential notation?
        if ( e <= TO_EXP_NEG || e >= TO_EXP_POS ) {
            str = str.charAt(0) + ( strL > 1 ?  '.' + str.slice(1) : '' ) +
              ( e < 0 ? 'e' : 'e+' ) + e

        // Negative exponent?
        } else if ( e < 0 ) {

        // Prepend zeros.
            for ( ; ++e; str = '0' + str ) {
            }
            str = '0.' + str

        // Positive exponent?
        } else if ( e > 0 ) {

            if ( ++e > strL ) {

                // Append zeros.
                for ( e -= strL; e-- ; str += '0' ) {
                }
            } else if ( e < strL ) {
                str = str.slice( 0, e ) + '.' + str.slice(e)
            }

        // Exponent zero.
        } else if ( strL > 1 ) {
            str = str.charAt(0) + '.' + str.slice(1)
        }

        // Avoid '-0'
        return x['s'] < 0 && x['c'][0] ? '-' + str : str
    };


    /*
     ***************************************************************************
     *
     * If 'toExponential', 'toFixed', 'toPrecision' and 'format' are not
     * required they can safely be commented-out or deleted. No redundant code
     * will be left. 'format' is used only by 'toExponential', 'toFixed' and
     * 'toPrecision'.
     *
     ***************************************************************************
     */
     

    /*
     * PRIVATE FUNCTION
     *
     * Return a string representing the value of 'Big' 'x' in normal or
     * exponential notation to a fixed number of decimal places or significant
     * digits 'dp'.
     * (Called by toString, toExponential, toFixed and toPrecision.)
     *
     * x {Big} The 'Big' to format.
     * dp {number} Integer, 0 to MAX_DP inclusive.
     * toE {number} undefined (toFixed), 1 (toExponential) or 2 (toPrecision).
     */
    function format( x, dp, toE ) {
        // The index (in normal notation) of the digit that may be rounded up.
        var i = dp - ( x = new Big(x) )['e'],
            c = x['c'];

        // Round?
        if ( c.length > ++dp ) {
            rnd( x, i, Big['RM'] )
        }

        // Recalculate 'i' if toFixed as 'x.e' may have changed if value rounded up.
        i = !c[0] ? i + 1 : toE ? dp : ( c = x['c'], x['e'] + i + 1 );

        // Append zeros?
        for ( ; c.length < i; c.push(0) ) {
        }
        i = x['e'];

        /*
         * 'toPrecision' returns exponential notation if the number of
         * significant digits specified is less than the number of digits
         * necessary to represent the integer part of the value in normal
         * notation.
         */
        return toE == 1 || toE == 2 && ( dp <= i || i <= TO_EXP_NEG )

            // Exponential notation.
            ? ( x['s'] < 0 && c[0] ? '-' : '' ) + ( c.length > 1
              ? ( c.splice( 1, 0, '.' ), c.join('') )
              : c[0] ) + ( i < 0 ? 'e' : 'e+' ) + i

            // Normal notation.
            : x.toString()
    }


    /*
     * Return a string representing the value of this 'Big' in exponential
     * notation to 'dp' fixed decimal places and rounded, if necessary, using
     * 'Big.RM'.
     *
     * [dp] {number} Integer, 0 to MAX_DP inclusive.
     */
    P['toExponential'] = function ( dp ) {

        if ( dp == null ) {
            dp = this['c'].length - 1
        } else if ( dp !== ~~dp || dp < 0 || dp > MAX_DP ) {
            throw '!toExp!'
        }

        return format( this, dp, 1 )
    };


    /*
     * Return a string representing the value of this 'Big' in normal notation
     * to 'dp' fixed decimal places and rounded, if necessary, using 'Big.RM'.
     *
     * [dp] {number} Integer, 0 to MAX_DP inclusive.
     */
    P['toFixed'] = function ( dp ) {
        var str,
            x = this,
            neg = TO_EXP_NEG,
            pos = TO_EXP_POS;

        TO_EXP_NEG = -( TO_EXP_POS = 1 / 0 );

        if ( dp == null ) {
            str = x.toString()
        } else if ( dp === ~~dp && dp >= 0 && dp <= MAX_DP ) {
            str = format( x, x['e'] + dp );

            // (-0).toFixed() is '0', but (-0.1).toFixed() is '-0'.
            // (-0).toFixed(1) is '0.0', but (-0.01).toFixed(1) is '-0.0'.
            if ( x['s'] < 0 && x['c'][0] && str.indexOf('-') < 0 ) {
                // As e.g. -0.5 if rounded to -0 will cause toString to omit the minus sign.
                str = '-' + str
            }
        }
        TO_EXP_NEG = neg, TO_EXP_POS = pos;

        if ( !str ) {
            throw '!toFix!'
        }

        return str
    };


    /*
     * Return a string representing the value of this 'Big' to 'sd' significant
     * digits and rounded, if necessary, using 'Big.RM'. If 'sd' is less than
     * the number of digits necessary to represent the integer part of the value
     * in normal notation, then use exponential notation.
     *
     * sd {number} Integer, 1 to MAX_DP inclusive.
     */
    P['toPrecision'] = function ( sd ) {

        if ( sd == null ) {
            return this.toString()
        } else if ( sd !== ~~sd || sd < 1 || sd > MAX_DP ) {
            throw '!toPre!'
        }

        return format( this, sd - 1, 2 )
    };


    // EXPORT


    // Node and other CommonJS-like environments that support module.exports.
    if ( typeof module !== 'undefined' && module.exports ) {
        module.exports = Big

    //AMD.
    } else if ( typeof define == 'function' && define.amd ) {
        define( function () {
            return Big
        })

    //Browser.
    } else {
        global['Big'] = Big
    }

})( this );

//