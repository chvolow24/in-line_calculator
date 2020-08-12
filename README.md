## [[ IN-LINE CALCULATOR ]]

A productivity tool for doing math on the fly while typing on a web page, without dependence on an external calculator tool.

## Method

### Event Handler

The content script adds a keyup event handler to the page's active element. The characters corresponding to the user's last three keystrokes are stored in a buffer, which is checked on each stroke for double closing square brackets ("]]"). The presence of double closing square brackets triggers evaluation of the bracketed expression.

### Math

The bracketed expression is treated as a string and evaluated piecemeal according to the normal order of operations. Operations and parenthetical expressions are identified and evaluated through looped regular expression tests.

Exponents, including fractional and floating point exponents, are evaluated algorithmically. These algorithms have been tested carefully but not proven. I had to relearn a fair amount of pretty basic math to work them up and may have overlooked some cases.


## Known issues

- The calculator doesn't work everywhere. (Gmail compose windows, google docs, and the omnibox are notable examples of unsupported text fields).
- The algorithms are imperfect. My own testing may not be commensurate with your use case.
- The algorithms can be slow. While most expressions are evaluated nearly instantaneously, certain cases may time out, even with a generous user setting. The most egregious of these cases are floating point exponents, which are evaluated by means of an algorithm whose speed decreases by an order of magnitude with each decimal place in the exponent.


## Technologies used

All JS functions not defined in these files are native to the language.

The only external dependency of note is the Jira-specific use case, which could fail with a change to Jira.


## Version history

v1.2.3
- handles imaginary results with error ("imaginary #s not supported")
- added README and LICENSE

v1.2.2
- added jira rich text comment functionality

(Previous versions not tracked here.)
