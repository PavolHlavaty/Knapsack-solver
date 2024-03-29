// Dynamic programming algorithm to solve Value Independent Knapsack Problem

function VIKP_dynamic_programming (capacity, items) {
	// define table
	var memo = [];
	// fill table, answer will be in memo[items.length][capacity]
	for (var i = 0; i <= items.length; i++) {
		memo.push([]);
		for (var cap = 0; cap <= capacity; cap++) {
			if (i === 0 || cap === 0) 
				memo[i][cap] = 0;
			else if (items[i-1].weight <= cap)
				memo[i][cap] = Math.max(memo[i-1][cap - items[i-1].weight] + items[i-1].weight, memo[i-1][cap]);
			else
				memo[i][cap] = memo[i-1][cap];
		}
	}
	// get items in solution
	cap = capacity;
	for (i = items.length; i > 0; i--) {
		if (memo[i][cap] !== memo[i-1][cap]) {
			items[i-1].knapsack = 0;
			cap -= items[i-1].weight;
		}
	}

	return { solution: memo[items.length][capacity], items: items };
}
