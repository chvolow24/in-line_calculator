## [[ IN-LINE CALCULATOR ]]

A productivity tool for doing math on the fly while typing on a web page, without dependence on an external calculator tool.

## Method

### Event Handler

The content script adds a keyup event handler to the page's active element. The characters corresponding to the user's last three keystrokes are stored in a buffer, which is checked on each stroke for double closing square brackets ("]]"). The presence of double closing square brackets triggers evaluation of the bracketed expression.

### Math

The bracketed expression is treated as a string and evaluated piecemeal according to the normal order of operations. Operations and parenthetical expressions are identified and evaluated through looped regular expression tests.

Exponents, including fractional and floating point exponents, are evaluated algorithmically. These algorithms have been tested carefully but not proven. I had to relearn a fair amount of pretty basic math to work them up and may have overlooked some cases.


## Known issues

- The calculator doesn't work everywhere. (google docs, chrome "omnibox")
- The algorithms used to evaluate math expressions may not be perfect in extreme cases
- The algorithms can be slow. While most expressions are evaluated nearly instantaneously, certain cases may time out. Floating point exponents are worst offender


## Technologies used

All native JavaScript

## Version history

v1.3.0
-revamped architecture -- works broadly in texteditable divs

v1.2.3
- handles imaginary results with error ("imaginary #s not supported")
- added README and LICENSE

v1.2.2
- added jira rich text comment functionality

(Previous versions not tracked here.)
