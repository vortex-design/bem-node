export type BEMBlock<
	TName extends string,
	TElements extends Record<string, string | never>,
	TModifiers extends string | undefined
> = {
	name: TName
	elements: TElements
	modifiers: TModifiers
}
