import { parseBEM } from 'bem-neon'
import ts, { factory } from 'typescript'
import { pascalCase } from 'pascal-case'
import { paramCase } from 'param-case'
import { EOL } from 'node:os'

export type ParseOptions = {}

export class BEMBlock {
	#block: ReturnType<typeof parseBEM>

	public constructor(bem: string, _options: ParseOptions = {}) {
		this.#block = parseBEM(bem)
	}

	public get name() {
		return paramCase(this.#block.name)
	}

	public set name(value) {
		this.#block.name = value
	}

	public get elements() {
		return structuredClone(this.#block.elements)
	}

	public set elements(value) {
		this.#block.elements = value
	}

	public get modifiers() {
		return structuredClone(this.#block.modifiers)
	}

	public set modifiers(value) {
		this.#block.modifiers = value
	}

	/**
	 * @returns type AST generated by the TypeScript Compiler API.
	 */
	public toTypeAST() {
		return factory.createTypeAliasDeclaration(
			[factory.createToken(ts.SyntaxKind.ExportKeyword)],
			factory.createIdentifier(pascalCase(`${this.#block.name}Block`)),
			undefined,
			factory.createTypeLiteralNode([
				factory.createPropertySignature(
					undefined,
					factory.createIdentifier('name'),
					undefined,
					factory.createLiteralTypeNode(factory.createStringLiteral(this.name))
				),
				factory.createPropertySignature(
					undefined,
					factory.createIdentifier('elements'),
					undefined,
					factory.createTypeLiteralNode(
						this.#block.elements.map((element) =>
							factory.createPropertySignature(
								undefined,
								factory.createIdentifier(paramCase(element.name)),
								undefined,
								element.modifiers.length
									? factory.createUnionTypeNode(
											element.modifiers.map((modifier) =>
												factory.createLiteralTypeNode(
													factory.createStringLiteral(paramCase(modifier))
												)
											)
									  )
									: factory.createKeywordTypeNode(
											ts.SyntaxKind.UndefinedKeyword
									  )
							)
						)
					)
				),
				factory.createPropertySignature(
					undefined,
					factory.createIdentifier('modifiers'),
					undefined,
					this.#block.modifiers.length
						? factory.createUnionTypeNode(
								this.#block.modifiers.map((modifier) =>
									factory.createLiteralTypeNode(
										factory.createStringLiteral(paramCase(modifier))
									)
								)
						  )
						: factory.createKeywordTypeNode(ts.SyntaxKind.NeverKeyword)
				)
			])
		)
	}

	/**
	 * @returns the TypeScript type that represents the BEM structure.
	 * @example
	 * fooBlock.toType()
	 * `export const FooBlock = {
	 *   name: 'foo'
	 *   elements: {
	 *     qux: undefined
	 *   }
	 *   modifiers: 'bar' | 'baz'
	 * }`
	 */
	public toType(printerOptions?: ts.PrinterOptions) {
		const printer = ts.createPrinter({
			newLine: ts.NewLineKind.LineFeed,
			omitTrailingSemicolon: true,
			...printerOptions
		})

		return printer.printNode(
			ts.EmitHint.Unspecified,
			this.toTypeAST(),
			ts.createSourceFile(
				'block.ts',
				'',
				ts.ScriptTarget.Latest,
				false,
				ts.ScriptKind.TS
			)
		)
	}

	/**
	 * @param eol defualts to `os.EOL`
	 * @returns the raw BEM file format string.
	 * @example fooBlock.toString() // foo[bar,baz]\nqux
	 */
	public toString(eol = EOL) {
		let result = this.name
		if (this.modifiers.length) {
			result += `[${this.modifiers.join(',')}]`
		}
		for (const element of this.elements) {
			result += eol + element.name
			if (element.modifiers.length) {
				result += `[${element.modifiers.join(',')}]`
			}
		}
		result += eol
		return result
	}

	public valueOf() {
		return structuredClone(this.#block)
	}

	public toJSON() {
		return this.valueOf()
	}
}
