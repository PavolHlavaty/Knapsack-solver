// Quick Forward Lookup algorithm to solve Value Independent Multiple Knapsack Problem

// helper function to restore decreasing remaining capacity order in linked list of knapsacks
function restoreOrder (knapsack) {
	let cur_knap = knapsack;
	if (knapsack.next && knapsack.capacity < knapsack.next.capacity) {
		while (cur_knap.next && knapsack.capacity < cur_knap.next.capacity) {
			cur_knap = cur_knap.next;
		}
		var temp = knapsack.next;
		var tmp = knapsack.prev;
		knapsack.next = cur_knap.next;
		if (cur_knap.next) cur_knap.next.prev = knapsack;
		knapsack.prev = cur_knap;
		cur_knap.next = knapsack;
		temp.prev = tmp;
		if (tmp) {
			tmp.next = temp;
			return undefined;
		}
		else {
			knapsack = temp;
			return knapsack;
		}
	} else if (knapsack.prev && knapsack.capacity > knapsack.prev.capacity) {
		while (cur_knap.prev && knapsack.capacity > cur_knap.prev.capacity) {
			cur_knap = cur_knap.prev;
		}
		knapsack.prev.next = knapsack.next;
		if (knapsack.next) knapsack.next.prev = knapsack.prev;
		knapsack.next = cur_knap;
		temp = cur_knap;
		if (cur_knap.prev) {
			knapsack.prev = cur_knap.prev;
			cur_knap.prev.next = knapsack;
			temp.prev = knapsack;
			return undefined;
		}
		else {
			knapsack.prev = undefined;
			cur_knap = knapsack;
			temp.prev = knapsack;
			return knapsack;
		}	
	}
	return undefined;
}

// helper function to insert new item into right place in linked list of items
function insertItem (knapsack, item) {
	if (knapsack.items_ll === undefined || item.weight < knapsack.items_ll.weight) {
		item.next = knapsack.items_ll;
		knapsack.items_ll = item;
	} else {
		let cur_item = knapsack.items_ll;
		while (cur_item.next !== undefined && item.weight > cur_item.next.weight) {
			cur_item = cur_item.next;
		}
		item.next = cur_item.next;
		cur_item.next = item;
	}
	return knapsack;
}

