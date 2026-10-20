package tags

type Number = int
type _ = int
type _ int
type ( _ struct{} )
type Record struct { First, Second int; _ int }
type Contract interface { Method() }
type Nested struct { Inner struct { NestedMember int } }
var Anonymous struct { PackageMember int }

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
	type Local struct { LocalMember int }
	var localInterface interface { LocalMethod() }
	localCases := []struct { CaseName string }{}
	_, _, _, _, _ = localValue, localConstant, Local{}, localInterface, localCases
}
