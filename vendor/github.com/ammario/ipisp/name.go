package ipisp

import "strings"

//Name contains an IPISP ISP name
type Name struct {
	Raw   string
	Short string
	Long  string
}

//ParseName returns a pointer to a new name
func ParseName(raw string) Name {
	tokens := strings.Split(raw, "-")
	if len(tokens) == 0 {
		tokens = []string{raw}
	}
	if len(tokens) == 1 {
		tokens = []string{tokens[0], raw}
	}
	return Name{
		Raw:   strings.TrimSpace(raw),
		Short: strings.TrimSpace(tokens[0]),
		Long:  strings.TrimSpace(tokens[1]),
	}
}

//String returns a human friendly representation of n
func (n Name) String() string {
	return n.Long
}
