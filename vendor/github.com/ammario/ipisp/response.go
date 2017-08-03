package ipisp

import (
	"bytes"
	"fmt"
	"net"
	"time"
)

//Response contains a response from Cymru
type Response struct {
	IP          net.IP
	ASN         ASN
	Name        Name
	Country     string
	Registry    string
	Range       *net.IPNet
	AllocatedAt time.Time
}

//String provides an easy to read version of r
func (r *Response) String() string {
	buf := &bytes.Buffer{}
	buf.WriteRune('\n')
	fmt.Fprintf(buf, "IP      : %v\n", r.IP)
	fmt.Fprintf(buf, "ASN     : %v\n", r.ASN)
	fmt.Fprintf(buf, "Name    : %v\n", r.Name)
	fmt.Fprintf(buf, "Country : %v\n", r.Country)
	fmt.Fprintf(buf, "Registry: %v\n", r.Registry)
	fmt.Fprintf(buf, "Range   : %v\n", r.Range)
	fmt.Fprintf(buf, "Alloc At: %v\n", r.AllocatedAt)

	return buf.String()
}
