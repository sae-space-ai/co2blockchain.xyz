package main

import (
	"co2evidence/enterprise/internal/pack"
	"encoding/json"
	"fmt"
	"os"
)

func main() {
	if len(os.Args) != 2 {
		fmt.Fprintln(os.Stderr, "usage: verify-package <export.zip>")
		os.Exit(2)
	}
	data, e := os.ReadFile(os.Args[1])
	if e != nil {
		fmt.Fprintln(os.Stderr, e)
		os.Exit(2)
	}
	manifest, e := pack.VerifyArchive(data)
	if e != nil {
		json.NewEncoder(os.Stdout).Encode(map[string]any{"valid": false, "error": e.Error()})
		os.Exit(1)
	}
	json.NewEncoder(os.Stdout).Encode(map[string]any{"valid": true, "claimId": manifest.ClaimID, "eventCount": len(manifest.Events), "evidenceCount": len(manifest.Evidence), "externalAnchor": false, "certified": false})
}
