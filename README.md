## [[ IN-LINE CALCULATOR ]]

A productivity tool for doing math on the fly while typing on a web page, without dependence on an external calculator tool.

## Method

### Event Handler

The content script adds a keyup event handler to the page's active element. The user's last two keystrokes are stored in a buffer, which is checked on each keystroke for double closing square brackets ("]]") or double equals signs ("=="). The presence of either triggers evaluation of the bracketed expression.

### Math

The bracketed expression is treated as a string and evaluated piecemeal according to the normal order of operations. Operations and parenthetical expressions are identified and evaluated through looped regular expression tests.

## Known issues

- The calculator doesn't work everywhere. (google docs, chrome "omnibox")

## Version history

v1.4.0
- incorporated JS Math object to remove my own (bad) algorithms
- simplified popup
- removed options page
- updated to manifest v3, removed unused 'activeTab' permission

v1.3.0
- revamped architecture -- works broadly in texteditable divs

v1.2.3
- handles imaginary results with error ("imaginary #s not supported")
- added README and LICENSE

v1.2.2
- added jira rich text comment functionality

(Previous versions not tracked here.)