function VIMKP_QFL (knapsacks, items) {
	let solution = 0;

	// sort knapsacks in decreasing order of capacity
	knapsacks.sort((a, b) => b.capacity - a.capacity);

	// create linked list
	for (let i = 0; i < knapsacks.length - 1; i++) {
		knapsacks[i].next = knapsacks[i+1];
		knapsacks[i+1].prev = knapsacks[i];
	}
	knapsacks[knapsacks.length - 1].next = undefined;
	var knapsacks_ll = knapsacks[0];

	let check_1, check_2;
	check_1 = check_2 = true;
	var t2, t3;
	var rem_capacity_1 = [];
	var rem_capacity_2 = [];
	// insert items to knapsacks
	items.forEach(item => { 
		// first phase
		if (item.weight <= knapsacks_ll.capacity) {
			knapsacks_ll = insertItem(knapsacks_ll, item);
			item.knapsack = knapsacks_ll;
			knapsacks_ll.capacity -= item.weight;
			solution += item.weight;
			// restore sorted order
			
			let first = restoreOrder(knapsacks_ll);
			if (first) knapsacks_ll = first;

			return;
		}
		// store data after first phase
		if (check_1) {
			t2 = performance.now();
			knapsacks.forEach(knapsack => {
				rem_capacity_1.push({
					capacity: knapsack.capacity,
					index: knapsack.index,
				});
			});
			check_1 = false;
		}

		// second phase
		let cur_knap = knapsacks_ll;
		while (cur_knap) {
			let cur_item = cur_knap.items_ll;
			let prev_item;
			while (cur_item !== undefined && cur_item.weight + cur_knap.capacity < item.weight) {
				prev_item = cur_item;
				cur_item = cur_item.next;
			}
			if (cur_item) {
				if (cur_knap === knapsacks_ll) {
					if (knapsacks_ll.next !== undefined && cur_item.weight <= knapsacks_ll.next.capacity) {
						// remove item
						if (prev_item) prev_item.next = cur_item.next;
						else cur_knap.items_ll = cur_item.next;
						// put item to other knapsack
						knapsacks_ll.next = insertItem(knapsacks_ll.next, cur_item);
						cur_item.knapsack = knapsacks_ll.next;
						knapsacks_ll.next.capacity -= cur_item.weight;
						restoreOrder(knapsacks_ll.next);
						// insert new item
						cur_knap = insertItem(cur_knap, item);
						item.knapsack = cur_knap;
						cur_knap.capacity -= item.weight;
						cur_knap.capacity += cur_item.weight;
						solution += item.weight;
						let first = restoreOrder(knapsacks_ll);
						if (first) knapsacks_ll = first;
						return;
					}
				}
				else if (cur_item.weight <= knapsacks_ll.capacity){
					// remove item
					if (prev_item) prev_item.next = cur_item.next;
					else cur_knap.items_ll = cur_item.next;
					cur_knap.capacity += cur_item.weight;
					// insert new item
					cur_knap = insertItem(cur_knap, item);
					item.knapsack = cur_knap;
					cur_knap.capacity -= item.weight;
					solution += item.weight;
					restoreOrder(cur_knap);
					// put item to other knapsack
					knapsacks_ll = insertItem(knapsacks_ll, cur_item);
					cur_item.knapsack = knapsacks_ll;
					knapsacks_ll.capacity -= cur_item.weight;
					let first = restoreOrder(knapsacks_ll);
					if (first) knapsacks_ll = first;
					return;
				}
			}
			cur_knap = cur_knap.next;
		}

		cur_knap = knapsacks_ll;
		prev_knap = undefined;
		while (cur_knap) {
			let command_list = [];
			knapsacks.forEach(knapsack => {
				knapsack.new_capacity = knapsack.capacity;
			});
			let cur_knap_target = knapsacks_ll;
			while (cur_knap_target) {
				if (cur_knap.index === cur_knap_target.index) {
					cur_knap_target = cur_knap_target.next;
					continue;
				}
				let cur_item = cur_knap.items_ll;
				let good_item;
				let prev_item;
				if (cur_item && cur_item.weight <= cur_knap_target.new_capacity) {
					good_item = cur_item.new_knap ? undefined : cur_item;
					while (cur_item.next && cur_item.next.weight <= cur_knap_target.new_capacity) {
						if (cur_item.next.new_knap === undefined) {
							prev_item = cur_item;
							good_item = cur_item.next;
						}
						cur_item = cur_item.next;
					}
					if (good_item) {
						good_item.new_knap = cur_knap_target;
						command_list.push(good_item);
						cur_knap_target.new_capacity -= good_item.weight;
						cur_knap.new_capacity += good_item.weight;
						if (item.weight <= cur_knap.new_capacity) {
							// execute commands
							command_list.forEach(item_to_move => {
								// remove item
								if (prev_item) prev_item.next = item_to_move.next;
								else item_to_move.knapsack.items_ll = item_to_move.next;
								// put item to other knapsack
								item_to_move.new_knap = insertItem(item_to_move.new_knap, item_to_move);
								item_to_move.knapsack = item_to_move.new_knap;
								item_to_move.new_knap.new_capacity = undefined;
								item_to_move.new_knap = undefined;
								item_to_move.knapsack.capacity -= item_to_move.weight;
								let first = restoreOrder(item_to_move.knapsack);
								if (first) knapsacks_ll = first;
							});
							// insert new item
							cur_knap = insertItem(cur_knap, item);
							item.knapsack = cur_knap;
							solution += item.weight;
							cur_knap.capacity = cur_knap.new_capacity - item.weight;
							let first = restoreOrder(cur_knap);
							if (first) knapsacks_ll = first;
							return;
						}
					}
				}
				cur_knap_target = good_item ? cur_knap_target : cur_knap_target.next;
			}
			// restore unused
			command_list.forEach(item_to_move => {
				item_to_move.new_knap = undefined;
			});

			cur_knap = cur_knap.next;
		}
	});

	return { solution: solution, items: items, t2: t2, t3: t3, rem_capacity_1: rem_capacity_1 };
}