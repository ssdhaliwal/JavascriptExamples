# JavascriptExamples

## GIS Mask Helper (1.0b)

### Range Selection
#### Global Ranges []
1. [-+^]
...allows only sign - and + to be entered and is defined as signed field; so will update other sign fields when changed.  Example: if - is entered and there is a sign field for [NnSs^] or [EeWw^] - their values will be adjusted properly
2. [NnSs^]
...allows only sign field (case in-sensitive); N or S; and will update other sign field appropriately.
3. [EeWw^]
...allows only sign field (case in-sensitive); E or W; and will update other sign field appropriately.
4. ![EeWw]
...ignores chars in the range to prevent accidental cross-sign representation.
5. *[ -_.]
...specifies global delimiters.  They are used to forward data-entry between decimal values.

#### Char Ranges
1. [NnSs]
...only allow N or n or S or s; not a sign field.  Will not allow further entry until char is entered correctly.
2. [A..Z!IO]   or [A..Za..z!IOio]
...allow all upper case chars A-Z except I and O.
3. \\u
...allow alpha chars (case in-sensitive); convert the chars to uppercase.
4. \\i
...allow alpha chars; any case.
5. \\!
...allow all special chars.
6. \\a
...allow only lowercase chars.
7. \\A
...allow only uppercase chars.
8. \\z
...allow alpha-numeric case in-sensitive chars.
9. \\Z
...allow alpha-numeric change to uppercase.
10. \\*
...allow any ascii printable char.

#### Special Chars
1. d
...allow only values 0-9.

#### Validation
1. dd{2*1*60}  or  dd{2v*1*60}
...check last two decimal values; where min value is 1 and max value is 60; all others are error.
2. dd{2*90}    or  dd{2v*90}
...check last two decimal values; where min value is 0 and max value is 90; all others are error.
3. dd{2*25|50|75}    or  dd{2v*25|50|75}
...check last two decimal values; where min value is 0 and max value is 25 or 50 or 75 or 100; all others are error.
4. dd{2*25*25|50|75}    or  dd{2v*25*25|50|75}
...check last two decimal values; where min value is 25 and max value is 25 or 50 or 75 or 100; all others are error.
5. dddddddd{8l*8}
...check last 8 chars; where min length is 0 to 8.
6. dddddd{8l*4*8}
...check last 8 chars; where min length is 4 to 8.
7. dddddddd{8l*2|4|6|8}
...check last 8 chars to be even length; odd lengths are error.

#### Examples
1. Decimal Degrees
```javascript
    (mask) "[-+^]dd{2*90}.dddddddd'[NnSs^]![EWew]*[.],[-+^]ddd{3*180}.dddddddd'[EWew^]![NSns]*[.]"
    (placeholder) ?dd.dddddddd°?,?ddd.dddddddd°?
```
2. Degree Minutes
```javascript
    (mask) "[-+^]dd{2*90}° dd{2*59}.dddddddd'[NnSs^]![EWew]*[ -_.],[-+^]ddd{3*180}° dd{2*59}.dddddddd'[EWew^]![NSns]*[ -_.]"
    (placeholder) "?dd° dd.dddddddd'?,?ddd° dd.dddddddd'?"
```
3. Degree Minute Seconds
```javascript
    (mask) "[-+^]dd{2*90}° dd{2*59}' dd{2*59}.dddddddd\"[NnSs^]![EWew]*[ -_.],[-+^]ddd{3*180}° dd{2*59}' dd{2*59}.dddddddd\"[EWew^]![NSns]*[ -_.]"
    (placeholder) "?dd° dd' dd.dddddddd\"?,?ddd° dd' dd.dddddddd\"?"
```
4. UTM
```javascript
    (mask) "dd{2*1*60}[NnSs] ddddddmE dddddddmN"
    (placeholder) "dd_ ddddddmE dddddddmN"
```
5. MGRS
```javascript
    (mask) "dd{2*1*60}[A..Z!IiOo] \\u\\A dddddddd"
    (placeholder) "dd_ __ ddddddddd{8l*2|4|6|8}"
```
