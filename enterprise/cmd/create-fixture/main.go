// Synthetic fixture only: never present these numbers as measured or official emissions.
package main

import (
	"co2evidence/enterprise/internal/ledger"
	"co2evidence/enterprise/internal/pack"
	"encoding/json"
	"fmt"
	"os"
	"time"
)

func main() {
	out := "tests/synthetic_enterprise.zip"
	if len(os.Args) > 1 {
		out = os.Args[1]
	}
	cl, org, project, actor, activityID, docID := ledger.UUID(), ledger.UUID(), ledger.UUID(), ledger.UUID(), ledger.UUID(), ledger.UUID()
	activity := map[string]string{"id": activityID, "period": "2026-11", "activity_type": "electricity", "quantity": "1000", "unit": "kWh", "factor": "0.2", "factor_source": "FACTOR SINTÉTICO NO OFICIAL", "scope": "2", "kg_co2e": "200.000000000", "t_co2e": "0.200000000"}
	ab, _ := json.Marshal(activity)
	content := []byte("DOCUMENTO EXCLUSIVAMENTE SINTETICO, NO ES FACTURA REAL\n")
	sha := ledger.SHA(content)
	p := "documents/" + docID + ".bin"
	e1 := ledger.NewEvent(1, cl, actor, "CLAIM_CREATED", map[string]string{"title": "DEMO SINTÉTICA", "status": "DRAFT"}, "GENESIS")
	e2 := ledger.NewEvent(2, cl, actor, "ACTIVITY_LINKED", map[string]string{"activityId": activityID, "recordSHA256": ledger.SHA(ab)}, e1.Hash)
	e3 := ledger.NewEvent(3, cl, actor, "EVIDENCE_LINKED", map[string]any{"id": docID, "sha256": sha, "bytes": len(content), "name": "factura-SINTETICA.txt"}, e2.Hash)
	m := pack.Manifest{Version: "co2-enterprise-archive-v1", ClaimID: cl, OrgID: org, ClaimStatus: "DRAFT", Title: "DEMO SINTÉTICA", GeneratedAt: time.Now().UTC().Format(time.RFC3339), Events: []ledger.Event{e1, e2, e3}, Activities: []map[string]string{activity}, Evidence: []pack.File{{ID: docID, Name: "factura-SINTETICA.txt", Mime: "text/plain", Size: len(content), SHA256: sha, Path: p}}, ExternalAnchor: false, Disclaimer: pack.Disclaimer}
	_ = project
	zip, e := pack.Build(m, map[string][]byte{p: content})
	if e != nil {
		panic(e)
	}
	if _, e = pack.VerifyArchive(zip); e != nil {
		panic(e)
	}
	if e = os.WriteFile(out, zip, 0600); e != nil {
		panic(e)
	}
	fmt.Println("synthetic evidence archive verified:", out)
}
