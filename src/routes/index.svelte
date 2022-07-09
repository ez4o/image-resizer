<script lang="ts">
	import '../app.css';
	import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

	let files: File[] = [];

	let width = -1;
	let height = -1;

	let loading = false;

	async function convert() {
		if (files === null) {
			return;
		}

		loading = true;

		for (const file of files) {
			const inputFileName = file.name;
			const outputFileName: string = inputFileName.replace(/\.([^.]+)$/, '-resized.$1');

			const ffmpeg = createFFmpeg();
			await ffmpeg.load();

			ffmpeg.FS('writeFile', inputFileName, await fetchFile(file));

			await ffmpeg.run('-i', inputFileName, '-vf', `scale=${width}:${height}`, outputFileName);

			const data = await ffmpeg.FS('readFile', outputFileName);

			const linkEl = document.createElement('a');
			linkEl.href = URL.createObjectURL(
				new Blob([data.buffer], {
					type: file.type
				})
			);
			linkEl.download = outputFileName;
			linkEl.click();
		}

		loading = false;
	}

	let dropZone: HTMLElement;

	function onDragEnter() {
		dropZone.classList.add('bg-gray-100');
	}

	function onDragLeave(event: DragEvent) {
		if (dropZone.contains(event.relatedTarget as Node)) {
			return;
		}

		dropZone.classList.remove('bg-gray-100');
	}

	function onDrop(event: DragEvent) {
		dropZone.classList.remove('bg-gray-100');

		files = validateFile(event.dataTransfer?.files);

		if (files == []) {
			return;
		}
	}

	function onFileInputChange(event: Event) {
		files = validateFile((event.target as HTMLInputElement).files);

		if (files == []) {
			return;
		}
	}

	function validateFile(files: FileList | null | undefined): File[] {
		const result: File[] = [];

		if (files === null || files === undefined) {
			return result;
		}

		for (let i = 0; i < files.length; i++) {
			const file = files[i];

			if (file.type.startsWith('image/')) {
				result.push(file);
			}
		}

		return result;
	}
</script>

<svelte:head>
	<title>Image Resizer</title>
</svelte:head>

<div
	class="flex items-center justify-center w-screen h-screen bg-gradient-to-r from-orange-600 via-red-500 to-pink-400"
>
	<div
		class="flex flex-col items-center justify-center w-[calc(min(48rem,100%))] h-128 bg-white rounded-2xl shadow-2xl p-6"
	>
		<div
			class="flex justify-center items-center w-full h-full"
			on:dragenter={onDragEnter}
			on:dragleave={onDragLeave}
			on:dragover|preventDefault
			on:drop|preventDefault={onDrop}
		>
			<label
				for="file-input"
				class="flex flex-col justify-center items-center w-full h-full bg-gray-50 rounded-lg border-2 border-gray-300 border-dashed cursor-pointer dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
				bind:this={dropZone}
			>
				<div
					class="flex flex-col justify-center items-center pt-5 pb-6"
					class:hidden={files.length > 0}
				>
					<svg
						class="mb-3 w-10 h-10 text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
						/></svg
					>
					<p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
						<span class="font-semibold">Click to upload</span> or drag and drop
					</p>
					<p class="text-xs text-gray-500 dark:text-gray-400">Support any type of image.</p>
				</div>
				<input multiple id="file-input" type="file" class="hidden" on:change={onFileInputChange} />
				<div
					class="flex flex-row overflow-y-hidden"
					class:hidden={files.length == 0}
					class:overflow-x-scroll={files.length > 1}
				>
					{#each files as file}
						<img class="h-96 object-scale-down" src={URL.createObjectURL(file)} alt={file.name} />
					{/each}
				</div>
			</label>
		</div>

		<div class="flex flex-row flex-wrap mt-6 w-full">
			<div class="flex-1 mr-4" data-tooltip="width (-1 means to the keep aspect ratio)">
				<input
					class="shadow-md rounded px-2 py-2 border-2 border-gray-300 bg-gray-50 w-full"
					type="number"
					bind:value={width}
				/>
			</div>
			<div class="flex-1 mr-4" data-tooltip="height (-1 means to the keep aspect ratio)">
				<input
					class="shadow-md rounded px-2 py-2 border-2 border-gray-300 bg-gray-50  w-full"
					type="number"
					bind:value={height}
				/>
			</div>

			<div class="flex-1 relative">
				<div class="absolute bg-[#4448] w-full h-full z-10 rounded" class:hidden={!loading} />
				<button
					class="w-full h-full shadow-md bg-gradient-to-l from-orange-600 via-red-500 to-pink-400 opacity-90 text-white font-bold py-2 px-4 rounded"
					class:opacity-40={files.length == 0}
					class:hover:opacity-100={files.length > 0}
					disabled={files.length == 0}
					on:click={convert}
				>
					{loading ? 'PROCESSING' : 'CONVERT'}
				</button>
			</div>
		</div>
	</div>
</div>
