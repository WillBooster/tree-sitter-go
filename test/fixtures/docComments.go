package docs

// Detached function.

func Separated() {}

// Detached earlier paragraph.

// Direct docs.
// Continuation.
func Adjacent() {}

type Receiver int

// Detached method.

func (Receiver) SeparateMethod() {}

// Direct method.
func (Receiver) AdjacentMethod() {}

/* Detached block. */

func BlockSeparated() {}

/* Direct block. */
func BlockAdjacent() {}
