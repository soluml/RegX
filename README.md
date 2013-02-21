Welcome to RegX!
---
RegX is a class written in PHP and jQuery (more options to come later) by Benjamin Solum that strives to eliminate the excess time spent on writing multiple regular expressions. Traditionally, forms were validated with a combination of client-side regular expressions written in JavaScript for client usability and server-side regular expressions written in your CGI language of choice for security reasons. This resulted in the need to write two separate expressions. Recent developments in the HTML5 spec have resulted in further validation fragmentation as there's now a third form of validation (which utilizes the DOM).

RegX hopes to solve this problem by defining "patterns" that are completely accessible to all parts of the validation process. You can write all of your validation rules in the new HTML5 form attributes (pattern, max, min, step, etc.), in the regx.patterns.xml file, or a combination of both. RegX also supports Captcha's, custom error messaging, and other beneficial form validation features.

## Getting Started

The RegX package comes with 4 files plus a README:

1. **regx.class.php** - This is main class. It performs all the validation and returns the PHP and JSON RegX objects.
2. **regx.jquery.js** - This is a jQuery plugin. Pass any form object to it and it'll validate on the client-side.
3. **regx.patterns.xml** - This is a patterns file. Use it to supplement any HTML5 patterns you've specified. Also, you can specify ther error messages in this file you want passed to the RegX objects.
4. **regx.ajax.php** - This is the AJAX bridge that allows jQuery to validate for the front end.


## RegX Objects

The term 'RegX Objects' refers to the two objects returned by the RegX class. One object is returned in the form of a server-side object and the other is returned in the form of a JSON object to be used on the client-side. The objects returned are identical unless you specify otherwise. The objects consist of the 4 parameters below:

1. **field\_valid\_**[array]_ - This parameter contains an array of all of the field objects that are valid according to their patterns.
2. **field\_error\_**[array]_ - This parameter contains an array of all of the field objects that are invalid according to their patterns.
3. **error\_**[bool]_ - This parameter is a boolean value that allows you to quickly determine whether or not the form produced an error.
4. **time\_**[timestamp]_ - This parameter is a Unix Timestamp (in seconds) that tells us how long it took for user to submit the form on their last attempt. This requires the session cookie.