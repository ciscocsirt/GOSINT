# IPISP

IPISP provides a Go client for [Team Cymru's](http://www.team-cymru.org/IP-ASN-mapping.html) ASN resolution service.

Features
- Programmatically resolve IP addresses or ASNs to network information.
- Allows bulk conversion.
- DNS and Netcat/Whois client.
- Thread-safe


[![GoDoc](https://godoc.org/github.com/golang/gddo?status.svg)](https://godoc.org/github.com/ammario/ipisp)

## Example

A more thorough example is in the examples/ folder.

```go
client,  := ipisp.NewDnsClient()

resp, _ := client.LookupIP(net.ParseIP("4.2.2.2"))

fmt.Printf("IP: %v\n", resp.IP)
fmt.Printf("ASN: %v\n", resp.ASN)
fmt.Printf("Range: %v\n", resp.Range)
fmt.Printf("Country: %v\n", resp.Country)
fmt.Printf("Registry: %v\n", resp.Registry)
fmt.Printf("ISP: %v\n", resp.Name)
```