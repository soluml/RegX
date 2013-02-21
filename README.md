Welcome to RegX!
---
RegX is a class written in JavaScript and PHP (more server side options to come later) by Benjamin Solum that strives to eliminate the excess time spent on writing multiple regular expressions. Traditionally, forms were validated with a combination of client-side regular expressions written in JavaScript for client usability and server-side regular expressions written in your CGI language of choice for security reasons. This resulted in the need to write two separate expressions. Recent developments in the HTML5 spec have resulted in further validation fragmentation as there's now a third form of validation (which utilizes the DOM).

RegX hopes to solve this problem by defining "patterns" that are completely accessible to all parts of the validation process. You can write all of your validation rules in the new HTML5 form attributes (pattern, max, min, step, etc.), in the regx.patterns.xml file, or a combination of both. RegX also supports Captcha's, custom error messaging, and other beneficial form validation features.

RegX is under active development so if a feature is not yet available, **please be patient or offer up some time and commit some code**! **Any bug fixes or corrections are welcome!**

## Getting Started

The RegX package currently comes with 1 file plus a README:

1. **RegX.js** - This is the main class. It performs JS validation in absence of native HTML5 validation and returns JS error objects (if there are errors).

A codepen for a quick start is available here: [http://codepen.io/soluml/pen/lgcne](http://codepen.io/soluml/pen/lgcne)

If you'd like to quickly include RegX.js in a project, use this link (if you like, be sure to download it): [http://regx.github.com/RegX.js](http://regx.github.com/RegX.js)

Include the RegX.js file anywhere in your HTML document.  RegX will automatically bind to your forms and validate your fields based on the input types and attributes you've set in the form.  On form submission, RegX will call one of its built in methods (onSuccess or onFailure) based on the validity of your form. Please refer to the [online documentation](http://regx.github.com/) to see how you can bind to these methods.