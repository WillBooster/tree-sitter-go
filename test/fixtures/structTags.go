package tags

import "fmt"

type Record struct {
 Name string `json:"name" xml:"name,omitempty"`
 Punctuation string `custom-tag:"x" x.y:"z"`
 Adjacent string `json:"x"xml:"y"`
 Slash string `\key:"slash"`
 Unicode string `界.键:"value"`
 Escape string `custom:"a\"b\\c" empty:""`
 Only string `only:"value"`
 Arbitrary string `not conventional : text "unterminated`
 Unclosed string `json:"unterminated`
 Spaced string `json: "value"`
 Interpreted string "json:\"name\""
 Empty string ``
 Percent string `custom:"%[01]d"`
}

const ordinary = `json:"ordinary"`

func formatExample() string { return fmt.Sprintf(`json:"%[01]d"`, 1) }

type Boundary struct { First string `a:"unfinished`; Second string `b:"second"`; Third string `c:"third"` }
type EscapedBoundary struct { First string `a:"unfinished\`; Second string `b:"second"` }
type NewlineBoundary struct { First string `a:"unfinished\
still`; Second string `b:"second"` }

type Fallback struct {
 Plain string `plain %d`
 Adjacent string `literal%qtext`
 Key string `prefix%d:"value" %s:"other" unknown%Q:"x"`
 Incomplete string `prefix%d:"unterminated %v`
 Quoted string `"garbage %q"`
 SpaceFlag string `% d:"not a key"`
 Percent string `percent%%:"value" bare%:"value"`
}
