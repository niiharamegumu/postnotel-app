export type HighlightMatch = {
	text: string;
	isMatch: boolean;
};

export const highlightText = (text: string, query: string): HighlightMatch[] => {
	if (!query.trim()) {
		return [{ text, isMatch: false }];
	}

	const normalizedQuery = query.trim().toLowerCase();
	const normalizedText = text.toLowerCase();

	const matches: HighlightMatch[] = [];
	let lastIndex = 0;

	let index = normalizedText.indexOf(normalizedQuery, lastIndex);
	while (index !== -1) {
		if (index > lastIndex) {
			matches.push({
				text: text.slice(lastIndex, index),
				isMatch: false,
			});
		}

		matches.push({
			text: text.slice(index, index + query.length),
			isMatch: true,
		});

		lastIndex = index + query.length;
		index = normalizedText.indexOf(normalizedQuery, lastIndex);
	}

	if (lastIndex < text.length) {
		matches.push({
			text: text.slice(lastIndex),
			isMatch: false,
		});
	}

	return matches;
};

export const highlightMultipleKeywords = (text: string, keywords: string[]): HighlightMatch[] => {
	if (!keywords.length || keywords.every((keyword) => !keyword.trim())) {
		return [{ text, isMatch: false }];
	}

	const validKeywords = keywords.filter((keyword) => keyword.trim());

	let result: HighlightMatch[] = [{ text, isMatch: false }];

	for (const keyword of validKeywords) {
		const newResult: HighlightMatch[] = [];

		for (const segment of result) {
			if (segment.isMatch) {
				newResult.push(segment);
			} else {
				const highlighted = highlightText(segment.text, keyword);
				newResult.push(...highlighted);
			}
		}

		result = newResult;
	}

	return result;
};
