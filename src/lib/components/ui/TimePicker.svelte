<script lang="ts">
	import Select from './Select.svelte';

	let {
		name = 'time',
		initialValue = '',
	}: {
		name?: string;
		initialValue?: string;
	} = $props();

	const hours = Array.from({ length: 24 }, (_, i) => {
		const h = String(i).padStart(2, '0');
		return { value: h, label: `${h}h` };
	});

	const minutes = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map(
		(m) => ({ value: m, label: m })
	);

	const parts = initialValue ? initialValue.split(':') : [];
	let hour   = $state(parts[0] ?? '');
	let minute = $state(parts[1] ? String(Math.round(parseInt(parts[1]) / 5) * 5).padStart(2, '0') : '');

	const combined = $derived(hour && minute ? `${hour}:${minute}` : '');
</script>

<div class="grid grid-cols-2 gap-2">
	<Select bind:value={hour}   placeholder="Heure" options={hours}   />
	<Select bind:value={minute} placeholder="Min."  options={minutes} />
</div>
<input type="hidden" {name} value={combined} />
