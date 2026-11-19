// package-rc6 bundles and checks actual synthetic or user-provided source files
// against an RC6 metadata export. It is not a third-party certification.
package main

import (
	"archive/zip"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"example.com/co2-evidence-ledger-stage/internal/ledgercheck"
	"flag"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"time"
)

const maxDocument = 3 * 1024 * 1024
const maxLedger = 4 * 1024 * 1024
const maxArchiveData = 64 * 1024 * 1024

type Evidence struct {
	ID       string `json:"id"`
	Filename string `json:"filename"`
	Hash     string `json:"hash"`
	Size     int64  `json:"size"`
}
type Metadata struct {
	Evidences []Evidence `json:"evidences"`
}
type FileEntry struct {
	ID       string `json:"id"`
	Filename string `json:"filename"`
	Path     string `json:"path"`
	SHA256   string `json:"sha256"`
	Size     int64  `json:"size"`
}
type Manifest struct {
	Version     string      `json:"version"`
	GeneratedAt string      `json:"generatedAt"`
	Evidence    []FileEntry `json:"evidence"`
	Note        string      `json:"note"`
}

func fileHash(b []byte) string { h := sha256.Sum256(b); return hex.EncodeToString(h[:]) }
func allowedName(n string) bool {
	if n == "" || n == "." || strings.ContainsAny(n, "/\\\x00") || filepath.Base(n) != n {
		return false
	}
	switch strings.ToLower(filepath.Ext(n)) {
	case ".pdf", ".png", ".jpg", ".jpeg", ".csv", ".txt":
		return true
	}
	return false
}
func validDocumentID(s string) bool {
	if len(s) == 0 || len(s) > 120 {
		return false
	}
	for _, c := range s {
		if !(c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z' || c >= '0' && c <= '9' || c == '-' || c == '_') {
			return false
		}
	}
	return true
}
func loadLedger(b []byte) (Metadata, error) {
	r := ledgercheck.Check(b)
	if !r.OK {
		return Metadata{}, errors.New("libro RC6 inválido: " + r.Error)
	}
	var meta Metadata
	if err := json.Unmarshal(b, &meta); err != nil {
		return meta, err
	}
	return meta, nil
}
func writeZipEntry(w *zip.Writer, name string, data []byte) error {
	h := &zip.FileHeader{Name: name, Method: zip.Deflate}
	h.SetModTime(time.Date(2000, 1, 1, 0, 0, 0, 0, time.UTC))
	h.SetMode(0600)
	f, err := w.CreateHeader(h)
	if err != nil {
		return err
	}
	_, err = f.Write(data)
	return err
}
func createPackage(ledgerPath, docDir, dest string) error {
	info, err := os.Stat(ledgerPath)
	if err != nil {
		return err
	}
	if info.Size() > maxLedger {
		return errors.New("libro mayor de 4 MiB")
	}
	ledger, err := os.ReadFile(ledgerPath)
	if err != nil {
		return err
	}
	meta, err := loadLedger(ledger)
	if err != nil {
		return err
	}
	if len(meta.Evidences) > 1000 {
		return errors.New("demasiados documentos para ZIP local")
	}
	manifest := Manifest{Version: "co2-evidence-package-1", GeneratedAt: time.Now().UTC().Format(time.RFC3339), Evidence: []FileEntry{}, Note: "Solo integridad autocontenida; no certifica origen, verdad, fecha, autor, metodología ni blockchain."}
	docs := map[string][]byte{}
	seen := map[string]bool{}
	for _, e := range meta.Evidences {
		if !allowedName(e.Filename) || !validDocumentID(e.ID) || seen[e.ID] {
			return errors.New("nombre o ID inválido en evidencias")
		}
		seen[e.ID] = true
		source := filepath.Join(docDir, e.Filename)
		fi, err := os.Lstat(source)
		if err != nil {
			return fmt.Errorf("documento %q: %w", e.Filename, err)
		}
		if !fi.Mode().IsRegular() || fi.Size() > maxDocument {
			return fmt.Errorf("archivo inválido o mayor de 3 MiB: %s", e.Filename)
		}
		b, err := os.ReadFile(source)
		if err != nil {
			return err
		}
		if int64(len(b)) != e.Size || fileHash(b) != e.Hash {
			return fmt.Errorf("tamaño o SHA-256 no coincide con JSON RC6: %s", e.Filename)
		}
		name := "evidence/" + e.ID + strings.ToLower(filepath.Ext(e.Filename))
		docs[name] = b
		manifest.Evidence = append(manifest.Evidence, FileEntry{ID: e.ID, Filename: e.Filename, Path: name, SHA256: e.Hash, Size: e.Size})
	}
	m, err := json.MarshalIndent(manifest, "", "  ")
	if err != nil {
		return err
	}
	outdir := filepath.Dir(dest)
	temp, err := os.CreateTemp(outdir, ".co2-rc6-*.zip")
	if err != nil {
		return err
	}
	tempName := temp.Name()
	defer os.Remove(tempName)
	z := zip.NewWriter(temp)
	if err = writeZipEntry(z, "ledger.json", ledger); err == nil {
		err = writeZipEntry(z, "manifest.json", m)
	}
	if err == nil {
		for _, file := range manifest.Evidence {
			if err = writeZipEntry(z, file.Path, docs[file.Path]); err != nil {
				break
			}
		}
	}
	zerr := z.Close()
	ferr := temp.Close()
	if err != nil {
		return err
	}
	if zerr != nil {
		return zerr
	}
	if ferr != nil {
		return ferr
	}
	if _, err = os.Stat(dest); err == nil {
		return errors.New("ya existe el ZIP de destino; no se sobrescribe")
	} else if !errors.Is(err, os.ErrNotExist) {
		return err
	}
	return os.Rename(tempName, dest)
}
func verifyPackage(zipPath string) (int, error) {
	z, err := zip.OpenReader(zipPath)
	if err != nil {
		return 0, err
	}
	defer z.Close()
	if len(z.File) > 1002 {
		return 0, errors.New("demasiadas entradas ZIP")
	}
	data := map[string][]byte{}
	var total uint64
	for _, f := range z.File {
		if f.FileInfo().IsDir() || strings.Contains(f.Name, "..") || strings.ContainsAny(f.Name, "\\\x00") || strings.HasPrefix(f.Name, "/") || data[f.Name] != nil {
			return 0, fmt.Errorf("ruta insegura o entrada repetida: %q", f.Name)
		}
		if f.Name != "ledger.json" && f.Name != "manifest.json" && !strings.HasPrefix(f.Name, "evidence/") {
			return 0, fmt.Errorf("entrada no permitida: %q", f.Name)
		}
		if f.UncompressedSize64 > maxArchiveData || total+f.UncompressedSize64 > maxArchiveData {
			return 0, errors.New("ZIP excede tamaño máximo")
		}
		total += f.UncompressedSize64
		limit := int64(maxDocument)
		if f.Name == "ledger.json" || f.Name == "manifest.json" {
			limit = maxLedger
		}
		if f.UncompressedSize64 > uint64(limit) {
			return 0, errors.New("entrada demasiado grande")
		}
		rc, err := f.Open()
		if err != nil {
			return 0, err
		}
		b, readerr := io.ReadAll(io.LimitReader(rc, limit+1))
		closeerr := rc.Close()
		if readerr != nil || closeerr != nil || int64(len(b)) > limit || int64(len(b)) != int64(f.UncompressedSize64) {
			return 0, fmt.Errorf("lectura de ZIP inválida en %s", f.Name)
		}
		data[f.Name] = b
	}
	if data["ledger.json"] == nil || data["manifest.json"] == nil {
		return 0, errors.New("falta ledger.json o manifest.json")
	}
	meta, err := loadLedger(data["ledger.json"])
	if err != nil {
		return 0, err
	}
	var man Manifest
	if err := json.Unmarshal(data["manifest.json"], &man); err != nil || man.Version != "co2-evidence-package-1" {
		return 0, errors.New("manifest inválido")
	}
	if len(meta.Evidences) != len(man.Evidence) || len(data) != 2+len(man.Evidence) {
		return 0, errors.New("faltan o sobran documentos en paquete")
	}
	original := map[string]Evidence{}
	for _, e := range meta.Evidences {
		original[e.ID] = e
	}
	encountered := map[string]bool{}
	for _, e := range man.Evidence {
		o, ok := original[e.ID]
		if !ok || encountered[e.ID] || !allowedName(e.Filename) || o.Filename != e.Filename || o.Hash != e.SHA256 || o.Size != e.Size {
			return 0, errors.New("manifest no coincide con metadatos")
		}
		encountered[e.ID] = true
		expected := "evidence/" + e.ID + strings.ToLower(filepath.Ext(e.Filename))
		if e.Path != expected {
			return 0, errors.New("ruta de evidencia inesperada")
		}
		b, ok := data[e.Path]
		if !ok || int64(len(b)) != e.Size || fileHash(b) != e.SHA256 {
			return 0, fmt.Errorf("SHA-256 o contenido inválido: %s", e.Path)
		}
	}
	return len(man.Evidence), nil
}
func main() {
	ledger := flag.String("ledger", "", "exportación de metadatos RC6 .json")
	docs := flag.String("documents", "", "directorio de originales")
	out := flag.String("out", "", "destino ZIP nuevo")
	verify := flag.String("verify", "", "verifica ZIP existente")
	flag.Parse()
	if *verify != "" {
		n, err := verifyPackage(*verify)
		if err != nil {
			fmt.Fprintln(os.Stderr, "RECHAZADO:", err)
			os.Exit(1)
		}
		fmt.Printf("CONSISTENTE: libro y %d documento(s) coinciden con metadatos locales; no supone certificación externa.\n", n)
		return
	}
	if *ledger == "" || *docs == "" || *out == "" {
		fmt.Fprintln(os.Stderr, "Uso: package-rc6 -ledger exportacion.json -documents ./originales -out expediente.zip\n  o: package-rc6 -verify expediente.zip")
		os.Exit(2)
	}
	if err := createPackage(*ledger, *docs, *out); err != nil {
		fmt.Fprintln(os.Stderr, "NO CREADO:", err)
		os.Exit(1)
	}
	fmt.Println("Paquete local creado:", *out, "(sin certificación ni firma externa)")
}
