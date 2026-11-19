package main

import (
	"encoding/json"
	"example.com/co2-evidence-ledger-stage/internal/ledgercheck"
	"flag"
	"fmt"
	"io"
	"os"
)

func main() {
	asJSON := flag.Bool("json", false, "emit machine-readable result")
	flag.Parse()
	if flag.NArg() != 1 {
		fmt.Fprintln(os.Stderr, "Uso: verify-rc6 [-json] <exportacion_RC6.json>")
		os.Exit(2)
	}
	f, err := os.Open(flag.Arg(0))
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(2)
	}
	defer f.Close()
	b, err := io.ReadAll(io.LimitReader(f, 4*1024*1024+1))
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(2)
	}
	r := ledgercheck.Check(b)
	if *asJSON {
		o, _ := json.MarshalIndent(r, "", "  ")
		fmt.Println(string(o))
	} else {
		status := "RECHAZADO"
		if r.OK {
			status = "CONSISTENTE"
		}
		fmt.Printf("%s — %s — %d eventos — %d registros\n", status, r.Version, r.Events, r.Records)
		if r.Error != "" {
			fmt.Println("Error:", r.Error)
		}
		fmt.Println(r.Note)
	}
	if !r.OK {
		os.Exit(1)
	}
}
