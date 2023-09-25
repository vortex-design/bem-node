import { parseBEM } from 'bem-neon'
import type { BEMBlock } from './BEMBlock.js'
import ts, { factory } from 'typescript'

export type ParseOptions = {}

export function parse(
	bem: string,
	_options: ParseOptions = {}
): BEMBlock<string, Record<string, string | never>, string | undefined> {
	const block = parseBEM(bem)
	const blockType = factory.createTypeAliasDeclaration(
		[factory.createToken(ts.SyntaxKind.ExportKeyword)],
		factory.createIdentifier(`${block.name}Block`),
		undefined,
		factory.createTypeLiteralNode([
			factory.createPropertySignature(
				undefined,
				factory.createIdentifier('name'),
				undefined,
				factory.createLiteralTypeNode(factory.createStringLiteral(block.name))
			),
			factory.createPropertySignature(
				undefined,
				factory.createIdentifier('elements'),
				undefined,
				factory.createTypeLiteralNode(
					block.elements.map((element) =>
						factory.createPropertySignature(
							undefined,
							factory.createIdentifier(element.name),
							undefined,
							element.modifiers.length
								? factory.createUnionTypeNode(
										element.modifiers.map((modifier) =>
											factory.createLiteralTypeNode(
												factory.createStringLiteral(modifier)
											)
										)
								  )
								: factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
						)
					)
				)
			),
			factory.createPropertySignature(
				undefined,
				factory.createIdentifier('modifiers'),
				undefined,
				block.modifiers.length
					? factory.createUnionTypeNode(
							block.modifiers.map((modifier) =>
								factory.createLiteralTypeNode(
									factory.createStringLiteral(modifier)
								)
							)
					  )
					: factory.createKeywordTypeNode(ts.SyntaxKind.NeverKeyword)
			)
		])
	)

	// // Create a source file
	// const sourceFile = factory.createSourceFile(
	// 	'foo.ts',
	// 	'',
	// 	ts.ScriptTarget.Latest,
	// 	false,
	// 	ts.ScriptKind.TS
	// )

	// // // Add the type alias declaration to the source file
	// const updatedSourceFile = ts.updateSourceFile(sourceFile, [blockType])

	// Create a printer to output the TypeScript code
	const printer = ts.createPrinter({
		newLine: ts.NewLineKind.LineFeed
	})

	const result = printer.printNode(
		ts.EmitHint.Unspecified,
		blockType,
		ts.createSourceFile(
			'block.ts',
			'',
			ts.ScriptTarget.Latest,
			false,
			ts.ScriptKind.TS
		)
	)

	// // Print the type alias declaration
	// const result = printer.printNode(
	// 	ts.EmitHint.Unspecified,
	// 	blockType,
	// 	updatedSourceFile
	// )

	// Output the result
	console.log(`export ${result}`)

	return { name: block.name, elements: {}, modifiers: '' }
}
