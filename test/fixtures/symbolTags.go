package tags

type Number = int
type Record struct { First, Second int; _ int }
type Contract interface { Method() }

const (
	GlobalOne = iota
	GlobalTwo
	_
)
var (
	GlobalA, GlobalB int
	_ int
)

var DirectVariable int
const DirectConstant = 1

func Function() {
	var localValue int
	const localConstant = 1
	_, _ = localValue, localConstant
}
