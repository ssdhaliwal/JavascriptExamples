# JavascriptExamples

GIS Mask Helper

Range Selection
[]
- Global Ranges
- [-+^] - allows only sign - and + to be entered and is defined as signed field; so will update other sign fields when changed.  Example: if - is entered and there is a sign field for [NnSs^] or [EeWw^] - their values will be adjusted properly
- [NnSs^] - allows only sign field (case in-sensitive); N or S; and will update other sign field appropriately.
- [EeWw^] - allows only sign field (case in-sensitive); E or W; and will update other sign field appropriately.
- ![EeWw] - ignores chars in the range to prevent accidental cross-sign representation.
- *[ -_.] - specifies global delimiters.  They are used to forward data-entry between decimal values.

- Char Ranges
- [NnSs] - only allow N or n or S or s; not a sign field.  Will not allow further entry until char is entered correctly.
- [A..Z!IO] - allow all upper case chars A-Z except I and O.
- \\u - allow alpha chars (case in-sensitive); convert the chars to uppercase.
- \\i - allow alpha chars; lower case entry only.
- \\! - allow all special chars.
- \\A - allow only uppercase chars.

- Special Chars
- d - allow only values 0-9.

- Validation
- dd{2*1*60} - check last two decimal values; where min value is 1 and max value is 60; all others are error.
- dd{2*90} - check last two decimal values; where min value is 0 and max value is 90; all others are error.

- Examples
- Decimal Degrees
- - (mask) "[-+^]dd{2*90}.dddddddd'[NnSs^]![EWew]*[.],[-+^]ddd{3*180}.dddddddd'[EWew^]![NSns]*[.]"
- - (placeholder) ?dd.dddddddd°?,?ddd.dddddddd°?
- Degree Minutes
- - (mask) "[-+^]dd{2*90}° dd{2*59}.dddddddd'[NnSs^]![EWew]*[ -_.],[-+^]ddd{3*180}° dd{2*59}.dddddddd'[EWew^]![NSns]*[ -_.]"
- - (placeholder) "?dd° dd.dddddddd'?,?ddd° dd.dddddddd'?"
- Degree Minute Seconds
- - (mask) "[-+^]dd{2*90}° dd{2*59}' dd{2*59}.dddddddd\"[NnSs^]![EWew]*[ -_.],[-+^]ddd{3*180}° dd{2*59}' dd{2*59}.dddddddd\"[EWew^]![NSns]*[ -_.]"
- - (placeholder) "?dd° dd' dd.dddddddd\"?,?ddd° dd' dd.dddddddd\"?"
- UTM
- - (mask) "dd{2*1*60}[NnSs] ddddddmE dddddddmN"
- - (placeholder) "dd_ ddddddmE dddddddmN"
- MGRS
- - (mask) "dd{2*1*60}[A..Z!IiOo] \\u\\A dddddddd"
- - (placeholder) "dd_ __ ddddddddd"

