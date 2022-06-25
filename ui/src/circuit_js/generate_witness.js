import wc from "./witness_calculator";

export async function generateWitness (input, wasmBuffer) {
	let buff;

	await wc(wasmBuffer).then(async witnessCalculator => {
		buff = await witnessCalculator.calculateWTNSBin(input, 0);
	});
	return buff;
}

export async function generateWitnessPlain (input, wasmBuffer) {
	let buff;

	await wc(wasmBuffer).then(async witnessCalculator => {
		buff = await witnessCalculator.calculateWitness(input, 0);
	});
	return buff;
}
