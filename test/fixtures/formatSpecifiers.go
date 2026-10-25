package formats

import (
	"fmt"
	"io"
	"log"
)

func formatExamples() {
	var err error
	fmt.Printf(/* format */ "%[2]*.[1]*[3]f %% %d", 2, 8, 1.2, 4)
	_ = fmt.Sprintf(`raw %+v`, 5)
	_ = fmt.Errorf("cause %w", err)
	fmt.Fprintf(io.Discard /* writer */, /* format */ "%02d", 3)
	Fprintf(io.Discard /* writer */, /* format */ "%d", 3)
	_ = fmt.Appendf(nil, "%s", "%v data")
	fmt.Print("%d literal")
	fmt.Printf("%s", "%d data")
	_ = "plain %v"
	fmt.Printf("%Q trailing %", 3)
	fmt.Printf("%#08.2f %.[2]*[1]s %9.f %O %U % x", 1.5, 2, 3)
	fmt.Printf("%[02]*.[01]*[03]f %[01]d", 2, 8, 1.2)
	fmt.Printf("escaped \\%d\n split %\x64", 3)
	log.Printf(`multiline
%[1]d`, 3)
	var value string
	fmt.Sscanf(/* input */ "%d input" /* input end */, /* format */ "%s", &value)
	Printf("%d", 3)
	_ = []string{"", ``, "%", "%%", "%[0]d", "%[2]*.", "%Q", "%\nd", `ordinary %v`}
}

func Printf(format string, args ...any) {}

func Fprintf(w io.Writer, format string, args ...any) {
	fmt.Fprintf(w, format, args...)
}
